# Architecture Recalibration

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Veredito

Estamos no caminho certo, mas a execucao precisa mudar de ritmo.

O trabalho recente reduziu risco em `PlacesPage` e criou fronteiras melhores em Agenda, Academia, Clientes, Financeiro e Cantina. Isso atende ao principio de separar responsabilidades. Porem, se continuarmos apenas extraindo JSX para componentes, o produto pode ficar tecnicamente mais organizado sem ficar operacionalmente mais simples.

O objetivo original nao era "quebrar arquivos". Era transformar o app em um sistema operacional esportivo guiado por tarefa, contexto, prioridade e baixa carga cognitiva.

## O Que Foi Correto

- Separar Agenda/Reservas em modulos de operacao, criacao, calendario, recursos e historico.
- Separar Academia por rotina do dia, turmas, alunos, pendencias, professores e recursos.
- Criar gramatica comum com filas operacionais, action bars, metric strips e drawers.
- Atualizar os MDs vivos a cada evolucao relevante.
- Validar com lint/build a cada bloco.

## Onde O Rumo Precisa Ajustar

### 1. Parar de tratar modularizacao como fim

Extrair componente so e bom se:

- reduz decisao do usuario;
- deixa uma tela com responsabilidade clara;
- permite mobile mais focado;
- prepara drawer, wizard, rota ou fila operacional;
- elimina duplicidade real.

Se a extracao apenas move codigo sem melhorar fluxo, ela deve esperar.

### 2. Fechar fluxos completos antes de abrir novas frentes pequenas

Agenda e Academia devem chegar a um estado em que cada modulo tenha:

- operacao diaria;
- criacao;
- configuracao;
- lista/historico;
- estados vazios acionaveis;
- uma acao primaria clara;
- secundarios agrupados ou prontos para drawer/action sheet.

### 3. Iniciar CompetitionShell antes de esgotar Places

`PlacesPage` ainda e critica, mas ja houve ganho suficiente para nao atrasar a segunda maior dor: torneio e liga com modelos mentais diferentes.

Proximo bloco grande deve ser CompetitionShell, apos fechar o minimo restante de Academia.

### 4. Comecar wizards nos formulários que mais geram erro

Nao basta tirar formulario inline para componente. Criacao de local, turma, torneio, liga, pacote e regra precisa virar fluxo por etapas.

Primeiros wizards recomendados:

- criar turma;
- criar torneio;
- criar liga;
- criar regra de reserva;
- criar local.

### 5. Usar os MDs como criterio de parada

Uma area nao esta "pronta" porque virou componente. Esta pronta quando:

- a persona entende a proxima acao em poucos segundos;
- o mobile nao exige varredura longa;
- configuracao nao compete com operacao diaria;
- detalhes nao empurram a acao primaria para baixo;
- o mesmo dado nao aparece em blocos concorrentes sem contexto.

## Reprogramacao De Prioridade

### Agora

Finalizar o minimo de Academia:

- [feito] extrair criacao de turma/horario para `PlaceAcademyClassSetupModule`;
- [feito] extrair encaixes/aula avulsa para `PlaceAcademyFitModule`;
- [parcial] adicionar estados vazios acionaveis nos modulos de Agenda e Academia.

### Em Seguida

Criar base de `CompetitionShell`:

- [iniciado] shell comum para torneio e liga, com cabecalho, escopo, tabs e publicacao convergindo;
- [feito] `CompetitionOperationalQueue`;
- [feito] seletor de recorte ativo antes do resumo;
- [feito] `CompetitionPublishingPanel`;
- [feito] mapa comum de tabs/subvisoes.

### Depois

Wizards e rotas:

- [feito] wizard de criar turma;
- [feito] wizard de criar torneio;
- [feito] wizard de criar liga;
- [feito] rota `/locais/:placeId/admin` ou estrutura equivalente;
- [feito] code splitting inicial por rotas/dominios.

## Regra Para Proximas Implementacoes

Antes de codar, responder:

1. Isto melhora uma jornada real ou so organiza codigo?
2. Qual persona ganha velocidade?
3. Qual acao primaria fica mais clara?
4. Qual mistura de contexto esta sendo removida?
5. Qual sera o proximo passo estrutural habilitado por essa mudanca?

Se a resposta nao for clara, replanejar antes de implementar.

## Evolucao Registrada

- 2026-05-13: a modularizacao de Places voltou a focar em fronteiras de responsabilidade, nao so em JSX. Navegacao administrativa ficou em `place-admin-navigation`/`usePlaceAdminRouteSync` e dados administrativos ficaram em `place-admin-data`.
- 2026-05-13: estado administrativo por local foi isolado em `usePlaceAdminResourceState`, mantendo `PlacesPage` mais proxima de shell e preparando a extracao futura de `PlaceAdminShell`.
- 2026-05-13: a evolucao voltou a tocar fluxo real do cliente com `PlaceCreateWizard`, reduzindo densidade da criacao de local sem remover configuracoes importantes.
