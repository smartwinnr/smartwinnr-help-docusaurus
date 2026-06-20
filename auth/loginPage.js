'use strict';

/**
 * Returns a self-contained HTML login page (inline CSS + inline SVGs, no
 * external JS deps). The Lambda URL is injected server-side so the browser
 * fetches directly to Lambda.
 *
 * Layout: branded SmartWinnr wordmark + sign-in card on top, followed by a
 * marketing strip of five product-pillar tiles, social-proof line, and a
 * soft outbound link to smartwinnr.com. The strip is an adoption play:
 * customers who only license Quiz see one tile telling them AI Coaching
 * improves roleplay scores 33%, learn the language, ask their admin.
 *
 * When `isDev` is true (process.env.NODE_ENV !== 'production'), a small
 * "DEV: switch to → role × 6" strip renders below the sign-in card so
 * devs can one-click into any tier without the email round-trip.
 */
function renderLoginPage(lambdaUrl, errorMessage, isDev) {
  var devStrip = '';
  if (isDev) {
    var roles = ['user', 'manager', 'editor', 'admin', 'orgadmin', 'superadmin'];
    var bare = roles.map(function (r) {
      return '<a href="/auth/dev-login?role=' + r + '" class="devChip">' + r + '</a>';
    }).join('');
    var full = roles.map(function (r) {
      return '<a href="/auth/dev-login?role=' + r + '&privileges=*" class="devChip">' + r + '</a>';
    }).join('');
    devStrip =
      '<div class="devStrip">' +
        '<div><strong>DEV</strong> sign in as <em>(no privileges)</em> → ' + bare + '</div>' +
        '<div style="margin-top:8px;"><strong>DEV</strong> sign in as <em>(all privileges)</em> → ' + full + '</div>' +
      '</div>';
  }

  // Lucide stroke icons inlined. Shared <symbol>s declared once; each render
  // site is a tiny <svg><use href="#icon-…"/></svg>.
  var iconSymbols = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">
      <defs>
        <symbol id="icon-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
          <path d="M20 2v4"/><path d="M22 4h-4"/>
          <circle cx="4" cy="20" r="2"/>
        </symbol>
        <symbol id="icon-book-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 7v14"/>
          <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
        </symbol>
        <symbol id="icon-trophy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978"/>
          <path d="M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978"/>
          <path d="M18 9h1.5a1 1 0 0 0 0-5H18"/>
          <path d="M4 22h16"/>
          <path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/>
          <path d="M6 9H4.5a1 1 0 0 1 0-5H6"/>
        </symbol>
        <symbol id="icon-map-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
          <circle cx="12" cy="10" r="3"/>
        </symbol>
        <symbol id="icon-file-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/>
          <path d="M14 2v5a1 1 0 0 0 1 1h5"/>
          <path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>
        </symbol>
        <symbol id="icon-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <path d="M16 3.128a4 4 0 0 1 0 7.744"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <circle cx="9" cy="7" r="4"/>
        </symbol>
        <symbol id="icon-mic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19v3"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <rect x="9" y="2" width="6" height="13" rx="3"/>
        </symbol>
        <symbol id="icon-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>
        </symbol>
        <symbol id="icon-arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </symbol>
      </defs>
    </svg>`;

  function ic(name, cls) {
    return '<svg class="' + (cls || 'ic') + '" aria-hidden="true"><use href="#icon-' + name + '"/></svg>';
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In - SmartWinnr Help Center</title>
  <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
  <link rel="shortcut icon" href="/img/favicon.ico">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#6d28d9">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #8b5cf6;
      --primary-darker: #6d28d9;
      --primary-darkest: #5b21b6;
      --ink: #1a1a2e;
      --ink-soft: #4b5563;
      --muted: #6b7280;
      --line: #e5e7eb;
      --line-soft: #eef0f3;
      --bg: #f5f3ff;
      --card: #ffffff;
      --tile-bg: #ffffff;
      --tile-hover: #faf7ff;
      --shadow-md: 0 8px 24px rgba(76, 29, 149, 0.08), 0 2px 6px rgba(76, 29, 149, 0.04);
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-feature-settings: 'ss01', 'cv11';
      color: var(--ink);
      background:
        radial-gradient(900px 600px at 50% -10%, #ede9fe 0%, transparent 60%),
        var(--bg);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 56px 24px 64px;
    }

    /* Wordmark */
    .brand {
      display: flex; align-items: center; gap: 10px;
      color: var(--primary-darker);
      margin-bottom: 28px;
    }
    .brand .logo { height: 52px; width: auto; color: var(--primary-darker); }
    .brand .pill {
      font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
      color: var(--primary-darker); background: #ede9fe;
      padding: 3px 8px; border-radius: 999px; text-transform: uppercase;
    }

    /* Card */
    .card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: var(--shadow-md);
      padding: 36px 36px 32px;
      max-width: 420px;
      width: 100%;
    }
    .card h1 {
      font-size: 22px; font-weight: 700; letter-spacing: -0.01em;
      margin-bottom: 6px;
    }
    .card .subtitle {
      color: var(--ink-soft); font-size: 14px; line-height: 1.5;
      margin-bottom: 24px;
    }
    label {
      display: block; font-size: 12px; font-weight: 600;
      color: var(--ink); margin-bottom: 6px; letter-spacing: 0.01em;
    }
    input[type="email"] {
      width: 100%; padding: 11px 14px;
      border: 1px solid var(--line); border-radius: 8px;
      font: inherit; font-size: 15px; color: var(--ink);
      background: #fff; outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input[type="email"]:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.18);
    }
    button.primary {
      width: 100%; margin-top: 16px;
      padding: 12px 16px;
      background: var(--primary-darker);
      color: white; border: none; border-radius: 8px;
      font: inherit; font-size: 15px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, transform 0.05s;
    }
    button.primary:hover { background: var(--primary-darkest); }
    button.primary:active { transform: translateY(1px); }
    button.primary:disabled { background: #9ca3af; cursor: not-allowed; }
    .helper {
      margin-top: 18px; padding-top: 18px;
      border-top: 1px solid var(--line-soft);
      font-size: 12px; color: var(--muted); line-height: 1.55;
    }
    .message {
      margin-top: 14px; padding: 10px 12px;
      border-radius: 6px; font-size: 13px; text-align: center;
      display: none;
    }
    .message.success { display: block; background: #ecfdf5; color: #047857; }
    .message.error { display: block; background: #fef2f2; color: #b91c1c; }

    /* Tagline */
    .tagline {
      margin-top: 20px;
      font-size: 13px; color: var(--primary-darker);
      font-weight: 500; letter-spacing: 0.01em;
      text-align: center;
    }

    /* Marketing strip */
    .strip { width: 100%; max-width: 980px; margin-top: 56px; }
    .strip .heading {
      display: flex; align-items: center; gap: 14px;
      color: var(--muted);
      font-size: 11px; font-weight: 600;
      letter-spacing: 0.12em; text-transform: uppercase;
      margin-bottom: 18px;
    }
    .strip .heading::before,
    .strip .heading::after { content: ''; flex: 1; height: 1px; background: var(--line); }
    .pillars { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .tile {
      background: var(--tile-bg);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 18px 16px 16px;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .tile:hover {
      border-color: #ddd6fe;
      background: var(--tile-hover);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    .tile .ti {
      display: inline-flex; align-items: center; line-height: 1;
      color: var(--primary-darker);
      margin-bottom: 12px;
    }
    .tile .ti .ic { width: 22px; height: 22px; }
    .tile .stat {
      font-size: 18px; font-weight: 700; color: var(--ink);
      letter-spacing: -0.01em; line-height: 1.1;
    }
    .tile .stat .unit { color: var(--primary-darker); }
    .tile .label { margin-top: 4px; font-size: 13px; font-weight: 600; color: var(--ink); }
    .tile .desc { margin-top: 4px; font-size: 12px; color: var(--ink-soft); line-height: 1.45; }

    /* Social proof */
    .proof {
      max-width: 980px; width: 100%; margin-top: 22px;
      display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
      gap: 8px 18px;
      color: var(--muted); font-size: 12px;
    }
    .proof .item { display: inline-flex; align-items: center; gap: 6px; }
    .proof .item strong { color: var(--ink); font-weight: 600; }
    .proof .item .ic { width: 12px; height: 12px; color: var(--primary-darker); }
    .proof .sep { color: var(--line); }

    /* Outbound link */
    .more { margin-top: 28px; font-size: 13px; color: var(--muted); text-align: center; }
    .more a {
      color: var(--primary-darker); text-decoration: none; font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px;
    }
    .more a:hover { text-decoration: underline; }
    .more a .ic { width: 12px; height: 12px; }

    /* Dev strip (unchanged behaviour, restyled to match purple) */
    .devStrip {
      max-width: 760px; width: 100%;
      margin: 18px auto 0;
      padding: 10px 14px;
      background: #fffbeb;
      border: 1px dashed #f59e0b;
      border-radius: 8px;
      color: #92400e;
      font-size: 12px;
      text-align: center;
    }
    .devStrip strong {
      background: #f59e0b; color: white;
      font-size: 10px; letter-spacing: 0.06em;
      padding: 2px 6px; border-radius: 4px;
      margin-right: 6px; vertical-align: 1px;
    }
    .devChip {
      display: inline-block;
      margin: 4px 3px 0;
      padding: 2px 9px;
      background: white;
      color: #92400e;
      border: 1px solid #fcd34d;
      border-radius: 999px;
      text-decoration: none;
      font-weight: 600;
    }
    .devChip:hover { background: #fef3c7; border-color: #f59e0b; }

    /* Responsive */
    @media (max-width: 880px) {
      .pillars { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      body { padding: 32px 16px 40px; }
      .pillars { grid-template-columns: 1fr; }
      .strip { margin-top: 40px; }
      .card { padding: 28px 24px 26px; }
      .brand .logo { height: 42px; }
    }
  </style>
</head>
<body>
  ${iconSymbols}

  <!-- Wordmark: inlined SmartWinnr logo, recolored via currentColor -->
  <div class="brand">
    <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" aria-label="SmartWinnr" role="img">
      <g fill="currentColor">
        <path d="M225.2,183.3H51.9c-8.2,0-15,6.7-15,15v203.4c0,8.2,6.7,15,15,15h173.3c8.2,0,15-6.7,15-15v-203.4c0-8.2-6.7-15-15-15ZM158.5,207.5c14.6-8.4,33.3-3.4,41.7,11.2,8.4,14.6,3.4,33.3-11.2,41.7l-1.3.8c-8.7,4.1-19.3,4-28.3-1.2l-38.6-22.3c-3.2-1.9-3.2-6.5,0-8.3l37.8-21.8h0ZM113,387.8c-9,5.2-19.6,5.3-28.3,1.2l-1.3-.8c-14.6-8.4-19.6-27.1-11.2-41.7,8.4-14.6,27.1-19.6,41.7-11.2l37.8,21.8c3.2,1.9,3.2,6.5,0,8.3l-38.6,22.3h0ZM201,334.2h0c-8.4,14.6-27.2,19.6-41.8,11.2l-74.5-43c-14.6-8.4-19.6-27.2-11.2-41.8h0c8.4-14.6,27.2-19.6,41.8-11.2l74.5,43c14.6,8.4,19.6,27.2,11.2,41.8h0Z"/>
        <path d="M295.5,319.1c7.6,8.1,19.5,15.2,34.9,15.2s22.2-7.8,22.2-15.1-11.8-12.9-25.2-16.4c-18-4.5-39.2-9.8-39.2-33.1s16.1-32.3,40.2-32.3,31.1,5.5,41.4,15.4l-11.1,14.4c-8.6-8.6-20.4-12.6-31.9-12.6s-18.7,5.5-18.7,13.7,11.3,11.4,24.3,14.7c18.2,4.6,39.9,10.3,39.9,34.3s-12.9,34.1-42.7,34.1-35.1-7.1-44.8-17.5l10.8-14.9Z"/>
        <path d="M489.3,349.5v-52.1c0-8.6-3.8-14.4-13.1-14.4s-15.1,5.5-18.5,10.6v55.9h-17.4v-52.1c0-8.6-3.8-14.4-13.2-14.4s-14.7,5.5-18.4,10.8v55.8h-17.4v-79.9h17.4v10.9c3.3-5,13.9-12.9,26-12.9s19.2,6,21.8,14.7c4.6-7.3,15.2-14.7,27.1-14.7s23,7.9,23,24.2v57.8h-17.4Z"/>
        <path d="M579.6,349.5v-8.6c-6,6.8-15.2,10.6-25.8,10.6s-27.8-8.8-27.8-26.5,14.7-26,27.8-26,20,3.5,25.8,10.3v-11.9c0-9.3-7.6-14.9-18.7-14.9s-16.7,3.3-23.7,10.1l-7.1-12.1c9.3-8.8,20.9-12.9,33.6-12.9s33.3,7.4,33.3,29v53h-17.4ZM579.6,319.2c-4-5.5-11.4-8.3-19-8.3s-17,5.6-17,14.4,7.3,14.2,17,14.2,15.1-2.8,19-8.3v-12.1Z"/>
        <path d="M621.2,349.5v-79.9h17.4v11.8c6-7.6,15.6-13.6,26-13.6v17.2c-1.5-.3-3.3-.5-5.5-.5-7.3,0-17,5-20.5,10.6v54.4h-17.4Z"/>
        <path d="M683.7,331v-46.2h-13.2v-15.2h13.2v-21.8h17.4v21.8h16.2v15.2h-16.2v41.9c0,5.5,2.6,9.4,7.6,9.4s6.5-1.3,7.8-2.8l4.1,13.1c-3.1,3-8.3,5.1-16.4,5.1-13.4,0-20.5-7.3-20.5-20.5Z"/>
        <path d="M817.1,349.5l-21.5-81.4-21.3,81.4h-20.7l-31.6-110.4h21.7l21.5,85.1,22.8-85.1h15.4l22.8,85.1,21.3-85.1h21.7l-31.4,110.4h-20.7Z"/>
        <path d="M881.1,245.6c0-6,5-10.8,10.8-10.8s10.8,4.8,10.8,10.8-4.8,10.8-10.8,10.8-10.8-4.8-10.8-10.8ZM883.3,349.5v-79.9h17.4v79.9h-17.4Z"/>
        <path d="M978.8,349.5v-50c0-12.4-6.3-16.5-16.1-16.5s-16.5,5.3-20.5,10.8v55.8h-17.4v-79.9h17.4v10.9c5.3-6.3,15.6-12.9,28.1-12.9s25.8,9.3,25.8,25.7v56.3h-17.4Z"/>
        <path d="M1074.3,349.5v-50c0-12.4-6.3-16.5-16.1-16.5s-16.5,5.3-20.5,10.8v55.8h-17.4v-79.9h17.4v10.9c5.3-6.3,15.6-12.9,28.1-12.9s25.8,9.3,25.8,25.7v56.3h-17.4Z"/>
        <path d="M1115.8,349.5v-79.9h17.4v11.8c6-7.6,15.6-13.6,26-13.6v17.2c-1.5-.3-3.3-.5-5.5-.5-7.3,0-17,5-20.5,10.6v54.4h-17.4Z"/>
      </g>
    </svg>
    <span class="pill">Help Center</span>
  </div>

  <!-- Sign-in card -->
  <div class="card">
    <h1>Sign in</h1>
    <p class="subtitle">Use your SmartWinnr email. What you see inside is tailored to your role and your organization's enabled modules.</p>

    <form id="loginForm">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" placeholder="you@company.com" required autofocus>
      <button type="submit" id="submitBtn" class="primary">Send Sign-In Link</button>
    </form>

    <div id="msg" class="message"></div>

    <div class="helper">
      We'll email a one-time sign-in link. Open it on any device to sign in &dash; no password needed.
    </div>
    ${errorMessage ? `<div class="message error">${errorMessage}</div>` : ''}
  </div>

  ${devStrip}

  <div class="tagline">One Platform. Infinite Potential.</div>

  <!-- Marketing strip -->
  <section class="strip">
    <div class="heading">What you can do with SmartWinnr</div>
    <div class="pillars">
      <div class="tile">
        <span class="ti">${ic('sparkles')}</span>
        <div class="stat">+33<span class="unit">%</span></div>
        <div class="label">AI Roleplay</div>
        <div class="desc">Roleplay scores improve in just 3 attempts.</div>
      </div>
      <div class="tile">
        <span class="ti">${ic('book-open')}</span>
        <div class="stat">+70<span class="unit">%</span></div>
        <div class="label">Targeted LMS</div>
        <div class="desc">Higher knowledge retention vs. classroom.</div>
      </div>
      <div class="tile">
        <span class="ti">${ic('trophy')}</span>
        <div class="stat">+25<span class="unit">%</span></div>
        <div class="label">Gamification</div>
        <div class="desc">More rep participation in learning.</div>
      </div>
      <div class="tile">
        <span class="ti">${ic('map-pin')}</span>
        <div class="stat">500<span class="unit">+ hrs</span></div>
        <div class="label">Field Coaching</div>
        <div class="desc">Trainer hours saved every month.</div>
      </div>
      <div class="tile">
        <span class="ti">${ic('file-text')}</span>
        <div class="stat">90<span class="unit">%</span></div>
        <div class="label">Content Mgmt</div>
        <div class="desc">Field-messaging consistency.</div>
      </div>
    </div>
  </section>

  <!-- Social proof -->
  <div class="proof">
    <span class="item">${ic('users')}<strong>300,000+</strong> enterprise users</span>
    <span class="sep">·</span>
    <span class="item">${ic('mic')}<strong>1,000,000+</strong> AI coaching sessions</span>
    <span class="sep">·</span>
    <span class="item">${ic('star')}<strong>4.9</strong> on G2</span>
  </div>

  <!-- Outbound link -->
  <div class="more">
    Want to enable more modules in your org? <a href="https://smartwinnr.com/" target="_blank" rel="noopener">See what's possible on smartwinnr.com ${ic('arrow-right')}</a>
  </div>

  <script>
    var LAMBDA_URL = '${lambdaUrl}';
    var form = document.getElementById('loginForm');
    var msg = document.getElementById('msg');
    var btn = document.getElementById('submitBtn');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = document.getElementById('email').value.trim();
      if (!email) return;

      btn.disabled = true;
      btn.textContent = 'Sending...';
      msg.className = 'message';
      msg.style.display = 'none';

      fetch(LAMBDA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        msg.className = 'message success';
        msg.textContent = data.message || 'If this email is registered, you will receive a sign-in link shortly.';
        msg.style.display = 'block';
        btn.textContent = 'Link Sent';
      })
      .catch(function() {
        msg.className = 'message error';
        msg.textContent = 'Something went wrong. Please try again.';
        msg.style.display = 'block';
        btn.disabled = false;
        btn.textContent = 'Send Sign-In Link';
      });
    });
  </script>
</body>
</html>`;
}

module.exports = { renderLoginPage };
