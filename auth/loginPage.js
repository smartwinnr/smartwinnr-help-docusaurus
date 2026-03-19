'use strict';

/**
 * Returns a self-contained HTML login page (inline CSS, no external deps).
 * The Lambda URL is injected server-side so the browser fetches directly to Lambda.
 */
function renderLoginPage(lambdaUrl, errorMessage) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In — SmartWinnr Help Center</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f4f4f7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      padding: 40px;
      max-width: 420px;
      width: 100%;
      margin: 20px;
    }
    .logo {
      text-align: center;
      font-size: 22px;
      font-weight: 700;
      color: #4A154B;
      margin-bottom: 8px;
    }
    .subtitle {
      text-align: center;
      color: #666;
      font-size: 14px;
      margin-bottom: 28px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      margin-bottom: 6px;
    }
    input[type="email"] {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #d0d0d0;
      border-radius: 6px;
      font-size: 15px;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="email"]:focus {
      border-color: #4A154B;
    }
    button {
      width: 100%;
      padding: 12px;
      background: #4A154B;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 16px;
      transition: background 0.2s;
    }
    button:hover { background: #3a1040; }
    button:disabled { background: #999; cursor: not-allowed; }
    .message {
      margin-top: 16px;
      padding: 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      display: none;
    }
    .message.success { display: block; background: #e8f5e9; color: #2e7d32; }
    .message.error { display: block; background: #fbe9e7; color: #c62828; }
    .info {
      margin-top: 20px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">SmartWinnr Help Center</div>
    <div class="subtitle">Sign in with your SmartWinnr account</div>

    <form id="loginForm">
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" placeholder="you@company.com" required autofocus>
      <button type="submit" id="submitBtn">Send Sign-In Link</button>
    </form>

    <div id="msg" class="message"></div>

    <div class="info">
      Only editors and admins can access the Help Center.<br>
      A sign-in link will be sent to your email.
    </div>
    ${errorMessage ? `<div class="message error">${errorMessage}</div>` : ''}
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
