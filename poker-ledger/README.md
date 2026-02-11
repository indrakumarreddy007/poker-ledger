# 🎰 Poker Ledger

A full-stack web application for tracking poker game sessions, buy-ins, cash outs, and player statistics with a casino-themed design.

![Poker Ledger](https://img.shields.io/badge/Poker-Ledger-gold)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![SQLite](https://img.shields.io/badge/SQLite-3-orange)

## Features

### Core Functionality
- 🔐 **User Authentication** - Register and login with JWT tokens
- 🎮 **Session Management** - Create and join poker sessions with unique codes
- 💰 **Buy-In System** - Request buy-ins that require admin approval
- 🔄 **Transferable Admin** - "Pass the Dealer Button" feature
- 💵 **Cash Out** - Record final stack amounts and calculate profits

### Analytics & Tracking
- 📊 **Profit/Loss Tracking** - Real-time P/L calculations
- 📈 **Charts & Graphs** - Monthly performance visualization
- 🏆 **Win Rate Statistics** - Track your performance over time
- 📜 **Session History** - View past game results

### Design
- 🎨 **Casino Theme** - Dark mode with gold accents
- ♠️ **Floating Poker Chips** - Animated background with card suits
- 📱 **Responsive Design** - Works on desktop and mobile

## Tech Stack

### Backend
- **Node.js** with Express
- **SQLite** database
- **JWT** authentication
- **bcryptjs** for password hashing

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/poker-ledger.git
cd poker-ledger
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
# Server will run on http://localhost:3001
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
# App will run on http://localhost:5173
```

3. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Sessions
- `GET /api/sessions` - List user's sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/join` - Join session by code
- `POST /api/sessions/:id/close` - Close session
- `POST /api/sessions/:id/transfer-admin` - Transfer admin rights

### Transactions
- `POST /api/transactions/buyin` - Request buy-in
- `POST /api/transactions/:id/approve` - Approve transaction
- `POST /api/transactions/:id/reject` - Reject transaction
- `POST /api/transactions/cashout` - Cash out
- `GET /api/transactions/session/:id/pending` - Get pending transactions
- `GET /api/transactions/analytics` - Get user analytics

## Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email
- `username` - Unique username
- `password` - Hashed password
- `avatar_url` - Profile avatar URL
- `created_at` - Timestamp

### Sessions
- `id` - UUID primary key
- `name` - Session name
- `status` - active/closed
- `current_admin_id` - Current admin user ID
- `join_code` - Unique join code
- `created_by` - Creator user ID
- `created_at` - Timestamp
- `closed_at` - Close timestamp

### Session Players
- `session_id` - Session ID
- `user_id` - User ID
- `total_buyin` - Total buy-in amount
- `current_stack` - Current stack
- `cash_out_amount` - Cash out amount
- `joined_at` - Timestamp

### Transactions
- `id` - UUID primary key
- `session_id` - Session ID
- `player_id` - Player user ID
- `amount` - Transaction amount
- `type` - buyin/cashout/addon
- `status` - pending/approved/rejected
- `created_at` - Timestamp
- `approved_at` - Approval timestamp
- `approved_by` - Approver user ID

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

## Deployment

### Backend Deployment
1. Set up a Node.js server (Heroku, Railway, VPS, etc.)
2. Set environment variables
3. Run `npm start`

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to a static hosting service (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

Made with ♠️ ♥️ ♣️ ♦️ by the Poker Ledger Team
