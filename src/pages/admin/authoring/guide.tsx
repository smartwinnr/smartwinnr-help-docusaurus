import React, {type ReactNode} from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Link from '@docusaurus/Link';
import {useCurrentUser} from '@site/src/contexts/UserContext';
import PersistenceStatus from '@site/src/components/admin/authoring/PersistenceStatus';
import styles from './styles.module.css';

/**
 * Authoring guide - `/admin/authoring/guide`.
 *
 * Static reference for editors: how content is persisted, the
 * draft → publish → deploy lifecycle, writing best practices, and
 * what the status banners mean. Superadmin only, same shell as the
 * other authoring pages.
 */

function GuidePage(): ReactNode {
  const user = useCurrentUser();

  if (!(user.roles || []).includes('superadmin')) {
    return (
      <div className={styles.wrap}>
        <h1>Authoring guide</h1>
        <p>You don't have access to this page.</p>
        <p><Link to="/">← Back to the homepage</Link></p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1>Authoring guide <PersistenceStatus /></h1>
          <p className={styles.subhead}>
            How your work is saved, published, and deployed.{' '}
            <Link to="/admin/authoring">New article →</Link>{' · '}
            <Link to="/admin/authoring/drafts">Authoring queue →</Link>
          </p>
        </div>
      </header>

      <div className={styles.preview}>
        <h2>How your work is saved</h2>
        <p>Your content lives at four levels. Each level survives more than the last:</p>
        <table>
          <thead>
            <tr><th>Level</th><th>When it happens</th><th>What it survives</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>In this browser</td>
              <td>As you type (the wizard autosaves your inputs locally — one article at a time, so don't draft in two tabs at once)</td>
              <td>A page reload — but not clearing the browser or switching devices</td>
            </tr>
            <tr>
              <td>On the server</td>
              <td>When you press <strong>Save</strong></td>
              <td>Closing your browser — but not a server restart</td>
            </tr>
            <tr>
              <td>Backed up to git</td>
              <td>Automatically, seconds after any save or upload</td>
              <td>Everything, including server restarts and redeploys</td>
            </tr>
            <tr>
              <td>Live on the help site</td>
              <td>After you <strong>Publish</strong> and the next deploy runs</td>
              <td>This is the published state readers see</td>
            </tr>
          </tbody>
        </table>
        <p>
          The pill in the header of every authoring page shows the git-backup state:
        </p>
        <ul>
          <li><strong>Backed up ✓</strong> — everything you saved is committed to git. Safe to close the tab.</li>
          <li><strong>Backing up…</strong> — your latest save is on its way. It usually completes within ~10 seconds.</li>
          <li><strong>Backup failing</strong> — your saves exist on the server only; a restart could lose them. Keep the tab open, copy your text somewhere safe, and tell an admin.</li>
          <li><strong>Server only</strong> — git backup is not enabled on this server. Published changes still reach git when a deploy runs; unsaved drafts depend on the server staying up.</li>
        </ul>

        <h2>Draft → Publish → Deploy</h2>
        <ol>
          <li><strong>Draft.</strong> Saving in the wizard creates a draft. Drafts are invisible to readers — they never appear on the production site.</li>
          <li><strong>Publish.</strong> Publishing from the <Link to="/admin/authoring/drafts">Authoring queue</Link> marks the article live and adds it to the deploy queue.</li>
          <li><strong>Deploy.</strong> Queued changes ship in batches: about 30 minutes after the last publish, and at most once per hour. <strong>Deploy now</strong> on the queue page skips the wait (still limited to once per hour). After the deploy, the site rebuilds for a few minutes before readers see the change.</li>
        </ol>
        <p>
          Publishing several articles in one sitting is ideal — they batch into a single deploy.
          You can watch the queue and cancel a pending publish on the{' '}
          <Link to="/admin/authoring/drafts">Authoring queue</Link> page.
        </p>

        <h2>Writing best practices</h2>
        <ul>
          <li>One task per article. If your draft explains two procedures, split it.</li>
          <li>Start with the <strong>At a glance</strong> summary the wizard generates — readers scan before they read.</li>
          <li>American English, active voice, sentences under 20 words.</li>
          <li>Bold every UI element the reader clicks or opens: <strong>Save</strong>, <strong>Questions view</strong>, <strong>Pool Management</strong>.</li>
          <li>The audit panel is not an obstacle — it checks the same rules as this list. Fix blockers rather than working around them.</li>
          <li>Pick the sub-folder deliberately: it decides who can see the article (learners, managers, or editors/admins).</li>
        </ul>

        <h2>Images</h2>
        <ul>
          <li>Always add screenshots with the <strong>Upload</strong> button. Never paste image URLs from other sites — they break when the source moves.</li>
          <li>Uploaded images are backed up and deployed together with the article automatically.</li>
          <li>Deleting an article also cleans up images no other article uses.</li>
        </ul>

        <h2>Moving, renaming, deleting</h2>
        <ul>
          <li>Use the queue's <strong>Move</strong> action to relocate an article, the raw editor to change a slug, and the queue's <strong>Delete</strong> action to remove one.</li>
          <li>These actions maintain URL redirects automatically, so links readers bookmarked keep working.</li>
          <li>Deleted articles (and their images) are kept on the server for 30 days — an admin can recover an accidental delete from the trash.</li>
          <li>Never ask for files to be moved or edited directly in the git repository — that bypasses the redirect and audit safety nets.</li>
        </ul>

        <h2>If you see a warning banner</h2>
        <ul>
          <li><strong>Git backup is failing</strong> — your work is not durable yet. Keep your tab open, copy long text out, and contact an admin (usually an expired GitHub token).</li>
          <li><strong>The last deploy was blocked</strong> — something in the queued batch would break the site build. The banner lists the exact problems; fix the named articles and press <strong>Deploy now</strong> again. Nothing was lost.</li>
          <li><strong>Restore conflicts</strong> — after a server restart, a file had changed in two places at once. The authored version was kept; review the listed articles to confirm they look right.</li>
          <li><strong>Deploy now says rate-limited</strong> — a deploy ran within the last hour. Wait for the shown time and retry; your queue is safe meanwhile.</li>
          <li><strong>"Someone else changed this article"</strong> on Save — another editor saved a newer version while you were editing. Review their version from the queue before deciding; saving again overwrites it with yours.</li>
        </ul>

        <h2>Please don't</h2>
        <ul>
          <li>Don't push to the <code>authoring-wip</code> git branch — it's machine-owned and gets overwritten automatically.</li>
          <li>Don't edit published articles directly in the repository — use the wizard or raw editor so audits, redirects, and backups all apply.</li>
          <li>Don't keep work only in your browser overnight — press <strong>Save</strong> and check the pill says <strong>Backed up ✓</strong>.</li>
        </ul>
      </div>
    </div>
  );
}

export default function AuthoringGuidePage(): ReactNode {
  return (
    <Layout title="Authoring guide - Admin" description="How authoring content is saved, published, and deployed.">
      <BrowserOnly fallback={<div className={styles.wrap}><p>Loading…</p></div>}>
        {() => <GuidePage />}
      </BrowserOnly>
    </Layout>
  );
}
