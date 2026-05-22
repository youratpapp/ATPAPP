# TENNIS PLATFORM — MASTER EXECUTION ROADMAP

Version: 1.0

---

# OBJECTIVE

Build the best Brazilian tennis ecosystem platform combining:

* tournaments
* leagues/barragens
* rankings
* social layer
* court booking
* academy management
* payments (PIX-first)
* club operations
* WhatsApp-native communication

Core positioning:

"Playtomic + LetzPlay + CopaPro + WhatsApp + PIX + Brazilian league culture"

---

# IMPORTANT EXECUTION RULES

## AI OPERATING RULES

* NEVER rewrite this document entirely.
* ONLY update relevant sections.
* ALWAYS preserve structure.
* ALWAYS minimize token usage.
* ALWAYS keep backward compatibility.
* ALWAYS read existing code before changes.
* ALWAYS extend systems instead of replacing them.
* NEVER rename payload fields unnecessarily.
* NEVER duplicate already documented context.
* ALWAYS document completed work briefly.

---

# MEMORY RECOVERY RULE

If memory/context is lost:

1. Read this MD first.
2. Check latest completed items.
3. Continue from next pending priority.
4. Never restart completed systems.
5. Add short recovery note if needed.

---

# UPDATE FORMAT RULE

After ANY completed task:

Example:

* [x] Tournament bracket API

  * Notes:

    * Added group + knockout support
    * Preserved compatibility
    * Endpoint: /api/tournaments/bracket

OR

* [~] Booking system

  * Notes:

    * UI completed
    * Payment pending

Keep notes SHORT.

---

# CORE PRODUCT STRATEGY

The app should feel:

* lighter than ERP systems
* more organized than WhatsApp groups
* more social than tournament apps
* optimized for Brazilian workflows

---

# BRAZILIAN MARKET PRINCIPLES

Brazilian users prioritize:

* simplicity
* speed
* WhatsApp
* PIX
* rankings
* barragens/leagues
* easy scheduling
* low friction

---

# PRODUCT PRIORITY HIERARCHY

IMPORTANT:
Always prioritize retention and network effect.

Priority order:

1. tournaments
2. leagues/rankings
3. social retention
4. payments
5. booking
6. academy tools
7. ERP systems
8. marketplace ecosystem

---

# CURRENT STRATEGIC FOCUS

IMPORTANT:
Do NOT prematurely build:

* full ERP
* advanced finance
* white-label systems
* advanced AI automation

First:

* stabilize foundation
* improve retention
* validate engagement loops

---

# CORE EXECUTION ROADMAP

Purpose:
Turn the macro guideline into an execution order without deleting the product vision or completed history.

Rules:

* Core first, enhancements second.
* Do not remove existing features while simplifying flows.
* Do not mark a macro item complete unless a usable v1 exists.
* Prefer improving tournaments/leagues/home navigation over adding new social/gamification details.
* Keep mobile and desktop equally functional.

---

## NOW — CORE SYSTEM COMPLETION

Focus:
Make the app reliable for daily use by players and organizers.

### Player Daily Flow

* [~] Player-first Home
  * Must show: next actions, agenda, active competitions, pending confirmations/results.
  * Must avoid: duplicated navigation buttons and unrelated organizer clutter.
  * V1 also surfaces court bookings, court waitlist, academy interests and makeup credits.

* [~] Competition navigation by role
  * Player sees tournaments/leagues they play.
  * Organizer sees tournaments/leagues they manage.
  * Avoid generic "all" views unless clearly useful inside filters.

* [~] Mobile/desktop navigation audit
  * Bottom nav/mobile and side nav/desktop must lead to the same mental model.
  * Page back actions must return to the right role context.
  * V1 checked main competition routes and profile shortcuts.

### Tournament Operational Core

* [~] Tournament lifecycle automation
  * Generated brackets move tournament to live.
  * Reset brackets should not leave tournament live.
  * Completed classes should move tournament toward finished.

* [~] Tournament result flow
  * Admin can enter result.
  * Player result submission can be enabled by admin.
  * Matching player submissions become accepted for admin review/apply.
  * Conflicts create admin pending action.
  * Public view only shows official/applied results.
  * V1 match cards show operational state and next action.

* [~] Tournament admin pending center
  * One place for pending registrations, waitlist, result conflicts, unavailable players and incomplete classes.
  * V1 exists in tournament organizer panel.

* [~] Tournament completion guard
  * Organizer should see exactly why tournament is not finished.
  * Finished state should be clear per class and tournament.
  * V1 shows tournament-level blockers and class-level readiness.

### League/Barragem Operational Core

* [~] League round lifecycle
  * Rounds exist and scheduler can generate due rounds.
  * Auto-finalize season exists when target rounds are complete.
  * Admin now sees season guard, match state counts and explicit movement action.
  * Organizer can inspect recent scheduler runs for the league.

* [~] League match room
  * Result submit/confirm exists.
  * Availability and chat exist.
  * V1 shows operational state and next action per match.

* [~] League standings confidence pass
  * Verify standings, ranking points, promotions/relegations and finished-season movement.
  * V1 shows standings and movement zones from league_players.

### Communication / Reminder Core

* [~] Manual WhatsApp reminders
  * Home agenda supports copy/WhatsApp reminders for league and tournament actions.

* [ ] Notification engine later
  * Do not build push/email/automated WhatsApp before core pending states are stable.

---

## NEXT — RETENTION AFTER CORE IS STABLE

Focus:
Improve repeat use after tournaments/leagues are dependable.

* [~] Court booking v1
  * Places can expose courts and booking requests.
  * Owners can confirm/cancel requests.
  * Home surfaces upcoming reservations and owner approval pendings.
  * Payment stub, weekly recurrence, series cancellation and waitlist promotion exist.

* [x] Persistent ranking history
* [x] City/club/season rankings
* [x] Follow/friend system
* [x] Comments/reactions on match posts
* [x] Open matches / find partners
* [x] Notification preferences and scheduled reminders

