import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import AuthPage from './pages/AuthPage';
import OtpPage from './pages/OtpPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';
import { useUIStore } from './store/uiStore';
import { socketService } from './socket/socket';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}</> : <Navigate to="/auth" replace />;
}

export default function App() {
  const { theme } = useUIStore();
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    // Default to dark — force dark class always unless explicitly light
    const isDark = theme === 'light' ? false : true;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [theme]);

  useEffect(() => {
    if (token) socketService.connect(token);
    return () => { if (!token) socketService.disconnect(); };
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/otp" element={<OtpPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/*" element={<ProtectedRoute><MainPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
