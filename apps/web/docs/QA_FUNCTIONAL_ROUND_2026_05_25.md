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

Lacuna especifica:

- O app possui busca publica de turmas, interesse em turma e fila interna de matriculas, mas esta rodada nao comprovou um caminho completo e limpo onde o seed aluno solicita entrada em uma turma sozinho e o admin aprova depois. O fluxo administrativo de contrato/matricula funciona; o fluxo self-service de solicitacao de turma precisa de E2E proprio ou ajuste de produto.

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

## Bugs e pendencias de produto

### Alta prioridade

1. Criar guardrail/alias para rotas administrativas de competicao abrirem Trabalho quando o usuario tem permissao operacional.
2. Corrigir a reserva pendente na area de academia/reservas para exibir pagamento, editar, cancelar e WhatsApp troca de forma persistente.
3. Corrigir persistencia visual/estado de pagamento de reserva quando marcado como pago.
4. Tornar a ativacao/aprovacao de matricula pendente uma acao primaria clara na tela certa.
5. Garantir que aula do dia tenha CTA `Abrir aula` quando houver turma/aula programada.
6. Criar ou validar E2E de solicitacao publica de entrada em turma por aluno seed.

### Media prioridade

1. Separar melhor solicitacao de turma, aula avulsa e reposicao para evitar ambiguidade.
2. Melhorar mensagens de empty/loading nas telas de academia quando dados existem mas a acao nao aparece.
3. Registrar em diagnostico quando um fluxo cai na superficie errada por modo/rota.

## Proxima fila recomendada

1. Corrigir rotas/aliases de Competition OS para Trabalho.
2. Corrigir fluxo de reservas pendentes/pagas/canceladas e WhatsApp troca.
3. Corrigir fila de matriculas pendentes e CTA de aprovacao.
4. Corrigir CTA de aula do dia.
5. Criar E2E especifico: aluno seed busca turma publica, solicita entrada, admin aprova, aluno ve turma em Rotina.
6. Rodar novamente a suite funcional completa.

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
