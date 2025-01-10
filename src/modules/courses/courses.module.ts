import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { CourseController } from "./courses.controller";
import { CoursesService } from "./courses.service";
import { CourseModule } from "./models/course-module.model";
import { QuizQuestion } from "./models/quiz-question.model";
import { UploadService } from "src/common/services/upload.service";
import ValidationConstraints from "./validators";
import { InstructorBio } from "../instructors/models/InstructorBio.model";
import { User } from "../users/models/user.model";
import { Course } from "./models/course.model";
import { UserCourseModule } from "./models/user-course-module.model";
import { EnrolledCourses } from "./models/enrolled-courses.model";
import { CourseFinalExam } from "./models/course-final-exam.model";

@Module({
    imports: [
        SequelizeModule.forFeature([
            Course, CourseModule, QuizQuestion, UserCourseModule, EnrolledCourses, InstructorBio, User, CourseFinalExam
        ]),
    ],
    controllers: [CourseController],
    providers: [
        CoursesService,
        UploadService,
        ...ValidationConstraints,
    ],
    exports: [CoursesService]
})
export class CoursesModule {}
