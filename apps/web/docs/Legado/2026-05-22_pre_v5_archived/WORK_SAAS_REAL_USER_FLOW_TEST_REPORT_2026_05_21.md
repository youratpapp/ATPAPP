# Work SaaS Real User Flow Test Report - 2026-05-21

## Objetivo

Executar testes reais de uso com usuarios seed, cobrindo fluxos completos de torneio, liga, academia, reservas, equipe, alunos, financeiro e comunicacao.

Este relatorio nao e uma auditoria visual abstrata. Ele registra jornadas exercitadas no app, com dados criados no banco demo, navegacao por UI, screenshots, console e diagnosticos.

## Ambiente

- App: `http://127.0.0.1:5173/`
- Banco: Supabase remoto de demo configurado em `.env.local`
- Navegador: Chrome via CDP/headless
- Viewports exercitados: desktop 1366, mobile 390, mobile 430 em pontos criticos
- Console: capturado nos diagnosticos dos scripts
- Rede: falhas de request capturadas nos diagnosticos dos scripts

## Usuarios Seed Exercitados

- Owner/admin: `escalao@gmail.com`
- Jogadores competitivos: `jogador011@demo.atp.local` a `jogador014@demo.atp.local`
- Alunos/reservas: `jogador031@demo.atp.local` a `jogador036@demo.atp.local`
- Professor: `prof.renato@demo.atp.local`
- Professor: `prof.lais@demo.atp.local`
- Recepcao: `recepcao.dourados@demo.atp.local`
- Financeiro: `financeiro.prime@demo.atp.local`

## Evidencias Geradas

| Fluxo | Pasta | PNGs | Tamanho | Status |
| --- | --- | ---: | ---: | --- |
| Torneio real ponta a ponta | `docs/screenshots/real-use-tournament-flow-2026-05-21` | 20 | 17.56 MB | Passou |
| Liga real ponta a ponta | `docs/screenshots/real-use-league-flow-2026-05-21` | 25 | 20.49 MB | Passou |
| Academia primeira rodada | `docs/screenshots/real-use-academy-flow-2026-05-21` | 40 | 54.68 MB | Script antigo cobrou regras ja mudadas |
| Academia rechecagem | `docs/screenshots/real-use-academy-flow-recheck-2026-05-21` | 40 | 54.25 MB | Passou |
| Comunicacao real | `docs/screenshots/real-use-communication-flow-2026-05-21` | 8 | 5.39 MB | Passou |

## Resultado Geral

Os fluxos funcionais principais passaram:

- criar torneio;
- criar pedidos de inscricao por dados seed;
- aprovar inscricoes por UI;
- gerar jogos por UI;
- enviar resultado como jogador;
- aplicar resultado como admin;
- lancar placar manual como admin;
- aplicar WO como admin;
- finalizar torneio;
- criar liga;
- aprovar participantes;
- gerar rodada;
- enviar resultado como participante;
- confirmar resultado como adversario;
- resolver partida restante como owner;
- aplicar movimentacoes da liga;
- criar academia;
- criar quadras;
- criar professores;
- aceitar vinculos profissionais;
- criar turmas;
- matricular alunos;
- ativar contrato pendente;
- criar reserva;
- criar lista de espera;
- validar trabalho por professor, recepcao, financeiro e aluno;
- enviar comunicacoes em torneio e liga.

Nao houve erro de console de app, erro de pagina ou failed request nos fluxos finais. Os logs capturados foram apenas mensagens de desenvolvimento do Vite/devtools.

## Fluxo 1 - Torneio

### Dados Criados

- Torneio: `ATP Open Dourados 031141`
- ID: `ff8bd9e5-956d-444b-a5a5-6c6e91f9dca6`
- Inscritos seed:
  - Karina Queiroz
  - Lucas Yamamoto
  - Mariana Almeida
  - Nicolas Henrique

### Jornada Testada

1. Owner cria torneio.
2. Pedidos de inscricao sao criados para usuarios seed.
3. Owner aprova inscricoes na UI.
4. Owner encerra inscricoes e gera jogos.
5. Jogador entra e envia resultado.
6. Owner aplica resultado enviado.
7. Owner lanca placar manual em outra partida.
8. Owner aplica WO.
9. Owner finaliza torneio.

