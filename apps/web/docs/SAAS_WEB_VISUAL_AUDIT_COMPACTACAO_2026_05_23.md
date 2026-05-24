# Auditoria Web SaaS - Compactacao, Hierarquia e Organizacao

Data: 2026-05-23  
Base auditada: `http://127.0.0.1:5175/`  
Screenshots: `artifacts/saas-web-audit-2026-05-23/`  
Resultados brutos: `artifacts/saas-web-audit-2026-05-23/audit-results.json` e `artifacts/saas-web-audit-2026-05-23/audit-player-admin-results.json`

## Status Em 2026-05-24

Esta auditoria virou contrato visual e foi executada dentro de `SPRINT-24` e da fila `SAAS_FINAL_RESIDUAL_QUEUE_2026_05_24.md`.

Os achados abaixo permanecem como diagnostico historico da auditoria, mas nao devem ser tratados automaticamente como pendencias abertas sem confrontar o estado atual do codigo, os screenshots finais e `EXECUTION_QUEUE.md`.

## Objetivo

Revisar pagina por pagina a experiencia web atual para identificar onde o app ainda nao se comporta como SaaS profissional: excesso de altura, blocos grandes demais, informacao espalhada, listas sem padrao, detalhes abrindo em modal ruim, nomes pouco claros, heroes inconsistentes e paginas que ainda parecem adaptacao de mobile.

O alvo visual agora e mais compacto, linear e direto:

- topo mais baixo e alinhado;
- sidebar objetiva;
- paginas com titulo, acao principal e contexto curto;
- filtros em uma unica barra;
- listas/tabelas densas;
- detalhe em painel lateral, nao modal central quando a tarefa e de consulta/edicao operacional;
- menos cards soltos;
- menos margem e menos arredondamento;
- informacao importante acima da dobra;
- dados longos dentro de areas rolaveis internas, nao fazendo a pagina inteira ficar enorme.

## Cobertura Capturada

### Player App com estado admin autenticado

- `#/inicio`
- `#/jogar`
- `#/eventos`
- `#/eventos/torneios`
- `#/eventos/ligas`
- `#/agenda`
- `#/locais`
- `#/ranking`
- `#/perfil`
- `#/locais/:placeId`

Observacao: a captura com `auth-player-pure.json` caiu na tela de login em todas as rotas. A auditoria valida de Player logado foi refeita com o estado admin autenticado.

### Trabalho / SaaS Web

- `#/gestao`
- `#/gestao/:placeId/inicio`
- `#/gestao/:placeId/agenda?visao=calendario`
- `#/gestao/:placeId/agenda?visao=reservas`
- `#/gestao/:placeId/academia?visao=hoje`
- `#/gestao/:placeId/academia?visao=calendario`
- `#/gestao/:placeId/academia?visao=turmas`
- `#/gestao/:placeId/academia?visao=alunos`
- `#/gestao/:placeId/academia?visao=pendencias`
- `#/gestao/:placeId/clientes?visao=clientes-ativos`
- `#/gestao/:placeId/clientes?visao=leads`
- `#/gestao/:placeId/financeiro?visao=recebiveis`
- `#/gestao/:placeId/financeiro?visao=pagos`
- `#/gestao/:placeId/financeiro?visao=despesas`
- `#/gestao/:placeId/financeiro?visao=planos`
- `#/gestao/:placeId/loja-pos?visao=vender`
- `#/gestao/:placeId/loja-pos?visao=estoque`
- `#/gestao/:placeId/loja-pos?visao=produtos`
- `#/gestao/:placeId/competicoes`
- `#/gestao/:placeId/comunicacao`
- `#/gestao/:placeId/relatorios`
- `#/gestao/:placeId/administracao`

## Diagnostico Global

### 1. O SaaS ainda alterna entre dois padroes visuais

Algumas telas ja estao perto do alvo compacto, principalmente `Agenda`, `Clientes` e `Financeiro > Receber`. Outras ainda parecem antigas ou incompletas: `Local Inicio`, `Comunicacao`, parte de `Loja/POS`, `Academia Hoje`, `Academia Alunos`, `Academia Pendencias` e algumas visoes de `Financeiro`.

Decisao de padrao:

