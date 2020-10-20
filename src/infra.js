import fs from 'fs'
import path from 'path'
import winston from 'winston'

/**
 * A infra type module
 * @module infra
 */

/**
 * The winston transport object
 * @external "winston.transport"
 * @see {@link https://github.com/winstonjs/winston#readme}
 */

/**
 * The winston format object
 * @external "winston.format"
 * @see {@link https://github.com/winstonjs/winston#readme}
 */

/**
 * The winston transport object
 * @external "winston.transport"
 * @see {@link https://github.com/winstonjs/winston#readme}
 */

/**
 * The sequelize loaded model object
 * @external "sequelize.loaded"
 * @see {@link https://sequelize.org/}
 */

/**
 * Creates winston format object
 * @memberof module:infra
 * @method
 * @returns {external:winston.format} the winston format object
 *
 */
const logFormat = winston.format.printf(
  info =>
    `${info.timestamp} ${info.level} [${info.message.event}]: ${
      info.message.info
    } - ${JSON.stringify(info.message.meta)}`
)

/**
 * Creates winston transport namespaced to environment
 * @memberof module:infra
 * @method
 * @param {string} env the environment the app is running, ex: development, dev, stage, production
 * @returns {external:winston.transport} the winston transport object
 *
 */
export const LoggerStreamAdapter = env => {
  let LoggerStreamAdapter
  if (process.env.NODE_ENV === 'development') {
    LoggerStreamAdapter = new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat)
    })
  } else {
    LoggerStreamAdapter = new winston.transports.Console({})
  }
  return LoggerStreamAdapter
}

/**
 * Creates winston transport namespaced to environment
 * @memberof module:infra
 * @method
 * @returns {external:sequelize.loaded} the sequelize loaded model object
 *
 */
export const ModelLoader = () => {
  return {
    load ({ sequelize, baseFolder, indexFile = 'index.js' }) {
      const loaded = {}

      fs.readdirSync(baseFolder)
        .filter(file => {
          return (
            file.indexOf('.') !== 0 &&
            file !== indexFile &&
            file.slice(-3) === '.js'
          )
        })
        .forEach(file => {
          const model = sequelize.import(path.join(baseFolder, file))
          // const modelName = file.split('.')[0];
          loaded[model.name] = model
        })

      Object.keys(loaded).forEach(modelName => {
        if (loaded[modelName].associate) {
          loaded[modelName].associate(loaded)
        }
      })

      loaded.database = sequelize

      return loaded
    }
  }
}
