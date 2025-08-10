import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'getting-started/index',
    {
      type: 'category',
      label: 'Quiz',
      items: [
        'quiz/index',
        'quiz/creating-quiz',
        'quiz/managing-questions',
        'quiz/quiz-reports',
        'quiz/quiz-settings',
      ],
    },
    {
      type: 'category',
      label: 'Microlearning',
      items: [
        'microlearning/index',
      ],
    },
    {
      type: 'category',
      label: 'Competitions',
      items: [
        'competitions/index',
      ],
    },
  ],
};

export default sidebars;