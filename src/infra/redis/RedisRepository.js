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
  }

  init (modelName, indexes, include) {
    this.modelName = modelName
    this.include = include
    this.indexes = this._normalizeIndexes(indexes)
  }

  async findOneOrCreate (where, getEntity) {
    let entity = await this.findOne(where)
    if (entity) {
      return entity
    }
    entity = await getEntity()
    if (entity) {
      return this.create(entity)
    }
  }

  async findOne (where) {
    if (isEqual(Object.keys(where), ['id'])) {
      return this._getById(this.modelName, where.id)
    }
    this._validateFilter(where)
    const id = await this._getByFilter(this.modelName, where)
    if (id) {
      return this._getById(this.modelName, id)
    }
  }

  async create (object) {
    const idKey = this._buildIdKey(this.modelName, object.id)
    await this._saveObject(idKey, object)
    const cacheKeys = this._getObjectCacheKeys(this.modelName, this.indexes, object)
    await Promise.all(cacheKeys.map(
      key => this._saveObject(key, object.id)
    ))
    await this._storeRelated(object)
    return object
  }

  delete (object) {
    return this._delete(this.modelName, this.indexes, object)
  }

  async deleteByFilter (where) {
    if (isEqual(Object.keys(where), ['id'])) {
      const { id } = where
      return this._deleteById(this.modelName, this.indexes, id)
    }
    const object = await this.findOne(where)
    if (object) {
      return this.delete(object)
    }
  }

  async clearRelated (id) {
    const relationsKey = this._buildRelationsKey(this.modelName, id)
    const relations = await this.redisStorage.getList(relationsKey)
    if (relations.length) {
      await Promise.all(
        relations.map(({ modelName, indexes, id }) => {
          return this._deleteById(modelName, indexes, id)
        })
      )
      return this._clearList(relationsKey, relations)
    }
  }

  _normalizeIndexes (indexes) {
    return indexes.filter(index => index.unique)
      .map(index => index.fields.sort())
      .filter(key => !isEqual(key, ['id']))
  }

  async _delete (modelName, indexes, object) {
    const key = this._buildIdKey(modelName, object.id)
    const result = await this._deleteObject(key) || object
    await this._clearByCacheKeys(modelName, indexes, result)
    return result
  }

  async _deleteById (modelName, indexes, id) {
    const key = this._buildIdKey(modelName, id)
    const object = await this._deleteObject(key)
    if (object) {
      await this._clearByCacheKeys(modelName, indexes, object)
      return object
    }
  }

  async _clearByCacheKeys (modelName, indexes, object) {
    const cacheKeys = this._getObjectCacheKeys(modelName, indexes, object)
    if (cacheKeys.length) {
      await Promise.all(cacheKeys.map(
        key => this._deleteObject(key)
      ))
    }
  }

  async _storeRelated (entity) {
    if (this.include && this.include.length) {
      const entityInfo = {
        id: entity.id,
        modelName: this.modelName,
        indexes: this.indexes
      }
      const related = this._getRelated(entity, this.include)
      if (related.length) {
        await Promise.all(
          related
            .map(({ modelName, id }) => this._buildRelationsKey(modelName, id))
            .map(key => this._pushToList(key, entityInfo))
        )
      }
    }
  }

  _getRelated (entity, include) {
    return include.reduce((result, { modelName, as, include }) => {
      const related = entity[as]
      if (related) {
        const relatedArray = Array.isArray(related) ? related : [related]
        relatedArray.forEach(object => {
          result.push({
            modelName,
            id: object.id
          })
          if (include) {
            result.push(...this._getRelated(object, include))
          }
        })
      }
      return result
    }, [])
  }

  async _getById (modelName, id) {
    const key = this._buildIdKey(modelName, id)
    return this.redisStorage.getObject(key)
  }

  _getByFilter (modelName, filter) {
    const key = this._buildFilterKey(modelName, filter)
    if (key) {
      return this.redisStorage.getObject(key)
    }
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

  async _clearList (key, values) {
    await this.redisStorage.listClear(key)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.pushToList(key, ...values)
    )
  }

  async _deleteObject (key) {
    const entry = await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.saveObject(key, entry)
    )
    return entry
  }

  _validateFilter (filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const keys = Object.keys(normalizedFilter).sort()
    const valid = this.indexes.find(key => isEqual(key, keys))
    if (!valid) {
      // Error for developers only, can only occur if the indexes configuration is incorrect
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
    if (
      filter &&
      Object.keys(filter).length &&
      !Object.values(filter).includes(undefined)
    ) {
      const normalizedFilter = this._normalizeFilter(filter)
      const keys = Object.keys(normalizedFilter).sort()
      const filterString = keys.map(
        key => `${key}:${normalizedFilter[key]}`
      ).join(';')
      return `${modelName}:${filterString}`
    }
  }

  _getObjectCacheKeys (modelName, indexes, object) {
    return indexes.map(index => {
      const filter = index.reduce((res, field) => ({
        ...res,
        [field]: get(object, field)
      }), {})
      return this._buildFiltагаerKey(modelName, filter)
    }).filter(Boolean)
  }
}
export default RedisRepository