- Todas as paginas de Trabalho devem usar um mesmo contrato visual: `Domain Header compacto -> tabs, se houver -> filtro horizontal -> conteudo principal lista/calendario/tabela + painel lateral`.
- Heroes grandes devem sair das paginas operacionais profundas. A pagina operacional nao precisa de banner; precisa de contexto, acao e area de trabalho.
- Cards de resumo so entram se forem acionaveis ou indispensaveis para decidir. Nao podem empurrar a lista principal para baixo.

### 2. Ha paginas com muita altura por falta de scroll interno

Exemplos medidos:

- `Clientes ativos`: documento com aproximadamente `4084px` de altura.
- `Trabalho Hoje`: documento com aproximadamente `3123px`.
- `Academia Alunos`: documento com aproximadamente `2139px`.
- `Academia Pendencias`: documento com aproximadamente `2152px`.
- `Financeiro Planos`: documento com aproximadamente `2785px`.

Problema:

O usuario perde contexto, a lateral deixa de acompanhar bem e a pagina vira um documento longo. Em SaaS profissional, listas grandes devem ficar em regioes rolaveis internas com cabecalho e painel de detalhe fixos.

Regra:

- Paginas de trabalho web devem preferir altura de viewport.
- Tabela/lista deve rolar dentro do painel.
- Painel lateral deve permanecer visivel.
- Rodapes de metricas abaixo da lista so entram quando forem realmente necessarios.

### 3. Ainda existem detalhes em modal quando deveriam ser painel lateral

Casos principais:

- `Academia > Turmas`: evoluiu para side panel na captura principal, mas o fluxo de edicao ainda pode abrir formulario com area deslocada/scroll ruim em algumas interacoes.
- `Academia > Alunos`: ainda tem comportamento de modal/overlay em parte do fluxo.
- Reservas ja estao melhores com painel lateral, mas esse padrao precisa virar regra para todas as entidades operacionais.

Regra:

- Consulta/edicao operacional de item selecionado deve abrir no painel lateral.
- Modal central fica para confirmacao curta, pagamento, acao destrutiva ou wizard realmente fechado.
- Formularios longos devem ser drawer lateral com secoes, footer fixo e largura adequada.

### 4. Algumas areas estao duplicando responsabilidade

Exemplo atual:

- `Academia > Alunos` lista alunos.
- `Clientes > Clientes ativos` lista clientes/alunos/socios.
- `Financeiro` tambem lista clientes por recebiveis.

Problema:

Isso cria varios pontos de verdade. O usuario nao sabe se deve procurar aluno em Academia, Clientes ou Financeiro.

Decisao proposta:

- `Clientes` deve ser a fonte principal de pessoa/relacionamento 360.
- `Academia > Alunos` deve virar uma visao academica filtrada e enxuta, focada em matricula, turma, contrato de aula e status pedagogico.
- `Financeiro` mostra recebiveis e pagamentos, mas o detalhe deve apontar para Cliente 360.
- Toda lista que representa pessoa deve abrir o mesmo tipo de painel 360, com abas/contexto conforme origem.

### 5. Topbar e sidebar ainda ocupam espaco demais para uma ferramenta de trabalho

O topo esta funcional, mas ainda alto e com controles de tamanhos diferentes. A referencia mais profissional usa topo baixo, alinhado e com botoes mais retos.

Regra:

- Topbar web: altura alvo 56-64px.
- Unidade, busca, criar, seletor Jogador/Trabalho e usuario devem ter altura equivalente.
- O botao `+ Criar` deve abrir command menu contextual.
- O seletor Jogador/Trabalho deve manter posicao e tamanho estaveis.
- Sidebar deve ter itens principais apenas; nada de duplicar modulo interno como menu de segunda camada improvisado.

## Diagnostico Por Area

## Player App

### Inicio

Screenshot: `artifacts/saas-web-audit-2026-05-23/admin-player-inicio.png`

Achados:

- A rota apresentou overflow horizontal: documento com largura maior que viewport (`1848px` em viewport `1600px`).
- Hero existe e tem boa presenca, mas precisa respeitar largura do shell.
- Conteudo abaixo da primeira dobra ainda pode ser compactado para ficar mais proximo da referencia premium dark.

Correcao:

- Eliminar overflow horizontal.
- Travar largura do conteudo no mesmo grid do restante do Player App.
- Revisar componentes com `width`, `min-width` ou carrosseis que vazam.

### Jogar

