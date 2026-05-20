# Global Workflow Restructure Study

Data: 2026-05-20

Status: estudo de produto/UX para a proxima fase estrutural.

Fontes internas principais:

- `CURRENT_PRODUCT_STATE.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- `FRONTEND_UX_REARCHITECTURE.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `SCREEN_RESPONSIBILITIES.md`
- codigo atual em `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/BottomNav.tsx`, `src/lib/place-admin-navigation.ts`, `src/lib/place-management.ts`, `src/pages/TournamentPage.tsx`, `src/pages/LeagueDetailsPage.tsx`, `src/pages/ManagementHubPage.tsx`.

Fontes externas usadas como referencia de padrao:

- Nielsen Norman Group: principios de arquitetura de informacao, navegacao e dashboards orientados a tarefa.
- GOV.UK Service Manual / Design System: padrao de tarefas complexas em passos claros, com cada tela respondendo uma pergunta.
- Atlassian Design System: navegacao lateral, top navigation e separacao entre produto, espaco e configuracao.
- CourtReserve, Playtomic Manager, Mindbody e Club Automation: produtos reais de clubes/academias que separam experiencia de jogador/cliente, equipe, agenda, aulas, pagamentos, membros e administracao.

## Escopo Atual Da Decisao

Este estudo nao deve transformar o ATP em outro produto.

Os MDs anteriores entram como contexto, inventario e evidencias do que ja foi discutido. Eles nao sao ordem automatica quando apontam para uma direcao maior, diferente ou mais generica do que a intencao atual.

Fonte de decisao desta rodada:

- preservar o ATP como app de tenis/padel com jogador, competicoes, reservas, aulas, mensalidades, locais e operacao de clubes/academias;
- aproveitar backend, dados, rotas e funcoes ja existentes;
- reorganizar frontend, navegacao, hierarquia de paginas, rotulos, prioridades e fluxos;
- criar telas novas apenas quando a funcao ja existe ou quando a ausencia da tela impede um fluxo atual de fazer sentido;
- nao criar um ERP generico, marketplace generico, CRM generico ou produto de gestao fora do escopo esportivo atual.

Regra de conflito:

```text
Se um documento antigo sugerir algo que melhora um produto teorico, mas desvia do ATP atual, a decisao fica bloqueada ate ser revalidada contra o fluxo real de jogador, competicao, local, professor, recepcao, financeiro, caixa e gestor.
```

## Diagnostico Executivo

O app ja tem cerca de 95% da direcao visual desejada. O proximo gargalo nao e cor, asset ou card isolado. O gargalo e arquitetura de trabalho.

Hoje o produto tem tres superficies corretas:

- Player App: `/inicio`, `/locais`, `/eventos`, `/ranking`, `/perfil`, paginas pessoais.
- Competition OS: torneios e ligas em `/eventos/...`.
- Management OS: `/gestao` e `/gestao/:placeId/:module`.

O problema e que varias paginas ainda funcionam como paginas-container. Elas acumulam operacao, configuracao, publicacao, relatorio, historico e tarefas de papel diferente na mesma area. Isso cria a sensacao de que o usuario precisa procurar, adivinhar e lembrar onde esta cada coisa.

Regra central para a reestrutura:

```text
O app nao deve mostrar a arvore interna de funcionalidades. Ele deve mostrar a proxima tarefa logica para o papel atual, no contexto atual.
```

## Onde A Complexidade Esta Vazando Hoje

### 1. Competicoes mistura jogador, organizador e descoberta

O hub `/eventos` melhorou, mas ainda existe uma tensao conceitual:

- `Competições` pode significar "o que jogo";
- pode significar "descobrir eventos";
- pode significar "organizar torneios e ligas";
- pode significar "ranking".

Para jogador puro, isso e aceitavel quando a tela prioriza `Jogando` e `Descobrir`.

Para organizador, ainda fica estranho porque o trabalho profissional de torneios/ligas nao deveria competir com descoberta de jogador. Ele deveria abrir em um cockpit de operacao competitivo, com filas por evento e fase.

### 2. Torneio tem abas que misturam fase, papel e ferramenta

Rotas atuais:

- `/eventos/:tournamentId/jogos`
- `/eventos/:tournamentId/classificacao`
- `/eventos/:tournamentId/organizacao`
- `/eventos/:tournamentId/jogadores`
- `/eventos/:tournamentId/chat`

Essas abas sao compreensiveis para leitura publica, mas para organizador a aba `Organizacao` virou uma pagina longa com muitas categorias:

- fila operacional;
- operacoes destrutivas;
- backup/restore;
- encerramento;
- publicacao;
- agenda por quadra;
- configuracao;
- equipe;
- fases do torneio;
- tarefas de inscricao e jogos.

