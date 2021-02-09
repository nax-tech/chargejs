/**
 * A infra type module
 * @module infra
 */

class TransactionProvider {
  constructor ({ Transaction, database }) {
    this.Transaction = Transaction
    this.database = database
  }

  async useTransaction (action) {
    try {
      await this.transaction()
      const response = await action()
      await this.commit()
      return response
    } catch (error) {
      await this.rollback()
      throw error
    }
  }

  async transaction () {
    if (!this.current) {
      const transaction = new this.Transaction(this.database)
      this.current = await transaction.begin()
    }
    return this.current
  }

  async commit () {
    await this.current.commit()
    this.current = undefined
  }

  async rollback () {
    await this.current.rollback()
    this.current = undefined
  }

  addRedisRollback (rollbackFunction) {
    if (this.current) {
      this.current.redisOperations.push({
        rollback: rollbackFunction
      })
    }
  }

  getSequelizeTransaction () {
    if (this.current) {
      return this.current.sequelizeTransaction
    }
  }
}
export default TransactionProvider
