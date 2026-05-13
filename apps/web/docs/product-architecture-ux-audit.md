# Auditoria de arquitetura de produto e UX operacional

Data: 2026-05-13

## Objetivo

Esta auditoria olha o produto como sistema operacional para clubes, academias, jogadores e organizadores. O foco nao e cosmetico. O objetivo e reduzir carga cognitiva, separar responsabilidades, tornar fluxos recorrentes mais rapidos e impedir que o crescimento do produto transforme telas em depositos de funcionalidades.

## Documentos vivos derivados

Este arquivo e a fonte de verdade arquitetural. Os documentos abaixo detalham decisoes operacionais e devem ser mantidos junto com qualquer mudanca relevante:

- `ARCHITECTURE_RECALIBRATION.md`: rechecagem de rumo e criterio de prioridade apos as primeiras evolucoes.
- `PRODUCT_ARCHITECTURE.md`: principios, camadas e fronteiras de dominio.
- `SYSTEM_FLOWS.md`: fluxos reais por persona e contexto.
- `SCREEN_RESPONSIBILITIES.md`: responsabilidade primaria de cada tela.
- `NAVIGATION_STRUCTURE.md`: hierarquia de navegacao e regras para mobile/desktop.
- `TECH_DEBT.md`: dividas tecnicas e de UX com impacto operacional.
- `REFACTOR_ROADMAP.md`: sequencia de refatoracao por prioridade.
- `VISUAL_HIERARCHY_MAP.md`: mapa de hierarquia visual e gramatica de componentes.
- `MOBILE_FRICTION_REPORT.md`: pontos de atrito mobile e padroes de correcao.
- `SCREEN_STATE_ANALYSIS.md`: estados obrigatorios de tela e modulo.
- `PERSONAS_OPERACIONAIS.md`: personas, tarefas frequentes e riscos cognitivos.

## Etapa 1 - Mapeamento

### Navegacao principal

O app usa uma navegacao principal curta, com 5 entradas:

- Inicio: central de acao do jogador e resumo operacional.
- Competicoes: hub para torneios e ligas.
- Locais: descoberta de clubes, pagina publica e cockpit de gestao.
- Ranking: ranking geral/cidade/liga.
- Perfil: dados do usuario, atividade e historico.

Essa camada esta correta para mobile-first. O problema nao esta no menu principal; esta na profundidade e densidade dentro de algumas rotas.

### Rotas principais

- `/inicio`: Home operacional.
- `/eventos`: hub de competicoes.
- `/eventos/torneios`: lista/criacao/entrada em torneios.
- `/eventos/ligas`: lista/criacao de ligas.
- `/eventos/ligas/:leagueId`: detalhe da liga.
- `/eventos/ligas/inscricao/:token`: entrada por link.
- `/locais`: descoberta e gestao de locais.
- `/locais/:placeId`: pagina publica do local.
- `/ranking`: ranking competitivo.
- `/perfil`: perfil e historico.
- `/eventos/:tournamentId/:tab`: detalhe do torneio por aba.
- `/inscricao/:tournamentId`: inscricao publica do torneio.

### Entidades centrais

- Usuario/perfil.
- Local/clube/academia.
- Staff e permissoes.
- Quadra.
- Reserva.
- Lista de espera.
- Turma de academia.
- Professor.
- Aluno/matricula.
- Chamada/presenca.
- Falta/reposicao.
- Aula avulsa/drop-in.
- Socio/plano.
- CRM contato/interacao/follow-up.
- Pagamento/recebivel/lembrete.
- Pacote/credito/pass.
- Produto/venda/despesa de cantina.
- Torneio.
- Classe/categoria.
- Jogador inscrito.
- Partida/chave/resultado.
- Confirmacao de presenca.
- Agenda de partidas.
- Liga/temporada/rodada/classe.
- Ranking.
- Chat/comentarios.

### Cockpit de Locais

`/locais` e hoje um app administrativo completo dentro de uma rota. O cockpit tem 8 modulos:

- Painel.
- Agenda.
- Academia.
- Clientes.
- Financeiro.
- Cantina.
- Equipe.
- Ajustes.

Cada modulo possui subvisoes:

- Agenda: Hoje, Reservas, Calendario, Nova reserva, Espera, Quadras.
- Academia: Hoje, Turmas, Alunos, Pendencias, Professores, Recursos.
- Clientes: Resumo, Socios, Leads, Rotina, Pendencias.
- Financeiro: Resumo, Recebiveis, Pacotes, Despesas.
- Cantina: Hoje, Venda, Estoque, Produtos.
- Equipe: Resumo, Equipe, Convites, Papeis.
- Ajustes: Resumo, Setup, Plano, Estrutura.

Esse desenho modular e bom, mas a implementacao ainda concentra dados, regras, formularios e renderizacao em uma unica pagina muito grande.

### Competicoes

O hub de competicoes separa torneios e ligas. A estrutura faz sentido, mas os detalhes ainda seguem padroes diferentes:

- Torneio: Jogos, Classificacao, Organizacao, Jogadores, Chat.
- Liga: Visao/Classificacao, Jogadores, Partidas, Chat.

As duas entidades compartilham conceitos parecidos: participantes, calendario, resultado, ranking/classificacao, chat, publicacao e operacao. A experiencia ainda nao parece uma familia unica de produtos.

### Tamanho e concentracao de arquivos

Arquivos mais criticos por tamanho:

- `PlacesPage.tsx`: cerca de 372 KB.
- `TournamentPage.tsx`: cerca de 262 KB.
- `LeagueDetailsPage.tsx`: cerca de 102 KB.
- `places.ts`: cerca de 93 KB.
- `HomePage.tsx`: cerca de 77 KB.

Isso e um sinal forte de acoplamento entre:

- carregamento de dados,
- regra de negocio,
- estado de formularios,
- renderizacao,
- autorizacao,
- derivacoes de metricas,
- e fluxos operacionais.

## Etapa 2 - Diagnostico

### Problema 1 - `PlacesPage` virou um monolito operacional

Gravidade: critica.
Impacto operacional: alto.
Frequencia: diaria para gestores.
Impacto em conversao/uso: alto.

O modulo de locais tenta resolver descoberta publica, gestao de agenda, academia, financeiro, CRM, cantina, equipe, ajustes, partidas abertas e experiencia do jogador dentro de uma unica pagina.

O cockpit por modulos melhorou a superficie, mas o arquivo ainda mistura todos os contextos. Isso aumenta risco de regressao e torna dificil criar fluxos mais especializados.

Sintomas:

- muitas derivacoes por local dentro do mesmo bloco;
- formularios longos renderizados na mesma arvore;
- fallback legado ainda aparece em alguns modulos;
- a mesma entidade aparece em mais de uma area: cliente no CRM, socio no financeiro, aluno na academia;
- acoes semelhantes existem em lugares diferentes: lembrar pagamento em Financeiro e tambem em Clientes/Rotina.

### Problema 2 - Torneio e liga usam modelos mentais diferentes demais

Gravidade: alta.
Impacto operacional: alto.
Frequencia: alta durante eventos.
Impacto em conversao/uso: medio-alto.

Torneio ganhou bons recursos de classe, agenda, podium, publicacao e presenca. Liga tem classificacao, temporada, rodada, sala da partida e ranking. Mas a experiencia de organizador ainda muda bastante entre os dois.

O usuario precisa reaprender:

- onde configurar;
- onde publicar;
- onde ver pendencias;
- onde resolver resultado;
- onde falar com jogadores;
- onde acompanhar ranking/classificacao.

### Problema 3 - Home esta virando uma central generica demais

Gravidade: media-alta.
Impacto operacional: medio.
Frequencia: diaria.
Impacto em conversao/uso: alto para jogador.

A Home agora orienta bem por acao, mas ja acumula:

- hero do dia;
- acoes rapidas;
- notificacoes;
- resumo;
- Central do Jogador;
- agenda;
- prioridades;
- feed;
- minhas competicoes;
- organizacao;
- proximos eventos publicos.

Ela funciona como central, mas corre risco de virar uma nova pagina longa. A decisao de manter a Central do Jogador na Home e boa para primeira versao, mas ela deve evoluir para hub com secoes recolhiveis ou subrota dedicada quando pagamentos/historico crescerem.

### Problema 4 - Fluxos frequentes ainda exigem varrer tela

Gravidade: alta.
Impacto operacional: alto.
Frequencia: diaria.
Impacto em conversao/uso: alto.

