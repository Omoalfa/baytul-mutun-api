import { Injectable } from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/sequelize";
import { Course, ECourseStatus } from "./entities/course.entity";
import { User } from "../users/entities/user.entity";
import { UploadService } from "../../common/services/upload.service";
import { CreateCourseDto, CreateCourseModuleDto, CreateQuizQuestionDto, QuizAnswerDto } from "./dto";
import { Op } from "sequelize";
import { CourseModule } from "./entities/course-module.entity";
import { EQuestionType, QuizQuestion } from "./entities/quiz-question.entity";
import { PaginatedResponse, PaginationDto } from "src/common/dto/pagination.dto";
import { InstructorBio } from "../instructors/entities/InstructorBio.entity";
import { EnrolledCourses } from "./entities/enrolled-courses.entity";
import { ConflictException } from "@nestjs/common";
import { UserCourseModule } from "./entities/user-course-module.entity";
import { Sequelize } from "sequelize-typescript";

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
            attributes: ['id', 'title', 'description', 'image', 'price', 'createdAt'],
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
            const course = await this.enrolledCoursesModel.create(
                { courseId, studentId: user.id },
                { transaction: t }
            );

            await this.courseModel.increment('enrolledStudents', { by: 1, where: { id: courseId }, transaction: t });
            
            await t.commit();
            return course;
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
            where: { studentId, course: { title: { [Op.iLike]: `%${options.search ?? ""}%` } } }, 
            include: [{ model: Course, attributes: ['id', 'title', 'description', 'image', 'price', 'createdAt'] }], 
            attributes: ["id", "studentId", "courseId", "grade", "progress"],
            limit: options.limit,
            offset: (options.page - 1) * options.limit
        });

        return {
            page: options.page,
            total,
            data: courses,
            limit: options.limit,
            totalPages: Math.ceil(total / options.limit)
        }
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
                    attributes: ['id', 'title', 'description', 'image'] 
                },
                {
                    model: UserCourseModule,
                    attributes: ['id', 'moduleId', 'studentId', 'grade', 'progress', 'status', 'totalScore', 'quizGrade'],
                }
            ]
        });
    }

    async getRandomQuestionsForUserModule (user: User, courseId: number, moduleId: number): Promise<{ module: UserCourseModule, created: boolean }> {
        const t = await this.sequelize.transaction();
        
        try {
            const quizQuestions = await this.quizQuestionModel.findAll({ 
                where: { moduleId, courseId },
                transaction: t 
            });

            const randomQuestions = quizQuestions.sort(() => Math.random() - 0.5).slice(0, 5);

            const [module, created] = await this.userCourseModuleModel.findOrCreate({
                where: { moduleId, studentId: user.id },
                defaults: {
                    moduleId,
                    studentId: user.id,
                    attemptedQuestions: randomQuestions.map(question => ({
                        questionId: question.id,
                        userAnswer: null,
                        isCorrect: null,
                        attemptedAt: new Date()
                    }))
                },
                transaction: t
            });

            await t.commit();
            return { module, created };
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    isAnswerCorrect = (question: QuizQuestion, userAnswer: string[]): boolean => {
        switch (question.type) {
            case EQuestionType.MULTIPLE_CHOICE:
                return question.correctAnswer.every(answer => userAnswer.includes(answer)) && userAnswer.length === question.correctAnswer.length;
            case EQuestionType.TRUE_FALSE || EQuestionType.SHORT_ANSWER || EQuestionType.SINGLE_CHOICE:
                return question.correctAnswer[0] === userAnswer[0] && userAnswer.length === 1;
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
                totalScore
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
                attributes: ["progress", "grade", "id"],
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
            const currentModule = courseModules.find(module => module.id === course.currentModuleId);
            const nextModule = courseModules.find(module => module.order === currentModule.order + 1);

            await this.enrolledCoursesModel.update({
               grade: course.grade + ((100 / course.course.moduleCount) * (module[1][0].dataValues.moduleGrade / 100)),
               progress: course.progress + ((100 / course.course.moduleCount + 1)),
               currentModuleId: nextModule ? nextModule.id : null
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
}
