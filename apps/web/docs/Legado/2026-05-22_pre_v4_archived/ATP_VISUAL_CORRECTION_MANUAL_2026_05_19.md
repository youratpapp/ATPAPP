# ATP Visual Correction Manual - Rastreamento completo

Data: 2026-05-19

Objetivo: registrar, sem criterio complacente, tudo que ainda precisa mudar para o app chegar no DNA visual premium dark das referencias ATP. Este manual deve guiar os proximos sprints antes de novas alteracoes grandes.

## Evidencias usadas

Auditoria com usuario com gestao:

- `docs/screenshots/visual-audit-management-2026-05-19/`
- `docs/screenshots/visual-audit-management-2026-05-19/_contact_sheets/mobile-top-contact.png`
- `docs/screenshots/visual-audit-management-2026-05-19/_contact_sheets/desktop-top-contact.png`

Auditoria com usuario sem gestao:

- `docs/screenshots/visual-audit-player-pure-2026-05-19/`
- `docs/screenshots/visual-audit-player-pure-2026-05-19/_contact_sheets/mobile-top-contact.png`
- `docs/screenshots/visual-audit-player-pure-2026-05-19/_contact_sheets/desktop-top-contact.png`

Auditoria local corrente restaurada:

- `docs/screenshots/visual-local-audit-2026-05-18/`

Perfis verificados:

- Com gestao: `escalao@gmail.com`
- Sem gestao: `qa.jogador.puro@demo.atp.local`

Viewports verificados:

- Desktop: `1440x980`
- Mobile: `390x844`

## Criterio correto de "ok"

Uma tela so pode ser considerada ok quando passa por todos os criterios abaixo:

1. Parece parte do mesmo produto premium dark das referencias, nao apenas "funciona".
2. Nao tem superficie branca/bege perdida, exceto campos que precisam ser claros por decisao explicita.
3. Nao tem texto cortado, comprimido, sobreposto ou com contraste fraco.
4. O primeiro viewport comunica a funcao principal da tela.
5. Mobile nao depende de carrossel cortado para entender conteudo importante.
6. Web nao fica com conteudo pequeno perdido em area vazia.
7. Botoes secundarios nao competem visualmente com CTA primario.
8. Usuario sem gestao nao deve parecer ter acesso operacional a rotas de trabalho.
9. Estados de erro nao podem mostrar erro cru de banco/API para usuario final.
10. A tela deve ser comparada contra a referencia visual, nao contra a versao anterior.

## Severidade

- `P0`: quebra de fluxo visual ou funcional, acesso/contexto errado, erro cru, texto ilegivel, overflow forte.
- `P1`: tela funcional mas fora do DNA premium dark, com superficies claras, hierarquia fraca ou composicao confusa.
- `P2`: polish fino, densidade, microcopy, icones, spacing e refinamento de estados.

## Diagnostico global

O app evoluiu para um tema dark consistente em varias areas, mas ainda existem tres problemas sistemicos:

1. Camadas antigas claras continuam aparecendo em rotas internas, principalmente Competition OS e Management OS.
2. O audit script atual nao separava corretamente usuario com gestao, usuario sem gestao, login signed-out e cadastro.
3. Algumas telas passaram no criterio tecnico, mas nao no criterio visual: continuam com cara de painel administrativo, tabela branca ou formulario generico.

## Quebras por area

### AUD-00 - Ferramenta de auditoria visual

Severidade: `P0`

Problemas:

- `desktop-login.png` e `mobile-login.png` nao capturam login real; aparecem como Home logada porque a sessao ja esta autenticada.
- O script usa apenas um perfil por execucao e sobrescreve a mesma pasta.
- Nao existe matriz formal de captura: guest, jogador puro, gestor, staff parcial, organizador.
- Nao ha captura viewport-only para validar bottom nav/header fixos; full-page screenshot faz nav fixa aparecer no meio da imagem e mascara alguns problemas reais.

Correcao esperada:

