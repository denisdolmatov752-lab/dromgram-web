# DRomGram UI/UX Requirements - Complete List

## РАЗДЕЛ 2: DESIGN SYSTEM REQUIREMENTS

### 2.2 COLOR PALETTE - LIGHT THEME
- Primary blue accent: #2AABEE
- Pressed state (dark blue): #1A8AC4
- Main background: #FFFFFF
- Secondary background: #F0F2F5
- Chat background (pattern/color): #E3EDF7
- Navbar background: #FFFFFF
- Navbar border: #E0E0E0
- Active navbar icon: #2AABEE
- Inactive navbar icon: #8D8D8D
- Chat name text: #000000
- Message preview text: #8D8D8D
- Chat time text: #8D8D8D
- Unread badge: #2AABEE (with white numbers)
- Muted badge: #B2BAC2
- Chat row highlight: #E8F4FD
- Outgoing bubble: #EFFFDE
- Incoming bubble: #FFFFFF
- Bubble text: #000000
- Outgoing message time: #4FAB83
- Incoming message time: #8D8D8D
- Delivered ticks: #4FAB83
- Read ticks: #2AABEE
- Links: #2AABEE
- Input field background: #FFFFFF
- Input field border: #E0E0E0
- Placeholder text: #AAAAAA
- Send button: #2AABEE
- Attach button: #8D8D8D
- Dividers: #E0E0E0
- Primary button: #2AABEE (white text)
- Destructive button: #FF3B30 (red, white text)
- Secondary button: #F0F2F5 (dark text)
- Online indicator: #2AABEE
- Avatar colors (no photo): #FF516A, #FF7519, #EBAC00, #26B35E, #00B9FF, #0072BB, #6B72FF, #FF5DA2, #E11584

### 2.3 COLOR PALETTE - DARK THEME
- Main background: #17212B
- Secondary background: #232E3C
- Card surface: #1E2C3A
- Navbar: #17212B
- Chat background: #0F1923
- Outgoing bubble: #2B5278
- Incoming bubble: #1E2C3A
- Primary text: #FFFFFF
- Secondary text: #8D8D8D
- Dividers: #2C3E50
- Input field: #1E2C3A
- Accent buttons: #2AABEE

### 2.4 TYPOGRAPHY
- Font family: Inter (Google Fonts) for mobile and web
- Fallback: Roboto (Android), -apple-system (iOS)
- Hero titles: 28sp/28px - weight 700 (Bold)
- H1 titles: 22sp/22px - weight 600 (SemiBold)
- H2 subtitles: 18sp/18px - weight 600
- Chat name: 15sp/15px - weight 500 (Medium)
- Message text: 16sp/16px - weight 400 (Regular)
- Chat preview: 14sp/14px - weight 400
- Time/metadata: 13sp/13px - weight 400
- Badge: 11sp/11px - weight 700
- Line height: 1.4 for body, 1.2 for caption

### 2.5 SPACING & SIZING
- Base grid: 4dp
- Padding: XS=4dp, S=8dp, M=12dp, L=16dp, XL=20dp, XXL=24dp
- Border radius: XS=4dp, S=8dp, M=12dp, L=16dp, XL=20dp, Circle=999dp
- Chat avatar: 46dp circle
- Profile avatar: 120dp circle
- Message avatar: 36dp circle
- AppBar height: 56dp
- BottomNav height: 64dp
- Message bubble max width: 280dp
- Bubble padding: 12dp horizontal, 8dp vertical
- Standard icons: 24dp
- Navbar icons: 24dp with 10sp label

### 2.6 ANIMATIONS & TRANSITIONS
- Chat open: slide left + fade, 250ms, easeInOutCubic
- Chat close: slide right + fade, 200ms
- Profile open: slide left, 250ms
- Settings open: slide left, 250ms
- Tab switch: fade + scale 0.97→1.0, 150ms
- Bubble appear: scale 0.85→1 + fade, 200ms, easeOutBack
- Menu appear: scale 0.5→1 + fade, 300ms
- Typing indicator: three dots pulsing sequentially, 400ms cycle
- Message send: bubble slides down, 150ms
- Bottom sheet: slide from bottom, 300ms, easeOutCubic
- Notification banner: slide top-to-bottom, 300ms
- Hero (avatar): standard Flutter Hero transition
- Swipe to reply: rubber band effect max 60dp, easeOut return
- Emoji reaction: fly up + fade, 600ms

