# ATP Deep App Audit - 2026-05-19

Fonte primaria de decisao: `atp_premium_dark_design_playbook.md` + referencias premium dark anexadas pelo produto.

Objetivo desta auditoria: avaliar o app pagina por pagina, em desktop e mobile, cobrindo aparencia, texto, contraste, posicionamento, funcoes esperadas, rotas de botoes/cards e erros de console/rede. A conclusao abaixo nao assume que uma tela esta correta so por estar escura: ela precisa ter hierarquia, densidade, contraste, destino funcional e coerencia com o novo DNA.

## Evidencias geradas

- Gestor/admin com console/rede: `docs/screenshots/deep-audit-management-console-2026-05-19/`
- Jogador puro com console/rede: `docs/screenshots/deep-audit-player-console-2026-05-19/`
- Login/deslogado com console/rede: `docs/screenshots/deep-audit-auth-console-2026-05-19/`
- Cliques seguros gestor: `docs/screenshots/deep-audit-management-interactions-desktop-2026-05-19/`
- Cliques seguros jogador puro: `docs/screenshots/deep-audit-player-interactions-desktop-2026-05-19/`
- Contact sheets:
  - `docs/screenshots/deep-audit-management-console-2026-05-19/_contact_sheets/desktop-contact.png`
  - `docs/screenshots/deep-audit-management-console-2026-05-19/_contact_sheets/mobile-contact.png`
  - `docs/screenshots/deep-audit-player-console-2026-05-19/_contact_sheets/mobile-contact.png`

## Ajuste na metodologia

O capturador anterior tinha dois problemas que invalidavam uma auditoria precisa:

1. A pasta de screenshots nao era limpa antes da captura, entao imagens antigas podiam aparecer como evidencias atuais.
2. A rota `#/auth` era capturada depois do login, entao nao avaliava login/cadastro de verdade.

Foi ajustado `scripts/capture-visual-audit.mjs` para:

- limpar a pasta de saida por padrao;
- aceitar `ATP_AUDIT_OUT_DIR`;
- aceitar `ATP_AUDIT_SKIP_LOGIN=1`;
- aceitar `ATP_AUDIT_ROUTES_JSON`;
- aceitar `ATP_AUDIT_VIEWPORTS`;
- capturar console, logs do browser e falhas de rede por pagina em `*.diagnostics.json`;
- mapear elementos clicaveis por pagina;
- rodar cliques seguros quando `ATP_AUDIT_INTERACTIONS=1`.

## Resultado tecnico do console/rede

### Gestor/admin

Total capturado: 40 paginas/estados.

- 14 erros de console/rede.
- 4 warnings.
- 7 respostas HTTP >= 400.
- 4 screenshots ainda capturam estado de loading na Home.

Erros principais:

- `app_payments` retorna HTTP 500 em `places-match`, `my-payments`, `league-detail`, `leagues` mobile e variantes.
- Warnings de `Workspace data timeout: payments` em paginas que nao deveriam depender visualmente de financeiro.
- Home ainda exibe `Preparando sua area` mesmo depois do tempo de espera da auditoria, sinal de carregamento lento ou estado que ocupa area nobre.

### Jogador puro

Total capturado: 40 paginas/estados.

- 46 erros de console/rede.
- 19 warnings.
- 29 respostas HTTP >= 400.
- 4 screenshots ainda capturam estado de loading na Home.

Erros principais:

- `app_list_place_staff` retorna HTTP 400 ao abrir `Locais` para jogador puro. Isso indica chamada de workspace profissional vazando para uma pagina de jogador.
- `app_payments` retorna HTTP 500 em paginas de jogador.
- `court_bookings` retorna HTTP 500 em `Minhas reservas`, `Minhas aulas` e `Meus pagamentos`.
- O jogador puro ve mensagens brutas de erro em telas pessoais: `Nao foi possivel carregar canceling statement due to statement timeout`.

### Login/deslogado

Total capturado: 8 paginas/estados.

- 0 erro de console/rede.
- Todas as rotas protegidas redirecionam para `#/auth?next=...`.

Observacao de produto: hoje as rotas chamadas de publicas no codigo nao sao realmente publicas para usuario deslogado. Se paginas de torneio, local, jogador ou inscricao precisam ser compartilhaveis, falta uma shell publica estruturada.

## Diagnostico visual global

O app evoluiu bastante para o dark premium, mas ainda nao atingiu o DNA da referencia de forma uniforme. O padrao correto e:

