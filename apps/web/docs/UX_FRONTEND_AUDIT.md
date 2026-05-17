# UX Frontend Audit

Data: 2026-05-16  
Fonte principal: `manual_frontend_design_produto_apps_modernos.md`  
Evidências locais: código em `web/src`, MDs v2 em `web/docs` e screenshots em `web/docs/screenshots/ux-frontend-audit-deep-loaded-2026-05-16/`.

Nota de evidência: a rodada de screenshots foi refeita com espera explícita de carregamento completo. O script aguardou login, tentou `networkidle`, esperou sumirem marcadores de carregamento como `Carregando`/`Buscando` e exigiu estabilidade do texto antes da captura. Também clicou em submenus, abas e botões seguros para alcançar o máximo de estados navegacionais sem executar ações destrutivas ou mutações de dados. Resultado registrado em `summary.json`: 17 rotas base, 126 registros navegacionais, 116 PNGs únicos, 0 capturas ainda carregando e 0 erros de automação.

## 1. Resumo executivo

O app evoluiu bastante em relação aos problemas originais de "dashboard/backend": Player App, Competition OS e Management OS já estão mais separados por papel, várias páginas deixaram de ser longas âncoras, e componentes como rows, drawers, filtros guiados e action rails já existem. A base de produto está correta.

O principal problema restante não é falta de função. É consistência de apresentação. Algumas telas já seguem bem o manual, mas outras ainda misturam intenção, estado, ação e configuração dentro da mesma dobra. Isso faz o app oscilar entre uma experiência moderna de produto e uma ferramenta operacional pesada.

Os padrões do manual mais violados hoje são:

- intenção dominante por tela ainda instável em áreas de organização, ranking, gestão e formulários;
- excesso de containers equivalentes quando a tela precisa de lista ou row;
- filtros e abas com pesos visuais diferentes entre módulos;
- mobile ainda funciona tecnicamente, mas em algumas telas parece desktop empilhado;
- formulários complexos ainda precisam de narrativa de tarefa, não apenas agrupamento técnico;
- estados vazios e mensagens de suporte variam muito em peso e linguagem.

As mudanças de maior impacto são:

1. Consolidar uma gramática única para página de lista, página de detalhe, fluxo de criação, fila operacional, filtro e empty state.
2. Reduzir containers em rotinas diárias e usar rows/listas com ação primária explícita.
3. Transformar filtros mobile em bottom sheets consistentes, com resumo visível.
4. Separar ainda mais operação diária, configuração e relatórios nos módulos de gestão.
5. Revisar Competition OS de organizador para manter as ferramentas potentes sem voltar ao cockpit único.

O que deve ser feito primeiro:

- P0: corrigir inconsistências sistêmicas de layout responsivo, filtros e estados que fazem telas parecerem quebradas ou pesadas.
- P1: padronizar estrutura das páginas mais usadas: Home, Locais, Eventos, Torneios/Ligas, Gestão > Agenda e Gestão > Academia.
- P2: refinar formulários longos, relatórios, ranking e configurações.
- P3: polish visual, microcopy, motion e acessibilidade fina.

## 2. Critérios usados

Critérios derivados do manual:

- clareza da ação principal;
- intenção dominante por tela;
- hierarquia visual;
- densidade adequada ao perfil e dispositivo;
- organização por tarefa, não por banco de dados;
- progressive disclosure;
- navegação previsível;
- separação entre operação diária, configuração e relatório;
- uso correto de cards, rows, tabelas, modais e bottom sheets;
- responsividade real, não apenas empilhamento;
- consistência de componentes;
- microcopy humana e orientada à ação;
- estados de carregamento, vazio, erro e sucesso;
- acessibilidade básica: contraste, tamanho de toque, foco, labels e uso de cor.

## 3. Mapa de páginas analisadas

