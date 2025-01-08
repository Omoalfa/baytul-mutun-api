'use strict';
const { tableNames, EQuestionType } = require('..');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Create Users Table
      await queryInterface.createTable(tableNames.USERS, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        firstName: {
          type: Sequelize.STRING,
          allowNull: true
        },
        lastName: {
          type: Sequelize.STRING,
          allowNull: true
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: true
        },
        roles: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: ['student'],
          allowNull: false
        },
        avatar: {
          type: Sequelize.STRING,
          allowNull: true
        },
        bio: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        avatarPublicId: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        provider: {
          type: Sequelize.ENUM('local', 'google', 'facebook'),
          enum: ['local', 'google', 'facebook'],
          defaultValue: 'local'
        },
        providerId: {
          type: Sequelize.STRING,
          allowNull: true
        },
        providerData: {
          type: Sequelize.JSONB,
          allowNull: true
        },
        verificationToken: {
          type: Sequelize.STRING,
          allowNull: true
        },
        resetPasswordToken: {
          type: Sequelize.STRING,
          allowNull: true
        },
        resetPasswordExpires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        studentId: {
          type: Sequelize.STRING,
          allowNull: true,
          unique: true
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

      // Create Courses Table
      await queryInterface.createTable(tableNames.COURSES, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        level: {
          type: Sequelize.ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
          defaultValue: 'BEGINNER',
          allowNull: false
        },
        duration: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        enrolledStudents: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        moduleCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        price: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        image: {
          type: Sequelize.STRING,
          allowNull: true
        },
        imagePublicId: {
          type: Sequelize.STRING,
          allowNull: true
        },
        isPublished: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('draft', 'ongoing', 'completed'),
          defaultValue: 'draft',
          allowNull: false
        },
        instructorId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.USERS,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'SET NULL',
          allowNull: true
        },
        prerequisites: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: [],
          allowNull: false
        },
        objectives: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          defaultValue: [],
          allowNull: false
        },
        rating: {
          type: Sequelize.FLOAT,
          defaultValue: 0,
          allowNull: false
        },
        reviewCount: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
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

      // Create Course Modules Table
      await queryInterface.createTable(tableNames.COURSE_MODULES, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        duration: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        videoUrl: {
          type: Sequelize.STRING,
          allowNull: true
        },
        attachements: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: true
        },
        courseId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.COURSES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
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

      // Create Quiz Questions Table
      await queryInterface.createTable(tableNames.QUIZ_QUESTIONS, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        question: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM,
          values: Object.values(EQuestionType),
          defaultValue: EQuestionType.SINGLE_CHOICE,
          allowNull: false
        },
        options: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: false,
          defaultValue: []
        },
        correctAnswers: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: false
        },
        point: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 1
        },
        explanation: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        moduleId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.COURSE_MODULES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
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

      // Create Enrolled Courses Table
      await queryInterface.createTable(tableNames.ENROLLED_COURSES, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        grade: {
          type: Sequelize.DECIMAL(10, 2),
          defaultValue: 0
        },
        progress: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          allowNull: false
        },
        studentId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.USERS,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
        },
        courseId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.COURSES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
        },
        currentModuleId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.COURSE_MODULES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }, { 
        indexes: [
          {
            unique: true,
            fields: ['studentId', 'courseId'],
            name: 'unique_student_course_enrollment'
          }
        ],
        transaction
      });

      // Create User Course Modules Table
      await queryInterface.createTable(tableNames.USER_COURSE_MODULES, {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true
        },
        attemptedQuestions: {
          type: Sequelize.ARRAY(Sequelize.JSONB),
          allowNull: true
        },
        totalScore: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        maxPossibleScore: {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 0
        },
        moduleGrade: {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0
        },
        status: {
          type: Sequelize.ENUM(['in_progress', 'completed']),
          allowNull: false,
          defaultValue: 'in_progress'
        },
        studentId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.USERS,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
        },
        moduleId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.COURSE_MODULES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
        },
        courseId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.ENROLLED_COURSES,
            key: 'id'
          },
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
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

      // Create Instructor Bios Table
      await queryInterface.createTable(tableNames.INSTRUCTOR_BIOS, {
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: tableNames.USERS,
            key: 'id'
          },
          primaryKey: true,
          onUpdate: 'RESTRICT',
          onDelete: 'RESTRICT',
          allowNull: false
        },
        summary: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        isVerified: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        bio: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        qualifications: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          defaultValue: []
        },
        education: {
          type: Sequelize.ARRAY(Sequelize.JSONB),
          defaultValue: []
        },
        experience: {
          type: Sequelize.ARRAY(Sequelize.JSONB),
          defaultValue: []
        },
        specializations: {
          type: Sequelize.ARRAY(Sequelize.TEXT),
          defaultValue: []
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

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables in reverse order to handle foreign key constraints
      await queryInterface.dropTable(tableNames.INSTRUCTOR_BIOS, { transaction });
      await queryInterface.dropTable(tableNames.USER_COURSE_MODULES, { transaction });
      await queryInterface.dropTable(tableNames.ENROLLED_COURSES, { transaction });
      await queryInterface.dropTable(tableNames.QUIZ_QUESTIONS, { transaction });
      await queryInterface.dropTable(tableNames.COURSE_MODULES, { transaction });
      await queryInterface.dropTable(tableNames.COURSES, { transaction });
      await queryInterface.dropTable(tableNames.USERS, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
