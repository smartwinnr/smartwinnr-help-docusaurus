// Custom markdownlint rules for SmartWinnr Help Documentation Style Guide

module.exports = [
  {
    "names": ["action-oriented-titles"],
    "description": "H1 titles should start with action verbs",
    "tags": ["style-guide", "headings"],
    "function": function actionOrientedTitles(params, onError) {
      const actionVerbs = [
        'add', 'create', 'upload', 'download', 'configure', 'set', 'enable', 
        'disable', 'activate', 'deactivate', 'manage', 'view', 'edit', 'delete',
        'remove', 'install', 'update', 'reset', 'change', 'customize', 'assign',
        'submit', 'approve', 'reject', 'track', 'monitor', 'analyze', 'review',
        'share', 'send', 'receive', 'import', 'export', 'connect', 'disconnect',
        'access', 'login', 'logout', 'register', 'verify', 'validate', 'fix',
        'troubleshoot', 'resolve', 'solve', 'understand', 'learn', 'explore'
      ];
      
      const overviewWords = ['what', 'overview', 'about', 'introduction', 'guide'];
      
      params.tokens.filter(token => token.tag === "h1").forEach(heading => {
        if (!heading.children) return; // Skip if no children
        const title = heading.children
          .filter(child => child && child.type === "text")
          .map(child => child.content.toLowerCase().trim())
          .join(" ");
        
        const firstWord = title.split(' ')[0];
        const isActionOriented = actionVerbs.includes(firstWord);
        const isOverview = overviewWords.some(word => title.includes(word));
        
        // Allow overview-style titles for feature introductions
        if (!isActionOriented && !isOverview) {
          onError({
            lineNumber: heading.lineNumber,
            detail: `Title should start with an action verb or be an overview. Current: "${title}". Consider: "Create...", "Upload...", "Configure...", etc.`,
            context: title
          });
        }
      });
    }
  },
  {
    "names": ["ui-element-formatting"],
    "description": "UI elements (buttons, menus) should be bold",
    "tags": ["style-guide", "formatting"],
    "function": function uiElementFormatting(params, onError) {
      const uiPattern = /\b(click|select|choose|navigate|go to|press)\s+([a-zA-Z\s]+)(?:\s+(?:button|menu|tab|option|field|link))/gi;
      
      params.tokens.forEach(token => {
        if (token.type === "paragraph_open") {
          const paragraph = params.lines[token.lineNumber - 1];
          let match;
          
          while ((match = uiPattern.exec(paragraph)) !== null) {
            const uiElement = match[2].trim();
            // Check if UI element is already bold (surrounded by **)
            if (!paragraph.includes(`**${uiElement}**`)) {
              onError({
                lineNumber: token.lineNumber,
                detail: `UI element "${uiElement}" should be bold. Use: **${uiElement}**`,
                context: match[0]
              });
            }
          }
        }
      });
    }
  },
  {
    "names": ["positive-framing"],
    "description": "Use positive framing instead of negative",
    "tags": ["style-guide", "tone"],
    "function": function positiveFraming(params, onError) {
      const negativePatterns = [
        { pattern: /don't forget to/gi, suggestion: "Remember to" },
        { pattern: /can't/gi, suggestion: "cannot" },
        { pattern: /won't/gi, suggestion: "will not" },
        { pattern: /shouldn't/gi, suggestion: "should not" },
        { pattern: /don't/gi, suggestion: "do not" }
      ];
      
      params.tokens.forEach(token => {
        if (token.type === "paragraph_open" || token.type === "list_item_open") {
          const line = params.lines[token.lineNumber - 1];
          
          negativePatterns.forEach(({ pattern, suggestion }) => {
            if (pattern.test(line)) {
              onError({
                lineNumber: token.lineNumber,
                detail: `Use positive framing. Consider: "${suggestion}" instead of the negative form.`,
                context: line.trim()
              });
            }
          });
        }
      });
    }
  },
  {
    "names": ["american-english"],
    "description": "Use American English spelling",
    "tags": ["style-guide", "spelling"],
    "function": function americanEnglish(params, onError) {
      const britishToAmerican = {
        'customise': 'customize',
        'customised': 'customized',
        'customising': 'customizing',
        'organise': 'organize',
        'organised': 'organized',
        'organising': 'organizing',
        'realise': 'realize',
        'realised': 'realized',
        'realising': 'realizing',
        'colour': 'color',
        'colours': 'colors',
        'centre': 'center',
        'centres': 'centers'
      };
      
      params.tokens.forEach(token => {
        if (token.type === "text" || token.type === "code_inline") {
          const text = token.content.toLowerCase();
          
          Object.entries(britishToAmerican).forEach(([british, american]) => {
            if (text.includes(british)) {
              onError({
                lineNumber: token.lineNumber,
                detail: `Use American English spelling: "${american}" instead of "${british}"`,
                context: token.content
              });
            }
          });
        }
      });
    }
  },
  {
    "names": ["short-sentences"],
    "description": "Keep sentences under 20 words for clarity",
    "tags": ["style-guide", "readability"],
    "function": function shortSentences(params, onError) {
      params.tokens.forEach(token => {
        if (token.type === "paragraph_open") {
          const paragraph = params.lines[token.lineNumber - 1];
          const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 0);
          
          sentences.forEach(sentence => {
            const wordCount = sentence.trim().split(/\s+/).length;
            if (wordCount > 20) {
              onError({
                lineNumber: token.lineNumber,
                detail: `Sentence has ${wordCount} words. Consider breaking into shorter sentences (aim for 15-20 words max).`,
                context: sentence.trim().substring(0, 50) + "..."
              });
            }
          });
        }
      });
    }
  },
  {
    "names": ["no-decorative-emojis"],
    "description": "Prohibit decorative emojis in enterprise documentation",
    "tags": ["style-guide", "emojis"],
    "function": function noDecorativeEmojis(params, onError) {
      // Common decorative emoji patterns that should be excluded from enterprise docs
      const emojiPattern = /[\u{1F300}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu;
      
      // Specific common decorative emojis to catch
      const specificEmojis = [
        '🚀', '📝', '📋', '📚', '📊', '📈', '🏆', '🎯', '👑', '📱', '🆘', '🧠', '🛤️',
        '✨', '🌟', '🔥', '⭐️', '👍', '✅', '⚡️', '🎉', '💡', '🔧', '⚙️', '🎨', '📌',
        '💫', '🌈', '🚩', '📢', '📣', '🔔', '💬', '💭', '💡', '🎪', '🎨', '🔍', '🔎',
        '📝', '📄', '📃', '📑', '📜', '📋', '📊', '📈', '📉', '📦', '📧', '📨', '📩',
        '⏰', '🕒', '⏱️', '⏳', '⌚', '🔗', '🌐', '💾', '💻', '🖥️', '⌨️', '🖱️', '🔌'
      ];
      
      params.tokens.forEach(token => {
        if (token.type === "text" || token.type === "heading_open" || token.type === "paragraph_open") {
          let content = '';
          
          // Get the actual text content
          if (token.type === "text") {
            content = token.content;
          } else if (token.lineNumber && params.lines[token.lineNumber - 1]) {
            content = params.lines[token.lineNumber - 1];
          }
          
          // Check for emoji patterns
          const emojiMatches = content.match(emojiPattern);
          if (emojiMatches) {
            emojiMatches.forEach(emoji => {
              onError({
                lineNumber: token.lineNumber || 1,
                detail: `Decorative emoji "${emoji}" found. Remove all decorative emojis from enterprise documentation for professional appearance.`,
                context: content.substring(Math.max(0, content.indexOf(emoji) - 20), content.indexOf(emoji) + 20)
              });
            });
          }
          
          // Check for specific emojis that might be missed by Unicode ranges
          specificEmojis.forEach(emoji => {
            if (content.includes(emoji)) {
              onError({
                lineNumber: token.lineNumber || 1,
                detail: `Decorative emoji "${emoji}" found. Remove all decorative emojis from enterprise documentation for professional appearance.`,
                context: content.substring(Math.max(0, content.indexOf(emoji) - 20), content.indexOf(emoji) + 20)
              });
            }
          });
        }
      });
    }
  },
  {
    // MD-SW-001 — articles under docs/modules/<module>/ must live in the
    // module root (overview.md / quickstart.md) or in one of the 8 canonical
    // sub-folders. See plans/help-menu-redesign.md §5.
    "names": ["MD-SW-001", "module-sub-section-placement"],
    "description": "Article must live in a canonical module sub-folder",
    "tags": ["smartwinnr", "ia"],
    "function": function moduleSubSectionPlacement(params, onError) {
      const ALLOWED_ROOT_FILES = new Set(['overview.md', 'quickstart.md', 'index.md']);
      const ALLOWED_SUBDIRS = new Set([
        'for-learners',
        'for-managers',
        'create-and-manage',
        'assign-and-schedule',
        'features',
        'reports-and-analytics',
        'settings-and-permissions',
        'best-practices',
        'faqs-and-troubleshooting',
      ]);

      const filePath = (params.name || '').replace(/\\/g, '/');
      // Only enforce inside docs/modules/<module>/
      const m = /\/docs\/modules\/[^/]+\/(.*)$/.exec(filePath);
      if (!m) return;
      const tail = m[1]; // e.g. "create-and-manage/foo.md" or "overview.md"
      const parts = tail.split('/');

      if (parts.length === 1) {
        if (!ALLOWED_ROOT_FILES.has(parts[0])) {
          onError({
            lineNumber: 1,
            detail:
              `Article "${parts[0]}" at module root is not allowed. ` +
              `Either rename to overview.md/quickstart.md or move into one of: ` +
              `${[...ALLOWED_SUBDIRS].join(', ')}.`,
          });
        }
        return;
      }

      if (!ALLOWED_SUBDIRS.has(parts[0])) {
        onError({
          lineNumber: 1,
          detail:
            `Sub-folder "${parts[0]}" is not a canonical module sub-section. ` +
            `Allowed: ${[...ALLOWED_SUBDIRS].join(', ')}.`,
        });
      }
    }
  },
  {
    // MD-SW-002 — articles must declare a non-empty `description:` in
    // frontmatter. Used by SEO, preview cards, and chatbot grounding.
    // See STYLE.md.
    "names": ["MD-SW-002", "description-required"],
    "description": "Frontmatter must include a non-empty description",
    "tags": ["smartwinnr", "frontmatter"],
    "function": function descriptionRequired(params, onError) {
      const lines = params.lines || [];
      if (lines.length === 0 || lines[0].trim() !== '---') return;
      let endIdx = -1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '---') { endIdx = i; break; }
      }
      if (endIdx === -1) return;
      const fm = lines.slice(1, endIdx);
      let found = false;
      for (const line of fm) {
        const m = /^description\s*:\s*(.*)$/.exec(line);
        if (m) {
          const v = m[1].trim().replace(/^["']|["']$/g, '');
          if (v && v.length > 0) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        onError({
          lineNumber: 1,
          detail: 'Article frontmatter is missing a non-empty `description:`. See STYLE.md.',
        });
      }
    }
  },
  {
    // MD-SW-003 — every image must have non-empty, non-filename-derived
    // alt text. See STYLE.md (Screenshots section).
    "names": ["MD-SW-003", "alt-text-required"],
    "description": "Image must have semantic alt text",
    "tags": ["smartwinnr", "accessibility"],
    "function": function altTextRequired(params, onError) {
      const lines = params.lines || [];
      const re = /!\[([^\]]*)\]\(([^)]+)\)/g;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        let m;
        while ((m = re.exec(line)) !== null) {
          const alt = (m[1] || '').trim();
          if (!alt) {
            onError({
              lineNumber: i + 1,
              detail: 'Image is missing alt text. See STYLE.md (Screenshots).',
            });
            continue;
          }
          // Reject filename-derived alt: matches `slug-1` or `name.png`
          if (/^[a-z0-9-]+(\.[a-z]+)?$/.test(alt)) {
            onError({
              lineNumber: i + 1,
              detail: `Image alt "${alt}" looks filename-derived. Rewrite it as a one-sentence description.`,
            });
          }
        }
      }
    }
  }
];