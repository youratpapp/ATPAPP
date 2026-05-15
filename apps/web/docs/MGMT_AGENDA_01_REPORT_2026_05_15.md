# MGMT-AGENDA-01 Report

Data: 2026-05-15

## Objetivo

Consolidar `Gestao > Agenda` como rotina operacional de reservas, disponibilidade, bloqueios, espera e quadras/regras, reduzindo empilhamento e removendo limites silenciosos.

## Entregue

- Fila urgente de reservas pendentes/lista de espera agora fica dentro da `Central de agenda`, depois da subnav.
- `Hoje` passou de cards passivos para rows acionaveis com status, pagamento, telefone, serie e acoes reais.
- `Reservas` ganhou busca por jogador/telefone/quadra, filtro por data/status e lista completa sem `slice`.
- `Espera` ganhou busca, filtro por data/status e lista completa sem `slice`.
- `Convidar` foi renomeado para `Marcar convidado`, pois a acao atual apenas muda status interno.
- `Calendario` permite iniciar `Nova reserva` por slot livre e abrir a lista de reservas a partir de slot ocupado de reserva/bloqueio.
- `Nova reserva` mostra `Bloquear horario` e `Entrar na espera` como acoes secundarias visiveis; observacao/repeticao ficam progressivas.
- KPIs da Agenda ficam depois da rotina principal, como suporte.

## Arquivos Alterados

- `web/src/components/place/PlaceBookingTodayModule.tsx`
- `web/src/components/place/PlaceBookingReservationsModule.tsx`
- `web/src/components/place/PlaceBookingWaitlistModule.tsx`
- `web/src/components/place/PlaceBookingOperationalQueues.tsx`
- `web/src/components/place/PlaceBookingCalendarModule.tsx`
- `web/src/components/place/PlaceBookingCreateModule.tsx`
- `web/src/pages/PlacesPage.tsx`
- `web/src/App.css`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/AGENDA_MODULE_FUNCTION_MAP.md`
- `web/docs/MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- `web/docs/SCREEN_RESPONSIBILITIES.md`

## Impacto UX/Produto

- Recepcao/gestor encontram pendencias e rotina antes de metricas.
- Reservas e espera deixam de esconder dados sem aviso.
- A agenda diaria passa a resolver trabalho real sem depender de cacar a lista detalhada.
- O calendario passa a ser ponto de partida para reserva, nao apenas leitura.
- A diferenca entre marcar convidado e enviar convite real ficou honesta para o operador.

## Riscos Restantes

- Ainda nao existe drawer especifico de reserva para pagamento, recorrencia e remarcacao no workspace novo.
- `Marcar convidado` nao envia notificacao real; backend/notificacoes podem ser adicionados em sprint futuro.
- Slots de turma/aula no calendario ainda nao abrem drawer proprio.

## Validacao

- `npx.cmd tsc -b --pretty false`
- `npm.cmd run lint`
- `npm.cmd run build`

