import { useState, useEffect } from 'react';
import axios from 'axios';
const api = axios.create({ baseURL: 'https://orproject.ru/api', headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } });
export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const load = async () => { try { const r = await api.get('/admin/users', { params: { search } }); setUsers(r.data.data.users || []); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, [search]);
  const ban = async (id: string, ban: boolean) => { await api.put(`/admin/users/${id}/${ban?'ban':'unban'}`); load(); };
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Пользователи</h1>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." style={{ padding: '10px 16px', border: '1px solid #E0E0E0', borderRadius: 8, marginBottom: 16, width: 300 }}/>
      {loading ? <div>Загрузка...</div> : (
        <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#F0F2F5' }}>{['Имя','Телефон','Username','Статус','Действия'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#8D8D8D' }}>{h}</th>)}</tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #E0E0E0' }}>
                <td style={{ padding: '12px 16px' }}>{u.firstName} {u.lastName}</td>
                <td style={{ padding: '12px 16px', color: '#8D8D8D', fontSize: 13 }}>{u.phone}</td>
                <td style={{ padding: '12px 16px', color: '#8D8D8D', fontSize: 13 }}>@{u.username || '—'}</td>
                <td style={{ padding: '12px 16px' }}><span style={{ padding: '2px 8px', borderRadius: 999, background: u.isBanned ? '#FFE5E5' : '#E5F9EE', color: u.isBanned ? '#FF3B30' : '#26B35E', fontSize: 12 }}>{u.isBanned ? 'Заблокирован' : 'Активен'}</span></td>
                <td style={{ padding: '12px 16px' }}><button onClick={() => ban(u.id, !u.isBanned)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: u.isBanned ? '#2AABEE' : '#FF3B30', color: '#fff', cursor: 'pointer', fontSize: 12 }}>{u.isBanned ? 'Разбанить' : 'Забанить'}</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
