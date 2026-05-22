# Operational Module Redesign Playbook

Fonte principal:

- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`
- `SCREEN_RESPONSIBILITIES.md`
- `COMPONENT_GRAMMAR.md`
- `PREMIUM_UX_VISUAL_LANGUAGE.md`
- `FULL_APP_PRODUCT_TECH_UX_AUDIT.md`

Data: 2026-05-14

## Objetivo

Criar um processo repetivel para revisar area por area do app com o mesmo grau de rigor aplicado a `Gestao > Academia`.

Este playbook existe para evitar novos prompts gigantes e manter continuidade:

```text
Mapear funcao real -> diagnosticar friccao -> propor v2 -> executar incrementalmente -> validar por perfil.
```

## Quando usar

Usar antes de refatorar areas como:

- Agenda;
- Academia;
- Clientes/CRM;
- Financeiro;
- Cantina;
- Equipe;
- Ajustes;
- Competition OS;
- Locais publicos;
- Home do jogador;
- Perfil;
- Ranking.

## Artefatos obrigatorios por modulo

Para cada modulo revisado, criar ou atualizar:

1. `*_MODULE_FUNCTION_MAP.md`
2. `*_V2_UX_PLAN.md`
3. pasta de screenshots em `web/docs/screenshots/<modulo>-<data>/`
4. tarefas especificas em `EXECUTION_QUEUE.md`
5. registros em `CURRENT_PRODUCT_STATE.md`
6. ajustes em `SCREEN_RESPONSIBILITIES.md` quando a responsabilidade mudar
7. ajustes em `COMPONENT_GRAMMAR.md` quando surgir padrao reutilizavel

## Etapa 1 - Captura por perfil

Capturar pelo menos:

- Admin/PRO completo;
- Player comum;
- Professor/staff quando o modulo tiver papel operacional;
- mobile 360/390/430 quando a tela for de rotina;
- desktop operacional.

Regra:

```text
Nao validar apenas com admin. Se a tela muda por perfil, o mapa precisa mostrar isso.
```

## Etapa 2 - Mapa funcional

O `*_MODULE_FUNCTION_MAP.md` deve listar:

- telas e subvisoes;
- cada funcao existente;
- inputs;
- acoes;
- dados consultados;
- dados persistidos;
- permissoes;
- estados vazios;
- limites de lista;
- duplicidades;
- fluxos escondidos;
- rotas/subrotas relevantes.

Perguntas obrigatorias:

- Onde o usuario esperaria encontrar esta tarefa?
- A acao principal esta evidente?
- Existe funcao duplicada em outro bloco?
- A lista esconde dados com `slice` ou limite invisivel?
- Existe formulario repetido por entidade?
- Existe wizard onde deveria haver drawer?
- Existe drawer onde deveria haver setup guiado?
- O mobile vira uma pagina infinita?

## Etapa 3 - Diagnostico

Classificar problemas por:

- gravidade;
- frequencia;
- impacto operacional;
- risco de erro humano;
- impacto mobile;
- impacto premium/percepcao;
- risco por perfil/plano.

Problemas comuns:

- modulo com muitas responsabilidades;
- admin vazando para Player App;
- publico vazando para Management OS;
- KPIs antes da tarefa;
- botoes equivalentes;
- configuracao misturada com rotina;
- dados ocultos sem contador;
- termos ambiguos;
- estado vazio sem proxima acao.

## Etapa 4 - Plano v2

O `*_V2_UX_PLAN.md` deve conter:

1. objetivo do modulo;
2. nova arquitetura UX;
3. mapa de migracao das funcoes atuais;
4. blocos removidos/fundidos;
5. acoes que viram drawer;
6. acoes que continuam inline;
7. acoes que viram setup/wizard;
8. suporte backend necessario;
9. regras de permissao/perfil/plano;
10. comportamento desktop;
11. comportamento mobile;
12. riscos de regressao;
13. plano incremental;
14. checklist de validacao.

Regra:

```text
Nenhuma funcao some. Ela muda para o lugar logico ou vira gap documentado.
```

## Etapa 5 - Decisao de UX

Usar esta matriz:

| Tipo de tarefa | Padrao |
| --- | --- |
| rotina diaria | row + acao primaria + drawer curto |
| fila operacional | `OperationalQueue` |
| entidade com historico | `EntityActionRow` + drawer |
| volume alto | table desktop + rows mobile + filtros |
| filtro frequente | visivel |
| filtro raro | sheet/drawer |
| criacao simples | drawer |
| setup inicial/complexo | wizard |
| detalhe secundario | disclosure/drawer |
| acao sensivel | permissao + confirmacao |

Anti-patterns:

- card alto para cada entidade recorrente;
- formulario repetido em cada card;
- wizard aberto no corpo da lista;
- acao falsa sem persistencia;
- menu `Mais` quando existe espaco para a acao essencial;
- scroll interno preso em bloco operacional;
- lista operacional que mostra apenas os primeiros itens sem aviso.

## Etapa 6 - Backend minimo

Antes de criar qualquer botao:

1. verificar se existe tabela/RPC/service;
2. reaproveitar o que existe;
3. criar suporte minimo apenas se a acao precisa persistir;
4. respeitar RLS, permissao, plano e papel;
5. documentar toda alteracao.

Proibido:

- simular sucesso local;
- criar sistema paralelo;
- refatorar backend inteiro para uma melhoria de UX;
- alterar schema sem necessidade comprovada.

## Etapa 7 - Implementacao incremental

Cada sprint deve:

- pegar um item da queue;
- alterar apenas o necessario;
- preservar dados e funcoes existentes;
- validar perfil/plano;
- rodar lint/build;
- gerar screenshots quando possivel;
- atualizar docs ao final.

Nao fechar uma fase so porque uma tela ficou visualmente melhor. Fechar apenas quando os fluxos obrigatorios passarem.

## Etapa 8 - Validacao final

Para cada modulo, validar:

- fluxo principal do admin;
- fluxo principal do usuario comum;
- fluxo de staff/professor quando existir;
- estado vazio;
- volume alto de dados;
- mobile;
- permissao negada;
- erro de backend;
- retorno por URL direta;
- refresh/reentrada na aba.

## Ordem recomendada de proximas areas

1. `Academia v2`: ja planejada em `ACADEMY_V2_UX_PLAN.md`.
2. `Agenda v2`: ja possui `AGENDA_MODULE_FUNCTION_MAP.md`; precisa plano v2 especifico.
3. `Clientes/CRM v2`: consolidar lead, aluno, socio e follow-up sem duplicar cobranca.
4. `Financeiro v2`: separar fila de cobranca, caixa, relatorio e configuracao.
5. `Competition OS v2`: revisar organizador vs jogador por evento.
6. `Locais/Public v2`: validar descoberta por intencao com massa grande.
7. `Home/Player v2`: reduzir feed e priorizar proxima acao por perfil.

## Criterio de qualidade

Uma area so esta pronta quando:

- uma pessoa nova entende onde agir;
- a proxima acao e obvia;
- a tela nao exige cacar funcao;
- mobile nao vira desktop empilhado;
- perfis errados nao veem ferramentas erradas;
- docs e queue refletem o estado real.
