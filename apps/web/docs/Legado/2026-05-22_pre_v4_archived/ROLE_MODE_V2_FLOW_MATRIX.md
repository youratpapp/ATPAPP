# Role Mode v2 Flow Matrix

Data: 2026-05-18

Fonte: `ROLE_MODE_V2_PRODUCT_UX_SPEC.md`, `ROLE_VISIBILITY_MATRIX.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`.

## 1. Matriz de entrada

| Perfil | Primeiro destino | Modo visivel | Workspace inicial | O que nao deve ver |
|---|---|---|---|---|
| Jogador puro | `/inicio` | Jogador apenas | nenhum | Gestao, Organizar, financeiro/admin, equipe |
| Aluno/socio | `/inicio` | Jogador apenas | nenhum | CRM, cantina, equipe, financeiro de terceiros |
| Professor vinculado | ultimo modo salvo | Jogador/Trabalho | Minha operacao de aulas | CRM, cantina, financeiro geral, setup estrutural |
| Recepcao | ultimo modo salvo | Jogador/Trabalho | Atendimento do local | equipe, ajustes profundos, relatorio financeiro completo |
| Financeiro | ultimo modo salvo | Jogador/Trabalho | Financeiro do local | agenda/aulas/cantina/equipe sem permissao |
| Caixa/POS | ultimo modo salvo | Jogador/Trabalho | Cantina/POS | financeiro completo, agenda, equipe |
| Organizador | ultimo modo salvo | Jogador/Trabalho | Competições organizadas | gestao de local sem vinculo |
| Gestor de local | ultimo modo salvo | Jogador/Trabalho | Central operacional do local | nada fora do plano/papel |
| Admin plataforma | ultimo modo salvo | Jogador/Trabalho | Central operacional/admin | dados sem contexto explicito |

## 2. Fluxo de selecao de modo

### Login

1. Carregar usuario e perfil.
2. Resolver acesso profissional.
3. Se nao ha acesso profissional, forcar `player`.
4. Se ha acesso profissional:
   - ler ultimo modo salvo;
   - se valido, aplicar;
   - se ausente, abrir player por padrao apenas se nao houver link direto profissional;
   - se link direto profissional, aplicar `work`.

### Troca para Jogador

1. Usuario aciona `Jogador`.
2. Salvar `player`.
3. Se rota atual e profissional, navegar para `/inicio`.
4. Recarregar Home e nav de jogador.
5. Manter dados profissionais fora da primeira dobra.

### Troca para Trabalho

1. Usuario aciona `Trabalho`.
2. Salvar `work`.
3. Se existe um unico workspace, abrir destino direto.
4. Se existem varios, abrir central de trabalho.
5. Mostrar fila por papel.
6. Ocultar descoberta/player da primeira dobra.

## 3. Rotas e modo esperado

| Rota | Modo esperado | Observacao |
|---|---|---|
| `/inicio` | Jogador | sempre experiencia de jogador |
| `/locais` | Jogador | descoberta/reserva/aulas publicas |
| `/locais/:placeId` | Jogador | pagina publica/conversao |
| `/locais/:placeId/admin` | Trabalho | rota legada deve normalizar para gestao |
| `/gestao` | Trabalho | central operacional/workspace selector |
| `/gestao/:placeId/:module` | Trabalho | workspace de local |
| `/eventos` | Jogador | hub de competir/descobrir |
| `/eventos/torneios?view=organizing` | Trabalho | deve virar entrada de organizacao ou rota work |
| `/eventos/:tournamentId` publico | Jogador | detalhe publico, inscricao e acompanhamento |
| `/eventos/:tournamentId/organizacao` | Trabalho | operacao do torneio |
| `/eventos/ligas/:leagueId` publico | Jogador | acompanhamento de liga |
| rota de admin da liga | Trabalho | operacao de liga |
| `/ranking` | Jogador | leitura competitiva |
| `/perfil` | Jogador | identidade pessoal; entrada de modo pode morar em conta |

## 4. Fluxos de trabalho por papel

### Gestor de local

Situacao real:

O gestor abriu o sistema pela manha e quer saber o que precisa resolver.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Ver fila do dia.
3. Abrir pendencia mais critica.
4. Resolver em drawer/tela do modulo.
5. Voltar para fila sem perder contexto.

Primeira dobra:

- reservas pendentes;
- aulas/encaixes;
- cobrancas;
- clientes/CRM;
- estoque, se existir;
- setup apenas se bloqueante.

### Recepcao

Situacao real:

Jogador ligou pedindo horario; outro pediu cancelamento; ha reserva pendente.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Abrir Agenda/Atendimento.
3. Confirmar/cancelar reserva.
4. Criar reserva rapida.
5. Promover espera se necessario.

Primeira dobra:

- agenda de hoje;
- pendentes;
- lista de espera;
- criar reserva.

### Professor

Situacao real:

Professor chega para dar aula e quer ver suas turmas e alunos.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Abrir `Minhas aulas`.
3. Fazer chamada.
4. Ver alunos.
5. Registrar evolucao/reposicao.

Primeira dobra:

- aulas de hoje;
- chamada;
- minhas turmas;
- meus alunos.

### Financeiro

Situacao real:

Operador financeiro precisa cobrar atrasados e marcar pagamentos.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Abrir Financeiro.
3. Ver vencidos/vence hoje.
4. Enviar lembrete ou marcar pago.
5. Registrar despesa.

Primeira dobra:

- vencidos;
- vence hoje;
- origem da cobranca;
- CTA `Marcar pago`.

### Caixa/POS

Situacao real:

Atendente da cantina vende agua/bola/grip e controla estoque.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Abrir Cantina/POS.
3. Registrar venda.
4. Ver estoque baixo.
5. Atualizar produto se necessario.

Primeira dobra:

- venda rapida;
- produtos mais vendidos;
- estoque baixo.

### Organizador

Situacao real:

Organizador quer aprovar inscricoes, gerar jogos e resolver resultados.

Fluxo esperado:

1. Entrar em `Trabalho`.
2. Abrir `Organizar competicoes`.
3. Ver fila por evento/liga.
4. Resolver inscricoes, horarios, resultados ou publicacao.
5. Voltar para a lista operacional.

Primeira dobra:

- eventos em andamento;
- inscricoes pendentes;
- jogos sem horario;
- resultados pendentes;
- comunicados/publicacao.

## 5. Contratos de UI

### Player App

Usar:

- seções leves;
- carrossel quando for descoberta;
- CTA contextual;
- listas curtas pessoais;
- empty states compactos.

Nao usar:

- fila operacional de trabalho;
- KPIs administrativos;
- cards de setup;
- modulos sem uso para jogador.

### Work App

Usar:

- rows acionaveis;
- fila antes de KPI;
- subnav por modulo;
- drawer/sheet para detalhe;
- configuracao separada;
- indicadores de suporte depois da rotina.

Nao usar:

- hero publico;
- carrossel de descoberta;
- landing copy;
- cards grandes para cada pendencia;
- rotina diaria em wizard.

## 6. Validacao manual obrigatoria

Executar em desktop 1366px e mobile 390px:

1. jogador puro nao ve seletor;
2. multi-papel alterna e persiste modo;
3. reload mantem modo;
4. link direto `/gestao` entra como trabalho;
5. link direto `/inicio` volta para jogador;
6. professor ve apenas aulas/turmas/alunos;
7. financeiro ve apenas financeiro;
8. organizador sem local nao ve gestao de academia;
9. Home jogador nao mostra fila de trabalho;
10. Home trabalho nao mostra descoberta publica.

