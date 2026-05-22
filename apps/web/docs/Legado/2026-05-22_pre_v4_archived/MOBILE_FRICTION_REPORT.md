# Mobile Friction Report

Fonte principal: `product-architecture-ux-audit.md`.

Data: 2026-05-13

## Diagnostico

O maior atrito mobile nao vem apenas de cor, fonte ou espaco. Ele vem de profundidade, mistura de responsabilidades e excesso de informacao simultanea.

## Atritos principais

### Cards com muitas acoes

Impacto:

- botoes desalinhados;
- decisao lenta;
- toque acidental.

Correcao:

- manter uma acao primaria visivel;
- mover secundarias para menu/action sheet.

### Formularios longos inline

Impacto:

- scroll excessivo;
- abandono;
- dificuldade de revisar.

Correcao:

- wizard;
- validacao por etapa;
- resumo antes de confirmar.

### Tabs horizontais demais

Impacto:

- opcoes escondidas;
- contexto perdido.

Correcao:

- ate 5 tabs;
- acima disso usar seletor ou subvisoes internas.

### Resumos incoerentes com filtros

Impacto:

- usuario nao sabe se dado e geral ou da classe/filtro.

Correcao:

- filtro antes do resumo;
- titulo do resumo deve indicar recorte.

### Historico expandido por padrao

Impacto:

- card fica alto;
- acao principal some.

Correcao:

- historico em drawer/accordion.

## Telas de maior risco

### Places/admin

Risco: muitos modulos em uma pagina.

Acao:

- rota admin dedicada;
- subvisoes por modulo;
- fila diaria no topo.

### Tournament detail

Risco: classe, resumo, minhas partidas, chave, agenda e publicacao competindo.

Acao:

- classe antes do resumo;
- minhas partidas no contexto proprio;
- publicacao agrupada.

### League detail

Risco: modelo mental diferente do torneio.

Acao:

- CompetitionShell comum.

### Home

Risco: central do jogador virar pagina longa.

Acao:

- secoes recolhiveis;
- proximas acoes primeiro;
- detalhes por assunto.

## Padrao mobile recomendado

1. Header compacto.
2. Recorte ativo.
3. Proxima acao.
4. Fila curta.
5. Lista principal.
6. Drawer para detalhe.
7. Action sheet para acoes secundarias.

## Metricas para acompanhar futuramente

- tempo ate resolver tarefa;
- profundidade de scroll antes da acao;
- cliques ate registrar pagamento/reserva/resultado;
- abandono de formulario;
- uso de acoes secundarias.
