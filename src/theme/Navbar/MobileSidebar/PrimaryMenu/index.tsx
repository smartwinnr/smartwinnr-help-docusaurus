import React, {type ReactNode} from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import type {LucideIcon} from 'lucide-react';
import {
  Rocket,
  Compass,
  LayoutGrid,
  ChartColumn,
  Plug,
  Settings,
  BookOpen,
  Megaphone,
} from 'lucide-react';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import {isAllowed} from '@site/src/access-policy';
import {NAV_SECTIONS} from '@site/src/nav-sections';

/**
 * Icons live here rather than in src/nav-sections.ts: that module is imported
 * by sidebars.ts, which Node evaluates at build time and must not pull in
 * lucide-react.
 */
const SECTION_ICONS: Record<string, LucideIcon> = {
  'get-started': Rocket,
  guides: Compass,
  modules: LayoutGrid,
  'reports-and-analytics': ChartColumn,
  integrations: Plug,
  administration: Settings,
  reference: BookOpen,
  'release-notes': Megaphone,
};

// Top-level docs sections, gated exactly like the desktop sidebar.
function DocsMobileMenuItems(): ReactNode {
  const mobileSidebar = useNavbarMobileSidebar();
  const location = useLocation();
  const user = useCurrentUser();

  return (
    <>
      {NAV_SECTIONS.filter((section) => isAllowed(section.gate, user)).map((section) => {
        const Icon = SECTION_ICONS[section.id];
        return (
          <li key={section.id} className="menu__list-item">
            <Link
              className={`menu__link ${
                location.pathname.startsWith(section.slug) ? 'menu__link--active' : ''
              }`}
              to={section.slug}
              onClick={() => mobileSidebar.toggle()}
              style={{display: 'flex', alignItems: 'center', gap: 8}}>
              {Icon && (
                <Icon
                  size={16}
                  strokeWidth={2}
                  style={{color: 'var(--ifm-color-primary-darker)', flexShrink: 0}}
                  aria-hidden="true"
                />
              )}
              {section.label}
            </Link>
          </li>
        );
      })}
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
