import React from 'react';
import Link from '@docusaurus/Link';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {Lock} from 'lucide-react';
import {useCurrentUser, useIsUserReady} from '@site/src/contexts/UserContext';
import {PRIVILEGE_GATING_ENABLED} from '@site/src/access-policy';
import {
  PERSONAS,
  ENTRIES,
  GROUPS,
  canEnterPersona,
  type PersonaSlug,
  type EntryPoint,
  type EntryGroup,
  type Persona,
} from './PathContent';
import styles from './styles.module.css';

/**
 * Behind-the-door persona page (Option C). Renders:
 *   1. A persona shell hero (icon + title + breadcrumb + Switch lens pill)
 *   2. One or more curated card sections (taskGrid of taskCards)
 *      - From GROUPS[slug] if present (manager + admin have absorbed
 *        sub-personas split into named groups)
 *      - Falls back to ENTRIES[slug] as a single "Where to start" section
 *   3. A mode rail at the bottom - quick swap into the other doors
 *
 * Card markup matches plans/mockups/landing-c-<persona>.html exactly:
 *   <a class="taskCard"><span class="ti">📝</span><strong>...</strong><span class="desc">...</span></a>
 *
 * Gate behaviour is unchanged: locked entries (privilege missing) route to
 * `/modules/<slug>/` upsell instead of the deep article, and the desc line
 * flips to "🔒 needs <priv> - see module page". The URL guard + sidebar
 * swizzles still enforce role + privilege independently.
 */

type Props = {
  slug: PersonaSlug;
};

const OTHER_DOORS: Array<{slug: PersonaSlug; label: string}> = [
  {slug: 'learner', label: 'Learner'},
  {slug: 'manager', label: 'Manager'},
  {slug: 'editor',  label: 'Author'},
  {slug: 'admin',   label: 'Admin'},
  {slug: 'help',    label: 'Help'},
];

function upsellHref(originalHref: string): string | null {
  const m = /^\/modules\/([^/]+)\//.exec(originalHref);
  return m ? `/modules/${m[1]}/` : null;
}

function ForbiddenView({title}: {title: string}): JSX.Element {
  return (
    <div className={styles.wrap}>
      <h1>{title}</h1>
      <p>This section requires a higher access level than your current role provides.</p>
      <p>
        <Link to="/">← Back to the homepage</Link>
      </p>
    </div>
  );
}

function TaskCard({
  e,
  persona,
  privileges,
}: {
  e: EntryPoint;
  persona: Persona;
  privileges: string[];
}): JSX.Element {
  const isBotAction = e.href === '#open-chatbot';
  const lockedByPrivilege =
    PRIVILEGE_GATING_ENABLED && !!e.privilege && !privileges.includes(e.privilege);
  const upsell = lockedByPrivilege ? upsellHref(e.href) : null;
  const effectiveHref = upsell ?? e.href;
  const Icon = e.icon || persona.icon;
  const desc: React.ReactNode = lockedByPrivilege ? (
    <>
      <Lock size={12} strokeWidth={2} style={{verticalAlign: '-1px', marginRight: 4}} aria-hidden="true" />
      needs {e.privilege} - see module page
    </>
  ) : (
    e.blurb
  );

  const className = [
    styles.taskCard,
    lockedByPrivilege && styles.taskCardLocked,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      <span className={styles.ti} aria-hidden="true">
        <Icon size={20} strokeWidth={2} />
      </span>
      <strong>{e.label}</strong>
      {desc && <span className={styles.desc}>{desc}</span>}
    </>
  );

  if (isBotAction) {
    return (
      <a
        href="#open-chatbot"
        className={className}
        onClick={(ev) => {
          ev.preventDefault();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('smartwinnr:open-chatbot'));
          }
        }}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={effectiveHref} className={className}>
      {inner}
    </Link>
  );
}

