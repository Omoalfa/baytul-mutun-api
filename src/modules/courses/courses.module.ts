import { Module } from "@nestjs/common";
import { Course } from "./entities/course.entity";
import { SequelizeModule } from "@nestjs/sequelize";
import { CourseModule } from "./entities/course-module.entity";
import { CourseController } from "./course.controller";
import { CoursesService } from "./courses.service";
import { QuizQuestion } from "./entities/quiz-question.entity";
import { UploadService } from "src/common/services/upload.service";
import ValidationConstraints from "./validators";
import { UserCourseModule } from "./entities/user-course-module.entity";
import { EnrolledCourses } from "./entities/enrolled-courses.entity";
import { InstructorBio } from "../instructors/entities/InstructorBio.entity";
import { InstructorModule } from "../instructors/instructor.module";

@Module({
    imports: [
        SequelizeModule.forFeature([
            Course, CourseModule, QuizQuestion, UserCourseModule, EnrolledCourses, InstructorBio
        ]),
    ],
    controllers: [CourseController],
    providers: [
        CoursesService,
        UploadService,
        ...ValidationConstraints
    ],
    exports: [CoursesService]
})
export class CoursesModule {}
