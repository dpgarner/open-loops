import { useEffect, useRef, useState } from 'react';
import type { Tab } from './types';
import { useStore } from './store';
import { formatDate, reviewIsDue } from './selectors';
import Sidebar from './components/Sidebar';
import CaptureBar from './components/CaptureBar';
import InboxView from './components/InboxView';
import NextActionsView from './components/NextActionsView';
import ProjectsView from './components/ProjectsView';
import WaitingForView from './components/WaitingForView';
import SomedayView from './components/SomedayView';
import ReviewView from './components/ReviewView';

const TITLES: Record<Tab, string> = {
  inbox: 'Inbox',
  next: 'Next actions',
  projects: 'Projects',
  waiting: 'Waiting for',
  someday: 'Someday / maybe',
  review: 'Weekly review',
};

const HINTS: Record<Tab, string> = {
  inbox: 'Clarify each item until the inbox is empty.',
  next: 'One concrete physical step per action, grouped by where you can do it.',
  projects: 'Every active outcome needs a next action, or it is stuck.',
  waiting: 'What other people owe you, and how long it has been.',
  someday: 'Parked deliberately — revisit it in the weekly review.',
  review: 'Get clear, get current, get creative, wrap up.',
};

export default function App() {
  const store = useStore();
  const [tab, setTab] = useState<Tab>('inbox');
  const captureRef = useRef<HTMLInputElement>(null);
  const due = reviewIsDue(store.state);

  // "c" anywhere outside a text field jumps to capture, as in the original build.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== 'c' || event.metaKey || event.ctrlKey || event.altKey) return;
      const el = event.target as HTMLElement | null;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        el?.isContentEditable;
      if (typing) return;
      event.preventDefault();
      captureRef.current?.focus();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="shell">
      <Sidebar tab={tab} onTab={setTab} reviewDue={due} />

      <main className="main">
        <header className="head">
          <div>
            <h1>{TITLES[tab]}</h1>
            <p className="hint">{HINTS[tab]}</p>
          </div>
          <span className="review-stamp">
            Last review <strong>{formatDate(store.state.lastReview)}</strong>
          </span>
        </header>

        <CaptureBar inputRef={captureRef} />

        {due && tab !== 'review' && (
          <div className="nag" role="status">
            <span>
              {store.state.lastReview
                ? `It has been more than a week since you reviewed.`
                : 'You have never run a weekly review.'}
            </span>
            <button type="button" className="btn primary small" onClick={() => setTab('review')}>
              Start the review
            </button>
          </div>
        )}

        <section className="view">
          {tab === 'inbox' && <InboxView />}
          {tab === 'next' && <NextActionsView />}
          {tab === 'projects' && <ProjectsView />}
          {tab === 'waiting' && <WaitingForView />}
          {tab === 'someday' && <SomedayView />}
          {tab === 'review' && <ReviewView onGoTo={setTab} />}
        </section>
      </main>
    </div>
  );
}
