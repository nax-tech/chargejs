import axios from 'axios'
import Status from 'http-status'
import { NOT_FOUND, VALIDATION_ERROR, CONFLICT_ERROR } from '../errors'

export class ServiceCommunicator {
  constructor ({
    standardError,
    config
  }) {
    this.standardError = standardError
    this.logmsg = config.logmsg
  }

  init (serviceUrl) {
    this.serviceUrl = serviceUrl
  }

  async http (options) {
    try {
      const response = await axios({
        baseURL: this.serviceUrl,
        ...options
      })
      return response.data
    } catch (error) {
      const { response } = error
      if (response && response.data && response.data.error) {
        throw this._getStandardError(response.data.error)
      }
      throw error
    }
  }

  _getStandardError (error) {
    const type = this._getErrorCode(error.type)
    const { message, errors = [] } = error
    return this.standardError({
      type,
      message,
      errors: errors.map(({ location, ...rest }) => ({
        param: Object.keys(rest)[0],
        msg: Object.values(rest)[0],
        location
      }))
    })
  }

  _getErrorCode (type) {
    switch (type) {
      case Status['400_NAME']:
        return VALIDATION_ERROR.code
      case Status['404_NAME']:
        return NOT_FOUND.code
      case Status['409_NAME']:
        return CONFLICT_ERROR.code
      default:
        return type
    }
  }
}