### Diagnostico

- `completed: true`
- `pageErrors: 0`
- `failedRequests: 0`

### UX Observada

- O fluxo funciona de ponta a ponta.
- A area operacional de torneio ainda fica densa no mobile quando a competicao chega ao fim.
- A linha de abas/botoes do cockpit em mobile pode competir com a bottom nav em screenshots longos.
- A tela precisa manter um unico bloco dominante por fase no mobile; historico, podio e chat devem ficar em camada secundaria quando nao forem a proxima tarefa.

## Fluxo 2 - Liga

### Dados Criados

- Liga: `Liga ATP Dourados 031501`
- ID: `cd0289a5-edae-45a4-8ef1-17a2aa443bbb`
- Participantes seed:
  - Karina Queiroz
  - Lucas Yamamoto
  - Mariana Almeida
  - Nicolas Henrique

### Jornada Testada

1. Owner cria liga.
2. Pedidos de inscricao sao criados para usuarios seed.
3. Owner aprova participantes.
4. Owner gera rodada.
5. Jogador informa resultado.
6. Adversario confirma resultado.
7. Owner resolve partida restante.
8. Owner aplica movimentacoes da temporada.

### Diagnostico

- `completed: true`
- `pageErrors: 0`
- `failedRequests: 0`

### UX Observada

- O fluxo funcional passou.
- Mobile owner de liga ainda mostra abas com labels apertados/truncados.
- A experiencia de owner precisa priorizar rodada ativa, pendencias e CTA da fase antes de exibir historico ou classificacao completa.

## Fluxo 3 - Academia, Quadras, Professores, Alunos e Reservas

### Dados Criados

- Academia: `ATP Centro Dourados 0522033757`
- ID: `b2440482-06a8-4bf1-b149-b623c2e2cb38`
- Quadras:
  - Quadra 1, hard
  - Quadra 2, saibro
  - Quadra 3, sintetica
- Professores:
  - Renato Siqueira
  - Lais Monteiro
- Staff aceito:
  - Renato como coach
  - Lais como coach
  - Recepcao Dourados como frontdesk
  - Financeiro Prime como finance
- Turmas:
  - Adulto Intermediario
  - Kids Iniciante
- Alunos/contratos:
  - Helena Uchida
  - Igor Barbosa
  - Juliana Ishikawa
  - Leonardo Pereira
- Reserva:
  - Manuela Xavier, Quadra 3, status `pending`
- Lista de espera:
  - Otavio Jardim, mesmo horario da reserva

### Jornada Testada

1. Owner acessa Trabalho Hoje.
2. Owner acessa painel da academia.
3. Owner valida ajustes/checklist.
4. Owner acessa calendario de quadras.
5. Owner acessa reservas.
6. Owner valida reserva pendente com estado de pagamento.
7. Owner valida lista de espera com acao de WhatsApp/aviso.
8. Owner acessa academia.
9. Owner valida professores, grade, alunos, aulas do dia e pendencias.
10. Owner acessa financeiro.
11. Owner acessa clientes.
12. Professor acessa Trabalho Hoje e Academia.
13. Recepcao acessa Trabalho Hoje e fluxo de nova reserva.
14. Financeiro acessa Trabalho Hoje e recebiveis.
15. Aluno acessa home, agenda, aulas, pagamentos e pagina publica do local.
16. Jogador acessa minhas reservas e fluxo de reservar no local.

### Diagnostico

- Primeira rodada:
  - `completed: true`
  - `flowIssues: 3`
  - Motivo: script ainda esperava confirmacao manual de reserva e chamada obrigatoria.
- Rechecagem:
  - `completed: true`
  - `flowIssues: 0`
  - `pageErrors: 0`
  - `failedRequests: 0`

### Decisao de Produto Confirmada

O fluxo correto atual e:

- reserva fica vinculada a pagamento, nao a confirmacao manual extra;
- WhatsApp entra para cancelamento, troca, reagendamento ou lista de espera;
- chamada de aula nao e obrigatoria por padrao;
- quando chamada estiver habilitada no futuro, deve ser configuracao da empresa.

### UX Observada

