# Visual Reference System

Fonte principal: `PREMIUM_UX_VISUAL_LANGUAGE.md`.

Data: 2026-05-13

## Objetivo

Este documento transforma referencias visuais reais em regras praticas para o nosso frontend. Nao e um moodboard estetico. E um sistema de criterios para decidir spacing, hierarchy, densidade, navegacao e comportamento.

Regra central:

```text
O app deve parecer um cockpit esportivo premium: rapido, limpo, operacional e confiavel.
```

## Referencias consultadas

### SaaS esportivo e booking

- Playtomic: https://playtomic.com/ e https://playtomic.com/playtomic-manager/
- Playtomic Academy: https://playtomic.com/academy
- UTR Sports Clubs: https://www.utrsports.net/clubs
- CourtReserve: https://courtreserve.com/features/
- OpenCourt: https://www.getopencourt.com/
- ClubSpark: https://clubspark.com/features
- MATCHi: https://www.matchi.se/home/?lang=en_US
- PodPlay Admin Help: https://help.podplay.app/en/articles/1035201

### SaaS premium, produtividade e operacao

- Linear design refresh: https://linear.app/now/how-we-redesigned-the-linear-ui
- Linear calmer interface: https://linear.app/now/behind-the-latest-design-refresh
- Stripe Dashboard: https://docs.stripe.com/dashboard/basics
- Stripe design tokens: https://docs.stripe.com/stripe-apps/style
- Notion: https://www.notion.com/product
- Raycast: https://www.raycast.com/
- Arc Spaces: https://resources.arc.net/hc/en-us/articles/19228064149143-Spaces-Distinct-Browsing-Areas
- Attio lists: https://attio.com/help/getting-started/understanding-lists

## Extracao por produto

| Referencia | Padrao observado | Aplicacao no app |
| --- | --- | --- |
| Playtomic | Player app simples e manager separado para clubes | Gestao nao pode parecer subarea de Locais; deve ser workspace proprio |
| CourtReserve | Plataforma grande, organizada por dominio e papel | Menus por papel/plano; cada modulo resolve uma rotina |
| OpenCourt | Linguagem moderna, emocional e pouco administrativa | Pagina publica e mobile precisam parecer app moderno, nao sistema interno |
| ClubSpark | Suite modular com booking, membership, coaching, payments e CRM | Modulos existem, mas precisam de hierarchy e fila antes de relatorio |
| UTR | Competicao e rating como conceitos fortes | Competition OS precisa de status claro, escopo e proxima acao |
| MATCHi | Booking e membership como acoes diretas | Reservar, entrar, pagar e comprar precisam ser curtos |
| PodPlay | Dashboard staff com sidebar e contexto de local | Gestao deve abrir em modo staff, com local, papeis e tarefas |
| Linear | Densidade alta, baixo ruido, sidebar discreta e headers precisos | Reduzir containers, alinhar linhas e deixar a navegacao quieta |
| Stripe | Dashboard confiavel, tokens, navegacao previsivel e foco em operacao | Financeiro precisa de leitura limpa e estados consistentes |
| Notion | Superficies leves, edicao contextual, pouco chrome visual | Evitar bordas em excesso; usar contexto e rows |
| Raycast | Command-first, atalhos e busca por acao | Futuro: quick actions por tarefa, nao menus longos |
| Arc | Contextos separados por spaces/sidebar | Player, Gestao e Competicoes devem parecer espacos diferentes |
| Attio | Listas/table/kanban como workspace, nao cards soltos | CRM e filas devem usar rows/tables acionaveis |

## Regras visuais derivadas

### 1. Menos superficies

Nao criar um card para cada dado. Superficie so existe para:

- entidade importante;
- fila acionavel;
- contexto de trabalho;
- formulario/etapa;
- publicacao.

Anti-pattern:

```text
6 cards com valor 0 dentro de outro card.
```

Padrao correto:

```text
Estado calmo: "Operacao em dia" + texto curto + CTA secundario.
```

### 2. Rows antes de cards

Para operacao diaria, row e melhor que card.

Use row quando:

- usuario precisa escanear muitas entidades;
- ha status + acao;
- a tarefa e recorrente;
- a tela e desktop operacional ou mobile com lista curta.

Use card quando:

- o item precisa de contexto visual;
- e uma pagina publica;
- e uma oferta/torneio/local;
- e um resumo fechado.

### 3. Header como contexto, nao hero

Areas operacionais nao devem abrir com hero grande.

Header operacional deve conter:

- contexto atual;
- papel/permissao;
- 2 ou 3 sinais compactos;
- uma acao primaria opcional.

Nao deve conter:

- texto promocional longo;
- mosaico de KPI;
- imagem decorativa;
- gradiente hero dominante.

### 4. Sidebar discreta

Sidebar premium e ferramenta de orientacao, nao painel chamativo.

Regras:

- ativa com marcador claro;
- itens curtos;
- agrupamento por contexto;
- sem todos os modulos sempre visiveis se o perfil nao usa;
- desktop pode ser lateral, mobile deve virar bottom nav ou sheet.

### 5. Status visual consistente

Status deve ser percebido antes de lido:

- sucesso/em dia: fundo claro, verde contido;
- atencao: amber claro;
- risco: vermelho claro;
- informacao: azul/ciano claro;
- neutro: cinza claro.

Nunca usar status como decoracao.

### 6. Acao primaria unica

Cada bloco deve responder:

```text
Qual e o melhor proximo clique?
```

Se houver mais de uma acao forte, a hierarchy falhou.

### 7. Densidade profissional

Premium nao significa grande. Em workspace, premium significa:

- menos altura inutil;
- alinhamento forte;
- texto curto;
- actions previsiveis;
- linhas escaneaveis;
- detalhes em drawer/sheet.

## Aplicacao imediata por area

### Gestao

Direcao:

- central operacional em rows;
- fila do dia no topo;
- locais como linhas de workspace;
- cards apenas para estado vazio ou contexto especial;
- publicacao como acao secundaria.

### Competicoes

Direcao:

- escopo antes de resumo;
- fila de partidas antes da chave completa;
- chave como leitura, nao cockpit;
- organizador ve pendencias; jogador ve minha proxima partida.

### Home jogador

Direcao:

- proxima acao primeiro;
- compromissos, convites e pendencias;
- descoberta depois;
- historico compactado.

### Agenda

Direcao:

- hoje primeiro;
- reservas por horario/quadra como linhas;
- criacao em fluxo guiado;
- conflito visivel.

### Financeiro

Direcao:

- cobrar, receber e pendencias antes de relatorio;
- KPIs so depois da fila;
- clientes inadimplentes como rows acionaveis.

### Pagina publica

Direcao:

- marca e reserva em primeiro viewport;
- ofertas claras;
- menos admin copy;
- mobile com CTA sticky.

## Checklist visual antes de aprovar uma tela

- A acao primaria esta clara em 3 segundos?
- Existe dado zerado ocupando espaco nobre?
- A tela parece uma tarefa ou um painel generico?
- Cards poderiam virar rows?
- O mobile resolve a tarefa em poucos toques?
- Configuracao esta separada de rotina?
- Publicacao disputa com operacao?
- Texto pode ser cortado pela metade sem perder sentido?
- O estado vazio conduz a proxima acao?
- A hierarchy visual bate com a frequencia real de uso?

