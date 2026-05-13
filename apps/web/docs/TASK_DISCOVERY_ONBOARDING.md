# Task Discovery And Operational Onboarding

Fonte principal: `PROFILE_PLAN_ACCESS_MODEL.md`, `CURRENT_PRODUCT_STATE.md`, `COMPONENT_GRAMMAR.md`.

Data: 2026-05-13

## Objetivo

Transformar ferramentas escondidas em tarefas descobriveis.

O produto deve conduzir o usuario para a proxima acao relevante, em vez de exigir que ele memorize onde cada funcao fica.

## Principio central

```text
Nome de tarefa deve bater com a intencao do usuario.
```

Usuario pensa:

- quero cadastrar uma quadra;
- quero cadastrar um professor;
- quero criar uma turma;
- quero abrir reservas;
- quero criar um torneio;
- quero publicar minha pagina;
- quero cobrar um aluno.

O app nao deve obrigar o usuario a traduzir isso para:

- Agenda > Recursos;
- Academia > Recursos;
- Financeiro > Pacotes;
- Eventos > Aba tecnica.

## Semantic Quick Actions

Toda area operacional deve ter quick actions por intencao.

### Gestao

Quick actions globais:

- Cadastrar quadra;
- Cadastrar professor;
- Criar turma;
- Criar reserva;
- Cadastrar cliente;
- Cobrar cliente;
- Criar torneio;
- Publicar pagina.

Regra:

- mostrar apenas o que o plano/papel permite;
- se a tarefa depende de setup anterior, apontar para o passo correto.

### Competition Management

Quick actions:

- Criar torneio;
- Criar liga;
- Abrir inscricoes;
- Gerar chave;
- Lancar resultado;
- Publicar tabela;
- Exportar jogadores;
- Enviar aviso.

Separar:

- "Jogando" = minhas partidas e inscricoes;
- "Organizando" = minhas competicoes com fila operacional;
- "Descobrir" = eventos publicos.

### Professor Solo

Quick actions:

- Criar aula;
- Criar turma;
- Cadastrar aluno;
- Marcar presenca;
- Registrar falta;
- Cobrar mensalidade;
- Cadastrar quadra usada;
- Abrir horario.

### Academia / Clube

Quick actions por fase:

- Setup inicial: quadra, professor, turma, pagina, regras de reserva.
- Rotina diaria: confirmar reserva, cobrar, check-in, chamar lista de espera, registrar venda.
- Crescimento: criar campanha, publicar torneio, revisar leads.

## Setup Flows

### Academia recem-criada

Ordem sugerida:

1. Cadastrar quadras.
2. Definir regras de reserva.
3. Cadastrar professores.
4. Criar turmas/aulas.
5. Cadastrar alunos/clientes.
6. Configurar financeiro basico.
7. Publicar pagina.
8. Abrir reservas.

Primeira tela deve mostrar:

- progresso de setup;
- proximo passo recomendado;
- quick action primaria;
- passos opcionais colapsados.

Status:

- [feito] `/gestao` mostra checklist de implantacao por local quando a base esta incompleta.
- [feito] Checklist mostra progresso, etapas concluidas e proximo passo acionavel.
- [feito] Etapas levam para quadras, regras, professores, turmas, clientes, planos e pagina/estrutura.
- [feito] Checklist some quando o local esta com base completa.

### Professor autonomo recem-criado

Ordem sugerida:

1. Cadastrar dados profissionais.
2. Cadastrar quadras utilizadas.
3. Criar agenda base.
4. Cadastrar alunos.
5. Definir mensalidade ou valor/aula.
6. Publicar perfil ou link de agenda.

Nao mostrar:

- cantina;
- equipe;
- relatorios complexos;
- CRM pesado.

Status:

- [feito] `/gestao` mostra entrada leve de professor para usuarios com papel `coach`.
- [feito] Entrada prioriza aulas de hoje, turmas e alunos.
- [feito] O gate evita cantina, equipe, CRM pesado e financeiro completo para professor.

### Organizador de competicao recem-criado

Ordem sugerida:

1. Criar torneio/liga.
2. Criar classes/categorias.
3. Configurar inscricoes.
4. Publicar pagina/link.
5. Confirmar inscritos.
6. Gerar partidas.
7. Operar resultados.

Nao mostrar:

- gestao de quadras;
- cantina;
- financeiro de academia.

## Task Discovery Matrix

