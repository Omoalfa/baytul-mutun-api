import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors, BadRequestException, Query } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import Roles from "src/common/decorators/role.decorator";
import { User, UserRole } from "../users/models/user.model";
import { UserParam } from "../auth/decorators/user.decorator";
import { CoursesService } from "./courses.service";
import { CourseEnrollParamDto, CourseParamDto, CreateCourseDto, CreateCourseModuleDto, CreateQuizQuestionDto, InstructorCourseParamDto, InstructorModuleParamDto, MyCourseParamDto, MyModuleParamDto, QuizAnswersDto } from "./dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UserContextInterceptor } from 'src/common/interceptors/user-context.interceptor';
import Public from "src/common/decorators/public.decorator";

@Controller('courses')
export class CourseController {
    constructor (
        private readonly courseService: CoursesService,
    ) {}

    @Public()
    @Get()
    async fetchCourses(
        @Param() param: PaginationDto
    ) {
        return await this.courseService.findAllCourses(param);
    }

    @Roles(UserRole.STUDENT)
    @Get("/my")
    async fetchMyCourses (
        @UserParam() user: User,
        @Query() options: PaginationDto
    ) {
        return await this.courseService.findEnrolledCoursesByStudentId(user.id, options);
    }

    @Roles(UserRole.STUDENT)
    @Get("/my/:id") 
    async fetchMyCourseDetails (
        @Param() param: MyCourseParamDto,
        @UserParam() user: User
    ) {
        return await this.courseService.findMyCourseById(param.id, user.id);
    }

    @Roles(UserRole.STUDENT)
    @Get("/my/:courseId/modules/:moduleId")
    async fetchMyModuleDetails (
        @Param() param: MyModuleParamDto,
        @UserParam() user: User
    ) {
        return await this.courseService.fetchMyModuleDetails(user, param.moduleId, param.courseId);
    }

    @Roles(UserRole.STUDENT)
    @Get("/my/:courseId/modules/:moduleId/quiz")
    async fetchQuizQuestionsForModule (
        @Param() param: MyModuleParamDto,
        @UserParam() user: User
    ) {
        return await this.courseService.getRandomQuestionsForUserModule(user, param.courseId, param.moduleId);
    }

    @Roles(UserRole.STUDENT)
    @Post("/my/:courseId/modules/:moduleId/quiz")
    async submitQuiz (
        @Param() param: MyModuleParamDto,
        @Body() { data: answers }: QuizAnswersDto,
        @UserParam() user: User
    ) {
        console.log(param);
        return await this.courseService.submitQuiz(user, param.courseId, param.moduleId, answers);
    }

    @Roles(UserRole.STUDENT)
    @Post('my/:id/exam/generate')
    async generateExam(
        @Param() param: MyCourseParamDto,
        @UserParam() user: User
    ) {
        return this.courseService.generateExam(user, param.id);
    }

    @Roles(UserRole.STUDENT)
    @Post('my/:id/exam/submit')
    async submitExam(
        @Param() param: MyCourseParamDto,
        @UserParam() user: User,
        @Body() { data: answers }: QuizAnswersDto,
    ) {
        return this.courseService.submitExam(user, param.id, answers);
    }

    @Public()
    @Get("/:id")
    async fetchCourseById(
        @Param() param: CourseParamDto
    ) {
        return await this.courseService.findCourseById(param.id);
    }

    @Public()
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

    @Roles(UserRole.STUDENT)
    @Post("/:id/enroll")
    async enrollStudentToCourse (
        @Param() param: CourseEnrollParamDto,
        @UserParam() user: User,
    ) {
        return await this.courseService.enrollStudentToCourse(user, param.id);
    }
}
