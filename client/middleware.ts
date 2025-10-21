import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/onboarding'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Dashboard routes
    const lenderRoutes = ['/dashboard/lender', '/dashboard/lend'];
    const borrowerRoutes = ['/dashboard/borrower', '/dashboard/borrow'];
    const isLenderRoute = lenderRoutes.some(route => pathname.startsWith(route));
    const isBorrowerRoute = borrowerRoutes.some(route => pathname.startsWith(route));
    const isDashboardRoute = isLenderRoute || isBorrowerRoute;

    if (isDashboardRoute) {
        const response = NextResponse.next();

        response.headers.set('x-protected-route', 'true');

        if (isLenderRoute) {
            response.headers.set('x-required-role', 'lender');
        } else if (isBorrowerRoute) {
            response.headers.set('x-required-role', 'borrower');
        }

        return response;
    }

    // If accessing root dashboard, redirect to onboarding (client will handle proper redirect)
    if (pathname === '/dashboard') {
        return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    ],
};
