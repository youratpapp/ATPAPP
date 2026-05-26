# QA Functional Round - 2026-05-25

## Objetivo

Rodada real de testes funcionais usando seeds e usuario admin para validar fluxos completos do app, nao apenas navegacao visual.

## Ambiente

- App: `http://127.0.0.1:5180/`
- Admin principal: `escalao@gmail.com`
- Seeds jogador: `jogador011@demo.atp.local` em diante
- Senhas usadas pelos scripts:
  - owner: `Escalao@2026!`
  - player: `Jogador@2026!`
  - staff: `Staff@2026!`

## Artefatos

- Torneio: `artifacts/function-audit-2026-05-25/tournament-rerun`
- Liga: `artifacts/function-audit-2026-05-25/league-rerun`
- Academia: `artifacts/function-audit-2026-05-25/academy`
- Comunicacao: `artifacts/function-audit-2026-05-25/communication-rerun`

## Resultado consolidado

| Area | Status | Screenshots | Flow issues | Page errors | Failed requests |
|---|---:|---:|---:|---:|---:|
| Torneio | Passou | 20 | 0 | 0 | 0 |
| Liga | Passou | 25 | 0 | 0 | 0 |
| Academia | Completou com problemas | 40 | 3 | 0 | 0 |
| Comunicacao | Passou | 8 | 0 | 0 | 0 |

## Fluxo de torneio testado

Torneio criado via admin, seeds solicitaram inscricao, admin aprovou inscricoes pela UI, inscricoes foram encerradas, jogos foram gerados, jogador seed enviou resultado, admin completou resultados restantes e torneio foi levado ate finalizacao.

Dados principais:

- Torneio: `ATP Open Dourados 215102`
- ID: `919eb208-b8ce-493a-9a0c-bcad653eff97`
- Inscricoes solicitadas/aprovadas: 4
- Resultado por jogador: passou
- Finalizacao por admin: passou

Observacao de produto:

- O teste inicial abriu a tela publica/jogador para rotas administrativas de competicao quando a URL nao carregava `mode=work`. O script foi ajustado para o contrato correto, mas o produto ainda deveria tratar rotas administrativas antigas com alias/redirect seguro para Trabalho.

## Fluxo de liga testado

Liga criada via admin, seeds solicitaram entrada, admin aprovou participantes pela UI, rodada foi gerada, jogador seed lancou resultado, adversario confirmou, admin resolveu partidas restantes e aplicou movimentacoes da temporada.

Dados principais:

- Liga: `Liga ATP Dourados 215834`
- ID: `32a13954-df4e-4a78-849f-337e00a6cc06`
- Inscricoes solicitadas/aprovadas: 4
- Resultado por jogador: passou
- Confirmacao por adversario: passou
- Operacao owner: passou

Observacao de produto:

- O mesmo risco de rota ambigua apareceu antes do ajuste: owner em rota de liga sem `mode=work` caia na superficie publica/jogador.

## Fluxo de academia testado

Academia criada, quadras cadastradas, professores vinculados, turmas criadas, contratos/matriculas gerados para seeds, reserva criada, lista de espera criada, staffs testados por papel e telas de aluno/jogador visitadas.

Dados principais:

- Local criado: `ATP Centro Dourados 0525220241`
- Quadras criadas: 3
- Turmas criadas: 2
- Contratos criados: 4
- Matriculas criadas: 5
- Reserva: criada
- Lista de espera: criada
- Papéis testados: owner, professor, recepcao, financeiro, aluno/jogador

Problemas encontrados:

1. Reserva pendente nao exibiu estado de pagamento + acoes de editar/avisar troca conforme fluxo atual.
2. Matricula pendente nao teve CTA Ativar/Aprovar facil de localizar na tela de alunos.
3. CTA Abrir aula nao apareceu na aula de hoje.

Decisao de produto sobre turmas:

- Busca publica de turmas e solicitacao self-service de entrada foram removidas do fluxo alvo. Turmas sao organizacao interna da academia; aluno/jogador acompanha apenas aulas vinculadas, matriculas criadas pela recepcao/gestao e reposicoes liberadas pela academia.
- A validacao futura deve focar em: admin/recepcao cria ou ativa matricula, aluno ve turma em Rotina/Minha agenda, e reposicao aparece apenas quando existir credito liberado.

