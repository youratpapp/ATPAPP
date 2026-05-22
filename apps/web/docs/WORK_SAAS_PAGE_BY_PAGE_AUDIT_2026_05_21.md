# Work SaaS Page By Page Audit - 2026-05-21

## Escopo Real

Esta rodada auditou o app como produto, nao apenas como CSS. A varredura cobriu Player App, Competition OS e Management OS em mobile 390px, mobile 430px, desktop 1366px e desktop amplo.

Evidencias geradas:

- Rotas auditadas: `docs/PAGE_BY_PAGE_AUDIT_ROUTES_2026_05_21.json`
- Metadados: `docs/PAGE_BY_PAGE_AUDIT_META_TABLE_2026_05_21.txt`
- Screenshots: `docs/screenshots/page-by-page-saas-audit-2026-05-21`
- Volume da rodada: 140 screenshots, 283 arquivos, 148.43 MB
- Console: 0 erros capturados na rodada ampla

## Diagnostico Executivo

O app esta visualmente muito mais perto do DNA premium aprovado, mas ainda existem problemas reais de SaaS:

1. A navegacao ainda mistura contexto em alguns cenarios de trabalho.
2. A navegacao de local usava modulos da unidade primaria, mesmo quando o usuario estava dentro de outra unidade.
3. Rotas com query string eram tratadas como a mesma pagina, marcando dois itens de menu ao mesmo tempo.
4. A area de competicao operacional ainda tem densidade alta no mobile.
5. Alguns fluxos de local com modulo nao disponivel caem no painel, mas a sidebar antiga sugeria que o modulo existia.
6. Paginas publicas de local nao tinham `h1` semantico, apesar de terem titulo visual.
7. A estrutura web trabalho ainda precisa evoluir para um SaaS com selector de unidade, busca, breadcrumbs e hierarquia por dominio.

## Pagina A Pagina

