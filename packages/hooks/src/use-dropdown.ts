import { useState, useRef, useCallback } from "react";
import { useClickOutside } from "./use-click-outside";

export function useDropdown<
  TTrigger extends HTMLElement = HTMLElement,
  TDropdown extends HTMLElement = HTMLElement,
>() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<TTrigger | null>(null);
  const dropdownRef = useRef<TDropdown | null>(null);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useClickOutside(dropdownRef, (event) => {
    if (
      triggerRef.current &&
      triggerRef.current.contains(event.target as Node)
    ) {
      return;
    }
    close();
  });

  return {
    isOpen,
    setIsOpen,
    triggerRef,
    dropdownRef,
    toggle,
    open,
    close,
  };
}
