import assert from 'assert'
import Mock from './mocks/class/domainClassMock'
let base
describe('domain', function () {
  describe('domain.', function () {
    beforeEach(function () {
      base = new Mock({})
    })
    it('it add user Id correctly', function () {
      const userId = 'test'
      base.addUserId(userId)
      assert.deepStrictEqual(base.userId, userId)
    })
    it('it set meta correctly', function () {
      const meta = 'test'
      base.setMeta(meta)
      console.log(base.meta)
      assert.deepStrictEqual(base.meta, meta)
    })
    it('it should set masked correctly', function () {
      const number = '123456'
      const masked = 'xx3456'
      base.setMasked(number)
      assert.deepStrictEqual(base.masked, masked)
    })
    it('it should set sanitize correctly', function () {
      const allowedUpdatableFields = ['test']
      const fields = {
        test: 'test',
        not: 'not allowed'
      }
      const result = base.sanitize(fields, allowedUpdatableFields)
      assert.deepStrictEqual(result, { test: 'test' })
    })
  })
})
