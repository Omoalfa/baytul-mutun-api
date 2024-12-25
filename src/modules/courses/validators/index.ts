import { IsCourseExistConstraint } from "./course-exist.validator";
import { IsModuleExistConstraint } from "./module-exist.validator";
import { UniqueTitleValidator } from "./unique-title.validator";

const ValidationConstraints = [
    IsCourseExistConstraint,
    IsModuleExistConstraint,
    UniqueTitleValidator
]

export default ValidationConstraints;
