# Tournament E2E Flow Audit - 2026-05-20

Nota 2026-05-22: este arquivo e evidencia de QA, nao fonte executiva atual. A fonte atual e `DOCS_SOURCE_OF_TRUTH_INDEX_2026_05_22.md` + `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`.

Fonte historica usada na rodada original: `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md` e `NAVIGATION_WORKSPACE_RESTRUCTURE_V4.md`.

Objetivo desta rodada: criar e operar um torneio real do inicio ao fim, passando pelas fases de criacao, inscricoes, aprovacao, encerramento, geracao de jogos, envio de resultado pelo jogador, lancamento de resultado pelo admin e tentativa de finalizacao. O foco foi UX de fluxo, menus, continuidade, entendimento da tela e preservacao das funcoes existentes.

## Escopo Testado

Ambiente:

- App local: `http://127.0.0.1:5173/`
- Viewport principal capturado: desktop 1366
- Auditoria executada com suporte do script: `scripts/tournament-e2e-flow-audit.mjs`
- Usuario owner/admin: `escalao@gmail.com`
- Jogadores seed usados para pedidos de inscricao:
  - `jogador011@demo.atp.local` / Karina Queiroz
  - `jogador012@demo.atp.local` / Lucas Yamamoto
  - `jogador013@demo.atp.local` / Mariana Almeida
  - `jogador014@demo.atp.local` / Nicolas Henrique

Torneio principal auditado:

- Nome: `ATP Open Dourados 010927`
- ID: `cd01cf82-31e3-4682-a64e-7f4db9d75387`
- Rota de operacao: `/eventos/cd01cf82-31e3-4682-a64e-7f4db9d75387/organizacao`
- Status final observado no banco: `live`
- Inscricoes aprovadas: 4
- Classe: `Tenis / Classe A`
- Formato: mata-mata simples
- Jogos gerados: 3, sendo 2 semifinais e 1 final

## Evidencias Capturadas

Pastas de screenshots:

- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run3`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run5-continue`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run6-continue-live`
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run7-admin-finish`

Arquivos-chave:

- `run3/01-desktop-1366-01-torneios-organizando-antes-criar.png`
- `run3/05-desktop-1366-05-torneio-criado-jogos.png`
- `run3/06-desktop-1366-06-inscricoes-pendentes.png`
- `run3/07-desktop-1366-07-inscricoes-aprovadas.png`
- `run5-continue/02-desktop-1366-09-inscricoes-encerradas.png`
- `run5-continue/03-desktop-1366-10-jogos-gerados.png`
- `run6-continue-live/03-desktop-1366-11b-player-match-room.png`
- `run7-admin-finish/04-desktop-1366-11c-player-result-submitted.png`
- `run7-admin-finish/07-desktop-1366-12-jogos-com-resultados.png`
- `run7-admin-finish/08-desktop-1366-error-state.png`

Console capturado:

```text
Failed to submit tournament match result Error: column reference "tournament_id" is ambiguous
    at submitTournamentMatchResult (.../src/lib/tournaments.ts:734:19)
    at async submitPlayerMatchResultNow (.../src/pages/TournamentPage.tsx:4372:17)
```

## Resultado Por Fase

### 1. Entrada Do Organizador

Rota usada: `/eventos/torneios?view=organizing`

O que funcionou:

- O hub de competicoes permite chegar na area de torneios organizados.
- O CTA de criar torneio existe.

Dificuldade de UX:

- A area ainda mistura o conceito de descobrir/jogar com organizar. O usuario precisa entender que `Torneios` pode ser lista publica e tambem fila de operacao.
- Para organizador, o melhor destino nao deveria parecer catalogo; deveria responder primeiro: `quais competicoes precisam de acao agora?`

Recomendacao:

- Separar visual e mentalmente `Competir` do jogador e `Competições de Trabalho`.
- O hub do organizador deve abrir em fila operacional por fase, nao em lista generica.

### 2. Criacao Do Torneio

Etapas capturadas:

- Basico
- Categorias
- Revisao
- Criar torneio

O que funcionou:

- O wizard existe e evita um formulario unico gigante.
- Foi possivel criar torneio com classe, periodo, local/cidade e configuracoes basicas.

Dificuldades de UX:

- Apos criar o torneio, o app levou para `/jogos`. Isso quebra a continuidade. Para um torneio recem-criado, o proximo passo natural e revisar/publicar inscricoes ou compartilhar link, nao ver jogos vazios.
- Em uma tentativa, o wizard ficou preso na primeira etapa porque UF/cidade nao estavam preenchidos corretamente, mas a tela nao deixou muito obvio o que faltava para continuar.
- Labels e controles nem sempre tem associacao direta simples, o que tambem indica fragilidade de acessibilidade e automacao.

Fluxo ideal:

```text
Criar torneio -> Revisao criada -> Sucesso -> CTA primario: Abrir inscricoes / Compartilhar link
CTA secundario: Completar configuracao
Nao enviar para Jogos antes de existir chave.
```

### 3. Pedidos De Inscricao

Como foi feito:

- Os pedidos foram criados usando os logins seed dos jogadores e o RPC de pedido de inscricao.
- Esta foi a unica etapa feita fora da UI, conforme liberado.

O que funcionou:

- Os quatro pedidos foram criados com usuarios reais seed.

Dificuldade de UX/produto:

- Depois de criar pedidos externamente, a tela do owner nao refletiu imediatamente os novos pedidos ate reload/refetch completo.
- Para um link publico de inscricao, isso e um problema real: o organizador pode estar com a tela aberta e achar que ninguem se inscreveu.

Recomendacao:

- Ao entrar na aba `Jogadores/Inscricoes`, refazer fetch.
- Ao voltar foco da janela, refazer fetch leve.
- Se houver inscricoes por link, mostrar `Atualizar inscricoes` quando a tela estiver antiga.

### 4. Aprovacao Dos Inscritos

Rota usada: `/eventos/:id/jogadores`

O que funcionou:

- Os quatro pedidos apareceram depois do reload.
- O owner conseguiu aprovar os inscritos pela UI.

Dificuldades de UX:

- A aprovacao fica em uma aba que tambem pode parecer lista de jogadores, inscritos e operacao ao mesmo tempo.
- O proximo passo depois de aprovar todos nao fica suficientemente dominante.

Fluxo ideal:

```text
Inscricoes abertas -> Revisar inscritos -> Aprovar/rejeitar -> Todos aprovados
CTA primario: Encerrar inscricoes
CTA secundario: Compartilhar link
```

### 5. Encerrar Inscricoes

Rota usada: `/eventos/:id/organizacao`

O que funcionou:

- Foi possivel encerrar inscricoes pela UI em rodada posterior.

Dificuldade de UX:

- A acao de fase ainda depende de um `Status` dentro de configuracao. Isso e mentalmente uma acao operacional critica, nao um campo de formulario.
- O automation helper tambem nao encontrou o campo `Status` em algumas etapas porque ele esta profundo/condicional, o que confirma que a acao nao esta no lugar mais obvio.

Fluxo ideal:

```text
Fase: Inscricoes abertas
Bloqueio atual: X inscritos pendentes ou prontos
CTA primario: Encerrar inscricoes
Depois de encerrar: CTA primario muda para Gerar jogos
```

### 6. Gerar Jogos

O que funcionou:

- A chave foi gerada com 4 jogadores.
- A agenda foi criada com 2 semifinais e 1 final.
- O torneio avancou para estado operacional `live`.

Dificuldades de UX:

- Gerar jogos funcionou, mas a tela ainda tem muitos niveis competindo: hero, tabs, secao organizacao, fluxo de fase, resumo de classe, cards de partida, disclosure por placar, configuracoes profundas.
- A primeira dobra deveria ser mais estreita: `Jogos prontos. O que falta publicar/operar agora?`

Fluxo ideal:

```text
Fase: Jogos gerados
Primeira dobra: classes geradas, conflitos de agenda, jogos sem publicacao
CTA primario: Publicar jogos
CTA secundario: Ajustar agenda
```

### 7. Jogador Envia Resultado

Rota usada pelo jogador: `/eventos/:id/jogos`

O que funcionou:

- Login com jogador seed funcionou.
- O jogador conseguiu abrir a partida e encontrar `Informar resultado`.
- A tela de sala/partida existe.

Bloqueio funcional:

- Ao enviar o resultado, o console registrou erro real no RPC:

```text
column reference "tournament_id" is ambiguous
```

Impacto:

- Jogador competitivo nao consegue concluir o fluxo principal `abrir partida -> informar resultado -> aguardar validacao`.
- Isso quebra o caminho do participante e tambem a fila do organizador, porque resultados enviados nao chegam para revisao.

Arquivos provaveis:

- `src/lib/tournaments.ts`
- `src/pages/TournamentPage.tsx`
- `supabase/migrations/0012_tournament_player_result_submissions.sql`
- `supabase/migrations/0090_fix_tournament_result_submission_ambiguity.sql`

Observacao:

- Existe uma migration chamada `0090_fix_tournament_result_submission_ambiguity.sql`, mas o ambiente auditado ainda retornou a ambiguidade. Pode ser migration nao aplicada, funcao ainda ambigua por conflito com colunas de retorno, ou banco remoto desatualizado.

### 8. Admin Lanca Resultado

Rota usada: `/eventos/:id/jogos`

O que funcionou:

- O owner consegue abrir o disclosure `Lancar placar`.
- Existem campos de placar e botoes de WO.

Problema de UX/funcao:

- Ao preencher apenas parte do placar, a UI mostrou `Atualizado com sucesso`.
- A partida continuou pendente.
- O banco ficou com `scoreLabel` parcial:

```json
{
  "sets": [
    { "a": "6", "b": "" }
  ],
  "resultOrigin": "manual"
}
```

Impacto:

- O admin pode acreditar que salvou o resultado, mas a chave nao avancou.
- O proximo jogo continua com `A definir x A definir`.
- A tela nao deixa claro se o placar esta incompleto, invalido ou apenas salvo como rascunho.

Fluxo ideal:

```text
Abrir partida -> Lancar placar -> Validar placar completo -> Salvar resultado oficial
Sucesso -> vencedor avanca automaticamente -> CTA: Lancar proximo resultado
```

Recomendacao:

- Remover autosave por input para resultado oficial.
- Usar acao explicita por partida: `Salvar placar`.
- Enquanto incompleto, mostrar `Placar incompleto` e nao `Atualizado com sucesso`.
- Separar `Rascunho salvo` de `Resultado oficial salvo`.

### 9. Finalizar Torneio

O que aconteceu:

- O fluxo nao chegou ao final por UI.
- Motivos:
  - resultado do jogador bloqueado por RPC;
  - resultado admin ficou parcial e nao avancou chave;
  - status/finalizacao continua escondido como campo profundo e nao como CTA de fase.

Problema de UX:

- Quando a competicao chega perto do fim, o owner deveria ver um caminho direto:

```text
Todos os jogos finalizados -> Revisar campeoes -> Publicar resultado final -> Finalizar torneio
```

Hoje a finalizacao parece depender de achar `Status` dentro de configuracao, o que nao corresponde a acao operacional de encerramento.

## Diagnostico De Navegacao E Menus

O maior problema do torneio nao e apenas visual. E arquitetura de trabalho.

O torneio ainda tenta comportar no mesmo espaco:

- pagina publica do evento;
- hub de jogador;
- sala de partida;
- lista de inscritos;
- cockpit de inscricoes;
- geracao de jogos;
- agenda;
- chave;
- placar;
- envio de resultado pelo jogador;
- revisao de resultado;
- configuracao estrutural;
- publicacao;
- fechamento.

Isso cria muitos menus e submenus concorrendo:

- rota principal `/eventos`;
- subrotas `/jogos`, `/classificacao`, `/organizacao`, `/jogadores`, `/chat`;
- filtros/abas internas;
- cards de fase;
- disclosures de partida;
- formularios de configuracao;
- botoes operacionais misturados com botoes de setup.

Consequencia:

- O owner precisa "cacaar onde mexer".
- O jogador entra em `Competir`, mas pode cair em uma tela que parece cockpit.
- A acao critica da fase nem sempre aparece como primeiro CTA.
- Configuracao rara ainda compete com operacao diaria.

## Fluxo Alvo Recomendado

### Superficie Do Jogador

Rota publica/participante:

```text
Evento -> Minha participacao -> Minha partida -> Resultado/chat/classificacao
```

Primeira dobra do jogador:

- status pessoal;
- proxima partida;
- adversario;
- horario/local;
- CTA unico: `Abrir partida`, `Confirmar horario` ou `Informar resultado`.

