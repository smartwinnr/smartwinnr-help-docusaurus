/**
 * Curated entry points surfaced on the persona-specific landing pages
 * (src/pages/path/<persona>.tsx) and used in the homepage persona-grid.
 *
 * Each persona maps to:
 *   - tier:  the minimum role tier required (T1..T6 → 1..6)
 *   - label/blurb/icon: shown on the homepage persona card
 *   - entries: the curated list shown on /path/<persona>/
 *
 * Entries are LINKS into the existing documentation tree. Each entry can also
 * carry a `privilege` so that orgs without that privilege see a graceful
 * "ask your admin to enable X" hint rather than a 404.
 */

import type {LucideIcon} from 'lucide-react';
import {
  GraduationCap,
  Users,
  SquarePen,
  Settings,
  LifeBuoy,
  ChartColumn,
  Plug,
} from 'lucide-react';

import type {CurrentUser, OrgPrivilege, SmartWinnrRole} from '@site/src/access-policy';
import {PRIVILEGE_GATING_ENABLED, hasMinTier} from '@site/src/access-policy';

export type PersonaSlug =
  | 'learner'
  | 'manager'
  | 'editor'
  | 'admin'
  | 'integrations'
  | 'reports'
  | 'help';

export type Persona = {
  slug: PersonaSlug;
  label: string;
  blurb: string;
  icon: LucideIcon;
  tier: number;
  /** Highlights this card with the brand-primary border when the viewer's tier
   *  matches; "Author content" gets the spotlight for editors, etc. */
  spotlightAtTier?: number;
  /** Hide from the 5-door grid on the landing. Page is still resolvable via
   *  `/path/<slug>/` so old bookmarks keep working. Used for `reports` and
   *  `integrations` after they were absorbed into Manager + Admin doors. */
  hiddenFromDoors?: boolean;
  /** Optional org privilege required to ENTER the door. Used by Manager: an
   *  editor who also has the `manager` role but whose org didn't enable the
   *  `managerView` privilege should NOT see the Manager door, because the
   *  team-coaching / reportee-review content behind it requires `managerView`
   *  at every sub-folder (see CLAUDE.md "Trap" callout).
   *  Bypassed for superadmin via the existing PRIVILEGE_BYPASS_ROLES. */
  privilege?: OrgPrivilege;
};

/** Single source of truth for "can this user enter this persona door?".
 *  Combines tier check + optional org-privilege check, with the standard
 *  PRIVILEGE_GATING_ENABLED flag + superadmin bypass mirroring `isAllowed`. */
export function canEnterPersona(
  user: CurrentUser | null,
  persona: Persona,
): boolean {
  if (!hasMinTier(user, persona.tier)) return false;
  if (!persona.privilege) return true;
  if (!PRIVILEGE_GATING_ENABLED) return true;
  const u = user;
  if (!u) return false;
  // Superadmin bypass - mirrors PRIVILEGE_BYPASS_ROLES in access-policy.
  if (u.roles.includes('superadmin' as SmartWinnrRole)) return true;
  return (u.privileges || []).includes(persona.privilege);
}

export type EntryPoint = {
  label: string;
  href: string;
  blurb?: string;
  /** Optional Lucide icon rendered on the task card. Falls back to the persona icon. */
  icon?: LucideIcon;
  /** Optional org privilege required to USE the linked feature (not to read the doc). */
  privilege?: OrgPrivilege;
};

/**
 * An optional grouped form of entries for a persona - used when the door has
 * absorbed sub-personas (e.g. Manager absorbed Reports, Admin absorbed
 * Integrations). When a persona has no GROUPS entry, `PathBody` falls back to
 * the flat `ENTRIES[slug]` array and renders it as a single "Where to start"
 * section.
 */
export type EntryGroup = {title: string; entries: EntryPoint[]};

export const PERSONAS: Persona[] = [
  {
    slug: 'learner',
    label: "I'm a learner",
    icon: GraduationCap,
    tier: 1,
    blurb: 'Take quizzes, follow SmartPaths, submit coaching, view your KPIs and badges.',
    spotlightAtTier: 1,
  },
  {
    slug: 'manager',
    label: 'I manage a team',
    icon: Users,
    tier: 2,
    blurb: 'Read team dashboards, review coaching, drive KPIs and competitions.',
    spotlightAtTier: 2,
    privilege: 'managerView',
  },
  {
    slug: 'editor',
    label: "I'm an Author",
    icon: SquarePen,
    tier: 3,
    blurb: 'Build quizzes, SmartPaths, SmartFeeds, surveys, and coachings.',
    spotlightAtTier: 3,
  },
  {
    slug: 'reports',
    label: 'I want a report',
    icon: ChartColumn,
    tier: 2,
    blurb: 'Learner, admin, generated, automated reports and overall dashboards.',
    // Absorbed into the Manager + Admin doors. Page still resolvable.
    hiddenFromDoors: true,
  },
  {
    slug: 'admin',
    label: 'I administer the org',
    icon: Settings,
    tier: 4,
    blurb: 'Users, roles, divisions, audit log, approval flow, org privileges.',
    spotlightAtTier: 4,
  },
  {
    slug: 'integrations',
    label: "I'm integrating SmartWinnr",
    icon: Plug,
    tier: 4,
    blurb: 'Azure AD, SCIM, xAPI, SCORM, REST API, webhook patterns.',
    spotlightAtTier: 5,
    hiddenFromDoors: true,
  },
  {
    slug: 'help',
    label: 'I need help',
    icon: LifeBuoy,
    tier: 1,
    blurb: 'FAQs, troubleshooting, glossary, and contact support.',
  },
];

