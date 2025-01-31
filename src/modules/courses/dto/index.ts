import { IsString, IsEnum, IsNumber, IsOptional, IsUrl, IsArray, ArrayMinSize, IsInt, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsUniqueTitle } from '../validators/unique-title.validator';
import { EQuestionType } from "../models/quiz-question.model";
import { ValidateCorrectAnswers, ValidateOptions } from "../validators/quiz-question.validator";
import { IsCourseExist } from "../validators/course-exist.validator";
import { ValidateNested } from 'class-validator';
import { IsModuleExist } from "../validators/module-exist.validator";
import { User } from "src/modules/users/models/user.model";
import { IsUserEnrolled } from "../validators/enrolled-course.validator";
import { IsMyCourse } from "../validators/my-course-exist.validator";
import { CourseLevel, ECourseStatus } from '../models/course.model';

export class CreateCourseDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;  // This will be set by the controller

  @ApiProperty()
  @IsString()
  @IsUniqueTitle()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsEnum(CourseLevel)
  level: CourseLevel;

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  requirements: string[];

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty()
  @IsNumber()
  duration: number;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @ApiPropertyOptional()
  @IsEnum(ECourseStatus)
  @IsOptional()
  status?: ECourseStatus
}


export class CreateQuizQuestionDto {
  @IsString()
  @ApiProperty()
  question: string;

  @IsEnum(EQuestionType)
  @ApiProperty()
  type: EQuestionType;

  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  @ValidateOptions()
  options: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @ValidateCorrectAnswers()
  @ApiProperty()
  correctAnswers: string[];

  @IsNumber()
  @ApiProperty()
  points: number;
}


export class CreateCourseModuleDto {
  @IsString()
  @ApiProperty()
  title: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  audioUrl?: string;

  @IsArray()
  @ApiProperty()
  attachments?: string[];

  @IsString()
  @ApiProperty()
  courseId: string;

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional()
  order?: number;

  @IsOptional()
  @IsArray()
  @Type(() => CreateQuizQuestionDto)
  @ValidateNested({ each: true })
  @ApiPropertyOptional({ type: [CreateQuizQuestionDto] })
  questions?: CreateQuizQuestionDto[]
}

export class CourseParamDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @IsCourseExist("public")
  id: number;
}

export class CourseEnrollParamDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;

  @ApiProperty()
  @IsInt()
  @IsCourseExist("public")
  @IsUserEnrolled()
  id: number;
}

export class MyCourseParamDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;

  @ApiProperty()
  @IsInt()
  @IsMyCourse()
  id: number;
}

export class InstructorCourseParamDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;

  @ApiProperty()
  @IsInt()
  @IsCourseExist("instructor")
  id: number;
}

export class InstructorModuleParamDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;
  
  @ApiProperty()
  @IsInt()
  @IsCourseExist("instructor")
  courseId: number;

  @ApiProperty()
  @IsInt()
  @IsModuleExist()
  moduleId: number;
}

export class MyModuleParamDto {
  @IsOptional()
  @Type(() => User)
  currentUser?: User;

  @ApiProperty()
  @IsInt()
  @IsMyCourse()
  courseId: number;

  @ApiProperty()
  @IsInt()
  @IsModuleExist()
  moduleId: number;
}

export class QuizAnswerDto {
  @ApiProperty()
  @IsInt()
  questionId: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true }) 
  answers: string[];
}

export class QuizAnswersDto {
  @ApiProperty({ type: [QuizAnswerDto] })
  @IsArray()
  @ArrayMinSize(5)
  @Type(() => QuizAnswerDto)
  @ValidateNested({ each: true })
  data: QuizAnswerDto[]
}
