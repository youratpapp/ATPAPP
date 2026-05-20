# APP Workflow Execution Playbook V3

Data: 2026-05-20

Status: especificacao executavel para reestruturacao de fluxo, IA, menus e responsabilidades de pagina.

Documento base:

- `GLOBAL_WORKFLOW_RESTRUCTURE_STUDY_2026_05_20.md`

Regra de escopo:

- este playbook nao autoriza refatoracao de backend;
- nao transforma o ATP em ERP generico;
- nao remove rotas existentes sem alias, redirect ou wrapper;
- nao relaxa permissoes para facilitar navegacao;
- nao substitui o design premium dark ja aprovado;
- organiza o produto atual: jogador, reservas, aulas, mensalidades, locais, torneios, ligas, professor, recepcao, financeiro, caixa e gestor.

## Critical Reading Of Current Study

O estudo atual esta forte em:

- separar `Player App`, `Competition OS` e `Management OS`;
- declarar que o app deve mostrar a proxima tarefa logica, nao a arvore interna de funcionalidades;
- reconhecer que o problema atual deixou de ser visual e passou a ser arquitetura de trabalho;
- proteger rotas, permissoes e funcoes existentes;
- separar rotina diaria de configuracao rara;
- tratar torneio e liga por fase;
- preservar o seletor `Jogador / Trabalho`.

Pontos que ainda precisavam virar execucao:

- task flows reais por persona;
- primeira tela ideal, CTA primario e proibicoes por papel;
- estados vazios, bloqueados, sem permissao e primeiro uso;
- mapa de rotas atuais contra superficies futuras;
- contratos de pagina para evitar paginas-container;
- queue com arquivos, riscos, rollback e QA;
- checklist de raciocinio antes de qualquer tela ser alterada.

Risco principal:

```text
Reorganizar menus sem redesenhar o trabalho real.
```

Se isso acontecer, o app fica mais bonito e ainda confuso. Toda mudanca abaixo precisa partir da tarefa, nao do modulo.

## Critical Task Flows By Persona

### Jogador puro

Persona: jogador sem papel de trabalho.

Missao: jogar, reservar, encontrar eventos e acompanhar proximos compromissos.

Entrada ideal: `/inicio`, modo `Jogador`.

Primeira informacao que precisa aparecer: proxima acao pessoal com data, local e status.

CTA primario: `Reservar quadra`, `Encontrar jogo` ou `Ver proximo jogo`, conforme pendencia mais urgente.

Passo a passo do fluxo de reservar quadra:

1. Entra em `Inicio`.
2. Ve atalho `Reservar`.
3. Abre local ou busca por cidade.
4. Escolhe quadra, dia e horario.
5. Confirma reserva.
6. Volta para agenda pessoal com status.

Possiveis bloqueios: local sem quadras, horario indisponivel, plano exigido, pagamento pendente.

Tela de sucesso: reserva criada com local, quadra, dia, horario, status e CTA para compartilhar/cancelar quando permitido.

O que nao deve aparecer: gestao, financeiro do local, equipe, ajustes, estoque, inscricoes administrativas.

Risco de confusao: separar demais `Minhas reservas`, `Minhas partidas`, `Minhas aulas` e `Meus pagamentos`.

Mobile: bottom nav curta, detalhe em sheet, CTA fixo no fim do fluxo.

Desktop: cards de proximos compromissos + atalhos em linha; detalhes podem abrir em painel lateral.

### Aluno de academia

Missao: ver aula de hoje, turma, professor, quadra, reposicoes e mensalidade.

Entrada ideal: `/inicio`, com destaque para proxima aula; area secundaria em `/minhas-aulas`.

Primeira informacao: proxima aula com horario, professor, quadra e status.

CTA primario: `Ver aula` ou `Pedir reposicao`.

Passo a passo do fluxo de aula:

1. Entra em `Inicio`.
2. Ve card `Proxima aula`.
3. Abre detalhe.
4. Confere professor, turma, quadra e horario.
5. Solicita reposicao se houver falta/credito.
6. Acompanha retorno em `Minhas aulas`.

Possiveis bloqueios: sem matricula ativa, mensalidade pendente, reposicao sem credito, turma sem quadra definida.

Tela de sucesso: reposicao solicitada ou aula confirmada com proximo passo.

O que nao deve aparecer: gestao de turma, financeiro de terceiros, ajustes do local.

Mobile: aula do dia antes de carrossel/descoberta.

Desktop: agenda semanal e pagamentos proprios podem coexistir, mas sem virar gestao.

### Socio/mensalista que reserva quadra

Missao: usar beneficio/plano para reservar e acompanhar pagamentos proprios.

Entrada ideal: `/inicio` com plano/reserva; detalhes em `/minhas-reservas` e `/meus-pagamentos`.

Primeira informacao: proxima reserva ou status do plano.

CTA primario: `Reservar com plano`.

Fluxo:

1. Abre `Inicio`.
2. Ve plano ativo, beneficios ou pendencia.
3. Toca em `Reservar`.
4. Escolhe horario permitido pelo plano.
5. Confirma.
6. Ve reserva na agenda pessoal.

