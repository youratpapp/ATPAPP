# Work SaaS Perfect SaaS Change Queue - 2026-05-21

## Objetivo

Esta queue nasce da auditoria pagina a pagina feita em `WORK_SAAS_PAGE_BY_PAGE_AUDIT_2026_05_21.md`.

Ela separa:

- P0: defeitos estruturais seguros para corrigir agora;
- P1: melhorias de produto que exigem desenho de fluxo;
- P2: arquitetura de SaaS para escala.

## P0 - Corrigido Nesta Rodada

Validacao P0:

- `npm.cmd run lint`: passou.
- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run build`: passou.
- Rechecagem visual focada: `docs/screenshots/page-by-page-saas-audit-p0-recheck-2026-05-21`.
- Console na rechecagem focada: 0 eventos de erro/warning.

### SAAS-P0-01 - Menu deve respeitar unidade ativa

Objetivo: evitar que a sidebar mostre modulos que existem na unidade primaria, mas nao na unidade aberta.

Arquivos:

- `src/lib/workspace-access.ts`
- `src/components/BottomNav.tsx`

Alterado:

- `WorkspaceAccessSummary` agora carrega `placeModulesById`.
- `BottomNav` calcula visibilidade por `activePlaceId` quando a rota e `/gestao/:placeId`.

Aceite:

- Usuario com mais de uma academia nao ve modulo proibido/inexistente na unidade aberta.
- Rotas antigas continuam funcionando.
- Permissoes nao foram relaxadas.

### SAAS-P0-02 - Active state deve diferenciar query string

Objetivo: impedir dois menus ativos na mesma pagina quando a diferenca real esta em `?visao=...`.

Arquivo:

- `src/components/BottomNav.tsx`

Alterado:

- `isActiveNavItem` passa a comparar `pathname + search`.
- Item com query so ativa com query exata.

Aceite:

- `Calendario` e `Reservas` nao ficam ativos juntos.
- Rotas sem query continuam funcionando.

### SAAS-P0-03 - Competicao em modo trabalho deve usar nav de Competition OS

Objetivo: impedir que torneio/liga operacional mostre nav de local/academia.

Arquivo:

- `src/components/BottomNav.tsx`

Alterado:

- Rotas `/eventos...` em modo trabalho usam itens de competicao.

Aceite:

- Mobile do torneio operacional nao exibe `Agenda/Aulas/Receita` de local.
- Organizador ve `Hoje/Torneios/Ligas/Publicacao/Perfil`.
- Jogador em `/eventos` continua com nav de Player App.

### SAAS-P0-04 - Local publico precisa de H1 real

Objetivo: alinhar semantica e auditoria da pagina publica do local.

Arquivos:

- `src/pages/PlacePublicPage.tsx`
- `src/App.css`

Alterado:

- Nome do local no hero passou de `h2` para `h1`.
- CSS preserva a aparencia do hero.

Aceite:

- Auditoria deve encontrar H1 em `#/locais/:id`.
- Visual permanece igual.

## P1 - Proxima Sprint Recomendada

### SAAS-P1-01 - SaaS Web Shell profissional

Problema: a area web trabalho ainda parece uma colecao de telas com menu lateral, nao uma plataforma SaaS completa.

Proposta:

- Topbar com selector de unidade mais claro.
- Breadcrumbs por dominio e entidade.
- Busca global.
- Area de contexto: unidade ativa, papel ativo e modulo.
- Sidebar por dominios fixos, nao por arvore infinita.

Modulos alvo:

- Operacao
- Agenda e Quadras
- Academia
- Pessoas
- Financeiro
- Competicoes
- Equipe
- Configuracao
- Relatorios

### SAAS-P1-02 - Trabalho Hoje como fila real

Problema: ainda ha muitos elementos clicaveis e muita informacao concorrendo.

Proposta:

- Primeira dobra mostra ate 3 bloqueios reais.
- Cada card tem uma acao primaria.
- Numeros secundarios descem para resumo.
- Setup raro fica fora.

### SAAS-P1-03 - Cockpit de torneio mobile por fase

Problema: torneio operacional no mobile ainda e longo e denso.

Proposta:

- Hero da fase com bloqueio principal.
- Um CTA dominante.
- Abas antigas viram "Mais" ou camadas de detalhe.
- Scorekeeper ve jogos/resultados; media ve comunicacao; check-in ve inscritos.

### SAAS-P1-04 - Modal/painel de aluno responsivo

Problema: detalhe de aluno pode abrir com scroll/resize ruim em telas menores.

Proposta:

- Desktop: painel lateral ou modal com `max-height: calc(100vh - header)`.
- Mobile: sheet full screen.
- Acoes principais fixas no rodape do painel.

