# Manual SaaS Empresarial e Organizacao Operacional

Status: base nova de produto
Data: 2026-05-22
Escopo: area Trabalho/Gestao web, mobile operacional e relacao com app Jogador

## Premissa central

O ATP nao deve ser organizado como um conjunto de paginas reaproveitadas. Ele deve funcionar como um SaaS empresarial para academias, clubes, professores, torneios, ligas e operacoes de quadra.

A base atual do app deve ser aproveitada quando acelerar a entrega, mas nao pode limitar a arquitetura ideal. A documentacao separa sempre:

- SaaS alvo ideal: como o produto deve funcionar para ser profissional, claro e escalavel.
- Base atual reaproveitavel: funcoes, dados, componentes e fluxos que ja existem e podem sustentar o caminho ate o alvo.
- Lacunas reais: pontos onde sera necessario criar ou adaptar algo porque o fluxo operacional nao fecha.

## Referencias de mercado estudadas

Padroes observados em SaaS fortes e plataformas de gestao:

- Shopify Home mostra tarefas do dia, proximos passos, atividade recente e metricas antes de aprofundar em analiticos. Fonte: https://help.shopify.com/en/manual/shopify-admin/shopify-home
- Stripe Dashboard separa clientes, pagamentos, produtos, billing, reporting, atalhos e mobile para monitorar metricas e pagamentos em movimento. Fonte: https://docs.stripe.com/dashboard/basics
- HubSpot organiza ferramentas por categorias de trabalho, usa home global, favoritos/bookmarks, CRM, Sales, Commerce, Service, Automations e Reporting. Fonte: https://knowledge.hubspot.com/help-and-resources/a-guide-to-hubspots-navigation
- Square Appointments usa calendario como centro de trabalho, cliente com historico/notas/pagamento, agenda por equipe/local e relatorios em dashboard. Fontes: https://squareup.com/us/en/appointments e https://square.site/help/us/en/article/8443-manage-staff-schedules-and-availability-with-square-appointments
- CourtReserve agrupa reservas, aulas, eventos, memberships, ligas, app mobile, faturamento, POS, controle de acesso e integracoes como uma plataforma unica para clubes. Fonte: https://courtreserve.com/
- Wodify combina agenda de aulas, membros, pagamentos recorrentes, contratos, performance e app do aluno. Fonte: https://www.wodify.com/products
- Salesforce Lightning mostra como um SaaS maduro organiza apps, objetos, home, busca global, list views, kanban, acoes globais, App Launcher e navegacao que muda conforme o app/contexto. Fontes: https://help.salesforce.com/s/articleView?id=lex_find_record_layout.htm&language=en_US e https://help.salesforce.com/s/articleView?id=xcloud.basics_app_launcher_lex.htm&language=en_US&type=5

Licoes aplicaveis ao ATP:

- A tela inicial de trabalho deve mostrar tarefa acionavel, nao arvore de modulos.
- Calendario e agenda devem ser centros operacionais, nao subabas escondidas.
- Cliente/aluno precisa de pagina 360 com historico, pagamentos, reservas, aulas, interacoes e status.
- Financeiro precisa ser dominio proprio, com recebiveis, pagos, despesas, planos, inadimplencia e relatorios.
- Configuracao deve ser profunda, mas fora da rotina diaria.
- Mobile trabalho deve ser acao rapida; web trabalho deve ser gestao profunda.
- Atalhos/favoritos e busca global sao importantes quando o SaaS cresce.
- List views salvas, filtros, kanban e split/detail view sao padroes fortes para objetos operacionais como reservas, alunos, cobranças, leads, inscricoes e partidas.
- Acoes globais e acoes de registro devem existir, mas cada acao precisa aparecer no contexto correto: criar reserva no calendario, cobrar no financeiro, lancar resultado na partida.
- App Launcher e workspaces por dominio evitam que o menu principal vire uma lista infinita.

## Papel do SaaS

O sistema deve organizar a vida operacional e empresarial da academia ou clube:

- agenda e disponibilidade;
- quadras, regras e bloqueios;
- reservas, pagamentos e remarcacoes;
- aulas, turmas, alunos, professores e reposicoes;
- mensalidades, pacotes, inadimplencia e comissoes;
- torneios, ligas, inscricoes, jogos, resultados e comunicacao;
- colaboradores, papeis, convites e responsabilidades;
- loja/POS, produtos, vendas e estoque;
- comunicacao por WhatsApp, notificacoes, avisos e historico;
- relatorios, ocupacao, receita, performance e auditoria;
- configuracoes de unidade, planos, regras e publicacao.

Perguntas que a primeira camada do SaaS precisa responder:

- O que precisa ser feito hoje?
- O que esta travando a operacao?
- Quem precisa agir?
- Qual agenda esta ocupada?
- Quem deve dinheiro?
- Qual reserva precisa mudar?
- Qual aula precisa de professor, quadra ou reposicao?
- Qual torneio/liga precisa de decisao?
- O que cresceu, caiu ou exige atencao?

## Principios de organizacao

### Clareza antes de beleza

O visual premium ajuda, mas a prioridade e entendimento. Um usuario deve entender a proxima acao sem interpretar estrutura interna.

### Fluxo antes de banco de dados

Telas devem refletir trabalho real:

- Recepcao quer ver agenda, criar reserva, editar horario, cobrar e avisar cliente.
- Professor quer saber hoje, turma, alunos, quadra, horario e observacoes.
- Financeiro quer receber, cobrar, marcar pago, ver vencidos e fechar resumo.
- Organizador quer resolver a fase atual da competicao.

### Web e mobile tem papeis diferentes