### 2.6 HAPTIC FEEDBACK
- Send: HapticFeedback.lightImpact()
- Long press: HapticFeedback.mediumImpact()
- Delete: HapticFeedback.heavyImpact()
- New message: HapticFeedback.selectionClick()

### 2.7 ICONS
Bottom Navigation (5 tabs):
1. Contacts - person silhouette icon
2. Calls - phone icon
3. Messages - chat bubble icon (center, highlighted)
4. Channels - megaphone icon
5. Settings - gear icon

Chat AppBar icons:
- Back, Search, Video call, Voice call, Menu (three dots)

Message input icons:
- Attach (paperclip), Emoji (smiley), Microphone/Send (toggle)

Message status icons:
- Clock (sending), 1 gray tick (sent), 2 gray ticks (delivered), 2 blue ticks (read), Red ! (error)

---

## РАЗДЕЛ 3: ALL SCREENS & REQUIREMENTS

### 3.1 AUTHORIZATION SCREENS

**SCREEN 1: Splash Screen**
- DRomGram logo centered (animated appearance)
- Background: blue gradient #2AABEE → #1A8AC4
- Duration: 1.5 seconds, then auto-transition
- Auto-navigate to chats if authorized, otherwise to phone input
- Animation: logo scale 0→1 with easeOutBack, 600ms

**SCREEN 2: Country Selection & Phone Number Input**
- Title: "DRomGram" (large, blue)
- Subtitle: "Please confirm your country code and enter phone number"
- Country picker button (flag + name + code)
- Phone number field (country-specific mask)
- "Next" button (blue, full width, bottom)
- "Login via QR code" link
- Validation: number must be correct for selected country
- Button states: disabled until number entered, loading during request

**SCREEN 3: Country Selection Search**
- SearchBar at top
- Alphabetical list of countries with flags
- Quick scroll by letters on right (like contacts)
- Recently used countries at top
- Tap → return to screen 2 with selection

**SCREEN 4: OTP Code Input**
- Title: "Enter Code"
- Subtitle: "We sent SMS to +7 (XXX) XXX-XX-XX"
- 5 digit input fields (or masked single field)
- Auto-focus first field
- Auto-advance to next field
- Auto-verify on last digit entry
- 60-second countdown timer to resend
- "Resend code" button (inactive during timer)
- "Change number" button (back to screen 2)
- Error state: red border + "Invalid code" message
- Dev mode (ENABLE_SMS=false): code always 12345

**SCREEN 5: Registration (New Users Only)**
- Title: "Your Name"
- Subtitle: "Enter your name and add profile photo"
- Circular avatar field (tap → photo selection)
- "Name" field (required)
- "Last name" field (optional)
- "Done" button
- Validation: name 1-64 characters

**SCREEN 6: QR Code Login**
- Instructions: "Open Telegram on phone → Settings → Devices → Connect"
- QR code centered (updates every 30 seconds)
- QR update animation
- "Login by number" button (back to screen 2)

### 3.2 MAIN SCREENS (Bottom Navigation)

**SCREEN 7: Chat List (Main Screen)**

AppBar:
- Title: "DRomGram" or "Messages"
- Write message icon (right)
- Search icon (or built-in search)
- Sort/filter icon

Chat List Items:
- Avatar (46dp) left with online indicator
- Contact/group name (bold, 15sp)
- Last message preview (gray, 14sp, single line truncated)
- Last message time (13sp, gray, right)
- Unread badge (blue circle with number, right)
- Mute icon (if present)
- Pin icon (if pinned)
- Message status ticks (for outgoing)

Swipe Left Actions:
- Archive button (gray)
- Delete button (red)
- Mark read button (blue)