function GroupSection({
  group,
  persona,
  privileges,
  meta,
}: {
  group: EntryGroup;
  persona: Persona;
  privileges: string[];
  meta?: string;
}): JSX.Element {
  return (
    <>
      <div className={styles.sectionHead}>
        <h2>{group.title}</h2>
        {meta && <span className={styles.sectionMeta}>{meta}</span>}
      </div>
      <div className={styles.taskGrid}>
        {group.entries.map((e) => (
          <TaskCard
            key={e.href + e.label}
            e={e}
            persona={persona}
            privileges={privileges}
          />
        ))}
      </div>
    </>
  );
}

function PathSkeleton({persona}: {persona: Persona}): JSX.Element {
  const PIcon = persona.icon;
  return (
    <div className={styles.wrap}>
      <section className={styles.personaShell}>
        <div className={styles.personaCrumb}>
          <Link to="/">← Home</Link>
          {' '}›{' '}
          <PIcon size={14} strokeWidth={2} style={{verticalAlign: '-2px'}} /> {persona.label}
        </div>
        <div className={styles.personaRow}>
          <span className={styles.personaIco} aria-hidden="true">
            <PIcon size={32} strokeWidth={2} />
          </span>
          <div>
            <h1>{persona.label}</h1>
            <p className={styles.personaSub}>{persona.blurb}</p>
          </div>
        </div>
      </section>
      <div className={styles.skelTaskGrid} aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skelTaskCard} />
        ))}
      </div>
    </div>
  );
}

function Inner({slug}: Props): JSX.Element {
  const persona = PERSONAS.find((p) => p.slug === slug);
  const ready = useIsUserReady();
  const user = useCurrentUser();
  if (!persona) return <ForbiddenView title="Unknown persona" />;
  if (!ready) return <PathSkeleton persona={persona} />;
  if (!canEnterPersona(user, persona)) {
    return <ForbiddenView title={`${persona.label} - not available for your role`} />;
  }
  const privileges = user.privileges || [];
  const groups: EntryGroup[] =
    GROUPS[slug] ?? [{title: 'Where to start', entries: ENTRIES[slug] || []}];
  const PIcon = persona.icon;

  return (
    <div className={styles.wrap}>
      <section className={styles.personaShell}>
        <div className={styles.personaCrumb}>
          <Link to="/">← Home</Link>
          {' '}›{' '}
          <PIcon size={14} strokeWidth={2} style={{verticalAlign: '-2px'}} /> {persona.label}
        </div>
        <div className={styles.personaRow}>
          <span className={styles.personaIco} aria-hidden="true">
            <PIcon size={32} strokeWidth={2} />
          </span>
          <div>
            <h1>{persona.label}</h1>
            <p className={styles.personaSub}>{persona.blurb}</p>
          </div>
        </div>
        <Link to="/" className={styles.modeSwitcher}>
          <span className={styles.modeSwitcherActive}>{persona.label}</span>
          Switch lens →
        </Link>
      </section>

      {groups.map((group, idx) => (
        <GroupSection
          key={group.title + idx}
          group={group}
          persona={persona}
          privileges={privileges}
          meta={
            idx === 0
              ? `Curated for the ${persona.label} lens · ${group.entries.length} tasks`
              : undefined
          }
        />
      ))}

      <nav className={styles.modeRail} aria-label="Switch lens">
        <span className={styles.modeRailLabel}>Switch lens:</span>
        {OTHER_DOORS
          .filter((d) => d.slug !== slug)
          .filter((d) => {
            const p = PERSONAS.find((x) => x.slug === d.slug);
            return p && canEnterPersona(user, p);
          })
          .map((d) => {
            const p = PERSONAS.find((x) => x.slug === d.slug)!;
            const DIcon = p.icon;
            return (
              <Link key={d.slug} to={`/path/${d.slug}/`}>
                <DIcon size={14} strokeWidth={2} style={{verticalAlign: '-2px', marginRight: 4}} />
                {d.label}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

function Fallback({slug}: Props): JSX.Element {
  const persona = PERSONAS.find((p) => p.slug === slug);
  if (!persona) return <ForbiddenView title="Unknown persona" />;
  return <PathSkeleton persona={persona} />;
}

export default function PathBody({slug}: Props): JSX.Element {
  return (
    <BrowserOnly fallback={<Fallback slug={slug} />}>
      {() => <Inner slug={slug} />}
    </BrowserOnly>
  );
}
