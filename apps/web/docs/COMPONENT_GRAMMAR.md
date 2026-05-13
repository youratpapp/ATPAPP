# Component Grammar

Fonte principal: `PREMIUM_UX_VISUAL_LANGUAGE.md` e `VISUAL_REFERENCE_SYSTEM.md`.

Data: 2026-05-13

## Objetivo

Definir como componentes devem parecer e se comportar no app. Este documento e pratico: ele orienta composicao, densidade, CTA, desktop/mobile e anti-patterns.

## Regras globais

1. Todo componente deve ter uma funcao operacional clara.
2. Estado vazio nao deve ocupar o mesmo peso de pendencia real.
3. Acao primaria aparece uma vez por contexto.
4. Detalhes vao para drawer, bottom sheet ou subvisao.
5. Mobile usa rows e sheets; desktop usa rows, paines e tabelas.
6. Card e excecao em operacao diaria; row e padrao.
7. `primary` e reservado para a proxima acao; `secondary` e alternativa com borda; `quiet` e suporte sem competir.

## OperationalQueue

Uso:

- pendencias do dia;
- confirmacoes;
- resultados pendentes;
- cobrancas;
- leads para contato;
- estoque baixo.

Anatomia:

```text
[status/numero] [titulo da tarefa]
                [contexto curto]
                                  [acao primaria]
```

Visual:

- altura desktop: 56-72px;
- altura mobile: 64-84px;
- fundo branco ou muted;
- borda leve;
- status a esquerda;
- CTA a direita no desktop;
- CTA abaixo ou full-width no mobile quando necessario.
- em competicoes, pendencias devem parecer rows, nao cards de KPI.
- detalhe/status deve ficar a direita no desktop e abaixo no mobile.

Correto:

```text
3 reservas pendentes | Hoje, quadras 1 e 2 | Revisar
```

Incorreto:

```text
Card grande com titulo, KPI, texto longo, 3 botoes e grafico.
```

## EntityActionRow

Uso:

- aluno;
- cliente;
- reserva;
- turma;
- professor;
- produto;
- partida;
- local.
- recebivel financeiro.

Anatomia:

```text
[avatar/icone] [nome + contexto] [status chips] [metadados] [acao primaria]
```

Desktop:

- grid com colunas fixas para status/acoes;
- texto principal com truncamento;
- botao principal pequeno e claro;
- acoes raras em overflow/drawer.

Mobile:

- primeira linha: nome + status;
- segunda linha: contexto;
- terceira linha: acao principal full-width se for tarefa urgente.

Anti-pattern:

- transformar cada entidade em card alto;
- repetir todos os metadados quando bastam 2;
- deixar 4 botoes equivalentes.

Uso atual no produto:

- CRM do local: lead/cliente com interesse, origem, responsavel, follow-up e acao primaria contextual.
- Financeiro do local: recebivel com cliente/turma, valor, status e lembrete como acao primaria.
- Cantina: produto com categoria, preco, estoque e status de estoque.
- Academia: turma com horario, professor/quadra/nivel, ocupacao, pendencias e metricas de suporte.

Variacao importante:

- status pode aparecer como badge discreto junto do titulo quando a linha precisa preservar densidade;
- follow-up vencido pode elevar borda/status, mas nao deve transformar a linha em card de alerta grande.

## Sidebar

Uso:

- desktop de Management OS;
- admin de local;
- Competition OS para organizador.

Anatomia:

```text
Produto/Contexto
Modulo ativo
Grupo principal
Grupo secundario/configuracao
Conta/ajuda
```

Visual:

- largura: 232-260px;
- fundo branco ou navy muito discreto;
- item ativo com barra lateral ou capsule suave;
- sem bordas pesadas em cada item.
- desktop pode agrupar entradas globais em Jogar, Operar e Conta.
- contexto atual pode aparecer como chip curto: Player App, Competition OS ou Management OS.

Mobile:

- nao comprimir sidebar;
- usar bottom nav global + module switcher/bottom sheet.
- esconder cabecalhos de grupo e manter apenas itens essenciais.

Anti-pattern:

- todos os modulos visiveis para todos;
- icones decorativos sem funcao;
- item ativo apenas por cor fraca.
- atalhos de modulo com peso de botao primario.

## Topbar / ContextHeader

Uso:

- explicar onde o usuario esta;
- mostrar papel, local, escopo, data;
- oferecer acao primaria contextual.

Anatomia:

```text
[eyebrow] [titulo] [subtitulo curto]        [2-3 sinais compactos] [acao]
```

Desktop:

- compacto;
- uma superficie leve;
- stats como chips, nao cards grandes.

Mobile:

- titulo curto;
- stats podem virar linha scroll horizontal;
- acao primaria pode ir para sticky action.

Anti-pattern:

- hero grande em area operacional;
- descricao longa;
- 6 KPIs antes da fila.

## MetricStrip

Uso:

- sinais de suporte;
- nao e dashboard principal.

Regra:

- 2 a 4 metricas;
- esconder ou colapsar zeros sem valor operacional;
- nao usar como primeira coisa se ha pendencia.

Formato:

```text
[12 hoje] [3 pendentes] [R$ 820 aberto]
```

Anti-pattern:

- grid de cards com 0, 0, 0, 0.

## EmptyState

Uso:

- setup inicial;
- tela sem pendencia;
- lista sem resultado.

Tipos:

- Setup: explica primeira acao.
- Calm: informa que esta tudo em dia.
- Search: sugere ajustar filtro.
- Permission: explica acesso/plano.

Visual:

- uma superficie leve;
- titulo claro;
- texto curto;
- uma acao primaria;
- sem ilustracao generica.

## Drawers

Uso:

- detalhes de cliente/reserva;
- historico;
- edicao curta;
- acoes secundarias.

Desktop:

- lateral direita;
- largura 420-560px;
- header fixo;
- footer de acoes.

Mobile:

- bottom sheet;
- altura maxima 82vh;
- swipe/fechar claro;
- acoes no rodape.

Anti-pattern:

- modal central grande com formulario longo;
- drawer para tarefa que deveria ser pagina/wizard.

## BottomSheets

Uso mobile:

- escolher modulo;
- filtros;
- quick actions;
- editar detalhe curto.

Regras:

- abrir de baixo;
- titulo curto;
- acoes grandes;
- maximo 5 escolhas principais;
- listas longas precisam busca.
- usar `ResponsiveFilterSheet` quando o filtro deve ficar inline no desktop e virar sheet no mobile.
- o botao mobile deve resumir o escopo ativo, nao apenas dizer "Filtros".
- desktop nao deve esconder filtro frequente em sheet quando a operacao depende dele.

## QuickActions

Uso:

- reservar quadra;
- cobrar cliente;
- lancar resultado;
- registrar venda;
- confirmar presenca;
- adicionar aluno.
- cadastrar quadra;
- cadastrar professor;
- criar turma;
- criar torneio;

Anatomia:

```text
[acao] [atalho opcional] [contexto minimo]
```

Desktop:

- pode viver no header, command palette ou barra contextual.

Mobile:

- uma acao sticky quando for a tarefa principal;
- sheet para grupo de acoes.

Anti-pattern:

- botao flutuante generico com muitas acoes sem prioridade.

Variacao: SemanticQuickAction

Uso:

- setup inicial;
- onboarding operacional;
- entrada de perfil;
- tarefas que o usuario procura por intencao.

Regra:

```text
O texto deve ser a tarefa real: Cadastrar quadra, Cadastrar professor, Criar torneio.
```

Nao usar:

- Recursos;
- Configurar modulo;
- Gerenciar itens;
- Abrir ferramenta.

Comportamento:

- aparece apenas se o plano/papel permite;
- se faltar dependencia, leva ao passo anterior;
- se a tarefa ja estiver resolvida, vira secundaria ou some;
- mobile pode abrir bottom sheet com no maximo 5 tarefas principais.

## ProgressiveForms

Uso:

- reserva/bloqueio;
- captura de lead;
- cadastro de produto;
- lancamento financeiro simples;
- edicao curta de entidade.

Regra principal:

```text
Campos frequentes no composer. Campos raros em avancado, drawer, sheet ou wizard.
```

Desktop:

- primeira linha deve conter apenas o necessario para concluir a tarefa recorrente;
- acao primaria fica visivel e unica;
- acoes alternativas ficam `secondary` ou `quiet`;
- detalhes raros usam disclosure (`Opcoes avancadas`) ou drawer.

Mobile:

- campos essenciais empilham em ordem de decisao;
- CTA principal deve ter largura confortavel;
- detalhes raros ficam abaixo de summary ou em bottom sheet;
- formulario nao deve ocupar a primeira viewport antes da fila operacional.

Correto:

```text
Quadra | Inicio | Fim | Buscar | Reservar
Opcoes avancadas: observacao, repetir, bloquear, lista de espera
```

Incorreto:

```text
Formulario com 8 campos, 4 botoes equivalentes e lista de resultados todos no mesmo bloco.
```

Uso atual no produto:

- criacao de reserva no admin do local: campos essenciais ficam no composer principal; observacao, repeticao, bloqueio e lista de espera ficam em `Opcoes avancadas`.
- CRM do local: contatos/leads aparecem antes da captura; novo contato expande apenas quando necessario.
- Cantina: venda rapida fica como rotina principal; cadastro de produto fica progressivo e auxiliar ao catalogo.

## PublicHero

Uso:

- pagina publica do local;
- inscricao publica;
- descoberta de clube/competicao.

Regras:

- marca, localidade e oferta principal na primeira viewport;
- uma CTA primaria de conversao;
- acao secundaria apenas se ampliar conversao, como turmas;
- acoes internas/gestao devem ser quiet;
- divulgacao/widget fica depois da conversao;
- mobile pode usar CTA sticky quando reserva/inscricao for objetivo principal.

## Tables

Uso:

- financeiro;
- CRM;
- ranking;
- historico operacional;
- estoque.

Desktop:

- headers pequenos;
- row height 44-56px;
- filtros acima e discretos;
- acoes de linha no fim;
- overflow horizontal apenas quando inevitavel.

Mobile:

- tabela vira row/card compacto;
- mostrar 3 informacoes essenciais;
- detalhe em bottom sheet.

Anti-pattern:

- tabela com 10 colunas em mobile;
- card por linha com todos os campos.

## Filters

Uso:

- estado;
- data;
- modulo;
- classe/categoria;
- pagamento.

Regras:

- filtros frequentes visiveis;
- filtros raros em drawer/sheet;
- chips de filtro ativo precisam ser removiveis;
- default deve ser a rotina mais comum.

## Mobile Rows

Anatomia:

```text
[titulo + status]
[contexto curto]
[acao primaria ou metadado]
```

Regras:

- largura total;
- toque minimo 44px;
- sem grid de 4 colunas;
- status textual + cor;
- acoes secundarias ocultas.

## Anti-patterns globais

- Card dentro de card.
- KPI zerado como protagonista.
- Hero em area operacional.
- Mais de 2 botoes equivalentes no mesmo bloco.
- Modulo inteiro em uma pagina sem escopo.
- Mobile como desktop empilhado.
- Configuracao antes da rotina.
- Publicacao misturada com tarefa interna.
- Texto longo em botao.
- Cor usada como decoracao sem significado.
