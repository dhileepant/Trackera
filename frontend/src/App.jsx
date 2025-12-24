import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import PracticeCategory from './pages/PracticeCategory';
import ProblemWorkspace from './pages/ProblemWorkspace';
import AIAssistant from './pages/AIAssistant';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a]">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student/practice/:category" element={<PracticeCategory />} />
          <Route path="/practice/problem/:problemId" element={<ProblemWorkspace />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/" element={<Navigate to="/auth" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
