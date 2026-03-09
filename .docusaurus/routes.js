import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/search',
    component: ComponentCreator('/search', 'be6'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '1f1'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'daa'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'bd7'),
            routes: [
              {
                path: '/admin-landing',
                component: ComponentCreator('/admin-landing', '561'),
                exact: true
              },
              {
                path: '/administration/administration',
                component: ComponentCreator('/administration/administration', '86b'),
                exact: true
              },
              {
                path: '/administration/advanced-options-for-projects',
                component: ComponentCreator('/administration/advanced-options-for-projects', '69e'),
                exact: true
              },
              {
                path: '/administration/bulk-custom-notifications',
                component: ComponentCreator('/administration/bulk-custom-notifications', '16b'),
                exact: true
              },
              {
                path: '/administration/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/administration/changing-updating-configuration-for-an-organization', '64a'),
                exact: true
              },
              {
                path: '/administration/create-users-individually',
                component: ComponentCreator('/administration/create-users-individually', '3d2'),
                exact: true
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/analytics-reporting',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/analytics-reporting', '14f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/detailed-explanation-of-reports',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/detailed-explanation-of-reports', '0f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/how-to-create-sales-tv',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/how-to-create-sales-tv', 'b3f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/how-to-view-project',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/how-to-view-project', 'b27'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/user-login-reports',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/user-login-reports', 'ad5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/advanced-analytics/widgets',
                component: ComponentCreator('/administration/cross-module-features/advanced-analytics/widgets', 'e6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition', 'ad8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition', '7aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition', '434'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition', '162'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/competitions-gamification',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/competitions-gamification', '8c4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/define-kpis',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/define-kpis', '50b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath', '0be'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard', '6e8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard', 'c6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', 'f82'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', '7d9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition', 'c72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition', 'af0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition', '57e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge', 'daa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard', '1fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition', '03a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard', '4d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment', '576'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-a-group-challenge',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-a-group-challenge', '615'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge', '157'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge', 'b89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-badges',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-badges', '3bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-certifcates',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-certifcates', 'b3e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-create-kpi',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-create-kpi', '9c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-upload-kpi-data',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-upload-kpi-data', 'da3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard', '4d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/leaderboards-of-a-competition',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/leaderboards-of-a-competition', '614'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/question-bank',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/question-bank', 'a95'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/understand-game-concepts',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/understand-game-concepts', '441'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/what-are-kpi-reports',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/what-are-kpi-reports', 'e0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/what-is-a-challenge',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/what-is-a-challenge', 'bd1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/what-is-an-achievement',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/what-is-an-achievement', '569'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/competitions-gamification/what-is-kpi-gamification',
                component: ComponentCreator('/administration/cross-module-features/competitions-gamification/what-is-kpi-gamification', '5ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/platform-features/how-to-edit-a-project',
                component: ComponentCreator('/administration/cross-module-features/platform-features/how-to-edit-a-project', 'c82'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/cross-module-features/platform-features/project-management',
                component: ComponentCreator('/administration/cross-module-features/platform-features/project-management', 'b62'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/custom-notifications',
                component: ComponentCreator('/administration/custom-notifications', 'f86'),
                exact: true
              },
              {
                path: '/administration/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/administration/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching', '3e8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/competency-frameworks/how-to-set-competencies',
                component: ComponentCreator('/administration/field-coaching-module/competency-frameworks/how-to-set-competencies', 'a3e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/field-coaching-setup/how-to-create-field-coaching',
                component: ComponentCreator('/administration/field-coaching-module/field-coaching-setup/how-to-create-field-coaching', '2c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template',
                component: ComponentCreator('/administration/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template', 'a8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/administration/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', 'e2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/manager-tools/what-is-my-team-coaching',
                component: ComponentCreator('/administration/field-coaching-module/manager-tools/what-is-my-team-coaching', '684'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/administration/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', '0b9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/administration/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile', '568'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/data-management/how-to-create-a-field-mapping',
                component: ComponentCreator('/administration/forms-module/data-management/how-to-create-a-field-mapping', '6af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/data-management/what-are-field-mappings',
                component: ComponentCreator('/administration/forms-module/data-management/what-are-field-mappings', '23a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-creation/form-analytics',
                component: ComponentCreator('/administration/forms-module/form-creation/form-analytics', 'a3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-creation/how-managers-approve-form',
                component: ComponentCreator('/administration/forms-module/form-creation/how-managers-approve-form', 'f46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-creation/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/administration/forms-module/form-creation/how-to-add-approvers-to-a-form', '3f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-creation/how-to-create-a-form',
                component: ComponentCreator('/administration/forms-module/form-creation/how-to-create-a-form', '9b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/administration/forms-module/form-management/how-can-i-submit-a-form-from-chat', '8c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/administration/forms-module/form-management/how-can-i-submit-a-form-from-left-menu', 'c56'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-to-add-new-form-submission',
                component: ComponentCreator('/administration/forms-module/form-management/how-to-add-new-form-submission', 'da0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/administration/forms-module/form-management/how-to-approve-reject-a-form-submission', '6a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/administration/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user', '432'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/administration/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user', 'c03'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/scorecards/how-to-create-a-scorecard',
                component: ComponentCreator('/administration/forms-module/scorecards/how-to-create-a-scorecard', 'f9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/forms-module/scorecards/what-are-scorecards',
                component: ComponentCreator('/administration/forms-module/scorecards/what-are-scorecards', '247'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/administration/how-can-an-admin-change-anyone-s-password', 'e7e'),
                exact: true
              },
              {
                path: '/administration/how-can-i-answer-a-query',
                component: ComponentCreator('/administration/how-can-i-answer-a-query', '21e'),
                exact: true
              },
              {
                path: '/administration/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/administration/how-can-i-change-the-password-for-a-user-account', 'b2a'),
                exact: true
              },
              {
                path: '/administration/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/administration/how-can-i-contact-smartwinnr-team', '090'),
                exact: true
              },
              {
                path: '/administration/how-to-add-a-new-division',
                component: ComponentCreator('/administration/how-to-add-a-new-division', 'a15'),
                exact: true
              },
              {
                path: '/administration/how-to-add-change-targets',
                component: ComponentCreator('/administration/how-to-add-change-targets', '84e'),
                exact: true
              },
              {
                path: '/administration/how-to-add-new-contacts',
                component: ComponentCreator('/administration/how-to-add-new-contacts', 'eeb'),
                exact: true
              },
              {
                path: '/administration/how-to-add-new-rule',
                component: ComponentCreator('/administration/how-to-add-new-rule', '233'),
                exact: true
              },
              {
                path: '/administration/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/administration/how-to-add-or-remove-users-to-a-chat-group', 'f60'),
                exact: true
              },
              {
                path: '/administration/how-to-change-company-logo',
                component: ComponentCreator('/administration/how-to-change-company-logo', '48a'),
                exact: true
              },
              {
                path: '/administration/how-to-create-a-group',
                component: ComponentCreator('/administration/how-to-create-a-group', '722'),
                exact: true
              },
              {
                path: '/administration/how-to-create-a-new-project',
                component: ComponentCreator('/administration/how-to-create-a-new-project', '192'),
                exact: true
              },
              {
                path: '/administration/how-to-download-a-chat',
                component: ComponentCreator('/administration/how-to-download-a-chat', '3ce'),
                exact: true
              },
              {
                path: '/administration/how-to-enable-a-chat-group',
                component: ComponentCreator('/administration/how-to-enable-a-chat-group', '1b1'),
                exact: true
              },
              {
                path: '/administration/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/how-to-post-a-query-from-the-smartwinnr-app', '9d9'),
                exact: true
              },
              {
                path: '/administration/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/administration/how-to-track-my-organizational-resource-usage', '213'),
                exact: true
              },
              {
                path: '/administration/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/how-to-use-qresolve-in-the-smartwinnr-app', 'c0e'),
                exact: true
              },
              {
                path: '/administration/how-to-view-an-audit-log',
                component: ComponentCreator('/administration/how-to-view-an-audit-log', '81c'),
                exact: true
              },
              {
                path: '/administration/how-to-view-existing-contacts',
                component: ComponentCreator('/administration/how-to-view-existing-contacts', 'c9f'),
                exact: true
              },
              {
                path: '/administration/how-to-view-notifications',
                component: ComponentCreator('/administration/how-to-view-notifications', 'ff7'),
                exact: true
              },
              {
                path: '/administration/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/administration/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', '7e5'),
                exact: true
              },
              {
                path: '/administration/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/administration/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub', '4d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/administration/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name', 'f6f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/administration/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item', 'dec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/khub-administration/knowledge-hub-khub',
                component: ComponentCreator('/administration/knowledge-hub-module/khub-administration/knowledge-hub-khub', 'f6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/khub-administration/what-is-khub',
                component: ComponentCreator('/administration/knowledge-hub-module/khub-administration/what-is-khub', '976'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/administration/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics', '795'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app', 'a7b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/administration/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items', '937'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/manage-password-policy',
                component: ComponentCreator('/administration/manage-password-policy', '1d1'),
                exact: true
              },
              {
                path: '/administration/quiz-module/',
                component: ComponentCreator('/administration/quiz-module/', 'd06'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/',
                component: ComponentCreator('/administration/quiz-module/features/', 'a0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/access-permission',
                component: ComponentCreator('/administration/quiz-module/features/access-permission', '061'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/activate-deactivate-quiz',
                component: ComponentCreator('/administration/quiz-module/features/activate-deactivate-quiz', '25c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/analytics-overview',
                component: ComponentCreator('/administration/quiz-module/features/analytics-overview', '4b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/duplicate-quiz',
                component: ComponentCreator('/administration/quiz-module/features/duplicate-quiz', 'a5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/export-questions',
                component: ComponentCreator('/administration/quiz-module/features/export-questions', 'd13'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/quick-actions',
                component: ComponentCreator('/administration/quiz-module/features/quick-actions', '23f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/quiz-tv',
                component: ComponentCreator('/administration/quiz-module/features/quiz-tv', '633'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/send-notification',
                component: ComponentCreator('/administration/quiz-module/features/send-notification', '0f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/features/upload-participation-data',
                component: ComponentCreator('/administration/quiz-module/features/upload-participation-data', 'bbb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-editors-evaluate-long-answer-questions', '518'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-import-question-is-different-from-add-new-question', '768'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-add-a-video-to-a-question', '87c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-add-an-audio-file-to-a-question', '957'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-add-an-image-to-the-question', 'cd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr', 'e96'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question', '322'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question', '14d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-a-hotspot-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-a-hotspot-question', '33f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-a-matching-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-a-matching-question', 'cc9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-a-missing-words-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-a-missing-words-question', '9f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-fill-in-the-blank-questions', '61a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-long-answer-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-long-answer-questions', '814'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-multiple-choice-questions', '284'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-numeric-type-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-numeric-type-questions', 'dfa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-create-re-order-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-create-re-order-questions', 'f94'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-edit-a-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-edit-a-question', '7f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-embed-a-link-into-the-question', 'ec0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-update-question-response',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-update-question-response', '3e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/administration/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions', 'a1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/question-management',
                component: ComponentCreator('/administration/quiz-module/question-management/question-management', '58f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/question-response-analytics',
                component: ComponentCreator('/administration/quiz-module/question-management/question-response-analytics', 'd9f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/question-structure',
                component: ComponentCreator('/administration/quiz-module/question-management/question-structure', 'c16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/question-management/short-answer-with-multiple-options',
                component: ComponentCreator('/administration/quiz-module/question-management/short-answer-with-multiple-options', '4c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors', 'e75'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes', 'd35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', 'd37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-to-manage-quiz-configurations',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-to-manage-quiz-configurations', '329'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-to-open-and-close-a-quiz', '371'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group', 'd89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/managing-questions',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/managing-questions', '251'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-administration/quiz-settings',
                component: ComponentCreator('/administration/quiz-module/quiz-administration/quiz-settings', '1d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/detailed-quiz-analytics', '995'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team', '081'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes', '486'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/learner-overall-report',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/learner-overall-report', 'c91'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics', 'dc3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/quiz-analytics-reports',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/quiz-analytics-reports', '401'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/quiz-analytics-through-charts',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/quiz-analytics-through-charts', 'e75'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/quiz-comparison-report',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/quiz-comparison-report', 'a96'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/quiz-reports',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/quiz-reports', '1cb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/quiz-wise-analytics',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/quiz-wise-analytics', '9b9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/team-analytics',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/team-analytics', '2b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-analytics/team-progress-report',
                component: ComponentCreator('/administration/quiz-module/quiz-analytics/team-progress-report', '10e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-configuration/quiz-administration',
                component: ComponentCreator('/administration/quiz-module/quiz-configuration/quiz-administration', 'b1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-configuration/quiz-types',
                component: ComponentCreator('/administration/quiz-module/quiz-configuration/quiz-types', 'a19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-configuration/understanding-knowledge-categories',
                component: ComponentCreator('/administration/quiz-module/quiz-configuration/understanding-knowledge-categories', 'd81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/administration/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics', '49a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-creation/creating-quiz',
                component: ComponentCreator('/administration/quiz-module/quiz-creation/creating-quiz', '191'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-creation/creating-quizzes',
                component: ComponentCreator('/administration/quiz-module/quiz-creation/creating-quizzes', 'abe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/administration/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz', 'f5b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-creation/how-to-create-a-manual-quiz',
                component: ComponentCreator('/administration/quiz-module/quiz-creation/how-to-create-a-manual-quiz', 'b86'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/quiz-creation/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/administration/quiz-module/quiz-creation/how-to-create-an-automatic-quiz', '24d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/',
                component: ComponentCreator('/administration/quiz-module/settings/', '14b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/advanced-integrations',
                component: ComponentCreator('/administration/quiz-module/settings/advanced-integrations', '312'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/automatic-quiz',
                component: ComponentCreator('/administration/quiz-module/settings/automatic-quiz', 'b19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/notifications',
                component: ComponentCreator('/administration/quiz-module/settings/notifications', 'd64'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/question-delivery',
                component: ComponentCreator('/administration/quiz-module/settings/question-delivery', '8f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/scoring-and-display',
                component: ComponentCreator('/administration/quiz-module/settings/scoring-and-display', 'f80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/timer-and-attempts',
                component: ComponentCreator('/administration/quiz-module/settings/timer-and-attempts', '21d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/quiz-module/settings/visual-and-media',
                component: ComponentCreator('/administration/quiz-module/settings/visual-and-media', 'fba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/search-users',
                component: ComponentCreator('/administration/search-users', 'af0'),
                exact: true
              },
              {
                path: '/administration/smartfeed-module/distribution-management/how-to-delete-smartfeeds',
                component: ComponentCreator('/administration/smartfeed-module/distribution-management/how-to-delete-smartfeeds', 'd48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/administration/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times', 'aa5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/administration/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams', 'f68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/distribution-management/smartfeed-management',
                component: ComponentCreator('/administration/smartfeed-module/distribution-management/smartfeed-management', '3ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/microlearning-strategy/',
                component: ComponentCreator('/administration/smartfeed-module/microlearning-strategy/', '426'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/microlearning-strategy/what-are-smartfeeds',
                component: ComponentCreator('/administration/smartfeed-module/microlearning-strategy/what-are-smartfeeds', 'c6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics', '5f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content', 'be6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', 'c37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed', 'e7e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content', 'c45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content', '952'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content', '145'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content', 'ab5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed', '89a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed',
                component: ComponentCreator('/administration/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed', '1a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/administration/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed', '817'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/administration/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath', 'cfa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/administration/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds', 'c64'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/administration/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', 'add'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app', 'edb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/administration/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr', '6a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/administration/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module', 'e29'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/administration/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions', '79f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/administration/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', '5c4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/administration/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics', 'b2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath', '217'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/administration/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath', '53c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-creation/how-to-create-a-smartpath',
                component: ComponentCreator('/administration/smartpath-module/smartpath-creation/how-to-create-a-smartpath', 'b1a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/administration/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions', '182'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-creation/how-to-edit-a-smartpath',
                component: ComponentCreator('/administration/smartpath-module/smartpath-creation/how-to-edit-a-smartpath', '143'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/administration/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', '23d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-management/smartpath-management',
                component: ComponentCreator('/administration/smartpath-module/smartpath-management/smartpath-management', '372'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/smartpath-module/smartpath-management/what-are-smartpaths',
                component: ComponentCreator('/administration/smartpath-module/smartpath-management/what-are-smartpaths', '548'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/response-management/how-to-assign-a-survey',
                component: ComponentCreator('/administration/survey-module/response-management/how-to-assign-a-survey', 'b15'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-analytics/survey-analytics',
                component: ComponentCreator('/administration/survey-module/survey-analytics/survey-analytics', '8fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-analytics/survey-template-analytics',
                component: ComponentCreator('/administration/survey-module/survey-analytics/survey-template-analytics', 'f80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/',
                component: ComponentCreator('/administration/survey-module/survey-creation/', '407'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/administration/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition', '42e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/how-to-create-a-survey',
                component: ComponentCreator('/administration/survey-module/survey-creation/how-to-create-a-survey', 'd2a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/how-to-create-a-survey-template',
                component: ComponentCreator('/administration/survey-module/survey-creation/how-to-create-a-survey-template', '9fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/how-to-delete-a-survey',
                component: ComponentCreator('/administration/survey-module/survey-creation/how-to-delete-a-survey', 'c9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/administration/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template', '832'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/administration/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template', '31e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/administration/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template', 'f74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/administration',
                component: ComponentCreator('/administration/system-management/user-management/administration', 'f2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/advanced-options-for-projects',
                component: ComponentCreator('/administration/system-management/user-management/advanced-options-for-projects', '987'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/bulk-custom-notifications',
                component: ComponentCreator('/administration/system-management/user-management/bulk-custom-notifications', '462'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/administration/system-management/user-management/changing-updating-configuration-for-an-organization', 'd03'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/create-users-in-bulk',
                component: ComponentCreator('/administration/system-management/user-management/create-users-in-bulk', 'bc7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/create-users-individually',
                component: ComponentCreator('/administration/system-management/user-management/create-users-individually', '296'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/analytics-reporting',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/analytics-reporting', '7b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/detailed-explanation-of-reports',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/detailed-explanation-of-reports', '58e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/how-to-create-sales-tv',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/how-to-create-sales-tv', '6f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/how-to-view-project',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/how-to-view-project', 'b34'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/user-login-reports',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/user-login-reports', '40c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/advanced-analytics/widgets',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/advanced-analytics/widgets', '4d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition', '120'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition', '851'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition', 'f3f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition', 'd3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/competitions-gamification',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/competitions-gamification', '5e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/define-kpis',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/define-kpis', '767'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath', 'd46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard', '66a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard', '789'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', 'b37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', '438'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition', '123'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition', '86f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition', '567'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge', '25b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard', '4c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition', '8a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard', '47d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment', 'eb9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-group-challenge',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-group-challenge', 'ae4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge', '735'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge', 'a89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-badges',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-badges', '4b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-certifcates',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-certifcates', '782'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-kpi',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-kpi', '4a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-upload-kpi-data',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-upload-kpi-data', '691'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard', 'e45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/leaderboards-of-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/leaderboards-of-a-competition', 'e91'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/question-bank',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/question-bank', 'b61'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/understand-game-concepts',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/understand-game-concepts', '42a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/what-are-kpi-reports',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/what-are-kpi-reports', 'f5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-a-challenge',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-a-challenge', 'ef4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-an-achievement',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-an-achievement', 'f9f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-kpi-gamification',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/competitions-gamification/what-is-kpi-gamification', '7fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/platform-features/how-to-edit-a-project',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/platform-features/how-to-edit-a-project', 'f98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/cross-module-features/platform-features/project-management',
                component: ComponentCreator('/administration/system-management/user-management/cross-module-features/platform-features/project-management', 'b69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/custom-notifications',
                component: ComponentCreator('/administration/system-management/user-management/custom-notifications', '702'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/delete-users',
                component: ComponentCreator('/administration/system-management/user-management/delete-users', 'bfb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching', '5b5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/competency-frameworks/how-to-set-competencies',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/competency-frameworks/how-to-set-competencies', 'bd7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching', '72d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template', 'db1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', '5f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/manager-tools/what-is-my-team-coaching',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/manager-tools/what-is-my-team-coaching', 'dc3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', '64c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/administration/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile', '783'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/data-management/how-to-create-a-field-mapping',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/data-management/how-to-create-a-field-mapping', '82c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/data-management/what-are-field-mappings',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/data-management/what-are-field-mappings', '043'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-creation/form-analytics',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-creation/form-analytics', '461'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-creation/how-managers-approve-form',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-creation/how-managers-approve-form', '471'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-creation/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-creation/how-to-add-approvers-to-a-form', 'c2a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-creation/how-to-create-a-form',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-creation/how-to-create-a-form', '8ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-chat', '664'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-left-menu', '3b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-to-add-new-form-submission',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-to-add-new-form-submission', '831'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-to-approve-reject-a-form-submission', 'e36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user', '2d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user', '171'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/scorecards/how-to-create-a-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/scorecards/how-to-create-a-scorecard', '5f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/forms-module/scorecards/what-are-scorecards',
                component: ComponentCreator('/administration/system-management/user-management/forms-module/scorecards/what-are-scorecards', 'f23'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/administration/system-management/user-management/how-can-an-admin-change-anyone-s-password', 'e66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-can-i-answer-a-query',
                component: ComponentCreator('/administration/system-management/user-management/how-can-i-answer-a-query', '8fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/administration/system-management/user-management/how-can-i-change-the-password-for-a-user-account', 'e37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/administration/system-management/user-management/how-can-i-contact-smartwinnr-team', '2ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-activate-or-deactivate-a-user',
                component: ComponentCreator('/administration/system-management/user-management/how-to-activate-or-deactivate-a-user', '5d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-add-a-new-division',
                component: ComponentCreator('/administration/system-management/user-management/how-to-add-a-new-division', 'de9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-add-change-targets',
                component: ComponentCreator('/administration/system-management/user-management/how-to-add-change-targets', 'da2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-add-new-contacts',
                component: ComponentCreator('/administration/system-management/user-management/how-to-add-new-contacts', '219'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-add-new-rule',
                component: ComponentCreator('/administration/system-management/user-management/how-to-add-new-rule', 'dbb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/administration/system-management/user-management/how-to-add-or-remove-users-to-a-chat-group', 'b65'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-change-company-logo',
                component: ComponentCreator('/administration/system-management/user-management/how-to-change-company-logo', '250'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-create-a-group',
                component: ComponentCreator('/administration/system-management/user-management/how-to-create-a-group', '015'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-create-a-new-project',
                component: ComponentCreator('/administration/system-management/user-management/how-to-create-a-new-project', 'd93'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-download-a-chat',
                component: ComponentCreator('/administration/system-management/user-management/how-to-download-a-chat', 'fd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-enable-a-chat-group',
                component: ComponentCreator('/administration/system-management/user-management/how-to-enable-a-chat-group', 'a6f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/how-to-post-a-query-from-the-smartwinnr-app', 'fa8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/administration/system-management/user-management/how-to-track-my-organizational-resource-usage', '5c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/how-to-use-qresolve-in-the-smartwinnr-app', '8f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-view-an-audit-log',
                component: ComponentCreator('/administration/system-management/user-management/how-to-view-an-audit-log', '8bf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-view-existing-contacts',
                component: ComponentCreator('/administration/system-management/user-management/how-to-view-existing-contacts', 'a45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-to-view-notifications',
                component: ComponentCreator('/administration/system-management/user-management/how-to-view-notifications', 'bb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/administration/system-management/user-management/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', 'f0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub', '584'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name', 'dc4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item', '45c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/khub-administration/knowledge-hub-khub',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/khub-administration/knowledge-hub-khub', '12b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/khub-administration/what-is-khub',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/khub-administration/what-is-khub', '0e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics', 'e0c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app', '3e1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/administration/system-management/user-management/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items', '8cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/manage-password-policy',
                component: ComponentCreator('/administration/system-management/user-management/manage-password-policy', 'd12'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/', '6b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-editors-evaluate-long-answer-questions', '7e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-import-question-is-different-from-add-new-question', 'd4e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-add-a-video-to-a-question', '707'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-add-an-audio-file-to-a-question', '778'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-add-an-image-to-the-question', '65e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr', '2a4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question', '98a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question', 'c0a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-hotspot-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-hotspot-question', '04a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-matching-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-matching-question', '8b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-missing-words-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-a-missing-words-question', '593'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-fill-in-the-blank-questions', 'b69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-long-answer-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-long-answer-questions', '19c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-multiple-choice-questions', '8f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-numeric-type-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-numeric-type-questions', '09a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-create-re-order-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-create-re-order-questions', '84e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-edit-a-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-edit-a-question', '814'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-embed-a-link-into-the-question', '204'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-update-question-response',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-update-question-response', 'c3d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions', 'a81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/question-management',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/question-management', '2f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/question-response-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/question-response-analytics', 'bc8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/question-structure',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/question-structure', '1e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/question-management/short-answer-with-multiple-options',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/question-management/short-answer-with-multiple-options', 'c69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors', 'df6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes', '1dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', '1f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-to-manage-quiz-configurations',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-to-manage-quiz-configurations', 'd83'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-to-open-and-close-a-quiz', '60a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group', '927'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/managing-questions',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/managing-questions', '13b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-administration/quiz-settings',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-administration/quiz-settings', '9d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/detailed-quiz-analytics', '4f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team', 'ace'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes', 'b0c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/learner-overall-report',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/learner-overall-report', 'ef2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics', 'b6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-reports',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-reports', '160'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-through-charts',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-through-charts', '7af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-comparison-report',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-comparison-report', '054'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-reports',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-reports', 'a4a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-wise-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/quiz-wise-analytics', '182'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/team-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/team-analytics', 'e27'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-analytics/team-progress-report',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-analytics/team-progress-report', 'ab6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-configuration/quiz-administration',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-configuration/quiz-administration', 'cf9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-configuration/quiz-types',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-configuration/quiz-types', '611'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-configuration/understanding-knowledge-categories',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-configuration/understanding-knowledge-categories', '0e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics', '996'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-creation/creating-quiz',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-creation/creating-quiz', '65f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-creation/creating-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-creation/creating-quizzes', '694'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz', '4ce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-creation/how-to-create-a-manual-quiz',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-creation/how-to-create-a-manual-quiz', 'cf8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/quiz-module/quiz-creation/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/administration/system-management/user-management/quiz-module/quiz-creation/how-to-create-an-automatic-quiz', 'f59'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/search-users',
                component: ComponentCreator('/administration/system-management/user-management/search-users', 'b19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-delete-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-delete-smartfeeds', 'ff0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times', '35d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams', 'e38'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/distribution-management/smartfeed-management',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/distribution-management/smartfeed-management', 'fb0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/microlearning-strategy/',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/microlearning-strategy/', 'e38'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/microlearning-strategy/what-are-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/microlearning-strategy/what-are-smartfeeds', 'dd5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics', '9df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content', 'b1f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', '371'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed', 'b91'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content', '301'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content', 'f79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content', 'c7d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content', '52e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed', '264'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed', '6ff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed', 'd37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath', 'e9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds', 'ca7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '86a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app', '8b9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr', '92b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module', 'b8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions', '067'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', 'ac7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics', '324'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath', 'f77'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath', 'ffb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-smartpath', 'a74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions', '9ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-edit-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-creation/how-to-edit-a-smartpath', '784'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', 'f44'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-management/smartpath-management',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-management/smartpath-management', '458'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/smartpath-module/smartpath-management/what-are-smartpaths',
                component: ComponentCreator('/administration/system-management/user-management/smartpath-module/smartpath-management/what-are-smartpaths', '8c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/response-management/how-to-assign-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/response-management/how-to-assign-a-survey', 'ad5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-analytics/survey-analytics',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-analytics/survey-analytics', 'c86'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-analytics/survey-template-analytics',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-analytics/survey-template-analytics', '093'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/', 'acb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition', '9a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey', 'ba5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey-template', '4a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/how-to-delete-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/how-to-delete-a-survey', '383'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template', '2e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template', '830'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template', 'e08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/administration',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/administration', '67c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/advanced-options-for-projects',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/advanced-options-for-projects', 'd11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/bulk-custom-notifications',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/bulk-custom-notifications', '1a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/changing-updating-configuration-for-an-organization', '5f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/create-users-individually',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/create-users-individually', '43a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/analytics-reporting',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/analytics-reporting', 'e35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/detailed-explanation-of-reports',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/detailed-explanation-of-reports', 'e14'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/how-to-create-sales-tv',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/how-to-create-sales-tv', 'fd1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/how-to-view-project',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/how-to-view-project', 'fce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/user-login-reports',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/user-login-reports', '847'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/widgets',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/advanced-analytics/widgets', '787'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-design/how-to-create-a-competition', '583'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition', 'd5b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition', '167'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition', '93b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competitions-gamification',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/competitions-gamification', 'b6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/define-kpis',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/define-kpis', '12d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-gamify-a-smartpath', 'df8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-can-i-view-a-competition-leaderboard', '180'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-do-i-view-the-kpi-scorecard', '7a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', 'f85'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', '6c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-challenge-to-the-competition', '45d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-form-to-competition', 'd27'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-a-scorecard-to-a-competition', 'cb9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-different-activities-to-a-challenge', '07c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard', 'c17'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-smartfeed-within-a-competition', '7d5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-add-the-scorecard-to-leaderboard', '781'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-award-points-on-badge-assignment', '6e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-group-challenge',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-group-challenge', 'c78'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-a-manager-challenge', 'bef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-an-individual-challenge', 'eb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-badges',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-badges', 'f24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-certifcates',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-certifcates', 'bc3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-kpi',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-create-kpi', 'c41'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-upload-kpi-data',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-upload-kpi-data', '7a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard', 'b18'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/leaderboards-of-a-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/leaderboards-of-a-competition', '7d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/question-bank',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/question-bank', '8bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/understand-game-concepts',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/understand-game-concepts', '594'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-are-kpi-reports',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-are-kpi-reports', '720'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-a-challenge',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-a-challenge', 'e23'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-an-achievement',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-an-achievement', '908'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-kpi-gamification',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/competitions-gamification/what-is-kpi-gamification', '6e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/platform-features/how-to-edit-a-project',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/platform-features/how-to-edit-a-project', '9c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/cross-module-features/platform-features/project-management',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/cross-module-features/platform-features/project-management', 'c19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/custom-notifications',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/custom-notifications', 'c8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/competency-frameworks/how-to-add-competencies-for-field-coaching', '44b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/competency-frameworks/how-to-set-competencies',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/competency-frameworks/how-to-set-competencies', '085'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching', 'a6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/field-coaching-setup/how-to-create-field-coaching-template', '482'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/manager-tools/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', '2de'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/manager-tools/what-is-my-team-coaching',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/manager-tools/what-is-my-team-coaching', '6f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', '00e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/field-coaching-module/performance-evaluation/how-to-review-field-coaching-from-managers-view-in-mobile', '4f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/data-management/how-to-create-a-field-mapping',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/data-management/how-to-create-a-field-mapping', '1ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/data-management/what-are-field-mappings',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/data-management/what-are-field-mappings', '047'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/form-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/form-analytics', '7ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-managers-approve-form',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-managers-approve-form', '299'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-to-add-approvers-to-a-form', 'bda'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-to-create-a-form',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-creation/how-to-create-a-form', '76c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-chat', '14d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-can-i-submit-a-form-from-left-menu', '637'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-add-new-form-submission',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-add-new-form-submission', '76f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-approve-reject-a-form-submission', '019'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-edit-a-form-on-submitted-by-a-user', 'c33'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/form-management/how-to-submit-a-form-on-behalf-of-a-user', 'ad6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/scorecards/how-to-create-a-scorecard',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/scorecards/how-to-create-a-scorecard', '8ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/forms-module/scorecards/what-are-scorecards',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/forms-module/scorecards/what-are-scorecards', 'aac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-can-an-admin-change-anyone-s-password', '074'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-can-i-answer-a-query',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-can-i-answer-a-query', 'e76'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-can-i-change-the-password-for-a-user-account', '806'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-can-i-contact-smartwinnr-team', 'c99'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-add-a-new-division',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-add-a-new-division', '55a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-add-change-targets',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-add-change-targets', 'd63'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-add-new-contacts',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-add-new-contacts', 'e34'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-add-new-rule',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-add-new-rule', 'f1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-add-or-remove-users-to-a-chat-group', '0e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-change-company-logo',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-change-company-logo', '953'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-create-a-group',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-create-a-group', 'f6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-create-a-new-project',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-create-a-new-project', '134'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-download-a-chat',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-download-a-chat', 'f51'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-enable-a-chat-group',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-enable-a-chat-group', '5e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-post-a-query-from-the-smartwinnr-app', 'f66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-track-my-organizational-resource-usage', '560'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-use-qresolve-in-the-smartwinnr-app', 'e87'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-view-an-audit-log',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-view-an-audit-log', 'bd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-view-existing-contacts',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-view-existing-contacts', '85a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-to-view-notifications',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-to-view-notifications', 'bf7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', '944'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-create-folders-and-items-in-khub', '843'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-folder-name', '092'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/content-management/how-can-i-edit-a-khub-item', '5c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-administration/knowledge-hub-khub',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-administration/knowledge-hub-khub', '6eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-administration/what-is-khub',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-administration/what-is-khub', '194'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/khub-analytics/how-can-i-view-khub-analytics', '594'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/user-experience/how-to-use-khub-in-the-smartwinnr-app', '8b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/knowledge-hub-module/user-experience/understanding-recent-trending-and-latest-khub-items', '0f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/manage-password-policy',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/manage-password-policy', '8a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/', 'c2a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-editors-evaluate-long-answer-questions', '8b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-import-question-is-different-from-add-new-question', '32f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-a-video-to-a-question', '8e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-an-audio-file-to-a-question', 'e2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-add-an-image-to-the-question', 'b95'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr', 'ee8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-image-question', '26f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-drag-and-drop-into-text-question', '738'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-hotspot-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-hotspot-question', '014'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-matching-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-matching-question', '022'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-missing-words-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-a-missing-words-question', 'e1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-fill-in-the-blank-questions', '5e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-long-answer-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-long-answer-questions', '482'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-multiple-choice-questions', 'a60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-numeric-type-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-numeric-type-questions', '190'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-re-order-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-create-re-order-questions', '749'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-edit-a-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-edit-a-question', '44a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-embed-a-link-into-the-question', '979'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-update-question-response',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-update-question-response', '74f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/how-to-upload-questions-in-bulk-using-import-questions', '6e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-management',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-management', '606'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-response-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-response-analytics', 'f11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-structure',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/question-structure', '315'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/short-answer-with-multiple-options',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/question-management/short-answer-with-multiple-options', '1c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-do-i-give-access-permission-to-other-editors', '239'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-activate-automatic-reminders-for-your-quizzes', '87d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', '384'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-manage-quiz-configurations',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-manage-quiz-configurations', '432'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-open-and-close-a-quiz', 'bd1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/how-to-send-quizzes-surveys-and-content-using-group', 'a9d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/managing-questions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/managing-questions', 'ddd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/quiz-settings',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-administration/quiz-settings', '55c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/detailed-quiz-analytics', 'acd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team', 'e4e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/how-to-find-the-progress-of-your-team-in-quizzes', 'cd2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/learner-overall-report',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/learner-overall-report', 'b4d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/learner-report-by-learner-individual-report-analytics', 'e8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-reports',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-reports', '1aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-through-charts',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-analytics-through-charts', 'c97'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-comparison-report',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-comparison-report', 'ca2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-reports',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-reports', '48e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-wise-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/quiz-wise-analytics', '5dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/team-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/team-analytics', '74e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/team-progress-report',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-analytics/team-progress-report', 'da2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/quiz-administration',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/quiz-administration', 'd73'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/quiz-types',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/quiz-types', '0c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/understanding-knowledge-categories',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/understanding-knowledge-categories', 'cb9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-configuration/what-is-smartwinnr-quiz-analytics', '376'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/creating-quiz',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/creating-quiz', 'ede'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/creating-quizzes',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/creating-quizzes', 'a7d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-can-i-duplicate-a-quiz', '205'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-to-create-a-manual-quiz',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-to-create-a-manual-quiz', '296'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/quiz-module/quiz-creation/how-to-create-an-automatic-quiz', '541'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/search-users',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/search-users', '1b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-delete-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-delete-smartfeeds', '900'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-send-a-smartfeed-multiple-times', '318'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/how-to-send-the-smartfeed-to-teams', 'ef1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/smartfeed-management',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/distribution-management/smartfeed-management', '69e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/microlearning-strategy/',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/microlearning-strategy/', '21c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/microlearning-strategy/what-are-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/microlearning-strategy/what-are-smartfeeds', '4a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-analytics/how-to-view-smartfeed-analytics', '0c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-image-to-your-content', 'be3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', 'fec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-recording-to-a-smartfeed', 'd28'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-a-video-to-your-content', '532'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-an-audio-file-to-your-content', 'b6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-add-reference-to-an-external-link-to-your-content', '268'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-attach-pdf-file-to-your-content', '8ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-create-a-smartfeed', '290'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/smartfeed-creation/how-to-edit-a-smartfeed', '47b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-do-i-like-a-smartfeed', '0ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-to-download-share-a-smartfeed-in-smartpath', 'c2f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartfeed-module/user-experience-management/how-to-view-all-the-smartfeeds', '2c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learner-progress-tracking/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '0ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-content-management/how-to-access-the-scorm-course-from-the-smartwinnr-app', '631'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-content-management/how-to-import-scorm-course-into-smartwinnr', '4cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-add-learning-sessions-in-smartpath-module', '6bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions', '198'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', '2af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-analytics/how-to-view-the-smartpath-analytics', '7f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-can-i-gamify-a-smartpath', '610'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-module-for-smartpath', '4da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-a-smartpath', 'eb0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-create-smartpath-with-learning-sessions', '623'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-edit-a-smartpath',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-creation/how-to-edit-a-smartpath', '8e2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', '3c4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/smartpath-management',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/smartpath-management', 'aa9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/what-are-smartpaths',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/smartpath-module/smartpath-management/what-are-smartpaths', '167'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/response-management/how-to-assign-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/response-management/how-to-assign-a-survey', '31e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-analytics/survey-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-analytics/survey-analytics', '90d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-analytics/survey-template-analytics',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-analytics/survey-template-analytics', '55e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/', '184'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-add-a-video-coaching-to-the-competition', '59b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey', '31b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-create-a-survey-template', '4c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-delete-a-survey',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-delete-a-survey', 'e2d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/how-to-duplicate-a-survey-and-survey-template', '688'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template', '550'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/administration/system-management/user-management/system-management/user-management/survey-module/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template', '02f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/coaching-assignment-creation/create-a-coaching',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/coaching-assignment-creation/create-a-coaching', 'c74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/coaching-assignment-creation/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/coaching-assignment-creation/how-to-create-a-video-coaching-assignment', 'fb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/streaming-configuration/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/streaming-configuration/how-to-enable-the-streaming-links-for-video-coaching', '5c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-do-i-upload-a-coaching-video', '1ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-reset-a-coaching-video',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-reset-a-coaching-video', '26a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-review-a-video-coaching-assignment', '568'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-share-a-coaching-video',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-share-a-coaching-video', '4fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-audio-recording-for-coaching', 'b8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-screen-recording-for-coaching', '1a4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/administration/system-management/user-management/video-coaching-module/video-review-workflow/how-to-upload-video-recording-for-coaching', '062'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/what-are-chat-groups',
                component: ComponentCreator('/administration/system-management/user-management/what-are-chat-groups', 'b49'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/what-is-my-username-and-password',
                component: ComponentCreator('/administration/system-management/user-management/what-is-my-username-and-password', '623'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/what-is-qresolve',
                component: ComponentCreator('/administration/system-management/user-management/what-is-qresolve', 'c88'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/what-is-the-purpose-of-notifications',
                component: ComponentCreator('/administration/system-management/user-management/what-is-the-purpose-of-notifications', 'f71'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/user-management/when-are-chat-groups-needed',
                component: ComponentCreator('/administration/system-management/user-management/when-are-chat-groups-needed', '541'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/coaching-assignment-creation/create-a-coaching',
                component: ComponentCreator('/administration/video-coaching-module/coaching-assignment-creation/create-a-coaching', '5b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/coaching-assignment-creation/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/administration/video-coaching-module/coaching-assignment-creation/how-to-create-a-video-coaching-assignment', '6f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/streaming-configuration/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/administration/video-coaching-module/streaming-configuration/how-to-enable-the-streaming-links-for-video-coaching', 'f2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-do-i-upload-a-coaching-video', '224'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-reset-a-coaching-video',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-reset-a-coaching-video', '969'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-review-a-video-coaching-assignment', 'aea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-share-a-coaching-video',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-share-a-coaching-video', '0f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-upload-audio-recording-for-coaching', '5e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-upload-screen-recording-for-coaching', '729'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/video-coaching-module/video-review-workflow/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/administration/video-coaching-module/video-review-workflow/how-to-upload-video-recording-for-coaching', '1f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/what-are-chat-groups',
                component: ComponentCreator('/administration/what-are-chat-groups', '020'),
                exact: true
              },
              {
                path: '/administration/what-is-my-username-and-password',
                component: ComponentCreator('/administration/what-is-my-username-and-password', '573'),
                exact: true
              },
              {
                path: '/administration/what-is-qresolve',
                component: ComponentCreator('/administration/what-is-qresolve', 'c4a'),
                exact: true
              },
              {
                path: '/administration/what-is-the-purpose-of-notifications',
                component: ComponentCreator('/administration/what-is-the-purpose-of-notifications', 'bd6'),
                exact: true
              },
              {
                path: '/administration/when-are-chat-groups-needed',
                component: ComponentCreator('/administration/when-are-chat-groups-needed', '0dc'),
                exact: true
              },
              {
                path: '/analytics-reporting/analytics-reporting',
                component: ComponentCreator('/analytics-reporting/analytics-reporting', '80b'),
                exact: true
              },
              {
                path: '/announcements/',
                component: ComponentCreator('/announcements/', '4f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AUTOMATED_IMAGE_GENERATION',
                component: ComponentCreator('/AUTOMATED_IMAGE_GENERATION', 'b49'),
                exact: true
              },
              {
                path: '/AUTOMATED_SCREENSHOT_CAPTURE',
                component: ComponentCreator('/AUTOMATED_SCREENSHOT_CAPTURE', '626'),
                exact: true
              },
              {
                path: '/coaching-performance/',
                component: ComponentCreator('/coaching-performance/', 'cb1'),
                exact: true
              },
              {
                path: '/coaching-performance/create-a-coaching',
                component: ComponentCreator('/coaching-performance/create-a-coaching', 'e5c'),
                exact: true
              },
              {
                path: '/coaching-performance/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-do-i-upload-a-coaching-video', '216'),
                exact: true
              },
              {
                path: '/coaching-performance/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/coaching-performance/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', 'f67'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/coaching-performance/how-to-add-competencies-for-field-coaching', 'ac7'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/coaching-performance/how-to-create-a-video-coaching-assignment', 'bc8'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-create-field-coaching',
                component: ComponentCreator('/coaching-performance/how-to-create-field-coaching', 'e94'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-create-field-coaching-template',
                component: ComponentCreator('/coaching-performance/how-to-create-field-coaching-template', 'b6f'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/coaching-performance/how-to-enable-the-streaming-links-for-video-coaching', 'efe'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-reset-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-to-reset-a-coaching-video', '68d'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/coaching-performance/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', '9ed'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/coaching-performance/how-to-review-a-video-coaching-assignment', '3cd'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/coaching-performance/how-to-review-field-coaching-from-managers-view-in-mobile', '097'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-set-competencies',
                component: ComponentCreator('/coaching-performance/how-to-set-competencies', '674'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-share-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-to-share-a-coaching-video', '4de'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-audio-recording-for-coaching', '0aa'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-screen-recording-for-coaching', 'f0d'),
                exact: true
              },
              {
                path: '/coaching-performance/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-video-recording-for-coaching', '78d'),
                exact: true
              },
              {
                path: '/coaching-performance/what-is-my-team-coaching',
                component: ComponentCreator('/coaching-performance/what-is-my-team-coaching', '1d9'),
                exact: true
              },
              {
                path: '/competitions-gamification/competition-design/how-to-create-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-design/how-to-create-a-competition', '4d8'),
                exact: true
              },
              {
                path: '/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition', '827'),
                exact: true
              },
              {
                path: '/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition', 'bda'),
                exact: true
              },
              {
                path: '/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition', 'acd'),
                exact: true
              },
              {
                path: '/competitions-gamification/competitions-gamification',
                component: ComponentCreator('/competitions-gamification/competitions-gamification', '16c'),
                exact: true
              },
              {
                path: '/competitions-gamification/define-kpis',
                component: ComponentCreator('/competitions-gamification/define-kpis', '722'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/competitions-gamification/how-can-i-gamify-a-smartpath', 'e3a'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-can-i-view-a-competition-leaderboard', '92e'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/competitions-gamification/how-do-i-view-the-kpi-scorecard', '2fa'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', 'b4f'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', 'ddc'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-challenge-to-the-competition', '227'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-a-form-to-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-form-to-competition', 'c99'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-scorecard-to-a-competition', 'fc4'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-add-different-activities-to-a-challenge', 'f3a'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard', '65b'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-smartfeed-within-a-competition', '42d'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-to-add-the-scorecard-to-leaderboard', '4f5'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/competitions-gamification/how-to-award-points-on-badge-assignment', '394'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-a-group-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-a-group-challenge', 'a69'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-a-manager-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-a-manager-challenge', '6f7'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-an-individual-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-an-individual-challenge', 'c6a'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-badges',
                component: ComponentCreator('/competitions-gamification/how-to-create-badges', '530'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-certifcates',
                component: ComponentCreator('/competitions-gamification/how-to-create-certifcates', '38b'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-create-kpi',
                component: ComponentCreator('/competitions-gamification/how-to-create-kpi', '247'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-upload-kpi-data',
                component: ComponentCreator('/competitions-gamification/how-to-upload-kpi-data', 'de3'),
                exact: true
              },
              {
                path: '/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard', 'd19'),
                exact: true
              },
              {
                path: '/competitions-gamification/leaderboards-of-a-competition',
                component: ComponentCreator('/competitions-gamification/leaderboards-of-a-competition', 'bdf'),
                exact: true
              },
              {
                path: '/competitions-gamification/question-bank',
                component: ComponentCreator('/competitions-gamification/question-bank', 'a17'),
                exact: true
              },
              {
                path: '/competitions-gamification/understand-game-concepts',
                component: ComponentCreator('/competitions-gamification/understand-game-concepts', 'f95'),
                exact: true
              },
              {
                path: '/competitions-gamification/what-are-kpi-reports',
                component: ComponentCreator('/competitions-gamification/what-are-kpi-reports', '3ae'),
                exact: true
              },
              {
                path: '/competitions-gamification/what-is-a-challenge',
                component: ComponentCreator('/competitions-gamification/what-is-a-challenge', 'd36'),
                exact: true
              },
              {
                path: '/competitions-gamification/what-is-an-achievement',
                component: ComponentCreator('/competitions-gamification/what-is-an-achievement', '6f9'),
                exact: true
              },
              {
                path: '/competitions-gamification/what-is-kpi-gamification',
                component: ComponentCreator('/competitions-gamification/what-is-kpi-gamification', 'bae'),
                exact: true
              },
              {
                path: '/complete-menu-tree-structure',
                component: ComponentCreator('/complete-menu-tree-structure', 'c34'),
                exact: true
              },
              {
                path: '/editor-landing',
                component: ComponentCreator('/editor-landing', '94b'),
                exact: true
              },
              {
                path: '/forms-data-collection/data-management/how-to-create-a-field-mapping',
                component: ComponentCreator('/forms-data-collection/data-management/how-to-create-a-field-mapping', '57f'),
                exact: true
              },
              {
                path: '/forms-data-collection/data-management/what-are-field-mappings',
                component: ComponentCreator('/forms-data-collection/data-management/what-are-field-mappings', '24c'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-creation/form-analytics',
                component: ComponentCreator('/forms-data-collection/form-creation/form-analytics', 'c3f'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-creation/how-managers-approve-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-managers-approve-form', 'baa'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-creation/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-to-add-approvers-to-a-form', '2e8'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-creation/how-to-create-a-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-to-create-a-form', 'cb2'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/forms-data-collection/form-management/how-can-i-submit-a-form-from-chat', 'b50'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/forms-data-collection/form-management/how-can-i-submit-a-form-from-left-menu', 'fed'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-to-add-new-form-submission',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-add-new-form-submission', '0fa'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-approve-reject-a-form-submission', 'f36'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-edit-a-form-on-submitted-by-a-user', '562'),
                exact: true
              },
              {
                path: '/forms-data-collection/form-management/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-submit-a-form-on-behalf-of-a-user', '07d'),
                exact: true
              },
              {
                path: '/forms-data-collection/scorecards/how-to-create-a-scorecard',
                component: ComponentCreator('/forms-data-collection/scorecards/how-to-create-a-scorecard', '1e8'),
                exact: true
              },
              {
                path: '/forms-data-collection/scorecards/what-are-scorecards',
                component: ComponentCreator('/forms-data-collection/scorecards/what-are-scorecards', 'e80'),
                exact: true
              },
              {
                path: '/getting-started/about-smartwinnr',
                component: ComponentCreator('/getting-started/about-smartwinnr', '5fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/account-setup-login',
                component: ComponentCreator('/getting-started/account-setup-login', 'b5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/admin-onboarding',
                component: ComponentCreator('/getting-started/admin-onboarding', 'cbd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/app-management',
                component: ComponentCreator('/getting-started/app-management', 'f48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/browser-and-device-support',
                component: ComponentCreator('/getting-started/browser-and-device-support', '0fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/editor-onboarding',
                component: ComponentCreator('/getting-started/editor-onboarding', '194'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-can-i-change-my-language-in-smartwinnr-app',
                component: ComponentCreator('/getting-started/how-can-i-change-my-language-in-smartwinnr-app', 'bff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-can-i-change-my-password-for-smartwinnr',
                component: ComponentCreator('/getting-started/how-can-i-change-my-password-for-smartwinnr', '130'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-can-i-change-my-profile-image',
                component: ComponentCreator('/getting-started/how-can-i-change-my-profile-image', 'df9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-can-i-check-the-app-version-web-view-version',
                component: ComponentCreator('/getting-started/how-can-i-check-the-app-version-web-view-version', '33d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-can-i-enable-push-notification-for-smartwinnr-app',
                component: ComponentCreator('/getting-started/how-can-i-enable-push-notification-for-smartwinnr-app', '9f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-do-i-unlock-an-account',
                component: ComponentCreator('/getting-started/how-do-i-unlock-an-account', 'c62'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-to-resend-account-invitation',
                component: ComponentCreator('/getting-started/how-to-resend-account-invitation', 'a8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-to-update-the-smartwinnr-app-from-app-view',
                component: ComponentCreator('/getting-started/how-to-update-the-smartwinnr-app-from-app-view', '762'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-to-update-the-smartwinnr-app-from-web-view',
                component: ComponentCreator('/getting-started/how-to-update-the-smartwinnr-app-from-web-view', '1b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/how-to-update-the-smartwinnr-app-web-view',
                component: ComponentCreator('/getting-started/how-to-update-the-smartwinnr-app-web-view', '414'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/login-to-smartwinnr-app',
                component: ComponentCreator('/getting-started/login-to-smartwinnr-app', '462'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/manager-features',
                component: ComponentCreator('/getting-started/manager-features', 'fbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/manager-onboarding',
                component: ComponentCreator('/getting-started/manager-onboarding', 'bfd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/my-account-is-locked-what-should-i-do',
                component: ComponentCreator('/getting-started/my-account-is-locked-what-should-i-do', 'adb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/profile-settings',
                component: ComponentCreator('/getting-started/profile-settings', '5c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/switching-to-manager-view',
                component: ComponentCreator('/getting-started/switching-to-manager-view', '79a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/user-onboarding',
                component: ComponentCreator('/getting-started/user-onboarding', '714'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/what-if-i-ve-forgotten-my-password',
                component: ComponentCreator('/getting-started/what-if-i-ve-forgotten-my-password', 'ee3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/what-if-i-ve-forgotten-my-pin',
                component: ComponentCreator('/getting-started/what-if-i-ve-forgotten-my-pin', '191'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/getting-started/what-is-smartwinnr',
                component: ComponentCreator('/getting-started/what-is-smartwinnr', '8c1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/help-support/help-support',
                component: ComponentCreator('/help-support/help-support', '4aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/help-support/troubleshoot-for-common-error-code',
                component: ComponentCreator('/help-support/troubleshoot-for-common-error-code', 'cd4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/content-creation/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/knowledge-hub/content-creation/how-can-i-create-folders-and-items-in-khub', 'f0c'),
                exact: true
              },
              {
                path: '/knowledge-hub/content-creation/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/knowledge-hub/content-creation/how-can-i-edit-a-khub-item', 'b57'),
                exact: true
              },
              {
                path: '/knowledge-hub/content-organization/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/knowledge-hub/content-organization/how-can-i-edit-a-khub-folder-name', '6f4'),
                exact: true
              },
              {
                path: '/knowledge-hub/khub-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/knowledge-hub/khub-analytics/how-can-i-view-khub-analytics', 'ca7'),
                exact: true
              },
              {
                path: '/knowledge-hub/knowledge-hub-khub',
                component: ComponentCreator('/knowledge-hub/knowledge-hub-khub', 'a78'),
                exact: true
              },
              {
                path: '/knowledge-hub/user-experience/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/knowledge-hub/user-experience/how-to-use-khub-in-the-smartwinnr-app', '7e9'),
                exact: true
              },
              {
                path: '/knowledge-hub/user-experience/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/knowledge-hub/user-experience/understanding-recent-trending-and-latest-khub-items', '344'),
                exact: true
              },
              {
                path: '/knowledge-hub/what-is-khub',
                component: ComponentCreator('/knowledge-hub/what-is-khub', 'e15'),
                exact: true
              },
              {
                path: '/learning-smartpaths/learning-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/learning-smartpaths/learning-analytics/how-to-view-the-smartpath-analytics', '241'),
                exact: true
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-add-learning-sessions-in-smartpath-module', '554'),
                exact: true
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions', '2d3'),
                exact: true
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', 'c10'),
                exact: true
              },
              {
                path: '/learning-smartpaths/scorm-external/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/learning-smartpaths/scorm-external/how-to-access-the-scorm-course-from-the-smartwinnr-app', 'f95'),
                exact: true
              },
              {
                path: '/learning-smartpaths/scorm-external/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/learning-smartpaths/scorm-external/how-to-import-scorm-course-into-smartwinnr', '548'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-a-module-for-smartpath', '4bc'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-a-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-a-smartpath', '003'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-smartpath-with-learning-sessions', 'f5c'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-edit-a-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-edit-a-smartpath', '1af'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-management',
                component: ComponentCreator('/learning-smartpaths/smartpath-management', 'e4e'),
                exact: true
              },
              {
                path: '/learning-smartpaths/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/learning-smartpaths/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', 'f8e'),
                exact: true
              },
              {
                path: '/learning-smartpaths/what-are-smartpaths',
                component: ComponentCreator('/learning-smartpaths/what-are-smartpaths', 'bce'),
                exact: true
              },
              {
                path: '/learning/',
                component: ComponentCreator('/learning/', 'fb7'),
                exact: true
              },
              {
                path: '/manager-guide/assigning-content-to-team',
                component: ComponentCreator('/manager-guide/assigning-content-to-team', 'c11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/manager-guide/coaching-team-members',
                component: ComponentCreator('/manager-guide/coaching-team-members', '3e2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/manager-guide/manager-guide',
                component: ComponentCreator('/manager-guide/manager-guide', '20f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/manager-guide/monitoring-team-performance',
                component: ComponentCreator('/manager-guide/monitoring-team-performance', 'ae4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/manager-guide/team-analytics-dashboard',
                component: ComponentCreator('/manager-guide/team-analytics-dashboard', '144'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/menu-tree-structure',
                component: ComponentCreator('/menu-tree-structure', '533'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-image-to-your-content', '201'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', 'f2b'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-recording-to-a-smartfeed', '101'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-video-to-your-content', '815'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-an-audio-file-to-your-content', '402'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-reference-to-an-external-link-to-your-content', 'f57'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-attach-pdf-file-to-your-content', '3da'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-create-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-create-a-smartfeed', '913'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-edit-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-edit-a-smartfeed', 'cc4'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/microlearning-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/microlearning-smartfeeds', '6aa'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-analytics/how-to-view-smartfeed-analytics', '3ae'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management', '2e9'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-delete-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-delete-smartfeeds', 'aba'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-send-a-smartfeed-multiple-times', '6cb'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-send-the-smartfeed-to-teams', '76c'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-do-i-like-a-smartfeed', '777'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-to-download-share-a-smartfeed-in-smartpath', '82c'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-to-view-all-the-smartfeeds', '9fd'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/what-are-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/what-are-smartfeeds', '414'),
                exact: true
              },
              {
                path: '/microlearning/',
                component: ComponentCreator('/microlearning/', 'fff'),
                exact: true
              },
              {
                path: '/mobile-platform-tools/mobile-platform-tools',
                component: ComponentCreator('/mobile-platform-tools/mobile-platform-tools', 'b37'),
                exact: true
              },
              {
                path: '/overview/',
                component: ComponentCreator('/overview/', '09b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/project-management/how-to-edit-a-project',
                component: ComponentCreator('/project-management/how-to-edit-a-project', 'f62'),
                exact: true
              },
              {
                path: '/project-management/project-management',
                component: ComponentCreator('/project-management/project-management', '98c'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-do-i-give-access-permission-to-other-editors', 'c83'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-activate-automatic-reminders-for-your-quizzes', 'c6a'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', 'd9b'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-manage-quiz-configurations',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-manage-quiz-configurations', '85e'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-open-and-close-a-quiz', '3e8'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-send-quizzes-surveys-and-content-using-group', '344'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/managing-questions',
                component: ComponentCreator('/quiz-assessments/assessment-administration/managing-questions', 'c8c'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-administration/quiz-settings',
                component: ComponentCreator('/quiz-assessments/assessment-administration/quiz-settings', '1cc'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/detailed-quiz-analytics', '3c1'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team', '7a5'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/how-to-find-the-progress-of-your-team-in-quizzes', '7cc'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/learner-overall-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/learner-overall-report', 'a01'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/learner-report-by-learner-individual-report-analytics', 'ac0'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-analytics-reports',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-analytics-reports', '336'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-analytics-through-charts',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-analytics-through-charts', '951'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-comparison-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-comparison-report', '857'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-reports',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-reports', '0ff'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-wise-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-wise-analytics', 'e70'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/team-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/team-analytics', 'd1e'),
                exact: true
              },
              {
                path: '/quiz-assessments/assessment-analytics/team-progress-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/team-progress-report', 'b0e'),
                exact: true
              },
              {
                path: '/quiz-assessments/creating-assessments/creating-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/creating-quiz', '185'),
                exact: true
              },
              {
                path: '/quiz-assessments/creating-assessments/creating-quizzes',
                component: ComponentCreator('/quiz-assessments/creating-assessments/creating-quizzes', 'ffc'),
                exact: true
              },
              {
                path: '/quiz-assessments/creating-assessments/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-can-i-duplicate-a-quiz', 'dd4'),
                exact: true
              },
              {
                path: '/quiz-assessments/creating-assessments/how-to-create-a-manual-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-to-create-a-manual-quiz', '0a5'),
                exact: true
              },
              {
                path: '/quiz-assessments/creating-assessments/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-to-create-an-automatic-quiz', '0e6'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-editors-evaluate-long-answer-questions', '280'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-import-question-is-different-from-add-new-question', '640'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-a-video-to-a-question', '10e'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-an-audio-file-to-a-question', 'a24'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-an-image-to-the-question', 'b55'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr', '256'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-image-question', 'dc3'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-text-question', '0d8'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-hotspot-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-hotspot-question', '317'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-matching-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-matching-question', '5e3'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-missing-words-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-missing-words-question', '5b6'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-fill-in-the-blank-questions', '28b'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-long-answer-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-long-answer-questions', '4b8'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-multiple-choice-questions', '3fa'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-numeric-type-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-numeric-type-questions', '8b4'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-re-order-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-re-order-questions', 'acd'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-edit-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-edit-a-question', '22e'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-embed-a-link-into-the-question', 'dcb'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-update-question-response',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-update-question-response', 'e0d'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-upload-questions-in-bulk-using-import-questions', '280'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/question-management',
                component: ComponentCreator('/quiz-assessments/question-management/question-management', '372'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/question-response-analytics',
                component: ComponentCreator('/quiz-assessments/question-management/question-response-analytics', '3d5'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/question-structure',
                component: ComponentCreator('/quiz-assessments/question-management/question-structure', '92d'),
                exact: true
              },
              {
                path: '/quiz-assessments/question-management/short-answer-with-multiple-options',
                component: ComponentCreator('/quiz-assessments/question-management/short-answer-with-multiple-options', '441'),
                exact: true
              },
              {
                path: '/quiz-assessments/quiz-assessments',
                component: ComponentCreator('/quiz-assessments/quiz-assessments', '0a4'),
                exact: true
              },
              {
                path: '/quiz-assessments/taking-assessments/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/taking-assessments/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '665'),
                exact: true
              },
              {
                path: '/quiz/',
                component: ComponentCreator('/quiz/', '714'),
                exact: true
              },
              {
                path: '/quizzes/',
                component: ComponentCreator('/quizzes/', '50f'),
                exact: true
              },
              {
                path: '/quizzes/create-users-in-bulk',
                component: ComponentCreator('/quizzes/create-users-in-bulk', '8e4'),
                exact: true
              },
              {
                path: '/quizzes/delete-users',
                component: ComponentCreator('/quizzes/delete-users', 'e27'),
                exact: true
              },
              {
                path: '/quizzes/how-can-i-download-the-smartwinnr-app',
                component: ComponentCreator('/quizzes/how-can-i-download-the-smartwinnr-app', '4dd'),
                exact: true
              },
              {
                path: '/quizzes/how-to-activate-or-deactivate-a-user',
                component: ComponentCreator('/quizzes/how-to-activate-or-deactivate-a-user', 'ed5'),
                exact: true
              },
              {
                path: '/quizzes/how-to-edit-the-form-submission-from-manager-s-view',
                component: ComponentCreator('/quizzes/how-to-edit-the-form-submission-from-manager-s-view', 'a2d'),
                exact: true
              },
              {
                path: '/quizzes/how-to-set-reminder-for-your-tasks',
                component: ComponentCreator('/quizzes/how-to-set-reminder-for-your-tasks', '39b'),
                exact: true
              },
              {
                path: '/quizzes/quiz-administration',
                component: ComponentCreator('/quizzes/quiz-administration', '0e3'),
                exact: true
              },
              {
                path: '/quizzes/quiz-types',
                component: ComponentCreator('/quizzes/quiz-types', 'bba'),
                exact: true
              },
              {
                path: '/quizzes/understanding-knowledge-categories',
                component: ComponentCreator('/quizzes/understanding-knowledge-categories', 'f86'),
                exact: true
              },
              {
                path: '/quizzes/what-is-a-competition',
                component: ComponentCreator('/quizzes/what-is-a-competition', '0ac'),
                exact: true
              },
              {
                path: '/quizzes/what-is-a-group',
                component: ComponentCreator('/quizzes/what-is-a-group', '721'),
                exact: true
              },
              {
                path: '/quizzes/what-is-a-rule',
                component: ComponentCreator('/quizzes/what-is-a-rule', '263'),
                exact: true
              },
              {
                path: '/quizzes/what-is-audit-log',
                component: ComponentCreator('/quizzes/what-is-audit-log', '4c3'),
                exact: true
              },
              {
                path: '/quizzes/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/quizzes/what-is-smartwinnr-quiz-analytics', 'bff'),
                exact: true
              },
              {
                path: '/reports/',
                component: ComponentCreator('/reports/', '9d7'),
                exact: true
              },
              {
                path: '/reports/detailed-explanation-of-reports',
                component: ComponentCreator('/reports/detailed-explanation-of-reports', 'e29'),
                exact: true
              },
              {
                path: '/reports/how-to-create-sales-tv',
                component: ComponentCreator('/reports/how-to-create-sales-tv', '392'),
                exact: true
              },
              {
                path: '/reports/how-to-view-project',
                component: ComponentCreator('/reports/how-to-view-project', '5a6'),
                exact: true
              },
              {
                path: '/reports/user-login-reports',
                component: ComponentCreator('/reports/user-login-reports', '371'),
                exact: true
              },
              {
                path: '/reports/widgets',
                component: ComponentCreator('/reports/widgets', 'ee2'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-analytics/survey-analytics',
                component: ComponentCreator('/surveys-feedback/survey-analytics/survey-analytics', '00c'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-analytics/survey-template-analytics',
                component: ComponentCreator('/surveys-feedback/survey-analytics/survey-template-analytics', '658'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/',
                component: ComponentCreator('/surveys-feedback/survey-creation/', 'eb9'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-add-a-video-coaching-to-the-competition', 'adb'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-create-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-create-a-survey', '35a'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-create-a-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-create-a-survey-template', 'fd5'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-delete-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-delete-a-survey', '23d'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-duplicate-a-survey-and-survey-template', 'e46'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template', '1c0'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template', '4f3'),
                exact: true
              },
              {
                path: '/surveys-feedback/survey-management/how-to-assign-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-management/how-to-assign-a-survey', '059'),
                exact: true
              },
              {
                path: '/troubleshooting/troubleshooting',
                component: ComponentCreator('/troubleshooting/troubleshooting', 'f3f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/accessing-learning-content',
                component: ComponentCreator('/user-guide/accessing-learning-content', 'f43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/mobile-app-navigation',
                component: ComponentCreator('/user-guide/mobile-app-navigation', '74e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/taking-assessments',
                component: ComponentCreator('/user-guide/taking-assessments', '033'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/user-guide',
                component: ComponentCreator('/user-guide/user-guide', '482'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '185'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