## Fluxo de comunicacao testado

Admin enviou aviso/chat de torneio e comunicado/chat de liga; seed jogador abriu superficies correspondentes e validou recebimento/uso.

Dados principais:

- Torneio usado: `919eb208-b8ce-493a-9a0c-bcad653eff97`
- Liga usada: `32a13954-df4e-4a78-849f-337e00a6cc06`
- Flow issues: 0
- Page errors: 0

## Ajustes feitos nos testes

Foram alterados apenas scripts de E2E para respeitar o contrato atual de superficies:

- `scripts/tournament-e2e-flow-audit.mjs`
- `scripts/league-e2e-flow-audit.mjs`
- `scripts/communication-e2e-flow-audit.mjs`

Motivo:

- Rotas operacionais de competicao precisavam ser abertas com `mode=work`.
- Placeholders de comunicacao tinham mudado, entao os seletores dos testes foram atualizados.

Validacao:

- `node --check` passou nos tres scripts alterados.

## Bugs e pendencias de produto - status

### Alta prioridade original

1. Guardrail/alias para rotas administrativas de competicao abrirem Trabalho quando o usuario tem permissao operacional: tratado nas rodadas de Competition OS.
2. Reserva pendente na area de academia/reservas com pagamento, editar, cancelar e WhatsApp troca: corrigido em `academy-fix-rerun-2`.
3. Persistencia visual/estado de pagamento de reserva quando marcado como pago: corrigido em `academy-fix-rerun-2`.
4. Ativacao/aprovacao de matricula pendente como acao primaria: corrigido em `academy-fix-rerun-2`.
5. Aula do dia com CTA `Abrir aula`: corrigido em `academy-fix-rerun-2`.
6. Solicitacao publica de entrada em turma por aluno seed: removida por decisao de produto; turmas sao gestao interna.

### Media prioridade original

1. Separar melhor matricula interna, aula avulsa e reposicao: tratado nesta rodada; autosservico publico removido, rotina do aluno validada por E2E e registros incompletos aparecem como ajuste da academia.
2. Melhorar mensagens de empty/loading nas telas de academia quando dados existem mas a acao nao aparece: parcialmente tratado nas telas de aulas pessoais; manter como melhoria transversal.
3. Registrar em diagnostico quando um fluxo cai na superficie errada por modo/rota: scripts atualizados com verificacoes de texto e rota.

## Proxima fila recomendada - status

1. Rotas/aliases de Competition OS para Trabalho: tratado nas rodadas de Competition OS.
2. Fluxo de reservas pendentes/pagas/canceladas e WhatsApp troca: corrigido e validado.
3. Fila de matriculas pendentes e CTA de aprovacao: corrigido e validado.
4. CTA de aula do dia: corrigido e validado.
5. E2E de matricula interna por admin/recepcao e visualizacao pelo aluno: executado em 2026-05-26.
6. Suite funcional de academia: executada novamente sem `flowIssues`, `pageErrors` ou `failedRequests`.

## Sprint de correcao aplicado

Rodada: `academy-fix-rerun-2`

Correcoes feitas:

1. Reservas pendentes agora aparecem na tela de reservas com estado `Aguardando pagamento` e atalhos diretos para selecionar, editar e avisar troca por WhatsApp.
2. O pagamento de reserva passou a buscar o registro financeiro mais recente por `targetType/targetId`, mesmo quando o `billingPeriod` nao e vazio, evitando voltar visualmente para pendente apos refresh.
3. Matriculas pendentes agora aparecem como fila acionavel na tela de alunos, com botao direto `Ativar`.
4. Aula do dia sem obrigatoriedade de chamada agora mostra CTA `Abrir aula`, mantendo a chamada fora do fluxo padrao.
5. Rotas administrativas de torneio e liga ficaram mais tolerantes a links legados sem `mode=work` quando o usuario tem papel operacional.

Validacao:

- `npm.cmd run build`: passou.
- `scripts/academy-e2e-flow-audit.mjs`: passou.
- Screenshots gerados: 40.
- Flow issues: 0.
- Page errors: 0.
- Failed requests: 0.