| Área/Menu | Página | Tipo de tela | Desktop | Mobile | Severidade | Observações |
|---|---|---|---|---|---|---|
| Auth | `/auth` | Formulário | Parcial | Parcial | Média | Tela simples, mas login social/e-mail precisa de feedback e estado de erro padronizado. |
| Cadastro | `/completar-cadastro` | Formulário | Parcial | Parcial | Média | Deve manter mínimo necessário e não virar perfil completo obrigatório. |
| Player | `/inicio` | Home/Dashboard | Boa | Parcial | Média | Primeira dobra melhorou; ainda precisa eliminar tom de onboarding quando há ação real. |
| Player | Sino de notificações | Modal/Popover | Parcial | Parcial | Média | Popover/sheet já é direção correta; precisa padronizar leitura por urgência. |
| Player | `/locais` | Descoberta/Fluxo | Boa | Parcial | Alta | Intenções separadas, mas filtros precisam seguir padrão único e virar sheet no mobile. |
| Player | `/locais?intent=booking` | Fluxo | Parcial | Parcial | Alta | Fluxo correto; precisa consolidar calendário por quadra e evitar campos comprimidos. |
| Player | `/locais?intent=classes` | Fluxo | Parcial | Parcial | Alta | Aulas precisam lidar melhor com múltiplos dias por turma e aprovação/matrícula. |
| Player | `/locais?intent=matches` | Lista/Fluxo | Parcial | Parcial | Alta | Jogos abertos precisam de filtros iguais aos de reserva/aula. |
| Público | `/locais/:placeId` | Detalhe | Boa | Parcial | Alta | Intenções por página melhoraram; ainda há risco de empilhar reserva/aula/jogos/planos no mesmo corpo. |
| Player | `/ranking` | Lista/Relatório | Parcial | Problemática | Alta | Mobile com 3,77 telas e muita repetição de "Seguir"; precisa hierarquia por leitura. |
| Player | `/perfil` | Detalhe/Formulário | Boa | Parcial | Média | Abas simples; histórico/preferências/conta precisam manter densidade baixa. |
| Competition | `/eventos` | Hub | Boa | Parcial | Média | Segmentos por papel ajudam; admin multi-papel ainda recebe muita operação no mobile. |
| Competition | `/eventos/torneios` | Lista | Boa | Parcial | Média | Lista de organizador melhorou; mobile ainda tem indicadores antes do conteúdo útil. |
| Competition | `/eventos/ligas` | Lista | Parcial | Parcial | Média | Precisa separar melhor jogar, organizar e descobrir. |
| Competition | `/eventos/:id/jogos` | Detalhe/Lista | Parcial | Problemática | Alta | Chave e partidas exigem visualização mobile dedicada. |
| Competition | `/eventos/:id/jogadores` | Lista | Parcial | Parcial | Alta | Inscritos não podem duplicar selector + chips; classe deve ser filtro contextual único. |
| Competition | `/eventos/:id/classificacao` | Relatório | Parcial | Parcial | Média | Só deve aparecer quando formato exigir classificação. |
| Competition | `/eventos/:id/chat` | Comunicação | Parcial | Parcial | Média | Não deve repetir partidas/lista de jogadores. |
| Competition | `/eventos/:id/organizacao` | Workspace | Parcial | Parcial | Alta | Deve concentrar operação/setup sem virar cockpit único. |
| Competition | `/inscricao/:tournamentId` | Fluxo | Boa | Parcial | Média | Estrutura de 3 passos é boa; precisa validação e CTA sticky consistente. |
| League | `/eventos/ligas/:leagueId` | Detalhe/Workspace | Parcial | Parcial | Alta | Abas separadas melhoraram; seletor de classe deve ser contextual e escalável. |
| League | `/eventos/ligas/inscricao/:token` | Fluxo | Boa | Parcial | Média | Deve manter convite simples e sem status técnico. |
| Management | `/gestao` | Hub operacional | Parcial | Parcial | Alta | Conceito correto; warning de timeout de payments ainda apareceu na varredura. |
| Gestão > Agenda | `/gestao/:placeId/bookings` | Workspace | Parcial | Problemática | Alta | Calendário/filtros precisam tratamento mobile de produto, não grade espremida. |
| Gestão > Agenda | Hoje | Lista operacional | Boa | Parcial | Média | Rows são adequadas; priorizar ação primária por reserva. |
| Gestão > Agenda | Calendário | Grade | Parcial | Problemática | Alta | Mobile precisa seletor/carrossel por quadra e detalhe em sheet. |
| Gestão > Agenda | Nova reserva | Formulário/Fluxo | Parcial | Problemática | Alta | Campos e disponibilidade precisam manter contexto e evitar banners globais. |
| Gestão > Agenda | Espera | Lista | Boa | Parcial | Média | Row + ação é correto; promover/convidar deve deixar claro o efeito real. |
| Gestão > Agenda | Quadras e regras | Configuração | Parcial | Parcial | Média | Configuração deve ficar fora da rotina diária. |
| Gestão > Academia | `/gestao/:placeId/academy` | Workspace | Parcial | Parcial | Alta | Funções maduras, mas ainda é área com maior risco de densidade em mobile. |
| Gestão > Academia | Hoje | Rotina | Boa | Parcial | Média | Chamada deve abrir direto; cards de aula precisam parecer acionáveis ou neutros. |
| Gestão > Academia | Grade/Turmas | Lista/Configuração | Parcial | Parcial | Alta | Evitar formulário de matrícula em cada turma; usar detalhe/drawer. |
| Gestão > Academia | Alunos | Lista | Parcial | Parcial | Alta | Precisa CTA claro de matrícula e rows com ação contextual. |
| Gestão > Academia | Pendências | Fila | Boa | Parcial | Média | Boa candidata para rows compactas e agrupamento por tipo. |
| Gestão > Academia | Professores | Lista/Formulário | Parcial | Parcial | Média | Vincular login, comissão e agenda precisam progressive disclosure. |
| Gestão > Academia | Configuração/Recursos | Configuração | Parcial | Parcial | Média | Deve ficar atrás da rotina, com separação clara de setup. |
| Gestão > Clientes/CRM | Rotina | Lista | Boa | Parcial | Média | Rows são corretas; evitar misturar cobrança com relacionamento. |
| Gestão > Clientes/CRM | Contatos/Leads | Lista/Formulário | Parcial | Parcial | Média | Busca/filtro bons; detalhe em drawer/sheet deve ser padrão. |
| Gestão > Financeiro | Recebíveis | Lista | Boa | Parcial | Alta | Desktop pode ser denso; mobile precisa rows e ações diretas. |
| Gestão > Financeiro | Pagos/Despesas/Pacotes | Lista/Relatório | Parcial | Parcial | Média | Separar baixa diária de análise financeira. |
| Gestão > Cantina/POS | Venda rápida | Fluxo | Boa | Parcial | Média | Deve ter total/checkout fixo no mobile. |
| Gestão > Cantina/POS | Estoque/Produtos | Lista/Formulário | Parcial | Parcial | Média | Produtos em row; edição em drawer/sheet. |
| Gestão > Equipe | Staff/Convites/Papéis | Configuração | Parcial | Parcial | Média | Convite por aceite está correto; papéis precisam linguagem simples. |
| Gestão > Ajustes | Público/Recursos/Regras/Planos/Permissões/Publicação | Configuração | Parcial | Parcial | Alta | Deve ser biblioteca de configuração, não rotina diária. |

## 4. Análise página a página

### Auth e completar cadastro

#### Função da página
Permitir entrada e criação inicial de perfil.

#### Problemas encontrados
- Erros de login aparecem próximos do fluxo, mas precisam seguir mesmo padrão visual dos demais erros amigáveis.
- Cadastro completo tende a virar formulário de perfil se não for guardado pelo mínimo necessário.

#### Comparação com o manual
Atende simplicidade de intenção, mas precisa reforçar estados de erro/sucesso e reduzir campos não essenciais.

#### Desktop
Boa base: tela direta, pouca densidade.

#### Mobile
Parcial: campos são simples, mas deve garantir toque confortável e teclado adequado.

#### O que manter
- Login por e-mail e Google.
- Separação entre auth e completar cadastro.

