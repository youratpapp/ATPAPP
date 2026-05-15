# MGMT-ACADEMY-01 Report

Data: 2026-05-15

## Objetivo

Dar continuidade a Academia v2 sem reabrir a arquitetura: reduzir duplicidade visual, manter a subnavegacao da `Central da academia` como primeira estrutura de trabalho e garantir que a fila rapida nao esconda aulas ou pendencias por limite silencioso.

## Causa

A v2 principal da Academia ja tinha `Hoje`, `Grade`, `Alunos`, `Pendencias`, `Professores` e `Configuracao`, mas ainda existiam dois problemas de continuidade:

- indicadores e fila rapida apareciam antes da central, empurrando a subnav para baixo;
- `PlaceAcademyOperationalQueues` ainda usava cortes pequenos para aulas e pendencias sem comunicar o restante.

## Correcoes

- `Central da academia` passou a renderizar antes dos indicadores agregados.
- A fila rapida `Aulas do dia`/`Pendencias da academia` foi movida para dentro da workspace como apoio contextual.
- A fila rapida nao aparece nas abas `Hoje` e `Pendencias`, porque ali ela duplicaria exatamente o conteudo operacional da aba ativa.
- A fila rapida mostra restante quando houver mais itens que o resumo e permite expandir ou abrir a fila completa.
- O modo professor segue sem pendencias empresariais de aprovacao/cobranca.

## Arquivos Alterados

- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceAcademyOperationalQueues.tsx`
- `docs/EXECUTION_QUEUE.md`
- `docs/CURRENT_PRODUCT_STATE.md`
- `docs/ACADEMY_MODULE_FUNCTION_MAP.md`
- `docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `docs/SCREEN_RESPONSIBILITIES.md`

## Impacto UX

- A primeira leitura da Academia fica mais parecida com Agenda v2: subnav e rotina antes de numeros.
- Menos duplicidade entre `Hoje`, `Pendencias` e a fila rapida.
- Operador nao perde aulas/pendencias por corte silencioso.
- Professor continua com superficie leve e filtrada.

## Impacto Produto

- A Academia interna fica mais coerente para secretaria, professor e gestor.
- A fila rapida vira suporte de contexto, nao uma segunda area concorrente.
- O bloco publico/legado de aulas fica explicitamente fora deste sprint e deve ser tratado em `PUBLIC-PLACE-01`.

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

## Riscos Restantes

- Validacao visual em mobile real ainda deve confirmar conforto dos botões `Ver restantes` em bases grandes.
- A superficie publica de aulas em `/locais` ainda precisa de reorganizacao propria para jogador, sem reaproveitar o cockpit de Gestao.
