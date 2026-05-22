# SaaS Execution Guardrails and Anti-Patterns

Status: regras obrigatorias de implementacao
Data: 2026-05-22
Fonte primaria: `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
Mapa alvo: `SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`

## 1. Objetivo

Este documento existe para impedir interpretacoes ruins durante a implementacao.

O objetivo nao e apenas dizer o que queremos. E tambem dizer o que esta proibido, como reconhecer erro e quando uma tela nao pode ser considerada pronta.

Nenhum sprint estrutural deve comecar sem ler estes guardrails.

## 2. Regra principal

Toda mudanca precisa melhorar o SaaS completo, nao apenas uma pagina isolada.

Antes de implementar, responder:

- Qual dominio esta sendo alterado?
- Qual persona usa?
- Qual tarefa real melhora?
- Essa tarefa e diaria, eventual, rara ou analitica?
- A funcao deve ser menu, view, detalhe, acao, configuracao ou relatorio?
- Existe risco de criar submenu confuso?
- Existe risco de empilhar blocos e esconder o fluxo?
- Como o usuario conclui a tarefa?
- Como essa mudanca conversa com Cliente 360, Agenda, Financeiro e Comunicacao?

Se a resposta nao estiver clara, nao implementar ainda.

## 3. Regras obrigatorias de navegacao

### 3.1. Menu principal

O menu principal so pode conter dominios estaveis:

- Inicio
- Agenda
- Clientes
- Academia
- Financeiro
- Competicoes
- Loja/POS
- Comunicacao
- Relatorios
- Administracao

Proibido:

- Adicionar no menu principal uma acao pontual como "Nova reserva".
- Adicionar submodulos raros como "Regras" fora de Administracao.
- Duplicar a mesma funcao em dois menus principais.
- Colocar pagamento pessoal no Financeiro do local.
- Colocar organizacao de torneio no Player App.

Exemplo ruim:

Agenda, Reservas, Calendario, Espera, Quadras, Aulas, Clientes, Leads, Alunos, Pagamentos, Financeiro.

Exemplo correto:

Agenda como dominio; dentro dela calendario e reservas. Clientes como dominio; dentro dele leads, ativos, alunos e socios.

### 3.2. Subnavegacao interna

Subnavegacao pode existir, mas deve ser rasa e previsivel.

Permitido:

- Views salvas.
- Filtros.
- Tabs de primeiro nivel.
- Paginas irmas claras.

Proibido:

- Tab dentro de tab dentro de tab.
- Menu lateral interno competindo com sidebar global.
- Carrossel como forma de navegar ferramentas administrativas.
- Blocos empilhados que funcionam como menu disfarçado.

Exemplo ruim:

Reservas > Hoje > Calendario > Espera > Ajustes > Recursos.

Exemplo correto:

Agenda > Calendario, com filtros e detalhe de reserva.

### 3.3. Busca global e criar rapido

Busca global e criar rapido existem para reduzir dependencia de menu.

Busca deve tender a encontrar:

- cliente;
- reserva;
- aula/turma;
- pagamento;
- torneio;
- liga;
- produto.

Criar rapido deve tender a iniciar:

- reserva;
- cliente;
- cobranca;
- turma/aula;
- torneio;
- produto.

Proibido:

- Usar criar rapido como substituto de fluxo incompleto.
- Criar item sem proximo passo ou sucesso claro.

## 4. Regras obrigatorias de pagina

### 4.1. Toda pagina responde uma pergunta

Cada pagina deve responder uma pergunta principal.

Exemplos:

- Inicio: o que precisa de atencao agora?
- Agenda: o que esta ocupado, livre ou em conflito?
- Clientes: quem precisa de atendimento ou acompanhamento?
- Cliente 360: qual e a situacao desta pessoa?
- Financeiro: quem deve, quem pagou e o que vence?
- Competicoes: qual fase precisa de acao?

Proibido:

- Pagina que so mostra varios blocos sem pergunta clara.
- Pagina que lista tudo porque "pode ser util".
- Pagina que mistura operacao, relatorio e configuracao na primeira dobra.

### 4.2. Primeira dobra

Primeira dobra deve conter:

- contexto;
- tarefa principal;
- CTA principal;
- principais pendencias;
- entrada para detalhe.

Proibido:

- Comecar com configuracoes.
- Comecar com historico.
- Comecar com cards decorativos.
- Comecar com texto explicativo longo.
- Comecar com carrossel para operacao diaria.

### 4.3. Cards

Cards devem ser usados para:

- resumo acionavel;
- item de lista;
- detalhe curto;
- alerta;
- atalho real.

Proibido:

- Card como botao gigante sem contexto.
- Card branco em tema dark quebrando contraste.
- Card que mostra numero mas nao abre lista filtrada.
- Card repetido que duplica uma tab/menu.
- Card sem acao quando existe pendencia.

Regra:
Todo card com numero deve abrir a lista filtrada correspondente, exceto se for puramente informativo e estiver marcado como tal.

### 4.4. Tabelas, listas e calendarios

Web SaaS deve usar listas e tabelas quando houver muitos itens.

Proibido:

- Empilhar dezenas de cards quando uma tabela/list view resolveria melhor.
- Esconder filtro importante.
- Usar mobile cards como unica estrutura no desktop.

Permitido:

- Lista compacta.
- Tabela.
- Kanban quando status for o foco.
- Calendario quando tempo/recurso for o foco.
- Detail drawer para evitar perder contexto.

## 5. Regras de acoes

### 5.1. Acao contextual

Acoes sobre um item devem aparecer no detalhe do item.

Exemplos:

- Reserva: editar, cancelar, remarcar, cobrar, WhatsApp.
- Cliente: nova reserva, matricular, cobrar, WhatsApp, observacao.
- Pagamento: marcar pago, cobrar, abrir cliente.
- Partida: lancar resultado, confirmar, chat.

Proibido:

- Criar submenu global para uma acao que pertence ao detalhe.
- Esconder acao diaria em Administracao.
- Colocar acao perigosa perto de acao diaria sem separacao.

### 5.2. Acoes perigosas

Acoes destrutivas devem ficar em area separada, com confirmacao.

Exemplos:

- excluir torneio;
- cancelar serie inteira;
- remover colaborador;
- excluir conta;
- resetar configuracao.

Proibido:

- Botao destrutivo no mesmo peso visual de "editar".
- Acao irreversivel dentro de card de rotina.

### 5.3. Sucesso e proximo passo

Toda acao importante deve ter proximo passo.

Exemplos:

- Reserva criada: ver na Agenda, enviar WhatsApp, abrir Cliente 360.
- Pagamento marcado: abrir Cliente 360, voltar para Receber.
- Turma criada: matricular aluno, abrir Agenda.
- Resultado lancado: ver classificacao, proximo jogo.

Proibido:

- Acao terminar sem feedback.
- Fechar modal e deixar usuario sem saber onde foi parar o item.

## 6. Regras por dominio

### 6.1. Inicio

Deve mostrar:

- pendencias por papel;
- agenda relevante;
- alertas criticos;
- indicadores simples.

Nao deve mostrar:

- configuracoes;
- todos os modulos;
- relatorios avancados;
- carrossel de funcoes.

Erro comum:
Transformar Inicio em catalogo de menus.

### 6.2. Agenda

Deve mostrar:

- calendario como primeira experiencia;
- reservas, aulas, bloqueios e conflitos;
- filtros por tipo;
- slot clicavel;
- drawer de detalhe.

Nao deve mostrar:

- filtros de professor/turma em uma view exclusiva de reservas, salvo quando a view for calendario geral;
- ajustes de quadra como rotina;
- espera como tab permanente se ela e contexto do slot.

Erro comum:
Fazer Agenda virar apenas a antiga pagina Reservas com outro nome.

### 6.3. Clientes

Deve mostrar:

- leads;
- clientes ativos;
- alunos;
- socios;
- responsaveis;
- Cliente 360.

Nao deve mostrar:

- todos misturados sem views;
- cadastro pesado antes de atendimento rapido;
- campos obrigatorios demais.

Erro comum:
Tratar Cliente como tabela de contatos sem historico operacional.

### 6.4. Academia

Deve mostrar:

- aulas;
- turmas;
- matriculas;
- reposicoes;
- evolucao;
- configuracao de chamada opcional.

Nao deve mostrar:

- professor comum vendo financeiro/cantina/equipe;
- chamada obrigatoria por padrao;
- ajustes raros no meio da rotina.

Erro comum:
Adaptar a pagina mobile de aulas para web.

### 6.5. Financeiro

Deve mostrar:

- receber;
- vencidos;
- pagos;
- despesas;
- planos/pacotes;
- resumo.

Nao deve mostrar:

- pagamento pessoal do jogador;
- aulas como foco;
- POS como se fosse financeiro completo.

Erro comum:
Espalhar botoes "pagar" por varias telas sem modal padrao.

### 6.6. Competicoes

Deve mostrar:

- hub de competicoes no Trabalho;
- torneios e ligas por fase;
- bloqueio da fase atual;
- inscricoes, pagamentos, jogos, resultados e comunicacao.

Nao deve mostrar:

- descoberta publica como tela do organizador;
- admin no Player App;
- ferramenta owner para participante.

Erro comum:
Manter tabs antigas e apenas trocar visual.

### 6.7. Loja/POS

Deve mostrar:

- venda rapida;
- vendas do dia;
- produtos;
- estoque;
- fechamento.

Nao deve mostrar:

- cadastro de produto antes da venda;
- financeiro amplo;
- relatorio complexo na primeira dobra.

### 6.8. Comunicacao

Deve mostrar:

- modelos;
- historico;
- avisos;
- notificacoes.

Nao deve substituir:

- WhatsApp contextual em reserva, cobranca, aula ou competicao.

Erro comum:
Criar uma central de comunicacao e remover a acao do lugar onde o usuario precisa dela.

### 6.9. Relatorios

Primeira entrega:

- cards que abrem listas filtradas.

Depois:

- graficos;
- comparativos;
- exportacoes;
- dashboards.

Proibido:

- Fazer relatorio virar foco antes de operação estar clara.
- Criar grafico sem link para os dados.

### 6.10. Administracao

Deve conter:

- unidade/local;
- equipe;
- permissoes futuras;
- quadras/recursos;
- regras;
- planos;
- publicacao;
- integracoes;
- avancado.

Nao deve aparecer:

- como tarefa diaria de professor/recepcao.

Erro comum:
Deixar ajustes duplicados dentro de cada modulo operacional.

## 7. Regras web vs mobile

### 7.1. Web

Web deve aceitar profundidade:

- sidebar;
- topbar;
- busca;
- criar rapido;
- tabelas;
- filtros;
- detalhe lateral;
- configuracoes;
- relatorios.

Proibido:

- Desktop com layout de mobile esticado.
- Cards enormes para listas longas.
- Conteudo ocupando pouca largura sem motivo.

### 7.2. Mobile Trabalho

Mobile deve ser operacional.

Permitido:

- hoje;
- agenda do dia;
- acoes rapidas;
- resultado;
- cobranca simples;
- WhatsApp;
- consulta de cliente;
- venda rapida.

Proibido:

- configuracao profunda;
- relatorio avancado;
- submenus longos;
- tabelas complexas;
- ferramentas raras.

## 8. Estados obrigatorios

Toda lista, calendario ou dominio precisa tratar:

- carregando;
- vazio;
- sem permissao;
- erro;
- sem dados suficientes;
- sucesso;
- bloqueado por regra.

Exemplos:

Estado vazio ruim:
Nenhum item encontrado.

Estado vazio correto:
Voce ainda nao tem reservas para hoje. Clique em um horario livre na Agenda para criar a primeira reserva.

Sem permissao ruim:
Erro.

Sem permissao correto:
Seu perfil nao tem acesso a Financeiro. Fale com o administrador da unidade se precisar dessa permissao.

## 9. Anti-padroes proibidos

### 9.1. Menu duplicado

Sinal:
Dois menus proximos com itens parecidos.

Exemplo:
Tabs "Inscritos/Jogos/Comunicacao" e logo abaixo botoes "Podio/Jogos/Chat/Organizacao".

Correcao:
Uma navegacao primaria por fase/visao e acoes no detalhe.

### 9.2. Botao branco no tema dark

Sinal:
Hover ou estado ativo fica branco e texto some.

Correcao:
Estados dark consistentes, verde para ativo/primario.

### 9.3. Bloco sem acao

Sinal:
Card mostra pendencia mas nao tem caminho.

Correcao:
Botao resolver ou click para lista filtrada.

### 9.4. Configuracao como rotina

Sinal:
Professor/recepcao ve ajustes, recursos ou regras no fluxo diario.

Correcao:
Mover para Administracao ou configuracao do dominio.

### 9.5. Dados sem contexto

Sinal:
Numero grande sem explicar o que representa ou o que fazer.

Correcao:
Label, detalhe e destino.

### 9.6. Fluxo interrompido

Sinal:
Usuario cria algo e nao sabe onde ver.

Correcao:
Tela/feedback de sucesso com proximo passo.

### 9.7. Tudo em uma pagina

Sinal:
Pagina tenta mostrar lista, detalhe, relatorio, configuracao e historico juntos.

Correcao:
Separar por list view, detalhe, relatorio e configuracao.

### 9.8. Tudo em modais

Sinal:
Fluxo complexo vive em modal pequeno.

Correcao:
Drawer grande ou pagina dedicada.

### 9.9. Mobile como web reduzido

Sinal:
Mobile tem todas as areas e configuracoes.

Correcao:
Mobile por papel e tarefa.

### 9.10. Web como mobile expandido

Sinal:
Desktop usa cards gigantes, carrossel e pouca densidade.

Correcao:
Usar listas, calendario, grid responsivo e detail drawer.

## 10. Checklist antes de implementar uma tela

Responder sim para todos:

- A pagina pertence a um dominio definido?
- A persona primaria esta clara?
- A pergunta principal da pagina esta clara?
- O CTA primario esta claro?
- A primeira dobra mostra operacao, nao configuracao rara?
- Acoes sobre item ficam no detalhe?
- Configuracao rara esta fora da rotina?
- O estado vazio orienta proximo passo?
- O estado sem permissao e claro?
- Mobile e web foram considerados separadamente?
- Rotas antigas continuam funcionando?
- Cards com numero abrem lista filtrada?
- Existe caminho de sucesso apos acao?
- Nao ha menu duplicado?
- Nao ha tab/subtab profunda?
- Nao ha blocos empilhados como menu disfarçado?

Se alguma resposta for "nao", a tela nao esta pronta para implementacao.

## 11. Checklist antes de considerar uma tela pronta

Validar:

- Desktop 1366.
- Desktop amplo.
- Mobile 390.
- Mobile 430, se aplicavel.
- Console sem erro.
- Permissao principal.
- Sem permissao.
- Estado vazio.
- Estado com muitos dados.
- Acoes principais.
- Volta para contexto correto.
- Nomenclatura igual ao blueprint.
- Visual dark consistente.
- Sem texto cortado.
- Sem overflow horizontal inesperado.
- Sem botao branco ilegivel.

## 12. Regra de revisao por sprint

Ao terminar cada sprint, registrar:

- O que foi alterado.
- Qual dominio mudou.
- Qual fluxo melhorou.
- Quais anti-padroes foram evitados.
- Quais rotas foram preservadas.
- Quais testes foram feitos.
- O que ainda ficou pendente.

Se uma mudanca viola este documento, ela deve ser corrigida antes de seguir para o proximo sprint.