- A reserva pendente ficou coerente: `Aguardando pagamento`, `Sem pagamento`, `Editar`, `Avisar troca`.
- O fluxo de espera ja tem a ideia certa de comunicacao, mas precisa melhorar a jornada de reagendamento.
- Professor em mobile recebeu varios convites profissionais pendentes de testes/unidades diferentes; isso polui a primeira tela e precisa ser agrupado ou filtrado por unidade/recencia.
- O modal/painel de aluno ainda e um ponto critico em telas pequenas e deve continuar na queue como painel responsivo ou sheet mobile.
- A agenda/calendario precisa consolidar reserva e aula sem criar submenus duplicados.

## Fluxo 4 - Comunicacao

### Jornada Testada

1. Owner envia comunicado no torneio.
2. Owner envia mensagem normal no chat do torneio.
3. Jogador envia mensagem no chat do torneio.
4. Owner envia comunicado na liga.
5. Owner envia mensagem normal no chat da liga.
6. Jogador envia mensagem no chat da liga.

### Diagnostico

- `completed: true`
- `flowIssues: 0`
- `pageErrors: 0`
- `failedRequests: 0`

### UX Observada

- Comunicacao funciona.
- Em competicoes, comunicacao deve continuar contextual ao torneio/liga, mas o cockpit mobile nao deve exibir chat como concorrente da tarefa principal quando houver pendencia operacional.

## Correcoes Feitas Nos Scripts

### `scripts/academy-e2e-flow-audit.mjs`

- Removeu expectativa antiga de CTA `Confirmar` para reserva pendente.
- Passou a validar estado de pagamento + acoes `Editar` e `Avisar troca`/WhatsApp.
- Removeu expectativa de chamada obrigatoria.
- Passou a validar que `Abrir aula` funciona sem exigir `Fazer chamada`/`Presente`.
- Limpou copy seed antiga que mencionava chamada como rotina.

### `scripts/communication-e2e-flow-audit.mjs`

- Novo script para exercitar comunicacao real em torneio e liga.
- Inclui owner e jogador seed.
- Captura screenshots, console, failed requests e flow issues.

## Bugs Funcionais Encontrados

Nos fluxos finais rechecados, nao houve bug funcional bloqueante.

O erro inicial da academia era do proprio teste automatizado, que estava cobrando uma regra anterior do produto. O app atual esta mais alinhado com a decisao: reserva via pagamento e chamada desligada por padrao.

## Problemas de UX Ainda Reais

### RUF-UX-01 - Cockpit de competicao denso no mobile

Problema:

- Torneio e liga funcionam, mas a tela mobile de operacao ainda concentra muitas camadas: fase, indicadores, tabs, chat, organizacao, podio/jogos/classificacao.

Impacto:

- Staff consegue operar, mas precisa rolar e interpretar demais.

Proposta:

- Mobile deve mostrar primeiro a pendencia da fase + CTA.
- Abas nao criticas entram em `Mais` ou accordion contextual.
- Chat aparece como badge/atalho quando nao for o foco da fase.

### RUF-UX-02 - Tabs de liga truncadas no mobile

Problema:

- Labels longos de tabs ficam apertados em 390px.

Impacto:

- Owner entende menos claramente onde esta.

Proposta:

- Usar segmented control compacto por fase: `Rodada`, `Tabela`, `Jogos`, `Mais`.

### RUF-UX-03 - Convites profissionais repetidos no Trabalho Hoje do professor

Problema:

- Usuario professor com varios testes/unidades recebe varios convites na primeira tela.

Impacto:

- O que e tarefa diaria fica misturado com pendencia administrativa repetida.

Proposta:

- Agrupar convites por unidade.
- Mostrar no maximo 1 bloco compacto com contador.
- Enviar convites antigos para `Perfil profissional` ou `Equipe`.

### RUF-UX-04 - Reserva e lista de espera precisam de reagendamento mais claro

Problema:

- `Avisar troca` e WhatsApp existem como direcao, mas ainda falta jornada completa de reagendamento.

Proposta:

- Admin/secretaria edita manualmente.
- Jogador recebe link seguro para escolher novo horario na agenda.
- Mensagem WhatsApp inclui academia, operador, reserva atual, motivo e link de escolha.

