import {
  INVALID_PATCH_FIELDS,
  INVALID_FILTER_TYPE,
  CACHE_DISABLED,
  SEQUELIZE_NOT_FOUNT_ERROR,
  SEQUELIZE_VALIDATION_ERROR,
  INVALID_PAGE_SIZE,
  INVALID_CURRENT_PAGE,
  EMPTY_UPDATE_FIELDS
} from '../errors'

/**
 * A infra type module
 * @module infra
 */

class BaseRepository {
  /**
   * Creates an instance of BaseRepository.
   * @memberof module:repository
   * @param {Object} container The input object as injected in src/container.js
   * @param {module:infra.TransactionProvider} container.transactionProvider The TransactionProvider
   * @param {module:infra.RedisRepository} container.redisRepository The RedisRepository
   * @param {function} container.calculateLimitAndOffset function used for pagination
   * @param {function} container.paginate function used for pagination
   * @param {Object} input.config The config object with configuration parameters
   * @param {module:interface.standardError} input.standardError The standard error generator
   */
  constructor ({
    transactionProvider,
    redisRepository,
    calculateLimitAndOffset,
    paginate,
    config,
    standardError
  }) {
    this.transactionProvider = transactionProvider
    this.redisRepository = redisRepository
    this.calculateLimitAndOffset = calculateLimitAndOffset
    this.paginate = paginate
    this.config = config
    this.logmsg = config.logmsg
    this.standardError = standardError
  }

  /**
   * Provides configuration for BaseRepository.
   *
   * @param {Object} input The input object as injected in src/container.js
   * @param {Object} input.model The db model
   * @param {Object} input.mapper The entity mapper
   * @param {string[]} [input.patchAllowedFields] The patch allowed fields array
   * @param {Object[]} [input.include] Included related entities array
   * @param {boolean} [input.cacheDisabled=false] Disable cahing
   */
  init ({
    model,
    mapper,
    patchAllowedFields = undefined,
    include = undefined,
    cacheDisabled = false
  }) {
    this.modelName = this._getModelName(model)
    this.model = model
    this.mapper = mapper
    this.patchAllowedFields = patchAllowedFields
    this.include = include
    this.cacheDisabled = cacheDisabled

    this.redisRepository.init({
      modelName: this.modelName,
      indexes: this._getIndexes(model),
      include: this._normalizeInclude(include),
      references: this._getReferences(model)
    })
  }

  /**
   * Finds entity by id
   *
   * @param {string} id Entity uuid
   * @param {Object} [options] options
   * @param {boolean} [options.rejectOnEmpty=true] reject on empty
   * @param {boolean} [options.useCache] use cache
   * @returns {Promise<Object>} entity
   * @throws {module:interface.standardError}
   */
  async findOneById (id, options) {
    return this.findOne({ id }, options)
  }

  /**
   * Finds entity by filter
   *
   * @param {Object} where filter
   * @param {Object} [options] options
   * @param {boolean} [options.rejectOnEmpty=true] reject on empty
   * @param {boolean} [options.useCache] use cache
   * @returns {Promise<Object>} entity
   * @throws {module:interface.standardError}
   */
  async findOne (where, { rejectOnEmpty = true, useCache = !this.cacheDisabled } = {}) {
    this._validateFilter(where)

    let result
    if (useCache) {
      if (this.cacheDisabled) {
        throw this._getCacheDisabledError()
      }
      result = await this.redisRepository.findOneOrCreate(where, () => this._dbFindOne(where))
    } else {
      result = await this._dbFindOne(where)
    }
    if (result) {
      return this.mapper.toEntity(result)
    }
    if (rejectOnEmpty) {
      throw this._getNotFoundError()
    }
  }

  /**
   * Сount entities by filter
   *
   * @param {Object} where filter
   * @param {Object} [options] additional sequelize options
   * @returns {Promise<Number>} number of entities
   */
  count (where, options) {
    return this.model.count({
      ...options,
      where,
      include: this.include,
      transaction: this._getTransaction()
    })
  }

  /**
   * Returns latest entry
   *
   * @param {Object} [where] filter
   * @param {Object} [options] additional sequelize options
   * @param {String} [options.orderBy] order field
   * @returns {Promise<Object>} entity
   * @throws {module:interface.standardError}
   */
  async findLatest (where = {}, { rejectOnEmpty = true, ...opts } = {}) {
    const [result] = await this.findAll(where, {
      limit: 1,
      ...opts
    })
    if (result) {
      return result
    }
    if (rejectOnEmpty) {
      throw this._getNotFoundError()
    }
  }

  /**
   * Finds entities by filter
   *
   * @param {Object} where filter
   * @param {Object} [options] additional sequelize options
   * @param {String} [options.orderBy] order field
   * @returns {Promise<Object[]>} entities
   * @throws {module:interface.standardError}
   */
  async findAll (where, { orderBy = 'createdAt', ...opts } = {}) {
    this._validateFilter(where)

    const rows = await this.model.findAll({
      order: [[orderBy, 'DESC']],
      ...opts,
      where,
      include: this.include,
      transaction: this._getTransaction()
    })
    return rows.map(row => this.mapper.toEntity(row.toJSON()))
  }

