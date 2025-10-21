"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserRole } from '../../hooks/use-user-role';
import { Loader } from './loader';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRole?: 'lender' | 'borrower';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
    const { connected } = useWallet();
    const { role, onboarded, isLoading } = useUserRole();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Don't redirect while loading
        if (isLoading) return;

        // If not connected, redirect to landing page
        if (!connected) {
            router.push('/');
            return;
        }

        // If connected but not onboarded, redirect to onboarding
        if (!onboarded) {
            router.push('/onboarding');
            return;
        }

        // If onboarded but no role, redirect to onboarding
        if (!role) {
            router.push('/onboarding');
            return;
        }

        // Role-based access control
        if (requiredRole && role !== requiredRole) {
            // Redirect to appropriate dashboard based on user's actual role
            if (role === 'lender') {
                router.push('/dashboard/lender');
            } else if (role === 'borrower') {
                router.push('/dashboard/borrower');
            }
            return;
        }

        // If accessing root dashboard, redirect to appropriate dashboard
        if (pathname === '/dashboard') {
            if (role === 'lender') {
                router.push('/dashboard/lender');
            } else if (role === 'borrower') {
                router.push('/dashboard/borrower');
            }
        }
    }, [connected, onboarded, role, isLoading, router, pathname, requiredRole]);

    if (isLoading) {
        return (
            <Loader
                message="Verifying access..."
                subMessage="Checking wallet, onboarding, and role"
                size="md"
            />
        );
    }

    if (!connected || !onboarded || !role) {
        return null;
    }

    if (requiredRole && role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}
