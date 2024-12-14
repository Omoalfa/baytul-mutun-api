import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Course } from './course.entity';
import { QuizQuestion } from './quiz-question.entity';

@Table({
  tableName: 'course_modules',
  timestamps: true,
})
export class CourseModule extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column
  title: string;

  @Column(DataType.TEXT)
  description: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  order: number;

  @Column(DataType.TEXT)
  content: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  duration: number; // in minutes

  @Column({
    defaultValue: false,
  })
  isPublished: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  videoUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  audioUrl?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  attachments: string[];

  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId: string;

  @BelongsTo(() => Course)
  course: Course;

  @HasMany(() => QuizQuestion)
  quizQuestions: QuizQuestion[];

  @Column({
    defaultValue: true,
  })
  isRequired: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    defaultValue: [],
  })
  prerequisites: string[]; // IDs of modules that must be completed first
}