Swipe Right Actions:
- Pin button (blue)
- Mute button (gray)

Long Press:
- Context menu: Pin, Archive, Mute, Delete, Select

Tabs Above List:
- "All", "Personal", "Groups", "Channels", "Unread"

Chat Folders (Telegram Folders):
- Horizontal list under AppBar
- Each folder: icon + name + unread count

FAB (Floating Action Button):
- Blue write button bottom-right
- Tap → menu: New chat, New group, New channel

**SCREEN 8: Contacts**
- AppBar: "Contacts" + add contact icon
- Sections:
  - "Add contact" button (top)
  - "Find people nearby" (geolocation)
  - Alphabetical contact list
  - Each: avatar + name + username + online status
- Functions:
  - Search by name/username/number
  - Fast scroll by alphabet (right side)
  - Tap → open chat or view profile

**SCREEN 9: Calls**
- AppBar: "Calls" + new call icon
- Call list items:
  - Avatar + name + type (incoming/outgoing/missed) + date/time + duration
  - Icons: phone (voice) or camera (video)
  - Missed calls in red color
- Tap → redial
- "Favorite contacts" section at top

**SCREEN 10: Channels & Stories**
- Two tabs: "Channels" | "Stories"
- Channels: list with avatar, name, preview, subscriber count
- Stories: horizontal row of circles (like Instagram)
- Tap story → fullscreen view (SCREEN 37)

**SCREEN 11: Settings**
- Profile section top:
  - Large avatar (80dp) centered
  - Name (bold, 18sp)
  - Username (@username)
  - Phone number
  - Online status

Setting Sections:
- A. Account: Change number, Active sessions, Privacy & security, Cloud password (2FA)
- B. Appearance: Theme (Light/Dark/System), Text size, Accent color, Chat background
- C. Notifications: Personal messages, Groups, Channels, Calls
- D. Data & Storage: Memory usage, Auto-download media, Network settings
- E. Language
- F. Devices (active sessions)
- G. Premium (subscription)
- H. Help
- I. App version

---

### 3.3 CHAT SCREEN (DETAILED)

**SCREEN 12: Dialog (Private chat / Group / Channel)**

AppBar:
- Back button (arrow) with unread count badge
- Sender avatar (36dp, tappable → opens profile)
- Contact name (bold, 16sp)
- Status: "online" / "was X ago" / "typing..." / "N members"
- Icons: Video call, Voice call, Search, Menu