Fluxos frequentes:

- confirmar reserva;
- promover lista de espera;
- registrar pagamento;
- lembrar inadimplente;
- registrar presenca/falta;
- consumir credito;
- responder lead;
- confirmar jogador em torneio;
- lancar resultado;
- compartilhar agenda/chave.

Muitos ja existem, mas nem sempre estao no primeiro nivel de contexto. Em sistemas operacionais, o usuario nao deveria procurar uma funcao; a fila do dia deveria trazer a funcao.

### Problema 5 - Excesso de listas operacionais parecidas

Gravidade: media.
Impacto operacional: medio-alto.
Frequencia: alta.
Impacto em conversao/uso: medio.

Ha varias listas com row/card parecidos:

- reservas;
- recebiveis;
- alunos;
- leads;
- socios;
- vendas;
- despesas;
- partidas;
- inscricoes.

Isso nao e ruim por si so, mas falta uma gramatica unica de acao:

- status sempre no mesmo lugar;
- acao primaria sempre em destaque;
- acoes secundarias agrupadas;
- historico em drawer/accordion;
- filtros persistentes.

### Problema 6 - Mobile sofre mais com profundidade do que com estilo

Gravidade: alta.
Impacto operacional: alto.
Frequencia: alta.
Impacto em conversao/uso: alto.

O app esta mais bonito, mas mobile ainda tende a empilhar cards, formularios e listas. O problema principal e de arquitetura:

- modulos complexos dentro de uma rota;
- muita informacao simultanea;
- subvisoes horizontais;
- cards com muitas acoes;
- formularios inline longos.

Mobile precisa de mais fluxos guiados: wizard, drawer, action sheet e telas focadas por tarefa.

### Problema 7 - Configuracao, operacao e relatorio aparecem juntos demais

Gravidade: alta.
Impacto operacional: alto.
Frequencia: media-alta.
Impacto em conversao/uso: medio.

Exemplos:

- Agenda mistura recursos, regras, criacao, reservas, calendario, espera.
- Academia mistura turmas, alunos, chamada, pendencias, professores, recursos.
- Financeiro mistura recebiveis, pacotes, despesas, saude de credito, planos.
- Torneio mistura painel, publicacao, chave, operacao e configuracao.

Separar por subvisao ajuda, mas o usuario ainda percebe uma densidade grande se cada subvisao carregar muitos cards.

## Etapa 3 - Otimizacao estrutural

### Principio 1 - Separar "operar hoje" de "configurar sistema"

Cada modulo deveria ter duas camadas:

- Rotina: fila do dia, pendencias, proximas acoes.
- Configuracao: regras, recursos, planos, estrutura.

Exemplo para Agenda:

- Rotina: Hoje, Pendentes, Espera.
- Planejamento: Calendario.
- Criacao: Nova reserva.
- Configuracao: Quadras e regras.

Exemplo para Torneio:

- Operacao: partidas pendentes, presenca, resultado, agenda.
- Publicacao: chave, arte, WhatsApp, link.
- Setup: classes, categorias, jogadores, staff, agenda base.
- Encerramento: podium, bloqueios, ranking/exportacoes.

### Principio 2 - Criar "fila de trabalho" como padrao

Toda area operacional deveria abrir com uma fila priorizada:

- o que precisa ser feito agora;
- quem e afetado;
- qual acao primaria resolve;
- qual modulo sera aberto se precisar aprofundar.

Isso reduz muito a carga cognitiva. O gestor nao entra para "navegar"; entra para "resolver".

### Principio 3 - Usar drawers para detalhe e historico

Listas operacionais devem mostrar pouco:

- nome;
- status;
- contexto;
- proxima acao.

Detalhes como historico de interacoes, anotacoes, pagamentos anteriores, comentarios e dados completos devem abrir em drawer ou accordion. Hoje parte disso fica inline, aumentando altura e ruido.

### Principio 4 - Wizards para criacao complexa

Criacao de local, torneio, liga, turma, pacote e regras de reserva pedem wizards.

Nao por moda, mas porque cada uma tem dependencias:

- criar local precisa plano, estrutura, quadras, regras;
- criar torneio precisa dados, classes, inscricao, agenda;
- criar liga precisa temporada, classes, rodadas, regras;
- criar pacote precisa tipo, quantidade, validade, preco, comprador.

