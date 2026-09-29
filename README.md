# AuraFarm — Etapa 02

Jogo cozy independente para iPhone/PWA. Este repositório nasce do zero e não compartilha código, dados, credenciais ou infraestrutura com outros aplicativos.

## Rodar e compilar

Requer Node.js 22.12+ (Node 24 recomendado).

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Stack: React + TypeScript + Vite, Phaser 3.90, Zustand e Zod. O Phaser é carregado em um módulo separado e usa WebGL com fallback Canvas. Todo o desenho da clareira é procedural e original; nenhum asset externo, imagem paga ou material dos jogos de referência é utilizado. Ícones de interface: Lucide (ISC).

## O que está implementado

- Propriedade explorável com caminhos, floresta, lago, casa, flores, cercas e duas passagens futuras: portão e ponte interrompida.
- Personagem original com quatro orientações, animações de caminhada e repouso, movimento por toque e navegação A* com desvio de obstáculos.
- Câmera suave, limitada ao mundo; profundidade por posição, transparência das copas e descarte visual fora do enquadramento.
- Identificação e aproximação de árvores, pedras, arbustos e pontos de interesse, sem coleta completa nesta etapa.
- HUD React compacto. Experiência prioritariamente **horizontal**, `100dvh`, safe areas e aviso para girar o iPhone; sem scroll da página.
- Salvamento automático da posição realmente percorrida e dos lugares visitados. Saves da etapa 01 preservam progresso e recursos, reposicionando o personagem no novo mapa.
- Energia, mochila, configurações e persistência da fundação preservadas. Caminhar e observar não gastam energia.
- PWA offline após a primeira abertura, atualização mediante comando e recuperação ao retornar ao aplicativo.

## Arquitetura

| Pasta | Responsabilidade |
| --- | --- |
| `src/engine` | Inicialização do Phaser, cena, câmera, renderização procedural e porta de comunicação |
| `src/app`, `src/ui` | React, HUD, diálogos e ciclo de vida do PWA |
| `src/state` | Fonte única de estado, comandos atômicos, avisos e sessões |
| `src/domain/player` | Identidade local e posição |
| `src/domain/inventory`, `resources` | Quantidades e catálogo de recursos |
| `src/domain/energy`, `progression` | Regras puras de energia e experiência |
| `src/domain/maps`, `objects` | Definição do mundo, terreno navegável, sólidos, áreas bloqueadas e interações |
| `src/domain/quests`, `characters` | Contratos iniciais para missões, NPCs e narrativa |
| `src/domain/economy`, `farming` | Contratos para moedas, construções e cultivos; sem sistemas complexos nesta etapa |
| `src/persistence` | Schema v1, migrações futuras, adaptador local e porta de sincronização remota |
| `src/audio`, `settings` | Serviço de áudio desbloqueado por gesto e preferências |

O React não renderiza o mundo. O Phaser não acessa armazenamento nem componentes React: usa `engine/bridge.ts`. Comandos validam ações e alteram os dados; a cena observa o estado. Coordenadas de mundo são separadas da viewport e o depth sorting já usa Y. O mundo usa perspectiva elevada com volumes e sobreposição. Arte procedural está isolada em `engine/rendering/worldArt.ts`; personagem em `engine/characters/Explorer.ts`; enquadramento em `engine/camera/WorldCamera.ts`. Texturas definitivas e novas animações podem substituir essas implementações sem alterar os dados do jogador.

## Navegação e expansão do mundo

`domain/maps/types.ts` separa limites caminháveis, formas de colisão, áreas bloqueadas, cenário e pontos de interação. `meadow.ts` é a definição declarativa desta primeira propriedade; as passagens futuras continuam sólidas. `NavigationGrid` calcula rotas sobre uma malha de 24 unidades, considera o raio do personagem e impede cortes diagonais em obstáculos. A cena valida cada segmento executado, independentemente da rota calculada.

A revisão do mundo é independente da versão do save. `normalizeWorld.ts` migra posições antigas e corrige posições fora da região alcançável; valores inválidos não apagam inventário ou progressão. A posição é salva durante o percurso, na chegada e ao ocultar a página. Destinos ainda não percorridos nunca são persistidos como posição do jogador.

## Persistência e limites

Chave exclusiva: `aurafarm:save:v1`; cópia anterior: `aurafarm:backup:v1`. Salva jogador, progressão, energia, inventário, moedas, áreas abertas, objetos coletados, missões, construções, cultivos, personagens e preferências. Os campos futuros começam vazios.

O adaptador valida saves via Zod. Um save inválido tenta o backup; a origem danificada é preservada em `aurafarm:recovery`. Versões futuras desconhecidas bloqueiam abertura/gravação em vez de apagar progresso. Falhas de escrita exibem aviso persistente e são tentadas novamente. Fechar normalmente o PWA mantém o progresso. Apagar dados do site, armazenamento privado não persistente ou remoção pelo sistema podem removê-lo; sincronização entre dispositivos ainda não existe. O navegador pode negar a solicitação de armazenamento persistente.

`RemoteSavePort` é somente um contrato, sem credenciais ou backend fictício. A futura sincronização deve autenticar o usuário, conferir revisão no servidor, migrar identidade local e resolver conflitos explicitamente. O evento `storage` acompanha mudanças entre abas; esta etapa não promete transações simultâneas entre várias abas.

No iPhone, primeiro abra online e adicione à Tela de Início pelo menu Compartilhar do Safari. O service worker guarda apenas o app; o progresso fica separado e não é removido ao atualizar caches. Uma atualização só é aplicada depois de salvar com sucesso. Áudio começa desligado e só pode ser ativado por gesto. Vibração depende do suporte do aparelho e é opcional.

## GitHub → Vercel

Repositório existente: `matheusvinic55-create/aurafarm`, branch `main`. Projeto Vercel existente: `aurafarm`. Produção: https://aurafarm-psi.vercel.app/. As próximas etapas devem atualizar exclusivamente esses mesmos projetos.

- Framework: Vite
- Instalação: `npm ci`
- Build: `npm run build`
- Saída: `dist`
- Diretório raiz: raiz do repositório
- Node: 24.x
- Produção: `main`
- Variáveis de ambiente: nenhuma nesta etapa

`vercel.json` contém os parâmetros de build e evita cache duradouro do service worker. A integração Git da Vercel deve criar os deployments posteriores a cada push em `main`. O lockfile deve acompanhar todo commit que altera dependências.

## Próximas etapas (não implementadas)

3. Obstáculos, regras completas de coleta e desbloqueio de áreas.
4. Fazenda, plantações, receitas, produção e inventário completo.
5. Missões, progressão completa, personagens e narrativa.
6. Animações, áudio, efeitos, eventos, equilíbrio e polimento.

Regra permanente: **“Energia controla o ritmo da exploração; não controla o direito de jogar.”** Cuidar da fazenda, produzir, decorar e conversar devem continuar disponíveis sem energia. Não há monetização nem mecanismos de escassez artificial.
