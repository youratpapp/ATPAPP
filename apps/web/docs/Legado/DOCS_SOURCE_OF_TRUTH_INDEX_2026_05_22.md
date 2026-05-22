# Docs Source Of Truth Index - 2026-05-22

Status: indice executivo apos reset de produto.

## Decisao Atual

Os MDs SaaS anteriores, incluindo V3, V4 e V5, nao devem mais ser usados como fonte de referencia para reorganizar a area Trabalho.

Motivo: a aplicacao pratica deles ainda resultou em uma adaptacao da estrutura existente, nao em uma reinterpretacao profissional completa da area Trabalho como SaaS web + mobile operacional.

## O Que Continua Ativo

Somente contratos tecnicos e runbooks que protegem o produto enquanto uma nova arquitetura e criada do zero:

- `TECH_ROUTE_COMPATIBILITY_CONTRACT_2026_05_22.md`
- `TECH_PERMISSION_BOUNDARY_CONTRACT_2026_05_22.md`
- `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`
- `SUPABASE_SQL_APPLICATION_RUNBOOK_2026_05_21.md`

Esses arquivos nao definem menu, UX, IA, fluxo ou layout. Eles apenas preservam rotas, permissoes e banco.

## O Que Foi Arquivado

MDs pre-V5 arquivados:

`Legado/2026-05-22_pre_v5_archived/`

MDs V5 arquivados:

`Legado/2026-05-22_v5_rejected_as_product_reference/`

## Regra De Uso Do Legado

Legado pode ser consultado apenas para:

- recuperar inventario bruto;
- verificar evidencias;
- entender tentativas anteriores;
- confirmar regras tecnicas antigas.

Legado nao pode ser usado para:

- definir arquitetura final;
- justificar menus atuais;
- preservar submenus/tabs/cards existentes;
- executar queues antigas;
- concluir que algo esta aprovado;
- adaptar a estrutura atual como se fosse SaaS.

## Proxima Fonte A Ser Criada

Antes de qualquer implementacao estrutural, deve ser criado um novo pacote documental, partindo de:

1. inventario real do codigo;
2. screenshots atuais;
3. fluxos reais por persona;
4. boas praticas de SaaS web profissional;
5. separacao clara entre SaaS Web Trabalho, Mobile Trabalho e Player App;
6. decisao explicita do que deve ser reconstruido, fundido, removido ou mantido.

Nenhuma queue antiga esta autorizada como base de implementacao.
