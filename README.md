# Players Front-End 🎮

Este é o front-end do projeto de gestão de jogos e recompensas, desenvolvido em **Angular 18**. A aplicação consome uma API que gerencia usuários, times, jogadores e integrações com a rede **Stellar** para pagamentos de recompensas.

## 🚀 Tecnologias Utilizadas

* **Angular 18**: Framework base.
* **SCSS**: Pré-processador para estilos avançados.
* **RxJS**: Gerenciamento de fluxos assíncronos e estados.
* **Stellar SDK (Previsto)**: Integração para validação de carteiras e transações.

---

## 🛠️ Requisitos de Ambiente

Antes de começar, você precisará ter instalado:

* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Angular CLI](https://angular.dev/tools/cli) (`npm install -g @angular/cli`)

---

## 💻 Instalação e Execução

1. **Instale as dependências:**
```bash
npm install

```


2. **Inicie o servidor de desenvolvimento:**
```bash
npx ng serve

```


3. **Acesse a aplicação:**
Abra o navegador em `http://localhost:4200/`.

---

## 📂 Estrutura de Domínio

A interface é desenhada para cobrir as seguintes entidades do banco de dados:

* **Autenticação**: Login baseado em `Usuario` e controle de acesso por `Role` (Admin, Jogador, Analista).
* **Gestão de Times**: Listagem e detalhes dos times (`Time`).
* **Dashboard de Jogadores**: Visualização de estatísticas individuais e integração com a `carteira_stellar`.
* **Módulo de Jogos**: Registro de partidas, durações e pontuações (`Time_Jogo` e `Jogador_Jogo`).
* **Financeiro/Blockchain**: Monitoramento do `status` das recompensas via `Transacao_Recompensa`.

---