Message List (Chat Body):
- Background: pattern or color (#E3EDF7 light / #0F1923 dark)
- Date divider: "Today", "Yesterday", "Mar 12" - centered
- Incoming bubbles: left, white background, sharp bottom-left corner
- Outgoing bubbles: right, green (#EFFFDE), sharp bottom-right corner
- Group chat: sender name (blue) above incoming message
- Group chat: 36dp avatar next to incoming
- Max bubble width: 280dp (or 70% screen)

Message Types (All Implemented):
- A. Text: **bold**, _italic_, `monospace`, ~~strikethrough~~, ||spoiler||; links blue underlined; time+ticks at end (outgoing)
- B. Photo: rounded corners inside bubble, caption below, tap → fullscreen, download progress circle
- C. Video: preview frame + play icon center, duration bottom-right, tap → play/fullscreen
- D. Voice: sender avatar + play/pause button, waveform (blue/green when played), duration right, speed x1.0/x1.5/x2.0
- E. Video Note: 200dp round preview, play icon center, tap → play
- F. Document/File: file type icon + color, filename, file size, download button/progress
- G. Sticker: 200dpx200dp, no bubble (transparent background), animated (Lottie/WebP), tap → fullscreen
- H. GIF: auto-play in list, tap → fullscreen
- I. Location: mini-map with marker, address or coordinates, tap → Google Maps
- J. Contact: avatar + name + phone, buttons: "Add to contacts", "Message"
- K. Poll: question + options + vote count, tap option → vote, progress bars after voting
- L. Reply/Quote: mini-block above message, author name (blue) + text/photo preview, tap → scroll to original
- M. Forward: "Forwarded from [Name]" header + original content
- N. System: centered, gray text in pill, examples: "Chat created", "X added Y", "X left group"
- O. With Reactions: emoji + count under bubble (tap → list who reacted), tap emoji → add/remove reaction
- P. Pinned: panel at top: "Pinned message" + preview + close icon

Long Press on Message:
- Context menu: Reply, Copy, Forward, Pin, Edit (own only), Delete, Select, Message info, + reaction row at top

Swipe Right on Message:
- → Reply action

Loading States:
- Scroll up → load older messages
- "Loading..." indicator at top of list

Message Input Bar:
- Min height: 56dp, max: 200dp (auto-grow)
- Attach button (paperclip) → menu: Photo/Video, File, Audio, Location, Contact, Poll
- Text field with "Message..." placeholder
- Emoji button (smiley) → emoji picker
- Empty text: Microphone button (voice recording)
- With text: Send button (blue paper plane)
- Long press mic → record; swipe up → lock recording
- Above input on reply: Reply block with close button
- Above input on edit: "Editing" + cancel button

Scroll Buttons:
- FAB down arrow (appears when not at bottom)
- FAB mentions (appears if unread @mentions)
- Both: blue with badge counter

**SCREEN 13: User Profile**
- Hero-animated avatar (from chat list)
- Large avatar (120dp) top, tappable → fullscreen view
- Name + last name (bold, 22sp)
- Username (@dromgram_user)
- Phone number (if available per privacy settings)
- Status: "online" / "was X minutes ago" / custom status
- Action buttons: Message, Voice, Video, More (three dots)
- Info sections: Bio, Links in bio, Media preview
- Notifications toggle (mute)
- "Add to contacts" button (if not added)
- "Remove contact" button (if added)
- "Block" button (red)
- Shared media: photo grid (tap → gallery)
- Shared documents, links, audio

**SCREEN 14: Edit Profile**
- Avatar (tappable → change/delete)
- "Name" field (required, max 64 chars)
- "Last name" field (max 64)
- "Username" field (@, latin+digits+_, 5-32 chars, availability check)
- "Bio" field (max 70 chars, counter)
- "Phone number" field (read-only, "Change" button)
- "Save" button (if changes exist)

**SCREEN 15: Group/Channel Info**
- Large group avatar (Hero)
- Group name + edit icon (if admin)
- Group description
- Buttons: Chat search, Notifications, Add member, More
- Member list (avatar + name + role + online)
- Menu buttons: Edit, Leave, Delete (admin only)
- Media, documents, links

### 3.4 ADDITIONAL SCREENS

**SCREEN 16: Global Search**
- SearchBar in focus on open
- Tabs: All, Chats, Media, Files, Links, Audio, Users
- Real-time results (300ms debounce)
- Found text highlighted in preview

**SCREEN 17: Media Viewer (Photo/Video)**
- Fullscreen, dark background
- Pinch-to-zoom (scaling by pinch)
- Swipe left/right → switch between media
- Swipe down → close (dismiss)
- Top: sender name + date
- Bottom: Share, Download, Forward, Delete buttons
- For video: playback controls

**SCREEN 18: Voice Message Recording**
- Wave animation (volume visualization)
- Recording timer
- Cancel button (left) and send button (right)
- Lock button (top - for hands-free recording)
- Preview: play before sending

**SCREEN 19: Sticker/Emoji/GIF Picker**
- Three tabs: Emoji | Stickers | GIF
- Emoji: categories (smileys, gestures, animals, etc.)
- Stickers: my packs + search + trending
- GIF: search via Giphy API (or local cache)
- Recently used at top

**SCREEN 20: Create Group**
- Step 1: Select members (search contacts, checkboxes)
- Step 2: Group name + avatar
- Step 3: Create (POST /api/groups)

**SCREEN 21: Create Channel**
- Channel name (required)
- Type: Public (with username) / Private
- Description (optional)
- Add administrators

**SCREEN 22: Privacy & Security Settings**
- Who sees phone number: Everyone / My contacts / Nobody
- Who sees online status: Everyone / My contacts / Nobody
- Who can add to groups: Everyone / My contacts
- Who can call: Everyone / My contacts / Nobody
- Two-factor authentication (cloud password)
- Active sessions (device list with terminate option)
- Blocked users

**SCREEN 23: Two-Factor Authentication (2FA)**
- Set cloud password
- Password hint
- Recovery email
- Change/Disable password

**SCREEN 24: Active Sessions (Devices)**
- Current device at top (highlighted)
- Other sessions list: device name, OS, IP, date
- "Terminate all other sessions" button
- Tap session → terminate specific session

**SCREEN 25: Notifications & Sounds**
- Personal chats: on/off, sound, vibration, preview
- Groups: on/off, sound, vibration, preview
- Channels: on/off, sound
- Calls: on/off, ringtone
- Notification sound picker

**SCREEN 26: Data & Storage**
- Usage: photos, videos, documents, audio (with progress bars)
- Cache: size + "Clear cache" button
- Auto-download: mobile network / WiFi / roaming (separate: photos, videos, files, audio)

**SCREEN 27: Themes**
- Light / Dark / System
- Accent color choice (8 variants + custom)
- Chat background: color / pattern / custom photo
- Text size: slider (12-20sp)
- Real-time preview

**SCREEN 28: Premium Subscription**
- List of Premium benefits
- Animated feature icons
- "Subscribe" button (placeholder for now)

**SCREEN 29: Gifts**
- List of available gifts with animation
- Send gift to friend
- History of sent/received gifts

**SCREEN 30: Call Screen (Voice/Video)**
- Incoming: avatar + name + Accept (green) / Decline (red) buttons
- Active voice: avatar, name, timer, buttons: Mute/Speaker/Video/Hang up
- Active video: full-screen video, PiP own video (120x160)
- Buttons: Mute, Camera on/off, Switch camera, Hang up

**SCREEN 31: Secret Chat**
- Visually identical to regular chat
- Lock icon in title
- E2E encryption (keys device-only)
- Disappearing messages: 1s/5s/1min/1hour/1day/1week timers
- No message forwarding
- Screenshot notification to peer

**SCREEN 32: Saved Messages**
- Personal "chat with self"
- All own messages (notes)
- Can forward anything to self

**SCREEN 33: Archive**
- List of archived chats
- Swipe right → unarchive

**SCREEN 34: Chat Folders**
- Create folder: name + icon + filters
- Filters: chat types, specific chats, exclusions
- Drag to reorder

**SCREEN 35: Forward Message**
- Chat list for forwarding (with search)
- Multi-select chats
- Add comment to forward

**SCREEN 36: Media Picker**
- Gallery grid (photos/videos)
- Multi-select (up to 10)
- Editor: crop, rotate, filters (photos)
- Add caption

**SCREEN 37: Stories**
- Fullscreen view
- Progress bar top (by segments)
- Tap right/left → next/prev story
- Hold → pause
- Swipe down → close
- React with emoji + text reply
- Create: photo/video from gallery, text, stickers

---

## РАЗДЕЛ 6: WEB VERSION REQUIREMENTS

### 6.3 RESPONSIVE LAYOUT REQUIREMENTS

**Desktop Layout (>= 768px)**
- Sidebar (360px fixed) + MainArea (flex-1 grow)
- Sidebar content: chat list + search + FAB + folders
- MainArea: open chat OR "Select chat" with logo
- 2-column layout visible simultaneously

**Mobile Layout (< 768px)**
- Single view: chat list OR open chat (not both)
- Bottom navigation bar (5 tabs)
- Animated transitions between screens
- Full viewport for each view
- No permanent sidebar

### 6.1 STRUCTURE & COMPONENTS

Key components for responsive design:
- Sidebar.tsx: collapsible/hidden on mobile
- MainArea.tsx: full width on mobile
- BottomNav.tsx: mobile navbar (5 tabs)
- ChatList.tsx: scrollable list
- MessageList.tsx: scrollable with infinite loading
- MessageInputBar.tsx: sticky bottom, grows with text

### 6.2 CSS VARIABLES (THEMES)

Light theme (:root):
- --color-primary: #2AABEE
- --color-primary-dark: #1A8AC4
- --color-bg: #FFFFFF
- --color-bg-secondary: #F0F2F5
- --color-chat-bg: #E3EDF7
- --color-text: #000000
- --color-text-secondary: #8D8D8D
- --color-divider: #E0E0E0
- --color-bubble-out: #EFFFDE
- --color-bubble-in: #FFFFFF
- --color-nav-bg: #FFFFFF
- --color-unread: #2AABEE
- --color-online: #2AABEE
- --radius-bubble: 12px
- --font-family: 'Inter', -apple-system, sans-serif

Dark theme (.dark):
- --color-bg: #17212B
- --color-bg-secondary: #232E3C
- --color-chat-bg: #0F1923
- --color-text: #FFFFFF
- --color-text-secondary: #8D8D8D
- --color-divider: #2C3E50
- --color-bubble-out: #2B5278
- --color-bubble-in: #1E2C3A
- --color-nav-bg: #17212B

---

## CRITICAL INTERACTION PATTERNS

### SWIPE GESTURES
- Swipe left on chat → archive/delete options
- Swipe right on chat → pin/mute options
- Swipe right on message → reply
- Swipe left/right on media viewer → navigate media
- Swipe down on media viewer → close
- Swipe up on microphone recording → lock recording
- Hold on microphone → start recording
- Long press on message → context menu

### BOTTOM NAVIGATION
- 5 tabs: Contacts | Calls | Messages (center) | Channels | Settings
- Active tab: blue icon (#2AABEE) + label
- Inactive: gray icon (#8D8D8D)
- Mobile only (< 768px width)
- Fixed at bottom, always visible
- Animated transitions between tabs

### RESPONSIVE BEHAVIOR
- Mobile viewport: single column, bottom nav, full-width content
- Tablet/Desktop viewport: sidebar + main area side-by-side
- Breakpoint: 768px (transition point)
- Touch targets: min 44x44dp for mobile
- No horizontal scroll on mobile
- Sidebar collapses/hides on mobile

### MENU ITEMS (Bottom Navigation)
1. **Contacts** - Browse and manage contacts
2. **Calls** - Call history and recent calls
3. **Messages** - Main chat list (center, highlighted)
4. **Channels** - Channels and Stories feed
5. **Settings** - User preferences and account

### MOBILE VIEWPORT REQUIREMENTS
- Min viewport width: 320px
- Max content width: 480px for optimal mobile experience
- Touch-friendly spacing: 12dp minimum between interactive elements
- Bottom nav: 64dp height
- AppBar: 56dp height
- Input field: min 56dp height (with padding)
- No text smaller than 13sp on mobile
- Landscape support: horizontal layout adjustments

---

## SUMMARY OF KEY REQUIREMENTS

**Responsive Design:**
- Mobile-first approach
- Breakpoint: 768px
- Two distinct layouts: mobile (single column + bottom nav) vs desktop (sidebar + main)

**Swipe Gestures:**
- Chat list: swipe left (archive/delete), swipe right (pin/mute)
- Message: swipe right (reply)
- Media: swipe (navigate/close)
- Voice recording: swipe up (lock)

**Bottom Navigation (Mobile):**
- 5 tabs: Contacts, Calls, Messages, Channels, Settings
- Always visible on mobile
- Animated active state
- Blue primary color for active, gray for inactive

**Mobile Viewport:**
- Minimum 320px, optimal 480px
- Full-width content (no sidebars)
- Touch targets: 44x44dp minimum
- AppBar 56dp, BottomNav 64dp

**Design System:**
- Inter font family, system fallbacks
- 8 color palettes (light + dark theme)
- Consistent spacing grid (4dp base)
- Smooth animations (200-300ms)
- Haptic feedback on interactions