- fundo navy/preto continuo, sem beige/cinza claro;
- cards translúcidos escuros com borda sutil;
- verde usado como acento e acao primaria, nao como bloco chapado em excesso;
- imagens esportivas reais como primeira dobra quando a pagina precisa de atmosfera;
- desktop com layout tipo cockpit, nao tela estreita perdida no canvas;
- mobile com blocos empilhados sem sobreposicao, sem tabelas comprimidas e sem texto vazando;
- nenhum erro tecnico bruto visivel para usuario;
- componentes de formulario e tabela tambem dark, nao apenas o fundo externo.

## Auditoria por area

### Home - `#/inicio`

Funcao esperada:

- responder rapidamente "o que faco agora?";
- abrir caminhos para reservar quadra, encontrar jogo, torneios, aulas e ligas;
- alternar jogador/trabalho apenas quando o usuario tiver perfil profissional.

Estado atual:

- Visual geral segue a direcao premium dark.
- Desktop ainda parece estreito em relacao ao canvas, com muita area vazia lateral.
- Mobile esta mais perto da referencia, mas ainda captura `Preparando sua area`, o que ocupa uma area importante e passa sensacao de app carregando.
- Os cards numericos de `0 Pendencias`, `0 Agenda`, `0 Rotina` sao clicaveis/visuais, mas quando tudo esta zerado deveriam virar shortcuts claros, nao cards de dado morto.

Cliques verificados:

- `Explorar` leva para `#/locais?intent=matches`.
- `Competir/Torneios` leva para `#/eventos/torneios`.
- `Evoluir/Ligas` leva para `#/eventos/ligas`.
- Bottom nav `Inicio` fica em `#/inicio`.

Correcao necessaria:

- remover loading persistente da primeira dobra;
- transformar cards zerados em botoes/atalhos com copy util;
- usar grid desktop mais largo e proximo da referencia;
- garantir que jogador puro nao execute chamadas de workspace profissional.

### Locais - `#/locais`, `#/locais?intent=places/classes/matches`

Funcao esperada:

- escolher caminho: encontrar jogo, reservar quadra, entrar em aula, ver locais;
- mostrar cards de descoberta com filtros uteis;
- manter hierarquia clara em mobile.

Estado atual:

- `overview` e `reserve` estao visualmente mais limpos, mas o desktop ainda fica pequeno dentro de um canvas grande.
- Mobile `overview` segue melhor o DNA, mas os botoes de escolha ficam densos e precisam respirar como cards de acao.
- `classes` e `matches` ainda parecem formulario/tabela comprimida.
- Em `places-lessons` mobile, o quarto card da faixa de intent fica parcialmente fora da tela e a navegacao horizontal nao se comporta como uma grade premium.
- `places-match` mobile vira uma lista longa com muitos botões verdes repetidos e filtros ocupando demais.

Tecnico:

- Jogador puro dispara `app_list_place_staff` HTTP 400 em Locais.
- Algumas paginas de Locais disparam erro de pagamentos mesmo quando o usuario esta apenas explorando.

Cliques verificados:

- `Ver locais / Proximos e seguindo` leva para `#/locais?intent=venues`.
- `Competições` leva para `#/eventos`.
- `Reservas` leva para `#/minhas-reservas`.

Risco:

- `intent=venues` nao aparece no conjunto principal de intents capturado. Precisa ser validado como estado canonico ou trocado por uma rota/intent existente.

Correcao necessaria:

- separar visualmente filtros, resultados e acoes;
- criar cards compactos de local/aula/jogo;
- reduzir botões verdes repetidos em listas;
- corrigir chamadas profissionais vazando para jogador puro;
- revisar `intent=venues`.

### Competições Hub - `#/eventos`

Funcao esperada:

- ser a central de torneios, ligas, rankings e descoberta;
- no gestor, oferecer entrada de trabalho sem contaminar modo jogador;
- no jogador puro, priorizar participar/descobrir.

Estado atual:

- Desktop esta bem mais proximo da referencia de competicoes.
- Mobile ainda tem blocos muito colados, com alguns cards e botões sem espacamento suficiente.
- O estado `Descobrir` leva para `#/eventos?modo=discover`, mas visualmente o H1 continua `Competições`; falta feedback claro de modo/estado.

Cliques verificados:

- `Torneios` leva para `#/eventos/torneios?view=participating`.
- `Ligas` leva para `#/eventos/ligas?view=participating`.
- `Rankings` leva para `#/ranking`.
- `Descobrir torneios e ligas` leva para `#/eventos?modo=discover`.

Correcao necessaria:

- estruturar estados `playing`, `discover`, `work` com subtitulo/abas/pills claros;
- revisar mobile para evitar cards comprimidos;
- revisar se `Trabalho` aparece apenas para quem deve ver.

