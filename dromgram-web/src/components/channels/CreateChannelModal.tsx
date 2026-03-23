import { useState, useRef } from 'react';
import api from '../../api/axios';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated?: (channel: any) => void;
}

export default function CreateChannelModal({ isOpen, onClose, onChannelCreated }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Название канала обязательно');
      return;
    }

    if (isPublic && !username.trim()) {
      setError('Имя пользователя обязательно для публичных каналов');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('isPublic', String(isPublic));
      if (isPublic) formData.append('username', username);
      if (avatar) formData.append('avatar', avatar);

      const response = await api.post('/channels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        onChannelCreated?.(response.data.data);
        setName('');
        setDescription('');
        setUsername('');
        setAvatar(null);
        setAvatarPreview('');
        onClose();
      } else {
        setError(response.data.message || 'Ошибка создания канала');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-background)',
          borderRadius: 12,
          padding: 20,
          width: '90%',
          maxWidth: 400,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: 'var(--color-text)', margin: '0 0 16px 0', fontSize: 20 }}>
          Создать канал
        </h2>

        {/* Avatar Upload */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '2px dashed var(--color-divider)',
              background: avatarPreview ? 'transparent' : 'var(--color-background-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              fontSize: 32,
            }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              '📷'
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Channel Name */}
        <input
          type="text"
          placeholder="Название канала"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: 12,
            border: '1px solid var(--color-divider)',
            borderRadius: 8,
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />

        {/* Description */}
        <textarea
          placeholder="Описание канала (опционально)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: 12,
            border: '1px solid var(--color-divider)',
            borderRadius: 8,
            background: 'var(--color-background-secondary)',
            color: 'var(--color-text)',
            fontSize: 14,
            minHeight: 80,
            boxSizing: 'border-box',
            fontFamily: 'inherit',
          }}
        />

        {/* Public/Private Toggle */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: 'var(--color-text)', fontSize: 14, flex: 1 }}>Публичный канал</label>
          <button
            onClick={() => setIsPublic(!isPublic)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              border: 'none',
              background: isPublic ? '#2AABEE' : 'var(--color-divider)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'white',
                top: 2,
                left: isPublic ? 22 : 2,
                transition: 'left 0.2s',
              }}
            />
          </button>
        </div>

        {/* Username (for public channels) */}
        {isPublic && (
          <input
            type="text"
            placeholder="Имя пользователя (например: mychannel)"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            style={{
              width: '100%',
              padding: '10px 12px',
              marginBottom: 12,
              border: '1px solid var(--color-divider)',
              borderRadius: 8,
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        )}

        {/* Error message */}
        {error && (
          <div style={{
            padding: 8,
            marginBottom: 12,
            borderRadius: 6,
            background: 'rgba(255,0,0,0.1)',
            color: '#ff4444',
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 8,
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              opacity: loading ? 0.5 : 1,
            }}
          >
            Отмена
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            style={{
              flex: 1,
              padding: '10px 16px',
              border: 'none',
              borderRadius: 8,
              background: '#2AABEE',
              color: 'white',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              opacity: loading || !name.trim() ? 0.5 : 1,
            }}
          >
            {loading ? 'Создание...' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}
