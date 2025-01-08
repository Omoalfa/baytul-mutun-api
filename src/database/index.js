
const tableNames = {
    COURSES: 'courses',
    COURSE_MODULES: 'course_modules',
    USER_COURSES: 'user_courses',
    USER_COURSE_MODULES: 'user_course_modules',
    QUIZ_QUESTIONS: 'quiz_questions',
    ENROLLED_COURSES: 'enrolled_courses',
    INSTRUCTORS: 'instructors',
    INSTRUCTOR_BIOS: 'instructor_bios',
    USERS: 'users'
}

// Define constants to match TypeScript enums
const UserRole = {
  ADMIN: 'admin',
  STUDENT: 'student',
  INSTRUCTOR: 'instructor'
};

const AuthProvider = {
  LOCAL: 'local',
  GOOGLE: 'google'
};

const CourseLevel = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED'
};

const EQuestionType = {
  MULTIPLE_CHOICE: 'multiple_choice',
  SINGLE_CHOICE: 'single_choice',
  TRUE_FALSE: 'true_false',
  SHORT_ANSWER: 'short_answer'
};


module.exports = { tableNames, UserRole, AuthProvider, CourseLevel, EQuestionType }
