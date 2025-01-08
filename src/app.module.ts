import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from './modules/auth/auth.module';
import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategy';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RoleGuard } from './modules/auth/guards/role.guard';
import { User } from './modules/users/models/user.model';
import { UsersModule } from './modules/users/users.module';
import { CoursesModule } from './modules/courses/courses.module';
import { InstructorModule } from './modules/instructors/instructor.module';
import { CourseModule } from './modules/courses/models/course-module.model';
import { QuizQuestion } from './modules/courses/models/quiz-question.model';
import { EnrolledCourses } from './modules/courses/models/enrolled-courses.model';
import { InstructorBio } from './modules/instructors/models/InstructorBio.model';
import { UserCourseModule } from './modules/courses/models/user-course-module.model';
import { Course } from './modules/courses/models/course.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => databaseConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    InstructorModule,
    SequelizeModule.forFeature([
      Course, CourseModule, QuizQuestion, UserCourseModule, EnrolledCourses, InstructorBio, User
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard
    }
  ],
})
export class AppModule {}
