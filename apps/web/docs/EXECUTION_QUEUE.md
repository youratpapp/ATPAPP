# Execution Queue Atual - 2026-05-22

Status: fila executiva saneada apos arquivamento das queues antigas.

Arquivo legado original arquivado em:

`Legado/2026-05-22_pre_v4_archived/EXECUTION_QUEUE.md`

## Fonte Principal

A fila estrutural atual e:

`WORK_SAAS_UX_ORGANIZATION_EXECUTION_QUEUE_V4_2026_05_22.md`

O relatorio de execucao atual e:

`WORK_SAAS_V4_EXECUTION_REPORT_2026_05_22.md`

## Status Da Queue V4

- V4-00 a V4-16: executados em primeira camada e registrados no MD da queue V4.
- Correcoes posteriores registradas no relatorio V4:
  - Reservas como calendario operacional.
  - WhatsApp/edicao/pagamento em reservas.
  - Calendario operacional em hora cheia.
  - Aulas sem submenu pesado.
  - Chamada opcional por academia, desligada por padrao.
  - Clientes ativos e Leads separados em abas.

## Backlog Atual Nao Bloqueante

Estes itens nao sao queues antigas obrigatorias. Sao proximos refinamentos reais, derivados dos testes recentes:

### BACKLOG-01 - Mobile Trabalho Progressivo Para Multiunidade

Problema: gestor com muitos locais ainda pode receber informacao demais no mobile.

Direcao: agrupar por unidade, alerta e acao principal; empurrar configuracao e relatorio para SaaS web.

### BACKLOG-02 - Financeiro Como Fluxo Operacional Completo

Problema: Receita ja foi reorganizada em primeira camada, mas ainda precisa de polimento de fluxo ponta a ponta.

Direcao: receber, pagos, despesas, resumo, baixa manual, modal de pagamento stub e relacao clara com mensalidades/reservas/aulas.

### BACKLOG-03 - Liga Com Agenda Operacional De Rodada

Problema: algumas partidas de liga ainda aparecem com horario/local pendente quando o schema nao traz agenda suficiente.

Direcao: definir fluxo de proposta/confirmacao de horario/local para liga sem inventar dado.

### BACKLOG-04 - QA De Permissao Por Unidade

Problema: usuarios com permissoes diferentes por local precisam de varredura dedicada.

Direcao: validar sidebar, bottom nav e acesso por unidade ativa.

### BACKLOG-05 - Continuar Remocao De Tiers Redundantes

Problema: alguns modulos ainda podem gerar menu externo + shell + tabs + filtros em telas pequenas.

Direcao: manter uma navegacao principal, usar contexto e sheets/drawers, remover sinonimos.

## Regra Para Novas Entradas

Toda nova queue precisa declarar:

- persona;
- fluxo;
- rota;
- permissao;
- mobile/web;
- funcao preservada;
- criterio de aceite;
- QA esperado;
- documentos ativos impactados.