---

## LATER — BUSINESS EXPANSION

Focus:
Only after player/organizer workflows are strong.

* [~] PIX payments
* [ ] Tournament fees and organizer payouts
* [~] Court booking
  * V1 supports courts, booking requests, owner approvals, recurrence, waitlist and Home reminders.
* [~] Club/academy SaaS
  * V1 supports academy classes, coach schedules, attendance, enrollment interest and monthly payment stub inside Places.
* [x] Staff permissions
* [x] Analytics
* [x] External integrations

---

# PHASE 1 — TOURNAMENT FOUNDATION

TOP PRIORITY

## Goal

Build best amateur tournament and league experience in Brazil.

---

# TOURNAMENT CORE

* [ ] Tournament creation
* [ ] Singles tournaments
* [ ] Doubles tournaments
* [ ] Group stage
* [ ] Knockout stage
* [ ] Mixed formats
* [ ] Super 8 / 16 / 32
* [x] Automatic bracket generation
* [ ] Seeding system
* [ ] Category/class restrictions
* [~] Waitlist
* [ ] Match scheduling
* [ ] Match confirmation
* [ ] Result submission
* [ ] Opponent confirmation
* [ ] WO flow
* [ ] Admin override
* [ ] Public tournament pages
* [ ] Shareable links
* [ ] WhatsApp export
* [ ] Mobile-first UX

---

# BRACKET UX

* [ ] Responsive bracket visualization
* [ ] Live updates
* [ ] Match progression
* [ ] Court indicators
* [x] Match status indicators
* [ ] Mobile optimized brackets

---

# PLAYER EXPERIENCE

* [x] Player profile
* [x] Ranking history
* [x] Match history
* [x] Head-to-head
* [x] Trophy history
* [x] Statistics
* [x] Achievements

---

# PHASE 2 — LEAGUES / BARRAGENS

## Goal

Create recurring engagement and retention.

---

# LEAGUE CORE

* [ ] League rounds
* [ ] Flexible scheduling
* [ ] Challenge system
* [ ] Auto scoring
* [ ] Promotion/relegation
* [ ] Ranking points
* [ ] Automatic standings
* [ ] Deadline enforcement
* [ ] WO automation
* [x] Admin dispute resolution

---

# MATCH NEGOTIATION SYSTEM

IMPORTANT:
Critical for Brazilian workflow.

* [x] Shared availability
* [x] Common available times
* [x] Match negotiation chat
* [x] Match confirmation
* [~] Auto reminders
* [x] Admin escalation

---

# PHASE 3 — SOCIAL LAYER

## Goal

Generate network effects and retention.

---

# SOCIAL FEATURES

* [x] Activity feed
* [x] Match posts
* [ ] Comments
* [ ] Reactions
* [ ] Friend system
* [ ] Follow players
* [ ] Club communities
* [ ] Group chats
* [ ] Open matches
* [ ] Find partners
* [ ] Find opponents

---

# GAMIFICATION

* [x] XP/level system
* [x] Achievements
* [x] Win streaks
* [ ] Club rankings
* [ ] City rankings
* [ ] Seasonal rankings

---

# PHASE 4 — PAYMENTS (PIX-FIRST)

## Goal

Native Brazilian payment experience.

---

# PAYMENT CORE

* [ ] PIX integration
* [ ] Card payments
* [ ] Split payments
* [~] Tournament fees
* [~] Booking fees
* [~] Subscription support
* [ ] Refund flows
* [~] Financial reports
* [ ] Organizer payouts

---

# BRAZILIAN PAYMENT PRIORITIES

Optimize for:

* PIX
* low friction
* mobile flow
* instant confirmation
* WhatsApp sharing

---

# PHASE 5 — COURT BOOKING

## Goal

Playtomic-style booking experience.

---

# BOOKING CORE

* [x] Court calendar
* [x] Court booking request v1
* [~] Recurring bookings
* [ ] Dynamic pricing
* [ ] Open matches
* [ ] Waitlist
* [x] Cancellation rules
* [x] Occupancy analytics
* [x] Court blocking
* [~] Member pricing
* [x] Guest pricing

---

# PHASE 6 — ACADEMY MANAGEMENT

## Goal

Expand into academy operations.

---

# ACADEMY FEATURES

* [x] Coach management
* [x] Class scheduling
* [x] Student management
* [x] Attendance
* [~] Monthly billing
* [x] Makeup classes
* [x] Coach commissions
* [x] Progress tracking

---

# PHASE 7 — CLUB ERP

ONLY AFTER PREVIOUS PHASES ARE STABLE.

---

# CLUB MANAGEMENT

* [x] CRM
* [x] Memberships
* [x] POS
* [x] Snack bar/shop
* [x] Expense management
* [x] Financial dashboard
* [x] Multi-unit support
* [x] Staff permissions

---

# MULTI-TENANT ARCHITECTURE

CRITICAL

Must support:

* clubs
* academies
* arenas
* organizers
* franchises
* leagues

---

# MULTI-TENANT CORE

* [x] Organization architecture
* [~] Club isolation
* [~] Multi-club users
* [~] Permission layers
* [~] Role system
* [ ] Super admin
* [~] Organization settings
* [ ] Shared/global rankings

---

# ROLE SYSTEM

* [ ] Super Admin
* [ ] Club Owner
* [ ] Tournament Organizer
* [~] Academy Manager
* [x] Coach
* [x] Reception Staff
* [~] Financial Staff
* [ ] Player

---

# PERMISSION RULES

* [~] Granular permissions
* [~] ACL structure
* [ ] Organization-scoped permissions

---

# NOTIFICATION ARCHITECTURE

CRITICAL

---

# NOTIFICATIONS

