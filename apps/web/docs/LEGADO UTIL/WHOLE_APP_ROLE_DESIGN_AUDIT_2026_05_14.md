# Whole App Role Design Audit - 2026-05-14

Fonte local: `CURRENT_PRODUCT_STATE.md`, `PAGE_SWEEP_UX_AUDIT_2026_05_14.md`, `MOBILE_FRICTION_REPORT.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`, `PREMIUM_UX_VISUAL_LANGUAGE.md`, rotas/componentes em `web/src`, e screenshots autenticados em `web/docs/screenshots/whole-app-role-audit-2026-05-14/`.

Fonte de mercado usada como referencia: screenshots enviados pelo usuario de apps concorrentes, Playtomic, CourtReserve, MATCHi, PlayByPoint, OpenCourt, Anolla, RacketPal e UTR Sports.

## Evidencias Locais Capturadas

Screenshots autenticados foram gerados em mobile 390px para tres papeis:

- Jogador puro: `player-inicio-mobile.png`, `player-locais-mobile.png`, `player-eventos-mobile.png`, `player-ranking-mobile.png`, `player-perfil-mobile.png`, `player-gestao-mobile.png`.
- Professor/staff: `coach-inicio-mobile.png`, `coach-locais-mobile.png`, `coach-eventos-mobile.png`, `coach-ranking-mobile.png`, `coach-perfil-mobile.png`, `coach-gestao-mobile.png`.
- Admin/gestor: `owner-inicio-mobile.png`, `owner-locais-mobile.png`, `owner-eventos-mobile.png`, `owner-ranking-mobile.png`, `owner-perfil-mobile.png`, `owner-gestao-mobile.png`.
- Desktop de competicoes: `player-eventos-desktop.png`, `coach-eventos-desktop.png`, `owner-eventos-desktop.png`.

Observacao tecnica: a captura local confirmou sessao real via Supabase para os tres papeis. Em `Gestao`, o admin aparece com estado de carregamento/sem locais acessiveis na primeira dobra; isso tambem e evidencia de fragilidade operacional e deve ser revalidado apos corrigir dados/permissoes do seed.

## Diagnostico Executivo

O app ja possui boa parte das capacidades certas, mas a experiencia ainda parece mais complexa do que deveria porque o front-end expoe a estrutura interna do sistema. O jogador, o professor, o financeiro e o gestor ainda recebem telas que parecem montadas por blocos de produto, nao por intencao humana.

O problema nao e somente visual. E uma combinacao de:

- informacao demais antes da acao;
- cards demais para tarefas que deveriam ser linhas, chips, sheets ou CTAs;
- KPIs e resumos aparecendo para usuarios que nao decidiram analisar nada;
- menus secundarios empurrados por cabecalhos/resumos;
- fluxo de jogador usando linguagem de cockpit operacional;
- formulario complexo sem narrativa de decisao;
- papeis diferentes compartilhando quase a mesma densidade de interface;
- mobile tratado como desktop empilhado.

O DNA correto para o ATP deveria ser: produto poderoso por dentro, simples por fora. O usuario comum deve sentir "sei o que fazer agora"; o gestor deve sentir "limpei a fila"; o professor deve sentir "vejo minhas aulas e meus alunos"; o financeiro deve sentir "sei quem cobrar".

## O DNA Medio Dos Apps Que Parecem Melhores

Os apps de mercado analisados, especialmente os exemplos enviados e materiais publicos de Playtomic, CourtReserve, MATCHi, PlayByPoint, OpenCourt, Anolla, RacketPal e UTR, seguem alguns padroes fortes:

1. A tela do jogador e orientada por intencao: reservar, jogar, competir, ver meus jogos, ver meus locais.
2. O primeiro viewport quase nunca tenta mostrar tudo. Ele cria uma proxima acao obvia.
3. O conteudo administrativo fica fora do caminho do jogador.
4. O mobile usa sheets, tabs, filtros compactos, sticky CTA e listas simples.
5. Cards existem, mas geralmente representam uma entidade clara: evento, local, jogo, inscricao, reserva.
6. O detalhe so aparece quando o usuario pede.
7. Dados de progresso existem, mas nao dominam a experiencia.
8. Listas longas usam rows com avatar, titulo, metadados e chevron.
9. Fluxos complexos viram etapas curtas, com progresso visivel.
10. O design usa menos moldura e mais hierarquia: tipografia, espacamento, imagem real, acao fixa.

Isso e coerente com a documentacao publica: Playtomic orienta reserva a partir de "Book a court" e open matches no contexto do clube; CourtReserve destaca reserva, registro e pagamento no app mobile; MATCHi descreve reservar quadras/atividades e acompanhar ligas no app; PlayByPoint usa Discover para encontrar quadras, programas e partidas proximas; Anolla fala em visao rapida de horarios livres, treinos, partidas privadas e torneios em poucos toques.

Fontes:

- Playtomic Help - booking/open match: https://playerhelp.playtomic.com/hc/en-gb/articles/19831715222929-How-to-book-a-court-or-a-spot-in-a-match-in-your-favourite-Club
- Playtomic Help - make reservation: https://playerhelp.playtomic.com/hc/en-gb/articles/19831881490449-How-to-make-a-reservation-in-Playtomic-app
- CourtReserve mobile: https://courtreserve.com/mobile/
- CourtReserve player booking: https://help.courtreserve.com/en/articles/10946306-players-how-to-book-a-court-mobile-app
- MATCHi venue/player app: https://playmore.matchi.com/get-matchi
- PlayByPoint Discover: https://help.playbypoint.com/en/articles/12288524-discover-find-facilities-programs-and-matches-near-you
- OpenCourt: https://www.opencourt.co/
- Anolla tennis software: https://anolla.com/en/tennis-software
- RacketPal: https://www.racketpal.co.uk/

## Comparacao Visual: Mercado vs ATP Hoje

### Mercado

Nos screenshots enviados, a experiencia do jogador tem:

- topo claro com titulo curto;
- tabs visiveis logo no topo;
- conteudo agrupado por tarefa;
- bottom sheets para decisao curta;
- sticky CTA para confirmar inscricao/reserva;
- listas com row e chevron;
- cards de evento/local com imagem quando a entidade precisa ser reconhecida;
- pouca explicacao textual permanente;
- uso forte de branco/off-white, preto/cinza e uma cor de acao;
- pouca competicao entre botoes.

### ATP Local

Nos screenshots locais:

- `player-inicio-mobile.png`: o Player App ja tenta separar papeis, mas a primeira dobra ainda empilha hero + CTA + "Agora" + "Agenda" + "Clube" + atalhos. Para um jogador, isso parece mais painel do que app de jogar.
- `player-locais-mobile.png`: a intencao esta correta, mas a tela explica demais e usa cards grandes com textos longos. O concorrente tende a resolver isso com chips/sheets e CTA direto.
- `owner-eventos-mobile.png`: a separacao Jogando/Organizando/Descobrir e boa, mas a tela ainda transforma o hub em fila operacional com cards pesados logo abaixo. Para o admin faz sentido existir fila, mas ela precisa morar em modo organizador, nao competir com descoberta.
- `player-ranking-mobile.png`: visualmente impactante, mas parece dashboard competitivo; para jogador comum, ranking deveria abrir com "minha posicao", filtros leves e lista. Os KPIs globais podem virar detalhe.
- `owner-gestao-mobile.png`: mostra o risco classico do app: resumo/KPIs no topo, scroll horizontal parcial e um grande vazio de carregamento. Em operacao profissional, vazio e loading precisam parecer intencionais, nao tela quebrada.

## Por Que Parece Complexo E Baguncado

### 1. A gramatica de cards vazou para quase tudo

