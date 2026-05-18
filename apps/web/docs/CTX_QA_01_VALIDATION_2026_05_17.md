# CTX-QA-01 Validation - 2026-05-17

## Escopo validado

- Ambiente local Vite em `http://127.0.0.1:5173`.
- Login autenticado com `escalao@gmail.com`.
- Supabase alvo: `https://xdopstommqojjofapzjl.supabase.co`.
- Screenshots desktop e mobile em `web/docs/screenshots/contextual-qa-2026-05-17/`.

## Correcoes de schema aplicadas

As migrations abaixo foram aplicadas no Supabase remoto usado pelo app local, porque o banco populado artificialmente ainda nao tinha os campos novos e o PostgREST estava recusando `profile_visibility`:

- `0092_player_private_notes_v1.sql`
- `0093_profile_visibility_v1.sql`
- `0094_academy_class_recurrence_group_v1.sql`

Tambem foi solicitado reload do schema PostgREST com `notify pgrst, 'reload schema'`.

## Evidencias por fluxo

- Home desktop/mobile: modo Jogador permanece como superficie principal; modo Trabalho aparece para usuario profissional sem misturar gestao no menu jogador.
- Ranking desktop/mobile: nomes com `user_id` abrem perfil publico do jogador.
- Perfil publico do jogador: exibe dados competitivos, historico/estatisticas basicas, head-to-head como area sempre visivel e anotacao privada de scouting.
- Perfil do proprio usuario: configuracao `Perfil publico` / `Perfil privado` aparece no editor e salva junto com o perfil.
- Academia/turmas: tela carrega apos migrations; estrutura de classes multi-dia permanece compatível com a view atual.
- Gestao: rota profissional segue acessivel no modo Trabalho para usuario com permissao.

## Decisoes UX confirmadas

- Perfil privado nao bloqueia informacoes competitivas compartilhadas. Head-to-head, rankings e estatisticas de jogo continuam visiveis porque fazem parte do contexto esportivo publico do confronto.
- Dados pessoais/vitrine do perfil ficam condicionados a `profile_visibility`.
- Anotacoes de adversario sao sempre privadas do usuario logado e salvam automaticamente.
- O seletor Jogador/Trabalho fica persistido por usuario e so aparece para quem tem acesso profissional.

## Validacao tecnica

- `npm.cmd run lint`: passou.
- `npm.cmd run build`: passou.
- `git diff --check -- web/src web/docs web/supabase/migrations`: sem erros, apenas avisos de CRLF.

## Riscos restantes

- O bloco de head-to-head ja fica preservado no perfil privado, mas ainda e uma base visual/estrutural. O motor completo de confrontos diretos pode ser evoluido em sprint futura.
- A validacao foi feita sobre dados artificiais. As decisoes de produto foram tomadas pelo comportamento correto esperado, nao pela completude do seed atual.
