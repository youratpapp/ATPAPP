# Contextual UX Restructure Analysis

Data: 2026-05-17  
Fonte principal: `manual_frontend_design_produto_apps_modernos.md`, `COMPONENT_GRAMMAR.md`, `CURRENT_PRODUCT_STATE.md`, `UX_FRONTEND_AUDIT.md` e codigo em `web/src`.

## 1. Resumo executivo

O app ja tem uma base forte: existem tres superficies conceituais (`Player App`, `Competition OS`, `Management OS`), rotas publicas mais limpas, action rails, filtros guiados, drawers, paginas publicas de locais e competicoes separadas por intencao, e varias queues recentes foram concluidas com bons ganhos.

O problema desta nova frente nao e falta de funcionalidade. O problema e orquestracao de contexto.

Hoje o produto ainda quebra fluidez em alguns pontos porque:

- o modo visual e inferido pela rota, nao por uma escolha explicita e persistida do usuario;
- a sala de jogo ainda pode expandir dentro da pagina ou levar o usuario para outro lugar, em vez de abrir como interacao contextual;
- feedbacks de sucesso/erro estao espalhados por pagina e podem ficar longe da viewport;
- perfil de jogador ainda nao e um objeto navegavel central a partir de rankings, partidas e listas;
- anotacoes privadas de adversarios nao existem como capacidade de produto;
- turmas de academia ainda sao modeladas como uma turma por `weekday`, enquanto a vida real usa a mesma turma em multiplos dias;
- torneio/liga ja melhoraram, mas ainda precisam padronizar "minha central" vs "visao geral";
- modais, sheets, drawers, popovers e formularios ainda nao tem um contrato unico de responsividade, foco, scroll e safe area.

Pelo manual, o app precisa esconder complexidade interna e organizar a tela pela tarefa. Portanto, a prioridade nao deve ser "adicionar mais cards", mas sim transformar acoes importantes em interacoes no lugar certo, com uma superficie correta para cada perfil.

## 2. Principios que governam esta frente

1. Uma tela deve responder rapidamente: onde estou, o que posso fazer agora, o que e secundario.
2. Jogador nao deve receber cockpit administrativo.
3. Gestao pode ser densa, mas deve ser operacional, nao um catalogo de modulos.
4. Acao pessoal urgente nao vira carrossel nem fica escondida.
5. Detalhe e interacao curta abrem em modal/drawer/sheet, preservando contexto.
6. Setup raro pode usar pagina/wizard; rotina diaria nao.
7. Mobile nao e desktop empilhado: filtros viram sheets, listas viram rows, CTA fica perto do polegar quando necessario.
8. Feedback de mutacao precisa ser visivel no momento em que acontece.
9. Perfil, partida, turma, reserva e competicao devem ser entidades navegaveis e reconheciveis.
10. Complexidade de backend deve existir, mas nao aparecer como bagunca na interface.

## 3. Estado atual confirmado no codigo

### Superficie e navegacao

Arquivos:

- `web/src/lib/role-visibility.ts`
- `web/src/components/AppShell.tsx`
- `web/src/components/BottomNav.tsx`

Achado:

- `AppSurfaceMode` ja existe com `player`, `competition` e `management`.
- `getRouteSurfaceMode(pathname)` decide superficie pela rota.
- `BottomNav` ja adapta entradas de trabalho conforme permissao.
- Ainda nao existe `Modo Jogador` / `Modo Gestao` como preferencia explicita, persistida e usada para moldar menu e prioridade de rotas.

Impacto UX:

- usuario multi-papel pode sentir que o app troca de personalidade conforme a rota, nao conforme a intencao dele;
- jogador com permissao profissional ainda percebe entradas administrativas perto da experiencia de jogar;
- voltar/login pode reabrir uma superficie que nao e a intencao atual.

### Feedbacks

Achado:

- ha dezenas de `setFeedback`, `className="feedback"` e mensagens locais nas paginas.
- nao ha um padrao global evidente de `ToastProvider`/`useToast`.

Impacto UX:

- sucesso/erro pode aparecer longe da acao;
- erros tecnicos podem vazar dependendo da pagina;
- mobile pode nao mostrar a mensagem porque ela ficou acima/abaixo da dobra.

### Modais, drawers e filtros

Arquivos:

- `web/src/components/EntityDrawer.tsx`
- `web/src/components/ResponsiveFilterSheet.tsx`

Achado:

