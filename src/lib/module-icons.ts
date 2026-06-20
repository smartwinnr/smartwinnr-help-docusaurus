import type {LucideIcon} from 'lucide-react';
import {
  Sparkles,
  Video,
  MapPin,
  ClipboardCheck,
  Newspaper,
  FileText,
  ListChecks,
  Route,
  BookOpen,
  Trophy,
  Award,
  Bell,
  Puzzle,
} from 'lucide-react';

/** Single source of truth for "module slug → Lucide icon".
 *  Consumed by the homepage Recommended Modules strip and by the DocCard
 *  swizzle that renders the /modules/ index page. */
export const MODULE_ICON_BY_SLUG: Record<string, LucideIcon> = {
  'ai-coaching': Sparkles,
  'video-coaching': Video,
  'field-coaching': MapPin,
  quiz: ClipboardCheck,
  smartfeed: Newspaper,
  forms: FileText,
  survey: ListChecks,
  smartpath: Route,
  'knowledge-hub': BookOpen,
  'kpi-gamification': Trophy,
  competition: Award,
  notifications: Bell,
  'cross-module': Puzzle,
};

/** Match `/modules/<slug>/` or `/modules/<slug>` and return the slug. */
export function moduleSlugFromHref(href: string | undefined | null): string | null {
  if (!href) return null;
  const m = /^\/modules\/([^/]+)\/?$/.exec(href);
  return m ? m[1] : null;
}
