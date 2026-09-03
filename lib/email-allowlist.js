'use strict';

/**
 * Who the release pipeline's owner-notify / author-welcome emails
 * (server.js: notifyExistingOwner, notifyNewAuthor) are allowed to reach.
 *
 * Anyone on the smartwinnr.com domain is allowed outright - that is the
 * whole point of the feature. Anyone else must be explicitly approved by
 * an admin first (see the approved_notify_emails table / the
 * /admin/approved-emails page), so a wrong or unexpected owner email
 * (a typo, a customer's address pulled in from somewhere unrelated)
 * can't silently receive an internal notification.
 */

const { getDb } = require('../db/chat-logger');

const ALLOWED_DOMAIN = 'smartwinnr.com';

function isCompanyDomain(email) {
  const e = String(email || '').trim().toLowerCase();
  return e.endsWith('@' + ALLOWED_DOMAIN);
}

function isEmailApproved(email) {
  const e = String(email || '').trim().toLowerCase();
  if (!e) return false;
  if (isCompanyDomain(e)) return true;
  const db = getDb();
  const row = db.prepare('SELECT 1 FROM approved_notify_emails WHERE email = ?').get(e);
  return !!row;
}

function listApprovedEmails() {
  const db = getDb();
  return db.prepare(`
    SELECT id, email, added_at, added_by
    FROM approved_notify_emails
    ORDER BY added_at DESC
  `).all();
}

/** Returns {ok, id, error}. */
function addApprovedEmail(email, addedBy) {
  const e = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false, error: 'Invalid email' };
  if (isCompanyDomain(e)) return { ok: false, error: `${e} is already allowed - it's on the ${ALLOWED_DOMAIN} domain` };
  const db = getDb();
  try {
    const info = db.prepare(`
      INSERT INTO approved_notify_emails (email, added_at, added_by)
      VALUES (?, ?, ?)
    `).run(e, new Date().toISOString(), addedBy || null);
    return { ok: true, id: info.lastInsertRowid };
  } catch (err) {
    if (/UNIQUE/i.test(err.message)) return { ok: false, error: `${e} is already approved` };
    return { ok: false, error: err.message };
  }
}

function removeApprovedEmail(id) {
  const db = getDb();
  const info = db.prepare('DELETE FROM approved_notify_emails WHERE id = ?').run(Number(id));
  return { ok: info.changes > 0, removed: info.changes };
}

module.exports = {
  ALLOWED_DOMAIN,
  isCompanyDomain,
  isEmailApproved,
  listApprovedEmails,
  addApprovedEmail,
  removeApprovedEmail,
};
