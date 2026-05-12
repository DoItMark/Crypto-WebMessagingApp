import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Contacts from './pages/Contacts.jsx';
import Chat from './pages/Chat.jsx';

function RequireUnlocked({ children }) {
  const { unlocked } = useAuth();
  return unlocked ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { unlocked } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={unlocked ? <Navigate to="/contacts" replace /> : <Login />} />
      <Route path="/register" element={unlocked ? <Navigate to="/contacts" replace /> : <Register />} />
      <Route path="/contacts" element={<RequireUnlocked><Contacts /></RequireUnlocked>} />
      <Route path="/chat/:email" element={<RequireUnlocked><Chat /></RequireUnlocked>} />
      <Route path="*" element={<Navigate to={unlocked ? '/contacts' : '/login'} replace />} />
    </Routes>
  );
}
