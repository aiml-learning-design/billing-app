# Invokta Billing Portal

A modern billing and invoicing application built with React, TypeScript, and Vite.

## Technology Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **UI Library**: Material UI (MUI)
- **Routing**: React Router
- **Form Handling**: Formik with Yup validation
- **HTTP Client**: Axios
- **Authentication**: JWT

## Project Structure

```
invokta-billing-portal/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images and other assets
│   ├── components/      # Reusable components
│   │   ├── auth/        # Authentication components
│   │   ├── business/    # Business-related components
│   │   ├── invoices/    # Invoice components
│   │   ├── item/        # Item components
│   │   ├── layout/      # Layout components
│   │   └── shipping/    # Shipping components
│   ├── config/          # Configuration files
│   ├── contexts/        # React contexts
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── styles/          # Global styles
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   ├── index.tsx        # Entry point
│   └── theme.ts         # MUI theme configuration
├── .env                 # Environment variables
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── tsconfig.node.json   # TypeScript configuration for Node.js
└── vite.config.ts       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000.

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_API_URL=http://localhost:8080
VITE_NODE_ENV=development
```

## Features

- User authentication (login, register, forgot password)
- Business management
- Client management
- Invoice creation and management
- Item management
- Shipping details
- Payment accounts

## TypeScript Migration

This project was migrated from JavaScript to TypeScript to provide better type safety and developer experience. The migration included:

1. Adding TypeScript configuration files (tsconfig.json, tsconfig.node.json)
2. Converting JavaScript files (.js, .jsx) to TypeScript files (.ts, .tsx)
3. Adding type definitions for components, props, state, and functions
4. Updating the build system from Create React App to Vite

## License

This project is licensed under the MIT License.