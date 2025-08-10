#!/usr/bin/env node
const fs = require('fs-extra');
const path = require('path');

class DocsReorganizer {
  constructor() {
    this.docsDir = path.join(__dirname, '../docs');
    this.backupDir = path.join(__dirname, '../docs-backup');
    
    // New organization mapping based on content analysis
    this.reorganizationMap = {
      // Getting Started (Basic onboarding and concepts)
      'getting-started': [
        'what-is-smartwinnr.md',
        'how-can-i-login-to-smartwinnr-app.md',
        'what-if-i-ve-forgotten-my-password.md',
        'what-if-i-ve-forgotten-my-pin.md',
        'how-can-i-change-my-password-for-smartwinnr.md',
        'my-account-is-locked-what-should-i-do.md',
        'how-do-i-unlock-an-account.md',
        'browser-and-device-support.md',
        'how-can-i-check-the-app-version-web-view-version.md',
        'how-to-update-the-smartwinnr-app-web-view.md',
        'how-to-update-the-smartwinnr-app-from-app-view.md',
        'how-can-i-change-my-profile-image.md',
        'how-can-i-change-my-language-in-smartwinnr-app.md',
        'switching-to-manager-view.md',
        'how-can-i-enable-push-notification-for-smartwinnr-app.md',
        'how-to-resend-account-invitation.md'
      ],

      // Quizzes & Questions
      'quizzes': [
        // Question Types
        'how-to-create-multiple-choice-questions.md',
        'how-to-create-a-missing-words-question.md',
        'how-to-create-a-drag-and-drop-into-image-question.md',
        'short-answer-with-multiple-options.md',
        'how-to-create-a-drag-and-drop-into-text-question.md',
        'how-to-create-numeric-type-questions.md',
        'how-to-create-a-matching-question.md',
        'how-to-create-fill-in-the-blank-questions.md',
        'how-to-create-a-hotspot-question.md',
        'how-to-create-long-answer-questions.md',
        'how-to-create-re-order-questions.md',
        'question-structure.md',
        
        // Quiz Creation & Management
        'quiz-types.md',
        'how-to-create-an-automatic-quiz.md',
        'how-to-create-a-manual-quiz.md',
        'how-can-i-duplicate-a-quiz.md',
        'how-to-activate-automatic-reminders-for-your-quizzes.md',
        'how-to-open-and-close-a-quiz.md',
        'how-to-import-scorm-course-into-smartwinnr.md',
        'how-to-manage-quiz-configurations.md',
        
        // Question Bank & Management  
        'understanding-knowledge-categories.md',
        'how-to-upload-questions-in-bulk-using-import-questions.md',
        'how-to-edit-a-question.md',
        'how-editors-evaluate-long-answer-questions.md',
        'how-to-update-question-response.md',
        'what-is-audit-log.md',
        'what-is-a-rule.md',
        
        // Quiz Analytics
        'detailed-quiz-analytics.md',
        'what-is-smartwinnr-quiz-analytics.md',
        'question-response-analytics.md',
        'team-analytics.md',
        'team-progress-report.md',
        'learner-overall-report.md',
        'learner-report-by-learner-individual-report-analytics.md',
        'quiz-wise-analytics.md',
        'quiz-comparison-report.md',
        'quiz-analytics-through-charts.md',
        'how-to-find-the-progress-of-your-team-in-quizzes.md',
        'finding-status-and-scores-for-quizzes-assigned-to-your-team.md',
        'how-to-answer-long-answer-type-questions-in-smartwinnr.md',
        
        // Quiz in Competitions
        'how-to-add-a-quiz-to-a-competition.md',
        'how-to-duplicate-a-quiz-in-a-competition.md',
        'how-to-add-a-survey-to-a-competition.md',
        'what-is-a-competition.md',
        'how-to-create-a-competition.md',
        
        // Permissions & Access
        'how-to-give-other-editors-access-to-a-particular-activity-task-you-created-in-smartwinnr.md',
        'how-do-i-give-access-permission-to-other-editors.md',
        'how-to-send-quizzes-surveys-and-content-using-group.md',
        'what-is-a-group.md',
        
        // User Management in Quiz Context
        'how-to-activate-or-deactivate-a-user.md',
        'create-users-in-bulk.md',
        'delete-users.md',
        'how-can-i-download-the-smartwinnr-app.md',
        'how-to-take-the-smartpath-assigned-to-me-in-smartwinnr.md',
        'how-to-set-reminder-for-your-tasks.md',
        'how-to-edit-the-form-submission-from-manager-s-view.md'
      ],

      // Learning & Training
      'learning': [
        // SmartPaths
        'how-to-create-a-smartpath.md',
        'how-to-edit-a-smartpath.md',
        'how-to-create-a-module-for-smartpath.md',
        'how-to-create-smartpath-with-learning-sessions.md',
        'how-to-add-learning-sessions-in-smartpath-module.md',
        'what-are-smartpaths.md',
        'how-to-view-the-smartpath-analytics.md',
        'how-to-archive-a-smartpath-and-unhide-them-in-future-if-needed.md',
        'how-to-download-share-a-smartfeed-in-smartpath.md',
        
        // SmartFeeds
        'how-to-create-a-smartfeed.md',
        'what-are-smartfeeds.md',
        'how-to-edit-a-smartfeed.md',
        'how-to-view-all-the-smartfeeds.md',
        'how-to-send-the-smartfeed-to-teams.md',
        'how-to-send-a-smartfeed-multiple-times.md',
        'how-to-delete-smartfeeds.md',
        'how-do-i-like-a-smartfeed.md',
        'how-to-view-smartfeed-analytics.md',
        
        // Content Creation
        'how-to-add-a-video-to-a-question.md',
        'how-to-add-an-image-to-the-question.md',
        'how-to-add-an-audio-file-to-a-question.md',
        'how-to-embed-a-link-into-the-question.md',
        'how-to-add-reference-to-an-external-link-to-your-content.md',
        'how-to-attach-pdf-file-to-your-content.md',
        'how-to-add-a-image-to-your-content.md',
        'how-to-add-a-video-to-your-content.md',
        'how-to-add-an-audio-file-to-your-content.md',
        'how-to-add-a-powerpoint-presentation-ppt-to-smartfeed.md',
        'how-to-add-a-recording-to-a-smartfeed.md',
        'how-import-question-is-different-from-add-new-question.md',
        
        // KHub & Knowledge Management
        'what-is-khub.md',
        'how-can-i-create-folders-and-items-in-khub.md',
        'how-can-i-edit-a-khub-item.md',
        'how-can-i-edit-a-khub-folder-name.md',
        'how-can-i-view-khub-analytics.md',
        'how-to-use-khub-in-the-smartwinnr-app.md',
        'understanding-recent-trending-and-latest-khub-items.md',
        
        // Learning Sessions & Attendance
        'how-to-mark-the-attendance-for-users-in-learning-sessions.md',
        'how-to-send-an-absent-reminder-to-participants-by-the-trainer-to-improve-attendance.md',
        'how-to-access-the-scorm-course-from-the-smartwinnr-app.md',
        
        // Microlearning would go here if we had specific articles
      ],

      // Coaching & Performance
      'coaching': [
        'create-a-coaching.md',
        'how-to-create-a-video-coaching-assignment.md',
        'how-do-i-upload-a-coaching-video.md',
        'how-to-upload-video-recording-for-coaching.md',
        'how-to-upload-audio-recording-for-coaching.md',
        'how-to-upload-screen-recording-for-coaching.md',
        'how-to-review-a-video-coaching-assignment.md',
        'how-to-reset-a-coaching-video.md',
        'how-to-share-a-coaching-video.md',
        'how-to-enable-the-streaming-links-for-video-coaching.md',
        
        // Field Coaching
        'how-to-create-field-coaching.md',
        'how-to-create-field-coaching-template.md',
        'how-to-review-a-field-coaching-as-a-manager-2nd-level-manager.md',
        'how-to-review-field-coaching-from-managers-view-in-mobile.md',
        'how-to-add-competencies-for-field-coaching.md',
        'how-to-set-competencies.md',
        
        // Team Coaching & Management
        'what-is-my-team-coaching.md',
        'how-manager-can-check-the-status-of-the-coachings-assigned-to-my-team.md'
      ],

      // Competitions & Gamification
      'competitions': [
        // Competition Basics
        'leaderboards-of-a-competition.md',
        'how-can-i-view-a-competition-leaderboard.md',
        'how-managers-can-view-the-competition-leaderboards-in-the-smartwinnr-app.md',
        'how-to-add-observers-to-the-competition-leaderboard.md',
        'understand-game-concepts.md',
        
        // Challenges
        'what-is-a-challenge.md',
        'how-to-add-a-challenge-to-the-competition.md',
        'how-to-create-an-individual-challenge.md',
        'how-to-create-a-manager-challenge.md',
        'how-to-create-a-group-challenge.md',
        'how-to-add-different-activities-to-a-challenge.md',
        
        // Competition Management
        'how-to-add-a-form-to-competition.md',
        'how-to-add-a-scorecard-to-a-competition.md',
        'how-to-add-the-scorecard-to-leaderboard.md',
        'how-can-i-gamify-a-smartpath.md',
        'how-to-add-smartfeed-within-a-competition.md',
        
        // KPI & Gamification
        'what-is-kpi-gamification.md',
        'how-to-create-kpi.md',
        'define-kpis.md',
        'how-to-upload-kpi-data.md',
        'what-are-kpi-reports.md',
        'how-do-managers-track-the-kpi-scorecard-results-in-the-smartwinnr-app.md',
        'how-do-i-view-the-kpi-scorecard.md',
        'how-to-view-the-data-and-leaderboard-for-scorecard.md',
        
        // Badges & Achievements  
        'how-to-create-badges.md',
        'how-to-award-points-on-badge-assignment.md',
        'what-is-an-achievement.md',
        'how-to-create-certifcates.md',
        
        // Question Bank in Competition Context
        'question-bank.md'
      ],

      // Surveys & Feedback
      'surveys': [
        'how-to-create-a-survey.md',
        'how-to-assign-a-survey.md',
        'what-is-the-difference-between-a-survey-and-a-survey-template.md',
        'how-to-create-a-survey-template.md',
        'what-are-the-different-question-types-in-a-survey-survey-template.md',
        'how-to-duplicate-a-survey-and-survey-template.md',
        'how-to-delete-a-survey.md',
        'survey-analytics.md',
        'survey-template-analytics.md',
        'how-to-add-a-video-coaching-to-the-competition.md'
      ],

      // Reports & Analytics
      'reports': [
        'widgets.md',
        'how-to-create-a-scorecard.md',
        'what-are-scorecards.md',
        'how-to-create-a-field-mapping.md',
        'what-are-field-mappings.md',
        'how-to-create-a-form.md',
        'form-analytics.md',
        'how-to-add-approvers-to-a-form.md',
        'how-managers-approve-form.md',
        'detailed-explanation-of-reports.md',
        'how-to-view-project.md',
        'user-login-reports.md',
        'how-to-create-sales-tv.md'
      ],

      // User & Organization Management
      'admin': [
        // User Management
        'what-is-my-username-and-password.md',
        'how-can-i-change-the-password-for-a-user-account.md',
        'how-can-an-admin-change-anyone-s-password.md',
        'create-users-individually.md',
        'search-users.md',
        'how-to-add-or-remove-users-to-a-chat-group.md',
        'how-to-mark-the-attendance-for-users-in-learning-sessions.md',
        'how-to-edit-a-form-on-submitted-by-a-user.md',
        'how-to-submit-a-form-on-behalf-of-a-user.md',
        'how-users-can-see-the-evaluation-and-scores-for-long-answer-question.md',
        
        // Groups & Access
        'how-to-create-a-group.md',
        'what-are-chat-groups.md',
        'how-to-enable-a-chat-group.md',
        'how-to-download-a-chat.md',
        'when-are-chat-groups-needed.md',
        
        // Organization Settings
        'how-to-change-company-logo.md',
        'how-to-add-a-new-division.md',
        'changing-updating-configuration-for-an-organization.md',
        'how-to-track-my-organizational-resource-usage.md',
        'manage-password-policy.md',
        
        // Forms & Workflows
        'how-to-approve-reject-a-form-submission.md',
        'how-can-i-submit-a-form-from-chat.md',
        'how-can-i-submit-a-form-from-left-menu.md',
        'how-to-add-new-form-submission.md',
        'how-to-edit-a-project.md',
        
        // Projects & Advanced
        'how-to-create-a-new-project.md',
        'advanced-options-for-projects.md',
        
        // Notifications & Communication
        'custom-notifications.md',
        'what-is-the-purpose-of-notifications.md',
        'bulk-custom-notifications.md',
        'how-to-view-notifications.md',
        'how-to-add-change-targets.md',
        
        // Contacts & Rules
        'how-to-add-new-contacts.md',
        'how-to-view-existing-contacts.md',
        'how-to-add-new-rule.md',
        'how-to-view-an-audit-log.md',
        
        // Support & Queries
        'how-can-i-contact-smartwinnr-team.md',
        'what-is-qresolve.md',
        'how-to-use-qresolve-in-the-smartwinnr-app.md',
        'how-to-post-a-query-from-the-smartwinnr-app.md',
        'how-can-i-answer-a-query.md'
      ],

      // Mobile & Apps  
      'mobile': [
        // This section would be created during reorganization
        // Most mobile-specific content is already in getting-started
      ],

      // Troubleshooting & Support
      'troubleshooting': [
        'troubleshoot-for-common-error-code.md'
      ]
    };
  }

