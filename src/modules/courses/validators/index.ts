import { IsCourseExistConstraint } from "./course-exist.validator";
import { IsModuleExistConstraint } from "./module-exist.validator";
import { UniqueTitleValidator } from "./unique-title.validator";
import { EnrolledCourseConstraint } from "./enrolled-course.validator";
import { IsMyCourseConstraint } from "./my-course-exist.validator";

const ValidationConstraints = [
    IsCourseExistConstraint,
    IsModuleExistConstraint,
    UniqueTitleValidator,
    EnrolledCourseConstraint,
    IsMyCourseConstraint
]

export default ValidationConstraints;
