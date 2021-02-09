import fs from 'fs'
import path from 'path'

/**
 * Creates winston transport namespaced to environment
 * @memberof module:infra
 * @method
 * @returns {external:sequelize.loaded} the sequelize loaded model object
 *
 */
const ModelLoader = () => {
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
export default ModelLoader
