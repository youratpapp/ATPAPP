# Place Navigation Simplification - 2026-05-21

Fonte: pendencia `NAV-UX-02` registrada apos auditoria de menus duplicados.

## Diagnostico

Na gestao de local, a experiencia podia acumular camadas demais:

- seletor Jogador / Trabalho;
- unidade ativa quando o usuario tem mais de uma academia/local;
- sidebar ou bottom nav de Trabalho;
- tabs internas de modulo do local;
- subtabs internas do workspace;
- cards/atalhos de prioridade dentro do modulo.

Isso tornava confuso entender se `Aulas`, `Academia`, `Hoje`, `Turmas` e atalhos internos eram menus equivalentes ou niveis diferentes.

## Decisao de arquitetura

### Desktop

Desktop passa a usar a sidebar de Trabalho como navegacao principal de modulo:

- Trabalho: Hoje;
- Locais: Reservas, Aulas, Clientes, Financeiro, Cantina;
- Competicoes: Torneios, Ligas;
- Administracao: Equipe, Ajustes.

A pagina do local nao repete mais uma fileira de tabs de modulo. Dentro da pagina, ela mostra apenas:

- contexto da unidade;
- modulo ativo;
- status/pendencias;
- subtabs do workspace, quando existem.

### Mobile

Mobile mantem a bottom nav por papel como entrada principal:

- gestor: Hoje, Reservas, Aulas, Financeiro, Mais;
- professor: Hoje, Agenda, Turmas, Alunos, Perfil;
- recepcao/financeiro/caixa conforme papel.

Para nao esconder modulos fora da bottom nav, a pagina do local ganhou um seletor compacto:

- `Trocar area`;
- mostra apenas modulos permitidos;
- navega usando as rotas existentes.

Assim, o mobile evita uma fileira extra de tabs de modulo, mas ainda permite chegar em areas como `Clientes`, `Equipe`, `Ajustes` ou `Cantina` quando autorizadas.

## Correcoes aplicadas

### `src/components/place/PlaceAdminShell.tsx`

- Removida a fileira `place-management-tabs` do shell ativo de gestao.
- Adicionado `place-module-picker` como seletor compacto de modulo.
- O contexto do modulo continua mostrando descricao e pendencias.
- O seletor lista apenas `visibleModules`, isto e, modulos permitidos para aquele local/papel.

### `src/components/BottomNav.tsx`

- A navegacao de Trabalho agora detecta o `placeId` atual em rotas `/gestao/:placeId/...`.
- Atalhos de `Reservas`, `Aulas`, `Clientes`, `Financeiro`, `Cantina`, `Equipe` e `Ajustes` permanecem dentro da unidade ativa.
- Isso reduz a confusao de usuarios com multiplas academias, evitando voltar silenciosamente para a unidade primaria ao tocar em um modulo.

### `src/App.css`

- Estilizado `place-module-picker` no mesmo padrao premium dark.
- Em desktop, o seletor de modulo fica oculto para nao competir com a sidebar.
- Em mobile, o seletor fica em largura total dentro do contexto do modulo.

## Rotas preservadas

Nenhuma rota foi removida.

Continuam funcionando:

- `/gestao`;
- `/gestao/:placeId/painel`;
- `/gestao/:placeId/agenda?visao=...`;
- `/gestao/:placeId/academia?visao=...`;
- `/gestao/:placeId/clientes?visao=...`;
- `/gestao/:placeId/financeiro?visao=...`;
- `/gestao/:placeId/cantina?visao=...`;
- `/gestao/:placeId/equipe?visao=...`;
- `/gestao/:placeId/ajustes?visao=...`.

## Evidencias

Capturas:

- `docs/screenshots/place-navigation-simplification-2026-05-21-run2/`

Viewports:

- mobile 390px;
- mobile 430px;
- desktop 1366px;
- desktop amplo.

Rotas auditadas:

- `#/gestao`;
- `#/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/academia?visao=hoje`;
- `#/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/agenda?visao=hoje`;
- `#/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/financeiro?visao=recebiveis`.

Verificacao:

- `npx tsc -b --pretty false` passou.

## Pendencias futuras

- Auditar se cada workspace interno precisa mesmo de todas as subtabs atuais, especialmente academia e reservas.
- Revisar labels de workspace para evitar sinonimos concorrentes, por exemplo `Aulas` na sidebar e `Academia` no contexto.
- Testar com usuarios reais que tenham permissoes diferentes por unidade, porque a sidebar global ainda se baseia nos modulos da unidade primaria para decidir quais itens mostrar.

