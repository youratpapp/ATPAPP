# Work SaaS UX Organization Master Spec V4 - 2026-05-22

Status: fonte executiva de produto/UX para a reorganizacao da area Trabalho.  
Escopo: organizacao, arquitetura de informacao, fluxos, superficies, menus, page contracts e criterios de aceite antes de novas implementacoes.  
Regra: este documento substitui a leitura direta das queues V2/V3 quando houver conflito de organizacao, prioridade, mobile ou fluxo.

## 0. Por Que Esta V4 Existe

O problema nao e falta de documento. O problema e que havia documentos bons demais para ficar soltos, mas eles nao estavam amarrados em uma decisao unica de produto.

O resultado pratico foi:

- algumas correcoes atacaram sintomas visuais;
- algumas queues marcaram fases como completas, mas o produto ainda preservou a estrutura antiga;
- o mobile Trabalho continuou carregando paginas de SaaS web encolhidas;
- o usuario ainda encontra menu externo, menu interno, tabs, cards e CTAs concorrentes;
- algumas paginas seguem funcionando, mas nao conduzem a pessoa pelo fluxo natural;
- o app tem muitas ferramentas boas, mas ainda nao se comporta como um SaaS profissional.

Esta V4 corrige a governanca:

1. Define a arquitetura final desejada.
2. Separa claramente SaaS web, mobile Trabalho e Player App.
3. Reclassifica documentos antigos como fonte, apoio ou historico.
4. Congela contratos de pagina e fluxo.
5. Reordena a queue para atacar o problema estrutural primeiro.
6. Proibe implementacao solta sem sprint packet.

## 1. Regra De Fonte Da Verdade

Usar como documentos executivos atuais:

