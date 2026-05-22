# QA Manual P0 Fixes

Data: 2026-05-14

## BUG-001 - Aprovacao de inscricao em torneio

Sintoma:

- `POST /rest/v1/rpc/app_set_tournament_registration_status` retornava HTTP 400.
- O fallback `PATCH /tournament_registrations` tambem podia falhar e nao garantia sincronizacao em `tournament_members`.
- A UI podia ficar sem feedback util para o organizador.

Causa provavel:

- A RPC era o unico caminho transacional correto, mas usava inferencia de conflito por colunas em `tournament_members`.
- O fallback direto por PATCH era inseguro para o fluxo de aprovacao, porque podia alterar status sem criar o participante confirmado.
- No banco de QA, `tournament_registrations` tinha trigger de `updated_at`, mas a coluna `updated_at` ainda nao existia; isso derrubava a RPC com HTTP 400.

Correcao:

- Criada migration `0085_qa_p0_registration_and_academy_errors.sql`.
- A migration adiciona `tournament_registrations.updated_at` para alinhar tabela e trigger.
- `app_set_tournament_registration_status(...)` agora usa `on conflict on constraint tournament_members_pkey`.
- Ao aprovar, a RPC garante status aprovado e vinculo de participante quando possivel.
- Ao mover para espera/rejeitar, remove somente o vinculo `participant`, sem mexer em papeis de equipe.
- O frontend removeu o PATCH como fallback operacional e exibe mensagem amigavel em caso de falha.

## BUG-008 - Erro SQL bruto na UI da Academia

Sintoma:

- Em `Gestao > Academia > Alunos`, a UI podia mostrar erro tecnico como `column reference "id" is ambiguous`.

Causa provavel:

- Funcoes PL/pgSQL com `returns table(id ...)` tinham consultas internas com referencias de coluna sem alias, criando colisao entre coluna e parametro de saida.
- A RPC de ausencia avisada tambem dependia de `ON CONFLICT` sem os indices unicos correspondentes para ausencia por aluno/data e credito por ausencia.

Correcao:

- A migration `0085_qa_p0_registration_and_academy_errors.sql` requalifica consultas em `app_report_academy_absence(...)` e no fluxo de marcar pagamento manual de aula avulsa.
- A migration cria os indices `uq_place_academy_planned_absence_enrollment_date` e `uq_place_academy_makeup_source_absence_full`, alinhando os `ON CONFLICT` usados pela RPC.
- `friendlyError(...)` em `PlacesPage` agora mascara erros SQL/PostgREST tecnicos e registra o detalhe apenas no console.

Validacao executada:

- SQL remoto: aprovacao e rejeicao de inscricao passaram e o dado foi restaurado ao estado original.
- SQL remoto: ausencia avisada futura criou retorno e foi limpa apos teste.
- `npm.cmd run lint`.
- `npm.cmd run build`.

## Risco residual

- A migration precisa estar aplicada no banco alvo para corrigir a RPC em runtime.
- A aprovacao de equipe/staff e os fluxos de torneio continuam separados do papel `participant`.
- Friccoes nao bloqueantes de Academia seguem em `ACADEMY-QA-01`.