Um formulario unico aumenta erro e abandono.

### Principio 5 - Tornar "publicacao" uma area transversal

Locais, torneios, ligas e ranking ja possuem link, WhatsApp, CSV, PNG ou widget. Isso deve virar padrao:

- copiar link;
- compartilhar WhatsApp;
- exportar imagem;
- exportar CSV;
- widget/site quando fizer sentido.

Hoje essas funcoes aparecem em lugares diferentes.

### Principio 6 - Unificar torneio e liga por linguagem operacional

Torneio e liga deveriam compartilhar a mesma gramatica:

- Visao geral.
- Partidas.
- Jogadores.
- Ranking/Classificacao.
- Publicacao.
- Configuracao.
- Chat.

Mesmo que a logica interna seja diferente, o operador precisa reconhecer o mesmo produto.

## Etapa 4 - Priorizacao

### Quick wins

1. Criar nomenclatura unica para acoes primarias.
   - "Resolver", "Agendar", "Confirmar", "Lembrar", "Publicar", "Exportar".
   - Impacto: reduz hesitacao.

2. Padronizar cards de fila operacional.
   - Um componente para pendencia com status, contexto e acao primaria.
   - Impacto: melhora todos os modulos sem refatorar backend.

3. Agrupar acoes secundarias em menu/accordion.
   - Exemplo: em cards de CRM, pagamento, reserva e partida.
   - Impacto: mobile mais limpo.

4. Criar "Resumo da rotina" fixo em cada modulo.
   - Hoje, Pendentes, Em risco, Concluidos.
   - Impacto: usuario entende o estado antes da lista.

5. Remover duplicidade visual de blocos legado quando workspace novo esta ativo.
   - Impacto: reduz comprimento de `PlacesPage` renderizado e confusao.

### Medio impacto

1. Extrair `PlacesPage` em containers por modulo.
   - `PlaceBookingsModule`.
   - `PlaceAcademyModule`.
   - `PlaceClientsModule`.
   - `PlaceFinanceModule`.
   - `PlaceCanteenModule`.
   - `PlaceTeamModule`.
   - `PlaceSettingsModule`.
   - Impacto: diminui risco, acelera evolucao e permite UX propria por modulo.

2. Criar hooks por dominio.
   - `usePlaceResources`.
   - `usePlaceBookingState`.
   - `usePlaceAcademyState`.
   - `usePlaceFinanceState`.
   - `usePlaceCrmState`.
   - Impacto: tira regra de negocio do JSX.

3. Criar rota dedicada para gestao de local.
   - `/locais/:placeId/admin`.
   - `/locais/:placeId/admin/agenda`.
   - `/locais/:placeId/admin/academia`.
   - A rota `/locais` fica descoberta/lista.
   - Impacto: separa comprador/jogador de gestor.

4. Unificar experiencia de competicoes.
   - Um shell comum para torneio e liga.
   - Fila operacional comum.
   - Publicacao comum.
   - Impacto: menos reaprendizado.

5. Transformar criacao em wizards.
   - Criar torneio.
   - Criar liga.
   - Criar local.
   - Criar pacote/regra.
   - Impacto: reduz erro e aumenta conclusao.

### Reestruturacao profunda

1. Criar arquitetura por dominios.
   - `domains/places`.
   - `domains/tournaments`.
   - `domains/leagues`.
   - `domains/player`.
   - `domains/finance`.

2. Criar command center real.
   - Home para jogador.
   - Cockpit para gestor.
   - Cada persona ve fila e contexto proprio.

3. Criar motor de tarefas.
   - Pendencias de reserva, pagamento, CRM, academia, torneio e liga viram objetos de tarefa.
   - Cada tarefa tem: entidade, prioridade, prazo, acao primaria, destino.

4. Criar design system operacional.
   - `OperationalQueue`.
   - `EntityDrawer`.
   - `ActionBar`.
   - `MetricStrip`.
   - `PublishingKit`.
   - `WizardStep`.

5. Criar observabilidade de UX.
   - Logar eventos de funil: criar reserva, confirmar pagamento, registrar resultado, criar torneio, publicar evento.
   - Impacto: decisoes futuras deixam de depender so de percepcao.

