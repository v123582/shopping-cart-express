'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    amount: DataTypes.INTEGER,
    sn: DataTypes.INTEGER,
    payment_method: DataTypes.STRING,
    pay_at: DataTypes.DATE,
    params: DataTypes.TEXT,
    OrderId: DataTypes.INTEGER,
  }, {});
  Payment.associate = function(models) {
    // associations can be defined here
    Payment.belongsTo(models.Order)
  };
  return Payment;
};