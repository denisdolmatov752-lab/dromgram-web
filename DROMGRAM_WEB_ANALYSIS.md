# DRomGram Web Project - Current State Analysis

## 1. AUTH STORE - User Object Fields

**File:** `/src/store/authStore.ts`

### User Interface Fields (Exact):
```typescript
interface User {
  id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string;
  avatarColor: string;
  isOnline: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}
```

### AuthStore Methods:
- `setToken(token: string)` - Set authentication token
- `setUser(user: User)` - Set user object
- `logout()` - Clear token and user (sets both to null)

### Storage:
- Uses Zustand with persist middleware
- Persists to localStorage as 'auth-storage'
- Only persists: `token` and `user` fields

---

## 2. CHATS STORE - Methods & Interfaces

**File:** `/src/store/chatsStore.ts`

### ChatsStore Methods (Exact):
1. `setChats(chats: Chat[])` - Replace entire chats list
2. `setActiveChat(chat: Chat | null)` - Set currently active chat
3. `addMessage(msg: Message)` - Add message to chat and update chat list
4. `updateMessage(msg: Message)` - Update existing message in chat
5. `deleteMessage(msgId: string, chatId: string)` - Delete message from chat
6. `setMessages(chatId: string, msgs: Message[])` - Bulk set messages for a chat
7. `setTyping(chatId: string, userId: string, isTyping: boolean)` - Track typing users
8. `incrementUnread(chatId: string)` - Increase unread count for chat
9. `clearUnread(chatId: string)` - Set unread count to 0

### Message Interface:
```typescript
interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: any;
  type: string;
  text?: string;
  mediaUrl?: string;
  status: string;
  replyTo?: any;
  reactions: any[];
  readByIds: string[];
  isEdited: boolean;
  createdAt: string;
}
```

### Chat Interface:
```typescript
interface Chat {
  id: string;
  type: string;
  name?: string;
  avatarUrl?: string;
  avatarColor?: string;
  members: any[];
  messages: Message[];
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  member?: any;
}
```

### State Structure:
```typescript
interface ChatsState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Record<string, Message[]>;  // keyed by chatId
  typingUsers: Record<string, string[]>; // keyed by chatId, value is array of userIds
}
```

---

## 3. SOCKET EVENTS

**File:** `/src/socket/socket.ts`

### Incoming Events (Listeners):
1. **`connect`** - Socket connection established
2. **`disconnect`** - Socket connection lost
3. **`new_message`** - New message received (payload: `{ message: Message }`)
4. **`message_updated`** - Message edited/updated (payload: `{ message: Message }`)
5. **`message_deleted`** - Message deleted (payload: `{ messageId: string, chatId: string }`)
6. **`typing_start`** - User started typing (payload: `{ chatId: string, userId: string }`)
7. **`typing_stop`** - User stopped typing (payload: `{ chatId: string, userId: string }`)
8. **`user_online`** - User came online (payload: `{ userId: string }`) ⚠️ STUBBED
9. **`user_offline`** - User went offline (payload: `{ userId: string }`) ⚠️ STUBBED

### Outgoing Events (Emitters):
1. **`join_chat`** - Join a chat room (payload: `{ chatId: string }`)
2. **`leave_chat`** - Leave a chat room (payload: `{ chatId: string }`)
3. **`typing_start`** - Notify others user is typing (payload: `{ chatId: string }`)
4. **`typing_stop`** - Notify others user stopped typing (payload: `{ chatId: string }`)
5. **`message_read`** - Mark message as read (payload: `{ messageId: string, chatId: string }`)

### Socket Configuration:
- **URL**: `import.meta.env.VITE_WS_URL || 'https://orproject.ru'`
- **Auth**: Bearer token in `auth.token` header
- **Transport**: WebSocket only
- **Reconnection**: Enabled (10 attempts, 2s delay)

---

## 4. API BASE URL & ENDPOINTS

**File:** `/src/api/axios.ts`

### Base URL:
```
import.meta.env.VITE_API_URL || 'https://orproject.ru/api'
```

### Axios Configuration:
- Timeout: 30 seconds
- Default header: `Content-Type: application/json`
- Auto-includes `Authorization: Bearer {token}` header
- 401 response → auto logout + redirect to `/auth`

### Known API Endpoints (from code):
- **`GET /messages/{chatId}`** - Fetch messages for a chat
- **`PUT /users/me`** - Update current user profile
- **`GET /users/me`** - Get current user data
- **`GET /contacts`** - List user contacts
- **`GET /gifts/:userId`** - Get user's received gifts
- **`POST /gifts`** - Send gift to user
- **`GET /chats`** - Fetch all chats

---

## 5. ROUTER SETUP

**File:** `/src/App.tsx`

