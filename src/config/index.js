import fs from 'fs'
import path from 'path'
import winston from 'winston'
import {
  ALLOWED_ENVIRONMENTS,
  ALLOWED_PACKAGES,
  CERTS,
  KIND,
  SOURCE_TYPES,
  TYPES,
  NOTIFICATION_PUSH_COPY
} from '../constants'
import {
  INVALID_ENV,
  INVALID_PACKAGE,
  REFUSED_REDIS,
  RETRY_REDIS
} from '../errors'
import { CustomException } from '../helpers'
/**
 * A module for config functions
 * @module config
 */

/**
 * The winston config object
 * @external "winston.config"
 * @see {@link https://github.com/winstonjs/winston#creating-your-own-logger}
 */

/**
 * The redis config object
 * @external "redis.config"
 * @see {@link https://github.com/NodeRedis/node-redis#rediscreateclient}
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
  if (env === 'production') env = 'prod'
  return {
    ca: fs.readFileSync(CERTS.PREFIX_CA + env + CERTS.SUFFIX).toString(),
    cert: fs.readFileSync(CERTS.PREFIX_CERT + env + CERTS.SUFFIX).toString()
  }
}
/**
 * Sets up the common redis config object
 * time out is 1000 * 60 * 60
 * connection attempts > 10
 * reconnect after attempts * 100 every 3000ms
 * @memberof module:config
 * @method
 * @param {object} config the object with redis host and port
 * @param {string} env the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @throws Will throw an error if the connection fails
 * @returns {external:redis.config} the redis configuration object
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
    enable_offline_queue: true,
    tls: {},
    retry_strategy: function (options) {
      if (options.error && options.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with
        // a individual error
        return new CustomException(REFUSED_REDIS.message, REFUSED_REDIS.code)
      }
      if (options.total_retry_time > 1000 * 60 * 60) {
        // End reconnecting after a specific timeout and flush all commands
        // with a individual error
        return new CustomException(RETRY_REDIS.message, RETRY_REDIS.code)
      }
      if (options.attempt > 10) {
        // End reconnecting with built in error
        return undefined
      }
      // reconnect after
      return Math.min(options.attempt * 100, 3000)
    }
  }
  if (env === 'development') {
    delete redisConf.tls
  }
  return redisConf
}

/**
 * Get the Winston configuration object https://github.com/winstonjs/winston#readme
 * @memberof module:config
 * @method
 * @param {string} env the environment the app is running, ex: development, dev, stage, production
 * @param {string} app the app. This refers to the package, payments, identity
 * @returns {external:winston.config} the winston configuration object
 */
export const logging = (env, app) => {
  return {
    level: env === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.label({
        label: path.basename(process.mainModule.filename)
      }),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label', 'layer']
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: `${app} Service` },
    transports: [
      new winston.transports.File({
        filename:
          env === 'production'
            ? '/var/lib/docker/logs/platform-error.log'
            : './log/platform.error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename:
          env === 'production'
            ? '/var/lib/docker/logs/platform-combined.log'
            : './log/platform.combined.log'
      })
    ]
  }
}

/**
 * The type of notifications the system sends to users
 * @memberof module:config
 */
export const NOTIFICATION_KIND = {
  push: KIND.PUSH,
  email: KIND.EMAIL,
  sms: KIND.SMS
}
/**
 * The source of notifications.
 * This is used by the notification coordinator queue to coordinate notifications.
 * It is added into the name of the message queue as `${NOTIFICATION_SOURCE_TYPES.address}:${NOTIFICATION_TYPES.updated}`
 * @memberof module:config
 */
