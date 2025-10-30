import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = "borrower" | "lender" | null;

interface UserState {
    role: UserRole;
    onboarded: boolean;
    updateRole: (role: UserRole) => void;
    setOnboarded: (onboarded: boolean) => void;
    clearRole: () => void;
    resetOnboarding: () => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            role: null,
            onboarded: false,

            updateRole: (newRole) => {
                set({ role: newRole });
            },

            setOnboarded: (onboarded) => {
                set({ onboarded });
            },

            clearRole: () => {
                set({ role: null, onboarded: false });
            },

            resetOnboarding: () => {
                set({ role: null, onboarded: false });
                if (typeof window !== "undefined") {
                    window.location.reload();
                }
            },
        }),
        {
            name: 'CrediSOL-user',
            partialize: (state) => ({
                role: state.role,
                onboarded: state.onboarded
            }),
        }
    )
);

export function useUserRole() {
    const { role, onboarded, updateRole, setOnboarded, clearRole, resetOnboarding } = useUserStore();

    return {
        role,
        onboarded,
        updateRole,
        setOnboarded,
        clearRole,
        resetOnboarding,
        isLoading: false,
        isBorrower: role === "borrower",
        isLender: role === "lender",
    };
}