- Adicionar suporte a `ATP_AUDIT_OUT_DIR`.
- Rodar perfis em pastas separadas.
- Capturar login/cadastro em contexto signed-out, sem chamar `login()` antes.
- Capturar viewport-only para Home, Eventos, Gestao, Locais e Perfil.
- Gerar `visual-audit-manifest.json` com perfil, email, viewport, rota, status e screenshot.

### AUD-01 - Usuario sem gestao

Severidade: `P0`

Problemas:

- O perfil `qa.jogador.puro@demo.atp.local` mostra `/gestao` bloqueado corretamente no hub.
- Porem rotas diretas como `mobile-management-academy.png`, `mobile-management-booking.png`, `mobile-management-finance.png`, `desktop-management-academy.png` aparecem com telas operacionais de local.
- Mesmo que isso seja dado/guard de rota, visualmente e funcionalmente o usuario sem gestao parece conseguir ver telas de trabalho.

Correcao esperada:

- Garantir guard visual/route-level para todo `/gestao/:placeId/*` e `/locais/:placeId/admin`.
- Usuario sem gestao deve ver uma tela premium dark de acesso indisponivel, com CTA para voltar ao inicio/explorar locais.
- A queue visual deve tratar isso como P0 porque o screenshot contradiz o contexto do perfil.

### SHELL-01 - Shell, sidebar, header e alternador de modo

Severidade: `P1`

Problemas:

- Alguns headers de modulos de gestao ainda usam botoes brancos: `Ir para jogador`, `Voltar para central`, `Ver pagina publica`.
- Em desktop, sidebar e logo ficam muito pequenos em algumas telas e perdem presenca de marca.
- O alternador Jogador/Trabalho ainda aparece com estados visuais diferentes entre Player App, Competition OS e Management OS.
- Em paginas publicas autenticadas, header logado aparece competindo com conteudo publico.

Correcao esperada:

- Unificar `ModeSwitch`, `BackButton`, `PublicPageButton`, `ShareButton` e `SecondaryAction` em dark glass.
- Definir uma unica altura e comportamento para header desktop/mobile.
- Em pagina publica, reduzir chrome autenticado ou usar topbar publica compacta.

### HOME-01 - Home jogador

Severidade: `P2`

Problemas:

- Home ja esta proxima do DNA, mas ainda pode ficar presa em estado "Preparando sua area" no screenshot.
- No desktop, a primeira dobra e visualmente boa, mas o conteudo abaixo aparece pouco; se o estado carregar devagar, a tela parece vazia.
- Mobile tem boa direcao, mas os cards pequenos precisam manter ritmo e nao virar apenas numeros.

Correcao esperada:

- Melhorar skeleton/loading da Home para parecer painel premium, nao bloqueio.
- Garantir que `Proximos passos` e cards reais aparecam assim que houver dados.
- Manter stats acionaveis como padrao.

### COMP-01 - Hub de Competicoes

Severidade: `P1`

Problemas:

- O hub esta mais organizado, mas ainda tem muitos paineis semelhantes empilhados no mobile.
- "Trabalho" aparece como card secundario em usuario com gestao, mas precisa parecer troca de contexto, nao mais um filtro.
- A area `Descobrir` no mobile parece longa e pouco seletiva.

Correcao esperada:

- Separar claramente: jogar, descobrir, trabalho.
- No mobile, transformar discovery em lista compacta de acoes com icones consistentes.
- Preservar grid contido; nao voltar a carrossel cortado.

### COMP-02 - Torneios e Ligas listas

Severidade: `P1`

Problemas:

- `mobile-tournaments.png` e `mobile-leagues.png` estao escuros e legiveis, mas os botoes grandes `Voltar`/`Entrar` ocupam muita area dentro do hero.
- Desktop das listas vazias fica com conteudo pequeno e muita area vazia.
- Empty states parecem corretos, mas ainda genericos comparados com a referencia.

Correcao esperada:

