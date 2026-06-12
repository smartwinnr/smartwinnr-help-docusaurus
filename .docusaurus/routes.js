import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/admin/analytics/feedback',
    component: ComponentCreator('/admin/analytics/feedback', '516'),
    exact: true
  },
  {
    path: '/admin/authoring/',
    component: ComponentCreator('/admin/authoring/', 'd33'),
    exact: true
  },
  {
    path: '/admin/authoring/drafts',
    component: ComponentCreator('/admin/authoring/drafts', '6ee'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', 'be6'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '3e0'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'ee0'),
        routes: [
          {
            path: '/tags',
            component: ComponentCreator('/tags', 'ce1'),
            exact: true
          },
          {
            path: '/tags/admin',
            component: ComponentCreator('/tags/admin', '697'),
            exact: true
          },
          {
            path: '/tags/ai-coaching',
            component: ComponentCreator('/tags/ai-coaching', 'da2'),
            exact: true
          },
          {
            path: '/tags/field-coaching',
            component: ComponentCreator('/tags/field-coaching', '040'),
            exact: true
          },
          {
            path: '/tags/forms',
            component: ComponentCreator('/tags/forms', '299'),
            exact: true
          },
          {
            path: '/tags/gamification',
            component: ComponentCreator('/tags/gamification', 'a54'),
            exact: true
          },
          {
            path: '/tags/integration',
            component: ComponentCreator('/tags/integration', '75a'),
            exact: true
          },
          {
            path: '/tags/knowledge-hub',
            component: ComponentCreator('/tags/knowledge-hub', '5b6'),
            exact: true
          },
          {
            path: '/tags/kpi',
            component: ComponentCreator('/tags/kpi', '827'),
            exact: true
          },
          {
            path: '/tags/notifications',
            component: ComponentCreator('/tags/notifications', '2fe'),
            exact: true
          },
          {
            path: '/tags/onboarding',
            component: ComponentCreator('/tags/onboarding', 'b8e'),
            exact: true
          },
          {
            path: '/tags/quiz',
            component: ComponentCreator('/tags/quiz', '400'),
            exact: true
          },
          {
            path: '/tags/reports',
            component: ComponentCreator('/tags/reports', 'cc6'),
            exact: true
          },
          {
            path: '/tags/settings',
            component: ComponentCreator('/tags/settings', '32c'),
            exact: true
          },
          {
            path: '/tags/smartfeed',
            component: ComponentCreator('/tags/smartfeed', '83d'),
            exact: true
          },
          {
            path: '/tags/smartpath',
            component: ComponentCreator('/tags/smartpath', 'c98'),
            exact: true
          },
          {
            path: '/tags/survey',
            component: ComponentCreator('/tags/survey', '70c'),
            exact: true
          },
          {
            path: '/tags/troubleshooting',
            component: ComponentCreator('/tags/troubleshooting', '220'),
            exact: true
          },
          {
            path: '/tags/video-coaching',
            component: ComponentCreator('/tags/video-coaching', '3af'),
            exact: true
          },
          {
            path: '/',
            component: ComponentCreator('/', '5a9'),
            routes: [
              {
                path: '/administration/access-permissions/access-permissions',
                component: ComponentCreator('/administration/access-permissions/access-permissions', 'a21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/access-permissions/how-do-i-give-access-permission-to-other-editors',
                component: ComponentCreator('/administration/access-permissions/how-do-i-give-access-permission-to-other-editors', '552'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/access-permissions/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr',
                component: ComponentCreator('/administration/access-permissions/how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr', '03a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/changing-updating-configuration-for-an-organization',
                component: ComponentCreator('/administration/system-management/changing-updating-configuration-for-an-organization', 'c8c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/create-users-in-bulk',
                component: ComponentCreator('/administration/system-management/create-users-in-bulk', '357'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/create-users-individually',
                component: ComponentCreator('/administration/system-management/create-users-individually', '2af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/delete-users',
                component: ComponentCreator('/administration/system-management/delete-users', '089'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-can-an-admin-change-anyone-s-password',
                component: ComponentCreator('/administration/system-management/how-can-an-admin-change-anyone-s-password', '2ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-can-i-change-the-password-for-a-user-account',
                component: ComponentCreator('/administration/system-management/how-can-i-change-the-password-for-a-user-account', '635'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-do-i-unlock-an-account',
                component: ComponentCreator('/administration/system-management/how-do-i-unlock-an-account', 'f72'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-activate-or-deactivate-a-user',
                component: ComponentCreator('/administration/system-management/how-to-activate-or-deactivate-a-user', '177'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-add-a-new-division',
                component: ComponentCreator('/administration/system-management/how-to-add-a-new-division', 'ca7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-add-new-contacts',
                component: ComponentCreator('/administration/system-management/how-to-add-new-contacts', '3b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-add-new-rule',
                component: ComponentCreator('/administration/system-management/how-to-add-new-rule', '2a4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-change-company-logo',
                component: ComponentCreator('/administration/system-management/how-to-change-company-logo', '43c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-create-a-group',
                component: ComponentCreator('/administration/system-management/how-to-create-a-group', '04c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-resend-account-invitation',
                component: ComponentCreator('/administration/system-management/how-to-resend-account-invitation', '9ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-send-quizzes-surveys-and-content-using-group',
                component: ComponentCreator('/administration/system-management/how-to-send-quizzes-surveys-and-content-using-group', '1fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-track-my-organizational-resource-usage',
                component: ComponentCreator('/administration/system-management/how-to-track-my-organizational-resource-usage', 'e69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-view-an-audit-log',
                component: ComponentCreator('/administration/system-management/how-to-view-an-audit-log', '065'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/how-to-view-existing-contacts',
                component: ComponentCreator('/administration/system-management/how-to-view-existing-contacts', '992'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/manage-password-policy',
                component: ComponentCreator('/administration/system-management/manage-password-policy', '989'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/search-users',
                component: ComponentCreator('/administration/system-management/search-users', '12d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/what-is-a-group',
                component: ComponentCreator('/administration/system-management/what-is-a-group', '7ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/what-is-a-rule',
                component: ComponentCreator('/administration/system-management/what-is-a-rule', '9f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration/system-management/what-is-audit-log',
                component: ComponentCreator('/administration/system-management/what-is-audit-log', 'f61'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/browser-and-device-support',
                component: ComponentCreator('/get-started/onboarding/browser-and-device-support', 'f3a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-change-my-language-in-smartwinnr-app',
                component: ComponentCreator('/get-started/onboarding/how-can-i-change-my-language-in-smartwinnr-app', '367'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-change-my-password-for-smartwinnr',
                component: ComponentCreator('/get-started/onboarding/how-can-i-change-my-password-for-smartwinnr', 'fc5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-change-my-profile-image',
                component: ComponentCreator('/get-started/onboarding/how-can-i-change-my-profile-image', '444'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-check-the-app-version-web-view-version',
                component: ComponentCreator('/get-started/onboarding/how-can-i-check-the-app-version-web-view-version', '397'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-contact-smartwinnr-team',
                component: ComponentCreator('/get-started/onboarding/how-can-i-contact-smartwinnr-team', 'b48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-download-the-smartwinnr-app',
                component: ComponentCreator('/get-started/onboarding/how-can-i-download-the-smartwinnr-app', 'ece'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-enable-push-notification-for-smartwinnr-app',
                component: ComponentCreator('/get-started/onboarding/how-can-i-enable-push-notification-for-smartwinnr-app', '3d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-can-i-login-to-smartwinnr-app',
                component: ComponentCreator('/get-started/onboarding/how-can-i-login-to-smartwinnr-app', 'f4b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/how-to-update-the-smartwinnr-app-web-view',
                component: ComponentCreator('/get-started/onboarding/how-to-update-the-smartwinnr-app-web-view', '60a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/my-account-is-locked-what-should-i-do',
                component: ComponentCreator('/get-started/onboarding/my-account-is-locked-what-should-i-do', '192'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/what-if-i-ve-forgotten-my-password',
                component: ComponentCreator('/get-started/onboarding/what-if-i-ve-forgotten-my-password', '621'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/what-if-i-ve-forgotten-my-pin',
                component: ComponentCreator('/get-started/onboarding/what-if-i-ve-forgotten-my-pin', 'efc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/onboarding/what-is-my-username-and-password',
                component: ComponentCreator('/get-started/onboarding/what-is-my-username-and-password', 'b98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/get-started/overview/',
                component: ComponentCreator('/get-started/overview/', 'ee5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/learner/how-to-update-the-smartwinnr-app-from-web-view',
                component: ComponentCreator('/guides/learner/how-to-update-the-smartwinnr-app-from-web-view', '1e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/guides/manager/switching-to-manager-view',
                component: ComponentCreator('/guides/manager/switching-to-manager-view', 'fa1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/integrations',
                component: ComponentCreator('/integrations', 'c67'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules',
                component: ComponentCreator('/modules', 'dd1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/',
                component: ComponentCreator('/modules/ai-coaching/', '5a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/faqs-and-troubleshooting',
                component: ComponentCreator('/modules/ai-coaching/faqs-and-troubleshooting', '6d5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/faqs-and-troubleshooting/how-many-learners-have-submitted-their-responses',
                component: ComponentCreator('/modules/ai-coaching/faqs-and-troubleshooting/how-many-learners-have-submitted-their-responses', '5e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/faqs-and-troubleshooting/how-many-type-of-coaching-reports-are-available-on-smartwinnr',
                component: ComponentCreator('/modules/ai-coaching/faqs-and-troubleshooting/how-many-type-of-coaching-reports-are-available-on-smartwinnr', 'ca9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/features',
                component: ComponentCreator('/modules/ai-coaching/features', 'd57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/features/what-is-ai-coaching',
                component: ComponentCreator('/modules/ai-coaching/features/what-is-ai-coaching', '180'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-learners',
                component: ComponentCreator('/modules/ai-coaching/for-learners', 'bfe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-learners/how-can-a-user-submit-an-ai-coaching-attempt',
                component: ComponentCreator('/modules/ai-coaching/for-learners/how-can-a-user-submit-an-ai-coaching-attempt', '7ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-learners/how-can-a-user-view-feedback-after-submitting-an-ai-coaching',
                component: ComponentCreator('/modules/ai-coaching/for-learners/how-can-a-user-view-feedback-after-submitting-an-ai-coaching', '888'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-learners/understanding-the-feedback-screen',
                component: ComponentCreator('/modules/ai-coaching/for-learners/understanding-the-feedback-screen', '667'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-managers',
                component: ComponentCreator('/modules/ai-coaching/for-managers', 'b84'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/for-managers/how-to-review-ai-coaching-submissions-as-a-manager',
                component: ComponentCreator('/modules/ai-coaching/for-managers/how-to-review-ai-coaching-submissions-as-a-manager', '927'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics', '920'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-can-i-download-attempt-wise-user-objective-report',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-can-i-download-attempt-wise-user-objective-report', '07e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-download-attempt-wise-coaching-report',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-download-attempt-wise-coaching-report', '798'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-download-coaching-wise-report',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-download-coaching-wise-report', '607'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-download-overall-coaching-report',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-download-overall-coaching-report', 'd81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-track-improvement',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-track-improvement', '03c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-track-improvements-for-multiple-role-plays-at-the-same-time',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-track-improvements-for-multiple-role-plays-at-the-same-time', '412'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/how-do-i-view-submissions-as-they-happen',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/how-do-i-view-submissions-as-they-happen', '4c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/understanding-the-competency-skills-insights-tab-on-the-ai-coaching-dashboard',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/understanding-the-competency-skills-insights-tab-on-the-ai-coaching-dashboard', 'f00'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/understanding-the-overview-analysis-tab-on-the-ai-coaching-dashboard',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/understanding-the-overview-analysis-tab-on-the-ai-coaching-dashboard', '062'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/ai-coaching/reports-and-analytics/understanding-the-participation-insights-tab-on-the-ai-coaching-dashboard',
                component: ComponentCreator('/modules/ai-coaching/reports-and-analytics/understanding-the-participation-insights-tab-on-the-ai-coaching-dashboard', 'f3a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/',
                component: ComponentCreator('/modules/cross-module/', '6f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage',
                component: ComponentCreator('/modules/cross-module/create-and-manage', '818'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-add-a-image-to-your-content',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-add-a-image-to-your-content', '8d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-add-a-video-to-your-content',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-add-a-video-to-your-content', '930'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-add-reference-to-an-external-link-to-your-content',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-add-reference-to-an-external-link-to-your-content', 'ea8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-attach-pdf-file-to-your-content',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-attach-pdf-file-to-your-content', 'fa3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-create-sales-tv',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-create-sales-tv', 'eea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-update-the-smartwinnr-app-from-app-view',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-update-the-smartwinnr-app-from-app-view', 'd4d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/create-and-manage/how-to-update-users',
                component: ComponentCreator('/modules/cross-module/create-and-manage/how-to-update-users', '413'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/features',
                component: ComponentCreator('/modules/cross-module/features', '91d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/features/how-to-add-an-audio-file-to-your-content',
                component: ComponentCreator('/modules/cross-module/features/how-to-add-an-audio-file-to-your-content', '87d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/features/what-is-smartwinnr',
                component: ComponentCreator('/modules/cross-module/features/what-is-smartwinnr', 'eec'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/features/widgets',
                component: ComponentCreator('/modules/cross-module/features/widgets', '941'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners',
                component: ComponentCreator('/modules/cross-module/for-learners', 'f2b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners/how-can-i-answer-a-query',
                component: ComponentCreator('/modules/cross-module/for-learners/how-can-i-answer-a-query', '51d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners/how-to-access-the-scorm-course-from-the-smartwinnr-app',
                component: ComponentCreator('/modules/cross-module/for-learners/how-to-access-the-scorm-course-from-the-smartwinnr-app', '563'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners/how-to-post-a-query-from-the-smartwinnr-app',
                component: ComponentCreator('/modules/cross-module/for-learners/how-to-post-a-query-from-the-smartwinnr-app', '90a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners/how-to-use-qresolve-in-the-smartwinnr-app',
                component: ComponentCreator('/modules/cross-module/for-learners/how-to-use-qresolve-in-the-smartwinnr-app', '03e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/for-learners/what-is-qresolve',
                component: ComponentCreator('/modules/cross-module/for-learners/what-is-qresolve', 'd11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/reports-and-analytics',
                component: ComponentCreator('/modules/cross-module/reports-and-analytics', 'c1d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/reports-and-analytics/how-to-download-detailed-smartfeed-report',
                component: ComponentCreator('/modules/cross-module/reports-and-analytics/how-to-download-detailed-smartfeed-report', '0b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/settings-and-permissions',
                component: ComponentCreator('/modules/cross-module/settings-and-permissions', 'be7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/cross-module/settings-and-permissions/how-to-set-reminder-for-your-tasks',
                component: ComponentCreator('/modules/cross-module/settings-and-permissions/how-to-set-reminder-for-your-tasks', '856'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/',
                component: ComponentCreator('/modules/field-coaching/', '36e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/create-and-manage',
                component: ComponentCreator('/modules/field-coaching/create-and-manage', '93f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/create-and-manage/how-to-create-field-coaching-template',
                component: ComponentCreator('/modules/field-coaching/create-and-manage/how-to-create-field-coaching-template', '79b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/create-and-manage/how-to-create-field-mapping',
                component: ComponentCreator('/modules/field-coaching/create-and-manage/how-to-create-field-mapping', '47a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/features',
                component: ComponentCreator('/modules/field-coaching/features', '4f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/features/create-a-coaching',
                component: ComponentCreator('/modules/field-coaching/features/create-a-coaching', '9df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/features/how-to-add-competencies-for-field-coaching',
                component: ComponentCreator('/modules/field-coaching/features/how-to-add-competencies-for-field-coaching', 'cdc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/for-managers',
                component: ComponentCreator('/modules/field-coaching/for-managers', 'fd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/field-coaching/for-managers/how-to-review-field-coaching-from-managers-view-in-mobile',
                component: ComponentCreator('/modules/field-coaching/for-managers/how-to-review-field-coaching-from-managers-view-in-mobile', '186'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/',
                component: ComponentCreator('/modules/forms/', 'ba4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/create-and-manage',
                component: ComponentCreator('/modules/forms/create-and-manage', '226'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/create-and-manage/how-to-add-approvers-to-a-form',
                component: ComponentCreator('/modules/forms/create-and-manage/how-to-add-approvers-to-a-form', 'b25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/create-and-manage/how-to-create-a-form',
                component: ComponentCreator('/modules/forms/create-and-manage/how-to-create-a-form', '86f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/create-and-manage/how-to-edit-a-form-on-submitted-by-a-user',
                component: ComponentCreator('/modules/forms/create-and-manage/how-to-edit-a-form-on-submitted-by-a-user', '66a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/features',
                component: ComponentCreator('/modules/forms/features', '569'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/features/how-to-approve-reject-a-form-submission',
                component: ComponentCreator('/modules/forms/features/how-to-approve-reject-a-form-submission', '73f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/features/how-to-submit-a-form-on-behalf-of-a-user',
                component: ComponentCreator('/modules/forms/features/how-to-submit-a-form-on-behalf-of-a-user', 'f53'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-learners',
                component: ComponentCreator('/modules/forms/for-learners', '35c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-learners/how-can-i-submit-a-form-from-chat',
                component: ComponentCreator('/modules/forms/for-learners/how-can-i-submit-a-form-from-chat', '89a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-learners/how-can-i-submit-a-form-from-left-menu',
                component: ComponentCreator('/modules/forms/for-learners/how-can-i-submit-a-form-from-left-menu', 'cba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-learners/how-to-add-new-form-submission',
                component: ComponentCreator('/modules/forms/for-learners/how-to-add-new-form-submission', '4d6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-managers',
                component: ComponentCreator('/modules/forms/for-managers', '19f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-managers/how-managers-approve-form',
                component: ComponentCreator('/modules/forms/for-managers/how-managers-approve-form', 'bd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/for-managers/how-to-edit-the-form-submission-from-manager-s-view',
                component: ComponentCreator('/modules/forms/for-managers/how-to-edit-the-form-submission-from-manager-s-view', '4da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/reports-and-analytics',
                component: ComponentCreator('/modules/forms/reports-and-analytics', '2cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/forms/reports-and-analytics/form-analytics',
                component: ComponentCreator('/modules/forms/reports-and-analytics/form-analytics', '18a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/',
                component: ComponentCreator('/modules/knowledge-hub/', '1f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/create-and-manage',
                component: ComponentCreator('/modules/knowledge-hub/create-and-manage', 'fdc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/create-and-manage/how-can-i-create-folders-and-items-in-khub',
                component: ComponentCreator('/modules/knowledge-hub/create-and-manage/how-can-i-create-folders-and-items-in-khub', '302'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/features',
                component: ComponentCreator('/modules/knowledge-hub/features', '661'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/features/how-can-i-edit-a-khub-folder-name',
                component: ComponentCreator('/modules/knowledge-hub/features/how-can-i-edit-a-khub-folder-name', 'f88'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/features/how-can-i-edit-a-khub-item',
                component: ComponentCreator('/modules/knowledge-hub/features/how-can-i-edit-a-khub-item', '89d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/features/what-is-khub',
                component: ComponentCreator('/modules/knowledge-hub/features/what-is-khub', '8d9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/for-learners',
                component: ComponentCreator('/modules/knowledge-hub/for-learners', '930'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/for-learners/how-to-use-khub-in-the-smartwinnr-app',
                component: ComponentCreator('/modules/knowledge-hub/for-learners/how-to-use-khub-in-the-smartwinnr-app', '329'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/for-learners/understanding-recent-trending-and-latest-khub-items',
                component: ComponentCreator('/modules/knowledge-hub/for-learners/understanding-recent-trending-and-latest-khub-items', '599'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/reports-and-analytics',
                component: ComponentCreator('/modules/knowledge-hub/reports-and-analytics', '25a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/knowledge-hub/reports-and-analytics/how-can-i-view-khub-analytics',
                component: ComponentCreator('/modules/knowledge-hub/reports-and-analytics/how-can-i-view-khub-analytics', '9c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/',
                component: ComponentCreator('/modules/kpi-gamification/', '2a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/assign-and-schedule',
                component: ComponentCreator('/modules/kpi-gamification/assign-and-schedule', '150'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/assign-and-schedule/how-to-award-points-on-badge-assignment',
                component: ComponentCreator('/modules/kpi-gamification/assign-and-schedule/how-to-award-points-on-badge-assignment', '069'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage', '6f9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-challenge-to-the-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-challenge-to-the-competition', 'ee8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-form-to-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-form-to-competition', 'ece'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-quiz-to-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-quiz-to-a-competition', '4bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-scorecard-to-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-scorecard-to-a-competition', 'b60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-survey-to-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-survey-to-a-competition', '01e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-a-video-coaching-to-the-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-a-video-coaching-to-the-competition', '78c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-change-targets',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-change-targets', '694'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-different-activities-to-a-challenge',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-different-activities-to-a-challenge', '99c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-observers-to-the-competition-leaderboard',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-observers-to-the-competition-leaderboard', 'c6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-smartfeed-within-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-smartfeed-within-a-competition', '9d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-add-the-scorecard-to-leaderboard',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-add-the-scorecard-to-leaderboard', 'a28'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-a-competition', 'a0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-a-group-challenge',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-a-group-challenge', 'c69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-a-manager-challenge',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-a-manager-challenge', '9e9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-a-scorecard',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-a-scorecard', '9ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-an-individual-challenge',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-an-individual-challenge', '487'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-badges',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-badges', '831'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-certifcates',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-certifcates', '998'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-create-kpi',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-create-kpi', '8ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-duplicate-a-quiz-in-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-duplicate-a-quiz-in-a-competition', '204'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/create-and-manage/how-to-upload-kpi-data',
                component: ComponentCreator('/modules/kpi-gamification/create-and-manage/how-to-upload-kpi-data', '39c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features',
                component: ComponentCreator('/modules/kpi-gamification/features', 'f10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/define-kpis',
                component: ComponentCreator('/modules/kpi-gamification/features/define-kpis', '825'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/detailed-explanation-of-reports',
                component: ComponentCreator('/modules/kpi-gamification/features/detailed-explanation-of-reports', '1bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/how-to-view-the-data-and-leaderboard-for-scorecard',
                component: ComponentCreator('/modules/kpi-gamification/features/how-to-view-the-data-and-leaderboard-for-scorecard', '4dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/leaderboards-of-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/features/leaderboards-of-a-competition', '144'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/understand-game-concepts',
                component: ComponentCreator('/modules/kpi-gamification/features/understand-game-concepts', '086'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-are-field-mappings',
                component: ComponentCreator('/modules/kpi-gamification/features/what-are-field-mappings', '728'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-are-kpi-reports',
                component: ComponentCreator('/modules/kpi-gamification/features/what-are-kpi-reports', '9c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-are-scorecards',
                component: ComponentCreator('/modules/kpi-gamification/features/what-are-scorecards', '3e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-is-a-challenge',
                component: ComponentCreator('/modules/kpi-gamification/features/what-is-a-challenge', '904'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-is-a-competition',
                component: ComponentCreator('/modules/kpi-gamification/features/what-is-a-competition', '456'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-is-an-achievement',
                component: ComponentCreator('/modules/kpi-gamification/features/what-is-an-achievement', 'bc7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/features/what-is-kpi-gamification',
                component: ComponentCreator('/modules/kpi-gamification/features/what-is-kpi-gamification', '6a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-learners',
                component: ComponentCreator('/modules/kpi-gamification/for-learners', 'd68'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-learners/how-can-i-view-a-competition-leaderboard',
                component: ComponentCreator('/modules/kpi-gamification/for-learners/how-can-i-view-a-competition-leaderboard', 'ef8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-learners/how-do-i-view-the-kpi-scorecard',
                component: ComponentCreator('/modules/kpi-gamification/for-learners/how-do-i-view-the-kpi-scorecard', '6ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-managers',
                component: ComponentCreator('/modules/kpi-gamification/for-managers', '431'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-managers/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app',
                component: ComponentCreator('/modules/kpi-gamification/for-managers/how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app', '65f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/kpi-gamification/for-managers/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app',
                component: ComponentCreator('/modules/kpi-gamification/for-managers/how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app', '76a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/',
                component: ComponentCreator('/modules/notifications/', 'a89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/create-and-manage',
                component: ComponentCreator('/modules/notifications/create-and-manage', '7d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/create-and-manage/how-to-add-or-remove-users-to-a-chat-group',
                component: ComponentCreator('/modules/notifications/create-and-manage/how-to-add-or-remove-users-to-a-chat-group', 'e5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features',
                component: ComponentCreator('/modules/notifications/features', '5be'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/bulk-custom-notifications',
                component: ComponentCreator('/modules/notifications/features/bulk-custom-notifications', '31f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/custom-notifications',
                component: ComponentCreator('/modules/notifications/features/custom-notifications', '982'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/how-to-download-a-chat',
                component: ComponentCreator('/modules/notifications/features/how-to-download-a-chat', 'f5f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/what-are-chat-groups',
                component: ComponentCreator('/modules/notifications/features/what-are-chat-groups', '154'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/what-is-the-purpose-of-notifications',
                component: ComponentCreator('/modules/notifications/features/what-is-the-purpose-of-notifications', '125'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/features/when-are-chat-groups-needed',
                component: ComponentCreator('/modules/notifications/features/when-are-chat-groups-needed', '271'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/for-learners',
                component: ComponentCreator('/modules/notifications/for-learners', '58c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/for-learners/how-to-view-notifications',
                component: ComponentCreator('/modules/notifications/for-learners/how-to-view-notifications', '82b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/settings-and-permissions',
                component: ComponentCreator('/modules/notifications/settings-and-permissions', '159'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/notifications/settings-and-permissions/how-to-enable-a-chat-group',
                component: ComponentCreator('/modules/notifications/settings-and-permissions/how-to-enable-a-chat-group', 'd5d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/',
                component: ComponentCreator('/modules/quiz/', '2ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage',
                component: ComponentCreator('/modules/quiz/create-and-manage', 'd20'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-can-i-duplicate-a-quiz',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-can-i-duplicate-a-quiz', '8ff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-create-a-manual-quiz',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-create-a-manual-quiz', '8cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-create-an-automatic-quiz',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-create-an-automatic-quiz', '4bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-create-an-event-quiz',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-create-an-event-quiz', 'fc6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-create-numeric-type-questions',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-create-numeric-type-questions', 'cb3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-create-re-order-questions',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-create-re-order-questions', '565'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-edit-a-question',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-edit-a-question', 'f10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-update-question-response',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-update-question-response', 'e41'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/create-and-manage/how-to-upload-questions-in-bulk-using-import-questions',
                component: ComponentCreator('/modules/quiz/create-and-manage/how-to-upload-questions-in-bulk-using-import-questions', '4de'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/faqs-and-troubleshooting',
                component: ComponentCreator('/modules/quiz/faqs-and-troubleshooting', '3d5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/faqs-and-troubleshooting/how-import-question-is-different-from-add-new-question',
                component: ComponentCreator('/modules/quiz/faqs-and-troubleshooting/how-import-question-is-different-from-add-new-question', '62f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/faqs-and-troubleshooting/troubleshoot-for-common-error-code',
                component: ComponentCreator('/modules/quiz/faqs-and-troubleshooting/troubleshoot-for-common-error-code', '511'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features',
                component: ComponentCreator('/modules/quiz/features', '6a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-add-a-video-to-a-question',
                component: ComponentCreator('/modules/quiz/features/how-to-add-a-video-to-a-question', '182'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-add-an-audio-file-to-a-question',
                component: ComponentCreator('/modules/quiz/features/how-to-add-an-audio-file-to-a-question', '247'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-add-an-image-to-the-question',
                component: ComponentCreator('/modules/quiz/features/how-to-add-an-image-to-the-question', 'b60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-allow-multiple-attempts',
                component: ComponentCreator('/modules/quiz/features/how-to-allow-multiple-attempts', '903'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-a-drag-and-drop-into-image-question',
                component: ComponentCreator('/modules/quiz/features/how-to-create-a-drag-and-drop-into-image-question', '6ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-a-drag-and-drop-into-text-question',
                component: ComponentCreator('/modules/quiz/features/how-to-create-a-drag-and-drop-into-text-question', 'dd4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-a-hotspot-question',
                component: ComponentCreator('/modules/quiz/features/how-to-create-a-hotspot-question', 'aca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-a-matching-question',
                component: ComponentCreator('/modules/quiz/features/how-to-create-a-matching-question', 'f82'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-a-missing-words-question',
                component: ComponentCreator('/modules/quiz/features/how-to-create-a-missing-words-question', '43a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-fill-in-the-blank-questions',
                component: ComponentCreator('/modules/quiz/features/how-to-create-fill-in-the-blank-questions', '7ae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-long-answer-questions',
                component: ComponentCreator('/modules/quiz/features/how-to-create-long-answer-questions', '1d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-multiple-choice-questions',
                component: ComponentCreator('/modules/quiz/features/how-to-create-multiple-choice-questions', 'eb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-create-short-answer-with-multiple-options',
                component: ComponentCreator('/modules/quiz/features/how-to-create-short-answer-with-multiple-options', '1ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-embed-a-link-into-the-question',
                component: ComponentCreator('/modules/quiz/features/how-to-embed-a-link-into-the-question', 'b05'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/how-to-manage-quiz-configurations',
                component: ComponentCreator('/modules/quiz/features/how-to-manage-quiz-configurations', 'abd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/question-bank',
                component: ComponentCreator('/modules/quiz/features/question-bank', '426'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/question-structure',
                component: ComponentCreator('/modules/quiz/features/question-structure', 'be9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/quiz-types',
                component: ComponentCreator('/modules/quiz/features/quiz-types', '548'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/features/understanding-knowledge-categories',
                component: ComponentCreator('/modules/quiz/features/understanding-knowledge-categories', '5d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-learners',
                component: ComponentCreator('/modules/quiz/for-learners', '21c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-learners/how-to-answer-long-answer-type-questions-in-smartwinnr',
                component: ComponentCreator('/modules/quiz/for-learners/how-to-answer-long-answer-type-questions-in-smartwinnr', '4e6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-learners/how-users-can-see-the-evaluation-and-scores-for-long-answer-question',
                component: ComponentCreator('/modules/quiz/for-learners/how-users-can-see-the-evaluation-and-scores-for-long-answer-question', 'f97'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-managers',
                component: ComponentCreator('/modules/quiz/for-managers', 'd1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-managers/finding-status-and-scores-for-quizzes-assigned-to-your-team',
                component: ComponentCreator('/modules/quiz/for-managers/finding-status-and-scores-for-quizzes-assigned-to-your-team', 'b29'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-managers/how-to-find-the-progress-of-your-team-in-quizzes',
                component: ComponentCreator('/modules/quiz/for-managers/how-to-find-the-progress-of-your-team-in-quizzes', 'ce8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/for-managers/quiz-analytics-through-charts',
                component: ComponentCreator('/modules/quiz/for-managers/quiz-analytics-through-charts', '884'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics',
                component: ComponentCreator('/modules/quiz/reports-and-analytics', '2ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/detailed-quiz-analytics',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/detailed-quiz-analytics', 'a2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/how-can-i-track-improvement',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/how-can-i-track-improvement', 'd10'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/how-editors-evaluate-long-answer-questions',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/how-editors-evaluate-long-answer-questions', 'eea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/question-response-analytics',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/question-response-analytics', 'a25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/quiz-comparison-report',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/quiz-comparison-report', 'dcd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/understanding-the-learner-management-tab-on-the-quiz-dashboard',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/understanding-the-learner-management-tab-on-the-quiz-dashboard', 'c1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/understanding-the-overview-tab-on-the-quiz-dashboard',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/understanding-the-overview-tab-on-the-quiz-dashboard', '8ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/understanding-the-participation-tab-on-the-quiz-dashboard',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/understanding-the-participation-tab-on-the-quiz-dashboard', '9fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/understanding-the-performance-tab-on-the-quiz-dashboard',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/understanding-the-performance-tab-on-the-quiz-dashboard', '7fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/reports-and-analytics/what-is-smartwinnr-quiz-analytics',
                component: ComponentCreator('/modules/quiz/reports-and-analytics/what-is-smartwinnr-quiz-analytics', '8f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/settings-and-permissions',
                component: ComponentCreator('/modules/quiz/settings-and-permissions', 'a31'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/quiz/settings-and-permissions/how-to-activate-automatic-reminders-for-your-quizzes',
                component: ComponentCreator('/modules/quiz/settings-and-permissions/how-to-activate-automatic-reminders-for-your-quizzes', '774'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/',
                component: ComponentCreator('/modules/smartfeed/', '86d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/assign-and-schedule',
                component: ComponentCreator('/modules/smartfeed/assign-and-schedule', 'bc3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/assign-and-schedule/how-to-send-a-smartfeed-multiple-times',
                component: ComponentCreator('/modules/smartfeed/assign-and-schedule/how-to-send-a-smartfeed-multiple-times', '50a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/assign-and-schedule/how-to-send-the-smartfeed-to-teams',
                component: ComponentCreator('/modules/smartfeed/assign-and-schedule/how-to-send-the-smartfeed-to-teams', 'f2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage',
                component: ComponentCreator('/modules/smartfeed/create-and-manage', '29c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-add-a-powerpoint-presentation-ppt-to-smartfeed', '5f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-add-a-recording-to-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-add-a-recording-to-a-smartfeed', 'c57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-create-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-create-a-smartfeed', 'b1f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-delete-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-delete-a-smartfeed', '6fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-edit-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-edit-a-smartfeed', 'f69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/create-and-manage/how-to-update-the-thumbnail-of-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/create-and-manage/how-to-update-the-thumbnail-of-a-smartfeed', '708'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/features',
                component: ComponentCreator('/modules/smartfeed/features', 'bcb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/features/how-to-view-all-the-smartfeeds',
                component: ComponentCreator('/modules/smartfeed/features/how-to-view-all-the-smartfeeds', '0b3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/features/what-are-smartfeeds',
                component: ComponentCreator('/modules/smartfeed/features/what-are-smartfeeds', 'fc5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/for-learners',
                component: ComponentCreator('/modules/smartfeed/for-learners', 'bea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/for-learners/how-do-i-like-and-comment-on-a-smartfeed',
                component: ComponentCreator('/modules/smartfeed/for-learners/how-do-i-like-and-comment-on-a-smartfeed', '0a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/reports-and-analytics',
                component: ComponentCreator('/modules/smartfeed/reports-and-analytics', '5f6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartfeed/reports-and-analytics/how-to-view-smartfeed-analytics',
                component: ComponentCreator('/modules/smartfeed/reports-and-analytics/how-to-view-smartfeed-analytics', '14a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/',
                component: ComponentCreator('/modules/smartpath/', '3f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/assign-and-schedule',
                component: ComponentCreator('/modules/smartpath/assign-and-schedule', '11e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/assign-and-schedule/how-to-create-assignment-in-smartpath',
                component: ComponentCreator('/modules/smartpath/assign-and-schedule/how-to-create-assignment-in-smartpath', 'bb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage',
                component: ComponentCreator('/modules/smartpath/create-and-manage', '982'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-add-learning-sessions-in-smartpath-module', 'fd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-add-remove-segments-in-module-added-to-smartpath',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-add-remove-segments-in-module-added-to-smartpath', '282'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed', '50a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-create-a-module-for-smartpath',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-create-a-module-for-smartpath', '123'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-create-a-smartpath',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-create-a-smartpath', 'a2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-create-an-action-item-in-the-smartpath',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-create-an-action-item-in-the-smartpath', 'd9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-create-smartpath-with-learning-sessions',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-create-smartpath-with-learning-sessions', 'e9e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-edit-a-smartpath',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-edit-a-smartpath', '2b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/create-and-manage/how-to-import-scorm-course-into-smartwinnr',
                component: ComponentCreator('/modules/smartpath/create-and-manage/how-to-import-scorm-course-into-smartwinnr', 'c81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/features',
                component: ComponentCreator('/modules/smartpath/features', '274'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/features/how-can-i-gamify-a-smartpath',
                component: ComponentCreator('/modules/smartpath/features/how-can-i-gamify-a-smartpath', 'ab5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/features/how-to-download-smartpath-reports',
                component: ComponentCreator('/modules/smartpath/features/how-to-download-smartpath-reports', 'fbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/features/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/modules/smartpath/features/how-to-mark-the-attendance-for-users-in-learning-sessions', 'b1e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/features/what-are-smartpaths',
                component: ComponentCreator('/modules/smartpath/features/what-are-smartpaths', '737'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/for-learners',
                component: ComponentCreator('/modules/smartpath/for-learners', '383'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/for-learners/how-learners-can-mark-attendance-for-smartpath-learning-session-on-their-own',
                component: ComponentCreator('/modules/smartpath/for-learners/how-learners-can-mark-attendance-for-smartpath-learning-session-on-their-own', 'eb0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/for-learners/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr',
                component: ComponentCreator('/modules/smartpath/for-learners/how-to-take-the-smartpath-assigned-to-me-in-smartwinnr', '67a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/for-managers',
                component: ComponentCreator('/modules/smartpath/for-managers', '462'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/for-managers/how-to-mark-the-attendance-for-users-in-learning-sessions',
                component: ComponentCreator('/modules/smartpath/for-managers/how-to-mark-the-attendance-for-users-in-learning-sessions', 'cb6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics', '303'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics/how-can-i-track-improvement',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics/how-can-i-track-improvement', '3d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics/how-to-evaluate-the-assignment-submitted-in-smartpath',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics/how-to-evaluate-the-assignment-submitted-in-smartpath', 'd06'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics/how-to-view-the-smartpath-analytics',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics/how-to-view-the-smartpath-analytics', '6f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics/understanding-the-module-wise-analysis-tab-on-the-smartpath-dashboard',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics/understanding-the-module-wise-analysis-tab-on-the-smartpath-dashboard', '0d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/reports-and-analytics/understanding-the-overview-tab-on-the-smartpath-dashboard',
                component: ComponentCreator('/modules/smartpath/reports-and-analytics/understanding-the-overview-tab-on-the-smartpath-dashboard', '2a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/settings-and-permissions',
                component: ComponentCreator('/modules/smartpath/settings-and-permissions', 'b84'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/smartpath/settings-and-permissions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance',
                component: ComponentCreator('/modules/smartpath/settings-and-permissions/how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance', 'dc5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/',
                component: ComponentCreator('/modules/survey/', 'a3b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/assign-and-schedule',
                component: ComponentCreator('/modules/survey/assign-and-schedule', '87d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/assign-and-schedule/how-to-assign-a-survey-in-smartwinnr',
                component: ComponentCreator('/modules/survey/assign-and-schedule/how-to-assign-a-survey-in-smartwinnr', '4b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/create-and-manage',
                component: ComponentCreator('/modules/survey/create-and-manage', '7b8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/create-and-manage/how-to-create-a-survey',
                component: ComponentCreator('/modules/survey/create-and-manage/how-to-create-a-survey', 'a19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/create-and-manage/how-to-create-a-survey-template',
                component: ComponentCreator('/modules/survey/create-and-manage/how-to-create-a-survey-template', 'fbc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/create-and-manage/how-to-delete-a-survey',
                component: ComponentCreator('/modules/survey/create-and-manage/how-to-delete-a-survey', '921'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/create-and-manage/how-to-duplicate-a-survey-and-survey-template',
                component: ComponentCreator('/modules/survey/create-and-manage/how-to-duplicate-a-survey-and-survey-template', 'ba9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/faqs-and-troubleshooting',
                component: ComponentCreator('/modules/survey/faqs-and-troubleshooting', 'c79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/faqs-and-troubleshooting/what-is-the-difference-between-a-survey-and-a-survey-template',
                component: ComponentCreator('/modules/survey/faqs-and-troubleshooting/what-is-the-difference-between-a-survey-and-a-survey-template', 'de0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/features',
                component: ComponentCreator('/modules/survey/features', 'fce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/features/what-are-the-different-question-types-in-a-survey-survey-template',
                component: ComponentCreator('/modules/survey/features/what-are-the-different-question-types-in-a-survey-survey-template', '856'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/reports-and-analytics',
                component: ComponentCreator('/modules/survey/reports-and-analytics', '16d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/reports-and-analytics/survey-analytics',
                component: ComponentCreator('/modules/survey/reports-and-analytics/survey-analytics', 'b19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/survey/reports-and-analytics/survey-template-analytics',
                component: ComponentCreator('/modules/survey/reports-and-analytics/survey-template-analytics', 'd79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/',
                component: ComponentCreator('/modules/video-coaching/', 'f8b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/assign-and-schedule',
                component: ComponentCreator('/modules/video-coaching/assign-and-schedule', 'a8a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/assign-and-schedule/how-to-create-a-video-coaching-assignment',
                component: ComponentCreator('/modules/video-coaching/assign-and-schedule/how-to-create-a-video-coaching-assignment', '0e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/assign-and-schedule/how-to-review-a-video-coaching-assignment',
                component: ComponentCreator('/modules/video-coaching/assign-and-schedule/how-to-review-a-video-coaching-assignment', 'b36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/assign-and-schedule/how-to-share-a-coaching-video',
                component: ComponentCreator('/modules/video-coaching/assign-and-schedule/how-to-share-a-coaching-video', '493'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/create-and-manage',
                component: ComponentCreator('/modules/video-coaching/create-and-manage', '368'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/create-and-manage/how-to-create-field-coaching',
                component: ComponentCreator('/modules/video-coaching/create-and-manage/how-to-create-field-coaching', 'd0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/create-and-manage/how-to-reset-a-coaching-video',
                component: ComponentCreator('/modules/video-coaching/create-and-manage/how-to-reset-a-coaching-video', '601'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/create-and-manage/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager',
                component: ComponentCreator('/modules/video-coaching/create-and-manage/how-to-review-a-field-coaching-as-a-manager-2nd-level-manager', '43b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-learners',
                component: ComponentCreator('/modules/video-coaching/for-learners', '5d5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-learners/how-do-i-upload-a-coaching-video',
                component: ComponentCreator('/modules/video-coaching/for-learners/how-do-i-upload-a-coaching-video', '8fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-learners/how-to-upload-audio-recording-for-coaching',
                component: ComponentCreator('/modules/video-coaching/for-learners/how-to-upload-audio-recording-for-coaching', 'ab3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-learners/how-to-upload-screen-recording-for-coaching',
                component: ComponentCreator('/modules/video-coaching/for-learners/how-to-upload-screen-recording-for-coaching', '0c0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-learners/how-to-upload-video-recording-for-coaching',
                component: ComponentCreator('/modules/video-coaching/for-learners/how-to-upload-video-recording-for-coaching', 'd15'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-managers',
                component: ComponentCreator('/modules/video-coaching/for-managers', '1dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-managers/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team',
                component: ComponentCreator('/modules/video-coaching/for-managers/how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team', '517'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/for-managers/what-is-my-team-coaching',
                component: ComponentCreator('/modules/video-coaching/for-managers/what-is-my-team-coaching', 'df7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/settings-and-permissions',
                component: ComponentCreator('/modules/video-coaching/settings-and-permissions', '243'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/settings-and-permissions/how-to-enable-the-streaming-links-for-video-coaching',
                component: ComponentCreator('/modules/video-coaching/settings-and-permissions/how-to-enable-the-streaming-links-for-video-coaching', '6d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/modules/video-coaching/settings-and-permissions/how-to-set-competencies',
                component: ComponentCreator('/modules/video-coaching/settings-and-permissions/how-to-set-competencies', 'c48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/path/admin/',
                component: ComponentCreator('/path/admin/', '653'),
                exact: true
              },
              {
                path: '/path/editor/',
                component: ComponentCreator('/path/editor/', 'e97'),
                exact: true
              },
              {
                path: '/path/help/',
                component: ComponentCreator('/path/help/', 'f76'),
                exact: true
              },
              {
                path: '/path/integrations/',
                component: ComponentCreator('/path/integrations/', 'ffe'),
                exact: true
              },
              {
                path: '/path/learner/',
                component: ComponentCreator('/path/learner/', '15d'),
                exact: true
              },
              {
                path: '/path/manager/',
                component: ComponentCreator('/path/manager/', '22e'),
                exact: true
              },
              {
                path: '/path/reports/',
                component: ComponentCreator('/path/reports/', 'fc6'),
                exact: true
              },
              {
                path: '/reference',
                component: ComponentCreator('/reference', '763'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reference/help-support/',
                component: ComponentCreator('/reference/help-support/', 'c60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reference/help-support/troubleshoot-for-common-error-code',
                component: ComponentCreator('/reference/help-support/troubleshoot-for-common-error-code', '351'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reference/troubleshooting/',
                component: ComponentCreator('/reference/troubleshooting/', '7a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/release-notes',
                component: ComponentCreator('/release-notes', '813'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/release-notes/announcements/',
                component: ComponentCreator('/release-notes/announcements/', 'bc8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/',
                component: ComponentCreator('/reports-and-analytics/legacy/', '182'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/learner-overall-report',
                component: ComponentCreator('/reports-and-analytics/legacy/learner-overall-report', '31d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/learner-report-by-learner-individual-report-analytics',
                component: ComponentCreator('/reports-and-analytics/legacy/learner-report-by-learner-individual-report-analytics', '721'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/quiz-wise-analytics',
                component: ComponentCreator('/reports-and-analytics/legacy/quiz-wise-analytics', '235'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/team-analytics',
                component: ComponentCreator('/reports-and-analytics/legacy/team-analytics', '21e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/team-progress-report',
                component: ComponentCreator('/reports-and-analytics/legacy/team-progress-report', 'bef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/reports-and-analytics/legacy/user-login-reports',
                component: ComponentCreator('/reports-and-analytics/legacy/user-login-reports', '0ac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '697'),
                exact: true
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
