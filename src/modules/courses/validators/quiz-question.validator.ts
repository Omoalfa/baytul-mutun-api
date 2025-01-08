import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { EQuestionType } from '../models/quiz-question.model';

export function ValidateOptions(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'validateOptions',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const type = (args.object as any).type;
          
          // For multiple choice and single choice, require at least 5 options
          if ([EQuestionType.MULTIPLE_CHOICE, EQuestionType.SINGLE_CHOICE].includes(type)) {
            return Array.isArray(value) && value.length >= 5;
          }
          
          // For true/false and short answer, options can be empty
          if ([EQuestionType.TRUE_FALSE, EQuestionType.SHORT_ANSWER].includes(type)) {
            return true;
          }
          
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const type = (args.object as any).type;
          if ([EQuestionType.MULTIPLE_CHOICE, EQuestionType.SINGLE_CHOICE].includes(type)) {
            return 'Options must have at least 5 choices for multiple/single choice questions';
          }
          return 'Invalid options for the question type';
        },
      },
    });
  };
}

export function ValidateCorrectAnswers(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'validateCorrectAnswers',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const type = (args.object as any).type;
          
          // Check if value is an array
          if (!Array.isArray(value)) return false;
          
          // For single choice, true/false, and short answer, only one answer allowed
          if ([EQuestionType.SINGLE_CHOICE, EQuestionType.TRUE_FALSE, EQuestionType.SHORT_ANSWER].includes(type)) {
            return value.length === 1;
          }
          
          // For multiple choice, allow multiple answers
          if (type === EQuestionType.MULTIPLE_CHOICE) {
            return value.length >= 1;
          }
          
          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const type = (args.object as any).type;
          if ([EQuestionType.SINGLE_CHOICE, EQuestionType.TRUE_FALSE, EQuestionType.SHORT_ANSWER].includes(type)) {
            return 'Only one correct answer is allowed for this question type';
          }
          return 'Invalid correct answers for the question type';
        },
      },
    });
  };
}