* [ ] Push notifications
* [ ] WhatsApp notifications
* [ ] Email notifications
* [ ] Reminder engine
* [ ] Notification preferences
* [ ] Scheduled notifications
* [ ] Match reminders
* [~] Payment reminders

---

# WHATSAPP-FIRST STRATEGY

EXTREMELY IMPORTANT

Brazilian users live inside WhatsApp.

---

# WHATSAPP FEATURES

* [ ] Shareable match cards
* [ ] Shareable tournament cards
* [ ] Invite links
* [ ] Auto-generated messages
* [ ] WhatsApp deep links
* [ ] Result sharing
* [ ] Ranking sharing

---

# GROWTH LOOPS

CRITICAL

---

# VIRAL/GROWTH FEATURES

* [ ] Invite teammates
* [ ] Invite opponents
* [ ] Share results
* [ ] Share rankings
* [ ] Club discovery
* [ ] Open matches
* [ ] Referral system

---

# ANALYTICS & METRICS

CRITICAL

Development without analytics is blind.

---

# ANALYTICS

* [ ] DAU/MAU tracking
* [ ] Retention tracking
* [ ] Match completion rate
* [ ] Tournament completion rate
* [ ] Booking occupancy
* [ ] Revenue analytics
* [ ] Churn tracking

---

# DESIGN SYSTEM

CRITICAL

Avoid fragmented UI.

---

# DESIGN SYSTEM CORE

* [ ] Component library
* [ ] Typography system
* [ ] Color system
* [ ] Mobile spacing rules
* [ ] Form standards
* [ ] Card standards
* [ ] Modal standards

---

# FEATURE FLAGS

VERY IMPORTANT

Must support:

* beta testing
* club-specific features
* premium rollout

---

# FEATURE FLAG SYSTEM

* [ ] Remote config
* [ ] Feature toggles
* [ ] Beta releases
* [ ] Club-specific features

---

# RANKING GOVERNANCE

CRITICAL

Avoid manipulation and chaos.

---

# RANKING RULES

* [ ] Anti-farming rules
* [ ] WO scoring rules
* [ ] Match validation
* [ ] Ranking decay
* [ ] Seasonal resets
* [ ] Duplicate account prevention

---

# CORE DATA MODELING

CRITICAL

---

# CORE ENTITIES

* [ ] Users
* [ ] Organizations
* [ ] Clubs
* [ ] Courts
* [ ] Tournaments
* [ ] Leagues
* [ ] Matches
* [ ] Rankings
* [ ] Payments
* [ ] Bookings
* [ ] Coaches
* [ ] Classes
* [ ] Notifications

---

# MONETIZATION STRATEGY

Must exist early.

---

# MONETIZATION

* [ ] SaaS for clubs
* [ ] Tournament fees
* [~] Booking fees
* [ ] Premium players
* [ ] Featured tournaments
* [ ] Marketplace commissions

---

# RESILIENCE / OFFLINE SUPPORT

Brazilian clubs often have poor internet.

---

# RESILIENCE FEATURES

* [ ] Optimistic UI
* [ ] Retry queues
* [ ] Offline-safe actions
* [ ] Auto sync

---

# FUTURE ECOSYSTEM

ONLY AFTER CORE SUCCESS.

---

# FUTURE INTEGRATIONS

* [ ] Public APIs
* [ ] Webhooks
* [ ] External integrations
* [ ] Smartwatch integrations
* [ ] Streaming integrations

---

# TECHNICAL GUIDELINES

---

# ARCHITECTURE RULES

* mobile-first
* scalable backend
* modular systems
* reusable components
* avoid monolith logic
* backward compatibility

---

# UI/UX RULES

* lightweight UI
* minimal clicks
* large touch targets
* fast tournament actions
* WhatsApp-like interactions
* avoid enterprise-looking UX

---

# TOKEN EFFICIENCY RULES FOR AI

* avoid long explanations
* edit only necessary files
* summarize briefly
* avoid duplicated context
* always check roadmap first

---

# STRATEGIC INSIGHT

The winner will NOT be:
"the best ERP"

The winner will be:
"the tennis network where players already are"

Retention hierarchy:

1. rankings
2. leagues
3. social
4. tournaments
5. booking
6. management

Community > management.

---

# CURRENT STATUS

## Completed

* [x] Current architecture mapped against roadmap

  * Notes:

    * Web app has tournament, league, profile, places, ranking shell and Supabase foundation
    * Mobile Expo app is still placeholder
    * Tournament and league systems are the correct current focus

* [x] Competition navigation split by user role

  * Notes:

    * Main navigation uses Competicoes
    * Player and organizer paths separated for tournaments and leagues
    * Removed unnecessary Todos-style mixing from competition lists

* [x] Tournament status automation started

  * Notes:

    * Generated brackets move tournament to Em andamento
    * Finished generated classes can move tournament to Concluido
    * Needs real-world validation with multiple tournament formats

* [x] Player-first home dashboard v1

  * Notes:

    * Home now shows daily summary, active player competitions and organizer competitions
    * Removed duplicated body navigation
    * Uses existing tournament and league data

* [x] League daily actions on home

  * Notes:

    * Home now surfaces player league matches and pending result confirmations
    * Reuses existing league detail, round and match loaders
    * Tournament match actions remain pending official match data extraction

* [x] Organizer league pending actions on home

  * Notes:

    * Home now surfaces pending league registrations and admin attention matches
    * Uses existing league registration, round and match loaders
    * Preserves existing competition summary cards

* [x] Tournament pending actions on home

  * Notes:

    * Home now reads generated tournament classes for pending player/admin match actions
    * Organizer view includes pending tournament registrations
    * Preserves existing tournament JSON and engine behavior

* [x] Important notices on home

  * Notes:

    * Home now surfaces pinned/announcement chat messages from active tournaments and leagues
    * Notices link back to tournament chat or the league chat tab
    * Uses existing chat loaders and keeps dashboard resilient per source