### Torneios - `#/eventos/torneios`

Funcao esperada:

- listar torneios que jogo, permitir entrar por codigo e descobrir torneios.

Estado atual:

- Visual vazio esta coerente no dark, mas pobre em conteudo e utilidade.
- Mobile tem boa direcao, mas CTA `Entrar` e `Entrar por codigo` precisam deixar claro se abrem modal, busca ou fluxo de inscricao.

Correcao necessaria:

- diferenciar `view=participating`, `view=organizing` e descoberta;
- usar cards visuais mesmo em vazio, com proximos torneios publicos;
- garantir que `Entrar` nao pareca uma acao generica.

### Ligas - `#/eventos/ligas`

Funcao esperada:

- listar ligas em que o usuario participa e permitir voltar/descobrir.

Estado atual:

- Estado vazio dark esta ok, mas simples demais para a referencia.
- Mobile com bom hero, mas precisa de sugestoes visuais e proximas ligas para nao parecer tela morta.

Tecnico:

- Em alguns perfis/viewport, dispara erro de `app_payments`.

Correcao necessaria:

- adicionar cards de descoberta/sugestao;
- evitar dependencia de pagamentos quando apenas listando ligas;
- criar estados para jogador sem liga, participante e organizador.

### Liga detalhe/chat - `#/eventos/ligas/:id`

Funcao esperada:

- mostrar rodada, jogadores, classificacao, partidas, chat e configuracao quando permitido.

Estado atual:

- Desktop se aproxima do cockpit dark.
- Mobile ainda tem abas comprimidas, blocos brancos/cinza claros em componentes internos e cards empilhados com densidade alta.
- No jogador puro, a primeira dobra da liga detalhe contem blocos claros e tabelas/listas com contraste fora do padrao.
- Chat esta melhor, mas ainda precisa de composicao mais respirada e controles dark consistentes.

Tecnico:

- `app_payments` 500 aparece no detalhe de liga.

Correcao necessaria:

- darkificar todos os inputs, selects, tabs e linhas internas;
- quebrar tabelas em cards mobile;
- esconder/configurar abas conforme papel;
- tratar erro de pagamento fora da UI principal.

### Torneio jogos/jogadores - `#/eventos/:id/jogos`, `#/eventos/:id/jogadores`

Funcao esperada:

- jogos: operar/acompanhar partidas, resultados, WO, classificacao;
- jogadores: listar inscritos, adicionar/importar quando permitido.

Estado atual:

- Desktop `jogos` ainda parece uma tabela operacional densa, com muitos campos brancos.
- Mobile `jogos` do jogador fica mais proximo, mas ainda usa blocos claros e controles comprimidos.
- Mobile `jogadores` quebra fortemente o DNA: lista branca longa dentro de tela dark.
- Desktop `jogadores` tambem mantém tabela/listagem clara e tecnica demais.

Correcao necessaria:

- trocar inputs/tabelas claras por linhas dark;
- em mobile, transformar tabela de jogadores em cards;
- separar modo jogador de modo organizador;
- manter tabs fixas legiveis sem esmagar texto;
- revisar densidade e largura da tabela desktop.

### Ranking - `#/ranking`

Funcao esperada:

- mostrar posicao, ranking geral/cidade/liga/clube e top jogadores.

Estado atual:

- Desktop tem estrutura, mas ainda lembra tabela administrativa.
- Mobile tem lista longa com muito texto pequeno e contraste irregular.
- Avatares/bolhas brancas quebram o DNA escuro.

Correcao necessaria:

- criar hero de ranking com posicao do usuario e podium/top 3;
- transformar linhas em cards dark no mobile;
- reduzir elementos brancos;
- revisar contraste de textos secundarios.

### Perfil - `#/perfil`

Funcao esperada:

- mostrar identidade do usuario, estatisticas, historico, preferencias e conta.

Estado atual:

- Mobile esta perto da referencia de perfil/ranking, mas ainda mais simples.
- Desktop fica estreito e vazio, com pouco aproveitamento do canvas.
- `Editar perfil` foi clicado e permaneceu em `#/perfil`; se abre modal, precisa ser evidente; se nao abre, e bug funcional.

Correcao necessaria:

- desktop com hero + grid de estatisticas + historico;
- mobile com estatisticas mais fortes;
- verificar fluxo real de editar perfil;
- revisar imagem/avatar e badges para parecer premium.

### Minhas reservas - `#/minhas-reservas`

Funcao esperada:

- listar proximas reservas, historico, estado vazio e possiveis acoes.

Estado atual:

