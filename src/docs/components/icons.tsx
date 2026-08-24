const base = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
}

export function SearchIcon() {
    return (
        <svg {...base} width={14} height={14}>
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14" />
        </svg>
    )
}

export function CopyIcon() {
    return (
        <svg {...base} width={13} height={13}>
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" />
            <path d="M10.5 3.5a1.6 1.6 0 0 0-1.6-1.6H4a1.6 1.6 0 0 0-1.6 1.6v5a1.6 1.6 0 0 0 1.6 1.6" />
        </svg>
    )
}

export function CheckIcon() {
    return (
        <svg {...base} width={13} height={13}>
            <path d="M3 8.5 6.2 12 13 4.5" />
        </svg>
    )
}

export function MenuIcon() {
    return (
        <svg {...base}>
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />
        </svg>
    )
}

export function CloseIcon() {
    return (
        <svg {...base}>
            <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
    )
}

export function GitHubIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.34C3.8 14.3 3.34 13 3.34 13c-.36-.92-.89-1.17-.89-1.17-.72-.5.06-.49.06-.49.8.06 1.22.82 1.22.82.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
        </svg>
    )
}

export function Logo() {
    return (
        <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0a0a0f" />
            <circle cx="16" cy="7" r="2.1" fill="#ffffff" />
            <circle cx="24" cy="11" r="1.6" fill="#d2e1ff" />
            <circle cx="26" cy="19" r="2.3" fill="#e6d2ff" />
            <circle cx="20" cy="25" r="1.5" fill="#c8fff5" />
            <circle cx="12" cy="26" r="2" fill="#ffffff" opacity="0.8" />
            <circle cx="6" cy="20" r="1.7" fill="#d2e1ff" opacity="0.75" />
            <circle cx="6" cy="11" r="2.2" fill="#8ab4ff" />
            <circle cx="11" cy="6" r="1.3" fill="#ffffff" opacity="0.6" />
        </svg>
    )
}