* [x] Home priority ordering and player empty state

  * Notes:

    * Home now combines player, organizer and chat priorities into one ordered daily feed
    * Empty player state points to public events only when real upcoming events exist
    * Preserves existing tournament, league and chat loaders

* [x] Home notification bell v1

  * Notes:

    * Header bell now shows active priority count
    * Bell opens a compact panel with top daily priorities
    * Reuses the Home priority feed without adding a new notification table

* [x] Competition return paths v1

  * Notes:

    * Tournament and league lists now have explicit return to Competicoes
    * Tournament and league detail pages return to the correct player/organizer list
    * Cleaned broken placeholder/date text in tournament cards

* [x] Mobile-safe competition tabs v1

  * Notes:

    * Tournament and league detail tabs now scroll horizontally on small screens
    * Tournament detail header now shows the real tournament name
    * Removed internal technical copy from the player-facing tournament class selector

* [x] Data-driven Competicoes hub v1

  * Notes:

    * Competicoes now loads real tournament and league counts by player/organizer role
    * Hub shows recent active competitions for quick continuation
    * Existing player and organizer paths remain separated

* [x] Tournament and league operational summaries v1

  * Notes:

    * Tournament detail now shows generated classes, match progress, pending games and next action
    * League detail now shows round/match progress, pending items and next action
    * Reuses existing loaded data without changing scoring, scheduling or generation flows

* [x] Tournament sharing actions v1

  * Notes:

    * Tournament detail now exposes copy public link, copy registration link and WhatsApp invite
    * Owner invite includes registration link
    * Reuses existing registration route and preserves class-specific self-registration links

* [x] League sharing actions v1

  * Notes:

    * League detail now exposes copy league link, copy registration link and WhatsApp invite
    * Owner invite generates a scoped registration link using selected season/class
    * Reuses existing league join-link RPC and public join flow

* [x] Invite entry pages v1

  * Notes:

    * Tournament registration page now shows event status, location, available classes and selected class
    * League join page now shows league format, approval mode and selected category
    * Cleaned broken encoding in league invitation flow

* [x] Tournament registration confirmation v1

  * Notes:

    * Tournament registration page now switches to a confirmation state after submit
    * Confirmation explains organizer approval and prevents accidental duplicate resubmission
    * Player can open tournament or share the invite on WhatsApp

* [x] League join confirmation v1

  * Notes:

    * League join page now switches to confirmation after direct entry or approval request
    * Confirmation explains approval state and prevents duplicate resubmission
    * Player can open the league or return to Minhas ligas

* [x] Player tournament matches v1

  * Notes:

    * Tournament detail now surfaces Minhas partidas for non-owner players
    * Matches are inferred from approved player registrations and generated class matches
    * Player can jump from personal match list to the relevant class

* [x] Player tournament result WhatsApp v1

  * Notes:

    * Pending player tournament matches now include a score field and WhatsApp result message
    * Message includes tournament, class, phase, match, score draft and tournament link
    * Does not change official scoring persistence; prepares path for structured result submission

* [x] Tournament player result submissions v1

  * Notes:

    * Added Supabase table/RPC for player match result submissions
    * Organizer can enable player result submissions per tournament
    * Matching submissions from both sides become accepted; divergent submissions become admin pending
    * Organizer can apply a submitted score as official; alternatives are marked rejected
    * Public bracket still shows no official score until organizer applies/reviews it

* [x] Tournament WO and score reset v1

  * Notes:

    * Organizer can mark WO winner in group and knockout matches
    * WO uses technical score compatible with class scoring rules
    * Organizer can clear an official result and let brackets/classification recalculate

* [x] Tournament result origin labels v1

  * Notes:

    * Match cards now identify official result origin: Manual, Jogador or WO
    * Player-applied results keep origin after organizer approval
    * Existing score payloads remain backward compatible

* [x] Tournament match schedule display v1

  * Notes:

    * Match cards now show generated date, time and court
    * Uses existing agenda match keys and keeps export flow unchanged
    * Works for group and knockout matches

* [x] Player match schedule display v1

  * Notes:

    * Minhas partidas now shows generated date, time and court
    * Player WhatsApp result message includes schedule when available
    * Uses the same agenda match keys as organizer match cards

* [x] Tournament match confirmation v1

  * Notes:

    * Added Supabase-backed match confirmations
    * Player can confirm presence or report unavailable from Minhas partidas
    * Organizer match cards show confirmation/unavailable status by side

* [x] Player next match shortcut v1

  * Notes:

    * Tournament summary now highlights the player's next pending match
    * Shortcut shows schedule and quick confirmation actions
    * Sorts scheduled matches before unscheduled matches

* [x] Organizer unavailable alert v1

  * Notes:

    * Tournament organizer dashboard now surfaces unavailable player confirmations
    * Alert links back to match management
    * Shows affected match and side summary

* [x] Organizer unavailable WhatsApp action v1

  * Notes:

    * Organizer can open a WhatsApp message from unavailable alerts
    * Message includes tournament, class, phase, match and unavailable side(s)
    * Preserves confirmation data model

* [x] Tournament registration waitlist v1

  * Notes:

    * Added Supabase waitlist status for tournament registrations
    * Organizer can move pending registrations to waitlist individually or in bulk
    * Existing approval/member sync remains unchanged for approved registrations

* [x] Tournament waitlist promotion v1

  * Notes:

    * Organizer can approve waitlisted players directly from the waitlist filter
    * Waitlisted players can also be rejected without returning to pending
    * Approval still syncs tournament_members

* [x] Tournament registration open guard v1

  * Notes:

    * Supabase RPC now validates public registration requests before insert
    * RLS insert policy only allows self-registration while status is registration_open
    * Public invite page disables requests and explains closed/expired registration states

* [x] Home tournament confirmation reminders v1

  * Notes:

    * Player Home priorities now highlight tournament matches that still need presence confirmation
    * Unavailable player status is promoted as an urgent Home priority
    * Organizer Home priorities now surface tournament match unavailability without opening each event

