'use strict';

const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('Payments', 
      Array.from({length: 20}).map((item, index) =>
      ({
        amount: faker.random.number(),
        sn: faker.random.number(),
        payment_method: Math.floor(Math.random() * 3)+1,
        paid_at: new Date(),
        params: null,
        OrderId: Math.floor(Math.random() * 3)+1,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ), {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
