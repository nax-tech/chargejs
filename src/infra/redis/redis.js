import redis from 'redis'

/**
 * A infra type module
 * @module infra
 */

export default ({ config }) => {
  return redis.createClient(config.redis)
}
