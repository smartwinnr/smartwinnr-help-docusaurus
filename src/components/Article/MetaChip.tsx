import React from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

/**
 * "≈ 3 min read · Updated 2026-06-12"
 *
 * Reading minutes is passed in by the DocItem/Content swizzle, which counts
 * words in the live `.markdown` subtree after MDX has rendered (the docs
 * plugin doesn't emit readingTime - that's blog-only). Last-updated comes
 * from frontmatter; falls back to git-derived metadata.lastUpdatedAt if
 * frontmatter doesn't set it.
 */

type Props = {
  minutes?: number | null;
};

export default function MetaChip({minutes}: Props): JSX.Element | null {
  const {metadata, frontMatter} = useDoc();
  const fm = frontMatter as {
    last_update?: {date?: string};
  };

  // YAML parses `date: 2025-03-10` as a Date object; ISO strings stay strings.
  // Normalize both to YYYY-MM-DD so the chip reads consistently.
  function toIsoDate(v: unknown): string {
    if (!v) return '';
    if (v instanceof Date && !Number.isNaN(v.getTime())) {
      return v.toISOString().slice(0, 10);
    }
    if (typeof v === 'string') {
      // Already a "2025-03-10" or "2025-03-10T00:00:00.000Z" - strip the time half.
      const iso = /^\d{4}-\d{2}-\d{2}/.exec(v);
      if (iso) return iso[0];
      // Last resort - let Date parse it.
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
    }
    return '';
  }

  let updated = toIsoDate(fm.last_update && fm.last_update.date);
  if (!updated) {
    const epoch = (metadata as {lastUpdatedAt?: number}).lastUpdatedAt;
    if (typeof epoch === 'number' && Number.isFinite(epoch) && epoch > 0) {
      updated = new Date(epoch * 1000).toISOString().slice(0, 10);
    }
  }

  const parts: string[] = [];
  if (typeof minutes === 'number' && minutes > 0) {
    parts.push(`≈ ${minutes} min read`);
  }
  if (updated) parts.push(`Updated ${updated}`);
  if (parts.length === 0) return null;

  return <div className={styles.metaChip}>{parts.join(' · ')}</div>;
}
