# Rec Álbum

Aplicativo multiplataforma para organizar uma coleção pessoal de álbuns musicais. Desenvolvido com Ionic e Vue, o projeto funciona no navegador e como aplicativo Android.

> Guarde os discos que marcaram sua vida, organize suas faixas favoritas e encontre rapidamente aquilo que merece outro replay.

## Informações acadêmicas

- **Aluno:** Vinicius Cavilha de Souza
- **Curso:** Informática
- **Unidade curricular:** Codificar Aplicações para Dispositivos Móveis

## Sobre o projeto

O Rec Álbum permite que cada pessoa crie sua própria conta e mantenha uma coleção musical privada. Após o login, o usuário pode cadastrar álbuns com artista, ano de lançamento e uma lista dinâmica de músicas.

A interface foi pensada para dispositivos móveis, com identidade visual inspirada em capas de discos e aplicativos de streaming. Cada álbum recebe uma capa abstrata gerada dinamicamente a partir do seu nome.

## Funcionalidades

- Cadastro de usuário
- Login, logout e proteção das rotas internas
- Cadastro de álbuns com:
  - nome;
  - artista;
  - ano de lançamento;
  - lista de músicas.
- Adição e remoção dinâmica de faixas
- Visualização detalhada de cada álbum
- Marcação e remoção de favoritos
- Tela dedicada aos álbuns favoritos
- Remoção de álbum com confirmação
- Tela Sobre com versão, termos de uso e política de privacidade
- Layout responsivo para smartphones e desktop
- Persistência independente para cada usuário

## Tecnologias

- [Vue 3](https://vuejs.org/) — construção da interface
- [TypeScript](https://www.typescriptlang.org/) — tipagem e segurança do código
- [Ionic Vue](https://ionicframework.com/docs/vue/overview) — componentes e experiência mobile
- [Capacitor](https://capacitorjs.com/) — integração com Android
- [Vue Router](https://router.vuejs.org/) — navegação e proteção de rotas
- [Vite](https://vite.dev/) — ambiente de desenvolvimento e build

## Persistência dos dados

Este projeto não depende de um servidor externo. Contas, sessão e álbuns são armazenados no `localStorage` do dispositivo.

Os dados de cada coleção são associados ao usuário autenticado. Limpar os dados do aplicativo ou do navegador também remove as informações cadastradas.

> A autenticação local é adequada para fins acadêmicos e demonstração. Em um produto real, senhas devem ser processadas por um backend seguro e nunca armazenadas diretamente no dispositivo.

## Como executar no navegador

### Pré-requisitos

- Node.js 18 ou superior
- npm

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/ViniciusCavilha/rec-album.git
cd rec-album
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse o endereço informado pelo Vite no terminal, normalmente `http://localhost:5173`.

## Como executar no Android Studio

Com o Android Studio e o SDK Android instalados:

```bash
npm run build
npx cap sync android
npx cap open android
```

No Android Studio, aguarde a sincronização do Gradle, selecione um emulador ou dispositivo físico e clique em **Run**.

Sempre que alterar o código web, gere um novo build e sincronize novamente:

```bash
npm run build
npx cap sync android
```

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o ambiente de desenvolvimento |
| `npm run build` | Valida o TypeScript e gera o build de produção |
| `npm run preview` | Abre uma prévia local do build |
| `npm run test:unit` | Executa os testes unitários |
| `npm run test:e2e` | Executa os testes de ponta a ponta |
| `npm run lint` | Analisa a qualidade do código |

## Estrutura principal

```text
src/
├── components/       # Componentes reutilizáveis
├── router/           # Rotas e controle de autenticação
├── services/         # Persistência, sessão e regras dos álbuns
├── theme/            # Identidade visual global
└── views/            # Telas da aplicação
android/              # Projeto nativo utilizado pelo Android Studio
```

## Fluxo da aplicação

1. O usuário cria uma conta ou entra com uma conta existente.
2. As rotas internas são liberadas após a autenticação.
3. Na tela inicial, o botão flutuante abre o cadastro de álbum.
4. Os álbuns podem ser consultados, favoritados ou removidos.
5. A aba Favoritos reúne apenas os itens marcados.
6. A sessão pode ser encerrada pelo botão Sair.

## Build de produção

Para validar os tipos e gerar os arquivos otimizados:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## Repositório

Código-fonte disponível em:

[github.com/ViniciusCavilha/rec-album](https://github.com/ViniciusCavilha/rec-album)
