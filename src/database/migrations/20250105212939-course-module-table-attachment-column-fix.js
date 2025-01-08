'use strict';
const { tableNames } = require('..');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(tableNames.COURSE_MODULES, 'attachments', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      }, { transaction });
      await queryInterface.removeColumn(tableNames.COURSE_MODULES, 'attachements', { transaction });
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn(tableNames.COURSE_MODULES, 'attachments', { transaction });
      await queryInterface.addColumn(tableNames.COURSE_MODULES, 'attachements', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [],
      }, { transaction });
    });
  }
};
