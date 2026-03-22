import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const navigate = useNavigate();
  const name = user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : '';
  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      <div className="bg-white dark:bg-[#232E3C] rounded-2xl p-4 mb-4 flex items-center gap-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">{name[0] || 'U'}</div>
        <div><p className="font-semibold text-lg">{name}</p><p className="text-[#8D8D8D] text-sm">{user?.username ? `@${user.username}` : user?.phone}</p></div>
      </div>
      <div className="bg-white dark:bg-[#232E3C] rounded-2xl divide-y dark:divide-[#2C3E50]">
        <div className="p-4 flex items-center justify-between">
          <span className="font-medium">Тема</span>
          <select value={theme} onChange={e => setTheme(e.target.value as any)} className="bg-transparent text-[#8D8D8D] focus:outline-none">
            <option value="system">Системная</option>
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <button onClick={() => { logout(); navigate('/auth'); }} className="w-full p-4 text-left text-red-500 font-medium">Выйти из аккаунта</button>
      </div>
    </div>
  );
}
