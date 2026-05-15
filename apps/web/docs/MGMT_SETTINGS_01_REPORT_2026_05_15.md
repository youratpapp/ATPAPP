# MGMT-SETTINGS-01 Report

Data: 2026-05-15

## Objetivo

Transformar `Ajustes` em uma central de configuracao estrutural do local, separando dados publicos, recursos, regras, planos, permissoes e publicacao da rotina diaria.

## Causa Do Problema

- Ajustes ainda misturava resumo, checklist, plano e estrutura em poucos blocos.
- O workspace podia coexistir com um bloco legado de configuracoes, repetindo checklist e plano.
- Algumas decisoes estruturais ficavam escondidas em modulos operacionais sem um indice claro.

## Entrega

- `SettingsWorkspaceShell` ganhou subvisoes: `Checklist`, `Dados publicos`, `Recursos`, `Regras`, `Planos`, `Permissoes` e `Publicacao`.
- Rotas de Ajustes foram atualizadas para segmentos canonicos e aliases legados continuam funcionando.
- `Checklist` mostra prontidao, modulos liberados e rows acionaveis para o modulo responsavel.
- `Dados publicos` permite editar nome, cidade, UF, descricao, logo e abrir a pagina publica.
- `Recursos`, `Regras`, `Planos`, `Permissoes` e `Publicacao` funcionam como central estrutural, sem duplicar operacao profunda de Agenda, Academia, Financeiro, Cantina ou Equipe.
- O bloco legado de configuracoes deixa de aparecer quando o workspace de Ajustes esta ativo.

## Arquivos Alterados

- `web/src/components/place/SettingsWorkspaceShell.tsx`
- `web/src/lib/place-admin-navigation.ts`
- `web/src/pages/PlacesPage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`
- `web/docs/COMPONENT_GRAMMAR.md`

## Validacao

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.

## Riscos Restantes

- Ajustes tem sete subvisoes por atender a uma configuracao estrutural ampla. Se o teste em mobile apontar friccao, o refinamento recomendado e agrupar `Dados publicos/Publicacao` e `Recursos/Regras`.
- Permissoes continuam editadas no modulo Equipe; Ajustes atua como leitura e atalho para evitar duplicidade.
