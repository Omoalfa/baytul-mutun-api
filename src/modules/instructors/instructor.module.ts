import { Module } from "@nestjs/common";
import { InstructorController } from "./instructor.controller";
import { InstructorService } from "./instructor.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { InstructorBio } from "./models/InstructorBio.model";
import { CourseModule } from "../courses/models/course-module.model";
import { CoursesModule } from "../courses/courses.module";
import { UploadService } from "src/common/services/upload.service";
import { CoursesService } from "../courses/courses.service";
import { QuizQuestion } from "../courses/models/quiz-question.model";
import { EnrolledCourses } from "../courses/models/enrolled-courses.model";
import { UserCourseModule } from "../courses/models/user-course-module.model";
import { Course } from "../courses/models/course.model";
import { CourseFinalExam } from "../courses/models/course-final-exam.model";

@Module({
    controllers: [InstructorController],
    providers: [InstructorService, UploadService, CoursesService],
    imports: [
        SequelizeModule.forFeature([
            InstructorBio, Course, CourseModule, QuizQuestion, UserCourseModule, EnrolledCourses, CourseFinalExam
        ]),
        CoursesModule
    ],
    exports: [InstructorService]
})
export class InstructorModule {};