export const ENTRIES: Record<PersonaSlug, EntryPoint[]> = {
  learner: [
    {label: 'Take a quiz with long-answer questions',  href: '/modules/quiz/for-learners/how-to-answer-long-answer-type-questions-in-smartwinnr',         privilege: 'quiz'},
    {label: 'Walk through a SmartPath',                href: '/modules/smartpath/for-learners/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',     privilege: 'smartpaths'},
    {label: 'Upload a coaching video',                 href: '/modules/video-coaching/for-learners/how-do-i-upload-a-coaching-video',                       privilege: 'coaching'},
    {label: 'Submit an AI Coaching attempt',           href: '/modules/ai-coaching/for-learners/how-can-a-user-submit-an-ai-coaching-attempt',              privilege: 'aiCoaching'},
    {label: 'Engage with SmartFeed',                   href: '/modules/smartfeed/for-learners/how-do-i-like-and-comment-on-a-smartfeed',                    privilege: 'content'},
    {label: 'View your KPI scorecard',                 href: '/modules/kpi-gamification/for-learners/how-do-i-view-the-kpi-scorecard',                      privilege: 'kpi'},
    {label: 'Submit a form',                           href: '/modules/forms/for-learners/how-to-add-new-form-submission',                                   privilege: 'forms'},
    {label: 'Manage your notifications',               href: '/modules/notifications/for-learners/how-to-view-notifications'},
    {label: 'Use the Knowledge Hub',                   href: '/modules/knowledge-hub/for-learners/how-to-use-khub-in-the-smartwinnr-app',                    privilege: 'khub'},
  ],
  manager: [
    {label: 'Find scores for your team’s quizzes', href: '/modules/quiz/for-managers/finding-status-and-scores-for-quizzes-assigned-to-your-team',     privilege: 'quiz'},
    {label: 'Review reportee coaching submissions',     href: '/modules/video-coaching/for-managers/what-is-my-team-coaching',                              privilege: 'coaching'},
    {label: 'Track reportee KPI scorecards',            href: '/modules/kpi-gamification/for-managers/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', privilege: 'kpi'},
    {label: 'View team competition leaderboards',       href: '/modules/kpi-gamification/for-managers/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', privilege: 'competitions'},
    {label: 'Track reportee progress in quizzes',       href: '/modules/quiz/for-managers/how-to-find-the-progress-of-your-team-in-quizzes',                privilege: 'quiz'},
    {label: 'Approve a form submission',                href: '/modules/forms/for-managers/how-managers-approve-form',                                       privilege: 'forms'},
    {label: 'Review AI Coaching submissions',           href: '/modules/ai-coaching/for-managers/how-to-review-ai-coaching-submissions-as-a-manager',        privilege: 'aiCoaching'},
    {label: 'Review field coaching in mobile',          href: '/modules/field-coaching/for-managers/how-to-review-field-coaching-from-managers-view-in-mobile', privilege: 'fCoaching'},
  ],
  editor: [
    {label: 'Create your first quiz',                  href: '/modules/quiz/create-and-manage/how-to-create-a-manual-quiz',                                  privilege: 'quiz'},
    {label: 'Build a SmartPath with learning sessions', href: '/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module',       privilege: 'smartpaths'},
    {label: 'Author a SmartFeed',                       href: '/modules/smartfeed/create-and-manage/how-to-create-a-smartfeed',                              privilege: 'content'},
    {label: 'Set up Video Coaching',                    href: '/modules/video-coaching/create-and-manage/how-to-create-field-coaching',                      privilege: 'coaching'},
    {label: 'Configure AI Coaching',                    href: '/modules/ai-coaching/features/what-is-ai-coaching',                                            privilege: 'aiCoaching'},
    {label: 'Design a survey',                          href: '/modules/survey/create-and-manage/how-to-create-a-survey',                                     privilege: 'survey'},
    {label: 'Create a form',                            href: '/modules/forms/create-and-manage/how-to-create-a-form',                                        privilege: 'forms'},
    {label: 'Add a challenge to a competition',         href: '/modules/kpi-gamification/create-and-manage/how-to-add-a-challenge-to-the-competition',       privilege: 'competitions'},
    {label: 'Bulk-import quiz questions',               href: '/modules/quiz/create-and-manage/how-to-upload-questions-in-bulk-using-import-questions',     privilege: 'quiz'},
  ],
  reports: [
    {label: 'Learner overall report',       href: '/reports-and-analytics/legacy/learner-overall-report',             privilege: 'learnerReport'},
    {label: 'Per-learner individual report', href: '/reports-and-analytics/legacy/learner-report-by-learner-individual-report-analytics', privilege: 'learnerReport'},
    {label: 'Quiz-wise analytics',          href: '/reports-and-analytics/legacy/quiz-wise-analytics',                privilege: 'learnerReport'},
    {label: 'Team analytics',               href: '/reports-and-analytics/legacy/team-analytics'},
    {label: 'Team progress report',         href: '/reports-and-analytics/legacy/team-progress-report'},
    {label: 'User login reports',           href: '/reports-and-analytics/legacy/user-login-reports'},
    {label: 'Per-module reporting',         href: '/modules/quiz/reports-and-analytics/what-is-smartwinnr-quiz-analytics', blurb: 'Each module also has its own Reports & Analytics leaf.'},
  ],
  admin: [
    {label: 'Create users individually',    href: '/administration/system-management/create-users-individually'},
    {label: 'Create users in bulk',         href: '/administration/system-management/create-users-in-bulk'},
    {label: 'Activate or deactivate a user', href: '/administration/system-management/how-to-activate-or-deactivate-a-user'},
    {label: 'Add a new division',           href: '/administration/system-management/how-to-add-a-new-division'},
    {label: 'Give access to other editors', href: '/administration/access-permissions/how-do-i-give-access-permission-to-other-editors'},
    {label: 'Update org configuration',     href: '/administration/system-management/changing-updating-configuration-for-an-organization'},
    {label: 'Resend account invitations',   href: '/administration/system-management/how-to-resend-account-invitation'},
    {label: 'Track resource usage',         href: '/administration/system-management/how-to-track-my-organizational-resource-usage'},
  ],
  integrations: [
    {label: 'Azure AD / SSO',               href: '/integrations/',                      privilege: 'azureIntegration'},
    {label: 'SCIM provisioning',            href: '/integrations/',                      privilege: 'scimIntegration'},
    {label: 'User auto-integration',        href: '/integrations/',                      privilege: 'autoUserIntegration'},
    {label: 'xAPI / LRS',                   href: '/integrations/',                      privilege: 'xApi'},
    {label: 'SCORM courses',                href: '/integrations/',                      privilege: 'scormCourse'},
    {label: 'REST API reference',           href: '/integrations/'},
  ],
  help: [
    {label: 'Help & support',               href: '/reference/help-support/'},
    {label: 'Troubleshoot for a common error code', href: '/reference/help-support/troubleshoot-for-common-error-code'},
    {label: 'Troubleshooting overview',     href: '/reference/troubleshooting/'},
    {label: 'Release notes & announcements', href: '/release-notes/announcements/'},
    {label: 'Ask Wynnie',                   href: '#open-chatbot'},
  ],
};