#### O que melhorar
- Padronizar erro como `FormError`.
- Completar cadastro deve pedir só nome, cidade/UF e telefone se necessário.
- Preferências esportivas podem entrar depois, no perfil.

#### Recomendação de prioridade
P2.

### Home do Player App (`/inicio`)

#### Função da página
Responder "o que eu preciso fazer agora?" para o jogador.

#### Problemas encontrados
- A primeira dobra melhorou, mas ainda há risco de texto permanente de onboarding quando o usuário já tem contexto.
- A captura atual mostra `Encontre algo para jogar` e ações rápidas; isso é bom para estado sem urgência, mas precisa variar quando existe pendência.
- Para usuário multi-papel, o item `Trabalho` aparece na nav; é correto, mas deve ficar secundário e não contaminar o card principal.

#### Comparação com o manual
Atende a intenção dominante e separação por perfil melhor do que versões anteriores. Ainda precisa aplicar completamente "básico primeiro, avançado depois".

#### Desktop
Boa: 1 dobra, sem overflow horizontal, poucas ações.

#### Mobile
Parcial: 1,03 telas na varredura, mas a experiência depende muito do estado dos dados. Deve manter "urgente direto, descoberta em rail".

#### O que manter
- CTA contextual.
- Rail de intenções.
- Separação de área profissional.

#### O que melhorar
- Remover microcopy explicativa repetida quando há ação real.
- Usar título contextual por estado: `Resultado para enviar`, `Sua reserva de hoje`, `Aula de hoje`, `Encontre algo para jogar`.
- Empty states devem ser pequenos e acionáveis.

#### Recomendação de prioridade
P1.

### Notificações

#### Função da página
Expor pendências pessoais ou avisos sem tirar o usuário da tarefa.

#### Problemas encontrados
- O padrão atual de popover/sheet é correto, mas precisa ser formalizado no design system.
- Notificações urgentes, avisos e histórico não podem ter o mesmo peso.

#### Comparação com o manual
Atende melhor que card inline na página. Deve aplicar progressive disclosure: resumo no sino, detalhe em popover/sheet.

#### Desktop
Usar popover ancorado ao sino, largura controlada, fechamento por clique fora/Escape.

#### Mobile
Bottom sheet com backdrop, altura máxima e ação primária por notificação.

#### O que manter
- Badge no sino.
- Separação de pendências e acompanhar.

#### O que melhorar
- Estados: vazio, carregando, erro amigável.
- Ações com destino real; item que parece clicável deve navegar ou abrir detalhe.

#### Recomendação de prioridade
P1.

### Locais (`/locais`)

#### Função da página
Escolher uma intenção: reservar quadra, encontrar jogo, entrar em aula ou ver locais.

#### Problemas encontrados
- A arquitetura por intenção está correta.
- Ainda há risco de filtros terem padrões diferentes entre reserva, aula e jogos.
- Alguns textos ainda soam explicativos demais para uso recorrente.

#### Comparação com o manual
Atende "organizar por intenção" e reduz mistura de banco de dados. Precisa reforçar consistência de filtros.

#### Desktop
Boa: 1 dobra, action tiles claros.

#### Mobile
Parcial: deve usar rail horizontal com snap e filtros em bottom sheet para cada intenção.

#### O que manter
- Cards de intenção compactos.
- Separação `Todos`, `Seguindo`, `Meus locais`.

#### O que melhorar
- Unificar ordem dos filtros: UF, cidade, local, atributo específico, data/hora.
- Ações de busca podem virar ícone/botão compacto quando o cabeçalho já explica a intenção.
- Resultado sem filtro deve sugerir intenção, não mostrar listas genéricas densas.

#### Recomendação de prioridade
P1.

### Reserva pública de quadra

#### Função da página
Encontrar uma quadra disponível e solicitar reserva.

#### Problemas encontrados
- O fluxo correto é visual: dia, duração, quadra, horário, confirmação.
- Campos já foram reorganizados, mas o padrão precisa virar componente para não quebrar de novo.
- Em mobile, calendário por quadra deve ser o padrão; select de quadra/hora é fallback.

#### Comparação com o manual
O manual recomenda fluxo guiado e decisão por etapa. O app já caminha nessa direção, mas precisa evitar formulário técnico antes da descoberta visual.

#### Desktop
Parcial: pode usar duas colunas, calendário por quadra e resumo de confirmação lateral.

#### Mobile
Problemática se virar select/grade comprimida. Deve ser carrossel por quadra + slots hora a hora + CTA sticky.

#### O que manter
- Vincular reserva ao perfil logado.
- Resultado pendente para aprovação do local.
- Piso da quadra e horas cheias.

#### O que melhorar
- Buscar por UF/cidade/local/data primeiro.
- Se local não for escolhido, mostrar cards de locais com horários disponíveis.
- Ao escolher local, mostrar calendário por quadra.
- Duração de 2h deve mostrar somente inícios que bloqueiam intervalo inteiro livre.
- Custo deve somar por duração.

#### Recomendação de prioridade
P0.

### Aulas públicas

#### Função da página
Permitir que jogador entre em uma turma ou envie interesse.

#### Problemas encontrados
- O agrupamento de turmas recorrentes é necessário e correto.
- Falta explicitar o que acontece depois da aprovação pela academia: matrícula, calendário e cobrança.
- Selecionar múltiplos dias por semana deve ser parte central do fluxo, não detalhe.

#### Comparação com o manual
Atende "uma decisão por etapa" quando separa perfil, turma/dias e interesse. Ainda precisa clarificar estado pós-envio.

#### Desktop
Parcial: lista pode ser row/card compacto, mas não formulário repetido.

#### Mobile
Parcial: filtros e escolha de dias devem ser sheet/step curto.

#### O que manter
- Seleção de dias específicos quando a turma se repete.
- Envio de interesse sem criar matrícula automática indevida.

#### O que melhorar
- Mostre `1. Perfil`, `2. Turma e dias`, `3. Enviar interesse`.
- Depois de aprovado, aluno deve ver `Minhas aulas` na Home/Perfil/Local.
- Se backend não tiver contrato completo, o estado deve dizer "A academia aprova e finaliza a matrícula".

