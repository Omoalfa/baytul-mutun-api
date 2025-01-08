import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { CourseModule } from './course-module.model';

export enum EQuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

@Table({
  tableName: 'quiz_questions',
  timestamps: true,
})
export class QuizQuestion extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column(DataType.TEXT)
  question: string;

  @Column({
    type: DataType.ENUM(...Object.values(EQuestionType)),
    defaultValue: EQuestionType.SINGLE_CHOICE,
  })
  type: EQuestionType;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  options: string[];

  @Column({
    type: DataType.ARRAY(DataType.STRING),
  })
  correctAnswers: string[]; // Array for multiple choice questions

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  point: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  explanation?: string; // Explanation for the correct answer

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive: boolean;

  @ForeignKey(() => CourseModule)
  @Column(DataType.INTEGER)
  moduleId: number;

  @BelongsTo(() => CourseModule)
  module: CourseModule;
}
