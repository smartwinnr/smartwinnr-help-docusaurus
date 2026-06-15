# Stakeholder feedback log

Running record of feedback raised after the help-site launch, what was
decided, and what's parked for later. Each entry: brief summary, status,
and the context a future picker-upper needs.

---

## #1 - Image border / shadow

**Status:** ✅ Shipped 2026-06-14.

**Feedback:** Can we have a box-shadow or border of some sort around the
images in articles?

**Decision:** 1px border + faint elevation shadow on block images and
figures inside `.markdown`. Border carries the visual weight on dark
mode (where the rgba shadow fades to nearly invisible); shadow adds
polish on light mode.

**Touched:**
- `src/css/custom.css` - extended the `.markdown figure, .markdown p img`
  rule with `border: 1px solid var(--ifm-color-emphasis-200)` and a
  two-stop `box-shadow` using the project's existing
  `rgba(17, 12, 46, ...)` tint.

---

## #2 - "What's next" surfacing wrong-audience articles

**Status:** ✅ Shipped 2026-06-14.

**Feedback:** On `/modules/ai-coaching/for-learners/understanding-the-feedback-screen`,
the "What's next" strip showed manager / editor-tier articles
(Participation Insights tab, Competency & Skills tab). Stakeholder asked
whether multi-role users get a mixed-audience pool.

**Diagnosis:** RelatedStrip's pool-widening fell back to the parent
folder (`/modules/<m>/*`), and the gate filter passed those articles for
multi-role viewers - so editor-tier content leaked into a learner-page
"What's next".

**Decision:** Widen by **audience tier**, not by gate. Pool falls back
only to sibling sub-folders in the same audience tier within the same
module:

| Tier | Sub-folders |
|---|---|
| Learner | `for-learners` · `overview` · `quickstart` · `faqs-and-troubleshooting` |
| Manager | `for-managers` |
| Editor | `create-and-manage` · `assign-and-schedule` · `features` · `reports-and-analytics` · `settings-and-permissions` · `best-practices` |

Non-module articles (`/get-started/`, `/reference/`, etc.) keep the
original parent-widening behavior - no audience semantics defined there.

**Touched:**
- `src/components/Article/RelatedStrip.tsx` - added `LEARNER_SUBS` /
  `MANAGER_SUBS` / `EDITOR_SUBS` constants + `audiencePeerFolders()`
  helper; `pickSiblings` now widens by audience peer set and sorts
  same-folder articles ahead of peer-folder ones.

**Side effect to know:** a module with very few learner articles and no
`overview` / `quickstart` / `faqs-and-troubleshooting` folders may show
fewer than 3 cards. Acceptable - fewer accurate suggestions beat three
mixed-audience ones.

---

## #3 - Device-specific screenshot tabs (Mobile / iPad / Web)

**Status:** ⏸ Parked - pending decisions on scope, variant set, and
authoring capacity.

**Feedback:** Can articles show three tabs per image - one for Mobile,
one for iPad, one for Web - so the same step is illustrated for each
device?

**Why parked:** Technically straightforward (a small custom
`<DeviceTabs>` MDX component wrapping Docusaurus's stock `<Tabs>` with
`groupId="device"` for cross-page sync). The blocker isn't engineering -
it's authoring effort. Every adopted image triples the screenshot work
and triples the maintenance burden when the UI changes. Also, the
product surface isn't symmetric: editor/admin UIs are web-only, so
"three tabs everywhere" doesn't fit ~half the corpus.

### Recommended approach when we pick it up

1. **Ship the component first** (Phase 1, ~2 hours). Opt-in per image,
   so existing single-image articles keep working unchanged. If only one
   variant is provided, it renders as a normal image (no tabs).
2. **Pilot on 2–3 learner articles** where mobile vs web actually
   differs (AI Coaching feedback screen, SmartPath take-the-path, a quiz
   attempt). Validate UX with stakeholders before scaling.
3. **Extend the authoring wizard** at `/admin/authoring` Step 3 to
   accept up to 3 device variants per image upload. Auto-stamps the
   right markdown.
4. **Backfill opportunistically** - content owners refresh learner +
   manager articles as they touch them. No mass migration.

### Open decisions (before code)

| Question | Options |
|---|---|
| **Variant set** | (a) Mobile + Web only (skip iPad - iPad mostly mirrors web). (b) Mobile + iPad + Web as proposed. |
| **Default tab** | (a) Author specifies per image. (b) Audience-driven (learner → mobile, editor → web). (c) Persisted user choice wins across articles. |
| **Authoring effort owner** | Who produces 3× screenshots? If content owners aren't ready, the component ships but stays unused. |
| **Mandatory vs optional** | "Nice on key articles" vs "every learner-facing image must have mobile + web". Affects whether we add a lint rule. |
| **Pilot articles** | Which 2–3 to start with? |

### Architectural notes (so we don't re-derive later)

- Tabs render in `.mdx`, not `.md`. Articles adopting `<DeviceTabs>`
  become `.mdx` - cheap mechanical rename per file.
- Filesystem convention proposal:
  `static/img/helpscout/<collection>/<article>-N-{mobile,ipad,web}.png`.
  Migrate-helpscout + image autofix pipelines would need awareness.
- Editor / admin articles (web-only) should NOT use this component.
  Add a note to `STYLE.md` when we adopt.

### Scope cap

Editor and admin articles (`create-and-manage/`, `features/`,
`settings-and-permissions/`, etc.) stay single-image. Tabs are reserved
for content where multiple device surfaces actually differ visually -
which is overwhelmingly learner and some manager content.

---

## Adding new feedback

Append a new `## #N - Title` section with the same shape:

```
**Status:** ✅ Shipped <date>  |  ⏸ Parked  |  🚧 In progress  |  ❌ Won't do

**Feedback:** <verbatim or paraphrased>

**Decision:** <what we did or what we're going to do>

**Touched:** <files, if shipped>

**Open decisions:** <if parked, what needs to be answered before code>
```

Keep entries dense - one screen each at most. Detail goes in the
referenced plan file (`help-menu-redesign.md` or section in
`PROGRESS.md`), not here.
