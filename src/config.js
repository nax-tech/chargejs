import fs from 'fs'
import { ALLOWED_ENVIRONMENTS, ALLOWED_PACKAGES, CERTS } from './constants'
import { INVALID_ENV, INVALID_PACKAGE } from './errors'
import { CustomException } from './helpers'
/**
 * A module for config functions
 * @module config
 */

/**
 * Gets the allowed prefix for redis
 * @memberof module:config
 * @method
 * @param {string} environment the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @throws Will throw an error if the environment or app are incorrect
 * @returns {string} string value with concat of environment:app
 */
export const getRedisPrefix = (environment = undefined, app = undefined) => {
  if (!ALLOWED_ENVIRONMENTS.includes(environment)) {
    throw new CustomException(INVALID_ENV.message, INVALID_ENV.code)
  }
  if (!ALLOWED_PACKAGES.includes(app)) {
    throw new CustomException(INVALID_PACKAGE.message, INVALID_PACKAGE.code)
  }
  return `${environment}:${app}:`
}
/**
 * Reads the ca and cert for runtime decryption. Expects files in /app/tls/
 * @memberof module:config
 * @method
 * @param {string} ev the environment the app is running, ex: development, dev, stage, production
 * @throws Will throw an error if the environment is incorrect
 * @returns {object} object with location of ca and cert
 */
export const certs = (env = undefined) => {
  if (!ALLOWED_ENVIRONMENTS.includes(env)) {
    throw new CustomException(INVALID_ENV.message, INVALID_ENV.code)
  }
  return {
    ca: fs.readFileSync(CERTS.PREFIX_CA + env + CERTS.SUFFIX).toString(),
    cert: fs.readFileSync(CERTS.PREFIX_CERT + env + CERTS.SUFFIX).toString()
  }
}
/**
 * Sets up the common redis config object
 * @memberof module:config
 * @method
 * @param {object} config the object with redis host and port
 * @param {string} env the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @throws Will throw an error if the  is incorrect
 * @returns {object} object with location of ca and cert
 */
export const redisConf = (config, env, app) => {
  if (!ALLOWED_ENVIRONMENTS.includes(env)) {
    throw new CustomException(INVALID_ENV.message, INVALID_ENV.code)
  }
  if (!ALLOWED_PACKAGES.includes(app)) {
    throw new CustomException(INVALID_PACKAGE.message, INVALID_PACKAGE.code)
  }
  if (
    config === undefined ||
    config.REDISHOST === undefined ||
    config.REDISPORT === undefined
  ) {
    throw new CustomException(INVALID_PACKAGE.message, INVALID_PACKAGE.code)
  }
  const redisConf = {
    host: config.REDISHOST,
    port: config.REDISPORT,
    prefix: getRedisPrefix(env, app),
    enable_offline_queue: false,
    tls: {}
  }
  if (env === 'development') {
    delete redisConf.tls
  }
  return redisConf
}
