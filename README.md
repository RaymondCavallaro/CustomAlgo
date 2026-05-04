# Lingua

- Versao em Portugues (esta)
- English version: [README.en.md](README.en.md)

# CustomAlgo

Prototipo inicial de uma camada pessoal e componivel de algoritmo social, tags, confianca e descoberta em rede.

O projeto tambem usa o nome de produto **SocialLens** para a primeira experiencia: uma lente local-first que permite classificar posts, autores e dominios, aplicar regras de ocultar, reduzir, destacar ou marcar conteudo, e preparar um caminho para compartilhamento seletivo de tags, algoritmos e fontes de dados.

Feito em grande parte com IA.

## O que e

CustomAlgo explora a ideia de que usuarios devem poder compor a propria experiencia de feed e busca:

- marcar conteudo, autores, dominios e futuramente contatos
- criar regras pessoais sobre essas classificacoes
- importar tags e algoritmos de outras pessoas
- escolher em quem confiar por contexto
- empilhar camadas de tags, regras e filtros como uma pilha de commits
- manter a possibilidade de escolher onde os proprios dados vivem

O objetivo nao e criar uma nova rede social primeiro. O objetivo e criar uma camada sobre plataformas existentes e, depois, expandir isso para busca e descoberta em rede.

## Superficies obrigatorias

O browser extension e apenas o primeiro cliente, nao o produto inteiro.

O projeto deve continuar apontando para:

- navegadores desktop
- navegadores mobile
- Android
- iOS
- iPadOS
- web/PWA responsivo

Em mobile, a experiencia deve combinar app, share sheet, PWA, browser interno e suporte a extensoes onde o sistema permitir.

## Prototipo atual

A versao atual tem um scaffold de extensao Manifest V3 com:

- overlay simples para paginas sociais e artigos
- tags locais para conteudo, autor e dominio
- regras locais para `hide`, `dim`, `boost` e `badge`
- popup para modo e camadas
- pagina de opcoes para quick tags, regras, banco de tags e import/export
- pacote inicial `packages/sociallens-core` para separar a logica compartilhada dos clientes
- documentos de arquitetura para plataforma, protocolo de fonte de dados e formato da lente

## Modelo central

```txt
Content = o que existe
Tags = claims que pessoas fazem sobre conteudo, autores ou dominios
Trust = quem voce acredita em qual contexto
Algorithms = regras que agem sobre tags confiaveis
Layers = imports, overrides e regras pessoais em ordem
Permissions = quem pode ver ou usar cada camada
Data source = onde os dados do usuario vivem
```

## Rodar a extensao localmente

1. Abra Chrome ou Edge.
2. Va para `chrome://extensions`.
3. Ative Developer Mode.
4. Escolha Load unpacked.
5. Selecione a pasta local deste repositorio.

## Estrutura do Projeto

```txt
apps/
  README.md
  mobile/
    App.js
    app.json
    package.json
packages/
  sociallens-core/
    data-source.js
    index.js
    state.js
    rules.js
    lens.js
manifest.json
src/
  background.js
  shared/
  content/
  popup/
  options/
docs/
  platform-architecture.md
  data-source-protocol.md
  protocol-survey-js-ts.md
  product-brief.md
  lens-format.md
```

## Documentos importantes

- [`docs/product-brief.md`](docs/product-brief.md)
- [`docs/platform-architecture.md`](docs/platform-architecture.md)
- [`docs/data-source-protocol.md`](docs/data-source-protocol.md)
- [`docs/storage-strategy.md`](docs/storage-strategy.md)
- [`docs/ipad-usage.md`](docs/ipad-usage.md)
- [`docs/social-integrations.md`](docs/social-integrations.md)
- [`docs/protocol-survey-js-ts.md`](docs/protocol-survey-js-ts.md)
- [`docs/docker-windows.md`](docs/docker-windows.md)
- [`docs/lens-format.md`](docs/lens-format.md)

## Docker

O projeto inclui um `docker-compose.yml` para rodar o ambiente Node/Expo do app mobile a partir do Windows.

Veja [`docs/docker-windows.md`](docs/docker-windows.md).

## Proximos passos

1. Mover a extensao para `apps/browser-extension` quando o core compartilhado estiver mais conectado.
2. Migrar o core para TypeScript.
3. Criar um adapter real de storage antes de adicionar web/mobile/sync.
4. Trocar o estado em memoria do app mobile por um adapter persistente.
5. Comecar `apps/web` como PWA responsivo para tags, regras, camadas, circulos e busca.
6. Adicionar captura por share sheet no mobile.
7. Melhorar extractors de plataforma para IDs estaveis de posts e contas.

## Estado atual

Isto e um teste conceitual, nao um produto finalizado.

O objetivo agora e manter a arquitetura facil de mudar enquanto a ideia de algoritmo pessoal, tags compartilhaveis, confianca contextual e fonte de dados configuravel fica mais clara.