Isso ainda parece mais "central tecnica" do que SaaS operacional.

### 3. Liga mistura sala publica e operacao de owner

Rotas atuais da liga ficam em uma pagina unica com `visao`, `jogadores`, `classificacao`, `partidas`, `chat`, `configuracao`.

O problema:

- jogador precisa ver sua rodada, ranking, chat e proximas acoes;
- organizador precisa aprovar inscricoes, gerar rodada, resolver resultados, comunicar e ajustar regras;
- owner ve blocos administrativos dentro de abas que tambem existem para jogador.

A tela precisa virar dois modos internos reais: `Liga do jogador` e `Liga de trabalho`.

### 4. Gestao de local tem modulo e subvisao demais no mesmo nivel mental

Rotas atuais de local:

- modulo: `painel`, `agenda`, `academia`, `clientes`, `financeiro`, `cantina`, `equipe`, `ajustes`;
- subvisoes por query `?visao=...`;
- cada modulo tem tabs internas.

Isso e funcional, mas mentalmente pesado porque o usuario ve:

- menu global;
- modo `Jogador/Trabalho`;
- central `/gestao`;
- local;
- modulo;
- subvisao;
- cards e acoes dentro da subvisao.

Para gestor completo isso pode funcionar no desktop se for um SaaS com sidebar real. Para professor, recepcao, financeiro e caixa, isso e excesso.

### 5. Home e Perfil ainda precisam virar centros por intencao

Home deve responder "o que eu faco agora?".

Perfil deve responder "quem sou eu no app e como mantenho minha conta em ordem?".

Perfil nao deve ser deposito de tudo que sobrou. Hoje ele ja separa areas, mas ainda precisa ficar claro que:

- identidade e preferencias ficam em Perfil;
- historico esportivo fica em Perfil/Ranking;
- pagamentos proprios ficam em `Meus pagamentos`;
- funcoes de trabalho nao entram aqui.

## Principios Da Nova Arquitetura

### P1. Navegacao por papel antes de navegacao por feature

O usuario entra como:

- Jogador;
- Aluno/socio;
- Professor;
- Recepcao;
- Financeiro;
- Caixa;
- Organizador;
- Gestor.

A UI nao precisa mostrar esses nomes como menus todos ao mesmo tempo, mas precisa escolher a ordem e o atalho conforme o papel.

### P2. Cada pagina operacional responde uma pergunta

Exemplos:

- `Agenda > Hoje`: "O que acontece hoje e o que precisa ser confirmado?"
- `Academia > Hoje`: "Quais aulas eu dou/opero hoje?"
- `Financeiro > Recebiveis`: "Quem precisa pagar e qual acao devo tomar?"
- `Torneio > Operacao`: "O que bloqueia o torneio agora?"
- `Liga > Rodada`: "Qual rodada esta ativa e o que falta resolver?"

### P3. Separar quatro camadas em todo modulo

Todo dominio deve separar:

- `Operacao`: rotina do dia, fila, pendencias.
- `Cadastro/Configuracao`: estrutura, regras, recursos.
- `Comunicacao/Publicacao`: links, mensagens, arte, WhatsApp.
- `Relatorio/Historico`: resultado, indicadores, exportacao.

Quando essas camadas aparecem juntas, a tela vira bagunca.

### P4. Mobile e desktop podem ter a mesma IA, mas nao a mesma densidade

Desktop pode ter sidebar, tabela e paines paralelos.

Mobile precisa ter:

- uma pergunta por tela;
- filtros em sheet;
- detalhes em sheet/drawer;
- acoes primarias fixas quando houver confirmacao;
- bottom nav com no maximo 4-5 destinos reais.

### P5. Setup raro nao deve dividir espaco com rotina diaria

Setup de local, regras de torneio, convite de equipe, planos, permissao e cadastro de recursos sao importantes, mas nao sao tarefas de todo dia. Devem ficar em `Configuracao/Ajustes`, ou aparecer como card de bloqueio apenas quando impedem a operacao.

## Personas E Missoes

### Jogador puro

Missao principal:

- encontrar jogo;
- reservar quadra;
- entrar em aula;
- entrar em torneio/liga;
- ver proximo compromisso;
- acompanhar ranking/perfil.

Primeira tela ideal:

- proxima acao pessoal no topo;
- atalhos `Reservar`, `Jogar`, `Aulas`, `Competir`;
- compromissos proximos;
- pagamentos proprios apenas se existirem.

Nao deve ver:

- gestao;
- equipe;
- CRM;
- recebiveis de terceiros;
- estoque;
- setup.

### Aluno de academia

Missao principal:

