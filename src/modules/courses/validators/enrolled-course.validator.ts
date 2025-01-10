import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { CoursesService } from '../courses.service';

@ValidatorConstraint({ name: 'EnrolledCourseExistConstraint', async: true })
@Injectable()
export class EnrolledCourseConstraint implements ValidatorConstraintInterface {
    constructor(
        private readonly coursesService: CoursesService
    ) {}

    async validate(id: number, args: ValidationArguments) {
        const course = await this.coursesService.findEnrolledCoursesByUserIdAndCourseId((args.object as any).currentUser.id, id);
        
        return !course;
    }

    defaultMessage(args: ValidationArguments) {
        return `You are already enrolled in this course`;
    }
}

export function IsUserEnrolled(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'IsUserEnrolled',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: EnrolledCourseConstraint,
        });
    };
}
