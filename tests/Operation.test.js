import assert from 'assert'
import { app } from '../src'
import { CODES } from '../src/constants'
let operation
app.Operation.setOutputs(['SUCCESS', 'ERROR'])

describe('Operation', function () {
  beforeEach(function () {
    operation = new app.Operation()
  })
  it('it should set outputs correctly', function () {
    const { SUCCESS, ERROR } = operation.outputs
    assert.deepStrictEqual(SUCCESS, 'SUCCESS')
    assert.deepStrictEqual(ERROR, 'ERROR')
  })
  it('it should add listeners correctly', function () {
    operation.on('SUCCESS', function () {})
  })
  it('it should fail to add listeners if invalid', function () {
    try {
      operation.on('NOT_VALID', function () {})
    } catch (error) {
      assert.strictEqual(error.code, CODES.INVALID_OUTPUT)
    }
  })
})
