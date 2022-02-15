import axios from 'axios'
import Status from 'http-status'

export class ServiceCommunicator {
  constructor ({
    standardError,
    config
  }) {
    this.standardError = standardError
    this.logmsg = config.logmsg
  }

  async _http (options) {
    try {
      const response = await axios(options)
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
    const type = this._getErrorType(error.type)
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

  _getErrorType (type) {
    switch (type) {
      case Status['400_NAME']:
        return this.logmsg.errors.validationError
      case Status['404_NAME']:
        return this.logmsg.errors.notFoundError
      default:
        return type
    }
  }
}
