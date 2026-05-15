# Restructure Source Of Truth Policy

Data: 2026-05-15

## Objetivo

Evitar que a reestruturacao traga de volta decisoes antigas que ja nao fazem sentido.

Os MDs historicos continuam uteis para entender funcoes, regras, tabelas, permissoes e gaps. Eles nao devem ser usados como justificativa para preservar layouts, ordem de telas, excesso de cards, duplicidades ou fluxos que estamos corrigindo.

## Regra Central

Preservar funcao nao significa preservar interface antiga.

Quando houver conflito:

1. preservar capacidade operacional;
2. preservar regra de negocio valida;
3. preservar contrato de backend quando ainda correto;
4. substituir arquitetura visual antiga pelo plano v2;
5. documentar qualquer funcao que nao puder ser reposicionada.

## Como Usar MDs Antigos

Use MDs antigos para:

- inventario de funcoes existentes;
- tabelas, RPCs, hooks e services conhecidos;
- permissoes e planos ja definidos;
- bugs e riscos ja mapeados;
- criterios de validacao;
- nomenclatura operacional ainda valida.

Nao use MDs antigos para:

- manter dashboard pesado no Player App;
- manter card empilhado quando a rotina pede row;
- manter formulario longo quando a acao pede wizard/drawer;
- manter blocos duplicados em mais de uma area;
- manter KPI sem acao;
- manter modulo visivel para perfil que nao usa;
- manter texto explicativo onde a estrutura deveria orientar;
- manter tabs escondidas por resumos superiores;
- manter estado vazio generico;
- manter fluxo que exige caca visual.

## Documentos De Arquitetura Atuais

Estes documentos governam a nova direcao:

- `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`;
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`;
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`;
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`;
- `ROLE_BASED_RESTRUCTURE_QUEUE.md`;
- `PLAYER_APP_V2_UX_PLAN.md`;
- `COMPETITION_OS_V2_UX_PLAN.md`;
- `MANAGEMENT_OS_V2_UX_PLAN.md`.

Documentos como `ACADEMY_MODULE_FUNCTION_MAP.md`, `AGENDA_MODULE_FUNCTION_MAP.md`, `SCREEN_RESPONSIBILITIES.md`, `COMPONENT_GRAMMAR.md`, `CURRENT_PRODUCT_STATE.md` e `EXECUTION_QUEUE.md` devem ser consultados, mas interpretados pela lente v2 acima.

## Decisoes Antigas Que Nao Devem Voltar

### Player App

Nao trazer de volta:

- painel com informacoes administrativas para jogador puro;
- cards de mensalidade para nao aluno;
- KPIs globais na primeira dobra;
- misturar organizacao de torneio com descoberta do jogador;
- lista de locais com fichas longas antes da intencao;
- perfil como cockpit de conta/produto.

Substituir por:

- proxima acao;
- intencoes claras;
- fluxo curto;
- CTA fixo quando a decisao e obvia;
- bottom sheets para filtros e confirmacoes.

### Competition OS

Nao trazer de volta:

- formulario unico gigante de torneio/liga;
- tabs escondidas abaixo de resumo;
- evento publico com cara de cockpit;
- fila de organizador para jogador;
- erro bruto de RPC/Supabase.

Substituir por:

- evento publico leve;
- wizard de setup;
- rows operacionais;
- drawer de detalhe;
- feedback claro.

### Management OS

Nao trazer de volta:

- abrir modulo com cards/KPIs antes da fila;
- configuracao misturada com rotina;
- professor vendo operacao empresarial inteira;
- modulo desativado aparecendo como KPI;
- mobile como pagina infinita.

Substituir por:

- fila operacional;
- subnav visivel;
- rows densas;
- drawer/sheet;
- permissao real por papel/plano.

## Checklist Antes De Implementar Uma Task

Antes de mexer em codigo:

1. Qual perfil usa essa tela?
2. Qual acao real ele quer concluir?
3. Essa informacao e propria, operacional ou institucional?
4. Esta funcao precisa aparecer para esse perfil?
5. A funcao e rotina, setup ou relatorio?
6. A UI atual esta preservando funcao ou preservando bagunca antiga?
7. Existe duplicidade em outra area?
8. Existe backend real para a acao?
9. O mobile 390px fica leve?
10. O resultado parece parte do ATP, nao um app paralelo?

## Criterio De Aceite

Uma mudanca v2 esta correta quando:

- preserva a funcao existente;
- remove a estrutura antiga inadequada;
- respeita papel/plano;
- reduz carga cognitiva;
- melhora caminho mobile;
- nao reintroduz duplicidade;
- deixa claro onde a acao mora.
