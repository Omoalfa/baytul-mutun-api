import { registerDecorator, ValidationOptions, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CoursesService } from '../courses.service';
import { Injectable } from '@nestjs/common';


@ValidatorConstraint({ name: 'ModuleExist', async: true })
@Injectable()
export class IsModuleExistConstraint implements ValidatorConstraintInterface {
    constructor(
        private readonly coursesService: CoursesService,
    ) {}

    async validate(id: number, args: ValidationArguments) {
        const courseId = (args.object as any).courseId
        
        const course = await this.coursesService.findModuleByCourseIdAndId(id, courseId);
        return !!course;
    }

    defaultMessage(args: ValidationArguments) {
        return `No such module exist!`;
    }
}

export function IsModuleExist(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isModuleExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsModuleExistConstraint,
    });
  };
}
