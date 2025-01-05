import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { CoursesService } from '../courses.service';
import { User } from 'src/modules/users/entities/user.entity';

@ValidatorConstraint({ name: 'IsMyCourse', async: true })
@Injectable()
export class IsMyCourseConstraint implements ValidatorConstraintInterface {
    constructor(
        private readonly coursesService: CoursesService
    ) {}

    async validate(id: number, args: ValidationArguments) {
        const user = (args.object as any).currentUser as User;
        const course = await this.coursesService.findEnrolledCoursesByUserIdAndCourseId(user.id, id);
        return !!course;
    }

    defaultMessage(args: ValidationArguments) {
        return `No such course exist!`;
    }
}

export function IsMyCourse(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isCourseExist',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsMyCourseConstraint,
        });
    };
}
