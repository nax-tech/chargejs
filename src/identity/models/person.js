'use strict'

export default (sequelize, DataTypes) => {
  const Person = sequelize.define(
    'Person',
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4
      },
      object: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'person'
      },
      userId: {
        allowNull: false,
        type: DataTypes.UUID
      },
      externalId: {
        allowNull: true,
        type: DataTypes.STRING
      },
      profile: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: 'KYC_DATA'
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING
      },
      step: {
        allowNull: false,
        type: DataTypes.STRING
      },
      identifier: {
        allowNull: false,
        type: DataTypes.STRING
      },
      firstName: {
        allowNull: true,
        type: DataTypes.STRING
      },
      lastName: {
        allowNull: true,
        type: DataTypes.STRING
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING,
        validate: {
          isEmail: {
            msg: 'Invalid email format'
          }
        }
      },
      phoneNumber: {
        allowNull: true,
        type: DataTypes.STRING
      },
      addressA: {
        allowNull: true,
        type: DataTypes.STRING
      },
      addressB: {
        allowNull: true,
        type: DataTypes.STRING
      },
      city: {
        allowNull: true,
        type: DataTypes.STRING
      },
      state: {
        allowNull: true,
        type: DataTypes.STRING
      },
      zip: {
        allowNull: true,
        type: DataTypes.STRING
      },
      country: {
        allowNull: true,
        type: DataTypes.STRING
      },
      dob: {
        allowNull: true,
        type: DataTypes.STRING
      },
      taxId: {
        allowNull: true,
        type: DataTypes.STRING
      },
      meta: {
        allowNull: true,
        type: DataTypes.JSON
      }
    },
    {}
  )

  Person.associate = models => {
    Person.hasMany(models.Image, {
      sourceKey: 'id',
      foreignKey: 'personId',
      as: 'images'
    })
  }
  return Person
}
