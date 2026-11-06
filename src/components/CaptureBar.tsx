import { useRef } from 'react';
import type { RefObject } from 'react';
import { useStore } from '../store-context';

export default function CaptureBar({ inputRef }: { inputRef: RefObject<HTMLInputElement> }) {
  const { capture } = useStore();
  const local = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? local;

  return (
    <div className="capture">
      <span className="capture-mark" aria-hidden="true">
        ✚
      </span>
      <input
        ref={ref}
        type="text"
        className="capture-input"
        placeholder="Capture anything — press Enter. (c)"
        aria-label="Capture"
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          const value = event.currentTarget.value;
          capture(value);
          event.currentTarget.value = '';
        }}
      />
    </div>
  );
}