- ver proxima aula;
- pedir reposicao;
- confirmar presenca quando existir;
- ver professor/quadra/horario;
- pagar mensalidade;
- acompanhar evolucao.

Onde deve morar:

- `/inicio`: proxima aula e pendencias;
- `/minhas-aulas`: grade pessoal, reposicoes, historico;
- `/meus-pagamentos`: mensalidades proprias;
- `/perfil`: dados e preferencias.

Gap de IA:

- hoje `Minhas aulas` deve virar uma area mais forte para aluno, nao apenas uma lista.

### Socio/mensalista que reserva

Missao principal:

- reservar rapidamente;
- ver beneficios/plano;
- ver reservas futuras e passadas;
- pagar mensalidade ou pacote.

Onde deve morar:

- `/inicio`: proxima reserva e plano;
- `/minhas-reservas`: reserva futura, historico, cancelamento;
- `/locais/:id/reserva`: fluxo de reserva focado;
- `/meus-pagamentos`: plano/pagamentos.

### Jogador competitivo

Missao principal:

- saber proximo jogo;
- confirmar horario;
- informar resultado;
- ver chave/classificacao;
- falar no chat da partida/liga.

Onde deve morar:

- `/inicio`: proximo jogo e acao pendente;
- `/eventos`: competicoes em que joga;
- detalhe do torneio/liga em modo jogador: central da competicao antes de listas longas.

### Organizador de torneios/ligas

Missao principal:

- criar competicao;
- abrir inscricoes;
- aprovar/cobrar inscritos;
- gerar jogos/rodadas;
- alocar agenda/quadras;
- resolver resultados;
- publicar comunicados;
- finalizar e exportar.

Arquitetura recomendada:

- entrada pelo modo `Trabalho`;
- home de trabalho deve ter `Competições` como workspace proprio;
- cada torneio/liga deve ter cockpit de fase.

Nao deve precisar entrar em uma aba publica e procurar ferramentas administrativas.

### Professor

Missao principal:

- ver aulas de hoje;
- saber quadra, horario e turma;
- fazer chamada;
- ver alunos da turma;
- registrar falta/reposicao/evolucao;
- consultar agenda semanal propria.

Arquitetura recomendada:

- no modo `Trabalho`, professor nao abre `Gestao completa`;
- abre `Minhas aulas`;
- ve cards por aula do dia, com quadra/turma/alunos/acao primaria;
- subrotas: `hoje`, `agenda`, `turmas`, `alunos`, `reposicoes`.

Regra:

- professor nao deve ver Financeiro, Cantina, Equipe, Ajustes, CRM amplo.

### Recepcao/secretaria

Missao principal:

- confirmar reservas;
- criar reserva;
- resolver lista de espera;
- cadastrar cliente/aluno;
- encaminhar pendencia de aula;
- ver agenda do dia.

Arquitetura recomendada:

- entrada em `Atendimento`;
- `Hoje`, `Reservas`, `Clientes`, `Aulas pendentes`;
- a secretaria nao precisa ver setup, relatorio pesado, equipe ou configuracao estrutural.

### Financeiro

Missao principal:

- cobrar atrasados;
- marcar pagamento;
- ver pagos;
- registrar despesa;
- exportar/consultar resumo.

Arquitetura recomendada:

- entrada direta em `Financeiro`;
- primeira aba `Recebiveis`;
- `Pagos`, `Despesas`, `Planos`, `Resumo`;
- evitar misturar chamada de aula, agenda e cantina.

### Caixa/Cantina

Missao principal:

- vender rapido;
- consultar vendas do dia;
- ver estoque baixo;
- cadastrar produto quando permitido.

Arquitetura recomendada:

- entrada direta em `Cantina`;
- primeira tela `Vender`;
- `Hoje`, `Estoque`, `Produtos`.

### Gestor de academia/clube

Missao principal:

- ver saude geral;
- limpar pendencias;
- delegar/acompanhar equipe;
- configurar recursos;
- acompanhar receita;
- garantir operacao do dia.

Arquitetura recomendada:

- modo `Trabalho`;
- `Painel` com fila consolidada;
- sidebar com workspaces;
- relatorios e ajustes separados da rotina.

## Arquitetura De Navegacao Proposta

### Navegacao global

Manter seletor `Jogador / Trabalho`, mas transformar em promessa real:

#### Modo Jogador

Bottom nav:

- `Inicio`
- `Jogar` ou `Locais`
- `Competir`
- `Agenda` ou `Minhas coisas`
- `Perfil`

Observacao:

- `Reservas`, `Aulas`, `Partidas` e `Pagamentos` podem ficar dentro de `Agenda/Minha area`, para nao espremer o menu.
- Em mobile, `Competir` substitui `Competições`.

