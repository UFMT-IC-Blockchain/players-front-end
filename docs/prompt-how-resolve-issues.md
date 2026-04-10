
---

## Prompt (Autoexecutável) — Resolver Issues no `players-front-end`

### Gatilho inicial (OBRIGATÓRIO)
Ao abrir este arquivo, você **DEVE começar imediatamente** a resolver a próxima issue do repositório `players-front-end`.

Regra de foco: **não mude de contexto** e **não inicie outra issue** até que a issue atual esteja com **PR mergeado** e **issue fechada**.

### 0) Regras de Prioridade (anti-conflito)
- **Escopo:** siga a issue. Não adicione features fora do solicitado.
- **UI Premium:** aplique padrões premium (glass, micro-interações, responsivo, tipografia/spacing), **mas respeite a paleta/layout definidos na issue** quando houver conflito.
- **Qualidade:** evitar `any`, remover imports não usados, manter tipagem e estados de UI (loading/erro/vazio).
- **Windows/PowerShell:** evite `&&` e prefira comandos em linhas separadas.

### 1) Identificação e Preparação (comece por aqui)
1. Garanta que está em `players-front-end`.
2. Descubra o repositório remoto (para usar `OWNER/REPO` corretamente).
3. Liste issues abertas e selecione a próxima na sequência lógica.
4. Atualize a `main` e crie branch no padrão `feature/front-[issueId]-[resumo-curto-kebab]`.

**PowerShell (Windows) — comandos padrão**
```powershell
cd C:\Users\helio\source\repos\Gerenciamento-Jogos-Front-Back\players-front-end

git remote -v

# Substitua OWNER/REPO pelo remoto correto (ex.: UFMT-IC-Blockchain/players-front-end)
gh issue list --repo OWNER/REPO --state open --limit 20

git checkout main
git fetch origin
git pull --ff-only origin main

git checkout -b feature/front-<ID>-<resumo>
```

### 2) Implementação (Angular)
- **Standalone components:** `standalone: true`, rotas com `loadComponent`.
- **Services:** lógica de API em `src/app/core/services`, usando `HttpClient` e `environment.apiUrl`.
- **Modelos tipados:** criar types/interfaces para requests/responses; normalizar DTOs se o backend retornar tipos inconsistentes (ex.: agregações que podem vir como `string`).
- **Estados de tela:** `idle | loading | ready | empty | error` com mensagens claras.
- **Validações:** implementar conforme issue e **não chamar API** quando inválido.

### 3) Verificações locais (antes de commit)
```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

### 4) Commits Atômicos
- Commits pequenos e semânticos (`feat:`, `fix:`, `chore:`, `test:`).
```powershell
git add -A
git commit -m "feat: <descrição objetiva>"
```

### 5) Sincronização com `main` (antes de abrir PR)
```powershell
git fetch origin
git merge origin/main
```
- Se houver conflitos: resolver manualmente e repetir `npm run build` e `npm test`.

### 6) PR (criação + validação de fechamento)
Crie PR com corpo obrigatório contendo:
- **O que mudou**
- **Por que mudou** (arquivo → motivo técnico)
- **Contexto**: `Closes #<ID>`

```powershell
git push -u origin HEAD

gh pr create --repo OWNER/REPO `
  --base main `
  --title "feat: <título>" `
  --body @"
## O que mudou
- ...

## Por que mudou
- `caminho/arquivo`: ...

## Contexto
Closes #<ID>
"@

# Validação crítica: o PR precisa referenciar a issue para fechamento automático
gh pr view --repo OWNER/REPO --json number,state,closingIssuesReferences
```

Se `closingIssuesReferences` vier vazio, corrija o corpo com `gh pr edit`.

### 7) Merge e Pós-merge (encerrar o ciclo)
```powershell
# Use o número do PR retornado na criação

gh pr merge <NUMERO_PR> --repo OWNER/REPO --merge --delete-branch

git checkout main
git pull --ff-only origin main
git branch -D feature/front-<ID>-<resumo>

# Confirmar issue fechada

gh issue view <ID> --repo OWNER/REPO --json state,closedAt
```

Se a issue ainda estiver aberta, feche manualmente:
```powershell
gh issue close <ID> --repo OWNER/REPO --comment "Resolvido via PR #<NUMERO_PR>."
```

### 8) Submódulo / Repositório Pai (apenas se existir)
- Verificar se existe repo Git pai/superproject e, se existir, commitar a referência do submódulo.

---
