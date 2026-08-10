'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3, Inbox, LayoutDashboard, LogOut, Megaphone, Store, Users
} from 'lucide-react';
import { founderLogout } from './AuthGate';

const sections = [
  { label: 'OVERVIEW', items: [{ href: '/', text: 'Executive', icon: LayoutDashboard }] },
  { label: 'BHUMI INTERNAL', items: [
    { href: '/users', text: 'Users', icon: Users },
    { href: '/analytics', text: 'Engagement', icon: BarChart3 },
  ]},
  { label: 'COMMUNICATION', items: [
    { href: '/inbox', text: 'Inbox', icon: Inbox },
    { href: '/broadcast', text: 'Broadcast', icon: Megaphone },
  ]},
  { label: 'GOOGLE PLAY', items: [
    { href: '/google-play', text: 'Play Overview', icon: Store },
    { href: '/google-play/acquisition', text: 'Acquisition', icon: BarChart3 },
  ]},
];

function activeFor(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BA</div>
          <div className="brand-copy"><b>Bhumi Amartya</b><span>Founder Intelligence</span></div>
        </div>
        {sections.map((section) => (
          <div key={section.label}>
            <div className="nav-label">{section.label}</div>
            {section.items.map(({ href, text, icon: Icon }) => (
              <Link key={href} href={href} className={`nav-link ${activeFor(pathname, href) ? 'active' : ''}`}>
                <Icon /><span>{text}</span>
              </Link>
            ))}
          </div>
        ))}
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-title">Bhumi Founder Intelligence</div>
          <div className="topbar-meta">
            <span>Asia/Jakarta</span>
            <div className="founder-chip"><div className="founder-avatar">W</div><span>wizzare@gmail.com</span></div>
            <button className="btn" onClick={() => founderLogout()} aria-label="Keluar"><LogOut size={13} /></button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
