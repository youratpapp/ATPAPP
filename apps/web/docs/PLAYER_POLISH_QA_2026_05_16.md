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

## Próximo Sprint

### PLAYER-QA-POLISH-03 - Navegação e contexto

Revisar:

- se `Competir` no mobile deve abrir a superfície geral em vez de subview;
- se `Modo jogador` vira seletor real de modo ou deixa de parecer clicável;
- entrada direta para `Aulas` somente se não duplicar `Locais > Entrar em aula`;
- contexto de páginas de detalhe quando o usuário chega por notificação/link direto.

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
- lint/build passam.
