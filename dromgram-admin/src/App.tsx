import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';

function useAuth() {
  const token = localStorage.getItem('admin_token');
  return { isAuth: !!token };
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <nav style={{ width: 240, background: '#17212B', color: '#fff', padding: '24px 0' }}>
        <div style={{ padding: '0 24px 24px', fontSize: 20, fontWeight: 700, color: '#2AABEE' }}>DRomGram Admin</div>
        {[['/', 'Dashboard'], ['/admin/users', 'Пользователи']].map(([href, label]) => (
          <a key={href} href={href} style={{ display: 'block', padding: '12px 24px', color: '#fff', textDecoration: 'none', fontSize: 14 }}
            onMouseEnter={e => (e.target as any).style.background = '#232E3C'}
            onMouseLeave={e => (e.target as any).style.background = 'transparent'}>{label}</a>
        ))}
      </nav>
      <main style={{ flex: 1, background: '#F0F2F5', padding: 32, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}

export default function App() {
  const { isAuth } = useAuth();
  if (!isAuth) return <BrowserRouter><Routes><Route path="*" element={<LoginPage/>}/></Routes></BrowserRouter>;
  return (
    <BrowserRouter>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<DashboardPage/>}/>
          <Route path="/admin/users" element={<UsersPage/>}/>
          <Route path="*" element={<Navigate to="/"/>}/>
        </Routes>
      </AdminLayout>
    </BrowserRouter>
  );
}
