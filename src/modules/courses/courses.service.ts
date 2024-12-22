import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Course } from "./entities/course.entity";
import { User } from "../users/entities/user.entity";
import { UploadService } from "../../common/services/upload.service";
import { CreateCourseDto, CreateCourseModuleDto } from "./dto";
import { Op } from "sequelize";
import { CourseModule } from "./entities/course-module.entity";

@Injectable()
export class CoursesService {
    constructor(
        @InjectModel(Course) private readonly courseModel: typeof Course,
        private uploadService: UploadService
    ) {}

    async createCourse(user: User, createCourseDto: CreateCourseDto, image?: Express.Multer.File): Promise<Course> {
        if (image) {
            createCourseDto.image = await this.uploadService.uploadFile(image);
        }
        
        return await this.courseModel.create({ ...createCourseDto, instructorId: user.id });
    }

    
    async findAllCourses(page = 1, limit = 10, search?: string): Promise<{count: number, rows: Course[]}> {
        const offset = (page - 1) * limit;
        const where: any = {};
        if (search) {
            where.title = {
                [Op.iLike]: `%${search}%`
            }
        }

        return await this.courseModel.findAndCountAll({
            where,
            offset,
            limit,
            order: [
                ['createdAt', 'DESC']
            ]
        });
    }
    
    async findCourseById(id: number): Promise<Course> {
        return await this.courseModel.findByPk(id);
    }   

    
    async addModulesToCourse(courseId: number, createModuleDto: CreateCourseModuleDto, video: Express.Multer.File, audio: Express.Multer.File): Promise<CourseModule> {
        const course = await this.courseModel.findByPk(courseId);
        
        if (video) {
            createModuleDto.videoUrl = await this.uploadService.uploadFile(video);
        }
        if (audio) {
            createModuleDto.audioUrl = await this.uploadService.uploadFile(audio);
        }
        const module = await course.$create<CourseModule>('modules', createModuleDto);
        return module;
    }

}