* [x] Home tournament waitlist reminder v1

  * Notes:

    * Organizer Home priorities now show tournament waitlist counts
    * Waitlist reminder points to the tournament players area
    * Keeps pending registrations as urgent and waitlist as follow-up work

* [x] Home league availability reminder v1

  * Notes:

    * Player Home priorities now detect league matches waiting for availability
    * Matches without the player's availability are marked as urgent
    * Matches with availability already sent show a softer follow-up state

* [x] Home organizer league scheduling readiness v1

  * Notes:

    * Organizer Home priorities now show availability progress for league matches
    * Matches where every participant sent availability are marked as ready to schedule
    * Uses existing league_match_availability data without adding new tables

* [x] Home league deep links v1

  * Notes:

    * League match priorities now open directly on the matches tab
    * League registration priorities now open directly on the players tab
    * Uses the existing LeagueDetails tab query handling

* [x] Home tournament deep links v1

  * Notes:

    * Tournament match priorities now open directly on Jogos
    * Tournament registration and waitlist priorities now open directly on Jogadores
    * Tournament chat notices now use the explicit Chat route

* [x] Home urgent badge alignment v1

  * Notes:

    * Notification bell badge now counts urgent priority items only
    * Home pending summary now uses the same urgent priority count
    * League availability reminders are included in the pending count

* [x] Home notification grouping v1

  * Notes:

    * Notification panel now separates urgent pending work from follow-up items
    * Urgent items remain first and mirror the bell badge meaning
    * Mobile users can scan the notification drawer faster

* [x] Tournament schedule helpers extraction v1

  * Notes:

    * Moved pure tournament schedule helpers out of TournamentPage
    * Preserved agenda key, display and sorting behavior
    * Starts the TournamentPage refactor without changing UI behavior

* [x] Tournament score helpers extraction v1

  * Notes:

    * Moved score parsing, validation, formatting and origin helpers out of TournamentPage
    * Preserved manual, WO and player-submitted score behavior
    * Keeps score types reusable for future tournament components

* [x] Tournament lifecycle helpers extraction v1

  * Notes:

    * Moved tournament tab permission helpers out of TournamentPage
    * Moved generated/finished status inference out of TournamentPage
    * Preserved automatic live/finished status behavior after bracket changes

* [x] Tournament page utility extraction v1

  * Notes:

    * Moved player-name normalization, class-scope keys and clipboard fallback out of TournamentPage
    * Moved datetime-local conversion and score-config patch helpers out of TournamentPage
    * Keeps future tournament component split smaller and safer

* [x] Player profile activity summary v1

  * Notes:

    * Profile now shows active competitions as player and organizer
    * Profile activity uses existing tournament and league dashboard loaders
    * Adds first visible step toward player profile/history without new backend tables

* [x] Player tournament match history v1

  * Notes:

    * Profile now shows recent completed tournament matches for approved player registrations
    * Match history includes class, score and basic win/loss status
    * Uses existing tournament bracket payloads without adding new backend tables

* [x] Player league match history v1

  * Notes:

    * Profile match history now includes completed league/barragem matches
    * League history uses existing round match result payloads
    * Recent matches open directly into the league matches tab

* [x] Player recent stats v1

  * Notes:

    * Profile now summarizes loaded recent matches with wins, losses and win rate
    * Stats combine tournament and league history already shown on the profile
    * Keeps scope honest as recent visible performance, not global ranking yet

* [x] Player profile WhatsApp share v1

  * Notes:

    * Profile can generate a WhatsApp-ready player activity summary
    * Message includes location, active competitions, recent stats and latest match
    * Supports WhatsApp-first growth loop without new backend tables

* [x] Player match result sharing v1

  * Notes:

    * Recent profile matches can now be shared individually on WhatsApp
    * Message includes source competition, class, matchup, score and result
    * Supports the Share results growth loop from existing match history

* [x] Player achievements v1

  * Notes:

    * Profile now shows first achievement badges from real profile and activity data
    * Includes profile completion, active player, first win and organizer milestones
    * Keeps gamification visible without adding premature XP or ranking tables

* [x] Activity feed v1

  * Notes:

    * Home now shows a recent activity feed from announcements, active competitions and upcoming public events
    * Feed items deep-link to the relevant tournament, league or chat context
    * Uses existing data already loaded by Home instead of adding a premature social posts table

* [x] Match posts v1

  * Notes:

    * Profile now generates a ready-to-copy post from the latest recent match
    * Post text can be copied or shared directly to WhatsApp
    * Delivers the Match posts loop before introducing persistent social tables

* [x] Win streaks v1

  * Notes:

    * Profile now calculates current and best recent win streaks from visible match history
    * Streak data appears in the activity area and profile WhatsApp summary
    * Adds a streak-based achievement without introducing premature ranking tables

* [x] XP/level system v1

  * Notes:

    * Profile now shows player level, XP and progress to the next level
    * XP is calculated from profile completion, active competitions, recent matches, wins, streaks and achievements
    * Keeps gamification useful before adding persistent season/city ranking tables

* [x] Trophy history v1

  * Notes:

    * Profile now shows recent trophy milestones from visible player activity
    * Trophy history includes first win, win streak, active player and organizer milestones
    * Uses existing profile and match data before adding persistent trophy tables

* [x] Statistics v1

  * Notes:

    * Profile now breaks recent match history into tournaments, leagues, competitions and most played class
    * Adds a simple performance label from current recent win rate
    * Uses visible match history as the first statistics layer before global ranking history

* [x] Head-to-head v1

  * Notes:

    * Profile now surfaces frequent recent opponents from visible match history
    * Shows recent win/loss split and competition source for each opponent
    * Uses match titles as a first-pass signal until structured opponent history is persisted