O jogador nao deve ver:

- status administrativo;
- geracao de jogos;
- configuracao;
- publicacao;
- relatorios;
- ferramentas de staff sem permissao.

### Superficie Do Organizador

Rota operacional:

```text
Competition OS -> Torneio -> Cockpit da fase atual
```

Fases e CTAs:

| Fase | Primeira pergunta | CTA primario |
| --- | --- | --- |
| Rascunho | O que falta para publicar? | Completar configuracao |
| Inscricoes abertas | Quem precisa aprovar ou cobrar? | Revisar inscritos |
| Inscricoes encerradas | Esta pronto para gerar jogos? | Gerar jogos |
| Jogos gerados | O que falta publicar/ajustar? | Publicar jogos |
| Em andamento | Que resultado/atraso/WO precisa resolver? | Lancar resultado |
| Finalizado | O que precisa publicar/exportar? | Publicar resultado final |

Configuracao deve existir, mas em camada propria:

```text
Configuracao -> Dados, categorias, regras, agenda, equipe, publicacao avancada
```

Operacao nao deve depender de achar configuracao.

## Achados Priorizados

### P0 - Envio de resultado pelo jogador quebra no backend

Erro:

```text
column reference "tournament_id" is ambiguous
```

Impacto:

- Jogador competitivo nao conclui tarefa diaria.
- Owner nao recebe envio para revisao.

Acao:

- Revisar e reaplicar funcao `app_submit_tournament_match_result`.
- Qualificar colunas em conflict target/return query ou renomear colunas de retorno internas se necessario.
- Rodar QA com dois jogadores enviando o mesmo placar e placares divergentes.

### P0 - Resultado admin pode salvar parcial com mensagem de sucesso

Impacto:

- Torneio nao avanca.
- Admin recebe feedback enganoso.

Acao:

- Trocar autosave de placar por `Salvar resultado oficial`.
- Validar campos obrigatorios antes de salvar.
- Mostrar `Rascunho` quando incompleto.

### P1 - Acao de fase esta enterrada em status/configuracao

Exemplos:

- Encerrar inscricoes.
- Finalizar torneio.

Acao:

- Promover fase para CTA operacional explicito.
- Manter select de status somente em configuracao avancada ou admin owner-only.

### P1 - Apos criar torneio, proximo passo errado

Atual:

```text
Criar torneio -> Jogos
```

Ideal:

```text
Criar torneio -> Inscricoes/Publicacao
```

### P1 - Registro externo nao aparece sem refetch

Acao:

- Recarregar inscricoes ao entrar na aba.
- Recarregar ao foco da janela.
- Dar feedback de sincronizacao ao owner.

### P1 - Navegacao do torneio tem tiers demais

Acao:

- Uma navegacao primaria por fase.
- Subabas apenas dentro da fase.
- Configuracao separada.
- Jogador e staff com visoes diferentes.

### P2 - Wizard ainda pode deixar o erro pouco visivel

Acao:

- Validacao inline com resumo do que falta.
- Botao continuar deve explicar bloqueio quando desabilitado.

## Funcoes Existentes Que Precisam Permanecer

Nao remover:

- criacao de torneio;
- inscricao publica;
- aprovacao/rejeicao/lista de espera;
- geracao de jogos;
- agenda;
- chave/classificacao;
- chat;
- envio de resultado por jogador;
- revisao/aplicacao de resultado enviado;
- lancamento de placar por admin;
- WO;
- limpar resultado;
- equipe/staff;
- configuracao detalhada;
- publicacao/exportacao.

Reposicionar:

- setup raro para `Configuracao`;
- operacao diaria para `Cockpit da fase`;
- status/finalizacao para CTA de fase;
- player match room para area participante;
- organizador para Competition OS/Trabalho.

## Proxima Queue Recomendada

ID: `FLOW-V4-TORNEIO-E2E`

Nome: Corrigir cockpit de torneio por fluxo real.

Objetivo: fazer o torneio ser operado de ponta a ponta com caminho claro para jogador e organizador, preservando rotas e permissoes.

Arquivos provaveis:

- `src/pages/TournamentPage.tsx`
- `src/lib/tournaments.ts`
- `src/App.tsx`
- `supabase/migrations/*tournament*result*`
- `docs/Legado/2026-05-22_pre_v4_archived/EXECUTION_QUEUE.md`

