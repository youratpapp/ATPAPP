# SCREEN-GESTAO-CLIENTES-01 Report

Data: 2026-05-17

## Objetivo

Fazer o CRM abrir como rotina de relacionamento, nao como planilha ou formulario solto: primeiro o que precisa de contato hoje, depois busca/filtros e lista completa.

## Alteracoes

- `PlaceCrmModule.tsx`
  - adicionou primeira dobra com painel `Hoje`;
  - mostra ate 3 contatos prioritarios por lead, retorno vencido ou ausencia de historico;
  - adicionou CTA direto `Novo contato`;
  - manteve busca, filtros e lista principal em rows.

- `PlaceCrmContactForm.tsx`
  - passou a aceitar abertura controlada para o CTA de novo contato;
  - manteve o progressive disclosure existente para reduzir risco de regressao.

- `App.css`
  - adicionou layout responsivo para `crm-first-fold`;
  - mobile passa a empilhar os paineis sem quebrar campos.

## Decisoes de UX

- Follow-up urgente aparece direto, nao em carrossel.
- Detalhe/interacao continua no drawer, que ja concentra WhatsApp, historico, retorno, responsavel, conversao e arquivamento.
- O formulario de novo contato ainda nao virou drawer dedicado nesta sprint para manter escopo controlado.

## Risco de regressao

Baixo. A sprint nao altera schema, servicos ou permissoes. O maior risco visual e a barra de filtros continuar longa em mobile.

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Pendencias

- QA visual mobile para decidir se filtros devem virar bottom sheet.
- Avaliar drawer dedicado para `Novo contato` em sprint futura de formularios.