## Etapa 5 - Execucao proposta

### Fase 1 - Reduzir confusao sem mexer no modelo de dados

1. Criar componente `OperationalQueue`.
   - Problema resolvido: cada modulo mostra pendencias de forma diferente.
   - Impacto: usuario identifica rapidamente o que fazer.

2. Aplicar `OperationalQueue` em:
   - Painel do local.
   - Agenda.
   - Academia.
   - Clientes.
   - Financeiro.
   - Torneio.
   - Liga.

3. Criar componente `EntityActionRow`.
   - Problema resolvido: listas com layouts diferentes e acoes desalinhadas.
   - Impacto: leitura mais rapida em desktop e mobile.

4. Mover detalhes longos para accordions/drawers.
   - CRM historico.
   - aluno/evolucao.
   - pagamento/lembretes.
   - partida/chat/resultado.
   - Impacto: menos scroll e menos ruido.

### Fase 2 - Modularizar Locais

1. Extrair `PlaceAdminShell`.
   - Mantem o cockpit.
   - Recebe `place`, `access`, `resources`.

2. Extrair um modulo por area:
   - Agenda.
   - Academia.
   - Clientes.
   - Financeiro.
   - Cantina.
   - Equipe.
   - Ajustes.

3. Remover blocos legados duplicados apos confirmar equivalencia funcional.
   - Problema resolvido: pagina renderiza novo workspace e fallback antigo.
   - Impacto: menos codigo, menos bugs, menos scroll.

### Fase 3 - Reestruturar competicoes

1. Criar `CompetitionShell`.
   - Titulo, status, proxima acao, publicacao, tabs.

2. Criar linguagem comum:
   - Operacao.
   - Partidas.
   - Participantes.
   - Classificacao/Ranking.
   - Publicacao.
   - Configuracao.
   - Chat.

3. Aplicar primeiro em Liga, porque hoje ela esta menos polida que Torneio.

### Fase 4 - Criar fluxos guiados

1. Wizard de criar torneio.
   - Dados.
   - Categorias/classes.
   - Inscricao.
   - Agenda.
   - Publicacao.

2. Wizard de criar local.
   - Plano.
   - Dados publicos.
   - Quadras.
   - Regras.
   - Equipe.

3. Wizard de criar liga.
   - Dados.
   - Temporada.
   - Classes.
   - Rodadas.
   - Convite/publicacao.

### Wireframes textuais

#### Cockpit do local

```
Topo: Nome do local | status setup | abrir pagina publica

Fila de hoje:
- Reserva pendente | Joao | Confirmar
- Mensalidade aberta | Maria | Lembrar
- Lead sem retorno | Pedro | Contatar

Modulos:
[Agenda] [Academia] [Clientes] [Financeiro] [Cantina] [Equipe] [Ajustes]

Modulo ativo:
Resumo curto
Fila do modulo
Lista principal
Drawer de detalhe ao clicar
```

#### Agenda

```
Hoje
- Proximas reservas
- Pendentes
- Lista de espera

Planejar
- Calendario
- Bloqueios

Criar
- Nova reserva

Configurar
- Quadras
- Regras por horario/perfil
```

#### Torneio

```
Topo: Classe ativa | status | proxima acao

Operacao
- Minhas partidas
- Pendencias do organizador
- Agenda por quadra

Chave
- Grupo / mata-mata
- Resultado

Publicacao
- Link
- WhatsApp
- Arte PNG
- Podio

Configuracao
- Classes
- Jogadores
- Equipe
- Agenda base
```

## Conclusao critica

O produto nao esta "ruim"; ele esta entrando na fase tipica de SaaS que cresceu rapido e ficou feature-heavy. A base funcional e rica, mas o proximo salto nao vira de adicionar mais ferramentas. Vira de transformar ferramentas em rotinas claras.

Prioridade real:

1. Reduzir densidade operacional.
2. Extrair modulos grandes.
3. Padronizar filas e linhas de acao.
4. Separar gestao de local da descoberta de locais.
5. Unificar torneio e liga por linguagem de competicao.
6. Transformar criacoes complexas em wizards.

O app deve parar de perguntar "em qual tela esta a funcao?" e passar a responder "qual e a proxima acao certa agora?".
