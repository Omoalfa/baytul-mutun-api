import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InstructorService } from '../instructor.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class UserExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly instructorService: InstructorService) {}

  async validate(instructorId: number, args: any) {
    const [type] = args.constraints;
    const instructor = await this.instructorService.findById(instructorId, type);
    return !!instructor; // returns true if the user exists, false otherwise
  }

  defaultMessage() {
    return 'Please create instructor profile first';
  }
}

export function InstructorExist(type: 'user' | 'bio', validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [type],
      validator: UserExistConstraint,
    });
  };
}
