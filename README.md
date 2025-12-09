# Gamut Claims Management System

A modern claims management application for restoration services, built with React, Firebase, and TailwindCSS.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **UI Components**: Headless UI, Lucide React
- **Charts**: Recharts
- **Routing**: React Router v7

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Java JDK** (v11 or higher) - Required for Firebase Emulators

## 🛠️ Installation

1. **Clone the repository** (if applicable)
   ```bash
   git clone <repository-url>
   cd Gamut-MGMT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🔥 Development Setup

### Option 1: Run Everything at Once (Recommended)

Start both the Firebase emulators and the dev server concurrently:

```bash
npm run dev:full
```

This will:
- Start Firebase Emulators (Auth, Firestore, Storage)
- Start the Vite dev server
- Import/export emulator data automatically

### Option 2: Run Separately

**Terminal 1 - Start Firebase Emulators:**
```bash
npm run emulators
```

**Terminal 2 - Seed the Database (first time only or when you need fresh data):**
```bash
npm run seed
```

**Terminal 3 - Start Dev Server:**
```bash
npm run dev
```

## 🌐 Access Points

Once running, you can access:

- **Application**: [http://localhost:5173](http://localhost:5173)
- **Firebase Emulator UI**: [http://localhost:4000](http://localhost:4000)
- **Firestore Emulator**: `localhost:8080`
- **Auth Emulator**: `localhost:9099`
- **Storage Emulator**: `localhost:9199`

## 👥 Test User Credentials

The seed script creates the following test users:

| Email | Password | Role | Team | Admin Rights |
|-------|----------|------|------|--------------|
| `owner@gamut.com` | `owner123` | Organization Owner | None | ✅ Yes |
| `manager1@gamut.com` | `manager123` | Manager | Water Damage Team | ❌ No |
| `manager2@gamut.com` | `manager123` | Manager | Fire Restoration Team | ✅ Yes |
| `member@gamut.com` | `member123` | Team Member | Water Damage Team | ❌ No |

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run emulators` | Start Firebase emulators with data import/export |
| `npm run seed` | Seed emulator with test data |
| `npm run dev:full` | Start emulators + dev server concurrently |

## 📁 Project Structure

```
Gamut-MGMT/
├── src/
│   ├── components/      # React components
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── pages/           # Page components
│   ├── lib/             # Utilities and Firebase config
│   └── App.jsx          # Main app component
├── scripts/
│   ├── seedEmulator.js  # Database seeding script
│   └── listCollections.js
├── public/              # Static assets
├── firebase.json        # Firebase configuration
├── firestore.rules      # Firestore security rules (development)
├── firestore.rules.production  # Production security rules
└── storage.rules        # Storage security rules
```

## 🗄️ Seeded Data

The seed script (`npm run seed`) creates:

- **1 Organization**: Restoration Pro Services
- **5 Teams**: Water Damage, Fire Restoration, Mold Remediation, Storm Damage, General Restoration
- **4 Users**: Owner, 2 Managers, 1 Team Member
- **6 Claims**: Various restoration claims with different statuses
- **3 Comments**: Sample comments on claims

### Claim Statuses

- `pending_review` - Awaiting initial review
- `under_review` - Currently being reviewed
- `approved` - Approved for processing
- `rejected` - Rejected with reason
- `sent_to_insurance` - Submitted to insurance

## 🔒 Security Rules

- **Development**: Uses `firestore.rules` (more permissive for testing)
- **Production**: Uses `firestore.rules.production` (strict RBAC)

## 🐛 Troubleshooting

### Emulators won't start
- Ensure Java JDK is installed: `java -version`
- Check if ports are already in use (4000, 8080, 9099, 9199)
- Try: `firebase emulators:start --clear-data`

### Seed script fails
- Make sure emulators are running first
- Check that you're using the correct project ID: `demo-gamut-claims`

### Can't see data in Emulator UI
- Verify you ran the seed script: `npm run seed`
- Check browser console for errors
- Ensure project ID matches in all configs

## 📝 RBAC (Role-Based Access Control)

See [RBAC.md](./RBAC.md) for detailed information about roles and permissions.

## 🚢 Production Deployment

Before deploying to production:

1. Update Firebase project ID in `.firebaserc`
2. Switch to production security rules
3. Build the application: `npm run build`
4. Deploy: `firebase deploy`

## 📄 License

[Add your license here]