| Area | Rota | Resultado | Achado | Acao |
| --- | --- | --- | --- | --- |
| Inicio jogador | `#/inicio` | OK | Hierarquia clara, DNA visual consistente, CTA cedo. | Manter. |
| Jogar | `#/locais` | OK melhorado | Cards e hero estao bem mais claros; sem sobreposicao critica na auditoria. | Manter e seguir monitorando copy. |
| Jogar intent reserva | `#/locais?intent=booking` | OK | Fluxo direto, mas depende do detalhe de local para concluir reserva. | Futuro: sucesso com "ver na rotina". |
| Jogar intent aulas | `#/locais?intent=classes` | OK | Aulas aparecem, mas precisa seguir separando aula pessoal de operacao da academia. | Manter fronteira pessoal/trabalho. |
| Jogar intent partidas | `#/locais?intent=matches` | OK | Bom volume de dados; mobile tem bastante conteudo, mas toleravel. | Futuro: priorizar proximo passo. |
| Competir jogador | `#/eventos` | OK | Botao Trabalho nao vazou no screenshot atual; cards legiveis. | Manter. |
| Torneios jogador | `#/eventos/torneios` | OK | Lista simples e clara. | Manter. |
| Ligas jogador | `#/eventos/ligas` | OK | Lista simples e clara. | Manter. |
| Torneio jogador jogos | `#/eventos/:id/jogos` | OK | Rota preservada e sem erro de console. | Manter. |
| Torneio jogador classificacao | `#/eventos/:id/classificacao` | OK | Rota preservada. | Manter. |
| Torneio operacional | `#/eventos/:id/organizacao` | Parcial | No mobile ainda havia nav de local (`Agenda/Aulas/Receita`) dentro da operacao de torneio. | Corrigido: rota de competicao em modo trabalho usa nav de competicao. |
| Torneios organizador | `#/eventos/torneios?view=organizing` | Parcial | Funciona, mas ainda tem muitos controles e densidade alta. | Futuro: cockpit por fase mais compacto. |
| Ligas organizador | `#/eventos/ligas?view=organizing` | Parcial | Funciona, mas precisa evoluir a fase/pendencia como primeira dobra. | Futuro. |
| Liga participante/owner | `#/eventos/ligas/:id` | OK parcial | Conteudo acessivel; owner ainda precisa de separacao mais forte entre operacao e configuracao. | Futuro. |
| Rotina pessoal | `#/agenda` | OK | Consolidou reservas, aulas, pagamentos e historico. Nome "Rotina" no menu esta coerente com pedido anterior. | Manter. |
| Perfil | `#/perfil` | OK | Avatar e textos estavam alinhados nos screenshots atuais. | Manter. |
| Local publico | `#/locais/:id` | Parcial | Visual OK, mas sem `h1` semantico nos metadados. | Corrigido: titulo do local virou `h1`. |
| Local publico reserva | `#/locais/:id/reservar` | Parcial | Mesmo problema de `h1`; fluxo depende do detalhe de reserva. | Corrigido semantica do hero. |
| Local publico aulas | `#/locais/:id/aulas` | Parcial | Mesmo problema de `h1`; conteudo ok. | Corrigido semantica do hero. |
| Trabalho Hoje | `#/gestao` | OK parcial | Primeira dobra e cards funcionam, mas 55-61 elementos clicaveis indicam alta densidade. | Futuro: compactar por papel e pendencia. |
| Gestao painel local | `#/gestao/:placeId/painel` | OK parcial | Painel existe, mas contexto do modulo pode ficar redundante. | Futuro: SaaS shell com breadcrumb. |
| Gestao calendario | `#/gestao/:placeId/agenda?visao=calendario` | Problema real | Sidebar marcava `Calendario` e `Reservas` como ativos ao mesmo tempo. | Corrigido: active state agora considera query string. |
| Gestao reservas | `#/gestao/:placeId/agenda?visao=reservas` | OK parcial | Reserva/espera estao mais limpos, mas fluxo de reagendamento e WhatsApp ainda precisa produto. | Futuro: fluxo de alteracao de reserva. |
| Gestao nova reserva | `#/gestao/:placeId/agenda?visao=nova-reserva` | OK parcial | Funciona como acao; nao deve virar submenu pesado. | Futuro: CTA contextual. |
| Academia hoje | `#/gestao/:placeId/academia?visao=hoje` | OK parcial | Boa separacao, mas chamada deve ser opcional por empresa e padrao desligado. | Futuro/pendente de configuracao. |
| Academia calendario | `#/gestao/:placeId/academia?visao=calendario` | OK parcial | Professor precisa agenda por dia/hora cheia; a base existe. | Futuro: ajustar modelo visual horario. |
| Academia turmas | `#/gestao/:placeId/academia?visao=turmas` | OK parcial | Ainda precisa virar modulo SaaS web mais profundo. | Futuro. |
| Academia alunos | `#/gestao/:placeId/academia?visao=alunos` | Parcial | Modal de aluno ja foi apontado como problema de responsividade. | Futuro: modal responsivo em viewport. |
| Pessoas/clientes | `#/gestao/:placeId/pessoas?visao=rotina` | Problema real | Rota caiu no painel porque a unidade auditada nao tinha modulo. Sidebar, antes, podia sugerir item inexistente. | Corrigido: nav passa a usar modulos da unidade ativa. |
| Receita recebiveis | `#/gestao/:placeId/receita?visao=recebiveis` | OK parcial | Esta separado do financeiro pessoal, mas ainda e modulo inicial. | Futuro: financeiro SaaS completo. |
| Receita pagos | `#/gestao/:placeId/receita?visao=pagos` | OK parcial | Rota preservada. | Manter. |
| Cantina/POS | `#/gestao/:placeId/cantina?visao=vender` | Problema real | Rota caiu no painel quando modulo nao existe na unidade ativa. | Corrigido menu por unidade ativa. |
| Equipe | `#/gestao/:placeId/equipe` | OK | Permissoes/admin fora da rotina. | Manter. |
| Ajustes | `#/gestao/:placeId/ajustes` | OK | Setup raro fica fora da rotina. | Manter. |

## Correcoes Aplicadas Nesta Rodada

