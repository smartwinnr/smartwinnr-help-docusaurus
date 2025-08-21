import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', 'be6'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '7d8'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '78b'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'b10'),
            routes: [
              {
                path: '/admin-landing',
                component: ComponentCreator('/admin-landing', '561'),
                exact: true
              },
              {
                path: '/administration/administration',
                component: ComponentCreator('/administration/administration', 'a50'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/advanced-options-for-projects',
                component: ComponentCreator('/administration/advanced-options-for-projects', '832'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/bulk-custom-notifications',
                component: ComponentCreator('/administration/bulk-custom-notifications', '96d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/administration/changing-updating-configuration-for-an-organization', '825'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/create-users-individually',
                component: ComponentCreator('/administration/create-users-individually', 'f22'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/custom-notifications',
                component: ComponentCreator('/administration/custom-notifications', '41c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/administration/how-can-an-admin-change-anyone-s-password', '2c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-can-i-answer-a-query',
                component: ComponentCreator('/administration/how-can-i-answer-a-query', '51e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/administration/how-can-i-change-the-password-for-a-user-account', '230'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/administration/how-can-i-contact-smartwinnr-team', '229'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-add-a-new-division',
                component: ComponentCreator('/administration/how-to-add-a-new-division', '5fa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-add-change-targets',
                component: ComponentCreator('/administration/how-to-add-change-targets', '712'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-add-new-contacts',
                component: ComponentCreator('/administration/how-to-add-new-contacts', '078'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-add-new-rule',
                component: ComponentCreator('/administration/how-to-add-new-rule', '6c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/administration/how-to-add-or-remove-users-to-a-chat-group', '241'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-change-company-logo',
                component: ComponentCreator('/administration/how-to-change-company-logo', '5d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-create-a-group',
                component: ComponentCreator('/administration/how-to-create-a-group', '4f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-create-a-new-project',
                component: ComponentCreator('/administration/how-to-create-a-new-project', '32a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-download-a-chat',
                component: ComponentCreator('/administration/how-to-download-a-chat', '646'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-enable-a-chat-group',
                component: ComponentCreator('/administration/how-to-enable-a-chat-group', '5c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/administration/how-to-post-a-query-from-the-smartwinnr-app', 'bde'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/administration/how-to-track-my-organizational-resource-usage', '3fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/administration/how-to-use-qresolve-in-the-smartwinnr-app', '25b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-view-an-audit-log',
                component: ComponentCreator('/administration/how-to-view-an-audit-log', 'aa4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-view-existing-contacts',
                component: ComponentCreator('/administration/how-to-view-existing-contacts', '382'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-to-view-notifications',
                component: ComponentCreator('/administration/how-to-view-notifications', '480'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/administration/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', 'fa0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/manage-password-policy',
                component: ComponentCreator('/administration/manage-password-policy', 'd47'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/search-users',
                component: ComponentCreator('/administration/search-users', '4f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/what-are-chat-groups',
                component: ComponentCreator('/administration/what-are-chat-groups', 'b5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/what-is-my-username-and-password',
                component: ComponentCreator('/administration/what-is-my-username-and-password', '83b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/what-is-qresolve',
                component: ComponentCreator('/administration/what-is-qresolve', '68b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/what-is-the-purpose-of-notifications',
                component: ComponentCreator('/administration/what-is-the-purpose-of-notifications', '92d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/when-are-chat-groups-needed',
                component: ComponentCreator('/administration/when-are-chat-groups-needed', '597'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/analytics-reporting/analytics-reporting',
                component: ComponentCreator('/analytics-reporting/analytics-reporting', '22d'),
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
                component: ComponentCreator('/coaching-performance/', '442'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/create-a-coaching',
                component: ComponentCreator('/coaching-performance/create-a-coaching', 'c8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-do-i-upload-a-coaching-video', '14c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/coaching-performance/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', 'b21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/coaching-performance/how-to-add-competencies-for-field-coaching', 'f72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/coaching-performance/how-to-create-a-video-coaching-assignment', '0c7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-create-field-coaching',
                component: ComponentCreator('/coaching-performance/how-to-create-field-coaching', 'e6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-create-field-coaching-template',
                component: ComponentCreator('/coaching-performance/how-to-create-field-coaching-template', 'af4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/coaching-performance/how-to-enable-the-streaming-links-for-video-coaching', 'd89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-reset-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-to-reset-a-coaching-video', 'bec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/coaching-performance/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', 'bad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/coaching-performance/how-to-review-a-video-coaching-assignment', '674'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/coaching-performance/how-to-review-field-coaching-from-managers-view-in-mobile', '92a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-set-competencies',
                component: ComponentCreator('/coaching-performance/how-to-set-competencies', '773'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-share-a-coaching-video',
                component: ComponentCreator('/coaching-performance/how-to-share-a-coaching-video', 'c4f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-audio-recording-for-coaching', '776'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-screen-recording-for-coaching', 'b34'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/coaching-performance/how-to-upload-video-recording-for-coaching', '29a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching-performance/what-is-my-team-coaching',
                component: ComponentCreator('/coaching-performance/what-is-my-team-coaching', '068'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/competition-design/how-to-create-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-design/how-to-create-a-competition', 'aac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-add-a-quiz-to-a-competition', 'c85'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-add-a-survey-to-a-competition', '147'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/competitions-gamification/competition-management/how-to-duplicate-a-quiz-in-a-competition', 'ab3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/competitions-gamification',
                component: ComponentCreator('/competitions-gamification/competitions-gamification', '4a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/define-kpis',
                component: ComponentCreator('/competitions-gamification/define-kpis', '55c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/competitions-gamification/how-can-i-gamify-a-smartpath', '1f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-can-i-view-a-competition-leaderboard', '6da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/competitions-gamification/how-do-i-view-the-kpi-scorecard', '15e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions-gamification/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', 'd19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions-gamification/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', 'e53'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-challenge-to-the-competition', 'ed3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-a-form-to-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-form-to-competition', '962'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-a-scorecard-to-a-competition', '9ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-add-different-activities-to-a-challenge', 'a04'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-to-add-observers-to-the-competition-leaderboard', 'd3c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/competitions-gamification/how-to-add-smartfeed-within-a-competition', 'd4a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/competitions-gamification/how-to-add-the-scorecard-to-leaderboard', '816'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/competitions-gamification/how-to-award-points-on-badge-assignment', 'c2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-a-group-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-a-group-challenge', 'ee5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-a-manager-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-a-manager-challenge', '637'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-an-individual-challenge',
                component: ComponentCreator('/competitions-gamification/how-to-create-an-individual-challenge', 'b27'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-badges',
                component: ComponentCreator('/competitions-gamification/how-to-create-badges', 'aa7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-certifcates',
                component: ComponentCreator('/competitions-gamification/how-to-create-certifcates', 'cf7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-create-kpi',
                component: ComponentCreator('/competitions-gamification/how-to-create-kpi', '66a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-upload-kpi-data',
                component: ComponentCreator('/competitions-gamification/how-to-upload-kpi-data', '7b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/competitions-gamification/how-to-view-the-data-and-leaderboard-for-scorecard', 'bc0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/leaderboards-of-a-competition',
                component: ComponentCreator('/competitions-gamification/leaderboards-of-a-competition', 'a6c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/question-bank',
                component: ComponentCreator('/competitions-gamification/question-bank', '78f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/understand-game-concepts',
                component: ComponentCreator('/competitions-gamification/understand-game-concepts', '3f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/what-are-kpi-reports',
                component: ComponentCreator('/competitions-gamification/what-are-kpi-reports', 'de1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/what-is-a-challenge',
                component: ComponentCreator('/competitions-gamification/what-is-a-challenge', 'c8f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/what-is-an-achievement',
                component: ComponentCreator('/competitions-gamification/what-is-an-achievement', '9ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions-gamification/what-is-kpi-gamification',
                component: ComponentCreator('/competitions-gamification/what-is-kpi-gamification', '548'),
                exact: true,
                sidebar: "tutorialSidebar"
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
                component: ComponentCreator('/forms-data-collection/data-management/how-to-create-a-field-mapping', '261'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/data-management/what-are-field-mappings',
                component: ComponentCreator('/forms-data-collection/data-management/what-are-field-mappings', 'a46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-creation/form-analytics',
                component: ComponentCreator('/forms-data-collection/form-creation/form-analytics', 'e8a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-creation/how-managers-approve-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-managers-approve-form', 'ff7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-creation/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-to-add-approvers-to-a-form', '2fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-creation/how-to-create-a-form',
                component: ComponentCreator('/forms-data-collection/form-creation/how-to-create-a-form', '765'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/forms-data-collection/form-management/how-can-i-submit-a-form-from-chat', '46f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/forms-data-collection/form-management/how-can-i-submit-a-form-from-left-menu', 'eaa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-to-add-new-form-submission',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-add-new-form-submission', 'b07'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-approve-reject-a-form-submission', '49e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-edit-a-form-on-submitted-by-a-user', '765'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/form-management/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/forms-data-collection/form-management/how-to-submit-a-form-on-behalf-of-a-user', '8e7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/scorecards/how-to-create-a-scorecard',
                component: ComponentCreator('/forms-data-collection/scorecards/how-to-create-a-scorecard', '2f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/forms-data-collection/scorecards/what-are-scorecards',
                component: ComponentCreator('/forms-data-collection/scorecards/what-are-scorecards', '273'),
                exact: true,
                sidebar: "tutorialSidebar"
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
                component: ComponentCreator('/knowledge-hub/content-creation/how-can-i-create-folders-and-items-in-khub', '275'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/content-creation/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/knowledge-hub/content-creation/how-can-i-edit-a-khub-item', '244'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/content-organization/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/knowledge-hub/content-organization/how-can-i-edit-a-khub-folder-name', 'c20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/khub-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/knowledge-hub/khub-analytics/how-can-i-view-khub-analytics', '8ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/knowledge-hub-khub',
                component: ComponentCreator('/knowledge-hub/knowledge-hub-khub', '2d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/user-experience/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/knowledge-hub/user-experience/how-to-use-khub-in-the-smartwinnr-app', '88f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/user-experience/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/knowledge-hub/user-experience/understanding-recent-trending-and-latest-khub-items', '5d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/knowledge-hub/what-is-khub',
                component: ComponentCreator('/knowledge-hub/what-is-khub', '3fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/learning-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/learning-smartpaths/learning-analytics/how-to-view-the-smartpath-analytics', 'ab8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-add-learning-sessions-in-smartpath-module', 'dd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-mark-the-attendance-for-users-in-learning-sessions', '5c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/learning-smartpaths/learning-sessions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', '56c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/scorm-external/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/learning-smartpaths/scorm-external/how-to-access-the-scorm-course-from-the-smartwinnr-app', '386'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/scorm-external/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/learning-smartpaths/scorm-external/how-to-import-scorm-course-into-smartwinnr', '85e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-a-module-for-smartpath', 'a9e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-a-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-a-smartpath', '623'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-create-smartpath-with-learning-sessions', '84d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-creation/how-to-edit-a-smartpath',
                component: ComponentCreator('/learning-smartpaths/smartpath-creation/how-to-edit-a-smartpath', '5f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-management',
                component: ComponentCreator('/learning-smartpaths/smartpath-management', '1c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/learning-smartpaths/smartpath-management/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', 'a47'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning-smartpaths/what-are-smartpaths',
                component: ComponentCreator('/learning-smartpaths/what-are-smartpaths', '800'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/',
                component: ComponentCreator('/learning/', 'fb7'),
                exact: true
              },
              {
                path: '/manager-guide/assigning-content-to-team',
                component: ComponentCreator('/manager-guide/assigning-content-to-team', '159'),
                exact: true
              },
              {
                path: '/manager-guide/coaching-team-members',
                component: ComponentCreator('/manager-guide/coaching-team-members', '0e7'),
                exact: true
              },
              {
                path: '/manager-guide/manager-guide',
                component: ComponentCreator('/manager-guide/manager-guide', '984'),
                exact: true
              },
              {
                path: '/manager-guide/monitoring-team-performance',
                component: ComponentCreator('/manager-guide/monitoring-team-performance', '271'),
                exact: true
              },
              {
                path: '/manager-guide/team-analytics-dashboard',
                component: ComponentCreator('/manager-guide/team-analytics-dashboard', '428'),
                exact: true
              },
              {
                path: '/menu-tree-structure',
                component: ComponentCreator('/menu-tree-structure', '533'),
                exact: true
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-image-to-your-content', '311'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', 'd75'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-recording-to-a-smartfeed', 'bc2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-a-video-to-your-content', '354'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-an-audio-file-to-your-content', 'c5b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-add-reference-to-an-external-link-to-your-content', '8a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-attach-pdf-file-to-your-content', '6a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-create-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-create-a-smartfeed', '76a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/creating-smartfeeds/how-to-edit-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/creating-smartfeeds/how-to-edit-a-smartfeed', '8e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/microlearning-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/microlearning-smartfeeds', '2d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-analytics/how-to-view-smartfeed-analytics', 'c02'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management', 'e6c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-delete-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-delete-smartfeeds', 'f92'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-send-a-smartfeed-multiple-times', '573'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/smartfeed-management/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/microlearning-smartfeeds/smartfeed-management/how-to-send-the-smartfeed-to-teams', '012'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-do-i-like-a-smartfeed', '047'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-to-download-share-a-smartfeed-in-smartpath', '132'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/user-experience/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/user-experience/how-to-view-all-the-smartfeeds', '2b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning-smartfeeds/what-are-smartfeeds',
                component: ComponentCreator('/microlearning-smartfeeds/what-are-smartfeeds', '44c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning/',
                component: ComponentCreator('/microlearning/', 'fff'),
                exact: true
              },
              {
                path: '/mobile-platform-tools/mobile-platform-tools',
                component: ComponentCreator('/mobile-platform-tools/mobile-platform-tools', '357'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/project-management/how-to-edit-a-project',
                component: ComponentCreator('/project-management/how-to-edit-a-project', 'ac9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/project-management/project-management',
                component: ComponentCreator('/project-management/project-management', 'e68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-do-i-give-access-permission-to-other-editors', 'b9a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-activate-automatic-reminders-for-your-quizzes', 'de5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', '752'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-manage-quiz-configurations',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-manage-quiz-configurations', '0ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-open-and-close-a-quiz', 'd68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/quiz-assessments/assessment-administration/how-to-send-quizzes-surveys-and-content-using-group', 'dd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/managing-questions',
                component: ComponentCreator('/quiz-assessments/assessment-administration/managing-questions', '169'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-administration/quiz-settings',
                component: ComponentCreator('/quiz-assessments/assessment-administration/quiz-settings', '60e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/detailed-quiz-analytics', 'd5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/finding-status-and-scores-for-quizzes-assigned-to-your-team', '9ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/how-to-find-the-progress-of-your-team-in-quizzes', 'c57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/learner-overall-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/learner-overall-report', '0da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/learner-report-by-learner-individual-report-analytics', '3a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-analytics-reports',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-analytics-reports', 'cd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-analytics-through-charts',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-analytics-through-charts', '77f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-comparison-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-comparison-report', '3b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-reports',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-reports', 'aaa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/quiz-wise-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/quiz-wise-analytics', '055'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/team-analytics',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/team-analytics', '223'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/assessment-analytics/team-progress-report',
                component: ComponentCreator('/quiz-assessments/assessment-analytics/team-progress-report', 'e7f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/creating-assessments/creating-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/creating-quiz', 'b7b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/creating-assessments/creating-quizzes',
                component: ComponentCreator('/quiz-assessments/creating-assessments/creating-quizzes', 'f93'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/creating-assessments/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-can-i-duplicate-a-quiz', '6e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/creating-assessments/how-to-create-a-manual-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-to-create-a-manual-quiz', '26b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/creating-assessments/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/quiz-assessments/creating-assessments/how-to-create-an-automatic-quiz', '115'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-editors-evaluate-long-answer-questions', 'f60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-import-question-is-different-from-add-new-question', 'b66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-a-video-to-a-question', 'b3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-an-audio-file-to-a-question', '24a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-add-an-image-to-the-question', '8e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-answer-long-answer-type-questions-in-smartwinnr', 'ab0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-image-question', '5eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-drag-and-drop-into-text-question', 'f5a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-hotspot-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-hotspot-question', '46f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-matching-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-matching-question', '6c1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-a-missing-words-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-a-missing-words-question', '793'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-fill-in-the-blank-questions', '8f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-long-answer-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-long-answer-questions', '4db'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-multiple-choice-questions', '9e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-numeric-type-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-numeric-type-questions', '87d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-create-re-order-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-create-re-order-questions', 'dd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-edit-a-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-edit-a-question', '990'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-embed-a-link-into-the-question', '74a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-update-question-response',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-update-question-response', 'b92'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/quiz-assessments/question-management/how-to-upload-questions-in-bulk-using-import-questions', 'ae6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/question-management',
                component: ComponentCreator('/quiz-assessments/question-management/question-management', 'd38'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/question-response-analytics',
                component: ComponentCreator('/quiz-assessments/question-management/question-response-analytics', 'a56'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/question-structure',
                component: ComponentCreator('/quiz-assessments/question-management/question-structure', '3e8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/question-management/short-answer-with-multiple-options',
                component: ComponentCreator('/quiz-assessments/question-management/short-answer-with-multiple-options', '28b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/quiz-assessments',
                component: ComponentCreator('/quiz-assessments/quiz-assessments', '4a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz-assessments/taking-assessments/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/quiz-assessments/taking-assessments/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '735'),
                exact: true,
                sidebar: "tutorialSidebar"
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
                component: ComponentCreator('/surveys-feedback/survey-analytics/survey-analytics', 'ef1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-analytics/survey-template-analytics',
                component: ComponentCreator('/surveys-feedback/survey-analytics/survey-template-analytics', '130'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/',
                component: ComponentCreator('/surveys-feedback/survey-creation/', '574'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-add-a-video-coaching-to-the-competition', '67c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-create-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-create-a-survey', 'b5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-create-a-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-create-a-survey-template', '1a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-delete-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-delete-a-survey', '117'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/how-to-duplicate-a-survey-and-survey-template', 'ee5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/what-are-the-different-question-types-in-a-survey-survey-template', 'c2a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/surveys-feedback/survey-creation/what-is-the-difference-between-a-survey-and-a-survey-template', 'c98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys-feedback/survey-management/how-to-assign-a-survey',
                component: ComponentCreator('/surveys-feedback/survey-management/how-to-assign-a-survey', '4d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/troubleshooting/troubleshooting',
                component: ComponentCreator('/troubleshooting/troubleshooting', '808'),
                exact: true
              },
              {
                path: '/user-guide/accessing-learning-content',
                component: ComponentCreator('/user-guide/accessing-learning-content', 'ca3'),
                exact: true
              },
              {
                path: '/user-guide/mobile-app-navigation',
                component: ComponentCreator('/user-guide/mobile-app-navigation', '2ae'),
                exact: true
              },
              {
                path: '/user-guide/taking-assessments',
                component: ComponentCreator('/user-guide/taking-assessments', '370'),
                exact: true
              },
              {
                path: '/user-guide/user-guide',
                component: ComponentCreator('/user-guide/user-guide', 'c18'),
                exact: true
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
