'use strict';

const mjml = require('mjml');

// Compile MJML template at module load time for performance
const mjmlTemplate = `
<mjml>
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Arial, Helvetica, sans-serif" />
      <mj-text font-size="14px" color="#333333" line-height="1.6" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f4f4f7">
    <mj-section padding="20px 0">
      <mj-column>
        <mj-text align="center" font-size="24px" font-weight="bold" color="#4A154B">
          SmartWinnr Help Center
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section background-color="#ffffff" border-radius="8px" padding="30px">
      <mj-column>
        <mj-text font-size="18px" font-weight="bold" padding-bottom="10px">
          Sign in to SmartWinnr Help
        </mj-text>
        <mj-text>
          Click the button below to sign in to the SmartWinnr Help Center. This link will expire in 15 minutes.
        </mj-text>
        <mj-button background-color="#4A154B" color="#ffffff" font-size="16px" padding="20px 0" href="{{MAGIC_LINK_URL}}">
          Sign In
        </mj-button>
        <mj-text font-size="12px" color="#888888">
          If you didn't request this link, you can safely ignore this email.
        </mj-text>
        <mj-divider border-color="#eeeeee" padding="15px 0" />
        <mj-text font-size="11px" color="#aaaaaa">
          If the button doesn't work, copy and paste this URL into your browser:
        </mj-text>
        <mj-text font-size="11px" color="#4A154B" word-break="break-all">
          {{MAGIC_LINK_URL}}
        </mj-text>
      </mj-column>
    </mj-section>

    <mj-section padding="15px 0">
      <mj-column>
        <mj-text align="center" font-size="11px" color="#999999">
          SmartWinnr Inc. — This is an automated message.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
`;

// Pre-compile the MJML to HTML (with placeholder)
const compiledHtmlTemplate = mjml(mjmlTemplate).html;

/**
 * Render the magic link email with the given URL.
 * Returns { html, text }.
 */
function renderMagicLinkEmail(magicLinkUrl) {
  const html = compiledHtmlTemplate.replace(/\{\{MAGIC_LINK_URL\}\}/g, magicLinkUrl);

  const text = [
    'Sign in to SmartWinnr Help Center',
    '',
    'Click the link below to sign in. This link will expire in 15 minutes.',
    '',
    magicLinkUrl,
    '',
    "If you didn't request this link, you can safely ignore this email.",
  ].join('\n');

  return { html, text };
}

module.exports = { renderMagicLinkEmail };
