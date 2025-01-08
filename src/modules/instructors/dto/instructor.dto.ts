import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { InstructorEducation, InstructorExperience } from '../models/InstructorBio.model';
import { InstructorExist } from '../validators/instructor-exist.validator';

export class CreateInstructorBioDto {
  @ApiProperty()
  @IsString()
  summary: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  qualifications?: string[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructorEducation)
  education?: InstructorEducation[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructorExperience)
  experience?: InstructorExperience[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];
}

export class UpdateInstructorBioDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  summary?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiPropertyOptional({ type: [InstructorEducation] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructorEducation)
  @IsOptional()
  education?: InstructorEducation[];

  @ApiPropertyOptional({ type: [InstructorExperience] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstructorExperience)
  @IsOptional()
  experience?: InstructorExperience[];

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];
}

export class InstructorBioParamDto {
  @ApiProperty()
  @IsInt()
  @InstructorExist()
  id: number;
}

export class InstructorUserParamDto {
  @ApiProperty()
  @IsInt()
  @InstructorExist()
  id: number;
}
