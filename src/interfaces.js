import deviceIPLocation from 'device-ip-location'
import path from 'path'
import express from 'express'
import http from 'http'
import https from 'https'
import Status from 'http-status'
import { validationResult } from 'express-validator'

/**
 * A module for common interfaces
 * @module interface
 */

/**
 * The express request object
 * @external "express.req"
 * @see {@link https://github.com/expressjs/express/blob/master/lib/request.js}
 */

/**
 * The express response object
 * @external "express.res"
 * @see {@link https://github.com/expressjs/express/blob/master/lib/response.js}
 */

/**
 * The express err object
 * @external "express.err"
 * @see {@link https://github.com/expressjs/express/blob/master/lib/router/index.js}
 */

/**
 * The express next object
 * @external "express.next"
 * @see {@link https://github.com/expressjs/express/blob/master/lib/router/index.js}
 */

/**
 * The express router object
 * @external "express.router"
 * @see {@link https://github.com/expressjs/express/blob/master/lib/router/index.js}
 */

/**
 * @typedef ErrorInfo
 * @type {Object}
 * @property {string} param The error param name
 * @property {string} msg The error message
 * @property {string} location The error location
 */

/**
 * Standard error function
 *
 * @memberof module:interface
 * @param {Object} input The input object
 * @param {string} input.type The error type
 * @param {string} input.message The error message
 * @param {ErrorInfo[]} input.errors The errors array
 * @returns {Error}
 */

export const standardError = ({
  type = 'Error',
  message = 'undefined error',
  errors = []
}) => {
  const extractedErrors = []
  if (errors !== undefined && Array.isArray(errors)) {
    errors.map(err =>
      extractedErrors.push({
        [err.param]: err.msg,
        location: err.location
      })
    )
  }
  const error = new Error(type)
  error.details = message
  error.errors = extractedErrors

  return error
}

/**
 * Dev error handler
 *
 * @memberof module:interface
 * @param {external:express.err} err
 * @param {external:express.req} req
 * @param {external:express.res} res
 * @param {external:express.next} next
 * @returns {external:express.res} the express res object
 */
export const devErrorHandler = (err, req, res, next) => {
  res.status(Status.INTERNAL_SERVER_ERROR).json({
    error: {
      type: err.type,
      message: err.message,
      errors: err.errors,
      stack: err.stack
    }
  })
}

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
export const deviceMiddleware = (req, res, next) => {
  deviceIPLocation.getInfo(req.headers['user-agent'], req.ip, (err, res) => {
    if (err !== undefined) {
      devErrorHandler(err, req, res, next)
    }

    req.origin = res
    req.origin.client = {
      xForwardedFor: req.headers['X-Forwarded-For'],
      xForwardedProto: req.headers['X-Forwarded-Proto'],
      xForwardedPort: req.headers['X-Forwarded-Port']
    }
  })
}

/**
 * Error handler
 *
 * @memberof module:interface
 * @param {external:express.err} err
 * @param {external:express.req} req
 * @param {external:express.res} res
 * @param {external:express.next} next
 * @returns {external:express.res} the express res object
 */
/* eslint-disable-next-line */
export const errorHandler = (err, req, res, next) => {
  res.status(Status.INTERNAL_SERVER_ERROR).json({
    type: 'InternalServerError',
    message: 'The server failed to handle this request',
    errors: err.errors
  })
}
/**
 * Not found error handler
 *
 * @memberof module:interface
 * @param {external:express.req} req
 * @param {external:express.res} res
 * @param {external:express.next} next
 * @returns {external:express.res} the express res object
 */
export const notFoundErrorHandler = (req, res, next) => {
  res.status(Status.NOT_FOUND).send({
    error: {
      type: Status['404_NAME'],
      message: Status['404_MESSAGE']
    }
  })
}

/**
 * Validate request handler
 *
 * @memberof module:interface
 * @param {external:express.req} req
 * @param {external:express.res} res
 * @param {external:express.next} next
 * @returns {external:express.res} the express res object
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }
  const extractedErrors = []
  errors
    .array()
    .map(err =>
      extractedErrors.push({ [err.param]: err.msg, location: err.location })
    )

  return res.status(Status.BAD_REQUEST).json({
    error: {
      type: Status['400_NAME'],
      message: 'invalid request parameters',
      errors: extractedErrors
    }
  })
}

/**
 * Creates a controller path for the router
 *
 * @memberof module:interface
 * @param {string} controllerUri the path to the controller
 * @returns {external:express.res} the express res object
 */
export const createControllerRoutes = controllerUri => {
  const controllerPath = path.resolve('src/interfaces/http', controllerUri)
  const Controller = require(controllerPath)

  return Controller.router
}

/**
 * Server class
 * @memberof module:interface
 */
export class Server {
  /**
   * starts the server based on environment
   *
   * @constructor Server
   * @param {Object} input - The input object as injected by src/container.js
   * @param {Object} input.config The config object
   * @param {Object} input.logger The logger function
   * @returns {external:express.router} the express router object
   */
  constructor ({ config, router, logger }) {
    this.config = config
    this.logger = logger
    this.express = express()
    this.express.disable('x-powered-by')
    this.express.use(router)
  }

  /**
   * sets the tls object for the server in https
   *
   * @returns {object}
   * @memberof Server
   */
  tlsOptions () {
    return {
      ca: this.config.certs.ca,
      key: this.config.tls,
      cert: this.config.certs.cert
    }
  }

  /**
   * starts the server
   *
   * @returns {Promise} a promise object for the server listen on port
   * @memberof Server
   */
  start () {
    https.globalAgent.options.rejectUnauthorized = false
    https.globalAgent.options.ca = [this.config.certs.ca]

    const server =
      this.config.web.env === 'development'
        ? http.createServer(this.express)
        : https.createServer(this.tlsOptions(), this.express)

    return new Promise(resolve => {
      const http = server.listen(this.config.web.port, '0.0.0.0', () => {
        const { port } = http.address()
        const { logmsg } = this.config
        this.logger.info({
          event: logmsg.event.start,
          info: `${logmsg.info.serverStart} ${port}`,
          meta: {}
        })

        resolve()
      })
    })
  }
}