1. `DOCS_SOURCE_OF_TRUTH_INDEX_2026_05_22.md`
2. `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
3. `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`
4. `WORK_SAAS_UX_ORGANIZATION_EXECUTION_QUEUE_V4_2026_05_22.md`
5. `WORK_SAAS_ROUTE_COMPATIBILITY_CONTRACT_V3.md`
6. `WORK_SAAS_PERMISSION_CONTRACT_V3.md`
7. `WORK_AREA_FUNCTION_INVENTORY.md`
8. `WORK_SAAS_DETAILED_USER_FLOWS.md`
9. `WORK_MOBILE_OPERATIONAL_SCOPE.md`
10. `WORK_SAAS_PAGE_RESPONSIBILITIES.md`
11. `WORK_SAAS_REAL_USER_FLOW_TEST_REPORT_2026_05_21.md`

Usar como referencia de apoio:

- `WORK_SAAS_INFORMATION_ARCHITECTURE.md`
- `WORK_SAAS_FINAL_SCREEN_AUDIT_2026_05_21.md`
- `NAVIGATION_WORKSPACE_RESTRUCTURE_V4.md`
- `ATP_FINANCE_WORKFLOW_STUDY_2026_05_21.md`
- `ACADEMY_E2E_FLOW_AUDIT_2026_05_21.md`
- `TOURNAMENT_E2E_FLOW_AUDIT_2026_05_20.md`
- `LEAGUE_E2E_FLOW_AUDIT_2026_05_21.md`

Usar como historico, nao como comando atual:

- `Legado/2026-05-22_pre_v4_archived/WORK_SAAS_MASTER_EXECUTION_QUEUE_V3_COMPLETE.md`
- `Legado/2026-05-22_pre_v4_archived/WORK_SAAS_FINAL_HANDOFF_2026_05_21.md`
- `Legado/2026-05-22_pre_v4_archived/WORK_SAAS_IMPLEMENTATION_QUEUE_V2_FINAL.md`
- `Legado/2026-05-22_pre_v4_archived/EXECUTION_QUEUE.md`
- documentos de sprints antigos que registram o que foi feito, mas nao devem preservar layouts antigos.

Regra dura:

Quando um documento antigo diz que uma fase esta "completa", isso significa apenas que uma rodada anterior terminou. Nao significa que a experiencia final esta aceita. A aceitacao final passa pelos gates desta V4.

## 2. Decisoes De Produto Inadiaveis

### 2.1 Tres Superficies, Nao Uma So

O ATP deve funcionar como tres experiencias conectadas:

| Superficie | Papel | Produto |
| --- | --- | --- |
| Player App | usuario final | jogar, reservar, competir, agenda pessoal, perfil |
| SaaS Web Trabalho | gestao profissional | operacao profunda, cadastros, financeiro, relatorios, administracao, multiunidade |
| Mobile Trabalho | execucao rapida | rotina do dia, pendencias, acoes simples, comunicacao, lancamentos, aprovacao |

Competition OS nao deve virar terceiro botao global. Ele e um dominio contextual:

- no modo Jogador, `Competir` e descoberta/participacao;
- no modo Trabalho, `Competicoes` e operacao/organizacao.

### 2.2 Web Trabalho Pode Ser Profundo

O web Trabalho deve ter porte de SaaS:

- shell profissional;
- contexto de organizacao/unidade;
- sidebar por dominios;
- paginas densas quando necessario;
- tabelas, filtros, drawers, detalhes;
- configuracao e relatorios separados;
- multiunidade preparado;
- crescimento futuro sem virar menu infinito.

### 2.3 Mobile Trabalho Deve Ser Enxuto

O mobile Trabalho nao e mini desktop.

Ele deve conter:

- o que tenho hoje;
- o que preciso resolver agora;
- quem preciso avisar;
- qual pagamento/resultado/reserva/aula precisa de acao simples;
- sheets e CTAs curtos;
- link para abrir web quando a acao for pesada.

Ele nao deve conter como primeira camada:

- configuracao rara;
- relatorio completo;
- permissao/equipe estrutural;
- cadastro complexo;
- setup de quadras, regras, planos, produtos, torneios ou ligas;
- dashboard executivo longo.

### 2.4 Funcao Existente Nao Pode Sumir

Reorganizar nao significa remover.

Cada funcao deve terminar em um destes destinos:

- menu principal web;
- pagina de dominio web;
- detalhe de entidade;
- CTA contextual;
- configuracao;
- relatorio;
- mobile operacional;
- web-only com explicacao;
- rota antiga preservada por wrapper/alias.

## 3. Contradicoes Que A V4 Resolve

| Contradicao | Risco | Decisao V4 |
| --- | --- | --- |
| V3 chama a queue de completa, mas tambem recomenda iniciar por shell/contexto | agente pode achar que tudo ja foi reorganizado | tratar V3 como plano historico; V4 e gate atual |
| Mobile Work aparece tarde demais na queue V3 | mobile continua mini SaaS por muitas sprints | V4 coloca Mobile Work Shell logo no inicio |
| `Agenda` aparece como agenda pessoal, calendario de reserva, calendario de aulas e item do menu | usuario nao sabe qual agenda abriu | Player usa `Rotina`/Agenda pessoal; Work tem `Calendario` first-class; reservas/aulas usam filtros/contexto |
| `Clientes` mistura contatos, alunos, socios, leads e historico | pessoas ficam espalhadas | criar dominio `Pessoas` com relacao clara |
| `Financeiro` mistura receber, pagos, planos, resumo e pagamentos contextuais | caixa/recepcao/jogador confundem dinheiro pessoal e local | centralizar local em `Receita`; manter pagamentos pessoais no Player App |
| Reservas tem hoje, calendario, nova, espera e ajustes no mesmo nivel | recepcao perde o fluxo | `Nova reserva` vira CTA; `Espera` fica dentro de Reservas; `Calendario` vira modulo; ajustes vao para Admin |
| Aulas tem calendario, alunos, professores, ajustes e chamada juntos | professor cai em ERP | professor mobile ve dia/turma/alunos; professores vao para Equipe/Pessoas; ajustes Admin; chamada opcional |
| Organizador usa rotas publicas de eventos | descoberta e operacao se misturam | Competition OS no Trabalho; rotas antigas preservadas |
| Multiacademia mostra listas demais dentro do workspace | usuario mexe no local errado | shell com contexto organizacao/unidade e switcher controlado |

## 4. Modelo Mental Final

O fluxo correto e:

```text
Modo -> Contexto -> Dominio -> Pagina -> CTA -> Detalhe -> Sucesso -> Proximo passo
```

Nunca:

```text
Modo -> modulo -> submenu -> outro submenu -> card duplicado -> acao escondida
```

Toda tela deve responder uma pergunta primaria:

- O que eu faco agora?
- O que esta pendente?
- O que tenho hoje?
- Quem precisa de atendimento?
- Quem precisa pagar?
- Qual competicao esta travada?
- O que estou configurando?
- O que estou analisando?

## 5. Modelo De Entidades

### 5.1 Estrutura Organizacional

```text
Organizacao
  Unidades/Locais
    Quadras
    Regras
    Reservas
    Lista de espera
    Aulas/Turmas
    Alunos/Matriculas
    Professores/Equipe
    Pessoas/CRM/Socios
    Recebiveis/Pagamentos/Despesas
    Cantina/POS/Produtos
