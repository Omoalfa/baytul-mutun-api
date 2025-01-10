'use strict';

const { tableNames } = require('..');

const SEEDER_NAME = '20250108-increment-module-order';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    try {
      // Start transaction
      const transaction = await queryInterface.sequelize.transaction();
      
      const [seedMeta] = await queryInterface.sequelize.query(
        'SELECT name FROM "SequelizeSeedMeta" WHERE name = ?',
        {
          replacements: [SEEDER_NAME],
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      );
  
      if (seedMeta) {
        console.log(`Seed ${SEEDER_NAME} has already been run. Skipping...`);
        await transaction.commit();
        return;
      }

      try {
        // Increment the order column by 1 for all existing modules
        await queryInterface.sequelize.query(`
          UPDATE ${tableNames.COURSE_MODULES} 
          SET "order" = "order" + 1 
          WHERE "order" >= 0;
        `, { transaction });

        // After all seeding is done, record this seed as completed
      await queryInterface.sequelize.query(
        'INSERT INTO "SequelizeSeedMeta" (name, "createdAt") VALUES (?, ?)',
        {
          replacements: [SEEDER_NAME, new Date()],
          type: queryInterface.sequelize.QueryTypes.INSERT,
          transaction
        }
      );

        await transaction.commit();
        console.log('Successfully incremented order column for all modules');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error incrementing module orders:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      // Start transaction
      const transaction = await queryInterface.sequelize.transaction();

      try {
        // Decrement the order column by 1 for all modules (except those that would become negative)
        await queryInterface.sequelize.query(`
          UPDATE ${tableNames.COURSE_MODULES} 
          SET "order" = "order" - 1 
          WHERE "order" > 0;
        `, { transaction });

        // Remove the seed record
      await queryInterface.sequelize.query(
        'DELETE FROM "SequelizeSeedMeta" WHERE name = ?',
        {
          replacements: [SEEDER_NAME],
          type: queryInterface.sequelize.QueryTypes.DELETE,
          transaction
        }
      );

        await transaction.commit();
        console.log('Successfully reverted order column increment for all modules');
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error reverting module order increment:', error);
      throw error;
    }
  }
};
