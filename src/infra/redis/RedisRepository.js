import { get } from 'dot-get'
import isEqual from 'lodash/isEqual'
import { INVALID_FILTER } from '../../errors'

/**
 * A infra type module
 * @module infra
 */

class RedisRepository {
  constructor ({ redisStorage, transactionProvider }) {
    this.redisStorage = redisStorage
    this.transactionProvider = transactionProvider
    this.entities = {}
  }

  init (modelName, include) {
    this.entities[modelName] = {
      modelName,
      include,
      cacheKeys: []
    }
  }

  setCacheKeys (modelName, keys) {
    this.entities[modelName].cacheKeys = keys
      .map(key => Array.isArray(key) ? key.sort() : [key])
      .filter(key => !isEqual(key, ['id']))
  }

  async findOneOrCreate (modelName, where, getEntity) {
    let entity = await this.findOne(modelName, where)
    if (entity) {
      return entity
    }
    entity = await getEntity()
    if (entity) {
      return this.create(modelName, entity)
    }
  }

  async findOne (modelName, where) {
    if (isEqual(Object.keys(where), ['id'])) {
      return this._getById(modelName, where.id)
    }
    this._validateFilter(modelName, where)
    const id = await this._getByFilter(modelName, where)
    if (id) {
      return this._getById(modelName, id)
    }
  }

  async create (modelName, entity) {
    const idKey = this._buildIdKey(modelName, entity.id)
    await this._saveObject(idKey, entity)
    const cacheKeys = this._getEntityCacheKeys(modelName, entity)
    await Promise.all(cacheKeys.map(
      key => this._saveObject(key, entity.id)
    ))
    await this._storeRelated(modelName, entity)
    return entity
  }

  async delete (modelName, entity) {
    const object = await this._delete(modelName, entity)
    return this._clearRelated(modelName, object.id)
  }

  async deleteByFilter (modelName, where) {
    if (isEqual(Object.keys(where), ['id'])) {
      const { id } = where
      const entity = await this._deleteById(modelName, id)
      return this._clearRelated(modelName, entity.id)
    }
    const entity = await this.findOne(modelName, where)
    if (entity) {
      return this.delete(modelName, entity)
    }
  }

  async _delete (modelName, entity) {
    const key = this._buildIdKey(modelName, entity.id)
    const object = await this._deleteObject(key) || entity
    await this._clearByCacheKeys(modelName, object)
    return object
  }

  async _deleteById (modelName, id) {
    const key = this._buildIdKey(modelName, id)
    const object = await this._deleteObject(key)
    if (object) {
      await this._clearByCacheKeys(modelName, object)
      return object
    }
  }

  _clearByCacheKeys (modelName, entity) {
    const cacheKeys = this._getEntityCacheKeys(modelName, entity)
    return Promise.all(cacheKeys.map(
      key => this._deleteObject(key)
    ))
  }

  async _storeRelated (modelName, entity) {
    const { include } = this.entities[modelName]
    if (include && include.length) {
      const entityInfo = {
        id: entity.id,
        modelName
      }
      return Promise.all(
        this._getRelated(entity, include)
          .map(({ modelName, id }) => this._buildRelationsKey(modelName, id))
          .map(key => this._pushToList(key, entityInfo))
      )
    }
  }

  _getRelated (entity, include) {
    return include.reduce((result, { modelName, as, include }) => {
      const related = entity[as]
      if (related) {
        const relatedArray = Array.isArray(related) ? related : [related]
        relatedArray.forEach(object => {
          result.push({ modelName, id: object.id })
          if (include) {
            result.push(...this._getRelated(object, include))
          }
        })
      }
      return result
    }, [])
  }

  async _clearRelated (modelName, id) {
    const relationsKey = this._buildRelationsKey(modelName, id)
    const relations = await this.redisStorage.getList(relationsKey)
    if (relations.length) {
      await Promise.all(
        relations.map(({ modelName, id }) => this._deleteById(modelName, id))
      )
      return this._clearList(relationsKey)
    }
  }

  async _getById (modelName, id) {
    const key = this._buildIdKey(modelName, id)
    return this.redisStorage.getObject(key)
  }

  async _getByFilter (modelName, filter) {
    const key = this._buildFilterKey(modelName, filter)
    return this.redisStorage.getObject(key)
  }

  async _pushToList (key, object) {
    await this.redisStorage.listPush(key, object)
    this.transactionProvider.addRedisRollback(
      async () => this.redisStorage.listRemove(key, object)
    )
  }

  async _saveObject (key, entry) {
    await this.redisStorage.saveObject(key, entry)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.deleteObject(key)
    )
  }

  async _clearList (key) {
    const values = await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.pushToList(key, ...values)
    )
  }

  async _deleteObject (key) {
    const entry = await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.saveObject(key, entry)
    )
  }

  _validateFilter (modelName, filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const keys = Object.keys(normalizedFilter).sort()
    const valid = !!this.entities[modelName].cacheKeys
      .find(key => isEqual(key, keys))
    if (!valid) {
      // Error for developers only, can only occur if the cacheKeys configuration is incorrect
      const error = new Error(`${INVALID_FILTER.message}: "${JSON.stringify(keys)}"`)
      error.type = INVALID_FILTER.code
      throw error
    }
  }

  _buildRelationsKey (modelName, id) {
    return `relation::${modelName}:${id}`
  }

  _buildIdKey (modelName, id) {
    return `${modelName}:${id}`
  }

  _normalizeFilter (filter) {
    // replacing a keys with a normalized keys in filter object
    return Object.entries(filter).reduce((result, [key, value]) => {
      // Parsing filter by related entity field
      if (key.startsWith('$')) {
        // This regex removes '$' wrapping
        key = key.replace(/^\$?(.+?)\$?$/g, '$1')
      }
      return {
        ...result,
        [key]: value
      }
    }, {})
  }

  _buildFilterKey (modelName, filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const keys = Object.keys(normalizedFilter).sort()
    const filterString = keys.map(
      key => `${key}:${normalizedFilter[key]}`
    ).join(';')
    return `${modelName}:${filterString}`
  }

  _getEntityCacheKeys (modelName, entity) {
    return this.entities[modelName].cacheKeys.map(key => {
      const filter = key.reduce((res, field) => ({
        ...res,
        [field]: get(entity, field)
      }), {})
      return this._buildFilterKey(modelName, filter)
    })
  }
}
export default RedisRepository
