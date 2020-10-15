import { domain } from '../../../src'
const { attributes } = require('structure')
const Mock = attributes({
  userId: {
    type: String,
    required: true
  },
  meta: {
    type: String,
    required: false
  },
  masked: {
    type: String,
    required: true
  }
})(class Mock extends domain.BaseDomain {})

export default Mock
