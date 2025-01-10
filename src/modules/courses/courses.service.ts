import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import { UploadService } from "../../common/services/upload.service";
import { CreateCourseDto, CreateCourseModuleDto, CreateQuizQuestionDto, QuizAnswerDto } from "./dto";
import { Op } from "sequelize";
import { CourseModule } from "./models/course-module.model";
import { EQuestionType, QuizQuestion } from "./models/quiz-question.model";
import { PaginatedResponse, PaginationDto } from "src/common/dto/pagination.dto";
import { InstructorBio } from "../instructors/models/InstructorBio.model";
import { EnrolledCourses } from "./models/enrolled-courses.model";
import { ConflictException } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import { EStudentModuleStatus, UserCourseModule } from "./models/user-course-module.model";
import { Course, ECourseStatus } from "./models/course.model";
import { User } from "../users/models/user.model";
import { CourseFinalExam } from "./models/course-final-exam.model";

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course) private readonly courseModel: typeof Course,
        private uploadService: UploadService,
        @InjectModel(QuizQuestion) private readonly quizQuestionModel: typeof QuizQuestion,
        @InjectModel(UserCourseModule) private readonly userCourseModuleModel: typeof UserCourseModule,
        @InjectModel(CourseModule) private readonly courseModuleModel: typeof CourseModule,
        @InjectModel(InstructorBio) private readonly instructorBioModel: typeof InstructorBio,
        @InjectModel(EnrolledCourses) private readonly enrolledCoursesModel: typeof EnrolledCourses,
        @InjectModel(CourseFinalExam) private readonly courseFinalExamModel: typeof CourseFinalExam,
        @InjectConnection() private readonly sequelize: Sequelize, 
    ) {}

    async createCourse(user: User, createCourseDto: CreateCourseDto, avatar?: Express.Multer.File): Promise<Course> {
        const t = await this.sequelize.transaction();
        
        try {
            // Parse string arrays back to actual arrays
            if (typeof createCourseDto.requirements === 'string') {
                createCourseDto.requirements = JSON.parse(createCourseDto.requirements);
            }
            if (typeof createCourseDto.objectives === 'string') {
                createCourseDto.objectives = JSON.parse(createCourseDto.objectives);
            }

            const bio = await this.instructorBioModel.findOne({ 
                where: { userId: user.id },
                transaction: t 
            });

            if (!bio.isVerified) {
                createCourseDto.isPublished = false;
                createCourseDto.status = ECourseStatus.DRAFT;
            } else {
                if (createCourseDto.isPublished) {
                    createCourseDto.status = ECourseStatus.ONGOING;
                } else {
                    createCourseDto.status = ECourseStatus.DRAFT;
                }
            }

            // Upload avatar if provided
            if (avatar) {
                createCourseDto.image = await this.uploadService.uploadFile(avatar);
            }
            
            const course = await this.courseModel.create({ 
                ...createCourseDto, 
                instructorId: user.id 
            }, { transaction: t });

            await t.commit();
            return course;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
    
    async findAllCourses({ page = 1, limit = 10, search }: PaginationDto): Promise<PaginatedResponse<Course>> {
        const offset = (page - 1) * limit;
        const where: any = { isPublished: true };
        if (search) {
            where.title = {
                [Op.iLike]: `%${search}%`
            }
        }

        const { rows, count } = await this.courseModel.findAndCountAll({
            where,
            offset,
            limit,
            include: [{
                as: 'instructor',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }],
            order: [
                ['createdAt', 'DESC']
            ]
        });

        return {
            total: count,
            data: rows,
            page: page,
            totalPages: Math.ceil(count/limit),
            limit: limit
        }  
    }

    async findInstructorCourses (param: PaginationDto, instructorId: number): Promise<PaginatedResponse<Course>> {
        const offset = (param.page - 1) * param.limit;
        const { rows: courses, count } = await this.courseModel.findAndCountAll({
            where: { instructorId },
            offset,
            limit: param.limit,
            order: [
                ['updatedAt', 'DESC']
            ]
        });

        return {
            total: count,
            data: courses,
            page: param.page,
            totalPages: Math.ceil(count/param.limit),
            limit: param.limit
        }   
    }
    
    async findCourseById(id: number): Promise<Course> {
        return await this.courseModel.findByPk(id, {
            attributes: ['id', 'title', 'description', 'moduleCount', 'duration', 'enrolledStudents', 'image', 'price', 'createdAt', 'prerequisites', 'objectives', 'status'],
            include: [{
                as: 'instructor',
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'email', 'avatar']
            }]
        });
    }   

    async findModulesByCourseId(id: number): Promise<CourseModule[]> {
        return await this.courseModuleModel.findAll({ 
            where: { courseId: id }, 
            order: [['order', 'ASC']],
            attributes: ['id', 'title', 'description', 'order']
        });
    }
    
    async addModulesToCourse(courseId: number, createModuleDto: CreateCourseModuleDto, video: Express.Multer.File, audio: Express.Multer.File): Promise<CourseModule> {
        const t = await this.sequelize.transaction();
        
        try {
            const course = await this.courseModel.findByPk(courseId, { transaction: t });
            const { questions } = createModuleDto;

            delete createModuleDto.questions;
            
            if (video) {
                createModuleDto.videoUrl = await this.uploadService.uploadFile(video);
            }
            if (audio) {
                createModuleDto.audioUrl = await this.uploadService.uploadFile(audio);
            }
            
            const module = await course.$create<CourseModule>('modules', createModuleDto, { transaction: t });
            await this.courseModel.increment('modulesCount', { by: 1, where: { id: course.id }, transaction: t });

            if (questions.length) {
                await Promise.all(questions.map(quizQuestion => 
                    this.quizQuestionModel.create({
                        ...quizQuestion,
                        moduleId: module.id
                    }, { transaction: t })
                ));
            }

            await t.commit();
            return module;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    async addQuizQuestionToModule(moduleId: number, createQuizQuestionDto: CreateQuizQuestionDto): Promise<QuizQuestion> {
        const module = await this.courseModel.findByPk(moduleId);
        return await module.$create<QuizQuestion>('quizQuestions', createQuizQuestionDto);
    }

    async addBulkQuizQuestionsToModule(moduleId: number, createQuizQuestionsDto: CreateQuizQuestionDto[]): Promise<QuizQuestion[]> {
        return await this.quizQuestionModel.bulkCreate(createQuizQuestionsDto.map(quizQuestion => ({
            ...quizQuestion,
            moduleId
        })));
    }

    async findCourseByTitleAndInstructor(title: string, instructorId: number): Promise<Course | null> {
        const course = await this.courseModel.findOne({
            where: {
                title: {
                    [Op.iLike]: title
                },
                instructorId
            }
        });
        return course;
    }

    async findCourseByIdAndUserId(courseId: number, userId: number): Promise<Course | null> {
        return await this.courseModel.findOne({ where: { id: courseId, instructorId: userId } });
    }

    async findModuleByCourseIdAndId(id: number, courseId: number): Promise<CourseModule | null> {
        return await this.courseModuleModel.findOne({ where: { id, courseId } });
    }

    async enrollStudentToCourse (user: User, courseId: number): Promise<EnrolledCourses> {
        const t = await this.sequelize.transaction();
        
        try {
            const module = await this.courseModuleModel.findOne({ where: { courseId, order: 1 } });
            const userCourse = await this.enrolledCoursesModel.create(
                { courseId, studentId: user.id, currentModuleId: module.id },
                { transaction: t }
            );

            await this.courseModel.increment('enrolledStudents', { by: 1, where: { id: courseId }, transaction: t });
            
            await t.commit();
            return userCourse;
        } catch (error) {
            await t.rollback();
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictException('You are already enrolled in this course');
            }
            throw error;
        }
    }

    async findEnrolledCoursesByUserIdAndCourseId(userId: number , courseId: number): Promise<EnrolledCourses | null> {
        return await this.enrolledCoursesModel.findOne({ where: { studentId: userId, courseId } });
    }

    async findEnrolledCoursesByStudentId(studentId: number, options: PaginationDto): Promise<PaginatedResponse<EnrolledCourses>> {
        const { rows: courses, count: total } = await this.enrolledCoursesModel.findAndCountAll({ 
            where: { 
                studentId
            }, 
            include: [{ 
                model: Course, 
                where: options.search ? {
                    title: { [Op.iLike]: `%${options.search}%` }
                } : undefined,
                attributes: ['id', 'title', 'description', 'image', 'price', 'createdAt'],
            }], 
            attributes: ["id", "studentId", "courseId", "grade", "progress", "currentModuleId"],
            limit: options.limit,
            offset: (options.page - 1) * options.limit
        });

        return {
            page: options.page,
            total,
            data: courses,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit)
        };
    }

    async findEnrolledStudentsByCourseId(courseId: number, options: PaginationDto): Promise<PaginatedResponse<EnrolledCourses>> {
        const { rows: users, count: total } = await this.enrolledCoursesModel.findAndCountAll({ 
            where: { courseId },
            attributes: ["progress", "grade", "id"],
            include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }],
            limit: options.limit,
            offset: (options.page - 1) * options.limit
        });

        return {
            page: options.page,
            total,
            data: users,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit)
        }
    }

    async isMyCourse (id: number, userId: number): Promise<boolean> { 
        const course = await this.enrolledCoursesModel.findOne({ where: { id, studentId: userId } });
        
        return !!course;
    }

    async findMyCourseById (courseId: number, userId: number): Promise<EnrolledCourses> {
        return await this.enrolledCoursesModel.findOne({ 
            where: { courseId, studentId: userId },
            attributes: ["progress", "grade", "id"],
            include: [
                { 
                    model: Course, 
                    attributes: ['id', 'title', 'description', 'image'],
                    include: [
                        { model: CourseModule, attributes: ['id', 'title', 'description', 'order'] },
                        { model: User, attributes: ['id', 'firstName', 'lastName', 'email', 'avatar'] }
                    ]
                },
                {
                    model: UserCourseModule,
                    attributes: ['id', 'moduleId', 'studentId', 'moduleGrade', 'status', 'totalScore', 'maxPossibleScore'],
                }
            ]
        });
    }

    async fetchMyModuleDetails (user: User, moduleId: number, courseId?: number): Promise<UserCourseModule> {
        const userCourse = await this.enrolledCoursesModel.findOne({ where: { studentId: user.id, courseId } });
        
        const [module, created] = await this.userCourseModuleModel.findOrCreate({ 
            where: { moduleId, studentId: user.id },
            defaults: {
                moduleId, studentId: user.id, courseId: userCourse.id
            },
            include: [
                {
                    model: CourseModule,
                    attributes: ['id', 'order', 'title', 'audioUrl', 'videoUrl', 'attachments', 'description']
                }
            ] 
        });

        return module
    }

    async getRandomQuestionsForUserModule (user: User, courseId: number, moduleId: number): Promise<QuizQuestion[]> {
        const t = await this.sequelize.transaction();
        
        try {
            const quizQuestions = await this.quizQuestionModel.findAll({ 
                where: { moduleId },
                order: this.sequelize.random(),
                limit: 5,
                transaction: t 
            });

            await this.userCourseModuleModel.update(
                {
                    attemptedQuestions: quizQuestions.map(question => ({
                        questionId: question.id,
                        userAnswer: null,
                        isCorrect: null,
                        attemptedAt: new Date()
                    }))
                },
                {
                    where: { moduleId, studentId: user.id },
                    transaction: t
                }
            );

            await t.commit();
            return  quizQuestions.map(question => {
                    return {
                        ...question.dataValues,
                        correctAnswers: [],
                        explanation: ''
                    } as QuizQuestion;
                });
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    isAnswerCorrect = (question: QuizQuestion, userAnswer: string[]): boolean => {
        switch (question.type) {
            case EQuestionType.MULTIPLE_CHOICE:
                return question.correctAnswers.every(answer => userAnswer.includes(answer)) && userAnswer.length === question.correctAnswers.length;
            case EQuestionType.TRUE_FALSE || EQuestionType.SHORT_ANSWER || EQuestionType.SINGLE_CHOICE:
                return question.correctAnswers[0] === userAnswer[0] && userAnswer.length === 1;
            default:
                return true;
        }
    }

    async submitQuiz (user: User, courseId: number, moduleId: number, data: QuizAnswerDto[]): Promise<UserCourseModule> {    
        const t = await this.sequelize.transaction();

        try {
            let totalScore = 0;
            let maxPossibleScore = data.length;
            const userAnswers = await Promise.all(data.map(async (userAnswer) => {
                const question = await this.quizQuestionModel.findByPk(userAnswer.questionId, { transaction: t });
                const isCorrect = this.isAnswerCorrect(question, userAnswer.answers);
                if (isCorrect) {
                    totalScore++;
                }
                return {
                    questionId: question.id,
                    userAnswer: userAnswer.answers,
                    isCorrect,
                    attemptedAt: new Date()
                };
            }));



            const module = await this.userCourseModuleModel.update({
                attemptedQuestions: userAnswers,
                maxPossibleScore,
                totalScore,
                status: EStudentModuleStatus.COMPLETED
            }, {
                where: {
                    moduleId,
                    studentId: user.id
                },
                returning: true,
                transaction: t
            });

            const course = await this.enrolledCoursesModel.findOne({ 
                where: { studentId: user.id, courseId },
                attributes: ["progress", "grade", "id", "currentModuleId"],
                include: [
                    { 
                        model: Course, 
                        attributes: ['id', 'title', 'moduleCount'] 
                    },
                    {
                        model: CourseModule,
                        attributes: ['id', 'order'],
                    }
                ],
                transaction: t
            });
            const courseModules = await course.course.$get('modules', {
                attributes: ['id', 'order'],
                order: [['order', 'ASC']],
                transaction: t
            });

            console.log(course.dataValues.currentModuleId);

            const currentModule = courseModules.find(module => module.dataValues.id === course.currentModuleId);
            const nextModule = courseModules.find(module => module.dataValues.order === currentModule.dataValues.order + 1);

            await this.enrolledCoursesModel.update({
               grade: course.grade + ((100 / course.course.moduleCount) * (module[1][0].dataValues.moduleGrade / 100)),
               progress: Math.ceil(course.progress + ((100 / course.course.moduleCount + 1))),
               currentModuleId: nextModule ? nextModule.dataValues.id : null,
               
            }, {
                where: {
                    studentId: user.id,
                    courseId
                },
                transaction: t
            })

            await t.commit();

            return module[1][0];
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }
  
  
    async estimateFinalGrade(id: number, finalExamGrade: number): Promise<number> {
      const totalModuleGrade = await this.userCourseModuleModel.sum('moduleGrade', { where: { courseId: id } });
      return (totalModuleGrade * 0.4) + (finalExamGrade * 0.6);
    }

    async generateExam(user: User, courseId: number): Promise<QuizQuestion[]> {
      return this.sequelize.transaction(async (transaction) => {
         
        // Get enrolled course with modules
        const enrolledCourse = await this.enrolledCoursesModel.findOne({
          where: { studentId: user.id, courseId },
          transaction
        });
  
        // Collect all quiz questions from all modules
        const quizQuestions = await this.quizQuestionModel.findAll({ 
            where: { courseId },
            order: this.sequelize.random(),
            limit: 50,
            transaction
        });
  
        // Create the exam
        const exam = await this.courseFinalExamModel.upsert({
          enrolledCourseId: enrolledCourse.id,
          attemptedQuestions: quizQuestions.map((q) => ({ questionId: q.id, userAnswer: [], isCorrect: null })),
          score: null,
          submittedAt: null
        }, { 
            transaction,
            returning: true,
        });
  
        return quizQuestions.map(question => {
          return {
            ...question.dataValues,
            correctAnswers: [],
            explanation: ''
          } as QuizQuestion;
        });
      });
    }
  
    async submitExam(
      user: User,
      courseId: number,
      answers: QuizAnswerDto[]
    ): Promise<CourseFinalExam> {
      return this.sequelize.transaction(async (transaction) => {
        // Get enrolled course with modules
        const enrolledCourse = await this.enrolledCoursesModel.findOne({
          where: { studentId: user.id, courseId },
          transaction
        });

        const exam = await this.courseFinalExamModel.findOne({ where: { enrolledCourseId: enrolledCourse.id }, transaction });
        let score = 0;
        let total = 0;
        // Process answers and calculate score
        const attemptedQuestions = Promise.all(answers.map(async answer => {
          const question = await this.quizQuestionModel.findByPk(answer.questionId, { transaction });
          const isCorrect = this.isAnswerCorrect(question, answer.answers);

          if (isCorrect) {
            score++
          }

          total++
  
          return {
            questionId: answer.questionId,
            moduleId: question.moduleId,
            answer: answer.answers,
            isCorrect
          };
        }));
  
        // Update exam
        const updatedExam = await exam.update({
          attemptedQuestions,
          score,
          submittedAt: new Date(),
        }, { transaction });
  
        await this.enrolledCoursesModel.update({
          grade: await this.estimateFinalGrade(courseId, updatedExam.score),
        }, { 
            where: { studentId: user.id, courseId }, 
            transaction 
        });

        return exam;
      });
    }
}