O que alterar:

- Corrigir RPC de envio de resultado pelo jogador.
- Criar CTA de fase para `Encerrar inscricoes`, `Gerar jogos`, `Publicar jogos`, `Lancar resultado`, `Finalizar torneio`.
- Mudar pos-criacao para cockpit de inscricoes/publicacao.
- Criar comportamento de refetch para inscricoes externas.
- Trocar autosave de placar por salvamento explicito/validado.
- Reduzir tiers da area de organizacao.
- Separar configuracao de operacao.

O que nao alterar:

- Backend estrutural fora dos bugs de RPC.
- Permissoes.
- Rotas publicas `/join`, `/inscricao`, `/t`.
- Dados existentes.

Critérios de aceite:

- Owner cria torneio, recebe inscricoes, aprova, encerra, gera jogos, lanca resultados e finaliza sem procurar status escondido.
- Jogador inscrito abre partida e envia resultado sem erro de console.
- Admin ve resultado enviado e consegue aplicar como oficial.
- Placar incompleto nao mostra sucesso de resultado oficial.
- Final com vencedores aparece automaticamente apos semifinais.
- Finalizacao aparece apenas quando todos os jogos necessarios estao resolvidos.
- Mobile 390 e desktop 1366 mantem CTA primario visivel.

QA obrigatorio:

- Owner desktop 1366: fluxo completo.
- Owner mobile 390: aprovar e gerar jogos.
- Jogador desktop 1366: enviar resultado.
- Jogador mobile 390: abrir partida e enviar resultado.
- Scorekeeper/staff: lancar resultado sem acesso a configuracao owner-only.

Rollback:

- Manter rotas antigas como wrapper.
- Preservar select de status em configuracao avancada enquanto os CTAs de fase amadurecem.

## Addendum De Correcao - 2026-05-20 21:50 America/Cuiaba

Solicitacao: corrigir o erro de envio de resultado e voltar para concluir o torneio.

Correcoes aplicadas:

- `src/lib/tournaments.ts`
  - `submitTournamentMatchResult` ganhou fallback para o ambiente remoto quando o RPC antigo retorna `column reference "tournament_id" is ambiguous`.
  - O fallback tenta primeiro o RPC normal, preservando a regra de negocio existente. Se o erro especifico de ambiguidade acontecer, grava a submissao em `tournament_match_result_submissions` usando a sessao autenticada e as politicas RLS de membro do torneio.
- `supabase/migrations/0092_fix_tournament_result_submission_rpc_return.sql`
  - Nova migration para recriar `app_submit_tournament_match_result` retornando `setof public.tournament_match_result_submissions`, removendo a colisao entre colunas de retorno e colunas reais da tabela.
- `src/pages/TournamentPage.tsx`
  - A entrada `Configuracao` ficou acessivel tambem em torneio ao vivo/finalizado para owner/staff autorizado, evitando que `Status` e ajustes owner-only desaparecam depois que a competicao entra em operacao.
- `scripts/tournament-e2e-flow-audit.mjs`
  - Auditoria atualizada para aplicar resultado enviado pelo jogador e seguir concluindo partidas via UI.

Validacao executada:

- Build: `npm.cmd run build` passou.
- Run corrigido: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run8-fixed-complete/`
  - O jogador abriu a sala da partida e enviou resultado.
  - Console nao registrou mais `column reference "tournament_id" is ambiguous`.
  - Owner aplicou o resultado enviado: `Aplicar B 6/2`.
- Run final: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run10-final-match/`
  - Semifinal 1 concluida via botao `WO Lucas Yamamoto`.
  - Semifinal 2 concluida com resultado enviado por jogador e aplicado pelo owner: `Nicolas Henrique 6/2 Karina Queiroz`.
  - Final concluida via botao `WO Lucas Yamamoto`.
  - Torneio permaneceu com `status = finished`.

Estado final verificado no banco:

```json
{
  "status": "finished",
  "rounds": [
    {
      "name": "Semifinal",
      "matches": [
        {
          "a": "Lucas Yamamoto",
          "b": "Mariana Almeida",
          "done": true,
          "winner": "Lucas Yamamoto",
          "scoreLabel": "WO:a"
        },
        {
          "a": "Nicolas Henrique",
          "b": "Karina Queiroz",
          "done": true,
          "winner": "Nicolas Henrique",
          "scoreLabel": "resultado enviado por jogador, 6/2"
        }
      ]
    },
    {
      "name": "Final",
      "matches": [
        {
          "a": "Lucas Yamamoto",
          "b": "Nicolas Henrique",
          "done": true,
          "winner": "Lucas Yamamoto",
          "scoreLabel": "WO:a"
        }
      ]
    }
  ]
}
```

Conclusao:

- O erro de envio de resultado por jogador foi corrigido no app e coberto por migration.
- O torneio QA foi concluido de ponta a ponta em UI.
- Ainda permanece como melhoria de UX/produto: lancamento manual de placar pelo admin deve virar acao explicita `Salvar resultado oficial`, porque o modelo atual salva campos parciais automaticamente e pode confundir o operador.

## Addendum De Correcao - 2026-05-20 23:25 America/Cuiaba

Solicitacao: verificar todos os erros e itens citados pela analise e corrigir os defeitos encontrados no fluxo real de torneio.

Correcoes adicionais aplicadas:

- `src/pages/TournamentPage.tsx`
  - Lancamento manual de placar pelo admin deixou de salvar campo parcial automaticamente.
  - Placar administrativo agora usa rascunho local e exige clique explicito em `Salvar resultado oficial`.
  - Placar incompleto passa a bloquear salvamento oficial com mensagem de erro.
  - Cockpit ganhou CTA de fase para `Encerrar inscricoes` quando nao existem pendencias de inscricao.
  - Cockpit ganhou CTA de fase para `Finalizar torneio` quando todos os jogos necessarios estao resolvidos.
  - Inscricoes sao recarregadas ao entrar em `Jogadores`, ao voltar o foco da janela e ao tornar a aba visivel, reduzindo o risco de inscricao externa nao aparecer.
- `src/pages/EventsPage.tsx`
  - Pos-criacao de torneio agora direciona o owner para `/eventos/:id/organizacao`, nao para a pagina publica de jogos vazia.
  - Wizard de criacao ganhou mensagens bloqueantes claras por etapa.
- `src/components/SetupWizard.tsx`
  - Etapas bloqueadas agora aceitam `blockedHint` para explicar exatamente o que falta.
- `scripts/tournament-e2e-flow-audit.mjs`
  - Auditoria passou a priorizar campos dentro do modal ativo, evitando preencher filtros da pagina por engano.
  - Auditoria aceita o novo destino pos-criacao em `organizacao`.
  - Auditoria tenta encerrar inscricoes pelo CTA principal antes de recorrer ao seletor de status.
  - Auditoria registra e aplica resultado enviado por jogador, depois conclui jogos restantes pela UI.

Defeitos corrigidos da analise:

- Criar torneio deixava o owner em uma superficie pouco operacional. Agora cai no cockpit de organizacao.
- O wizard podia bloquear avanco sem explicar bem o motivo. Agora mostra o que falta em cada etapa.
- Inscricoes criadas externamente podiam nao aparecer sem reload manual. Agora ha refetch por foco/visibilidade e entrada na aba.
- Encerrar inscricoes e finalizar torneio dependiam demais de configuracao/status escondido. Agora ha CTA de fase no cockpit.
- Placar admin parcial podia gerar sensacao de sucesso indevido. Agora exige salvamento explicito e validacao antes de aplicar resultado oficial.
- Resultado enviado pelo jogador quebrava por RPC remoto antigo. Agora ha fallback no app e migration para corrigir a funcao.

Validacao executada:

- Build: `npm.cmd run build` passou apos as correcoes.
- Run pos-correcao em torneio existente: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run12-post-defect-fixes/`
  - Fluxo concluido sem `pageErrors` e sem `failedRequests`.
- Run fresco completo: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run15-fresh-full-after-fixes/`
  - Torneio criado: `ATP Open Dourados 021743`
  - ID: `a32cb410-0624-42f6-a051-6d397fb08149`
  - Fluxo passou por criacao, inscricoes, aprovacao, encerramento, geracao de jogos, login de jogador, envio de resultado, aplicacao pelo owner, WOs, finalizacao e classificacao final.
  - Diagnostico: `completed = true`, `failedRequests = []`, `pageErrors = []`.
  - Console registrou apenas mensagens esperadas de Vite/React DevTools em ambiente dev.

