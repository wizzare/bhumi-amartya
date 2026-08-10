'use client';

import { useState } from 'react';
import { AnalyticsPage } from '@/components/AnalyticsPage';
import { RetentionPage } from '@/components/RetentionPage';

type EngagementView = 'activation' | 'retention';

export function EngagementPage() {
  const [view, setView] = useState<EngagementView>('activation');

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Engagement</h1>
          <p>Activation dan retention dalam satu tempat. Hanya tab yang dibuka yang memuat datanya.</p>
        </div>
      </div>

      <div className="range-tabs" style={{ marginBottom: 14 }}>
        <button className={view === 'activation' ? 'active' : ''} onClick={() => setView('activation')}>Activation</button>
        <button className={view === 'retention' ? 'active' : ''} onClick={() => setView('retention')}>Retention</button>
      </div>

      {view === 'activation' ? <AnalyticsPage embedded /> : <RetentionPage embedded />}
    </div>
  );
}