#### Recomendação de prioridade
P1.

### Jogos abertos públicos

#### Função da página
Encontrar chamadas abertas para jogar.

#### Problemas encontrados
- Precisa ter filtros equivalentes aos fluxos de quadra e aula.
- Listas simples de data/nível sem filtros criam sensação de bloco solto.

#### Comparação com o manual
Viola busca/filtros consistentes quando o usuário precisa descobrir algo por local, data, nível e período.

#### Desktop
Parcial: filtro inline com resultados em rows.

#### Mobile
Parcial: filtro em bottom sheet e rows com CTA `Quero jogar`.

#### O que manter
- Separar da reserva de quadra.
- CTA direto por chamada.

#### O que melhorar
- UF, cidade, local, data, período, nível e status.
- Empty state pequeno com `Criar chamada` ou `Ver quadras`.

#### Recomendação de prioridade
P1.

### Página pública do local (`/locais/:placeId`)

#### Função da página
Apresentar um local e conduzir a uma intenção: reservar, aulas, jogos ou planos.

#### Problemas encontrados
- A mudança para renderizar apenas a intenção ativa é correta.
- Hero ainda pode competir com o fluxo quando o usuário já entrou diretamente em `intent=booking` ou `intent=academy`.
- Planos, quadras e aulas precisam estar linkados ao fluxo, não serem listas passivas.

#### Comparação com o manual
Atende melhor a camada de detalhe do objeto. Deve evitar voltar à página longa com várias seções.

#### Desktop
Boa/parcial: hero + rail é bom para overview; fluxo focado deve reduzir hero.

#### Mobile
Parcial: hero grande deve ser compacto em páginas de ação.

#### O que manter
- Action rail público.
- Intenções separadas.
- Compartilhar local.

#### O que melhorar
- Quando a rota já traz intenção, mostrar header compacto do local, não hero completo.
- Plano deve abrir aula com contexto do plano.
- Quadra deve abrir reserva com quadra pré-selecionada.

#### Recomendação de prioridade
P1.

### Ranking (`/ranking`)

#### Função da página
Mostrar posição pessoal, ranking e recortes públicos.

#### Problemas encontrados
- Na varredura mobile, a página ocupa 3,77 telas. Não há overflow, mas há muita repetição de linhas e botões `Seguir`.
- O heading mistura `Minha posição`, `Top jogadores`, `Ranking geral`, `Disputa pelo topo` e `Onde a liga esta viva`, o que dilui intenção.
- Ações sociais podem competir com leitura de ranking.

#### Comparação com o manual
Viola densidade adequada no mobile e ação principal por tela. Ranking é leitura; seguir é secundário.

#### Desktop
Parcial: pode mostrar tabela/lista mais densa.

#### Mobile
Problemática: deve resumir top 5/10 e oferecer `Ver mais`, com filtros em sheet.

#### O que manter
- Recortes Geral, Minha cidade, Liga/clube.
- Exportações no desktop.

#### O que melhorar
- Mobile: `Minha posição` + `Top 10` + `Ver ranking completo`.
- `Seguir` como ação discreta em overflow ou botão quiet.
- Mover análises (`Disputa pelo topo`, `Onde a liga está viva`) para disclosure.

#### Recomendação de prioridade
P1.

### Perfil (`/perfil`)

#### Função da página
Gerenciar identidade, histórico, preferências e conta.

#### Problemas encontrados
- Está relativamente limpo.
- Histórico pode crescer e virar lista longa se não houver filtros.
- Preferências e conta precisam manter ações perigosas isoladas.

#### Comparação com o manual
Atende intenção por abas e baixa densidade.

#### Desktop
Boa.

#### Mobile
Parcial: abas horizontais devem ser acessíveis e estáveis.

#### O que manter
- Abas Perfil, Histórico, Preferências, Conta.
- Ação destrutiva isolada.

#### O que melhorar
- Histórico em timeline compacta.
- Preferências em grupos com toggle claro.
- Estados vazios pequenos.

#### Recomendação de prioridade
P2.

### Hub de competições (`/eventos`)

#### Função da página
Separar competições que o usuário joga, organiza e descobre.

#### Problemas encontrados
- A separação por `Jogando`, `Organizando`, `Descobrir` é correta.
- No mobile admin/multi-papel, a aba `Organizando agora` ocupa 2,32 telas e mostra 6 operações; é aceitável para organizador, mas precisa evitar parecer Home geral.
- Contadores e cards podem competir com rows de operação.

#### Comparação com o manual
Atende separação por papel. Precisa reforçar que o segmento ativo não é dashboard, é lista orientada à próxima ação.

#### Desktop
Boa.

#### Mobile
Parcial: segmento + lista operacional devem ser mais compactos.

#### O que manter
- Modo por papel.
- Rows com CTA como `Operar jogos`, `Ver inscrições`, `Operar rodada`.

#### O que melhorar
- Se o usuário está em modo jogador, não iniciar em organizar.
- Mobile: reduzir texto de descrição e exibir até 3 operações antes de `Ver todos`.
- Diferenciar claramente `Torneios organizados` e `Ligas organizadas` como filtros, não KPIs.

#### Recomendação de prioridade
P1.

### Lista de torneios organizados (`/eventos/torneios?view=organizing`)

#### Função da página
Operar torneios por próximo passo.

#### Problemas encontrados
- A lógica operacional é boa.
- Mobile ainda mostra contadores (`Organizando`, `Inscrições abertas`, `Em andamento`) antes da fila; isso pode ser suporte, não protagonista.
- `+` e `Criar torneio` coexistem; deve haver uma ação primária única.

#### Comparação com o manual
Parcial: operação por rows está correta, mas ainda há resquício de dashboard.

#### Desktop
Boa/parcial.

#### Mobile
Parcial: 2,12 telas e muita informação antes de filtros/lista completa.

#### O que manter
- Próximas ações por estado.
- CTAs semânticos: `Gerar jogos`, `Gerir inscritos`, `Continuar setup`.