Bloqueios: plano vencido, regras de antecedencia, limite de reservas, horario fora do plano.

O que nao deve aparecer: recebiveis do local, cadastro de planos, permissoes.

### Jogador competitivo

Missao: saber proximo jogo, confirmar horario, informar resultado, ver chave/classificacao e chat.

Entrada ideal: `/inicio` quando ha jogo pendente; `/eventos` para historico e descoberta.

Primeira informacao: proxima partida com adversario, data, local e acao.

CTA primario: `Confirmar horario`, `Informar resultado` ou `Abrir jogo`.

Fluxo:

1. Entra em `Inicio`.
2. Ve card de proxima partida.
3. Abre detalhe da competicao.
4. Confere adversario, horario, quadra e regras.
5. Confirma, conversa ou informa resultado.
6. Volta para classificacao/chave.

Bloqueios: horario nao definido, resultado aguardando adversario, chat indisponivel, competicao encerrada.

O que nao deve aparecer: ferramentas de organizacao, backup, configuracao, publicacao.

### Organizador independente de torneios/ligas

Missao: criar, publicar, operar e finalizar competicoes sem depender de um local.

Entrada ideal: modo `Trabalho`, hub de competicoes.

Primeira informacao: competicoes com pendencia por fase.

CTA primario: `Resolver proximo bloqueio` ou `Criar competicao`.

Fluxo de criar torneio:

1. Entra em `Trabalho`.
2. Abre `Competicoes`.
3. Escolhe `Criar torneio`.
4. Define nome, local/cidade, datas, classes, regras e inscricao.
5. Publica link.
6. Acompanha inscritos.

Fluxo de operar torneio em andamento:

1. Abre hub de competicoes.
2. Ve torneio com pendencia.
3. Entra no cockpit da fase.
4. Resolve inscritos, sorteio, agenda, resultado ou comunicacao.
5. Publica atualizacao.

Bloqueios: plano/entitlement, dados minimos ausentes, inscricao sem pagamento, jogos nao gerados, resultado pendente.

O que nao deve aparecer: descoberta publica como foco principal, financeiro de academia se nao houver local, estoque/cantina.

### Professor autonomo

Missao: organizar aulas proprias sem virar gestor completo de clube.

Entrada ideal: modo `Trabalho`, `Hoje`.

Primeira informacao: aulas/agendamentos do dia.

CTA primario: `Abrir aula`.

Fluxo:

1. Entra em `Trabalho`.
2. Ve agenda do dia.
3. Abre aula.
4. Confere aluno/turma, horario e local.
5. Registra presenca, falta, reposicao ou observacao.

Bloqueios: nenhuma aula criada, aluno sem cadastro, local nao definido.

O que nao deve aparecer: ERP de clube, equipe, permissoes, caixa, estoque.

### Professor de academia

Missao: ver aulas atribuidas, quadra, turma, alunos, chamada e reposicoes.

Entrada ideal: modo `Trabalho`, workspace de professor.

Primeira informacao: aulas de hoje do professor.

CTA primario: `Fazer chamada`.

Fluxo:

1. Entra em `Trabalho`.
2. Cai em `Hoje`.
3. Ve cards de aula com horario, quadra, turma e alunos.
4. Abre aula.
5. Faz chamada.
6. Registra falta/reposicao/evolucao.
7. Consulta proxima aula.

Bloqueios: professor ainda nao vinculado em `place_coaches`, turma sem professor, turma sem quadra.

O que nao deve aparecer: financeiro, cantina, equipe, ajustes, agenda completa de reservas.

### Recepcao/secretaria

Missao: atendimento rapido: reserva, check-in, lista de espera, cliente e aula pendente.

Entrada ideal: modo `Trabalho`, `Atendimento Hoje`.

Primeira informacao: fila de reservas e pendencias do dia.

CTA primario: `Criar reserva` ou `Confirmar presenca`.

Fluxo de criar reserva:

1. Entra em `Trabalho`.
2. Ve `Reservas hoje`.
3. Toca em `Nova reserva`.
4. Busca/cadastra pessoa.
5. Escolhe quadra e horario.
6. Confirma e informa status.

Fluxo de lista de espera:

1. Abre `Lista de espera`.
2. Ve pessoas aguardando.
3. Oferece horario.
4. Confirma ou cancela.

Bloqueios: cliente sem cadastro, quadra bloqueada, pagamento exigido, permissao insuficiente.

O que nao deve aparecer: regras avancadas, permissoes, relatorio pesado, backup.

### Financeiro

Missao: cobrar inadimplentes, marcar pagamento, ver pagos, despesas e resumo.

Entrada ideal: modo `Trabalho`, modulo `Financeiro`, aba `Recebiveis`.

Primeira informacao: vencidos e recebiveis de hoje.

CTA primario: `Marcar pago` ou `Cobrar`.

Fluxo:

1. Entra em `Trabalho`.
2. Cai em `Financeiro`.
3. Ve recebiveis vencidos.
4. Filtra por academia, mensalidade, pacote ou reserva.
5. Abre item.
6. Marca pago, registra observacao ou cobra.

Bloqueios: sem permissao financeira, plano bloqueado, item sem responsavel.

