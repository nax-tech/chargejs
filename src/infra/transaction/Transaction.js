/**
 * A infra type module
 * @module infra
 */

class Transaction {
  constructor (database) {
    this.database = database
  }

  async begin () {
    this.sequelizeTransaction = await this.database.transaction()
    this.redisOperations = []
    return this
  }

  async commit () {
    await this.sequelizeTransaction.commit()
    this.redisOperations = []
  }

  async rollback () {
    await this.sequelizeTransaction.rollback()
    for (const operation of this.redisOperations.reverse()) {
      await operation.rollback()
    }
  }
}
export default Transaction
