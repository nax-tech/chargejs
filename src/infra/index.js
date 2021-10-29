import { asClass, asFunction, asValue } from 'awilix'
import { calculateLimitAndOffset, paginate } from 'paginate-info'
import { Transaction, TransactionProvider } from './transaction'
import { RedisRepository, RedisStorage, redis } from './redis'

export { Transaction, TransactionProvider }
export { RedisRepository, RedisStorage, redis }
export { default as BaseRepository } from './BaseRepository'
export { default as LoggerStreamAdapter } from './LoggerStreamAdapter'
export { default as ModelLoader } from './ModelLoader'

export function register (container, repositories) {
  container.register({
    calculateLimitAndOffset: asValue(calculateLimitAndOffset),
    paginate: asValue(paginate),
    redis: asFunction(redis).singleton(),
    redisStorage: asClass(RedisStorage).singleton(),
    redisRepository: asClass(RedisRepository),
    Transaction: asValue(Transaction),
    transactionProvider: asClass(TransactionProvider).scoped()
  })
  container.register(Object.fromEntries(
    Object.entries(repositories).map(([name, repository]) => [
      _lovercaseName(name),
      asClass(repository).scoped()
    ])
  ))
}

function _lovercaseName (name) {
  return name.charAt(0).toLowerCase() + name.slice(1)
}
