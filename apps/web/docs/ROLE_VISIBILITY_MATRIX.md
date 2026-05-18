# Role Visibility Matrix

Data: 2026-05-15

Status: entregue em `ROLE-UX-00`.

Fonte: `EXECUTION_QUEUE.md`, `PROFILE_PLAN_ACCESS_MODEL.md`, `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`, `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, codigo em `web/src/lib/workspace-access.ts`, `web/src/lib/role-visibility.ts`, `web/src/lib/place-management.ts`, `web/src/lib/tournaments.ts`.

## Politica

Este documento governa quem ve menus, dados e superficies. MDs antigos continuam sendo inventario de funcoes, mas nao podem reintroduzir dashboards, modulos ou fluxos para perfis que nao usam aquilo.

Preservar funcao significa reposicionar no papel correto.

## Conceitos

### Superficies

| Superficie | Uso | Dados permitidos |
|---|---|---|
| Player App | Jogar, reservar, competir, acompanhar compromissos proprios | dados proprios, publicos e convites pendentes do usuario |
| Competition OS | Organizar torneios/ligas e operar competicoes | dados da competicao quando usuario e owner/staff aceito |
| Management OS | Operar local, academia, agenda, financeiro, CRM, cantina e equipe | dados do local conforme plano e papel |

### Relacoes

| Relacao | Como nasce | Observacao |
|---|---|---|
| Jogador puro | usuario autenticado sem vinculo operacional | nao ve gestao |
| Aluno | matricula/contrato de academia vinculado ao usuario | ve aulas, reposicoes e pagamentos proprios |
| Socio | membership ativa/pedente vinculada ao usuario | ve reservas, plano e pagamentos proprios |
| Professor | `place_staff.role = coach` ou `place_coaches.user_id` | ve rotina propria |
| Recepcao | `place_staff.role = frontdesk` | ve agenda e rotinas de atendimento |
| Financeiro | `place_staff.role = finance`, `manager` ou owner | papel dedicado criado em `ROLE-FINANCE-01` |
| Organizador | owner ou staff aceito de torneio/liga | convite pendente nao concede acesso |
| Gestor | owner/manager de local | ve o que o plano permite |

## Navegacao Global

### Politica ROLE-MODE-V2

`Jogador` e `Trabalho` passam a ser experiencias persistidas, nao apenas grupos de menu.

Regras:

- jogador puro nunca ve seletor de modo;
- usuario com acesso profissional ve troca explicita `Jogador/Trabalho`;
- a escolha deve persistir por usuario ate troca manual;
- modo `Jogador` nao deve carregar nem protagonizar filas operacionais, CRM, equipe, estoque ou recebiveis de terceiros;
- modo `Trabalho` nao deve abrir como descoberta publica nem competir com ranking/locais do jogador;
- rotas profissionais diretas podem ativar `Trabalho`, preservando permissao;
- rotas de jogador diretas podem ativar `Jogador`;
- notificacoes devem ser classificadas por modo e priorizadas no painel do modo ativo.

Fonte executavel: `ROLE_MODE_V2_PRODUCT_UX_SPEC.md` e `ROLE_MODE_V2_FLOW_MATRIX.md`.

| Relacao | Inicio | Locais/Jogar | Competir | Ranking | Perfil | Organizar | Gestao |
|---|---|---|---|---|---|---|---|
| Jogador puro | sim | sim | sim | sim | sim | nao | nao |
| Aluno | sim | sim | sim | sim | sim | nao | nao |
| Socio | sim | sim | sim | sim | sim | nao | nao |
| Professor sem gestao completa | sim | sim opcional | sim opcional | sim | sim | nao | sim, modo professor |
| Recepcao | sim | sim opcional | opcional | opcional | sim | nao | sim, limitado |
| Financeiro | sim | opcional | opcional | opcional | sim | nao | sim, financeiro |
| Organizador sem local | sim | sim | sim | sim | sim | sim | nao |
| Gestor de local | sim | sim | sim | sim | sim | sim se organiza | sim completo |
| Admin/plataforma | sim | sim | sim | sim | sim | sim | sim |

Implementacao atual:

- `web/src/lib/workspace-access.ts` calcula acesso resumido por usuario.
- `web/src/lib/role-visibility.ts` centraliza visibilidade da navegacao global e classifica a superficie da rota.
- `AppShell.tsx` aplica classes por superficie: `app-shell--player`, `app-shell--competition` e `app-shell--management`.
- `BottomNav.tsx` consome `getGlobalNavigationVisibility(...)` e usa entrada profissional contextual:
  - no modo Player, mostra `Trabalho` quando o usuario tem acesso profissional;
  - no modo Competition, mostra `Organizar` quando o usuario pode operar competicoes;
  - no modo Management, mostra `Gestao` quando o usuario pode operar locais.

## Dados Por Superficie

### Player App Pode Buscar

- perfil proprio;
- notificacoes/convites proprios;
- reservas proprias;
- aulas/matriculas proprias;
- pagamentos proprios;
- torneios/ligas publicos;
- inscricoes proprias;
- partidas proprias;
- ranking publico;
- locais publicos;
- chamadas/jogos publicos.

### Player App Nao Deve Buscar Por Padrao

- todos os alunos de um local;
- todos os recebiveis;
- CRM;
- estoque/cantina;
- equipe;
- configuracoes internas;
- comissao de professor;
- pagamentos de terceiros.

### Competition OS Pode Buscar

- torneios/ligas do usuario como owner;
- torneios/ligas onde usuario e staff aceito;
- inscricoes e jogadores da competicao quando permissao permitir;
- partidas, resultados e publicacao da competicao;
- convites pendentes proprios.

### Competition OS Nao Deve Buscar

- operacao de academia/clube sem vinculo de local;
- financeiro geral de local;
- CRM de academia;
- cantina;
- equipe de local.

### Management OS Pode Buscar

- dados do local acessivel;
- apenas datasets dos modulos liberados por plano/papel;
- agenda se plano permitir reservas;
- academia se plano permitir academia;
- financeiro/cantina/CRM se plano e papel permitirem.

## Management OS: Plano X Papel

### Planos

| Plano | Agenda | Academia | Clientes/Socios | CRM | Financeiro | Cantina | Equipe/Ajustes |
|---|---|---|---|---|---|---|---|
| `club_basic` | sim | nao | nao | nao | nao | nao | owner/manager |
| `academy` | sim | sim | basico operacional | nao | nao completo | nao | owner/manager |
| `club_pro` | sim | sim | sim | sim | sim | sim | owner/manager |
| `multi_unit` | sim | sim | sim | sim | sim | sim | owner/manager |

### Papeis De Local

| Papel | Agenda | Academia | Clientes/CRM | Financeiro | Cantina | Equipe | Ajustes |
|---|---|---|---|---|---|---|---|
| owner | sim | sim | sim se plano | sim se plano | sim se plano | sim | sim |
| manager | sim | sim | sim se plano | sim se plano | sim se plano | sim | sim |
| frontdesk | sim | aulas operacionais | cadastro rapido quando existir | pagamentos simples quando fluxo permitir | nao por padrao | nao | nao |
| coach | nao como recepcao | minhas aulas/turmas/alunos | nao | comissao/mensalidades proprias se permitido | nao | nao | nao |
| finance | nao por padrao | nao por padrao | nao por padrao | sim, se plano permitir | nao por padrao | nao | nao |
| cashier | nao por padrao | nao por padrao | nao por padrao | nao por padrao | sim, se plano permitir | nao | nao |

Regra aplicada em 2026-05-15:

- `dashboard` de local e superficie de gestor; professor deve abrir direto em Academia e recepcao deve abrir direto nos modulos operacionais permitidos.
- Clientes/CRM so entra para gestor ou recepcao quando o plano permitir; professor nao herda CRM por causa do plano do local.
- Financeiro dedicado (`place_staff.role = finance`) acessa apenas o modulo Financeiro quando o plano permite. Cantina/POS continua fora do papel financeiro dedicado por padrao.
- Caixa/POS dedicado (`place_staff.role = cashier`) acessa apenas Cantina/POS quando o plano permite. O papel nao herda Financeiro, Equipe, Ajustes ou operacao de Agenda/Academia.
- Professor sem gestao completa ve apenas `Aulas`, `Turmas` e `Alunos` da Academia; `Pendencias`, `Professores` e `Configuracao` ficam reservados para gestor.
- O vinculo operacional de professor depende de `place_coaches.user_id`; se nao existir, a UI mostra estado vazio e nao tenta inferir turmas por nome.

Gap tecnico:

- `place_staff.role` aceita `manager`, `coach`, `frontdesk`, `finance` e `cashier`.
- Papel financeiro dedicado existe para recebiveis, despesas, lembretes e baixas financeiras sem promover o usuario a `manager`.
- Papel de caixa/Cantina/POS existe para venda rapida, vendas do dia, estoque e produtos sem promover o usuario a `manager` ou `finance`.

QA 2026-05-15:

- `QA-ROLE-01` confirmou que professor nao recebe Financeiro/Cantina/Equipe, mas ainda recebe tarefas de setup estrutural no hub de gestao.
- `MGMT-ROLE-QA-01` corrigiu o resumo da central para respeitar `placeResourceAccess(...)`.
- `coach` nao ve `Definir regras`, `Cadastrar cliente`, `Cadastrar professor`, `Configurar plano` ou mensagem de setup profundo.
- Recepcao opera fila, agenda, aulas e clientes basicos; `Definir regras` e `Cadastrar professor` continuam reservados a `owner`/`manager`.
- `ROLE-FINANCE-01` criou o papel `finance`, ajustou a central `/gestao` para entrada financeira isolada e preservou Cantina/POS fora desse papel por padrao.
- `ROLE-CASHIER-01` criou o papel `cashier`, ajustou a central `/gestao` para entrada isolada em Cantina/POS e liberou backend POS por `app_can_manage_place_canteen(...)`.

## Competition OS: Papel X Permissao

| Papel | Ver evento publico | Inscrever-se | Ver jogos proprios | Aprovar inscricoes | Gerar/editar jogos | Lançar resultado | Publicar/comunicar | Configurar |
|---|---|---|---|---|---|---|---|---|
| viewer | sim | se aberto | nao | nao | nao | nao | nao | nao |
| participant | sim | sim | sim | nao | nao | se permitido/proprio | nao | nao |
| owner | sim | sim | sim | sim | sim | sim | sim | sim |
| organizer | sim | nao como jogador por padrao | sim operacional | sim | sim | sim | sim | limitado |
| scorekeeper | sim | nao | sim operacional | nao | nao | sim | nao | nao |
| checkin | sim | nao | sim operacional | sim/check-in | nao | nao | nao | nao |
| media | sim | nao | sim publico | nao | nao | nao | comunicacao/midia | nao |

Regra:

- convite pendente aparece como acao no Player App, mas nao libera `Organizar` ate aceite.

## Estados Vazios Obrigatorios

| Contexto | Mensagem | Acao |
|---|---|---|
| Jogador sem acesso a gestao | Gestao nao disponivel para este perfil. | Voltar ao inicio / Explorar locais |
| Organizador sem evento | Voce ainda nao organiza competicoes. | Criar torneio ou liga |
| Organizador com convite pendente | Convite aguardando aceite. | Aceitar/recusar convite |
| Professor sem turma vinculada | Nenhuma aula vinculada ao seu login. | Pedir vinculo a academia |
| Recepcao sem reservas | Nenhuma reserva pendente agora. | Criar reserva |
| Financeiro sem permissao | Financeiro nao liberado para este perfil. | Solicitar acesso ao gestor |
| Modulo fora do plano | Este modulo nao esta ativo no plano deste local. | Ver ajustes/plano, se gestor |
| Local sem setup | Complete a base operacional. | Cadastrar quadra/professor/regra |

## Regras De Implementacao

1. Antes de mostrar menu, validar relacao/plano/permissao.
2. Antes de buscar dataset administrativo, validar superficie.
3. Player App nunca deve carregar CRM, equipe, estoque ou recebiveis de terceiros por padrao.
4. Management OS sempre deve usar `placeResourceAccess(...)` e `placeManagementModules(...)`.
5. Competition OS deve separar `owner/staff aceito` de `participant/viewer`.
6. Convite pendente e estado de convite, nao permissao.
7. Se uma relacao ainda nao existe no schema, documentar gap e nao simular permissao no frontend.

## Anchors De Codigo

| Tema | Arquivo | Estado |
|---|---|---|
| resumo global de acesso | `web/src/lib/workspace-access.ts` | existente |
| visibilidade global/nav | `web/src/lib/role-visibility.ts` | criado em ROLE-UX-00 |
| modulos de local | `web/src/lib/place-management.ts` | existente |
| dados de local por permissao | `web/src/lib/place-admin-data.ts` | existente |
| bottom nav | `web/src/components/BottomNav.tsx` | conectado ao helper |
| equipe de competicao | `web/src/lib/tournaments.ts` | existente |
| rotas | `web/src/App.tsx` | existente |

## Gaps Para Backlog

- Separar papel de cantina/POS de financeiro quando o produto exigir operador de caixa.
- Evoluir `workspace-access.ts` para retornar tipo de relacao, nao apenas contadores.
- Adicionar testes automatizados de visibilidade por papel quando houver harness de testes.

## Criterios De Aceite ROLE-UX-00

- jogador puro nao ve `Gestao`;
- professor nao recebe cantina/CRM/financeiro completo sem permissao;
- organizador sem local nao recebe `Gestao`;
- gestor recebe Management OS conforme plano/papel;
- cada item de navegacao tem justificativa por relacao;
- estados vazios estao definidos;
- helper central de navegacao global existe;
- docs estao prontos para `ROLE-UX-01`.

## Seeds De Referencia Para QA

- Jogador puro: `qa.jogador.puro@demo.atp.local`, sem staff, matricula, reserva, torneio, liga ou partida aberta.
- Aluno mensalista: `jogador001@demo.atp.local`, com contrato e matriculas ativas.
- Organizador puro: `organizador.circuito@demo.atp.local`, com `competition_organizer` e sem `place_staff`.
- Financeiro dedicado: `financeiro.prime@demo.atp.local`, com `place_staff.role = finance`.
- Professor sem local: `coach.solo@demo.atp.local`, sem `place_staff` e sem `place_coaches`.
