# Navigation And Workspace Restructure V4

Data: 2026-05-20

Status: mapeamento executivo de fluxo, navegacao e workspaces. Este documento nao autoriza implementacao visual automatica sem sprint propria.

Documento anterior relacionado:

- `APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `APP_WORKFLOW_EXECUTION_MATRIX_V3.md`
- `EXECUTION_QUEUE.md`

Fonte de decisao desta versao:

- o ATP deve continuar usando o visual premium dark ja aprovado;
- o problema atual nao e mais apenas design visual;
- o problema atual e arquitetura de navegacao, continuidade de fluxo e divisao de workspaces;
- menus nao podem ser uma arvore de modulos internos;
- cada persona precisa abrir o app e entender rapidamente o proximo passo real.

## Escopo

Este V4 cobre:

- rotas atuais e rotas que precisam ser preservadas;
- papeis e permissoes usados na navegacao;
- workspaces reais que existem hoje no codigo;
- proposta de divisao de menus por missao de uso;
- fluxos completos por persona;
- matriz de funcao para workspace alvo;
- criterios de divisao entre rotina diaria, historico, relatorio e configuracao;
- queue executavel para futuras sprints.

Fora de escopo nesta rodada:

- alterar backend;
- criar novo modelo de permissao;
- remover rota antiga;
- remover funcao existente;
- redesenhar UI do zero;
- mudar regras de negocio de reservas, aulas, torneios, ligas, financeiro ou cantina.

## Diagnostico Principal

O app ja evoluiu bastante visualmente, mas a navegacao ainda deixa a sensacao de bagunca porque mistura quatro coisas diferentes no mesmo nivel:

1. Missao do usuario: jogar, atender cliente, dar aula, vender, cobrar, organizar torneio.
2. Modulo interno: bookings, academy, finance, canteen, settings.
3. Configuracao rara: quadras, planos, regras, permissoes, recursos.
4. Historico/relatorio: pagos, resultados antigos, resumo, classificacoes finalizadas.

Quando essas camadas aparecem juntas, o usuario precisa descobrir onde clicar. O menu parece completo, mas nao parece obvio.

A correcao nao deve ser "adicionar mais abas". A correcao e mudar a logica:

```text
Modo -> Workspace de missao -> Tela de rotina -> Acao primaria -> Detalhe -> Sucesso/proximo passo
```

## Principio De Produto

Todo item de navegacao principal precisa responder uma destas perguntas:

- O que eu faco agora?
- O que preciso resolver hoje?
- Qual e meu proximo compromisso?
- Qual operacao esta pendente?
- Onde executo minha funcao diaria?

Itens que respondem "como configuro isso?" nao devem competir com a rotina.

Itens que respondem "o que aconteceu no passado?" nao devem competir com a operacao atual.

Itens que respondem "quem pode fazer isso?" pertencem a administracao/permissoes.

## Regra De Estrutura

### Nivel 1 - Modo

O app precisa ter apenas dois modos globais visiveis para o usuario:

| Modo | Para quem | O que contem |
| --- | --- | --- |
| Jogador | jogador, aluno, socio, competitivo | jogar, reservar, competir, agenda pessoal, perfil pessoal |
| Trabalho | professor, recepcao, financeiro, caixa, gestor, organizador | operacao profissional, local, competicoes, equipe, ajustes |

`Competition OS` nao precisa aparecer como terceiro botao global para o usuario. Ele e uma superficie contextual:

- no modo `Jogador`, `Competir` e descoberta/participacao;
- no modo `Trabalho`, `Competições` e operacao/organizacao.

### Nivel 2 - Workspace

Workspace e uma area onde uma pessoa cumpre uma missao operacional.

Workspaces alvo:

| Superficie | Workspace | Missao |
| --- | --- | --- |
| Player App | Inicio | mostrar proxima acao pessoal |
| Player App | Jogar | reservar quadra, encontrar jogo, descobrir locais/aulas |
| Player App | Competir | jogar torneios/ligas, ver partidas, ranking e resultados pessoais |
| Player App | Agenda | reunir reservas, partidas, aulas, pagamentos e historico pessoais |
| Player App | Perfil | identidade, preferencias, conta e acesso ao modo Trabalho quando existir |
| Management OS | Hoje | fila operacional consolidada por papel |
| Management OS | Atendimento | reservas, check-in, lista de espera e clientes de balcão |
| Management OS | Academia | aulas, turmas, chamada, alunos, professores e reposicoes |
| Management OS | Competições | torneios/ligas organizados, bloqueios por fase e publicacao |
| Management OS | Financeiro | recebiveis, cobrancas, pagos, despesas e resumo do local |
| Management OS | Loja | venda rapida, vendas do dia, estoque e produtos |
| Management OS | Administração | equipe, permissoes, ajustes, regras, recursos, planos e relatorios |

### Nivel 3 - Views Locais

Views locais ficam dentro de um workspace. Elas nao devem virar menu global se forem especificas demais.

Exemplo:

```text
Trabalho -> Atendimento -> Hoje / Nova reserva / Calendario / Lista de espera / Clientes
```

### Nivel 4 - Acao

Acao nao deve virar aba quando e um comando do fluxo.

Exemplo:

- `Nova reserva` pode ser CTA dominante da recepcao.
- `Fazer chamada` pode ser CTA dentro da aula.
- `Marcar pago` pode ser acao dentro de um recebivel.
- `Gerar jogos` pode ser CTA da fase do torneio.

## Inventario Real Do Codigo

### Rotas Principais Atuais

| Area | Rotas atuais | Observacao V4 |
| --- | --- | --- |
| Auth | `/auth`, `/auth/callback`, `/completar-cadastro`, `/` | preservar |
| Inicio jogador | `/inicio` | entrada do Player App |
| Perfil | `/perfil`, `/jogadores/:playerId` | perfil pessoal nao deve virar gestao |
| Jogar/locais | `/locais`, `/locais/:placeId`, `/locais/:placeId/:placeIntent` | pode ganhar alias futuro `/jogar`, mas nao remover `/locais` |
| Admin legado de local | `/locais/:placeId/admin`, `/locais/:placeId/admin/:module` | preservar como wrapper/alias |
| Agenda pessoal | `/agenda`, `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas`, `/meus-pagamentos` | `/agenda` deve ser hub; demais rotas viram filtros/aliases |
| Competicoes jogador | `/eventos`, `/eventos/torneios`, `/eventos/ligas`, `/competicoes` | `/competicoes` ja redireciona; preservar |
| Liga | `/eventos/ligas/:leagueId`, `/eventos/ligas/inscricao/:token`, `/ligas/:leagueId`, `/ligas/inscricao/:token` | preservar rotas legadas |
| Torneio publico | `/eventos/:tournamentId`, `/eventos/:tournamentId/jogos`, `/eventos/:tournamentId/classificacao`, `/eventos/:tournamentId/jogadores`, `/eventos/:tournamentId/chat` | preservar |
| Torneio admin | `/eventos/:tournamentId/organizacao` | deve ser Competition OS de trabalho |
| Inscricao/convite | `/inscricao/:tournamentId`, `/join/:tournamentId`, `/t/:tournamentId` | nunca quebrar |
| Trabalho | `/gestao`, `/gestao/:placeId`, `/gestao/:placeId/:module` | base do Management OS |

### Papeis De Trabalho Ja Modelados

| Papel de navegacao | Origem no codigo | Leitura de produto |
| --- | --- | --- |
| `manager` | owner/manager de local | gestor do local |
| `coach` | professor/coach | professor de academia ou autonomo vinculado |
| `frontdesk` | recepcao | secretaria/atendimento |
| `finance` | financeiro | cobranca e financeiro do local |
| `cashier` | caixa | venda/cantina |
| `organizer` | organizador sem local ou competicao gerenciada | operador de torneio/liga |
| `operator` | multiplos papeis operacionais | usuario multi-papel de trabalho |
| `none` | sem permissao de trabalho | nao deve ver Management OS como rotina |

### Modulos De Local Existentes

| Modulo atual | Label atual | Workspace V4 | Problema se aparecer cru |
| --- | --- | --- | --- |
| `dashboard` | Painel | Hoje | dashboard generico pode virar lista de numeros |
| `bookings` | Reservas | Atendimento | reserva e rotina de recepcao precisam virar fluxo |
| `academy` | Academia | Academia | professor nao pode cair em ERP |
| `clients` | Clientes | Atendimento/Clientes | cliente pode ser suporte da recepcao e CRM do gestor |
| `finance` | Financeiro | Financeiro | nao misturar com pagamentos pessoais |
| `canteen` | Cantina | Loja | venda rapida precisa vir antes de estoque/configuracao |
| `team` | Equipe | Administracao | nao e rotina diaria para professor/recepcao |
| `settings` | Ajustes | Administracao | setup raro fora da primeira dobra |

### Views Internas Existentes Por Modulo

| Modulo | Views atuais | Reclassificacao V4 |
| --- | --- | --- |
| Reservas | Hoje, Reservas, Calendario, Nova reserva, Espera, Quadras | Atendimento: rotina e atendimento; Quadras vai para Administracao quando for configuracao |
| Academia | Hoje, Grade, Alunos, Pendencias, Professores, Configuracao | Academia: rotina de aula; Configuracao vai para Administracao |
| Clientes | Rotina, Contatos, Socios, Pendencias, Resumo | Atendimento/Clientes: relacionamento e pendencias; Resumo pode ir para relatorio |
| Financeiro | Recebiveis, Pagos, Despesas, Planos, Resumo | Financeiro do local; Planos pode ser configuracao comercial se raro |
| Cantina | Venda rapida, Estoque baixo, Vendas do dia, Produtos | Loja: vender primeiro; Produtos/configuracao fica depois |
| Equipe | Resumo, Equipe, Convites, Papeis | Administracao/Equipe |
| Ajustes | Checklist, Dados publicos, Recursos, Regras, Planos, Permissoes, Publicacao | Administracao/Configuracao |

## Taxonomia Alvo De Navegacao

### Player App - Mobile

Menu alvo:

```text
Inicio | Jogar | Competir | Agenda | Perfil
```

Contrato:

- `Inicio`: proxima acao pessoal, CTA dominante, alertas pessoais.
- `Jogar`: reservar quadra, encontrar jogo, locais, aulas abertas.
- `Competir`: torneios, ligas, proxima partida competitiva, classificacao pessoal.
- `Agenda`: reservas, partidas, aulas, pagamentos pessoais e historico.
- `Perfil`: conta, preferencias, dados esportivos, acesso a Trabalho se autorizado.

O que nao entra no Player App:

- financeiro do local;
- equipe;
- ajustes do local;
- cantina;
- operacao de torneio;
- lista administrativa de clientes.

### Player App - Desktop

Sidebar alvo:

```text
Jogar
  Inicio
  Jogar
  Competir

