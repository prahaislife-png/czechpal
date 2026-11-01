import { usePreventRemove } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import { confirmDiscard } from '@/lib/dialogs';

/**
 * HIG (Modality): "If either a dismiss gesture or button could lose user-generated content, get
 * confirmation before closing". While `hasChanges` is true, closing the screen by its Close or
 * Cancel button, the swipe-down gesture or the back gesture asks first.
 *
 * Returns `leave(go)` for navigation that should never ask, such as closing after sending.
 */
export function useConfirmDiscard(hasChanges: boolean, copy: { title: string; message: string }) {
  const [released, setReleased] = useState(false);
  const blocked = useRef<(() => void) | null>(null);

  const disablePrevention = usePreventRemove(hasChanges && !released, ({ repeat }) => {
    confirmDiscard(copy).then((discard) => {
      if (!discard) return;
      blocked.current = repeat;
      setReleased(true);
    });
  });

  // Retry the blocked close once prevention is off.
  useEffect(() => {
    if (!released || !blocked.current) return;
    const repeat = blocked.current;
    blocked.current = null;
    repeat();
  }, [released]);

  return useCallback(
    (go: () => void) => {
      setReleased(true);
      disablePrevention();
      go();
    },
    [disablePrevention],
  );
}
