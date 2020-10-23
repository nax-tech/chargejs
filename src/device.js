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
      x_forwarded_for: req.headers['X-Forwarded-For'],
      x_forwarded_proto: req.headers['X-Forwarded-Proto'],
      x_forwarded_port: req.headers['X-Forwarded-Port'],
    }
    next()
  })
}