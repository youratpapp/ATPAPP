# Premium UX Visual Language

Fonte principal: `product-architecture-ux-audit.md` e `FRONTEND_UX_REARCHITECTURE.md`.

Data: 2026-05-13

Documentos de execucao:

- `VISUAL_REFERENCE_SYSTEM.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`

## Objetivo

Elevar a percepcao do app de "painel com ferramentas" para "SaaS esportivo premium".

O foco deste documento nao e arquitetura tecnica. O foco e como o produto e sentido:

- clareza;
- fluidez;
- refinamento;
- confianca;
- velocidade percebida;
- densidade profissional;
- identidade esportiva;
- reducao de ruido;
- operacao elegante.

## Diagnostico visual atual

### 1. Card demais, decisao de menos

O app usa cards como solucao padrao para quase tudo. Isso cria uma tela cheia de caixas, bordas e sombras, mas nem sempre cria clareza.

Problemas:

- KPIs com zero ocupam o mesmo espaco de pendencias reais;
- cards de resumo competem com cards de acao;
- varios botoes ficam visualmente equivalentes;
- a interface parece mais "admin template" do que produto desenhado.

Regra nova:

Card so deve existir quando agrupa uma entidade, tarefa ou contexto real. Indicador vazio vira texto discreto ou estado calmo, nao card grande.

### 2. Dashboards ainda falam "dados", nao "decisao"

Um SaaS operacional premium deve abrir com:

```text
O que precisa de acao?
Qual e o risco?
Qual e o proximo passo?
```

Hoje algumas telas ainda abrem com:

```text
Quantos itens existem?
Quais modulos tenho?
Quais cards podemos mostrar?
```

Regra nova:

Dashboard operacional deve priorizar fila e contexto. KPI entra como suporte, nunca como protagonista quando nao ha problema real.

### 3. Hierarquia de acoes ainda e fraca

Ha muitos botoes lado a lado com peso visual parecido.

Regra nova:

- Acao primaria: uma por bloco.
- Acao secundaria: botao neutro ou menu.
- Acao rara: drawer, overflow ou configuracao.
- Link publico/publicacao: nao deve disputar com fila operacional.

### 4. Mobile ainda recebe o desktop empilhado

Problemas:

- muitas secoes verticais;
- cards repetidos;
- grids que viram pilhas;
- formularios grandes no fluxo principal;
- acoes secundarias ocupando area de toque.

Regra nova:

Mobile precisa de "tarefas por tela", nao "pagina completa comprimida".

### 5. Falta identidade visual esportiva premium

O produto nao pode parecer ERP financeiro, nem template administrativo.

Direcao visual:

- limpo, mas com energia esportiva;
- fundos calmos, superficies nitidas;
- verde como acao/sucesso, nao como tema unico;
- tipografia firme e objetiva;
- componentes com pouca sombra e muita intencao;
- status com linguagem unica;
- publicacao com visual mais vibrante que operacao.

## Padroes extraidos de concorrentes

Fontes publicas consultadas:

- Playtomic: https://playtomic.com/ e https://playtomic.com/playtomic-manager/
- Playtomic Academy: https://playtomic.com/academy
- CourtReserve: https://courtreserve.com/features/
- OpenCourt: https://www.getopencourt.com/
- ClubSpark: https://clubspark.com/features
- PlayByPoint: https://www.playbypoint.com/product/ e https://help.playbypoint.com/
- UTR Sports: https://www.utrsports.net/clubs
- MATCHi: https://www.matchi.se/
- PodPlay: https://www.podplay.app/ e https://help.podplay.app/

### Playtomic

O grande padrao e separacao entre player app e manager. O jogador descobre, agenda e paga; o clube configura, publica e opera. Academy mostra que aulas/cursos devem ser publicaveis e pagaveis no app, reduzindo WhatsApp e planilha.

Aplicacao no nosso produto:

- player app simples;
- management OS separado;
- aulas/turmas como produto publicavel;
- botao de reserva/inscricao sempre curto.

### CourtReserve

Padrao: plataforma grande, mas organizada por dominios de negocio: booking, programs, lessons, payments, memberships, POS, communications e roles.

Aplicacao:

- gestao por role;
- financeiro e POS separados da agenda;
- public booking como fluxo leve;
- dashboard nao deve listar tudo, deve orientar area.

