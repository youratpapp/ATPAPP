# PLAYER-CLASSES-DNA-01 Report

Data: 2026-05-17

## Escopo

Sprint focada no fluxo publico de aulas para jogador comum, mantendo o DNA de telas leves: encontrar turma, escolher dias recorrentes e enviar interesse sem duplicar solicitacoes nem confundir interesse com matricula ativa.

## Causa

O app ja tinha turmas, vagas e matriculas, mas a leitura publica ainda parecia um formulario isolado: o jogador podia escolher dias, porem nao via status do pedido logo apos enviar e podia tentar reenviar interesse para a mesma turma/dia. Isso deixava o fluxo pouco confiavel para quem faz duas ou mais aulas por semana.

## Alteracoes

- `PlacePublicPage.tsx`
  - mantem agrupamento de turmas equivalentes por professor, nivel, horario, perfil, valor e plano;
  - permite selecionar todos os dias de um grupo ou alternar dias especificos;
  - carrega matriculas do perfil no local e exibe status por dia escolhido;
  - evita criar solicitacao duplicada para dias ja pendentes ou ativos;
  - atualiza o estado local logo apos envio com chips `Interesse enviado` ou `Matricula ativa`;
  - ajusta CTA para refletir o status real do perfil.

- `App.css`
  - filtro publico de aulas passou a usar grid por areas no desktop;
  - chips e lista compacta de status foram adicionados para nao transformar o fluxo em painel administrativo.

## Impacto UX

- O jogador entende que esta enviando interesse para aprovacao da academia.
- Quando a turma ocorre em mais de um dia, os dias ficam visiveis e selecionaveis sem repetir formulario.
- O status aparece no proprio contexto da escolha, sem exigir reload manual.
- O fluxo continua leve no mobile e preserva uma unica acao primaria.

## Riscos Restantes

- O calendario pessoal depende dos dados ja consumidos pela Home/agenda do jogador; esta sprint nao criou backend novo.
- A aprovacao pela gestao segue o suporte atual de matriculas da academia. Caso a operacao exija contrato/plano automatico, isso deve entrar em sprint propria.

## Validacao

- `git diff --check -- web/src/pages/PlacePublicPage.tsx web/src/App.css`
- `npm.cmd run lint`
- `npm.cmd run build`
