# Role Based Restructure Queue

Data: 2026-05-15

Fonte: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`, `ROLE_VISIBILITY_MATRIX.md`, `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`, `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`, `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `PLAYER_APP_V2_UX_PLAN.md`, `COMPETITION_OS_V2_UX_PLAN.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`, `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`.

## Como Usar

Esta fila orienta a reestruturacao do app inteiro. Ela deve ser executada em ordem, sem pular para refinamentos visuais locais antes de consolidar a separacao por papel/intencao.

MDs historicos devem ser usados como inventario funcional, nao como arquitetura visual a preservar. Quando houver conflito entre uma tela antiga e a direcao v2, siga `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`.

Comando futuro esperado:

```text
Continue a Role Based Restructure Queue pelo proximo item.
```

## Regras

- Nao remover funcao existente.
- Nao mostrar ferramenta profissional para jogador comum.
- Nao transformar rotina diaria em wizard.
- Nao deixar acao falsa sem backend.
- Nao criar redesign isolado que quebre o DNA visual do app.
- Nao trazer de volta padroes antigos que a v2 esta removendo: dashboard pesado para jogador, card empilhado sem acao, formulario longo de setup, tabs escondidas, modulo sem permissao, KPI sem utilidade.
- Preservar funcao, regra e backend; substituir organizacao visual quando ela conflitar com o plano v2.
- Atualizar MDs ao final de cada task.
- Validar mobile 390px em toda task de player/mobile.
- Rodar lint/build quando houver codigo.

## Fase 0 - Fundacao

### [x] ROLE-UX-00 - Matriz de visibilidade por relacao

Objetivo:

- Criar fonte tecnica/UX unica para o que cada relacao pode ver: jogador, aluno, socio, professor, recepcao, financeiro, organizador e gestor.

Entregas:

- revisar `PROFILE_PLAN_ACCESS_MODEL.md`;
- mapear menus por papel/plano;
- mapear dados que cada superficie pode buscar;
- definir quando `Gestao` e `Organizar` aparecem;
- documentar bloqueios de rota e estados vazios.

Criterios:

- jogador puro nao ve gestao;
- professor nao ve cantina/CRM/financeiro completo sem permissao;
- organizador sem local nao ve Management OS;
- cada permissao tem efeito visual e de dados.

Entregue em 2026-05-15:

- `ROLE_VISIBILITY_MATRIX.md`;
- `web/src/lib/role-visibility.ts`;
- `BottomNav.tsx` conectado ao helper de visibilidade;
- `PROFILE_PLAN_ACCESS_MODEL.md` atualizado como modelo conceitual, com a matriz como referencia operacional.

### [x] ROLE-UX-01 - Shells por modo

Objetivo:

- Separar visualmente Player App, Competition OS e Management OS.

Entregas:

- revisar `AppShell`, `BottomNav`, `ManagementShell`, `CompetitionShell`;
- definir entrada e saida entre modos;
- reduzir labels internos como `Player App`, `Competition OS`, `Management OS` para linguagem mais natural quando for area de jogador;
- manter contexto tecnico apenas onde ajuda operador.

Criterios:

- mobile com nav coerente por modo;
- multi-papel nao polui primeira tela do jogador;
- contexto de gestao nao aparece apenas porque URL foi digitada.

Entregue em 2026-05-15:

- `AppShell` com classes por modo (`app-shell--player`, `app-shell--competition`, `app-shell--management`);
- `role-visibility.ts` com classificacao de superficie por rota;
- `BottomNav` com entrada profissional contextual em vez de empilhar sempre `Organizar` e `Gestao` no modo jogador;
- substituicao de labels internos por linguagem natural no frontend visivel.

### [x] DESIGN-UX-00 - Tokens de densidade por modo

Objetivo:

- Definir padroes visuais diferentes para Player, Competition e Management sem perder DNA.

Entregas:

- ajustar `DESIGN_TOKENS.md` e `COMPONENT_GRAMMAR.md`;
- definir uso de cards, rows, sheets, CTAs, bordas, headings e cor por modo;
- criar criterios para reduzir uppercase, bordas e cards grandes.

Criterios:

- Player mais leve;
- Management mais denso;
- Competition hibrido;
- sem paleta paralela ou app desconectado.

Entregue em 2026-05-15:

- tokens `--player-*`, `--competition-*` e `--management-*` adicionados em `theme.css`;
- `App.css` passa a derivar `--mode-*` por superficie e aplicar em conteudo, card, row, formulario, botao e superficie compartilhada;
- `DESIGN_TOKENS.md` e `COMPONENT_GRAMMAR.md` especificam densidade por modo e a matriz card/row/sheet/wizard;
- mobile preserva alvo minimo de toque mesmo quando Management fica mais denso no desktop.

