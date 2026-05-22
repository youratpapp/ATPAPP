# Navigation Tier Dedup Sprint - 2026-05-21

## Objetivo

Continuar a varredura `NAV-UX-06` e corrigir casos em que a mesma pagina tinha dois menus locais quase consecutivos: tabs oficiais do workspace e uma faixa de botoes internos com nomes/funcoes iguais.

## Problema encontrado

Na gestao de local, os workspaces de Academia, Financeiro e Cantina tinham tabs oficiais e, logo abaixo, faixas clicaveis chamadas de atalhos:

- Academia: `Hoje`, `Pendencias`, `Alunos`, `Grade`.
- Financeiro: `Receber`, `Vencidos`, `Pagamento`, `Despesa`.
- Cantina: `Vender`, `Estoque`, `Hoje`, `Produtos`.

Essas faixas pareciam outro menu e competiam com as tabs oficiais. Em mobile, isso criava tiers demais e fazia o usuario ter que descobrir se deveria usar o menu de cima ou os cards de baixo.

## Decisao de produto

- Tabs oficiais continuam sendo a unica navegacao local do workspace.
- Blocos logo abaixo das tabs viram resumo operacional nao clicavel.
- CTAs reais permanecem dentro da area correta: receber dentro de `Recebiveis`, vender dentro de `Venda rapida`, matricula/turmas dentro de `Turmas`.
- Setup raro foi nomeado como `Ajustes` quando aparecia como destino de rotina.

## Alteracoes

- `AcademyWorkspaceShell`
  - `Grade` virou `Turmas`.
  - `Configuracao` virou `Ajustes`.
- `BookingWorkspaceShell`
  - `Quadras` virou `Ajustes`, reduzindo a ideia de que setup de quadra e uma tarefa diaria de reserva.
  - `Nova reserva` deixou de ser tab oficial e virou CTA contextual dentro da agenda.
- `PlacesPage`
  - `academy-priority-strip` virou `academy-routine-summary` com artigos nao clicaveis.
  - `finance-priority-strip` virou `finance-routine-summary` com artigos nao clicaveis.
  - `canteen-priority-strip` virou `canteen-routine-summary` com artigos nao clicaveis.
  - Textos auxiliares que mandavam o usuario abrir `Grade` passaram a apontar para `Turmas`.
  - Agenda passou a mostrar `Nova reserva` como CTA de atendimento rapido, preservando a view `new`.
- `place-admin-navigation`
  - Novas rotas geradas usam `turmas` e `ajustes`.
  - Aliases antigos `grade`, `configuracao` e `quadras` seguem funcionando.
- `App.css`
  - Removido comportamento visual de botao/hover/active desses resumos.
  - Mantido visual premium dark e estado `urgent` para pendencias.

## Resultado esperado

O usuario deixa de ver dois menus locais com nomes parecidos. A leitura fica:

1. escolho a area pela tab oficial;
2. vejo um resumo operacional;
3. executo a acao dentro da area correta.

## Validacao

- `npx.cmd tsc -b --pretty false`
- `git diff --check`
- Screenshots:
  - `docs/screenshots/navigation-tier-dedup-2026-05-21/`
  - `docs/screenshots/navigation-tier-dedup-cashier-2026-05-21/`
  - `docs/screenshots/navigation-booking-cta-2026-05-21/`
- Busca em `src` sem ocorrencias de:
  - `academy-priority-strip`
  - `finance-priority-strip`
  - `canteen-priority-strip`
  - `Atalhos da rotina`
  - `Atalhos financeiros`
  - `Atalhos da cantina`

Observacao: a rota direta de Cantina com o login admin usado na captura de gestao retornou estado de acesso restrito no local testado. A captura complementar com `caixa.prime@demo.atp.local` validou o fluxo de Caixa/Cantina em `/gestao` sem erro de console.

## Pendencias

- `secondaryActions` em torneio/liga foram rechecadas: seguem como acoes contextuais no drawer de detalhe da tarefa operacional, sem menu paralelo na primeira dobra.
- Revalidar fluxo completo de criacao de reserva em uma rodada E2E especifica de recepcao.
