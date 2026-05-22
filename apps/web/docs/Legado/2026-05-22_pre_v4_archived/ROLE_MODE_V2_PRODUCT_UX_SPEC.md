# Role Mode v2 Product UX Spec

Data: 2026-05-18

Fontes: `manual_frontend_design_produto_apps_modernos.md`, `COMPONENT_GRAMMAR.md`, `SCREEN_RESPONSIBILITIES.md`, `ROLE_VISIBILITY_MATRIX.md`, `PROFILE_PLAN_ACCESS_MODEL.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `UX_FRONTEND_AUDIT.md`, codigo atual em `web/src/lib/user-mode.tsx`, `web/src/components/AppShell.tsx`, `web/src/components/BottomNav.tsx`, `web/src/pages/HomePage.tsx`, `web/src/pages/ManagementHubPage.tsx` e `web/src/lib/place-management.ts`.

## 1. Decisao de produto

`Jogador` e `Trabalho` nao sao duas abas do mesmo dashboard. Sao duas experiencias completas dentro da mesma conta.

O usuario pode ser a mesma pessoa, mas a intencao muda:

- como jogador, ele quer jogar, reservar, acompanhar jogos, aulas, resultados, rankings e convites pessoais;
- como gestor/professor/recepcao/financeiro/organizador, ele quer operar uma rotina de trabalho com fila, permissoes, workspaces e tarefas acionaveis.

Regra central:

```text
Modo Jogador nunca deve carregar nem protagonizar operacao profissional.
Modo Trabalho nunca deve parecer descoberta ou player app ampliado.
```

## 2. Estado atual

O app ja possui a primeira camada de separacao:

- `UserModeProvider` persiste `player` ou `work` em `localStorage` por usuario;
- `AppShell` mostra seletor `Jogador/Trabalho` apenas para quem tem acesso profissional;
- `BottomNav` muda itens conforme modo;
- `/gestao` ja respeita papel e plano via `placeManagementModules(...)`;
- rotas diretas continuam funcionando.

Implementado nesta rodada:

- a Home do jogador deixou de exibir listas operacionais de trabalho e usa apenas aviso compacto quando ha sinal profissional;
- `/gestao` funciona como Central de Trabalho para locais, professores, financeiro/caixa e competicoes organizadas;
- convites profissionais foram movidos para a Central de Trabalho, com aceitar/recusar no contexto correto;
- `AppShell` sincroniza `player/work` pela intencao da rota;
- `Competir` foi reduzido a experiencia de jogador (`Jogando`/`Descobrir`) e a organizacao passa por `Trabalho`.
- `ManagementShell` exibe retorno compacto `Ir para jogador`, porque telas de trabalho escondem o header global e nao devem prender o usuario no contexto profissional.
- A validacao por papel cobriu jogador puro, administrador/gestor, professor, recepcao, financeiro, caixa/POS e organizador sem local em desktop e mobile.

Ainda falta validar visualmente e endurecer casos de borda:

- estado amigavel detalhado para rotas profissionais sem permissao;
- revisar surfaces especificas de ligas/torneios para garantir que todo link administrativo carregue `work`;
- registrar evidencias de persistencia do modo apos reload/login em sessoes reais longas.

Evidencias principais: `docs/screenshots/role-mode-v2-2026-05-18/`.

## 3. Principios do manual aplicados

1. Uma tela deve ter uma intencao dominante.
2. Interface nao deve expor complexidade interna.
3. Organizar por tarefa real, nao por tabela ou modulo tecnico.
4. Basico primeiro, avancado depois.
5. Mobile nao e desktop empilhado.
6. Feedback e estado precisam estar visiveis no contexto da acao.
7. Usuario nao deve ver ferramenta sem permissao, papel ou plano.
8. Cards sao para itens ou blocos de decisao; rotina operacional deve preferir rows.
9. Configuracao nao deve competir com rotina diaria.
10. Acoes importantes nao devem depender de o usuario lembrar onde estava.

## 4. Modelo de experiencia

### Conta

Identidade unica:

- login;
- perfil;
- foto;
- telefone;
- preferencias;
- historico pessoal;
- privacidade.

### Modo

Experiencia ativa:

- `player`: app de jogador;
- `work`: app de trabalho.

### Workspace

Somente no modo `work`.

Pode ser:

- local/academia/clube;
- competicao organizada;
- liga organizada;
- operacao de professor;
- financeiro;
- caixa/POS;
- equipe.

### Subworkspace

Dentro de um workspace:

- Agenda;
- Academia;
- Clientes;
- Financeiro;
- Cantina;
- Equipe;
- Ajustes;
- Inscricoes;
- Jogos;
- Resultados;
- Publicacao.

## 5. Comportamento do seletor de modo

### Quem ve seletor

| Perfil | Ve seletor? | Modo inicial |
|---|---:|---|
| Jogador puro | Nao | Jogador |
| Aluno/socio sem papel operacional | Nao | Jogador |
| Professor vinculado | Sim | ultimo modo salvo ou Trabalho se o ultimo contexto foi gestao |
| Recepcao | Sim | ultimo modo salvo |
| Financeiro | Sim | ultimo modo salvo |
| Caixa/POS | Sim | ultimo modo salvo |
| Organizador | Sim | ultimo modo salvo |
| Gestor de local | Sim | ultimo modo salvo |
| Admin plataforma | Sim | ultimo modo salvo |

### Persistencia

Primeira etapa:

- manter `localStorage` por usuario como ja existe;
- chave atual por usuario deve continuar sendo valida.

Evolucao recomendada:

- adicionar preferencia server-side futura (`profiles.last_experience_mode` ou tabela de preferencias);
- usar servidor como verdade quando disponivel;
- manter `localStorage` como cache instantaneo.

### Troca manual

Ao trocar para `Jogador`:

- salvar modo `player`;
- navegar para `/inicio` se a rota atual for profissional;
- manter rotas publicas/player sem alteracao.

Ao trocar para `Trabalho`:

- salvar modo `work`;
- navegar para melhor entrada profissional permitida;
- se houver local e competicao, abrir seletor/central de workspaces, nao escolher silenciosamente um contexto que pode estar errado.

### Melhor entrada profissional

Ordem recomendada:

1. Se ha apenas um workspace profissional: abrir direto nele.
2. Se ha multiplos workspaces: abrir `/trabalho` ou `/gestao` como central de escolha operacional.
3. Se ha apenas competicoes organizadas: abrir central de organizacao.
4. Se ha apenas professor: abrir `Minha operacao de aulas`.
5. Se ha apenas financeiro: abrir Financeiro.
6. Se nao ha acesso real: mostrar estado vazio profissional, sem contaminar o Player App.

## 6. Regras de rota

Rotas devem declarar superficie:

- Player: `/inicio`, `/locais`, `/ranking`, `/perfil`, paginas publicas;
- Work/Management: `/gestao`, `/gestao/:placeId/:module`;
- Work/Competition: organizacao de torneios/ligas;
- Competition publica/player: detalhe publico, inscricao, meus jogos.

Regra:

```text
A rota pode mudar o modo ativo quando a intencao e inequivoca, mas nao deve misturar menus.
```

Exemplos:

- abrir `/gestao` em link direto ativa `work`;
- abrir `/inicio` ativa `player`;
- abrir detalhe publico de torneio nao ativa `work`;
- abrir rota de organizacao ativa `work`;
- se a pessoa nao tem permissao, mostrar erro amigavel e acao para voltar.

## 7. Home do Jogador

Responsabilidade:

- orientar o jogador pela proxima acao pessoal.

Deve conter:

1. saudacao compacta;
2. proxima acao contextual;
3. pendencias pessoais urgentes;
4. proximos compromissos;
5. atalhos de jogador;
6. descoberta controlada;
7. perfil/ranking como suporte.

Nao deve conter:

- fila de gestao;
- tarefas de equipe;
- financeiro administrativo;
- setup de academia;
- convites de staff como bloco grande;
- lista de workspaces profissionais.

Para usuario multi-papel:

- acesso a `Trabalho` deve existir no shell/menu;
- Home do jogador pode ter, no maximo, um aviso discreto quando houver pendencia critica de trabalho;
- nenhuma lista operacional de trabalho deve morar na Home do jogador.

## 8. Home do Trabalho

Responsabilidade:

- levar o operador ao proximo trabalho real.

Estrutura:

1. contexto atual: `Trabalho`;
2. workspace ativo ou seletor de workspace;
3. fila do dia;
4. rotinas por papel;
5. atalhos de modulos permitidos;
6. suporte/indicadores;
7. configuracao apenas quando necessario.

Nao deve conter:

- eventos publicos para descobrir;
- rankings de jogador;
- cards de player;
- ofertas ao usuario comum;
- blocos de marketing.

## 9. Workspaces por papel

### Gestor/dono

Intencao:

- manter a operacao do local sob controle.

Primeira dobra:

- fila do dia;
- pendencias por modulo;
- atalhos: Agenda, Academia, Clientes, Financeiro, Cantina, Equipe, Ajustes.

### Recepcao

Intencao:

- atender rapidamente.

Primeira dobra:

- reservas pendentes;
- agenda de hoje;
- lista de espera;
- aulas do dia;
- cadastro rapido.

Nao mostrar:

- ajustes profundos;
- equipe;
- relatorio financeiro completo;
- cantina se nao opera.

### Professor

Intencao:

- dar aula e acompanhar alunos.

Primeira dobra:

- minhas aulas hoje;
- minhas turmas;
- meus alunos;
- chamada;
- evolucao;
- reposicoes ligadas ao professor.

Nao mostrar:

- CRM;
- cantina;
- financeiro geral;
- turmas de outros professores;
- configuracao estrutural.

### Financeiro

Intencao:

- cobrar e fechar recebiveis/despesas.

Primeira dobra:

- vencidos;
- vencem hoje;
- marcar pago;
- lembretes;
- despesas.

Nao mostrar:

- agenda operacional;
- aulas;
- cantina;
- equipe;
- configuracao de local.

### Caixa/POS

Intencao:

- vender e repor estoque.

Primeira dobra:

- venda rapida;
- produtos baixos;
- vendas recentes;
- produtos.

Nao mostrar:

- financeiro completo;
- equipe;
- configuracao estrutural.

### Organizador

Intencao:

- operar torneios e ligas.

Primeira dobra:

- competicoes organizadas;
- inscricoes pendentes;
- jogos sem horario;
- resultados pendentes;
- publicacao/comunicados;
- equipe do evento.

Nao mostrar:

- agenda de academia sem vinculo;
- CRM de local;
- cantina;
- financeiro de clube.

## 10. Navegacao

### Desktop

Player:

- Inicio;
- Competir;
- Locais;
- Ranking;
- Perfil.

Trabalho:

- Inicio do trabalho;
- Workspaces;
- Agenda/Aulas/Financeiro/etc conforme papel;
- Organizar, se aplicavel;
- Perfil/Conta.

### Mobile

Player bottom nav:

- Inicio;
- Competir;
- Locais;
- Ranking;
- Perfil.

Trabalho bottom nav:

- Hoje;
- Workspaces;
- Modulo principal do papel;
- Alertas;
- Mais.

Regra:

- nao manter `Trabalho` como um sexto item permanente no player se o modo ja esta em `work`;
- no mobile, a troca de modo deve ficar no avatar/header ou sheet de conta, nao roubar espaco da rotina.

## 11. Notificacoes

Separar por modo:

### Jogador

- confirmar presenca;
- resultado proprio;
- reserva propria;
- aula propria;
- convite pessoal;
- inscricao aprovada/rejeitada.

### Trabalho

- reserva pendente para aprovar;
- inscricao pendente;
- resultado em conflito;
- pagamento pendente de aluno/socio;
- convite de equipe;
- estoque baixo;
- setup bloqueante.

Regra:

- o sino pode mostrar badge total;
- o painel aberto no modo atual deve priorizar notificacoes daquele modo;
- notificacao de outro modo pode aparecer como agrupamento discreto: `3 pendencias de trabalho`;
- clicar em notificacao profissional troca para `work` com contexto claro.

## 12. Dados e performance

Player App nao deve buscar por padrao:

- CRM;
- todos os alunos;
- recebiveis de terceiros;
- estoque;
- equipe;
- configuracao;
- pagamentos administrativos.

Work App nao deve buscar descoberta publica antes da fila operacional.

Regra:

```text
Buscar apenas dados necessarios para a primeira dobra do modo ativo.
```

## 13. Componentes necessarios

### ModeSwitch

- web: controle compacto no shell;
- mobile: dentro do menu de conta/sheet;
- deve mostrar modo atual e permitir troca explicita;
- nao deve parecer filtro da pagina.

### WorkspaceSwitcher

- usado apenas no modo `work`;
- lista locais, competicoes e operacoes disponiveis;
- mostra papel e pendencias resumidas;
- abre workspace sem misturar player.

### WorkHome

- substitui blocos profissionais dentro da Home do jogador;
- pode reusar `ManagementHubPage`, mas com contrato de tela de trabalho.

### RouteModeGuard

- declara superficie da rota;
- sincroniza modo quando a rota e inequivoca;
- mostra estado amigavel sem permissao.

### ModeAwareNotificationPanel

- separa notificacoes pessoais e profissionais;
- badge e lista por modo.

## 14. Riscos

| Risco | Impacto | Mitigacao |
|---|---|---|
| Troca de modo virar friccao | Usuario fica preso em escolha constante | persistir ultimo modo e trocar so quando necessario |
| Player perder acesso a acao profissional | Gestor nao acha trabalho | manter switcher claro no shell/perfil |
| Rotas duplicadas quebrarem links | links antigos falham | preservar rotas e adicionar guard/interstitial |
| Organizacao continuar misturada em Eventos | confusao mental | separar `Competir` de `Organizar` no modo work |
| Mobile ficar com nav demais | perda de fluidez | bottom nav por modo e switch no sheet de conta |
| Permissao vazar dado | risco operacional | `workspace-access`, `placeResourceAccess` e RLS continuam fonte de verdade |

## 15. Criterios de aceite

- jogador puro nunca ve gestao como caminho primario;
- usuario multi-papel alterna modo e o modo fica salvo apos reload/login;
- Home do jogador nao renderiza fila/lista operacional de trabalho;
- Home do trabalho nao renderiza descoberta publica de jogador;
- rotas diretas ativam modo correto ou mostram interstitial/erro amigavel;
- notificacoes mostram contexto pessoal/profissional sem misturar filas;
- cada papel de gestao recebe primeira dobra propria;
- desktop 1366px e mobile 390px validados;
- lint/build passam em cada sprint de implementacao.
