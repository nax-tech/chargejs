export const ALLOWED_ENVIRONMENTS = [
  'development',
  'dev',
  'stage',
  'production',
  'test'
]
export const ALLOWED_PACKAGES = [
  'api-gateway',
  'payments',
  'identity',
  'notifications',
  'profiles',
  'users',
  'payments-proxy'
]

export const CERTS = {
  PREFIX_CA: '/app/tls/ca-',
  PREFIX_CERT: '/app/tls/cert-',
  SUFFIX: '.crt.pem'
}

export const CODES = {
  INVALID_ENV: 'INVALID_ENV',
  INVALID_PACKAGE: 'INVALID_PACKAGE',
  INVALID_CONFIG: 'INVALID_CONFIG',
  INVALID_OUTPUT: 'INVALID_OUTPUT'
}
