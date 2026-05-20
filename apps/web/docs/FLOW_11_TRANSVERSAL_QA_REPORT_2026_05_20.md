# FLOW-11 Transversal QA Report - 2026-05-20

Fonte principal:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- app real em `http://127.0.0.1:5173/`

Objetivo desta rodada: validar se Player App, Competition OS e Management OS evoluiram sem quebrar outras personas, rotas antigas, permissoes, menus, estados vazios e viewports.

## Cobertura executada

Evidencias:

- pasta: `docs/screenshots/workflow-v3-flow11-transversal-qa-2026-05-20`
- screenshots: 169 arquivos `.png`
- diagnosticos: 169 arquivos `.diagnostics.json`
- metadados por persona: 17 arquivos `meta-*.json`
- interacoes acionadas em CTAs primarios: 6 arquivos `interactions-*.json`
- viewports: `mobile390`, `mobile430`, `desktop1366`, `desktopwide`
- build: `npm.cmd run build` passou
- console/rede: 0 erros e 0 warnings capturados

Contas auditadas:

| Persona | Conta | Rotas principais |
|---|---|---|
| Jogador puro | `qa.jogador.puro@demo.atp.local` | `/inicio`, `/agenda`, `/gestao` |
| Aluno | `jogador001@demo.atp.local` | `/inicio`, `/minhas-aulas`, `/meus-pagamentos`, `/agenda` |
| Socio | `jogador001@demo.atp.local` | `/inicio`, `/minhas-reservas`, `/locais/:placeId` |
| Jogador competitivo | `jogador002@demo.atp.local` | `/inicio`, `/eventos`, torneio, liga |
| Organizador independente | `organizador.circuito@demo.atp.local` | `/gestao`, `/eventos/:id/organizacao`, `/eventos/torneios` |
| Professor coach-only | `prof.renato@demo.atp.local` | `/gestao`, academia, tentativa de financeiro |
| Recepcao frontdesk | `recepcao.dourados@demo.atp.local` | `/gestao`, agenda, tentativa de ajustes |
| Financeiro | `financeiro.prime@demo.atp.local` | `/gestao`, financeiro, tentativa de cantina |
| Caixa | `caixa.prime@demo.atp.local` | `/gestao`, cantina, tentativa de financeiro |
| Gestor owner/manager | `gerente.dourados@demo.atp.local` | `/gestao`, financeiro, ajustes |
| Usuario multi-papel | `escalao@gmail.com` | `/inicio`, `/gestao`, liga owner, torneio owner |
| Rotas publicas/legadas | sem login | `/join`, `/t`, `/inscricao`, `/ligas`, URL com `?join=` |

## O que passou

- Player App manteve rotas antigas de agenda pessoal como wrappers/aliases: `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas`, `/meus-pagamentos` continuam abrindo a superficie de agenda.
- Jogador sem acesso de trabalho nao entra em gestao: `/gestao` mostra `Area profissional indisponivel` com CTAs para voltar ao inicio ou explorar locais.
- Trabalho Hoje responde por papel nos casos principais:
  - professor ve aulas, chamada, reposicoes e turmas;
  - financeiro ve cobrancas, recebiveis, pagamentos e despesas;
  - caixa ve PDV, vendas, estoque e produtos;
  - recepcao ve reservas, check-ins, lista de espera, clientes e aulas;
  - gestor ve pendencias consolidadas por area.
- Desktop de trabalho usa sidebar agrupada e nao mostrou grupos proibidos para financeiro/caixa/professor nos modulos testados.
- Rotas antigas de modulo continuam preservadas por alias:
  - `academy` -> `academia`;
  - `bookings` -> `agenda`;
  - `finance` -> `financeiro`;
  - `settings` -> `ajustes`;
  - `canteen` -> `cantina`.
- Permissoes sensiveis foram preservadas no comportamento observado:
  - professor tentando financeiro cai em academia;
  - recepcao tentando ajustes cai em agenda;
  - financeiro tentando cantina cai em financeiro;
  - caixa tentando financeiro cai em cantina.
- Liga participante mostra rodada atual, adversario, horario, local/status, chat/classificacao por abas e CTA de partida.
- Liga owner/multi-papel mostra pendencias da rodada atual e configuracao separada do participante.
- Torneio owner/multi-papel abre cockpit operacional com fase, bloqueios, classe, resultados, publicacao, agenda e avancado fora da rotina.
- Build passou e o console ficou limpo em todas as capturas.

## O que falhou ou precisa ajuste

1. URL com `?join=` perde token no redirect de login.
   - Entrada testada: `?join=b8c8b854-4d51-4611-b638-b465e416a0b6#/eventos/eee62a99-6929-49c6-b4b9-533e82a6c9da/organizacao`.
   - Resultado: `#/auth?next=%2Feventos%2Feee62a99-6929-49c6-b4b9-533e82a6c9da%2Forganizacao`.
   - Risco: convite/link com join token pode nao ser restaurado apos login.

