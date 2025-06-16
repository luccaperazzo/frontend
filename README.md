# Frontend - Fitness Training Platform

A modern React-based frontend application for a comprehensive fitness and training platform that connects trainers with clients for personalized fitness experiences.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Backend server running (see [backend README](../backend/README.md))

### Installation
```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

## 📋 Available Scripts

### `npm start`
Runs the app in development mode at `http://localhost:3000`
- Hot reload enabled
- Displays lint errors in console

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder
- Optimized and minified build
- Ready for deployment

### `npm run eject`
⚠️ **One-way operation!** Exposes all configuration files

## 🏗️ Technology Stack

- **Framework**: React 19.1.0
- **Routing**: React Router DOM 7.6.0
- **HTTP Client**: Axios 1.9.0
- **Forms**: React Hook Form 7.56.4 + Zod validation
- **Date Handling**: date-fns 4.1.0, dayjs 1.11.13
- **Icons**: Lucide React 0.511.0
- **Date Picker**: React DatePicker 8.4.0
- **Testing**: React Testing Library

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   ├── layout/         # Layout components
│   ├── trainers/       # Trainer-specific components
│   └── user/           # User/client components
├── assets/             # Static assets (images, icons)
├── utils/              # Utility functions
├── App.js              # Main application component
├── Layout.js           # Main layout wrapper
└── index.js            # Application entry point
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the frontend root directory:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Optional: Enable/disable features
REACT_APP_ENABLE_NOTIFICATIONS=true
REACT_APP_ENABLE_DARK_MODE=true
```

### API Integration
The frontend communicates with the backend API through:
- **Base URL**: Configured via `REACT_APP_API_URL`
- **Authentication**: JWT tokens stored in localStorage
- **HTTP Client**: Axios with interceptors for auth headers

## 🎯 Core Features

### For Clients
- **User Registration & Authentication**
- **Trainer Discovery & Profiles**
- **Booking System** - Schedule sessions with trainers
- **Session Management** - View upcoming/past sessions
- **Profile Management** - Personal information and preferences
- **Responsive Design** - Mobile-friendly interface

### For Trainers
- **Trainer Registration & Profiles**
- **Availability Management** - Set working hours and availability
- **Client Management** - View and manage client sessions
- **Session Scheduling** - Accept/decline booking requests
- **Profile Customization** - Showcase skills and experience

### Shared Features
- **Real-time Updates** - Session status changes
- **Date/Time Management** - Timezone-aware scheduling
- **Form Validation** - Robust input validation with Zod
- **Responsive UI** - Works on desktop, tablet, and mobile

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test --watchAll

# Run tests with coverage
npm test --coverage
```

### Testing Structure
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: User interaction flows
- **Mock Services**: API calls mocked for testing

## 🔍 Development Guidelines

### Code Style
- **ESLint**: Configured with React rules
- **Component Structure**: Functional components with hooks
- **State Management**: React hooks (useState, useEffect, useContext)
- **Styling**: CSS modules or styled-components

### Form Handling
- **React Hook Form**: For form state management
- **Zod Validation**: Schema-based validation
- **Error Handling**: User-friendly error messages

### API Calls
```javascript
// Example API call structure
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Date/Time Handling
```javascript
// Use dayjs for consistent date handling
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

// Always work with UTC times
const sessionTime = dayjs(dateString).utc();
```

## 🚀 Deployment

### Production Build
```bash
# Create production build
npm run build

# Serve build locally (optional)
npx serve -s build
```

### Deployment Options
- **Netlify**: Connect GitHub repo for automatic deployments
- **Vercel**: Import project for seamless deployment
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Traditional Hosting**: Upload `build` folder contents

### Environment Configuration
Set production environment variables:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

## 🔧 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Verify REACT_APP_API_URL in .env
echo $REACT_APP_API_URL
```

**2. Build Fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**3. Hot Reload Not Working**
```bash
# Restart development server
npm start
```

**4. Date/Time Issues**
- Ensure consistent timezone handling
- Check dayjs UTC plugin configuration
- Verify date format expectations with backend

### Browser Compatibility
- **Supported**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [React Hook Form Guide](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Create React App Documentation](https://create-react-app.dev/)

## 🤝 Contributing

1. Follow the established component structure
2. Add tests for new features
3. Ensure responsive design
4. Update documentation for new features
5. Test across different browsers and devices

---

**Note**: This frontend application is part of a full-stack fitness platform. See the main [README](../README.md) for complete setup instructions and the [backend README](../backend/README.md) for API documentation.
