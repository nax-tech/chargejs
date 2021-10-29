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
    // Check for cases when useTransaction is called inside useTransaction,
    // so only outer transaction wrapping should commit changes
    if (this.current) {
      return action()
    }
    try {
      await this._transaction()
      const response = await action()
      await this._commit()
      return response
    } catch (error) {
      await this._rollback()
      throw error
    }
  }

  async _transaction () {
    if (!this.current) {
      const transaction = new this.Transaction(this.database)
      this.current = await transaction.begin()
    }
    return this.current
  }

  async _commit () {
    await this.current.commit()
    this.current = undefined
  }

  async _rollback () {
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
