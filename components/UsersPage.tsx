'use client';

import { useState } from 'react';
import { UserTablePage } from '@/components/UserTablePage';
import { LoginActivityPage } from '@/components/LoginActivityPage';

type UserView = 'table' | 'activity';

export function UsersPage() {
  const [view, setView] = useState<UserView>('table');

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <h1>Users</h1>
          <p>Data user dan aktivitas user dalam satu tempat. Hanya tab yang dibuka yang memuat datanya.</p>
        </div>
      </div>

      <div className="range-tabs" style={{ marginBottom: 14 }}>
        <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}>User Table</button>
        <button className={view === 'activity' ? 'active' : ''} onClick={() => setView('activity')}>User Activity</button>
      </div>

      {view === 'table' ? <UserTablePage embedded /> : <LoginActivityPage embedded />}
    </div>
  );
}