Web SaaS e gestao profunda. Mobile trabalho e execucao rapida. O mobile nao deve carregar todo o SaaS web.

### Cada colaborador deve ver seu trabalho

Nao existe um painel unico bom para todos. O produto pode ter uma estrutura comum, mas a primeira dobra e os CTAs mudam por papel.

### Complexidade organizada, nao escondida

Funcoes importantes nao devem sumir em terceira camada. Funcoes raras devem estar em configuracao, avancado ou detalhe.

### Area de trabalho, nao apenas menu lateral

O menu principal deve dar acesso a dominios estaveis. Acoes frequentes aparecem no contexto do fluxo, nao como abas paralelas.

### Historico e detalhe fecham o ciclo

Reserva, aluno, pagamento, torneio, aula e cliente precisam ter historico e detalhe. Sem isso, o SaaS vira so cadastro/lista.

### Comunicacao e parte da operacao

WhatsApp, avisos e notificacoes devem ser contextuais e registrados quando possivel. Nao basta abrir mensagem; a acao precisa fazer sentido dentro do fluxo.

### Pagamento como etapa operacional padrao

Todo ponto que exige valor deve usar uma experiencia padrao de pagamento/confirmacao. Enquanto gateway real nao entra, um modal padrao pode marcar como pago e registrar contexto.

## Web SaaS

A versao web deve comportar:

- configuracao completa da academia;
- cadastros profundos;
- agenda diaria, semanal e por recurso;
- financeiro e relatorios;
- torneios e ligas completos;
- cadastro e historico de alunos/clientes;
- gestao de equipe e convites;
- regras, planos, precos e disponibilidade;
- operacao multiunidade;
- auditoria e logs no futuro.

Padrao esperado: SaaS profissional com topbar, seletor de unidade, busca, atalhos, sidebar por dominios, paginas de lista, detalhe, relatorios e configuracoes.

## Mobile Trabalho

Mobile trabalho deve conter apenas o que faz sentido em movimento:

- hoje;
- agenda do dia;
- aulas do professor;
- resultado de partida;
- check-in simples;
- consulta rapida de aluno/reserva;
- aprovacao simples;
- comunicacao;
- notificacoes acionaveis;
- pendencias criticas.

Nao deve tentar replicar:

- configuracoes completas;
- relatorios avancados;
- montagem profunda de torneios;
- financeiro completo;
- cadastros complexos;
- matriz de permissoes.

## App Jogador

O app Jogador continua sendo experiencia final:

- jogar;
- reservar;
- competir;
- agenda pessoal;
- aulas pessoais;
- pagamentos pessoais;
- perfil;
- ranking e resultados.

Nao deve exibir ferramentas administrativas, salvo quando o usuario troca explicitamente para Trabalho.

## Padrao de pagina SaaS

Toda area importante deve ter, quando fizer sentido:

1. Visao geral: status, pendencias, indicadores e proximo passo.
2. Lista operacional: registros filtraveis, ordenados e acionaveis.
3. Detalhe do item: dados, historico, acoes e relacoes.
4. Acoes rapidas: criar, editar, cobrar, cancelar, avisar, registrar, gerar.
5. Historico: eventos, mudancas, pagamentos, mensagens e observacoes.
6. Configuracoes da area: regras, modelos, padroes, automacoes.

## Dominios de produto

### Operacao

Painel do dia, pendencias, alertas e atalhos para resolver.

### Agenda e Recursos

Calendario central de quadras, aulas, bloqueios, reservas, competicoes e disponibilidade.

### Pessoas

Clientes, alunos, leads, socios, responsaveis, historico, tags e relacionamento.

### Academia

Aulas, turmas, professores, horarios, contratos, reposicoes, evolucao e presenca opcional.

### Reservas

Fluxo operacional dentro do calendario: criar, editar, cancelar, remarcar, avisar, cobrar, historico.

### Financeiro

Recebiveis, pagamentos, inadimplencia, despesas, planos, pacotes, comissoes e relatorios.

### Competicoes

Torneios, ligas, inscricoes, jogadores, jogos, resultados, classificacao, pagamentos e comunicacao.

### Loja/POS

Venda rapida, produtos, estoque, caixa, cancelamentos e fechamento.

### Comunicacao

Templates, WhatsApp, avisos, notificacoes, grupos, historico de contato e campanhas futuras.

### Relatorios

Ocupacao, receita, alunos, professores, aulas, reservas, torneios, ligas e inadimplencia.

### Administracao

Unidades, equipe, permissoes futuras, planos, publicacao, regras, integracoes, auditoria e avancado.

## Regra tecnica de aproveitamento

Antes de propor backend novo, responder:

- A funcao ja existe?
- Ela esta so mal posicionada?
- A logica atual fecha o fluxo?
- Pode ser resolvida com pagina, wrapper, consulta, estado ou composicao?
- Falta dado essencial, historico, status ou relacao?
- Qual e o menor ajuste tecnico para fechar o fluxo?

Preferencia:

1. Reorganizar o que ja existe.
2. Melhorar fluxo e navegacao.
3. Reutilizar componentes e dados.
4. Adaptar funcoes atuais.
5. Criar complementos pequenos.
6. Criar nova estrutura apenas quando indispensavel.

## Definicao de pronto para implementar

Uma mudanca estrutural so deve entrar em sprint quando tiver:

- persona primaria;
- fluxo completo;
- tela inicial ideal;
- CTA principal;
- dados necessarios;
- estado vazio;
- estado de erro;
- versao web;
- versao mobile, se aplicavel;
- impacto em rotas antigas;
- funcoes reaproveitadas;
- lacunas tecnicas reais;
- criterio de aceite.