### SAAS-P1-05 - Academia sem chamada por padrao

Problema: fluxo de chamada nao faz sentido como obrigatorio para tenis.

Proposta:

- Configuracao da empresa: `exigir chamada do professor`.
- Padrao: desligado.
- Quando desligado, aula mostra agenda, turma, alunos, reposicoes e observacoes; chamada fica oculta.

### SAAS-P1-06 - Reservas com alteracao e WhatsApp contextual

Problema: comunicacao e alteracao de horario ainda nao estao em um fluxo completo.

Proposta:

- Reserva confirmada mediante pagamento quando pagamento existir.
- Admin/secretaria/gerente podem editar manualmente.
- Jogador altera por link seguro para agenda disponivel.
- WhatsApp serve para cancelar, reagendar ou avisar situacao.
- Mensagem inclui cliente, academia, operador, motivo e proximos horarios.

### SAAS-P1-07 - Pessoas/Clientes como CRM operacional

Problema: contatos, socios, alunos e clientes aparecem misturados.

Proposta:

- Pessoas: cadastro unico.
- Relacionamentos: aluno, socio, jogador, responsavel, lead.
- Timeline: reservas, aulas, pagamentos, atendimentos.
- Acoes: cobrar, matricular, reservar, enviar mensagem.

### SAAS-P1-08 - Financeiro completo e preparado para pagamento real

Problema: financeiro ainda e modulo inicial.

Proposta:

- Recebiveis
- Pagos
- Vencidos
- Despesas
- Planos/mensalidades
- Reserva/pagamento
- Modal unico de pagamento simulado: valor + pagar/marcar pago
- Futuro: gateway e split.

## P2 - Arquitetura Para Escala

### SAAS-P2-01 - Multiunidade madura

Necessario:

- selector global de unidade;
- visao grupo;
- visao por unidade;
- permissoes por unidade;
- relatorios consolidados.

### SAAS-P2-02 - Relatorios SaaS

Necessario:

- relatorios operacionais;
- financeiros;
- academia;
- reservas;
- competicoes;
- exportacao.

### SAAS-P2-03 - Auditoria e historico

Necessario:

- quem alterou reserva;
- quem marcou pagamento;
- quem alterou resultado;
- quem editou aluno;
- timeline por entidade.

### SAAS-P2-04 - Automacoes

Necessario:

- lembrete de pagamento;
- lembrete de partida;
- aviso de aula;
- follow-up de lista de espera;
- comunicacao de torneio.

## Ordem Recomendada

1. Fechar P0 com validacao visual focada.
2. Implementar SaaS Web Shell.
3. Reestruturar Trabalho Hoje.
4. Reestruturar Academia e Alunos.
5. Reestruturar Reservas/Agenda/WhatsApp.
6. Reestruturar Pessoas/CRM.
7. Reestruturar Financeiro.
8. Reestruturar Cockpit de competicoes mobile.
9. Adicionar relatorios e auditoria.

## Regra Para Proximas Rodadas

Nao adicionar mais submenu para resolver confusao. Se uma funcao esta dificil de achar, a resposta deve ser rever dominio, entidade, tarefa primaria e contexto, nao criar mais uma camada de navegacao.

## Achados Dos Testes Reais De Uso - 2026-05-21

Relatorio de base:

- `WORK_SAAS_REAL_USER_FLOW_TEST_REPORT_2026_05_21.md`

Evidencias:

- `docs/screenshots/real-use-tournament-flow-2026-05-21`
- `docs/screenshots/real-use-league-flow-2026-05-21`
- `docs/screenshots/real-use-academy-flow-recheck-2026-05-21`
- `docs/screenshots/real-use-communication-flow-2026-05-21`

### SAAS-RUF-01 - Cockpit mobile de torneio/liga por fase

Problema: torneio e liga funcionam ponta a ponta, mas o mobile operacional ainda concentra fase, indicadores, tabs, chat, podio, jogos e organizacao na mesma camada.

Destino: P1.

Aceite:

- primeira dobra mostra bloqueio da fase e CTA dominante;
- chat/historico/podio/classificacao nao competem com a proxima tarefa operacional;
- labels de tabs nao truncam em 390px;
- bottom nav nao encobre a area de acao principal.

### SAAS-RUF-02 - Agrupar convites profissionais no Trabalho Hoje

Problema: professor com varias unidades/testes pode ver muitos convites profissionais repetidos na primeira tela.

Destino: P1.

Aceite:

- maximo 1 bloco compacto de convites na primeira dobra;
- convites agrupados por unidade/recencia;
- CTA claro para aceitar/recusar ou abrir central de convites;
- aulas do dia continuam com prioridade maior que convite antigo.

