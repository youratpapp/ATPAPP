# Academy V2 UX Plan

Fonte principal:

- `ACADEMY_MODULE_FUNCTION_MAP.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`
- `PREMIUM_UX_VISUAL_LANGUAGE.md`
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`
- `DESIGN_TOKENS.md`

Data: 2026-05-14

## Objetivo

Evoluir `Gestao > Academia` de uma v1 funcional, mas empilhada, para uma v2 operacional, intuitiva e profissional.

Academia v2 nao deve ser uma pagina bonita com muitos blocos. Deve ser uma ferramenta de trabalho para secretaria, professor, recepcao, financeiro e gestor.

Regra principal:

```text
Rotina diaria vira row + acao clara + drawer curto.
Setup raro vira fluxo guiado.
Detalhe secundario sai do corpo da pagina.
```

## Diagnostico consolidado

O modulo atual ja tem boa cobertura funcional, mas a experiencia ainda mistura responsabilidades:

- aulas do dia;
- turmas;
- alunos;
- chamada;
- financeiro de aluno;
- professores;
- reposicoes;
- aula avulsa;
- busca de encaixe;
- horarios abertos;
- configuracao de recursos;
- formularios legados.

Os principais problemas sao:

1. `Central da academia` e bloco legado `Academia e aulas` coexistem.
2. Formularios de matricula/mensalidade aparecem dentro da lista de turmas.
3. `Hoje` ainda nao opera chamada com profundidade suficiente.
4. `Pendencias` mistura fila para resolver com ferramenta de busca.
5. `Recursos` nao comunica claramente quadras, horarios e disponibilidade.
6. Algumas listas usam limites silenciosos e podem esconder dados.
7. Acoes financeiras e de contato competem com a tarefa real.
8. Mobile tende a virar pagina longa.

## Nova arquitetura UX

Abas v2:

1. `Hoje`
2. `Grade`
3. `Alunos`
4. `Pendencias`
5. `Professores`
6. `Configuracao`

Regra de navegacao:

- desktop pode mostrar todas se houver espaco;
- mobile usa trilho horizontal ou sheet de modulo;
- overflow so existe quando realmente falta espaco;
- nenhuma aba deve abrir conteudo com scroll interno preso dentro do card do shell.

## Responsabilidade por aba

### Hoje

Responsabilidade:

- operar aulas do dia.

Conteudo:

- rows de aula;
- horario;
- turma;
- professor;
- quadra;
- ocupacao;
- faltas avisadas;
- reposicoes relacionadas;
- acao primaria `Fazer chamada` ou `Abrir aula`.

Nao contem:

- criar turma;
- cadastro de professor;
- buscar encaixe;
- configuracao de recursos;
- financeiro amplo;
- formularios de matricula.

Comportamento:

- row de aula abre `LessonDrawer`;
- chamada permite presenca, falta e ausencia avisada;
- drawer mostra alunos, reposicoes do dia e observacao curta;
- evolucao tecnica pode ser registrada no aluno, nao como formulario global.

### Grade

Responsabilidade:

- gerenciar turmas, horarios e vagas.

Conteudo:

- lista operacional de turmas;
- busca e filtros;
- professor, quadra, dia, horario, vagas, mensalidade e nivel;
- acoes `Ver`, `Editar`, `Matricular aluno`.

Nao contem:

- formulario repetido de matricula por turma;
- formulario repetido de mensalidade por turma;
- chamada do dia;
- pendencias de aula avulsa;
- recursos duplicados.

Comportamento:

- `Nova turma` abre drawer curto;
- campos essenciais primeiro: nome, professor, quadra, dia, horario, vagas, mensalidade e nivel;
- avancados recolhidos: genero, faixa etaria, idades, reposicao, observacoes e nome publico;
- click na turma abre `ClassDrawer` com `Dados`, `Alunos`, `Financeiro` e `Presenca/Historico`.

### Alunos

Responsabilidade:

- localizar aluno e resolver a situacao dele.

Conteudo:

- busca forte;
- filtros simples;
- rows de aluno;
- matricula, pagamento, presenca, reposicao e acao primaria contextual.

Acoes:

- cobrar;
- enviar lembrete;
- marcar pago;
- check-in;
- marcar falta;
- registrar ausencia avisada;
- editar matricula;
- cancelar/ativar matricula;
- abrir historico;
- registrar evolucao;
- ver creditos de reposicao.

Comportamento:

- row abre `StudentDrawer`;
- drawer contem dados pessoais, matriculas, pagamentos, presenca, evolucao, observacoes, reposicoes e historico;
- nao repetir formulario de matricula dentro de cada turma.

### Pendencias

Responsabilidade:

- limpar fila operacional.

Conteudo:

- matriculas pendentes;
- aulas avulsas/drop-in;
- solicitacoes de reposicao;
- creditos de reposicao abertos;
- pagamentos pendentes de academia quando aplicavel.

Nao contem:

- ferramenta permanente de busca de encaixe aberta no corpo.

Comportamento:

- rows densas: nome, tipo, turma, data, valor e acao;
- acoes principais: aprovar, recusar, marcar pago, agendar reposicao, usar reposicao, baixar credito;
- WhatsApp e acao secundaria;
- `Buscar encaixe` abre drawer/sheet proprio.

### Professores

Responsabilidade:

- gerenciar professores, agenda, login e comissao.

Conteudo:

- lista de professores;
- contato;
- turmas vinculadas;
- agenda;
- comissao;
- login vinculado;
- acoes `Editar`, `Agenda`, `WhatsApp`.

Comportamento:

- `Novo professor` abre drawer curto: nome, telefone e email;
- avancados: comissao, especialidades, niveis, disponibilidade, login vinculado, observacoes;
- comissao nao fica como input aberto permanente;
- professor operacional ve suas turmas, seus alunos, sua agenda e suas chamadas, nao a operacao inteira.

### Configuracao

Responsabilidade:

- estruturar quadras, horarios e disponibilidade.

Nome recomendado:

- `Configuracao` no tab;
- header interno `Quadras e horarios`.

Conteudo:

- quadras;
- horarios abertos;
- disponibilidade por professor;
- disponibilidade por quadra;
- regras de aula;
- bloqueios.

Comportamento:

- filtro explicito de dia/data;
- alternancia `Por professor` / `Por quadra`;
- acoes `Criar horario aberto`, `Criar turma neste horario`, `Bloquear horario`;
- horario aberto e uma janela operacional, nao uma turma;
- recursos nao dependem de estado invisivel do draft da turma.

## Mapa de migracao das funcoes atuais

| Funcao atual | Mora em v2 | Padrao UX | Observacao |
| --- | --- | --- | --- |
| Aulas de hoje | Hoje | row + drawer | vira rotina principal de aula/chamada |
| Fazer chamada | Hoje | `LessonDrawer` | sem wizard |
| Marcar presenca/falta | Hoje e Alunos | drawer/row | aula no contexto do dia, aluno no historico |
| Ausencia avisada | Hoje, Alunos e Pendencias | drawer/row | pode liberar vaga para reposicao/drop-in |
| Lista de turmas | Grade | table/rows | sem cards altos |
| Criar turma | Grade | drawer curto ou setup se complexo | nao abrir wizard no corpo da lista |
| Editar turma | Grade | `ClassDrawer` | dados essenciais e avancados |
| Salvar mensalidade da turma | Grade | `ClassDrawer > Financeiro` | nao input permanente por card |
| Matricular aluno na turma | Grade e Alunos | drawer | pode iniciar pela turma ou pelo aluno |
| Lista de alunos | Alunos | rows com busca/filtros | sem limite silencioso |
| Ativar/cancelar matricula | Alunos e Pendencias | row action | permissao operacional |
| Cobrar/marcar pago | Alunos e Pendencias | row action | financeiro permitido |
| Historico/evolucao | Alunos | drawer | foco tecnico e observacoes |
| Matriculas pendentes | Pendencias | operational queue | aprovar/recusar/contatar |
| Aula avulsa/drop-in | Pendencias | operational queue | aprovar/recusar/marcar pago |
| Solicitacao de reposicao | Pendencias | operational queue | agendar/recusar/contatar |
| Credito de reposicao aberto | Pendencias e Alunos | row/drawer | usar, agendar ou baixar |
| Buscar encaixe | Pendencias | drawer/sheet | ferramenta acionada, nao bloco fixo |
| Professores | Professores | rows + drawer | contato, login, agenda, comissao |
| Vincular login professor | Professores | drawer | gerar convite se necessario |
| Editar comissao | Professores | drawer | nao inline permanente |
| Horarios abertos | Configuracao | rows/calendario | data/dia explicitos |
| Disponibilidade professor/quadra | Configuracao | alternancia de visao | nao depende do draft |
| Bloqueio de horario | Configuracao | drawer/action | deve indicar conflito |
| WhatsApp | Secundario em drawers/rows | overflow/quiet | nao compete com aprovar/cobrar/chamada |

## Blocos removidos ou fundidos

Remover/fundir:

- bloco legado `Academia e aulas`;
- formularios de matricula repetidos por turma;
- formularios de mensalidade repetidos por turma;
- busca de encaixe aberta como bloco permanente;
- resumo duplicado entre central e lista abaixo;
- listas com `slice` silencioso sem contador ou expansao.

Manter:

- todas as funcoes atuais;
- todos os fluxos com persistencia real;
- permissao/plano como criterio de visibilidade;
- rotas e subvisoes canonicas da Gestao.

## Drawers v2

### `LessonDrawer`

Uso:

- chamada da aula do dia.

Conteudo:

- turma, horario, professor, quadra;
- alunos;
- status de presenca;
- faltas avisadas;
- reposicoes/drop-ins vinculados;
- observacao curta.

### `ClassDrawer`

Uso:

- detalhes e edicao da turma.

Secoes:

- Dados;
- Alunos;
- Financeiro;
- Presenca/Historico.

### `StudentDrawer`

Uso:

- contexto completo do aluno.

Secoes:

- Dados;
- Matriculas;
- Pagamentos;
- Presenca;
- Evolucao;
- Reposicoes;
- Historico.

### `FitDrawer`

Uso:

- buscar encaixe para aula avulsa ou reposicao.

Campos:

- aluno;
- tipo: aula avulsa ou reposicao;
- data/periodo;
- nivel;
- professor opcional;
- turma opcional.

### `CoachDrawer`

Uso:

- cadastro/edicao do professor.

Secoes:

- Dados;
- Turmas;
- Agenda;
- Comissao;
- Login/convite.

### `AvailabilityDrawer`

Uso:

- criar horario aberto, bloquear horario ou transformar em turma.

Campos:

- data/dia;
- professor;
- quadra;
- horario;
- capacidade;
- observacao;
- acao resultante.

## Acoes inline

Continuam inline quando forem a tarefa mais provavel:

- `Fazer chamada`;
- `Abrir aula`;
- `Ver turma`;
- `Matricular aluno`;
- `Ativar`;
- `Marcar pago`;
- `Aprovar`;
- `Recusar`;
- `Agendar reposicao`;
- `Usar reposicao`;
- `Editar professor`;
- `Ver agenda`.

Todas as demais acoes vao para drawer, overflow ou disclosure.

## Setup/wizard

Wizard permitido apenas para:

- primeira configuracao da academia;
- criacao complexa de turma quando houver muitas regras;
- importacao/migracao futura;
- configuracao estrutural rara.

Wizard proibido para:

- chamada;
- pagamento;
- aprovar pendencia;
- contato;
- edicao simples;
- rotina de secretaria.

## Suporte backend a validar

Antes de implementar cada parte, validar se a acao ja persiste de verdade.

| Acao | Suporte esperado | Decisao |
| --- | --- | --- |
| editar dados completos da turma | update em `place_academy_classes` ou RPC | validar antes de `ACADEMY-V2-02` |
| desativar/cancelar turma | campo `is_active` ja existe | usar service/RPC minimo se faltar permissao |
| trocar aluno de turma | pode exigir update em enrollment | validar impacto historico |
| ativar/cancelar matricula | `status` existe | expor acao real |
| registrar evolucao | `place_academy_progress_notes` existe | criar service se faltar |
| criar/usar/baixar credito | `place_academy_makeup_credits` existe | validar constraint e status |
| aprovar/recusar reposicao/drop-in | `place_academy_lesson_requests` existe | expor transicao real |
| marcar aula avulsa paga | `payment_status` existe | expor transicao real |
| editar professor | `place_coaches` existe | validar update/permissao |
| vincular login professor | `place_staff_invites` e `place_coaches.user_id` existem | reaproveitar convite/vinculo |
| editar comissao | `place_coaches.commission_percent` existe | editar no drawer |
| criar/cancelar horario aberto | `place_academy_slots` existe | validar status/transicao |
| transformar horario aberto em turma | slot + class | pode exigir RPC transacional minima |
| bloquear horario | `place_academy_slots.status = blocked` ou booking block | validar regra de conflito |

Regra:

```text
Nao criar acao falsa no frontend. Se nao persistir, registrar gap ou criar suporte minimo.
```

## Desktop

Desktop deve priorizar:

- lista/row principal no centro;
- drawer lateral para detalhe;
- filtros frequentes visiveis;
- filtros raros recolhidos;
- contadores compactos;
- sem scroll interno preso no header do modulo.

## Mobile

Mobile deve priorizar:

- uma tarefa por tela;
- tabs em trilho curto;
- row compacta;
- acao primaria em zona de toque;
- bottom sheet para filtros e detalhes;
- sticky action para criar/chamar/cobrar quando fizer sentido;
- sem formularios longos empilhados abaixo de cada entidade.

## Riscos de regressao

1. Fluxos legados podem depender do bloco `Academia e aulas`.
2. Mudanca de subvisao pode quebrar links existentes com `?visao=`.
3. Drawer precisa preservar permissao financeira e de professor.
4. Acoes de reposicao/aula avulsa podem ter estados parecidos, mas significados diferentes.
5. Academias grandes precisam busca/paginacao para nao esconder dados.
6. Mobile pode ficar longo se drawers virarem secoes inline.

## Plano incremental

### ACADEMY-V2-00 - Plano e suporte

Status: concluido quando este documento e a queue forem atualizados.

### ACADEMY-V2-01 - Remover duplicidade e reorganizar abas

Status: concluido em 2026-05-14.

- trocar `Turmas` por `Grade`;
- trocar `Recursos` por `Configuracao`;
- remover/fundir bloco legado;
- garantir tab adaptativa sem overflow preso.

Entregue:

- labels e rotas canonicas atualizadas;
- aliases antigos preservados;
- bloco legado desligado no workspace de Gestao;
- `Configuracao` recebeu recursos/horarios;
- busca de encaixe ficou recolhida em `Pendencias` ate virar drawer/sheet real.

### ACADEMY-V2-02 - Grade com drawer de turma

Status: concluido em 2026-05-14.

- rows de turma;
- busca/filtros;
- `ClassDrawer`;
- mensalidade e matricula fora da row principal.

Entregue:

- busca e filtros por dia/status;
- contador `Exibindo X de Y` e `Ver mais turmas`, removendo limite silencioso;
- `ClassDrawer` para dados, mensalidade, alunos e historico curto;
- edicao real da turma com suporte backend minimo (`updatePlaceAcademyClass`);
- salvar mensalidade e matricular aluno preservados dentro do drawer;
- acoes financeiras por aluno preservadas conforme permissao;
- criacao de turma recolhida em disclosure para nao poluir a Grade.

### ACADEMY-V2-03 - Alunos com drawer de aluno

- busca/filtros;
- rows sem limite silencioso;
- `StudentDrawer`;
- acoes de pagamento/presenca/evolucao.
- executado em 2026-05-14:
  - filtros por busca, turma, status, pagamento e presenca/reposicao;
  - drawer do aluno com dados/matricula, financeiro, presenca/faltas, evolucao e reposicoes/historico;
  - edicao real de matricula via `updateAcademyEnrollment(...)`;
  - ausencia avisada e evolucao sairam de controles soltos e passaram para o contexto do aluno;
  - uso/agendamento/baixa de credito de reposicao permanecem como tarefa de `Pendencias`, para nao duplicar fila operacional.

### ACADEMY-V2-04 - Pendencias e encaixe

- filas de matricula, drop-in, reposicao e creditos;
- `FitDrawer`;
- WhatsApp secundario.

### ACADEMY-V2-05 - Hoje e chamada rapida

- rows de aula do dia;
- `LessonDrawer`;
- presenca/falta/ausencia avisada.

### ACADEMY-V2-06 - Professores

- rows + `CoachDrawer`;
- comissao, login, convite e agenda;
- permissao de professor.

### ACADEMY-V2-07 - Configuracao

- quadras e horarios;
- filtro de data/dia;
- visao por professor/quadra;
- horario aberto, turma neste horario e bloqueio.

### ACADEMY-V2-08 - QA, permissoes e backend gaps

- validar fluxos obrigatorios;
- criar suporte minimo se faltar;
- screenshots desktop/mobile;
- atualizar docs.

## Checklist de validacao

- secretaria faz chamada da aula do dia;
- secretaria aprova aula avulsa;
- secretaria usa credito de reposicao;
- secretaria agenda solicitacao de reposicao;
- secretaria matricula aluno em turma;
- financeiro marca mensalidade paga;
- financeiro envia lembrete;
- gestor altera mensalidade da turma;
- gestor cadastra professor;
- gestor vincula login do professor;
- gestor edita comissao;
- professor ve sua agenda/turmas;
- gestor cria horario aberto;
- gestor transforma horario aberto em turma;
- aluno aparece com historico/evolucao;
- busca de encaixe nao polui fila principal;
- bloco legado nao duplica conteudo;
- filtros nao escondem dados sem aviso;
- estados vazios orientam proxima acao.

## Referencias operacionais consideradas

Padroes extraidos de boas praticas de softwares de clube/aulas:

- agenda visual para reservas, aulas e eventos;
- separacao entre players/membros, staff/professores, pagamentos e programas;
- regras por papel/tipo de membro;
- foco em rows/tabelas para volume operacional;
- setup guiado para configuracao, nao para rotina diaria.

Este plano nao copia layout externo. Ele traduz os padroes para a gramatica ATP documentada.
