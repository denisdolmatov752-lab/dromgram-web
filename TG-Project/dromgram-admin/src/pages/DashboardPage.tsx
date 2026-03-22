import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const api = axios.create({ baseURL: 'https://orproject.ru/api', headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });

function StatCard({ title, value, color }: any) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24, flex: 1, borderLeft: `4px solid ${color}` }}>
      <p style={{ color: '#8D8D8D', fontSize: 13, marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 32, fontWeight: 700, color }}>{value ?? '—'}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {}); }, []);
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <StatCard title="Всего пользователей" value={stats?.totalUsers} color="#2AABEE"/>
        <StatCard title="Онлайн сейчас" value={stats?.onlineUsers} color="#26B35E"/>
        <StatCard title="Сообщений сегодня" value={stats?.todayMessages} color="#EBAC00"/>
        <StatCard title="Новых за неделю" value={stats?.newUsersWeek} color="#FF516A"/>
      </div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Статистика (демо)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[{name:'Пн',users:2},{name:'Вт',users:4},{name:'Ср',users:3},{name:'Чт',users:6},{name:'Пт',users:8},{name:'Сб',users:5},{name:'Вс',users:7}]}>
            <CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/>
            <Tooltip/><Line type="monotone" dataKey="users" stroke="#2AABEE" strokeWidth={2}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