#### O que melhorar
- Um único CTA primário `Criar torneio`.
- Indicadores viram chips pequenos ou resumo recolhido.
- Filtros em disclosure/sheet.

#### Recomendação de prioridade
P1.

### Páginas públicas e internas de torneio

#### Função da página
Permitir acompanhar evento, inscritos, jogos, classificação, chat e organização.

#### Problemas encontrados
- A remoção de `Categorias` como aba pública faz sentido; classe deve ser filtro contextual.
- `Inscritos` não pode ter seletor e chips com a mesma função.
- `Classificação` só deve aparecer em torneios com grupos.
- Encerramento/pódio deve estar em `Evento` e só após finalização.
- Exportar chave deve aparecer no topo do evento quando existe chaveamento.

#### Comparação com o manual
Ainda há risco de duplicidade de navegação e excesso de controles, violando previsibilidade e intenção dominante.

#### Desktop
Parcial: tabs são úteis, mas cada aba precisa ser autônoma.

#### Mobile
Problemática para chave/jogos: chaveamento precisa visual próprio, com zoom/scroll claro.

#### O que manter
- Tabs separadas por intenção.
- Filtro de classe contextual.
- Ferramentas de organizador preservadas fora da leitura pública.

#### O que melhorar
- Um padrão único de filtro de classe: select em desktop para muitas classes; rail/chips com dropdown no mobile.
- `Jogos` focado em chave/partidas.
- `Organização` focada em operação/setup.
- `Chat` sem duplicar lista de jogadores ou partidas.
- Sala de resultado do jogador deve usar o mesmo componente de placar do admin.

#### Recomendação de prioridade
P0/P1.

### Liga (`/eventos/ligas/:leagueId`)

#### Função da página
Acompanhar ou operar temporada, jogadores, classificação, partidas, chat e configuração.

#### Problemas encontrados
- A remoção de aba `Classes` e uso de filtro contextual é correta.
- O bloco grande de inscrição aprovada na Home da liga deve ser compacto.
- Classe selecionada não deve alterar silenciosamente conteúdo de abas não relacionadas.

#### Comparação com o manual
Atende melhor que a página longa anterior, mas precisa consolidar padrão de filtros e estado pessoal.

#### Desktop
Parcial: abas e seletor são úteis.

#### Mobile
Parcial: rail de abas pode funcionar, mas filtros devem ser claros e persistentes.

#### O que manter
- Abas `Liga`, `Jogadores`, `Classificação`, `Partidas`, `Chat`.
- Configuração apenas para owner.

#### O que melhorar
- Estado `Inscrição aprovada` como badge/card compacto.
- Filtro de classe no topo de Jogadores/Classificação/Partidas.
- Classificação sempre dentro do recorte da classe.

#### Recomendação de prioridade
P1.

### Inscrição em torneio/liga

#### Função da página
Permitir inscrição curta e confiável.

#### Problemas encontrados
- O fluxo em passos é correto.
- Restrições de horário precisam ser persistidas antes de virar promessa forte.
- Erros técnicos de RPC/SQL não podem aparecer.

#### Comparação com o manual
Atende progressive disclosure. Precisa padrão de feedback.

#### Desktop
Boa.

#### Mobile
Parcial: CTA sticky e etapas curtas devem ser obrigatórios.

#### O que manter
- Escolha de classe/categoria.
- Revisão antes de enviar.

#### O que melhorar
- Validar campos antes de chamar API.
- Status de inscrição existente com ação contextual.

#### Recomendação de prioridade
P2.

### Management Hub (`/gestao`)

#### Função da página
Entrada para operação profissional por papel e local.

#### Problemas encontrados
- A estrutura por fila antes de métrica é correta.
- A varredura mostrou warning `Workspace data timeout: payments`; mesmo sem HTTP >= 400, isso indica consulta pesada ou fallback que precisa ser invisível ao usuário.
- Para admin completo, deve haver cuidado para não mostrar todas as responsabilidades na primeira dobra.

#### Comparação com o manual
Atende separação de operação/configuração, mas precisa refinar performance percebida e estados.

#### Desktop
Parcial: pode aproveitar largura com fila + locais/resumo.

#### Mobile
Parcial: seletor de módulo e fila precisam aparecer antes de qualquer métrica.

#### O que manter
- Entrada profissional separada do Player App.
- Papel define módulos.

#### O que melhorar
- Remover consultas opcionais da primeira carga ou fazê-las lazy.
- Mostrar skeleton curto e específico.
- Se não houver permissão, estado vazio claro e pequeno.

#### Recomendação de prioridade
P0/P1.

### Gestão > Agenda

#### Função da página
Operar reservas, calendário, espera, bloqueios e regras.

#### Problemas encontrados
- Agenda é rotina diária, não dashboard.
- Calendário em mobile precisa ser produto mobile: quadra por quadra, slot acionável, detalhe em sheet.
- Nova reserva ainda precisa evitar campos comprimidos e banners fora de contexto.

#### Comparação com o manual
Agenda exige densidade média/alta no desktop e baixa/média no mobile. O risco é tentar manter a mesma grade nos dois.

#### Desktop
Parcial: grade por quadra funciona se houver largura.

#### Mobile
Problemática: precisa seletor/carrossel por quadra e horários em lista.

#### O que manter
- Hoje, calendário, nova reserva, espera, quadras/regras.
- Rows de pendências.

#### O que melhorar
- Filtros frequentes visíveis no desktop; bottom sheet no mobile.
- Detalhe da reserva em drawer/sheet.
- Ação primária única por slot/reserva.

#### Recomendação de prioridade
P0.

### Gestão > Academia

#### Função da página
Operar aulas, turmas, alunos, professores, reposições e configuração.

#### Problemas encontrados
- É a área com maior risco de misturar rotina diária e setup.
- Matricular aluno, mensalidade, turma e presença precisam estar em superfícies diferentes.
- Professor deve ver apenas aulas/turmas/alunos dele.

