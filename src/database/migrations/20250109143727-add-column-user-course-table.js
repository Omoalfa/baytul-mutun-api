'use strict';
const { tableNames } = require('..');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      // Create course_final_exams table
      await queryInterface.createTable('course_final_exams', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        enrolledCourseId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: tableNames.ENROLLED_COURSES,
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        examQuestions: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },
        attemptedQuestions: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: []
        },
        score: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        grade: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0
        },
        submittedAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        timeSpentInSeconds: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { transaction });

      // Add completedModulesCount to enrolled_courses
      await queryInterface.addColumn(tableNames.ENROLLED_COURSES, 'completedModulesCount', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }, { transaction });

      await queryInterface.addColumn(tableNames.ENROLLED_COURSES, 'finalGrade', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      }, { transaction });

      // Add courseId to quiz_questions
      await queryInterface.addColumn(tableNames.QUIZ_QUESTIONS, 'courseId', {
        type: Sequelize.INTEGER,
        allowNull: true, // temporarily allow null
        references: {
          model: tableNames.COURSES,
          key: 'id'
        },
        onDelete: 'CASCADE'
      }, { transaction });

      // Update existing quiz questions with courseId from their modules
      await queryInterface.sequelize.query(`
        UPDATE ${tableNames.QUIZ_QUESTIONS} qq
        SET "courseId" = cm."courseId"
        FROM ${tableNames.COURSE_MODULES} cm
        WHERE qq."moduleId" = cm.id;
      `, { transaction });

      // Make courseId not nullable after update
      await queryInterface.changeColumn(tableNames.QUIZ_QUESTIONS, 'courseId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: tableNames.COURSES,
          key: 'id'
        },
        onDelete: 'CASCADE'
      }, { transaction });
    });
  },

  async down(queryInterface, Sequelize) {
    return await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('course_final_exams', { transaction });
      await queryInterface.removeColumn(tableNames.ENROLLED_COURSES, 'completedModulesCount', { transaction });
      await queryInterface.removeColumn(tableNames.ENROLLED_COURSES, 'finalGrade', { transaction });
      await queryInterface.removeColumn(tableNames.QUIZ_QUESTIONS, 'courseId', { transaction });
    });
  }
};
