# QA-DESIGN-01 - Auditoria Visual De Consistencia

Data: 2026-05-15

Fontes:

- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`

Evidencias:

- `web/docs/screenshots/qa-design-01-2026-05-15/`

## Objetivo

Validar se as superficies reestruturadas mantem o DNA visual ATP: Player App leve, Competition OS separado por papel e Management OS operacional, sem voltar para mosaico de cards, zeros sem valor ou superficies profissionais vazando para jogador puro.

## Escopo Validado

| Superficie | Perfis | Desktop | Mobile | Resultado |
| --- | --- | --- | --- | --- |
| Player App - Inicio | jogador puro | `desktop1366-player-inicio-final.png` | `mobile390-player-inicio-final.png` | Aprovado |
| Player App - Locais | jogador puro | `desktop1366-player-locais-final.png` | `mobile390-player-locais-final.png` | Aprovado com ajuste |
| Player App - Eventos | jogador puro | `desktop1366-player-eventos-final.png` | `mobile390-player-eventos-final.png` | Aprovado com ajuste |
| Player App - Ranking | jogador puro | `desktop1366-player-ranking-final.png` | `mobile390-player-ranking-final.png` | Reenfileirado |
| Player App - Perfil | jogador puro | `desktop1366-player-perfil-final.png` | `mobile390-player-perfil-final.png` | Aprovado com ressalva |
| Competition OS - Hub organizador | organizador | `desktop1366-organizer-eventos-final.png` | `mobile390-organizer-eventos-final.png` | Aprovado |
| Competition OS - Lista de torneios | organizador | `desktop1366-organizer-torneios-final.png` | `mobile390-organizer-torneios-final.png` | Reenfileirado |
| Management OS - Professor | professor | `desktop1366-coach-gestao-final.png` | `mobile390-coach-gestao-final.png` | Aprovado com ressalva |
| Management OS - Recepcao | recepcao | `desktop1366-frontdesk-gestao-final.png` | `mobile390-frontdesk-gestao-final.png` | Aprovado |
| Management OS - Gestor | gestor | `desktop1366-manager-gestao-final.png` | `mobile390-manager-gestao-final.png` | Aprovado com ressalva |

## Correcoes Aplicadas

### QA-DESIGN-FIX-01 - Zeros Em Tiles De Intencao

Antes:

- `/locais` exibia contadores zerados em intencoes de jogador, reforcando sensacao de dashboard vazio.

Depois:

- tiles de `Encontrar jogo`, `Reservar quadra`, `Entrar em aula` e `Ver locais` ocultam contadores quando o valor e `0`.
- o jogador recebe a intencao e o proximo caminho, nao uma metrica fraca.

Arquivos:

- `web/src/pages/PlacesPage.tsx`

### QA-DESIGN-FIX-02 - Competition Hub Sem Ruido Para Jogador Puro

Antes:

- `/eventos` ocultava o card de organizador para jogador puro, mas ainda mostrava o segmento `Organizando`;
- badges `0` apareciam em acoes de torneio/liga, comunicando vazio sem acao util.

Depois:

- `CountBadge` nao renderiza valor `0`;
- jogador puro nao ve `Organizando` na primeira leitura;
- usuario com competicoes organizadas ou acesso explicito ao modo ainda recebe o contexto de organizacao.

Arquivos:

- `web/src/pages/EventsHubPage.tsx`

### QA-DESIGN-FIX-03 - Gestao Nao Bloqueia Por Dados Opcionais

Antes:

- a Central de Gestao podia ficar em loading prolongado quando chamadas opcionais como pagamentos ou partidas abertas demoravam/falhavam.

Depois:

- `fetchPlacesWorkspaceData(...)` usa fallback por recurso opcional;
- falha/timeout de `app_payments` ou `open matches` nao derruba a primeira dobra operacional;
- erros tecnicos ficam no console, nao viram banner cru para usuario.

Arquivos:

- `web/src/lib/place-admin-data.ts`

## Checklist Visual

| Criterio | Resultado | Observacao |
| --- | --- | --- |
| Player App sem KPIs administrativos | Passou | Inicio, Locais e Eventos ficam orientados por intencao/proxima acao. |
| Jogador puro sem superficie profissional indevida | Passou | `Gestao`/`Organizar` nao aparecem como caminho primario; `/eventos` nao exibe `Organizando`. |
| Zeros sem valor operacional colapsados | Passou parcial | Corrigido em Locais/Eventos; sinais de suporte com zero para professor ficam como polish futuro. |
| Competition OS separado por modo | Passou | Hub usa modos; organizador ainda precisa polish nas listas profundas. |
| Management OS com fila antes de KPI | Passou | Professor/recepcao/gestor mantem fila e papel antes de suporte. |
| Mobile sem pagina infinita nos fluxos principais | Passou parcial | Player principal melhorou; Ranking e lista de torneios organizados seguem densos. |
| Falha opcional de backend sem travar UI | Passou parcial | Fallback criado; ainda ha risco de performance/data para otimizar. |

## Achados Reenfileirados

1. `PLAYER-UX-06`: Ranking ainda parece power-user e deve ser centrado em posicao do jogador, classe/cidade e lista progressiva.
2. `COMP-OPS-01`: lista mobile de torneios organizados ainda usa filtros e cards demais; precisa virar operacao em rows com filtro/sheet.
3. Futuro item tecnico/produto: Central de Gestao deve usar agregador leve de resumo para nao depender de carregar todos os modulos antes da primeira dobra.
4. Polish futuro: sinais de suporte com `0 pendencias`/`0 reservas` para professor podem ser colapsados quando nao ajudam a rotina.

## Validacao Executada

- Playwright autenticado em desktop 1366px e mobile 390px.
- Usuarios usados:
  - `jogador001@demo.atp.local`
  - `organizador.circuito@demo.atp.local`
  - `prof.renato@demo.atp.local`
  - `recepcao.dourados@demo.atp.local`
  - `gerente.dourados@demo.atp.local`
- `npm.cmd run lint`
- `npx.cmd tsc --noEmit`
- `npm.cmd run build`

## Risco Residual

- Existe timeout/fallback para `app_payments`; a UI fica protegida, mas o backend/dado ainda deve ser revisado em uma sprint de performance/financeiro.
- O Ranking e as listas internas de organizador continuam funcionais, mas ainda carregam densidade visual superior ao alvo v2.