### RUF-UX-05 - Dados de regra de reserva ainda podem confundir

Problema:

- Dataset de teste criou `requires_approval: true`, mas a UI correta ja opera como pagamento/pendencia.

Impacto:

- Futuras leituras de regra podem reacender confirmacao manual.

Proposta:

- Renomear ou migrar semantica: `requires_payment`, `payment_policy` ou `reservation_confirmation_policy`.
- Se `requires_approval` continuar, deve significar apenas fluxo excepcional configuravel.

### RUF-UX-06 - Peso dos screenshots precisa de politica de arquivo

Problema:

- A rodada gerou aproximadamente 152 MB de evidencias.

Proposta:

- Manter ultimas evidencias criticas.
- Compactar ou arquivar rodadas antigas.
- Evitar commitar screenshots temporarios que nao forem baseline.

## Recomendacao de Proxima Sprint

1. Corrigir cockpit mobile de torneio/liga para uma experiencia por fase mais enxuta.
2. Agrupar convites profissionais no Trabalho Hoje.
3. Finalizar fluxo de reagendamento de reserva com WhatsApp + link seguro.
4. Consolidar calendario operacional como destino principal de agenda/aulas/reservas.
5. Ajustar painel de aluno responsivo.
6. Revisar semantica de regra de reserva para nao voltar ao modelo de confirmacao extra.

## Validacao Tecnica Da Rodada

- `npm.cmd run lint`: passou.
- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run build`: passou.
- Scripts novos/atualizados:
  - `scripts/academy-e2e-flow-audit.mjs`
  - `scripts/communication-e2e-flow-audit.mjs`

## Comandos Executados

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_TOURNAMENT_FLOW_OUT_DIR='docs/screenshots/real-use-tournament-flow-2026-05-21';
node scripts/tournament-e2e-flow-audit.mjs
```

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_LEAGUE_FLOW_OUT_DIR='docs/screenshots/real-use-league-flow-2026-05-21';
node scripts/league-e2e-flow-audit.mjs
```

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_ACADEMY_FLOW_OUT_DIR='docs/screenshots/real-use-academy-flow-2026-05-21';
node scripts/academy-e2e-flow-audit.mjs
```

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_ACADEMY_FLOW_OUT_DIR='docs/screenshots/real-use-academy-flow-recheck-2026-05-21';
node scripts/academy-e2e-flow-audit.mjs
```

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_COMM_FLOW_OUT_DIR='docs/screenshots/real-use-communication-flow-2026-05-21';
$env:ATP_COMM_TOURNAMENT_ID='ff8bd9e5-956d-444b-a5a5-6c6e91f9dca6';
$env:ATP_COMM_LEAGUE_ID='cd0289a5-edae-45a4-8ef1-17a2aa443bbb';
node scripts/communication-e2e-flow-audit.mjs
```

## Sprint De Correcoes Das Pendencias RUF - 2026-05-22

Esta sprint atacou as pendencias encontradas nos testes reais, sem alterar backend nem relaxar permissoes.

### RUF-UX-01 / RUF-UX-02 - Cockpit Mobile De Competicao

Alterado:

- tabs de torneio e liga ganharam labels compactos no mobile;
- a barra de tabs passou a quebrar em grid de 2 colunas em 390px/430px;
- indicadores do cockpit foram compactados;
- bottom nav de liga em modo trabalho deixou de marcar `Publicacao` junto com `Ligas`;
- acoes internas permanecem no detalhe da competicao, mas sem truncamento de label.

Evidencia:

- `docs/screenshots/real-use-pending-fixes-recheck-owner-2026-05-22/mobile-390-league-owner.png`
- `docs/screenshots/real-use-pending-fixes-final-recheck-owner-2026-05-22`
- diagnostics: 0 eventos.

Observacao:

- ainda existe densidade natural no detalhe operacional de competicao finalizada. A solucao aplicada reduz conflito visual e duplicidade de active state, mas a evolucao ideal futura e transformar tabs secundarias em sheet/mais contextual por fase.

### RUF-UX-03 - Convites E Workspaces Do Professor

Alterado:

