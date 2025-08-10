import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';

// Create direct links for docs sections
function DocsMobileMenuItems(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  
  const docsItems = [
    { label: 'Getting Started with SmartWinnr', to: '/' },
    { label: 'Quiz', to: '/quiz' },
    { label: 'Microlearning', to: '/microlearning' },
    { label: 'Competitions', to: '/competitions' },
    { label: 'KPI Gamification', to: '/kpi-gamification' },
    { label: 'SmartPath', to: '/smartpath' },
    { label: 'Reports', to: '/reports' },
    { label: 'Users', to: '/users' },
    { label: 'Forms', to: '/forms' },
    { label: 'Admin', to: '/admin' }
  ];

  return (
    <>
      {docsItems.map((item, i) => (
        <li key={i} className="menu__list-item">
          <Link
            className={`menu__link ${location.pathname === item.to ? 'menu__link--active' : ''}`}
            to={item.to}
            onClick={() => mobileSidebar.toggle()}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </>
  );
}

// The primary menu displays the docs navigation for docs-only sites
export default function NavbarMobilePrimaryMenu(): ReactNode {
  return (
    <ul className="menu__list">
      <DocsMobileMenuItems />
    </ul>
  );
}
