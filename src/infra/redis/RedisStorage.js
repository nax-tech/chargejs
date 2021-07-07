import bluebird from 'bluebird'
import {
  REDIS_CREATE_ERROR,
  REDIS_DELETE_ERROR,
  REDIS_READ_ERROR
} from '../../errors'

/**
 * A infra type module
 * @module infra
 */

class RedisStorage {
  /**
   * Creates an instance of RedisStorage.
   * @memberof module:repository
   * @param {Object} input The input object as injected in src/container.js
   * @param {Object} input.redis The Redis config object
   * @param {Object} input.logger The logger middleware
   */
  constructor ({ redis, logger }) {
    bluebird.promisifyAll(redis)
    this.redisClient = redis
    this.logger = logger
  }

  /**
   * saves key-value in Redis. value will be JSON.stringify(value)
   *
   * @param {string} key the key of the object
   * @param {object} object the object value
   * @returns {Promise<string>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async saveObject (key, object) {
    try {
      const redisObject = JSON.stringify(object)
      const reply = await this.redisClient.setAsync(key, redisObject)
      return reply
    } catch (error) {
      this.logger.error({
        event: REDIS_CREATE_ERROR.code,
        info: REDIS_CREATE_ERROR.message,
        meta: error
      })
      throw error
    }
  }

  /**
   * gets key-value in Redis. value will be JSON.parse(result)
   *
   * @param {string} key the key of the object
   * @returns {Promise<object>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async getObject (key) {
    try {
      const object = await this.redisClient.getAsync(key)
      return object && JSON.parse(object)
    } catch (error) {
      this.logger.error({
        event: REDIS_READ_ERROR.code,
        info: REDIS_READ_ERROR.message,
        meta: error
      })
      throw error
    }
  }

  /**
   * deletes key-value in Redis.
   *
   * @param {string} key the key of the object
   * @returns {Promise<Object|Array<Object>>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async deleteObject (key) {
    try {
      const object = await this.redisClient.getdelAsync(key)
      if (object) {
        if (Array.isArray(object)) {
          return object.map(JSON.stringify)
        }
        return JSON.stringify(object)
      }
    } catch (error) {
      this.logger.error({
        event: REDIS_DELETE_ERROR.code,
        info: REDIS_DELETE_ERROR.message,
        meta: error
      })
      throw error
    }
  }

  /**
   * push items to the list in Redis. values will be JSON.stringify(value)
   *
   * @param {string} key the key of the object
   * @param {Array<Object>} objects the values
   * @returns {Promise<string>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async listPush (key, ...objects) {
    try {
      const redisObjects = objects.map(JSON.stringify)
      const reply = await this.redisClient.lpushAsync(key, ...redisObjects)
      return reply
    } catch (error) {
      this.logger.error({
        event: REDIS_CREATE_ERROR.code,
        info: REDIS_CREATE_ERROR.message,
        meta: error
      })
      throw error
    }
  }

  /**
   * pop items from the list in Redis. values will be JSON.stringify(value)
   *
   * @param {string} key the key of the object
   * @returns {Promise}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async listRemove (key, object) {
    try {
      const redisObject = JSON.stringify(object)
      await this.redisClient.lremAsync(key, 1, redisObject)
    } catch (error) {
      this.logger.error({
        event: REDIS_CREATE_ERROR.code,
        info: REDIS_CREATE_ERROR.message,
        meta: error
      })
      throw error
    }
  }

  /**
   * gets list from Redis. values will be JSON.parse(result)
   *
   * @param {string} key the key of the list
   * @returns {Promise<Array<object>>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async getList (key) {
    try {
      const objects = await this.redisClient.lrangeAsync(key, 0, -1)
      return objects ? objects.map(JSON.parse) : []
    } catch (error) {
      this.logger.error({
        event: REDIS_READ_ERROR.code,
        info: REDIS_READ_ERROR.message,
        meta: error
      })
      throw error
    }
  }
}
export default RedisStorage
