# Navigation Structure

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Principio

Navegacao deve seguir profundidade operacional, nao quantidade de funcionalidades. O menu principal fica curto; a organizacao real acontece dentro de shells por contexto.

## Niveis

### L0 - Navegacao global

Entradas:

- Inicio
- Competicoes
- Gestao
- Locais
- Ranking
- Perfil

Regra: nao adicionar item global para cada modulo administrativo. `Gestao` e a unica porta global da operacao de academia/clube; agenda, academia, financeiro, cantina, equipe e ajustes continuam dentro do workspace da entidade.

No desktop, a navegacao global deve comunicar contexto sem aumentar rotas:

- `Jogar`: Inicio, Competicoes, Ranking.
- `Operar`: Gestao, Locais.
- `Conta`: Perfil.

No mobile, esses grupos nao aparecem como cabecalhos; a bottom nav continua simples e curta.

### L1 - Hubs de dominio

Exemplos:

- Competicoes
- Gestao
- Locais
- Ranking

Responsabilidade: descoberta, lista, criacao inicial e acesso aos workspaces.

`Gestao` tem responsabilidade diferente de `Locais`: e a central de operacao diaria para donos/equipe. `Locais` continua sendo descoberta, pagina publica e criacao inicial.

### L2 - Workspace de entidade

Exemplos:

- Torneio
- Liga
- Local admin
- Pagina publica do local

Responsabilidade: manter contexto de uma entidade especifica.

### L3 - Modulos/subvisoes

Exemplos em local admin:

- Agenda
- Academia
- Clientes
- Financeiro
- Cantina
- Equipe
- Ajustes

Exemplos em competicao:

- Operacao
- Partidas
- Participantes
- Classificacao
- Publicacao
- Configuracao
- Chat

Responsabilidade: separar responsabilidades sem sair do contexto da entidade.

### L4 - Drawers, modais, action sheets e wizards

Uso:

- detalhe de entidade;
- historico;
- confirmacao;
- criacao complexa;
- acoes secundarias.

Regra: no mobile, detalhes e acoes secundarias devem preferir drawer/action sheet em vez de empilhar tudo na pagina.

## Estrutura recomendada para local

Atual:

- `/locais`
- `/locais/:placeId`
- `/gestao`
- `/gestao/:placeId/:module`

Direcao:

- `/locais`: descoberta/lista.
- `/locais/:placeId`: pagina publica.
- [feito] `/gestao`: central operacional dos locais acessiveis.
- [feito] `/gestao/:placeId/painel`: cockpit do local.
- [feito] `/gestao/:placeId/agenda`
- [feito] `/gestao/:placeId/academia`
- [feito] `/gestao/:placeId/clientes`
- [feito] `/gestao/:placeId/financeiro`
- [feito] `/gestao/:placeId/cantina`
- [feito] `/gestao/:placeId/equipe`
- [feito] `/gestao/:placeId/ajustes`
- [legado] `/locais/:placeId/admin`: compatibilidade; deve normalizar para `/gestao`.

## Regras para tabs

- Tabs horizontais devem ter ate 5 opcoes principais.
- Acima disso, usar seletor, menu ou subnavegacao interna.
- Tabs devem separar contexto, nao status pequeno.
- Filtros de status ficam dentro da aba, nao como navegacao principal.

## Regras mobile

- Uma acao primaria por viewport.
- Header contextual compacto e persistente quando necessario.
- CTA principal no topo do bloco ou sticky bottom action quando a acao final depende de scroll.
- Evitar cards com mais de 2 botoes visiveis.
- Acoes secundarias em menu, accordion ou action sheet.

## Regras desktop

- Usar largura util, nao espalhar informacao ate a borda.
- Permitir layout em duas colunas apenas quando a coluna secundaria for contexto, nao outro fluxo.
- Fila operacional sempre antes de relatorio detalhado.

## Evolucoes registradas

- 2026-05-13: criada entrada global `/gestao` como central operacional de donos/equipe, separando operacao diaria da descoberta publica de `Locais`.
- 2026-05-13: rotas administrativas canonicas migraram para `/gestao/:placeId/:module`; rotas antigas `/locais/:placeId/admin` permanecem como compatibilidade e normalizam para a nova estrutura.
- 2026-05-13: criada rota `/locais/:placeId/admin` e subrota `/locais/:placeId/admin/:module`, separando entrada administrativa da pagina publica do local.
- 2026-05-13: hub de locais passou a oferecer CTA `Gestao` para usuarios com acesso administrativo, enquanto a pagina publica manteve CTA separado para o dono entrar na operacao.
- 2026-05-13: subrotas administrativas passaram a usar nomes operacionais em portugues e sincronizar com a troca de modulo no cockpit.
- 2026-05-13: rota administrativa normaliza automaticamente para um modulo permitido pelo plano/acesso do usuario, evitando URL valida com contexto operacional invalido.
- 2026-05-13: subvisoes internas do admin passaram a usar `?visao=` com slugs em portugues, permitindo link direto para rotinas como calendario da agenda, turmas da academia, recebiveis financeiros e estoque da cantina.
- 2026-05-13: `?visao=` invalida ou tecnica passou a ser normalizada para a visao padrao/canonica do modulo, evitando estado visual divergente da URL.
- 2026-05-13: contrato tecnico de slugs, parser e construcao de URL do admin de locais foi centralizado em `place-admin-navigation`.
- 2026-05-13: resolucao de subvisao administrativa foi centralizada em `resolvePlaceAdminView`, mantendo defaults e canonizacao em um unico contrato.
- 2026-05-13: sincronizacao de rota administrativa de local passou para `usePlaceAdminRouteSync`, separando contrato navegavel da renderizacao da tela.
- 2026-05-13: sidebar desktop passou a agrupar navegacao global em Jogar, Operar e Conta, com chip de contexto (`Player App`, `Competition OS`, `Management OS`) e mobile preservado como bottom nav simples.
- 2026-05-13: entradas internas de `/gestao` passaram a priorizar destino por papel: professor abre Academia/Hoje, recepcao abre Agenda/Calendario e gestor abre dashboard operacional.
- 2026-05-13: `/eventos` preserva `Organizar evento` como opcao contextual em Descobrir, sem roteiro administrativo nobre para jogador comum sem competicao organizada.
- 2026-05-13: quick actions administrativas passaram a aceitar subvisao de destino; `Cadastrar professor` abre Academia/Professores, `Criar turma` abre Academia/Turmas, `Publicar pagina` abre Ajustes/Estrutura editavel e acoes originadas em Recursos tambem mudam para a tela executavel.