O que nao deve aparecer: chamada de aula, agenda operacional, cantina como venda, ajustes gerais.

### Caixa/cantina

Missao: vender rapido, ver vendas do dia e estoque baixo.

Entrada ideal: modo `Trabalho`, `Cantina`, aba `Vender`.

Primeira informacao: PDV/venda rapida.

CTA primario: `Finalizar venda`.

Fluxo:

1. Entra em `Trabalho`.
2. Abre `Cantina`.
3. Seleciona produtos.
4. Informa comprador se necessario.
5. Finaliza pagamento.
6. Atualiza estoque/vendas do dia.

Bloqueios: produto sem estoque, permissao insuficiente, forma de pagamento ausente.

O que nao deve aparecer: financeiro amplo, receivables, ajustes do clube, equipe.

### Gestor de academia/clube

Missao: ver saude da operacao, limpar pendencias, delegar, configurar e acompanhar receita.

Entrada ideal: modo `Trabalho`, `Hoje` consolidado.

Primeira informacao: pendencias criticas por area.

CTA primario: `Resolver pendencia principal`.

Fluxo:

1. Entra em `Trabalho`.
2. Ve painel `Hoje` com reservas, aulas, financeiro, clientes, estoque e equipe quando houver.
3. Abre a area com maior bloqueio.
4. Resolve ou delega.
5. Retorna ao consolidado.

Bloqueios: setup incompleto, equipe sem permissao, plano do local, recursos nao cadastrados.

O que nao deve aparecer: lista infinita sem prioridade.

### Usuario multi-papel

Missao: alternar entre jogar e trabalhar sem misturar responsabilidades.

Entrada ideal: ultimo modo usado, com seletor `Jogador / Trabalho` visivel e consistente.

Primeira informacao: no modo jogador, proxima acao pessoal; no modo trabalho, fila operacional.

CTA primario: depende do modo ativo.

Regra:

- o modo controla a superficie;
- as permissoes controlam o conteudo;
- atalhos cruzados podem existir, mas nao devem invadir a primeira dobra.

## Persona Entry Matrix

| Persona | Modo inicial | Pagina inicial ideal | O que ve primeiro | CTA primario | CTAs secundarios | O que nao deve ver | Permissoes criticas |
|---|---|---|---|---|---|---|---|
| Jogador puro | Jogador | `/inicio` | proxima acao pessoal | Reservar/Jogar/Competir | Agenda, Perfil | gestao, equipe, financeiro local | autenticado |
| Aluno | Jogador | `/inicio` + `/minhas-aulas` | proxima aula e mensalidade | Ver aula/Pedir reposicao | Pagar, Historico | gestao de turma | matricula/aluno |
| Socio/reservas | Jogador | `/inicio` + `/minhas-reservas` | plano e proxima reserva | Reservar | Ver plano, Pagamentos | financeiro local | membership/reserva |
| Jogador competitivo | Jogador | `/inicio` + `/eventos` | proxima partida | Abrir jogo/Informar resultado | Chat, Classificacao | organizacao | participante |
| Organizador | Trabalho | Hub de competicoes | eventos com bloqueio | Resolver bloqueio | Criar, Publicar | descoberta como foco | owner/organizer/staff |
| Professor autonomo | Trabalho | Professor Hoje | aulas/agendamentos | Abrir aula | Agenda, Alunos | ERP de clube | entitlement/professor |
| Professor academia | Trabalho | Professor Hoje | aulas atribuidas | Fazer chamada | Turmas, Reposicoes | financeiro, cantina, ajustes | `coach` |
| Recepcao | Trabalho | Atendimento Hoje | reservas e espera | Criar reserva | Clientes, Aulas pendentes | ajustes/equipe | `frontdesk` |
| Financeiro | Trabalho | Financeiro | recebiveis | Marcar pago/Cobrar | Pagos, Despesas, Resumo | aulas/cantina como foco | `finance` |
| Caixa | Trabalho | Cantina | venda rapida | Finalizar venda | Estoque, Vendas hoje | financeiro amplo | `cashier` |
| Gestor | Trabalho | Trabalho Hoje | pendencias consolidadas | Resolver pendencia | Workspaces, Relatorios | lista sem prioridade | owner/manager |
| Multi-papel | Ultimo modo | modo ativo | tarefa do modo | contextual | alternar modo | mistura de papeis | combinadas |

## Screen States And Empty States

Regra geral:

- estado vazio deve explicar por que a tela esta vazia e qual proximo passo faz sentido;
- sem permissao deve dizer o que falta sem expor funcao proibida como promessa clicavel;
- plano bloqueado deve explicar o bloqueio e direcionar para o responsavel;
- setup incompleto deve aparecer como bloqueio acionavel apenas quando impede operacao.

