# Protótipo TrocaTicket

Protótipo navegável do sistema **TrocaTicket**, desenvolvido no **Bolt.new** para representar visualmente os principais fluxos, telas e funcionalidades da plataforma.

O protótipo contempla os três principais perfis de utilização do sistema:

- **Organizador**
- **Fornecedor**
- **Administrador**

Também estão representados os fluxos de:

- página inicial;
- login;
- escolha do tipo de cadastro;
- cadastro de Organizador;
- cadastro de Fornecedor;
- navegação entre as funcionalidades de cada perfil;
- página de rota não encontrada (404).

---

## 1. Arquivo do protótipo

O protótipo exportado está disponível neste diretório:

Prototipo_TrocaTicket_Bolt.zip

O arquivo .zip contém o código-fonte e os arquivos necessários para executar o protótipo localmente.

---

## 2. Pré-requisitos

Para executar o protótipo, é necessário possuir instalado no computador:

Node.js
npm

Para verificar se o Node.js está instalado, abra o terminal e execute:

node --version

Para verificar se o npm está instalado:

npm --version

Caso os dois comandos exibam suas respectivas versões, o ambiente está preparado para executar o projeto.

Caso o Node.js não esteja instalado, ele pode ser obtido pelo site oficial:

https://nodejs.org/

---

## 3. Extrair o protótipo

Baixe ou localize o arquivo:

Prototipo_TrocaTicket_Bolt.zip

Extraia o conteúdo do arquivo .zip.

Após a extração, será criada a pasta do projeto.

Dentro dela estará a estrutura principal semelhante a:

project/
├── .bolt/
├── public/
├── src/
├── package.json
├── package-lock.json
├── vite.config.ts
└── ...

---

## 4. Abrir o projeto

Abra a pasta project no Visual Studio Code ou em outro editor de código.

Também é possível abrir um terminal diretamente dentro dessa pasta.

Importante

Os comandos de instalação e execução devem ser realizados dentro da pasta project, pois é nela que está localizado o arquivo:

package.json

---

## 5. Instalar as dependências

Com o terminal aberto dentro da pasta project, execute:

npm install

Esse comando instala todas as dependências utilizadas pelo protótipo.

A instalação pode levar alguns instantes.

Após a conclusão, será criada automaticamente a pasta:

node_modules/

---

## 6. Executar o protótipo

Depois que o npm install terminar, execute:

npm run dev

O Vite iniciará o servidor local do protótipo.

O terminal exibirá uma mensagem semelhante a:

Local: http://localhost:5173/

Abra o endereço apresentado pelo terminal no navegador.

Normalmente, o endereço será:

http://localhost:5173/

Caso o Vite apresente uma porta diferente, utilize o endereço informado pelo próprio terminal.

---

## 7. Prompt utilizado no Bolt.new

O protótipo foi desenvolvido utilizando o **Bolt.new** como ferramenta de prototipação e desenvolvimento.

Durante a criação do protótipo, foi utilizado um prompt com instruções para orientar a construção das telas, funcionalidades, navegação e identidade visual do sistema **TrocaTicket**.

O prompt utilizado no desenvolvimento está disponível no arquivo:

```text
./prompt-bolt.md
```
