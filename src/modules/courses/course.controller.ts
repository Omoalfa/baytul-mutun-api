import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import Roles from "src/common/decorators/role.decorator";
import { User, UserRole } from "../users/entities/user.entity";
import { UserParam } from "../auth/decorators/user.decorator";
import { CoursesService } from "./courses.service";
import { CourseParamDto, CreateCourseDto, CreateCourseModuleDto, CreateQuizQuestionDto, InstructorCourseParamDto, InstructorModuleParamDto } from "./dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UserContextInterceptor } from 'src/common/interceptors/user-context.interceptor';

@Roles(UserRole.STUDENT, UserRole.INSTRUCTOR, UserRole.ADMIN)
@Controller('courses')
export class CourseController {
    constructor (
        private readonly courseService: CoursesService 
    ) {}

    @Get()
    async fetchCourses(
        @Param() param: PaginationDto
    ) {
        return await this.courseService.findAllCourses(param);
    }

    @Get("/:id")
    async fetchCourseById(
        @Param() param: CourseParamDto
    ) {
        return await this.courseService.findCourseById(param.id);
    }

    @Get("/:id/modules")
    async fetchCourseModules (
        @Param() param: CourseParamDto
    ) {
        return await this.courseService.findModulesByCourseId(param.id);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Post("")
    @UseInterceptors(UserContextInterceptor)
    @UseInterceptors(
        FileInterceptor('avatar', {
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
                    return callback(new BadRequestException('Only image files are allowed!'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            }
        })
    )
    async createCourse (
        @Body() createCourseDto: CreateCourseDto,
        @UserParam() user: User,
        @UploadedFile() avatar: Express.Multer.File
    ) {
        delete createCourseDto.currentUser;
        return await this.courseService.createCourse(user, createCourseDto, avatar);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Post("/:id/module")
    async addModuleToCourse (
        @Body() createCourseModuleDto: CreateCourseModuleDto,
        @Param() param: InstructorCourseParamDto,
        @UploadedFile() video: Express.Multer.File,
        @UploadedFile() audio: Express.Multer.File,
    ) {
        return await this.courseService.addModulesToCourse(param.id, createCourseModuleDto, video, audio);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Post("/:courseId/module/:moduleId/quiz")
    async addQuizToModule (
        @Body() quizQuestions: CreateQuizQuestionDto,
        @Param() param: InstructorModuleParamDto,
    ) {
        return await this.courseService.addQuizQuestionToModule(param.moduleId, quizQuestions);
    }

    @Roles(UserRole.INSTRUCTOR)
    @Post("/:courseId/module/:moduleId/quiz/bulk")
    async addBulkQuizToModule (
        @Body() quizQuestions: CreateQuizQuestionDto[],
        @Param() param: InstructorModuleParamDto,
    ) {
        return await this.courseService.addBulkQuizQuestionsToModule(param.moduleId, quizQuestions);
    }
}
