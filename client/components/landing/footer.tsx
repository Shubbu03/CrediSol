"use client";

import { Github, MessageCircle, X } from "lucide-react";

export default function Footer() {
    const links = [
        { label: "GitHub", href: "https://github.com/zklend", icon: Github },
        { label: "Discord", href: "https://discord.gg/zklend", icon: MessageCircle },
        { label: "X", href: "https://twitter.com/zklend", icon: X },
    ];

    return (
        <footer className="border-t border-border/40 bg-muted/20 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="relative w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">zk</span>
                        </div>
                        <span className="text-sm font-medium">zkLend</span>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8">
                        {links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    {Icon ? <Icon className="w-4 h-4" /> : null}
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>

                    <p className="text-xs text-foreground/40">
                        © 2025 zkLend Labs. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