### OpenCourt

Padrao: linguagem emocional forte. Eles vendem comunidade, booking em poucos toques e app com identidade do clube. A promessa visual e "simples como app moderno", nao "painel completo".

Aplicacao:

- reduzir cliques nos fluxos de reserva;
- dar mais personalidade a pagina publica do local;
- trazer comunidade/jogos sem confundir com gestao;
- microcopy mais humano e menos administrativo.

### ClubSpark

Padrao: suite modular para clubes, coaches e operadores com website, membership, booking, coaching, payments, competitions, CRM e reports.

Aplicacao:

- separar publicacao/site de operacao;
- membership e CRM precisam conversar, mas nao virar a mesma tela;
- reports ficam depois da rotina.

### PlayByPoint

Padrao: ajuda e produto organizados por dominio operacional: setup, memberships, programs/events, pros/lessons, players/accounts, POS, communications, reports e integrations.

Aplicacao:

- nossos modulos ja fazem sentido, mas precisam de uma camada de tarefas;
- setup deve ser checklist guiado;
- reports/integrations nao devem poluir rotina diaria.

### PodPlay

Padrao: venue/club dashboard para staff com roles e recursos liberados por plano; experiencia player conectada a booking/event/access.

Aplicacao:

- permissions e plan gating precisam aparecer na interface;
- acesso/automacao futura deve ficar como feature premium, nao como confusao atual;
- separar dashboard staff do player app.

### MATCHi e UTR

Padrao: booking/membership/status e competicao/rating como conceitos fortes. O usuario entende rapidamente "reservar", "membro", "evento", "resultado/rating".

Aplicacao:

- status deve ser claro e consistente;
- ranking/competicao precisa ter linguagem propria;
- organizador e jogador nao devem compartilhar a mesma entrada mental.

## Design language

### Principios

1. Menos caixas, mais prioridade.
2. Uma acao primaria por bloco.
3. Fila antes de relatorio.
4. Contexto antes de formulario.
5. Vazio calmo, problema visivel.
6. Mobile resolve tarefa, desktop opera volume.
7. Publico encanta, gestao organiza.
8. Configuracao nunca disputa com rotina.

## Visual hierarchy

### Nivel 1 - Contexto

Usado para:

- nome do local;
- competicao ativa;
- data/rotina;
- papel do usuario.

Visual:

- titulo forte;
- subtitulo curto;
- indicadores compactos;
- sem hero enorme em area operacional.

### Nivel 2 - Proxima acao

Usado para:

- confirmar reserva;
- cobrar cliente;
- lancar resultado;
- marcar presenca;
- responder lead.

Visual:

- bloco ou linha com destaque;
- botao primario claro;
- status visivel;
- detalhe em drawer.

### Nivel 3 - Lista operacional

Usado para volume.

Visual:

- rows densos no desktop;
- cards compactos no mobile;
- acoes secundarias escondidas.

### Nivel 4 - Configuracao e relatorio

Usado quando usuario pede.

Visual:

- tabs/subvisoes;
- tabelas;
- filtros;
- sem competir com fila do dia.

## Spacing e densidade

### Desktop operacional

- header compacto;
- conteudo em largura util, nao espalhado;
- rows de 56 a 72px;
- cards somente para agrupamento real;
- grid maximo de 2 colunas para fluxos diferentes;
- metric strips compactos.

### Mobile

- primeira viewport precisa mostrar contexto + proxima acao;
- evitar hero acima de 160px em gestao;
- cards com 1 acao primaria;
- botoes principais na thumb zone;
- drawers/bottom sheets para detalhe;
- filtros em sheet, nao em linha longa.

## Tipografia

Direcao:

- titulos de operacao menores que landing/publicacao;
- texto operacional objetivo;
- labels com peso consistente;
- evitar caps excessivo;
- evitar tamanhos gigantes em dashboard.

Escala recomendada:

- page title: 28-36 desktop, 24-28 mobile;
- section title: 18-22;
- row title: 14-16;
- metadata: 12-13;
- badges/status: 11-12.

## Cores e status

### Paleta funcional