  /**
   * Pagination meta
   * @typedef {({ currentPage: number, pageCount: number, pageSize: number, count: number })} Meta
   */

  /**
   * Finds entities with pagination
   *
   * @param {Object} where filter
   * @param {number} currentPage current page number
   * @param {number} pageSize page size
   * @param {Object} [options] additional sequelize options
   * @param {String} [options.orderBy] order field
   * @returns {Promise<{ data: Object[], meta: Meta>} entities
   * @throws {module:interface.standardError}
   */
  async findAndCountAll (where, currentPage, pageSize, { orderBy = 'createdAt', ...opts } = {}) {
    this._validateFilter(where)
    this._validatePaginateParams(currentPage, pageSize)

    const { limit, offset } = this.calculateLimitAndOffset(currentPage, pageSize)

    const { rows, count } = await this.model.findAndCountAll({
      order: [[orderBy, 'DESC']],
      ...opts,
      limit,
      offset,
      distinct: true,
      where,
      include: this.include,
      transaction: this._getTransaction()
    })
    const meta = this.paginate(currentPage, count, rows, pageSize)
    return {
      data: rows.map(row => this.mapper.toEntity(row.toJSON())),
      meta
    }
  }

  /**
   * Post entity
   *
   * @param {module:domain.BaseDomain} entity domain entity
   * @returns {Promise<module:domain.BaseDomain>} saved entity
   * @throws {module:interface.standardError}
   */
  async post (entity) {
    const { valid, errors } = entity.validate()
    if (!valid) {
      throw this._getValidationError(errors)
    }
    const dbEntry = await this.model.create(
      this.mapper.toDatabase(entity),
      { transaction: this._getTransaction() }
    )
    const json = dbEntry.toJSON()
    await this.redisRepository.clearReferenced(json)
    return this.mapper.toEntity(json)
  }

  /**
   * Updates entity by uuid
   *
   * @param {string} id entity uuid
   * @param {Object} updateFields the fields to be updated
   * @param {boolean} [filterFields=true] should filter updateFields
   * @returns {Promise<module:domain.BaseDomain>} updated domain entity
   * @throws {module:interface.standardError}
   */
  async patchById (id, updateFields, filterFields = true) {
    return this.patch({ id }, updateFields, filterFields)
  }

  /**
   * Updates entity by filter
   *
   * @param {Object} where filter
   * @param {Object} updateFields the fields to be updated
   * @param {boolean} [filterFields=true] should filter updateFields
   * @returns {Promise<module:domain.BaseDomain>} updated domain entity
   * @throws {module:interface.standardError}
   */
  async patch (where, updateFields, filterFields = true) {
    this._validateFilter(where)

    const filteredFields = filterFields ? this._filterPatchFields(updateFields) : updateFields
    if (!Object.keys(filteredFields).length) {
      throw this._getValidationError([{
        message: EMPTY_UPDATE_FIELDS.message,
        path: 'updateFields'
      }])
    }
    try {
      const filter = await this._getPatchFilter(where)
      const [, result] = await this.model.update(filteredFields, {
        where: filter,
        returning: true,
        plain: true,
        transaction: this._getTransaction()
      })
      if (!result) {
        throw this._getNotFoundError()
      }
      const json = result.toJSON()
      await this._clearCache(json)
      return this.mapper.toEntity(json)
    } catch (error) {
      switch (error.name) {
        case SEQUELIZE_VALIDATION_ERROR.code:
          throw this._getValidationError(error.errors)
        case SEQUELIZE_NOT_FOUNT_ERROR.code:
          throw this._getNotFoundError()
        default:
          throw error
      }
    }
  }

  /**
   * Deletes entity by uuid
   *
   * @param {string} id entity uuid
   * @returns {Promise<module:domain.BaseDomain>} deleted domain entity
   * @throws {module:interface.standardError}
   */
  async deleteById (id) {
    return this.delete({ id })
  }

  /**
   * Deletes entity by filter
   *
   * @param {Object} where filter
   * @returns {Promise<module:domain.BaseDomain>} deleted domain entity
   * @throws {module:interface.standardError}
   */
  async delete (where) {
    this._validateFilter(where)

    try {
      const filter = await this._getPatchFilter(where)
      const [, result] = await this.model.destroy({
        where: filter,
        transaction: this._getTransaction()
      })
      if (!result) {
        throw this._getNotFoundError()
      }
      const json = result.toJSON()
      await this._clearCache(json)
      return this.mapper.toEntity(json)
    } catch (error) {
      switch (error.name) {
        case SEQUELIZE_VALIDATION_ERROR.code:
          throw this._getValidationError(error.errors)
        case SEQUELIZE_NOT_FOUNT_ERROR.code:
          throw this._getNotFoundError()
        default:
          throw error
      }
    }
  }

