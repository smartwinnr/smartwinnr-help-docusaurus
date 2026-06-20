import React, {type ReactNode} from 'react';
import {useThemeConfig} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import type {LucideIcon} from 'lucide-react';
import {
  Rocket,
  ClipboardCheck,
  Brain,
  Route,
  FileText,
  BookOpen,
  ListChecks,
  ChartColumn,
  Trophy,
  Target,
  Settings,
  Smartphone,
  LifeBuoy,
} from 'lucide-react';

// Create direct links for docs sections based on actual sidebar structure
function DocsMobileMenuItems(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();

  const docsItems: Array<{label: string; to: string; Icon: LucideIcon}> = [
    { Icon: Rocket,          label: 'Getting Started',                  to: '/getting-started' },
    { Icon: ClipboardCheck,  label: 'Quiz & Assessments',               to: '/quiz-assessments' },
    { Icon: Brain,           label: 'MicroLearning & SmartFeeds',       to: '/microlearning-smartfeeds' },
    { Icon: Route,           label: 'Learning & SmartPaths',            to: '/learning-smartpaths' },
    { Icon: FileText,        label: 'Forms & Data Collection',          to: '/forms-data-collection' },
    { Icon: BookOpen,        label: 'Knowledge Hub',                    to: '/knowledge-hub' },
    { Icon: ListChecks,      label: 'Surveys & Feedback',               to: '/surveys-feedback' },
    { Icon: ChartColumn,     label: 'Analytics & Reporting',            to: '/analytics-reporting' },
    { Icon: Trophy,          label: 'Competitions & Gamification',      to: '/competitions-gamification' },
    { Icon: Target,          label: 'Coaching & Performance',           to: '/coaching-performance' },
    { Icon: Settings,        label: 'Administration',                   to: '/administration' },
    { Icon: Smartphone,      label: 'Mobile & Platform Tools',          to: '/mobile-platform-tools' },
    { Icon: LifeBuoy,        label: 'Help & Support',                   to: '/help-support' },
  ];

  return (
    <>
      {docsItems.map((item, i) => (
        <li key={i} className="menu__list-item">
          <Link
            className={`menu__link ${location.pathname.startsWith(item.to) ? 'menu__link--active' : ''}`}
            to={item.to}
            onClick={() => mobileSidebar.toggle()}
            style={{display: 'flex', alignItems: 'center', gap: 8}}
          >
            <item.Icon size={16} strokeWidth={2} style={{color: 'var(--ifm-color-primary-darker)', flexShrink: 0}} aria-hidden="true" />
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
