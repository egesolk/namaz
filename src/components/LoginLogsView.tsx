interface LoginLogsViewProps {
    onBack: () => void;
}

export function LoginLogsView({ onBack }: LoginLogsViewProps) {
    onBack();
    return null;
}