| Area | Normal | Vazio correto | Sem permissao | Setup/plano bloqueado | CTA recomendado |
|---|---|---|---|---|---|
| Inicio jogador | proxima acao + atalhos | Voce ainda nao tem compromissos. Reserve, encontre jogo ou entre em uma competicao. | nao aplicavel | perfil incompleto pede completar cadastro | Reservar/Encontrar jogo |
| Agenda jogador | lista por data/tipo | Nenhum compromisso futuro. Quando voce reservar, entrar em aula ou jogar torneio, aparece aqui. | nao aplicavel | pagamento pendente destacado | Explorar horarios |
| Minhas aulas | aulas, reposicoes, historico | Voce ainda nao tem aulas vinculadas. Quando uma turma for confirmada, ela aparece com horario, quadra e professor. | area indisponivel para este usuario | matricula inativa ou mensalidade pendente | Ver academias |
| Minhas reservas | reservas futuras/passadas | Nenhuma reserva ativa. Escolha um local para reservar quadra. | nao aplicavel | plano vencido quando houver | Reservar quadra |
| Meus pagamentos | mensalidades/pacotes pessoais | Nenhum pagamento pessoal encontrado. Mensalidades e pacotes aparecem aqui quando vinculados ao seu cadastro. | nao aplicavel | pagamento vencido com status claro | Ver detalhes |
| Eventos | jogando/descobrir/organizando | Nenhuma competicao encontrada para os filtros. Ajuste filtros ou explore torneios abertos. | sem trabalho nao mostra organizar | criar competicao bloqueado por plano | Explorar competicoes |
| Torneio jogador | status pessoal e jogos | Este torneio ainda nao publicou jogos. Acompanhe inscricoes e comunicados. | ferramentas admin ocultas | inscricao encerrada ou pendente | Inscrever/Ver jogos |
| Torneio organizador | cockpit por fase | Este torneio ainda nao tem classes/inscritos. Complete a configuracao inicial. | redireciona para aba permitida | publicar bloqueado por dados minimos | Resolver bloqueio |
| Liga jogador | rodada/classificacao/chat | Voce ainda nao tem rodada ativa nesta liga. Acompanhe a classificacao e avisos. | configuracao oculta | inscricao pendente | Ver liga |
| Liga owner | operacao da rodada | Nenhuma rodada ativa. Configure participantes e gere a primeira rodada. | owner-only | regras incompletas | Gerar rodada |
| Trabalho Hoje | fila por papel | Nenhuma pendencia critica agora. Use os workspaces para acompanhar rotina. | nao mostra modulos proibidos | setup do local se impeditivo | Abrir workspace |
| Agenda local | reservas/agenda | Nenhuma reserva para hoje. Crie uma reserva ou confira calendario. | sem bookings nao abre | cadastrar quadra primeiro | Nova reserva |
| Aulas/Academia | aulas/turmas/alunos | Nenhuma aula ativa. Cadastre turma, professor e grade. | professor ve apenas atribuidas | falta professor/quadra | Criar turma |
| Clientes | contatos/socios/leads | Nenhum contato em acompanhamento. Cadastre ou importe clientes quando necessario. | frontdesk ve rotina, nao ajustes | plano CRM se houver | Novo cliente |
| Financeiro | recebiveis/pagos/despesas | Nenhum recebivel pendente. Pagamentos de reservas, aulas e planos aparecem aqui. | bloqueado para nao financeiro | plano financeiro se houver | Registrar recebimento |
| Cantina | venda/estoque | Nenhum produto cadastrado. Cadastre produtos para vender pelo caixa. | somente caixa/gestor | estoque inicial | Cadastrar produto |
| Equipe | staff/convites/papeis | Nenhum membro alem do dono. Convide equipe quando for delegar operacao. | owner/manager | plano/equipe bloqueado | Convidar pessoa |
| Ajustes | publicacao/regras/recursos | Nenhuma configuracao pendente. Ajustes raros ficam aqui. | owner/manager | setup incompleto | Abrir setup |

## Competition Lifecycle Architecture

Pergunta central:

```text
Quando o usuario abre esta competicao nesta fase, o que ele provavelmente precisa resolver agora?
```

### Torneio

| Fase | Foco da pagina | Primeira dobra | CTA primario | Abas prioritarias | Secundarias | Esconder | Bloqueios | Proxima fase |
|---|---|---|---|---|---|---|---|---|
| Rascunho | configurar base | checklist de dados minimos | Completar configuracao | Configuracao, Classes | Equipe | jogos, resultados, podio | sem classes, regras, datas | Inscricoes abertas |
| Inscricoes abertas | captar e validar inscritos | inscritos, pagamentos, link publico | Revisar inscritos/Publicar link | Inscricoes, Publicacao | Comunicacao, Configuracao | sorteio como foco | pagamento pendente, classe vazia | Inscricoes encerradas |
| Inscricoes encerradas | preparar jogos | classes prontas e pendencias | Gerar jogos | Inscricoes, Sorteio, Agenda | Publicacao | inscricao nova como foco | inscritos impares, dados faltantes | Sorteio/jogos gerados |
| Sorteio/geracao | validar chaves/grupos | classes geradas e conflitos | Publicar jogos | Partidas, Agenda | Classificacao | setup raro | quadra/horario sem alocar | Em andamento |
| Em andamento | operar partidas | pendencias de resultado e atrasos | Lancar resultado | Partidas, Agenda, Chat | Classificacao, Publicacao | reset/backup na rotina | resultado pendente, WO, conflito | Finalizado |
| Finalizado | consolidar entrega | campeoes, podio, relatorio | Publicar resultado final | Relatorio, Podio | Exportar, Publicacao | edicao comum de inscricao | resultado sem validar | Historico |

