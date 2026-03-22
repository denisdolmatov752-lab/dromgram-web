import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
export default function ProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState<any>(null);
  useEffect(() => { api.get(`/users/${id}`).then(r => setUser(r.data.data)).catch(() => {}); }, [id]);
  const name = user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : '';
  if (!user) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">{name[0] || 'U'}</div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {user.username && <p className="text-[#8D8D8D]">@{user.username}</p>}
        {user.bio && <p className="mt-2 text-center text-[#8D8D8D]">{user.bio}</p>}
      </div>
    </div>
  );
}
