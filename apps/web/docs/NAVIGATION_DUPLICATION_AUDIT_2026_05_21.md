# Navigation Duplication Audit - 2026-05-21

Fonte do pedido: captura mobile mostrando dois menus locais quase empilhados na pagina de torneio, com nomes e funcoes sobrepostas.

## Problema raiz

O cockpit operacional de competicoes estava usando `secondaryActions` como se fosse uma navegacao local. Logo abaixo, a pagina tambem renderizava `CompetitionTabs`. Isso criava duas decisoes de navegacao no mesmo ponto da tela:

- cockpit: `Inscritos`, `Jogos`, `Comunicacao`;
- abas oficiais: `Podio`, `Jogos`, `Chat`, `Organizacao`.

O usuario via dois menus com rotulos parecidos, sem saber qual era o caminho oficial.

## Correcoes aplicadas

### Torneio operacional

Arquivo: `src/pages/TournamentPage.tsx`

- Removida a fileira de `secondaryActions` dentro de `TournamentOperationalCockpit`.
- Mantido apenas o CTA primario da fase.
- Movidas as `CompetitionTabs` para logo depois do cockpit, antes do conteudo da aba.
- Resultado esperado: uma unica camada de navegacao local do torneio, com o cockpit focado em contexto e proximo passo.

### Liga operacional

Arquivo: `src/pages/LeagueDetailsPage.tsx`

- Removida a fileira de `secondaryActions` dentro de `LeagueOperationalCockpit`.
- Mantido apenas o CTA primario da fase.
- Resultado esperado: a liga deixa de competir entre "atalhos do cockpit" e abas oficiais.

### Mobile de competicoes

Arquivo: `src/App.css`

- `CompetitionTabs` em mobile deixou de parecer uma segunda bottom nav em grade 2x2.
- As abas internas agora usam chips horizontais compactos com scroll.
- Resultado esperado: bottom nav continua sendo navegacao global; `CompetitionTabs` fica claramente como navegacao local.

## Varredura de outras paginas

| Area | Camadas encontradas | Diagnostico | Acao |
| --- | --- | --- | --- |
| Torneio admin | Cockpit secondary actions + `CompetitionTabs` | Duplicado real, com nomes sobrepostos | Corrigido |
| Liga owner | Cockpit secondary actions + `CompetitionTabs` | Duplicado real, com navegacao competindo | Corrigido |
| Eventos hub | Bottom nav + `competition-hub-tabs` | Filtro de superficie (`descobrir`, `jogando`, `organizando`), sem nome duplicado com bottom nav | Manter, observar em QA |
| Agenda pessoal | Bottom nav + `personal-agenda-tabs` | Filtros da agenda, nao menu concorrente | Manter |
| Perfil | Bottom nav + `profile-purpose-tabs` | Secoes internas do perfil, nao menu concorrente | Manter |
| Ranking | Bottom nav + `ranking-scope-tabs` | Filtro de ranking, nao menu concorrente | Manter |
| Locais | Bottom nav + `places-intent-strip` + `places-scope-tabs` | Intencao de busca e filtro de diretorio; nao duplica bottom nav, mas pode ficar denso quando ambos aparecem no diretorio | Manter, observar |
| Gestao de local | Sidebar/bottom nav + `place-management-tabs` + `academy-workspace-tabs` + strips de prioridade | Hierarquia valida no desktop, mas ainda e um risco de excesso de tiers no mobile e em usuarios com muitos locais | Pendencia UX |
| Setup wizard | Etapas do wizard | Progresso de formulario, nao navegacao paralela | Manter |

## Evidencias

Capturas novas:

- `docs/screenshots/navigation-duplication-audit-2026-05-21-run3/`

Rotas validadas:

- `#/eventos/23fb0ac9-8436-4cd1-a68c-d23cf0129b56/organizacao`
- `#/eventos/23fb0ac9-8436-4cd1-a68c-d23cf0129b56/classificacao`
- `#/eventos/ligas/d5c32395-b466-4bb2-a97e-3b648da5c8ca`
- `#/eventos/ligas/d5c32395-b466-4bb2-a97e-3b648da5c8ca?tab=partidas`

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

Console/diagnostico:

- `events: []` nas rotas capturadas.
- `npx tsc -b --pretty false` passou.

## Pendencias recomendadas

### NAV-UX-02 - Gestao de local com excesso de tiers

Status: concluido em `docs/PLACE_NAVIGATION_SIMPLIFICATION_2026_05_21.md`.

Quando o usuario tem mais de uma academia/local, a combinacao de seletor de local, menu externo, tabs de modulo e subtabs internas ainda pode parecer uma arvore de navegacao. Proxima revisao deve:

- definir local ativo como contexto fixo da superficie;
- evitar repetir o mesmo conceito no menu externo e interno;
- deixar sidebar desktop como navegacao de modulo;
- deixar mobile com uma camada principal e sheets contextuais;
- manter subtabs apenas quando forem filtros dentro de uma tarefa, nao modulos disfarçados.

### NAV-UX-03 - Regra permanente para competicoes

Em torneios e ligas:

- cockpit mostra fase, bloqueio, metricas e CTA primario;
- abas mostram a navegacao local;
- task rows mostram fila operacional;
- nenhuma `secondaryAction` deve virar menu paralelo quando existir aba oficial.
