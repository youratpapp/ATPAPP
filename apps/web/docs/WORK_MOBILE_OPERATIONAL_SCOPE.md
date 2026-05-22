# Work Mobile Operational Scope

Date: 2026-05-21  
Status: proposal, no implementation yet.  
Scope: mobile Trabalho as an operational tool, not a reduced copy of the complete SaaS web.

## Mobile Work Thesis

The mobile Trabalho layer should answer:

- What do I need to solve now?
- What do I have today?
- Who do I need to contact?
- Which result/payment/reservation/class needs a simple action?
- What can I safely complete on a phone?

It should not attempt to expose every SaaS web module, every setup form or every report.

## What Mobile Trabalho Is

| Mobile role | Primary job |
|---|---|
| Professor | See day agenda, open class, see students, record planned absence/replacement/progress, optional attendance if company enables it. |
| Recepcao/frontdesk | Create reservation, check day schedule, contact clients, handle waitlist, cancel/reschedule, quick client lookup. |
| Financeiro | See overdue/today receivables, send reminder, mark paid, register simple expense if allowed. |
| Caixa | Sell item fast, see sales today, see low stock, optionally flag/replenish. |
| Gestor | See critical blockers, approve/reject simple pending actions, open deep web route when needed. |
| Organizador | Operate current tournament/league phase, approve registrations, publish communication, launch/validate results. |
| Scorekeeper | Launch results and resolve result queue. |
| Check-in | Validate participants and registrations. |
| Media | Send announcement, copy/share publication material. |

## What Mobile Trabalho Is Not

| Not mobile-first | Reason |
|---|---|
| Complete place setup | Too many dependencies and edge cases; web only. |
| Product plan change | Admin/billing-sensitive; web only. |
| Staff role/permission design | High-risk; web only except accept/decline own invite. |
| Court/rule/pricing setup | Needs context, validation and review. |
| Full finance reports | Analysis belongs to SaaS web. |
| CRM full pipeline administration | Mobile should show due follow-ups, not entire CRM setup. |
| Complex class/tournament/league configuration | Requires web workspace. |
| Tournament reset/delete/backup | Dangerous; web advanced only. |
| League scoring rules setup | Web only. |
| Full inventory/product catalog management | Web first; mobile may create product only if explicitly allowed later. |

## Mobile Home: Trabalho Hoje

### Universal Mobile Layout

1. Topbar with logo, active role/context, `Jogador / Trabalho` selector.
2. Active unit or competition context.
3. One role-specific hero/summary card.
4. Critical queue cards.
5. Primary CTA.
6. Secondary quick actions.
7. Compact bottom navigation based on role.

### Empty State Rule

Every empty state must explain the next step:

- "Voce nao tem aulas hoje. Veja sua agenda semanal ou aguarde uma turma vinculada."
- "Nenhuma reserva pendente. Use Nova reserva para atender um cliente agora."
- "Sem recebiveis vencidos. Veja recebiveis de hoje ou resumo financeiro."
- "Nenhuma competicao em operacao. Crie uma competicao pelo SaaS web ou abra rascunhos."

## Role-Specific Mobile Navigation

These are operational destinations, not full SaaS modules.

| Role | Bottom nav target |
|---|---|
| Professor | Hoje, Agenda, Turmas, Alunos, Perfil |
| Recepcao | Hoje, Reservas, Clientes, Aulas, Mais |
| Financeiro | Receber, Pagos, Despesas, Resumo, Perfil |
| Caixa | Vender, Hoje, Estoque, Produtos, Perfil |
| Organizador | Hoje, Torneios, Ligas, Publicacao, Perfil |
| Gestor | Hoje, Agenda, Aulas, Financeiro, Mais |
| Scorekeeper | Hoje, Resultados, Jogos, Chat, Perfil |
| Check-in | Hoje, Inscritos, Check-in, Chat, Perfil |
| Media | Hoje, Publicar, Chat, Resumo, Perfil |

The `Mais` destination should not become a hidden module dump. It should contain only safe secondary actions and a link to "Abrir SaaS web" for complex administration.

## Mobile Function Classification

