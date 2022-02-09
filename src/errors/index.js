import {
  ALLOWED_ENVIRONMENTS,
  ALLOWED_PACKAGES,
  CODES,
  ERROR_TYPES,
  EVENTS,
  SEQUELIZE_ERRORS
} from '../constants'

export const INVALID_ENV = {
  message: `Invalid environment. Allowed values ${ALLOWED_ENVIRONMENTS}`,
  code: CODES.INVALID_ENV
}
export const INVALID_PACKAGE = {
  message: `Invalid package. Allowed values ${ALLOWED_PACKAGES}`,
  code: CODES.INVALID_PACKAGE
}
export const INVALID_REDIS = {
  message: 'Invalid config. Missing required key value REDISHOST and REDISPORT',
  code: CODES.INVALID_CONFIG
}
export const INVALID_OUTPUT = {
  code: CODES.INVALID_OUTPUT
}

export const REFUSED_REDIS = {
  message: 'Redis refused the connection',
  code: CODES.ECONNREFUSED
}

export const RETRY_REDIS = {
  message: 'Retry time exhausted',
  code: CODES.ECONNREFUSED
}

export const INVALID_FILTER_TYPE = {
  message: 'Filter parameter should be of type object',
  code: ERROR_TYPES.INVALID_FILTER_TYPE
}

export const EMPTY_UPDATE_FIELDS = {
  message: 'No fileds to update',
  code: ERROR_TYPES.EMPTY_UPDATE_FIELDS
}

export const INVALID_CURRENT_PAGE = {
  message: 'currentPage parameter should be a valid number',
  code: ERROR_TYPES.INVALID_PAGINATE_PARAMS
}

export const INVALID_PAGE_SIZE = {
  message: 'pageSize parameter should be a valid number',
  code: ERROR_TYPES.INVALID_PAGINATE_PARAMS
}

export const INVALID_PATCH_FIELDS = {
  message: 'patchAllowedFields was not configured in init function',
  code: ERROR_TYPES.INVALID_PATCH_FIELDS
}

export const REDIS_REPOSITORY_INITIALIZED = {
  message: 'RedisRepository already was initialized. Make sure that RedisRepository is not registered as Singleton or Scoped',
  code: ERROR_TYPES.REDIS_REPOSITORY_INITIALIZED
}

export const CACHE_DISABLED = {
  message: 'disableCache option was set to `true`, please provide provide disableCache: `false` option to use caching',
  code: ERROR_TYPES.CACHE_DISABLED
}

export const INVALID_FILTER = {
  message: 'Invalid filter. Disable cache usage or configure model indexes to support provided filter fields',
  code: ERROR_TYPES.INVALID_FILTER
}

export const INVALID_FILTER_VALUE = {
  message: 'Invalid filter field type. Valid types: string, number, boolean',
  code: ERROR_TYPES.INVALID_FILTER_VALUE
}

export const REDIS_READ_ERROR = {
  message: 'Redis read error',
  code: EVENTS.READ
}

export const REDIS_DELETE_ERROR = {
  message: 'Redis delete error',
  code: EVENTS.DELETE
}

export const REDIS_CREATE_ERROR = {
  message: 'Redis create error',
  code: EVENTS.CREATE
}

export const SEQUELIZE_NOT_FOUNT_ERROR = {
  message: 'Sequelize not found error',
  code: SEQUELIZE_ERRORS.NOT_FOUND
}

export const SEQUELIZE_VALIDATION_ERROR = {
  message: 'Sequelize validation error',
  code: SEQUELIZE_ERRORS.VALIDATION
}