* [x] Ranking history v1

  * Notes:

    * Profile now shows a recent evolution timeline with level, XP, performance, streak and volume
    * Timeline avoids pretending there is an official global rank before persistent ranking tables exist
    * Gives the player a visible progression layer ready for future city/club/season rankings

* [x] Player profile v1

  * Notes:

    * Profile now has a clear identity header with completion, level, performance and active-player status
    * Player profile section is aligned with match history, stats, achievements, trophies and ranking evolution already implemented
    * Main MD checklist now reflects the delivered v1 player-experience surface

* [x] Home league weekly agenda v1

  * Notes:

    * Home now surfaces a league agenda for matches/actions due in the next 7 days
    * Agenda items deep-link to the league matches tab
    * Supports the reminder/retention loop before adding scheduled push/WhatsApp delivery

* [x] League reminder copy v1

  * Notes:

    * Home weekly agenda now generates a ready-to-copy reminder message for each league action
    * Reminder includes league, round, match/action, date and expected status/action
    * Provides a manual WhatsApp-friendly reminder path before automated notification delivery

* [x] League reminder WhatsApp v1

  * Notes:

    * Home weekly agenda can now open the reminder text directly in WhatsApp
    * Keeps the league match deep link behavior while adding a clear share action
    * Advances WhatsApp-first reminders before automated notification infrastructure

* [x] Home tournament agenda v1

  * Notes:

    * Home weekly agenda now also includes pending tournament match actions
    * Tournament agenda reminders can be copied or opened directly in WhatsApp
    * Creates one daily agenda surface across leagues and tournaments

* [x] Tournament reset status guard v1

  * Notes:

    * Saving after resetting tournament draws no longer leaves an event stuck as live without generated matches
    * Reset draw now persists back to registration_closed when the event had been live/finished
    * Full reset persists back to draft when all categories/classes are removed

* [x] Tournament match status legend v1

  * Notes:

    * Tournament match view now includes a visible status legend for pending, finalized, WO and player-origin results
    * Supports the Match status indicators guideline item without changing scoring behavior
    * Main checklist now marks automatic bracket generation and match status indicators as delivered v1

* [x] Core execution roadmap v1

  * Notes:

    * Added priority execution layer without deleting macro product vision or completed history
    * Refocused next work on core player/organizer flows, tournament operations and league confidence
    * Updated Next Priority to prevent drifting into non-core enhancements

* [x] Tournament organizer pending center v1

  * Notes:

    * Added one organizer panel for registrations, waitlist, result reviews, availability alerts, incomplete classes and pending matches
    * Added tournament-level completion blockers
    * Preserved existing result submission, confirmation and registration flows

* [x] Tournament class completion guard v1

  * Notes:

    * Completion guard now shows readiness per class
    * Each class links back to its games and shows pending matches/reviews/availability blockers
    * Preserved tournament lifecycle inference

* [x] Mobile/desktop navigation audit v1

  * Notes:

    * Main nav keeps Competicoes as the shared hub
    * Profile shortcuts now open role-specific lists or the selected competition directly
    * Tournament and league detail return paths already preserve player/organizer context

* [x] League standings confidence pass v1

  * Notes:

    * League detail now loads league_players for the selected season
    * Shows standings by class with wins, set/game saldo, ranking points and sobe/desce zones
    * Preserves existing scheduler, match room and season movement functions

* [x] League season closing guard v1

  * Notes:

    * Organizer now sees blockers before season closing
    * Checklist covers classes, active players, target rounds, pending matches, disputes and pending registrations
    * Does not alter auto-finalize or movement functions

* [x] Tournament completion helper extraction v1

  * Notes:

    * Moved class readiness calculation out of TournamentPage
    * Preserved organizer completion guard behavior
    * Keeps TournamentPage refactor focused on core flow only

* [x] League match state and closing actions v1

  * Notes:

    * Added unified operational state for league matches
    * League overview now separates scheduling, result, confirmation and admin intervention queues
    * Season guard can apply sobe/desce through the existing movement RPC when ready

* [x] Tournament match operational state v1

  * Notes:

    * Added unified state for tournament match cards
    * Cards now distinguish schedule, confirmation, unavailable, result review and finished states
    * Preserves existing confirmation/result/WO data model

* [x] League scheduler visibility v1

  * Notes:

    * Added owner-scoped RPC for scheduler runs
    * League admin can see recent round generation and season finalization events
    * Preserves service-role scheduler execution model

* [x] Court booking request v1

  * Notes:

    * Added courts and booking requests linked to places
    * Players can request a court time; owners can confirm or cancel
    * Payment, recurrence and advanced calendar remain later

* [x] Home court booking reminders v1

  * Notes:

    * Home agenda now includes upcoming court reservations
    * Home priorities now include owner approval pendings
    * Uses existing Places booking flow; no payment/recurrence added

* [x] Place academy classes v1

  * Notes:

    * Added classes/aulas linked to places
    * Players can send enrollment interest; owners can activate or cancel
    * Kept payments, plans and staff permissions for later

* [x] League ranking snapshots v1

  * Notes:

    * Added owner RPC to save current season ranking snapshot
    * League standings panel now shows saved ranking history
    * Reuses existing league_ranking_snapshots table

* [x] City/club/season rankings v1

  * Notes:

    * Ranking page now uses real league standings
    * Supports general, city and league/season scopes
    * Keeps advanced ranking formulas for later

* [x] Follow/friend system v1

  * Notes:

    * Added user follow graph
    * Ranking page can follow/unfollow visible athletes
    * Feed and notifications stay later

* [x] Open matches / find partners v1

  * Notes:

    * Places page now supports open match calls
    * Players can join calls; creators can close/cancel
    * Payments and automated matching stay later

* [x] Place memberships and member pricing v1

  * Notes:

    * Added club/place membership plans with monthly fee and member discounts
    * Players can request membership; admins activate/cancel and mark offline/manual monthly payments
    * Student/member platform payments stay webhook-driven; no player-side manual confirmation
    * Places and Home surface pending member requests for operators