### Routes:
| Route | Component | Protected | Purpose |
|-------|-----------|-----------|---------|
| `/auth` | `AuthPage` | ❌ | Phone/login page |
| `/auth/otp` | `OtpPage` | ❌ | OTP verification |
| `/auth/register` | `RegisterPage` | ❌ | User registration |
| `/*` (all others) | `MainPage` | ✅ | Main messenger interface |

### ProtectedRoute:
- Checks for token in authStore
- If no token → redirects to `/auth`
- If token exists → renders children

### Theme System:
- Uses `uiStore` for theme management
- Supports: 'dark', 'light', 'system'
- Applies `dark` class to `document.documentElement`

---

## 6. CURRENT STATUS - What's Working vs Stubbed

### ✅ FULLY WORKING:

#### Authentication Flow:
- Phone → OTP → Register → MainPage protected route
- Token persistence in localStorage
- Bearer token auto-injection in API requests
- 401 error handling with auto-logout

#### Chat System:
- Load messages from API (`GET /messages/{chatId}`)
- Real-time message receive via socket (`new_message`)
- Message display with timestamps, status icons (✓, ✓✓)
- Message reply functionality (replyToText, replyToId)
- Edited message indicator
- Typing indicators from other users
- Socket join/leave for chat rooms
- Auto-scroll to latest message

#### UI Components:
- Avatar component (with initials + online indicator)
- Message bubbles (incoming/outgoing with status)
- Settings panel with edit profile modal
- Responsive layout with bottom navigation
- Glass-morphism styling
- Dark theme support

#### Market/Gifts:
- NFT shop with categories and sorting
- Gift sending to contacts
- User stars display (cosmetic currency)
- Received gifts history tab

#### AI Assistant:
- OpenRouter API integration with Gemini 2.0 Flash
- System prompt configured for "DRomGram AI"
- Message history with streaming responses
- Quick action prompts
- Error handling for API failures

### ⚠️ STUBBED/INCOMPLETE:

#### Socket Events:
- **`user_online`** listener - Comment says "update user online status in store" but no implementation
- **`user_offline`** listener - Comment says "update user offline status" but no implementation
- No actual online/offline state updates in chats or UI

#### Features Not Implemented:
- Message search
- Message reactions (field exists but no UI)
- Message pinning
- Chat pinning/muting toggles (fields exist, no handlers)
- Voice/video calls
- Media sharing (images, files)
- Group chat creation UI
- Contact blocking (BlockedUsersModal exists but stubbed in SettingsPanel)
- User presence in chat member list

#### AI Assistant Features:
- No integration with main chat system (separate modal)
- No context awareness from selected chat
- No message sharing from assistant to chat
- No conversation history persistence

#### Performance:
- No pagination for message history
- No message caching optimization
- No lazy loading for chats

---

## 7. KEY DEPENDENCIES & VERSIONS

```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "zustand": "^4",
  "socket.io-client": "^4",
  "axios": "^latest",
  "date-fns": "^latest",
  "tailwindcss": "^3"
}
```

---

## 8. PROJECT STRUCTURE

```
/src
├── pages/
│   ├── MainPage.tsx          (1333 lines - main messenger UI)
│   ├── SettingsPanel.tsx     (679 lines - user settings, privacy)
│   ├── AIAssistantPanel.tsx  (281 lines - AI chat interface)
│   ├── MarketPanel.tsx       (549 lines - NFT shop & gifts)
│   ├── AuthPage.tsx
│   ├── OtpPage.tsx
│   └── RegisterPage.tsx
├── store/
│   ├── authStore.ts          (28 lines - user auth state)
│   ├── chatsStore.ts         (54 lines - chat/message state)
│   └── uiStore.ts            (theme state)
├── socket/
│   └── socket.ts             (60 lines - socket.io service)
├── api/
│   └── axios.ts              (27 lines - API client)
└── App.tsx                   (40 lines - router setup)
```

---

## 9. ENVIRONMENT VARIABLES REQUIRED

```env
VITE_API_URL=https://orproject.ru/api
VITE_WS_URL=https://orproject.ru
```

---

## 10. ISSUES & RECOMMENDATIONS

### High Priority:
1. **Online Status**: Implement `user_online` and `user_offline` socket handlers
2. **Message Pagination**: Current code loads all messages at once - will break with large chat histories
3. **API Key Exposure**: OpenRouter API key is hardcoded in AIAssistantPanel.tsx (line 9)
4. **Error Handling**: No global error boundary; API errors only logged to console in some places

### Medium Priority:
1. Media support (images, files) - fields exist but no implementation
2. Message search functionality
3. Typing indicator animation could be more visible
4. Contact search in MarketPanel could use debouncing

### Low Priority:
1. Message reactions UI
2. Chat pinning/muting toggles
3. Offline message queue

