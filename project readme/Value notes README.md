# 🔐 Vault Notes - Chrome Extension

A professional Chrome extension for managing notes, links, and code snippets with beautiful animations and optional cloud sync.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Technologies Used](#️-technologies-used)
- [⚙️ How It Works](#️-how-it-works)
- [🚀 Installation](#-installation)
- [📖 Usage](#-usage)
- [🔧 Development Setup](#-development-setup)
- [🔥 Firebase Setup](#-firebase-setup)
- [🏗️ Build Process](#️-build-process)
- [💡 Tips](#-tips)
- [🔒 Privacy](#-privacy)
- [🐛 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)

---

## ✨ Features

- 📝 **Notes** - Save important ideas and reminders
- 🔗 **Links** - Organize important URLs with quick access
- 💻 **Snippets** - Store code blocks with syntax highlighting and language tags
- 🔍 **Search** - Instant search across all content, titles, and tags
- ⭐ **Favorites** - Pin important items for quick access
- 🏷️ **Tags** - Organize with custom tags and comma-separated input
- ☁️ **Cloud Sync** - Optional cross-device synchronization via Firebase
- 💾 **Backup** - Export/import your data as JSON files
- 🎨 **Beautiful UI** - Modern interface with smooth animations using Framer Motion
- 📱 **Responsive** - Works seamlessly in Chrome's extension popup
- 🔄 **Real-time Sync** - Automatic sync when signed in and data changes

---

## 🏗️ Architecture

Vault Notes is built as a Manifest V3 Chrome extension with the following components:

### Extension Structure
```
vault-notes-extension/
├── manifest.json          # Extension manifest (permissions, icons, popup)
├── background.js          # Service worker (built from src/background/)
├── index.html             # Popup HTML entry point
├── assets/                # Built CSS, JS, and icons
└── src/
    ├── popup/             # React popup UI
    │   ├── App.tsx        # Main React component
    │   ├── index.css      # Tailwind CSS styles
    │   └── main.tsx       # React entry point
    ├── background/        # Background service worker
    │   └── index.ts       # Background script
    └── common/            # Shared utilities
        ├── types.ts       # TypeScript interfaces
        ├── storage.ts     # Local/Chrome storage management
        ├── firebase.ts    # Firebase auth and Firestore sync
        └── importExport.ts # Backup/restore functionality
```

### Data Flow
1. **Local Storage**: Data is stored in Chrome's `chrome.storage.sync` API for cross-device sync within Chrome
2. **Cloud Sync**: When authenticated, data is automatically synced to Firebase Firestore
3. **Backup**: JSON export/import for manual backups
4. **State Management**: React hooks manage UI state, with automatic persistence

---

## 🛠️ Technologies Used

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth transitions

### Build Tools
- **Vite** - Fast build tool and dev server
- **PostCSS** - CSS processing with Autoprefixer
- **ESLint** - Code linting (implied by TypeScript)

### Backend/Storage
- **Firebase Auth** - User authentication
- **Firebase Firestore** - Cloud database for sync
- **Chrome Storage API** - Local storage within Chrome

### Development
- **Canvas API** - Icon generation (create-icons.cjs)
- **Node.js** - Runtime for build scripts

---

## ⚙️ How It Works

### Core Functionality

1. **Data Storage**:
   - Items are stored as objects with: `id`, `type`, `title`, `content`, `tags`, `isFavorite`, `createdAt`, `updatedAt`
   - Links have an optional `url` field
   - Snippets have an optional `language` field for syntax highlighting
   - Data is stored in `chrome.storage.sync` for local persistence

2. **Authentication & Sync**:
   - Firebase Auth handles user registration/login
   - User data is stored in Firestore under `users/{userId}`
   - Real-time sync occurs on data changes when authenticated
   - Auth state is watched to automatically load cloud data on login

3. **UI Components**:
   - Tabbed interface for Notes/Links/Snippets
   - Modal forms for creating/editing items
   - Search and sort functionality
   - Settings dropdown for auth and backup options

4. **Search & Filtering**:
   - Searches across title, content, and tags
   - Case-insensitive matching
   - Real-time filtering as you type

5. **Backup System**:
   - Export: Downloads JSON file with all data
   - Import: Validates and merges imported data
   - Automatic storage update after import

### Extension Lifecycle

1. **Installation**: Background script logs installation
2. **Popup Open**: React app loads, reads storage, initializes UI
3. **User Interaction**: CRUD operations update local storage
4. **Auth Changes**: Sync to/from cloud when user logs in/out
5. **Data Changes**: Automatic cloud sync if authenticated

---

## 🚀 Installation

### For Users

1. **Download the Extension**
   - Get the `dist` folder from the built extension

2. **Load in Chrome**
   - Open Chrome and go to: `chrome://extensions/`
   - Enable **Developer mode** (toggle in top right)
   - Click **Load unpacked**
   - Select the `dist` folder
   - Done! The Vault Notes icon appears in your toolbar

3. **Pin the Extension** (Optional)
   - Click the puzzle icon 🧩 in Chrome toolbar
   - Find "Vault Notes" and click the pin 📌

### For Developers

See [Development Setup](#-development-setup) below.

---

## 📖 Usage

### Basic Usage (No Sign-Up Required)

1. **Create Items**
   - Click the **+** button at bottom right
   - Choose type: Notes, Links, or Snippets
   - Fill in title and content
   - Add tags (comma-separated)
   - Click **Save**

2. **Manage Items**
   - ⭐ Star to favorite
   - ✏️ Edit item
   - 📋 Copy to clipboard
   - 🗑️ Delete item

3. **Search & Sort**
   - Type in search bar to filter
   - Use dropdown to sort by date, title, or favorites

**Your data is automatically saved locally in Chrome.**

### Cloud Sync (Optional)

Want to access your notes on multiple devices?

1. **Sign Up**
   - Click the ⚙️ **Settings** icon
   - Click **🔐 Sign In**
   - Switch to **Sign Up** tab
   - Enter email and password
   - Click **Sign Up**

2. **Sign In on Other Devices**
   - Install the extension on another device
   - Click **🔐 Sign In**
   - Use the same email/password
   - Your data syncs automatically!

**Status indicator shows:**
- 🟢 "Synced with Chrome Storage" (local only)
- 🟢 "Synced with Cloud" (when signed in)

### Backup & Restore

**Export Data:**
1. Click ⚙️ Settings
2. Click **💾 Export Data**
3. JSON file downloads automatically

**Import Data:**
1. Click ⚙️ Settings
2. Click **📂 Import Data**
3. Select your backup JSON file

---

## 🔧 Development Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome browser

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/vault-notes-extension.git
   cd vault-notes-extension
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   This starts Vite dev server with hot reload.

4. **Load extension in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked"
   - Select the project root folder (not `dist`)
   - The extension will reload automatically on changes

5. **Build for production**
   ```bash
   npm run build
   ```
   Built files are in the `dist` folder.

### Project Structure Details

- `src/popup/App.tsx` - Main UI logic, state management, Firebase integration
- `src/common/storage.ts` - Abstraction over Chrome storage API with localStorage fallback
- `src/common/firebase.ts` - Firebase Auth and Firestore operations
- `src/common/types.ts` - TypeScript interfaces for data structures
- `vite.config.ts` - Build configuration for popup and background scripts

---

## 🔥 Firebase Setup

For cloud sync functionality, you need to set up Firebase. Follow the detailed guide in [FIREBASE_SETUP.md](FIREBASE_SETUP.md).

**Quick steps:**
1. Create Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Update security rules
5. Copy config to `src/common/firebase.ts`

---

## 🏗️ Build Process

The project uses Vite for building:

1. **Entry Points**:
   - Popup: `index.html` → React app
   - Background: `src/background/index.ts` → `background.js`

2. **Build Output**:
   - `dist/index.html` - Popup HTML
   - `dist/background.js` - Service worker
   - `dist/assets/` - CSS, JS chunks, icons

3. **Icon Generation**:
   - Run `node create-icons.cjs` to generate PNG icons from SVG
   - Icons are placed in `public/` and copied to `dist/`

---

## 💡 Tips

- Use **tags** to organize related items (e.g., "work", "personal", "urgent")
- **Favorite** important items for quick access
- **Export** regularly to backup your data
- **Cloud sync** works across any browser/device with the same account
- **Search** works across titles, content, and tags simultaneously
- **Copy to clipboard** works for both content and URLs (for links)

---

## 🔒 Privacy

- **Local First**: All data stored locally by default using Chrome's storage API
- **Cloud Optional**: Cloud sync is completely optional and user-initiated
- **No Tracking**: No analytics or tracking of any kind
- **Your Data**: Data belongs to you - export anytime, delete anytime
- **Secure**: Firebase security rules ensure users can only access their own data

---

## 🐛 Troubleshooting

**Extension not loading?**
- Make sure you selected the `dist` folder (not the root folder) when loading unpacked
- Check that Developer mode is enabled in `chrome://extensions/`
- Try refreshing the extension or reloading the page

**Can't sign in?**
- Check your internet connection
- Make sure you're using the email/password you signed up with
- Verify Firebase project is correctly configured

**Lost data?**
- Import from your last export/backup
- Check if you're signed into the correct account
- Data is stored in Chrome storage - clearing browser data will delete it

**Build issues?**
- Make sure Node.js 16+ is installed
- Run `npm install` to ensure all dependencies are installed
- Check that Firebase config is properly set up

---

## 📄 License

MIT License - Free to use and modify

---

<div align="center">

**Made with ❤️ for productivity**

⭐ Star this project if you find it useful!

[GitHub Repository](https://github.com/yourusername/vault-notes-extension)

</div>
