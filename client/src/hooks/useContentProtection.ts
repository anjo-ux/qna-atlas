import { useEffect } from 'react';

export function useContentProtection() {
  useEffect(() => {
    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent paste
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent print screen and screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      // Block Alt+Print Screen (alternative screenshot method)
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      // Block Ctrl+Print Screen (Windows 10+ screenshot)
      if ((e.ctrlKey || e.metaKey) && e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      // Block Shift+F2 (Firefox screenshot)
      if (e.shiftKey && e.key === 'F2') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('copy', handleCopy, true);
    document.addEventListener('cut', handleCut, true);
    document.addEventListener('paste', handlePaste, true);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    // Prevent dragging selection to copy
    document.addEventListener('selectstart', () => true);

    // Cleanup
    return () => {
      document.removeEventListener('copy', handleCopy, true);
      document.removeEventListener('cut', handleCut, true);
      document.removeEventListener('paste', handlePaste, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, []);
}
