# Child Growth Tracker - Well~Child / MwanaCare

A comprehensive child growth monitoring platform that empowers parents and healthcare providers with WHO-standard growth tracking, nutritional assessments, and data-driven insights for child development.

## 📋 Project Overview

**Well~Child** (branded as **MwanaCare** in some contexts) is a modern web application built with Next.js 14 that provides:
- WHO-standard growth tracking for children aged 0-5 years
- Role-based access for parents, healthcare providers, and administrators
- Real-time growth chart visualization
- Secure data sharing between parents and healthcare providers
- Comprehensive admin dashboard for system management

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **React Context API** - State management
- **Firebase** - Authentication & Firestore database
- **Chart.js / Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Firebase Authentication** - User authentication
- **Firestore Database** - Real-time data storage
- **Firebase Storage** - File uploads (optional)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **Vercel** - Deployment platform

## 📁 Project Structure

```
app/
├── (marketing)/                    # Route group for public pages
│   ├── layout.tsx                 # Marketing layout (Header + Footer)
│   ├── page.tsx                   # Landing page
│   ├── about/
│   │   └── page.tsx              # About page
│   ├── features/
│   │   └── page.tsx              # Features page
│   ├── pricing/
│   │   └── page.tsx              # Pricing page
│   └── resources/
│       └── page.tsx              # Resources page
│
├── dashboard/                     # Dashboard section (authenticated)
│   ├── layout.tsx                # Dashboard layout (Sidebar + Navigation)
│   ├── page.tsx                  # Dashboard home
│   ├── profile/
│   │   └── page.tsx              # User profile
│   │
│   ├── parent/                   # Parent-specific features
│   │   ├── children/
│   │   │   ├── [childId]/
│   │   │   │   └── page.tsx     # Individual child profile
│   │   │   └── add/
│   │   │       └── page.tsx     # Add new child
│   │   ├── charts/
│   │   │   └── page.tsx         # Growth charts
│   │   └── appointments/
│   │       └── page.tsx         # Appointments
│   │
│   ├── healthcare/               # Healthcare provider features
│   │   ├── patients/
│   │   │   └── page.tsx         # Patient management
│   │   ├── charts/
│   │   │   └── page.tsx         # Patient charts
│   │   ├── appointments/
│   │   │   └── page.tsx         # Appointment management
│   │   └── reports/
│   │       └── page.tsx         # Medical reports
│   │
│   └── admin/                    # Admin features
│       ├── users/
│       │   ├── [userId]/
│       │   │   └── page.tsx     # Individual user profile
│       │   └── page.tsx         # User management
│       ├── healthcare-providers/
│       │   └── page.tsx         # Healthcare provider approval
│       ├── children/
│       │   └── page.tsx         # All children in system
│       ├── analytics/
│       │   └── page.tsx         # System analytics
│       ├── audit/
│       │   └── page.tsx         # Audit logs
│       └── settings/
│           └── page.tsx         # System settings
│
├── auth/                         # Authentication pages
│   ├── login/
│   │   └── page.tsx             # Login page
│   └── register/
│       └── page.tsx             # Registration page
│
├── api/                          # API routes (if needed)
│   └── ...
│
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── dashboard/               # Dashboard-specific components
│   ├── charts/                  # Chart components
│   └── forms/                   # Form components
│
├── context/                     # React Context providers
│   └── AuthContext.tsx          # Authentication context
│
├── lib/                         # Utility functions & libraries
│   ├── firebase.ts              # Firebase configuration
│   ├── user-utils.ts            # User management utilities
│   └── growth-calculations.ts   # WHO growth calculations
│
├── types/                       # TypeScript type definitions
│   └── index.ts
│
├── public/                      # Static assets
│   ├── images/
│   └── fonts/
│
├── styles/                      # Global styles
│   └── globals.css
│
├── layout.tsx                   # Root layout (minimal)
└── page.tsx                     # (not used - marketing route handles home)
```

## 🔐 User Roles & Permissions

### 1. **Parents**
- Add and manage their children's profiles
- Track growth metrics (height, weight, head circumference)
- View growth charts and percentiles
- Share data with healthcare providers
- Schedule appointments

### 2. **Healthcare Providers**
- View patient growth data
- Add growth measurements
- Generate medical reports
- Compare against WHO standards
- Schedule follow-up appointments

### 3. **Administrators**
- Manage all users in the system
- Approve healthcare provider registrations
- View system analytics and usage statistics
- Manage system settings
- Access audit logs

## 🎯 Key Features

### Growth Tracking
- **WHO Standards**: Uses WHO Child Growth Standards (2006) for children 0-5 years
- **Multi-parameter tracking**: Height, weight, head circumference, BMI
- **Percentile calculations**: Real-time percentile and z-score calculations
- **Growth velocity**: Track growth patterns over time

### Visualization
- **Interactive charts**: Growth charts with percentile curves
- **Comparison tools**: Compare against WHO standards and population averages
- **Trend analysis**: Identify growth patterns and potential issues
- **Export capabilities**: Download charts and reports

