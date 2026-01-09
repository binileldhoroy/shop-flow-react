# ShopFlow POS - Frontend

A modern, scalable React + TypeScript frontend application for the multi-company POS system.

## Tech Stack

- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router v6** for routing
- **Axios** for API communication
- **Bootstrap 5** for UI components
- **Bootstrap Icons** for icons
- **Vite** for fast development and building

## Features

- 🔐 JWT-based authentication
- 👥 Role-based access control (Super User, Admin, Manager, Cashier, Inventory Staff)
- 🏢 Multi-company support
- 📱 Responsive design
- 🎨 Premium UI/UX
- ⚡ Fast and optimized

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.development .env

# Update API URL in .env if needed
VITE_API_URL=http://localhost:8000
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── api/              # API configuration and services
├── assets/           # Static assets (styles, images)
├── components/       # Reusable components
│   ├── common/      # Common UI components
│   ├── layout/      # Layout components
│   └── features/    # Feature-specific components
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── routes/          # Routing configuration
├── store/           # Redux store and slices
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name

## Authentication

The app uses JWT tokens for authentication:
- Access token stored in localStorage
- Automatic token refresh
- Protected routes based on authentication status
- Role-based route access

## Roles & Permissions

- **Super User**: Manage multiple companies, full system access
- **Admin**: Full access within their company
- **Manager**: Most operations except company settings and deletions
- **Cashier**: Billing and invoices only
- **Inventory Staff**: Inventory management only

## License

Proprietary - All rights reserved
