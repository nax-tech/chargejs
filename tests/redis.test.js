import assert from 'assert'
import { redis } from '../src'

describe('redis', function () {
  describe('redis.getPrefix', function () {
    const incorrectEnvironment = 'devs'
    const developmentEnv = 'development'
    const devEnv = 'dev'
    const stageEnv = 'stage'
    const prodEnv = 'production'
    const payments = 'payments'
    const identity = 'identity'
    const wallet = 'wallet'
    it('it should throw an error if app is incorrect', function () {
      assert.throws(
        function () {
          redis.getPrefix(incorrectEnvironment, payments)
        },
        Error,
        `Invalid environment for Redis prefix: ${incorrectEnvironment}`
      )
    })
    it('it should throw an error if env is incorrect', function () {
      assert.throws(
        function () {
          redis.getPrefix(developmentEnv, wallet)
        },
        Error,
        `Invalid package for Redis prefix: ${wallet}`
      )
    })
    it('it returns correct value for development:identity', function () {
      assert.strictEqual(
        redis.getPrefix(developmentEnv, identity),
        'development:identity:'
      )
    })
    it('it returns correct value for dev:identity', function () {
      assert.strictEqual(redis.getPrefix(devEnv, identity), 'dev:identity:')
    })
    it('it returns correct value for stage:identity', function () {
      assert.strictEqual(redis.getPrefix(stageEnv, identity), 'stage:identity:')
    })
    it('it returns correct value for production:identity', function () {
      assert.strictEqual(
        redis.getPrefix(prodEnv, identity),
        'production:identity:'
      )
    })
    it('it returns correct value for development:payments', function () {
      assert.strictEqual(
        redis.getPrefix(developmentEnv, payments),
        'development:payments:'
      )
    })
    it('it returns correct value for dev:payments', function () {
      assert.strictEqual(redis.getPrefix(devEnv, payments), 'dev:payments:')
    })
    it('it returns correct value for stage:payments', function () {
      assert.strictEqual(redis.getPrefix(stageEnv, payments), 'stage:payments:')
    })
    it('it returns correct value for production:payments', function () {
      assert.strictEqual(
        redis.getPrefix(prodEnv, payments),
        'production:payments:'
      )
    })
  })
})