Screenshot: `artifacts/saas-web-audit-2026-05-23/admin-player-jogar.png`

Achados:

- Pagina esta mais enxuta, mas ainda falta uma hierarquia de SaaS/app consistente: titulo, contexto e opcoes devem parecer uma superficie de decisao, nao bloco isolado.
- Nao foi detectado hero pelo seletor padrao; a pagina precisa usar contrato visual consistente ou seletor semantico melhor.

Correcao:

- Usar `page-intro` compacto com copy publica simples.
- Opcoes principais em cards/botoes lineares de altura semelhante.
- Remover qualquer texto que pareca instrucao interna.

### Competir

Screenshot: `artifacts/saas-web-audit-2026-05-23/admin-player-competir.png`

Achados:

- Ainda precisa separar melhor descoberta do jogador e operacao de organizador.
- Botoes/segmentos devem seguir o mesmo padrao de hover/active do SaaS compacto.
- A pagina e mais longa que precisa para a primeira tarefa.

Correcao:

- Manter `Torneios`, `Ligas`, `Ranking` como entradas claras.
- Qualquer `Modo organizador` deve ficar apenas no Trabalho, nao vazando em Player.
- Resultados e historico devem ser secundarios.

### Agenda Pessoal

Screenshot: `artifacts/saas-web-audit-2026-05-23/admin-player-agenda.png`

Achados:

- A pagina tem um hero/intro de 209px e esta razoavel.
- Precisa manter a simplificacao ja discutida: Aulas e Pagamentos nao devem competir como itens principais se estao dentro da agenda/rotina.

Correcao:

- Renomear ou posicionar `Minha rotina` como area que engloba agenda, aulas, reservas, partidas e pagamentos pessoais.
- Nao duplicar `Aulas` e `Pagamentos` como menu externo principal se estiverem dentro da rotina.

### Perfil

Screenshot: `artifacts/saas-web-audit-2026-05-23/admin-player-perfil.png`

Achados:

- Hero detectado pequeno e deslocado (`329x230`).
- Ja houve apontamento de avatar e textos desalinhados.

Correcao:

- Perfil deve virar header compacto com avatar alinhado, nome, tags e indicadores em grid.
- Abas em uma unica linha compacta.
- Conta/acoes perigosas isoladas visualmente.

## Trabalho / SaaS Web

### Trabalho Hoje

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-central.png`

Achados:

- Documento muito longo (`3123px`) e 106 botoes.
- Falta padrao compacto de primeira dobra: deveria ser cockpit com pendencias prioritarias, agenda em andamento e atalhos curtos.
- Ainda parece uma soma de blocos de varias areas.

Correcao:

- Transformar em dashboard operacional de viewport:
  - linha 1: titulo, contexto, CTA principal;
  - linha 2: 4-5 KPIs acionaveis;
  - linha 3: agenda em andamento + pendencias criticas + clientes/financeiro + competicoes.
- Nao listar tudo. Mostrar prioridades e links para as paginas de trabalho.

### Gestao do Local / Inicio

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-local-inicio.png`

Achados:

- Rota praticamente vazia/incompleta: sem H1, sem hero, sem conteudo significativo.
- Isso quebra a sensacao de SaaS completo.

Correcao:

- Se a rota continuar existindo, deve ser redirecionada para `Trabalho Hoje` ou virar `Visao da unidade`.
- Nao deixar pagina intermediaria vazia.

### Agenda

Screenshots:

- `artifacts/saas-web-audit-2026-05-23/work-agenda-calendario.png`
- `artifacts/saas-web-audit-2026-05-23/work-agenda-calendario-detail.png`
- `artifacts/saas-web-audit-2026-05-23/work-agenda-reservas.png`

Achados positivos:

- Esta e a area mais proxima do alvo atual.
- O painel lateral de detalhe ficou no caminho certo.
- A grade ficou mais compacta e legivel.
- Ha codificacao visual por tipo/status, mas precisa ser documentada e aplicada em todas as paginas.

Problemas:

- Ainda existem metricas duplicadas abaixo da grade, aumentando a altura.
- Controles superiores ainda ocupam mais altura que a referencia ideal.
- A agenda precisa padronizar altura e largura para evitar casos com muitas quadras, mantendo o painel lateral.
- A aba `Reservas` e `Calendario` precisam de fronteira clara: agenda geral mostra todos os usos; reservas mostra apenas reservas e seus estados.

