import { Module } from "@nestjs/common";
import { InstructorController } from "./instructor.controller";
import { InstructorService } from "./instructor.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { InstructorBio } from "./entities/InstructorBio.entity";
import { Course } from "../courses/entities/course.entity";
import { CourseModule } from "../courses/entities/course-module.entity";
import { CoursesModule } from "../courses/courses.module";
import { UploadService } from "src/common/services/upload.service";
import { CoursesService } from "../courses/courses.service";
import { QuizQuestion } from "../courses/entities/quiz-question.entity";

@Module({
    controllers: [InstructorController],
    providers: [InstructorService, UploadService, CoursesService],
    imports: [
        SequelizeModule.forFeature([InstructorBio, Course, CourseModule, QuizQuestion]),
        CoursesModule
    ],
    exports: [InstructorService]
})
export class InstructorModule {};
