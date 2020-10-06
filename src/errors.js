import { ALLOWED_ENVIRONMENTS, ALLOWED_PACKAGES, CODES } from './constants'
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