#### Modo Trabalho

Bottom nav/desktop sidebar:

- `Hoje`
- `Agenda`
- `Aulas` ou `Academia`
- `Competições`
- `Mais`

Ou, para gestor completo em desktop:

- `Painel`
- `Agenda`
- `Academia`
- `Clientes`
- `Financeiro`
- `Competições`
- `Equipe`
- `Ajustes`

Regra responsiva:

- Desktop: sidebar persistente com grupos.
- Mobile: bottom nav curta + tela `Mais` para modulos secundarios.

### Entrada `/gestao`

Hoje `/gestao` mistura:

- fila geral;
- convites;
- competicoes;
- locais;
- professor;
- setup.

Proposta:

`/gestao` vira `Trabalho Hoje`:

- bloco 1: fila agregada do papel atual;
- bloco 2: "Meus workspaces" agrupados por tipo;
- bloco 3: convites profissionais;
- bloco 4: setup/bloqueios apenas se existirem.

Grupos:

- `Locais`
- `Competições`
- `Aulas do professor`
- `Financeiro`
- `Cantina`

Cada grupo deve ter no maximo 3 itens em foco e "Ver todos".

### Gestão de local

Rota atual mantida:

- `/gestao/:placeId/:module?visao=...`

IA-alvo:

```text
Gestao do local
  Hoje
  Agenda
    Hoje
    Reservas
    Calendario
    Nova reserva
    Espera
    Quadras
  Aulas
    Hoje
    Grade
    Alunos
    Pendencias
    Professores
    Configuracao
  Clientes
    Rotina
    Contatos
    Socios
    Pendencias
    Resumo
  Financeiro
    Recebiveis
    Pagos
    Despesas
    Planos
    Resumo
  Cantina
    Vender
    Hoje
    Estoque
    Produtos
  Equipe
  Ajustes
```

Mudanca principal:

- `Painel` nao deve ser mais uma aba equivalente a `Agenda/Aulas`.
- `Hoje` deve ser a entrada operacional.
- `Ajustes` deve concentrar configuracao que hoje aparece misturada.
- `Equipe` deve sair do fluxo diario.

### Torneios

Separar publico/jogador/organizador.

#### Torneio publico/jogador

Tabs:

- `Resumo`
- `Meus jogos` quando participante
- `Jogos`
- `Inscritos`
- `Classificacao` se existir
- `Chat` se permitido

Primeira dobra:

- status pessoal;
- proxima partida;
- CTA: confirmar horario / informar resultado / inscrever-se / ver jogos.

#### Torneio organizador

Rota-alvo:

```text
/eventos/:id/operacao
/eventos/:id/inscricoes
/eventos/:id/partidas
/eventos/:id/agenda
/eventos/:id/publicacao
/eventos/:id/configuracao
/eventos/:id/equipe
/eventos/:id/relatorio
```

Enquanto mantemos rotas atuais, `organizacao` deve virar cockpit com links claros para subareas.

Por fase:

- Rascunho: `Configuracao` primeiro; `Publicacao` bloqueada; `Partidas` sem destaque.
- Inscricoes abertas: `Inscricoes`, `Publicacao`, `Comunicacao`.
- Inscricoes encerradas: `Sorteio`, `Agenda`, `Publicacao`.
- Em andamento: `Partidas`, `Resultados`, `Agenda`, `Comunicacao`.
- Finalizado: `Relatorio`, `Podio`, `Exportar`, `Publicacao`.

### Ligas

Liga precisa ser mais SaaS e menos pagina mista.

#### Liga jogador

Tabs:

- `Liga`
- `Minha rodada`
- `Classificacao`
- `Partidas`
- `Jogadores`
- `Chat`

#### Liga organizador

Rota-alvo:

```text
/eventos/ligas/:id/operacao
/eventos/ligas/:id/rodadas
/eventos/ligas/:id/jogadores
/eventos/ligas/:id/classificacao
/eventos/ligas/:id/comunicacao
/eventos/ligas/:id/configuracao
/eventos/ligas/:id/publicacao
```

Por fase:

- setup/rascunho: configuracao, classes, regras, inscricao.
- ativa: rodada atual, pendencias de resultado, chat/comunicado.
- encerramento: ranking final, promocao/rebaixamento, snapshot, exportacao.

### Perfil

Reorganizar como:

- `Conta`: nome, telefone, foto, privacidade.
- `Esporte`: nivel, preferencias, posicao, ranking.
- `Historico`: partidas, torneios, ligas.
- `Pagamentos`: apenas resumo/link para pagamentos proprios.
- `Trabalho`: apenas atalhos para areas profissionais, se existir.