Artefatos:

- `artifacts/function-audit-2026-05-25/academy-fix-rerun-2/diagnostics.json`
- `artifacts/function-audit-2026-05-25/academy-fix-rerun-2/screenshots/`

## Sprint de decisao aplicado - turmas internas

Rodada: `academy-internal-classes-2026-05-26`

Decisao consolidada:

- Turmas nao sao fluxo publico/self-service.
- A organizacao de turma, vagas, contrato, mensalidade e matricula pertence a academia, recepcao ou gestao.
- O aluno/jogador acompanha apenas aulas ja vinculadas, pagamentos pessoais e reposicoes liberadas.
- Reposicao pode ser descoberta pelo aluno apenas quando houver credito/fluxo liberado pela academia.

Correcoes feitas:

1. A busca publica de locais deixou de oferecer `Entrar em aula`, `Buscar turmas com vaga` e `Selecionar turma`.
2. Links antigos com `intent=classes`, `intent=aulas` ou equivalentes passam a cair em ficha/diretorio do local, preservando a navegacao sem reativar autosservico de turma.
3. A pagina publica do local deixou de enviar interesse ou criar pedido de matricula em turma.
4. Scripts de varredura visual deixam de auditar `#/locais?intent=classes` e passam a validar aulas pela rotina pessoal em `#/agenda?tipo=aulas`.
5. Turmas e alunos permanecem como gestao interna no workspace da academia, com lista compacta e painel lateral de detalhe.

Validacao:

- `npm.cmd run build`: passou.
- Busca ativa por residuos de autosservico publico de turmas: sem ocorrencias fora de legados.

Pendencia funcional para proxima rodada:

- Rodar E2E especifico de matricula interna: admin/recepcao cria ou ativa matricula de seed, aluno abre Rotina, visualiza aula vinculada e nao encontra fluxo publico para solicitar entrada em turma.

## E2E de matricula interna - validado em 2026-05-26

Rodada: `academy-internal-classes`

Artefatos:

- `artifacts/function-audit-2026-05-26/academy-internal-classes/diagnostics.json`
- `artifacts/function-audit-2026-05-26/academy-internal-classes/`

Dados criados no teste:

- Local: `ATP Centro Dourados 0526153403`
- Local ID: `1c6899fd-10e5-481e-bb45-579e18cfab20`
- Turmas: `Adulto Intermediario`, `Kids Iniciante`
- Matriculas/enrollments carregados: 5
- Screenshots: 40

Validacoes funcionais:

1. Admin criou academia, quadras, professores, turmas e contratos/matriculas para seeds.
2. Admin ativou matricula pendente pela interface.
3. Aluno seed abriu `#/agenda?tipo=aulas` e visualizou aulas vinculadas com turma, professor e quadra reais.
4. Aluno seed abriu `#/minhas-aulas` e permaneceu na experiencia unificada de Rotina/Aulas.
5. Pagina publica do local em `#/locais/:placeId/aulas` nao exibiu `Enviar interesse`, `Solicitar turma`, `Selecionar turma` nem `Buscar turmas com vaga`.
6. Pagina publica explicou que matriculas/turmas sao organizadas pela academia.

Resultado:

- `completed`: true
- `flowIssues`: 0
- `pageErrors`: 0
- `failedRequests`: 0

Observacao:

- O seed usado acumula matriculas de rodadas anteriores, entao a Rotina exibe muitas aulas. Isso nao quebrou o fluxo, mas para QA visual futuro vale usar seed limpo ou filtrar artefatos por local da rodada quando o objetivo for avaliar densidade visual.

## Sprint de limpeza da rotina do aluno - 2026-05-26

Problema observado no E2E:

- Seeds usados em rodadas sucessivas acumulam registros de matricula.
- Quando existe mais de um registro para a mesma turma/local, a Rotina do jogador pode parecer duplicada e menos confiavel.

Correcao aplicada:

1. `PersonalAgendaPage` agora compacta matriculas por `local + turma` antes de montar os cards de aula.
2. `MyLessonsPage` usa a mesma regra para separar turmas ativas e solicitacoes pendentes.
3. Quando ha duplicidade, a matricula ativa prevalece sobre pendente, e pendente prevalece sobre cancelada.
4. Em empate de status, o registro mais recente prevalece.
5. Empty states de aulas nao direcionam mais para busca publica de turma; direcionam de volta para o inicio pessoal.