```

### 5.2 Estrutura De Competicoes

```text
Competition OS
  Torneios
    Configuracao
    Inscricoes
    Pagamentos
    Jogos
    Resultados
    Comunicacao
    Staff
    Relatorio/Podio
  Ligas
    Configuracao
    Participantes
    Rodadas
    Resultados
    Classificacao
    Comunicacao
    Historico
```

### 5.3 Pessoas

Pessoa deve ser o conceito mental unico, mesmo que o backend ainda tenha entidades separadas.

Uma pessoa pode ser:

- lead;
- cliente;
- aluno;
- socio;
- jogador;
- responsavel;
- professor;
- staff;
- pagador.

Implementacao inicial pode ser indice unificado sobre entidades atuais, sem reescrever backend.

## 6. Arquitetura Do SaaS Web Trabalho

### 6.1 Shell Web

O shell web deve possuir:

- ATP identity com proporcao consistente;
- seletor `Jogador / Trabalho`;
- usuario;
- notificacoes;
- organizacao ativa;
- unidade/local ativo;
- breadcrumb;
- busca global futura;
- sidebar por dominios;
- area de pagina com um header unico.

O conteudo da pagina nao deve repetir toda a identidade/contexto que o shell ja comunica.

### 6.2 Sidebar Web Alvo

Nao mostrar grupo vazio. Nao mostrar item sem permissao.

```text
Trabalho
  Hoje

Operacao
  Calendario
  Reservas
  Aulas
  Loja/POS

Pessoas
  Pessoas

Receita
  Receber
  Pagos
  Despesas
  Planos
  Resumo

Competicoes
  Torneios
  Ligas
  Publicacao

Relatorios
  Operacao
  Receita
  Pessoas
  Competicoes

Administracao
  Equipe
  Ajustes
  Recursos
  Regras
  Permissoes
  Avancado
