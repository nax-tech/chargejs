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
  INVALID_OUTPUT: 'INVALID_OUTPUT',
  ECONNREFUSED: 'ECONNREFUSED'
}

export const SOURCE_TYPES = {
  EMAIL: 'email',
  PASSWORD: 'password',
  PHONE: 'phone',
  ADDRESS: 'address',
  PIN: 'pin',
  SUPPORT: 'support',
  TRANSACTIONS: 'transactions',
  CARDS: 'cards'
}

export const TYPES = {
  DEFAULT: 'default',
  UPDATED: 'updated',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  VERIFICATION: 'verification',
  VERIFIED: 'verified',
  NEW: 'newItem',
  ENABLED: 'enabled',
  DISABLED: 'disabled'
}

export const KIND = {
  PUSH: 'push',
  EMAIL: 'email',
  SMS: 'sms'
}

export const NOTIFICATION_PUSH_COPY = {
  PAYMENT: {
    NEW: {
      TITLE: 'New Payment',
      BODY: 'has sent you a new payment card. Tap to view and accept your payment.'
    },
    ACCEPTED: {
      TITLE: 'Payment Accepted',
      BODY: 'You have accepted a payment from'
    },
    DECLINED: {
      TITLE: 'Payment Declined',
      BODY: 'You have declined a payment from'
    }
  },
  PROFILE: {
    EMAIL: {
      UPDATED: {
        TITLE: 'Email Address Updated',
        BODY: 'Your email address has been successfully updated!'
      }
    },
    PHONE: {
      UPDATED: {
        TITLE: 'Phone Number Updated',
        BODY: 'Your phone number has been updated!'
      }
    },
    ADDRESS: {
      ADDED: {
        TITLE: 'New Address Added',
        BODY: 'Your address has been successfully added!'
      },
      UPDATED: {
        TITLE: 'Address Updated',
        BODY: 'Your address has been successfully updated!'
      },
      DEFAULT: {
        TITLE: 'Default Address Changed',
        BODY: 'Your default address has been successfully changed!'
      }
    },
    PIN: {
      ENABLED: {
        TITLE: 'Touch ID & PIN Enabled',
        BODY: 'Touch ID & PIN has successfully been enabled!'
      },
      DISABLED: {
        TITLE: 'Touch ID & PIN Disabled',
        BODY: 'Touch ID & PIN has successfully been disabled!'
      },
      UPDATED: {
        TITLE: 'PIN Code Updated',
        BODY: 'Your PIN code has been successfully updated!'
      }
    }
  }
}

export const EVENTS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  READ: 'read'
}

export const ERROR_TYPES = {
  INVALID_PATCH_FIELDS: 'InvalidPatchAllowedFields',
  CACHE_DISABLED: 'CacheDisabledError',
  INVALID_FILTER: 'InvalidFilterError'
}

export const SEQUELIZE_ERRORS = {
  VALIDATION: 'SequelizeValidationError',
  NOT_FOUND: 'SequelizeEmptyResultError'
}