Correcao:

- Fazer Agenda virar o padrao de layout para areas densas:
  - conteudo principal a esquerda;
  - painel lateral fixo a direita;
  - filtros em uma linha;
  - tabs compactas;
  - sem cards soltos abaixo, salvo resumo pequeno.
- Em `Reservas`, remover filtros de professor/turma quando nao forem necessarios para o escopo.
- Em `Agenda geral`, manter tipos como reservas/aulas/bloqueios/competicoes.

### Academia - Hoje

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-academia-hoje.png`

Achados:

- Falta contrato visual de pagina.
- Mistura resumo, aulas do dia, pendencias e contexto em uma pagina ainda menos profissional que Agenda/Clientes.

Correcao:

- `Academia Hoje` deve ser uma fila de operacao academica:
  - aulas de hoje;
  - substituicoes;
  - reposicoes;
  - matriculas pendentes;
  - alertas de professor/turma.
- Sem duplicar conteudo que pertence a `Turmas`, `Alunos` ou `Pendencias`.

### Academia - Calendario

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-academia-calendario.png`

Achados:

- Ainda precisa responder melhor ao caso de varias turmas no mesmo horario, varias quadras e varios professores.
- Nao deve parecer uma agenda por quadra quando a pergunta e academica.

Correcao:

- Criar visoes:
  - por dia/professor;
  - por quadra;
  - por turma;
  - conflitos.
- Para professor, default deve ser dia com horas cheias e aulas dele.
- Para gestor, default pode ser grade de unidade com agrupamento por quadra/professor.

### Academia - Turmas

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-academia-turmas.png`

Achados positivos:

- Lista ficou mais compacta.
- Painel lateral existe e e melhor que modal.

Problemas:

- Painel lateral vazio ocupa muito espaco quando nada esta selecionado.
- Footer de metricas abaixo ainda e redundante.
- A edicao longa ainda precisa ser drawer lateral bem formatado, nao formulario estreito quebrado.
- A pagina ainda traz tabs internas (`Hoje`, `Agenda`, `Turmas`, `Alunos`, `Pendencias`) que podem parecer submenu demais.

Correcao:

- Selecionar automaticamente a primeira turma ou mostrar estado vazio mais util.
- Detalhe da turma no painel lateral com:
  - resumo;
  - alunos;
  - horarios;
  - mensalidade/plano;
  - acoes.
- Edicao em drawer lateral largo com footer fixo.
- Turmas deve ter apenas ferramentas de turmas; pendencias ficam em Pendencias, aulas do dia ficam em Inicio/Hoje.

### Academia - Alunos

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-academia-alunos.png`

Achados:

- Ainda tem modal/overlay em parte do fluxo.
- Conteudo superior repetido com Turmas/Pendencias deixa a pagina confusa.
- A pagina duplica responsabilidades de `Clientes`.

Correcao:

- Remover cards superiores de aulas/pendencias daqui.
- Transformar em lista academica compacta:
  - aluno;
  - turma;
  - professor;
  - status da matricula;
  - pagamento da matricula/aula;
  - proximo passo.
- Selecionar aluno abre Cliente 360/Aluno 360 lateral.
- Edicao da matricula em drawer lateral, nao modal quebrado.