## Fase 1 - Player App

### [x] PLAYER-UX-01 - Inicio por proxima acao

Objetivo:

- Transformar `/inicio` em tela leve de proxima acao + intencoes.

Entregas:

- remover duplicidade visual entre `Agora`, `Agenda` e `Clube`;
- mostrar apenas pendencias acionaveis;
- area profissional vira entrada discreta;
- criar fluxo vazio "O que voce quer fazer hoje?".

Criterios:

- primeira dobra tem uma acao primaria;
- jogador sem pendencia nao ve painel;
- compromissos passivos nao parecem pendencia;
- mobile 390px sem empilhamento excessivo.

Entregue em 2026-05-15:

- `/inicio` prioriza a proxima acao real do jogador ou um estado vazio por intencao;
- convites profissionais e pendencias operacionais sairam da abertura do jogador e foram para `Trabalho`;
- cards passivos de hoje foram removidos quando nao ha dado acionavel;
- intencoes principais ficaram explicitas: reservar quadra, encontrar jogo, entrar em aula e competir;
- `lint` e `build` passaram.

### [x] PLAYER-UX-02 - Locais por intencao compacta

Objetivo:

- Reduzir peso de `/locais` e transformar descoberta em fluxo por intencao.

Entregas:

- tiles compactos para Reservar, Entrar em aula, Encontrar jogo e Ver locais;
- menos texto explicativo;
- filtros especificos em sheet;
- resultado direto por intencao.

Criterios:

- jogador nao le texto longo para comecar;
- nao aluno nao ve plano/mensalidade como prioridade;
- reserva retorna slot/quadra;
- aula retorna turma com vaga;
- jogo retorna chamada/jogadores.

Entregue em 2026-05-15:

- `/locais` mostra intencoes compactas para jogo, reserva, aula e lista de locais;
- Home navega para `/locais` ja com a intencao correta;
- `Ver locais` virou fluxo separado com busca por local/cidade/UF;
- tabs `Todos`, `Seguindo` e `Meus locais` filtram corretamente;
- criacao de local continua disponivel apenas para quem tem permissao;
- `lint` e `build` passaram.

### [x] PLAYER-UX-03 - Reserva mobile fluida

Objetivo:

- Criar fluxo de reserva parecido com apps de mercado: onde/quando/disponibilidade/confirmar.

Entregas:

- bottom sheets para local/data/hora;
- cards de disponibilidade com preco/status;
- alternativa de lista de espera;
- CTA sticky de confirmacao.

Criterios:

- reservar em poucos toques;
- nenhuma quadra some no mobile;
- erro/sem disponibilidade inline;
- pagamento/status claros quando aplicavel.

Entregue em 2026-05-15:

- pagina publica do local organiza reserva em 3 passos: quando, horario/quadra e confirmacao;
- a agenda publica mostra somente horarios livres, com quadra, duracao e preco quando existe;
- ajuste manual continua disponivel sem repetir data/duracao no formulario final;
- sem disponibilidade aparece inline e permite entrar na lista de espera com backend real;
- `Ver outros locais` retorna para `/locais?intent=booking`;
- `lint` e `build` passaram.

### [x] PLAYER-UX-04 - Entrar em aula como fluxo publico

Objetivo:

- Separar aula/turma publica de gestao interna da academia.

Entregas:

- filtros de nivel/dia/local;
- cards de turma com vaga;
- CTA solicitar/matricular;
- contexto proprio para aluno ja matriculado.

Criterios:

- jogador nao ve configuracao de academia;
- aluno ve aulas/reposicoes proprias;
- mensalidade aparece apenas quando pertence a ele.

Entregue em 2026-05-15:

- `/locais?intent=classes` recebeu linguagem mais direta para entrar em aula;
- pagina publica do local organiza aula em fluxo de 3 passos: perfil, turma e envio de interesse;
- cards de turma mostram horario, professor, nivel, vagas e valor publico;
- lista duplicada de turmas foi removida do bloco publico;
- solicitacao continua persistindo via `createAcademyEnrollment`;
- `lint` e `build` passaram.

### [ ] PLAYER-UX-05 - Encontrar jogo sem rede social pesada

Objetivo:

- Permitir encontrar/criar jogo com baixa carga cognitiva.

Entregas:

- lista de jogos/chamadas;
- filtros simples;
- criar chamada em fluxo curto;
- entrar em jogo com feedback.

