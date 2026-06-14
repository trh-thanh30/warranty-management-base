import { useCallback, useState } from "react";

export type UseDisclosureOptions = {
  defaultOpen?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
};

export function useDisclosure(options: UseDisclosureOptions = {}) {
  const { defaultOpen = false, onClose, onOpen } = options;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((current) => {
      const next = !current;
      if (next) {
        onOpen?.();
      } else {
        onClose?.();
      }
      return next;
    });
  }, [onClose, onOpen]);

  return {
    close,
    isOpen,
    open,
    setIsOpen,
    toggle,
  };
}