- existe drawer reutilizavel, mas sem contrato completo de foco, scroll lock, safe area, teclado mobile e aria robusto.
- `ResponsiveFilterSheet` renderiza `children` inline e no drawer; isso pode duplicar campos/controladores e gerar inconsistencias futuras.

Impacto UX:

- modais cortados/overflow quebrado tendem a voltar;
- mobile pode sofrer com hover, foco e teclado;
- filtros podem quebrar quando o mesmo formulario aparece em dois lugares.

### Sala de jogo

Arquivos:

- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/pages/TournamentPage.tsx`
- `web/src/lib/leagues.ts`
- `web/src/lib/tournaments.ts`

Achado:

- em liga, `Abrir sala` usa `expandedMatchId` e renderiza uma sala inline com disponibilidade, resultado e mensagens.
- em torneio, ha fluxo de resultado/confirmacao tambem localizado dentro da pagina.
- ja existem RPCs especificas de resultado (`app_submit_league_match_result`, `app_submit_tournament_match_result`).

Impacto UX:

- abrir uma sala aumenta a pagina e muda a geometria da tela;
- o usuario perde contexto quando veio de Home, notificacao, ranking ou lista de partidas;
- a sala precisa virar componente contextual compartilhado, nao uma expansao de lista.

### Perfil de jogador e nomes clicaveis

Arquivos:

- `web/src/pages/ProfilePage.tsx`
- `web/src/pages/RankingPage.tsx`
- `web/src/pages/LeagueDetailsPage.tsx`
- `web/src/pages/TournamentPage.tsx`
- `web/src/lib/profiles.ts`
- `web/src/lib/rankings.ts`
- `web/src/lib/leagues.ts`
- `web/src/lib/tournaments.ts`

Achado:

- `ProfilePage` e focada no usuario logado.
- `fetchPublicProfiles(userIds)` existe.
- rankings e jogadores de liga/torneio carregam `userId` em varios casos.
- nomes em ranking/listas aparecem como texto, nao como link de perfil.
- nao existe tabela/servico de anotacao privada do usuario sobre adversarios.

Impacto UX:

- ranking e partidas nao viram rede de descoberta esportiva;
- jogador nao consegue aprender sobre adversario nem manter scouting pessoal;
- app perde uma camada social/competitiva simples e util sem virar rede social pesada.

### Turmas de academia multi-dia

Arquivos:

- `web/src/lib/places.ts`
- migrations `0018`, `0033`, `0055`, `0061`, `0074`, `0075`, `0076`

Achado:

- `place_academy_classes` usa `weekday` unico.
- regras de conflito de professor/quadra tambem consideram `weekday`.
- regras de reserva (`place_booking_rules`) ja usam `weekdays`, mas turmas nao.
- a UI publica ja agrupa turmas recorrentes equivalentes para interesse em mais de um dia, mas a modelagem real ainda e uma ocorrencia por dia.

Impacto UX:

- criar turma de segunda/quarta/sexta exige duplicacao mental;
- aluno pode pedir multiplos dias na descoberta, mas gestao ainda trata como linhas separadas;
- agenda, chamada, mensalidade e conflito precisam de uma nocao clara de "serie" vs "ocorrencia".

## 4. Analise por frente solicitada

### 4.1 Perfil do usuario, estatisticas e anotacoes privadas

#### Problema

O jogador aparece em rankings, partidas, inscritos e listas, mas o nome ainda nao funciona como porta para uma ficha esportiva. Isso impede uma descoberta natural: "quem e esse jogador?", "como ele joga?", "ja joguei contra ele?".

#### Solucao desejada

Criar uma pagina publica/controlada de jogador:

- rota sugerida: `/jogadores/:userId` ou `/perfil/:userId`;
- nome, foto, cidade/UF e bio publica;
- historico de partidas disponivel a partir de ligas/torneios/resultados;
- estatisticas simples: jogos, vitorias, derrotas, aproveitamento, ultimos resultados, ranking quando houver;
- confrontos contra o usuario logado quando houver dados;
- anotacao privada do usuario logado sobre aquele jogador.

#### Backend necessario

Adicionar tabela segura:

```sql
player_private_notes (
  owner_user_id uuid not null references auth.users(id),
  target_user_id uuid not null references auth.users(id),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (owner_user_id, target_user_id)
)
```

RLS:

- owner pode ler/inserir/atualizar/deletar apenas suas notas;
- target nunca le nota feita sobre ele;
- service role mantem acesso administrativo tecnico.

#### UX desktop

- nome clicavel em ranking/listas abre pagina/drawer de perfil.
- em desktop, pode abrir painel lateral quando o usuario esta em lista densa, ou pagina dedicada quando veio de rota direta.
- anotacao fica em bloco discreto: `Minhas anotacoes sobre este jogador`.
- salvar automatico com debounce e feedback pequeno `Salvo`.

#### UX mobile

- toque no nome/avatar abre pagina dedicada ou full sheet.
- anotacao deve ser textarea compacta com autosave, sem botao grande de salvar.
- historico aparece como lista, nao tabela.

#### Guardrails

- se item nao tem `userId` real (wildcard, inscricao manual, nome solto), nao transformar em link falso;
- nao expor telefone/email em perfil publico;
- estatistica inicial pode ser derivada do que ja existe, sem criar motor de ranking novo.

#### Decisao de privacidade 2026-05-17

O perfil do jogador deve ter dois modos:

- `public`: exibe nome, foto, cidade/UF, bio e resumo competitivo;
- `private`: esconde dados pessoais e vitrine publica para terceiros.

Mesmo no modo `private`, o resumo competitivo publico, rankings e o bloco de confronto direto devem permanecer visiveis quando houver relacao competitiva entre os usuarios. Motivo: esses dados pertencem ao contexto esportivo compartilhado de torneios/ligas, nao a dados pessoais sensiveis. Eles ajudam o usuario a se preparar para uma partida sem expor telefone, e-mail, bio, cidade detalhada, foto ou vitrine pessoal.

Regra de produto:

- dado pessoal pertence ao perfil e respeita privacidade;
- dado competitivo gerado por uma competicao/partida publica ou compartilhada pode aparecer no contexto minimo necessario;
- anotacoes privadas pertencem exclusivamente ao usuario que escreveu e nunca ao jogador observado.

### 4.2 Sala de jogo contextual para liga e torneio

#### Problema

`Abrir sala` hoje pode expandir a lista ou forcar o usuario a procurar a partida em outra aba. Isso quebra o fluxo.

#### Solucao desejada

Criar um componente compartilhado:

- `MatchRoomDialog` ou `MatchRoomSheet`;
- recebe `sourceType: "league" | "tournament"`;
- recebe `matchId`, `eventId`, `currentUser`, permissao e callbacks de refresh;
- no desktop abre como modal/drawer centralizado/lateral;
- no mobile abre como bottom sheet full height;
- preserva a tela atual atras;
- fecha e devolve o usuario exatamente ao ponto anterior.

#### Conteudo da sala

- cabecalho com evento, classe/fase/rodada, jogadores e status;
- agenda/disponibilidade quando aplicavel;
- confirmar presenca quando aplicavel;
- resultado com mesmo componente de placar usado pelo admin;
- chat/WhatsApp ou comunicacao quando permitido;
- historico de envios/confirmacoes;
- feedback claro de sucesso/erro.

#### Arquitetura

1. Extrair formulario de placar para componente unico:
   - `MatchScoreForm`
   - props de formato da partida;
   - abre tiebreak por set quando regra exigir;
   - usado por admin e jogador.
2. Criar adaptadores:
   - `LeagueMatchRoom`
   - `TournamentMatchRoom`
3. Remover dependencia de `expandedMatchId` como experiencia principal.
4. Opcional: query param `?room=matchId` para abrir direto via notificacao, sem transformar sala em aba separada.

#### Guardrails

- nao remover paginas/listas existentes;
- manter refresh visual apos mutacao;
- se modal falhar ao carregar, mostrar estado amigavel dentro do modal.

### 4.3 Turmas com multiplos dias

#### Problema

Turma real frequentemente acontece segunda/quarta/sexta no mesmo horario, mas o banco trabalha com uma ocorrencia por dia.

#### Solucao recomendada de menor risco

Criar conceito de serie mantendo ocorrencias reais:

- adicionar `series_id uuid` ou `recurrence_group_id uuid` em `place_academy_classes`;
- criar uma turma por dia, mas vinculada a mesma serie;
- UI mostra como uma turma recorrente;
- chamada, presenca e conflitos continuam por ocorrencia/dia;
- matricula/contrato pode selecionar um ou mais `class_id` da serie.

Alternativa mais estrutural:

- criar `place_academy_class_series` como entidade principal e `place_academy_class_occurrences` para dias.
- e mais limpo a longo prazo, mas maior risco porque toca mais queries, policies, RPCs e tela de gestao.

#### UX de criacao

1. Dados da turma: titulo, nivel, perfil, mensalidade, capacidade.
2. Horario: inicio/fim.
3. Dias: chips `Seg`, `Ter`, `Qua`, `Qui`, `Sex`, `Sab`, `Dom`.
4. Recursos: professor e quadra.
5. Preview: "Serao criadas 3 ocorrencias: Seg 18h, Qua 18h, Sex 18h".
6. Validacao: conflitos por professor/quadra antes de salvar.

#### UX para aluno

- aluno escolhe turma/serie e seleciona dias especificos;
- valor pode ser por plano/quantidade de aulas ou mensalidade da turma;
- apos aprovacao, aparece em `Minhas aulas` com dias escolhidos.

#### Guardrails

- nao mudar tudo para `weekdays` array sem rever triggers de conflito;
- nao esconder ocorrencias quando gestor precisa fazer chamada por dia;
- preservar turmas existentes como series de 1 dia.

### 4.4 Modais, formularios, dropdowns e popovers

#### Problema

Ha componentes reutilizaveis, mas ainda nao existe uma camada unica de dialog/sheet com contrato completo.

#### Solucao desejada

Criar padrao:

- `AppDialog` para desktop;
- `AppSheet` para mobile;
- `AppPopover` para elementos ancorados como sino/menus curtos;
- `FormDialogLayout` para formulario com header, body scrollavel e action bar fixa.

Requisitos:

- foco inicial e retorno de foco ao fechar;
- fechar por Escape;
- backdrop consistente;
- scroll lock do body;
- `max-height: min(90dvh, ...)`;
- safe area mobile;
- action bar sticky dentro do modal;
- labels e aria;
- hover nao pode ser necessario em mobile;
- dropdown nao deve sumir em touch.

#### Onde aplicar primeiro

1. Sala de jogo.
2. Notificacoes.
3. Filtros mobile.
4. Drawers de gestao/academia.
5. Formularios de criacao/edicao longos.

### 4.5 Feedbacks visuais

#### Problema

Feedback local por pagina nao garante visibilidade.

#### Solucao desejada

Criar `ToastProvider` global:

- `useToast().success(message)`
- `useToast().error(message, detail?)`
- `useToast().info(message)`
- `useToast().loading/promise` se fizer sentido.

Posicionamento:

- desktop: canto superior direito ou inferior direito, dentro da area segura;
- mobile: acima da bottom nav ou no topo com safe area, sem cobrir CTA critico;
- stack maximo de 3;
- auto-dismiss para sucesso, persistente para erro ate fechar.

Regra:

- validacao de formulario fica inline;
- resultado de API/mutacao vai para toast;
- erro tecnico vai para console/log, UI recebe mensagem amigavel.

### 4.6 Torneios: duplicacao de jogos e central do jogador

#### Problema

Jogos do usuario e visao geral da classe podem aparecer como blocos concorrentes, repetindo partida e confundindo prioridade.

#### Solucao desejada

Na aba `Jogos`:

1. `Sua central do torneio`
   - aparece somente quando o usuario tem partida, pendencia ou inscricao relevante;
   - mostra proximas partidas do usuario;
   - CTA direto: confirmar presenca, abrir sala, informar resultado, ver WhatsApp;
   - nao duplica chave inteira.
2. `Visao geral`
   - mostra chave/lista/fase da classe selecionada;
   - exportar chave como acao secundaria;
   - filtro de classe/fase no topo.

#### "Ver meus jogos"

- na aba `Evento`, o botao deve levar para `Jogos` com foco em `Sua central do torneio`;
- se houver uma unica pendencia critica, pode abrir a sala contextual direto;
- se nao houver jogos, mostrar empty state curto e indicar chave/classe.

### 4.7 Seletor de chave/classe no torneio

#### Problema

Quando existem muitas classes, chips + select juntos criam ruido. Em algumas telas a formatacao dos botoes tambem pesa mais que o conteudo.

#### Solucao desejada

Reutilizar padrao da liga:

- ate 6 classes: chips horizontais com snap no mobile;
- acima de 6: select unico com busca/agrupamento se necessario;
- nunca mostrar chips e select como controles equivalentes ao mesmo tempo;
- seletor aparece dentro das abas que precisam: `Inscritos`, `Jogos`, `Classificacao` quando aplicavel;
- `Categorias` nao volta como aba publica independente.

### 4.8 Separacao total: Modo Jogador vs Modo Gestao

#### Problema

A separacao atual por rota ja ajuda, mas nao resolve o caso mental: "agora estou usando como jogador" vs "agora estou trabalhando".

#### Solucao desejada

Criar `UserModeContext`:

- `player`
- `work`

Dentro de `work`, a rota/permissao decide se e competicao, gestao de local, professor, financeiro, caixa etc.

Persistencia:

- primeiro passo: `localStorage` por user id;
- opcional futuro: coluna/preferencia em `profiles` ou tabela de preferencias.

Comportamento:

- se usuario so tem jogador: nao mostrar seletor;
- se usuario tem gestao/organizacao/professor: mostrar seletor claro no shell;
- ao alternar para `player`, menu vira jogador e Home vira jogador;
- ao alternar para `work`, menu vira trabalho e abre o melhor destino permitido (`/gestao` ou `/eventos/torneios?view=organizing`);
- rotas diretas continuam funcionando, respeitando permissao;
- se acessar rota profissional sem permissao, cair em estado amigavel.

UX:

- web: seletor compacto perto da marca/perfil;
- mobile: opcao no header/perfil ou sheet de contexto, sem poluir bottom nav;
- texto: `Jogador` e `Trabalho`, evitando "admin" para quem e professor/organizador.

## 5. Problemas adicionais relacionados

1. Perfil publico precisa respeitar privacidade: telefone/email nao entram na ficha publica.
2. Ranking deve linkar nomes, mas manter `Seguir` como acao secundaria; o toque no nome/avatar abre perfil.
3. Notificacoes que apontam para sala devem abrir a sala contextual, nao navegar para pagina longa.
4. Classe/fase/rodada devem ser filtros contextuais, nao abas duplicadas.
5. Modais de formulario em mobile precisam action bar fixa; do contrario o usuario perde o botao principal.
6. A criacao multi-dia de turma precisa validar conflitos antes de criar varias ocorrencias.
7. Toast global nao substitui feedback inline de campo; os dois precisam coexistir com papeis diferentes.
8. O modo `work` nao pode vazar para jogador puro nem mostrar modulo sem permissao/plano.

## 6. Impactos de arquitetura

| Frente | Frontend | Backend | Risco |
| --- | --- | --- | --- |
| Perfil publico | Nova rota, links em listas, agregador de historico | talvez nenhuma migration para perfil; consulta agregada | Medio |
| Anotacoes privadas | Componente de autosave | nova tabela + RLS | Medio |
| Sala modal | Extrair componentes de placar/sala, estado global/local | sem nova tabela se usar RPCs atuais | Medio/Alto |
| Multi-dia turma | Formulario novo, agrupamento de series, conflitos | migration de `series_id` ou nova entidade | Alto |
| Modal system | Componentes base e CSS | nenhum | Medio |
| Toast global | Provider, hook e migracao gradual de feedbacks | nenhum | Medio |
| Torneio central | Reorganizar abas e foco | nenhum se dados existem | Medio |
| Seletor de classe | componente compartilhado | nenhum | Baixo |
| Modo jogador/trabalho | Context provider, nav, persistencia, redirects | opcional futuro | Alto |

## 7. Ordem recomendada de implementacao

1. `CTX-FEEDBACK-01` e `CTX-MODAL-01`: base de confiabilidade visual.
2. `CTX-MATCHROOM-01`: sala contextual usa a base de modal e feedback.
3. `CTX-TOURNAMENT-01` e `CTX-TOURNAMENT-02`: removem duplicacao e ajustam "Ver meus jogos" e seletor.
4. `CTX-PLAYER-01`: perfil publico navegavel.
5. `CTX-SCOUT-01`: anotacoes privadas, ja dentro do perfil.
6. `CTX-MODE-01`: modo jogador/trabalho persistido, depois que rotas principais estao mais limpas.
7. `CTX-ACADEMY-01`: multi-dia de turmas, por exigir migration e validacao ampla.
8. `CTX-QA-01`: validacao cruzada web/mobile/permissao.

## 8. Criterios globais de aceite

- nenhuma funcionalidade atual deve desaparecer;
- jogador comum deve conseguir usar Home, Locais, Ranking, Torneio, Liga e Perfil sem ver superficie administrativa;
- usuario profissional deve conseguir alternar para trabalho sem perder ferramentas;
- toda mutacao critica mostra sucesso/erro visivel;
- sala de jogo abre sem mudar a pagina atual;
- nomes com `userId` real abrem perfil;
- anotacao privada salva e reaparece apenas para quem escreveu;
- turmas podem ser criadas com mais de um dia sem conflito silencioso;
- mobile 390px e desktop 1366px devem ser validados em cada sprint.