| Function | Mobile fit | Mobile behavior |
|---|---|---|
| Accept/decline professional invite | Yes | First-run card. |
| Switch unit/context | Yes | Compact selector. |
| See critical blockers | Yes | Work Today queue. |
| Create reservation | Yes | Short wizard from calendar/reservations. |
| Edit reservation | Partial | Change time/client/notes if allowed; complex series on web. |
| Cancel reservation | Yes | Confirmation + WhatsApp communication. |
| Reschedule reservation | Yes | Open day agenda selector; preserve paid status. |
| Mark booking paid | Yes | Payment stub modal. |
| Send booking WhatsApp | Yes | Contextual prepared message. |
| Promote waitlist | Yes | One-card action when slot exists. |
| Create court | No | Web config. |
| Change booking rules/prices | No | Web config. |
| Teacher day agenda | Yes | Day by hour, class/student/court details. |
| Open class detail | Yes | Sheet/detail page. |
| Attendance/chamada | Conditional | Only if company setting `requireAttendanceCall` is true. |
| Planned absence | Yes | Record notice and generate replacement flow if configured. |
| Makeup fit | Yes, simplified | Show nearest slots and confirm. |
| Create class | No by default | Web setup; mobile only future quick draft. |
| Enroll student | Partial | Frontdesk can quick enroll; complex contracts on web. |
| Student progress note | Yes for coach | Student detail sheet. |
| Edit student contract/payment | No | Web/finance except mark paid stub. |
| CRM follow-up | Yes | Due contacts, WhatsApp, mark contacted/converted. |
| Full CRM search/filter | Partial | Quick search and due queue only. |
| Membership approval | Yes | Approve/cancel pending member if permission. |
| Membership plan setup | No | Web revenue/config. |
| Receivables | Yes for finance | Overdue/today/all compact list. |
| Send payment reminder | Yes | One or batch from finance role. |
| Mark paid | Yes | Payment stub modal. |
| Expense create | Partial | Simple expense entry for finance role. |
| Finance overview/report | Partial | Summary only; detailed reports web. |
| POS sale | Yes | Cashier primary flow. |
| POS sales today | Yes | List and cancel if authorized. |
| Low stock | Yes | Alert and product list. |
| Product setup | Partial | View/flag; create product web or authorized mobile later. |
| Staff invite/roles | No | Web admin. |
| Remove staff | No | Web admin. |
| Settings/public profile | No | Web config. |
| Tournament registration review | Yes | Approve/waitlist/reject, payment stub. |
| Tournament draw generation | Partial | Prefer web; mobile only owner simple action after confirmation. |
| Tournament result entry | Yes | Scorekeeper/mobile event core. |
| Tournament WO/clear result | Partial | Authorized with strong confirmation. |
| Tournament publication/chat | Yes | Media/owner action. |
| Tournament backup/reset/delete | No | Web advanced only. |
| League current round | Yes | Participant/owner view. |
| League generate next round | Partial | Owner mobile if no conflicts; web preferred. |
| League submit/confirm result | Yes | Mobile core. |
| League settings | No | Web config. |

## Mobile Flows By Persona

### Professor

1. Open Trabalho.
2. Land on day agenda.
3. See next class by hour, court, group and students.
4. Open class.
5. If attendance required, mark present/absent. If not required, see students, notices and replacements.
6. Record planned absence/replacement or progress note.
7. Return to agenda.

Mobile should not show finance, cantina, team, settings or full CRM to coach-only users.

### Recepcao

1. Open Trabalho.
2. See reservations today, upcoming check-ins and waitlist.
3. Use primary CTA `Nova reserva`.
4. Search/choose court/time/client.
5. Confirm reservation/payment state.
6. If conflict/cancel/reschedule, send WhatsApp message and use reschedule flow.
7. Return to reservations today.

Mobile should not force the receptionist through setup tabs.

### Financeiro

1. Open Trabalho.
2. Land on overdue/today receivables.
3. Open receivable.
4. Send reminder or mark paid.
5. See paid list and simple expense entry.

Mobile should not show class operations, POS catalog or staff settings.

### Caixa

1. Open Trabalho.
2. Land on `Vender`.
3. Select product or quick manual item.
4. Confirm sale.
5. See day total and low-stock alerts.

Mobile should not show broad finance receivables.

### Gestor

1. Open Trabalho.
2. See critical blockers by unit.
3. Tap the highest priority blocker.
4. Approve/reject/resolve simple action.
5. If complex, use CTA `Abrir no web`.

Gestor mobile is not a full dashboard. It is an alert and approval console.

### Organizador

1. Open Trabalho.
2. See competition list grouped by phase/blocker.
3. Open current event cockpit.
4. Perform phase action: registrations, publish, result, chat.
5. Deep setup remains web.

Organizer mobile should never feel like public discovery.

## Notification To Action Model

| Notification | Opens mobile action |
|---|---|
| Reservation conflict/cancellation | Reservation detail with WhatsApp/reschedule. |
| Waitlist slot available | Waitlist card with promote/contact. |
| Class replacement request | Replacement fit sheet. |
| Payment overdue | Receivable detail with reminder/mark paid. |
| Tournament result pending | Match result form. |
| League result conflict | Owner validation sheet. |
| Staff invite | Accept/decline card. |

## When Mobile Should Redirect To Web

Use a clear, non-blocking message:

```text
Essa acao precisa de mais contexto.
Abra o SaaS web para configurar regras, permissoes ou relatorios completos.
```

Examples:

- setup court rules;
- create/modify product plan;
- staff role changes;
- tournament reset/delete;
- league scoring rules;
- detailed financial reports;
- multiunit configuration.

## Mobile QA Acceptance

For each role, validate:

- 390px width;
- 430px width;
- no horizontal overflow;
- CTA appears before deep lists;
- bottom nav is role-specific;
- no forbidden module appears;
- no setup rare action competes with routine;
- empty state explains next step;
- action completion returns to a logical next screen;
- selector `Jogador / Trabalho` remains visible and consistent.

## Recommended Mobile Implementation After Web IA Approval

1. Define one mobile Work shell with role-based home.
2. Replace module-tree bottom nav with role action nav.
3. Build reusable action sheets: payment stub, WhatsApp message, reservation edit, class detail, result entry.
4. Keep complex setup as web-only links.
5. QA each role independently before enabling multi-role switching.
