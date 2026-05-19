# ATP Premium Dark - QA visual global

Data: 2026-05-19

Fontes primarias:

- `m:/Downloads/Chrome/atp_premium_dark_design_playbook.md`
- imagens de referencia anexadas pelo usuario em 2026-05-19
- `docs/ATP_PREMIUM_DARK_GLOBAL_QUEUE_2026_05_19.md`
- `docs/EXECUTION_QUEUE.md`

## Resultado

A rodada global ATP Premium Dark foi concluida com cobertura visual ampla sobre as areas Jogador, Trabalho, Login/Cadastro, paginas publicas, competicoes, reservas, locais, aulas, perfil, ranking, mensagens e estados auxiliares.

O app atingiu o objetivo principal da sprint: reaproveitar as funcoes existentes e reposicionar a experiencia visual para um DNA dark premium, com deep navy, superficies glass, verde ATP, bordas luminosas, cards cinematograficos e hierarquia mais proxima das referencias.

## Validacao executada

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- `node scripts\capture-visual-audit.mjs` passou.

Evidencias atualizadas em:

- `docs/screenshots/visual-local-audit-2026-05-18/`

## Cobertura revisada

- Home Jogador desktop/mobile.
- Competicoes, torneios, ligas, rankings, detalhes e chats.
- Perfil, perfil publico e ranking.
- Locais, reservar quadra, encontrar jogo e aulas.
- Areas pessoais: reservas, partidas, aulas e pagamentos.
- Trabalho/Gestao: dashboard, academia, reservas, financeiro, CRM, cantina, equipe e configuracoes.
- Paginas publicas: clube, booking, academia, jogador publico e inscricao publica.
- Estados vazios, loading, feedbacks, modais, drawers, sheets e wizard.

## Gaps residuais

1. Backdrop de shell em algumas rotas autenticadas
   - Algumas telas de Jogador/Competicoes ainda exibem textura de fundo mais clara em regioes longas de screenshot, principalmente quando o conteudo termina antes do final da captura.
   - Impacto: medio visual, baixo funcional.
   - Proxima acao sugerida: micro sprint para uniformizar `app-shell--player` e `app-shell--competition` com fundo deep navy continuo sem afetar cards brancos intencionais.

2. Placeholders de avatar no ranking mobile
   - Alguns avatares sem imagem ainda aparecem como blocos claros dentro de cards dark.
   - Impacto: baixo a medio visual.
   - Proxima acao sugerida: aplicar placeholder dark/gradient ou asset `pdark-player-avatar-placeholder.png`.

3. Captura dedicada signed-out
   - A auditoria automatizada fica autenticada e algumas rotas de `/auth` redirecionam para a area logada.
   - Impacto: baixo no codigo, medio na evidencia.
   - Proxima acao sugerida: criar rotina de screenshot anonima para login/cadastro/recuperacao sem sessao persistida.

4. Screenshots mobile full-page com bottom nav
   - Em capturas full-page, a bottom nav fixa pode aparecer sobre regioes inferiores longas. No viewport real o comportamento e esperado.
   - Impacto: baixo visual.
   - Proxima acao sugerida: adicionar tambem screenshots viewport-only para revisao de nav fixa.

5. Escala mobile das paginas publicas e inscricao
   - A composicao esta dentro do DNA premium, mas algumas secoes usam tipografia e espacamentos grandes.
   - Impacto: baixo.
   - Proxima acao sugerida: polish de densidade mobile apos review de produto.

## Conclusao

A queue global PDARK-00 a PDARK-18 esta concluida. Os gaps restantes sao polish visual e evidencia de QA, sem indicio de regressao funcional obvia nos fluxos principais validados por build, lint e captura visual.
