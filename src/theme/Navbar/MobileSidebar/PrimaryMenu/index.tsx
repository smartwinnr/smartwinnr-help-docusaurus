import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';

// Create direct links for docs sections based on actual sidebar structure
function DocsMobileMenuItems(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  
  const docsItems = [
    { label: '🚀 Getting Started', to: '/getting-started' },
    { label: '📝 Quiz & Assessments', to: '/quiz-assessments' },
    { label: '🧠 MicroLearning & SmartFeeds', to: '/microlearning-smartfeeds' },
    { label: '🛤️ Learning & SmartPaths', to: '/learning-smartpaths' },
    { label: '📋 Forms & Data Collection', to: '/forms-data-collection' },
    { label: '📚 Knowledge Hub', to: '/knowledge-hub' },
    { label: '📊 Surveys & Feedback', to: '/surveys-feedback' },
    { label: '📈 Analytics & Reporting', to: '/analytics-reporting' },
    { label: '🏆 Competitions & Gamification', to: '/competitions-gamification' },
    { label: '🎯 Coaching & Performance', to: '/coaching-performance' },
    { label: '👑 Administration', to: '/administration' },
    { label: '📱 Mobile & Platform Tools', to: '/mobile-platform-tools' },
    { label: '🆘 Help & Support', to: '/help-support' }
  ];

  return (
    <>
      {docsItems.map((item, i) => (
        <li key={i} className="menu__list-item">
          <Link
            className={`menu__link ${location.pathname.startsWith(item.to) ? 'menu__link--active' : ''}`}
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
