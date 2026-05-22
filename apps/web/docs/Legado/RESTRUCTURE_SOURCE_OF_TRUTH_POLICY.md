# Restructure Source Of Truth Policy

Data: 2026-05-22

## Estado Atual

Nao existe, neste momento, uma fonte de produto ativa autorizada para implementar a reestruturação da area Trabalho.

Os MDs SaaS anteriores foram arquivados porque ainda carregavam demais a organizacao atual do app.

## Regra Principal

Nao adaptar a estrutura existente por conveniencia.

A proxima arquitetura precisa ser redescoberta e proposta do zero, usando:

- funcoes reais existentes no codigo;
- fluxos reais de operacao;
- personas reais;
- necessidades de SaaS web profissional;
- necessidades de mobile operacional;
- separacao clara entre trabalho e jogador;
- referencias maduras de produto SaaS.

## O Que Pode Ser Usado Agora

Somente como limite tecnico:

- `TECH_ROUTE_COMPATIBILITY_CONTRACT_2026_05_22.md`
- `TECH_PERMISSION_BOUNDARY_CONTRACT_2026_05_22.md`
- documentos de banco e migrations.

## O Que Nao Pode Ser Usado Como Fonte

- queues V3/V4/V5;
- master specs V3/V4/V5;
- auditorias antigas como direcao final;
- roadmap antigo;
- prompts antigos;
- documentos que digam que uma fase foi concluida;
- qualquer MD que preserve o menu atual como base.

## Criterio Para Nova Fonte

Uma nova fonte so sera valida se:

- mapear todas as funcoes sem herdar a organizacao atual;
- explicar onde cada funcao deve viver;
- separar web trabalho de mobile trabalho;
- explicar fluxos por persona;
- definir telas por responsabilidade;
- desenhar uma arquitetura SaaS web real;
- definir mobile como ferramenta operacional, nao mini desktop;
- preservar rotas e permissoes tecnicas;
- assumir explicitamente que a estrutura atual pode estar errada.
