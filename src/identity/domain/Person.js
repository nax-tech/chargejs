import BaseDomain from '../../domain'
import { mask } from 'ein-validator'

const { attributes } = require('structure')

const allowedUpdatableFields = [
  'step',
  'identifier',
  'firstName',
  'lastName',
  'email',
  'phoneNumber',
  'addressA',
  'addressB',
  'city',
  'zip',
  'country',
  'dob',
  'taxId',
  'meta'
]
/**
 * A domain type module
 * @module domain
 */

/**
 * Creates an domain layer person
 * @class Person
 * @memberof module:domain
 * @param {Object} input The input object
 * @param {string} input.id The uuid of the person
 * @param {string} input.object The object type: person
 * @param {string} input.userId The uuid of the user owner of the person
 * @param {string} input.externalId
 * @param {string} input.profile
 * @param {string} input.status
 * @param {string} input.step
 * @param {string} input.identifier
 * @param {string} input.firstName
 * @param {string} input.lastName
 * @param {string} input.email
 * @param {string} input.phoneNumber
 * @param {string} input.addressA
 * @param {string} input.addressB
 * @param {string} input.city
 * @param {string} input.zip
 * @param {string} input.country
 * @param {string} input.dob
 * @param {string} input.taxId
 * @param {string} input.meta
 * @param {string} input.images
 * @param {date} input.updatedAt The updated date
 * @param {date} input.createdAt The created date
 */
const Person = attributes(
  {
    id: {
      type: String,
      required: false
    },
    object: {
      type: String,
      required: false,
      default: 'person'
    },
    userId: {
      type: String,
      required: false
    },
    externalId: {
      type: String,
      required: false
    },
    profile: {
      type: String,
      required: false
    },
    status: {
      type: String,
      required: false,
      default: 'pending'
    },
    step: {
      type: String,
      required: false
    },
    identifier: {
      type: String,
      required: false
    },
    firstName: {
      type: String,
      required: false
    },
    lastName: {
      type: String,
      required: false
    },
    email: {
      type: String,
      required: false
    },
    phoneNumber: {
      type: String,
      required: false
    },
    addressA: {
      type: String,
      required: false
    },
    addressB: {
      type: String,
      required: false
    },
    city: {
      type: String,
      required: false
    },
    zip: {
      type: String,
      required: false
    },
    country: {
      type: String,
      required: false
    },
    dob: {
      type: String,
      required: false
    },
    taxId: {
      type: String,
      required: false
    },
    meta: {
      type: Object,
      required: false
    },
    images: {
      type: Array,
      itemType: 'Image',
      required: false,
      default: [],
      empty: true,
      nullable: true
    },
    updatedAt: {
      type: Date,
      required: false
    },
    createdAt: {
      type: Date,
      required: false
    }
  },
  {
    dynamics: {
      Image: () => require('./Image')
    }
  }
)(
  class Person extends BaseDomain {
    /**
     * sets the externalId field
     * @memberof module:domain.Person
     * @param {string} externalId
     * @returns {void}
     */
    addExternalId (externalId) {
      return this.set('externalId', externalId)
    }

    /**
     * sets the profile field
     * @memberof module:domain.Person
     * @param {string} profile
     * @returns {void}
     */
    addProfile (profile) {
      return this.set('profile', profile)
    }

    /**
     * sets the status field
     * @memberof module:domain.Person
     * @param {string} status
     * @returns {void}
     */
    addStatus (status) {
      return this.set('status', status)
    }

    /**
     * sets the step field
     * @memberof module:domain.Person
     * @param {string} step
     * @returns {void}
     */
    addStep (step) {
      return this.set('step', step)
    }

    /**
     * sets the identifier field
     * @memberof module:domain.Person
     * @param {string} identifier
     * @returns {void}
     */
    addIdentifier (identifier) {
      return this.set('identifier', identifier)
    }

    /**
     * sets the firstName field
     * @memberof module:domain.Person
     * @param {string} firstName
     * @returns {void}
     */
    addFirstName (firstName) {
      return this.set('firstName', firstName)
    }

    /**
     * sets the lastName field
     * @memberof module:domain.Person
     * @param {string} lastName
     * @returns {void}
     */
    addLastName (lastName) {
      return this.set('lastName', lastName)
    }

    /**
     * sets the email field
     * @memberof module:domain.Person
     * @param {string} email
     * @returns {void}
     */
    addEmail (email) {
      return this.set('email', email)
    }

    /**
     * sets the phoneNumber field
     * @memberof module:domain.Person
     * @param {string} phoneNumber
     * @returns {void}
     */
    addPhoneNumber (phoneNumber) {
      return this.set('phoneNumber', phoneNumber)
    }

    /**
     * sets the addressA field
     * @memberof module:domain.Person
     * @param {string} addressA
     * @returns {void}
     */
    addAddressA (addressA) {
      return this.set('addressA', addressA)
    }

    /**
     * sets the addressB field
     * @memberof module:domain.Person
     * @param {string} addressB
     * @returns {void}
     */
    addAddressB (addressB) {
      return this.set('addressB', addressB)
    }

    /**
     * sets the city field
     * @memberof module:domain.Person
     * @param {string} city
     * @returns {void}
     */
    addCity (city) {
      return this.set('city', city)
    }

    /**
     * sets the zip field
     * @memberof module:domain.Person
     * @param {string} zip
     * @returns {void}
     */
    addZip (zip) {
      return this.set('zip', zip)
    }

    /**
     * sets the country field
     * @memberof module:domain.Person
     * @param {string} country
     * @returns {void}
     */
    addCountry (country) {
      return this.set('country', country)
    }

    /**
     * sets the dob field
     * @memberof module:domain.Person
     * @param {string} dob
     * @returns {void}
     */
    addDob (dob) {
      return this.set('dob', dob)
    }

    /**
     * sets the taxId field
     * @memberof module:domain.Person
     * @param {string} taxId
     * @returns {void}
     */
    addTaxId (taxId) {
      return this.set('taxId', taxId)
    }

    /**
     * hides first digests of the taxId field
     * @memberof module:domain.Person
     * @returns {void}
     */
    hideTaxId () {
      if (this.taxId) {
        return this.set('taxId', mask(this.taxId))
      }
    }

    /**
     * gets the allowed updated fields
     * @memberof module:domain.Person
     * @returns {string[]}
     */
    getUpdatableFields () {
      return allowedUpdatableFields
    }
  }
)

export default Person