Perfil nao deve virar uma segunda home.

## Proposta De Menu Principal

### Mobile jogador

```text
Inicio | Jogar | Competir | Agenda | Perfil
```

Onde:

- `Jogar`: locais, reservar, encontrar partida, aulas.
- `Competir`: torneios, ligas, ranking competitivo.
- `Agenda`: minhas reservas, aulas, partidas, pagamentos pendentes.

### Mobile trabalho

Para gestor:

```text
Hoje | Agenda | Aulas | Financeiro | Mais
```

Para professor:

```text
Hoje | Turmas | Alunos | Agenda | Perfil
```

Para organizador sem local:

```text
Hoje | Torneios | Ligas | Publicacao | Perfil
```

Para recepcao:

```text
Hoje | Reservas | Clientes | Aulas | Mais
```

Para financeiro:

```text
Receber | Pagos | Despesas | Resumo | Perfil
```

### Desktop trabalho

Sidebar por grupos:

```text
Trabalho
  Hoje
  Locais
    Agenda
    Aulas
    Clientes
    Financeiro
    Cantina
  Competições
    Torneios
    Ligas
  Administração
    Equipe
    Ajustes
    Relatórios
```

O menu deve ser filtrado por permissao. Nao mostrar grupo vazio.

## Principais Decisoes De Reestrutura

### D1. Criar `Hoje` como superficie de trabalho

Hoje nao e `Painel`.

`Hoje` e uma fila acionavel por papel:

- professor: minhas aulas;
- recepcao: reservas/check-in/lista de espera;
- financeiro: recebiveis vencidos;
- organizador: competicoes com bloqueio;
- gestor: visao consolidada.

### D2. Criar `Agenda` do jogador

O jogador precisa de um lugar previsivel para tudo que tem data:

- reservas;
- aulas;
- partidas;
- pagamentos proximos;
- confirmacoes pendentes.

Isso reduz a necessidade de links separados demais no bottom nav.

### D3. Dividir Competition OS entre jogador e trabalho

`/eventos` pode continuar sendo hub de jogador.

Trabalho deve ter entrada propria:

- `/trabalho/competicoes` ou `/gestao/competicoes`;
- ou dentro de `/gestao`, grupo `Competições`.

Nao precisa migrar URL imediatamente; pode haver wrappers que navegam para rotas atuais.

### D4. Promover subvisoes importantes a paginas sem query mental

Hoje:

```text
/gestao/:placeId/academia?visao=hoje
```

Melhor:

```text
/gestao/:placeId/aulas/hoje
/gestao/:placeId/aulas/turmas
/gestao/:placeId/aulas/alunos
```

Mesmo se internamente continuar usando query por enquanto, a IA e os textos devem tratar como paginas.

### D5. Configuracao sempre fora da rotina

`Ajustes`, `Equipe`, `Permissoes`, `Planos`, `Regras`, `Recursos` devem sair de telas de rotina, exceto quando um bloqueio exige acao.

## Rechecagem Global Pos-MD

Data da rechecagem: 2026-05-20.

Objetivo:

- validar se este estudo continua aderente ao produto atual;
- cruzar proposta contra rotas reais, permissoes, papeis e documentos internos;
- impedir que algum MD antigo direcione a execucao para um produto diferente do ATP pretendido agora.

### Inventario de rotas reais que precisam ser preservadas

Rotas de jogador e area pessoal:

- `/inicio`
- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/locais`
- `/locais/:placeId`
- `/perfil`
- `/ranking`

Rotas de trabalho/local:

- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`

Rotas de competicao:

- `/eventos/:tournamentId/jogos`
- `/eventos/:tournamentId/classificacao`
- `/eventos/:tournamentId/organizacao`
- `/eventos/:tournamentId/jogadores`
- `/eventos/:tournamentId/chat`
- `/eventos/:tournamentId/inscricao/:classId`
- `/eventos/:tournamentId/join/:classId`
- `/eventos/:tournamentId/t/:classId`
- rotas de liga em `/eventos/ligas/:leagueId`.

Restricao:

- nenhuma reestrutura pode remover essas rotas sem alias, redirect ou wrapper temporario;
- links externos com `join`, hash route e convites precisam continuar funcionando;
- nomes novos como `/agenda`, `/trabalho/competicoes` ou `/eventos/:id/operacao` devem nascer como camada de IA, nao como quebra imediata de URL.

### Matriz real de modulos de local

O codigo atual organiza gestao de local nestes modulos:

- `dashboard` -> `painel`
- `bookings` -> `agenda`
- `academy` -> `academia`
- `clients` -> `clientes`
- `finance` -> `financeiro`
- `canteen` -> `cantina`
- `team` -> `equipe`
- `settings` -> `ajustes`

