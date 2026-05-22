# APP DNA Sprint 01 Report

Data: 2026-05-17

Escopo executado:

- `APP-DNA-01`
- `PLAYER-HOME-DNA-01`
- `SCREEN-HOME-01`
- `SCREEN-HOME-02`
- `SCREEN-NOTIFICATIONS-01`

## Objetivo

Iniciar a reestruturação com uma base reutilizável de UI e aplicar essa base na Home, sem redesenhar o app inteiro nem mexer em rotas profundas.

O foco foi reduzir a sensação de dashboard/backend na primeira dobra e criar primitives que os próximos sprints possam reaproveitar em Locais, Competição e Gestão.

## O que mudou

### Base de primitives

Foi criado `src/components/AppPrimitives.tsx` com:

- `PageHeader`: cabeçalho compacto para telas focadas.
- `ActionPanel`: painel de próxima ação ou fila curta.
- `ObjectRow`: row para listas operacionais e itens pessoais.
- `DiscoveryCarousel`: carrossel horizontal para descoberta.
- `CompactEmptyState`: estado vazio pequeno e acionável.
- `ScopeSelector`: seletor horizontal para escopos como classe, local, quadra ou data.
- `PrimaryAction`: botão padronizado para ações principais e secundárias.

### CSS compartilhado

`App.css` recebeu estilos base para esses primitives, incluindo responsividade mobile.

Regras aplicadas:

- card continua existindo, mas não deve ser o padrão para toda repetição;
- row é o padrão para listas operacionais;
- carrossel é o padrão para descoberta;
- empty state deve ser compacto;
- ações pessoais urgentes aparecem direto, não em carrossel.

### Home

A Home passou a usar:

- `ActionPanel` no bloco contextual principal;
- `ObjectRow` para as próximas ações;
- `DiscoveryCarousel` para eventos próximos, torneios abertos e destaques;
- CTA principal único no hero, preservando a lógica contextual existente.

O resultado esperado é uma primeira dobra mais direta: primeiro o que o jogador precisa fazer, depois ações rápidas, depois contexto pessoal e descoberta.

### Notificações

O sino de notificações recebeu:

- `aria-controls`;
- `role="dialog"`;
- `aria-modal="false"`;
- fechamento com `Escape`.

O componente preserva o popover/sheet existente e evita tratar notificações como bloco comum da página.

## Arquivos alterados

- `web/src/components/AppPrimitives.tsx`
- `web/src/App.css`
- `web/src/components/AppShell.tsx`
- `web/src/pages/HomePage.tsx`
- `web/docs/EXECUTION_QUEUE.md`
- `web/docs/CURRENT_PRODUCT_STATE.md`
- `web/docs/APP_DNA_SPRINT_01_REPORT_2026_05_17.md`

## Validação

Comandos executados:

```text
npm.cmd run lint
npm.cmd run build
```

Resultado:

- lint passou;
- build passou.

Screenshots:

- Foi iniciado Vite local em `http://127.0.0.1:5173/`.
- Chrome headless gerou capturas em `web/docs/screenshots/sprint-2026-05-17-app-dna-01/`.
- A captura autenticada não conseguiu sair do gate de login no ambiente headless, mesmo com credenciais demo e tentativa de injetar sessão local. Por isso, as imagens geradas servem apenas como evidência de ambiente local carregando e auth gate, não como validação visual final da Home autenticada.

## Riscos restantes

- A validação visual autenticada precisa ser repetida manualmente ou com Playwright instalado.
- Os primitives ainda estão aplicados principalmente na Home; os próximos sprints precisam migrar Locais, Competição e Gestão para evitar estilos paralelos.
- A Home ainda depende da qualidade dos dados existentes para o CTA contextual parecer realmente pessoal.

## Próximo sprint

Próximo item da queue:

- `PLAYER-LOCATIONS-DNA-01`
- `SCREEN-LOCAIS-01`

Objetivo: separar Locais por intenção e remover a sensação de página longa que mistura reserva, aulas, jogos e exploração.
