
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const eventBus = require('./events/appEventBus');
const registerSubscribers = require('./events/registerSubscribers');

dotenv.config();


const app = express();
registerSubscribers(eventBus);

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));


const taskRoutes = require('./routes/taskRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
console.log('subjectRoutes loaded:', typeof subjectRoutes);


app.use('/api/tasks', taskRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/grades', require('./routes/gradeRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/activity-logs', require('./routes/activityLogRoutes'));
console.log('Subject routes registered');

// Export the app object for testing
if (require.main === module) {
    connectDB();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app;