Por papel:

- `owner`: ve tudo, incluindo configuracao e avancado.
- `organizer`: ve operacao ampla conforme permissao atual.
- `checkin`: entra em inscricoes/jogadores, credenciamento e pendencias de entrada.
- `scorekeeper`: entra em partidas/resultados.
- `media`: entra em publicacao/comunicacao.
- jogador: entra em resumo pessoal, jogos e classificacao.

### Liga

| Fase | Foco | Primeira dobra | CTA primario | Prioridade | Esconder |
|---|---|---|---|---|---|
| Configuracao inicial | regras e estrutura | checklist de regras/classes | Completar regras | Configuracao | chat/rodada sem dados |
| Inscricoes/participantes | aprovar e organizar lista | participantes e pendencias | Aprovar participante | Jogadores | ranking final |
| Rodada ativa | operar jogos da rodada | jogos, horarios, resultados | Resolver resultado | Rodadas/Partidas | configuracao como foco |
| Entre rodadas | validar e gerar proxima | pendencias e classificacao provisoria | Gerar proxima rodada | Classificacao/Rodadas | inscricao publica como foco |
| Encerramento | fechar temporada | ranking final e pendencias | Encerrar liga | Relatorio/Classificacao | edicao rotineira |
| Historico | consulta | temporadas e resultados | Ver temporada | Historico | acoes operacionais |

## Route Mapping And Migration Safety

| Rota atual | Uso atual | Problema | Superficie futura | Manter rota? | Alias/redirect | Permissoes | CTA primario | Risco |
|---|---|---|---|---|---|---|---|---|
| `/inicio` | home jogador e proximas acoes | pode acumular trabalho | Inicio jogador | sim | nao | autenticado | proxima acao | misturar trabalho |
| `/eventos` | hub competicoes | mistura jogador e organizador | Competir jogador + entrada trabalho | sim | futuro `/competir` opcional | autenticado | explorar/ver meus eventos | confundir descoberta com operacao |
| `/eventos/torneios` | lista torneios | ok, mas organizacao compete | Torneios jogador | sim | nao | autenticado | abrir torneio | esconder staff |
| `/eventos/ligas` | lista ligas | ok, mas owner precisa cockpit | Ligas jogador | sim | nao | autenticado | abrir liga | owner sem area clara |
| `/eventos/ligas/:leagueId` | detalhe liga | tabs mistas | Liga jogador/owner por modo | sim | query/tab preservada | owner/participant | rodada atual | quebrar config owner |
| `/eventos/:tournamentId/jogos` | jogos | jogador e scorekeeper | Partidas | sim | futuro `/partidas` opcional | participante/staff | abrir jogo/lancar resultado | perder link publico |
| `/eventos/:tournamentId/classificacao` | classificacao | ok | Classificacao | sim | nao | publico conforme regra | ver ranking | estado vazio ruim |
| `/eventos/:tournamentId/organizacao` | central admin | mistura tudo | Torneio Operacional | sim | futuro `/operacao` como alias | owner/organizer por caps | resolver bloqueio | pagina longa |
| `/eventos/:tournamentId/jogadores` | inscritos/jogadores | bom para checkin | Inscricoes/Jogadores | sim | futuro `/inscricoes` | owner/organizer/checkin | revisar inscrito | expor admin |
| `/eventos/:tournamentId/chat` | chat/comunicacao | papel misto | Comunicacao/Chat | sim | nao | canManageComms/participant | enviar aviso | media sem atalho |
| `/inscricao/:tournamentId` | inscricao publica | link externo | Inscricao | sim | nao | publico/autenticado | inscrever | quebrar link |
| `/join/:tournamentId` | convite/link | link externo | Join | sim | nao | publico/autenticado | entrar | quebrar link |
| `/t/:tournamentId` | legado | redirect | Legacy | sim | manter redirect | publico | abrir torneio | SEO/link antigo |
| `/minhas-reservas` | reservas pessoais | separado da agenda | Agenda > Reservas | sim | futuro `/agenda?tipo=reservas` | jogador | ver/cancelar | esconder reserva |
| `/minhas-partidas` | partidas pessoais | separado da agenda | Agenda > Partidas | sim | futuro `/agenda?tipo=partidas` | jogador | abrir partida | perder competicao |
| `/minhas-aulas` | aulas pessoais | precisa fortalecer | Agenda/Aulas pessoais | sim | futuro `/agenda?tipo=aulas` | aluno | ver aula | confundir com professor |
| `/meus-pagamentos` | pagamentos pessoais | nao misturar financeiro local | Pagamentos pessoais | sim | dentro de Agenda apenas como resumo | usuario | pagar/ver | sumir mensalidade |
| `/locais` | locais/publico | ok | Jogar/Locais | sim | futuro `/jogar` opcional | autenticado | reservar/ver local | rotulo confuso |
| `/locais/:placeId` | local publico | tambem reserva/aula | Local publico | sim | nao | publico/autenticado | reservar/entrar aula | misturar admin |
| `/perfil` | conta/perfil | risco de deposito | Perfil | sim | nao | autenticado | editar conta | virar segunda home |
| `/ranking` | ranking | ok | Ranking/Esporte | sim | pode entrar em Competir | autenticado | ver ranking | perder acesso |
| `/gestao` | hub trabalho | mistura convites/locais/competicoes | Trabalho Hoje | sim | nao | staff/owner | resolver pendencia | continuar lista infinita |
| `/gestao/:placeId` | gestao local | painel/local | Local Hoje | sim | nao | place access | abrir rotina | excesso de modulos |
| `/gestao/:placeId/:module` | modulo local | subvisoes por query/segmento | Workspace do modulo | sim | manter segmentos | por role | acao do modulo | quebrar bookmarks |
| `/locais/:placeId/admin` | admin legado/local | duplicado com gestao | Redirect/wrapper admin | sim | manter wrapper | place access | abrir gestao | quebrar usuarios antigos |