* [x] Academy progress tracking v1

  * Notes:

    * Added progress notes linked to academy enrollments
    * Managers/coaches can register level, focus and evolution notes per student
    * Students can read their latest progress note in the academy flow

* [x] Academy coach commissions v1

  * Notes:

    * Added commission percentage per coach
    * Academy panel estimates monthly commission from active students and class monthly fees
    * Full payout closing/reporting stays for financial dashboard later

* [x] Place CRM contacts v1

  * Notes:

    * Added manager-only CRM contacts per place
    * Operators can track source, interest, notes and status from lead to converted
    * Deeper automations and funnels stay for later

* [x] Place POS and finance v1

  * Notes:

    * Added products, snack bar/shop sales and expense records per place
    * Managers can register POS sales, cancel sales, register expenses and cancel expenses
    * Places dashboard now shows POS revenue, expenses and operational balance
    * Gateway, fiscal flows, payouts and deeper finance reports stay later

* [x] Place organizations / multi-unit v1

  * Notes:

    * Added organization records for grouping multiple places/units under one owner
    * Places can be created inside an existing organization or create a new organization inline
    * Full org roles, cross-unit dashboards and super admin stay for later

* [x] Place staff role permissions v1

  * Notes:

    * Added staff role helpers for owner, manager, coach and frontdesk
    * Frontdesk focuses on bookings/waitlist; coach focuses on academy workflows; manager/owner keeps finance and settings
    * Backend permission helpers and frontend gates now match the most common paid-club operating model

* [~] Payment reminders v1

  * Notes:

    * Added payment reminder records for memberships, academy monthly fees and court bookings
    * Admins can register manual reminders from unpaid member/student rows
    * Real WhatsApp/email/push delivery remains for the notification engine

* [x] Comments/reactions on match posts v1

  * Notes:

    * Open match calls now support comments and likes
    * Keeps the social layer tied to real play intent
    * No feed ranking or moderation tools yet

* [x] Notification preferences and scheduled reminders v1

  * Notes:

    * Added per-user reminder preferences
    * Profile page can configure match, booking and social reminder categories
    * Automated push/email/WhatsApp engine remains later

* [x] Place staff permissions v1

  * Notes:

    * Place owners can add staff by email
    * Staff can operate courts, bookings and academy workflows
    * Granular cross-product permissions remain later

* [x] Place operational analytics v1

  * Notes:

    * Place owner cards show booking, academy, open match and court counts
    * Uses data already loaded by Places
    * Revenue analytics remains later with payments

* [x] Calendar export integration v1

  * Notes:

    * Home agenda can export items as .ics calendar files
    * Complements existing copy/WhatsApp reminders
    * No automated external sync added

* [x] League common availability v1

  * Notes:

    * League match rooms now highlight exact shared availability slots
    * Uses existing league_match_availability data
    * Advanced overlap suggestions remain later

* [x] League admin dispute resolution v1

  * Notes:

    * Added owner RPC to resolve disputed league matches with an official admin result
    * Resolution updates match status, round result and standings through the existing ranking application function
    * Pending submissions are preserved as history and marked rejected when admin resolves

* [x] Court blocking and cancellation rules v1

  * Notes:

    * Place owners/staff can block court time slots using the existing booking flow
    * Blocked slots prevent overlapping reservations and can be released later
    * Owners/staff can cancel pending, confirmed or blocked court bookings

* [x] Academy resource scheduling v1

  * Notes:

    * Added academy coaches as managed resources for places
    * Academy classes can be linked to coach and court
    * Owners/staff can open reusable academy time slots before filling them with classes
    * Open academy slots must be tied to a specific coach because each coach has an independent agenda
    * Open slots can be selected to prefill a class and become assigned after class creation
    * Coach/court conflicts are blocked at database level and signaled in the admin UI
    * Resource panel shows coach/court occupation and open slots by weekday

* [x] Academy attendance v1

  * Notes:

    * Added attendance records for active academy enrollments
    * Owners/staff can mark present or absent from the class list
    * Class cards show today's present count with student capacity

* [x] Court calendar v1

  * Notes:

    * Places page shows a day calendar grouped by court
    * Calendar includes active reservations and blocked slots
    * Uses existing court booking data and shows recurring series reservations

* [x] Recurring court bookings v1

  * Notes:

    * Players/admins can request weekly recurring court bookings from the existing booking form
    * Database validates all generated weeks before inserting the series
    * Series metadata is shown in booking cards
    * Players/admins can cancel future bookings in the same series

* [x] Court waitlist v1

  * Notes:

    * Players can join a waitlist for a desired court/time
    * Owners/staff can see waiting players, mark invited or remove entries
    * Owners/staff can promote waiting/invited entries into confirmed court bookings

* [~] Payment stub v1

  * Notes:

    * Added app_payments table and stub provider flow
    * Court booking payment opens a confirmation modal and records status paid
    * Tournament registration payment opens a confirmation modal and records status paid
    * League public/link registration payment opens a confirmation modal and records status paid
    * Admins can define tournament registration fees, league registration fees and court booking fees
    * Tournament/league admins can mark offline/manual registration payments as paid in stub mode
    * Admin areas show paid counts and stub revenue for tournament registrations, league registrations and court bookings
    * Academy classes can define a monthly fee and enrollment interest waits for platform/webhook confirmation
    * Admins can mark academy monthly payments manually in stub mode for balcão/PIX outside platform
    * Academy enrollment payments now support billing periods for monthly fee cycles
    * Player-facing tournament, league and court flows no longer ask the student to mark payment manually
    * Student payments are represented as platform/webhook-confirmed while admin manual marking remains for offline/balcão cases
    * Payment rows now default to pending and the old student-side paid RPC is guarded
    * Manual admin/offline payment marks use provider manual instead of pretending to be platform payment
    * Designed so future Edge Function/webhooks replace the stub confirmation path

