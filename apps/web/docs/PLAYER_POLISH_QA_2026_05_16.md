# Player Polish QA - 2026-05-16

Fonte: análise manual externa `ux-analysis-atpapp.md`.

## Decisão

A análise foi considerada correta principalmente nos pontos de qualidade percebida, não de arquitetura:

- textos visíveis sem acento, cedilha ou com microcopy técnica;
- labels e abreviações que exigem interpretação;
- ações secundárias com peso visual de ação primária;
- estados vazios grandes demais;
- placeholders visuais ausentes em rows/listas;
- loading bruto como `Carregando...`;
- alvos de toque pequenos em mobile;
- ações destrutivas sem isolamento.

Esses pontos devem ser corrigidos em sprints pequenos porque melhoram a sensação de produto pronto sem reabrir fluxos, banco ou navegação profunda.

## PLAYER-QA-POLISH-01 - Concluído

Entrega em 2026-05-16:

- textos visíveis principais do Player App foram polidos em Home, Competir, Locais, Perfil, torneio/liga pública e estados relacionados;
- tokens internos de rota, aba e status foram preservados em ASCII (`classificacao`, `organizacao`, `aguardando_organizacao`);
- `Perfil > Preferências` deixou de mencionar engine futura e passou a explicar preferências em linguagem de usuário;
- checkboxes de preferências ficaram visualmente associados ao texto;
- `Excluir minha conta` foi isolado em zona destrutiva com aviso curto;
- carregamentos principais em Home, Competições, Locais, Torneio e Liga passaram a usar `ScreenState` contextual em vez de texto solto;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

## PLAYER-QA-POLISH-02 - Concluído

Entrega em 2026-05-16:

- `Seguir` no Ranking passou a usar estilo discreto/outline em vez de CTA primário;
- `Placar e WhatsApp` em partida de torneio ganhou alvo mínimo de 44px;
- `Não posso jogar` passou a usar estilo secundário real;
- `Excluir minha conta` permanece isolado em zona destrutiva;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

## PLAYER-QA-POLISH-03 - Concluído

Entrega em 2026-05-16:

- `Competir` permanece como entrada para a superfície geral `/eventos`; o usuário escolhe o recorte dentro do hub, sem nova rota duplicada;
- o contexto do menu lateral deixou de usar `Modo jogador` em formato de pill clicável e passou a exibir `Jogador` como rótulo neutro;
- `Competições` e `Operação` aparecem com acento e continuam diferenciando superfícies reais;
- `Aulas` permanece em `Locais > Entrar em aula`, evitando dois caminhos paralelos para a mesma intenção;
- torneio e liga públicos mostram `Voltar para competições` e uma nota curta de contexto para acesso por link/notificação;
- validado com `npm.cmd run lint` e `npm.cmd run build`.

## O Que Não Entra Agora

- hero com ilustração/imagem no desktop;
- social/rede de jogadores;
- KPI extra ou painel com mais dados;
- backend novo para preferências;
- redesign amplo da Home.

## Critérios de Aceite

- UI principal do Player App não exibe termos comuns sem acento nos pontos revisados;
- nenhuma mensagem técnica/de desenvolvimento aparece em `Perfil > Preferências`;
- estados de loading principais são contextuais;
- ações secundárias não competem com CTAs primários;
- itens de navegação não prometem modo/ação inexistente;
- páginas públicas de competição mantêm contexto claro sem breadcrumb pesado;
- lint/build passam.