- Criar header compacto para subrotas de Competition OS.
- Reduzir botoes de navegacao no hero; usar topbar/inline actions.
- Empty state deve ter asset/icone e acao primaria mais precisa.

### COMP-03 - Detalhe de liga e torneio

Severidade: `P0`

Problemas:

- `mobile-league-detail.png` ainda mostra faixas/status/pills brancas dentro da tela dark.
- `desktop-league-detail.png` tem blocos de operacao densos com contraste misturado.
- `mobile-tournament-games.png` tem `Resumo por classe` em card claro/branco e tabs em faixa clara.
- `desktop-tournament-games.png` mostra campos/input/select brancos dentro de jogo/placar.
- `mobile-tournament-players.png` e `desktop-tournament-players.png` mostram listas/tabelas brancas de inscritos, destoando totalmente.

Correcao esperada:

- Criar camada dark para `CompetitionHeader`, class switcher, tabs, select, score inputs, player list e match rows.
- Nenhum select/input/tabela de Competition OS deve ficar branco por padrao.
- Converter listas de inscritos para rows dark com avatar/status/action, evitando tabela branca.
- Mobile deve priorizar resumo, tabs compactas e uma acao primaria por bloco.

### PLACES-01 - Locais hub

Severidade: `P1`

Problemas:

- `desktop-places-overview.png` fica pequeno demais no canvas; ha muito vazio e pouca sensacao de app rico.
- `mobile-places-overview.png` esta coerente, mas ainda tem cards simples e pouco contexto visual.
- Rotas `places-lessons` e `places-match` ficam densas e com formularios antigos.

Correcao esperada:

- Desktop Locais deve usar composicao parecida com referencia: hero largo + tiles + resultados.
- Mobile deve manter 2x2, mas com icones/tiles mais refinados e sem texto comprimido.
- Filtros de aulas/jogos devem virar painel dark compacto com disclosure controlado.

### PUBLIC-01 - Paginas publicas de local, jogador e inscricao

Severidade: `P1`

Problemas:

- `desktop-public-place-*` mostra fundo claro/bege na lateral direita, quebrando dark full-bleed.
- `mobile-public-place-*` depende de placeholder amarelo `AD`, que parece asset temporario.
- Pagina publica de jogador aparece com header autenticado e fundo visual inconsistente.
- `mobile-public-tournament-registration.png` usa alerta rosa claro, fora do DNA.

Correcao esperada:

- Forcar fundo dark full-width em paginas publicas.
- Substituir placeholders por avatar/logo dark ou card visual mais integrado.
- Usar topbar publica compacta quando a rota for publica, mesmo se houver sessao.
- Criar estados warning/danger dark em vez de alerta rosa claro.

### PERSONAL-01 - Areas pessoais

Severidade: `P0/P1`

Problemas:

- `mobile-my-payments.png` e `desktop-my-payments.png` mostram erro cru: `canceling statement due to statement timeout`.
- No perfil puro, `mobile-my-reservations.png` tambem mostra erro cru em vez de estado util.
- `mobile-my-lessons.png` mostra lista longa repetitiva; funcional, mas sem agrupamento visual.
- `mobile-my-reservations.png` com gestao tem historico enorme, sem paginacao/compactacao perceptivel.

Correcao esperada:

- Trocar erro cru por `ScreenState` premium: "Nao foi possivel carregar agora" + tentar novamente.
- Agrupar listas longas por data/local/status.
- Adicionar limite inicial + "Ver mais" para historicos grandes.
- Padronizar rows de reservas/aulas/pagamentos como cards compactos dark.

### PROFILE-01 - Perfil e perfil publico

Severidade: `P1`

Problemas:

- Perfil privado mobile esta coerente, mas desktop fica pequeno e pobre para a area disponivel.
- Referencia de perfil/ranking tem hero forte, estatisticas e historico; o app atual mostra dados basicos.
- Perfil publico tem header autenticado e cards simples demais.

Correcao esperada:

