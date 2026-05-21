# League E2E Flow Audit - 2026-05-21

Fonte principal: `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`.

Objetivo da rodada: executar uma liga do inicio ao fim, documentando fluxo real, bloqueios funcionais, dificuldade de localizar menus, volume de informacao, comportamento de owner e participante, console/rede e qualidade mobile/desktop. A criacao de pedidos de inscricao foi automatizada via RPC/seed para acelerar a massa; todo o restante foi operado pela UI.

## Resultado Final

Status: concluido.

Liga final validada:

- Nome: `QA Liga V4 044652`
- ID: `d5c32395-b466-4bb2-a97e-3b648da5c8ca`
- Pasta de evidencias final: `docs/screenshots/league-e2e-flow-v4-2026-05-21-run10-final-round-status/`
- Diagnostico final: `docs/screenshots/league-e2e-flow-v4-2026-05-21-run10-final-round-status/diagnostics.json`
- Console: sem erros de pagina.
- Rede: sem failed requests.
- Resultado: `completed: true`.

O fluxo final cobriu:

1. Login admin.
2. Entrada em `#/eventos/ligas?view=organizing`.
3. Criacao de liga pela UI.
4. Criacao de pedidos de inscricao por RPC com jogadores seed.
5. Aprovacao das inscricoes pela UI.
6. Geracao da rodada pela UI.
7. Entrada na sala de partida com login de jogador.
8. Envio de resultado pelo jogador.
9. Confirmacao do resultado pelo adversario.
10. Lancamento de resultado restante pelo admin.
11. Aplicacao de sobe/desce.
12. Revisao final owner desktop, owner mobile, participante desktop e participante mobile.

## Massa Usada

Jogadores seed usados para inscricao:

- `jogador011@demo.atp.local` - Karina Queiroz
- `jogador012@demo.atp.local` - Lucas Yamamoto
- `jogador013@demo.atp.local` - Mariana Almeida
- `jogador014@demo.atp.local` - Nicolas Henrique

Resultados finais da rodada:

- Karina Queiroz venceu Lucas Yamamoto por 6/2, enviado pela jogadora e confirmado pelo adversario.
- Mariana Almeida venceu Nicolas Henrique por 6/3, lancado pelo admin.

## Runs E Bloqueios Encontrados

### Run 1 - Falha No Auditor

Problema:

- O script tentou ordenar `league_classes` por `sort_order`, coluna que nao existe no schema atual.

Correcao:

- O auditor passou a ordenar por `created_at`.

Impacto no produto:

- Nenhuma mudanca de produto; era bug do script de QA.

### Run 2 - Aprovacao Parcial

Problema:

- O auditor clicava em botoes de aprovacao ainda desabilitados/carregando e validava apenas uma inscricao aprovada.

Correcao:

- O auditor passou a procurar somente botoes habilitados e confirmar no banco se nao restavam inscricoes pendentes.

Impacto no produto:

- Nenhuma mudanca de produto; era fragilidade do script.

### Runs 3 E 4 - Bloqueio Real Na Geracao Da Rodada

Problema:

- A UI chegava na etapa correta, mas a RPC `app_generate_next_league_round` falhava com erro Postgres:

```text
column reference "class_id" is ambiguous
```

Impacto:

- Owner aprovava participantes, mas nao conseguia gerar rodada.
- A liga ficava bloqueada antes da fase operacional real.

Correcao fonte:

- Criada migration `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql`.
- A funcao passou a qualificar referencias ambiguidade de `class_id`.

Correcao de compatibilidade no app:

- `src/lib/leagues.ts` ganhou fallback controlado em `generateNextLeagueRound`.
- Se a RPC remota ainda estiver desatualizada e retornar exatamente o erro de ambiguidade, o app usa insercoes diretas autenticadas/RLS para gerar a rodada.
- Esse fallback segue o mesmo padrao ja usado para torneio enquanto a migration remota nao esta aplicada.

Risco:

- O fallback deve ser tratado como ponte de compatibilidade. A solucao definitiva e aplicar a migration no banco remoto.

### Run 5 - Fluxo Funcional Completo

Status:

- Liga passou do inicio ao fim depois do fallback.
- Geracao de rodada, resultado por jogador, confirmacao por adversario, resultado por admin e sobe/desce funcionaram.

Problemas UX ainda observados:

- Owner mobile tinha primeira dobra pesada.
- Participante mobile usava tabs com risco de parecer controle antigo.
- Fase final ainda mostrava acao de proxima rodada em contexto inadequado.
- Inputs de placar tinham placeholders `1` e `2`, podendo parecer preenchimento real.

### Runs 6 A 10 - Ajustes UX E Validacao Final

Correcoes aplicadas:

- `LeagueDetailsPage.tsx`
  - Removeu a tarefa `Gerar proxima rodada` quando a liga ja atingiu o total de rodadas planejado.
  - Ajustou texto do participante para `Sua temporada ativa nesta liga.`
  - Troca placeholders de placar da sala de partida de `1`/`2` para `0`.
  - Ajustou o badge visual para `Temporada finalizada` quando a temporada selecionada esta encerrada.

- `App.css`
  - Tabs de liga e tabs de competicao viraram grid no mobile para evitar carrossel cortado.
  - Cockpit da liga ficou mais compacto no mobile.
  - Owner mobile recebeu hero menor.
  - Acao principal passou a aparecer antes de blocos secundarios no cockpit mobile.
  - Slot de fila operacional voltou para depois do resumo/CTA para preservar leitura natural.
  - Player shell tambem recebeu padding e densidade especifica para liga participante.