/**
 * Grouped entries for personas whose page is divided into multiple sections.
 * When a persona has no GROUPS entry, the page renders a single "Where to
 * start" section using the flat ENTRIES[slug] array.
 *
 * Entry shape is identical to ENTRIES - per-entry privilege gates still
 * fire via `PathBody.tsx`'s `lockedByPrivilege` branch.
 */
export const GROUPS: Partial<Record<PersonaSlug, EntryGroup[]>> = {
  editor: [
    {
      title: 'Where to start',
      entries: ENTRIES.editor,
    },
    {
      title: 'Module-level reports',
      entries: [
        {label: 'Detailed Quiz analytics',          href: '/modules/quiz/reports-and-analytics/detailed-quiz-analytics',                          privilege: 'quiz'},
        {label: 'Question response analytics',      href: '/modules/quiz/reports-and-analytics/question-response-analytics',                       privilege: 'quiz'},
        {label: 'AI Coaching dashboard insights',   href: '/modules/ai-coaching/reports-and-analytics/understanding-the-overview-analysis-tab-on-the-ai-coaching-dashboard', privilege: 'aiCoaching'},
        {label: 'SmartFeed engagement reports',     href: '/modules/smartfeed/reports-and-analytics/',                                              privilege: 'content'},
      ],
    },
  ],
  manager: [
    {
      title: 'Where to start',
      entries: ENTRIES.manager,
    },
    {
      title: 'Reports for your team',
      entries: [
        {label: 'Team analytics',              href: '/reports-and-analytics/legacy/team-analytics'},
        {label: 'Team progress report',        href: '/reports-and-analytics/legacy/team-progress-report'},
        {label: 'Reportee learner report',     href: '/reports-and-analytics/legacy/learner-overall-report',                                   privilege: 'learnerReport'},
        {label: 'Per-learner individual report', href: '/reports-and-analytics/legacy/learner-report-by-learner-individual-report-analytics', privilege: 'learnerReport'},
      ],
    },
  ],
  admin: [
    {
      title: 'Where to start',
      entries: ENTRIES.admin,
    },
    {
      title: 'Integrations',
      entries: ENTRIES.integrations,
    },
  ],
};
