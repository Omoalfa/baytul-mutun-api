import { CourseLevel } from "../entities/course.entity";

import { IsString, IsEnum, IsNumber, IsOptional, IsUrl, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;

    @ApiProperty()
    @IsEnum(CourseLevel)
    level: CourseLevel;

    @ApiProperty()
    @IsNumber()
    duration: string;

    @ApiProperty()
    @IsNumber()
    price: number;

    @ApiPropertyOptional()
    @IsUrl()
    @IsOptional()
    image?: string;
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
  }
  
