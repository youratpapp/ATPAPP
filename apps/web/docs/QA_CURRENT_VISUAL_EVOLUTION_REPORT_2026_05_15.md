# QA Current Visual Evolution Report

Data: 2026-05-15

Fontes:

- `QA_DESIGN_01_VISUAL_CONSISTENCY_REPORT_2026_05_15.md`
- `PLAYER_APP_V2_UX_PLAN.md`
- `COMPETITION_OS_V2_UX_PLAN.md`
- `MANAGEMENT_OS_V2_UX_PLAN.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `COMPONENT_GRAMMAR.md`
- `DESIGN_TOKENS.md`
- `CURRENT_PRODUCT_STATE.md`
- `EXECUTION_QUEUE.md`

Evidencias:

- Baseline anterior: `web/docs/screenshots/qa-design-01-2026-05-15/`
- Rodada atual: `web/docs/screenshots/qa-current-2026-05-15/`
- Sumario atual: `web/docs/screenshots/qa-current-2026-05-15/qa-current-summary.json`
- Recaptura de gestao com espera longa: `web/docs/screenshots/qa-current-2026-05-15/qa-management-wait30-summary.json`

## Objetivo

Reexecutar os prints e verificar criticamente se as mudancas feitas depois da auditoria visual de ontem aproximaram o app do alvo definido:

- Player App leve, claro e orientado por intencao;
- Competition OS separado do modo jogador;
- Management OS operacional por papel, sem cockpit generico;
- mobile sem empilhamento excessivo;
- ausencia de erro tecnico cru na UI;
- Supabase/demo coerente com os perfis usados nos testes.

## Veredito

Passou parcialmente.

Houve evolucao real em `Inicio`, `Locais`, `Perfil`, entrada de `Competicoes` e na Central de Gestao apos aguardar os dados. O Player App esta mais curto, menos administrativo e mais proximo do modelo task-first que foi planejado.

Ainda nao atingimos completamente o combinado porque:

1. um erro tecnico de backend aparece cru na Home do jogador;
2. o Supabase alvo nao esta alinhado com os seeds/migrations documentados, entao `qa.jogador.puro@demo.atp.local` e `caixa.prime@demo.atp.local` nao autenticaram;
3. Ranking continua fora do padrao leve do Player App;
4. Organizacao de torneios ainda mostra filtros/zeros/loading demais;
5. Management OS carrega, mas gera 404/500 no console em todos os perfis testados.

## Matriz De Evidencia

| Area | Evidencia atual | Resultado | Observacao critica |
| --- | --- | --- | --- |
| Player Inicio | `mobile390-player-player-inicio-current.png` | Parcial | Visual curto e orientado por intencao, mas renderiza erro tecnico `Could not find the function public.app_list_my_place_staff_invites...`. |
| Player Locais | `mobile390-player-player-locais-current.png` | Aprovado com polish | Tela curta, intencoes claras, sem vazamento de gestao. Continua com 5 cards, mas a ordem faz sentido. |
| Player Locais por intencao | `mobile390-player-player-locais-reserva-current.png`, `...aula...`, `...jogo...` | Parcial | Fluxo melhorou, mas algumas buscas ainda registram erros de console. |
| Player Eventos | `mobile390-player-player-eventos-current.png` | Parcial | Separacao por papel melhorou, mas estado vazio ainda mostra pouco valor e teve erros de console no mobile. |
| Player Ranking | `mobile390-player-player-ranking-current.png`, `desktop1366-player-player-ranking-current.png` | Reprovado | Desktop tem 6.46 telas e 81 rows; mobile mostrou `0 jogadores encontrados`/`Carregando ranking`, divergente do desktop com 162 jogadores. |
| Player Perfil | `mobile390-player-player-perfil-current.png` | Aprovado | Ficou bem mais enxuto: 1 tela, 1 card, 3 rows. |
| Organizador Hub | `mobile390-organizer-organizer-eventos-current.png` | Aprovado com polish | Melhor separacao entre jogar e organizar. |
| Organizador Torneios | `mobile390-organizer-organizer-torneios-current.png` | Parcial | Reduziu densidade, mas ainda tem 3 zeros, filtros extensos e estado de loading. |
| Management Hub | `mobile390-manager-gestao-wait30.png`, `mobile390-frontdesk-gestao-wait30.png`, `mobile390-finance-gestao-wait30.png`, `mobile390-coach-gestao-wait30.png` | Parcial | Com 30s carrega fila e workspace por papel; sem espera longa parecia travado. Todos os perfis geraram 404/500 no console. |
| Player puro QA | `mobile390-purePlayer-auth-failed.png` | Bloqueado | Usuario documentado nao existe/nao autentica no Supabase alvo. |
| Caixa/POS QA | `desktop1366-cashier-auth-failed.png`, `mobile390-cashier-auth-failed.png` | Bloqueado | Usuario documentado nao existe/nao autentica no Supabase alvo. |

## Comparativo Com O Alvo

| Criterio programado | Situacao atual |
| --- | --- |
| Jogador comum sem excesso administrativo | Melhorou bastante em Inicio, Locais, Eventos e Perfil. |
| Fluxo por intencao no mobile | Melhorou em Locais; ainda precisa consolidar resultados e erros de console. |
| Menos cards e menos KPIs para jogador | Melhorou. Ranking ainda e excecao grande. |
| Nao mostrar erro tecnico cru | Falhou: Home exibe erro de RPC `app_list_my_place_staff_invites`. |
| Perfis demo puros validaveis | Falhou: pure player e cashier nao autenticam no Supabase alvo. |
| Gestao por papel | Passou visualmente apos espera longa, mas ainda com erros 404/500. |
| Mobile sem pagina infinita | Passou nos fluxos principais; Ranking desktop/mobile ainda exige rework. |
| Competition OS sem mistura com Player App | Passou no hub; lista de torneios organizados ainda precisa simplificacao. |

## Achados Criticos

### QA-CURRENT-P0-01 - Supabase alvo desalinhado com as migrations/seeds atuais

Evidencia:

- `qa.jogador.puro@demo.atp.local` falha com `Invalid login credentials`.
- `caixa.prime@demo.atp.local` falha com `Invalid login credentials`.
- Home do jogador mostra `Could not find the function public.app_list_my_place_staff_invites without parameters in the schema cache`.

Impacto:

- Nao da para validar corretamente separacao de jogador puro e caixa/POS.
- O usuario real ve erro tecnico cru em uma tela principal.
- O produto parece instavel mesmo quando a interface visual melhorou.

Acao recomendada:

- Aplicar migrations/seeds pendentes no Supabase alvo ou alinhar o ambiente usado nos testes.
- Confirmar existencia das RPCs de convites de equipe e dos usuarios QA.
- Reexecutar capturas apos o banco estar coerente.

### QA-CURRENT-P0-02 - Erro tecnico cru na Home do jogador

Evidencia:

- `desktop1366-player-player-inicio-current.txt`
- `mobile390-player-player-inicio-current.txt`

Texto exibido:

```text
Could not find the function public.app_list_my_place_staff_invites without parameters in the schema cache
```

Impacto:

- Quebra confianca imediatamente na tela inicial.
- Viola a regra de nao exibir SQL/backend cru.

Acao recomendada:

- Corrigir disponibilidade/assinatura da RPC no Supabase alvo.
- No frontend, tratar falha de convite como recurso opcional silencioso ou mensagem amigavel, nunca como texto bruto no corpo da Home.

### QA-CURRENT-P1-01 - Ranking continua fora do DNA leve do Player App

Evidencia:

- Desktop: 6.46 screenfuls, 8 superficies de card, 81 rows.
- Mobile: retorno divergente com `0 jogadores encontrados` e `Carregando ranking`.

Impacto:

- Para jogador comum, ainda parece tela de admin/relatorio.
- A divergencia desktop/mobile sugere problema de carregamento, filtro ou responsividade.

Acao recomendada:

- Reabrir `PLAYER-UX-06` como simplificacao real de Ranking.
- Primeira dobra deve ser `minha posicao`, `meu recorte` e `ver ranking completo`, com lista progressiva.

### QA-CURRENT-P1-02 - Lista de torneios organizados ainda tem ruido operacional

Evidencia:

- `mobile390-organizer-organizer-torneios-current.txt` mostra tres zeros e filtros longos antes de resultado.

Impacto:

- O organizador ainda precisa processar muita estrutura antes da acao.
- A tela melhorou, mas nao chegou ao padrao row/task-first.

Acao recomendada:

- Transformar filtros em sheet no mobile.
- Ocultar contadores zerados.
- Mostrar primeiro `rascunhos`, `inscricoes abertas`, `pendencias` ou estado vazio acionavel.

### QA-CURRENT-P1-03 - Management OS carrega, mas com erros de console recorrentes

Evidencia:

- Recaptura wait30 carregou todos os perfis.
- Cada perfil desktop/mobile gerou 2 erros 404 e 2 erros 500.

Impacto:

- Visualmente a tela nao trava, mas ha risco de dados incompletos, lentidao ou falha silenciosa.

Acao recomendada:

- Identificar endpoints/RPCs responsaveis pelos 404/500.
- Separar dados opcionais de dados de primeira dobra.
- Registrar falhas tecnicas sem poluir UI.

## O Que Evoluiu De Verdade

- Player Home esta muito mais proxima de um app moderno: uma pergunta clara, quatro intencoes, sem dashboard administrativo.
- Locais deixou de parecer catalogo generico e passou a funcionar por intencao: reservar, jogar, aula ou ver locais.
- Perfil ficou muito mais leve e com menos blocos desnecessarios.
- Competition Hub separa melhor jogador e organizador.
- Management Hub, com carregamento completo, mostra fila do dia antes de KPIs e respeita melhor papeis operacionais.

## O Que Ainda Parece Complexo Ou Fragil

- Ranking ainda parece produto de power user, nao necessidade primaria do jogador comum.
- Torneios organizados ainda carregam uma camada de filtros/zeros que remete ao produto antigo.
- O ambiente de dados nao acompanha a documentacao, entao a evolucao de perfis nao pode ser validada com seguranca.
- Erros tecnicos ainda aparecem ou ficam no console em telas de alto trafego.

## Validacao Executada Nesta Rodada

- Servidor local Vite em `127.0.0.1:5181`.
- Prints refeitos com Playwright em:
  - desktop 1366px;
  - mobile 390px.
- Perfis autenticados:
  - `jogador001@demo.atp.local`;
  - `organizador.circuito@demo.atp.local`;
  - `prof.renato@demo.atp.local`;
  - `recepcao.dourados@demo.atp.local`;
  - `gerente.dourados@demo.atp.local`;
  - `financeiro.prime@demo.atp.local`.
- Perfis bloqueados por credencial inexistente/invalida:
  - `qa.jogador.puro@demo.atp.local`;
  - `caixa.prime@demo.atp.local`.
- Recaptura extra de `/gestao` com 30 segundos de espera para diferenciar loading real de captura precoce.
- `npm.cmd run lint`.
- `npm.cmd run build`.

## Proxima Acao Recomendada

Antes de continuar polindo visual, corrigir/alinhar o ambiente:

1. aplicar migrations/seeds pendentes no Supabase alvo;
2. garantir que RPCs de convite de equipe existem com a assinatura usada pelo frontend;
3. validar login de jogador puro e caixa/POS;
4. reexecutar os prints de `Inicio`, `Gestao` e `Cantina/POS`;
5. depois seguir com simplificacao de Ranking e lista de torneios organizados.
