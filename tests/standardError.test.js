import assert from 'assert'
import { intefaces } from '../src'

const { standardError } = intefaces

describe('standard error', function () {
  it('it should return valid error', function () {
    const error = standardError({
      type: 'TestError',
      message: 'test message',
      errors: [
        {
          param: 'object',
          msg: 'some error message',
          location: 'object.field'
        }
      ]
    })
    assert.strictEqual(error.message, 'TestError')
    assert.strictEqual(error.details, 'test message')
    assert.strictEqual(error.errors.length, 1)
    assert.deepStrictEqual(error.errors[0], {
      object: 'some error message',
      location: 'object.field'
    })
  })
  it('it should return valid error if errors param is not provided', function () {
    const error = standardError({
      type: 'TestError',
      message: 'test message',
    })
    assert.strictEqual(error.message, 'TestError')
    assert.strictEqual(error.details, 'test message')
    assert.strictEqual(error.errors.length, 0)
  })
})