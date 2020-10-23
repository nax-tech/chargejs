import deviceIPLocation from 'device-ip-location'

/**
 * A module for config functions
 * @module device
 */

/**
 * Sets device infor available in req object for access in controllers
 * @memberof module:device
 * @method
 * @param {http.ClientRequest} a native js http client request object
 * @param {http.ServerResponse} a native js http server response object
 * @param {function} 
 * @returns {function} 
 * 
 */
export const DeviceMiddleware = (req, res, next) => {
	device.getInfo(req.headers['user-agent'], req.ip, (err, res) => {
    req.origin = res
    req.origin.client = {
      xForwardedFor: req.headers['X-Forwarded-For'],
      xForwardedProto: req.headers['X-Forwarded-Proto'],
      xForwardedPort: req.headers['X-Forwarded-Port'],
    }
    next()
  })
}