Subvisoes reais hoje:

- Agenda: `today`, `reservations`, `calendar`, `new`, `waitlist`, `resources`.
- Academia: `today`, `classes`, `students`, `requests`, `coaches`, `resources`.
- Financeiro: `receivables`, `paid`, `expenses`, `packages`, `overview`.
- Cantina: `today`, `sell`, `stock`, `products`.
- Clientes: `relationship`, `leads`, `members`, `requests`, `overview`.
- Equipe: `overview`, `staff`, `invites`, `roles`.
- Ajustes: `overview`, `public`, `resources`, `rules`, `plans`, `permissions`, `publication`.

Decisao:

- a reestrutura deve reorganizar a entrada, a ordem e a composicao dessas visoes;
- nao deve duplicar regras nem criar outro sistema paralelo de gestao.

### Papeis reais de equipe de local

Papeis atuais:

- `manager`
- `coach`
- `frontdesk`
- `finance`
- `cashier`

Guardrails de fluxo:

- `coach`: deve ter workspace de professor com aulas, turmas, alunos e reposicoes. Nao deve virar operador de agenda completa de quadras nem enxergar financeiro, equipe, cantina ou ajustes.
- `frontdesk`: deve operar reservas, clientes e pendencias de atendimento. Pode precisar ver aulas pendentes, mas nao deve receber configuracao estrutural, equipe ou relatorios pesados.
- `finance`: deve cair direto em recebiveis, pagos, despesas, planos/resumo. Nao deve disputar espaco com aula, reserva ou cantina.
- `cashier`: deve cair em venda/caixa/cantina. Nao deve enxergar financeiro amplo, ajustes ou clientes como CRM.
- `manager` e dono do local: podem ver a visao consolidada, equipe, ajustes e relatorios, mas a primeira tela ainda deve priorizar operacao do dia.

Gap identificado:

- Professor precisa de agenda propria derivada de aulas/turmas. Isso nao e a mesma coisa que dar acesso ao modulo de reservas. A fila `FLOW-04` deve resolver isso sem relaxar `canManageBookings`.

### Papeis reais de torneio

Papeis atuais:

- `owner`
- `organizer`
- `scorekeeper`
- `checkin`
- `media`
- `participant`
- `viewer`

Guardrails de fluxo:

- `owner`: acesso amplo, configuracao, equipe, fases, publicacao, relatorio e operacao.
- `organizer`: operacao ampla, mas ainda deve respeitar limites definidos no codigo.
- `scorekeeper`: foco em partidas, resultados, placar e comunicacao operacional; nao deve receber configuracao geral como tarefa principal.
- `checkin`: foco em inscritos, credenciamento, presenca e pendencias de entrada; nao deve cair em backup, reset, regras ou relatorio.
- `media`: foco em comunicacao/publicacao; nao deve precisar navegar por inscricoes ou jogos para achar kit e links.
- `participant/viewer`: tabs publicas e pessoais, sem ferramentas administrativas.

Impacto na queue:

- `FLOW-07` nao pode tratar "organizador" como um unico perfil. O cockpit de torneio precisa filtrar tarefas por papel real.

### Papeis reais de liga

Hoje a liga trabalha com:

- participante;
- owner/organizador.

Tabs atuais:

- `visao`
- `jogadores`
- `classificacao`
- `partidas`
- `chat`
- `configuracao`

Guardrails:

- `configuracao` deve continuar owner-only;
- jogador precisa de caminho claro para rodada atual, partida, resultado, classificacao e chat;
- owner precisa de operacao de rodada, aprovacao, cobranca, comunicacao e encerramento sem misturar tudo em uma aba publica.

Impacto na queue:

- `FLOW-08` deve preservar a liga publica enquanto cria a camada operacional por fase.

### Pagamentos e financeiro

Existem dois mundos diferentes:

- `Meus pagamentos`: pagamentos proprios do jogador, aluno ou socio.
- `Financeiro`: recebiveis, pagos, despesas, planos e resumo do local.

Guardrail:

- consolidar a agenda do jogador nao pode esconder mensalidade propria;
- melhorar financeiro de trabalho nao pode misturar cobranca do local com conta pessoal do usuario.

### Criacao, onboarding e planos

Documentos internos indicam modelos como jogador gratuito, organizador de competicoes, professor solo e academia/clube.

Decisao para esta fase:

- usar esses modelos como matriz de acesso e onboarding;
- nao implementar produto comercial novo sem decisao separada;
- antes de mexer no menu, `FLOW-00` deve mapear quais CTAs de criacao ja existem, quais sao entitlement/plan gated e quais precisam continuar ocultos.

