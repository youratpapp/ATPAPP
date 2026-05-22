# Restructure Source Of Truth Policy

Data: 2026-05-22

## Objetivo

Evitar que documentos antigos tragam de volta decisoes que ja nao representam o produto atual.

Os MDs historicos continuam uteis para entender funcoes, tabelas, permissoes, bugs e evidencias. Eles nao devem ser usados para preservar layouts antigos, menus duplicados, mobile pesado, nomenclaturas confusas ou fluxos que a V4 substituiu.

## Regra Central

Preservar funcao nao significa preservar interface antiga.

Quando houver conflito:

1. preservar capacidade operacional real;
2. preservar regra de negocio valida;
3. preservar contrato de backend quando ainda correto;
4. seguir a arquitetura V4 para UX, navegacao, mobile e page responsibilities;
5. documentar qualquer funcao que ainda nao tenha destino claro.

## Documentos Executivos Atuais

Leia nesta ordem:

1. `DOCS_SOURCE_OF_TRUTH_INDEX_2026_05_22.md`
2. `WORK_SAAS_UX_ORGANIZATION_MASTER_SPEC_V4_2026_05_22.md`
3. `WORK_SAAS_UX_ORGANIZATION_EXECUTION_QUEUE_V4_2026_05_22.md`
4. `WORK_SAAS_ROUTE_COMPATIBILITY_CONTRACT_V3.md`
5. `WORK_SAAS_PERMISSION_CONTRACT_V3.md`
6. `WORK_AREA_FUNCTION_INVENTORY.md`
7. `WORK_SAAS_DETAILED_USER_FLOWS.md`
8. `WORK_MOBILE_OPERATIONAL_SCOPE.md`
9. `WORK_SAAS_PAGE_RESPONSIBILITIES.md`
10. `WORK_SAAS_V4_EXECUTION_REPORT_2026_05_22.md`

## Como Usar Legado

Arquivos antigos foram arquivados em:

`Legado/2026-05-22_pre_v4_archived/`

Use legado para:

- recuperar inventario antigo;
- entender historico de decisoes;
- consultar evidencias antigas;
- confirmar se uma funcao ja existia;
- encontrar detalhes de schema ou regra nao repetidos nos docs atuais.

Nao use legado para:

- definir menu atual;
- definir ordem de execucao;
- justificar mobile Trabalho como mini desktop;
- preservar tabs/subtabs duplicadas;
- tratar sprint antiga como aceite final;
- misturar Player App, SaaS web Trabalho e Mobile Trabalho.

## Decisoes Que Governam O Produto Agora

### Tres Superficies

O app deve respeitar:

- Player App: experiencia final do jogador/aluno/socio/competitivo.
- SaaS Web Trabalho: gestao profissional profunda.
- Mobile Trabalho: operacao rapida, pendencias, acoes simples e comunicacao.

Competition OS e dominio contextual:

- `Competir` no modo Jogador = descoberta e participacao.
- `Competicoes` no modo Trabalho = organizacao e operacao.

### SaaS Web Trabalho

Pode ter profundidade, tabelas, filtros, detalhes, configuracoes, relatorios, multiunidade e administracao.

Nao deve parecer app improvisado, nem depender de cards empilhados para tudo.

### Mobile Trabalho

Nao e copia reduzida do SaaS web.

Deve mostrar:

- o que tenho hoje;
- o que preciso resolver agora;
- quem preciso avisar;
- qual acao simples consigo concluir no celular.

Nao deve priorizar:

- configuracao rara;
- relatorio completo;
- permissao/equipe estrutural;
- cadastro complexo;
- setup de quadras, planos, produtos, torneios ou ligas.

## Checklist Antes De Implementar

Antes de mexer em codigo:

1. Qual persona usa esta tela?
2. Qual tarefa real ela quer concluir?
3. Essa tarefa e diaria, eventual, rara ou analitica?
4. A tela pertence ao Player App, SaaS Web Trabalho ou Mobile Trabalho?
5. Qual CTA primario?
6. O que deve sair da primeira dobra?
7. Existe duplicidade com menu, aba ou botao interno?
8. A funcao e permissao, configuracao, relatorio ou operacao?
9. A rota antiga precisa de alias/wrapper?
10. O mobile 390px continua claro?

## Criterio De Aceite

Uma mudanca esta correta quando:

- preserva funcao existente;
- reduz carga cognitiva;
- respeita papel, plano e unidade;
- nao relaxa permissao;
- nao quebra rota publica ou legado;
- separa rotina de configuracao;
- separa financeiro pessoal de receita do local;
- separa jogador de trabalho;
- deixa claro o proximo passo;
- nao reintroduz documentacao antiga como comando atual.

