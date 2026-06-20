import React from 'react';
import Link from '@docusaurus/Link';
import type {LucideIcon} from 'lucide-react';
import {BookText, MessageCircle, LifeBuoy, ScrollText} from 'lucide-react';
import styles from './styles.module.css';

type Item = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  /** Either an href (string) or a custom onClick action. */
  href?: string;
  onClick?: () => void;
};

function openChatbot(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('smartwinnr:open-chatbot'));
}

const ITEMS: Item[] = [
  {href: '/reference/',                    Icon: BookText,      title: 'Glossary & reference', desc: 'Roles, privileges, terminology'},
  {onClick: openChatbot,                   Icon: MessageCircle, title: 'Ask Wynnie',           desc: 'Grounded in this help center'},
  {href: 'mailto:support@smartwinnr.com',  Icon: LifeBuoy,      title: 'Open a support ticket', desc: 'Reach SmartWinnr support'},
  {href: '/release-notes/',                Icon: ScrollText,    title: 'Release notes',        desc: 'All product updates'},
];

function TitleWithIcon({Icon, title}: {Icon: LucideIcon; title: string}): JSX.Element {
  return (
    <strong style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
      <Icon size={16} strokeWidth={2} style={{color: 'var(--ifm-color-primary-darker)', flexShrink: 0}} />
      {title}
    </strong>
  );
}

export default function HelpFooter(): JSX.Element {
  return (
    <section className={styles.section}>
      <h2>Need more help?</h2>
      <div className={styles.helpFooter}>
        {ITEMS.map((it) =>
          it.onClick ? (
            <button
              key={it.title}
              type="button"
              className={styles.hfCard}
              onClick={it.onClick}
              style={{textAlign: 'left', cursor: 'pointer', font: 'inherit', border: '1px solid #e4e8ee'}}>
              <TitleWithIcon Icon={it.Icon} title={it.title} />
              <div className={styles.desc}>{it.desc}</div>
            </button>
          ) : (
            <Link key={it.href} to={it.href!} className={styles.hfCard}>
              <TitleWithIcon Icon={it.Icon} title={it.title} />
              <div className={styles.desc}>{it.desc}</div>
            </Link>
          ),
        )}
      </div>
    </section>
  );
}
