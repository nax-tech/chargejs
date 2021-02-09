import bluebird from 'bluebird'

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
        event: 'create',
        info: 'redis create error',
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
      return JSON.parse(object)
    } catch (error) {
      this.logger.error({
        event: 'create',
        info: 'redis read error',
        meta: error
      })
      throw error
    }
  }

  /**
   * deletes key-value in Redis.
   *
   * @param {string} key the key of the object
   * @returns {Promise<object>}
   * @throws {module:interface.standardError}
   * @memberof module:repository.RedisRepository
   */
  async deleteObject (key) {
    try {
      await this.redisClient.delAsync(key)
    } catch (error) {
      this.logger.error({
        event: 'create',
        info: 'redis delete error',
        meta: error
      })
      throw error
    }
  }
}
export default RedisStorage
