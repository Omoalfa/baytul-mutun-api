import { Injectable } from '@nestjs/common';
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { InstructorService } from '../instructor.service';

@ValidatorConstraint({ async: true })
@Injectable()
export class InstructorExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly instructorService: InstructorService) {}

  async validate(instructorId: number) {
    const instructor = await this.instructorService.findById(instructorId);
    return !!instructor; // returns true if the user exists, false otherwise
  }

  defaultMessage() {
    return 'Please create instructor profile first';
  }
}

export function InstructorExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: InstructorExistConstraint,
    });
  };
}
