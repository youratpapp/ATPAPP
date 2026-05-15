# Management OS v2 UX Plan

Data: 2026-05-15

Fonte: `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `ACADEMY_V2_UX_PLAN.md`, `AGENDA_MODULE_FUNCTION_MAP.md`, `ACADEMY_MODULE_FUNCTION_MAP.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`.

Especificacao executavel: `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`.

Politica de legado: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`. Este plano preserva rotinas e regras operacionais, mas substitui estruturas antigas de dashboard, duplicidade, configuracao misturada com rotina e mobile em pagina infinita.

## Objetivo

Transformar a gestao de clube/academia em um sistema operacional pratico, denso na medida certa e organizado por rotina real.

Gestao pode ter mais informacao que Player App, mas nao pode parecer uma pagina infinita de cards e formularios.

## Principios

1. Fila antes de KPI.
2. Subnav antes de resumo.
3. Rotina em rows.
4. Detalhe em drawer.
5. Configuracao em subvisao.
6. Setup raro em wizard.
7. Permissao e plano antes de renderizar.
8. Professor/recepcao/financeiro nao veem operacao que nao usam.

## Entrada /gestao

Responsabilidade:

- levar o operador ao workspace correto.

Para gestor:

- locais acessiveis;
- pendencias operacionais;
- atalhos para Agenda, Academia, Financeiro, Clientes, Cantina, Equipe, Ajustes.
- indicadores agregados apenas depois da fila, como suporte para decisao.

Para professor:

- modo leve com aulas, turmas e alunos;
- sem cockpit empresarial.

Para player sem acesso:

- estado vazio claro;
- retorno para Player App.

## /gestao/:placeId/:module

Responsabilidade:

- operar um local.

Ordem visual mobile:

1. contexto compacto;
2. module switcher/subnav;
3. fila operacional;
4. lista/rotina principal;
5. metricas;
6. configuracao/relatorio.

Nao deve:

- mostrar ficha publica do local;
- abrir com hero grande;
- empilhar todos os modulos;
- mostrar modulo desativado como KPI ativo.

Status 2026-05-15:

- `MGMT-UX-01` aplicado: `/gestao` abre por fila do dia e move locais/pendencias/reservas para `Sinais de suporte`;
- professor nao recebe `Painel`, Clientes, Financeiro ou Cantina por heranca de plano;
- dashboard local filtra a fila pelo modulo permitido antes de renderizar acoes.
- `MGMT-UX-02` aplicado: professor sem gestao completa entra em Academia com abas `Aulas`, `Turmas` e `Alunos`; dados sao filtrados pelo professor vinculado e pendencias de secretaria ficam fora da rotina do professor.
- `QA-DESIGN-01` adicionou fallback para dados opcionais do workspace: pagamentos e partidas abertas nao podem bloquear a primeira dobra da Gestao. A otimizacao ideal futura e um agregador leve de resumo, sem carregar todos os modulos antes de mostrar a fila.

## Agenda

Responsabilidade:

- operar reservas, quadras, bloqueios, espera e disponibilidade.

Primeira leitura:

- hoje;
- pendencias;
- calendario/quadras;
- nova reserva;
- lista de espera;
- recursos/regras.

Regras:

- calendario mobile nao esconde quadras;
- nova reserva usa fluxo progressivo;
- busca de disponibilidade tem feedback inline;
- bloqueio e reserva rapida ficam diretos;
- configuracao de quadra/regra fica secundaria.

## Academia

Fonte principal:

- `ACADEMY_V2_UX_PLAN.md`.

Estrutura alvo:

- Hoje;
- Grade;
- Alunos;
- Pendencias;
- Professores;
- Configuracao.

Regras:

- aluno deve ser usuario/contrato quando possivel;
- matriculas por turma sao vinculos de chamada/presenca;
- reposicao aberta, solicitacao de reposicao, aula avulsa e ausencia avisada nao podem ser misturadas;
- chamada e rotina diaria em drawer curto;
- setup de turma/horario em drawer/wizard conforme frequencia;
- professor so ve sua rotina se nao tiver permissao de gestao completa.

## Clientes / CRM

Responsabilidade:

- relacionamento e conversao.

Primeira leitura:

- leads para responder;
- follow-up de hoje;
- clientes parados;
- historico curto.

Comportamento:

- rows;
- drawer de contato;
- WhatsApp como acao secundaria quando a tarefa real e aprovar/cobrar/seguir.

Nao deve:

- virar rede social;
- competir com Financeiro;
- duplicar cobrancas sem contexto.

## Financeiro

Responsabilidade:

- cobrar, marcar pago, enviar lembrete e acompanhar recebiveis/despesas.

Primeira leitura:

- vencidos;
- vence hoje;
- pendentes por origem;
- despesas recentes.

Nao deve:

- abrir com relatorio se ha cobranca acionavel;
- aparecer para papel sem permissao;
- misturar cobrança propria do jogador com financeiro do local.

## Cantina / POS

Responsabilidade:

- venda rapida, estoque e resumo do dia.

Primeira leitura:

- vender produto;
- produtos com estoque baixo;
- vendas recentes;
- caixa do dia.

Regras:

- se modulo desativado por plano, nao aparece como KPI operacional;
- cadastro de produto e relatorio ficam secundarios.

## Equipe

Responsabilidade:

- pessoas, papeis, convites e permissoes.

Regras:

- convidar por usuario/email com feedback;
- convite pendente nao concede acesso automatico;
- usuario so ve apos aceitar;
- papel define visibilidade real dos modulos.

## Ajustes

Responsabilidade:

- configuracao estrutural.

Conteudo:

- dados publicos;
- recursos;
- regras;
- planos;
- permissoes;
- publicacao.

Nao deve competir com rotina diaria.

## Componentes Alvo

- `ManagementModuleShell`;
- `ManagementSubnav`;
- `OperationalQueueRow`;
- `DenseEntityRow`;
- `ManagementDrawer`;
- `ManagementBottomSheet`;
- `CollapsedMetricStrip`;
- `PermissionEmptyState`;
- `PlanDisabledState`.

## Criterios De Aceite

- gestor ve fila e modulo ativo antes de metricas;
- professor ve apenas aulas/turmas/alunos/agenda dele;
- recepcao consegue operar agenda sem abrir configuracao;
- financeiro consegue cobrar sem cacar relatorio;
- cantina nao aparece quando plano nao habilita;
- mobile nao vira pagina infinita;
- tabs/subvisoes sao visiveis;
- drawers/sheets preservam todas as funcoes existentes;
- lint/build quando houver codigo.