- Primario: verde esportivo para acao principal.
- Texto: navy/charcoal para confianca.
- Fundo: off-white frio para limpeza.
- Superficie: branco ou cinza muito leve.
- Sucesso: verde claro, reservado para conclusao.
- Atencao: amber para setup/pendencia nao critica.
- Erro: vermelho discreto, so para bloqueio.
- Info: azul para publicacao/comunicado.

Regra:

Nao transformar toda tela em verde. Verde deve guiar acao, nao virar decoracao dominante.

## Action hierarchy

### Primary

Uma por bloco. Exemplo:

- Abrir operacao.
- Confirmar reserva.
- Cobrar agora.
- Lancar resultado.
- Criar turma.

### Secondary

Exemplo:

- Pagina publica.
- Ver detalhes.
- Compartilhar.
- Editar.

### Tertiary/overflow

Exemplo:

- excluir;
- cancelar;
- exportar bruto;
- configuracoes avancadas.

## Estados

### Empty state premium

Nao mostrar card vazio com zero.

Mostrar:

- estado calmo;
- proxima acao;
- valor esperado.

Exemplo:

```text
Operacao em dia
Nenhuma reserva pendente agora. Proxima acao: revisar agenda de hoje.
```

### Loading

Evitar "Carregando..." solto.

Usar skeleton ou bloco contextual:

```text
Preparando sua fila operacional...
```

### Error

Erro precisa dizer:

- o que falhou;
- impacto;
- o que o usuario pode fazer.

## Qualidade de texto e acabamento percebido

Fonte: `PLAYER_POLISH_QA_2026_05_16.md`.

Regra:

- texto visivel para usuario deve estar em portugues natural, com acentos e cedilhas;
- nomes tecnicos, ids, rotas e chaves internas podem continuar sem acento;
- microcopy nao deve expor implementacao, roadmap interno ou linguagem de desenvolvimento;
- labels longos nao devem ficar em caixa alta;
- abreviacoes so entram quando forem universais ou acompanhadas de contexto.

Exemplos:

- `Inscricoes` na UI vira `Inscrições`;
- `Nao posso jogar` vira `Não posso jogar`;
- `Classificacao` vira `Classificação`;
- `Preferencias salvas para futura engine...` nao deve aparecer para usuario final.

Estados sem dado:

- nao renderizar retangulo vazio onde deveria haver imagem;
- usar icone/fallback visual pequeno e consistente;
- empty state grande so existe quando guia uma acao;
- `Carregando...` cru nao deve ser estado principal de uma tela.

Hierarquia de acoes:

- botao verde preenchido e reservado para acao primaria;
- seguir, copiar, ver detalhes e acoes opcionais usam outline/ghost;
- acao destrutiva deve ser separada visualmente e confirmada;
- mobile deve respeitar area minima de toque de 44px.

## Tela por tela

### Gestao

Problema atual:

- ainda parece dashboard;
- muitos zeros;
- card do local tem botoes demais;
- pagina publica aparece com peso maior do que deveria;
- setup incompleto compete com operacao.

Novo fluxo:

1. Contexto compacto: Gestao, locais, pendencias, reservas hoje.
2. Se ha pendencias: fila com linhas acionaveis.
3. Se nao ha pendencias: estado calmo "operacao em dia".
4. Lista de locais com uma acao primaria: abrir operacao.
5. Atalhos secundarios compactos.

Desktop:

- header compacto;
- fila em rows;
- locais em cards largos ou lista.

Mobile:

- header compacto;
- seletor de local;
- "Hoje" primeiro;
- atalhos por tarefa.

### Home do jogador

Problema:

- risco de central generica.

Novo fluxo:

1. Proximo compromisso.
2. Pendencias pessoais.
3. Acoes rapidas: reservar, entrar em jogo, ver torneios.
4. Historico/resumo abaixo.

Remover do topo:

- dashboards longos;
- discovery pesada;
- administracao.

### Agenda

Problema:

- agenda, reserva, calendario, espera e configuracao competem.

Novo fluxo:

1. Hoje.
2. Pendentes.
3. Espera.
4. Criar reserva.
5. Calendario.
6. Quadras/regras.

Mobile:

- bottom action: nova reserva;
- filtro por data em sheet;
- lista por horario.

### Financeiro

Problema:

- financeiro pode parecer planilha.

Novo fluxo:

1. Receber hoje.
2. Em atraso.
3. Acoes: cobrar, marcar pago, enviar lembrete.
4. Pacotes/planos.
5. Despesas.
6. Relatorio.

Visual:

- rows de cobranca;
- valor e status destacados;
- relatorios so depois.

### Liga/Torneio

Problema:

- jogador e organizador misturados;
- chave e resumo disputam com pendencias.

Novo fluxo organizador:

1. Competicao ativa.
2. Classe/rodada.
3. Pendencias: resultado, presenca, inscricao, agenda.
4. Partidas.
5. Publicacao.
6. Configuracao.

Novo fluxo jogador:

1. Minha proxima partida.
2. Confirmar/avisar indisponibilidade.
3. Resultado.
4. Chave/classificacao.

### Pagina publica do local

Problema:

- precisa vender mais o local e converter rapido.

Novo fluxo:

1. Marca e proposta.
2. Reservar/agendar aula.
3. Quadras/turmas.
4. Jogos/comunidade.
5. Planos.
6. Compartilhar.

Mobile:

- CTA sticky: reservar;
- menos blocos administrativos;
- imagem/marca mais forte.

## Implementacao prioritaria

### Quick wins

1. Remover mosaicos de zero.
2. Trocar KPI vazio por estado calmo.
3. Reduzir herois operacionais.
4. Fazer "Pagina publica" virar secundaria.
5. Padronizar uma acao primaria por card.
6. Criar rows de tarefa para pendencias.
7. Reduzir caps e ruido de labels.

### Bloco 1

- refinamento de `/gestao`;
- fila com rows acionaveis;
- card de local menos lotado;
- esconder metricas zeradas;
- CTA primaria unica.

### Bloco 2

- refinar `PlaceAdminShell`;
- transformar modulo ativo em task-first;
- reduzir features chips quando nao ajudam.

### Bloco 3

- Home do jogador;
- proxima acao no topo;
- discovery mais abaixo.

### Bloco 4

- Competition OS visual;
- separar jogando/organizando;
- pendencias primeiro.

## Decisao de produto

O app deve parecer premium pela ausencia de ruido, nao pelo excesso de decoracao.

Premium aqui significa:

- usuario entende onde esta;
- sabe o que fazer;
- ve so o que importa;
- sente que o sistema antecipa a rotina;
- consegue operar no mobile sem brigar com a tela;
- percebe confianca visual suficiente para pagar pelo produto.

## Aplicacao visual em andamento

### Sidebar / navegacao

Decisao aplicada em 2026-05-13:

- Gestao pode ter tratamento visual proprio de workspace, desde que nao vire decoracao.
- O estado ativo deve ser mais evidente que o icone.
- Grupos de navegacao devem ser silenciosos; o usuario precisa perceber contexto antes de perceber menu.
- Mobile pode usar trilho horizontal quando houver mais de 4 entradas, evitando grid comprimido.

Antipattern agora proibido:

- sidebar identica para Player App e Management OS quando o usuario esta operando uma academia.
- item ativo dependente apenas de borda ou cor fraca.

### Home / dashboard

Decisao aplicada em 2026-05-13:

- Home nao deve abrir com hero administrativo.
- A primeira viewport deve responder `o que faco agora?`, nao apresentar vitrine de KPIs.
- Proxima partida/reserva, pendencia e agenda compacta valem mais que cards informativos.
- Zeros nao devem ganhar protagonismo.

### Gestao

Decisao aplicada em 2026-05-13:

- Gestao deve parecer cockpit operacional, com headers compactos e rows densas.
- Command panel existe para tarefa e setup, nao para mosaico de modulo.
- Abas primarias ficam limitadas a 5; o restante vai para overflow contextual.
- Sombra, borda e caixa devem ser usadas como suporte, nao como estrutura dominante.

### Discoverability operacional

Decisao aplicada em 2026-05-13:

- depois que a base esta pronta, a row do local deve oferecer acoes por intencao real, nao apenas nomes de modulo;
- `Criar reserva`, `Fazer chamada`, `Cobrar pendentes`, `Fazer follow-up` e `Registrar venda` sao exemplos de linguagem correta;
- setup incompleto tem prioridade sobre rotina, para evitar atalhos que dependem de base inexistente;
- atalhos de rotina devem ser poucos, contextuais e executaveis.