2. Rotas publicas/legadas sem login nao renderizam conteudo publico, elas caem em auth com `next`.
   - `/join/:id`, `/t/:id`, `/inscricao/:id`, `/ligas/:id` preservam o `next`, mas nao exibem conteudo sem login.
   - Precisa decisao de produto: essas rotas devem ser realmente publicas ou apenas deep links autenticados?

3. Bottom nav mobile do Player App tem item extra icon-only antes de `Inicio`.
   - Referencia desejada: `Inicio | Jogar | Competir | Agenda | Perfil`.
   - Screenshot: `mobile390-p01-pure-home.png`.
   - Risco: quebra a regra de 5 destinos e cria ambiguidade visual.

4. Bottom nav mobile da recepcao marca dois itens ativos.
   - Em `/gestao`, `Hoje` e `Mais` aparecem verdes ao mesmo tempo.
   - Screenshot: `mobile390-p07-frontdesk-work.png`.
   - Risco: usuario nao entende onde esta.

5. Organizador independente tem comportamento inconsistente.
   - `/eventos/:id/organizacao` com conta `organizador.circuito` terminou em `#/eventos/:id/jogadores`.
   - CTAs de `/gestao` como `Resolver bloqueios` levam para `#/eventos?modo=organizing`, mas ainda com H1 generico `Competicoes`.
   - Interacao no item mobile `Torneios` ficou em `#/gestao`.
   - Risco: organizador autorizado pode cair em superficie de descoberta/jogador ou rota intermediaria, em vez de cockpit operacional.

6. Canteen/Caixa desktop duplica o bloco `Venda rapida`.
   - Screenshot: `desktop1366-p09-cashier-canteen.png`.
   - Risco: parece bug de composicao e confunde o operador.

7. Professor desktop ainda tem pills claras no modulo de aulas.
   - Blocos de horario no topo do `Modo professor` aparecem brancos.
   - Screenshot: `desktop1366-p06-coach-academy.png`.
   - Risco: quebra o DNA premium dark e reduz leitura.

8. Liga participante mobile ainda tem controles claros fora do padrao.
   - Pill `Ativa` e campo de horario aparecem claros/brancos.
   - Screenshot: `mobile390-p04-competitive-league.png`.
   - Risco: regressao visual pontual em Competition OS.

9. Pagina publica do local desktop tem cards inativos com texto de baixo contraste.
   - Itens como `Quadra`, `Entrar em turma`, `Jogo aberto`, `Beneficios` e `Contato` ficam pouco legiveis em alguns cards.
   - Screenshot: `desktop1366-p03-member-place.png`.

10. Full-page screenshots mostram a bottom nav fixa atravessando o conteudo em alguns pontos.
    - Pode ser artefato de captura full-page, mas vale checar no navegador real se existe padding inferior suficiente para nao cobrir cards/CTAs no fim da rolagem.

11. Persona `jogador puro` da seed nao esta completamente limpa.
    - A conta tem pelo menos uma aula/oportunidade no painel.
    - O estado realmente vazio de jogador puro sem aula, reserva, pagamento e evento nao foi validado com fidelidade.

## Regressões possíveis

- Prioridade de papel para usuarios multi-papel ainda precisa calibragem. Recepcao e gestor podem carregar blocos de competicao muito cedo quando tambem possuem papel em torneio/check-in.
- A estrategia de esconder sem permissao por redirect silencioso funciona, mas pode confundir em rotas legadas digitadas manualmente. Produto deve decidir se quer mensagem explicita de `sem acesso` ou manter redirect limpo.
- Public/legacy links estao tecnicamente preservados como deep links autenticados, mas ainda nao estao comprovados como rotas publicas sem login.
- O Work Hub do organizador ainda parece depender de `#/eventos?modo=organizing`, que pode virar uma superficie ambigua se `/eventos` continuar sendo descoberta do jogador.

## Interacoes testadas

Resultados principais de `interactions-*.json`:

- Competitivo liga:
  - `Voltar para competicoes` -> `#/eventos/ligas?view=participating`;
  - `Classificacao`, `Chat`, `Jogadores` preservam `?tab=`.
- Professor:
  - `Abrir aulas`, `Ver reposicoes`, `Abrir alunos` abrem `academia?visao=...`.
- Financeiro:
  - `Ver recebiveis`, `Abrir despesas`, `Abrir financeiro` abrem `financeiro?visao=...`.
- Caixa:
  - `Ver hoje` abre `cantina?visao=hoje`;
  - `Perfil` abre `#/perfil?mode=work`.
- Organizador:
  - `Resolver bloqueios` e `Abrir jogos` abrem `#/eventos?modo=organizing`;
  - item `Torneios` permaneceu em `#/gestao`.

## Screenshots recomendados para revisao