### Academia - Pendencias

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-academia-pendencias.png`

Achados:

- Documento longo e muitos botoes.
- Pendencias precisam parecer uma fila de trabalho, nao cards espalhados.

Correcao:

- Layout de fila:
  - tabs por tipo: matriculas, reposicoes, encaixes, avisos, conflitos;
  - tabela/lista compacta;
  - painel lateral com contexto e acao;
  - filtros por professor/turma/status.

### Clientes

Screenshots:

- `artifacts/saas-web-audit-2026-05-23/work-clientes-ativos.png`
- `artifacts/saas-web-audit-2026-05-23/work-clientes-ativos-detail.png`
- `artifacts/saas-web-audit-2026-05-23/work-clientes-leads.png`

Achados positivos:

- Esta area ja se aproxima mais do padrao SaaS: lista compacta + Cliente 360 lateral.
- Separacao `Clientes ativos` e `Leads` esta correta.

Problemas:

- Pagina inteira fica enorme (`4084px`) porque a lista cresce no documento.
- Muitos registros duplicados por papel/vinculo, o que pode ser tecnicamente explicavel, mas confunde o usuario.
- Cliente 360 esta bom, mas precisa ficar fixo em uma pagina com altura de viewport, nao acompanhar documento infinito.

Correcao:

- Container da lista com scroll interno.
- Agrupar pessoa unica com chips de vinculo: aluno, socio, reserva recorrente, torneio, lead.
- Drawer lateral deve exibir:
  - dados pessoais;
  - vinculos com academia;
  - plano/mensalidade;
  - turmas;
  - reservas;
  - pagamentos;
  - historico;
  - acoes.
- `Leads` deve ter o mesmo padrao de lista + detalhe.

### Financeiro

Screenshots:

- `artifacts/saas-web-audit-2026-05-23/work-financeiro-recebiveis.png`
- `artifacts/saas-web-audit-2026-05-23/work-financeiro-pagos.png`
- `artifacts/saas-web-audit-2026-05-23/work-financeiro-despesas.png`
- `artifacts/saas-web-audit-2026-05-23/work-financeiro-planos.png`

Achados positivos:

- `Receber` tem uma estrutura SaaS boa: resumo + filtros + tabela + painel lateral.

Problemas:

- `Receber` tem 141 botoes e 119 linhas, indicando densidade/acoes demais no DOM sem paginacao/scroll interno suficiente.
- `Pagos` parece rota incompleta ou com conteudo insuficiente.
- `Planos` e `Despesas` ainda estao mais longos que deveriam.
- Financeiro precisa consolidar nomenclatura: receber, pagos, despesas, planos/contratos, relatorios.

Correcao:

- Padrao unico de financeiro:
  - header compacto;
  - metricas essenciais;
  - tabs;
  - tabela com scroll interno;
  - detalhe lateral;
  - modal simples de pagamento provisorio.
- `Pagar` deve persistir e atualizar fonte correta, evitando retorno para pendente ao refresh.
- Toda cobranca deve apontar para Cliente 360.

### Loja/POS

Screenshots:

- `artifacts/saas-web-audit-2026-05-23/work-loja-vender.png`
- `artifacts/saas-web-audit-2026-05-23/work-loja-estoque.png`
- `artifacts/saas-web-audit-2026-05-23/work-loja-produtos.png`

Achados:

- Algumas rotas ainda parecem leves/incompletas para SaaS.
- POS deveria ser fluxo de venda rapida, nao lista administrativa.

Correcao:

- `Vender`: caixa rapido com busca/produtos/carrinho/resumo/pagamento.
- `Estoque`: tabela compacta com baixo estoque, ajustes e historico.
- `Produtos`: cadastro/lista com drawer lateral.

### Competicoes Trabalho

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-competicoes.png`

Achados:

- Ainda tem hero detectado abaixo (`y416`), sinal de que a primeira dobra pode estar desperdicada.
- Precisa seguir o mesmo padrao de hub operacional que Agenda/Financeiro.

Correcao:

- Hub de competicoes deve ser:
  - competicoes com bloqueio agora;
  - tabs torneios/ligas/finalizadas;
  - lista compacta por fase;
  - detalhe lateral da competicao;
  - CTA criar torneio/liga.

### Comunicacao

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-comunicacao.png`

Achados:

- Rota praticamente vazia/incompleta.

Correcao:

- Criar central de comunicacao:
  - modelos WhatsApp;
  - mensagens recentes;
  - pendentes de envio;
  - contexto por reserva/aula/financeiro/torneio;
  - historico.

### Relatorios

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-relatorios.png`

Achados:

- Ainda leve para uma area de relatorios, mas nao precisa ser foco central agora.
- Deve existir como camada secundaria, nao competir com operacao.

Correcao:

- Padrao relatorios: cards pequenos + lista de relatorios + filtros + detalhe/exportacao.
- Nao criar dashboard pesado antes dos fluxos operacionais ficarem bons.

### Administracao

Screenshot: `artifacts/saas-web-audit-2026-05-23/work-administracao.png`

Achados:

- Tem contrato melhor que outras paginas, mas ainda precisa separar setup raro de operacao.

Correcao:

- Administracao deve conter:
  - unidade;
  - quadras;
  - horarios;
  - regras;
  - equipe;
  - permissoes futuras;
  - templates;
  - integracoes futuras.
- Nao deve haver rotina diaria aqui.

