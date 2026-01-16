---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/epics.md
  - project-context.md
---

# UX Design Specification backend-template

**Author:** Locnguyen
**Date:** 2026-01-16

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

### Project Vision

CVCraft.ai transforms the intimidating process of resume writing into a guided, AI-assisted experience. Rather than confronting users with a blank canvas or complex design tools, we provide a structured editor that focuses on what matters: **crafting compelling content that passes both human and ATS screening**. The product's core philosophy is "Structure for Speed, AI for Quality" - users work within proven resume frameworks while AI elevates their rough notes into professional language.

The experience is built around three pillars:

- **Instant Feedback:** Local-first architecture delivers <100ms preview updates, making editing feel like a conversation rather than a form-filling task
- **Transparent AI Partnership:** Credit-based AI usage with clear cost visibility and tone control, positioning AI as a collaborative writing coach
- **ATS Confidence:** Real-time optimization checks and keyword guidance eliminate the anxiety of automated rejection

### Target Users

**Primary Persona: The Ambitious New Grad**

- **Context:** Creating their first professional resume with limited work experience
- **Pain Points:** Writer's block when translating projects/coursework into professional bullet points; uncertainty about tone and structure; fear of ATS rejection
- **Tech Comfort:** High (digital natives expecting modern, responsive interfaces)
- **Success Metric:** Can complete a full resume without external help and perceive AI suggestions as genuinely improving their content

**Secondary Persona: The Strategic Career Switcher**

- **Context:** Refining existing resume content to target a new role or industry
- **Pain Points:** Need to reframe experience with different keywords and emphasis; managing multiple resume versions; aligning content with specific job descriptions
- **Tech Comfort:** Medium-High (comfortable with productivity tools like Notion, Google Docs)
- **Success Metric:** Can quickly create role-specific versions and feel confident the content speaks to their target audience

**Tertiary Actor: The Operations Admin**

- **Context:** Monitoring system health, AI usage costs, and configuring pricing
- **Pain Points:** Need visibility into usage patterns and cost drivers; ability to adjust pricing without code deployments
- **Tech Comfort:** High (technical operations role)
- **Success Metric:** Can identify cost/usage trends and make data-driven pricing decisions

### Key Design Challenges

**Challenge 1: Balancing Instant Gratification with AI Processing Latency**

Users expect real-time responsiveness (the editor must feel like typing in Google Docs), but AI rewrites can take up to 5 seconds. Poor UX here leads to impatience, repeated clicks, and frustration.

**UX Strategy:** Decouple editing from AI processing. The editor must respond instantly via local-first state (IndexedDB), while AI operations use optimistic UI patterns, clear loading states, and before/after previews to set proper expectations.

**Challenge 2: Credit Transparency Without Cognitive Overload**

The credit-based model is central to the business model, but surfacing "you have X credits left" on every screen creates anxiety and decision fatigue. Users need awareness without constant friction.

**UX Strategy:** Employ tiered visibility - subtle persistent balance indicator (top nav), contextual cost preview on AI action triggers ("Rewrite will cost 2 credits"), and proactive low-balance notifications only when it impacts immediate actions.

**Challenge 3: Structured Flexibility - Guidance Without Constraint**

The product's value proposition depends on structured sections (this is what makes AI rewriting effective and ATS optimization possible), but users coming from freeform tools may feel constrained.

**UX Strategy:** Lead with smart defaults and progressive disclosure. New users see recommended sections pre-populated; advanced users can add/remove/reorder sections. The structure is a helpful scaffold, not a cage.

### Design Opportunities

**Opportunity 1: AI as a Writing Coach, Not a Black Box**

Most AI tools present a "magic button" with unpredictable results. CVCraft can differentiate by making AI a transparent, controllable partner.

**UX Pattern:** Tone selection (Professional, Friendly), inline before/after comparisons, "Refine this rewrite" iteration option, and explanatory tooltips ("AI is adjusting for active voice and quantifiable impact").

**Opportunity 2: Zero-Latency Editing as a Competitive Moat**

The local-first architecture (IndexedDB + optimistic locking) enables instant saves and <100ms preview updates - most competitors force users to wait for server round-trips.

**UX Pattern:** Eliminate all save buttons and spinners from the editor. Use subtle "Last synced 2s ago" indicators. Enable offline editing with conflict resolution on reconnect. The editor should feel like a native app.

**Opportunity 3: Real-Time ATS Confidence Building**

Instead of a post-completion "ATS check" that forces rework, integrate ATS feedback directly into the editing flow.

**UX Pattern:** Inline warnings (e.g., red underline on overly long bullets), keyword highlighting when user provides a job description, and a persistent "ATS Score" widget that updates as they edit. Make ATS optimization a guided process, not a final exam.

## Core User Experience

### Defining Experience

The central experience of CVCraft.ai revolves around a single transformative action: **converting rough, unpolished notes into professional resume content through AI-assisted rewriting**. This is not a "resume builder" in the traditional sense - it's a writing elevation tool. Users arrive with ideas and experiences they struggle to articulate professionally; the product gives them the structure and AI partnership to express those ideas compellingly.

The core loop is deliberately tight:

1. User enters rough notes into a structured field (e.g., "helped professor with research project")
2. User triggers AI rewrite with tone selection (Professional, Friendly)
3. System presents before/after comparison instantly
4. User accepts, and the polished content appears in the live preview within 100ms
5. User moves to the next section with confidence

