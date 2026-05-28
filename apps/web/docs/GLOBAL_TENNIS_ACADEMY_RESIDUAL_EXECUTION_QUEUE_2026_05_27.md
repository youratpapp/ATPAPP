# Global Tennis Academy Residual Execution Queue - 2026-05-27

Esta fila nasce das pendencias restantes do `GLOBAL_TENNIS_ACADEMY_PRODUCT_COMPLETENESS_AUDIT_2026_05_26.md`.

Regra de execucao: seguir em sprint, sem pedir autorizacao entre itens, validando build/SQL/fluxos a cada corte.

## RESIDUAL-01 - Ciclo de reserva fechado

Status: executado no corte 2026-05-27, pendente QA visual/fluxo em navegador.

Objetivo:

- Reserva precisa nascer, pagar, cancelar, remarcar, comunicar e manter historico operacional.
- Edicao/remarcacao deve usar RPC existente quando disponivel e fallback direto apenas como seguranca.
- Cancelamento nao deve parecer apenas remocao de botao de pagamento; precisa virar estado visivel e rastreavel.

Entregas:

- Validar RPCs reais de edicao/remarcacao no banco.
- Registrar historico minimo de acoes de reserva: pagamento manual, cancelamento, edicao e WhatsApp de remarcacao.
- Garantir que o pagamento manual persiste no reload por `target_type`, `target_id` e `billing_period`.
- Atualizar UI do painel lateral para mostrar estado cancelado/pago/pendente com clareza.

QA:

- Reserva pendente -> Pagar -> reload -> continua pago.
- Reserva confirmada -> Cancelar -> reload -> aparece como cancelada/historico, sem CTA de pagamento.
- Reserva confirmada -> WhatsApp troca -> link/token criado e historico registrado.
- Reserva confirmada -> Editar horario -> reload -> novo horario aparece na agenda.

Implementado:

- `app_operation_events` criado no banco para historico operacional.
- `app_log_operation_event` aplicado no Supabase.
- Frontend registra eventos para pagamento, cancelamento, confirmacao, edicao e WhatsApp de remarcacao de reserva.
- RPCs de edicao/remarcacao foram verificadas no banco remoto.

## RESIDUAL-02 - Financeiro com comprovante e conciliacao minima

Status: executado no corte 2026-05-27, pendente comprovante visual completo.

Objetivo:

- O modal provisorio de pagamento deve deixar rastreio de operador, metodo stub, data e origem.
- Preparar o mesmo ponto de entrada para futuro gateway/webhook.

Entregas:

- Recibo operacional simples apos baixa manual.
- Metadata padronizada em pagamentos manuais.
- Campo visual de origem/metodo/operador quando existir.

Implementado:

- `PaymentStubDialog` agora deixa claro que gera baixa manual e recibo interno temporario.
- `markStubPaymentPaid` e `markStubPaymentPaidForParticipant` passam metadata padronizada: `markedAt`, `paymentMethod`, `receiptType` e `source`.
- Baixa manual de reserva adiciona operador, placeId e dados do recibo temporario na metadata.

## RESIDUAL-03 - Comunicacao e tarefas auditaveis

Status: executado como base tecnica no corte 2026-05-27, pendente UI operacional completa.

Objetivo:

- WhatsApp aberto nao pode ser confundido com mensagem entregue.
- Pendencias precisam ter dono, prazo, status e origem quando virarem tarefa.

Entregas:

- Log de abertura de WhatsApp por entidade.
- Distincao visual entre `mensagem sugerida`, `WhatsApp aberto` e `enviado confirmado`.
- Modelo inicial de tarefa/pendencia sem automatizar demais.

Implementado:

- WhatsApp de remarcacao de reserva registra `booking_whatsapp_reschedule_opened` em `app_operation_events`.
- O texto do evento registra abertura do WhatsApp, nao entrega/enviado confirmado.
- Criada tabela `app_operational_tasks` para pendencias auditaveis com entidade, dono, prioridade, prazo, status e metadata.
- Criadas RPCs `app_create_operational_task` e `app_update_operational_task_status`, aplicadas no Supabase.
- Criado helper frontend `operational-tasks.ts` para listar, criar e atualizar tarefas sem espalhar acesso direto ao banco.

Ainda pendente:

- Integrar logs de WhatsApp de Cliente 360, cobranca, aulas, torneios e ligas.
- Expor a fila de tarefas como drawer/lista operacional no SaaS web e como acoes rapidas no mobile trabalho.

## RESIDUAL-04 - Relatorios consolidados reais

Status: executado no corte 2026-05-27, pendente drill-down avancado.

Objetivo:

- Evoluir relatorios de derivados de tela para consultas consolidadas por periodo/unidade.

Entregas:

- Relatorio de ocupacao de quadra por hora/dia.
- Relatorio de inadimplencia/recebiveis.
- Relatorio de professor/turma/aluno.
- Exportacao consistente.

Implementado:

- RPC `app_place_operations_report(place_id, starts_at, ends_at)` criada e aplicada no Supabase.
- Helper frontend `getPlaceOperationsReport` criado para consumir a consolidacao.
- A primeira consolidacao cobre reservas, horas reservadas, cancelamentos, turmas ativas, matriculas ativas, socios, despesas e POS.
- A tela de Relatorios passa a carregar o consolidado por unidade/periodo e prioriza esses dados na visao executiva.
- Exportacao CSV agora inclui as metricas consolidadas quando o RPC retorna dados.

Ainda pendente:

- Criar drill-down por professor, turma, cliente, financeiro e competicoes.
- Comparar periodos e exportar a partir da base consolidada.
- Enriquecer o RPC com inadimplencia detalhada, ocupacao por faixa horaria, comissoes e dados de competicoes.

## RESIDUAL-05 - Permissoes e auditoria

Status: parcialmente executado no corte 2026-05-27.

Objetivo:

- Remover divergencias entre UI e RLS, especialmente `finance`.
- Preparar permissao granular por acao sem bloquear o produto atual.

Entregas:

- Revisar `finance` no banco versus frontend.
- Audit log por entidade critica.
- Matriz de permissoes editavel/documentada.

Executado:

- Banco remoto verificado: `app_can_manage_place_finance(uuid)` ja considera `owner`, `manager` e `finance`.
- Audit log inicial criado via `app_operation_events`, cobrindo reservas/pagamento/remarcacao neste primeiro corte.
- Audit log expandido no frontend para CRM, interacoes do Cliente 360, turmas, matriculas, pagamento de academia, pagamento de socio, despesas e POS.

Ainda pendente:

- Expandir audit log para contratos detalhados, torneios, ligas, equipe e alteracoes de configuracao.
- Criar matriz visual/editavel de permissoes no SaaS.

## RESIDUAL-06 - Multiunidade e cockpit de rede

Status: executado no corte 2026-05-27, pendente QA visual em navegador com usuario multiunidade real.

Objetivo:

- Unidade ativa ja existe, mas falta visao consolidada de rede.

Entregas:

- Cockpit de organizacao quando houver multiplas unidades.
- Comparativo basico entre unidades.
- Navegacao clara unidade atual x rede.

Implementado:

- A central `/gestao` agora carrega as organizacoes junto com as unidades.
- Quando existem multiplas unidades gerenciadas, a central mostra um cockpit de rede em formato de tabela compacta.
- O cockpit compara unidade, rede/organizacao, reservas de hoje, pendencias, aulas, recebiveis e progresso de implantacao.
- A lista generica de locais fica fora do fluxo multiunidade para evitar duplicidade visual; unidade unica continua com a lista operacional local.
- Cada linha da rede leva diretamente para o proximo foco operacional da unidade.

## RESIDUAL-07 - QA transversal final

Status: executado parcialmente no corte 2026-05-27, com bloqueio de auth expirado em papéis salvos e recheck admin limpo.

Objetivo:

- Testar papéis e viewports sem quebrar outro fluxo.

QA obrigatorio:

- Jogador, aluno, socio, competitivo.
- Professor, recepcao, financeiro, caixa, gestor, organizador.
- Mobile 390, mobile 430, desktop 1366, desktop amplo.

Executado:

- `npm run build` passou apos as alteracoes.
- `qa:roles` rodou em desktop 1366, mas os estados salvos de professor/recepcao/financeiro/caixa/organizador estavam expirados; o perfil jogador executou sem falhas e gerou screenshots em `artifacts/role-smoke-audit-2026-05-27-residual`.
- `qa:deep-sweep` rodou com login admin em desktop 1366 nas rotas: inicio jogador, jogar/reservar, local publico, perfil, central trabalho, agenda, academia/turmas, clientes ativos e financeiro/recebiveis.
- A varredura admin inicial encontrou 1 problema de UX na central: labels duplicados em botoes de competicao.
- Os botoes foram corrigidos para labels acionaveis e curtos, mantendo nome completo no `title`.
- Recheck `work-central` passou com 0 achados em `artifacts/deep-product-sweep-2026-05-27-residual-recheck-2`.

Ainda pendente:

- Regenerar estados/auth de papéis operacionais para rodar `qa:roles` completo em professor, recepcao, financeiro, caixa e organizador.
- Rodar QA visual mobile 390/430 e desktop amplo com auth atualizada.