## Padrao Obrigatorio De Paginas SaaS Web

### Layout Base

```txt
Sidebar fixa
Topbar compacta
Main com largura util
  Header da area
  Tabs da area, se existirem
  Barra de filtros/acoes
  Workbench
    Lista/tabela/calendario
    Painel lateral de detalhe
```

### Header da Area

Deve conter:

- categoria curta: `OPERACAO`, `GERENCIAMENTO`, `RECEITA`, `ADMINISTRACAO`;
- titulo direto;
- subtitulo de uma linha;
- CTA primario a direita quando existir;
- sem banner grande em paginas de trabalho denso.

### Tabs

Tabs so entram se mudam a visao do mesmo dominio.

Nao usar tabs para:

- duplicar menu lateral;
- esconder tarefa diaria;
- simular submenu confuso;
- misturar dominios.

### Filtros

Uma linha unica:

- data;
- tipo;
- status;
- busca;
- filtros avancados;
- acao principal.

Se passar de uma linha em desktop, precisa revisar.

### Lista/Tabela

Padrao:

- altura de linha compacta;
- cabecalho fixo;
- scroll interno;
- clique seleciona e abre detalhe lateral;
- acoes primarias no painel lateral;
- lista nao deve alongar a pagina para milhares de pixels.

### Painel Lateral

Obrigatorio para:

- cliente;
- reserva;
- turma;
- aluno/matricula;
- recebivel;
- produto;
- competicao;
- lead;
- pendencia.

Conteudo:

- titulo;
- status;
- dados principais;
- CTAs;
- historico curto;
- links para detalhe completo quando necessario.

## Fila De Melhorias Gerada Pela Auditoria

Status de execucao em 2026-05-23:
`AUDIT-01` a `AUDIT-09` foram aplicados nesta rodada como endurecimento visual e operacional. A area Trabalho recebeu o contrato SaaS compacto e o Player App foi revalidado contra overflow/vazamento visual. Rotas que eram candidatas a vazio (`Comunicacao`, `Loja/POS`, `Relatorios`) foram conferidas com conteudo real, CTA e painel/lista.

Evidencias principais:

- Agenda compacta com detalhe lateral: `artifacts/saas-sprint-screens/sprint-106-agenda-detail-clean-1600.png`.
- Clientes/Pessoa 360 compacto: `artifacts/saas-sprint-screens/sprint-105-clientes-v3b-1600.png`.
- Alunos em lista densa: `artifacts/saas-sprint-screens/sprint-106-academia-alunos-clean-1600.png`.
- Player Inicio sem overflow: `artifacts/saas-sprint-screens/sprint-109-player-inicio-overflow-fixed-1366.png`.
- QA de rotas Trabalho: `artifacts/saas-sprint-screens/sprint-103-route-audit.json`.

### AUDIT-01 - Padronizar shell compacto

Objetivo: reduzir topo/sidebar e padronizar botoes.

Alteracoes:

- topbar 56-64px;
- controles com altura equivalente;
- botao `+ Criar` alinhado;
- seletor Jogador/Trabalho fixo;
- sidebar com grupos e itens principais.

Aceite:

- nenhuma pagina com topo desalinhado;
- botoes da topbar com mesma altura;
- main com mais area util acima da dobra.

### AUDIT-02 - Criar contrato unico de pagina SaaS

Objetivo: todas as areas Trabalho usarem a mesma estrutura.

Alteracoes:

- componente de `SaaSPageHeader`;
- `SaaSWorkbench`;
- `SaaSFilterBar`;
- `SaaSSidePanel`;
- tokens de gap, radius e densidade.

Aceite:

- Agenda, Clientes, Financeiro, Academia, Loja, Competicoes, Comunicacao e Administracao compartilham linguagem.

### AUDIT-03 - Agenda como referencia de workbench

Objetivo: consolidar Agenda como padrao compacto.

Alteracoes:

- remover metricas duplicadas abaixo;
- preservar painel lateral;
- ajustar filtros por escopo;
- corrigir visao semana/lista/canceladas/conflitos para funcionarem ou ocultar ate existir.

Aceite:

- sem controles falsos;
- painel lateral sempre limpo;
- calendario sem vazamento;
- varios courts cabem com scroll horizontal controlado sem cortar coluna.

### AUDIT-04 - Reestruturar Academia por dominio real