O CSS e os componentes usam muitos padroes de `card`, `panel`, `summary`, `kpi`, `overview`, `hero` e `grid`. Isso cria uma sensacao de produto "montado em blocos", mesmo quando a tarefa seria simples.

Card deve representar entidade ou resumo de alto valor. Rotina diaria deveria ser row, sheet, drawer ou CTA.

### 2. A tela explica o sistema em vez de conduzir a acao

Em `/locais`, por exemplo, o texto "sao buscas diferentes..." e correto, mas ainda coloca carga cognitiva no usuario. Melhor seria perguntar a intencao com tres opcoes compactas:

- Reservar quadra
- Entrar em aula
- Encontrar jogo

Depois disso, a tela mostra somente o filtro e os resultados daquele caminho.

### 3. O app ainda mistura papel com capacidade

Um usuario pode ter capacidade de gestor, mas isso nao significa que o Player App dele deva virar uma central profissional. A capacidade deve habilitar uma entrada discreta para gestao; nao transformar a experiencia principal.

### 4. Mobile empilha decisoes que deveriam virar sheets

Filtros, selecao de data/local, escolha de categoria, confirmacao de inscricao e busca de horario deveriam abrir em bottom sheets ou telas curtas. Hoje muitas areas ainda exibem filtros, resumo, lista e detalhes no mesmo fluxo vertical.

### 5. Menus secundarios chegam tarde

Em telas de torneio/liga/gestao, resumos no topo empurram tabs e submenus para baixo. Nos concorrentes, tabs ou filtros ficam imediatamente proximos ao titulo, e o resumo aparece dentro da aba ou em bloco recolhido.

### 6. O design usa peso visual alto demais em elementos comuns

Titulos muito grandes, cards com borda, fundo verde claro, uppercase e botoes grandes aparecem em excesso. Isso reduz contraste hierarquico porque tudo parece importante.

### 7. Funcoes internas aparecem como produto final

O app tem backend e ferramentas fortes, mas o front-end as vezes mostra a ferramenta em vez da tarefa:

- "ranking competitivo" antes de "minha posicao";
- "central de descoberta" antes de "o que voce quer fazer";
- "organizando agora" misturado com hub de eventos;
- KPIs de gestao antes da fila de trabalho;
- formularios longos antes da decisao guiada.

## Cores, Fonte E Linguagem Visual

O app tem um DNA visual proprio: navy, verde, off-white, bordas claras, tipografia pesada. Ele pode funcionar, mas hoje esta sendo usado sem descanso visual suficiente.

Recomendacao:

- manter navy e verde como assinatura ATP;
- reduzir o verde claro como fundo dominante;
- usar verde principalmente como acao/estado positivo;
- usar branco/off-white limpo nas telas player;
- reservar navy escuro/hero para momentos de destaque real;
- reduzir uppercase em labels comuns;
- usar peso 700/800 apenas para titulos e primarias;
- deixar metadados em cinza, nao em negrito;
- reduzir bordas de cards repetidas;
- usar separadores leves em listas;
- sticky CTA no mobile para acao principal.

O resultado desejado nao e copiar Playtomic ou MATCHi. E manter o ATP mais brasileiro/profissional, mas com fluidez parecida: menos moldura, menos explicacao, mais acao.

## Area Por Area

### 1. App Shell E Navegacao

Problema atual:

- Bottom nav muda por acesso, mas ainda mostra muitos conceitos de produto: Player App, Competition OS, Gestao.
- Para multi-papel, jogador e gestor coexistem muito proximos.

Direcao:

- Navegacao do jogador: Inicio, Jogar, Reservar/Locais, Competir, Perfil.
- Entrada para Gestao/Organizar deve ser discreta e contextual, nao uma aba que concorre com "jogar".
- Em mobile, cada modo deveria ter shell proprio:
  - Player Shell: leve, consumidor.
  - Organizer Shell: fila de competicoes.
  - Management Shell: operacao do local.

Impacto:

- Menos confusao entre jogar, organizar e operar.
- Menos carga mental no jogador comum.

