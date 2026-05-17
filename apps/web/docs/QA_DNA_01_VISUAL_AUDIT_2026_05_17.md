# QA-DNA-01 Visual Audit - 2026-05-17

Status: concluido

## Escopo capturado

Capturas carregadas em `web/docs/screenshots/qa-dna-2026-05-17/`.

- Desktop 1366x900: Home, Locais, Locais por intencao, Eventos, Torneios, Ligas, Gestao, torneio publico e liga publica.
- Mobile 390x844: Home, Locais, Locais por intencao, Eventos, Torneios, Ligas, Gestao, torneio publico e liga publica.
- Login usado: `escalao@gmail.com`.
- Captura feita com Chrome headless via CDP, aguardando estabilidade de texto e ausencia de loading cru.

## Resultado geral

O app evoluiu bem em relacao aos prints anteriores: Home, competicoes publicas, liga publica e Gestao ja parecem mais focadas por tarefa e menos como inventario de cards. A separacao entre jogador e trabalho esta mais evidente, e a central de gestao deixou de abrir todos os locais de uma vez.

O principal achado P1 foi em `Locais`: as rotas diretas por query (`#/locais?intent=booking`, `classes`, `matches`) podiam cair no hub neutro dependendo da entrada/hash. O problema foi corrigido no mesmo sprint com sincronizacao robusta de `intent` a partir da URL/hash.

## Achados por area

### Home

Evidencia:

- `mobile-home.png`
- `desktop-home.png`

O que melhorou:

- Primeira dobra ficou mais clara e menos administrativa.
- CTA principal esta contextual e a area profissional aparece separada.
- Descoberta esta abaixo da area pessoal, sem competir com urgencias.

Riscos residuais:

- Cards de acao no mobile ainda sao altos e podem consumir muita dobra quando o usuario so quer navegar rapido.
- Tipografia esta forte e consistente, mas alguns subtitulos podem ser menores em mobile para aumentar fluidez.

Prioridade: P2, refinamento.

### Locais

Evidencia:

- `desktop-locais-direct-booking.png`
- `desktop-locais-direct-classes.png`
- `desktop-locais-direct-matches.png`
- `mobile-locais-direct-booking.png`
- `mobile-locais-direct-classes.png`
- `mobile-locais-direct-matches.png`

O que melhorou:

- Hub sem intencao ficou limpo.
- Intencoes abertas por clique mostram somente a tarefa escolhida.
- Filtros de reservar, aulas e jogos nao estao mais encavalados no desktop.
- Mobile usa resumo/ajuste de filtros em vez de despejar o formulario inteiro.

Correcoes feitas durante a auditoria:

- `PlacesPage` agora sincroniza `intent` a partir de `useSearchParams`, `location.search` e hash fallback. Rota direta com query carrega a experiencia correta.

Riscos residuais:

- Mobile ainda usa trilho horizontal de intencoes com partes cortadas na primeira vista. E aceitavel, mas precisa de indicacao visual mais obvia de arraste em refinamento futuro.
- Empty state de busca em aulas/quadras ainda ocupa uma area grande quando nao houve busca.

Prioridade residual: P2.

### Torneio publico

Evidencia:

- `desktop-torneio-publico.png`
- `mobile-torneio-publico.png`

O que melhorou:

- Pagina publica esta separada por abas reais.
- Categoria deixou de ser aba publica principal; classe esta como seletor contextual.
- Jogos/partidas aparecem focados na aba correta.

Riscos residuais:

- Mobile da aba de jogos ainda fica denso quando ha muitas partidas de chave, mas agora o conteudo e da aba correta.
- O trilho de abas mobile pode esconder itens a direita; nao e P1 porque o padrao de arraste esta presente, mas merece polimento.

Prioridade residual: P2.

### Liga publica

Evidencia:

- `desktop-liga-publica.png`
- `mobile-liga-publica.png`

O que melhorou:

- Chat, partidas, jogadores e classificacao estao separados.
- Ferramentas admin continuam restritas ao papel correto.
- Filtro de classe segue padrao com select quando escalar.

Riscos residuais:

- Chat admin em desktop ainda tem container alto com scroll interno; funciona, mas pode ficar mais natural com lista de mensagens menos encaixotada.

Prioridade residual: P2.

### Gestao

Evidencia:

- `desktop-gestao.png`
- `mobile-gestao.png`

O que melhorou:

- Central mostra fila do dia antes de workspaces.
- Locais sob gestao ficaram ordenados por pendencia e limitados por foco.
- Mobile nao abre todos os workspaces completos de uma vez.

Riscos residuais:

- Mobile ainda tem tipografia muito pesada nos cards da fila e numeros muito grandes. Nao bloqueia operacao, mas reduz sofisticacao.
- `Ver locais publicos` aparece centralizado dentro da fila, com peso visual estranho para uma acao secundaria.

Prioridade residual: P2.

## Bugs visuais P0/P1 detectados

- P1 corrigido no sprint: rota direta de `Locais` por `intent` podia nao abrir o conteudo correto.
- Nenhum P0 visual bloqueador foi encontrado nas capturas carregadas.

## Evidencia tecnica

- `summary.json`: todas as capturas principais com `loaded: true`.
- `locais-click-summary.json`: intencoes abertas por clique com `clicked: true` e `loaded: true`.
- `locais-direct-summary.json`: intencoes por rota direta com `loaded: true` apos a correcao.

## Validacao pendente/observacao

O ambiente local nao tinha Playwright instalado no projeto, entao a captura foi feita com Chrome/CDP sem adicionar dependencia. Isso atende a auditoria visual, mas nao substitui teste E2E permanente.
