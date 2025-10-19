"use client";

import { useEffect, useState } from "react";

export type UserRole = "borrower" | "lender" | null;

type StoredUser = {
    current: UserRole;
    onboarded: boolean;
};

const STORAGE_KEY = "zklend-user";

const roleEventTarget: EventTarget = typeof window !== "undefined" ? (window as unknown as EventTarget) : ({} as EventTarget);
const ROLE_UPDATED_EVENT = "zklend-role-updated";

function readStored(): StoredUser {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { current: null, onboarded: false };
        const parsed = JSON.parse(raw) as Partial<StoredUser>;
        return {
            current: parsed.current ?? null,
            onboarded: Boolean(parsed.onboarded),
        };
    } catch {
        return { current: null, onboarded: false };
    }
}

function writeStored(next: StoredUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function useUserRole() {
    const [role, setRole] = useState<UserRole>(null);
    const [onboarded, setOnboardedState] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = readStored();
            setRole(stored.current ?? null);
            setOnboardedState(Boolean(stored.onboarded));
        } finally {
            setIsLoading(false);
        }

        const handleRoleUpdated = () => {
            const latest = readStored();
            setRole(latest.current ?? null);
            setOnboardedState(Boolean(latest.onboarded));
        };

        const storageListener = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) handleRoleUpdated();
        };

        roleEventTarget.addEventListener(ROLE_UPDATED_EVENT, handleRoleUpdated as EventListener);
        window.addEventListener("storage", storageListener);

        return () => {
            roleEventTarget.removeEventListener(ROLE_UPDATED_EVENT, handleRoleUpdated as EventListener);
            window.removeEventListener("storage", storageListener);
        };
    }, []);

    const updateRole = (newRole: UserRole) => {
        try {
            const current = readStored();
            const next: StoredUser = { current: newRole, onboarded: current.onboarded };
            writeStored(next);
            setRole(newRole);
            roleEventTarget.dispatchEvent(new Event(ROLE_UPDATED_EVENT));
        } catch (error) {
            console.error("Failed to save user role:", error);
        }
    };

    const setOnboarded = (value: boolean) => {
        try {
            const current = readStored();
            const next: StoredUser = { current: current.current ?? role, onboarded: value };
            writeStored(next);
            setOnboardedState(value);
            roleEventTarget.dispatchEvent(new Event(ROLE_UPDATED_EVENT));
        } catch (error) {
            console.error("Failed to update onboarded flag:", error);
        }
    };

    const clearRole = () => {
        try {
            writeStored({ current: null, onboarded: false });
            setRole(null);
            setOnboardedState(false);
            roleEventTarget.dispatchEvent(new Event(ROLE_UPDATED_EVENT));
        } catch (error) {
            console.error("Failed to clear user data:", error);
        }
    };

    const resetOnboarding = () => {
        clearRole();
        if (typeof window !== "undefined") window.location.reload();
    };

    return {
        role,
        onboarded,
        updateRole,
        setOnboarded,
        clearRole,
        resetOnboarding,
        isLoading,
        isBorrower: role === "borrower",
        isLender: role === "lender",
    };
}
