import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import {usePluralForm} from '@docusaurus/theme-common';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {translate} from '@docusaurus/Translate';
import {FolderOpen, FileText, ExternalLink} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';

import type {Props} from '@theme/DocCard';
import Heading from '@theme/Heading';
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs';

import {MODULE_ICON_BY_SLUG, moduleSlugFromHref} from '@site/src/lib/module-icons';
import styles from './styles.module.css';

/**
 * Swizzled DocCard. Replaces Docusaurus's default emoji icons (🗃️ 📄️ 🔗) with
 * Lucide stroke icons in brand purple. On the /modules/ generated index, each
 * module-link tile gets that module's signature icon (Sparkles for AI Coaching,
 * Route for SmartPath, etc.) via MODULE_ICON_BY_SLUG. Generic categories use
 * FolderOpen; internal article links use FileText; external links ExternalLink.
 */

function useCategoryItemsPlural() {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          message: '1 item|{count} items',
          id: 'theme.docs.DocCard.categoryDescription.plurals',
          description:
            'The default description for a category card in the generated index about how many items this category includes',
        },
        {count},
      ),
    );
}

function CardContainer({
  className,
  href,
  children,
}: {
  className?: string;
  href: string;
  children: ReactNode;
}): ReactNode {
  return (
    <Link
      href={href}
      className={clsx('card padding--lg', styles.cardContainer, className)}>
      {children}
    </Link>
  );
}

function IconSpan({Icon}: {Icon: LucideIcon}): ReactNode {
  return (
    <span className={styles.cardIcon} aria-hidden="true">
      <Icon size={20} strokeWidth={2} />
    </span>
  );
}

function CardLayout({
  className,
  href,
  Icon,
  title,
  description,
}: {
  className?: string;
  href: string;
  Icon: LucideIcon;
  title: string;
  description?: string;
}): ReactNode {
  return (
    <CardContainer href={href} className={className}>
      <Heading
        as="h2"
        className={clsx('text--truncate', styles.cardTitle)}
        title={title}>
        <IconSpan Icon={Icon} /> {title}
      </Heading>
      {description && (
        <p
          className={clsx('text--truncate', styles.cardDescription)}
          title={description}>
          {description}
        </p>
      )}
    </CardContainer>
  );
}

function pickCategoryIcon(href: string | undefined): LucideIcon {
  const moduleSlug = moduleSlugFromHref(href);
  if (moduleSlug && MODULE_ICON_BY_SLUG[moduleSlug]) {
    return MODULE_ICON_BY_SLUG[moduleSlug];
  }
  return FolderOpen;
}

function CardCategory({item}: {item: PropSidebarItemCategory}): ReactNode {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();

  if (!href) {
    return null;
  }

  return (
    <CardLayout
      className={item.className}
      href={href}
      Icon={pickCategoryIcon(href)}
      title={item.label}
      description={item.description ?? categoryItemsPlural(item.items.length)}
    />
  );
}

function CardLink({item}: {item: PropSidebarItemLink}): ReactNode {
  const Icon: LucideIcon = isInternalUrl(item.href) ? FileText : ExternalLink;
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      className={item.className}
      href={item.href}
      Icon={Icon}
      title={item.label}
      description={item.description ?? doc?.description}
    />
  );
}

export default function DocCard({item}: Props): ReactNode {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
