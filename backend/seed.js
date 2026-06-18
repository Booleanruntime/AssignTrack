// Idempotent seed for local testing. Everything it creates is scoped to the
// *@seed.test accounts and the "(Seed)" subjects, and it only ever deletes data
// tied to those - it never wipes a collection or touches real team data, so it's
// safe to run against the shared Atlas cluster and safe to re-run.
//
//   node seed.js
//
// Every seeded account logs in with the password below.

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Subject = require('./models/Subject');
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

// a day in ms, for relative deadlines
const DAY = 24 * 60 * 60 * 1000;

const seed = async () => {
  await connectDB();

  // --- wipe only previously-seeded data, scoped by the seed identifiers ---
  const seedEmails = SEED_USERS.map((u) => u.email);
  const existing = await User.find({ email: { $in: seedEmails } }).select('_id');
  const existingIds = existing.map((u) => u._id);

  await Grade.deleteMany({ $or: [{ student: { $in: existingIds } }, { teacher: { $in: existingIds } }] });
  await Task.deleteMany({ user: { $in: existingIds } });
  await Subject.deleteMany({ name: { $in: SEED_SUBJECTS.map((s) => s.name) } });
  await User.deleteMany({ email: { $in: seedEmails } });
  console.log('Cleared previous seed data.');

  // --- users (saved one-by-one so the password-hashing pre-save hook runs) ---
  const users = {};
  for (const u of SEED_USERS) {
    const doc = await new User({ ...u, password: PASSWORD }).save();
    users[u.email] = doc;
  }
  const teacher = users['teacher@seed.test'];
  const sam = users['student@seed.test'];
  const sara = users['student2@seed.test'];
  console.log(`Created ${SEED_USERS.length} users.`);

  // --- subjects, with the teacher assigned to each ---
  const subjects = {};
  for (const s of SEED_SUBJECTS) {
    const doc = await Subject.create({ ...s, teachers: [teacher._id] });
    subjects[s.name] = doc;
  }
  const se = subjects['Software Engineering (Seed)'];
  const db = subjects['Databases (Seed)'];
  console.log(`Created ${SEED_SUBJECTS.length} subjects (teacher assigned).`);

  // --- tasks spread across the lifecycle so every state is demoable ---
  const S = ASSIGNMENT_STATUSES;
  const tasks = await Task.create([
    // Sam: one in each state so the Submit button + gating are visible
    { title: 'Design Patterns Essay', description: 'Write up 7 GoF patterns.', deadline: new Date(Date.now() + 7 * DAY), user: sam._id, subject: se._id, status: S.NOT_STARTED },
    { title: 'State Machine Diagram', description: 'Model the assignment lifecycle.', deadline: new Date(Date.now() + 4 * DAY), user: sam._id, subject: se._id, status: S.IN_PROGRESS },
    { title: 'Unit Testing Report', description: 'Mocha/Chai coverage write-up.', deadline: new Date(Date.now() + 2 * DAY), user: sam._id, subject: se._id, status: S.SUBMITTED },
    { title: 'ER Diagram', description: 'Normalise to 3NF.', deadline: new Date(Date.now() - 1 * DAY), user: sam._id, subject: db._id, status: S.OVERDUE },
    // Sara: a submitted one so the teacher's gradeable queue has more than one
    { title: 'SQL Joins Exercise', description: 'Practice inner/outer joins.', deadline: new Date(Date.now() + 3 * DAY), user: sara._id, subject: db._id, status: S.SUBMITTED },
    // an already-graded task so Sam's "My Grades" page isn't empty
    { title: 'Intro to OOP Quiz', description: 'Encapsulation & inheritance basics.', deadline: new Date(Date.now() - 5 * DAY), user: sam._id, subject: se._id, status: S.GRADED },
  ]);
  console.log(`Created ${tasks.length} tasks.`);

  // --- one finished grade with structured feedback for the GRADED task ---
  const gradedTask = tasks.find((t) => t.status === S.GRADED);
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
    subject: gradedTask.subject,
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
  console.log(`Created 1 grade (${label}, ${score}/100).`);

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
