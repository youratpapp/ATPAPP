# Competitions and Profile Visual Screenshot Review - 2026-05-19

## Escopo

Revisao visual por screenshots apos o sprint de referencias ATP premium.

Foco:

- Competicoes: hub, torneios e ligas.
- Perfil: desktop e mobile.
- Criterio: aparencia, cores, composicao, densidade, acabamento e aproximacao das referencias visuais.

Fora de escopo:

- conteudo funcional;
- regras de competicao;
- ferramentas;
- permissoes;
- fluxos de negocio.

## Evidencias usadas

- `docs/screenshots/visual-local-audit-2026-05-18/desktop-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-events-hub.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-leagues.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-tournaments.png`
- `docs/screenshots/visual-local-audit-2026-05-18/desktop-profile.png`
- `docs/screenshots/visual-local-audit-2026-05-18/mobile-profile.png`

## Resultado geral

Competicoes e Perfil ainda nao atingem o patamar visual de Home/Locais apos o sprint.

O problema principal nao e uma cor isolada. E composicao: essas areas ainda parecem telas administrativas claras com cards e empty states, enquanto as referencias usam uma primeira dobra esportiva, visual e intencional.

## Achados P1

### P1 - Competicoes nao tem hero esportivo de primeira dobra

Screenshots:

- `desktop-events-hub.png`
- `mobile-events-hub.png`

Problema:

- a tela abre com titulo grande, tabs e um painel branco;
- nao existe imagem de quadra/evento como sinal visual principal;
- o visual fica mais proximo de dashboard simples do que de app esportivo premium.

Impacto:

- `Competir` parece menos importante que Home/Locais;
- a area perde continuidade com a linguagem visual das referencias;
- mobile fica textual e pesado.

Direcao recomendada:

- criar hero visual de competicoes com imagem `hero-competition-court-premium.png`;
- mover as tabs `Jogando/Descobrir/Trabalho` para cards/pills compactos sobre ou abaixo do hero;
- transformar a area `Descobrir` em trilho visual de acoes, nao painel branco grande.

### P1 - Mobile de Competicoes esta inflado e com corte lateral ruim

Screenshots:

- `mobile-events-hub.png`

Problema:

- tabs horizontais cortam `Trabalho` de forma brusca;
- cards de entrada sao altos e brancos demais;
- bottom nav branco destoa do tratamento navy ja aplicado em Home/Locais;
- empty state fica parcialmente coberto pela bottom nav.

Impacto:

- a tela parece menos acabada que Home/Locais;
- a experiencia mobile fica com cara de formulario/lista, nao produto premium.

Direcao recomendada:

- aplicar o mesmo shell navy player usado em Home/Locais;
- usar tabs compactas com snap e margem correta;
- reduzir altura dos action cards;
- garantir padding inferior suficiente para empty state nao ficar sob a bottom nav.

### P1 - Torneios/Ligas internas sao quase empty states administrativos

Screenshots:

- `desktop-leagues.png`
- `mobile-leagues.png`
- `desktop-tournaments.png`
- `mobile-tournaments.png`

Problema:

- telas internas usam titulo, metric cards simples e empty state dashed;
- nao ha hero visual, imagem ou composicao esportiva;
- desktop tem grande area vazia;
- mobile tem CTAs de voltar/busca muito grandes e sem label, parecendo placeholders.

Impacto:

- o produto parece incompleto quando o usuario nao participa de competicoes;
- empty state ocupa o papel de tela principal, mas nao tem qualidade editorial.

Direcao recomendada:

- criar um `CompetitionPlayerHero` reutilizavel para `Torneios que jogo` e `Ligas que jogo`;
- substituir empty state dashed por card visual com fundo navy/imagem, CTA claro e estado secundario;
- em mobile, transformar `Voltar` e `Entrar` em action bar compacta com texto ou icone+label.

### P1 - Perfil mobile tem contraste quebrado no nome

Screenshot:

- `mobile-profile.png`

Problema:

