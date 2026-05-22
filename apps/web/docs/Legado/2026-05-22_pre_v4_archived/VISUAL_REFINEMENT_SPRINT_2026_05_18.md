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

## Expansao VISUAL-DNA-03 - Raster premium aplicado

Pedido de referencia: o app precisava deixar de parecer apenas "ajustado" e passar a usar imagens reais de alta qualidade em heros, fundos, cards e superficies, aproximando a percepcao das referencias premium anexadas.

Entrega:

- Assets PNG premium foram aplicados nos pontos principais, substituindo a primeira camada SVG onde a percepcao visual era fraca:
  - `hero-home-court-premium.png` na Home do jogador;
  - `hero-login-court-premium.png` no Login;
  - `hero-club-court-premium.png` na pagina publica do local;
  - `hero-lessons-night-premium.png` em aulas/turmas;
  - `hero-ranking-premium.png` no Ranking;
  - `hero-profile-player-premium.png` no perfil publico;
  - `hero-competition-court-premium.png` em ligas/torneios;
  - `hero-management-premium.png` na Central de Trabalho;
  - `card-event-night-premium.png` em descoberta/eventos;
  - `surface-court-lines-soft.png` como textura global de superficie.
- O AppShell recebeu fundo esportivo sutil com linhas de quadra, brilho verde ATP e superficies menos brancas, preservando leitura.
- `VisualHeroCard` ficou mais cinematografico: radius maior, overlay navy/verde mais profundo, altura mais generosa e area de texto protegida.
- `ShortcutCard` e trilhos de intencao ganharam icones/tiles mais fortes, textura de quadra, sombras premium e seta visual curta.
- Cards de descoberta, objetos e metricas receberam camadas de imagem/textura sem virar decoracao excessiva.
- A direcao agora e raster-first para telas de percepcao e textura/fundo para componentes repetitivos.

Decisoes UX:

- Imagens fortes entram em heros e discovery cards; cards operacionais continuam mais contidos para nao esconder status, horarios e acoes.
- A area esquerda dos heros continua reservada para texto/CTA, com imagem mais expressiva no lado direito ou no fundo.
- O app passa a ter DNA esportivo por superficie, luz, quadra e bola, sem depender de longos textos explicativos.
- Multi-esporte futuro devera trocar o pacote visual por contexto esportivo, mantendo os mesmos slots de hero/card.

Pendencias de refinamento visual:

- Gerar screenshots comparativos desktop/mobile depois do build para calibrar cortes das imagens por tela.
- Criar variantes visuais para padel, beach tennis e pickleball antes de ativar multi-esporte amplo.
- Revisar tela a tela onde ainda houver card administrativo sem imagem, sem remover densidade necessaria da gestao.
