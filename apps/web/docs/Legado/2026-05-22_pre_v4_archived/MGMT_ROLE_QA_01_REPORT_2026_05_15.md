# MGMT-ROLE-QA-01 - Relatorio De Correcao

Data: 2026-05-15

Task: `MGMT-ROLE-QA-01 - Corrigir vazamento de setup por papel`

## Problema

`QA-ROLE-01` mostrou que a central `/gestao` ainda calculava setup e pendencias a partir do local inteiro, sem considerar o papel do usuario.

Impactos observados:

- professor via `Base incompleta`, `Definir regras` e `Cadastrar cliente`;
- recepcao via `Base incompleta`, `Definir regras` e `Cadastrar professor`;
- professor recebia pendencias globais de Academia que nao pertenciam necessariamente as suas aulas/turmas/alunos.

## Causa Raiz

`summarizePlace(...)` montava `pendingBookings`, `pendingAcademy`, `contactsDue`, `pendingFinance`, `lowStock`, `setupActions` e `setupGaps` sem receber `placeResourceAccess(...)`.

Mesmo quando `placeManagementModules(...)` removia Financeiro/Cantina/Equipe do menu, o resumo do workspace ainda exibia setup e filas herdadas do local inteiro.

## Correção

Arquivo alterado:

- `web/src/pages/ManagementHubPage.tsx`

Mudanças:

- `summarizePlace(...)` agora recebe `access` e `userId`;
- professor sem gestao completa passa a ter resumo filtrado por `place_coaches.user_id`;
- professor nao soma reservas, financeiro, CRM, estoque ou pendencias globais de Academia;
- recepcao nao soma financeiro/cantina e nao recebe setup estrutural;
- `setupActions` e `setupGaps` aparecem apenas para `owner`/`manager`;
- frontdesk pode receber acao operacional de `Cadastrar cliente` como rotina quando o modulo permitir, sem tratar isso como setup estrutural;
- textos de estado vazio/operacao em dia agora respeitam professor e recepcao.

## Evidencias

Screenshots e textos:

- `web/docs/screenshots/mgmt-role-qa-01-2026-05-15/`

Arquivos principais:

- `desktop-professor-gestao-final.png`
- `mobile-professor-gestao-final.png`
- `desktop-recepcao-gestao.png`
- `mobile-recepcao-gestao.png`
- `desktop-gestor-gestao.png`
- `mobile-gestor-gestao.png`
- `mgmt-role-qa-01-summary.json`

## Resultado Validado

| Papel | Resultado |
|---|---|
| Professor | Nao ve `Base incompleta`, `Definir regras`, `Cadastrar cliente`, `Cadastrar professor` ou `Configurar plano`. Ve rotina de aulas, turmas e alunos. |
| Recepcao | Nao ve `Base incompleta`, `Definir regras` ou `Cadastrar professor`. Ve reservas, lista de espera e acoes rapidas de atendimento. |
| Gestor | Continua vendo fila completa e modulos completos conforme plano/papel. |

## Risco Residual

- Papel financeiro dedicado ainda nao existe no schema atual e segue em `ROLE-FINANCE-01`.
- Usuario sem acesso entrando manualmente em `/gestao` ainda pode receber shell visual operacional no desktop; segue em `MGMT-ROLE-QA-02`.
- A auditoria visual ampla da consistencia dos novos modos segue em `QA-DESIGN-01`.