## Navigation System V3

Principio:

- menu e para destinos recorrentes;
- CTA contextual e para proxima acao;
- configuracao rara fica em `Ajustes`;
- relatorio/historico fica em camada secundaria;
- tarefa diaria nao pode ficar escondida em `Mais`.

### Mobile Jogador

Proposta:

```text
Inicio | Jogar | Competir | Agenda | Perfil
```

Validacao:

- `Jogar`: locais, reserva, encontrar jogo, aulas abertas.
- `Competir`: torneios, ligas, ranking competitivo.
- `Agenda`: reservas, aulas, partidas, pagamentos pessoais.
- `Perfil`: conta, preferencias, historico esportivo resumido.

### Mobile Trabalho

Professor:

```text
Hoje | Agenda | Turmas | Alunos | Perfil
```

Recepcao:

```text
Hoje | Reservas | Clientes | Aulas | Mais
```

Financeiro:

```text
Receber | Pagos | Despesas | Resumo | Perfil
```

Caixa:

```text
Vender | Hoje | Estoque | Produtos | Perfil
```

Organizador:

```text
Hoje | Torneios | Ligas | Publicacao | Perfil
```

Gestor:

```text
Hoje | Agenda | Aulas | Financeiro | Mais
```

Multi-papel:

- manter seletor `Jogador / Trabalho`;
- em `Trabalho`, escolher nav por papel dominante;
- demais papeis aparecem em `Mais` ou em cards de workspace, nao misturados no bottom nav.

### Desktop Trabalho

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
Competicoes
  Torneios
  Ligas
Administracao
  Equipe
  Ajustes
  Relatorios
