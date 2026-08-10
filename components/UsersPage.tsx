'use client';

import { useState } from 'react';
import { UserTablePage } from '@/components/UserTablePage';
import { LoginActivityPage } from '@/components/LoginActivityPage';
import { PremiumPage } from '@/components/PremiumPage';
import { GeographyPage } from '@/components/GeographyPage';

type UserView = 'table' | 'activity' | 'access' | 'geography';

export function UsersPage() {
  const [view, setView] = useState<UserView>('table');

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Users</h1>
          <p>Profil, aktivitas, akses, dan geografi user dalam satu tempat. Hanya tab yang dibuka yang memuat datanya.</p>
        </div>
      </div>

      <div className="range-tabs" style={{ marginBottom: 14 }}>
        <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>User Table</button>
        <button className={view === 'activity' ? 'active' : ''} onClick={() => setView('activity')}>Activity</button>
        <button className={view === 'access' ? 'active' : ''} onClick={() => setView('access')}>Access</button>
        <button className={view === 'geography' ? 'active' : ''} onClick={() => setView('geography')}>Geography</button>
      </div>

      {view === 'table' && <UserTablePage embedded />}
      {view === 'activity' && <LoginActivityPage embedded />}
      {view === 'access' && <PremiumPage embedded />}
      {view === 'geography' && <GeographyPage embedded />}
    </div>
  );
}
