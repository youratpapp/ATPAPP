# COMP-OPS-01 Report - Operacao de torneio em rows

Data: 2026-05-15

## Objetivo

Transformar a operacao de torneio para owner/staff em uma fila real de trabalho, com rows, acao primaria e detalhe em drawer/bottom sheet.

## Entrega

- `TournamentPage` agora monta uma fila operacional por tarefa real.
- Rows exibem tipo, contexto, impacto e acao primaria.
- Detalhe abre drawer no desktop e bottom sheet no mobile.
- A fila cobre:
  - inscricao pendente;
  - lista de espera;
  - pagamento de inscricao;
  - geracao de jogos;
  - agenda incompleta;
  - resultado enviado por jogador;
  - aviso de indisponibilidade.
- O alerta separado de indisponibilidade foi fundido na fila para reduzir duplicidade.
- Quando ha mais de 8 tarefas, a UI informa o recorte e oferece entrada para lista completa.

## Impacto de UX

- O organizador deixa de interpretar cards agregados e passa a operar tarefas diretamente.
- A primeira dobra passa a responder "o que resolvo agora?".
- A rotina recorrente fica em rows/drawers, sem wizard.
- Jogador/publico continua sem ver cockpit operacional.
- Mobile recebe bottom sheet em vez de uma pagina longa de detalhes.

## Impacto de Produto

- Inscricoes, espera, pagamentos, resultados e indisponibilidade ficaram reunidos na mesma fila operacional.
- Configuracao profunda continua na aba `Organizacao`.
- Tabs existentes continuam preservadas para operacao detalhada.
- Publicacao e exportacao permanecem no painel proprio, sem virar tarefa dominante quando ha pendencias operacionais.

## Backend

Nenhum backend novo foi criado.

Acoes preservadas:

- `updateTournamentRegistrationStatus`;
- `markStubPaymentPaidForParticipant`;
- `generateAllClasses`;
- `markTournamentMatchResultSubmissionApplied`;
- WhatsApp de indisponibilidade existente.

## Arquivos Alterados

- `web/src/pages/TournamentPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos Restantes

- Agenda incompleta ainda leva para configuracao geral de agenda, nao para edicao granular de uma partida especifica.
- Pagamento de inscricao continua manual/stub.
- Screenshots autenticados em desktop/mobile ainda sao recomendados para validar densidade visual com dados reais.

## Proximo Item

`COMP-OPS-02 - Operacao de liga em rodada atual`.
