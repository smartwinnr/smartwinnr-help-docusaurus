/**
 * Single source of truth for the TOP-LEVEL information architecture.
 *
 * Consumed by:
 * - sidebars.ts - builds the desktop sidebar categories from this array
 * - src/theme/Navbar/MobileSidebar/PrimaryMenu - the mobile/iPad hamburger menu
 *
 * Keep this file free of Node APIs and of runtime `lucide-react` imports:
 * sidebars.ts is evaluated by Node at build time. Icons for the mobile menu are
 * mapped by `id` inside the menu component instead.
 *
 * Per-module gates (Quiz, SmartPath, ...) are NOT here - they live in
 * docs/modules/<m>/_category_.json. Gate evaluation is src/access-policy.ts.
 */

import type {AccessGate} from './access-policy';
import {ALL_ROLES, MANAGER_PLUS_ROLES, ADMIN_PLUS_ROLES} from './role-constants';

export type NavSection = {
  /** Directory name under docs/ - also the icon key in the mobile menu. */
  id: string;
  label: string;
  /** Route of the section landing page. */
  slug: string;
  /** Shown on the generated-index page. Ignored when `linkDocId` is set. */
  description: string;
  /** Role + privilege gate, mirrored into the sidebar item's customProps. */
  gate?: AccessGate;
  /** Set when the category links to a real doc instead of a generated index. */
  linkDocId?: string;
  /** Sidebar collapse state. Defaults to collapsed. */
  collapsed?: boolean;
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: 'get-started',
    label: 'Get Started',
    slug: '/get-started',
    description: 'Setup, basics, and your first-week orientation for SmartWinnr.',
    gate: {roles: ALL_ROLES},
    collapsed: false,
  },
  {
    id: 'guides',
    label: 'Guides',
    slug: '/guides',
    description: 'Workflow-driven walkthroughs for learners and managers.',
    gate: {roles: ALL_ROLES},
  },
  {
    id: 'modules',
    label: 'Modules',
    slug: '/modules',
    description:
      'Every SmartWinnr module: Quiz, SmartPath, SmartFeed, Coaching, Survey, KPI & Gamification, and more.',
    gate: {roles: ALL_ROLES},
  },
  {
    id: 'reports-and-analytics',
    label: 'Reports & Analytics',
    slug: '/reports-and-analytics',
    description:
      'Learner, admin, generated, automated reports and dashboards across SmartWinnr.',
    gate: {
      roles: MANAGER_PLUS_ROLES,
      anyPrivilege: [
        'learnerReport',
        'adminReports',
        'generatedReports',
        'automatedReports',
        'overAllDashboards',
      ],
    },
  },
  {
    id: 'integrations',
    label: 'Integrations',
    slug: '/integrations',
    description:
      'Connect SmartWinnr to identity providers, content standards, and external systems.',
    gate: {roles: ADMIN_PLUS_ROLES},
    linkDocId: 'integrations/integrations-index',
  },
  {
    id: 'administration',
    label: 'Administration',
    slug: '/administration',
    description:
      'Org setup, user + role management, system configuration, and access controls.',
    gate: {roles: ADMIN_PLUS_ROLES},
  },
  {
    id: 'reference',
    label: 'Reference',
    slug: '/reference',
    description: 'Glossary, role & privilege reference, help & support, troubleshooting.',
    gate: {roles: ALL_ROLES},
  },
  {
    id: 'release-notes',
    label: 'Release Notes',
    slug: '/release-notes',
    description: "Announcements, product updates, and what's new.",
    gate: {roles: ALL_ROLES},
  },
];
