# Docs Source Of Truth Index - 2026-05-22

Status: indice executivo atual da documentacao do ATP.

Objetivo: reduzir conflito entre MDs antigos e as normativas atuais de produto, UX e arquitetura de informacao.

## 1. Fonte Executiva Atual

Use estes arquivos para qualquer decisao estrutural nova:

1. `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
2. `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`
3. `WORK_SAAS_UX_ORGANIZATION_EXECUTION_QUEUE_V4_2026_05_22.md`
4. `EXECUTION_QUEUE.md`
5. `WORK_SAAS_V4_EXECUTION_REPORT_2026_05_22.md`

## 2. Contratos E Mapas Ativos

Use estes arquivos para entender funcoes, permissoes, rotas, mobile e responsabilidades:

- `WORK_AREA_FUNCTION_INVENTORY.md`
- `WORK_SAAS_DETAILED_USER_FLOWS.md`
- `WORK_SAAS_INFORMATION_ARCHITECTURE.md`
- `WORK_MOBILE_OPERATIONAL_SCOPE.md`
- `WORK_SAAS_PAGE_RESPONSIBILITIES.md`
- `WORK_SAAS_RESTRUCTURE_ROADMAP.md`
- `WORK_SAAS_ROUTE_COMPATIBILITY_CONTRACT_V3.md`
- `WORK_SAAS_PERMISSION_CONTRACT_V3.md`
- `WORK_MOBILE_AND_SAAS_RESTRUCTURE_EXECUTION_PLAN_2026_05_22.md`

## 3. Evidencias Ativas

Use estes arquivos como prova de teste, nao como nova direcao de produto:

- `WORK_SAAS_REAL_USER_FLOW_TEST_REPORT_2026_05_21.md`
- `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`
- `WORK_SAAS_QA_ACCEPTANCE_MATRIX.md`
- `TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`
- `LEAGUE_E2E_FLOW_AUDIT_2026_05_21.md`
- `ACADEMY_E2E_FLOW_AUDIT_2026_05_21.md`
- `WORK_SAAS_SCREENSHOT_BASELINE_INDEX_2026_05_21.md`
- `WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md`

## 4. Banco E SQL

Use estes arquivos para estado de migrations e aplicacao SQL:

- `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`
- `SUPABASE_SQL_APPLICATION_RUNBOOK_2026_05_21.md`

## 5. Estudos De Apoio

Estes documentos ainda podem apoiar decisoes especificas, mas nao substituem a V4:

- `ATP_FINANCE_WORKFLOW_STUDY_2026_05_21.md`
- `NAVIGATION_WORKSPACE_RESTRUCTURE_V4.md`

## 6. Legado

Documentos antigos, queues V1/V2/V3, auditorias intermediarias e relatorios de sprint foram movidos para:

`Legado/2026-05-22_pre_v4_archived/`

Use legado apenas para:

- confirmar historico;
- recuperar inventario antigo;
- entender por que uma decisao foi abandonada;
- consultar evidencias que nao existam nos docs ativos.

Nao use legado para:

- definir menu atual;
- definir ordem de implementacao;
- justificar mobile Trabalho pesado;
- reabrir UX antiga;
- concluir que uma area esta aprovada porque uma sprint antiga foi marcada como completa.

## 7. Regra De Conflito

Quando dois MDs discordarem:

1. V4 Master Spec vence.
2. V4 Execution Queue vence.
3. Contratos ativos de rota/permissao vencem docs antigos.
4. Evidencias recentes vencem auditorias antigas.
5. O codigo real vence suposicoes documentais, mas nao deve virar desculpa para preservar UX ruim.

