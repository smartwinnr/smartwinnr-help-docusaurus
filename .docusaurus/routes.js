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
    component: ComponentCreator('/', '784'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'def'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '43c'),
            routes: [
              {
                path: '/admin-landing',
                component: ComponentCreator('/admin-landing', 'c20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/',
                component: ComponentCreator('/admin/', '42a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/advanced-options-for-projects',
                component: ComponentCreator('/admin/advanced-options-for-projects', 'dbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/bulk-custom-notifications',
                component: ComponentCreator('/admin/bulk-custom-notifications', '234'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/admin/changing-updating-configuration-for-an-organization', 'b35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/create-users-individually',
                component: ComponentCreator('/admin/create-users-individually', '932'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/custom-notifications',
                component: ComponentCreator('/admin/custom-notifications', 'a80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/admin/how-can-an-admin-change-anyone-s-password', 'cc0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-i-answer-a-query',
                component: ComponentCreator('/admin/how-can-i-answer-a-query', '499'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/admin/how-can-i-change-the-password-for-a-user-account', '092'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/admin/how-can-i-contact-smartwinnr-team', 'bea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/admin/how-can-i-submit-a-form-from-chat', 'c35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/admin/how-can-i-submit-a-form-from-left-menu', 'e45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-a-new-division',
                component: ComponentCreator('/admin/how-to-add-a-new-division', '074'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-change-targets',
                component: ComponentCreator('/admin/how-to-add-change-targets', '525'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-new-contacts',
                component: ComponentCreator('/admin/how-to-add-new-contacts', '2c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-new-form-submission',
                component: ComponentCreator('/admin/how-to-add-new-form-submission', 'dea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-new-rule',
                component: ComponentCreator('/admin/how-to-add-new-rule', 'ebf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/admin/how-to-add-or-remove-users-to-a-chat-group', '5c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/admin/how-to-approve-reject-a-form-submission', 'a31'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-change-company-logo',
                component: ComponentCreator('/admin/how-to-change-company-logo', 'bbf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-create-a-group',
                component: ComponentCreator('/admin/how-to-create-a-group', 'b74'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-create-a-new-project',
                component: ComponentCreator('/admin/how-to-create-a-new-project', 'fb6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-download-a-chat',
                component: ComponentCreator('/admin/how-to-download-a-chat', 'e4b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/admin/how-to-edit-a-form-on-submitted-by-a-user', '2be'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-edit-a-project',
                component: ComponentCreator('/admin/how-to-edit-a-project', '689'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-enable-a-chat-group',
                component: ComponentCreator('/admin/how-to-enable-a-chat-group', '89a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/admin/how-to-post-a-query-from-the-smartwinnr-app', 'f44'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/admin/how-to-submit-a-form-on-behalf-of-a-user', 'a52'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/admin/how-to-track-my-organizational-resource-usage', 'f89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/admin/how-to-use-qresolve-in-the-smartwinnr-app', '692'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-view-an-audit-log',
                component: ComponentCreator('/admin/how-to-view-an-audit-log', '99f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-view-existing-contacts',
                component: ComponentCreator('/admin/how-to-view-existing-contacts', '768'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-to-view-notifications',
                component: ComponentCreator('/admin/how-to-view-notifications', '1fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/admin/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', 'abb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/manage-password-policy',
                component: ComponentCreator('/admin/manage-password-policy', '5bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/search-users',
                component: ComponentCreator('/admin/search-users', 'e45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/what-are-chat-groups',
                component: ComponentCreator('/admin/what-are-chat-groups', '205'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/what-is-my-username-and-password',
                component: ComponentCreator('/admin/what-is-my-username-and-password', '8dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/what-is-qresolve',
                component: ComponentCreator('/admin/what-is-qresolve', '537'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/what-is-the-purpose-of-notifications',
                component: ComponentCreator('/admin/what-is-the-purpose-of-notifications', '4d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/admin/when-are-chat-groups-needed',
                component: ComponentCreator('/admin/when-are-chat-groups-needed', '1cc'),
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
                path: '/coaching/',
                component: ComponentCreator('/coaching/', '964'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/create-a-coaching',
                component: ComponentCreator('/coaching/create-a-coaching', '9f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/coaching/how-do-i-upload-a-coaching-video', 'e36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/coaching/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', 'fe5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/coaching/how-to-add-competencies-for-field-coaching', '08f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/coaching/how-to-create-a-video-coaching-assignment', 'f68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-create-field-coaching',
                component: ComponentCreator('/coaching/how-to-create-field-coaching', '72e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-create-field-coaching-template',
                component: ComponentCreator('/coaching/how-to-create-field-coaching-template', 'c64'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/coaching/how-to-enable-the-streaming-links-for-video-coaching', '258'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-reset-a-coaching-video',
                component: ComponentCreator('/coaching/how-to-reset-a-coaching-video', '4bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/coaching/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', 'b1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/coaching/how-to-review-a-video-coaching-assignment', 'cfa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/coaching/how-to-review-field-coaching-from-managers-view-in-mobile', '170'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-set-competencies',
                component: ComponentCreator('/coaching/how-to-set-competencies', 'bfb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-share-a-coaching-video',
                component: ComponentCreator('/coaching/how-to-share-a-coaching-video', '245'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/coaching/how-to-upload-audio-recording-for-coaching', '64c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/coaching/how-to-upload-screen-recording-for-coaching', '549'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/coaching/how-to-upload-video-recording-for-coaching', '0ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/coaching/what-is-my-team-coaching',
                component: ComponentCreator('/coaching/what-is-my-team-coaching', '903'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/',
                component: ComponentCreator('/competitions/', 'cce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/define-kpis',
                component: ComponentCreator('/competitions/define-kpis', 'd35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/competitions/how-can-i-gamify-a-smartpath', 'fe8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/competitions/how-can-i-view-a-competition-leaderboard', '1ce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/competitions/how-do-i-view-the-kpi-scorecard', 'b7f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', '851'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/competitions/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', 'b57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/competitions/how-to-add-a-challenge-to-the-competition', '0ec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-a-form-to-competition',
                component: ComponentCreator('/competitions/how-to-add-a-form-to-competition', '176'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/competitions/how-to-add-a-scorecard-to-a-competition', 'c5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/competitions/how-to-add-different-activities-to-a-challenge', '846'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/competitions/how-to-add-observers-to-the-competition-leaderboard', '1ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/competitions/how-to-add-smartfeed-within-a-competition', '67c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/competitions/how-to-add-the-scorecard-to-leaderboard', '030'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/competitions/how-to-award-points-on-badge-assignment', 'efa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-a-group-challenge',
                component: ComponentCreator('/competitions/how-to-create-a-group-challenge', '43a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-a-manager-challenge',
                component: ComponentCreator('/competitions/how-to-create-a-manager-challenge', '4da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-an-individual-challenge',
                component: ComponentCreator('/competitions/how-to-create-an-individual-challenge', '4e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-badges',
                component: ComponentCreator('/competitions/how-to-create-badges', '517'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-certifcates',
                component: ComponentCreator('/competitions/how-to-create-certifcates', '154'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-create-kpi',
                component: ComponentCreator('/competitions/how-to-create-kpi', '609'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-upload-kpi-data',
                component: ComponentCreator('/competitions/how-to-upload-kpi-data', 'ce4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/competitions/how-to-view-the-data-and-leaderboard-for-scorecard', 'ecf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/leaderboards-of-a-competition',
                component: ComponentCreator('/competitions/leaderboards-of-a-competition', '080'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/question-bank',
                component: ComponentCreator('/competitions/question-bank', 'ee1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/understand-game-concepts',
                component: ComponentCreator('/competitions/understand-game-concepts', '037'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/what-are-kpi-reports',
                component: ComponentCreator('/competitions/what-are-kpi-reports', 'f72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/what-is-a-challenge',
                component: ComponentCreator('/competitions/what-is-a-challenge', 'fe1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/what-is-an-achievement',
                component: ComponentCreator('/competitions/what-is-an-achievement', 'a8d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/competitions/what-is-kpi-gamification',
                component: ComponentCreator('/competitions/what-is-kpi-gamification', 'c0a'),
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
                component: ComponentCreator('/editor-landing', '161'),
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
                path: '/learning/',
                component: ComponentCreator('/learning/', '641'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/learning/how-can-i-create-folders-and-items-in-khub', '94c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/learning/how-can-i-edit-a-khub-folder-name', '8bf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/learning/how-can-i-edit-a-khub-item', '51e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-can-i-view-khub-analytics',
                component: ComponentCreator('/learning/how-can-i-view-khub-analytics', '799'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-do-i-like-a-smartfeed',
                component: ComponentCreator('/learning/how-do-i-like-a-smartfeed', 'a43'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/learning/how-import-question-is-different-from-add-new-question', '721'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/learning/how-to-access-the-scorm-course-from-the-smartwinnr-app', '100'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/learning/how-to-add-a-image-to-your-content', '687'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/learning/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', 'f93'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/learning/how-to-add-a-recording-to-a-smartfeed', '688'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/learning/how-to-add-a-video-to-a-question', '6a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/learning/how-to-add-a-video-to-your-content', '6c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/learning/how-to-add-an-audio-file-to-a-question', 'e6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/learning/how-to-add-an-audio-file-to-your-content', 'ece'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/learning/how-to-add-an-image-to-the-question', '1a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/learning/how-to-add-learning-sessions-in-smartpath-module', '239'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/learning/how-to-add-reference-to-an-external-link-to-your-content', '28b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/learning/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', 'e03'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/learning/how-to-attach-pdf-file-to-your-content', '024'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/learning/how-to-create-a-module-for-smartpath', '63a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-create-a-smartfeed',
                component: ComponentCreator('/learning/how-to-create-a-smartfeed', '9da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-create-a-smartpath',
                component: ComponentCreator('/learning/how-to-create-a-smartpath', '006'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/learning/how-to-create-smartpath-with-learning-sessions', 'af3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-delete-smartfeeds',
                component: ComponentCreator('/learning/how-to-delete-smartfeeds', 'fe2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-download-share-a-smartfeed-in-smartpath',
                component: ComponentCreator('/learning/how-to-download-share-a-smartfeed-in-smartpath', 'fad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-edit-a-smartfeed',
                component: ComponentCreator('/learning/how-to-edit-a-smartfeed', '8b5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-edit-a-smartpath',
                component: ComponentCreator('/learning/how-to-edit-a-smartpath', 'cb7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/learning/how-to-embed-a-link-into-the-question', 'b4a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/learning/how-to-mark-the-attendance-for-users-in-learning-sessions', '0f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/learning/how-to-send-a-smartfeed-multiple-times', '569'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/learning/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', '897'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/learning/how-to-send-the-smartfeed-to-teams', '478'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/learning/how-to-use-khub-in-the-smartwinnr-app', '227'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/learning/how-to-view-all-the-smartfeeds', '187'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/learning/how-to-view-smartfeed-analytics', 'e0a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/learning/how-to-view-the-smartpath-analytics', 'b89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/knowledge-hub-khub',
                component: ComponentCreator('/learning/knowledge-hub-khub', 'fa2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/smartfeed-management',
                component: ComponentCreator('/learning/smartfeed-management', 'e36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/smartpath-management',
                component: ComponentCreator('/learning/smartpath-management', '0b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/learning/understanding-recent-trending-and-latest-khub-items', '736'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/what-are-smartfeeds',
                component: ComponentCreator('/learning/what-are-smartfeeds', '608'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/what-are-smartpaths',
                component: ComponentCreator('/learning/what-are-smartpaths', 'df8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/learning/what-is-khub',
                component: ComponentCreator('/learning/what-is-khub', '13d'),
                exact: true,
                sidebar: "tutorialSidebar"
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
                path: '/microlearning/',
                component: ComponentCreator('/microlearning/', 'fff'),
                exact: true
              },
              {
                path: '/mobile/',
                component: ComponentCreator('/mobile/', '83c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/',
                component: ComponentCreator('/quiz/', '714'),
                exact: true
              },
              {
                path: '/quiz/creating-quiz',
                component: ComponentCreator('/quiz/creating-quiz', 'cd0'),
                exact: true
              },
              {
                path: '/quiz/managing-questions',
                component: ComponentCreator('/quiz/managing-questions', '1fe'),
                exact: true
              },
              {
                path: '/quiz/quiz-reports',
                component: ComponentCreator('/quiz/quiz-reports', 'c4f'),
                exact: true
              },
              {
                path: '/quiz/quiz-settings',
                component: ComponentCreator('/quiz/quiz-settings', '92f'),
                exact: true
              },
              {
                path: '/quizzes/',
                component: ComponentCreator('/quizzes/', '969'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/create-users-in-bulk',
                component: ComponentCreator('/quizzes/create-users-in-bulk', '1b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/creating-quizzes',
                component: ComponentCreator('/quizzes/creating-quizzes', '5ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/delete-users',
                component: ComponentCreator('/quizzes/delete-users', '8de'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/detailed-quiz-analytics',
                component: ComponentCreator('/quizzes/detailed-quiz-analytics', '841'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/quizzes/finding-status-and-scores-for-quizzes-assigned-to-your-team', '33a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-can-i-download-the-smartwinnr-app',
                component: ComponentCreator('/quizzes/how-can-i-download-the-smartwinnr-app', 'f35'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/quizzes/how-can-i-duplicate-a-quiz', '17a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/quizzes/how-do-i-give-access-permission-to-other-editors', 'e69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/quizzes/how-editors-evaluate-long-answer-questions', '4db'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/quizzes/how-to-activate-automatic-reminders-for-your-quizzes', '93f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-activate-or-deactivate-a-user',
                component: ComponentCreator('/quizzes/how-to-activate-or-deactivate-a-user', '420'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/quizzes/how-to-add-a-quiz-to-a-competition', 'b9f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/quizzes/how-to-add-a-survey-to-a-competition', '5bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/quizzes/how-to-answer-long-answer-type-questions-in-smartwinnr', '099'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-competition',
                component: ComponentCreator('/quizzes/how-to-create-a-competition', '1df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/quizzes/how-to-create-a-drag-and-drop-into-image-question', '955'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/quizzes/how-to-create-a-drag-and-drop-into-text-question', 'a0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-hotspot-question',
                component: ComponentCreator('/quizzes/how-to-create-a-hotspot-question', 'db4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-manual-quiz',
                component: ComponentCreator('/quizzes/how-to-create-a-manual-quiz', '5ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-matching-question',
                component: ComponentCreator('/quizzes/how-to-create-a-matching-question', '9bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-a-missing-words-question',
                component: ComponentCreator('/quizzes/how-to-create-a-missing-words-question', '260'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/quizzes/how-to-create-an-automatic-quiz', 'd20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/quizzes/how-to-create-fill-in-the-blank-questions', '0f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-long-answer-questions',
                component: ComponentCreator('/quizzes/how-to-create-long-answer-questions', 'c54'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/quizzes/how-to-create-multiple-choice-questions', '1e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-numeric-type-questions',
                component: ComponentCreator('/quizzes/how-to-create-numeric-type-questions', 'd4c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-create-re-order-questions',
                component: ComponentCreator('/quizzes/how-to-create-re-order-questions', '432'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/quizzes/how-to-duplicate-a-quiz-in-a-competition', 'cbf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-edit-a-question',
                component: ComponentCreator('/quizzes/how-to-edit-a-question', 'cf1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-edit-the-form-submission-from-manager-s-view',
                component: ComponentCreator('/quizzes/how-to-edit-the-form-submission-from-manager-s-view', 'ef5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/quizzes/how-to-find-the-progress-of-your-team-in-quizzes', 'd1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/quizzes/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', '3cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/quizzes/how-to-import-scorm-course-into-smartwinnr', '6e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-manage-quiz-configurations',
                component: ComponentCreator('/quizzes/how-to-manage-quiz-configurations', '5b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-open-and-close-a-quiz',
                component: ComponentCreator('/quizzes/how-to-open-and-close-a-quiz', '24a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/quizzes/how-to-send-quizzes-surveys-and-content-using-group', 'a68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-set-reminder-for-your-tasks',
                component: ComponentCreator('/quizzes/how-to-set-reminder-for-your-tasks', '92a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/quizzes/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '647'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-update-question-response',
                component: ComponentCreator('/quizzes/how-to-update-question-response', 'e63'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/quizzes/how-to-upload-questions-in-bulk-using-import-questions', 'd0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/learner-overall-report',
                component: ComponentCreator('/quizzes/learner-overall-report', '3af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/quizzes/learner-report-by-learner-individual-report-analytics', 'af1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/question-response-analytics',
                component: ComponentCreator('/quizzes/question-response-analytics', 'f18'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/question-structure',
                component: ComponentCreator('/quizzes/question-structure', '202'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-administration',
                component: ComponentCreator('/quizzes/quiz-administration', '05f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-analytics-reports',
                component: ComponentCreator('/quizzes/quiz-analytics-reports', '7f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-analytics-through-charts',
                component: ComponentCreator('/quizzes/quiz-analytics-through-charts', '0cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-comparison-report',
                component: ComponentCreator('/quizzes/quiz-comparison-report', '0c0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-types',
                component: ComponentCreator('/quizzes/quiz-types', '616'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/quiz-wise-analytics',
                component: ComponentCreator('/quizzes/quiz-wise-analytics', '275'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/short-answer-with-multiple-options',
                component: ComponentCreator('/quizzes/short-answer-with-multiple-options', 'cbd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/team-analytics',
                component: ComponentCreator('/quizzes/team-analytics', '0d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/team-progress-report',
                component: ComponentCreator('/quizzes/team-progress-report', '4f7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/understanding-knowledge-categories',
                component: ComponentCreator('/quizzes/understanding-knowledge-categories', '9e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/what-is-a-competition',
                component: ComponentCreator('/quizzes/what-is-a-competition', 'f91'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/what-is-a-group',
                component: ComponentCreator('/quizzes/what-is-a-group', 'a08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/what-is-a-rule',
                component: ComponentCreator('/quizzes/what-is-a-rule', '218'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/what-is-audit-log',
                component: ComponentCreator('/quizzes/what-is-audit-log', '2f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quizzes/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/quizzes/what-is-smartwinnr-quiz-analytics', '443'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/',
                component: ComponentCreator('/reports/', 'ab1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/detailed-explanation-of-reports',
                component: ComponentCreator('/reports/detailed-explanation-of-reports', 'fc3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/form-analytics',
                component: ComponentCreator('/reports/form-analytics', 'bbb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-managers-approve-form',
                component: ComponentCreator('/reports/how-managers-approve-form', 'deb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/reports/how-to-add-approvers-to-a-form', 'e04'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-create-a-field-mapping',
                component: ComponentCreator('/reports/how-to-create-a-field-mapping', 'cd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-create-a-form',
                component: ComponentCreator('/reports/how-to-create-a-form', '880'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-create-a-scorecard',
                component: ComponentCreator('/reports/how-to-create-a-scorecard', '261'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-create-sales-tv',
                component: ComponentCreator('/reports/how-to-create-sales-tv', 'dd0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/how-to-view-project',
                component: ComponentCreator('/reports/how-to-view-project', 'd45'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/user-login-reports',
                component: ComponentCreator('/reports/user-login-reports', 'b37'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/what-are-field-mappings',
                component: ComponentCreator('/reports/what-are-field-mappings', '0f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/what-are-scorecards',
                component: ComponentCreator('/reports/what-are-scorecards', '566'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports/widgets',
                component: ComponentCreator('/reports/widgets', '42d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/',
                component: ComponentCreator('/surveys/', '7f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/surveys/how-to-add-a-video-coaching-to-the-competition', '38c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-assign-a-survey',
                component: ComponentCreator('/surveys/how-to-assign-a-survey', 'fa8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-create-a-survey',
                component: ComponentCreator('/surveys/how-to-create-a-survey', '987'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-create-a-survey-template',
                component: ComponentCreator('/surveys/how-to-create-a-survey-template', 'b7f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-delete-a-survey',
                component: ComponentCreator('/surveys/how-to-delete-a-survey', '0dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/surveys/how-to-duplicate-a-survey-and-survey-template', '55a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/survey-analytics',
                component: ComponentCreator('/surveys/survey-analytics', '863'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/survey-template-analytics',
                component: ComponentCreator('/surveys/survey-template-analytics', '09c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/surveys/what-are-the-different-question-types-in-a-survey-survey-template', 'fbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/surveys/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/surveys/what-is-the-difference-between-a-survey-and-a-survey-template', '74f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/troubleshooting/',
                component: ComponentCreator('/troubleshooting/', '693'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/troubleshooting/troubleshoot-for-common-error-code',
                component: ComponentCreator('/troubleshooting/troubleshoot-for-common-error-code', '6cc'),
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
