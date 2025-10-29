import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ui/theme-provider";
import { WalletProvider } from "../components/wallet/wallet-provider";
import { Header } from "../components/layout/header";
import { QueryProvider } from "../components/providers/query-provider";
import Provider from "./provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< Updated upstream
  title: "CrediSol",
=======
  title: "CrediSOL",
>>>>>>> Stashed changes
  description: "Peer-to-peer undercollateralized lending using ZK credit attestations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Provider>
              <WalletProvider>
                <Header />
                {children}
                <Toaster />
              </WalletProvider>
            </Provider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
