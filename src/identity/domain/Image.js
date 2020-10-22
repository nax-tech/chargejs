import BaseDomain from '../../domain'

const { attributes } = require('structure')
/**
 * A domain type module
 * @module domain
 */

/**
 * Creates an domain layer image
 * @class Image
 * @memberof module:domain
 * @param {Object} input The input object
 * @param {string} input.id The uuid of the image
 * @param {string} input.object The object type: image
 * @param {string} input.userId The uuid of the user owner of the image
 * @param {string} input.type
 * @param {string} input.personId
 * @param {string} input.metadata
 * @param {string} input.path
 * @param {date} input.updatedAt The updated date
 * @param {date} input.createdAt The created date
 */
const Image = attributes(
  {
    id: {
      type: String,
      required: false
    },
    object: {
      type: String,
      required: false,
      default: 'image'
    },
    type: {
      type: String,
      required: false
    },
    personId: {
      type: String,
      required: false
    },
    metadata: {
      type: Object,
      required: false
    },
    path: {
      type: String,
      required: false
    },
    updatedAt: {
      type: Date,
      required: false
    },
    createdAt: {
      type: Date,
      required: false
    }
  }
)(
  class Image extends BaseDomain {
    /**
     * sets the type field
     * @memberof module:domain.Image
     * @param {string} type
     * @returns {void}
     */
    addType (type) {
      return this.set('type', type)
    }

    /**
     * sets the personId field
     * @memberof module:domain.Image
     * @param {string} personId
     * @returns {void}
     */
    addPersonId (personId) {
      return this.set('personId', personId)
    }

    /**
     * sets the metadata field
     * @memberof module:domain.Image
     * @param {string} metadata
     * @returns {void}
     */
    addMetadata (metadata) {
      return this.set('metadata', metadata)
    }

    /**
     * sets the path field
     * @memberof module:domain.Image
     * @param {string} path
     * @returns {void}
     */
    addPath (path) {
      return this.set('path', path)
    }
  }
)

export default Image
