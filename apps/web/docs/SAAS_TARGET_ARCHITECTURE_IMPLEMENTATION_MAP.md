# SaaS Target Architecture and Implementation Map

Status: mapa alvo obrigatorio
Data: 2026-05-22
Fonte primaria: `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
Guardrails obrigatorios: `SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`

## 1. Por que este documento existe

A queue de implementacao define a ordem dos sprints, mas uma queue sozinha pode parecer uma lista de areas. Este documento mostra a reestruturacao completa do produto: menus, paginas, rotas, dominios, detalhes, conexoes entre funcoes e como cada sprint encaixa no todo.

Regra:
Nenhum sprint estrutural deve ser executado como mudanca isolada. Cada sprint precisa mover o app em direcao ao mapa alvo abaixo.

Se houver conflito entre uma solucao local e os guardrails, os guardrails vencem.

## 2. Estrutura final do Work SaaS Web

### 2.1. Topbar global

Sempre visivel no Work SaaS Web:

- Logo ATP.
- Seletor Jogador / Trabalho.
- Local/unidade ativa.
- Busca global.
- Criar rapido.
- Notificacoes.
- Usuario, iniciais e papel ativo.

Funcoes da topbar:

- Contexto: onde estou trabalhando?
- Busca: como encontro cliente/reserva/aula/pagamento/torneio sem navegar?
- Criar: como inicio acao comum sem procurar menu?
- Modo: estou no Player ou Trabalho?

### 2.1.1. Regra de camadas para areas com muitas ferramentas

Quando um dominio tiver muitas ferramentas, a interface deve seguir camadas previsiveis. Nao usar submenus profundos nem empilhamento de blocos como solucao principal.

Camada 1: dominio no menu principal.

- Exemplo: Agenda, Clientes, Academia, Financeiro.
- O menu principal responde apenas "em qual area estou?".
- Ele nao lista todas as ferramentas internas.

Camada 2: home/list view do dominio.

- A primeira tela do dominio mostra a visao operacional mais importante.
- Agenda abre calendario.
- Clientes abre lista/busca com views salvas.
- Financeiro abre recebiveis/vencidos.
- Academia abre aulas/turmas/pendencias de forma organizada.

Camada 3: views salvas, filtros e tabs rasas.

- Usar views claras como "Leads", "Clientes ativos", "Alunos", "Vencidos", "Pagos", "Turmas".
- Nao criar submenu dentro de submenu.
- Se uma view exige muitas acoes, ela deve virar pagina propria ou detalhe.

Camada 4: detalhe do item.

- Acoes sobre um item aparecem no detalhe daquele item.
- Reserva: editar, cancelar, remarcar, cobrar, WhatsApp.
- Cliente: nova reserva, matricular, cobrar, WhatsApp, observacao.
- Pagamento: cobrar, marcar pago, abrir cliente.
- Partida: lancar resultado, confirmar, chat.

Camada 5: configuracao.

- Regras, planos, permissoes, recursos, modelos e ajustes raros ficam em Administracao ou Configuracoes do dominio.
- Configuracao nao pode competir com operacao diaria.

Camada 6: busca global e criar rapido.

- Se o usuario sabe o que quer, nao deve depender do menu.
- Buscar cliente/reserva/aula/pagamento/torneio.
- Criar reserva/cliente/cobranca/turma/torneio/produto.

Regra pratica:

- Se e tarefa diaria, aparece na home/lista do dominio.
- Se e acao sobre um registro, aparece no detalhe.
- Se e configuracao rara, vai para Administracao.
- Se e analise, vai para Relatorios.
- Se e atalho frequente, entra em Criar rapido.
- Se precisa de descoberta, entra na busca global.

Exemplo correto em Agenda:

- Menu: Agenda.
- Primeira tela: calendario.
- Filtros: reservas, aulas, bloqueios.
- Slot livre: nova reserva.
- Reserva: detalhe com editar/cancelar/remarcar/cobrar/WhatsApp.
- Regras/quadras: Administracao.

Exemplo correto em Clientes:

- Menu: Clientes.
- Views: Leads, Clientes ativos, Alunos, Socios, Inadimplentes.
- Pessoa: Cliente 360.
- Acoes: nova reserva, matricular, cobrar, WhatsApp.
- Campos avancados e regras: Administracao/configuracao.

### 2.2. Sidebar principal final

Ordem final:

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

Isto substitui a logica atual de modulos soltos.

### 2.3. Tipos de pagina no SaaS

Cada dominio pode ter estes tipos:

- Home do dominio: resumo e pendencias.
- Lista/list view: dados filtraveis.
- Calendario: quando a entidade depende de tempo/recurso.
- Detalhe 360: entidade central com historico.
- Drawer/modal: acao contextual.
- Configuracao do dominio: setup raro.
- Relatorio: analise, nao operacao diaria.

## 3. Mapa final por dominio

### 3.1. Inicio

Papel:
Entrada operacional.

Paginas finais:

- Hoje
- Pendencias
- Atividade recente

Conteudo:

- Alertas por papel.
- Proximas acoes.
- Indicadores simples.
- Links para listas filtradas.

Nao deve conter:

- Configuracoes.
- Lista infinita de modulos.
- Relatorios complexos.

Conecta com:
Agenda, Clientes, Academia, Financeiro, Competicoes, Loja/POS.

Sprints:
SPRINT-01, SPRINT-02, SPRINT-11, SPRINT-12, SPRINT-22.

### 3.2. Agenda

Papel:
Centro operacional de tempo, quadras, reservas, aulas, bloqueios e conflitos.

Paginas finais:

- Calendario
- Reservas
- Bloqueios
- Quadras/Recursos
- Regras de disponibilidade

Views:

- Dia
- Semana
- Por quadra
- Lista de reservas
- Lista de remarcacoes
- Lista de canceladas

Detalhes:

- Slot livre
- Reserva
- Aula no calendario
- Bloqueio
- Uso por competicao

Acoes:

- Nova reserva.
- Editar reserva.
- Cancelar.
- Remarcar.
- Cobrar/pagar.
- WhatsApp.
- Criar bloqueio.
- Abrir cliente.

Conecta com:
Clientes, Financeiro, Academia, Competicoes, Comunicacao, Relatorios.

Sprints:
SPRINT-03, SPRINT-04, SPRINT-05, SPRINT-06, SPRINT-12.

### 3.3. Clientes

Papel:
Dominio de relacionamento e historico de pessoas.

Paginas finais:

- Leads
- Clientes ativos
- Alunos
- Socios
- Responsaveis
- Inativos/arquivados
- Cliente 360

Views:

- Novos leads.
- Follow-up pendente.
- Clientes com reserva futura.
- Alunos ativos.
- Inadimplentes.
- Socios ativos.

Detalhe:
Cliente 360.

Acoes:

- Criar cliente rapido.
- Criar lead.
- Nova reserva.
- Matricular.
- Cobrar.
- WhatsApp.
- Observacao.
- Editar.

Conecta com:
Agenda, Academia, Financeiro, Comunicacao, Relatorios.

Sprints:
SPRINT-07, SPRINT-08, SPRINT-05, SPRINT-06, SPRINT-11.

### 3.4. Academia

Papel:
Gestao de aulas, turmas, alunos, professores, matriculas, reposicoes e evolucao.

Paginas finais:

- Aulas
- Turmas
- Matriculas
- Reposicoes
- Evolucao
- Professores no contexto academico
- Configuracoes academicas

Views:

- Aulas de hoje.
- Aulas da semana.
- Turmas ativas.
- Alunos por turma.
- Reposicoes abertas.
- Professores com aulas.

Detalhes:

- Aula/turma detalhe.
- Matricula detalhe.
- Aluno dentro do Cliente 360.

Acoes:

- Criar turma.
- Matricular aluno.
- Resolver reposicao.
- Registrar evolucao.
- Avisar aula.
- Configurar chamada opcional.

Conecta com:
Agenda, Clientes, Financeiro, Comunicacao, Relatorios, Administracao.

Sprints:
SPRINT-09, SPRINT-10, SPRINT-08, SPRINT-05, SPRINT-06.

### 3.5. Financeiro

Papel:
Dominio de dinheiro do local.

Paginas finais:

- Receber
- Vencidos
- Pagos
- Despesas
- Planos e pacotes
- Mensalidades
- Comissoes
- Resumo financeiro

Views:

- Recebiveis de hoje.
- Vencidos.
- Por cliente.
- Por origem.
- Pagos.
- Despesas do mes.

Detalhes:

- Pagamento/recebivel.
- Despesa.
- Plano/pacote.

Acoes:

- Cobrar.
- Marcar pago.
- Registrar despesa.
- Criar plano.
- Enviar WhatsApp.
- Abrir Cliente 360.

Conecta com:
Clientes, Agenda, Academia, Competicoes, Loja/POS, Relatorios.

Sprints:
SPRINT-05, SPRINT-11, SPRINT-06, SPRINT-12.

### 3.6. Competicoes

Papel:
Operacao de torneios e ligas no modo Trabalho.

Paginas finais:

- Hub Competicoes
- Torneios
- Ligas
- Inscricoes
- Jogos e resultados
- Comunicacao
- Relatorios de competicao

Detalhes:

- Torneio cockpit.
- Liga cockpit.
- Partida.
- Inscricao.

Acoes:

- Criar torneio.
- Criar liga.
- Aprovar inscricao.
- Cobrar inscricao.
- Gerar jogos/rodada.
- Lancar resultado.
- Publicar aviso.
- Finalizar.

Conecta com:
Agenda, Clientes, Financeiro, Comunicacao, Relatorios, Player App.

Sprints:
SPRINT-13, SPRINT-14, SPRINT-15, SPRINT-05, SPRINT-06.

### 3.7. Loja/POS

Papel:
Venda e produtos.

Paginas finais:

- Vender
- Vendas do dia
- Produtos
- Estoque
- Fechamento

Acoes:

- Vender.
- Cancelar venda.
- Criar produto.
- Ajustar estoque.
- Vincular cliente.

Conecta com:
Clientes, Financeiro, Relatorios.

Sprints:
SPRINT-16, SPRINT-05, SPRINT-12.

### 3.8. Comunicacao

Papel:
Modelos, historico e avisos.

Paginas finais:

- Modelos
- WhatsApp
- Avisos
- Notificacoes
- Historico

Observacao:
Comunicacao nao substitui WhatsApp contextual. Ela organiza modelos e historico; as acoes aparecem nos fluxos.

Conecta com:
Clientes, Agenda, Financeiro, Academia, Competicoes.

Sprints:
SPRINT-06, SPRINT-17.

### 3.9. Relatorios

Papel:
Analise e decisao.

Paginas finais:

- Ocupacao
- Receita
- Clientes/alunos
- Academia
- Professores
- Competicoes
- POS

Primeira entrega:
Cards que levam para listas filtradas.

Conecta com:
Todos os dominios.

Sprints:
SPRINT-12, SPRINT-22.

### 3.10. Administracao

Papel:
Setup, equipe, regras, unidade e configuracoes raras.

Paginas finais:

- Organizacao/unidade
- Equipe
- Permissoes futuras
- Quadras/recursos
- Regras
- Planos
- Publicacao
- Integracoes
- Avancado

Conecta com:
Todos os dominios, mas nao aparece como rotina diaria.

Sprints:
SPRINT-18.

## 4. Mapa atual para alvo

| Estrutura atual | Problema | Destino alvo | Sprint |
|---|---|---|---|
| `/gestao` generico | Entrada ainda parece lista operacional adaptada | Inicio > Hoje/Pendencias | 01 |
| `/gestao/:placeId/bookings` | Reservas, hoje, calendario, espera e ajustes competem | Agenda > Calendario/Reservas | 03/04 |
| Calendario dentro de reservas | Calendario deveria ser dominio central | Agenda > Calendario | 03 |
| Waitlist como subaba fixa | Espera e contexto de slot/reserva | Agenda > detalhe/contexto | 04 |
| Ajustes dentro de reservas | Setup raro no fluxo diario | Administracao > Regras/Recursos | 18 |
| `/gestao/:placeId/academy` | Aulas, alunos, professores e ajustes misturados | Academia | 09/10 |
| Professores dentro de aulas | Professor e papel de equipe tambem | Academia + Administracao/Equipe | 09/18 |
| Chamada como fluxo forte | Nem toda empresa exige chamada | Academia config, padrao off | 10 |
| `/gestao/:placeId/clients` | Leads/clientes/alunos/socios misturados | Clientes | 07/08 |
| Financeiro estreito | Dinheiro espalhado por areas | Financeiro | 11 |
| Canteen/POS isolado | Venda precisa ser fluxo rapido | Loja/POS | 16 |
| Team/settings | Configuracao/admin separados mas ainda pouco integrados | Administracao | 18 |
| `/eventos` com organizador aparecendo | Player e Trabalho misturados | Player Competir + Trabalho Competicoes | 13 |
| Torneio admin por tabs | Nao responde bloqueio da fase | Torneio cockpit | 14 |
| Liga por tabs | Owner/participante misturados | Liga cockpit | 15 |
| `/agenda` player | Agenda mistura reservas, aulas, pagamentos | Player > Rotina | 19 |
| Aulas/Pagamentos no menu player | Duplicam Rotina | Rotina com filtros/aliases | 19 |

## 5. Como os fluxos se conversam

### 5.1. Reserva

Dominio inicial:
Agenda.

Objetos envolvidos:
Reserva, cliente, quadra, pagamento, WhatsApp, historico.

Caminho:
Agenda slot -> reserva drawer -> Cliente 360 -> pagamento stub -> WhatsApp -> Relatorios ocupacao/receita.

Sprints conectados:
03, 04, 05, 06, 08, 11, 12.

### 5.2. Aula/matricula

Dominio inicial:
Academia ou Cliente 360.

Objetos envolvidos:
Cliente/aluno, turma, professor, horario, quadra, pagamento, reposicao.

Caminho:
Academia turma -> matricula -> Cliente 360 -> pagamento -> agenda professor -> reposicoes.

Sprints conectados:
08, 09, 10, 05, 06, 11.

### 5.3. Cobranca

Dominio inicial:
Financeiro.

Objetos envolvidos:
Cliente, recebivel, pagamento, WhatsApp, historico.

Caminho:
Financeiro vencidos -> pagamento detalhe -> WhatsApp cobranca -> marcar pago -> Cliente 360 -> resumo.

Sprints conectados:
05, 06, 08, 11, 12.

### 5.4. Torneio/liga

Dominio inicial:
Competicoes.

Objetos envolvidos:
Evento, inscricao, cliente/jogador, pagamento, jogo, resultado, comunicacao, agenda.

Caminho:
Hub Competicoes -> cockpit por fase -> inscricoes/pagamentos -> jogos -> resultados -> comunicacao -> relatorio.

Sprints conectados:
13, 14, 15, 05, 06, 12, 19.

### 5.5. POS

Dominio inicial:
Loja/POS.

Objetos envolvidos:
Produto, venda, cliente opcional, pagamento, estoque, receita.

Caminho:
Vender -> pagamento -> cliente se vinculado -> financeiro/resumo -> relatorio POS.

Sprints conectados:
16, 05, 08, 11, 12.

## 6. Menu final web x mobile

### 6.1. Web Trabalho

Menu completo:

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

### 6.2. Mobile Trabalho por papel

Professor:
Hoje, Agenda, Turmas, Alunos, Perfil.

Recepcao:
Hoje, Agenda, Reservas, Clientes, Mais.

Financeiro:
Receber, Vencidos, Pagos, Resumo, Perfil.

Caixa:
Vender, Hoje, Estoque, Produtos, Perfil.

Organizador:
Hoje, Torneios, Ligas, Resultados, Perfil.

Gestor:
Hoje, Agenda, Clientes, Financeiro, Mais.

### 6.3. Player App

Menu:

- Inicio
- Jogar
- Competir
- Rotina
- Perfil

Rotina substitui a duplicacao de aulas/pagamentos/agenda no menu principal.

## 7. Paginas que precisam existir ao final

### Inicio

- Trabalho Hoje
- Pendencias
- Atividade recente

### Agenda

- Calendario
- Reservas
- Bloqueios
- Quadras
- Regras

### Clientes

- Leads
- Clientes ativos
- Alunos
- Socios
- Responsaveis
- Cliente 360

### Academia

- Aulas
- Turmas
- Matriculas
- Reposicoes
- Evolucao
- Configuracoes academicas

### Financeiro

- Receber
- Vencidos
- Pagos
- Despesas
- Planos e pacotes
- Mensalidades
- Comissoes
- Resumo

### Competicoes

- Hub
- Torneios
- Ligas
- Inscricoes
- Resultados
- Comunicacao

### Loja/POS

- Vender
- Vendas
- Produtos
- Estoque
- Fechamento

### Comunicacao

- Modelos
- WhatsApp
- Avisos
- Notificacoes
- Historico

### Relatorios

- Ocupacao
- Receita
- Clientes
- Academia
- Professores
- Competicoes
- POS

### Administracao

- Unidade/local
- Equipe
- Permissoes futuras
- Recursos
- Regras
- Planos
- Publicacao
- Integracoes
- Avancado

## 8. Sprints estruturais x resultado final

| Sprint | Entrega isolada | Mudanca estrutural real |
|---|---|---|
| 01 | Shell web | Cria a arquitetura SaaS por dominios |
| 02 | Unidade ativa | Garante contexto para operacao multi-local |
| 03 | Agenda | Move calendario para centro operacional |
| 04 | Reserva drawer | Transforma reserva em fluxo completo |
| 05 | Pagamento stub | Padroniza dinheiro em todos os fluxos |
| 06 | WhatsApp | Padroniza comunicacao contextual |
| 07 | Clientes listas | Separa lead, cliente, aluno e socio |
| 08 | Cliente 360 | Cria entidade central de relacionamento |
| 09 | Academia | Reorganiza aulas/turmas/alunos/professores |
| 10 | Professor | Remove burocracia desnecessaria e cria rotina clara |
| 11 | Financeiro | Centraliza receita, vencidos, pagos e despesas |
| 12 | Relatorios MVP | Transforma cards em entradas para listas filtradas |
| 13 | Hub competicoes | Separa jogador de organizador |
| 14 | Torneio cockpit | Organiza torneio por fase |
| 15 | Liga cockpit | Organiza liga por fase e papel |
| 16 | POS | Separa venda rapida de configuracao |
| 17 | Comunicacao | Cria dominio de modelos e historico |
| 18 | Administracao | Tira setup da rotina diaria |
| 19 | Player alinhado | Protege experiencia jogador |
| 20 | Mobile trabalho | Recria mobile como camada operacional |
| 21 | Busca/criar rapido | Reduz dependencia de menu |
| 22 | QA transversal | Garante que personas nao se quebraram |
| 23 | Polimento | Fecha regressao e acabamento |

## 9. Definicao de reestruturacao 100%

A reestruturacao e considerada global quando:

- O menu web deixou de ser lista de modulos e virou dominios SaaS.
- As paginas finais existem ou tem wrapper/entrada definida.
- As rotas antigas continuam funcionando.
- Toda acao importante tem lugar claro.
- Toda configuracao rara saiu da rotina.
- Reserva, aula, cliente, pagamento, torneio e liga tem ciclo ponta a ponta.
- O Player App nao vaza Trabalho.
- O mobile trabalho nao copia o web.
- Cada sprint entrega parte do mapa, nao uma correcao local.