```

Observacao:

- `Receita` pode continuar aparecendo como `Financeiro` em rotas antigas, mas a responsabilidade do dominio e receita/cobranca do local.
- `Pessoas` substitui a logica mental de `Clientes`, sem exigir rewrite imediato.
- `Calendario` e modulo first-class, nao subaba de Reservas.
- `Atendimento` pode existir como experiencia de recepcao, mas nao deve virar um nome duplicado que esconda Reservas/Pessoas. Na primeira fase, usar `Reservas` + `Pessoas` com CTAs de atendimento.

## 7. Arquitetura Do Mobile Trabalho

### 7.1 Shell Mobile

O mobile Trabalho precisa ter composicao propria:

1. Header compacto.
2. Seletor `Jogador / Trabalho` sempre claro.
3. Contexto ativo: papel + unidade/competicao.
4. Uma pergunta principal.
5. Um CTA dominante.
6. Cards acionaveis.
7. Bottom nav por papel.
8. Sheets/detalhes curtos.
9. Link `Abrir no web` para acao complexa.

### 7.2 Bottom Nav Mobile Por Papel

| Papel | Nav alvo | Proibido na primeira camada |
| --- | --- | --- |
| Professor | Hoje, Agenda, Turmas, Alunos, Perfil | financeiro, cantina, equipe, ajustes |
| Recepcao | Hoje, Reservas, Pessoas, Aulas, Mais | financeiro amplo, ajustes estruturais |
| Financeiro | Receber, Pagos, Despesas, Resumo, Perfil | aulas, cantina, equipe |
| Caixa | Vender, Hoje, Estoque, Produtos, Perfil | financeiro amplo, aulas, ajustes |
| Organizador | Hoje, Torneios, Ligas, Avisos, Perfil | descoberta publica como foco |
| Gestor | Hoje, Calendario, Aulas, Receita, Mais | lista infinita de modulos |
| Scorekeeper | Hoje, Jogos, Resultados, Chat, Perfil | setup, pagamentos, staff |
| Check-in | Hoje, Inscritos, Check-in, Chat, Perfil | sorteio/regras/admin |
| Media | Hoje, Publicar, Chat, Links, Perfil | resultados/admin |

`Mais` deve conter apenas:

- trocar unidade;
- abrir SaaS web;
- admin permitido;
- relatorios permitidos;
- perfil/sair.

`Mais` nao pode virar lixeira de modulos.

## 8. Contratos Por Dominio

### 8.1 Trabalho Hoje

Pergunta: o que preciso resolver agora?

Web:

- owner/manager: bloqueios por unidade;
- professor: aulas/agenda;
- recepcao: reservas/check-ins/lista de espera;
- financeiro: vencidos/hoje;
- caixa: vender/estoque baixo;
- organizador: competicoes com bloqueio.

Mobile:

- maximo 3 a 5 cards de acao;
- nada de relatorio grande;
- nada de setup raro;
- CTA dominante.

Nunca:

- lista completa de modulos;
- dashboard executivo longo;
- configuracao sem bloqueio.

### 8.2 Calendario

Pergunta: o que acontece no tempo?

Responsavel por:

- reservas;
- bloqueios;
- aulas;
- professor;
- quadras;
- alocacao de competicao;
- conflitos.

Regras:

- grade por hora cheia como padrao;
- professor ve dia por horario, turma, alunos e quadra;
- recepcao ve agenda do dia e disponibilidade;
- gestor pode filtrar por unidade, quadra, professor e status;
- calendario nao guarda regras/precos/quadra como setup principal.

### 8.3 Reservas

Pergunta: quais reservas precisam de acao e como criar/alterar/cancelar?

Fluxo:

1. Nova reserva como CTA dominante.
2. Buscar cliente.
3. Selecionar dia/hora/duracao.
4. Ver disponibilidade real.
5. Confirmar reserva.
6. Abrir modal de pagamento quando houver valor.
7. Sucesso: ver na agenda, enviar WhatsApp, criar outra.

Estados:

- aguardando pagamento;
- paga/confirmada;
- cancelada;
- passada;
- reagendamento solicitado;
- lista de espera.

Decisoes:

- reserva nao precisa de confirmacao manual por padrao;
- reserva e garantida por pagamento quando pagamento existir;
- `requiresApproval` deve ser tratado como excecao/configuracao, nao fluxo padrao;
- horario ocupado nao pode exibir CTA `Criar reserva`;
- WhatsApp serve para cancelar, trocar, sugerir horarios ou avisar situacao;
- admin/secretaria/manager podem editar reserva manualmente;
- jogador altera por link seguro que abre agenda disponivel, preservando pagamento.

Nao fica em Reservas:

- quadra CRUD;
- regras;
- precos permanentes;
- configuracao estrutural.

### 8.4 Aulas

Pergunta: quais aulas/turmas/alunos precisam de acao?

Professor mobile:

- agenda do dia por hora cheia;
- proxima aula;
- turma;
- quadra;
- alunos;
- avisos/repo;
- progresso/observacao.

Chamada:

- opcional por configuracao da empresa;
- padrao desligado;
- se desligado, UI nao deve insistir em `Fazer chamada`;
- se ligado, aparece dentro do detalhe da aula.

Nao fica em Aulas:

- professores como gestao de staff;
- permissao/equipe;
- financeiro amplo;
- calendario global como submenu;
- ajustes estruturais.

Professores devem estar em `Equipe/Pessoas`.

### 8.5 Pessoas

Pergunta: quem e esta pessoa e qual relacao ela tem com o negocio?

Deve reunir mentalmente:

- leads;
- clientes;
- alunos;
- socios;
- responsaveis;
- staff/professores;
- historico de atendimento.

Web:

- busca unificada;
- filtros por relacao;
- timeline;
- detalhe;
- acoes contextuais: WhatsApp, cobrar, matricular, reservar, converter, arquivar.

Mobile:

- busca rapida;
- fila de pessoas com acao;
- detalhe em sheet.

Nao deve ser apenas lista de contatos.

### 8.6 Receita / Financeiro

Pergunta: quem precisa pagar, o que foi pago, o que saiu e como esta o resultado?

Subdominios:

- Receber;
- Pagos;
- Despesas;
- Planos/Pacotes;
- Resumo;
- relatorios financeiros;
- futuro: recorrencia, split, comissao, contratos.

Regras:

- pagamentos pessoais ficam no Player App;
- dinheiro do local fica em Receita;
- caixa/POS opera venda, Receita resume/concilia;
- toda acao que exige pagamento usa o mesmo modal de pagamento simulado;
- modal mostra valor, origem, pagador, status e botao `Pagar`/`Marcar pago`.

### 8.7 Loja / POS

Pergunta: como vender rapido e acompanhar o estoque?

Mobile caixa:

- Vender primeiro;
- Hoje;
- Estoque;
- Produtos se autorizado.

Web:

- venda;
- vendas do dia;
- produtos;
- estoque;
- futuras categorias/custos/fornecedores.

Nao misturar com financeiro amplo.

### 8.8 Competicoes

Pergunta: qual torneio/liga precisa de acao agora?

Separacao:

- Player: competir, participar, ver partida, resultado e classificacao.
- Trabalho: operar torneio/liga por fase.

Torneio por fase:

| Fase | Primeira pergunta | CTA primario |
| --- | --- | --- |
| Rascunho | o que falta configurar? | Completar configuracao |
| Inscricoes abertas | quem entrou/pagou? | Revisar inscritos / Publicar link |
| Inscricoes encerradas | esta pronto para jogos? | Gerar jogos |
| Jogos gerados | ha conflito antes de publicar? | Publicar jogos |
| Em andamento | que resultado esta pendente? | Lancar resultado |
| Finalizado | o que publicar/arquivar? | Publicar resultado final |

Liga por fase:

| Fase | Owner ve | Participante ve |
| --- | --- | --- |
| Configuracao | checklist/regras | nao aplicavel |
| Participantes | aprovar/validar | status inscricao |
| Rodada ativa | pendencias/resultados | adversario, horario, chat, resultado |
| Entre rodadas | validar/gerar proxima | classificacao e proxima previsao |
| Encerramento | resultado final/relatorio | ranking final |
| Historico | arquivo/relatorio | historico |

### 8.9 Relatorios

Pergunta: o que preciso analisar?

Relatorio nao e rotina diaria.

Exemplos:

- ocupacao de quadra;
- receita;
- inadimplencia;
- aulas/turmas;
- CRM;
- competicoes;
- POS;
- auditoria futura.

Mobile:

- apenas resumo curto para gestor;
- relatorio completo web.

### 8.10 Administracao

Pergunta: o que configuro e controlo?

Deve conter:

- equipe;
- convites;
- permissoes;
- recursos/quadras;
- regras de reserva;
- regras de aulas;
- planos/produtos estruturais;
- dados publicos;
- publicacao;
- integracoes futuras;
- acoes avancadas/destrutivas.

Nunca competir com rotina diaria.

## 9. Fluxos Criticos Finalizados

### 9.1 Professor

1. Abre Trabalho.
2. Cai em Hoje/Agenda.
3. Ve aula por hora cheia.
4. Abre aula.
5. Ve turma, alunos, quadra, avisos, reposicoes.
6. Se chamada estiver ativada, faz chamada.
7. Se nao, adiciona observacao/progresso ou registra aviso/reposicao.
8. Volta para a proxima aula.

### 9.2 Recepcao

1. Abre Trabalho.
2. Ve reservas do dia e CTA `Nova reserva`.
3. Cria reserva sem procurar submenu.
4. Se ocupado, ve alternativas/lista de espera.
5. Se precisa alterar/cancelar, abre detalhe.
6. Edita ou cancela.
7. Envia WhatsApp profissional.
8. Volta para reservas/calendario.

### 9.3 Financeiro

1. Abre Trabalho.
2. Cai em Receber.
3. Ve vencidos e hoje.
4. Cobra por WhatsApp ou marca pago.
5. Pagamento vai para Pagos.
6. Despesas e Resumo ficam separados.

### 9.4 Caixa

1. Abre Trabalho.
2. Cai em Vender.
3. Seleciona produtos.
4. Finaliza venda.
5. Estoque atualiza.
6. Vendas do dia ficam em Hoje.

### 9.5 Gestor

1. Abre Trabalho.
2. Ve bloqueios por unidade.
3. Escolhe unidade/contexto.
4. Resolve maior pendencia.
5. Entra em dominio profundo quando necessario.
6. Usa Relatorios/Admin apenas quando for analisar/configurar.

### 9.6 Organizador

1. Abre Trabalho > Competicoes.
2. Ve competicoes por fase/bloqueio.
3. Abre cockpit.
4. Faz CTA de fase.
5. Staff ve somente ferramentas do seu papel.
6. Player continua em Competir/participacao.

### 9.7 Aluno/Jogador

1. Abre Player App.
2. Ve proxima acao pessoal.
3. Agenda/Rotina contem reservas, partidas, aulas, pagamentos e historico.
4. Nao ve financeiro do local.
5. Se tambem trabalha, muda conscientemente para Trabalho.

## 10. Rotas E Compatibilidade

Preservar obrigatoriamente:

- `/inicio`
- `/locais`
- `/locais/:placeId`
- `/locais/:placeId/:placeIntent`
- `/locais/:placeId/admin`
- `/locais/:placeId/admin/:module`
- `/agenda`
- `/minhas-reservas`
- `/minhas-partidas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/eventos`
- `/eventos/torneios`
- `/eventos/ligas`
- `/eventos/:tournamentId/*`
- `/eventos/:tournamentId/organizacao`
- `/eventos/ligas/:leagueId`
- `/inscricao/:tournamentId`
- `/join/:tournamentId`
- `/t/:tournamentId`
- `/reservas/alteracao/:token`
- `/gestao`
- `/gestao/:placeId`
- `/gestao/:placeId/:module`
- `/trabalho`
- `/trabalho/competicoes`

Novas rotas podem ser aliases/wrappers, nao substituicoes destrutivas.

## 11. Sprint Packet Obrigatorio

Antes de qualquer implementacao:

```text
Queue ID:
Objetivo:
Persona primaria:
Personas secundarias:
Superficie:
Rotas afetadas:
Rotas antigas preservadas:
Arquivos provaveis:
Dados/RPCs:
Permissoes:
Estados:
Mobile:
Desktop:
Nao alterar:
Criterios de aceite:
QA:
Rollback:
Docs a atualizar:
```

Sem isso, a task nao esta pronta.

## 12. Gates De Aceite

### Gate Web SaaS

Passa somente se:

- web tem shell unico;
- unidade/contexto estao claros;
- sidebar nao e arvore infinita;
- cada pagina tem pergunta e CTA;
- configuracao e relatorio nao competem com rotina;
- desktop usa espaco com densidade util.

### Gate Mobile Trabalho

Passa somente se:

- nao renderiza mini desktop;
- CTA principal aparece cedo em 390px;
- bottom nav e por papel;
- professor nao ve ERP;
- recepcao cria reserva sem submenu;
- financeiro cobra sem atravessar aulas/cantina;
- caixa vende sem passar por financeiro;
- gestor ve bloqueios, nao lista infinita;
- organizador ve competicoes com fase/bloqueio.

### Gate Player

Passa somente se:

- Player continua simples;
- pagamentos pessoais nao viram financeiro do local;
- competicao jogador nao vira organizacao;
- modo Trabalho e opcional/intencional.

### Gate QA

Obrigatorio:

- mobile 390;
- mobile 430;
- desktop 1366;
- desktop amplo;
- console;
- network;
- rotas publicas;
- rotas legadas;
- permissoes.

## 13. O Que Nao Fazer Mais

- Nao corrigir tela isolada sem contrato.
- Nao criar mais submenu para resolver confusao.
- Nao manter tab interna quando o menu principal ja escolheu o destino.
- Nao colocar setup raro em rotina.
- Nao esconder tarefa diaria dentro de `Mais`.
- Nao chamar funcao de `Fluxo` para usuario final.
- Nao usar texto interno como copy publico.
- Nao tratar build verde como UX aprovada.
- Nao considerar screenshot sem analise como evidencia suficiente.
- Nao dizer que mobile foi reorganizado se a pagina ainda renderiza o shell web completo.

## 14. Definicao De Produto Final Aceito

O produto sera considerado bem organizado quando:

1. Usuario sabe em 10 segundos em qual modo esta.
2. Usuario sabe qual unidade/competicao esta operando.
3. Usuario ve a proxima tarefa antes da lista de ferramentas.
4. Web Trabalho parece SaaS maduro.
5. Mobile Trabalho parece app operacional.
6. Player App continua simples.
7. Cada funcao existente tem caminho claro.
8. Nenhuma persona foi melhorada quebrando outra.
9. Rota publica e legado continuam funcionando.
10. Configuracao, relatorio, operacao e comunicacao nao competem na mesma primeira dobra.
