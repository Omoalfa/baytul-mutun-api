import { BeforeSave, BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { EnrolledCourses } from "./enrolled-courses.model";
import { CourseModule } from "./course-module.model";
import { User } from "src/modules/users/models/user.model";

export enum EStudentModuleStatus {
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}

@Table({
    tableName: 'user_course_modules',
    timestamps: true,
})
export class UserCourseModule extends Model<UserCourseModule> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    })
    id: number;

    @Column({
        type: DataType.ARRAY(DataType.JSONB),
        allowNull: true,
    })
    attemptedQuestions: {
        questionId: number;
        userAnswer?: string[];
        isCorrect?: boolean;
        attemptedAt: Date;
    }[];

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
    })
    totalScore: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
    })
    maxPossibleScore: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
        defaultValue: 0,
    })
    moduleGrade: number;

    @Column({
        type: DataType.ENUM(...Object.values(EStudentModuleStatus)),
        allowNull: false,
        defaultValue: EStudentModuleStatus.IN_PROGRESS,
    })
    status: EStudentModuleStatus;

    @ForeignKey(() => CourseModule)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    moduleId: number;

    @BelongsTo(() => CourseModule)
    module: CourseModule;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    studentId: number; 

    @BelongsTo(() => User)
    student: User

    @ForeignKey(() => EnrolledCourses)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    courseId: number

    @BelongsTo(() => EnrolledCourses)
    course: EnrolledCourses;

    @BeforeSave
    static estimateGrade(instance: UserCourseModule) {
        if (instance.totalScore && instance.maxPossibleScore) {
            instance.moduleGrade = (instance.totalScore / instance.maxPossibleScore) * 100;
        }
    }
}
