import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from "sequelize-typescript";
import { Course } from "./course.entity";
import { User } from "src/modules/users/entities/user.entity";
import { UserCourseModule } from "./user-course-module.entity";
import { CourseModule } from "./course-module.entity";

@Table({
    tableName: "enrolled_courses",
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'courseId'],
            name: 'unique_student_course_enrollment'
        }
    ]
})
export class EnrolledCourses extends Model<EnrolledCourses> {
    @Column({
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    })
    id: number;

    @Column({ type: DataType.DECIMAL(10, 2), defaultValue: 0 })
    grade: number;

    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    progress: number;

    @ForeignKey(() => Course)
    @Column({ type: DataType.INTEGER, allowNull: false })
    courseId: number;

    @ForeignKey(() => CourseModule)
    @Column({ type: DataType.INTEGER, allowNull: true })
    currentModuleId: number;

    @BelongsTo(() => CourseModule)
    currentModule: CourseModule;

    @ForeignKey(() => User)
    @Column({ type: DataType.INTEGER, allowNull: false })
    studentId: number;

    @BelongsTo(() => User)
    student: User;

    @BelongsTo(() => Course)
    course: Course;

    @HasMany(() => UserCourseModule)
    modules: UserCourseModule[];
}
