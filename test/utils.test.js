const assert = require('assert')
const utils = require('../src/utils')

describe('Utils', function () {
  describe('getRedisPrefix', function () {
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
          utils.getPrefix(incorrectEnvironment, payments)
        },
        Error,
        `Invalid environment for Redis prefix: ${incorrectEnvironment}`
      )
    })
    it('it should throw an error if env is incorrect', function () {
      assert.throws(
        function () {
          utils.getPrefix(developmentEnv, wallet)
        },
        Error,
        `Invalid package for Redis prefix: ${wallet}`
      )
    })
    it('it returns correct value for development:identity', function () {
      assert.strictEqual(
        utils.getPrefix(developmentEnv, identity),
        'development:identity:'
      )
    })
    it('it returns correct value for dev:identity', function () {
      assert.strictEqual(utils.getPrefix(devEnv, identity), 'dev:identity:')
    })
    it('it returns correct value for stage:identity', function () {
      assert.strictEqual(utils.getPrefix(stageEnv, identity), 'stage:identity:')
    })
    it('it returns correct value for production:identity', function () {
      assert.strictEqual(
        utils.getPrefix(prodEnv, identity),
        'production:identity:'
      )
    })
    it('it returns correct value for development:payments', function () {
      assert.strictEqual(
        utils.getPrefix(developmentEnv, payments),
        'development:payments:'
      )
    })
    it('it returns correct value for dev:payments', function () {
      assert.strictEqual(utils.getPrefix(devEnv, payments), 'dev:payments:')
    })
    it('it returns correct value for stage:payments', function () {
      assert.strictEqual(utils.getPrefix(stageEnv, payments), 'stage:payments:')
    })
    it('it returns correct value for production:payments', function () {
      assert.strictEqual(
        utils.getPrefix(prodEnv, payments),
        'production:payments:'
      )
    })
  })
})
