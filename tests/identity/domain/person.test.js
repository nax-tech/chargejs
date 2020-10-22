import assert from 'assert'
import Person from '../../../src/identity/domain/Person'
let person
describe('domain', function () {
  describe('person', function () {
    beforeEach(function () {
      person = new Person({})
    })

    it('it add userId correctly', function () {
      const userId = 'test'
      person.addUserId(userId)
      assert.equal(person.userId, userId)
    })

    it('it add externalId correctly', function () {
      const externalId = 'test'
      person.addExternalId(externalId)
      assert.equal(person.externalId, externalId)
    })

    it('it add profile correctly', function () {
      const profile = 'test'
      person.addProfile(profile)
      assert.equal(person.profile, profile)
    })

    it('it add status correctly', function () {
      const status = 'test'
      person.addStatus(status)
      assert.equal(person.status, status)
    })

    it('it add step correctly', function () {
      const step = 'test'
      person.addStep(step)
      assert.equal(person.step, step)
    })

    it('it add identifier correctly', function () {
      const identifier = 'test'
      person.addIdentifier(identifier)
      assert.equal(person.identifier, identifier)
    })

    it('it add firstName correctly', function () {
      const firstName = 'test'
      person.addFirstName(firstName)
      assert.equal(person.firstName, firstName)
    })

    it('it add lastName correctly', function () {
      const lastName = 'test'
      person.addLastName(lastName)
      assert.equal(person.lastName, lastName)
    })

    it('it add email correctly', function () {
      const email = 'test'
      person.addEmail(email)
      assert.equal(person.email, email)
    })

    it('it add phoneNumber correctly', function () {
      const phoneNumber = 'test'
      person.addPhoneNumber(phoneNumber)
      assert.equal(person.phoneNumber, phoneNumber)
    })

    it('it add addressA correctly', function () {
      const addressA = 'test'
      person.addAddressA(addressA)
      assert.equal(person.addressA, addressA)
    })

    it('it add addressB correctly', function () {
      const addressB = 'test'
      person.addAddressB(addressB)
      assert.equal(person.addressB, addressB)
    })

    it('it add city correctly', function () {
      const city = 'test'
      person.addCity(city)
      assert.equal(person.city, city)
    })

    it('it add zip correctly', function () {
      const zip = 'test'
      person.addZip(zip)
      assert.equal(person.zip, zip)
    })

    it('it add country correctly', function () {
      const country = 'test'
      person.addCountry(country)
      assert.equal(person.country, country)
    })

    it('it add dob correctly', function () {
      const dob = 'test'
      person.addDob(dob)
      assert.equal(person.dob, dob)
    })

    it('it add taxId correctly', function () {
      const taxId = 'test'
      person.addTaxId(taxId)
      assert.equal(person.taxId, taxId)
    })
  })
})