  // Private
  _getModelName (model) {
    const modelName = model.options.name.singular
    return modelName.charAt(0).toLowerCase() + modelName.slice(1)
  }

  _getReferences (model) {
    const models = Object.values(model.sequelize.models)
    return Object.values(model.rawAttributes)
      .filter(({ references }) => references && references.key === 'id')
      .map(attr => {
        const { model } = attr.references
        const m = models.find(m => m.tableName === model)
        return {
          modelName: this._getModelName(m),
          fieldName: attr.fieldName
        }
      })
  }

  _normalizeInclude (include) {
    if (!include) {
      return []
    }
    return include.map(({ model, as, include }) => ({
      modelName: this._getModelName(model),
      as,
      include: include && this._normalizeInclude(include)
    }))
  }

  _getIndexes (model) {
    const models = Object.values(model.sequelize.models)
    const entries = models.map(model => {
      const modelName = this._getModelName(model)
      const indexes = (model.options.indexes || [])
        .filter(index => index.unique)
        .map(index => index.fields)
      return [modelName, indexes]
    })
    return Object.fromEntries(entries)
  }

  async _dbFindOne (where) {
    const result = await this.model.findOne({
      where,
      include: this.include,
      distinct: true,
      transaction: this._getTransaction()
    })
    if (result) {
      return result.toJSON()
    }
  }

  _clearCache (entity) {
    return this.redisRepository.clear(entity, this.cacheDisabled)
  }

  async _getPatchFilter (where) {
    // Update and Destroy requests do not support filtering by
    // related entities fields, so we should do Find request to get entity id
    const hasRelatedEntityFilter = Object.keys(where).find((key) => key.startsWith('$'))
    if (hasRelatedEntityFilter) {
      const cachedEntity = await this.redisRepository.findOne(where)
      const entity = cachedEntity || (await this._dbFindOne(where))
      if (!entity) {
        throw this._getNotFoundError()
      }
      return { id: entity.id }
    }
    return where
  }

  _getTransaction () {
    return this.transactionProvider.getSequelizeTransaction()
  }

  _validateFilter (filter) {
    if (typeof filter !== 'object') {
      // Error for developers only, can only occur if the filter type is invalid
      const error = new Error(INVALID_FILTER_TYPE.message)
      error.type = INVALID_FILTER_TYPE.code
      throw error
    }
  }

  _validatePaginateParams (currentPage, pageSize) {
    if (Number.isNaN(Number(currentPage))) {
      // Error for developers only, can only occur if the currentPage is invalid
      const error = new Error(INVALID_CURRENT_PAGE.message)
      error.type = INVALID_CURRENT_PAGE.code
      throw error
    }
    if (Number.isNaN(Number(pageSize))) {
      // Error for developers only, can only occur if the pageSize is invalid
      const error = new Error(INVALID_PAGE_SIZE.message)
      error.type = INVALID_PAGE_SIZE.code
      throw error
    }
  }

  _filterPatchFields (updateFields) {
    if (!this.patchAllowedFields) {
      // Error for developers only, can only occur if the patchAllowedFields configuration is incorrect
      const error = new Error(INVALID_PATCH_FIELDS.message)
      error.type = INVALID_PATCH_FIELDS.code
      throw error
    }
    return Object.keys(updateFields)
      .filter((key) => this.patchAllowedFields.includes(key))
      .reduce(
        (filteredObject, key) => ({
          ...filteredObject,
          [key]: updateFields[key]
        }),
        {}
      )
  }

  _getNotFoundError () {
    const errorMessage = this._notFoundErrorMessage()
    return this.standardError({
      type: this.logmsg.errors.notFoundError,
      message: errorMessage,
      errors: [
        {
          param: this.modelName,
          msg: errorMessage,
          location: this.modelName
        }
      ]
    })
  }

  _getValidationError (errors) {
    const errorMessage = this._validationErrorMessage()
    return this.standardError({
      type: this.logmsg.errors.validationError,
      message: errorMessage,
      errors: errors.map((error) => ({
        param: this.modelName,
        msg: error.message,
        location: error.path
      }))
    })
  }

  _getCapitalizedModelName () {
    return this.model.options.name.singular
  }

  _notFoundErrorMessage () {
    const modelMessages = this.logmsg.info[this.modelName] || {}
    const name = this._getCapitalizedModelName()
    return modelMessages.notFoundError || `${name} not found`
  }

  _validationErrorMessage () {
    const modelMessages = this.logmsg.info[this.modelName] || {}
    const name = this._getCapitalizedModelName()
    return modelMessages.validationError || `Invalid ${name} field data`
  }

  _getCacheDisabledError () {
    // Error for developers only, can only occur if the disableCache configuration is incorrect
    const error = new Error(CACHE_DISABLED.message)
    error.type = CACHE_DISABLED.code
    return error
  }
}

export default BaseRepository
