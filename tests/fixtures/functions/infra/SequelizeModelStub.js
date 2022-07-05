export default {
  tableName: 'ModelName',
  options: {
    name: {
      singular: 'ModelName'
    }
  },
  rawAttributes: {
    id: {
      allowNull: false,
      primaryKey: true,
      Model: {
        options: {
          name: {
            singular: 'ModelName'
          }
        }
      },
      fieldName: 'id',
      _modelAttribute: true,
      field: 'id'
    },
    otherId: {
      allowNull: false,
      Model: {
        options: {
          name: {
            singular: 'ModelName'
          }
        }
      },
      fieldName: 'otherId',
      references: { model: 'Other', key: 'id' },
      _modelAttribute: true,
      field: 'otherId'
    }
  },
  sequelize: {
    models: {
      ModelName: {
        tableName: 'ModelName',
        options: {
          name: {
            singular: 'ModelName'
          },
          indexes: [
            { unique: false },
            { unique: true, fields: ['a', 'b'] },
            { unique: true, fields: ['c', 'd'] }
          ]
        }
      },
      Other: {
        tableName: 'Other',
        options: {
          name: {
            singular: 'Other'
          },
          indexes: [
            { unique: false }
          ]
        }
      }
    }
  },
  findOne () {
    return true
  },
  findAll () {
    return true
  },
  findAndCountAll () {
    return true
  },
  create () {
    return true
  },
  update () {
    return true
  },
  destroy () {
    return true
  }
}
