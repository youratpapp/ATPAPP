# Semantic Flow Audit

Fonte de verdade para checar se uma acao nomeada pela intencao do usuario leva ao local obvio e executavel.

Regra permanente:

- Se o botao diz `Cadastrar professor`, a tela de destino precisa conter cadastro de professor.
- Se o botao diz `Criar turma`, a tela de destino precisa conter criacao de turma.
- Nao basta abrir o modulo correto; precisa abrir a subvisao onde a tarefa pode ser feita.
- Listagem, resumo e configuracao auxiliar nao podem ser destino principal de uma tarefa de criacao.

## Setup de Gestao

| Intencao | Destino correto | Ferramenta no destino | Status |
| --- | --- | --- | --- |
| Cadastrar quadra | Agenda > Quadras | formulario de nova quadra | ok |
| Definir regras de reserva | Agenda > Quadras | formulario de regra por perfil/horario | ok |
| Cadastrar professor | Academia > Professores | formulario de novo professor junto da lista | corrigido |
| Criar turma | Academia > Turmas | wizard de turma junto da lista | corrigido |
| Cadastrar cliente | Clientes > Leads | formulario progressivo de contato/lead | ok |
| Configurar plano | Clientes > Socios | formulario de plano recorrente | ok |
| Publicar pagina | Ajustes > Estrutura | formulario de dados publicos do local | corrigido |
| Cadastrar produto | Cantina > Produtos | formulario de produto junto da lista | ok |
| Registrar venda | Cantina > Vender | formulario de venda rapida | ok |

## Decisoes Aplicadas

- `Cadastrar professor` nao deve cair em `Academia > Recursos`; professor e cadastro vivem em `Academia > Professores`.
- `Criar turma` nao deve cair em `Academia > Recursos`; turma e criacao vivem em `Academia > Turmas`.
- `Recursos` fica para disponibilidade de professores/quadras e janelas abertas; dados, login e comissao de professor ficam em `Academia > Professores`.
- `Criar turma` a partir de uma janela aberta preenche o rascunho e muda para `Academia > Turmas`, onde a turma e concluida.
- `Publicar pagina` nao pode cair em resumo de prontidao; `Ajustes > Estrutura` agora tambem contem edicao direta de nome, cidade, UF, descricao e logo.
- Checklist e proximo passo agora carregam `viewSegment`, evitando navegar apenas para o modulo generico.

## Pendencias de Auditoria Continua

- Revisar rotinas de rotina diaria em `ROUTINE-02`: criar reserva, chamar espera, fazer chamada, registrar venda e cadastrar cliente.
- Toda nova quick action deve entrar nesta tabela antes de ser considerada concluida.