### User Management
- **Role-based access**: Three-tier permission system
- **Profile management**: Complete user profiles with avatars
- **Child management**: Add, edit, and track multiple children
- **Healthcare provider verification**: Admin approval system

### Administrative Features
- **User management**: Full CRUD operations for all users
- **Analytics dashboard**: System usage and growth data analytics
- **Audit logging**: Track all system activities
- **System settings**: Configure platform parameters

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account (for authentication and database)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd child-growth-tracker
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up Firebase**
- Create a Firebase project at [firebase.google.com](https://firebase.google.com)
- Enable Authentication (Email/Password)
- Create a Firestore database
- Get your Firebase configuration

4. **Configure environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

6. **Open your browser**
Navigate to `http://localhost:3000`

## 📊 Data Models

### User Schema
```typescript
interface User {
  id: string;                   // Firestore document ID
  uid?: string;                 // Firebase Auth UID
  email: string;
  name: string;
  role: 'parent' | 'healthcare' | 'admin';
  pendingRole?: 'healthcare';   // For healthcare approval
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  emailVerified?: boolean;
  profileComplete?: boolean;
  phone?: string;
  address?: string;
  specialization?: string;      // For healthcare providers
  institution?: string;         // For healthcare providers
  childrenCount?: number;       // For parents
  // Additional fields as needed
}
```

### Child Schema
```typescript
interface Child {
  id: string;
  parentId: string;            // Reference to parent user
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  measurements: Measurement[];
  createdAt: string;
  updatedAt: string;
  healthcareProviders: string[]; // References to healthcare users
  notes?: string[];
}
```

### Measurement Schema
```typescript
interface Measurement {
  id: string;
  childId: string;
  date: string;
  height?: number;            // in cm
  weight?: number;            // in kg
  headCircumference?: number; // in cm
  recordedBy: string;         // User ID
  notes?: string;
  percentile?: {
    height: number;
    weight: number;
    headCircumference: number;
    bmi: number;
  };
  zScore?: {
    height: number;
    weight: number;
    headCircumference: number;
    bmi: number;
  };
}
```

## 🔧 Development Guidelines

### Component Structure
- Use functional components with TypeScript
- Follow the "feature-first" component organization
- Keep components small and focused
- Use descriptive prop interfaces

### Styling
- Use Tailwind CSS utility classes
- Create design tokens for consistent theming
- Follow mobile-first responsive design
- Use CSS modules only when necessary

### State Management
- Use React Context for global state (auth, theme)
- Use local state for component-specific state
- Consider Zustand for complex state if needed

### API Integration
- Use Firebase SDK for direct database access
- Create utility functions for common operations
- Implement proper error handling
- Add loading states for async operations

## 📱 Responsive Design

The application is built with a mobile-first approach:
- **Mobile (< 768px)**: Stacked layout, hamburger menu
- **Tablet (768px - 1024px)**: Adjusted sidebar, responsive tables
- **Desktop (> 1024px)**: Full sidebar, expanded layouts

## 🔒 Security Considerations

1. **Authentication**: Firebase Auth with email/password
2. **Authorization**: Role-based access control at route level
3. **Data Validation**: Input validation on client and server
4. **Secure Storage**: Firebase Firestore with security rules
5. **HTTPS**: All traffic encrypted
6. **Rate Limiting**: Implemented on sensitive endpoints

## 📈 Performance Optimization

1. **Code Splitting**: Automatic with Next.js App Router
2. **Image Optimization**: Next.js Image component
3. **Lazy Loading**: Components and images loaded on demand
4. **Caching**: Firebase caching strategies
5. **Bundle Analysis**: Regular bundle size monitoring

## 🧪 Testing Strategy

### Unit Testing
- Component testing with Jest and React Testing Library
- Utility function testing
- Type safety with TypeScript

### Integration Testing
- API route testing
- Database operation testing
- Authentication flow testing

### E2E Testing
- User workflow testing with Cypress or Playwright
- Cross-browser compatibility testing

## 📦 Deployment

### Vercel (Recommended)
```bash
vercel
```

### Manual Build
```bash
npm run build
npm start
```

### Environment Variables
Ensure all environment variables are set in your deployment platform:
- Firebase configuration
- Any API keys
- Feature flags

## 📚 Documentation

### API Documentation
- Firebase Firestore structure
- Component prop interfaces
- Utility function documentation

### User Guides
- Parent user manual
- Healthcare provider guide
- Administrator manual

### Developer Documentation
- Setup guide
- Architecture overview
- Contribution guidelines

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests if applicable
5. Submit a pull request

### Code Style
- Follow existing code patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Update documentation as needed

## 📄 License

This project is proprietary software. All rights reserved.

## ⚠️ Medical Disclaimer

**Important**: This application is a growth tracking tool and does not provide medical advice. Always consult with a qualified healthcare professional for medical concerns, diagnosis, and treatment.

## 📞 Support

For support, please contact:
- **Technical Support**: tech-support@mwanacare.com
- **Healthcare Inquiries**: healthcare@mwanacare.com
- **General Inquiries**: info@mwanacare.com

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Built with**: Next.js 14, TypeScript, Firebase, Tailwind CSS