Objetivo: tirar resumo repetido das subpaginas e deixar cada visao com responsabilidade clara.

Alteracoes:

- `Hoje`: operacao academica do dia;
- `Turmas`: lista compacta + detalhe lateral;
- `Alunos`: visao academica de matricula, vinculada ao Cliente 360;
- `Pendencias`: fila de trabalho;
- `Calendario`: grade por dia/professor/quadra.

Aceite:

- Turmas e Alunos sem hero/cards repetidos;
- detalhe lateral em vez de modal;
- edicao em drawer lateral largo;
- pendencias centralizadas.

### AUDIT-05 - Consolidar Clientes como Pessoa 360

Objetivo: reduzir duplicidade e tornar Clientes a fonte principal.

Alteracoes:

- agrupar pessoa unica;
- chips de vinculo;
- lista com scroll interno;
- detalhe lateral fixo;
- Leads com mesmo padrao.

Aceite:

- nenhum cliente duplicado visualmente sem explicacao;
- painel mostra plano, turmas, reservas, pagamentos e historico;
- lista nao aumenta pagina para 4000px.

### AUDIT-06 - Financeiro compacto e persistente

Objetivo: profissionalizar fluxo financeiro.

Alteracoes:

- receber/pagos/despesas/planos com tabela + detalhe;
- modal provisorio de pagamento unico;
- persistencia real do pago;
- vinculo com Cliente 360.

Aceite:

- marcar pago permanece apos refresh;
- pagos mostra dados reais;
- recebiveis nao tem DOM enorme sem controle.

### AUDIT-07 - Completar rotas vazias/incompletas

Rotas prioritarias:

- `Gestao do Local / Inicio`;
- `Comunicacao`;
- partes de `Loja/POS`;
- `Financeiro Pagos`.

Aceite:

- nenhuma rota principal abre vazia;
- toda rota tem titulo, objetivo, conteudo e proximo passo.

### AUDIT-08 - Player App: corrigir overflow e menus duplicados

Objetivo: manter Player simples e sem vazamento de Trabalho.

Alteracoes:

- corrigir overflow horizontal do Inicio;
- remover duplicidade de Aulas/Pagamentos se ficam dentro de Minha Rotina;
- impedir vazamento de operacao/organizador em Competir.

Aceite:

- Player sem overflow horizontal;
- menu jogador limpo;
- nenhuma ferramenta de trabalho aparece indevidamente.

### AUDIT-09 - QA visual obrigatorio por rota

Objetivo: impedir regressao.

Validar:

- desktop 1600x900;
- desktop 1366x768;
- mobile 430px;
- console;
- overflow horizontal;
- h1/titulo;
- topbar;
- primeira dobra;
- lista/tabela;
- painel lateral.

Aceite:

- screenshot registrado para cada rota principal;
- console sem erro;
- nenhum controle visualmente presente sem funcionar.

## Decisoes De Produto Recomendadas

1. Web Trabalho deve ser tratado como SaaS denso, nao como app mobile expandido.
2. O padrao `lista/tabela/calendario + detalhe lateral` deve dominar paginas operacionais.
3. Cards grandes devem ficar restritos a dashboards ou metricas realmente acionaveis.
4. Paginas internas nao devem ter heroes grandes; devem ter headers compactos.
5. Tudo que for detalhe de entidade deve abrir lateralmente.
6. Modais devem ser excecao.
7. Listas grandes devem ter scroll interno, paginacao ou virtualizacao.
8. Cliente 360 deve ser o centro de pessoa, e Academia/Financeiro devem abrir esse contexto quando lidam com pessoas.
9. Rotas vazias precisam ser resolvidas antes de novas features.
10. Tabs que nao funcionam devem ser implementadas ou removidas temporariamente.

## Proxima Rodada Recomendada

Executar `AUDIT-01` e `AUDIT-02` primeiro, pois eles criam a base visual compacta e impedem que cada pagina seja corrigida de um jeito diferente.

Depois seguir:

1. `AUDIT-03` Agenda;
2. `AUDIT-04` Academia;
3. `AUDIT-05` Clientes;
4. `AUDIT-06` Financeiro;
5. `AUDIT-07` rotas incompletas;
6. `AUDIT-08` Player;
7. `AUDIT-09` QA final.

Essa ordem evita retrabalho: primeiro padrao estrutural, depois paginas.