Criterios:

- nao vira feed social;
- foco em jogar;
- nivel/local/data claros.

### [ ] PLAYER-UX-06 - Ranking centrado no jogador

Objetivo:

- Reorganizar `/ranking` para abrir com utilidade pessoal.

Entregas:

- minha posicao;
- filtros essenciais;
- lista;
- KPIs globais secundarios.

Criterios:

- primeira dobra nao e dashboard geral;
- jogador entende onde esta;
- filtros mobile nao empilham.

### [ ] PLAYER-UX-07 - Perfil simples por finalidade

Objetivo:

- Separar identidade, preferencias, historico e conta.

Entregas:

- secoes claras;
- preferencias esportivas;
- historico proprio;
- notificacoes/conta;
- pagamentos proprios somente se existirem.

Criterios:

- perfil nao parece cockpit;
- informacao profissional fica separada.

## Fase 2 - Competition OS

### [x] COMP-UX-01 - Hub de eventos por modo

Objetivo:

- Separar jogador, organizador e descoberta sem competir na mesma dobra.

Entregas:

- `Jogando` leve;
- `Organizando` operacional;
- `Descobrir` publico;
- CTA de criar apenas em contexto de organizador.

Criterios:

- jogador nao recebe fila de organizador;
- organizador encontra proxima tarefa;
- mobile com tabs/segmentos claros.

Entregue em 2026-05-15:

- `/eventos` renderiza `Jogando`, `Organizando` ou `Descobrir` como modo ativo;
- jogador nao recebe fila de organizador na primeira dobra;
- criacao e operacao de torneio/liga ficam no modo `Organizando`;
- previews indicam quando existem mais registros e levam para listas completas;
- mobile usa segmentos horizontais em vez de empilhar todos os modos.

### [>] COMP-UX-02 - Evento publico mobile

Objetivo:

- Fazer torneio/liga publica parecer evento de mercado, nao cockpit.

Entregas:

- topo com nome/data/local/status;
- imagem/poster quando houver;
- tabs visiveis;
- CTA sticky;
- categorias/inscritos em listas claras.

Criterios:

- inscricao facil;
- sem KPIs de organizador;
- informacao essencial antes de detalhe.

### [ ] COMP-UX-03 - Inscricao em torneio/liga

Objetivo:

- Tornar inscricao curta, previsivel e com feedback.

Entregas:

- selecao de categoria;
- revisao de valor/restricao;
- confirmar;
- sucesso/erro amigavel.

Criterios:

- sem formulario confuso;
- erro de backend nunca aparece cru;
- jogador entende status.

### [ ] COMP-SETUP-01 - Wizard de criacao de torneio

Objetivo:

- Reorganizar criar torneio em etapas logicas.

Etapas:

- Basico;
- Inscricoes;
- Categorias;
- Formato;
- Agenda/quadras;
- Revisar/publicar.

Criterios:

- formulario longo deixa de existir;
- progresso visivel;
- campos avancados recolhidos;
- preservar todas as regras existentes.

### [ ] COMP-SETUP-02 - Wizard de criacao de liga

Objetivo:

- Reorganizar criar liga em etapas logicas.

Etapas:

- Basico;
- Jogadores/classes;
- Formato;
- Pontuacao;
- Agenda;
- Revisar/publicar.

Criterios:

- formato de liga fica compreensivel;
- regras complexas nao aparecem todas de uma vez.

### [ ] COMP-OPS-01 - Operacao de torneio em rows

Objetivo:

- Organizador resolve inscricoes, jogos, resultados e publicacao por fila.

Entregas:

- rows de inscricao pendente;
- rows de partida sem horario;
- rows de resultado pendente;
- drawers de detalhe;
- configuracao secundaria.

Criterios:

- proxima tarefa clara;
- sem card operacional pesado;
- tabs antes de resumo.

### [ ] COMP-OPS-02 - Operacao de liga em rodada atual

Objetivo:

- Liga abre pela rodada atual e tarefas pendentes.

Entregas:

- rodada atual;
- partidas pendentes;
- resultado/WO;
- ranking;
- comunicacao.

Criterios:

- organizador nao procura tarefa;
- jogador ve apenas suas partidas/classificacao.

## Fase 3 - Management OS

### [ ] MGMT-UX-01 - Shell operacional mobile

Objetivo:

- Reorganizar `/gestao` e workspace local para subnav/fila antes de metricas.

Entregas:

- module switcher claro;
- fila antes de KPIs;
- loading/skeleton confiavel;
- estados vazios por permissao/plano.

Criterios:

- sem grandes vazios de carregamento;
- sem KPI zerado inutil;
- mobile nao empilha cockpit.

### [ ] MGMT-UX-02 - Modo Professor

Objetivo:

- Professor ve apenas rotina propria.

Entregas:

- aulas hoje;
- turmas;
- alunos;
- chamada;
- agenda;
- comissao se permitida.

Criterios:

- sem cantina/CRM/financeiro completo;
- professor sem local tem estado vazio claro.

### [ ] MGMT-AGENDA-01 - Agenda v2 polish

Objetivo:

- Consolidar Agenda como rotina de reservas e disponibilidade.

Entregas:

- hoje/pendencias;
- calendario mobile refinado;
- nova reserva fluida;
- lista de espera;
- bloqueio;
- recursos/regras em subvisao.

Criterios:

- recepcao reserva em poucos cliques;
- sem banner global para resultado normal;
- disponibilidade clara.

### [ ] MGMT-ACADEMY-01 - Academia v2 continuidade

Objetivo:

- Manter Academia seguindo o plano v2 ja iniciado.

Entregas:

- revisar Hoje, Grade, Alunos, Pendencias, Professores, Configuracao;
- garantir contrato/usuario/aluno;
- validar creditos/reposicoes;
- revisar mobile.

Criterios:

- secretaria opera sem cacar;
- professor ve rotina;
- financeiro ve cobrancas;
- nenhuma funcao perdida.

### [ ] MGMT-FINANCE-01 - Financeiro por cobranca

Objetivo:

- Financeiro abre com quem cobrar, nao com dashboard.

Entregas:

- vencidos;
- vence hoje;
- lembrete;
- marcar pago;
- despesas;
- relatorio secundario.

Criterios:

- permissao respeitada;
- origem da cobranca clara;
- jogador so ve propria cobranca.

### [ ] MGMT-CRM-01 - Clientes/CRM como fila de relacionamento

Objetivo:

- Reduzir CRM para rotina acionavel.

Entregas:

- leads para responder;
- follow-up hoje;
- contatos parados;
- drawer de contato;
- WhatsApp secundario.

Criterios:

- sem duplicar financeiro;
- sem dashboard antes da fila.

### [ ] MGMT-CANTEEN-01 - Cantina/POS por venda rapida

Objetivo:

- Cantina abre em venda/estoque, nao painel pesado.

Entregas:

- vender produto;
- estoque baixo;
- vendas do dia;
- cadastro secundario;
- plano respeitado.

Criterios:

- se modulo desativado, nao aparece como operacao;
- venda rapida em poucos toques.

### [ ] MGMT-TEAM-01 - Equipe/permissoes por convite aceito

Objetivo:

- Consolidar fluxo de equipe de local e competicao.

Entregas:

- buscar usuario;
- convidar;
- status pendente;
- aceitar;
- papel habilita modulos.

Criterios:

- acesso so apos aceite;
- card mostra nome;
- erro amigavel.

### [ ] MGMT-SETTINGS-01 - Ajustes como configuracao estrutural

Objetivo:

- Separar ajustes da rotina.

Entregas:

- dados publicos;
- regras;
- recursos;
- planos;
- permissoes;
- publicacao.

Criterios:

- configuracao nao aparece antes da fila diaria.

## Fase 4 - Public Pages

### [ ] PUBLIC-PLACE-01 - Pagina publica do local

Objetivo:

- Converter jogador sem expor gestao.

Entregas:

- marca/local;
- reservar;
- entrar em aula;
- eventos;
- contato/seguir;
- CTA claro.

Criterios:

- sem cockpit;
- sem planos irrelevantes antes da intencao.

### [ ] PUBLIC-COMP-01 - Pagina publica de competicao

Objetivo:

- Evento/inscricao com linguagem publica.

Entregas:

- poster;
- local/data;
- categorias;
- inscritos/jogos;
- CTA sticky.

Criterios:

- jogador entende e se inscreve;
- organizador opera em outra superficie.

## Fase 5 - QA E Governanca

### [ ] QA-ROLE-01 - Teste manual por papel

Objetivo:

- Reexecutar testes de jogador, professor, organizador, recepcao, financeiro e gestor.

Entregas:

- screenshots 390px e desktop;
- relatorio de friccoes;
- bugs P0/P1 na queue.

### [ ] QA-DESIGN-01 - Auditoria visual de consistencia

Objetivo:

- Garantir que as areas novas nao percam o DNA do ATP.

Entregas:

- comparar com `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`;
- revisar cor, fonte, cards, rows, sheets, CTAs;
- detectar regressao de empilhamento.
