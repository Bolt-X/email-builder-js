import { useEffect } from 'react';
import { redo, undo } from '../documents/editor/EditorContext';

export function useUndoRedoShortcuts() {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+Z => Undo
      if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      }

      // Ctrl+Y => Redo
      if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }

      // (Tùy chọn: Ctrl+Shift+Z cũng redo như trong nhiều app)
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
