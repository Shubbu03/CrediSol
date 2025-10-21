'use client'

import { AnonAadhaarProvider } from "@anon-aadhaar/react"

export default function Provider({ children }: { children: React.ReactNode }) {
    return (
        <AnonAadhaarProvider>
            {children}
        </AnonAadhaarProvider>
    )
}