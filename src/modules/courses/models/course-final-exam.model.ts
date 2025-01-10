import { BeforeSave, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { EnrolledCourses } from './enrolled-courses.model';

interface AttemptedQuestion {
  questionId: number;
  moduleId: number;
  answer: string[];
  isCorrect: boolean;
}

@Table({
  tableName: 'course_final_exams',
  timestamps: true
})
export class CourseFinalExam extends Model {
  @ForeignKey(() => EnrolledCourses)
  @Column({
    allowNull: false,
    unique: true
  })
  enrolledCourseId: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: []
  })
  attemptedQuestions: AttemptedQuestion[];

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0
  })
  score: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0
  })
  maxPossibleScore: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 0
  })
  grade: number;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  submittedAt: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  timeSpentInSeconds: number;

  @BelongsTo(() => EnrolledCourses)
  enrolledCourse: EnrolledCourses;

  @BeforeSave
  static calculateGrade(instance: CourseFinalExam) {
    instance.grade = instance.score / instance.maxPossibleScore;
  }
}