This loop must feel effortless - any friction (slow previews, unclear AI results, confusing credit costs) breaks the flow and returns users to the anxiety of "am I doing this right?" The experience succeeds when users stop thinking about the tool and focus entirely on their story.

### Platform Strategy

**Primary Platform: Web Application (Responsive)**

CVCraft.ai is designed as a web-first experience optimized for two distinct contexts:

**Desktop Experience (Primary Use Case):**

- **Layout:** Split-screen with editor on the left and live preview on the right
- **Interaction Model:** Keyboard-first workflow (typing, tab navigation, shortcuts for common actions)
- **Rationale:** Resume crafting is a focused, desk-work activity. Users need to see changes instantly without toggling views. High-resolution preview enables detail checking (fonts, spacing, alignment).

**Mobile Experience (Secondary):**

- **Layout:** Single-column with explicit mode toggle (Edit ↔️ Preview)
- **Interaction Model:** Touch-optimized controls for section reordering (drag handles), AI triggers (large tap targets)
- **Rationale:** Mobile supports quick edits on-the-go, but full resume creation happens at a desk. Mobile users are typically reviewing/tweaking, not drafting from scratch.

**Offline Capability:**
Enabled via IndexedDB (local-first architecture). Users can edit without connectivity; changes sync when reconnected with optimistic locking conflict resolution.

**Platform-Specific Affordances:**

- **Desktop:** Keyboard shortcuts (Cmd+S triggers sync status, Cmd+K opens AI rewrite dialog), drag-and-drop section reordering
- **Mobile:** Native share sheet integration for PDF exports, haptic feedback on successful saves

### Effortless Interactions

These interactions must require zero cognitive effort:

**1. Invisible Auto-Save**

- **User expectation:** "My work is always safe."
- **Implementation:** IndexedDB persists every keystroke instantly; debounced (1000ms) server sync runs in background.
- **UX Signal:** Subtle "Synced 3s ago" indicator in top nav; never a "Save" button that creates decision fatigue.

**2. Zero-Latency Preview**

- **User expectation:** "I see changes as I type, like Google Docs."
- **Implementation:** Local-first rendering using React memoization; only modified section re-renders (verified via React Profiler per NFR-01).
- **UX Signal:** Preview updates <100ms; no spinners, no flash of old content.

**3. Contextual AI Assistance**

- **User expectation:** "AI help is one click away, right where I need it."
- **Implementation:** Sparkle icon appears inline next to every editable text field; click opens tone selector dropdown.
- **UX Signal:** Tone options (Professional, Friendly, Custom) with credit cost preview; no modal dialogs breaking focus.

**4. Intelligent Section Defaults**

- **User expectation:** "I start with structure, not a blank page."
- **Implementation:** Onboarding profile (Student/Professional from Story 1.3) pre-populates recommended sections (Education-first for Students, Experience-first for Professionals).
- **UX Signal:** Sections appear with placeholder text ("Add your degree here..."); users fill in, not create from scratch.

### Critical Success Moments

**Moment 1: The "It Just Works" First Save**

- **Context:** User types their first resume bullet point and pauses.
- **What Happens:** Auto-save indicator briefly highlights ("Saved"), preview updates instantly.
- **Why Critical:** This is the first impression. If users see a "Save" button, they're back in the world of anxiety ("Did I save? Will I lose my work?"). Invisible auto-save creates trust.
- **Design Requirement:** No manual save affordances; sync status visible but passive.

**Moment 2: The AI "Wow" Moment**

- **Context:** User pastes rough notes ("worked on team project, increased efficiency"), clicks AI rewrite.
- **What Happens:** Before/after comparison shows transformation: "Collaborated cross-functionally to optimize workflow processes, achieving 22% efficiency gain."
- **Why Critical:** This validates the core value prop. If AI output feels generic or unhelpful, users abandon the product. The "wow" comes from seeing their rough idea articulated professionally.
- **Design Requirement:** Before/after side-by-side view, "Accept" or "Refine" options, transparent tone indication.

**Moment 3: The ATS Confidence Boost**

- **Context:** User completes resume, runs ATS readiness check.
- **What Happens:** ATS Score widget shows "85% ATS Optimized" with specific feedback: "✅ Keywords aligned with role" "⚠️ Bullet point exceeds 120 chars (line 3)."
- **Why Critical:** This eliminates the biggest fear - automated rejection. Users gain confidence that their resume will make it past screening.
- **Design Requirement:** Persistent ATS Score widget, inline warnings during editing, actionable suggestions.

**Moment 4: The Frictionless Export**

- **Context:** User clicks "Export PDF", waits briefly, downloads file.
- **What Happens:** PDF opens cleanly, text is selectable (ATS-friendly), layout matches preview exactly, watermark behavior matches tier (free vs paid).
- **Why Critical:** The final deliverable is the product's real-world proof. If the PDF has layout corruption or fails ATS text extraction, all prior experience is invalidated.
- **Design Requirement:** Export job status visibility (polling or SSE), p95 completion <10s (NFR-03), automated text extraction verification (Architecture ADR).

### Experience Principles

These principles guide every UX decision:

**Principle 1: Structure Liberates, Not Constrains**

