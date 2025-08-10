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
    component: ComponentCreator('/', '7fc'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '989'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '0b4'),
            routes: [
              {
                path: '/competitions/',
                component: ComponentCreator('/competitions/', 'cce'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/microlearning/',
                component: ComponentCreator('/microlearning/', '735'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/',
                component: ComponentCreator('/quiz/', '9eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/creating-quiz',
                component: ComponentCreator('/quiz/creating-quiz', 'a48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/managing-questions',
                component: ComponentCreator('/quiz/managing-questions', '456'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/quiz-reports',
                component: ComponentCreator('/quiz/quiz-reports', '74d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/quiz/quiz-settings',
                component: ComponentCreator('/quiz/quiz-settings', '414'),
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
