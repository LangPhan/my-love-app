# Authentication System Implementation

## Overview
This implementation creates a complete authentication system for the Love App using Appwrite as the backend. The system includes user registration, login, logout, and couple room creation/joining functionality.

## Files Created

### Core Authentication Hook
- **`src/hooks/useAuth.ts`** - Client-side authentication hook that wraps Appwrite auth helpers
  - `signup()` - Create new user account
  - `signin()` - Login with email/password
  - `signout()` - Logout and redirect
  - `refreshUser()` - Refresh current user data
  - Automatic redirection on success

### Server Actions
- **`src/app/actions/createCoupleRoom.ts`** - Server action for couple room management
  - Create new couple room with invite code
  - Join existing couple room using invite code
  - Generate unique 6-character invite codes
  - Update user documents with couple relationship

### Authentication Pages
- **`src/app/auth/layout.tsx`** - Layout wrapper for auth pages
- **`src/app/auth/register/page.tsx`** - Registration form with:
  - Email, password, confirm password validation
  - Display name input
  - Optional invite code field for joining partner
  - ShadcnUI components with romantic styling
  - TypeScript form validation

- **`src/app/auth/login/page.tsx`** - Login form with:
  - Email and password fields
  - Form validation and error handling
  - Links to registration and password recovery
  - Responsive design with romantic theme

### UI Components Created
- **`src/components/ui/label.tsx`** - Form label component using Radix UI
- **`src/components/ui/alert.tsx`** - Alert/notification component for errors

### Middleware
- **`src/middleware.ts`** - Basic route protection (can be enhanced)

## Features Implemented

### 🔐 Authentication Flow
1. **Registration**: Create account → optionally join/create couple room → redirect to dashboard
2. **Login**: Authenticate → refresh user data → redirect to dashboard
3. **Logout**: Clear session → redirect to login

### 💕 Couple Room System
- **Create Room**: New users generate invite code for partner
- **Join Room**: Use partner's invite code to connect accounts
- **Automatic Linking**: Users are linked in database when joining

### 🎨 UI/UX Features
- Romantic pastel color scheme (pink, rose, lavender)
- Mobile-first responsive design
- Loading states and error handling
- Form validation with clear error messages
- Success animations and feedback

### 🔒 Security Features
- Client-side form validation
- Server-side data validation
- TypeScript type safety throughout
- Proper error handling and user feedback

## Usage Examples

### Using the Auth Hook
```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, loading, signup, signin, signout } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    // Show login form
  }
  
  return <div>Welcome {user.name}!</div>;
}
```

### Server Action Usage
```typescript
import { createCoupleRoom } from '@/app/actions/createCoupleRoom';

// Create new couple room
const result = await createCoupleRoom({
  userId: 'user123',
  displayName: 'John Doe'
});

// Join existing couple room
const result = await createCoupleRoom({
  userId: 'user456',
  displayName: 'Jane Doe',
  inviteCode: 'ABC123'
});
```

## Environment Variables Required
Make sure these are set in your `.env.local`:
```
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_DATABASE_ID=your_database_id
NEXT_PUBLIC_USERS_COLLECTION_ID=users
NEXT_PUBLIC_COUPLES_COLLECTION_ID=couples
```

## Database Schema Required

### Users Collection
- `email` (string, required)
- `name` (string, required)
- `coupleId` (string, optional) - References couple document
- Additional fields as defined in types

### Couples Collection
- `user1Id` (string, required) - First user ID
- `user1Name` (string, required) - First user display name
- `user2Id` (string, optional) - Second user ID (empty until joined)
- `user2Name` (string, optional) - Second user display name
- `inviteCode` (string, required) - 6-character unique code
- `status` (string) - "waiting" or "active"
- `createdAt` (datetime)
- `connectedAt` (datetime, optional)

## Next Steps
1. Set up Appwrite database collections with proper schema
2. Configure proper permissions for collections
3. Add email verification flow
4. Implement password recovery
5. Add social login options
6. Enhance middleware with proper session verification
7. Add couple room management features (leave room, etc.)
8. Implement push notifications for couple connections

## Testing
Navigate to:
- `/auth/register` - Test registration flow
- `/auth/login` - Test login flow
- Use generated invite codes to test couple connection