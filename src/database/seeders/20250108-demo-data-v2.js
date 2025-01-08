'use strict';

const bcrypt = require('bcrypt');
const { UserRole, AuthProvider, CourseLevel, EQuestionType, tableNames } = require('..');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if this seed has already been run
      const seedName = '20250108-demo-data-v2';
      const [seedMeta] = await queryInterface.sequelize.query(
        'SELECT name FROM "SequelizeSeedMeta" WHERE name = ?',
        {
          replacements: [seedName],
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (seedMeta) {
        console.log(`Seed ${seedName} has already been run. Skipping...`);
        await transaction.commit();
        return;
      }

      // Create students
      const students = await queryInterface.bulkInsert(tableNames.USERS, [
        {
          firstName: 'Abdullah',
          lastName: 'Adam',
          email: 'abdullah2@example.com',
          password: await bcrypt.hash('password123', 10),
          roles: `{${UserRole.STUDENT}}`,
          provider: AuthProvider.LOCAL,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'Aisha',
          lastName: 'Ahmed',
          email: 'aisha@example.com',
          password: await bcrypt.hash('password123', 10),
          roles: `{${UserRole.STUDENT}}`,
          provider: AuthProvider.LOCAL,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'Yusuf',
          lastName: "Mua'dh",
          email: 'yusuf.m@example.com',
          password: await bcrypt.hash('password123', 10),
          roles: `{${UserRole.STUDENT}}`,
          provider: AuthProvider.LOCAL,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction, returning: true });

      // Create instructors
      const instructors = await queryInterface.bulkInsert(tableNames.USERS, [
        {
          firstName: 'Sheikha',
          lastName: 'Muhammad',
          email: 'muhammad.sheikha@example.com',
          password: await bcrypt.hash('password123', 10),
          roles: `{${UserRole.INSTRUCTOR}}`,
          provider: AuthProvider.LOCAL,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          firstName: 'a',
          lastName: 'Ahmad',
          email: 'ahmad.sheikha@example.com',
          password: await bcrypt.hash('password123', 10),
          roles: `{${UserRole.INSTRUCTOR}}`,
          provider: AuthProvider.LOCAL,
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction, returning: true });

      // Create instructor bios using raw query
      await queryInterface.sequelize.query(`
        INSERT INTO ${tableNames.INSTRUCTOR_BIOS} 
        (
          "userId", 
          "isVerified", 
          summary, 
          qualifications, 
          "createdAt", 
          "updatedAt"
        )
        VALUES
        (
          :userId1,
          true,
          :summary1,
          ARRAY[:qualifications1],
          :createdAt,
          :updatedAt
        ),
        (
          :userId2,
          true,
          :summary2,
          ARRAY[:qualifications2],
          :createdAt,
          :updatedAt
        )
      `, {
        replacements: {
          userId1: instructors[0].id,
          summary1: 'Expert in Arabic Grammar and Islamic Studies with over 15 years of teaching experience.',
          qualifications1: ['PhD in Islamic Studies', 'Ijazah in Quranic Sciences'],
          userId2: instructors[1].id,
          summary2: "Specialist in Hadith Sciences and Islamic Jurisprudence with extensive teaching experience.",
          qualifications2: ['Masters in Hadith Sciences', 'Ijazah in Fiqh'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        type: queryInterface.sequelize.QueryTypes.INSERT,
        transaction
      });

      const moduleCounts = [7, 8];

      // Create courses for each instructor
      for (const instructor of instructors) {
        const courses = await queryInterface.bulkInsert(tableNames.COURSES, [
          {
            title: `Arabic Syntax ${instructor.lastName === 'Muhammad' ? 'Fundamentals' : 'Advanced'}`,
            description: `A comprehensive course on ${instructor.lastName === 'Muhammad' ? 'basic' : 'advanced'} Arabic syntax.`,
            level: instructor.lastName === 'Muhammad' ? CourseLevel.BEGINNER : CourseLevel.ADVANCED,
            price: 500000,
            duration: 8,
            moduleCount: moduleCounts[0],
            objectives: `{${[
              'Understand basic grammatical structures',
              'Master essential vocabulary',
              'Read and comprehend classical texts',
            ].map(obj => `"${obj}"`).join(',')}}`,
            prerequisites: `{${[
              'Basic understanding of Arabic alphabet',
              'Dedication to daily practice',
            ].map(req => `"${req}"`).join(',')}}`,
            instructorId: instructor.id,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            title: `Islamic Studies ${instructor.lastName === 'Muhammad' ? '102' : 'Advanced Topics'}`,
            description: `An in-depth exploration of ${instructor.lastName === 'Muhammad' ? 'fundamental' : 'advanced'} Islamic concepts.`,
            level: instructor.lastName === 'Muhammad' ? CourseLevel.BEGINNER : CourseLevel.ADVANCED,
            price: 700000,
            duration: 8,
            moduleCount: moduleCounts[1],
            objectives: `{${[
              'Understand core Islamic principles',
              'Learn about Islamic history',
              'Study important Islamic texts',
            ].map(obj => `"${obj}"`).join(',')}}`,
            prerequisites: `{${[
              'Basic knowledge of Islam',
              'Commitment to learning',
            ].map(req => `"${req}"`).join(',')}}`,
            instructorId: instructor.id,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ], { transaction, returning: true });

        // Create modules and questions for each course
        for (const course of courses) {
          const moduleCount = course.moduleCount;
          for (let i = 0; i < moduleCount; i++) {
            const module = await queryInterface.bulkInsert(tableNames.COURSE_MODULES, [{
              title: `Module ${i + 1}: ${course.title.includes('Grammar') ? 
                `Grammar Concept ${i + 1}` : 
                `Islamic Studies Topic ${i + 1}`}`,
              description: `Detailed exploration of ${course.title.includes('Grammar') ? 
                `essential grammar concept ${i + 1}` : 
                `important Islamic topic ${i + 1}`}`,
              content: `Detailed content for module ${i + 1}...`,
              order: i,
              duration: 60,
              courseId: course.id,
              createdAt: new Date(),
              updatedAt: new Date()
            }], { transaction, returning: true });

            // Create questions for each module
            const questions = Array.from({ length: 10 }, (_, j) => {
              const questionTypes = [EQuestionType.MULTIPLE_CHOICE, EQuestionType.SINGLE_CHOICE, EQuestionType.TRUE_FALSE, EQuestionType.SHORT_ANSWER];
              const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
              const options = type === EQuestionType.TRUE_FALSE ? ['True', 'False'] : 
                            type === EQuestionType.SHORT_ANSWER ? [] : [
                              'Option A - Some text here',
                              'Option B - Another option',
                              'Option C - Third choice',
                              'Option D - Final option',
                              'Option E - Extra option',
                            ];
              const correctAnswers = 
                type === EQuestionType.TRUE_FALSE ? [['True', 'False'][Math.floor(Math.random() * 2)]] : 
                type === EQuestionType.SHORT_ANSWER ? ['Correct Answer'] : 
                type === EQuestionType.SINGLE_CHOICE ? [options[Math.floor(Math.random() * options.length)]] : 
                Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => options[Math.floor(Math.random() * options.length)]);

              return {
                question: `Question ${j + 1} for ${module[0].title}`,
                type,
                options: `{${options.map(opt => `"${opt}"`).join(',')}}`,
                correctAnswers: `{${correctAnswers.map(ans => `"${ans}"`).join(',')}}`,
                point: 1,
                explanation: `Explanation for question ${j + 1}...`,
                moduleId: module[0].id,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            });

            await queryInterface.bulkInsert(tableNames.QUIZ_QUESTIONS, questions, { transaction });
          }
        }
      }

      // After all seeding is done, record this seed as completed
      await queryInterface.sequelize.query(
        'INSERT INTO "SequelizeSeedMeta" (name, "createdAt") VALUES (?, ?)',
        {
          replacements: [seedName, new Date()],
          type: queryInterface.sequelize.QueryTypes.INSERT,
          transaction
        }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Remove the seed record
      await queryInterface.sequelize.query(
        'DELETE FROM "SequelizeSeedMeta" WHERE name = ?',
        {
          replacements: ['20250108-demo-data-v2'],
          type: queryInterface.sequelize.QueryTypes.DELETE,
          transaction
        }
      );

      // Delete all seeded data in reverse order
      await queryInterface.bulkDelete(tableNames.QUIZ_QUESTIONS, null, { transaction });
      await queryInterface.bulkDelete(tableNames.COURSE_MODULES, null, { transaction });
      await queryInterface.bulkDelete(tableNames.COURSES, null, { transaction });
      await queryInterface.bulkDelete(tableNames.INSTRUCTOR_BIOS, null, { transaction });
      await queryInterface.bulkDelete(tableNames.USERS, null, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
