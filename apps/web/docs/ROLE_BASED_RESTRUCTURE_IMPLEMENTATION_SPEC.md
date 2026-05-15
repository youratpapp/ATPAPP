# Role Based Restructure Implementation Spec

Data: 2026-05-15

Status: especificacao para desenvolvimento. Nao e comentario conceitual; e contrato de produto, UX, design e engenharia para os coders executarem os sprints.

Fontes:

- `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
- `WHOLE_APP_ROLE_DESIGN_AUDIT_2026_05_14.md`
- `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`
- `ROLE_BASED_RESTRUCTURE_QUEUE.md`
- `ROLE_VISIBILITY_MATRIX.md`
- `ROLE_BASED_RESTRUCTURE_SPRINT_BACKLOG.md`
- `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`
- `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`
- `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`
- screenshots locais em `web/docs/screenshots/whole-app-role-audit-2026-05-14/`
- referencias de mercado: Playtomic, CourtReserve, MATCHi, OpenCourt, Anolla, PlayByPoint, RacketPal, UTR Sports, Copa Pro.

## Politica De Uso De Legado

Use documentos antigos como inventario de funcao, regra, permissao e backend. Nao use como modelo para manter arquitetura visual antiga.

Se um MD antigo disser que existe uma funcao em determinado bloco, a v2 deve preservar a funcao, mas pode e deve reposicionar para a superficie correta.

Exemplos:

- formulario antigo vira wizard, drawer ou sheet conforme frequencia da acao;
- card antigo vira row se for rotina operacional;
- KPI antigo desaparece se nao for acionavel para aquele perfil;
- modulo antigo some para perfil sem permissao ou sem relacao;
- pagina antiga longa vira tabs/subvisoes;
- lista antiga limitada por `slice` vira busca/filtro/paginacao ou `ver todos`.

## Problema Que A Reestruturacao Resolve

O app possui ferramentas poderosas, mas o front-end ainda mostra ferramentas demais para usuarios que nao precisam delas. O resultado e:

- jogador comum sente que entrou em um painel;
- professor pode receber ferramentas de empresa;
- gestor recebe KPIs antes da fila;
- organizador mistura setup, operacao e experiencia publica;
- mobile empilha cards e textos em vez de conduzir fluxos.

O objetivo nao e reduzir capacidades. O objetivo e esconder complexidade ate o momento certo.

## Resultado De Produto Desejado

### Jogador

Deve abrir o app e entender em ate 2 segundos:

- tenho algo para fazer agora?
- posso reservar?
- posso encontrar jogo?
- posso competir?
- onde esta meu proximo compromisso?

Nao deve pensar:

- "isso e uma area de gestao?"
- "qual desses cards importa?"
- "por que estou vendo planos, KPIs ou operacao interna?"

### Professor

Deve abrir e ver:

- minhas aulas de hoje;
- meus alunos;
- chamada;
- faltas/reposicoes relevantes;
- agenda.

Nao deve ver por padrao:

- cantina;
- CRM completo;
- financeiro completo;
- setup do clube;
- operacao de recepcao se nao for papel dele.

### Recepcao

Deve abrir e resolver:

- reservas pendentes;
- check-in;
- nova reserva;
- lista de espera;
- aulas do dia;
- encaixes.

### Financeiro

Deve abrir e resolver:

- quem cobrar agora;
- marcar pago;
- enviar lembrete;
- diferenciar mensalidade, reserva, aula avulsa, plano e produto;
- registrar despesa.

### Organizador

Deve abrir e resolver:

- inscricoes pendentes;
- categorias incompletas;
- gerar/preparar jogos;
- horarios/quadras;
- resultados pendentes;
- publicacao/comunicacao.

### Gestor

Deve abrir e entender:

- operacao do dia;
- pendencias;
- modulos do local;
- configuracoes incompletas;
- indicadores de suporte.

## Arquitetura De Superficies

### Player Surface

Rotas:

- `/inicio`
- `/locais`
- `/locais/:placeId`
- `/eventos` em modo jogador/descoberta
- `/eventos/:id` quando publico/jogador
- `/eventos/ligas/:id` quando publico/jogador
- `/ranking`
- `/perfil`

Regra:

- carregar dados proprios e publicos;
- nao carregar datasets administrativos se nao forem necessarios;
- nao mostrar acao que exige papel profissional;
- usar linguagem humana, nao tecnica.

### Competition Management Surface

Rotas:

- `/eventos?view=organizing`
- `/eventos/torneios?view=organizing`
- `/eventos/ligas?view=organizing`
- detalhes de torneio/liga quando usuario e organizador/equipe.

Regra:

- setup complexo em wizard;
- operacao em rows;
- publicacao e configuracao em abas/paineis secundarios;
- jogador participante dentro da competicao nao herda ferramentas de organizador.

### Management Surface

Rotas:

- `/gestao`
- `/gestao/:placeId/:module`

Regra:

- carregar apenas modulos por plano/permissao;
- mostrar fila antes de KPI;
- professor/recepcao/financeiro tem experiencia reduzida;
- pagina publica do local nunca renderiza cockpit.

## Contrato De Visibilidade

### Menus Globais

| Usuario | Inicio | Jogar/Locais | Competir | Ranking | Perfil | Organizar | Gestao |
|---|---|---|---|---|---|---|---|
| Jogador puro | sim | sim | sim | sim | sim | nao | nao |
| Aluno | sim | sim | sim | sim | sim | nao | nao |
| Socio | sim | sim | sim | sim | sim | nao | nao |
| Professor sem gestao | sim | opcional | opcional | sim | sim | nao | modo professor |
| Organizador | sim | sim | sim | sim | sim | sim | se tiver local |
| Recepcao | sim | sim | opcional | opcional | sim | nao | sim limitado |
| Financeiro | sim | opcional | opcional | opcional | sim | nao | sim financeiro |
| Gestor | sim | sim | sim | sim | sim | se organiza | sim completo |

### Dados Que Podem Ser Buscados

Player Surface:

- compromissos proprios;
- inscricoes proprias;
- reservas proprias;
- aulas/matriculas proprias;
- eventos/locais publicos;
- jogos/chamadas publicas;
- ranking publico.

Nao buscar por padrao:

- todos os recebiveis do local;
- CRM;
- estoque;
- equipe;
- configuracao;
- alunos de outras turmas;
- pagamentos de terceiros.

Management Surface:

- dados do local conforme modulo e permissao;
- dados de agenda/academia/financeiro/CRM/cantina/equipe apenas se plano/papel liberar.

Competition Management:

- dados do evento/liga apenas se usuario e owner/staff/equipe autorizada.

## Linguagem E Copy

### Player

Usar:

- "Reservar quadra"
- "Encontrar jogo"
- "Competir"
- "Meu proximo jogo"
- "Minhas inscricoes"
- "Entrar em aula"
- "Continuar"
- "Confirmar inscricao"

Evitar:

- "Player App"
- "Central de descoberta"
- "Fila operacional"
- "Management OS"
- "Pendencias operacionais"
- "Modulo"

### Management

Usar:

- "Fila de hoje"
- "Reservas pendentes"
- "Aulas de hoje"
- "Recebiveis"
- "Marcar pago"
- "Enviar lembrete"
- "Configurar regra"

### Competition Organizer

Usar:

- "Inscricoes pendentes"
- "Preparar jogos"
- "Publicar chave"
- "Resolver resultado"
- "Agendar partidas"
- "Revisar categorias"

## Design System De Densidade

### Player

- primeira dobra com no maximo 1 card principal e 3 atalhos;
- headings menores que atuais quando dentro de cards;
- sem grid de KPIs;
- tiles de intencao devem ter 56-88px de altura, nao cards altos com texto longo;
- filtros em sheet;
- CTA sticky quando a acao e conversao;
- listas com row/avatar/chevron.

### Competition Public

- card de evento pode usar imagem/poster;
- status em pill;
- tabs imediatamente apos contexto;
- CTA sticky;
- categorias em cards compactos.

### Competition Organizer

- rows operacionais;
- badges de status;
- drawer/sheet para detalhe;
- setup wizard para criacao/configuracao inicial.

### Management

- subnav no topo do modulo;
- fila operacional antes dos indicadores;
- metric strip compacta;
- lista/tabela densa;
- drawer para detalhe;
- configuracao recolhida/subvisao.

## Padroes De Componentes A Criar/Ou Reaproveitar

### PlayerIntentTile

Uso:

- escolher Reservar, Entrar em aula, Encontrar jogo, Competir.

Props esperadas:

- `icon`;
- `title`;
- `subtitle` curto opcional;
- `countLabel` opcional;
- `onClick`;
- `disabledReason` opcional.

Regras:

- maximo 2 linhas de texto;
- sem paragrafo explicativo longo;
- tocar no tile troca contexto ou abre sheet.

### PlayerFocusCard

Uso:

- proximo compromisso ou pendencia real.

Conteudo:

- tipo;
- titulo;
- data/hora/local;
- status;
- acao primaria.

Regras:

- apenas um por vez;
- se houver multiplas prioridades, mostrar a mais urgente e link "Ver tudo".

### PlayerFilterSheet

Uso:

- filtros de reserva, aula, jogo, eventos.

Regras:

- bottom sheet mobile;
- modal/drawer desktop;
- botao principal `Aplicar`;
- botao secundario `Limpar`;
- nao usar banner global para resultado normal de busca.

### AvailabilitySlotCard

Uso:

- resultado de reserva.

Conteudo:

- local;
- quadra;
- horario;
- duracao;
- preco;
- status de confirmacao;
- CTA.

### OperationalQueueRow

Uso:

- Management e Competition Organizer.

Conteudo:

- status/urgencia;
- titulo;
- contexto curto;
- CTA primaria;
- overflow secundario.

### SetupStepShell

Uso:

- criar torneio;
- criar liga;
- setup raro de local/turma quando complexo.

Conteudo:

- progresso;
- titulo da etapa;
- campos essenciais;
- avancados recolhidos;
- voltar/continuar;
- salvar rascunho quando existir.

## Estados Vazios Obrigatorios

Player sem compromisso:

```text
Seu dia esta livre.
Escolha como quer jogar hoje.
```

Player sem locais:

```text
Nenhum local encontrado para esse filtro.
Tente outra cidade, dia ou horario.
```

Sem disponibilidade:

```text
Nenhuma quadra livre neste horario.
Tente outro horario ou entre na lista de espera.
```

Professor sem local/turma:

```text
Nenhuma aula vinculada ao seu login.
Peça para a academia vincular seu professor ao seu usuario.
```

Gestor sem modulo no plano:

```text
Este modulo nao esta ativo no plano deste local.
```

Organizador sem evento:

```text
Voce ainda nao organiza competicoes.
Crie um torneio ou liga quando quiser publicar seu primeiro evento.
```

## Criterios Globais De Aceite

Uma mudanca so pode ser considerada pronta se:

- o usuario alvo entende a primeira acao sem ler instrucoes longas;
- mobile 390px nao vira empilhamento de cards;
- nao ha acao sem destino real;
- dados de outro papel nao aparecem;
- tabs/subnav nao ficam enterradas por resumos;
- loading tem skeleton/estado confiavel;
- erro tecnico nao aparece cru;
- documentos da area foram atualizados;
- lint/build passam quando houve codigo.

## Entrega Esperada Dos Coders Por Sprint

Ao concluir cada sprint, entregar:

- resumo de UX alterada;
- arquivos modificados;
- screenshots antes/depois quando possivel;
- validacao mobile;
- validacao desktop quando aplicavel;
- gaps backend encontrados;
- MDs atualizados;
- status na `EXECUTION_QUEUE.md`.