The product's structured approach (sections, fields) is not a limitation - it's what enables AI effectiveness and ATS optimization. But users must feel this structure as a helpful scaffold, not a cage.

**Design Implication:** New users see smart defaults (recommended sections pre-populated). Advanced users can add/remove/reorder sections freely. Progressive disclosure: guidance up front, flexibility when needed.

**Principle 2: Instant Feedback Builds Confidence**

Users doubt themselves ("Is this good enough?" "Will ATS reject this?"). Instant feedback - live preview updates, inline ATS warnings, real-time keyword highlighting - replaces doubt with confidence.

**Design Implication:** Zero loading spinners in the editor. Async operations (AI rewrite, PDF export) use clear progress indicators with time estimates. Feedback is always actionable, never just "Error occurred."

**Principle 3: AI Transparency Over Magic**

AI is a partner, not a black box. Users must understand what tone they're requesting, see before/after comparisons, and know the credit cost upfront.

**Design Implication:** Tone selector always visible. Credit cost shown before AI action ("This will cost 2 credits"). Tooltips explain why AI made specific changes ("Switched to active voice for impact"). Users can refine or reject AI suggestions.

**Principle 4: Offline-First Resilience**

The local-first architecture (IndexedDB + optimistic locking) means editing never blocks on network availability. Users can work on a plane, in a coffee shop with spotty wifi, or during server downtime.

**Design Implication:** Sync status is subtle ("Synced 5s ago" / "Offline - will sync when connected"). Conflict resolution is graceful (if server version differs, show side-by-side diff with "Keep yours" / "Use server version" options). Offline mode badge appears when disconnected.

## Desired Emotional Response

### Primary Emotional Goals

CVCraft.ai is designed to transform the typically stressful, doubt-filled experience of resume writing into one of **confidence, empowerment, and accomplishment**. The emotional transformation happens through three core shifts:

**1. Confidence Over Doubt**

Users should feel: _"I trust this resume will get me past screening and represent me well."_

**Why this matters:** New grads face crippling self-doubt ("I don't have enough experience"), while career switchers worry about positioning ("Will they see me as qualified?"). Both personas share a common fear: automated rejection by ATS systems they don't understand.

**How we create this:** Real-time ATS feedback during editing (not a post-completion "exam"), before/after AI comparisons that show measurable improvement, and transparent explanations for every suggestion. Confidence comes from understanding, not blind faith.

**2. Empowered Over Overwhelmed**

Users should feel: _"I'm in control, I understand my options, and I can make informed choices."_

**Why this matters:** Resume advice online is contradictory and overwhelming. Users face decision paralysis: Which template? What words? How long? AI tools often feel like black boxes where users surrender control and hope for the best.

**How we create this:** AI is a collaborative partner, not a dictator. Users choose tone, accept or reject suggestions, see before/after comparisons, and understand credit costs upfront. The structured editor provides guidance without constraint - smart defaults for beginners, full flexibility for advanced users.

**3. Accomplished Over Frustrated**

Users should feel: _"I made real progress and created something I'm proud of."_

**Why this matters:** Resume writing is high-stakes work. Hours invested must lead to tangible results, not wasted time fighting slow tools or unclear interfaces.

**How we create this:** Instant gratification through <100ms preview updates, zero-latency auto-save, and clear completion states. AI rewrite transforms rough notes in seconds. Export delivers professional PDFs in <10s. Every interaction rewards effort with immediate, visible progress.

### Emotional Journey Mapping

**Discovery Stage - "This Looks Different"**

- **Entry emotion:** Skeptical curiosity ("Another resume builder?")
- **Desired shift:** Intrigued interest ("AI + structure + ATS focus = worth trying")
- **Design trigger:** Clear differentiation on landing page, trial access without signup commitment (FR-01)
- **Failure mode to avoid:** Generic landing page that looks like every competitor

**Onboarding Stage - "They Understand Me"**

- **Entry emotion:** Cautious ("Will this waste my time?")
- **Desired shift:** Welcomed ("Student vs Professional profile - they get that I'm not one-size-fits-all")
- **Design trigger:** Profile selection (Story 1.3) with context-specific defaults
- **Failure mode to avoid:** Generic onboarding that treats all users identically