- Gestor ve uma lista enorme de historico ocupando a tela inteira; falta agrupamento e filtro.
- Jogador puro recebe erro bruto `Nao foi possivel carregar canceling statement due to statement timeout`.
- Mobile fica uma lista muito longa/densa.

Tecnico:

- Jogador puro dispara HTTP 500 em `court_bookings`.

Correcao necessaria:

- corrigir consulta/timeout;
- substituir erro bruto por estado amigavel;
- agrupar por futuras/passadas com limite inicial;
- usar cards dark compactos.

### Minhas partidas - `#/minhas-partidas`

Funcao esperada:

- listar competicoes ativas, proximas partidas e historico.

Estado atual:

- Visual dark ok, mas tela ainda simples e pouco util.
- Jogador puro com estado vazio coerente, mas poderia sugerir discovery.

Correcao necessaria:

- incluir card de proxima partida quando existir;
- criar CTA para descobrir competicoes;
- evitar cards vazios sem informacao acionavel.

### Minhas aulas - `#/minhas-aulas`

Funcao esperada:

- listar turmas, professor, horarios, reposicoes e solicitacoes.

Estado atual:

- Gestor/aluno com muitas turmas vira lista longa demais.
- Jogador puro/aluno mostra cards escuros, mas densidade ainda alta.
- Console aponta erro de `court_bookings` em jogador puro em algumas passagens, mesmo sendo area de aulas.

Correcao necessaria:

- separar `confirmadas`, `reposicoes`, `solicitacoes`;
- limitar lista inicial e criar filtros;
- corrigir dependencia indevida de reservas;
- cards mobile com altura controlada.

### Meus pagamentos - `#/meus-pagamentos`

Funcao esperada:

- mostrar pendencias, pagos, simulados/manuais e mensagens de gateway.

Estado atual:

- Gestor agora mostra estado sem erro bruto em uma captura, mas console continua com HTTP 500 de `app_payments`.
- Jogador puro mostra erro bruto `Nao foi possivel carregar canceling statement due to statement timeout`.
- Visual de erro quebra completamente o DNA.

Correcao necessaria:

- corrigir consulta `app_payments`;
- remover texto tecnico da UI;
- criar estado vazio/erro premium dark com CTA de tentar novamente;
- nao carregar financeiro global em paginas que nao precisam.

### Gestao - `#/gestao`

Funcao esperada:

- cockpit de trabalho para gestor, com pendencias, competicoes, locais, modulos e alertas.

Estado atual:

- Desktop esta mais proximo da referencia de competicoes/cockpit.
- Mobile ainda vira uma lista muito longa e densa, com muitos badges e botoes pequenos.
- Os modulos carregam muita informacao de uma vez.

Funcional:

- Jogador puro bloqueia `/gestao` corretamente com tela `Area profissional indisponivel`.

Correcao necessaria:

- mobile precisa de resumo por prioridades, nao lista integral;
- cards de locais/modulos devem ter hierarquia de acao;
- validar rotas internas de cada modulo em sprint proprio.

### Login/cadastro - `#/auth`

Funcao esperada:

- login, cadastro, Google, recuperacao/estado de erro e redirecionamento `next`.

Estado atual:

- Console limpo.
- Funcionalmente redireciona protegidas para `#/auth?next=...`.
- Visual ainda precisa ser elevado ao DNA: hoje e uma tela de auth simples, nao uma entrada premium dark com atmosfera esportiva.
- Cadastro e login compartilham a mesma superficie; falta revisao de texto, foco, erros e estado de sucesso.

Correcao necessaria:

- hero/auth dark premium com imagem de fundo;
- separar visualmente entrar/criar conta;
- adicionar estados de erro/sucesso sem texto tecnico;
- validar fluxo de completar cadastro com usuario realmente incompleto.

## Rotas e destinos de cliques verificados

Destinos coerentes:

- Home `Explorar` -> `#/locais?intent=matches`.
- Home `Competir/Torneios` -> `#/eventos/torneios`.
- Home `Evoluir/Ligas` -> `#/eventos/ligas`.
- Eventos `Torneios` -> `#/eventos/torneios?view=participating`.
- Eventos `Ligas` -> `#/eventos/ligas?view=participating`.
- Eventos `Rankings` -> `#/ranking`.
- Bottom nav principal aponta para as rotas esperadas.

Destinos que precisam de revisao:

- Locais `Ver locais` -> `#/locais?intent=venues`; precisa confirmar se `venues` e intent canonico e se tem visual especifico.
- Eventos `Descobrir torneios e ligas` -> `#/eventos?modo=discover`; destino funciona, mas a tela nao deixa claro que mudou de modo.
- Perfil `Editar perfil` permanece em `#/perfil`; precisa confirmar se abre modal/estado. Se nao abrir, corrigir.