Minha rotina
  Agenda
  Aulas
  Pagamentos

Conta
  Perfil
```

`Aulas` e `Pagamentos` podem existir como atalhos desktop porque ha espaco. No mobile, continuam dentro de `Agenda` para manter cinco itens.

### Management OS - Desktop

Sidebar alvo por grupos:

```text
Trabalho
  Hoje

Operacao
  Atendimento
  Academia
  Competições
  Financeiro
  Loja

Administracao
  Equipe
  Ajustes
  Relatorios

Conta
  Perfil
```

Regras:

- nao mostrar grupo vazio;
- nao mostrar workspace sem permissao;
- nao mostrar `Loja` sem cantina/caixa;
- nao mostrar `Financeiro` para professor comum;
- nao mostrar `Equipe`, `Ajustes` ou `Relatorios` para usuario sem permissao;
- `Atendimento` deve aparecer para frontdesk/manager e pode reunir reservas/clientes;
- `Academia` deve aparecer para coach/manager;
- `Competições` deve aparecer para organizer/manager autorizado.

### Management OS - Mobile Por Papel

#### Professor

```text
Hoje | Agenda | Turmas | Alunos | Perfil
```

Leitura:

- `Hoje`: aulas de hoje e proxima chamada.
- `Agenda`: calendario semanal de aulas.
- `Turmas`: grade/turmas.
- `Alunos`: alunos e reposicoes.
- `Perfil`: conta e troca de modo.

Nao mostrar: financeiro, cantina, equipe, ajustes.

#### Recepcao

```text
Hoje | Reservas | Clientes | Aulas | Mais
```

Leitura:

- `Hoje`: reservas, check-ins e lista de espera urgente.
- `Reservas`: calendario e criacao de reserva.
- `Clientes`: busca e atendimento rapido.
- `Aulas`: consulta operacional de aulas do dia.
- `Mais`: apenas funcoes secundarias permitidas.

`Nova reserva` deve ser CTA dentro de `Hoje`/`Reservas`, nao tab global.

#### Financeiro

```text
Receber | Pagos | Despesas | Resumo | Perfil
```

Leitura:

- `Receber`: vencidos e recebiveis de hoje.
- `Pagos`: conciliacao e historico.
- `Despesas`: lancamentos.
- `Resumo`: indicadores e fechamento.
- `Perfil`: conta.

Nao misturar com pagamentos pessoais do usuario.

#### Caixa

```text
Vender | Hoje | Estoque | Produtos | Perfil
```

Leitura:

- `Vender`: primeira camada, venda rapida.
- `Hoje`: vendas do dia.
- `Estoque`: estoque baixo.
- `Produtos`: cadastro se autorizado.
- `Perfil`: conta.

#### Organizador

```text
Hoje | Torneios | Ligas | Publicacao | Perfil
```

Leitura:

- `Hoje`: competicoes com bloqueios.
- `Torneios`: lista por fase.
- `Ligas`: rodadas e pendencias.
- `Publicacao`: comunicacao, links e avisos.
- `Perfil`: conta.

Nao cair em descoberta publica.

#### Gestor

```text
Hoje | Atendimento | Academia | Financeiro | Mais
```

Leitura:

- `Hoje`: pendencias criticas consolidadas.
- `Atendimento`: reservas/clientes.
- `Academia`: aulas/turmas/alunos.
- `Financeiro`: recebiveis e cobrancas.
- `Mais`: loja, competicoes, equipe, ajustes, relatorios, conforme permissao.

Gestor nao precisa ver uma lista infinita de modulos como primeira experiencia.

#### Usuario Multi-Papel

```text
Hoje | Atender | Aulas | Competir | Mais
```

Leitura:

- mostrar somente workspaces com pendencia real e permissao;
- manter seletor `Jogador / Trabalho` sempre claro;
- permitir troca de workspace sem perder contexto;
- nunca misturar tarefa pessoal e profissional no mesmo card sem label explicito.

## Fluxos Criticos Por Persona

### 1. Jogador Puro

Missao: jogar, reservar, competir ocasionalmente e acompanhar agenda pessoal.

Entrada ideal: `Jogador -> Inicio`.

Primeira dobra:

- proxima reserva/partida/aula, se houver;
- se nao houver compromisso, CTA `Reservar quadra` ou `Encontrar jogo`;
- destaque leve para competicoes proximas, sem transformar em painel administrativo.

Fluxo reservar quadra:

1. `Inicio` mostra CTA `Reservar quadra`.
2. Usuario abre `Jogar`.
3. Seleciona local ou cidade.
4. Seleciona quadra, dia e horario.
5. Confirma condicoes/preco.
6. Ve sucesso.
7. CTA final: `Ver na Agenda`, `Compartilhar` ou `Reservar outro horario`.

Fluxo encontrar jogo:

1. `Inicio` ou `Jogar` mostra CTA `Encontrar jogo`.
2. Usuario escolhe nivel, cidade, data.
3. Ve chamadas abertas.
4. Entra em uma chamada.
5. Ve confirmacao e proximo passo em `Agenda`.

Fluxo competicao:

1. `Competir` mostra torneios/ligas publicas e meus compromissos competitivos.
2. Usuario abre torneio/liga.
3. Ve regras, inscricao, jogos ou classificacao.
4. Se tiver partida, CTA `Ver partida` ou `Informar resultado`.
5. Depois da acao, volta para competicao ou agenda.

Nao deve ver:

- `Trabalho`;
- financeiro do local;
- equipe;
- ajustes;
- cockpit de torneio, salvo se tambem for staff autorizado e estiver no modo Trabalho.

### 2. Aluno / Pessoa Com Aulas

Missao: entender proxima aula, professor, turma, quadra, reposicoes e mensalidade pessoal.

Entrada ideal: `Jogador -> Inicio` com destaque de aula quando existir.

Primeira dobra:

- proxima aula com horario, professor, turma e local;
- status de reposicao se houver pendencia;
- status de mensalidade pessoal se vencida ou proxima do vencimento.

Fluxo aula de hoje:

1. Abre `Inicio`.
2. Ve card `Sua proxima aula`.
3. Abre detalhe.
4. Confere professor, turma, quadra, horario e observacoes.
5. Se faltar, CTA `Pedir reposicao` quando regra permitir.
6. Aula aparece em `Agenda -> Aulas`.

Fluxo mensalidade:

1. Aviso aparece em `Inicio` ou `Agenda`.
2. Usuario abre `Agenda -> Pagamentos`.
3. Ve mensalidade/pacote pessoal.
4. Paga ou acompanha status.

Nao deve acontecer:

- aula escondida apenas como `Entrar em aula` dentro de Jogar;
- pagamento pessoal misturado com financeiro do local.

### 3. Socio / Mensalista Que Reserva Quadra

Missao: usar beneficio do plano para reservar e acompanhar regras/pagamentos.

Entrada ideal: `Jogador -> Inicio`.

Primeira dobra:

- plano ativo quando relevante;
- proximas reservas;
- CTA `Reservar com meu plano`.

Fluxo:

1. Abre `Inicio`.
2. Ve plano ativo e regra resumida.
3. Clica `Reservar quadra`.
4. Sistema aplica beneficio/regra no fluxo de reserva.
5. Usuario confirma.
6. Sucesso envia para `Agenda -> Reservas`.

Nao deve acontecer:

- plano pessoal ser exibido dentro de `Financeiro` do local;
- regras do plano ficarem escondidas em ajuste administrativo.

### 4. Jogador Competitivo

Missao: acompanhar partida, adversario, horario, chat, regra, resultado e classificacao.

Entrada ideal: `Jogador -> Competir` ou destaque no `Inicio`.

Primeira dobra:

- proxima partida competitiva;
- adversario;
- horario/local;
- status de resultado pendente;
- CTA `Abrir partida`.

Fluxo partida:

1. `Inicio` mostra proxima partida.
2. Usuario abre detalhe.
3. Ve adversario, regra, local, horario e chat.
4. Confirma horario se necessario.
5. Lanca resultado quando permitido.
6. Volta para classificacao ou agenda.

Nao deve acontecer:

- entrar em torneio/liga e parecer que mudou para area administrativa;
- jogador ver ferramentas de owner/organizador sem permissao.

### 5. Organizador De Torneios/Ligas

Missao: operar competicoes por fase, sem cair em descoberta publica.

Entrada ideal: `Trabalho -> Competições` ou `Trabalho -> Hoje` quando ha bloqueios.

Primeira dobra:

- competicoes com bloqueio atual;
- fase;
- pendencia principal;
- CTA `Resolver bloqueio` ou `Abrir cockpit`.

Fluxo torneio:

1. Abre `Trabalho`.
2. Ve lista de competicoes com pendencias por fase.
3. Abre torneio.
4. Cockpit mostra fase atual.
5. CTA muda conforme fase.
6. Acao concluida leva para proxima fase ou lista de pendencias.

Fases:

| Fase | Primeira pergunta | CTA primario |
| --- | --- | --- |
| Rascunho | O que falta configurar? | Completar configuracao |
| Inscricoes abertas | Quem entrou e quem pagou? | Revisar inscritos / Publicar link |
| Inscricoes encerradas | Esta pronto para gerar jogos? | Gerar jogos |
| Jogos gerados | Ha conflito de agenda/tabela? | Publicar jogos |
| Em andamento | Que resultado esta pendente? | Lancar resultado |
| Finalizado | O que precisa publicar/fechar? | Publicar resultado final |

Nao deve acontecer:

- descoberta publica como foco do organizador;
- configuracao rara competir com operacao da rodada;
- staff autorizado perder acesso a acoes criticas.

### 6. Professor

Missao: ver aulas de hoje, abrir aula, fazer chamada, registrar falta/reposicao e consultar alunos.

Entrada ideal: `Trabalho -> Hoje`.

Primeira dobra:

- proxima aula;
- horario;
- quadra;
- turma;
- alunos;
- CTA `Fazer chamada`.

Fluxo chamada:

1. Professor abre `Trabalho`.
2. Ve `Hoje` com aulas do dia.
3. Abre aula.
4. Ve lista de alunos.
5. Marca presenca/falta.
6. Registra reposicao quando aplicavel.
7. Volta para proxima aula.

Nao deve ver:

- financeiro;
- cantina;
- equipe;
- ajustes estruturais;
- dashboard de gestor.

### 7. Recepcao / Secretaria

Missao: resolver atendimento rapido: reserva, check-in, lista de espera, cliente e aulas do dia.

Entrada ideal: `Trabalho -> Hoje` ou `Trabalho -> Atendimento`.

Primeira dobra:

- reservas de hoje;
- check-ins pendentes;
- lista de espera relevante;
- CTA `Nova reserva`.

Fluxo nova reserva:

1. Recepcao abre `Trabalho`.
2. Clica `Nova reserva`.
3. Busca cliente ou cria registro rapido.
4. Escolhe quadra/horario.
5. Confirma status/pagamento.
6. Sucesso mostra `Ver reserva`, `Criar outra`, `Enviar confirmacao`.

Fluxo lista de espera:

1. Entra em `Atendimento`.
2. Ve lista de espera no contexto de horarios/quadras.
3. Converte pessoa em reserva quando vaga surge.
4. Atualiza agenda do dia.

Nao deve acontecer:

- `Nova reserva` virar aba principal isolada sem contexto;
- lista de espera aparecer em todo lugar;
- ajustes de quadra/regras aparecerem como rotina.

### 8. Financeiro

Missao: cobrar, marcar pago, ver recebiveis, pagos, despesas e resumo do local.

Entrada ideal: `Trabalho -> Financeiro`.

Primeira dobra:

- vencidos;
- recebiveis de hoje;
- CTA `Cobrar` ou `Marcar pago`.

Fluxo cobranca:

1. Abre `Financeiro -> Receber`.
2. Ve vencidos e hoje.
3. Abre cobranca.
4. Envia cobranca ou marca pago.
5. Ve sucesso com recibo/status.
6. Volta para proximo recebivel.

Nao deve acontecer:

- misturar pagamentos pessoais do usuario;
- misturar venda de cantina no fluxo principal;
- professor/recepcao ver financeiro sem permissao.

### 9. Caixa / Cantina

Missao: vender rapido e controlar basico do dia.

Entrada ideal: `Trabalho -> Loja`.

Primeira dobra:

- venda rapida;
- produtos mais usados;
- carrinho;
- CTA `Finalizar venda`.

Fluxo venda:

1. Abre `Loja -> Vender`.
2. Seleciona produtos.
3. Escolhe forma de pagamento.
4. Finaliza venda.
5. Sucesso mostra recibo e `Nova venda`.

Fluxo estoque:

1. Abre `Estoque`.
2. Ve itens baixos.
3. Ajusta quantidade se autorizado.

Nao deve acontecer:

- estoque/produtos atrapalharem a venda;
- caixa ver financeiro amplo sem permissao.

### 10. Gestor

Missao: ver operacao do dia, decidir prioridades e abrir area certa para resolver.

Entrada ideal: `Trabalho -> Hoje`.

Primeira dobra:

- pendencias criticas por area;
- reservas;
- aulas;
- financeiro;
- clientes;
- estoque/equipe apenas se houver alerta real;
- CTA para maior bloqueio.

Fluxo:

1. Abre `Trabalho`.
2. Ve fila consolidada.
3. Clica maior pendencia.
4. Vai para workspace certo.
5. Resolve ou delega.
6. Volta para `Hoje`.

Nao deve acontecer:

- lista infinita de modulos;
- setup raro no topo;
- relatorio antigo competir com operacao atual.

### 11. Usuario Multi-Papel

Missao: alternar entre vida pessoal e trabalho sem misturar responsabilidades.

Entrada ideal:

- `Jogador` quando entra para uso pessoal;
- `Trabalho` quando entra a partir de convite/gestao/organizacao;
- seletor sempre visivel onde faz sentido.

Fluxo:

1. Usuario entende modo ativo pelo seletor.
2. Troca entre `Jogador` e `Trabalho`.
3. Cada modo mostra menus proprios.
4. Ao voltar, nao perde a area anterior.

Nao deve acontecer:

- financeiro do local aparecer como pagamento pessoal;
- competicao organizada aparecer como torneio que ele vai jogar;
- perfil pessoal virar lista de funcoes profissionais.

## Matriz Persona Para Menu E Primeira Dobra

| Persona | Modo | Menu mobile alvo | Desktop alvo | Primeira dobra | CTA primario | Nao deve ver |
| --- | --- | --- | --- | --- | --- | --- |
| Jogador puro | Jogador | Inicio, Jogar, Competir, Agenda, Perfil | Player sidebar | proxima acao pessoal | Reservar/Encontrar jogo | gestao/admin |
| Aluno | Jogador | Inicio, Jogar, Competir, Agenda, Perfil | Player + Aulas/Pagamentos | proxima aula | Ver aula/Pedir reposicao | financeiro do local |
| Socio | Jogador | Inicio, Jogar, Competir, Agenda, Perfil | Player + Pagamentos | plano e proxima reserva | Reservar com plano | ajustes do local |
| Competitivo | Jogador | Inicio, Jogar, Competir, Agenda, Perfil | Player + Competir | proxima partida | Abrir partida/Informar resultado | cockpit admin |
| Organizador | Trabalho | Hoje, Torneios, Ligas, Publicacao, Perfil | Trabalho/Competições | bloqueio de fase | Resolver bloqueio | descoberta publica como foco |
| Professor | Trabalho | Hoje, Agenda, Turmas, Alunos, Perfil | Academia | aulas de hoje | Fazer chamada | financeiro/cantina/equipe |
| Recepcao | Trabalho | Hoje, Reservas, Clientes, Aulas, Mais | Atendimento | reservas/check-ins | Nova reserva | ajustes estruturais |
| Financeiro | Trabalho | Receber, Pagos, Despesas, Resumo, Perfil | Financeiro | vencidos/hoje | Cobrar/Marcar pago | aulas/cantina pessoal |
| Caixa | Trabalho | Vender, Hoje, Estoque, Produtos, Perfil | Loja | venda rapida | Finalizar venda | financeiro amplo |
| Gestor | Trabalho | Hoje, Atendimento, Academia, Financeiro, Mais | todos permitidos | pendencias criticas | Abrir maior bloqueio | lista infinita sem prioridade |
| Multi-papel | ambos | muda por modo | muda por modo | modo ativo claro | continuar fluxo | mistura pessoal/profissional |

## Mapa De Funcoes Para Workspaces

| Funcao atual | Onde vive hoje | Workspace V4 | View local | Acao primaria | Preservacao |
| --- | --- | --- | --- | --- | --- |
| Reservar quadra pessoal | `/locais` | Jogar | reserva | Reservar | manter `/locais`; alias futuro `/jogar` |
| Encontrar jogo | `/locais`/home | Jogar | chamadas | Entrar em jogo | preservar |
| Ver locais | `/locais` | Jogar | locais | Abrir local | preservar |
| Aulas pessoais | `/minhas-aulas` | Agenda | aulas | Ver aula | alias/filtro de `/agenda` |
| Reservas pessoais | `/minhas-reservas` | Agenda | reservas | Abrir reserva | alias/filtro de `/agenda` |
| Partidas pessoais | `/minhas-partidas` | Agenda | partidas | Abrir partida | alias/filtro de `/agenda` |
| Pagamentos pessoais | `/meus-pagamentos` | Agenda | pagamentos | Pagar/ver status | alias/filtro de `/agenda` |
| Eventos publicos | `/eventos` | Competir | descobrir | Entrar/ver | preservar |
| Torneios jogador | `/eventos/torneios` | Competir | torneios | Inscrever/ver jogos | preservar |
| Ligas jogador | `/eventos/ligas` | Competir | ligas | Ver rodada | preservar |
| Trabalho Hoje | `/gestao` | Hoje | fila | Resolver pendencia | preservar |
| Reservas do local | `/gestao/:placeId/agenda` | Atendimento | reservas hoje | Nova reserva/check-in | manter `agenda`; alias futuro `reservas` |
| Calendario do local | bookings/calendar | Atendimento | calendario | Ver ocupacao | preservar |
| Lista de espera | bookings/waitlist | Atendimento | espera | Converter em reserva | preservar |
| Quadras/precos | bookings/resources | Administracao | recursos | Configurar | mover para camada admin, manter acesso |
| Aulas do dia | academy/today | Academia | hoje | Fazer chamada | preservar |
| Turmas/grade | academy/classes | Academia | turmas | Abrir turma | preservar |
| Alunos | academy/students | Academia | alunos | Abrir aluno | preservar |
| Reposicoes/pendencias | academy/requests | Academia | pendencias | Resolver | preservar |
| Professores | academy/coaches | Academia/Admin | professores | Abrir professor | preservar conforme permissao |
| Config aula | academy/resources | Administracao | academia config | Configurar | mover da rotina |
| Clientes rotina | clients/relationship | Atendimento | clientes | Atender | preservar |
| Contatos/leads | clients/leads | Atendimento | contatos | Converter/contatar | preservar |
| Socios | clients/members | Atendimento/Clientes | socios | Abrir socio | preservar |
| Recebiveis | finance/receivables | Financeiro | receber | Cobrar/marcar pago | preservar |
| Pagos | finance/paid | Financeiro | pagos | Consultar | preservar |
| Despesas | finance/expenses | Financeiro | despesas | Registrar despesa | preservar |
| Planos/pacotes | finance/packages | Financeiro/Admin | planos | Ajustar plano | preservar, nao primeira dobra |
| Resumo financeiro | finance/overview | Financeiro | resumo | Ver fechamento | preservar |
| Venda cantina | canteen/sell | Loja | vender | Finalizar venda | preservar |
| Vendas do dia | canteen/today | Loja | hoje | Ver venda | preservar |
| Estoque | canteen/stock | Loja | estoque | Repor/ajustar | preservar |
| Produtos | canteen/products | Loja/Admin | produtos | Cadastrar produto | preservar |
| Equipe | team/staff | Administracao | equipe | Gerir membro | preservar |
| Convites | team/invites | Administracao | convites | Enviar convite | preservar |
| Papeis/permissoes | team/roles/settings/permissions | Administracao | permissoes | Ajustar papel | preservar owner-only |
| Ajustes local | settings/* | Administracao | ajustes | Configurar | preservar |
| Torneio organizacao | `/eventos/:id/organizacao` | Competições | cockpit torneio | Resolver fase | preservar |
| Torneio jogadores | `/eventos/:id/jogadores` | Competições | inscritos/check-in | Revisar | preservar |
| Torneio jogos | `/eventos/:id/jogos` | Competições/Competir | jogos | Lancar/ver resultado | preservar |
| Torneio classificacao | `/eventos/:id/classificacao` | Competições/Competir | classificacao | Ver/Publicar | preservar |
| Torneio chat | `/eventos/:id/chat` | Competições/Competir | comunicacao | Publicar/conversar | preservar |
| Liga configuracao | `/eventos/ligas/:id` tab config | Competições/Admin | configuracao | Configurar owner | preservar owner-only |
| Liga rodada | `/eventos/ligas/:id` visao/partidas | Competir/Competições | rodada | Ver/gerar/validar | preservar |

## Rotas Alvo E Aliases Seguros

Nenhuma rota abaixo deve substituir rota antiga sem wrapper ou redirect.

| Rota alvo sugerida | Rota atual base | Tipo | Motivo |
| --- | --- | --- | --- |
| `/jogar` | `/locais` | alias futuro | label do menu fica coerente com missao |
| `/competir` | `/eventos` | alias futuro | evita depender do termo tecnico eventos |
| `/trabalho` | `/gestao` | alias futuro | linguagem humana para Management OS |
| `/trabalho/hoje` | `/gestao` | alias futuro | clareza da fila operacional |
| `/trabalho/atendimento` | `/gestao/:placeId/agenda` + clients | wrapper | unir reservas/clientes na missao recepcao |
| `/trabalho/academia` | `/gestao/:placeId/academia` | wrapper | professor/academia |
| `/trabalho/competicoes` | `/eventos?modo=organizing` | wrapper | organizador sem cair em descoberta |
| `/trabalho/financeiro` | `/gestao/:placeId/financeiro` | wrapper | financeiro do local |
| `/trabalho/loja` | `/gestao/:placeId/cantina` | wrapper | cantina/POS |
| `/trabalho/admin` | team/settings | wrapper | equipe, ajustes e permissoes |

Regra de migracao:

- manter `/gestao/:placeId/:module`;
- manter `/locais/:placeId/admin/:module`;
- manter segmentos legados como `agenda` para reservas do local;
- qualquer nova rota precisa preservar query params, tabs e estado relevante;
- rotas publicas `/join`, `/inscricao`, `/t` nao podem ser alteradas.

## Contratos De Pagina Por Workspace

### Inicio - Player App

Usuario primario: jogador/aluno/socio/competitivo.

Pergunta: o que eu preciso fazer agora?

Primeira dobra: proximo compromisso pessoal ou CTA para jogar.

CTA primario: Reservar, Ver aula, Ver partida ou Pagar, conforme prioridade.

Nunca aparece: gestao de local, financeiro do local, equipe, ajustes.

Mobile: uma fila curta; cards empilhados; CTA claro.

Desktop: hero + blocos de rotina pessoal.

### Jogar

Usuario primario: jogador buscando acao esportiva.

Pergunta: como eu jogo hoje ou encontro uma quadra?

Primeira dobra: reservar quadra, encontrar jogo, locais proximos.

CTA primario: Reservar quadra.

Vai para outra pagina: competicoes oficiais vao para `Competir`; aulas pessoais vao para `Agenda`.

### Competir - Player

Usuario primario: jogador competitivo.

Pergunta: onde estao minhas competicoes e proximos jogos?

Primeira dobra: proxima partida e eventos relevantes.

CTA primario: Abrir partida ou Entrar em competicao.

Nunca aparece: cockpit administrativo sem permissao.

### Agenda Pessoal

Usuario primario: jogador/aluno/socio.

Pergunta: quais compromissos e pendencias sao meus?

Primeira dobra: proximos itens por data com filtros de reservas, partidas, aulas e pagamentos.

CTA primario: Abrir proximo compromisso.

Nunca aparece: recebiveis do local ou pagamentos de outros clientes.

### Trabalho Hoje

Usuario primario: staff/gestor/organizador.

Pergunta: o que preciso resolver agora no trabalho?

Primeira dobra: fila por papel.

CTA primario: varia por papel.

Nunca aparece: setup raro como card principal.

### Atendimento

Usuario primario: recepcao e gestor.

Pergunta: quem precisa ser atendido e quais reservas precisam de acao?

Primeira dobra: reservas de hoje, check-ins, nova reserva, lista de espera contextual.

CTA primario: Nova reserva.

Vai para administracao: quadras, precos, regras permanentes.

### Academia

Usuario primario: professor, coordenador e gestor.

Pergunta: quais aulas/turmas/alunos precisam de acao?

Primeira dobra: aulas de hoje e chamada.

CTA primario: Fazer chamada ou Abrir turma.

Vai para administracao: configuracao de recursos, planos estruturais e permissoes.

### Competições - Trabalho

Usuario primario: organizador e gestor.

Pergunta: quais competicoes precisam de acao agora?

Primeira dobra: torneios/ligas por fase e bloqueio.

CTA primario: Resolver bloqueio ou Abrir cockpit.

Nunca aparece: descoberta publica como foco.

### Financeiro Do Local

Usuario primario: financeiro e gestor.

Pergunta: quem precisa pagar ou ser cobrado?

Primeira dobra: vencidos e recebiveis de hoje.

CTA primario: Cobrar ou Marcar pago.

Nunca aparece: pagamento pessoal do usuario como se fosse recebivel do local.

### Loja

Usuario primario: caixa/cantina.

Pergunta: como vendo rapido agora?

Primeira dobra: venda rapida e produtos frequentes.

CTA primario: Finalizar venda.

Vai para outra camada: cadastro de produto e configuracoes.

### Administracao

Usuario primario: owner/manager.

Pergunta: como configuro e controlo a operacao?

Primeira dobra: checklist de configuracao e alertas administrativos.

CTA primario: varia conforme pendencia.

Nunca aparece: operacao diaria como lista principal; deve ser area de setup, equipe, permissoes e relatorios.

## Decisoes De Divisao Para Reduzir Bagunca

### Dividir Mais, Mas Nao Em Mais Abas Globais

Sim, o produto deve ser mais dividido. Mas a divisao certa nao e aumentar o menu principal. A divisao certa e:

```text
Menu principal curto -> Workspace claro -> Views internas previsiveis
```

Exemplo errado:

```text
Hoje | Reservas | Nova Reserva | Espera | Quadras | Clientes | Aulas | Financeiro | Ajustes
```

Exemplo alvo:

```text
Hoje | Atendimento | Academia | Financeiro | Mais

