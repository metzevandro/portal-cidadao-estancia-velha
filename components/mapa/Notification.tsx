"use client";
import { Notification } from "design-system-zeroz";

interface NotificationMapProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export function NotificationMap({
  isOpen,
  message,
  onClose,
  title,
}: NotificationMapProps) {
  return (
    <Notification
      type="float"
      variant="warning"
      title={title}
      description={message}
      dismissible={true}
      isOpen={isOpen}
      onClose={onClose}
      icon="warning"
    />
  );
}