### SAAS-RUF-03 - Reagendamento de reserva com WhatsApp e link seguro

Problema: comunicacao de troca/cancelamento existe como direcao, mas ainda falta fluxo completo de reagendamento.

Destino: P1.

Aceite:

- admin/secretaria/manager podem editar reserva manualmente;
- jogador recebe WhatsApp com mensagem profissional e link seguro;
- link abre agenda disponivel para escolher novo horario;
- pagamento ja feito continua vinculado;
- lista de espera nao permite criar reserva em horario ja ocupado sem escolher alternativa.

### SAAS-RUF-04 - Semantica de regra de reserva

Problema: regras antigas como `requires_approval` podem conflitar com o modelo atual de reserva mediante pagamento.

Destino: P1/P2, depende de migracao.

Aceite:

- confirmacao manual nao aparece como etapa padrao;
- regras distinguem pagamento, aprovacao excepcional e lista de espera;
- UI e dados usam a mesma linguagem.

### SAAS-RUF-05 - Politica de screenshots de QA

Problema: testes reais geraram aproximadamente 152 MB de evidencias em uma rodada.

Destino: P1 operacional.

Aceite:

- definir quais pastas de screenshot sao baseline;
- arquivar ou limpar rodadas temporarias;
- manter diagnostics JSON mesmo quando PNGs antigos forem removidos;
- evitar crescimento descontrolado em `docs/screenshots`.

## Sprint RUF - 2026-05-22

Base:

- `WORK_SAAS_REAL_USER_FLOW_TEST_REPORT_2026_05_21.md`
- `docs/screenshots/real-use-pending-fixes-recheck-owner-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-recheck-coach-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-final-recheck-owner-2026-05-22`
- `docs/screenshots/real-use-pending-fixes-final-recheck-coach-2026-05-22`

### Status Dos Itens

| Item | Status | O que foi feito | Pendencia residual |
| --- | --- | --- | --- |
| SAAS-RUF-01 | Parcialmente resolvido | Cockpit e tabs de competicao mobile ficaram mais compactos; labels compactos; bottom nav de liga nao duplica active state. | Evolucao futura: transformar tabs secundarias em sheet/mais por fase. |
| SAAS-RUF-02 | Resolvido | Convites profissionais agrupados; workspaces do professor limitados com `Ver mais locais`; removida duplicidade de lista generica para coach-only. | Nenhuma pendencia bloqueante. |
| SAAS-RUF-03 | Parcialmente resolvido | Confirmado fluxo existente de edicao manual, WhatsApp com link unico e mensagem profissional; copy de pagamento/reagendamento alinhada. | Rerodar e2e dedicado do link publico de reagendamento como jogador. |
| SAAS-RUF-04 | Parcialmente resolvido | UI agora fala `pagamento direto` e `revisao manual excepcional`; novas regras default nao exigem revisao. | Migracao nominal futura se o banco trocar `requires_approval` por politica explicita. |
| SAAS-RUF-05 | Resolvido | Politica de arquivo de screenshots documentada e evidencias reais catalogadas. | Aplicar limpeza/arquivamento quando a pasta de screenshots virar baseline. |

### Arquivos Alterados Nesta Sprint

- `src/components/competition/CompetitionWorkspace.tsx`
- `src/pages/TournamentPage.tsx`
- `src/pages/LeagueDetailsPage.tsx`
- `src/pages/ManagementHubPage.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/PlacesPage.tsx`
- `src/components/place/PlaceBookingCreateModule.tsx`
- `src/components/place/PlaceBookingResourcesModule.tsx`
- `src/lib/bookingWhatsapp.ts`
- `src/App.css`
- `docs/WORK_SAAS_REAL_USER_FLOW_TEST_REPORT_2026_05_21.md`
- `docs/WORK_SAAS_SCREENSHOT_ARCHIVE_POLICY_2026_05_21.md`

### Criterios De Aceite Rechecados

- Mobile 390 de liga owner nao gera erro de console.
- Mobile 430 de liga owner nao gera erro de console.
- Desktop 1366 de liga owner nao gera erro de console.
- Mobile 390 de professor nao gera erro de console.
- Mobile 430 de professor nao gera erro de console.
- Desktop 1366 de professor nao gera erro de console.
- Professor ve trabalho diario antes de convites antigos.
- Liga em modo trabalho nao marca `Ligas` e `Publicacao` ao mesmo tempo.
- Labels longos de tabs nao estouram em 390px.
- Reserva continua orientada por pagamento, nao por confirmacao manual padrao.

### Validacao Tecnica

- `npx.cmd tsc -b --pretty false`: passou.
- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.
