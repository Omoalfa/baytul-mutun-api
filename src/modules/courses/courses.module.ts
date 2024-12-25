import { Module } from "@nestjs/common";
import { Course } from "./entities/course.entity";
import { SequelizeModule } from "@nestjs/sequelize";
import { CourseModule } from "./entities/course-module.entity";
import { CourseController } from "./course.controller";
import { CoursesService } from "./courses.service";
import { QuizQuestion } from "./entities/quiz-question.entity";
import { UploadService } from "src/common/services/upload.service";
import { UniqueTitleValidator } from "./validators/unique-title.validator";
import { IsCourseExistConstraint } from "./validators/course-exist.validator";
import { IsModuleExistConstraint } from "./validators/module-exist.validator";

@Module({
    imports: [
        SequelizeModule.forFeature([Course, CourseModule, QuizQuestion]),
    ],
    controllers: [CourseController],
    providers: [
        CoursesService,
        UploadService,
        UniqueTitleValidator,
        IsCourseExistConstraint,
        IsModuleExistConstraint
    ],
    exports: [CoursesService]
})
export class CoursesModule {}