#### Comparação com o manual
Precisa seguir "operação diária perto, configuração separada" com rigor.

#### Desktop
Parcial: pode usar rows e drawers.

#### Mobile
Parcial/problemática: chamada e lista de alunos precisam ser ação direta; configuração deve sair da primeira camada.

#### O que manter
- Chamada, pendências, alunos, turmas, professores e recursos.
- Vincular usuário/aluno/professor quando existir login.

#### O que melhorar
- `Hoje`: card de aula abre chamada.
- `Alunos`: CTA `Nova matrícula`; lista em rows.
- `Turmas`: editar turma e ver alunos em detalhe; sem repetir formulário de matrícula/mensalidade.
- `Pendências`: aprovar interesse, reposição e drop-in por fila.

#### Recomendação de prioridade
P1.

### Gestão > Clientes/CRM

#### Função da página
Gerenciar relacionamento, leads e follow-ups.

#### Problemas encontrados
- CRM pode virar depósito de contatos se não priorizar follow-up.
- Cobrança pertence ao Financeiro, não ao CRM.

#### Comparação com o manual
Boa aderência quando usa rotina/rows/drawer. Deve manter foco.

#### Desktop
Boa/parcial.

#### Mobile
Parcial: filtro e detalhe precisam ser sheet.

#### O que manter
- Rotina primeiro.
- Histórico em drawer.

#### O que melhorar
- Empty state compacto.
- Busca sempre disponível em lista grande.
- WhatsApp como ação contextual, não CTA global.

#### Recomendação de prioridade
P2.

### Gestão > Financeiro

#### Função da página
Baixar recebíveis, enviar lembretes, registrar despesas e analisar finanças.

#### Problemas encontrados
- A rotina de recebíveis deve ser separada de relatório.
- Mobile não deve mostrar tabela ampla.
- Origem da cobrança precisa ficar clara: reserva, mensalidade, plano, aula avulsa, produto.

#### Comparação com o manual
Financeiro aceita densidade alta no desktop, mas exige rows orientadas à ação no mobile.

#### Desktop
Boa/parcial.

#### Mobile
Parcial/problemática se usar tabela.

#### O que manter
- `Marcar pago` primário.
- `Enviar lembrete` secundário.

#### O que melhorar
- Drawer de cobrança.
- Filtro por origem/status/período.
- Resumo financeiro em aba de análise, não antes da fila.

#### Recomendação de prioridade
P1.

### Gestão > Cantina/POS

#### Função da página
Registrar venda, acompanhar vendas do dia, estoque e produtos.

#### Problemas encontrados
- POS deve ser fluxo de ação, não catálogo administrativo.
- Total e finalizar venda precisam ficar sempre visíveis no mobile.

#### Comparação com o manual
Atende se separar venda rápida de estoque/produtos.

#### Desktop
Boa/parcial.

#### Mobile
Parcial: precisa checkout fixo.

#### O que manter
- Produtos acionáveis.
- Estoque baixo como rotina secundária.

#### O que melhorar
- Bottom bar de total.
- Produto em row/card compacto com quantidade.
- Edição de produto em sheet/drawer.

#### Recomendação de prioridade
P2.

### Gestão > Equipe

#### Função da página
Convidar equipe, aceitar vínculos e definir papéis.

#### Problemas encontrados
- Papéis podem parecer técnicos.
- Convite por e-mail/usuário precisa deixar claro que acesso só existe após aceite.

#### Comparação com o manual
Atende regra de permissão, mas precisa microcopy mais simples.

#### Desktop
Parcial.

#### Mobile
Parcial.

#### O que manter
- Convite pendente sem liberar acesso.
- Busca por usuário antes de convidar.

#### O que melhorar
- Descrições curtas por papel.
- Estado vazio com CTA único.
- Logs/histórico em disclosure.

#### Recomendação de prioridade
P2.

### Gestão > Ajustes

#### Função da página
Configurar dados públicos, recursos, regras, planos, permissões e publicação.

#### Problemas encontrados
- Área naturalmente densa; precisa parecer biblioteca de configuração.
- Não deve competir com operação diária.
- Muitas seções podem ficar longas no mobile.

#### Comparação com o manual
Requer progressive disclosure forte.

#### Desktop
Parcial.

#### Mobile
Parcial/problemática se tudo ficar aberto.

#### O que manter
- Separação por tópicos.
- Atalhos para módulo dono da rotina.

#### O que melhorar
- Acordeons ou abas de configuração.
- Cada seção com estado `Completo`, `Pendente`, `Ação`.
- Ações perigosas isoladas.

#### Recomendação de prioridade
P2.

## 5. Problemas sistêmicos encontrados

### 5.1 Páginas ainda oscilam entre produto e cockpit

Onde aparece: Home multi-papel, Eventos organizador, Gestão, Torneio/Liga owner, Ranking.

Por que prejudica: o usuário volta a sentir que precisa entender o sistema inteiro antes de agir.

Regra violada: interface não deve expor complexidade interna; cada tela deve ter intenção dominante.

Como corrigir: cada tela precisa abrir por próxima ação ou intenção única. Métricas, histórico e configuração entram depois.

Prioridade: P0/P1.

### 5.2 Filtros não têm contrato único

Onde aparece: Locais, reservar quadra, aulas, jogos abertos, ranking, torneios, gestão.

Por que prejudica: o usuário reaprende a filtrar em cada tela.

Regra violada: consistência vence criatividade isolada.

Como corrigir: criar padrão `FilterBar` desktop e `FilterBottomSheet` mobile com resumo visível e ordem de campos definida por domínio.

Prioridade: P0.

### 5.3 Cards ainda são usados onde rows seriam melhores

Onde aparece: listas operacionais, rankings, inscrições, torneios organizados, gestão.

Por que prejudica: aumenta scroll e faz cada item parecer uma seção.

Regra violada: card é exceção em operação diária; row é padrão.

Como corrigir: cards para objetos públicos de descoberta; rows para tarefas, itens operacionais e listas densas.

Prioridade: P1.