- `mobile390-p01-pure-home.png`
- `mobile390-p01-pure-work-denied.png`
- `mobile390-p04-competitive-league.png`
- `mobile390-p05-organizer-work.png`
- `mobile390-p07-frontdesk-work.png`
- `mobile390-p08-finance-work.png`
- `mobile390-p09-cashier-work.png`
- `desktop1366-p03-member-place.png`
- `desktop1366-p06-coach-academy.png`
- `desktop1366-p09-cashier-canteen.png`
- `desktop1366-p11-multiprole-tournament-cockpit.png`
- `desktop1366-p12-public-query-join-admin-link.png`

## Ajustes recomendados

Prioridade alta:

1. Preservar `?join=` e demais query params externos no redirect de auth.
2. Decidir se `/join`, `/t`, `/inscricao` e `/ligas` devem renderizar publicamente sem login ou apenas preservar `next`.
3. Corrigir bottom nav mobile do jogador para exatamente 5 destinos.
4. Corrigir active state duplicado no bottom nav da recepcao.
5. Separar hub de organizador de `#/eventos` se `#/eventos` continuar sendo superficie de descoberta do jogador.

Prioridade media:

1. Corrigir duplicacao de `Venda rapida` em Cantina/POS desktop.
2. Remover pills claras do Modo professor.
3. Remover controles claros da liga participante mobile.
4. Melhorar contraste dos cards inativos da pagina publica do local.
5. Validar padding inferior real em mobile para a bottom nav fixa.

Prioridade de dados/QA:

1. Criar uma conta de jogador realmente vazia.
2. Criar contas separadas para aluno puro, socio puro e jogador competitivo puro, evitando sobreposicao de seed.
3. Criar ligas em todas as fases para QA real: configuracao, inscricoes, rodada ativa, entre rodadas, encerramento e historico.
4. Criar torneios em todas as fases para QA real: rascunho, inscricoes abertas, inscricoes encerradas, sorteio, andamento e finalizado.

## Decisoes de produto pendentes

- Rotas de convite/inscricao devem ser acessiveis sem login com preview publico, ou login e obrigatorio antes de qualquer visualizacao?
- `organizer` independente deve abrir cockpit operacional completo ou apenas inscricoes/jogadores conforme permissao granular?
- Recepcao com papel de check-in em torneio deve ver competicoes no Trabalho Hoje, ou isso deve ficar atras de `Mais`/Competition OS?
- Redirect silencioso em rotas sem permissao e desejado, ou deve existir estado explicito de `Voce nao tem acesso a esta area`?

## Status final

FLOW-11 esta concluido como QA transversal.

Nao houve alteracao de UI/backend nesta rodada. O resultado e um pacote de evidencias e bugs recomendados para os proximos sprints.

## Sprint de correcoes pos-FLOW-11 - 2026-05-20

Objetivo: executar em sprint os problemas acionaveis encontrados no QA transversal, sem alterar backend, sem relaxar permissoes e sem mudar a arquitetura visual aprovada.

Arquivos alterados:

- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/EventsHubPage.tsx`
- `src/pages/PlacesPage.tsx`
- `src/App.css`
- `docs/APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- `docs/EXECUTION_QUEUE.md`

Correcoes implementadas:

- redirect de auth agora preserva query params externos, incluindo `?join=...`, dentro do `next`;
- bottom nav mobile do Player App voltou a cinco destinos visiveis: `Inicio | Jogar | Competir | Agenda | Perfil`;
- bottom nav da recepcao deixou de marcar `Hoje` e `Mais` simultaneamente;
- hub do organizador em `#/eventos?modo=organizing` agora comunica claramente `Trabalho em competicoes`;
- Cantina/POS no workspace de trabalho deixou de duplicar `Venda rapida`;
- pills claras do modo professor foram escurecidas;
- liga participante no mobile recebeu reforco dark para cards, fila de rodada e chips de horario;
- pagina publica do local recebeu reforco de contraste nos cards de acao.

Validacao:

- build: `npm.cmd run build` passou;
- screenshots focados: `docs/screenshots/sprint-flow11-fixes-after-2026-05-20`;
- screenshots capturados: 19;
- diagnosticos capturados: 19;
- console/rede: 0 erros e 0 warnings nos diagnosticos focados.

Rotas/personas rechecadas:

- jogador puro: `#/inicio`;
- recepcao: `#/gestao`;
- professor: `#/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/academy`;
- caixa: `#/gestao/9a1d1935-d86e-4a3a-8f6b-0f7a263890ae/canteen`;
- organizador: `#/gestao` e `#/eventos?modo=organizing`;
- liga participante: `#/eventos/ligas/c3c638c5-0c85-4834-a639-bf26d2e4b5b3`;
- local publico: `#/locais/36b29d6c-fabb-475a-a059-47d5ece74a09`;
- link legado/admin com query externa: `?join=...#/eventos/eee62a99-6929-49c6-b4b9-533e82a6c9da/organizacao`.

Falhas rebaixadas para decisao de produto:

- definir se rotas `/join`, `/t`, `/inscricao` e `/ligas` devem ter preview publico sem login ou apenas preservar deep link autenticado;
- definir o alcance operacional completo do papel `organizer` independente;
- criar massa de dados para jogador realmente vazio, ligas em todas as fases e torneios em todas as fases.