- Desktop perfil deve ganhar layout 2 colunas: hero + stats + historico/conta.
- Mobile pode manter o atual, mas incluir cards de estatisticas quando houver dados.
- Perfil publico deve usar hero proprio e remover ruido de shell autenticado.

### RANKING-01 - Ranking

Severidade: `P1`

Problemas:

- Ranking mobile esta funcional, mas os placeholders de avatar aparecem como blocos brancos.
- Desktop ranking e bom, mas ainda tem sensacao de tabela administrativa.
- Filtros e actions `Seguir` precisam de refinamento visual para parecer app esportivo.

Correcao esperada:

- Trocar avatar placeholder branco por initials/avatar dark.
- Dar mais destaque ao podium/top 3.
- Reorganizar ranking desktop para cards/rows premium em vez de tabela pura.

### MGMT-01 - Gestao hub

Severidade: `P1`

Problemas:

- Gestao hub esta forte no desktop, mas mobile fica longo e pesado.
- Header mobile ainda mostra botoes secundarios claros ou com contraste inconsistente em algumas capturas.
- Cards de workspaces misturam chips, metricas e botoes em excesso.

Correcao esperada:

- Mobile Gestao deve virar dashboard operacional por blocos: fila, competicoes, locais.
- Botoes secundarios sempre dark.
- Reduzir quantidade de chips visiveis por card; mover detalhes para drilldown.

### MGMT-02 - Modulos internos de gestao

Severidade: `P0/P1`

Problemas:

- `mobile-management-academy`, `booking`, `canteen`, `clients`, `finance`, `settings`, `team` ainda exibem muitos botoes brancos.
- Desktop desses modulos tem formularios, tabs e labels em padroes mistos.
- Alguns blocos parecem sistema administrativo antigo, nao produto premium.
- Em usuario puro, essas rotas aparecem quando acessadas diretamente.

Correcao esperada:

- Aplicar dark tokens a todos `academy-workspace-*`, forms, tabs, selects, action chips e summary cards.
- Criar padrao unico de modulo: header compacto, module tabs dark, painel principal, fila lateral/abaixo.
- Guard de usuario sem gestao deve bloquear rotas internas.

### AUTH-01 - Login, cadastro e entrada

Severidade: `P0`

Problemas:

- Login real nao foi auditado nesta rodada porque o script captura a Home logada.
- Cadastro/completar perfil tambem nao foi auditado visualmente.
- Sem essa captura, nao da para declarar entrada do app como aprovada.

Correcao esperada:

- Corrigir script e capturar `/auth` signed-out desktop/mobile.
- Capturar `/completar-cadastro` com perfil incompleto ou fixture dedicada.
- Validar erros de login, loading e estados de recuperacao.

## Ordem recomendada dos sprints

1. `TRACK-00`: corrigir auditoria visual e matriz de perfis.
2. `P0-ACCESS`: bloquear/estilizar rotas de gestao para usuario sem gestao.
3. `P0-ERRORS`: remover erros crus de pagamentos/reservas.
4. `P0-COMP-INTERNAL`: dark real em torneio/liga detalhe, tabs, selects, inputs e listas.
5. `P1-MGMT-MODULES`: dark real em modulos internos de gestao.
6. `P1-PUBLIC`: dark full-bleed em paginas publicas e placeholders premium.
7. `P1-PLACES`: elevar Locais desktop/mobile para o padrao da referencia.
8. `P1-PROFILE-RANKING`: perfil/ranking com hero/stats/podium.
9. `P2-POLISH`: densidade, spacing, icones, microinteracoes e vazios.

## Regra para proximos fechamentos

Nao marcar item como concluido apenas por `lint`, `build` ou ausencia de crash. Cada item precisa anexar:

- screenshots antes/depois;
- comparacao contra referencia;
- lista de telas verificadas;
- decisao explicita sobre mobile e desktop;
- decisao explicita sobre usuario com gestao e sem gestao quando a rota for autenticada.
