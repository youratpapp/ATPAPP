# Design Tokens

Fonte principal: `PREMIUM_UX_VISUAL_LANGUAGE.md`, `VISUAL_REFERENCE_SYSTEM.md` e `web/src/styles/theme.css`.

Data: 2026-05-13

## Objetivo

Registrar tokens visuais praticos para manter o app consistente e premium. Este documento nao substitui o CSS atual; ele define como os tokens devem ser usados.

## Filosofia

```text
Menos tema, mais sistema.
```

O app deve usar cores, espacamento e sombras para orientar acao, status e contexto. Nao para decorar.

## Cores base atuais

| Token | Valor atual | Uso correto |
| --- | --- | --- |
| `--color-bg` | `#f5f7f6` | fundo geral calmo |
| `--color-surface` | `#ffffff` | superficies principais |
| `--color-surface-muted` | `#f8fafc` | rows, chips e areas secundarias |
| `--color-border` | `#e4e9ef` | divisao leve |
| `--color-border-strong` | `#c8d2df` | separacao mais visivel |
| `--color-text` | `#0d172a` | texto principal |
| `--color-text-muted` | `#40506a` | metadado importante |
| `--color-text-subtle` | `#66758c` | contexto secundario |
| `--color-primary` | `#16804e` | acao principal |
| `--color-primary-soft` | `#e8f7ef` | fundo de acao/sucesso leve |
| `--color-primary-strong` | `#12613a` | texto/icone de acao |

## Status

| Status | Fundo | Texto | Uso |
| --- | --- | --- | --- |
| Em dia | `--color-status-open-bg` | `--color-status-open-fg` | sucesso operacional calmo |
| Ao vivo | `--color-status-live-bg` | `--color-status-live-fg` | partida, agenda ou fluxo ativo |
| Neutro | `--color-status-closed-bg` | `--color-status-closed-fg` | sem acao imediata |
| Finalizado | `--color-status-finished-bg` | `--color-status-finished-fg` | historico |
| Atencao | `#fff7ed` | `#9a3412` | setup incompleto, alerta leve |
| Risco | `#fef2f2` | `#b91c1c` | erro, atraso critico |

Regra:

```text
Status forte aparece so quando muda prioridade de acao.
```

## Tipografia

| Token | Uso |
| --- | --- |
| `--font-size-xs` | labels, status, metadados |
| `--font-size-sm` | corpo compacto, rows |
| `--font-size-md` | texto base e CTA |
| `--font-size-lg` | titulo de bloco |
| `--font-size-xl` | titulo de entidade ou tela compacta |
| `--font-size-2xl` | numero importante ou titulo forte |
| `--font-size-3xl` | hero publico, nao operacao diaria |

Regras:

- Operacao usa `xs`, `sm`, `md` e poucos `xl`.
- Publico/marketing pode usar `2xl` e `3xl`.
- Nao usar fonte gigante dentro de cards compactos.
- Letter spacing deve ser 0, salvo labels uppercase muito curtos.

## Spacing

| Token | Valor | Uso |
| --- | --- | --- |
| `--space-1` | 4px | micro gap, label/titulo |
| `--space-2` | 8px | gap interno de row/chip |
| `--space-3` | 12px | padding compacto operacional |
| `--space-4` | 16px | padding padrao de bloco |
| `--space-5` | 20px | respiro de pagina |
| `--space-6` | 24px | desktop/sessoes |
| `--space-8` | 32px | separacao grande |
| `--space-10` | 40px | hero/publico, usar pouco |

Regras:

- Rows: `space-2` a `space-3`.
- Cards operacionais: `space-3` a `space-4`.
- Shell/header: `space-4`.
- Mobile: reduzir padding lateral, nao reduzir alvo de toque.

## Radius

| Token | Uso |
| --- | --- |
| `--radius-sm` | rows, inputs, chips grandes |
| `--radius-md` | cards e superficies |
| `--radius-lg` | shells, drawers, public hero |
| `--radius-xl` | usar raro; pagina publica/marketing |
| `--radius-pill` | badges, chips, tab pills |

Regra:

```text
Radius alto demais em operacao deixa o app com cara de template amigavel demais.
```

## Shadows

| Token | Uso |
| --- | --- |
| `--shadow-xs` | elevacao minima |
| `--shadow-sm` | card/surface principal |
| `--shadow-md` | public hero ou overlay importante |
| `--shadow-lg` | modal/drawer/estado elevado |
| `--shadow-focus` | foco de acessibilidade |

Regras:

- Operacao usa pouca sombra.
- Hierarquia deve vir de layout e texto, nao sombra.
- Evitar sombra em todos os cards.

## Tamanhos operacionais recomendados

| Componente | Desktop | Mobile |
| --- | --- | --- |
| Header operacional | 72-112px | auto compacto |
| Operational row | 56-72px | 64-84px |
| Entity row | 52-68px | 72-96px |
| Primary button | 36-42px | 44-48px |
| Secondary button | 32-38px | 42-46px |
| Chip/status | 24-30px | 26-32px |
| Drawer | 420-560px | bottom sheet 82vh |

## Action tokens conceituais

| Tipo | Visual | Exemplo |
| --- | --- | --- |
| Primary | verde solido | Abrir operacao, Confirmar, Cobrar |
| Secondary | branco/borda, sombra minima | Pagina publica, Buscar, Copiar link |
| Quiet | transparente, sem sombra, borda so no hover | Ver detalhes, Ajustar filtros, atalhos de modulo |
| Danger | vermelho contido | Cancelar reserva |
| Setup | amber suave | Completar base |

Regra:

```text
Se tudo e primary, nada e primary.
```

## Layout tokens conceituais

| Nome | Regra |
| --- | --- |
| `workspace-max` | conteudo operacional deve caber confortavelmente no desktop |
| `row-grid` | identidade, status, contexto, acao |
| `surface-subtle` | borda leve, fundo branco, sombra minima |
| `surface-quiet` | fundo muted, sem sombra |
| `surface-critical` | alerta com cor de status, nao hero |
| `mobile-sheet` | bottom sheet para escolha/detalhe |

## Checklist de aplicacao

- Usa tokens existentes antes de criar cor nova?
- Zeros foram tratados como estado calmo?
- Acao primaria usa `primary`; secundaria nao compete?
- Acoes de suporte usam `quiet` quando nao devem disputar a decisao principal?
- Row tem altura suficiente para toque?
- Mobile nao depende de grid desktop?
- Status usa cor com significado?
- Sombra esta justificando hierarchy?
- Radius esta consistente com o contexto?
- Texto principal e metadado usam pesos diferentes?
- O componente parece parte do produto, nao Tailwind padrao?
