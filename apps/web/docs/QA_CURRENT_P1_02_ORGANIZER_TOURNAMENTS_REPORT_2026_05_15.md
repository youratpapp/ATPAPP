# QA-CURRENT-P1-02 - Torneios Organizados

Data: 2026-05-15

## Objetivo

Simplificar `/#/eventos/torneios?view=organizing` para que o organizador encontre rapidamente o que precisa operar, sem abrir a tela como formulario de filtros nem exibir contadores zerados.

## Causa

A tela tinha boa base funcional, mas ainda seguia um padrao de listagem generica: indicadores grandes, filtros longos e historico completo competiam com a tarefa principal. No mobile, isso fazia o usuario percorrer informacao de suporte antes de ver qual torneio precisava de acao.

## Correcoes

- Criada row operacional de torneio organizado com status, contexto, proximo passo e acao primaria.
- Adicionada fila `Proximas acoes` antes dos filtros para rascunhos, inscricoes abertas, torneios aguardando jogos e torneios em andamento.
- Contadores zerados foram removidos da superficie visivel.
- Indicadores de organizacao viraram resumo compacto, reduzindo a altura inicial no mobile.
- Filtros avancados ficam em disclosure fechado por padrao e abrem automaticamente quando ha filtro ativo.
- Lista completa/historico fica em disclosure de suporte, preservando acesso sem duplicar a primeira dobra.
- `Criar torneio` e `Copiar link` foram preservados.

## Arquivos Alterados

- `web/src/pages/EventsPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/COMPETITION_OS_V2_UX_PLAN.md`
- `web/docs/COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`

## Evidencias

Screenshots e metricas:

- `web/docs/screenshots/qa-current-p1-02-2026-05-15/desktop1366-organizer-tournaments-p1-after.png`
- `web/docs/screenshots/qa-current-p1-02-2026-05-15/mobile390-organizer-tournaments-p1-after.png`
- `web/docs/screenshots/qa-current-p1-02-2026-05-15/qa-current-p1-02-events-summary.json`

Metricas principais:

- desktop 1366px: 4 rows prioritarias, filtros fechados, lista completa fechada, 0 badges zerados, 0 respostas HTTP >= 400.
- mobile 390px: 4 rows prioritarias, resumo compacto, filtros fechados, lista completa fechada, 0 badges zerados, 0 respostas HTTP >= 400.

## Validacao

- `npm run lint`: passou.
- `npm run build`: passou.
- Login validado com `organizador.circuito@demo.atp.local`.
- Rota validada em desktop 1366px e mobile 390px.

## Risco Restante

- A tela ainda depende da qualidade dos status dos torneios no backend; se um torneio estiver com status incoerente, a acao sugerida pode nao representar a rotina real.
- O historico completo permanece no DOM dentro do disclosure. Visualmente fica oculto, mas uma futura otimizacao pode lazy-renderizar a lista completa se o volume crescer muito.