Validacao:

- `npm.cmd run build`: passou.
- E2E `academy-e2e-flow-audit.mjs`: passou.

Artefatos:

- `artifacts/function-audit-2026-05-26/academy-internal-classes-dedup/diagnostics.json`
- `artifacts/function-audit-2026-05-26/academy-internal-classes-dedup/`

Resultado:

- `completed`: true
- `flowIssues`: 0
- `pageErrors`: 0
- `failedRequests`: 0
- `screenshots`: 40

Limite conhecido:

- Se o mesmo seed estiver matriculado em turmas iguais de academias diferentes, elas continuam aparecendo como compromissos distintos. Isso e correto para produto real; para QA visual, usar seed limpo evita ruido de massa de dados acumulada.

## Sprint de linguagem operacional em aulas - 2026-05-26

Problema:

- Quando uma matricula existia sem turma carregada, a rotina pessoal podia comunicar `Horario a confirmar`, `Quadra a confirmar` ou `Professor a confirmar`.
- Isso fazia o jogador interpretar um registro incompleto como uma aula real em aberto.

Correcao aplicada:

1. Aula vinculada sem turma carregada passou a aparecer como `Turma em ajuste`.
2. O detalhe passa a explicar que a academia precisa ajustar a matricula.
3. `Professor a confirmar` virou `Professor nao informado` ou `Nao informado`, sem prometer confirmacao futura.
4. `Quadra a confirmar` virou `Sem quadra fixa`.
5. O CTA de registro incompleto virou `Ver detalhes`, enquanto aulas reais mantem `Abrir aulas`.

Validacao:

- `npm.cmd run build`: passou.
- E2E `academy-e2e-flow-audit.mjs`: passou novamente.

Artefatos:

- `artifacts/function-audit-2026-05-26/academy-internal-class-copy-clean/diagnostics.json`
- `artifacts/function-audit-2026-05-26/academy-internal-class-copy-clean/`

Resultado:

- `completed`: true
- `flowIssues`: 0
- `pageErrors`: 0
- `failedRequests`: 0
- `screenshots`: 40

## Sprint Cliente 360 - vinculos financeiros e academicos - 2026-05-26

Problema:

- O detalhe `Cliente 360` precisava centralizar melhor a relacao do cliente com a academia.
- Pagamentos vinculados a reservas apareciam, mas pagamentos ligados a matriculas, contratos, planos, creditos e compras podiam ficar fora do resumo quando nao havia match textual confiavel.
- A validacao anterior criou uma unidade em plano sem CRM/Clientes, causando redirecionamento para `Inicio` em vez de validar o painel certo.

Correcao aplicada:

1. `Cliente 360` agora cruza pagamentos pelo alvo tecnico de reservas, matriculas, contratos, planos/socios e compras de credito.
2. O painel preserva busca por nome/metadados como fallback, mas prioriza vinculo real por `targetId`.
3. O E2E da academia passou a criar a unidade de teste como `club_pro` quando o objetivo for validar CRM/Clientes, mantendo academia/aulas e expondo a area completa de Cliente 360.
4. A suite funcional agora valida explicitamente que a tela de clientes ativos abre `Cliente 360` lateral e mostra vinculos, aulas, pagamentos e reservas.

Validacao:

- `npm.cmd run build`: passou antes da rodada E2E.
- E2E `academy-e2e-flow-audit.mjs`: passou com o plano correto.

Artefatos:

- `artifacts/function-audit-2026-05-26/client360-payments-links-club-pro/diagnostics.json`
- `artifacts/function-audit-2026-05-26/client360-payments-links-club-pro/20-desktop-1366-20-owner-clientes-ativos-360.png`

Resultado:

- `completed`: true
- `flowIssues`: 0
- `pageErrors`: 0
- `failedRequests`: 0
- `screenshots`: 40

Observacao:

- O smoke por papeis retornou `auth-expired` para estados salvos antigos e pulou rotas, sem falha funcional da tela. Para QA de papeis, regenerar auth states antes de usar `qa:roles`.
