# Visual Refinement Sprint - 2026-05-18

## Objetivo

Elevar a linguagem visual do ATP para parecer um produto esportivo premium, menos administrativo e mais orientado a jogador, clube, ranking e competicao, sem alterar regras de negocio.

## O que foi entregue nesta rodada

- Criada base de componentes visuais reutilizaveis em `AppPrimitives`:
  - `VisualHeroCard`
  - `ShortcutCard`
  - `MetricCard`
  - `VisualBadge`
- Criados assets visuais locais para uso imediato:
  - `visual-court-hero.svg`
  - `visual-court-night.svg`
  - `visual-profile-court.svg`
  - `visual-stadium-card.svg`
  - `icon-reserve.svg`
  - `icon-play.svg`
  - `icon-class.svg`
  - `icon-league.svg`
- Refinados tokens globais:
  - surfaces mais esverdeadas/azuladas;
  - radius mais generoso;
  - sombras mais suaves e profundas;
  - gradientes esportivos e linhas de quadra.
- Login ganhou composicao esportiva com imagem de quadra noturna, painel emocional e card de acesso mais premium.
- Home do jogador ganhou hero visual contextual, atalhos com icones/imagem e cards de descoberta com thumbnails.
- Ranking ganhou hero visual, cards de posicao/recorte mais fortes e tabs/controles menos administrativos.
- Central de trabalho/gestao recebeu camadas visuais, fundo esportivo leve e cards operacionais menos crus.

## Expansao VISUAL-DNA-02

- Criados assets visuais complementares:
  - `visual-club-hero.svg`
  - `visual-lesson-hero.svg`
  - `visual-match-hero.svg`
- Pagina publica do local agora usa hero contextual com imagem de clube/aulas quando nao existe cover cadastrado.
- Locais, reserva, aulas, jogos e planos receberam camadas visuais mais esportivas: action rail com profundidade, superficies premium, cards menos secos e textura contextual em turmas.
- Perfil publico do jogador recebeu hero de quadra, avatar mais expressivo, metricas e scouting privado com visual de anotacao pessoal.
- Liga e torneio receberam a mesma direcao visual em `CompetitionHeader`, `CompetitionTabs`, hero publico e blocos de contexto, mantendo a separacao entre leitor publico, jogador e organizador.

## Decisoes UX

- Imagem e textura entram como suporte de hierarquia, nao como decoracao aleatoria.
- CTAs continuam curtos: `Entrar`, `Explorar`, `Reservar`, `Jogar`, `Aulas`, `Ligas`.
- Home continua resumo contextual, nao dashboard completo.
- Gestao continua densa onde precisa, mas com camada visual de produto e separacao de trabalho.
- SVGs locais foram usados como primeira camada segura; imagens raster geradas podem substituir esses assets depois, mantendo os mesmos slots.

## Riscos e cuidados

- Assets visuais nao podem esconder informacao operacional importante.
- Mobile precisa manter leitura simples: hero forte, cards curtos, listas compactas.
- Multi-esporte futuro deve trocar imagem/vocabulario por contexto, sem criar quatro apps separados.
- Proximas rodadas devem evitar usar imagem em todos os cards sem criterio; imagem deve sinalizar esporte, local, evento ou status.

## Validacao

- `npm.cmd run lint` passou.
- `npm.cmd run build` passou.
- VISUAL-DNA-02: `npm.cmd run lint` passou.
- VISUAL-DNA-02: `npm.cmd run build` passou.