```

Regra:

- nao mostrar grupo vazio;
- ordenar por permissao e frequencia;
- `Ajustes` e `Equipe` ficam fora da rotina.

## Page Responsibility Contracts

Formato de decisao por pagina:

```text
Pagina:
Usuario primario:
Pergunta:
Primeira dobra:
CTA primario:
Nunca aparece:
Vai para outra pagina:
Mobile:
Desktop:
Permissoes:
```

| Pagina | Usuario primario | Pergunta que responde | Primeira dobra | CTA primario | Nunca aparece | Vai para outra pagina |
|---|---|---|---|---|---|---|
| Inicio | jogador | O que faco agora? | proxima acao + atalhos | acao contextual | gestao detalhada | trabalho, ajustes |
| Jogar/Locais | jogador | Onde jogo/reservo? | busca/filtros e proximos locais | reservar/encontrar | financeiro local | detalhe local |
| Competir/Eventos | jogador competitivo | Onde competir ou ver meus eventos? | jogando + descobrir | abrir evento | backup/config | hub trabalho |
| Agenda jogador | jogador/aluno/socio | O que tenho marcado/pago? | proximos por data | abrir item | recebiveis de terceiros | detalhe tipo |
| Perfil | todos | Quem sou e o que configuro na conta? | identidade e status | editar perfil | operacao diaria | pagamentos/trabalho |
| Trabalho Hoje | staff/gestor | O que precisa ser resolvido agora? | fila por papel | resolver bloqueio | descoberta publica | workspaces |
| Local Hoje | gestor/local | Como esta a operacao do local hoje? | pendencias e agenda | abrir maior pendencia | setup raro como card comum | ajustes |
| Agenda local | recepcao/gestor | O que acontece nas quadras? | hoje/calendario | nova reserva | chamada de aula como foco | aulas |
| Aulas | professor/gestor | Quais aulas/turmas/alunos precisam de acao? | aulas hoje ou pendencias | abrir aula/turma | financeiro geral | financeiro, ajustes |
| Clientes | recepcao/gestor | Quem precisa de atendimento? | contatos e pendencias | abrir cliente | estoque/cantina | financeiro quando for cobranca |
| Financeiro | financeiro/gestor | Quem precisa pagar e o que entrou? | recebiveis | cobrar/marcar pago | aula como tarefa | detalhe aluno/cliente |
| Cantina | caixa/gestor | Como vender e controlar estoque? | venda rapida | finalizar venda | recebiveis amplos | financeiro resumo |
| Equipe | gestor | Quem opera o local? | membros/convites | convidar | rotina diaria | trabalho hoje |
| Ajustes | gestor | Como configuro regras/recursos? | categorias de setup | abrir categoria | tarefas diarias | workspaces |
| Torneio jogador | participante | Qual minha situacao no torneio? | status pessoal | abrir jogo/inscrever | admin | torneio operacional |
| Torneio organizador | staff | Qual bloqueio da fase? | cockpit da fase | resolver bloqueio | conteudo publico como foco | publicacao/config |
| Liga jogador | participante | Qual minha rodada/classificacao? | rodada atual | abrir partida | configuracao | liga owner |
| Liga owner | owner | O que falta na rodada/temporada? | pendencias | gerar/validar rodada | descoberta | config/relatorio |
| Hub competicoes trabalho | organizador/gestor | Quais competicoes precisam de acao? | filas por fase | abrir pendencia | eventos publicos como foco | torneio/liga |
| Professor workspace | professor | Que aulas dou hoje? | aulas do dia | fazer chamada | financeiro/cantina | turmas/alunos |
| Recepcao workspace | recepcao | O que atender agora? | reservas, espera, clientes | criar/confirmar | ajustes/equipe | agenda/clientes |

## Implementation Guardrails

1. Nao remover rota existente sem alias ou redirect.
2. Nao relaxar permissoes para simplificar menu.
3. Nao duplicar backend.
4. Nao duplicar loaders.
5. Nao criar ERP generico.
6. Nao esconder tarefa diaria dentro de `Mais`.
7. Nao colocar setup raro na rotina diaria.
8. Nao misturar financeiro pessoal com financeiro do local.
9. Nao misturar jogador e trabalho sem fronteira visual clara.
10. Nao mostrar modulos vazios ou proibidos para uma persona.
11. Nao criar pagina nova se wrapper/composicao resolver.
12. Nao mudar nomenclatura sem atualizar labels, breadcrumbs, empty states e CTAs.
13. Nao seguir MD antigo quando ele apontar para produto fora do ATP atual.
14. Nao melhorar um papel quebrando outro.
15. Nao fazer sprint visual sem screenshot mobile e desktop.

## Execution Queue V3

### FLOW-00A

Nome: Matriz de gaps, rotas, permissoes e CTAs.

Objetivo: transformar estudo e playbook em inventario executavel.

Arquivos provaveis: docs, `src/App.tsx`, navegacao, paginas principais.

O que alterar: docs e matriz; nao alterar UI ainda.

O que nao alterar: backend, rotas reais, permissoes.

Permissoes envolvidas: todas.

Rotas envolvidas: todas as rotas primarias.

Criterios de aceite: cada rota tem superficie, persona, CTA, permissao, risco e alias.

QA obrigatorio: revisao documental + busca no codigo.

Risco: matriz abstrata demais.

Rollback: remover playbook/matriz sem impacto em app.

### FLOW-00

Nome: IA final e contratos de pagina.

Objetivo: congelar nomes, responsabilidades e estados antes do codigo.

Arquivos provaveis: docs, navegacao, labels.

O que alterar: contratos e labels planejados.

O que nao alterar: layout ainda.

Criterios de aceite: toda pagina importante responde quem usa, pergunta, primeira dobra e CTA.

### FLOW-01

Nome: Mapa de rotas e aliases.

Objetivo: preservar URLs enquanto cria superficies alvo.

Arquivos provaveis: `src/App.tsx`, helpers de navegacao.

O que alterar: wrappers/redirects quando aprovados.

O que nao alterar: links publicos sem teste.

QA: testar `/join`, `/t`, inscricao, liga legado, admin legado.

### FLOW-02

Nome: Navegacao principal V3.

Objetivo: alinhar modo Jogador/Trabalho e menus por papel.

Arquivos provaveis: `AppShell`, `BottomNav`, `ManagementShell`, `role-visibility`.

O que alterar: labels, grupos, visibilidade, ordem.

O que nao alterar: permissoes.

QA: mobile 390/430 e desktop.

### FLOW-03

Nome: Trabalho Hoje.

Objetivo: transformar `/gestao` em fila operacional por papel.

Arquivos provaveis: `ManagementHubPage`, workspace access, CSS.

O que alterar: priorizacao e cards.

O que nao alterar: dados de origem.

QA: professor, recepcao, financeiro, caixa, gestor, organizador.

### FLOW-04

Nome: Professor workspace.

Objetivo: dar rotina clara ao professor sem gestao completa.

Arquivos provaveis: `ManagementHubPage`, academy modules.

O que alterar: entrada, cards de aula, chamada, turmas/alunos.

O que nao alterar: `canManageBookings`.

QA: coach-only e manager+coach.

### FLOW-05

Nome: Recepcao workspace.

Objetivo: atendimento rapido de reservas, espera, clientes e aulas pendentes.

Arquivos provaveis: booking modules, clients modules.

O que alterar: composicao e atalhos.

O que nao alterar: ajustes/equipe.

QA: frontdesk-only.

### FLOW-06

Nome: Agenda do jogador.

Objetivo: consolidar reservas, partidas, aulas e pagamentos pessoais.

Arquivos provaveis: `MyReservationsPage`, `MyMatchesPage`, `MyLessonsPage`, `MyPaymentsPage`, nova/wrapper agenda se aprovado.

O que alterar: composicao frontend e links.

O que nao alterar: paginas antigas sem alias.

QA: aluno, socio, competitivo.

### FLOW-07

Nome: Hub de competicoes de trabalho.

Objetivo: separar organizar de descobrir.

Arquivos provaveis: `EventsHubPage`, `EventsPage`, `LeaguesPage`, workspace access.

O que alterar: hub e filas por fase.

O que nao alterar: eventos publicos.

QA: organizador sem local, gestor com local.

### FLOW-08

Nome: Torneio operacional por fase e papel.

Objetivo: quebrar organizacao em cockpit e subareas.

Arquivos provaveis: `TournamentPage`, componentes de organizacao, CSS.

O que alterar: hierarquia, abas, CTA, estados.

O que nao alterar: capacidades `canManageTournament`, `canManagePlayers`, `canManageMatches`, `canManageComms`.

QA: owner, organizer, checkin, scorekeeper, media, participant.

### FLOW-09

Nome: Liga operacional.

Objetivo: separar liga jogador e owner por fase.

Arquivos provaveis: `LeagueDetailsPage`.

O que alterar: tabs, cockpit, rodada, estados.

O que nao alterar: `configuracao` owner-only.

QA: participant e owner.

### FLOW-10

Nome: Ajustes/admin fora da rotina.

Objetivo: mover setup, equipe, permissoes, avancado e destrutivos para camadas raras.

Arquivos provaveis: place settings/team modules, TournamentPage, LeagueDetailsPage.

QA: garantir que rotina diaria nao mostra acoes perigosas.

### FLOW-11

Nome: QA transversal.

Objetivo: validar que nenhum papel melhorou quebrando outro.

Arquivos: scripts de screenshot/auditoria.

QA obrigatorio: screenshots mobile 390/430, desktop 1366/amplo, console e cliques primarios.

## Persona QA Scenarios

| Persona | Contexto | Viewports | Tarefa | Passos esperados | Resultado esperado | Nao pode acontecer |
|---|---|---|---|---|---|---|
| Jogador puro | sem trabalho | 390,430,1366,amplo | reservar quadra | inicio > jogar > local > horario | reserva ou bloqueio claro | ver gestao |
| Aluno | matricula ativa | todos | ver aula e mensalidade | inicio > aula > pagamentos | aula clara e conta pessoal | financeiro local |
| Socio | plano ativo | todos | reservar com plano | inicio > reservar | regras do plano claras | pedir setup admin |
| Competitivo | inscrito | todos | informar resultado | inicio/evento > jogo | resultado salvo/pendente | abrir organizacao |
| Organizador | torneio ativo | todos | resolver pendencia | trabalho > competicoes > evento | cockpit por fase | descoberta como foco |
| Professor | coach-only | todos | fazer chamada | trabalho > hoje > aula | chamada registrada | ver financeiro/cantina |
| Recepcao | frontdesk | todos | criar reserva | trabalho > reservas > nova | reserva criada | ver ajustes estruturais |
| Financeiro | finance | todos | cobrar vencido | trabalho > financeiro | pagamento marcado/cobrado | ver aula/cantina |
| Caixa | cashier | todos | vender item | trabalho > cantina | venda finalizada | ver recebiveis amplos |
| Gestor | owner/manager | todos | resolver operacao | trabalho hoje > pendencia | modulo certo aberto | lista infinita |
| Multi-papel | jogador+gestor | todos | alternar modo | jogador/trabalho | fronteira clara | misturar CTAs |

## How To Think Before Changing Any Screen

Antes de alterar qualquer tela, responder:

1. Quem e o usuario primario desta tela?
2. Qual missao ele esta tentando cumprir?
3. Essa tarefa e diaria, semanal, eventual ou rara?
4. O que precisa aparecer na primeira dobra?
5. Qual e o CTA primario?
6. O que esta competindo indevidamente por atencao?
7. O que e configuracao e deveria sair da rotina?
8. O que e relatorio/historico e deveria ficar em outra camada?
9. O que e comunicacao/publicacao?
10. O que e operacao?
11. Que permissoes controlam isso?
12. Como fica para usuario multi-papel?
13. Como fica no mobile?
14. Como fica no desktop?
15. Qual estado vazio?
16. Qual estado sem permissao?
17. Essa mudanca quebra link, rota publica, convite ou inscricao?
18. Essa mudanca ajuda uma persona prejudicando outra?
19. Existe solucao mais simples usando wrapper/composicao antes de criar rota nova?
20. Como testar com screenshot, console e clique real?

## Definition Of Ready For Code

Uma tarefa so entra em sprint de codigo quando tiver:

- persona primaria definida;
- rota atual e rota alvo definidas;
- permissao envolvida definida;
- CTA primario definido;
- estado vazio e sem permissao definidos;
- comportamento mobile e desktop definido;
- risco de multi-papel avaliado;
- criterio de QA com screenshot e console.

Se faltar qualquer item, a tarefa volta para especificacao.
