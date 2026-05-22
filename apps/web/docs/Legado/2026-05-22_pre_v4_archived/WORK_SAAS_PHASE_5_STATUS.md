# Work SaaS Phase 5 Status - Aulas And Professor Operations

Date: 2026-05-21

## Status

Phase 5 is implemented in the current sprint as a frontend/product layer pass, with one database gate still noted from Phase 0B.

## Queue Items

| Item | Status | Notes |
|---|---|---|
| WSAAS3-19 Aulas Web Domain | Done | The academy wording now treats Aulas as class operation: agenda, turmas, alunos, avisos, reposicoes and evolution. Staff permission/config language is pushed toward resources/admin instead of the daily routine. |
| WSAAS3-20 Professor Mobile Operation | Done | Teacher calendar is day-first and uses full-hour slots, showing turma, quadra, alunos, extras and avisos previos. The primary action changes between `Abrir aula` and `Abrir chamada` based on the setting. |
| WSAAS3-21 Attendance Optional Default Off | Done in UI/code, DB gated | `requireAttendanceCall` defaults to false in frontend fallbacks and controls every chamada surface. Remote DB must still have `place_academy_settings.require_attendance_call` migrated before relying on persisted settings everywhere. |
| WSAAS3-22 Student Detail Responsive Pattern | Done | Student detail uses the shared drawer/sheet with a wide desktop layout, mobile single-column layout, scrollable body and dark action footer. |
| WSAAS3-23 Aulas QA | Partial | TypeScript passed. Visual QA still needs browser screenshots after the next full run. |

## Product Decisions Applied

- Tennis classes do not require school-style attendance by default.
- If `requireAttendanceCall` is off, the professor sees `Abrir aula`, student list, avisos previos and reposicoes.
- If `requireAttendanceCall` is on, attendance controls reappear without changing the route structure.
- Reposicao is positioned as the result of planned absence/aviso previo, not automatic no-show handling.

## Files Changed

- `src/App.css`
- `src/components/place/PlaceAcademyResourcesModule.tsx`
- `src/components/place/PlaceAcademyStudentsModule.tsx`
- `src/components/place/PlaceAcademyTeacherCalendarModule.tsx`
- `src/components/place/PlaceAcademyTodayModule.tsx`
- `src/lib/place-management.ts`
- `src/pages/ManagementHubPage.tsx`
- `src/pages/PlacesPage.tsx`

## Validation

- `npx.cmd tsc -b --pretty false` passed.

## Remaining Risk

- The database migration `supabase/migrations/0099_academy_optional_attendance_call.sql` must be applied in the target project. Without it, persisted attendance settings can fail on remote environments, although local fallbacks keep the UI safe.