1. Navegacao por unidade ativa:
   - Antes: sidebar/bottom nav mostravam modulos da unidade primaria.
   - Agora: se o usuario esta em `/gestao/:placeId`, os itens sao calculados pelos modulos daquela unidade.

2. Active state com query string:
   - Antes: `/agenda?visao=calendario` e `/agenda?visao=reservas` podiam acender o mesmo grupo.
   - Agora: item com query so fica ativo quando a query bate.

3. Competition OS em modo trabalho:
   - Antes: uma rota operacional de torneio podia exibir nav mobile de local.
   - Agora: rotas `/eventos...` em modo trabalho usam nav de competicao (`Hoje`, `Torneios`, `Ligas`, `Publicacao`, `Perfil`).

4. Semantica do local publico:
   - Antes: titulo visual do local era `h2`, e a auditoria nao encontrava `h1`.
   - Agora: o nome do local no hero publico e `h1`, mantendo a aparencia.

## Rechecagem Pos-P0

Rodada focada:

- Pasta: `docs/screenshots/page-by-page-saas-audit-p0-recheck-2026-05-21`
- Rotas: calendario do local, reservas do local, torneio operacional, local publico, pessoas e cantina/POS.
- Viewports: mobile 390px, mobile 430px, desktop 1366px, desktop amplo.
- Console: 0 eventos de erro/warning capturados.

Validado visualmente:

- `Calendario` fica ativo sozinho em `?visao=calendario`; `Reservas` nao fica ativo junto.
- Torneio operacional mobile mostra nav de Competition OS (`Hoje`, `Torneios`, `Ligas`, `Publicacao`, `Perfil`) em vez de nav de local.
- Local publico voltou com `h1` real nos metadados.
- Sidebar da unidade auditada nao mostra `Pessoas` e `Cantina/POS` quando esses modulos nao estao disponiveis para aquela unidade ativa.

Ainda observado:

- Em gestao local, o contexto superior ainda pode ficar semanticamente confuso em alguns modulos (`ADMIN | ACADEMIA: TURMAS` apareceu acima de uma tela de agenda). Nao quebrou fluxo, mas deve entrar no SaaS Shell/Breadcrumb da proxima camada.
- O cockpit mobile de torneio continua denso. A navegacao esta correta, mas a pagina ainda precisa compactacao por fase.

## Problemas Que Nao Devem Ser Maquiados

Estes pontos ainda exigem rodada de produto/arquitetura, nao apenas CSS:

1. SaaS web trabalho ainda precisa de shell profissional:
   - selector de unidade;
   - breadcrumbs;
   - busca global;
   - dominios claros;
   - paginas de detalhe;
   - contexto da entidade ativa.

2. Trabalho Hoje ainda tem alta densidade:
   - precisa ficar mais "fila de bloqueios" e menos vitrine de tudo.

3. Torneio operacional mobile ainda e pesado:
   - a solucao ideal e cockpit por fase com uma unica prioridade por dobra.

4. Academia precisa decisao de presenca:
   - chamada deve ser configuravel por empresa e padrao desligado.

5. Aluno/modal ainda precisa responsividade final:
   - detalhe de aluno deve abrir em modal adaptativo ou painel lateral, conforme viewport.

6. Reservas precisam fluxo completo de alteracao:
   - admin/secretaria/gerente editam manualmente;
   - jogador altera por link/agendamento enviado;
   - WhatsApp deve ser comunicacao contextual, nao etapa obrigatoria de reserva.

7. Clientes/Pessoas precisa reposicionamento:
   - hoje mistura contato, aluno, socio e relacionamento;
   - destino ideal e um modulo de Pessoas/CRM com entidades e estados claros.

8. Financeiro precisa arquitetura completa:
   - separar pessoal, recebiveis, cobrancas, despesas, resumo, planos e pagamentos de reservas.

## Criterio de Verdade

O produto nao esta "perfeito" ainda. Ele esta em um nivel visual bom, com algumas correcoes estruturais importantes feitas nesta rodada. Para virar SaaS profissional, a proxima camada precisa mudar shell, dominios, multiunidade, pagina de entidade e fluxos profundos, sem tentar resolver tudo com mais tabs dentro da mesma tela.