| Intencao | Entrada preferida | Fallback | Deve aparecer como |
| --- | --- | --- | --- |
| Cadastrar quadra | Setup da Gestao | Agenda > Recursos | Quick action |
| Cadastrar professor | Setup da Academia | Academia > Professores/Recursos | Quick action |
| Criar turma | Setup da Academia | Academia > Turmas | Quick action |
| Criar reserva | Agenda do local | Gestao > fila do dia | Quick action |
| Cadastrar cliente | Clientes/CRM | Gestao > quick action | Progressive form |
| Cobrar cliente | Financeiro/Clientes | Cobrancas pendentes | Row action |
| Criar torneio | Organizando competicoes | Eventos | Setup wizard |
| Criar liga | Organizando competicoes | Eventos | Setup wizard |
| Lancar resultado | Competition OS | Minha partida | Row action |
| Publicar pagina | Setup/publicacao | Local publico | Secondary action |

## Regras de onboarding contextual

### Quando nao ha quadra

Mostrar:

- "Cadastre a primeira quadra";
- CTA: `Cadastrar quadra`;
- explicacao curta: "Quadras liberam reservas, bloqueios e agenda."

Status:

- [feito] Hub de Gestao mostra `Cadastrar quadra` quando faltam quadras e envia para Agenda > Quadras.

Nao mostrar primeiro:

- calendario vazio;
- filtros;
- relatorios.

### Quando nao ha professor

Mostrar:

- "Cadastre um professor";
- CTA: `Cadastrar professor`;
- explicacao curta: "Professor libera grade, chamada e aulas."

Status:

- [feito] Hub de Gestao mostra `Cadastrar professor` quando faltam professores e envia para Academia > Professores.

Nao exigir:

- comissao;
- documentos;
- perfil publico completo.

### Quando nao ha turma

Mostrar:

- "Crie a primeira turma";
- CTA: `Criar turma`;
- opcoes: turma fixa, aula avulsa, horario aberto.

Status:

- [feito] Hub de Gestao mostra `Criar turma` quando faltam turmas e envia para Academia > Turmas.

### Quando ha cobranca pendente

Mostrar:

- `Enviar lembrete` na row da pendencia;
- atalhos `Cobrar socios`, `Cobrar alunos` e `Enviar lembrete geral` apenas quando houver recebiveis reais.

Status:

- [feito] Financeiro e Clientes/CRM exibem cobranca como tarefa semantica derivada de pendencia real, sem criar dashboard permanente quando tudo esta em dia.

### Quando nao ha competicao organizada

Mostrar:

- "Crie seu primeiro torneio ou liga";
- CTAs: `Criar torneio`, `Criar liga`;
- explicacao curta por formato.

Status:

- [parcial] Hub de competicoes separa `Jogando`, `Organizando` e `Descobrir`, sem promover criacao para jogador comum.
- [feito] Criacao de torneio/liga fica dentro das listas em contexto `organizing`.
- [feito] `/eventos` mostra roteiro secundario para organizador novo criar torneio/liga e entender classes, inscricoes, publicacao e operacao.

### Quando usuario so joga

Mostrar:

- proxima partida;
- proxima reserva/aula;
- competicoes que joga;
- descobrir eventos/locais.

Nao mostrar:

- setup operacional.

## Navegacao semantica recomendada

### Global

Grupos:

- Jogar;
- Organizar;
- Operar;
- Conta.

Regra:

- `Organizar` so aparece se o usuario organiza torneios/ligas.
- `Operar` so aparece se o usuario tem academia, clube, professor solo ou staff.
- jogador comum ve apenas Player App.

### Dentro de Gestao

Primeiro nivel:

- Hoje;
- Agenda;
- Aulas;
- Clientes;
- Financeiro;
- Publicacao;
- Configuracao.

Modulos opcionais por plano:

- Cantina;
- Equipe;
- Relatorios;
- Competicoes.

### Dentro de Competition OS

Primeiro nivel:

- Operacao;
- Partidas;
- Jogadores;
- Ranking;
- Publicacao;
- Configuracao.

## Anti-patterns

- Botao "Recursos" como unica forma de cadastrar quadra.
- Professor escondido dentro de configuracao sem quick action.
- Torneios que jogo e torneios que organizo na mesma lista sem separacao.
- Gestao visivel para jogador sem permissao.
- Tela vazia sem proximo passo.
- Upgrade aparecendo antes da tarefa basica.
- Modulo completo visivel quando o plano so libera uma tarefa simples.

## Criterio de sucesso

Uma pessoa nova deve conseguir responder em ate 10 segundos:

- onde cadastro uma quadra?
- onde cadastro um professor?
- onde crio um torneio?
- onde vejo o que preciso resolver hoje?
- onde jogo/acompanho minhas partidas?
