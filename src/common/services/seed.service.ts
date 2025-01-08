import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole, AuthProvider } from 'src/modules/users/models/user.model';
import { InstructorBio } from 'src/modules/instructors/models/InstructorBio.model';
import { Course, CourseLevel } from 'src/modules/courses/models/course.model';
import { CourseModule } from '../../modules/courses/models/course-module.model';
import { EQuestionType, QuizQuestion } from '../../modules/courses/models/quiz-question.model';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(InstructorBio)
    private readonly instructorBioModel: typeof InstructorBio,
    @InjectModel(Course)
    private readonly courseModel: typeof Course,
    @InjectModel(CourseModule)
    private readonly moduleModel: typeof CourseModule,
    @InjectModel(QuizQuestion)
    private readonly questionModel: typeof QuizQuestion,
    private sequelize: Sequelize,
  ) {}

  async seedDatabase() {
    const t = await this.sequelize.transaction();

    try {
      // Create students
      const students = await Promise.all([
        this.userModel.create({
          firstName: 'Abdullah',
          lastName: 'Rahman',
          email: 'abdullah@example.com',
          password: 'password123',
          roles: [UserRole.STUDENT],
          provider: AuthProvider.LOCAL,
          isVerified: true,
        }, { transaction: t }),
        this.userModel.create({
          firstName: 'Fatima',
          lastName: 'Ahmed',
          email: 'fatima@example.com',
          password: 'password123',
          roles: [UserRole.STUDENT],
          provider: AuthProvider.LOCAL,
          isVerified: true,
        }, { transaction: t }),
        this.userModel.create({
          firstName: 'Yusuf',
          lastName: 'Ibrahim',
          email: 'yusuf@example.com',
          password: 'password123',
          roles: [UserRole.STUDENT],
          provider: AuthProvider.LOCAL,
          isVerified: true,
        }, { transaction: t }),
      ]);

      // Create instructors with their bios
      const instructors = await Promise.all([
        this.userModel.create({
          firstName: 'Sheikh',
          lastName: 'Muhammad',
          email: 'muhammad@example.com',
          password: 'password123',
          roles: [UserRole.INSTRUCTOR],
          provider: AuthProvider.LOCAL,
          isVerified: true,
        }, { transaction: t }).then(async (instructor) => {
          await this.instructorBioModel.create({
            userId: instructor.id,
            isVerified: true,
            summary: 'Expert in Arabic Grammar and Islamic Studies with over 15 years of teaching experience.',
            qualifications: ['PhD in Islamic Studies', 'Ijazah in Quranic Sciences'],
            education: [{
              institution: 'Al-Azhar University',
              degree: 'PhD',
              field_of_study: 'Islamic Studies',
              start_year: 2005,
              end_year: 2010,
              current: false,
            }],
            experience: [{
              organization: 'Islamic Institute of Education',
              title: 'Senior Instructor',
              start_year: 2010,
              end_year: 2025,
              current: true,
            }],
          }, { transaction: t });
          return instructor;
        }),
        this.userModel.create({
          firstName: 'Sheikh',
          lastName: 'Ahmad',
          email: 'ahmad@example.com',
          password: 'password123',
          roles: [UserRole.INSTRUCTOR],
          provider: AuthProvider.LOCAL,
          isVerified: true,
        }, { transaction: t }).then(async (instructor) => {
          await this.instructorBioModel.create({
            userId: instructor.id,
            isVerified: true,
            summary: 'Specialist in Hadith Sciences and Islamic Jurisprudence with extensive teaching experience.',
            qualifications: ['Masters in Hadith Sciences', 'Ijazah in Fiqh'],
            education: [{
              institution: 'Islamic University of Madinah',
              degree: 'Masters',
              field_of_study: 'Hadith Sciences',
              start_year: 2008,
              end_year: 2012,
              current: false,
            }],
            experience: [{
              organization: 'Center for Islamic Learning',
              title: 'Lead Instructor',
              start_year: 2012,
              end_year: 2025,
              current: true,
            }],
          }, { transaction: t });
          return instructor;
        }),
      ]);

      // Create an admin user
      await this.userModel.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        roles: [UserRole.ADMIN],
        provider: AuthProvider.LOCAL,
        isVerified: true,
      }, { transaction: t });

      const moduleCounts = [7, 8]

      // Create courses for each instructor
      for (const instructor of instructors) {
        const courses = await Promise.all([
          this.courseModel.create({
            title: `Arabic Grammar ${instructor.lastName === 'Muhammad' ? 'Fundamentals' : 'Advanced'}`,
            description: `A comprehensive course on ${instructor.lastName === 'Muhammad' ? 'basic' : 'advanced'} Arabic grammar.`,
            level: instructor.lastName === 'Muhammad' ? CourseLevel.BEGINNER : CourseLevel.ADVANCED,
            price: 500000,
            duration: 8,
            moduleCount: moduleCounts[0],
            objectives: [
              'Understand basic grammatical structures',
              'Master essential vocabulary',
              'Read and comprehend classical texts',
            ],
            requirements: [
              'Basic understanding of Arabic alphabet',
              'Dedication to daily practice',
            ],
            instructorId: instructor.id,
            isPublished: true,
          }, { transaction: t }),
          this.courseModel.create({
            title: `Islamic Studies ${instructor.lastName === 'Muhammad' ? '101' : 'Advanced Topics'}`,
            description: `An in-depth exploration of ${instructor.lastName === 'Muhammad' ? 'fundamental' : 'advanced'} Islamic concepts.`,
            level: instructor.lastName === 'Muhammad' ? CourseLevel.BEGINNER : CourseLevel.ADVANCED,
            price: 700000,
            duration: 8,
            moduleCount: moduleCounts[1],
            objectives: [
              'Understand core Islamic principles',
              'Learn about Islamic history',
              'Study important Islamic texts',
            ],
            requirements: [
              'Basic knowledge of Islam',
              'Commitment to learning',
            ],
            instructorId: instructor.id,
            isPublished: true,
          }, { transaction: t }),
        ]);

        // Create modules and questions for each course
        for (const course of courses) {
          const moduleCount = course.moduleCount; // 5-8 modules
          for (let i = 0; i < moduleCount; i++) {
            const module = await this.moduleModel.create({
              title: `Module ${i + 1}: ${course.title.includes('Grammar') ? 
                `Grammar Concept ${i + 1}` : 
                `Islamic Studies Topic ${i + 1}`}`,
              description: `Detailed exploration of ${course.title.includes('Grammar') ? 
                `essential grammar concept ${i + 1}` : 
                `important Islamic topic ${i + 1}`}`,
              content: `Detailed content for module ${i + 1}...`,
              order: i,
              duration: 60, // 1 hour
              isPublished: true,
              courseId: course.id,
            }, { transaction: t });

            // Create 10 questions for each module using bulkCreate
            const questions = Array.from({ length: 10 }, (_, j) => {
              const questionTypes = [EQuestionType.MULTIPLE_CHOICE, EQuestionType.SINGLE_CHOICE, EQuestionType.TRUE_FALSE, EQuestionType.SHORT_ANSWER];
              const type = questionTypes[Math.floor(Math.random() * questionTypes.length)] as EQuestionType;
              const options = type === EQuestionType.TRUE_FALSE ? ['True', 'False'] : type === EQuestionType.SHORT_ANSWER ? [] : [
                'Option A - Some text here',
                'Option B - Another option',
                'Option C - Third choice',
                'Option D - Final option',
                'Option E - Extra option',
              ]
              const correctAnswers = 
                type === EQuestionType.TRUE_FALSE ? ['True', 'False'][Math.floor(Math.random() * 2)] : 
                type === EQuestionType.SHORT_ANSWER ? ['Correct Answer'] : 
                type === EQuestionType.SINGLE_CHOICE ? [options[Math.floor(Math.random() * options.length)]] : 
                Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => options[Math.floor(Math.random() * options.length)]);
              return ({
                question: `Question ${j + 1} for ${module.title}`,
                type,
                options,
                correctAnswers,
                point: 1,
                explanation: `Explanation for question ${j + 1}...`,
                moduleId: module.id,
              })
            });

            await this.questionModel.bulkCreate(questions, { transaction: t });
          }
        }
      }

      await t.commit();
      return { message: 'Database seeded successfully!' };
    } catch (error) {
      await t.rollback();
      throw error;
    }
  }
}
