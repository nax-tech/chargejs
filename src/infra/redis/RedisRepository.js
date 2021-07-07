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

  init (entityName, include) {
    this.entityName = entityName
    this.cacheKeys = []
    this.include = include
  }

  setCacheKeys (keys) {
    this.cacheKeys = keys
      .map(key => Array.isArray(key) ? key.sort() : [key])
      .filter(key => !isEqual(key, ['id']))
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
      return this._getById(where.id)
    }
    this._validateFilter(where)
    const id = await this._getByFilter(where)
    if (id) {
      return this._getById(id)
    }
  }

  async create (entity) {
    const idKey = this._buildIdKey(this.entityName, entity.id)
    await this._saveObject(idKey, entity)
    const cacheKeys = this._getEntityCacheKeys(entity)
    await Promise.all(cacheKeys.map(
      async (key) => this._saveObject(key, entity.id)
    ))
    await this._storeRelated(entity)
    return entity
  }

  async delete (where) {
    if (isEqual(Object.keys(where), ['id'])) {
      return this._deleteById(where.id)
    }
    const entity = await this.findOne(where)
    if (entity) {
      const key = this._buildIdKey(this.entityName, entity.id)
      await this._deleteObject(key)
      await this._clearRelated(entity)
      const cacheKeys = this._getEntityCacheKeys(entity)
      await Promise.all(cacheKeys.map(
        async (key) => this._deleteObject(key)
      ))
      return entity
    }
  }

  async _deleteById (id) {
    const key = this._buildIdKey(this.entityName, id)
    const entity = await this._deleteObject(key)
    await this._clearRelated(entity)
    if (entity) {
      const cacheKeys = this._getEntityCacheKeys(entity)
      await Promise.all(cacheKeys.map(
        async (key) => this._deleteObject(key)
      ))
      return entity
    }
  }

  _getRelated (entity, include) {
    return include.reduce((result, { entityName, as, include }) => {
      const related = entity[as]
      if (related) {
        const relatedArray = Array.isArray(related) ? related : [related]
        relatedArray.forEach(object => {
          result.push({ entityName, id: object.id })
          if (include) {
            result.push(...this._getRelated(object, include))
          }
        })
      }
      return result
    }, [])
  }

  async _storeRelated (entity) {
    if (this.include && this.include.length) {
      const entityInfo = {
        id: entity.id,
        entityName: this.entityName
      }
      return Promise.all(
        this._getRelated(entity, this.include)
          .map(({ entityName, id }) => this._buildRelationsKey(entityName, id))
          .map(key => this._pushToList(key, entityInfo))
      )
    }
  }

  async _clearRelated (entity) {
    const relationsKey = this._buildRelationsKey(this.modelName, entity.id)
    const relations = await this.redisStorage.getList(relationsKey)
    if (relations.length) {
      await Promise.all(
        relations.map(({ id, entityName }) => this._deleteObject(this._buildIdKey(entityName, id)))
      )
      return this._clearList(relationsKey)
    }
  }

  async _getById (id) {
    const key = this._buildIdKey(this.entityName, id)
    return this.redisStorage.getObject(key)
  }

  async _getByFilter (filter) {
    const key = this._buildFilterKey(filter)
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
      async () => this.redisStorage.deleteObject(key)
    )
  }

  async _clearList (key) {
    const values = await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      async () => this.redisStorage.pushToList(key, ...values)
    )
  }

  async _deleteObject (key) {
    const entry = await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      async () => this.redisStorage.saveObject(key, entry)
    )
  }

  _validateFilter (filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const keys = Object.keys(normalizedFilter).sort()
    const valid = !!this.cacheKeys
      .find(key => isEqual(key, keys))
    if (!valid) {
      // Error for developers only, can only occur if the cacheKeys configuration is incorrect
      const error = new Error(`${INVALID_FILTER.message}: "${JSON.stringify(keys)}"`)
      error.type = INVALID_FILTER.code
      throw error
    }
  }

  _buildRelationsKey (entityName, id) {
    return `relations:::${entityName}:${id}`
  }

  _buildIdKey (entityName, id) {
    return `${entityName}:${id}`
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

  _buildFilterKey (filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const keys = Object.keys(normalizedFilter).sort()
    const filterString = keys.map(
      key => `${key}:${normalizedFilter[key]}`
    ).join(';')
    return `${this.entityName}:${filterString}`
  }

  _getEntityCacheKeys (entity) {
    return this.cacheKeys.map(key => {
      const filter = key.reduce((res, field) => ({
        ...res,
        [field]: get(entity, field)
      }), {})
      return this._buildFilterKey(filter)
    })
  }
}
export default RedisRepository
