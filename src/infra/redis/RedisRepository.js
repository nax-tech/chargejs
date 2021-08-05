import { get } from 'dot-get'
import isEqual from 'lodash/isEqual'
import { REDIS_REPOSITORY_INITIALIZED, INVALID_FILTER, INVALID_FILTER_VALUE } from '../../errors'

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
    if (this._initialized) {
      // Error for developers only, can only occur if init was called more than once
      const error = new Error(REDIS_REPOSITORY_INITIALIZED.message)
      error.type = REDIS_REPOSITORY_INITIALIZED.code
      throw error
    }
    this._initialized = true
    this.modelName = modelName
    this.include = include
    this.indexes = this._normalizeIndexes(indexes)
  }

  async findOneOrCreate (where, getObject) {
    let object = await this.findOne(where)
    if (object) {
      return object
    }
    object = await getObject()
    if (object) {
      return this.create(object)
    }
  }

  async findOne (where) {
    this._validateFilter(where)
    const keys = Object.keys(where)
    if (keys.includes('id')) {
      const object = await this._getById(this.modelName, where.id)
      const valid = object && !keys.find(key => {
        const normalizedKey = this._normalizeKey(key)
        return !isEqual(get(object, normalizedKey), where[key])
      })
      return valid ? object : undefined
    }
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

  delete (id) {
    return this._delete(this.modelName, this.indexes, id)
  }

  async clearRelated (id) {
    const key = this._buildRelationsKey(this.modelName, id)
    const relations = await this.redisStorage.getList(key)
    if (relations.length) {
      await Promise.all(
        relations.map(({ modelName, indexes, id }) => {
          return this._delete(modelName, indexes, id)
        })
      )
      return this._clearList(key, relations)
    }
  }

  _normalizeIndexes (indexes) {
    return indexes.filter(index => index.unique)
      .filter(index => !index.fields.includes('id'))
      .map(index => index.fields.sort())
  }

  async _delete (modelName, indexes, id) {
    const object = await this._getById(modelName, id)
    if (object) {
      const key = this._buildIdKey(modelName, id)
      await this._deleteObject(key, object)
      const cacheKeys = this._getObjectCacheKeys(modelName, indexes, object)
      if (cacheKeys.length) {
        await Promise.all(cacheKeys.map(
          key => this._deleteObject(key, id)
        ))
      }
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

  _getById (modelName, id) {
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

  async _saveObject (key, object) {
    await this.redisStorage.saveObject(key, object)
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

  async _deleteObject (key, object) {
    await this.redisStorage.deleteObject(key)
    this.transactionProvider.addRedisRollback(
      () => this.redisStorage.saveObject(key, object)
    )
  }

  _validateFilter (filter) {
    const normalizedFilter = this._normalizeFilter(filter)
    const entries = Object.entries(normalizedFilter)
    const allowedTypes = ['boolean', 'string', 'number']
    const invalidValues = entries.filter(([, val]) => !allowedTypes.includes(typeof val))
    if (invalidValues.length) {
      // Error for developers only, can only occur if the profided filter has invalid values
      const fields = invalidValues.map(([key, value]) => ({
        key,
        value,
        type: typeof value
      }))
      const error = new Error(`${INVALID_FILTER_VALUE.message}: Invalid fields: ${fields}`)
      error.type = INVALID_FILTER_VALUE.code
      throw error
    }
    const sortedKeys = Object.keys(normalizedFilter).sort()
    const valid = sortedKeys.includes('id') || this.indexes.find(key => isEqual(key, sortedKeys))
    if (!valid) {
      // Error for developers only, can only occur if the indexes configuration is incorrect
      const error = new Error(`${INVALID_FILTER.message}: "${JSON.stringify(sortedKeys)}"`)
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

  _normalizeKey (key) {
    if (key.startsWith('$')) {
      // This regex removes '$' wrapping of related entity field key
      return key.replace(/^\$?(.+?)\$?$/g, '$1')
    }
    return key
  }

  _normalizeFilter (filter) {
    // replacing a keys with a normalized keys in filter object
    return Object.entries(filter).reduce((result, [key, value]) => ({
      ...result,
      [this._normalizeKey(key)]: value
    }), {})
  }

  _buildFilterKey (modelName, filter) {
    if (
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
      return this._buildFilterKey(modelName, filter)
    }).filter(Boolean)
  }
}
export default RedisRepository
