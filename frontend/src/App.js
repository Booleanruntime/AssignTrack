import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Tasks from './pages/Tasks';
import Subjects from './pages/Subjects';
import TeacherGrading from './pages/TeacherGrading';
import TeacherAssignments from './pages/TeacherAssignments';
import StudentGrades from './pages/StudentGrades';
import Notifications from './pages/Notifications';
import ActivityLog from './pages/ActivityLog';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/tasks" element={<AppLayout><Tasks /></AppLayout>} />
        <Route path="/subjects" element={<AppLayout><Subjects /></AppLayout>} />
        <Route path="/teacher/grading" element={<AppLayout><TeacherGrading /></AppLayout>} />
        <Route path="/teacher/assignments" element={<AppLayout><TeacherAssignments /></AppLayout>} />
        <Route path="/grades" element={<AppLayout><StudentGrades /></AppLayout>} />
        <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
        <Route path="/activity-log" element={<AppLayout><ActivityLog /></AppLayout>} />
        <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
