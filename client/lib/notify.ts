import toast from "react-hot-toast";

export type NotificationType = "success" | "error" | "warn" | "info";

export interface NotifyOptions {
    title?: string;
    description: string;
    type?: NotificationType;
}

export const notify = (options: string | NotifyOptions) => {
    const { title, description, type = "info" } = typeof options === 'string'
        ? { description: options, type: "info" as NotificationType }
        : options;

    const message = title ? `${title}: ${description}` : description;
    const baseStyle = {
        fontWeight: "500",
        borderRadius: "12px",
        fontSize: "14px",
        padding: "12px 16px",
    };

    switch (type) {
        case "success":
            return toast.success(message, {
                duration: 4000,
                position: "bottom-right",
                style: {
                    ...baseStyle,
                    background: "#000000",
                    color: "#ffffff",
                },
                iconTheme: {
                    primary: "#10B981",
                    secondary: "#ffffff",
                },
            });
        case "error":
            return toast.error(message, {
                duration: 4000,
                position: "bottom-right",
                style: {
                    ...baseStyle,
                    background: "#FEE2E2",
                    color: "#B91C1C",
                },
            });
        case "warn":
            return toast(message, {
                duration: 4000,
                position: "bottom-right",
                style: {
                    ...baseStyle,
                    background: "#FEF3C7",
                    color: "#B45309",
                },
                icon: "⚠️",
            });
        default:
            return toast(message, {
                duration: 4000,
                position: "bottom-right",
                style: {
                    ...baseStyle,
                    background: "#E0F2FE",
                    color: "#0369A1",
                },
            });
    }
};