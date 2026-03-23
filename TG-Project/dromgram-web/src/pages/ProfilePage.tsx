import { useParams, useNavigate } from 'react-router-dom';
import ProfileView from './ProfileView';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!id) {
    navigate('/');
    return null;
  }

  const isSelf = user?.id === id;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', width: '100%' }}>
        <ProfileView
          userId={id}
          onClose={() => navigate(-1)}
          isSelf={isSelf}
        />
      </div>
    </div>
  );
}
