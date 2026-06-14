import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import {useCurrentUser, useUserState} from '@site/src/contexts/UserContext';
import {loadDocGates, isUrlAllowed, type DocGates} from '@site/src/lib/doc-gates';
import styles from './styles.module.css';

/**
 * Three sibling-article cards rendered at the bottom of every article.
 *
 * Selection (filtered by role + privilege):
 *   1. Read /article-graph.json (emitted by plugins/access-gate-emit.js).
 *   2. Drop every article the viewer can't open (same gate map +
 *      AND-of-all-prefixes logic the server URL guard uses - see
 *      src/lib/doc-gates.ts).
 *   3. From what survives: same-folder siblings first, then parent
 *      folder. Sort by sidebar_position distance from the current
 *      article and take the 3 nearest.
 *
 * Until both /api/me and /doc-gates.json resolve, render nothing - we
 * never leak inaccessible URLs into the SSR HTML or the first paint.
 */

type ArticleNode = {
  url: string;
  title: string;
  description?: string;
  folder: string;
  position: number;
  tags?: string[];
};

type Graph = {version: number; articles: ArticleNode[]};

// Audience-tier sub-folders inside a module. Learners stay with learners,
// editors stay with editors. Gate filtering alone is not enough because a
// multi-role user passes the gate for higher-tier content too - and "what's
// next" suggestions need to follow the AUDIENCE journey, not just whatever
// the viewer is technically allowed to open.
const LEARNER_SUBS = ['for-learners', 'overview', 'quickstart', 'faqs-and-troubleshooting'];
const MANAGER_SUBS = ['for-managers'];
const EDITOR_SUBS = [
  'create-and-manage',
  'assign-and-schedule',
  'features',
  'reports-and-analytics',
  'settings-and-permissions',
  'best-practices',
];

/**
 * For a /modules/<m>/<sub>/ folder, return the list of folders in the same
 * audience tier inside the same module. Returns null for folders outside
 * the modules tree (get-started, reference, guides, release-notes ...) so
 * the caller can fall back to the original parent-widening logic there.
 */
function audiencePeerFolders(currentFolder: string): string[] | null {
  const parts = currentFolder.split('/').filter(Boolean);
  if (parts[0] !== 'modules' || parts.length < 3) return null;
  const sub = parts[2];
  let group: string[] | null = null;
  if (LEARNER_SUBS.includes(sub)) group = LEARNER_SUBS;
  else if (MANAGER_SUBS.includes(sub)) group = MANAGER_SUBS;
  else if (EDITOR_SUBS.includes(sub)) group = EDITOR_SUBS;
  if (!group) return null;
  const moduleFolder = '/modules/' + parts[1];
  return group.map((s) => `${moduleFolder}/${s}`);
}

function pickSiblings(graph: Graph, currentUrl: string): ArticleNode[] {
  const me = graph.articles.find((a) => a.url === currentUrl);
  if (!me) return [];

  // Same-folder candidates first.
  let pool = graph.articles.filter(
    (a) => a.folder === me.folder && a.url !== me.url,
  );

  // If we don't have 3, widen by audience tier (within the same module).
  // Falls back to the original parent-widening for non-module articles.
  if (pool.length < 3) {
    const audPeers = audiencePeerFolders(me.folder);
    if (audPeers) {
      const extras = graph.articles.filter(
        (a) =>
          audPeers.includes(a.folder) &&
          a.folder !== me.folder &&
          a.url !== me.url,
      );
      pool = pool.concat(extras);
    } else {
      const parent = me.folder.split('/').slice(0, -1).join('/');
      if (parent) {
        const extras = graph.articles.filter(
          (a) =>
            a.folder.startsWith(parent + '/') &&
            a.folder !== me.folder &&
            a.url !== me.url,
        );
        pool = pool.concat(extras);
      }
    }
  }

  // Sort: same folder first (closest by position distance), then peers
  // (also by position distance). Without the same-folder bias, peer
  // articles whose position happens to match `me.position` would crowd
  // out genuine siblings.
  pool.sort((a, b) => {
    const aSame = a.folder === me.folder ? 0 : 1;
    const bSame = b.folder === me.folder ? 0 : 1;
    if (aSame !== bSame) return aSame - bSame;
    return (
      Math.abs(a.position - me.position) - Math.abs(b.position - me.position)
    );
  });
  return pool;
}

export default function RelatedStrip(): JSX.Element | null {
  const {metadata} = useDoc();
  const currentUrl = metadata?.permalink ?? '';
  const graphUrl = useBaseUrl('/article-graph.json');
  const user = useCurrentUser();
  const {loading: userLoading} = useUserState();
  const [graph, setGraph] = useState<Graph | null>(null);
  const [gates, setGates] = useState<DocGates | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(graphUrl, {credentials: 'same-origin'})
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data) setGraph(data); })
      .catch(() => {/* fail soft */});
    loadDocGates().then((g) => { if (!cancelled) setGates(g); });
    return () => { cancelled = true; };
  }, [graphUrl]);

  if (!graph || !currentUrl) return null;
  // Fail closed: if either gates or user is still resolving, show nothing.
  // Better blank than briefly leaking inaccessible siblings during hydration.
  if (userLoading || !gates) return null;

  const candidates = pickSiblings(graph, currentUrl);
  const picks = candidates
    .filter((p) => isUrlAllowed(gates, user, p.url))
    .slice(0, 3);

  if (picks.length === 0) return null;

  return (
    <section className={styles.related} aria-label="Related articles">
      <h2 className={styles.relatedHead}>What's next</h2>
      <div className={styles.relatedGrid}>
        {picks.map((p) => (
          <Link key={p.url} to={p.url} className={styles.relatedCard}>
            <strong>{p.title}</strong>
            {p.description && <span className={styles.relatedDesc}>{p.description}</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}
