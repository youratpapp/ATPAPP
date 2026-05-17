# SCREEN-GESTAO-ACADEMIA-01 Report

Data: 2026-05-17

## Objetivo

Aplicar o DNA operacional na Academia sem redesenhar o modulo inteiro: rotina diaria antes de setup, acoes claras na primeira dobra e filas compactas sem esconder itens silenciosamente.

## Alteracoes

- `PlacesPage.tsx`
  - adicionou faixa de prioridade dentro da `Central da academia`;
  - atalhos levam para `Hoje`, `Pendencias`, `Alunos` e `Grade`;
  - respeita modo professor: professor ve rotina propria e nao recebe pendencias empresariais.

- `PlaceAcademyOperationalQueues.tsx`
  - reduziu a primeira dobra para ate 3 aulas/pendencias;
  - separou titulo, tipo e detalhe curto em cada row;
  - manteve expansao e links para fila completa.

- `App.css`
  - adicionou estilo responsivo para a faixa de prioridade;
  - mobile usa grid 2x2 para evitar empilhamento longo na primeira dobra.

## Decisoes de UX

- `Hoje` e `Pendencias` continuam como rotas/tabs principais, mas agora tambem aparecem como atalhos de rotina na primeira dobra.
- `Nova matricula` leva para `Alunos`, onde o drawer existente ja centraliza a criacao sem repetir formulario em cada turma.
- `Nova turma` leva para `Grade`, preservando o setup existente sem criar um segundo formulario.
- A fila operacional nao aparece nas abas onde duplicaria conteudo principal (`Hoje` e `Pendencias`).

## Risco de regressao

Baixo. A mudanca reorganiza entrada e leitura compacta, sem alterar schema, API, permissoes ou regras de negocio.

## Validacao

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run build`

## Pendencias

- Gerar screenshots autenticados desktop/mobile com pagina carregada.
- Validar se `Nova turma` deve abrir automaticamente o disclosure de criacao em QA de uso real.