Gaps de verificacao:

- criacao de local;
- criacao de torneio/liga;
- aceite de convite de equipe;
- convite de torneio;
- entrada por link publico;
- usuario com varios papeis simultaneos.

### Regras duras para implementacao

1. Nao remover rota existente sem alias, redirect ou wrapper.
2. Nao relaxar permissao para simplificar menu.
3. Nao duplicar loaders/backends para criar pagina nova.
4. Nao transformar setup raro em destino principal.
5. Nao esconder acao critica dentro de `Mais` se ela for rotina diaria do papel.
6. Nao misturar conta pessoal com financeiro de local.
7. Nao misturar modo jogador com trabalho sem uma fronteira visual clara.
8. Nao seguir MD antigo quando ele empurrar o ATP para outro produto.

## Queue Recomendada

### FLOW-00A - Rechecagem global e matriz de gaps

Objetivo:

- transformar esta rechecagem em matriz executavel antes dos sprints de codigo.

Entregas:

- tabela `rota atual -> superficie atual -> superficie alvo -> alias necessario`;
- matriz `papel -> modulos visiveis -> tarefa primaria -> CTA primario -> paginas proibidas`;
- lista de CTAs clicaveis que hoje levam para rota fraca, rota generica ou pagina inexistente;
- lista de telas que precisam nascer como wrappers de frontend sem novo backend.

Aceite:

- nenhum item `FLOW-01` a `FLOW-09` comeca sem saber quais rotas e permissoes precisa preservar.

### FLOW-00 - Mapa de IA e contratos de pagina

Objetivo:

- congelar nomes de superficies, menus, rotas e responsabilidades antes de mexer em codigo.

Entregas:

- documento `APP_INFORMATION_ARCHITECTURE_V3.md`;
- tabela de rotas atuais x rotas-alvo;
- lista de aliases temporarios para nao quebrar links.

Aceite:

- toda rota tem uma superficie, papel primario, intencao, CTA primario e estado vazio.

### FLOW-01 - Trabalho Hoje

Objetivo:

- transformar `/gestao` em entrada operacional por papel, nao em lista de tudo.

Entregas:

- blocos por persona;
- fila agregada priorizada;
- cards de workspace limitados;
- convites profissionais separados;
- setup colapsado.

Aceite:

- professor abre vendo aulas;
- recepcao abre vendo reservas/atendimento;
- financeiro abre vendo cobrancas;
- organizador abre vendo competicoes com pendencia;
- gestor ve consolidado.

### FLOW-02 - Navegacao principal V3

Objetivo:

- simplificar bottom nav e desktop nav.

Entregas:

- modo jogador com `Inicio/Jogar/Competir/Agenda/Perfil`;
- modo trabalho adaptado por papel;
- desktop com sidebar de grupos;
- `Mais` mobile para modulos secundarios.

Aceite:

- nenhum papel importante fica sem caminho;
- nenhum papel ve modulo que nao pode usar;
- mobile nao passa de 5 destinos primarios.

### FLOW-03 - Agenda do jogador

Objetivo:

- reunir compromissos pessoais em uma area clara.

Entregas:

- `/agenda` ou evolucao de paginas pessoais;
- proximas aulas, reservas, partidas e pagamentos;
- filtros simples por tipo;
- detalhe em sheet.

Aceite:

- aluno entende proxima aula e quadra;
- socio entende reserva e status;
- competitivo entende proximo jogo e acao pendente.

### FLOW-04 - Professor Workspace

Objetivo:

- remover professor da gestao completa.

Entregas:

- entrada `Hoje`;
- tabs `Hoje`, `Agenda`, `Turmas`, `Alunos`, `Reposicoes`;
- aula card com horario, quadra, turma, alunos, chamada;
- esconder setup/equipe/financeiro.

Aceite:

- professor abre e entende onde vai dar aula sem procurar modulo.

### FLOW-05 - Recepcao Workspace

Objetivo:

- criar fluxo de atendimento.

Entregas:

- `Hoje`, `Reservas`, `Lista de espera`, `Clientes`, `Aulas pendentes`;
- criacao rapida de reserva;
- cadastro/consulta rapida de pessoa;
- sheets para detalhe.

Aceite:

- secretaria consegue resolver check-in, reserva e cadastro sem entrar em ajustes.

### FLOW-06 - Competition Work Hub

Objetivo:

- separar organizacao de competicoes da descoberta/jogador.

Entregas:

- hub de trabalho para torneios/ligas;
- filas por fase;
- criar torneio/liga como CTA contextual;
- lista por status.

Aceite:

- organizador sem local tem area de trabalho clara;
- gestor com local ve competicoes sem misturar com agenda de quadra.

