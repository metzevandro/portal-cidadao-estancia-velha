"use client";
import { Notification } from "design-system-zeroz";

interface NotificationMapProps {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "primary" | "secondary" | "warning" | "success";
  onClose: () => void;
  icon: string;
}

export function NotificationMap({
  isOpen,
  message,
  onClose,
  title,
  variant,
  icon,
}: NotificationMapProps) {
  return (
    <Notification
      type="float"
      variant={variant}
      title={title}
      description={message}
      dismissible={true}
      isOpen={isOpen}
      onClose={onClose}
      icon={icon}
    />
  );
}
