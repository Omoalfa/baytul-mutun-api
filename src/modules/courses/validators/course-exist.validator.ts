import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { CoursesService } from '../courses.service';
import { Course } from '../models/course.model';
import { User } from 'src/modules/users/models/user.model';

@ValidatorConstraint({ name: 'CourseExist', async: true })
@Injectable()
export class IsCourseExistConstraint implements ValidatorConstraintInterface {
    constructor(
        private readonly coursesService: CoursesService
    ) {}

    async validate(id: number, args: ValidationArguments) {
        const type = args.constraints[0];
        console.log(id);

        let course: Course;

        switch (type) {
            case "instructor":
                const user = (args.object as any).currentUser as User;
                if (!user) return false; 
                
                course = await this.coursesService.findCourseByIdAndUserId(id, user.id);
                return !!course; // Return true if no course found (title is unique for this user)
            case "public":
                course = await this.coursesService.findCourseById(id);
                return !!course;
            default:
                return false;
        } 
    }

    defaultMessage(args: ValidationArguments) {
        return `No such course exist!`;
    }
}

export function IsCourseExist(type: 'public' | 'instructor' = 'instructor', validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isCourseExist',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [type],
            validator: IsCourseExistConstraint,
        });
    };
}
