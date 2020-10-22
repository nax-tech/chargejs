import assert from 'assert'
import Image from '../../../src/identity/domain/Image'
let image
describe('domain', function () {
  describe('image', function () {
    beforeEach(function () {
      image = new Image({})
    })

    it('it add type correctly', function () {
      const type = 'test'
      image.addType(type)
      assert.strictEqual(image.type, type)
    })

    it('it add personId correctly', function () {
      const personId = 'test'
      image.addPersonId(personId)
      assert.strictEqual(image.personId, personId)
    })

    it('it add metadata correctly', function () {
      const metadata = {
        test: 'test'
      }
      image.addMetadata(metadata)
      assert.strictEqual(image.metadata, metadata)
    })

    it('it add path correctly', function () {
      const path = 'test'
      image.addPath(path)
      assert.strictEqual(image.path, path)
    })
  })
})
