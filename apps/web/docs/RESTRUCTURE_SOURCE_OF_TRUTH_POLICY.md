# Politica de Fonte de Decisao para Reorganizacao SaaS

Status: ativa
Data: 2026-05-22

## Fonte primaria

A fonte primaria de decisao de produto e arquitetura e o `SAAS_MASTER_BLUEPRINT_COMPLETO.md`.

Os demais documentos ativos listados em `DOCS_SOURCE_OF_TRUTH_INDEX_2026_05_22.md` detalham partes do blueprint.

## Legado

Os MDs em `Legado/` registram tentativas anteriores e nao devem ser usados como direcao principal.

Se houver conflito entre um documento legado e a nova base SaaS:

1. A nova base vence.
2. O legado nao deve ser citado como justificativa.
3. A implementacao deve seguir fluxo, persona e dominio definidos na nova base.

## Uso da base atual do app

A base atual do app e fonte tecnica, nao limite conceitual.

Ela deve ser usada para:

- identificar funcoes existentes;
- reaproveitar loaders, RPCs, componentes e dados;
- preservar rotas;
- evitar recriar backend sem necessidade.

Ela nao deve ser usada para:

- manter menus confusos;
- manter abas duplicadas;
- justificar web com formato de mobile;
- impedir criacao de paginas 360, workspaces ou dominios SaaS quando necessarios.

## Criterio para backend novo

So propor backend novo quando:

- o fluxo operacional nao fecha com a estrutura atual;
- falta dado essencial;
- falta status/historico/relacao indispensavel;
- a solucao por composicao nao resolve;
- houver menor ajuste tecnico documentado.

## Antes de implementar

Toda mudanca estrutural precisa responder:

- Qual persona usa?
- Qual fluxo melhora?
- Qual dominio SaaS recebe a funcao?
- Web, mobile ou ambos?
- O que ja existe para reaproveitar?
- O que nao pode quebrar?
- Qual estado vazio e de erro?
- Qual criterio de aceite?