### 2. Inicio Do Jogador

Problema atual:

- Mesmo quando a tela esta tecnicamente correta, ela parece um painel: compromisso, agora, agenda, clube, competir, jogar.
- O jogador precisa pensar "qual desses blocos importa?".

Direcao:

- Primeira dobra deve ter:
  - proximo compromisso, se existir;
  - uma unica acao primaria;
  - ate tres atalhos pequenos.
- Se nao houver compromisso:
  - "O que voce quer fazer hoje?" com 3 opcoes: reservar, jogar, competir.
- Avisos, creditos, reposicoes e pagamentos so aparecem se forem acionaveis agora.

Remover da primeira dobra:

- cards de resumo sem acao;
- informacao de clube que nao exige decisao;
- duplicidade entre "Agora" e "Agenda".

### 3. Locais / Reserva / Aulas

Problema atual:

- A arquitetura por intencao e boa, mas ainda parece explicativa e pesada.
- O jogador ve textos longos e cards grandes antes de resultado concreto.

Direcao:

- `/locais` deve ser descoberta leve.
- Ao escolher uma intencao, entrar em fluxo:
  - Reservar quadra: cidade/local + data + horario -> slots -> confirmar.
  - Entrar em aula: nivel + dia + local -> turma com vaga -> solicitar.
  - Encontrar jogo: esporte + local + nivel -> jogos/chamadas -> entrar/criar.
- Usar bottom sheets para filtros.
- Usar cards somente para locais/slots reais; opcoes de intencao podem ser tiles menores.

Regra:

- Jogador nao mensalista nao deve ver planos/mensalidades/gestao da academia como conteudo principal.

### 4. Competicoes Para Jogador

Problema atual:

- Hub atual separa Jogando, Organizando e Descobrir, mas para admin/multi-papel ainda parece central operacional.
- Evento publico precisa parecer evento, nao cockpit.

Direcao:

- Para jogador:
  - Meus jogos
  - Eventos abertos
  - Minhas inscricoes
  - Resultado pendente, se existir
- Evento publico:
  - poster/imagem;
  - data/local/status;
  - tabs: Evento, Categorias, Inscritos/Jogos;
  - CTA sticky "Inscrever-se" ou "Ver meus jogos".
- Categoria:
  - inscricoes e vagas;
  - lista de inscritos;
  - regras resumidas;
  - CTA.

Nao mostrar:

- KPIs de organizador;
- tarefas de publicacao;
- fila de inscricoes para quem esta apenas jogando.

### 5. Organizador De Torneios E Ligas

Problema atual:

- Criar torneio/liga e complexo e parece formulario de banco de dados.
- Menus e etapas nao ficam evidentes; resumos superiores competem com configuracao.

Direcao:

- Criacao rara/complexa deve ser wizard de setup:
  1. Basico: nome, local, data, visibilidade.
  2. Inscricoes: prazo, taxa, limite, pagamento.
  3. Categorias: classes, genero, vagas, regras.
  4. Formato: grupos/mata-mata/liga, sets, pontuacao.
  5. Agenda/quadras: disponibilidade, duracao, distribuicao.
  6. Revisar e publicar.
- Operacao diaria nao deve ser wizard:
  - aprovar inscricoes;
  - gerar jogos;
  - resolver resultado;
  - comunicar jogadores;
  - publicar chave.

Resumo deve ser lateral/colapsado, nao empurrar menu principal.

### 6. Ligas

Problema atual:

- Liga exige mais explicacao que torneio, mas isso nao precisa virar pagina longa.

Direcao:

- Player ve:
  - como funciona;
  - jogadores;
  - classificacao;
  - meus jogos;
  - CTA de entrar.
- Organizador ve:
  - rodada atual;
  - partidas pendentes;
  - resultado/WO;
  - ranking;
  - configuracao recolhida.

### 7. Ranking

Problema atual:

- A tela abre como ranking geral com KPIs globais grandes.
- Para jogador comum, isso parece informacao institucional, nao utilidade pessoal.