Estado final verificado:

```json
{
  "tournamentId": "a32cb410-0624-42f6-a051-6d397fb08149",
  "status": "finished",
  "completed": true,
  "playerResultSubmit": true,
  "ownerAppliedSubmittedResult": true,
  "consoleErrors": 0,
  "failedRequests": 0,
  "pageErrors": 0
}
```

Pendencias restantes de produto/UX:

- A organizacao de torneio ainda merece uma sprint estrutural maior para reduzir tiers, duplicidade de abas e excesso de informacao na mesma dobra.
- O teste fresco validou resultado enviado por jogador e WOs via UI. O novo fluxo de placar manual admin ficou compilado e protegido por validacao, mas ainda merece QA manual focado com digitacao de placar set a set.
- A comparacao de menus entre multiplas academias/local ativo ainda precisa de mapeamento completo de IA, porque o problema e de arquitetura global e nao apenas de torneios.

## Addendum De Correcao - 2026-05-20 23:58 America/Cuiaba

Solicitacao: interpretar a analise e corrigir todos os pontos possiveis em sprint, sem pausa entre queues.

Correcoes aplicadas nesta rodada:

- `src/App.tsx`
  - Criados aliases humanos preservando rotas antigas:
    - `/jogar` -> `/locais`
    - `/competir` -> `/eventos`
    - `/trabalho` -> `/gestao`
    - `/trabalho/competicoes` -> `/eventos?modo=organizing`
    - `/trabalho/atendimento` -> `/gestao`
- `src/pages/TournamentPage.tsx`
  - O mapa completo do organizador e a trilha de fases deixaram de competir na primeira dobra.
  - Areas completas, fases e configuracao foram recolhidas em `Mais navegacao do torneio`.
  - O cockpit principal continua respondendo primeiro `o que falta resolver agora?`.
- `src/pages/ManagementHubPage.tsx`
  - Atalhos de modulos de cada local foram recolhidos em `Mais areas do local`.
  - A row de cada local fica mais focada em escopo, pendencias e acao primaria, reduzindo a sensacao de menu duplicado quando ha mais de uma academia/local.
- `src/App.css`
  - Adicionados estilos premium dark para `Mais navegacao do torneio` e `Mais areas do local`.
  - Preservado contraste em Competition OS e Management OS.
- `scripts/tournament-e2e-flow-audit.mjs`
  - Auditoria passou a testar placar manual admin digitado de verdade.
  - Auditoria deixou de aceitar finalizacao escondida por select de status como caminho normal.
  - Se o torneio ja for inferido como finalizado apos todos os jogos, a auditoria aceita esse estado e segue para classificacao.

Achados durante a correcao:

- O primeiro ajuste da auditoria revelou que o fallback antigo de finalizacao por `Status = finished` podia mascarar fluxo incompleto. A auditoria foi endurecida para exigir CTA/estado final real.
- Ao finalizar todos os jogos, o frontend infere o status `finished` por `inferTournamentStatusFromData`, portanto a tela pode aparecer finalizada sem precisar clicar novamente em `Finalizar torneio`.
- O placar admin manual agora foi validado em fluxo real: preencher 6/2, clicar `Salvar resultado oficial`, recomputar chave e seguir para a final.

Validacao executada:

- Build: `npm.cmd run build` passou antes da auditoria E2E.
- Run de diagnostico que revelou o mascaramento do fallback: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run18-admin-score-cta-required/`.
- Run de continuidade validando placar manual admin: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run19-debug-admin-score/`.
- Run fresco final: `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run20-final-sprint-pass/`.
  - Torneio criado: `ATP Open Dourados 025536`
  - ID: `688f0ba9-8278-4c39-ade0-1c3ec6e80f46`
  - Resultado enviado pelo jogador aplicado pelo owner.
  - Placar manual admin salvo por `Salvar resultado oficial`.
  - Final concluida por WO via UI.
  - Torneio finalizado e classificacao capturada.
  - Diagnostico: `completed = true`, `failedRequests = []`, `pageErrors = []`.

Estado final verificado:

