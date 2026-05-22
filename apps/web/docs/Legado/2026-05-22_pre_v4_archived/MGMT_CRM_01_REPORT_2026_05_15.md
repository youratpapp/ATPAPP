# MGMT-CRM-01 Report - Clientes/CRM como fila de relacionamento

Data: 2026-05-15

## Objetivo

Transformar `Clientes/CRM` em rotina operacional de relacionamento: leads, follow-ups e contatos parados devem aparecer como fila acionavel, enquanto cadastro, historico e acoes secundarias ficam em lista/drawer.

## Causa do problema

- A area de Clientes misturava funil, resumo, contatos, socios, pendencias e cobranca.
- Contatos tinham controles inline demais, aumentando altura de row e carga visual.
- Cobrancas apareciam tambem na rotina de relacionamento, duplicando o Financeiro.
- A subvisao de leads funcionava mais como painel de metricas do que como lista de trabalho.

## Entregue

- `Clientes` agora abre em `Rotina`.
- Subvisoes foram renomeadas para intencao operacional: `Rotina`, `Contatos`, `Socios`, `Pendencias`, `Resumo`.
- `Rotina` lista follow-ups vencidos, leads novos e contatos parados em rows acionaveis.
- `Contatos` lista todos os contatos com busca, filtros por status/prioridade e expansao explicita.
- Novo contato permanece em formulario progressivo, sem dominar a tela.
- Drawer de contato concentra historico, responsavel, proximo contato, registro de interacao, conversao e arquivamento.
- WhatsApp ficou secundario, abrindo link externo quando ha telefone.
- Cobranca e lembrete financeiro foram retirados da fila de relacionamento e permanecem no modulo `Financeiro`.
- Fila de pendencias de clientes deixou de usar cortes silenciosos.

## Arquivos alterados

- `web/src/pages/PlacesPage.tsx`
- `web/src/components/place/ClientsWorkspaceShell.tsx`
- `web/src/components/place/PlaceClientActionQueue.tsx`
- `web/src/components/place/PlaceClientRelationshipModule.tsx`
- `web/src/components/place/PlaceCrmContactRow.tsx`
- `web/src/components/place/PlaceCrmHistoryDrawer.tsx`
- `web/src/components/place/PlaceCrmModule.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos restantes

- CRM ainda nao possui etapas customizaveis por local.
- Lembretes automatizados/notificacoes reais de follow-up nao fizeram parte deste sprint.
- WhatsApp continua como link externo, sem integracao de mensageria persistida.