Direcao:

- Primeiro bloco: minha posicao, minha cidade/classe, proxima meta.
- Depois: filtros simples.
- Depois: lista.
- KPIs globais podem ir para detalhe/rodape.

### 8. Perfil

Problema atual:

- Perfil tende a acumular identidade, historico, configuracao, esportes e preferencias.

Direcao:

- Separar:
  - Meu perfil publico;
  - Minhas preferencias de jogo;
  - Historico esportivo;
  - Conta e notificacoes.
- Para jogador, perfil nao deve virar dashboard.
- Para professor, perfil profissional deve ser outra area ou submodo.

### 9. Professor / Coach

Problema atual:

- Professor nao deve herdar uma gestao completa se ele so precisa operar aulas, alunos e agenda.

Direcao:

- Home do professor:
  - minhas aulas hoje;
  - meus alunos;
  - chamadas pendentes;
  - pagamentos/comissao apenas se habilitado.
- Nao mostrar:
  - cantina;
  - CRM pesado;
  - financeiro completo;
  - configuracao do local;
  - operacao empresarial que ele nao usa.

### 10. Gestao De Academia/Clube

Problema atual:

- A parte de gestao pode ser densa, mas ainda precisa ser operacional.
- Resumos e KPIs no topo podem atrasar a tarefa.

Direcao:

- Ordem no mobile:
  1. seletor de modulo/subvisao;
  2. fila de trabalho;
  3. lista operacional;
  4. KPIs e relatorios recolhidos.
- Agenda, Academia, Financeiro, CRM e Cantina devem ter responsabilidade unica.
- Sem duplicar entidades em cards diferentes.

### 11. Financeiro

Problema atual:

- Financeiro deve responder "quem cobrar agora", nao abrir como relatorio.

Direcao:

- Primeira dobra:
  - recebiveis vencidos/hoje;
  - marcar pago;
  - enviar lembrete;
  - filtros por origem.
- Relatorios e KPIs ficam depois.
- Jogador so ve propria cobranca, se houver.

### 12. CRM / Clientes

Problema atual:

- CRM pode parecer excesso para locais pequenos.

Direcao:

- Fila simples:
  - leads para responder;
  - follow-up de hoje;
  - contatos sem retorno.
- Detalhe em drawer.
- WhatsApp como secundario, nao como substituto de fluxo.

### 13. Cantina / POS

Problema atual:

- Se o modulo esta desativado, nao deve aparecer no painel.
- Se ativado, deve ser venda rapida e estoque.

Direcao:

- Vender produto;
- estoque baixo;
- vendas do dia;
- cadastro/relatorio em area secundaria.

### 14. Paginas Publicas

Problema atual:

- Pagina publica nao pode vazar cockpit.

Direcao:

- Local publico vende confianca e acao:
  - reservar;
  - entrar em aula;
  - ver eventos;
  - seguir/contato.
- Evento publico vende inscricao e acompanhamento.

## Arquitetura De Produto Recomendada

### Separar por relacao do usuario, nao apenas role

O mesmo usuario pode ser jogador, professor, organizador e gestor. O app deve decidir a superficie pelo contexto atual:

- `player`: quer jogar/reservar/competir.
- `student`: quer ver aulas, faltas, reposicoes, pagamentos proprios.
- `coach`: quer aulas, alunos, chamada, agenda.
- `organizer`: quer operar competicoes.
- `frontdesk`: quer agenda, fila, check-in.
- `finance`: quer cobranca.
- `manager`: quer configuracao e supervisao.

### Buscar menos dado por superficie

Nao basta esconder visualmente. O front-end deve carregar dados pelo contexto:

- Player App nao precisa buscar CRM, cantina, todos os pagamentos ou configuracao.
- Coach nao precisa carregar modulo empresarial completo.
- Local publico nao precisa carregar cockpit.

### Criar grammar de componentes por modo

Player:

- `PlayerIntentTile`
- `PlayerCommitmentCard`
- `PlayerVenueCard`
- `PlayerEventCard`
- `PlayerFilterSheet`
- `PlayerStickyCTA`
- `PlayerSimpleRow`

Management:

- `OperationalQueueRow`
- `DenseEntityRow`
- `ManagementDrawer`
- `KpiStripCollapsed`
- `ModuleSubnav`

Competition:

- `CompetitionPlayerCard`
- `CompetitionOrganizerRow`
- `SetupStepShell`
- `RegistrationStatusBar`
- `MatchActionRow`

## Regras De Design Para Proximos Sprints

1. Uma tela mobile deve ter uma pergunta principal.
2. Uma primeira dobra deve ter no maximo uma acao primaria.
3. O usuario nao deve ver KPI se ele nao precisa tomar decisao com aquele KPI.
4. Dados administrativos nao aparecem no Player App.
5. Configuracao rara vira wizard; rotina vira row/drawer.
6. Card grande so para entidade importante ou conversao.
7. Lista operacional e row, nao card.
8. Filtros complexos viram bottom sheet.
9. Menus/tabs devem aparecer antes de resumo.
10. Sticky CTA em confirmacao, inscricao, reserva e checkout.
11. A cor de acao deve ser rara o suficiente para guiar.
12. Estados vazios devem ser curtos e acionaveis.

## Backlog Proposto De Reorganizacao

### ROLE-UX-00 - Matriz de visibilidade por relacao

Definir para cada superficie quais dados e acoes aparecem para jogador, aluno, professor, recepcao, financeiro, organizador e gestor.

### PLAYER-UX-01 - Home leve por intencao

Transformar `/inicio` em tela de proxima acao + tres intencoes. Remover duplicidade entre Agora/Agenda/Clube quando nao houver tarefa acionavel.

### PLAYER-UX-02 - Locais como fluxo de intencao

Reduzir texto e transformar escolha de intencao em tiles compactos + sheets de filtro. Resultado deve ser slot/turma/jogo, nao explicacao.

### PLAYER-UX-03 - Reserva mobile

Criar fluxo leve: onde/quando -> disponibilidade -> confirmacao. Usar sticky CTA e bottom sheet.

### COMP-PLAYER-01 - Evento publico mobile

Reorganizar evento para jogador com poster, status, tabs visiveis, categorias e CTA sticky.

### COMP-SETUP-01 - Wizard de criacao de torneio

Reorganizar formulario complexo em etapas logicas de setup.

### COMP-SETUP-02 - Wizard de criacao de liga

Reorganizar liga em etapas: basico, jogadores/classes, regras, agenda, pontuacao, publicar.

### COMP-OPS-01 - Separar organizador de jogador

Fila operacional de organizador deve viver em modo Organizar, nao disputar com descoberta e inscricao do jogador.

### RANKING-UX-01 - Ranking centrado no jogador

Abrir com minha posicao e filtros uteis; mover KPIs globais para detalhe.

### PROFILE-UX-01 - Perfil simples por finalidade

Separar identidade, preferencias esportivas, historico e conta.

### MGMT-UX-01 - Shell operacional mobile

Colocar subnav/fila antes de KPIs; esconder modulos sem permissao/plano; corrigir vazios e loadings.

### COACH-UX-01 - Modo professor

Professor ve aulas, alunos, chamada e agenda. Nao ve operacao empresarial sem permissao explicita.

## Criterio De Sucesso

O app estara mais proximo do mercado quando:

- jogador comum consegue reservar/competir/jogar sem ler painel;
- primeira dobra do Player App nao parece dashboard;
- gestor resolve pendencias por fila;
- professor ve somente rotina dele;
- formularios complexos parecem setup guiado;
- mobile nao empilha desktop;
- menus secundarios nao ficam enterrados;
- informacao de plano/permissao nao aparece para quem nao precisa;
- o design parece calmo, moderno e acionavel.

