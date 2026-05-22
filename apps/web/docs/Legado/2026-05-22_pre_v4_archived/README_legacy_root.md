# ATP App Docs Index

Data: 2026-05-15

## Ordem De Leitura Atual

Para qualquer sprint de reestruturacao, leia nesta ordem:

1. `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
2. `EXECUTION_QUEUE.md`
3. `ROLE_BASED_RESTRUCTURE_QUEUE.md`
4. `ROLE_VISIBILITY_MATRIX.md`
5. `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`
6. Spec da superficie:
   - `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
   - `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
   - `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
7. Plano UX da superficie:
   - `PLAYER_APP_V2_UX_PLAN.md`
   - `COMPETITION_OS_V2_UX_PLAN.md`
   - `MANAGEMENT_OS_V2_UX_PLAN.md`
8. MD funcional especifico da area:
   - `ACADEMY_MODULE_FUNCTION_MAP.md`
   - `ACADEMY_V2_UX_PLAN.md`
   - `AGENDA_MODULE_FUNCTION_MAP.md`
   - outros `*_MODULE_FUNCTION_MAP.md`
9. Codigo real.

## Politica

Os MDs antigos continuam validos como inventario de funcoes, regras e backend. Eles nao devem ser usados para trazer de volta:

- dashboards pesados para jogador;
- cards empilhados sem acao;
- formularios longos de setup;
- menus profissionais para perfil errado;
- duplicidades entre areas;
- tabs escondidas;
- KPIs sem utilidade operacional.

Quando houver conflito, preserve a funcao e siga a arquitetura v2.

## Docs De Sprint

- `ROLE_BASED_RESTRUCTURE_SPRINT_GUIDE.md`: como executar sprint.
- `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`: backlog por sprint.
- `ROLE_BASED_RESTRUCTURE_TASK_SPECS.md`: briefing de produto/UX/engenharia por task.

## Pasta `LEGADO UTIL`

Mantida como espelho e historico util. Nao deve ter prioridade maior que os specs v2.

