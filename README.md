# 🚀 PasteFlow

**The Ultimate Code Sharing Platform with Enterprise-Grade Security & Collaboration**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.5-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)](https://tailwindcss.com/)
[![Redux](https://img.shields.io/badge/Redux-9.2.0-764ABC.svg)](https://redux.js.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

PasteFlow is a modern, feature-rich paste application that goes beyond simple code sharing. Built with cutting-edge technologies, it provides enterprise-grade security, real-time collaboration, and intelligent organization features for developers, teams, and organizations.

## ✨ Features

### 🔐 **End-to-End Encryption**
- **AES-256 encryption** with PBKDF2 key derivation
- **Client-side encryption** - server never sees unencrypted content
- **Password protection** for sensitive pastes
- **Secure key generation** and IV management
- **Zero-knowledge architecture** for maximum privacy

### 🎨 **Rich Syntax Highlighting**
- **Auto-detection** of 30+ programming languages
- **Beautiful syntax highlighting** with multiple themes (light/dark)
- **Line numbers** with click-to-copy functionality
- **Language-specific patterns** for accurate detection
- **Theme switching** capability
- **Copy line functionality** for easy code sharing

### ⏰ **Smart Expiry & Access Controls**
- **Time-based expiry** (1 hour, 1 day, 1 week, 1 month, custom)
- **View-count limits** (self-destruct after X views)
- **Password protection** for access control
- **Domain restrictions** for enterprise use
- **Real-time expiry tracking** with countdown timers
- **Access control indicators** in the UI

### 👥 **Real-time Collaboration**
- **Multi-user editing** with live cursors
- **Real-time comments** and discussions
- **User presence indicators** (who's viewing/typing)
- **Socket.io integration** for real-time communication
- **Collaboration room management**
- **User join/leave notifications**

### 🔍 **Powerful Search & Organization**
- **Full-text search** across all pastes
- **Advanced filtering** by tags, category, language, date
- **Smart suggestions** and autocomplete
- **Favorites system** with star/unstar functionality
- **Recently viewed** tracking
- **Tag management** with add/remove capabilities
- **Category organization** system
- **Sorting options** (by date, title, views, language)

## 🎯 Use Cases

### 👨‍💻 **Individual Developers**
- **Code snippet sharing** with colleagues and communities
- **Personal knowledge base** with organized pastes
- **Secure sharing** of sensitive code or configurations
- **Portfolio showcasing** with beautiful syntax highlighting

### 👥 **Development Teams**
- **Team collaboration** on code reviews and discussions
- **Knowledge sharing** within the organization
- **Secure internal documentation** with access controls
- **Code templates** and reusable snippets

### 🏢 **Enterprises**
- **Secure code sharing** with domain restrictions
- **Compliance-ready** encryption for sensitive data
- **Team workspaces** with role-based access
- **Audit trails** and access logging

### 🌐 **Open Source Communities**
- **Public code sharing** with beautiful presentation
- **Community discussions** through comments
- **Educational content** with syntax highlighting
- **Bug reports** with formatted code examples

## 🚀 Benefits

### 🔒 **Security First**
- **End-to-end encryption** ensures your code stays private
- **Zero-knowledge architecture** - we can't see your content
- **Access controls** for different security levels
- **Domain restrictions** for enterprise compliance

### ⚡ **Performance Optimized**
- **Client-side processing** for fast operations
- **Debounced search** for smooth user experience
- **Efficient state management** with Redux
- **Optimized rendering** with React best practices

### 🎨 **Developer Experience**
- **Beautiful UI** with modern design principles
- **Keyboard shortcuts** for power users
- **Responsive design** works on all devices
- **Accessibility features** for inclusive usage

### 🔧 **Extensible Architecture**
- **Modular service architecture** for easy maintenance
- **Plugin-ready design** for future enhancements
- **API-first approach** for integrations
- **Clean codebase** with TypeScript-ready structure

## 🛠️ Local Setup

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **npm** (v7.0.0 or higher) or **yarn**
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Niraj123466/PasteFlow.git
   cd PasteFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Build for Production

```bash
npm run build
# or
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

## 📁 Project Structure

```
PasteFlow/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Home.jsx       # Paste creation component
│   │   ├── Paste.jsx      # Paste listing component
│   │   ├── ViewPaste.jsx  # Paste viewing component
│   │   ├── Navbar.jsx     # Navigation component
│   │   ├── CollaborationPanel.jsx # Real-time collaboration
│   │   └── useDebounce.jsx # Custom hook
│   ├── features/          # Redux features
│   │   └── paste/
│   │       └── pasteSlice.js # Paste state management
│   ├── services/          # Business logic services
│   │   ├── encryptionService.js      # AES encryption
│   │   ├── syntaxHighlightingService.jsx # Code highlighting
│   │   ├── expiryService.js          # Expiry management
│   │   ├── searchOrganizationService.js # Search & organization
│   │   └── collaborationService.js   # Real-time collaboration
│   ├── redux/            # Redux store configuration
│   │   └── store.js
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── README.md            # Project documentation
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Development settings
VITE_APP_NAME=PasteFlow
VITE_APP_VERSION=1.0.0

# Collaboration server (optional)
VITE_COLLABORATION_SERVER_URL=http://localhost:3001

# Encryption settings
VITE_ENCRYPTION_ITERATIONS=1000
VITE_ENCRYPTION_KEY_SIZE=256
```

### Customization

- **Themes**: Modify `src/index.css` for custom color schemes
- **Languages**: Add new languages in `src/services/syntaxHighlightingService.jsx`
- **Expiry Options**: Customize in `src/services/expiryService.js`
- **UI Components**: Modify components in `src/components/`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository** to Vercel
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Deploy** with automatic updates on push

### Netlify

1. **Connect your GitHub repository** to Netlify
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
3. **Deploy** with automatic updates on push

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - The frontend framework
- **Vite** - The build tool
- **Tailwind CSS** - The styling framework
- **Redux Toolkit** - State management
- **React Syntax Highlighter** - Code highlighting
- **Crypto-JS** - Encryption functionality
- **Socket.io** - Real-time collaboration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Niraj123466/PasteFlow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Niraj123466/PasteFlow/discussions)
- **Email**: niraj123466@gmail.com

## 🎉 Changelog

### v1.0.0 (September 15, 2024)
- ✨ Initial release
- 🔐 End-to-end encryption
- 🎨 Syntax highlighting with 30+ languages
- ⏰ Smart expiry and access controls
- 👥 Real-time collaboration
- 🔍 Advanced search and organization
- 📱 Responsive design
- ♿ Accessibility features

---

**Made with ❤️ by [Niraj Vaijinath More](https://github.com/Niraj123466)**

*PasteFlow - Where code meets collaboration* 🚀