* [x] Academy makeup credits v1

  * Notes:

    * Absence marking can generate an open makeup credit for the student
    * Owners/staff can mark open makeup credits as used
    * Students can see when a makeup credit is available

* [x] Court occupancy analytics v1

  * Notes:

    * Court calendar now shows daily reservation count, reserved hours, blocked hours and estimated occupancy
    * Uses existing booking/blocking data without adding a reporting table

* [x] Place access and plan visibility v1

  * Notes:

    * Added place product plans: reservations, academy, pro and multi-unit
    * Places can now hide booking, academy, CRM, finance and membership tools by plan
    * Staff roles now align operational tools: manager, frontdesk and coach
    * Academy attendance, makeup and progress RPCs now accept academy-role operators
    * Places page now maps common permission/duplicate/reference failures to friendlier user messages
    * Places page now loads internal resources by plan/role instead of fetching every tool for every user
    * Academy conflict guard now checks open slots against active classes and validates time ranges
    * Booking RPCs now respect booking-role permissions for frontdesk operations
    * Place cards now show plan, user role and enabled feature chips
    * Player view now avoids internal payment wording and shows a simple follow note for monitor-only places

* [x] Home comfortable empty states v1

  * Notes:

    * Player Home now gives direct actions to find tournaments, leagues and places when no active competition exists
    * Home shows a calm "Tudo em dia" state when there are no priorities, agenda items or recent updates
    * Keeps player-first navigation visible without adding organizer clutter

* [x] Competicoes role comfort v1

  * Notes:

    * Competicoes hub now shows a player empty state with direct player paths when no active event exists
    * Organizer tools expand into the full management block only after the user has competitions under management
    * First-time organizers still have a compact create path without overwhelming player-only users

* [x] Competition list empty-state guardrails v1

  * Notes:

    * Tournament list now distinguishes true empty state from "filters returned no results"
    * Player league empty state returns to the Competicoes hub instead of leaving the user stranded
    * League creation now blocks empty names before submit

* [x] Tournament and league flow test pass v1

  * Notes:

    * Lint and production build pass after tournament/league smoke validation
    * Fixed league settings so result deadline no longer mirrors round interval
    * Solo organizer flow is covered; larger events still need tournament/league staff permissions

* [x] Payment webhook guardrail review v1

  * Notes:

    * Closed old student-side paid RPC path left by the billing-period stub
    * Frontend payment helper now targets the guarded platform-confirmed path
    * Tournament registration no longer fails visually when payment lookup is unnecessary

* [x] Academy role UX pass v1

  * Notes:

    * Added class metadata for level, gender, adult/kids and age range
    * Admin can link coaches/students by login or keep offline student records
    * Students can see class court/classmates and report planned absences for makeup/avulsa slots
    * Coaches see their own classes, students, attendance, progress and commission estimate without finance tools

* [x] Academy lesson fit requests v1

  * Notes:

    * Planned absences now feed a practical replacement/drop-in lesson queue
    * Users can search fit slots by date, level, period, coach, age and gender scope
    * Staff can approve/reject requests and finance can mark drop-in lesson payment manually until webhook
    * Presence confirmation was de-emphasized in favor of absence notice and operational fit allocation

* [x] Court availability and member pricing v1

  * Notes:

    * Courts now support public and member rental prices
    * Users can search available courts for a selected time before booking
    * Court booking creates a pending platform payment record and blocks the slot
    * Booking, academy class and academy slot flows now guard against court overlap

## In Progress

* [~] Tournament UX stabilization

  * Notes:

    * Tournament page is functional but too large
    * Result submission review/apply exists; manual admin override polish remains in scoring UX
    * Match cards now expose state and next action for player/admin
    * Completion helper extraction started without changing behavior
    * Next step: split focused core pieces only when behavior is already clear

* [~] League/barragem retention loop

  * Notes:

    * Scheduler, rounds, match room, availability and chat exist
    * Player league actions added to home
    * Organizer league pending actions added to home
    * Standings and season closing guard added to league detail
    * Match room now shows clear operational state and next action
    * Scheduler run history is visible to the league organizer
    * Next step: validate auto-finalize with real finished season data

* [~] Competition staff operations

  * Notes:

    * Places already has staff roles for manager/frontdesk/coach
    * Tournaments and leagues still rely mostly on owner-only management helpers
    * Needed for larger events with check-in, registrations, results, chat and finance handled by staff

## Blocked

* [ ] Native mobile app

  * Notes:

    * Expo app currently placeholder
    * Web responsive flow should stabilize before full native implementation

## Next Priority

* [~] Mobile/desktop navigation audit

  * Notes:

    * V1 checked main nav, Competicoes hub, profile shortcuts and detail return paths
    * Remove duplicated or confusing body navigation only when menu already covers it

* [~] Tournament admin pending center

  * Notes:

    * V1 centralized in organizer tournament panel
    * Covers registrations, waitlist, result reviews, availability alerts, incomplete classes and pending matches
    * Must preserve existing tournament payload and result submission behavior

* [~] Tournament completion guard

  * Notes:

    * V1 shows tournament-level blockers before finishing
    * Class-level readiness now appears in the organizer completion guard
    * Keep automatic live/finished status inference

* [~] League standings confidence pass

  * Notes:

    * V1 displays standings and movement zones from league_players
    * Organizer can apply movements manually when guard is ready
    * Scheduler history now exposes season_finalized events for validation
    * Still needs validation with a real finished season after auto-finalize
    * Keep scheduler and match room behavior compatible

* [ ] Refactor TournamentPage into smaller modules

  * Notes:

    * Do only after admin pending/completion flow is clearer
    * Preserve payload compatibility
    * First safe extraction moved completion readiness helper out of the page
    * Separate player view, admin setup, players/registration, chat and score handling gradually

---

## END OF DOCUMENT
