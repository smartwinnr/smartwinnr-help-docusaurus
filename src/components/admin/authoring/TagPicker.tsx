import React, {useState, type ReactNode} from 'react';
import {TAG_VOCAB} from '@site/src/lib/authoring';
import styles from '@site/src/pages/admin/authoring/styles.module.css';

/**
 * Tag editor shared by the wizard (index.tsx) and the unified editor
 * (edit.tsx). Controlled via {tags, onChange} so it works with either a
 * reducer (wizard) or plain state / frontmatter write-through (editor).
 * Enforces the 1-5 tag, lowercase-dash format rules.
 */
export function TagPicker({
  tags,
  onChange,
  disabled = false,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}): ReactNode {
  const [customTag, setCustomTag] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);

  function addTag(t: string) {
    const tag = t.trim().toLowerCase();
    if (!tag) return;
    if (!/^[a-z][a-z0-9-]{0,30}$/.test(tag)) {
      setTagError('Tags use lowercase letters, digits, and dashes only (e.g. ai-coaching).');
      return;
    }
    if (tags.includes(tag)) {
      setTagError(`"${tag}" is already added.`);
      return;
    }
    if (tags.length >= 5) {
      setTagError('Maximum 5 tags. Remove one first.');
      return;
    }
    setTagError(null);
    onChange([...tags, tag]);
  }

  function removeTag(t: string) {
    onChange(tags.filter((x) => x !== t));
    setTagError(null);
  }

  const availableVocab = TAG_VOCAB.filter((t) => !tags.includes(t));
  const tagsRequired = tags.length === 0;

  return (
    <div className={styles.field}>
      <label>
        Tags <span className={styles.required}>· at least 1 required</span>{' '}
        <span className={styles.hint}>({tags.length}/5)</span>
      </label>

      {tags.length > 0 && (
        <div className={styles.tagRow}>
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.tagOn}
              disabled={disabled}
              onClick={() => removeTag(t)}
              title="Remove tag">
              {t} <span className={styles.tagRemove}>×</span>
            </button>
          ))}
        </div>
      )}

      {availableVocab.length > 0 && tags.length < 5 && (
        <>
          <span className={styles.hint}>Pick from common tags:</span>
          <div className={styles.tagRow}>
            {availableVocab.map((t) => (
              <button
                key={t}
                type="button"
                className={styles.tagOff}
                disabled={disabled}
                onClick={() => addTag(t)}>
                + {t}
              </button>
            ))}
          </div>
        </>
      )}

      {tags.length < 5 && (
        <div className={styles.tagAddRow}>
          <input
            type="text"
            value={customTag}
            placeholder="Or create a new tag (e.g. event-quiz)"
            maxLength={32}
            disabled={disabled}
            onChange={(e) => { setCustomTag(e.target.value); setTagError(null); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag(customTag);
                setCustomTag('');
              }
            }}
          />
          <button
            type="button"
            className={styles.btnGhost}
            disabled={disabled || !customTag.trim()}
            onClick={() => { addTag(customTag); setCustomTag(''); }}>
            Add
          </button>
        </div>
      )}

      {tagError && <span className={styles.warn}>{tagError}</span>}
      {tagsRequired && !tagError && (
        <span className={styles.warn}>At least one tag is required.</span>
      )}
    </div>
  );
}