export const NOTIFICATION_SOURCE_TYPES = {
  email: SOURCE_TYPES.EMAIL,
  password: SOURCE_TYPES.PASSWORD,
  phone: SOURCE_TYPES.PHONE,
  address: SOURCE_TYPES.ADDRESS,
  pin: SOURCE_TYPES.PIN,
  support: SOURCE_TYPES.SUPPORT,
  transactions: SOURCE_TYPES.TRANSACTIONS,
  cards: SOURCE_TYPES.CARDS
}
/**
 * The type of notifications.
 * This is used by the notification coordinator queue to coordinate notifications.
 * It is added into the name of the message queue as `${NOTIFICATION_SOURCE_TYPES.address}:${NOTIFICATION_TYPES.updated}`
 * @memberof module:config
 */
export const NOTIFICATION_TYPES = {
  default: TYPES.DEFAULT,
  updated: TYPES.UPDATED,
  accepted: TYPES.ACCEPTED,
  declined: TYPES.DECLINED,
  verification: TYPES.VERIFICATION,
  verified: TYPES.VERIFIED,
  new: TYPES.NEW,
  enabled: TYPES.ENABLED,
  disabled: TYPES.DISABLED
}
/**
 * The copy for the push notifications
 * @memberof module:config
 */
export const NOTIFICATION_PUSH = {
  payment: {
    new: {
      title: NOTIFICATION_PUSH_COPY.PAYMENT.NEW.TITLE,
      body: NOTIFICATION_PUSH_COPY.PAYMENT.NEW.BODY
    },
    accepted: {
      title: NOTIFICATION_PUSH_COPY.PAYMENT.ACCEPTED.TITLE,
      body: NOTIFICATION_PUSH_COPY.PAYMENT.ACCEPTED.BODY
    },
    declined: {
      title: NOTIFICATION_PUSH_COPY.PAYMENT.DECLINED.TITLE,
      body: NOTIFICATION_PUSH_COPY.PAYMENT.DECLINED.BODY
    }
  },
  profile: {
    email: {
      updated: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.EMAIL.UPDATED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.EMAIL.UPDATED.BODY
      }
    },
    phone: {
      updated: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.PHONE.UPDATED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.PHONE.UPDATED.BODY
      }
    },
    address: {
      added: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.ADDED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.ADDED.BODY
      },
      updated: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.UPDATED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.UPDATED.BODY
      },
      default: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.DEFAULT.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.ADDRESS.DEFAULT.BODY
      }
    },
    pin: {
      enabled: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.PIN.ENABLED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.PIN.ENABLED.BODY
      },
      disabled: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.PIN.DISABLED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.PIN.DISABLED.BODY
      },
      updated: {
        title: NOTIFICATION_PUSH_COPY.PROFILE.PIN.UPDATED.TITLE,
        body: NOTIFICATION_PUSH_COPY.PROFILE.PIN.UPDATED.BODY
      }
    }
  }
}
/**
 * Creates the initial notification array for a new user
 * @memberof module:config
 * @method
 * @param {string} settingsId the uuid of the settings
 * @returns {Array<Object>} the array of settings
 */
export const createNotifications = (settingsId) => {
  return [
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.email,
      type: NOTIFICATION_TYPES.verification
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.email,
      type: NOTIFICATION_TYPES.verified
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.email,
      type: NOTIFICATION_TYPES.new
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.password,
      type: NOTIFICATION_TYPES.verification
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.password,
      type: NOTIFICATION_TYPES.updated
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.support,
      type: NOTIFICATION_TYPES.new
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.new
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.email,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.accepted
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.email,
      type: NOTIFICATION_TYPES.updated
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.phone,
      type: NOTIFICATION_TYPES.updated
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.address,
      type: NOTIFICATION_TYPES.new
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.address,
      type: NOTIFICATION_TYPES.updated
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.pin,
      type: NOTIFICATION_TYPES.enabled
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.pin,
      type: NOTIFICATION_TYPES.updated
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.new
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.accepted
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.push,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.declined
    },
    {
      settingsId,
      kind: NOTIFICATION_KIND.sms,
      sourceType: NOTIFICATION_SOURCE_TYPES.cards,
      type: NOTIFICATION_TYPES.verification
    }
  ]
}
