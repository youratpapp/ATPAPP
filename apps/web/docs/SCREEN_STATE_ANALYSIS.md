# Screen State Analysis

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Regra

Toda tela e modulo devem tratar estados de forma explicita. Estado vazio ruim faz o produto parecer incompleto; estado com excesso de dados faz o produto parecer confuso.

## Estados obrigatorios

- loading;
- vazio;
- vazio com proxima acao;
- erro recuperavel;
- erro de permissao;
- sem configuracao inicial;
- pendente operacional;
- concluido;
- parcial/incompleto;
- sincronizando/salvando.

## Padrao por tela

### Home

Estados:

- sem compromissos;
- com proxima acao;
- com pagamentos/convites;
- sem perfil completo.

Proxima acao desejada:

- completar perfil;
- ver jogos;
- reservar;
- acompanhar proximo compromisso.

### Locais

Estados:

- nenhum local encontrado;
- local publico sem dados suficientes;
- usuario com locais administrados;
- usuario sem permissao admin.

Proxima acao:

- buscar;
- criar/solicitar local;
- abrir pagina publica;
- abrir admin quando autorizado.

### Place admin

Estados:

- setup incompleto;
- sem reservas hoje;
- fila com pendencias;
- modulo sem dados;
- erro de permissao.

Proxima acao:

- configurar quadras;
- criar reserva;
- resolver fila;
- convidar equipe.

### Torneio

Estados:

- sem classes;
- classe sem jogos;
- presencas pendentes;
- resultados pendentes;
- evento encerrado;
- publicacao pronta.

Proxima acao:

- selecionar classe;
- gerar/publicar chave;
- confirmar presenca;
- registrar resultado;
- publicar podio.

### Liga

Estados:

- temporada sem rodada;
- rodada pendente;
- resultados pendentes;
- ranking atualizado;
- chat sem mensagens.

Proxima acao:

- configurar rodada;
- registrar resultado;
- publicar classificacao.

### Ranking

Estados:

- sem dados no recorte;
- filtros sem resultado;
- jogador fora do ranking;
- ranking com regras conhecidas.

Proxima acao:

- limpar filtro;
- escolher classe;
- copiar/exportar ranking.

### Perfil

Estados:

- perfil incompleto;
- sem historico;
- com atividade recente;
- sem dados esportivos.

Proxima acao:

- completar dados;
- editar preferencias;
- ver historico.

## Regras de UX

- Empty state sempre deve ter uma acao ou explicacao curta.
- Loading nao deve deslocar layout drasticamente.
- Erro deve informar recuperacao possivel.
- Estado sem permissao deve explicar acesso, nao apenas esconder tudo.
- Estados de salvamento devem bloquear duplo clique em acoes criticas.

## Implementacao atual

- Usar `ScreenState` para estados estruturais de tela ou bloco: loading, erro, vazio, informacao e sucesso.
- Estados pequenos dentro de listas ainda podem usar texto curto, mas telas principais devem preferir `ScreenState`.
- Ranking ja usa `ScreenState` para loading, erro de perfil incompleto e filtro sem resultado.
- Hubs de torneios e ligas ja usam `ScreenState` para loading e vazio com proxima acao.
- Agenda/Reservas agora tem modulos proprios para fila de hoje, reservas recentes, lista de espera, recursos/regras, criacao de reserva, calendario e historico operacional detalhado; o proximo passo e trocar textos vazios simples por estados acionaveis quando a subvisao estiver sem quadras ou sem reservas.
- Academia iniciou modularizacao por operacao diaria, turmas, alunos, pendencias, professores e recursos; o proximo passo e transformar criacao de turma/slot e encaixes em modulos com estados vazios acionaveis e menos formularios inline.
