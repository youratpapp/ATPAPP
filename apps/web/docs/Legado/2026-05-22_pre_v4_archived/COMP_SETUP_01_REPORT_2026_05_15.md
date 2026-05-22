# COMP-SETUP-01 Report

Data: 2026-05-15

## Objetivo

Transformar a criacao de torneio em um setup guiado, logico e persistente, sem misturar todas as decisoes em um formulario unico.

## Entrega

- `/eventos` no modo `Organizando` agora abre um wizard de criacao de torneio com 6 etapas.
- Etapas: `Basico`, `Inscricoes`, `Categorias`, `Formato`, `Agenda` e `Revisar`.
- O wizard coleta dados suficientes para criar um rascunho operacional: nome, local, datas, visibilidade, cartaz, prazo/taxa, aprovacao, categorias/classes, formato padrao, quadras e janelas.
- A revisao permite criar como rascunho ou ja abrir inscricoes.
- `createTournament` passou a persistir esses dados no Supabase usando colunas existentes e `data` estruturado.

## Impacto De UX

- Criar torneio deixa de parecer um formulario tecnico e passa a seguir a ordem mental do organizador.
- Decisoes raras e complexas ficam em setup guiado, enquanto operacao continua dentro do torneio.
- Mobile ganha etapas curtas em vez de uma pilha longa de campos.
- O organizador entende o que falta antes de criar.

## Impacto De Produto

- Torneios novos ja nascem com categorias/classes iniciais e `agendaConfig`.
- O gerador de partidas pode usar dias, horarios e quadras configurados no setup.
- Taxa, prazo, cartaz, status e permissao de resultado pelo jogador sao salvos desde a criacao.
- Ajustes finos continuam preservados no workspace interno do torneio.

## Arquivos Alterados

- `web/src/pages/EventsPage.tsx`
- `web/src/lib/tournaments.ts`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npm.cmd run lint`
- `npx.cmd tsc -b --pretty false`
- `npm.cmd run build`

## Riscos Restantes

- O fluxo cria estrutura inicial; configuracao avancada por classe, jogadores, sorteio, pagamentos e operacao seguem no workspace interno.
- Criacao de liga recebeu o mesmo tratamento no sprint seguinte `COMP-SETUP-02`.
- Restricao de horario por inscricao segue como gap backend separado.