### 5.4 Mobile tecnicamente funciona, mas nem sempre é mobile-first

Onde aparece: ranking, agenda, formulários de criação, financeiro, academia, chaveamento.

Por que prejudica: muito scroll, leitura longa e ações repetidas.

Regra violada: responsividade real.

Como corrigir: transformar tabelas em listas, filtros em sheets, detalhes em sheets e CTAs importantes em rodapé sticky.

Prioridade: P0/P1.

### 5.5 Formulários longos ainda seguem lógica técnica

Onde aparece: criação de torneio/liga, ajustes do local, turma, quadra/regra, professor, financeiro.

Por que prejudica: o usuário não entende se está configurando algo essencial ou avançado.

Regra violada: design deve seguir tarefa, não banco de dados.

Como corrigir: etapas por decisão humana, valores padrão, avançado recolhido e revisão final.

Prioridade: P1/P2.

### 5.6 Estados e feedbacks precisam padronização

Onde aparece: APIs/RPCs, reservas, inscrições, pagamentos, ranking, gestão.

Por que prejudica: erro técnico quebra confiança.

Regra violada: estados de interface claros.

Como corrigir: `ScreenState`, `InlineFeedback`, `Toast` e `FormError` com mensagens humanas.

Prioridade: P0.

### 5.7 Microcopy alterna entre humana e técnica

Onde aparece: tabs, filtros, configuração, mensagens de suporte.

Por que prejudica: termos internos geram sensação de backend.

Regra violada: linguagem orientada à ação.

Como corrigir: trocar rótulos técnicos por tarefa: `Resolver reservas`, `Aulas de hoje`, `Ver inscritos`, `Configurar regras`.

Prioridade: P2.

## 6. Recomendações de arquitetura e navegação

### Menu principal

- Player App: `Início`, `Locais/Jogar`, `Competir`, `Ranking`, `Perfil`.
- Multi-papel: entrada profissional discreta (`Trabalho`, `Organizar` ou `Gestão`) sem substituir a leitura do jogador.
- Management OS: não deve aparecer para jogador puro.

### Camadas de navegação

- Nível 1: áreas principais.
- Nível 2: lista ou hub de objetos.
- Nível 3: detalhe do objeto.
- Nível 4: ação específica em drawer/sheet/wizard.

### Submenus

- Tabs devem trocar conteúdo real, não rolar para uma seção da página.
- Se a aba não tem conteúdo para aquele formato, não deve aparecer.
- Filtros de classe/temporada devem ser contextuais à aba.

### Páginas de detalhe

Padrão recomendado:

1. header compacto do objeto;
2. status e CTA principal;
3. tabs/rail de intenções;
4. conteúdo da intenção selecionada;
5. ações secundárias em menu/disclosure.

### Fluxos complexos

- Criar torneio/liga/local: wizard.
- Operação diária: nunca wizard.
- Edição curta: drawer desktop, sheet mobile.
- Configuração estrutural: página dedicada com seções.

## 7. Recomendações de design system

### Botões

- `primary`: próxima ação, uma por contexto.
- `secondary`: alternativa imediata.
- `quiet`: suporte, navegar ou limpar.
- `danger`: isolado e nunca junto do fluxo principal.
- Ícone sem texto só quando o contexto é óbvio e há tooltip/aria-label.

### Cards

Usar card para:

- evento público;
- local;
- plano/oferta;
- escolha de categoria;
- slot/quadra no fluxo visual.

Não usar card para:

- cada reserva;
- cada aluno;
- cada recebível;
- cada produto;
- cada item de fila operacional.

### Rows

Usar row para:

- listas operacionais;
- alunos;
- reservas;
- pagamentos;
- produtos;
- partidas;
- leads;
- staff.

### Tabelas

- Desktop: volume, comparação, relatório.
- Mobile: converter para lista.
- Nunca usar tabela como formulário.

### Modais, drawers e bottom sheets

- Drawer desktop: detalhe/edição curta sem perder contexto.
- Bottom sheet mobile: filtros, seleção curta e detalhe de item.
- Modal central: confirmação crítica ou bloqueante.
- Página dedicada: fluxos longos ou configuração extensa.

### Badges/status

- Verde: pronto/confirmado.
- Amarelo: pendente/atenção.
- Vermelho: erro/cancelado.
- Azul/neutro: informativo.
- Não usar cor como único indicador.

### Empty states

- Compacto.
- Explica o estado, não o sistema.
- Uma ação clara.
- Não ocupar o mesmo peso de uma pendência real.

### Loading states

- Skeleton proporcional.
- Sem gaps grandes.
- Se dados opcionais falharem, não bloquear a tela principal.

### Tipografia e espaçamento

- Título de página maior; títulos internos menores.
- Não usar hero-scale em painéis compactos.
- Espaçamentos consistentes por modo: Player leve, Competition médio, Management denso.

### Cores

- Paleta atual verde/navy é adequada ao esporte e passa confiança.
- Cuidado: navy muito pesado em áreas públicas pode parecer painel.
- Usar verde para ação/estado positivo, não para todos os elementos.
- Evitar telas monotom em verde; usar neutros e badges.

## 8. Recomendações para mobile

Telas que precisam de redesenho ou endurecimento de padrão mobile:

- Agenda > Calendário;
- Agenda > Nova reserva;
- Ranking;
- Torneio > Jogos/chave;
- Torneio/Liga > filtros de classe;
- Financeiro > Recebíveis;
- Academia > Alunos/Turmas;
- Ajustes;
- Criação de torneio/liga.

Regras mobile:

- filtros em bottom sheet com resumo;
- ações principais em CTA sticky quando o fluxo tem confirmação;
- listas densas em rows, não cards empilhados;
- detalhe de item em sheet;
- máximo de uma decisão por dobra;
- não esconder itens com slice silencioso;
- rails horizontais precisam de overflow visível e snap;
- tabelas viram listas;
- menus internos podem ser arrastáveis, mas não devem depender só do arraste.

## 9. Recomendações para web/desktop

Telas que podem aproveitar melhor largura:

- Agenda: calendário por quadra + painel lateral de detalhe.
- Financeiro: lista/tabela de recebíveis + drawer.
- Academia: lista de alunos/turmas + detalhe lateral.
- Torneio/Liga owner: fila principal + painel de suporte.
- Ranking: tabela compacta + filtros laterais.

Regras desktop:

- usar largura para contexto e detalhe, não para multiplicar cards;
- filtros recorrentes podem ficar inline;
- ações secundárias em overflow;
- métricas como faixa de suporte, não como hero;
- dashboards devem responder "o que faço agora?", não "quantos números existem?".

## 10. Fila de implementação

| Prioridade | Área | Página/Componente | Problema | Solução proposta | Impacto | Esforço |
|---|---|---|---|---|---|---|
| P0 | Design system | Filtros | Cada área filtra de um jeito | Criar contrato `FilterBar` desktop + `FilterBottomSheet` mobile com ordem e resumo | Alto | Médio |
| P0 | Player/Locais | Reserva de quadra | Fluxo ainda pode virar formulário técnico | Consolidar calendário por quadra, horas cheias, duração visual e confirmação com perfil | Alto | Médio |
| P0 | Management/Agenda | Calendário mobile | Grade densa e risco de quadras sumirem | Seletor/carrossel por quadra + slots em lista + sheet de detalhe | Alto | Médio |
| P0 | Competition | Torneio jogos/chave | Chaveamento não é mobile-first | Criar viewer de chave com zoom/scroll claro e ações separadas | Alto | Alto |
| P0 | Interface states | Erros API/RPC | Erro técnico pode vazar | Padronizar `FormError`, `InlineFeedback`, `Toast` e mascarar SQL/RPC | Alto | Médio |
| P1 | Home | `/inicio` | Tom de onboarding pode permanecer | Título/CTA 100% contextual por prioridade; descoberta só sem pendência | Alto | Baixo |
| P1 | Player/Locais | Aulas | Multi-dia e pós-aprovação pouco claros | Etapas Perfil > Turma/dias > Interesse; status "aguardando aprovação" e `Minhas aulas` | Alto | Médio |
| P1 | Player/Locais | Jogos abertos | Falta padrão de filtro | Adotar UF/cidade/local/data/período/nível/status | Médio | Médio |
| P1 | Competition | Torneio público | Classe/inscritos duplicam controles | Um filtro contextual escalável; remover aba sem função | Alto | Médio |
| P1 | Competition | Liga pública/owner | Estado de inscrição e classe pesados | Badge compacto + filtro contextual por aba | Alto | Médio |
| P1 | Competition | Organizador | Ainda há resquício de cockpit | `Organização` por fila/setup; `Jogos` só jogos; `Inscritos` só inscritos | Alto | Médio |
| P1 | Management | `/gestao` | Warning de timeout em dados opcionais | Lazy-load dados de suporte e skeleton específico | Alto | Médio |
| P1 | Management/Academia | Alunos/Turmas | Risco de duplicar formulários | Rows + drawer; CTA único de matrícula; mensalidade centralizada | Alto | Médio |
| P1 | Financeiro | Recebíveis mobile | Densidade de tabela | Rows mobile com origem, valor, status e ação | Alto | Médio |
| P2 | Ranking | `/ranking` | Mobile longo e social competindo | Top 10 + `Ver mais`; follow quiet; análises em disclosure | Médio | Médio |
| P2 | Perfil | Histórico/preferências | Pode crescer demais | Timeline compacta e grupos de preferências | Médio | Baixo |
| P2 | CRM | Contatos/leads | Risco de virar depósito | Rotina primeiro, contatos como lista pesquisável, detalhe em sheet | Médio | Baixo |
| P2 | POS | Venda mobile | Checkout pode sair da vista | Total/checkout sticky | Médio | Médio |
| P2 | Ajustes | Configuração extensa | Muitas seções abertas | Acordeons/status por seção e ações perigosas isoladas | Médio | Médio |
| P3 | Visual | Cores/microcopy | Variações entre módulos | Revisar rótulos, badges e espaçamento por modo | Médio | Baixo |
| P3 | Acessibilidade | Componentes interativos | Foco/aria/tamanho de toque variáveis | Checklist WCAG básico por componente | Médio | Médio |

## 11. Quick wins

- Trocar textos de onboarding permanente por textos contextuais.
- Garantir uma CTA primária por tela.
- Remover contadores `0` de descoberta.
- Compactar empty states grandes.
- Colocar ações secundárias em overflow/drawer.
- Padronizar `Limpar filtros`, `Aplicar filtros` e resumo de filtro.
- Transformar cards operacionais repetitivos em rows.
- Reduzir subtítulos longos em cards de ação.
- Usar badges pequenos para estado pessoal (`Inscrição aprovada`, `Presença confirmada`).
- Esconder seções pessoais sem dado real.
- Colocar `Ver mais` antes de listas longas no mobile.
- Mover relatórios/análises para disclosure.
- Padronizar loading com skeleton curto.
- Garantir que todos os itens com hover/cursor tenham ação real.

## 12. Conclusão

O caminho recomendado não é remover função. É organizar a apresentação para que cada perfil veja somente o que precisa, na ordem em que precisa agir.

O app já tem arquitetura suficiente para competir: Player App, Competition OS e Management OS estão separados; há rotas, permissões, seeds, filas, formulários, reservas, aulas, torneios, ligas e gestão real. O próximo salto de qualidade vem de disciplina visual e operacional:

- manter funções existentes;
- reduzir complexidade visual;
- usar rows para operação e cards para descoberta;
- tornar mobile realmente mobile;
- separar básico, avançado e configuração;
- padronizar filtros, estados, modais/sheets e CTAs;
- fazer cada tela responder uma pergunta principal.

Se essa fila for aplicada com constância, o produto deixa de parecer "um conjunto de ferramentas fortes" e passa a parecer um app moderno: simples para o jogador, rápido para o professor, operacional para a recepção, confiável para o financeiro e poderoso para o gestor/organizador.
