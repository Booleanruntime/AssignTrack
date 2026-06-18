// Idempotent seed for local testing. Everything it creates is scoped to the
// *@seed.test accounts and the "(Seed)" subjects, and it only ever deletes data
// tied to those - it never wipes a collection or touches real team data, so it's
// safe to run against the shared Atlas cluster and safe to re-run.
//
//   node seed.js
//
// Models the teacher-authored flow: an admin enrols students in subjects, a
// teacher sets assignments, and each assignment fans out to the enrolled
// students. Every seeded account logs in with the password below.

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Subject = require('./models/Subject');
const Assignment = require('./models/Assignment');
const Task = require('./models/Task');
const Grade = require('./models/Grade');
const { ASSIGNMENT_STATUSES } = require('./constants/assignmentStatuses');
const computeOverall = require('./utils/computeOverall');
const { getGradingStrategy } = require('./strategies/GradingStrategy');

dotenv.config();

const PASSWORD = 'Password123!';

const SEED_USERS = [
  { name: 'Ada Admin', email: 'admin@seed.test', role: 'admin' },
  { name: 'Tom Teacher', email: 'teacher@seed.test', role: 'teacher' },
  { name: 'Sam Student', email: 'student@seed.test', role: 'student' },
  { name: 'Sara Student', email: 'student2@seed.test', role: 'student' },
];

const SEED_SUBJECTS = [
  { name: 'Software Engineering (Seed)', description: 'Design patterns, testing and configuration.' },
  { name: 'Databases (Seed)', description: 'Relational and document data modelling.' },
];

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY);

const seed = async () => {
  await connectDB();

  // --- wipe only previously-seeded data, scoped by the seed identifiers ---
  const seedEmails = SEED_USERS.map((u) => u.email);
  const existingUsers = await User.find({ email: { $in: seedEmails } }).select('_id');
  const existingIds = existingUsers.map((u) => u._id);
  const existingSubjects = await Subject.find({ name: { $in: SEED_SUBJECTS.map((s) => s.name) } }).select('_id');
  const existingSubjectIds = existingSubjects.map((s) => s._id);

  await Grade.deleteMany({ $or: [{ student: { $in: existingIds } }, { teacher: { $in: existingIds } }] });
  await Task.deleteMany({ $or: [{ user: { $in: existingIds } }, { subject: { $in: existingSubjectIds } }] });
  await Assignment.deleteMany({ $or: [{ teacher: { $in: existingIds } }, { subject: { $in: existingSubjectIds } }] });
  await Subject.deleteMany({ name: { $in: SEED_SUBJECTS.map((s) => s.name) } });
  await User.deleteMany({ email: { $in: seedEmails } });
  console.log('Cleared previous seed data.');

  // --- users (saved one-by-one so the password-hashing pre-save hook runs) ---
  const users = {};
  for (const u of SEED_USERS) {
    users[u.email] = await new User({ ...u, password: PASSWORD }).save();
  }
  const teacher = users['teacher@seed.test'];
  const sam = users['student@seed.test'];
  const sara = users['student2@seed.test'];
  console.log(`Created ${SEED_USERS.length} users.`);

  // --- subjects: teacher assigned, both students enrolled ---
  const subjects = {};
  for (const s of SEED_SUBJECTS) {
    subjects[s.name] = await Subject.create({
      ...s,
      teachers: [teacher._id],
      students: [sam._id, sara._id],
    });
  }
  const se = subjects['Software Engineering (Seed)'];
  const db = subjects['Databases (Seed)'];
  console.log(`Created ${SEED_SUBJECTS.length} subjects (teacher assigned, 2 students enrolled each).`);

  // --- teacher-authored assignments, each fanned out to enrolled students ---
  // returns a map of studentId -> the Task instance, so we can nudge statuses below
  const createAssignment = async ({ title, description, deadline, subject }) => {
    const assignment = await Assignment.create({
      title, description, deadline, subject: subject._id, teacher: teacher._id,
    });
    const byStudent = {};
    for (const studentId of subject.students) {
      byStudent[String(studentId)] = await Task.create({
        title, description, deadline,
        subject: subject._id,
        user: studentId,
        status: ASSIGNMENT_STATUSES.NOT_STARTED,
        assignment: assignment._id,
      });
    }
    return { assignment, byStudent };
  };

  const essay = await createAssignment({ title: 'Design Patterns Essay', description: 'Write up 7 GoF patterns.', deadline: daysFromNow(7), subject: se });
  const testing = await createAssignment({ title: 'Unit Testing Report', description: 'Mocha/Chai coverage write-up.', deadline: daysFromNow(2), subject: se });
  const oop = await createAssignment({ title: 'Intro to OOP Quiz', description: 'Encapsulation & inheritance basics.', deadline: daysFromNow(-5), subject: se });
  const er = await createAssignment({ title: 'ER Diagram', description: 'Normalise to 3NF.', deadline: daysFromNow(-1), subject: db });
  const joins = await createAssignment({ title: 'SQL Joins Exercise', description: 'Practice inner/outer joins.', deadline: daysFromNow(3), subject: db });
  console.log('Created 5 assignments, fanned out to enrolled students.');

  // --- nudge a spread of statuses so every state is demoable ---
  const setStatus = (task, status) => Task.findByIdAndUpdate(task._id, { status });
  await setStatus(essay.byStudent[String(sam._id)], ASSIGNMENT_STATUSES.IN_PROGRESS);
  await setStatus(testing.byStudent[String(sam._id)], ASSIGNMENT_STATUSES.SUBMITTED);
  await setStatus(joins.byStudent[String(sara._id)], ASSIGNMENT_STATUSES.SUBMITTED);
  await setStatus(er.byStudent[String(sam._id)], ASSIGNMENT_STATUSES.OVERDUE);

  // --- grade Sam's OOP quiz so the My Grades + Recently Graded views aren't empty ---
  const gradedTask = oop.byStudent[String(sam._id)];
  const rubric = [
    { criterion: 'Correctness', score: 17, outOf: 20 },
    { criterion: 'Clarity', score: 8, outOf: 10 },
  ];
  const score = computeOverall(rubric);
  const { label, passed } = getGradingStrategy('letter').grade(score);
  await Grade.create({
    task: gradedTask._id,
    student: sam._id,
    teacher: teacher._id,
    subject: se._id,
    score,
    scheme: 'letter',
    label,
    passed,
    feedback: {
      summary: 'Solid understanding of the core concepts, with a couple of gaps to tighten up.',
      strengths: ['Clear explanation of encapsulation', 'Good worked examples'],
      improvements: ['Revisit polymorphism vs overloading', 'Cite sources in APA'],
      rubric,
    },
  });
  await setStatus(gradedTask, ASSIGNMENT_STATUSES.GRADED);
  console.log(`Graded Sam's OOP quiz (${label}, ${score}/100).`);

  console.log('\nSeed complete. Log in with password:', PASSWORD);
  SEED_USERS.forEach((u) => console.log(`  ${u.role.padEnd(8)} ${u.email}`));

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.connection.close();
  process.exit(1);
});
