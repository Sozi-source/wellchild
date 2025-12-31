import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes and their allowed roles
const protectedRoutes = [
  {
    path: '/dashboard/parent',
    roles: ['parent', 'admin']
  },
  {
    path: '/dashboard/healthcare',
    roles: ['healthcare', 'admin']
  },
  {
    path: '/dashboard/admin',
    roles: ['admin']
  }
];

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Check if it's a protected route
  const protectedRoute = protectedRoutes.find(route => 
    path.startsWith(route.path)
  );

  if (protectedRoute) {
    // In a real app, you would check the user's role from session/token
    // For now, we'll handle this client-side with AuthGuard
    // This middleware ensures they're authenticated via cookie/session
    
    const token = request.cookies.get('auth_token');
    
    if (!token) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Note: Role validation happens client-side in AuthGuard
    // In production, you could decode JWT here and check roles
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/accept-invite/:path*'
  ]
};