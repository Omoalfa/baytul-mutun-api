import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasMany } from 'sequelize-typescript';
import { Course } from './course.entity';
import { QuizQuestion } from './quiz-question.entity';
import { EnrolledCourses } from './enrolled-courses.entity';

@Table({
  tableName: 'course_modules',
  timestamps: true,
})
export class CourseModule extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

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
  @Column(DataType.INTEGER)
  courseId: number;

  @BelongsTo(() => Course)
  course: Course;

  @HasMany(() => QuizQuestion)
  quizQuestions: QuizQuestion[];

  @HasMany(() => EnrolledCourses)
  enrolledCourses: EnrolledCourses[];
}
