# Indice de Fonte Atual

Status: ativo
Data: 2026-05-22

## Regra principal

Os documentos em `Legado/` nao sao fonte de decisao de produto, arquitetura, UX ou prioridade. Eles podem ser consultados apenas como historico.

A nova base ativa da reorganizacao SaaS e composta pelos documentos abaixo.

## Base conceitual e operacional ativa

0. `SAAS_MASTER_BLUEPRINT_COMPLETO.md`
   - Documento-mae. Define a arquitetura completa alvo antes de qualquer implementacao estrutural.

1. `SAAS_EMPRESARIAL_ORGANIZACAO_MANUAL.md`
   - Manual de principios, papel do SaaS, web vs mobile e padrao de organizacao.

2. `APP_FUNCOES_EXISTENTES_MAPA.md`
   - Inventario das funcoes ja existentes no app e destino recomendado.

3. `PERSONAS_OPERACIONAIS_E_FUNCOES.md`
   - Personas reais da operacao e o que cada uma precisa fazer.

4. `MATRIZ_PERSONAS_FUNCOES.md`
   - Cruzamento inicial entre funcoes e personas, sem implementar permissoes.

5. `EXPANSAO_FUNCIONAL_SAAS.md`
   - Lacunas e expansoes necessarias para maturidade SaaS.

6. `NOVA_ARQUITETURA_NAVEGACAO_SAAS.md`
   - Arquitetura alvo de navegacao, workspaces e separacao web/mobile.

7. `FLUXOS_TRABALHO_POR_PERSONA.md`
   - Fluxos reais por papel, do inicio ao fim.

8. `DIAGNOSTICO_ATUAL_SAAS.md`
   - Diagnostico honesto da estrutura atual.

9. `PLANO_REORGANIZACAO_SAAS_FASES.md`
   - Plano em fases para sair do estado atual ate o SaaS alvo.

10. `SAAS_IMPLEMENTATION_QUEUE_COMPLETA.md`
   - Ordem executiva completa para implantacao sprint a sprint ate o final.

11. `SAAS_TARGET_ARCHITECTURE_IMPLEMENTATION_MAP.md`
   - Mapa alvo de menus, paginas, rotas, dominios e conexoes entre sprints.

12. `SAAS_EXECUTION_GUARDRAILS_ANTI_PATTERNS.md`
   - Regras obrigatorias, anti-padroes proibidos e checklists de execucao.

13. `SAAS_SCREEN_CONTRACTS_DETAILED.md`
   - Contratos detalhados de tela para guiar implementacao sem inferencia.

14. `SAAS_PAGE_BY_PAGE_COMPLETION_REVIEW.md`
   - Revisao pagina por pagina das lacunas corrigidas antes da implementacao.

## Documentos tecnicos ainda uteis

Estes documentos podem continuar ativos porque nao definem arquitetura de produto antiga; eles registram limites tecnicos ou runbooks:

- `SUPABASE_SQL_APPLICATION_RUNBOOK_2026_05_21.md`, se existir no repositorio.
- `TECH_PERMISSION_BOUNDARY_CONTRACT_2026_05_22.md`, se existir no repositorio.
- `TECH_ROUTE_COMPATIBILITY_CONTRACT_2026_05_22.md`, se existir no repositorio.
- `WORK_SAAS_DATABASE_MIGRATION_CLOSURE_REPORT.md`, se existir no repositorio.
- `WORK_SAAS_DATABASE_MIGRATION_QUEUE.md`, se existir no repositorio.

## Como usar esta base

Antes de implementar qualquer mudanca estrutural:

1. Confirmar qual persona e fluxo a mudanca atende.
2. Confirmar em qual dominio SaaS a funcao pertence.
3. Verificar se a funcao ja existe e pode ser reaproveitada.
4. Confirmar se a solucao e web, mobile ou ambos.
5. Proteger rotas publicas e legadas.
6. Documentar lacuna tecnica apenas quando a base atual nao fechar o fluxo.

## Proibido

- Usar MD legado como fonte principal.
- Reorganizar apenas o menu atual sem repensar fluxo.
- Copiar o formato mobile para web SaaS.
- Colocar configuracao rara na rotina diaria.
- Misturar Player App com Trabalho.
- Recriar backend sem provar necessidade operacional e tecnica.
