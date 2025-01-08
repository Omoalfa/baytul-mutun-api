import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator } from 'class-validator';
import { CoursesService } from '../courses.service';
import { User } from 'src/modules/users/models/user.model';

@ValidatorConstraint({ name: 'UniqueTitle', async: true })
@Injectable()
export class UniqueTitleValidator implements ValidatorConstraintInterface {
    constructor(
        private readonly coursesService: CoursesService,
    ) { }

    async validate(title: string, args: ValidationArguments) {
        const { object } = args;
        
        const currentUser = (object as any).currentUser as User;
        
        if (!currentUser || !currentUser.id) {
            console.log('No user found in validation context');
            return false;
        }
        
        try {
            const course = await this.coursesService.findCourseByTitleAndInstructor(title, currentUser.id);
            return !course;
        } catch (error) {
            console.error('Error in validation:', error);
            return false;
        }
    }

    defaultMessage(args: ValidationArguments) {
        const { object } = args;
        const currentUser = (object as any).currentUser;
        if (!currentUser || !currentUser.id) {
            return 'User context is missing. Please ensure you are properly authenticated.';
        }
        return `You already have a course with the title "${args.value}"`;
    }
}

export function IsUniqueTitle(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'isUniqueTitle',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: UniqueTitleValidator,
        });
    };
}
