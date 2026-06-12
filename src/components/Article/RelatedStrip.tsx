import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/**
 * Three sibling-article cards rendered at the bottom of every article.
 *
 * Selection rule (v1, mechanical):
 *   1. Read /article-graph.json (emitted by plugins/access-gate-emit.js).
 *   2. Find the current article's folder.
 *   3. Take the other articles in that folder, sort by sidebar_position,
 *      pick the 3 closest to the current article's position.
 *   4. Fall back to the parent folder if the current folder has <3 siblings.
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

function pickSiblings(graph: Graph, currentUrl: string): ArticleNode[] {
  const me = graph.articles.find((a) => a.url === currentUrl);
  if (!me) return [];

  // Same-folder candidates, sorted by position.
  let pool = graph.articles
    .filter((a) => a.folder === me.folder && a.url !== me.url)
    .sort((a, b) => a.position - b.position);

  // If we don't have 3, widen to the parent folder.
  if (pool.length < 3) {
    const parent = me.folder.split('/').slice(0, -1).join('/');
    if (parent) {
      const extras = graph.articles
        .filter(
          (a) =>
            a.folder.startsWith(parent + '/') &&
            a.folder !== me.folder &&
            a.url !== me.url,
        )
        .sort((a, b) => a.position - b.position);
      pool = pool.concat(extras);
    }
  }

  // Pick the 3 closest to my position.
  pool.sort(
    (a, b) =>
      Math.abs(a.position - me.position) - Math.abs(b.position - me.position),
  );
  return pool.slice(0, 3);
}

export default function RelatedStrip(): JSX.Element | null {
  const {metadata} = useDoc();
  const currentUrl = metadata?.permalink ?? '';
  const graphUrl = useBaseUrl('/article-graph.json');
  const [graph, setGraph] = useState<Graph | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(graphUrl, {credentials: 'same-origin'})
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (!cancelled && data) setGraph(data); })
      .catch(() => {/* fail soft */});
    return () => { cancelled = true; };
  }, [graphUrl]);

  if (!graph || !currentUrl) return null;
  const picks = pickSiblings(graph, currentUrl);
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
