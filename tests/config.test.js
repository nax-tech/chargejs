import fs from 'fs'
import assert from 'assert'
import sinon from 'sinon'
import { config } from '../src'
import { CODES } from '../src/constants'
import { redisConfReturn } from './mocks/functions'

describe('config', function () {
  const incorrectEnvironment = 'devs'
  const incorrectApp = 'not and app'
  const devEnv = 'dev'
  const payments = 'payments'
  describe('config.getRedisPrefix', function () {
    it('it should throw an error parameters not provided', function () {
      try {
        config.getRedisPrefix()
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_ENV)
      }
    })
    it('it should throw an error if env is incorrect', function () {
      try {
        config.getRedisPrefix(incorrectEnvironment, payments)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_ENV)
      }
    })
    it('it should throw an error if app is incorrect', function () {
      try {
        config.getRedisPrefix(devEnv, incorrectApp)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_PACKAGE)
      }
    })
    it('it should return valid string', function () {
      const valid = config.getRedisPrefix(devEnv, payments)

      assert.strictEqual(valid, `${devEnv}:${payments}:`)
    })
  })
  describe('config.certs', function () {
    it('it should throw an error if env is not provided', function () {
      try {
        config.certs()
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_ENV)
      }
    })
    it('it should throw an error if env is incorrect', function () {
      try {
        config.certs(incorrectEnvironment)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_ENV)
      }
    })
    it('it should return valid object', function () {
      const stub = 'test'
      sinon.stub(fs, 'readFileSync').callsFake(function () {
        return stub
      })
      const valid = config.certs(devEnv)
      assert.strictEqual(valid.ca, stub)
      assert.strictEqual(valid.cert, stub)
      fs.readFileSync.restore()
    })
  })
  describe('config.redisConf', function () {
    const configStub = {
      REDISHOST: 'mockhost',
      REDISPORT: 'mockport'
    }
    const invalidConfig = {
      REDISPORT: 'mockport'
    }
    it('it should throw an error if env is incorrect', function () {
      try {
        config.redisConf(configStub, incorrectEnvironment, payments)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_ENV)
      }
    })
    it('it should throw an error if app is incorrect', function () {
      try {
        config.redisConf(configStub, devEnv, incorrectApp)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_PACKAGE)
      }
    })
    it('it should throw an error if config is incorrect', function () {
      try {
        config.redisConf(invalidConfig, devEnv, payments)
      } catch (error) {
        assert.strictEqual(error.code, CODES.INVALID_PACKAGE)
      }
    })
    it('it should return valid object', function () {
      const valid = config.redisConf(configStub, devEnv, payments)
      assert.deepStrictEqual(
        valid,
        redisConfReturn(configStub, devEnv, payments, config.getRedisPrefix)
      )
    })
    it('it should return valid object without tls if env = development', function () {
      const valid = config.redisConf(configStub, 'development', payments)
      const returnValue = redisConfReturn(
        configStub,
        'development',
        payments,
        config.getRedisPrefix
      )
      delete returnValue.tls
      assert.deepStrictEqual(valid, returnValue)
    })
  })
})
