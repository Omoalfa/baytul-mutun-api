import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Course, ECourseStatus } from "./entities/course.entity";
import { User } from "../users/entities/user.entity";
import { UploadService } from "../../common/services/upload.service";
import { CreateCourseDto, CreateCourseModuleDto, CreateQuizQuestionDto } from "./dto";
import { Op } from "sequelize";
import { CourseModule } from "./entities/course-module.entity";
import { QuizQuestion } from "./entities/quiz-question.entity";
import { PaginatedResponse, PaginationDto } from "src/common/dto/pagination.dto";
import { InstructorBio } from "../instructors/entities/InstructorBio.entity";

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course) private readonly courseModel: typeof Course,
        private uploadService: UploadService,
        @InjectModel(QuizQuestion) private readonly quizQuestionModel: typeof QuizQuestion,
        @InjectModel(CourseModule) private readonly courseModuleModel: typeof CourseModule,
        @InjectModel(InstructorBio) private readonly instructorBioModel: typeof InstructorBio,
    ) {}

    async createCourse(user: User, createCourseDto: CreateCourseDto, avatar?: Express.Multer.File): Promise<Course> {
        // Parse string arrays back to actual arrays
        if (typeof createCourseDto.requirements === 'string') {
            createCourseDto.requirements = JSON.parse(createCourseDto.requirements);
        }
        if (typeof createCourseDto.objectives === 'string') {
            createCourseDto.objectives = JSON.parse(createCourseDto.objectives);
        }

        const bio = await this.instructorBioModel.findOne({ where: { userId: user.id } });

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
        
        return await this.courseModel.create({ 
            ...createCourseDto, 
            instructorId: user.id 
        });
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
        const course = await this.courseModel.findByPk(courseId);
        const { questions } = createModuleDto;

        delete createModuleDto.questions;
        
        if (video) {
            createModuleDto.videoUrl = await this.uploadService.uploadFile(video);
        }
        if (audio) {
            createModuleDto.audioUrl = await this.uploadService.uploadFile(audio);
        }
        const module = await course.$create<CourseModule>('modules', createModuleDto);
        if (questions.length) {
            await Promise.all(questions.map(quizQuestion => this.addQuizQuestionToModule(module.id, quizQuestion)));
        }
        return module;
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

}
