import { Module } from "@nestjs/common";
import { InstructorController } from "./instructor.controller";
import { InstructorService } from "./instructor.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { InstructorBio } from "./entities/InstructorBio.entity";
import { Course } from "../courses/entities/course.entity";
import { CourseModule } from "../courses/entities/course-module.entity";

@Module({
    controllers: [InstructorController],
    providers: [InstructorService],
    imports: [
        SequelizeModule.forFeature([InstructorBio, Course, CourseModule])
    ]
})
export class InstructorModule {};
