# SaaS Screen Contracts Detailed

Status: contratos obrigatorios de tela
Data: 2026-05-22
Fonte primaria: `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
Mapa alvo: `SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`
Guardrails: `SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`

## 1. Objetivo

Este documento transforma a arquitetura em especificacao de tela. Ele existe para que quem codar nao precise inferir o que deve aparecer, onde aparece e como se organiza.

Cada tela abaixo define:

- objetivo;
- persona primaria;
- layout;
- menu/topbar esperados;
- primeira dobra;
- views/filtros/colunas;
- detalhe lateral ou drawer;
- acoes;
- estados;
- proibicoes;
- criterios de aceite.

## 2. Contrato global do Work SaaS Web

### 2.1. Sidebar global

Ordem obrigatoria:

1. Inicio
2. Agenda
3. Clientes
4. Academia
5. Financeiro
6. Competicoes
7. Loja/POS
8. Comunicacao
9. Relatorios
10. Administracao

Regras:

- Apenas um item ativo por vez.
- Item ativo em verde ATP.
- Inativos em cinza claro.
- Icones lineares consistentes.
- Sem submenu aberto na sidebar principal.
- Sem duplicar funcoes como "Reservas" e "Agenda" no mesmo nivel.

Proibido:

- "Dashboard" no lugar de `Inicio`.
- "Agendamentos" no lugar de `Agenda`.
- "Torneios" no lugar de `Competicoes` como dominio unico.
- "Configuracoes" no lugar de `Administracao`, salvo como pagina interna.

### 2.2. Topbar global

Elementos obrigatorios:

- Logo ATP.
- Seletor/local ativo: exemplo `ATP Dourados`, subtitulo `Unidade principal`.
- Busca global: placeholder `Buscar cliente, reserva, aula, pagamento...`.
- Botao `+ Criar`.
- Seletor `Jogador | Trabalho`, com Trabalho ativo no Work SaaS.
- Notificacoes.
- Avatar/iniciais do usuario.
- Nome e papel curto, exemplo `Escalao Admin`.

Regras:

- Topbar nao muda de tamanho entre dominios.
- Seletor Jogador/Trabalho nao desaparece em paginas internas.
- Local ativo sempre visivel no web Trabalho.
- Busca global nao substitui filtros locais.

### 2.3. Padrao visual

- Dark premium.
- Fundo principal azul-marinho quase preto.
- Cards/panels escuros.
- Verde ATP para acao primaria/ativo.
- Sem botoes brancos em hover/ativo.
- Tabelas e listas densas no desktop.
- Drawers laterais para detalhes e acoes.
- Cards apenas para resumo, alerta, item compacto ou atalho.

## 3. Inicio / Trabalho Hoje

Rota alvo:
`/gestao` e `/gestao/:placeId` como entrada de Trabalho.

Persona primaria:
Gestor operacional. Conteudo adapta para professor, recepcao, financeiro, caixa e organizador.

Pergunta da tela:
O que precisa de atencao agora?

Layout:

- Topbar global.
- Sidebar global.
- Conteudo com titulo, hero operacional, cards de resumo, agenda do dia, pendencias, clientes em atencao, competicoes em operacao e atalhos.

Primeira dobra:

- Eyebrow: `CENTRAL OPERACIONAL`.
- H1: `Trabalho Hoje`.
- Subtexto: `Pendencias, agenda e acoes importantes da sua operacao.`
- Hero:
  - Titulo: `O que precisa de atencao agora?`
  - Texto curto.
  - CTA primario: `Ver pendencias`.
  - CTA secundario: `Abrir agenda`.
  - Badge: `X acoes em foco`.

Cards de resumo obrigatorios:

- Reservas hoje.
- Aulas do dia.
- Recebiveis.
- Competicoes.

Cada card deve:

- mostrar numero;
- mostrar detalhe;
- abrir lista filtrada.

Blocos principais:

- Agenda em andamento.
- Pendencias criticas.
- Clientes que precisam de atencao.
- Competicoes em operacao.
- Atalhos rapidos.

Atalhos rapidos:

- Nova reserva.
- Novo cliente.
- Registrar pagamento.
- Criar aula.
- Criar torneio.
- Vender produto.

Proibido:

- Mostrar todos os modulos como cards.
- Mostrar configuracoes.
- Carrossel.
- Cards sem destino.
- Texto longo explicando o sistema.

Estados:

- Sem pendencias: mostrar mensagem positiva e atalhos principais.
- Sem agenda hoje: CTA `Abrir agenda` e `Criar reserva`.
- Sem permissao parcial: ocultar blocos proibidos.

Critério de aceite:
Em ate 10 segundos o usuario entende a maior pendencia e consegue agir.

## 4. Agenda / Calendario

Rota alvo:
`/gestao/:placeId/agenda` ou wrapper equivalente.

Persona primaria:
Recepcao e gestor.

Pergunta da tela:
O que esta ocupado, livre ou em conflito?

Layout:

- Header do dominio:
  - Eyebrow: `OPERACAO`.
  - H1: `Agenda`.
  - Subtexto: `Reservas, aulas, bloqueios e uso das quadras em um calendario unico.`
- Barra de view:
  - `Dia`
  - `Semana`
  - `Lista`
  - `Remarcacoes`
- Barra de filtros:
  - data;
  - tipo: Todos, Reservas, Aulas, Bloqueios, Competicoes;
  - quadra/recurso;
  - status;
  - busca por cliente/aluno.
- CTA primario: `Nova reserva`.
- CTA secundario: `Criar bloqueio`.

Calendario:

- Colunas por quadra/recurso no desktop.
- Linhas por hora cheia.
- Usar toda largura disponivel.
- Se houver muitas quadras, rolagem horizontal dentro do calendario, nao quebrar coluna para baixo quando ha espaco.
- Slots livres clicaveis.
- Eventos ocupados clicaveis.

Conteudo do slot reserva:

- nome cliente;
- status: pago, pendente, confirmada, remarcacao;
- quadra;
- indicador de participantes se houver.

Conteudo do slot aula:

- turma;
- professor;
- alunos;
- quadra.

Observacao:
O horario pertence ao eixo do calendario e ao drawer de detalhe. Nao repetir o horario dentro do bloco do calendario, para evitar ruido visual e duplicidade.

Detalhe ao clicar:

- Slot livre: drawer `Nova reserva`.
- Reserva: drawer `Reserva`.
- Aula: drawer/resumo de aula.
- Bloqueio: drawer de bloqueio.

Proibido:

- Filtros de professor/turma na view exclusiva `Reservas`, salvo no calendario geral.
- Formulario de edicao dentro do proprio card do slot.
- Quadra cair para linha abaixo com espaco horizontal disponivel.
- Meia em meia hora como padrao se a decisao for hora cheia.
- Subabas `Hoje`, `Espera`, `Ajustes` competindo com calendario.

Estados:

- Sem reservas: slots livres + CTA.
- Sem quadras: CTA para Administracao > Recursos.
- Erro ao salvar: mensagem especifica e manter drawer aberto.

Critério de aceite:
Recepcao consegue criar ou editar uma reserva a partir do calendario sem procurar outro menu.

## 5. Drawer de Reserva

Abre a partir de:
Agenda, Cliente 360, lista de reservas.

Persona primaria:
Recepcao/gestor.

Pergunta:
O que posso fazer com esta reserva?

Layout:

- Drawer lateral no desktop.
- Sheet/modal responsivo no mobile.
- Nunca dentro do card do calendario.

Cabecalho:

- Cliente.
- Status da reserva.
- Data/hora.
- Quadra.
- Pagamento.

Dados exibidos:

- cliente;
- telefone/WhatsApp;
- participantes;
- data;
- inicio;
- fim;
- quadra;
- valor;
- status pagamento;
- observacao;
- historico curto.

Acoes primarias:

- `Salvar alteracao`.
- `Cancelar reserva`.
- `WhatsApp`.
- `Solicitar remarcacao`.
- `Pagar` ou `Marcar como pago`.
- `Abrir Cliente 360`.

Fluxo editar:

- Campos claros, nao comprimidos.
- Validar disponibilidade.
- Se ocupado, oferecer erro claro e sugestao.

Fluxo remarcacao:

- Gerar link unico para o cliente escolher agenda disponivel.
- WhatsApp com template de remarcacao.

Proibido:

- Input de data/hora nativo quebrado dentro de card estreito.
- Botao `Criar reserva` se horario ja esta ocupado.
- Estado ambíguo como "Aguardando convite" para reserva confirmada/ocupada.

Critério de aceite:
Criar, editar, cancelar, remarcar, cobrar e enviar WhatsApp funcionam sem sair do contexto.

## 6. Clientes / Lista

Rota alvo:
`/gestao/:placeId/clientes`.

Persona primaria:
Recepcao, gestor, financeiro.

Pergunta:
Quem precisa de atendimento, acompanhamento ou acao?

Layout:

- Header:
  - Eyebrow: `RELACIONAMENTO`.
  - H1: `Clientes`.
  - Subtexto: `Leads, alunos, socios e contatos em uma visao organizada.`
- Views salvas:
  - Todos
  - Leads
  - Clientes ativos
  - Alunos
  - Socios
  - Inadimplentes
  - Follow-up
  - Arquivados
- Filtros:
  - busca nome/telefone/e-mail;
  - status;
  - responsavel;
  - ultima interacao;
  - tipo.
- CTA primario: `Novo cliente`.

Tabela/lista desktop:

Colunas obrigatorias:

- Cliente.
- Tipo.
- Status.
- Proxima acao.
- Pendencia.
- Ultima interacao.

Linha selecionada:

- Realce verde discreto.
- Abre Cliente 360 no painel direito.

Proibido:

- Cards gigantes para cada cliente no desktop.
- Misturar leads, alunos e socios sem view.
- Colunas irrelevantes como categoria generica sem acao.
- Textos gerados/inconsistentes.

Estados:

- Sem clientes: CTA `Novo cliente`.
- Sem leads: mensagem e CTA `Criar lead`.
- Sem permissao: ocultar dados sensiveis.

Critério de aceite:
Usuario filtra, seleciona e age sem sair da tela.

## 7. Cliente 360

Abre a partir de:
Clientes, Agenda, Financeiro, Academia, Busca Global.

Persona primaria:
Recepcao/gestor.

Pergunta:
Qual e a situacao desta pessoa e qual proxima acao?

Layout:

- Painel lateral no desktop.
- Pagina/drawer completo quando aberto em rota propria.

Cabecalho:

- Avatar/iniciais.
- Nome.
- Tipo/status: lead, cliente, aluno, socio, responsavel.
- Tags.
- Telefone com WhatsApp.
- E-mail.
- Proximo passo destacado.

Acoes rapidas:

- Cobrar.
- WhatsApp.
- Nova reserva.
- Matricular.
- Registrar observacao.
- Editar.

Secoes obrigatorias:

1. Resumo
   - proxima reserva;
   - proxima aula;
   - plano/matricula;
   - pendencia principal.
2. Pagamentos
   - em aberto;
   - vencidos;
   - pagos recentes;
   - botao `Marcar pago`.
3. Reservas
   - futuras;
   - passadas;
   - canceladas/remarcadas.
4. Aulas e matriculas
   - turma;
   - professor;
   - horario;
   - reposicoes.
5. Interacoes
   - WhatsApp;
   - follow-up;
   - anotacoes.
6. Observacoes.
7. Historico.

Cadastro progressivo:

Minimo:

- nome;
- telefone ou e-mail;
- tipo inicial.

Nao obrigar inicialmente:

- CPF;
- endereco;
- foto;
- contrato;
- dados completos.

Proibido:

- Abrir um modal pequeno com todos os dados espremidos.
- Exigir campos demais para atendimento rapido.
- Esconder pagamento/reserva/aula em abas profundas.

Critério de aceite:
Ao abrir um cliente, a recepcao entende em ate 10 segundos o que precisa fazer.

## 8. Academia / Aulas e Turmas

Rota alvo:
`/gestao/:placeId/academia`.

Persona primaria:
Gestor/professor.

Pergunta:
Como estao aulas, turmas, alunos e reposicoes?

Header:

- Eyebrow: `ACADEMIA`.
- H1: `Aulas e turmas`.
- Subtexto: `Turmas, professores, alunos, reposicoes e evolucao.`

Views salvas:

- Aulas de hoje
- Semana
- Turmas
- Matriculas
- Reposicoes
- Evolucao
- Professores

Filtros:

- professor;
- turma;
- dia;
- status;
- busca aluno.

Listas/colunas:

Para aulas:

- Horario.
- Turma.
- Professor.
- Quadra.
- Alunos.
- Pendencia.

Para turmas:

- Turma.
- Professor.
- Horarios.
- Vagas.
- Alunos ativos.
- Valor.
- Status.

Acoes:

- Criar turma.
- Matricular aluno.
- Abrir turma.
- Resolver reposicao.
- Registrar evolucao.

Proibido:

- Chamada como tarefa obrigatoria por padrao.
- Professores como ajuste escondido em tab confusa.
- Alunos em modal quebrado.
- Pendencia numerica sem lista.

Critério de aceite:
Gestor consegue ver aulas de qualquer dia, abrir turma e matricular sem procurar submenus.

## 9. Professor / Hoje

Persona primaria:
Professor.

Pergunta:
Quais aulas eu tenho hoje e o que preciso saber?

Web:
Pode aparecer dentro de Academia com filtros por professor.

Mobile:
Tela dedicada por papel.

Conteudo:

- Lista por hora cheia.
- Turma.
- Alunos.
- Quadra.
- Local.
- Observacoes.
- Faltas avisadas.
- Reposicoes.

Acoes:

- Abrir aula.
- Abrir aluno.
- Registrar observacao/evolucao.
- WhatsApp quando permitido.
- Chamada apenas se empresa exigir.

Proibido:

- Professor cair em Financeiro, POS, Equipe ou Ajustes sem permissao.
- Chamada obrigatoria se setting desligado.

Critério de aceite:
Professor entende o dia sem ver ERP.

## 10. Financeiro

Rota alvo:
`/gestao/:placeId/financeiro`.

Persona primaria:
Financeiro/gestor.

Pergunta:
Quem deve, quem pagou e o que vence?

Views:

- Receber
- Vencidos
- Pagos
- Despesas
- Planos e pacotes
- Mensalidades
- Comissoes
- Resumo

Receber/Vencidos colunas:

- Cliente.
- Origem.
- Vencimento.
- Valor.
- Status.
- Ultima cobranca.
- Acoes.

Acoes:

- Cobrar.
- Marcar pago.
- Abrir Cliente 360.
- Enviar WhatsApp.

Despesas colunas:

- Data.
- Categoria.
- Descricao.
- Valor.
- Status.

Resumo:

- cards simples;
- links para listas filtradas.

Proibido:

- Misturar pagamentos pessoais do jogador.
- Deixar pagar espalhado sem modal padrao.
- Grafico sem lista correspondente.

Critério de aceite:
Financeiro consegue cobrar e marcar pago em ate poucos cliques.

## 11. Modal de Pagamento Stub

Abre a partir de:
Reserva, Cliente 360, Financeiro, Competicoes, Player pagamentos.

Conteudo:

- Titulo: `Pagamento`.
- Origem: reserva, mensalidade, inscricao, produto, pacote.
- Cliente/jogador.
- Descricao.
- Valor.
- Status.
- Botao primario: `Pagar` ou `Marcar como pago`.
- Botao secundario: cancelar.

Comportamento:

- Agora: marcar como pago via stub atual.
- Futuro: Edge Function + checkout + webhook.

Proibido:

- Cada area criar seu proprio botao de pagamento com logica diferente.
- Confirmacao sem valor/origem.

## 12. WhatsApp Templates UI

Abre a partir de:
Reserva, Cliente 360, Financeiro, Academia, Competicoes, POS.

Conteudo:

- Tipo de mensagem.
- Destinatario.
- Numero.
- Preview da mensagem.
- Botao `Abrir WhatsApp`.
- Opcional: `Registrar interacao`.

Proibido:

- Mensagem sem nome/local/contexto.
- Abrir WhatsApp sem validar telefone.
- Criar textos soltos diferentes por area.

## 13. Competicoes / Hub Trabalho

Rota alvo:
`/trabalho/competicoes` ou wrapper equivalente.

Persona primaria:
Organizador/gestor.

Pergunta:
Quais competicoes precisam de acao?

Views:

- Todas
- Torneios
- Ligas
- Inscricoes
- Resultados pendentes
- Finalizadas

Cards/lista:

- Nome.
- Tipo.
- Fase.
- Pendencia principal.
- Inscritos/participantes.
- Proximo CTA.

CTA:

- Criar torneio.
- Criar liga.
- Resolver bloqueio.

Proibido:

- Descoberta publica como foco.
- Modo organizador aparecendo no Player App.

## 14. Torneio Cockpit

Persona primaria:
Organizador.

Pergunta:
O que falta resolver nesta fase?

Fases e CTAs:

- Rascunho: `Completar configuracao`.
- Inscricoes abertas: `Revisar inscritos`.
- Inscricoes encerradas: `Gerar jogos`.
- Jogos gerados: `Publicar tabela`.
- Em andamento: `Lancar resultado`.
- Finalizado: `Publicar resultado final`.

Primeira dobra:

- Nome do torneio.
- Fase.
- Status/bloqueio.
- CTA principal.
- Indicadores da fase.

Views:

- Visao da fase.
- Inscricoes.
- Jogos.
- Jogadores.
- Pagamentos.
- Comunicacao.
- Configuracao.

Proibido:

- Duas navegacoes com itens repetidos.
- Tabs antigas sem priorizacao por fase.
- Owner tools para participante.

## 15. Liga Cockpit

Persona primaria:
Owner/organizador ou participante conforme papel.

Owner pergunta:
Qual pendencia da rodada/temporada?

Participante pergunta:
Contra quem jogo e o que preciso fazer?

Owner views:

- Rodada atual.
- Participantes.
- Resultados pendentes.
- Classificacao.
- Configuracao.
- Historico.

Participante views:

- Meu jogo.
- Adversario.
- Chat.
- Resultado.
- Classificacao.

Proibido:

- Participante ver configuracao owner-only.
- Owner cair em tela publica de descoberta.

## 16. Loja/POS

Persona primaria:
Caixa.

Pergunta:
Como vender rapido?

Views:

- Vender.
- Vendas do dia.
- Produtos.
- Estoque.
- Fechamento.

Primeira tela:
Vender.

Acoes:

- Adicionar produto.
- Finalizar venda.
- Vincular cliente.
- Cancelar venda, se permitido.

Proibido:

- Cadastro de produto antes da venda.
- Financeiro amplo no POS.

## 17. Comunicacao

Persona primaria:
Recepcao/gestor/organizador/financeiro.

Pergunta:
Qual comunicacao precisa de acao agora e qual modelo deve ser usado?

Views:

- Fila de comunicacao por ponto operacional.
- Drawer lateral com proxima acao.
- Modelos padrao de WhatsApp.
- Publicacao/dados publicos.

Padrao:

- Linha seleciona contexto.
- CTA dominante fica no drawer.
- Status deve ser pill compacto, nao bloco grande.
- Texto longo deve truncar na lista e abrir completo no drawer/modelo.

Proibido:

- Remover WhatsApp contextual dos fluxos.
- Linha da fila navegar sem antes preservar contexto no drawer.

## 18. Relatorios

Persona primaria:
Dono/gestor.

Pergunta:
O que esta acontecendo e onde devo agir?

Primeira entrega:

- KPIs executivos.
- Tabela compacta por area.
- Drawer lateral com leitura do item selecionado.
- Exportacao CSV.

Views:

- Ocupacao.
- Receita.
- Clientes.
- Academia.
- Professores.
- Competicoes.
- POS.

Proibido:

- Grafico sem destino.
- Dashboard avancado antes dos fluxos centrais.
- Linha inteira verde ou bloco chamativo sem significado de status.
- Relatorio ocupar o papel de operacao diaria.

## 19. Administracao

Persona primaria:
Dono/admin.

Pergunta:
Como configurar a estrutura?

Views:

- Unidade/local.
- Equipe.
- Permissoes futuras.
- Recursos/quadras.
- Regras.
- Planos.
- Publicacao.
- Integracoes.
- Avancado.

Proibido:

- Aparecer como tarefa diaria para professor/recepcao.
- Duplicar ajustes dentro de Agenda/Academia.

## 20. Player App / Rotina

Menu:

- Inicio.
- Jogar.
- Competir.
- Rotina.
- Perfil.

Rotina views:

- Tudo.
- Reservas.
- Partidas.
- Aulas.
- Pagamentos.
- Historico.

Regras:

- `/agenda`, `/minhas-reservas`, `/minhas-partidas`, `/minhas-aulas`, `/meus-pagamentos` viram alias/filtros.
- Player nao mostra admin.
- Pagamentos pessoais nao entram no Financeiro do local.

Proibido:

- Botao Trabalho dentro de cards do Player.
- Modo organizador fora de Trabalho.

## 21. Work Mobile

Professor:

- Hoje.
- Agenda.
- Turmas.
- Alunos.
- Perfil.

Recepcao:

- Hoje.
- Agenda.
- Reservas.
- Clientes.
- Mais.

Financeiro:

- Receber.
- Vencidos.
- Pagos.
- Resumo.
- Perfil.

Caixa:

- Vender.
- Hoje.
- Estoque.
- Produtos.
- Perfil.

Organizador:

- Hoje.
- Torneios.
- Ligas.
- Resultados.
- Perfil.

Gestor:

- Hoje.
- Agenda.
- Clientes.
- Financeiro.
- Mais.

Proibido:

- Mobile com todas as configuracoes web.
- Menu longo de dominios web.

## 22. Estados obrigatorios por tela

Toda tela deve ter:

- carregando;
- vazio;
- erro;
- sem permissao;
- sucesso;
- muitos dados.

Mensagens devem orientar proximo passo.

Exemplo:

- Sem clientes: `Cadastre o primeiro cliente ou crie um lead para iniciar o atendimento.`
- Sem reservas: `Clique em um horario livre na Agenda para criar uma reserva.`
- Sem pagamento: `Nenhum pagamento em aberto para este cliente.`
- Sem permissao: `Seu perfil nao tem acesso a esta area.`

## 23. Criterios finais antes de codar

Para iniciar um sprint, confirmar:

- A tela esta neste documento.
- O menu global esta correto.
- Topbar esta correta.
- Views/filtros/colunas estao definidos.
- Detalhe/drawer esta definido.
- Acoes estao definidas.
- Proibicoes estao claras.
- Estados estao previstos.
- Rotas antigas estao protegidas.

## 24. Busca Global

Persona primaria:
Todos no Work SaaS Web.

Pergunta:
Como encontro algo sem lembrar em qual menu esta?

Local:
Topbar global.

Placeholder:
`Buscar cliente, reserva, aula, pagamento...`

Escopo inicial:

- Clientes.
- Leads.
- Alunos.
- Reservas.
- Aulas/turmas.
- Pagamentos.
- Torneios.
- Ligas.
- Produtos, se POS estiver ativo.

Layout do resultado:

- Dropdown escuro abaixo do campo.
- Agrupado por tipo.
- Cada resultado com icone, nome principal, contexto e status.

Exemplos:

- Cliente: `Ana Gomes` / `Aluna ativa - pagamento vencido`.
- Reserva: `Rafael Araujo` / `22/05 09:00 - Quadra 3`.
- Aula: `Adulto Iniciante 1` / `Sex 06:30 - Prof. Lais`.
- Pagamento: `R$ 310,00 vencido` / `Ana Gomes`.
- Torneio: `Open ATP Dourados` / `Inscricoes abertas`.

Acao ao clicar:

- Cliente abre Cliente 360.
- Reserva abre drawer de reserva.
- Aula abre detalhe de turma/aula.
- Pagamento abre modal/detalhe financeiro.
- Torneio/liga abre cockpit ou detalhe conforme papel.

Estados:

- Sem resultados: sugerir `Criar cliente` ou revisar termo.
- Carregando: skeleton compacto.
- Sem permissao: nao mostrar resultado proibido.

Proibido:

- Busca levar sempre para uma pagina generica.
- Mostrar resultado sem contexto.
- Mostrar dados financeiros para quem nao tem acesso.

Critério de aceite:
Usuario encontra e abre item importante sem navegar pelo menu.

## 25. Criar Rapido

Persona primaria:
Recepcao, gestor, financeiro, organizador, caixa.

Pergunta:
Como inicio uma acao frequente sem procurar menu?

Local:
Topbar global, botao `+ Criar`.

Itens iniciais:

- Nova reserva.
- Novo cliente.
- Registrar pagamento.
- Criar aula/turma.
- Criar torneio.
- Vender produto.

Comportamento:

- Nova reserva abre Agenda com drawer ou modal de nova reserva.
- Novo cliente abre cadastro progressivo.
- Registrar pagamento abre modal stub ou Financeiro.
- Criar aula/turma abre fluxo de Academia.
- Criar torneio abre wizard/cadastro de torneio.
- Vender produto abre Loja/POS > Vender.

Regras:

- Itens sem permissao nao aparecem.
- Itens indisponiveis por plano podem aparecer desabilitados apenas se houver decisao de upsell futura.
- Criar rapido nao substitui pagina do dominio.

Proibido:

- Criar item sem contexto ou sucesso.
- Dropdown com mais de 8 itens na primeira versao.
- Misturar acoes raras.

## 26. Seletor de Unidade / Local Ativo

Persona primaria:
Gestor, dono, recepcao multiunidade.

Pergunta:
Em qual unidade/local estou trabalhando?

Local:
Topbar, lado esquerdo apos logo/sidebar.

Conteudo:

- Nome do local.
- Subtitulo: unidade principal, filial, clube, professor autonomo ou organizacao.
- Dropdown se houver mais de um local.

Ao trocar:

- Atualizar contexto das rotas de trabalho.
- Preservar dominio quando possivel.
- Exemplo: Agenda do local A para Agenda do local B.

Estados:

- Um local: mostrar sem dropdown forte.
- Varios locais: dropdown com busca.
- Nenhum local: CTA `Criar local` ou `Aceitar convite`, conforme caso.

Proibido:

- Esconder contexto multiunidade.
- Trocar local silenciosamente.
- Mostrar dados misturados de locais diferentes sem indicar.

## 27. Administracao Detalhada

Rota alvo:
`/gestao/:placeId/administracao`.

Persona primaria:
Dono/admin/manager autorizado.

Pergunta:
Como configuro a estrutura sem atrapalhar a rotina?

Views:

- Unidade/local.
- Equipe.
- Permissoes futuras.
- Recursos/quadras.
- Regras.
- Planos.
- Publicacao.
- Integracoes.
- Avancado.

Unidade/local:

- Nome.
- Endereco.
- Contato.
- Horarios.
- Logo/imagem.
- Publicacao.

Equipe:

- Colaboradores ativos.
- Convites pendentes.
- Professores.
- Papeis.
- Remover/reenviar convite.

Recursos/quadras:

- Quadras.
- Tipo/piso.
- Status.
- Preco.
- Disponibilidade.

Regras:

- regras de reserva;
- cancelamento;
- remarcacao;
- reposicao;
- chamada opcional;
- prazos.

Planos:

- planos de socio;
- pacotes;
- mensalidades;
- regras comerciais.

Avancado:

- acoes perigosas;
- integracoes;
- logs futuros;
- configuracoes tecnicas.

Proibido:

- Administracao aparecer como card no Trabalho Hoje.
- Professor/recepcao ver configuracoes sem permissao.
- Acoes perigosas sem confirmacao.

Critério de aceite:
Owner encontra configuracao; usuario operacional nao tropeça nela.

## 28. Relatorios Detalhados

Rota alvo:
`/gestao/:placeId/relatorios`.

Persona primaria:
Dono/gestor/financeiro.

Pergunta:
Onde a operacao esta indo bem ou mal?

Primeira entrega:
Cards que abrem listas filtradas.

Views:

- Ocupacao.
- Receita.
- Clientes.
- Academia.
- Professores.
- Competicoes.
- POS.

Ocupacao:

- reservas por quadra;
- horarios mais usados;
- ociosidade;
- aulas x reservas x bloqueios.

Receita:

- recebido;
- vencido;
- em aberto;
- por origem.

Clientes:

- novos;
- ativos;
- leads;
- inativos;
- inadimplentes.

Academia:

- alunos por turma;
- vagas;
- reposicoes;
- aulas da semana.

Professores:

- aulas por professor;
- alunos vinculados;
- comissoes futuras.

Competicoes:

- inscricoes;
- pagamentos;
- resultados pendentes;
- finalizadas.

POS:

- vendas do dia;
- produtos mais vendidos;
- estoque baixo.

Proibido:

- Grafico sem destino.
- Relatorio competir com operacao diaria.
- Dados sem filtro aplicado.

Critério de aceite:
Todo card de relatorio abre a lista ou dominio correspondente com filtro aplicado.

## 29. Comunicacao Detalhada

Rota alvo:
`/gestao/:placeId/comunicacao`.

Persona primaria:
Recepcao, financeiro, gestor, organizador.

Pergunta:
Quais mensagens existem e onde foram usadas?

Views:

- Modelos.
- Historico.
- Avisos.
- Notificacoes.

Modelos:

- Reserva confirmada.
- Reserva aguardando pagamento.
- Cancelamento.
- Remarcacao.
- Lembrete.
- Cobranca.
- Pagamento confirmado.
- Aula.
- Reposicao.
- Lead.
- Inscricao.
- Partida.
- Resultado pendente.
- Aviso geral.

Historico:

- destinatario;
- canal;
- origem;
- data;
- remetente;
- status: preparado, enviado manualmente, registrado.

Avisos:

- aviso de competicao;
- aviso de aula;
- aviso geral.

Proibido:

- Central de comunicacao remover botoes WhatsApp contextuais.
- Editar modelo sem preview.
- Mensagem sem variaveis claras.

Critério de aceite:
Usuario consegue ver modelos e historico sem perder a acao contextual nos fluxos.

## 30. Competicoes - Inscricoes e Pagamentos

Aplica a:
Torneio e liga.

Persona primaria:
Organizador/financeiro de evento.

Pergunta:
Quem esta inscrito, aprovado e pago?

Lista de inscricoes:

Colunas:

- Jogador/dupla.
- Categoria/classe.
- Status inscricao.
- Status pagamento.
- Data.
- Contato.
- Acoes.

Views:

- Pendentes.
- Aprovados.
- Aguardando pagamento.
- Pagos.
- Rejeitados.
- Lista de espera.

Acoes:

- Aprovar.
- Rejeitar.
- Colocar em espera.
- Cobrar.
- Marcar pago.
- WhatsApp.
- Abrir jogador/cliente.

Proibido:

- Pagamento de inscricao escondido no chat.
- Aprovar sem status claro.
- Participante ver acoes admin.

## 31. Player App Completo

### Inicio

Pergunta:
O que tenho para fazer como jogador/aluno?

Deve mostrar:

- proximo compromisso;
- CTA jogar/reservar;
- aula proxima se houver;
- partida proxima se houver;
- pagamento pessoal pendente se houver.

Proibido:

- ferramentas administrativas;
- modo organizador em card publico.

### Jogar

Pergunta:
Como encontro quadra, jogo ou aula?

Deve mostrar:

- reservar quadra;
- encontrar jogo;
- aulas disponiveis;
- locais.

Proibido:

- texto interno como "escolha um caminho e veja apenas o que ajuda".
- imagens sobrepostas que atrapalham botoes.

### Competir

Pergunta:
Como participo de torneios e ligas?

Deve mostrar:

- torneios publicos;
- ligas;
- meus jogos;
- resultados recentes;
- ranking.

Proibido:

- botao Trabalho;
- modo organizador fora do Trabalho;
- botoes que ficam brancos no hover.

### Rotina

Pergunta:
Quais sao meus compromissos e pendencias?

Views:

- Tudo.
- Reservas.
- Partidas.
- Aulas.
- Pagamentos.
- Historico.

### Perfil

Pergunta:
Quem sou eu e quais preferencias tenho?

Deve separar:

- dados pessoais;
- historico jogador;
- preferencias;
- conta.

Proibido:

- imagem/avatar desalinhado;
- textos desalinhados;
- misturar gestao sem fronteira.

## 32. Work Mobile Detalhado por Papel

### Professor

Primeira tela:
Hoje.

Conteudo:

- aulas por hora cheia;
- turma;
- alunos;
- quadra;
- faltas avisadas;
- reposicoes;
- observacoes.

Acoes:

- abrir aula;
- abrir aluno;
- registrar observacao;
- WhatsApp se permitido.

### Recepcao

Primeira tela:
Hoje/Agenda.

Conteudo:

- proximas reservas;
- conflitos;
- remarcacoes;
- cliente busca;
- nova reserva.

### Financeiro

Primeira tela:
Vencidos/Receber.

Conteudo:

- vencidos;
- recebiveis de hoje;
- cobrar;
- marcar pago.

### Caixa

Primeira tela:
Vender.

Conteudo:

- produtos;
- carrinho;
- finalizar;
- estoque baixo.

### Organizador

Primeira tela:
Hoje.

Conteudo:

- competicoes com bloqueio;
- resultados pendentes;
- check-in;
- avisos.

### Gestor

Primeira tela:
Pendencias.

Conteudo:

- agenda;
- financeiro;
- clientes;
- aulas;
- competicoes.

Proibido no mobile:

- relatorio avancado;
- configuracao profunda;
- matriz de permissao;
- tabelas densas.

## 33. Compatibilidade de Rotas

Rotas antigas devem continuar funcionando:

- `/agenda`
- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/locais/:placeId/admin`
- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/eventos/ligas/:leagueId`
- `/eventos/:tournamentId`
- `/eventos/:tournamentId/organizacao`
- `/inscricao/:tournamentId`
- `/join/:tournamentId`
- `/t/:tournamentId`
- `/reservas/alteracao/:token`

Regra:

- Se a tela alvo mudar, criar wrapper/redirect preservando parametros.
- Link publico nao quebra.
- Query params relevantes devem ser preservados.

## 34. Revisao obrigatoria antes de sprint

Antes de iniciar uma sprint:

1. Localizar a tela neste documento.
2. Se a tela nao existir, adicionar contrato.
3. Confirmar menu/topbar.
4. Confirmar views/filtros/colunas.
5. Confirmar detalhe/drawer.
6. Confirmar acoes e proibicoes.
7. Confirmar estados.
8. Confirmar rotas.
9. So entao codar.
