## 1 - Para criar um projeto Angular, instale o Node.js (que inclui o npm) e depois o Angular CLI globalmente com npm install -g @angular/cli. Use o comando ng new nome-do-projeto para criar a estrutura, e finalmente inicie o servidor com ng serve dentro da pasta do projeto. 

## 2 -  Caso de erro acima: 

gambyte@gambyte1:~/Documents/source/players-front-end$ ng version
Command 'ng' not found, but can be installed with:
sudo apt install ng-common

## 3 -  Caso ainda de erro: 

gambyte@gambyte1:~/Documents/source/players-front-end$ .
npx @angular/cli new --help;
node -v && nvm --version || echo "nvm not found";
npx -y @angular/cli@18 --version;

## 4 - Criar o projeto

npx -y @angular/cli@18 new players-front-end --directory . --style scss --routing true --skip-git --skip-tests --defaults --minimal false

## 5 - Rodar o projeto: gambyte@gambyte1:~/Documents/source/players-front-end$ npx ng serve