export default {
  async useTransaction (action) {
    return action()
  },
  async transaction () {
    return true
  },
  async commit () {
    return true
  },
  async rollback () {
    return true
  },
  addRedisRollback () {
    return true
  },
  getSequelizeTransaction () {
    return true
  }
}