### FLOW-07 - Torneio Operacional V3

Objetivo:

- quebrar `Organizacao` em cockpit + paginas de trabalho.

Entregas:

- cockpit por fase;
- paginas/abas: `Operacao`, `Inscricoes`, `Partidas`, `Agenda`, `Publicacao`, `Configuracao`, `Equipe`, `Relatorio`;
- mover backup/reset/destrutivos para `Configuracao/Avancado`;
- mover agenda por quadra para `Agenda`;
- mover kit de publicacao para `Publicacao`;
- manter jogador com tabs publicas limpas.

Aceite:

- em cada fase, a primeira dobra mostra exatamente o proximo bloqueio.

### FLOW-08 - Liga Operacional V3

Objetivo:

- separar liga jogador e liga organizador.

Entregas:

- para jogador: `Liga`, `Minha rodada`, `Classificacao`, `Partidas`, `Chat`;
- para owner: `Operacao`, `Rodadas`, `Jogadores`, `Classificacao`, `Comunicacao`, `Configuracao`, `Publicacao`;
- gerar rodada e scheduler em `Rodadas`;
- aprovacao/cobranca em `Jogadores`;
- snapshots/encerramento em `Classificacao/Relatorio`.

Aceite:

- owner nao precisa procurar aprovacao dentro de aba publica.

### FLOW-09 - Ajustes e administracao fora da rotina

Objetivo:

- limpar telas operacionais.

Entregas:

- `Equipe`, `Permissoes`, `Planos`, `Regras`, `Recursos`, `Publicacao do local` agrupados;
- destrutivos isolados;
- setup wizard para primeiro uso.

Aceite:

- rotina diaria nao mostra botoes perigosos como se fossem tarefas comuns.

### FLOW-10 - QA por persona

Objetivo:

- garantir que a reestrutura nao melhora um papel quebrando outro.

Casos obrigatorios:

- jogador puro;
- aluno com mensalidade;
- socio/reservas;
- jogador competitivo;
- organizador sem local;
- professor;
- recepcao;
- financeiro;
- caixa;
- gestor completo;
- gestor + organizador.

Viewports:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop amplo.

Aceite:

- cada persona tem screenshot de primeira dobra, menu, tarefa principal e detalhe;
- console sem erro;
- links primarios levam para destino logico.

## Ordem Recomendada De Execucao

1. `FLOW-00`: congelar IA.
2. `FLOW-02`: ajustar menu e modo sem mover dados profundos.
3. `FLOW-01`: redesenhar `/gestao` como `Trabalho Hoje`.
4. `FLOW-04` e `FLOW-05`: professor/recepcao, porque sao os mais prejudicados por menu pesado.
5. `FLOW-06`: hub de competicoes de trabalho.
6. `FLOW-07` e `FLOW-08`: torneio/liga operacional.
7. `FLOW-03`: agenda do jogador consolidada.
8. `FLOW-09`: ajustes/admin fora da rotina.
9. `FLOW-10`: QA transversal.

## Riscos

### R1. Trocar menu antes de definir destino

Se o menu mudar sem rotas claras, o app fica mais bonito mas igualmente confuso.

Mitigacao:

- criar tabela de rotas-alvo e aliases antes do sprint de menu.

### R2. Criar paginas novas duplicando logica

Nao devemos duplicar backend nem regras.

Mitigacao:

- extrair containers/workspaces reutilizaveis;
- manter loaders existentes;
- mover composicao de tela gradualmente.

### R3. Quebrar usuario multi-papel

O mesmo usuario pode ser jogador, aluno, organizador e gestor.

Mitigacao:

- `Jogador/Trabalho` continua como fronteira;
- dentro de Trabalho, entrada por papel dominante + atalhos para outros workspaces.

### R4. Mobile virar menu de tudo

Mobile nao pode tentar carregar toda sidebar.

Mitigacao:

- 5 destinos maximos;
- `Mais` agrupado;
- sheets/drawers para detalhe;
- uma tarefa primaria por tela.

## Criterio De Sucesso

O app estara reorganizado quando:

- um jogador novo entende em ate 10 segundos onde reservar, jogar, competir ou ver sua proxima acao;
- um professor entra e ve suas aulas de hoje com horario, quadra e turma sem abrir gestao completa;
- uma secretaria consegue confirmar reserva, criar reserva e achar cliente sem passar por setup;
- um financeiro abre direto em cobrancas;
- um organizador entende o que falta no torneio/liga pela fase atual;
- um gestor consegue ver a operacao toda sem o app virar uma lista infinita;
- nenhum papel ve funcoes que nao fazem sentido para ele;
- toda pagina tem CTA primario e estado vazio acionavel.