Run final:

- Pasta: `docs/screenshots/league-e2e-flow-v4-2026-05-21-run10-final-round-status/`
- Resultado: `completed: true`.
- Console: apenas logs esperados do Vite/React DevTools.
- `failedRequests`: vazio.
- `pageErrors`: vazio.
- `league_rounds.status`: `finished` apos aplicar sobe/desce.

## Analise De Fluxo

### Owner / Organizador

O que melhorou:

- O caminho real ficou claro: criar liga, revisar inscritos, aprovar, gerar rodada, abrir partidas, resolver resultados, aplicar sobe/desce.
- A primeira dobra agora responde melhor a fase atual da liga.
- Historico/finalizacao nao tenta mais empurrar nova rodada quando a temporada ja chegou ao limite planejado.
- A rota `#/eventos/ligas/:leagueId` foi preservada.
- `tab=configuracao` segue owner-only.

Dificuldades ainda percebidas:

- No mobile, a tela continua informacionalmente densa. A CTA aparece cedo, mas ainda ha muitos blocos antes de relatorios/publicacao.
- A liga tem dois niveis de navegacao owner: cockpit de fase e tabs. Isso esta aceitavel, mas deve ser monitorado para nao virar menu duplicado.
- A fila vazia em fase historica ainda precisa copy melhor: `Sem bloqueio critico agora` e util, mas pode ser mais contextual, como `Temporada encerrada. Use classificacao final ou publicacao.`

### Participante

O que melhorou:

- O participante nao ve ferramentas administrativas.
- O contexto agora explica que esta em sua temporada ativa.
- A sala de partida permite enviar resultado e o adversario confirma.
- No final, o participante ve historico, classificacao, partidas, chat e proxima acao pessoal.

Dificuldades ainda percebidas:

- A liga participante mobile ainda tem primeira dobra alta, principalmente quando ha topbar, titulo, nav e cockpit.
- O sistema mostra `Local pendente` porque o schema atual de partida de liga nao possui quadra/local explicito. Isso e correto tecnicamente, mas fraco operacionalmente.
- O texto `Horario a combinar`/`Local pendente` deve evoluir para uma acao real quando houver agenda de disponibilidade.

## Estados Validados

Owner:

- Liga criada.
- Inscricoes pendentes.
- Inscricoes aprovadas.
- Rodada antes de gerar.
- Rodada gerada.
- Uma partida resolvida por jogadores.
- Partidas resolvidas.
- Fechamento/sobe-desce.
- Historico/final.

Participante:

- Partida aberta.
- Resultado enviado.
- Resultado confirmado.
- Liga finalizada/historico.

Viewports:

- desktop 1366px.
- desktop amplo.
- mobile 390px.
- mobile 430px.

## Arquivos Alterados Na Rodada

- `scripts/league-e2e-flow-audit.mjs`
- `src/lib/leagues.ts`
- `src/pages/LeagueDetailsPage.tsx`
- `src/App.css`
- `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql`
- `docs/LEAGUE_E2E_FLOW_AUDIT_2026_05_21.md`
- `docs/EXECUTION_QUEUE.md`
- `docs/APP_WORKFLOW_EXECUTION_MATRIX_V3.md`

## QA Executado

Comandos:

```powershell
npx.cmd tsc -b --pretty false
$env:ATP_LEAGUE_FLOW_OUT_DIR='docs/screenshots/league-e2e-flow-v4-2026-05-21-run10-final-round-status'; Remove-Item Env:ATP_EXISTING_LEAGUE_ID -ErrorAction SilentlyContinue; node scripts/league-e2e-flow-audit.mjs
```

Resultado:

- TypeScript: passou.
- Auditoria E2E: passou.
- Liga criada do zero no run final: passou.
- Console/rede: sem erros bloqueantes.

## Pendencias Reais

1. Aplicar migration remota.
   - Arquivo: `supabase/migrations/0097_fix_league_generate_round_class_id_ambiguity.sql`.
   - Motivo: o fallback do frontend nao deve ser solucao permanente.

2. Decidir modelo operacional de horario/local da liga.
   - Hoje a partida pode existir sem quadra/local.
   - A UI mostra `Horario a combinar` e `Local pendente`.
   - Para a liga ficar excelente, a fase de rodada ativa deveria oferecer acao clara: combinar horario, escolher quadra/local ou abrir disponibilidade.

3. Revisar copy de historico/final.
   - A fase final esta funcional, mas pode ser mais orientada para relatorio/publicacao.

4. Reduzir ainda mais a primeira dobra mobile em participante.
   - A CTA aparece, mas a pagina continua longa.
   - Proxima evolucao ideal: transformar o bloco de nav+contexto em uma estrutura mais parecida com agenda da rodada.

## Conclusao

A liga agora roda de ponta a ponta em fluxo real: owner cria, aprova, gera rodada, jogador envia resultado, adversario confirma, admin resolve pendencia e owner aplica fechamento. O principal bloqueio funcional estava no RPC de geracao da rodada e foi tratado com migration fonte mais fallback de compatibilidade. A rodada persistida tambem termina como `finished` apos o sobe/desce. A auditoria gerou ajustes de UX mobile para reduzir a sensacao de pagina pesada e aproximar owner/participante da mesma logica de cockpit por fase.
