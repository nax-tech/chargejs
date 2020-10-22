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
      assert.equal(image.type, type)
    })

    it('it add personId correctly', function () {
      const personId = 'test'
      image.addPersonId(personId)
      assert.equal(image.personId, personId)
    })

    it('it add metadata correctly', function () {
      const metadata = 'test'
      image.addMetadata(metadata)
      assert.equal(image.metadata, metadata)
    })

    it('it add path correctly', function () {
      const path = 'test'
      image.addPath(path)
      assert.equal(image.path, path)
    })
  })
})