- convites profissionais agora aparecem em bloco compacto, com ate 3 itens visiveis e restante em `Ver mais`;
- workspaces de professor ficaram limitados inicialmente, com botao `Ver mais locais`;
- a lista generica `Locais sob sua gestao` foi ocultada no hub coach-only para nao duplicar o mesmo fluxo;
- aulas do dia, proxima aula, reposicoes e alunos continuam acima de convites antigos.

Evidencia:

- `docs/screenshots/real-use-pending-fixes-recheck-coach-2026-05-22/mobile-390-coach-management-home.png`
- `docs/screenshots/real-use-pending-fixes-final-recheck-coach-2026-05-22`
- diagnostics: 0 eventos.

### RUF-UX-04 - Reserva, WhatsApp E Reagendamento

Estado atual confirmado no codigo:

- gestao pode editar manualmente reserva em `PlaceBookingReservationsModule`;
- `onShareBookingChange` cria `booking_change_request` e abre WhatsApp com link unico;
- mensagem inclui academia, remetente, cliente, reserva atual e instrucao para escolher horario livre;
- `bookingWhatsappHref` aceita `changeUrl` e explica que a alteracao mantem pagamento original;
- lista de espera usa WhatsApp com alternativas proximas quando o horario solicitado esta ocupado.

Alterado nesta sprint:

- copy e semantica visual foram alinhadas para `Reserva mediante pagamento` e `Revisao manual excepcional`;
- regra default de nova quadra passou a nao exigir revisao manual;
- textos de recurso de quadra deixaram de sugerir confirmacao manual como caminho padrao.

Pendente controlado:

- rerodar uma jornada e2e especifica de link de reagendamento como jogador depois que a tela publica de confirmacao for tratada como baseline de QA.

### RUF-UX-05 - Semantica De Regra De Reserva

Alterado:

- UI passou a diferenciar `pagamento direto` de `revisao manual`;
- `requiresApproval` permanece por compatibilidade, mas a linguagem do produto deixa claro que aprovacao e excecao operacional, nao etapa padrao;
- a descoberta publica de quadras comunica reserva mediante pagamento.

Pendente futuro:

- migracao nominal de dados para `reservationConfirmationPolicy` ou equivalente, caso a tabela seja reestruturada.

### RUF-UX-06 - Politica De Evidencias

Alterado:

- criado/atualizado `WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md`;
- registradas pastas de evidencia real, tamanho aproximado e regra para manter diagnostics mesmo quando PNG antigo for arquivado.

### Validacao Focada Desta Sprint

Comandos:

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_EMAIL='escalao@gmail.com';
$env:ATP_PASSWORD='Escalao@2026!';
$env:ATP_AUDIT_OUT_DIR='docs/screenshots/real-use-pending-fixes-recheck-owner-2026-05-22';
$env:ATP_AUDIT_ROUTES_JSON='[{"slug":"league-owner","hash":"#/eventos/ligas/cd0289a5-edae-45a4-8ef1-17a2aa443bbb?mode=work"}]';
$env:ATP_AUDIT_CUSTOM_VIEWPORTS_JSON='[{"name":"mobile-390","width":390,"height":844,"deviceScaleFactor":2,"mobile":true}]';
$env:ATP_AUDIT_VIEWPORTS='mobile-390';
node scripts/capture-visual-audit.mjs
```

```powershell
$env:APP_URL='http://127.0.0.1:5173/';
$env:ATP_EMAIL='prof.lais@demo.atp.local';
$env:ATP_PASSWORD='Staff@2026!';
$env:ATP_AUDIT_OUT_DIR='docs/screenshots/real-use-pending-fixes-recheck-coach-2026-05-22';
$env:ATP_AUDIT_ROUTES_JSON='[{"slug":"coach-management-home","hash":"#/gestao"}]';
$env:ATP_AUDIT_CUSTOM_VIEWPORTS_JSON='[{"name":"mobile-390","width":390,"height":844,"deviceScaleFactor":2,"mobile":true}]';
$env:ATP_AUDIT_VIEWPORTS='mobile-390';
node scripts/capture-visual-audit.mjs
```

Resultado:

- rechecagem owner em mobile 390, mobile 430 e desktop 1366: 0 eventos;
- rechecagem professor em mobile 390, mobile 430 e desktop 1366: 0 eventos.

Validacao tecnica:

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.