Dentro de Atendimento:
Reservas hoje | Calendario | Lista de espera | Clientes
CTA dominante: Nova reserva
```

### Separar Atendimento De Academia

Hoje `Reservas`, `Clientes` e `Aulas` aparecem como modulos irmaos. Para operacao real:

- recepcao pensa em atendimento, nao em modulo;
- professor pensa em aula/turma/aluno, nao em configuracao;
- gestor pode alternar entre os dois, mas nao precisa ver tudo no topo.

Proposta:

- `Atendimento`: reservas, check-in, lista de espera, busca de cliente, atendimento rapido.
- `Academia`: aulas, turmas, alunos, chamada, reposicoes, professores.

### Separar Financeiro Pessoal De Financeiro Do Local

`Meus pagamentos` e `Financeiro` precisam de fronteira visual e textual.

- Player App: pagamentos do usuario, mensalidades, pacotes, reservas dele.
- Management OS: cobrancas, recebiveis, despesas, resumo do local.

### Separar Competir De Organizar

`/eventos` e descoberta/participacao.

`Trabalho -> Competições` e operacao.

Mesmo backend, mesma entidade, mas modo mental diferente.

### Colocar Configuracao Rara Em Administracao

Configuracao rara inclui:

- quadras/recursos;
- regras;
- planos estruturais;
- permissoes;
- equipe;
- dados publicos;
- publicacao do local;
- configuracao de academia;
- configuracao owner-only de liga;
- acoes destrutivas, reset, backup.

Essas coisas continuam existindo, mas nao competem com o dia a dia.

## Estados Vazios Por Workspace

| Workspace | Estado vazio ruim | Estado vazio V4 |
| --- | --- | --- |
| Inicio jogador | Nenhum item encontrado | Voce ainda nao tem compromissos. Comece reservando uma quadra ou encontrando um jogo perto de voce. |
| Agenda pessoal | Sem dados | Seus proximos compromissos aparecerao aqui: reservas, partidas, aulas e pagamentos pessoais. |
| Jogar | Nenhum local | Ainda nao encontramos locais nesta busca. Ajuste cidade/filtros ou veja chamadas abertas. |
| Competir jogador | Nenhum evento | Voce ainda nao esta em competicoes. Descubra torneios e ligas abertas para jogar. |
| Trabalho Hoje | Nada hoje | Nenhuma pendencia critica para seu papel agora. Use os atalhos para abrir sua rotina. |
| Atendimento | Sem reservas | Nao ha reservas no periodo. Crie uma nova reserva ou consulte a lista de espera. |
| Academia professor | Sem aulas | Voce ainda nao tem aulas atribuidas hoje. Quando uma turma for vinculada, ela aparecera aqui. |
| Financeiro | Sem recebiveis | Nao ha cobrancas para hoje. Consulte pagos, despesas ou resumo financeiro. |
| Loja | Sem produtos | Cadastre produtos para iniciar vendas na cantina, se tiver permissao. |
| Competições trabalho | Sem competicoes | Crie uma competicao ou acesse competicoes onde voce ja e staff. |
| Administracao | Sem pendencias | Configuracao principal completa. Ajustes avancados continuam disponiveis nas abas. |

## Queue Executavel V4

### FLOW-V4-00 - Congelar Taxonomia E Constantes

Objetivo: criar uma fonte de verdade de workspaces, labels, descricoes e grupos.

Arquivos provaveis:

- `src/utils/workspace-access.ts`
- `src/lib/place-management.ts`
- `src/components/BottomNav.tsx`
- docs V4

O que alterar:

- mapear `bookings` para `Atendimento` no nivel de workspace;
- manter `Reservas` como view/funcao dentro de Atendimento;
- mapear `canteen` para `Loja`;
- mapear `team/settings` para `Administracao`.

O que nao alterar:

- loaders;
- permissoes;
- rotas.

Aceite:

- uma tabela unica explica cada workspace por papel;
- nenhum label novo quebra rota antiga.

### FLOW-V4-01 - Sidebar Desktop Por Workspaces

Objetivo: trocar percepcao de arvore de modulos por workspaces de missao.

Alterar:

- `BottomNav.tsx`;
- labels e grupos do modo Trabalho.

Grupos alvo:

- Trabalho;
- Operacao;
- Administracao;
- Conta.

Aceite:

- professor ve Academia, nao financeiro/cantina;
- recepcao ve Atendimento;
- caixa ve Loja;
- financeiro ve Financeiro;
- gestor ve workspaces permitidos;
- organizador sem local ve Competições.

### FLOW-V4-02 - Mobile Work Role IA

Objetivo: deixar o menu mobile de trabalho mais direto por papel, sem criar terceira camada confusa.

Alterar:

- `BottomNav.tsx`;
- wrappers de destino quando necessario.

Aceite:

- cada papel tem no maximo cinco destinos;
- tarefa diaria nao fica em `Mais`;
- setup raro nao aparece no menu principal.

### FLOW-V4-03 - Atendimento Workspace

Objetivo: transformar reservas/clientes/lista de espera em fluxo de recepcao.

Alterar:

- `BookingWorkspaceShell.tsx`;
- possivelmente composicao em `PlacesPage.tsx`;
- labels/CTAs de `bookings`.

Mover para Administracao:

- quadras;
- precos;
- regras permanentes.

Aceite:

- `Nova reserva` e CTA de fluxo;
- lista de espera aparece no contexto certo;
- clientes ficam acessiveis para atendimento.

### FLOW-V4-04 - Academia Workspace Professor-First

Objetivo: professor abrir aula e chamada sem passar por gestao ampla.

Alterar:

- `AcademyWorkspaceShell.tsx`;
- cards de hoje/aulas/turmas em `PlacesPage.tsx`.

Aceite:

- primeira dobra do professor mostra aulas de hoje;
- `Fazer chamada` aparece cedo;
- configuracao nao compete com aula.

### FLOW-V4-05 - Financeiro Workspace

Objetivo: separar claramente cobranca do local de pagamentos pessoais.

Alterar:

- `FinanceWorkspaceShell.tsx`;
- labels/empty states.

Aceite:

- vencidos/recebiveis primeiro;
- pagos/despesas/resumo em views proprias;
- nenhum texto sugere pagamento pessoal.

### FLOW-V4-06 - Loja Workspace

Objetivo: caixa operar venda rapida antes de estoque/config.

Alterar:

- `CanteenWorkspaceShell.tsx`;
- cards de cantina.

Aceite:

- `Vender` abre como fluxo principal;
- estoque baixo e produtos ficam secundarios;
- venda termina com proximo passo.

### FLOW-V4-07 - Competições Trabalho Como Cockpit

Objetivo: organizar torneios e ligas por bloqueio/fase, nao por descoberta.

Alterar:

- `EventsHubPage`;
- `TournamentPage`;
- `LeagueDetailsPage`;
- possiveis wrappers de rota.

Aceite:

- organizador cai em operacao;
- jogador cai em descoberta/participacao;
- staff autorizado mantem funcoes.

### FLOW-V4-08 - Administracao Consolidada

Objetivo: tirar setup raro da rotina e consolidar em area encontravel.

Alterar:

- `SettingsWorkspaceShell.tsx`;
- `TeamWorkspaceShell.tsx`;
- menus locais.

Aceite:

- owner/manager encontra equipe, permissoes, ajustes, recursos, regras e relatorios;
- usuario sem permissao nao ve atalhos proibidos;
- acoes perigosas nao ficam perto da rotina.

### FLOW-V4-09 - Alias De Rotas Sem Quebra

Objetivo: criar nomes humanos sem romper links antigos.

Possiveis aliases:

- `/jogar` -> `/locais`;
- `/competir` -> `/eventos`;
- `/trabalho` -> `/gestao`;
- `/trabalho/atendimento` -> workspace de reservas/clientes;
- `/trabalho/competicoes` -> hub de organizacao.

Aceite:

- `/join`, `/inscricao`, `/t`, `/eventos`, `/locais`, `/gestao` continuam funcionando;
- query params importantes sao preservados.

### FLOW-V4-10 - QA De Fluxo Continuo

Objetivo: testar se cada persona conclui uma tarefa de ponta a ponta.

Cenarios obrigatorios:

- jogador reserva quadra;
- aluno abre aula e pede reposicao;
- socio reserva com plano;
- competitivo informa resultado;
- organizador resolve bloqueio de torneio;
- professor faz chamada;
- recepcao cria reserva;
- financeiro marca pago;
- caixa finaliza venda;
- gestor abre maior pendencia;
- multi-papel alterna Jogador/Trabalho.

Viewports:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop amplo.

Aceite:

- console sem erro;
- rotas publicas preservadas;
- permissao preservada;
- nenhuma funcao fica sem caminho claro.

## Checklist Antes De Implementar Qualquer Item V4

Antes de alterar uma tela, responder:

1. Qual persona principal usa esta tela?
2. Qual missao ela veio cumprir?
3. A tarefa e diaria, semanal, eventual ou rara?
4. O que precisa aparecer na primeira dobra?
5. Qual e o CTA dominante?
6. O que e view local e nao deveria virar menu global?
7. O que e configuracao e deveria ir para Administracao?
8. O que e historico/relatorio e deveria ficar secundario?
9. Que permissao controla isso?
10. Como fica para usuario multi-papel?
11. Como fica em mobile 390?
12. Como fica em desktop 1366?
13. Qual estado vazio orienta o proximo passo?
14. Qual estado sem permissao evita expor acao proibida?
15. A mudanca quebra rota publica, convite ou inscricao?
16. A mudanca ajuda um papel prejudicando outro?
17. Existe wrapper/composicao antes de criar rota nova?
18. O fluxo tem comeco, meio, fim e proximo passo?
19. Alguma funcao existente ficou sem caminho?
20. Como testar manualmente?

## Criterios De Aceite Do V4

A reestrutura V4 so pode ser considerada bem sucedida quando:

- o menu global nao parecer arvore de modulos;
- cada persona enxergar primeiro sua missao diaria;
- `Jogador` e `Trabalho` forem modos claros e consistentes;
- `Competir` de jogador nao se misturar com organizacao;
- `Atendimento`, `Academia`, `Financeiro`, `Loja`, `Competições` e `Administracao` forem workspaces distintos;
- configuracao rara sair da rotina;
- historico e relatorios nao competirem com operacao atual;
- rotas antigas continuarem funcionando;
- permissoes continuarem iguais;
- mobile tiver no maximo cinco destinos principais por papel;
- desktop usar grupos de workspace sem virar arvore infinita;
- toda funcao atual tiver caminho claro;
- toda acao principal levar a um proximo passo natural.

## Addendum - Auditoria E2E De Torneio

Documento detalhado: `TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`.

A auditoria criou e operou o torneio `ATP Open Dourados 010927` (`cd01cf82-31e3-4682-a64e-7f4db9d75387`) passando por:

- criacao do torneio pelo owner;
- pedidos de inscricao com jogadores seed;
- aprovacao de inscritos pela UI;
- encerramento de inscricoes;
- geracao de chave e agenda;
- tentativa de envio de resultado pelo jogador;
- tentativa de lancamento de resultado pelo admin;
- tentativa de finalizacao.

Resultado principal:

- o fluxo confirmou que o problema nao e apenas menu visual. A operacao do torneio ainda mistura evento publico, sala do jogador, cockpit de fase, configuracao, placar, publicacao e fechamento em muitos tiers concorrentes;
- o jogador conseguiu encontrar a acao de informar resultado, mas o envio quebrou no RPC com `column reference "tournament_id" is ambiguous`;
- o admin conseguiu abrir `Lancar placar`, mas a UI salvou placar parcial com mensagem `Atualizado com sucesso`, mantendo a partida pendente e bloqueando a progressao da chave;
- as acoes de fase, como encerrar inscricoes e finalizar torneio, ainda aparecem como alteracao de `Status` em configuracao profunda, quando deveriam ser CTA operacional da fase atual.

Decisao V4:

- torneio precisa de uma superficie operacional propria dentro de Competition OS;
- jogador deve ver `Minha participacao` e `Minha partida`, nao ferramentas de organizacao;
- owner/staff deve abrir um cockpit por fase com uma pergunta dominante: `o que falta resolver agora?`;
- configuracao estrutural deve existir, mas nao pode competir com operacao diaria;
- status/finalizacao devem virar CTAs de fase, preservando o select apenas como fallback avancado owner-only.

Queue criada:

- `FLOW-V4-TORNEIO-E2E`: corrigir cockpit de torneio por fluxo real, resultado do jogador, resultado admin, fase/CTA e reducao de tiers.

## Addendum - Sprint De Reducao De Tiers E Aliases

Data: 2026-05-20

Implementado:

- aliases de intencao sem remover rotas antigas:
  - `/jogar` como entrada para `/locais`;
  - `/competir` como entrada para `/eventos`;
  - `/trabalho` como entrada para `/gestao`;
  - `/trabalho/competicoes` como entrada para organizacao de competicoes;
  - `/trabalho/atendimento` como entrada de trabalho preservando a central atual.
- no torneio, mapa completo de areas e trilha de fases foram recolhidos em `Mais navegacao do torneio`;
- a primeira dobra de Competition OS passa a depender mais do cockpit da fase e menos de uma arvore visivel de tabs/submenus;
- na central de trabalho, atalhos de modulos por local foram recolhidos em `Mais areas do local`, reduzindo duplicidade quando ha mais de uma academia/local.
- em rotas profundas de gestao, `PlaceAdminShell` ganhou seletor `Local ativo` para trocar de local sem perder o modulo atual.

Validado:

- fluxo E2E fresco de torneio em `docs/screenshots/tournament-e2e-flow-v4-2026-05-20-run20-final-sprint-pass/`;
- resultado de jogador, resultado manual admin, WO e classificacao final;
- build de producao com `npm.cmd run build`.
- build de producao apos o seletor de local ativo.
- revalidacao final em `docs/screenshots/tournament-e2e-flow-v4-2026-05-21-run23-final-post-fixes/`:
  - torneio `ATP Open Dourados 032025`;
  - ID `23fb0ac9-8436-4cd1-a68c-d23cf0129b56`;
  - criacao, inscricoes, aprovacao, encerramento, jogos, resultado jogador, placar admin, WO e finalizacao aprovados;
  - aba `Classificacao` em mata-mata finalizado agora comunica resultado/podio, nao pendencia falsa;
  - podio respeita o tema premium dark.

Decisao mantida:

- ainda nao criar terceiro modo global `Competition OS`;
- preservar `Jogador` e `Trabalho` como modos oficiais;
- tratar competicoes como contexto: `Competir` para jogador e `Trabalho em competicoes` para organizador.