- o nome `Escalao Admin` fica quase invisivel sobre o fundo navy;
- o icone de editar tambem fica escuro demais;
- a primeira dobra tem muita altura vazia antes do avatar.

Impacto:

- bug visual perceptivel;
- a tela parece menos confiavel e menos refinada.

Direcao recomendada:

- tratar perfil mobile como hero escuro completo: nome, cidade e badges em branco/verde claro;
- reposicionar editar como botao claro no topo direito;
- reduzir altura vazia antes do avatar.

## Achados P2

### P2 - Perfil desktop parece formulario central, nao perfil esportivo

Screenshot:

- `desktop-profile.png`

Problema:

- avatar grande central sem contexto visual forte;
- informacoes pessoais aparecem como lista de formulario;
- nao ha card de identidade esportiva, historico ou metricas visuais na primeira dobra.

Direcao recomendada:

- criar hero de perfil com fundo visual `hero-profile-player-premium.png`;
- colocar avatar, nome, cidade, status e editar dentro do hero;
- transformar telefone/email/data em cards/rows menores abaixo;
- destacar ranking, competicoes, aulas ou atividade esportiva como primeira camada visual.

### P2 - Competicoes desktop usa muito branco e pouco navy

Screenshots:

- `desktop-events-hub.png`
- `desktop-tournaments.png`
- `desktop-leagues.png`

Problema:

- cards e paineis ficam brancos demais;
- navy aparece so em tab ativa;
- a imagem esportiva fica ausente.

Direcao recomendada:

- usar navy como bloco visual principal em hero e empty states;
- preservar branco para cards secundarios;
- verde somente para CTA/ativo/status.

### P2 - Densidade inconsistente com Home/Locais

Problema:

- Home/Locais agora tem cards compactos e imagem;
- Competicoes/Perfil ainda usam cards maiores e estados vazios altos.

Direcao recomendada:

- reaproveitar calibragem de `REF-VISUAL-03/04/05`;
- criar overrides especificos para superficies `competition` e `profile`.

## Queue recomendada

### [ ] REF-COMP-01 - Hero visual e composicao premium para Competicoes hub

Objetivo:

- elevar `Competicoes` ao mesmo patamar visual de Home/Locais.

Escopo:

1. Criar hero visual com imagem de competicao.
2. Compactar tabs `Jogando/Descobrir/Trabalho`.
3. Redesenhar cards de descoberta como cards visuais menores.
4. Ajustar mobile navy e padding inferior.

### [ ] REF-COMP-02 - Torneios/Ligas internas com empty state premium

Objetivo:

- substituir empty states administrativos por estados visuais esportivos.

Escopo:

1. Criar hero reutilizavel para `Torneios que jogo` e `Ligas que jogo`.
2. Trocar caixas dashed por card navy/imagem com CTA.
3. Compactar metric cards.
4. Ajustar action bar mobile.

### [ ] REF-PROFILE-01 - Perfil mobile com hero escuro correto

Objetivo:

- corrigir contraste e composicao do perfil mobile.

Escopo:

1. Nome/cidade/badges em branco/verde claro.
2. Editar como botao claro.
3. Reduzir altura vazia antes do avatar.
4. Tabs e info cards mais compactos.

### [ ] REF-PROFILE-02 - Perfil desktop como identidade esportiva

Objetivo:

- trocar aparencia de formulario por perfil esportivo premium.

Escopo:

1. Hero visual com avatar e identidade.
2. Cards de status/atividade esportiva na primeira dobra.
3. Dados pessoais como rows compactas secundarias.
4. Manter tabs existentes, mas com acabamento alinhado ao sprint visual.

## Conclusao

Home e Locais ja avancaram para uma linguagem visual mais proxima das referencias. Competicoes e Perfil ficaram para tras porque ainda nao receberam uma composicao esportiva de primeira dobra.

Prioridade recomendada:

1. `REF-COMP-01`
2. `REF-PROFILE-01`
3. `REF-COMP-02`
4. `REF-PROFILE-02`