**First Edit Stage - "This Just Works" (Critical Moment #1)**

- **Entry emotion:** Uncertain ("Am I doing this right? Did it save?")
- **Desired shift:** Confident trust ("Auto-save worked! Preview updated as I typed!")
- **Design trigger:** Invisible auto-save with subtle confirmation, instant preview refresh
- **Failure mode to avoid:** Manual save buttons that create anxiety about data loss

**First AI Rewrite Stage - "Wow, This Actually Helps" (Critical Moment #2)**

- **Entry emotion:** Hopeful skepticism ("Will AI output be generic garbage?")
- **Desired shift:** Delighted surprise ("This is genuinely better than what I wrote!")
- **Design trigger:** Before/after comparison showing clear quality improvement, tone selection respected
- **Failure mode to avoid:** AI suggestions that feel robotic or miss user's original intent

**ATS Check Stage - "I Know What to Fix"**

- **Entry emotion:** Anxious dread ("Will I get auto-rejected?")
- **Desired shift:** Relieved confidence ("85% score + specific issues listed = actionable plan")
- **Design trigger:** Persistent ATS Score widget, inline warnings, keyword suggestions tied to job description
- **Failure mode to avoid:** Vague scores without actionable guidance ("Your resume scores 60%" - so what?)

**Export & Share Stage - "This Looks Professional" (Critical Moment #3)**

- **Entry emotion:** Tentative hope ("Please don't have layout bugs...")
- **Desired shift:** Pride ("This looks polished! Ready to send!")
- **Design trigger:** Fast export (<10s), clean PDF that matches preview, watermark policy transparent
- **Failure mode to avoid:** Corrupted PDFs, watermarks that look unprofessional, text not selectable

**Return Visit Stage - "My Data Is Safe"**

- **Entry emotion:** Comfortable familiarity
- **Desired shift:** Deep trust ("Offline-first means my work is always here")
- **Design trigger:** Data immediately available (IndexedDB), offline editing capability, sync conflict resolution graceful
- **Failure mode to avoid:** "Loading..." spinners that make users doubt data persistence

### Micro-Emotions

**Confidence vs. Confusion**

- **Context:** Throughout the editing flow, especially when making content decisions
- **Critical because:** Self-doubt kills momentum. Users who feel confused abandon the task.
- **Positive design:** Inline hints ("Try quantifying your impact with numbers"), smart defaults (recommended sections pre-populated), ATS score widget showing real-time improvement
- **Negative to avoid:** Cryptic error messages, features without explanation, hidden costs

**Trust vs. Skepticism**

- **Context:** AI rewrite suggestions, credit deductions, auto-save reliability, payment flow
- **Critical because:** Financial transaction (credits) + career stakes (resume quality) = high risk perception
- **Positive design:** Transparent before/after comparisons, "Why this suggestion" tooltips, "Synced 3s ago" indicator, secure payment badges
- **Negative to avoid:** AI changes applied without showing original, credits deducted without confirmation, ambiguous sync status

**Accomplishment vs. Frustration**

- **Context:** Completing resume sections, running successful ATS checks, exporting clean PDFs
- **Critical because:** Positive reinforcement drives task completion. Frustration leads to abandonment.
- **Positive design:** Section completion checkmarks, ATS score improvement notifications ("75% → 85% ✓"), export success confirmation with preview, micro-celebrations
- **Negative to avoid:** No progress indicators, unclear next steps, silent failures

**Calm vs. Anxiety**

- **Context:** Credit balance visibility, AI processing latency, export queue status
- **Critical because:** Job search is already stressful - the product must reduce anxiety, not amplify it
- **Positive design:** Subtle credit balance indicator (top-right, small), loading states with time estimates ("~3s remaining"), graceful error recovery ("Low balance. Top up to continue.")
- **Negative to avoid:** In-your-face credit warnings on every screen, spinners without time estimates, ambiguous error messages

### Design Implications

**For Confidence - Make the Invisible Visible:**

- Real-time ATS feedback during editing, not post-completion grading
- Before/after AI comparisons show improvement quantitatively ("Added action verbs, quantified impact")
- Persistent ATS Score widget updates as they edit (live feedback loop)
- Clear success states ("✓ Keywords aligned with job description")

**For Empowerment - Give Control, Don't Take It:**

- Tone selector visible and prominent (Professional, Friendly, Custom)
- "Accept" or "Refine" buttons on every AI suggestion (never auto-apply)
- Add/remove/reorder sections freely (structure is scaffold, not cage)
- Offline editing capability (not dependent on server availability)

**For Accomplishment - Reward Progress:**

- Section completion checkmarks with subtle animation
- ATS score improvements visualized ("Score improved! 75% → 82%")
- Export success confirmation with inline PDF preview
- Share link generation with instant copy-to-clipboard feedback

**For Calm - Reduce Cognitive Load:**

- Subtle credit balance (top-right corner, small font, not dominant)
- Loading states always include time estimates ("Processing... ~3s remaining")
- Error messages actionable, not vague ("Low balance. Top up credits to continue AI rewrites." + CTA button)
- No sudden modal dialogs breaking editing flow

### Emotional Design Principles

**Principle 1: Build Confidence Through Transparency**

Users feel confident when they understand what's happening behind the scenes. "Magic" creates wonder initially but breeds distrust over time. Show the mechanism, explain the choices.

**Application:**

- AI rewrite shows before/after side-by-side, not just the result
- Credit costs displayed before action ("Rewrite will cost 2 credits - you have 15 remaining")
- ATS check explains the "why" ("Bullet exceeds 120 characters - ATS systems may truncate long lines")
- Sync status always visible ("Last synced 5 seconds ago" / "Syncing..." / "Offline - will sync when connected")

**Principle 2: Replace Anxiety with Actionable Guidance**

Job searching is stressful enough. Every moment of user uncertainty should be replaced with clear, actionable next steps. Never leave users guessing "what do I do now?"

**Application:**

- Low credit balance → "Top up credits" CTA button (not just red warning text)
- ATS warning → Specific fix ("Shorten this bullet by 15 characters to meet ATS standards")
- Sync conflict → Side-by-side diff with clear choices ("Keep your version" / "Use server version")
- AI processing → Progress bar with estimate ("Rewriting with Professional tone... ~3s remaining")

**Principle 3: Celebrate Micro-Wins**

Resume writing is a long, effortful process. Break it into small victories with positive reinforcement. Make progress feel tangible and rewarding.

**Application:**

- Section completion checkmark with subtle animation and sound (optional)
- ATS score improvement notification toast ("Score improved! 75% → 82% ✓")
- First AI rewrite success tooltip ("Great work! You've used your first AI assist ✨")
- Export completion celebration modal ("Your resume is ready! 🎉" with download CTA)

**Principle 4: Empower Choice, Don't Dictate Outcomes**

AI is positioned as a collaborative partner, not an oracle. Users should always feel they're in the driver's seat, with AI as a helpful co-pilot.

**Application:**

- Tone selector always visible (not hidden behind algorithm decision)
- AI suggestions are opt-in (user clicks "Rewrite", not auto-applied)
- Section templates are flexible (can be customized, reordered, removed)
- Export watermark rules transparent (free vs paid tier clearly explained before export)

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

To inform CVCraft.ai's design decisions, we analyzed products that our target users (New Grads and Career Switchers) already love and use regularly. These tech-savvy users expect modern, responsive interfaces similar to the best productivity tools available today.

**1. Notion (Productivity / Content Creation)**

**UX Excellence:**

- **Structured Flexibility:** Block-based system provides organizational structure without constraining creativity. Users can arrange content hierarchically while maintaining full control over layout.
- **Instant Feedback:** <100ms updates when typing, no manual save buttons. Work persists automatically to local storage.
- **Progressive Disclosure:** Interface appears simple initially but reveals powerful features as users explore. Beginners aren't overwhelmed; advanced users discover depth.
- **Offline-First Architecture:** Works seamlessly without internet connection, syncs transparently when connectivity returns.

**Why Users Love It:**

- Feel empowered to organize complex information their own way
- Never worry about losing work due to invisible, reliable auto-save
- Can start with simple use cases and grow into advanced workflows without relearning the interface

**Transferable Patterns:**

- Resume sections as structured blocks with drag-and-drop reordering
- Zero-latency editing with local-first data persistence (IndexedDB)
- Progressive disclosure: basic editor for beginners, advanced customization for power users
- Offline editing capability with graceful sync when reconnected

**2. Grammarly (AI Writing Assistant)**

**UX Excellence:**

- **Inline AI Assistance:** Suggestions appear contextually where users are working, never interrupting flow with modal dialogs.
- **Transparent AI Reasoning:** Shows "why" behind each suggestion (clarity improvement, tone adjustment, engagement enhancement).
- **Before/After Preview:** Users see proposed changes before accepting, maintaining control over their content.
- **Tone Control:** Users select desired tone (Professional, Casual, Confident) upfront, ensuring AI respects intent.

**Why Users Love It:**

- AI feels like a helpful writing coach, not an authoritative know-it-all
- Can accept or reject suggestions individually, maintaining authorship
- Understand what AI is doing and why, eliminating black-box anxiety

**Transferable Patterns:**

- Inline AI rewrite triggers (sparkle icon adjacent to editable fields)
- Before/after comparison UI for all AI-generated suggestions
- Tone selector (Professional, Friendly) visible and controllable by user
- Explanatory tooltips revealing AI reasoning ("Switched to active voice for impact")

**3. Figma (Design/Collaboration Tool)**

**UX Excellence:**

- **Real-Time State Synchronization:** Changes appear instantly across all contexts without refresh or manual sync triggers.
- **Invisible Auto-Save:** No save button exists; work is continuously persisted with zero user intervention.
- **Transparent Sync Status:** Users always know connectivity state through subtle, persistent indicators.
- **Offline Mode Badge:** Clear visual indicator when disconnected, with graceful degradation of collaborative features.

**Why Users Love It:**

- Never lose work due to crashes, browser closures, or network interruptions
- Understand exactly what's happening with sync state (no mystery about data persistence)
- Offline work seamlessly transitions to synced state when connectivity returns

**Transferable Patterns:**

- Auto-save with visible sync status indicator ("Synced 3s ago" / "Syncing..." / "Offline")
- Offline mode badge when disconnected, with local editing capability preserved
- Conflict resolution UI when optimistic updates diverge from server state
- Clear state communication throughout the interface (never hide system status)

### Transferable UX Patterns

**Navigation Patterns**

**Persistent Side Navigation (Notion-Inspired)**

- **Pattern:** Left sidebar lists all user's resumes, main area shows active editor and preview
- **Relevance to CVCraft:** Career Switcher persona needs quick access to multiple resume versions (role-specific tailoring)
- **Adaptation:** Sidebar collapses on mobile to single hamburger menu; resume list becomes full-screen modal on small viewports

**Split-Screen Editor (Figma-Inspired)**

- **Pattern:** Left pane for editing, right pane for live preview, with resizable split handle
- **Relevance to CVCraft:** Aligns with desktop experience principle - users need to see formatting changes instantly without toggling views
- **Adaptation:** Mobile uses single-column layout with explicit mode toggle (Edit ↔️ Preview) per FR-09 requirements

**Interaction Patterns**

**Inline AI Triggers (Grammarly-Inspired)**

- **Pattern:** Contextual action affordance (sparkle icon) appears on hover/focus adjacent to editable text fields
- **Relevance to CVCraft:** Enables AI assistance without breaking editing flow or opening modal dialogs
- **Adaptation:** Add credit cost preview on hover ("Rewrite will cost 2 credits"), supporting transparency principle

**Block-Based Section Management (Notion-Inspired)**

- **Pattern:** Structured content sections (blocks) with visible drag handles for reordering
- **Relevance to CVCraft:** Matches "Structure Liberates" principle - guidance through defaults, flexibility through reordering
- **Adaptation:** Resume sections (Education, Experience, Skills) as draggable blocks with add/remove capabilities

**Optimistic UI Updates (Figma-Inspired)**

- **Pattern:** UI updates immediately on user action; server synchronization happens asynchronously in background
- **Relevance to CVCraft:** Zero-latency editing principle from architecture (IndexedDB local-first)
- **Adaptation:** Instant local persistence with debounced (1000ms) server sync, optimistic locking for conflict resolution

**Visual Patterns**

**Subtle Status Indicators (Figma-Inspired)**

- **Pattern:** Small, non-intrusive sync status text ("Saved 2s ago") in persistent but peripheral location
- **Relevance to CVCraft:** Builds trust without creating anxiety (supports "Calm vs Anxiety" micro-emotion)
- **Adaptation:** Top-right corner indicator with muted color, never center-screen modal interruptions

**Progressive Disclosure (Notion-Inspired)**

- **Pattern:** Advanced features hidden until needed (revealed via hover menus, keyboard shortcuts, or contextual triggers)
- **Relevance to CVCraft:** Supports both New Grad (needs simplicity) and Career Switcher (wants power) personas simultaneously
- **Adaptation:** Basic editor loads with default sections; advanced options (section types, custom fields) appear on hover or via "+" menu

**Tone Visualization (Grammarly-Inspired)**

- **Pattern:** Visual badges or pills showing selected writing tone (Professional 🎯, Friendly 😊, Confident 💪)
- **Relevance to CVCraft:** Makes abstract AI tone selection tangible and understandable
- **Adaptation:** Tone selector as pill-style toggle buttons above AI rewrite trigger, with active state clearly indicated

### Anti-Patterns to Avoid

**Modal Dialog Overload (Common in Traditional Resume Builders)**

- **Problem:** Every editing action (add section, change template, export) opens modal dialog, breaking user flow
- **Why Avoid:** Directly conflicts with "Instant Feedback" principle and creates unnecessary friction
- **CVCraft Solution:** Inline editing, dropdown menus, and slide-out panels instead of modal interruptions

**Ambiguous Save States (Legacy Document Editors)**

- **Problem:** Users uncertain if work is saved, leading to anxiety about data loss and compulsive manual saving
- **Why Avoid:** Conflicts with "Trust vs Skepticism" micro-emotion and "Calm vs Anxiety" goal
- **CVCraft Solution:** Always-visible sync indicator ("Synced 3s ago"), no save buttons to create decision fatigue

**Black Box AI Transformations (Many AI Content Tools)**

- **Problem:** AI makes changes to user content without showing original or explaining reasoning
- **Why Avoid:** Conflicts with "AI Transparency Over Magic" principle and breeds user skepticism
- **CVCraft Solution:** Before/after side-by-side comparison, "Why this suggestion" explanatory tooltips, accept/reject controls

**Aggressive Upselling (Freemium SaaS Products)**

- **Problem:** Credit balance warnings displayed prominently on every screen, constant upgrade prompts interrupting workflow
- **Why Avoid:** Conflicts with "Calm vs Anxiety" micro-emotion and "Replace Anxiety with Actionable Guidance" principle
- **CVCraft Solution:** Subtle balance indicator in top-right, contextual warnings only when action is blocked, upgrade CTA never interrupts editing

**Freeform Design Chaos (Canva-Style Approach for Resumes)**

- **Problem:** Unlimited design freedom overwhelms users who need structure; produces ATS-incompatible layouts
- **Why Avoid:** CVCraft's core value proposition is "Structure for Speed" and ATS optimization requires structured data
- **CVCraft Solution:** Template-based layouts with section reordering only, no arbitrary positioning or complex graphics

**Hidden Costs and Surprise Charges (AI Tools with Opaque Pricing)**

- **Problem:** Users discover credit costs only after taking action, leading to "gotcha" feeling and distrust
- **Why Avoid:** Conflicts with "Build Confidence Through Transparency" emotional design principle
- **CVCraft Solution:** Credit cost displayed before every AI action ("This will cost 2 credits"), balance always visible

### Design Inspiration Strategy

**What to Adopt Directly**

**1. Notion's Block-Based Content Structure**

- **Rationale:** Aligns perfectly with "Structure Liberates, Not Constrains" experience principle
- **Implementation:** Resume sections (Education, Experience, Skills, Projects, Certifications) as draggable, reorderable blocks
- **Expected Benefit:** Users receive organizational guidance (pre-populated recommended sections) while retaining full customization freedom (add/remove/reorder)

**2. Grammarly's Inline AI Assistance Model**

- **Rationale:** Directly solves "AI Transparency" challenge and supports "Empowerment" emotional goal
- **Implementation:** Sparkle icon triggers → Tone selector dropdown (Professional/Friendly) → AI processing → Before/after comparison → Accept/Reject buttons
- **Expected Benefit:** AI positioned as collaborative partner rather than authoritative dictator; users maintain control and understanding

**3. Figma's Auto-Save + Sync Status Pattern**

- **Rationale:** Builds trust, supports offline-first architecture, eliminates save-related anxiety
- **Implementation:** IndexedDB instant local persistence + debounced (1000ms) server sync + persistent "Synced Xs ago" indicator + offline mode badge
- **Expected Benefit:** Users never worry about data loss; trust is established through transparent state communication

**What to Adapt for CVCraft Context**

**1. Notion's Slash Commands → Simplified Section Quick-Add**

- **Original Pattern:** Type "/" anywhere to open command palette with dozens of block types
- **Adaptation:** Use prominent "Add Section" button with dropdown menu (fewer, resume-specific options)
- **Rationale:** Simpler for New Grad persona with lower learning curve; slash commands may feel too developer-oriented
- **Implementation:** "Add Section +" button opens dropdown: 📚 Education, 💼 Experience, 🎯 Skills, 🏆 Achievements, etc.

**2. Grammarly's Auto Tone Detection → User-Selected Default Tone**

- **Original Pattern:** AI automatically detects appropriate tone based on context and audience
- **Adaptation:** User selects preferred default tone during onboarding; can override per-section
- **Rationale:** Resume context is consistently professional; auto-detection adds complexity without value for MVP
- **Implementation:** Onboarding asks "Preferred writing tone?" with [Professional] [Friendly] options; becomes default for all AI rewrites

**3. Figma's Multiplayer Cursors → Share Link Viewer Mode**

- **Original Pattern:** Real-time collaborative editing with visible user cursors and selections
- **Adaptation:** Share link enables view-only mode with "Viewer" badge; no collaborative editing in MVP
- **Rationale:** FR-28/FR-29 specify view-only sharing; real-time collaboration deferred post-MVP
- **Implementation:** Public share link shows "View-Only Mode 👁️" badge, all editing affordances hidden

**What to Avoid Entirely**

**1. Canva's Freeform Positioning and Custom Graphics**

- **Why Avoid:** Conflicts with "Structure for Speed" value proposition and produces ATS-incompatible layouts (NFR-23)
- **Alternative:** Template-based layouts with fixed structure, section reordering only (no arbitrary positioning)

**2. Aggressive Credit Warnings on Every Screen**

- **Why Avoid:** Creates anxiety, conflicts with "Calm" emotional goal and "Tiered Visibility" credit strategy
- **Alternative:** Subtle top-right balance indicator, contextual warning only when action is blocked by insufficient credits

**3. Complex Multi-Step Onboarding Wizards**

- **Why Avoid:** Conflicts with "This Just Works" critical success moment #1 (first impression)
- **Alternative:** Minimal 2-step onboarding: (1) Profile type selection (Student/Professional), (2) Start editing immediately with smart defaults

**4. AI Auto-Apply Without Confirmation**

- **Why Avoid:** Conflicts with "Empower Choice, Don't Dictate" emotional design principle
- **Alternative:** All AI suggestions require explicit user acceptance; before/after comparison always shown first

## Design System Foundation

### Design System Choice

**Selected Foundation: Tailwind CSS + shadcn/ui**

CVCraft.ai will use **Tailwind CSS** as the utility-first CSS framework combined with **shadcn/ui** component primitives. This is a "themeable system" approach that balances development speed with brand customization capability.

**What is Tailwind CSS?**
A utility-first CSS framework that provides low-level utility classes (e.g., `flex`, `pt-4`, `text-center`) rather than opinionated component styles. Enables rapid prototyping while maintaining full design control.

**What is shadcn/ui?**
A collection of beautifully designed, accessible React components built on Radix UI primitives. Unlike traditional component libraries (npm packages), shadcn/ui components are copy-pasted into your project, giving full ownership and customization capability.

### Rationale for Selection

**1. Performance Alignment with Architecture Requirements**

CVCraft.ai's architecture demands <100ms preview update latency (NFR-01). Tailwind CSS compiles to static CSS at build time with zero runtime overhead, making it ideal for the local-first, high-performance editing experience.

- No JavaScript runtime for styling (unlike CSS-in-JS solutions)
- Automatic purging of unused styles keeps bundle size minimal
- Static CSS enables instant preview rendering without style recalculation

**2. MVP Speed Without Sacrificing Future Customization**

The project is in MVP stage (from PRD scope), requiring fast iteration. However, as a paid SaaS product, CVCraft needs brand differentiation to inspire confidence and justify pricing.

- **shadcn/ui accelerates development:** Pre-built accessible components (buttons, dropdowns, modals) copy-paste into project in minutes
- **Tailwind enables rapid customization:** Adjust colors, spacing, typography via config file without touching component code
- **Full ownership:** Components live in your codebase, not locked in an npm package - customize deeply as product matures

**3. Modern React Ecosystem Compatibility**

The architecture specifies React 19 + Vite 7 (cutting-edge stack). Tailwind and shadcn/ui are built for modern React patterns.

- Excellent TypeScript support (architecture requires TypeScript 5.6+)
- Works seamlessly with Vite's fast refresh and build optimizations
- Compatible with React Server Components (future-proofing for potential SSR)

**4. Alignment with Inspiration Patterns**

Analysis of inspiring products (Notion, Grammarly, Figma) revealed a consistent aesthetic: clean, minimalist, professional interfaces that prioritize content over chrome. Tailwind's utility-first approach naturally encourages this design philosophy.

- Easy to achieve "invisible interface" where UI fades into background
- Supports progressive disclosure (show/hide utilities, responsive design)
- Can replicate Notion-style subtle interactions with custom animations

**5. Accessibility and Trust-Building**

CVCraft handles financial transactions (credit purchases) and career-critical content (resumes). The UI must inspire trust through professional polish and accessibility compliance.

- **shadcn/ui components built on Radix UI primitives:** Industry-leading accessibility (ARIA attributes, keyboard navigation, screen reader support) baked in
- **Tailwind's design constraints:** Consistent spacing scale, color palette prevent amateurish inconsistencies that erode trust
- **Active community:** Extensive examples of professional SaaS UIs built with this stack

### Implementation Approach

**Phase 1: Foundation Setup (Week 1)**

1. **Install Tailwind CSS:**

   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Configure Design Tokens:**
   Define CVCraft brand in `tailwind.config.js`:
   - Color palette: Primary (professional blue), Secondary (success green), Neutral (grays), Accent (AI purple for sparkle icons)
   - Typography: Inter for UI, Source Serif for resume previews (readability)
   - Spacing scale: 4px base unit for consistent rhythm
   - Border radius: Subtle (4px) for professional feel

3. **Install shadcn/ui CLI:**

   ```bash
   npx shadcn-ui@latest init
   ```

   Configure for TypeScript, Vite, with components in `src/components/ui/`

**Phase 2: Core Component Library (Week 1-2)**

Install shadcn/ui components as needed (copy-paste approach):

- `button` - AI rewrite triggers, CTAs, form actions
- `dropdown-menu` - Tone selector, section add menu
- `dialog` - Payment modals, confirmation dialogs
- `toast` - Success notifications ("Resume saved!", "Export complete!")
- `badge` - ATS score widget, credit balance indicator
- `progress` - AI processing, export job status
- `separator` - Visual hierarchy in editor
- `scroll-area` - Resume list sidebar, long sections

**Phase 3: Custom Components (Week 2-3)**

Build CVCraft-specific components on top of shadcn/ui primitives:

- `ResumeEditor` - Structured section editor (custom, not shadcn/ui)
- `LivePreview` - Resume preview pane (custom rendering logic)
- `AIRewriteTrigger` - Sparkle icon with tone selector dropdown (combines button + dropdown-menu)
- `CreditBalanceWidget` - Subtle indicator in top nav (custom badge variation)
- `ATSScoreWidget` - Persistent score display with tooltip (custom progress + popover)
- `SyncStatusIndicator` - "Synced 3s ago" / "Offline" badge (custom badge + timer logic)

**Phase 4: Responsive Patterns (Week 3)**

Leverage Tailwind's responsive utilities for mobile adaptation:

- Desktop: `md:grid md:grid-cols-2` for split-screen editor/preview
- Mobile: `block` with explicit toggle between edit/preview modes
- Sidebar: `md:block hidden` with hamburger menu trigger on mobile

### Customization Strategy

**Design Tokens Configuration**

Define CVCraft brand via Tailwind config (single source of truth):

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',  // Light tints
          500: '#3b82f6', // Main brand blue (professional, trustworthy)
          900: '#1e3a8a', // Dark shades
        },
        ai: {
          500: '#8b5cf6', // Purple for AI features (sparkle icons, AI indicators)
        },
        success: {
          500: '#10b981', // Green for ATS score, success states
        },
        warning: {
          500: '#f59e0b', // Orange for ATS warnings
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],      // UI text
        serif: ['Source Serif Pro', 'Georgia', 'serif'], // Resume preview
      },
    },
  },
}
```

**Component Customization Examples**

**AI Rewrite Trigger (Grammarly-inspired):**

- shadcn/ui `button` base with custom sparkle icon
- Tailwind utilities: `text-ai-500 hover:text-ai-600 transition-colors`
- Custom tooltip showing credit cost on hover

**ATS Score Widget (Custom):**

- shadcn/ui `progress` component base
- Tailwind utilities for color theming: `bg-success-500` when score > 80%, `bg-warning-500` when 60-80%
- Custom popover (shadcn/ui `popover`) showing specific issues on click

**Sync Status Indicator (Figma-inspired):**

- shadcn/ui `badge` component with custom timer logic
- Tailwind utilities: `text-xs text-gray-500` for subtlety (top-right corner)
- Animated pulse on "Syncing..." state: `animate-pulse`

**Brand Expression Guidelines**

While using pre-built components, CVCraft differentiates through:

1. **Color Psychology:**
   - Primary blue: Trust, professionalism (financial transactions)
   - AI purple: Innovation, intelligence (AI features)
   - Success green: Confidence (ATS scores, completion states)

2. **Typography Hierarchy:**
   - Inter (UI): Clean, modern, excellent readability at small sizes
   - Source Serif (Resume Preview): Professional, traditional resume aesthetic

3. **Micro-Interactions:**
   - Subtle hover states (Tailwind `transition-all duration-200`)
   - Section completion animations (Tailwind `animate-bounce` on checkmarks)
   - Progress indicators with estimated time (custom logic + shadcn/ui progress)

4. **Whitespace and Rhythm:**
   - Generous padding in editor (reduce cognitive load)
   - Tight spacing in preview (maximize content density for resume)
   - Consistent 4px spacing scale throughout