```json
{
  "tournamentId": "688f0ba9-8278-4c39-ade0-1c3ec6e80f46",
  "completed": true,
  "adminManualScore": true,
  "playerResultSubmit": true,
  "failedRequests": 0,
  "pageErrors": 0
}
```

Pendencias restantes:

- A arquitetura de multiplos locais ficou menos ruidosa na central, mas ainda pede uma sprint especifica de `local ativo`/`workspace switcher` dentro dos modulos profundos.
- O Competition OS ficou menos carregado na primeira dobra, mas uma futura sprint pode transformar as tabs internas em subviews ainda mais orientadas por fase.

## Addendum De Revalidacao Pos-Correcoes - 2026-05-21 00:25 America/Cuiaba

Solicitacao: apos todas as correcoes, rodar torneio novamente procurando se tudo foi corrigido; se nao houver bloqueio novo, interpretar a analise e corrigir os pontos encontrados em sprint.

Reruns executados:

- `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run21-post-fixes/`
  - Torneio criado: `ATP Open Dourados 030841`
  - ID: `e358a441-3678-431e-9e3c-79db8bb60a93`
  - Resultado: fluxo funcional passou, mas os prints revelaram copy ruim na aba de classificacao final de torneio mata-mata.
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run22-post-classification-fix/`
  - Torneio criado: `ATP Open Dourados 031559`
  - ID: `cfb0bc0c-9ce6-4455-82a2-ae6a272dca16`
  - Resultado: fluxo funcional passou e a aba de classificacao passou a mostrar resultado final da classe, mas o card de podio ficou branco dentro do tema dark, com baixo contraste.
- `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run23-final-post-fixes/`
  - Torneio criado: `ATP Open Dourados 032025`
  - ID: `23fb0ac9-8436-4cd1-a68c-d23cf0129b56`
  - Resultado: fluxo completo aprovado apos correcoes funcionais e visuais.

Correcoes aplicadas nesta rodada:

- `src/pages/TournamentPage.tsx`
  - A aba `Classificacao` deixou de mostrar `Classificacao ainda nao publicada` quando a classe finalizada e mata-mata ja possui campeao.
  - Em torneio mata-mata finalizado, a aba agora mostra `Resultado final da classe` com campeao, vice e origem da final.
  - Quando nao houver tabela de grupos e o torneio ainda nao estiver finalizado, a mensagem explica que `Classificacao por grupos nao se aplica` e orienta o usuario a usar `Jogos`/podio.
- `src/App.css`
  - Card de podio em Competition OS recebeu fundo dark, borda dourada, texto legivel e botao coerente com o tema premium dark.
  - Corrigido contraste do podio em desktop e mobile.

Validacao final:

- `npm.cmd run build` passou depois das correcoes.
- `git diff --check` passou sem erros, apenas avisos CRLF do workspace Windows.
- Run final fresco: `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run23-final-post-fixes/`.
- Diagnostico final:

```json
{
  "tournamentId": "23fb0ac9-8436-4cd1-a68c-d23cf0129b56",
  "name": "ATP Open Dourados 032025",
  "completed": true,
  "playerResultSubmit": true,
  "ownerAppliedSubmittedResult": true,
  "adminManualScore": true,
  "walkoverUi": true,
  "failedRequests": 0,
  "pageErrors": 0
}
```

Observacao sobre `resultAttempts`:

- O diagnostico registra um ultimo item `ok: false` com `reason: no-pending-editable-match`.
- Isso nao e bloqueio: ele ocorre depois que todos os jogos reais ja foram resolvidos, para confirmar que nao restou partida pendente editavel.

Resultado da rechecagem:

- Criacao, inscricoes, aprovacao, encerramento, geracao de jogos, resultado por jogador, aceite pelo owner, placar manual admin, WO, finalizacao e tela final passaram.
- Sem erro de app no console; apenas mensagens esperadas de Vite/React DevTools em dev.
- Sem requests falhas.
- Sem page errors.

Pendencias residuais:

- A barra inferior mobile continua fixa sobre a area inferior do viewport, comportamento esperado do bottom nav; os prints full-page podem mostrar a barra sobre conteudo durante captura, mas o fluxo nao bloqueou interacao.
- A proxima melhoria de produto ainda e estrutural: quebrar subviews de torneio/liga em telas mais especificas por fase, caso queiramos reduzir ainda mais densidade.
