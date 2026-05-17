# UX App DNA Restructure Report

Data: 2026-05-16  
Status: diagnostico e especificacao para fila de execucao  
Escopo: analise dos screenshots carregados, manual de frontend/design de produto e specs v2 atuais.

Atualizacao 2026-05-17:

- Sprint 01 aplicado em `APP-DNA-01`, `SCREEN-HOME-01`, `SCREEN-HOME-02` e `SCREEN-NOTIFICATIONS-01`.
- A base real de primitives ficou em `src/components/AppPrimitives.tsx`.
- Relatorio de execucao: `APP_DNA_SPRINT_01_REPORT_2026_05_17.md`.
- Sprint 02 iniciou a separacao de `Locais`: `/locais` virou hub limpo de intencao e tabs de lista ficaram restritas a `Ver locais`.
- Relatorio de execucao: `APP_DNA_SPRINT_02_REPORT_2026_05_17.md`.

## 1. Fontes e evidencias

Fontes principais:

- `manual_frontend_design_produto_apps_modernos.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `UX_FRONTEND_AUDIT.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`

Evidencias visuais:

- Pasta: `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/`
- Capturas base: 17 rotas.
- Registros navegacionais: 126.
- PNGs unicos: 116.
- Capturas com loading bruto: 0.
- Erros de automacao: 0.
- Contact sheets auxiliares: `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/_contact_sheets/`

As capturas foram feitas apos login, espera de rede/estabilidade de texto e clique em botoes/abas seguros. Portanto este relatorio considera os prints como uma evidencia confiavel do estado visual carregado.

## 2. Diagnostico executivo

O ATP App ja tem uma base funcional ampla: jogador, locais, reservas, aulas, jogos abertos, torneios, ligas, ranking, gestao, agenda, academia, clientes, financeiro e cantina. O problema principal nao e falta de ferramenta. O problema e que muitas telas ainda expõem a estrutura interna do sistema antes da intencao humana.

O manual e claro em tres principios que aparecem violados repetidamente:

1. A tela deve ter uma intencao dominante.
2. O app deve ser organizado pela tarefa do usuario, nao pelo inventario de modulos.
3. Complexidade deve ficar em camadas progressivas, nao empilhada na primeira leitura.

Nos screenshots, a sensacao de "backend/dashboard" vem de quatro causas recorrentes:

- excesso de cards e containers com pesos visuais parecidos;
- misturar descoberta, acao, operacao e configuracao na mesma pagina;
- usar paginas longas como substituto de arquitetura de informacao;
- filtros, tabs e seletores competindo entre si em vez de conduzir uma decisao.

O DNA alvo deve ser: leve para jogador, operacional para gestor, guiado para organizador e consistente em todos os perfis.

## 3. DNA alvo do ATP App

### 3.1 Promessa visual

O ATP App deve parecer um produto esportivo moderno, direto e confiavel. O usuario deve sentir que:

- sabe onde esta;
- enxerga a proxima acao;
- nao precisa entender a estrutura interna do sistema;
- consegue fazer algo importante em poucos toques;
- as ferramentas avancadas existem, mas aparecem so no contexto certo.

### 3.2 Regras de DNA

1. **Uma tela, uma intencao principal.**  
   Se a tela e "Reservar quadra", ela nao deve carregar aulas, planos, jogos e beneficios no mesmo corpo. Esses conteudos podem existir como paginas irmas.

2. **Jogador ve tarefa, nao painel.**  
   Home, Locais, Competir e Perfil devem priorizar compromissos, pendencias proprias e descoberta local. Nao devem parecer uma versao reduzida do sistema de gestao.

3. **Gestao e densa, mas organizada por rotina.**  
   Agenda, Academia, Financeiro, Clientes e Cantina podem ter densidade media/alta, mas a primeira dobra deve mostrar o que resolver agora. Setup, relatorios e configuracoes devem ficar em camadas secundarias.

4. **Organizador tem workspace separado.**  
   Torneio/liga publico nao deve mostrar ferramentas de organizador. Organizacao deve ter sua propria superficie: fila, inscricoes, jogos, comunicacao, configuracao e relatorios.

5. **Tabs sao paginas irmas, nao rolagem disfarçada.**  
   Ao clicar em `Jogos`, `Jogadores`, `Chat`, `Aulas`, `Planos` ou `Reserva`, a tela deve focar somente naquele conteudo.

6. **Filtro mobile vira sheet; desktop pode ser barra.**  
   Filtros longos abertos no mobile empilham demais. A primeira tela deve mostrar resumo do filtro e acao; o detalhamento entra em bottom sheet.

7. **Card e para objeto importante, nao para cada linha.**  
   Cards funcionam para evento, local, convite, reserva futura ou turma. Listas operacionais longas devem usar rows compactas.

8. **Dados pessoais urgentes aparecem direto.**  
   Resultado pendente, aula em 24h, reserva futura, convite pendente e pagamento proprio nao entram em carrossel.

9. **Descoberta pode ser carrossel.**  
   Eventos, academias, torneios e ligas publicas devem usar carrosseis ou listas curtas, priorizando cidade, regiao, estado e depois destaque geral.

10. **Backend entrega view-models por intencao.**  
    A UI nao deve montar telas filtrando grandes blobs. Deve receber dados especificos para `home_player`, `local_booking`, `local_classes`, `competition_public`, `competition_organizer`, `management_agenda`.

## 4. Leitura do manual aplicada ao app

| Regra do manual | Evidencia no app | Risco | Direcao |
|---|---|---|---|
| Home nao e catalogo de modulos | Home mobile ainda lista acoes, contexto, trabalho, descoberta e gestao na mesma rolagem | Jogador percebe dashboard | Home por prioridade contextual e blocos pessoais reais |
| Separar operacao diaria de configuracao | Gestao mostra implantacao, pendencias, workspaces e acoes de modulo na mesma pagina | Admin demora a achar rotina | Central de gestao por fila do dia + locais; setup recolhido |
| Mobile nao deve ser desktop empilhado | Gestao, ligas, torneios e ranking geram paginas de 6.000 a 22.000 px | Cansaco, perda de orientacao | Mobile com paginas focadas, bottom sheets e rows compactas |
| Tabs para secoes irmas | Torneio/liga usa tabs, mas algumas viram paginas enormes ou estados vazios | Usuario acha que mudou de aba sem mudar de tarefa | Tabs com conteudo exclusivo e rota limpa |
| Progressive disclosure | Filtros de locais/aulas/jogos aparecem inteiros e competem com resultados | Primeira dobra pesada | Resumo + ajustar filtros; sheet no mobile |
| Acoes principais claras | Varias telas tem muitos botoes verdes iguais | Hierarquia fraca | Um CTA primario por tela; secundarios neutros |
| Consistencia visual | Chips, tabs, cards, rows e formulários variam muito entre areas | Produto parece colagem | Design grammar transversal |

## 5. Analise por area e screenshots

### 5.1 Home do jogador

Screenshots analisados:

- `mobile390-inicio.png`
- `desktop1366-inicio.png`
- variantes `inicio-click-ranking`

Funcao esperada:

- orientar o jogador sobre a proxima acao;
- mostrar pendencias pessoais;
- oferecer atalhos simples;
- mostrar descoberta local sem parecer dashboard.

Problemas encontrados:

- A primeira dobra ainda tem tom de onboarding permanente: "Encontre algo para jogar" e explicacoes longas.
- Acoes rapidas ocupam altura excessiva no mobile.
- `Para voce` e `Trabalho` aparecem como blocos de sistema, nao como contexto humano.
- Conteudo profissional aparece na Home de um usuario com acesso admin, mas contamina a percepcao do modo jogador.
- O rodape fixo precisa de area segura consistente; nos full-page screenshots ele cruza visualmente o conteudo em algumas capturas.

Correlacao com o manual:

- Viola "Home nao e catalogo de modulos".
- Viola "separe por perfil quando necessario".
- Atende parcialmente a ideia de proxima acao, mas ainda com excesso de cards.

Mudanca desejada:

- Primeira dobra:
  - header compacto;
  - CTA contextual por prioridade: resultado pendente > atividade em 24h > convite > inscricao incompleta > competicao em andamento > descoberta local;
  - acoes rapidas em quatro botoes compactos.
- `Para voce` so aparece com dado real.
- `Trabalho` fica em bloco separado e recolhivel para perfis com permissao.
- Descoberta em carrosseis curtos por proximidade.

Backend/view-model:

- Criar ou consolidar uma consulta de home que entregue arrays curtos: `urgentActions`, `upcomingItems`, `personalContexts`, `localDiscovery`, `professionalAccess`.
- Evitar a Home buscar dados completos de gestao quando esta em modo jogador.

Prioridade: P0.

### 5.2 Locais e intencoes: reservar, aula, jogos, locais

Screenshots analisados:

- `desktop1366-locais.png`
- `desktop1366-locais-reserva.png`
- `desktop1366-locais-aulas.png`
- `desktop1366-locais-jogos.png`
- `mobile390-locais.png`
- `mobile390-locais-reserva.png`
- `mobile390-locais-aulas.png`
- `mobile390-locais-jogos.png`
- variantes `click-seguindo`, `click-meus-locais`, `click-ranking`

Funcao esperada:

- o jogador escolhe uma intencao: reservar quadra, entrar em aula, encontrar jogo ou ver locais.

Problemas encontrados:

- O mesmo header de descoberta aparece em todas as intencoes, ocupando espaco demais.
- Algumas capturas com `intent=classes` mostram fluxo de reserva, e algumas com `intent=matches` mostram aula. Isso indica fragilidade de estado/rota ou reuso de componente com intencao errada.
- `Todos`, `Seguindo` e `Meus locais` aparecem antes de fluxos especificos, misturando lista de locais com reserva/aula/jogo.
- Filtros de reserva/aula/jogo ainda parecem formularios de gestao: muitos campos abertos, labels pequenos e botao grande competindo com inputs.
- No mobile, o conteudo fica longo antes do usuario ver resultado.

Correlacao com o manual:

- Viola "organize por intencao".
- Viola "mobile: filtros em bottom sheet".
- Viola "uma tela deve ter ordem de leitura".

Mudanca desejada:

- `/locais` vira hub simples de intencao.
- Cada intencao vira pagina dedicada:
  - `/locais/reservar`
  - `/locais/aulas`
  - `/locais/jogos`
  - `/locais/explorar`
- Se mantiver hash/query internamente, a tela deve renderizar somente a intencao ativa.
- Abas `Todos/Seguindo/Meus locais` ficam apenas em `explorar`.
- Reserva:
  - filtros dependentes: UF > cidade > local > piso > data > periodo/hora > duracao;
  - buscar por lupa no desktop quando o header ja explica o objetivo;
  - resultados por local com horarios livres;
  - ao escolher local, agenda visual por quadra.
- Aulas:
  - filtro com multi-dia;
  - agrupar turmas equivalentes por recorrencia semanal;
  - permitir selecionar um ou mais dias da mesma turma quando o plano permitir.
- Jogos abertos:
  - filtros de UF/cidade/local/data/periodo/nivel/status;
  - criar chamada so como alternativa depois dos resultados.

Backend/view-model:

- Endpoints ou services por intencao:
  - `getBookingFilterOptions`
  - `searchBookableCourts`
  - `getClassFilterOptions`
  - `searchJoinableClasses`
  - `searchOpenMatches`
- As opcoes de UF/cidade/local devem vir de dados reais, nao de input livre.

Prioridade: P0.

Status 2026-05-17:

- `/locais` ja opera como hub de intencao quando nao ha `intent`;
- `/locais?intent=booking` ja usa filtro guiado por UF/cidade/local/piso/data/hora/duracao e resultado por local quando nenhum local exato foi escolhido;
- `/locais?intent=classes` ja usa UF/cidade dependentes, local/professor com sugestoes reais, dias da semana multi-select, periodo, nivel e perfil; resultados agrupam turmas recorrentes equivalentes e enviam `classIds` para a pagina do local;
- pendente: screenshots autenticados e validacao ponta a ponta de aprovacao de interesse em aula.

### 5.3 Pagina publica do local

Screenshots correlatos:

- capturas recentes do usuario em local publico;
- `locais-click-meus-locais` mostrando cards de locais;
- specs `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`.

Funcao esperada:

- mostrar um local como objeto publico;
- permitir reservar quadra, entrar em aula, entrar em jogo aberto, ver planos e compartilhar.

Problemas encontrados:

- A pagina do local ainda tende a empilhar reserva, aulas, jogos, planos e quadras/valores em uma mesma rolagem.
- Os cards de atalho parecem bons, mas a acao leva para secoes na mesma pagina em vez de paginas focadas.
- Reserva local ainda precisa de agenda por quadra mais visual.
- Planos e quadras aparecem como informacao passiva, mas deveriam iniciar fluxo.

Correlacao com o manual:

- Viola "tabs para secoes irmas, nao etapas ou scroll".
- Viola "acoes principais claras".

Mudanca desejada:

- Rotas irmas:
  - `/locais/:id/reserva`
  - `/locais/:id/aulas`
  - `/locais/:id/jogos`
  - `/locais/:id/planos`
  - `/locais/:id/sobre`
- Header do local permanece compacto.
- Atalhos viram navegacao contextual, nao scroll anchors.
- `Reserva`:
  - escolher dia e duracao;
  - carrossel/seletor de quadras;
  - cada quadra mostra slots hora a hora;
  - se duracao 2h, o slot mostra o intervalo bloqueado e o preco total.
- `Aulas`:
  - selecionar plano/dias;
  - enviar interesse com perfil logado;
  - apos aprovacao, aula entra no calendario/agenda pessoal.
- `Planos`:
  - card clicavel inicia fluxo de aulas/recorrencia permitido pelo plano.

Backend/view-model:

- Reserva deve linkar ao perfil logado e pedir telefone apenas se ausente.
- Interesse em aula precisa de status visivel para jogador: pendente, aprovado, recusado, matriculado.
- Ao aprovar interesse, a academia deve criar/vincular matricula e o jogador deve ver calendario de aulas.

Prioridade: P0/P1.

### 5.4 Competicoes: hub, torneios e ligas do jogador

Screenshots analisados:

- `desktop1366-eventos-hub.png`
- `mobile390-eventos-hub.png`
- `desktop1366-torneios-organizando.png`
- `mobile390-torneios-organizando.png`
- `desktop1366-ligas.png`
- `mobile390-ligas.png`

Funcao esperada:

- separar claramente competicoes que o usuario joga, organiza e pode descobrir.

Problemas encontrados:

- O hub ja esta melhor segmentado, mas no mobile ainda aparece como uma pilha de blocos com cards repetidos.
- `Organizando` aparece para usuario admin, mas precisa ser visualmente uma area profissional separada, nao uma continuacao natural do jogador.
- Ligas vazias aparecem com estado simples, mas poderiam ter descoberta local mais acionavel.

Correlacao com o manual:

- Atende parcialmente "separe por perfil".
- Ainda precisa melhorar "home/lista por intencao".

Mudanca desejada:

- `Competir` no jogador:
  - `Jogando`: proximas partidas e inscricoes;
  - `Descobrir`: torneios/ligas por proximidade;
  - `Organizando`: so aparece como entrada profissional compacta para quem tem permissao.
- No mobile, segmentos no topo e conteudo curto.
- `Organizando` deve levar ao workspace de organizacao, nao misturar com pagina publica.

Backend/view-model:

- Listas separadas: `playingCompetitions`, `organizingCompetitions`, `discoverCompetitions`.
- Dados de descoberta por cidade/regiao/estado.

Prioridade: P1.

### 5.5 Torneio publico e torneio jogando

Screenshots analisados:

- `desktop1366-torneio-jogos-exemplo.png`
- `desktop1366-torneio-inscritos-exemplo.png`
- `desktop1366-torneio-organizacao-exemplo.png`
- `mobile390-torneio-jogos-exemplo.png`
- `mobile390-torneio-inscritos-exemplo.png`
- `mobile390-torneio-organizacao-exemplo.png`
- variantes de `click-chat`, `click-classificacao`, `click-jogadores`, `click-ranking`

Funcao esperada:

- jogador/visitante acompanha evento, inscritos, jogos, comunicados e sua proxima acao;
- organizador opera em outra superficie.

Problemas encontrados:

- A aba `Jogadores` no torneio autenticado mostra uma pagina de organizacao com `Adicionar`, `Importar lista`, `Remover`; isso parece workspace admin dentro da superficie publica.
- A rota `organizacao` redireciona para `jogadores` em capturas, o que confirma mistura de semantica de pagina.
- `Classificacao` aparece mesmo quando nao existe fase de grupos/tabela: estado "Sem tabela para esta classe".
- `Jogos` gera pagina muito longa no mobile, com muitos jogos empilhados.
- `Resumo por classe` e seletor de classe ainda aparecem como bloco grande acima do conteudo, mesmo quando so deveriam filtrar a aba.
- `Chat` mistura admin tools com comunicacao publica.

Correlacao com o manual:

- Viola "camadas 3, 4 e 5 nao devem se misturar".
- Viola "nao mostrar acoes avancadas antes da hora".
- Viola "mobile nao deve ser pagina longa demais".

Mudanca desejada:

- Public/player tournament:
  - `Evento`: resumo, status, poster, CTA, minhas acoes, exportar chave se houver chave;
  - `Inscritos`: lista publica de inscritos por classe, sem ferramentas admin;
  - `Jogos`: chave/partidas por classe, filtros compactos;
  - `Classificacao`: so aparece se formato tiver grupos/tabela;
  - `Chat/Avisos`: comunicados e mensagens permitidas ao perfil.
- Workspace organizador separado:
  - `Inscricoes`
  - `Categorias`
  - `Jogos e agenda`
  - `Resultados`
  - `Comunicacao`
  - `Configuracao`
- Classe:
  - mobile: seletor horizontal/sheet;
  - desktop: select/chips compactos;
  - o filtro fica no topo de cada aba que usa classe.
- Encerramento/podio:
  - aparece apenas apos fim do torneio;
  - pertence a `Evento`, nao a `Jogos`.

Backend/view-model:

- `competitionPublicView` nao deve retornar acoes admin como primeira camada.
- `competitionOrganizerView` deve retornar listas operacionais.
- Visibilidade de `Classificacao` baseada em formato real.
- Exportar chave deve usar logica ja existente quando houver bracket.

Prioridade: P0/P1.

### 5.6 Liga publica e liga jogando

Screenshots analisados:

- `desktop1366-liga-partidas-exemplo.png`
- `desktop1366-liga-jogadores-exemplo.png`
- `desktop1366-liga-chat-exemplo.png`
- `mobile390-liga-partidas-exemplo.png`
- `mobile390-liga-jogadores-exemplo.png`
- `mobile390-liga-chat-exemplo.png`
- variantes de `click-classificacao`, `click-jogadores`, `click-chat`, `click-ranking`

Funcao esperada:

- liga deve ser uma competicao continua, com rodada, classificacao, jogadores, partidas e comunicacao.

Problemas encontrados:

- `Jogadores` mistura link de convite, inscricoes, pagamentos e lista de jogadores.
- `Classificacao` pode ficar muito longa em mobile por listar muitas classes/tabelas sem seletor compacto.
- `Partidas` no mobile e uma pagina de 20.000 px, dificil de navegar.
- `Chat` mostra ferramentas de admin inline, como publicar, fixar, remover.
- Menu usa muitas abas no mobile e pode ficar horizontalmente pesado.

Correlacao com o manual:

- Viola "mobile: listas orientadas a acao e sheets".
- Viola "separe operacao diaria de configuracao".
- Viola "uma tela deve ter acao principal clara".

Mudanca desejada:

- Liga jogador:
  - `Rodada`: minha rodada/proxima partida;
  - `Partidas`: lista filtravel por classe/rodada/status;
  - `Classificacao`: seletor de classe fixo e tabela compacta;
  - `Jogadores`: lista publica de jogadores da classe;
  - `Avisos`: comunicacao limpa.
- Liga organizador:
  - convite, pagamentos, aprovacoes e configuracao fora da pagina publica.
- Mobile:
  - menu horizontal com 4-5 itens maximos por contexto;
  - filtros em sheet;
  - partidas em rows compactas com status e acao.

Backend/view-model:

- Separar `leaguePublicView`, `leaguePlayerView`, `leagueOrganizerView`.
- O mesmo jogador pode ter acesso a mais de uma camada, mas a UI nao deve renderizar todas juntas.

Prioridade: P1.

### 5.7 Ranking

Screenshots analisados:

- `desktop1366-ranking.png`
- `mobile390-ranking.png`
- varias capturas `click-ranking` vindas de outras rotas.

Funcao esperada:

- permitir ver ranking e posicao relativa.

Problemas encontrados:

- Ranking aparece como destino facil a partir de muitos lugares, mas pode nao ser tarefa central do produto para todos os usuarios.
- No mobile, a lista e longa e parece tabela empilhada.
- `Seguir` em cada linha reforca uma camada social que nao e objetivo principal declarado.

Correlacao com o manual:

- Risco de mostrar funcao secundaria com peso excessivo.
- Lista mobile deveria ser orientada a leitura/acao principal.

Mudanca desejada:

- Ranking como tela simples:
  - minha posicao ou estado compacto;
  - filtros recolhidos;
  - lista por rows;
  - acao social secundaria discreta ou removida se nao houver estrategia social.
- Nao direcionar clique acidental de abas para ranking quando a intencao era outro contexto.

Prioridade: P2.

### 5.8 Perfil

Screenshots analisados:

- `desktop1366-perfil.png`
- `mobile390-perfil.png`
- `perfil-click-historico`
- `perfil-click-preferencias`
- `perfil-click-conta`

Funcao esperada:

- identidade, dados de contato, preferencias, historico e conta.

Problemas encontrados:

- Perfil esta visualmente mais limpo que outras areas.
- `Conta` ainda concentra area profissional, suporte, politica e acao irreversivel na mesma rolagem.
- Preferencias melhoraram, mas podem virar grupos mais simples.

Correlacao com o manual:

- Atende "objeto especifico com secoes irmas".
- Precisa de progressive disclosure para acao destrutiva.

Mudanca desejada:

- `Perfil`: dados essenciais.
- `Historico`: resumo + CTA.
- `Preferencias`: preferencias reais, com toggles.
- `Conta`: suporte/configuracoes legais e zona destrutiva recolhida.

Prioridade: P2.

### 5.9 Management OS: central e modulos

Screenshots analisados:

- `desktop1366-gestao.png`
- `desktop1366-gestao-click-agenda.png`
- `desktop1366-gestao-click-academia.png`
- `desktop1366-gestao-click-clientes.png`
- `desktop1366-gestao-click-financeiro.png`
- `desktop1366-gestao-click-cantina.png`
- equivalentes mobile.

Funcao esperada:

- operar locais/academias com rotina diaria, equipe e financeiro.

Problemas encontrados:

- Desktop tem densidade aceitavel para gestao, mas ainda empilha muitos cards de status e pendencias.
- Mobile de gestao e muito longo: central, implantacao, workspaces, cards por local, abas e acoes, tudo numa mesma rolagem.
- Agenda desktop usa muitas rows/cartoes; a fila de confirmacao e espera disputa com lista completa de reservas.
- Academia, clientes, financeiro e cantina seguem estrutura funcional, mas precisam de padrao unificado de listas, filtros e acao primaria.

Correlacao com o manual:

- Atende parcialmente "home operacional", mas viola "separar rotina de configuracao".
- Mobile ainda parece desktop empilhado.

Mudanca desejada:

- Central de gestao:
  - `Fila do dia` com 3-5 tarefas reais;
  - `Locais sob sua gestao` como lista compacta;
  - implantacao/setup recolhido ou em pagina propria;
  - modulos por permissao.
- Modulos:
  - primeira dobra sempre: contexto + fila acionavel + CTA principal;
  - lista principal abaixo;
  - metricas no final ou lateral desktop.
- Mobile:
  - selecionar local primeiro;
  - depois operar modulo;
  - sem listar todos os locais completos em uma rolagem infinita.

Backend/view-model:

- Management deve buscar apenas resumo na central; dados pesados so no modulo/local aberto.
- Permissoes devem filtrar modulo e acoes antes de renderizar.

Prioridade: P1.

## 6. Problemas sistemicos

### 6.1 Card overload

Onde aparece:

- Home, Locais, Gestao, Torneios, Ligas, pagina publica de local.

Por que prejudica:

- Todos os blocos parecem igualmente importantes.
- O usuario precisa ler demais para decidir.

Regra do manual:

- Card deve destacar objetos importantes, nao estruturar tudo.

Como corrigir:

- Cards para evento/local/turma/reserva importante.
- Rows para listas operacionais.
- Secoes sem moldura quando forem apenas agrupamento.

Prioridade: P0.

### 6.2 Paginas longas como arquitetura

Onde aparece:

- Torneio jogos/inscritos, Liga partidas/jogadores/classificacao, Gestao mobile.

Por que prejudica:

- Mobile vira um documento enorme.
- O usuario perde contexto e menu.

Como corrigir:

- Rotas/abas com conteudo exclusivo.
- Filtros fixos/compactos.
- Paginacao, "ver mais" e sheets.

Prioridade: P0/P1.

### 6.3 Mistura de papel

Onde aparece:

- Home admin em modo jogador;
- torneio publico com ferramentas de organizador;
- liga publica com pagamento/convite/configuracao;
- gestao acessivel na nav do jogador admin.

Por que prejudica:

- O app parece complexo mesmo quando a tarefa do usuario e simples.

Como corrigir:

- Surfaces por papel: player, organizer, management.
- Entrada profissional separada e discreta.
- View-models por papel.

Prioridade: P0.

### 6.4 Filtros pesados

Onde aparece:

- Locais reserva, aulas, jogos; ranking; gestao.

Por que prejudica:

- Filtro consome primeira dobra antes do resultado.

Como corrigir:

- Desktop: barra compacta com dependencias reais.
- Mobile: resumo + bottom sheet.
- Usar autocomplete para local, UF/cidade dependentes e periodo/hora por disponibilidade.

Prioridade: P0/P1.

### 6.5 Seletor de classe/escopo inconsistente

Onde aparece:

- Torneio e liga em jogos, jogadores, classificacao.

Por que prejudica:

- Chips + select + tabs competem.
- Em torneios com muitas classes, a tela nao escala.

Como corrigir:

- Um componente unico `CompetitionScopeSelector`.
- Mobile: sheet ou carrossel horizontal curto.
- Desktop: select com busca + chips de classes recentes.
- O seletor aparece apenas nas abas que usam recorte.

Prioridade: P0/P1.

### 6.6 Estados vazios grandes demais

Onde aparece:

- Home, ligas, ranking, torneio classificacao.

Por que prejudica:

- Empty state ocupa espaco sem aproximar o usuario da acao.

Como corrigir:

- Empty state compacto, com uma acao principal.
- Nao mostrar aba inteira se a funcao nao se aplica ao formato.

Prioridade: P1.

## 7. Organizacao alvo por camada

### Player App

Nivel 1:

- Inicio
- Locais
- Competir
- Ranking
- Perfil

Nivel 2:

- Locais: Reservar, Aulas, Jogos abertos, Explorar.
- Competir: Jogando, Descobrir, Organizando se permitido.

Nivel 3:

- Detalhe de local.
- Detalhe de torneio/liga.
- Detalhe de reserva/aula/partida.

Nivel 4:

- Confirmar reserva.
- Enviar interesse.
- Entrar em jogo.
- Inscrever em torneio/liga.
- Informar resultado.

### Competition OS

Public/player:

- Evento
- Inscritos/Jogadores
- Jogos/Partidas
- Classificacao se aplicavel
- Avisos/Chat

Organizer:

- Visao geral operacional
- Inscricoes/Jogadores
- Categorias/Classes
- Jogos e agenda
- Resultados
- Comunicacao
- Configuracao

### Management OS

Central:

- Fila do dia
- Locais
- Setup pendente recolhido

Modulo:

- Contexto
- Fila do modulo
- Lista operacional
- Acoes
- Metricas/relatorio
- Configuracao

## 8. Regras de frontend

### Tipografia

- Titulo de pagina: forte, curto.
- Subtitulo: uma linha, apenas quando ajuda.
- Labels de formulario: pequenas, consistentes.
- Evitar tres niveis de texto dentro de card.

### Cores

- Verde principal para acao positiva/primaria.
- Azul/cinza para informacao neutra.
- Amarelo/laranja para pendencia/atencao.
- Vermelho apenas para erro/destrutivo.
- Evitar muitos blocos verdes ao mesmo tempo.

### Cards

Usar para:

- local;
- evento;
- turma escolhivel;
- convite/pendencia importante;
- resumo pessoal real.

Nao usar para:

- cada linha de tabela longa;
- container de formulario dentro de outro card;
- agrupamento sem acao.

### Listas

- Repeticao operacional deve ser row.
- Mobile: row com titulo, contexto, status e uma acao.
- Desktop: tabela/lista compacta quando ha muitos itens.

### Filtros

- Desktop: visiveis quando a tarefa principal depende deles.
- Mobile: sheet com resumo aplicado.
- Campos dependentes devem evitar valores impossiveis.

### Tabs

- Maximo recomendado mobile: 4-5 visiveis por contexto.
- Se houver mais, usar `Mais` ou sheet.
- Tab vazia por formato nao aplicavel deve sumir.

### Feedback

- Sucesso: toast ou inline curto.
- Erro: mensagem amigavel, sem SQL/RPC cru.
- Loading: skeleton local.

## 9. Queue recomendada

| Prioridade | Area | Problema | Solucao | Impacto | Esforco |
|---|---|---|---|---|---|
| P0 | DNA transversal | Componentes variam e cards dominam | Criar/usar gramática `PageHeader`, `ActionPanel`, `FilterBar/Sheet`, `ObjectRow`, `ScopeSelector`, `EmptyState` | Alto | Medio |
| P0 | Home jogador | Primeira dobra ainda parece dashboard | CTA contextual + acoes compactas + pessoal real + gestao separada | Alto | Medio |
| P0 | Locais | Intencoes misturadas e rota/estado fragil | Separar reservar/aulas/jogos/explorar em paginas focadas | Alto | Alto |
| P0 | Reserva | Filtro pesado e agenda pouco visual | Filtros dependentes + calendario/carrossel por quadra + preco por duracao | Alto | Alto |
| P0 | Torneio publico | Ferramentas admin na pagina publica | Separar public/player de organizer; remover abas nao aplicaveis | Alto | Alto |
| P1 | Liga | Partidas/jogadores/classificacao longos demais | Selector de classe + rows compactas + organizer separado | Alto | Alto |
| P1 | Pagina local | Conteudos empilhados | Paginas irmas por Reserva/Aulas/Jogos/Planos/Sobre | Alto | Medio |
| P1 | Gestao mobile | Desktop empilhado | Selecionar local > modulo > rotina; setup recolhido | Alto | Alto |
| P1 | Aulas | Nao cobre multi-dia e fluxo de aprovacao claro | Turma recorrente multi-dia + status de interesse/matricula | Alto | Medio |
| P1 | Jogos abertos | Filtros incompletos | UF/cidade/local/data/periodo/nivel/status + criar chamada secundario | Medio | Medio |
| P2 | Ranking | Lista longa/social demais | Filtros recolhidos e lista compacta | Medio | Baixo |
| P2 | Perfil | Conta mistura suporte/pro/irreversivel | Progressive disclosure em Conta | Medio | Baixo |

## 10. Criterios de aceite por sprint

Cada sprint desta reestruturação deve validar:

- desktop e mobile;
- primeira dobra;
- estado vazio;
- erro amigavel;
- acao principal;
- rota direta;
- permissao/perfil;
- se a tela carrega apenas conteudo da intencao ativa.

Antes de considerar um sprint completo:

- capturar screenshots carregados;
- comparar com este relatorio;
- atualizar `EXECUTION_QUEUE.md`;
- registrar gaps backend se existirem.

## 11. Decisao final

O app nao precisa de mais informacao na tela. Precisa de melhor distribuicao de informacao.

O caminho recomendado e:

1. criar uma gramática visual e estrutural comum;
2. reestruturar Player App por intencao;
3. separar public/player de organizer em competicoes;
4. deixar Management OS denso apenas onde a rotina exige;
5. padronizar filtros, rows, sheets, tabs e empty states;
6. usar backend/view-models para entregar a cada tela so o que ela precisa.

Esse e o DNA a preservar nos proximos sprints: simples para quem joga, potente para quem opera, sem misturar os dois na mesma primeira leitura.
