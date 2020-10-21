'use strict'

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define(
    'Image',
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
        defaultValue: 'image'
      },
      type: {
        allowNull: false,
        type: DataTypes.STRING
      },
      personId: {
        allowNull: false,
        type: DataTypes.UUID
      },
      metadata: {
        allowNull: false,
        type: DataTypes.JSON
      },
      path: {
        allowNull: false,
        type: DataTypes.STRING
      }
    },
    {}
  )
  Image.associate = models => {
    Image.belongsTo(models.Person, {
      foreignKey: 'personId',
      as: 'images'
    })
  }
  return Image
}