## Paginas/estados ainda nao totalmente cobertos

Estas telas precisam entrar na proxima captura porque dependem de estado, permissao ou rotas internas:

- `#/completar-cadastro` com usuario autenticado incompleto.
- `#/eventos/torneios?view=organizing`.
- `#/eventos/ligas?view=organizing`.
- `#/eventos/:id/organizacao`.
- `#/eventos/:id/classificacao`.
- `#/eventos/:id/chat`.
- Rotas internas de gestao por modulo: agenda, academia, clientes, financeiro, cantina, equipe, ajustes.
- Paginas publicas/deslogadas se o produto decidir que devem ser publicas.

## Queue recomendada

### P0 - Confiabilidade e erros visiveis

1. Corrigir HTTP 500 de `app_payments`.
   - Impacta: `Meus pagamentos`, `Liga detalhe`, `Locais`, `Ligas`.
   - Aceite: nenhum 500 em `diagnostics-summary.json`; UI sem `statement timeout`.

2. Corrigir HTTP 500 de `court_bookings` para jogador puro.
   - Impacta: `Minhas reservas`, `Minhas aulas`, `Meus pagamentos`.
   - Aceite: jogador puro ve estado vazio premium, nao erro bruto.

3. Remover chamada `app_list_place_staff` da experiencia de jogador puro.
   - Impacta: `Locais`.
   - Aceite: `Locais` do jogador puro nao dispara RPC profissional.

4. Substituir mensagens tecnicas por estados amigaveis.
   - Textos proibidos em UI: `canceling statement`, `statement timeout`, `Failed to load`, nomes de tabela/RPC.

### P0 - Mobile quebrado

5. Redesenhar `tournament-players` mobile.
   - Trocar lista/tabela branca por cards dark.
   - Manter busca/filtros/tabs sem sobrepor conteudo.

6. Redesenhar `tournament-games` mobile.
   - Trocar inputs brancos por controles dark.
   - Separar placar/acoes/status por card.

7. Redesenhar `places-match` mobile.
   - Filtros recolhiveis.
   - Cards de chamada com acao primaria unica.
   - Remover repeticao visual de botoes verdes.

8. Redesenhar `management` mobile.
   - Primeiro dobra: prioridades e CTA.
   - Depois: competicoes, locais e modulos agrupados.

### P1 - Desktop cockpit

9. Expandir Home desktop para layout de cockpit.
   - Hero + proximas acoes + cards laterais.
   - Evitar tela estreita no canvas.

10. Expandir Perfil desktop.
    - Hero de perfil/ranking, estatisticas, historico recente.

11. Refinar Ranking desktop/mobile.
    - Podium/top 3, posicao do usuario, cards mobile.

12. Refinar `Locais` desktop.
    - Overview e intents com grid mais forte e menos formulario.

### P1 - Rotas e cliques

13. Confirmar/corrigir `intent=venues`.
    - Se for valido, criar estado visual especifico.
    - Se nao for, apontar para intent existente.

14. Dar estado visual real para `#/eventos?modo=discover`.
    - H1/subtitulo/abas devem refletir descoberta.

15. Verificar `Editar perfil`.
    - Se abre modal, capturar e estilizar.
    - Se nao abre, implementar destino/estado.

16. Auditar cards clicaveis que nao sao `button/a`.
    - Cards precisam ter foco, aria e destino previsivel.

### P1 - Login/cadastro/publico

17. Redesenhar `#/auth`.
    - Premium dark com asset esportivo.
    - Estados: login, cadastro, erro, sucesso, loading.

18. Capturar `#/completar-cadastro` com usuario incompleto.
    - Garantir que cadastro nao pareca formulario legado.

19. Decidir se rotas publicas sao realmente publicas.
    - Se sim: criar shell publica para local/jogador/torneio/inscricao.
    - Se nao: renomear mentalmente/documentar como rotas autenticadas.

### P2 - Sistema de componentes

20. Criar tokens/classes obrigatorias para tabelas dark.
    - Nenhum input/select/table branco em superficies premium.

21. Criar componente de estado vazio/erro premium.
    - Reutilizar em pagamentos, reservas, ligas, torneios e aulas.

22. Criar componente de filtro mobile recolhivel.
    - Usar em Locais, Ranking, Torneios, Jogos.

23. Criar componente de card-list mobile.
    - Substituir tabelas em jogadores, reservas, ranking e jogos.

