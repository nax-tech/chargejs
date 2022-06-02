export const ALLOWED_ENVIRONMENTS = ['development', 'dev', 'stage', 'production', 'prod', 'test']
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
  USER: 'user',
  ISSUING_USER: 'issuingUser',
  EMAIL: 'email',
  PASSWORD: 'password',
  PHONE: 'phone',
  ADDRESS: 'address',
  PIN: 'pin',
  SUPPORT: 'support',
  TRANSACTIONS: 'transactions',
  CARDS: 'cards',
  DEVICE: 'device'
}

export const TYPES = {
  WELCOME: 'welcome',
  DEFAULT: 'default',
  UPDATED: 'updated',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  FAILED: 'failed',
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

export const NOTIFICATION_PUSH_TEXT = {
  DEVICE: {
    VERIFIED: {
      TITLE: 'Device verified',
      BODY: 'Your device has been successfully verified'
    }
  },
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
    },
    FAILED: {
      TITLE: 'New Payment Card Failed',
      BODY: 'Activating new payment card from {companyName} failed'
    }
  },
  PROFILE: {
    EMAIL: {
      UPDATED: {
        TITLE: 'Email Address Updated',
        BODY: 'Your email address has been successfully updated!'
      }
    },
    PASSWORD: {
      UPDATED: {
        TITLE: 'Password Changed',
        BODY: 'Your password has been successfully changed!'
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
        TITLE: 'Touch/Face ID Enabled',
        BODY: 'Touch/Face ID has successfully been enabled!'
      },
      DISABLED: {
        TITLE: 'Touch/Face ID Disabled',
        BODY: 'Touch/Face ID has successfully been disabled!'
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
  NOT_FOUND: 'NotFoundError',
  VALIDATION_ERROR: 'ValidationError',
  CONFLICT: 'ConflictError',
  UNAUTHORIZED: 'UnauthorizedError',
  UNCONFIRMED: 'UnconfirmedError',
  INVALID_PATCH_FIELDS: 'InvalidPatchAllowedFieldsError',
  REDIS_REPOSITORY_INITIALIZED: 'RedisRepositoryAlreadyInitializedError',
  CACHE_DISABLED: 'CacheDisabledError',
  INVALID_FILTER: 'InvalidFilterError',
  INVALID_FILTER_VALUE: 'InvalidFilterValueError',
  INVALID_FILTER_TYPE: 'InvalidFIlterTypeError',
  INVALID_PAGINATE_PARAMS: 'InvalidPaginateParamsError'
}

export const SEQUELIZE_ERRORS = {
  VALIDATION: 'SequelizeValidationError',
  NOT_FOUND: 'SequelizeEmptyResultError'
}
