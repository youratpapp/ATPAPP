# PLAYER-UX-07 Report - Perfil Simples Por Finalidade

Data: 2026-05-15

## Objetivo

Transformar `/perfil` de uma pagina empilhada em uma area simples por finalidade, preservando as funcoes existentes sem tratar o jogador comum como operador, organizador ou painel social.

## Entrega

- Perfil dividido em quatro abas: `Perfil`, `Historico`, `Preferencias` e `Conta`.
- Primeira leitura do perfil reduzida a identidade, localizacao e sinais simples.
- Dados pessoais ficam em `Perfil`.
- Historico do jogador fica separado de conta e preferencias.
- Estatisticas, conquistas, evolucao, leitura tecnica, head-to-head e post de partida foram preservados, mas movidos para disclosures.
- Lembretes e notificacoes ficam em `Preferencias`.
- Suporte, privacidade, exclusao, logout e area profissional ficam em `Conta`.
- Atalhos de organizador so aparecem para usuarios com competicoes organizadas.

## Impacto UX

- Reduz scroll inicial no mobile.
- Remove a sensacao de cockpit do perfil do jogador.
- Evita que dados de organizacao compitam com identidade e historico esportivo.
- Mantem recursos avancados acessiveis para quem procura, sem empurrar todos para o primeiro plano.

## Impacto Produto

- Player App fica mais alinhado ao principio `mostrar menos, mas mostrar o certo`.
- Multi-papel continua suportado, mas com entrada profissional discreta.
- Preferencias de notificacao ficam mais encontraveis sem poluir perfil publico.

## Arquivos Alterados

- `web/src/pages/ProfilePage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/PLAYER_APP_V2_UX_PLAN.md`
- `web/docs/PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`

## Validacao

- `npm.cmd run lint`
- `npx.cmd tsc -b --pretty false`
- `npm.cmd run build`

## Riscos Restantes

- Validacao visual autenticada em 390px/430px ainda deve ser refeita com seed real aplicado.
- Preferencias de notificacao ainda dependem da futura engine real de disparos automaticos.
- Pagamentos proprios nao foram adicionados porque nao ha fonte canonica consolidada no Player App para exibir sem inventar painel.