  async createBackup() {
    console.log('📦 Creating backup of current docs structure...');
    await fs.copy(this.docsDir, this.backupDir);
    console.log('✅ Backup created at:', this.backupDir);
  }

  async createNewFolderStructure() {
    console.log('📁 Creating new folder structure...');
    
    const newFolders = Object.keys(this.reorganizationMap);
    for (const folder of newFolders) {
      const folderPath = path.join(this.docsDir, folder);
      await fs.ensureDir(folderPath);
      console.log(`✓ Created folder: ${folder}`);
    }
  }

  async moveArticles() {
    console.log('📄 Moving articles to new structure...');
    let movedCount = 0;
    let notFoundCount = 0;

    for (const [newFolder, articles] of Object.entries(this.reorganizationMap)) {
      console.log(`\n📂 Processing ${newFolder} folder:`);
      
      for (const articleFile of articles) {
        try {
          // Find the article in any of the current folders
          const currentFolders = ['getting-started', 'quiz', 'forms', 'competitions', 'coaching', 'reports', 'kpi-gamification', 'surveys', 'users', 'smartpath'];
          let found = false;
          
          for (const currentFolder of currentFolders) {
            const sourcePath = path.join(this.docsDir, currentFolder, articleFile);
            if (await fs.pathExists(sourcePath)) {
              const targetPath = path.join(this.docsDir, newFolder, articleFile);
              await fs.move(sourcePath, targetPath);
              console.log(`  ✓ Moved: ${articleFile}`);
              movedCount++;
              found = true;
              break;
            }
          }
          
          if (!found) {
            console.log(`  ✗ Not found: ${articleFile}`);
            notFoundCount++;
          }
        } catch (error) {
          console.error(`  ✗ Error moving ${articleFile}:`, error.message);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Articles moved: ${movedCount}`);
    console.log(`❌ Articles not found: ${notFoundCount}`);
  }

  async createIndexFiles() {
    console.log('\n📝 Creating index files for new folders...');
    
    const folderDescriptions = {
      'getting-started': 'Get started with SmartWinnr - basic setup, login, and navigation.',
      'quizzes': 'Create and manage quizzes, questions, and quiz analytics.',
      'learning': 'SmartPaths, SmartFeeds, and learning content management.',
      'coaching': 'Video coaching, field coaching, and performance management.',
      'competitions': 'Competitions, challenges, gamification, and KPI tracking.',
      'surveys': 'Create and manage surveys and feedback collection.',
      'reports': 'Analytics, reporting, and data visualization.',
      'admin': 'User management, organization settings, and administration.',
      'mobile': 'Mobile app features and mobile-specific functionality.',
      'troubleshooting': 'Common issues, troubleshooting, and support.'
    };

    for (const [folder, description] of Object.entries(folderDescriptions)) {
      const indexPath = path.join(this.docsDir, folder, 'index.md');
      
      if (!await fs.pathExists(indexPath)) {
        const indexContent = `---
title: ${folder.charAt(0).toUpperCase() + folder.slice(1).replace('-', ' ')}
description: ${description}
sidebar_position: 1
---

# ${folder.charAt(0).toUpperCase() + folder.slice(1).replace('-', ' ')}

${description}

Browse the articles below to learn more about this topic.
`;
        
        await fs.writeFile(indexPath, indexContent);
        console.log(`✓ Created index for: ${folder}`);
      }
    }
  }

  async cleanupEmptyFolders() {
    console.log('\n🧹 Cleaning up empty folders...');
    
    const oldFolders = ['getting-started', 'quiz', 'forms', 'competitions', 'coaching', 'reports', 'kpi-gamification', 'surveys', 'users', 'smartpath'];
    
    for (const folder of oldFolders) {
      const folderPath = path.join(this.docsDir, folder);
      
      if (await fs.pathExists(folderPath)) {
        const files = await fs.readdir(folderPath);
        const mdFiles = files.filter(file => file.endsWith('.md') && file !== 'index.md');
        
        if (mdFiles.length === 0) {
          await fs.remove(folderPath);
          console.log(`✓ Removed empty folder: ${folder}`);
        } else {
          console.log(`⚠️  Folder ${folder} still has ${mdFiles.length} articles`);
        }
      }
    }
  }

  async generateReport() {
    console.log('\n📋 Generating reorganization report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      folders: {},
      summary: {}
    };

    const newFolders = Object.keys(this.reorganizationMap);
    
    for (const folder of newFolders) {
      const folderPath = path.join(this.docsDir, folder);
      
      if (await fs.pathExists(folderPath)) {
        const files = await fs.readdir(folderPath);
        const mdFiles = files.filter(file => file.endsWith('.md') && file !== 'index.md');
        report.folders[folder] = {
          count: mdFiles.length,
          files: mdFiles
        };
      }
    }

    report.summary = {
      totalFolders: Object.keys(report.folders).length,
      totalArticles: Object.values(report.folders).reduce((sum, folder) => sum + folder.count, 0)
    };

    const reportPath = path.join(__dirname, 'reorganization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ Report saved to:', reportPath);
    console.log(`📊 New structure: ${report.summary.totalFolders} folders, ${report.summary.totalArticles} articles`);
    
    return report;
  }

  async run() {
    console.log('🚀 Starting docs reorganization...\n');
    
    try {
      await this.createBackup();
      await this.createNewFolderStructure();
      await this.moveArticles();
      await this.createIndexFiles();
      await this.cleanupEmptyFolders();
      const report = await this.generateReport();
      
      console.log('\n🎉 Reorganization completed successfully!');
      console.log('\n📁 New folder structure:');
      Object.entries(report.folders).forEach(([folder, data]) => {
        console.log(`  ${folder}: ${data.count} articles`);
      });
      
    } catch (error) {
      console.error('💥 Reorganization failed:', error.message);
      process.exit(1);
    }
  }
}

// Run reorganization if called directly
if (require.main === module) {
  const reorganizer = new DocsReorganizer();
  reorganizer.run().catch(console.error);
}

module.exports = DocsReorganizer;