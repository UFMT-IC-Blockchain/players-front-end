
---

## Prompt (Autoexecutável) — Resolver Issues no `players-front-end`

### Gatilho inicial (OBRIGATÓRIO)
Ao abrir este arquivo, você **DEVE começar imediatamente** a resolver a próxima issue do repositório `players-front-end` e **executar o ciclo completo automaticamente, sem intervenção humana**, até:
- PR **mergeado** na `main`
- Branch **removida**
- `main` **atualizada localmente**
- Issue **fechada** (automática via `Closes #ID`, ou fechada manualmente como fallback)

Regra de foco: **não mude de contexto** e **não inicie outra issue** até que a issue atual esteja com **PR mergeado** e **issue fechada**.

### 0) Regras de Prioridade (anti-conflito)
- **Escopo:** siga a issue. Não adicione features fora do solicitado.
- **UI Premium:** aplique padrões premium (glass, micro-interações, responsivo, tipografia/spacing), **mas respeite a paleta/layout definidos na issue** quando houver conflito.
- **Qualidade:** evitar `any`, remover imports não usados, manter tipagem e estados de UI (loading/erro/vazio).
- **Windows/PowerShell:** evite `&&` e prefira comandos em linhas separadas.
- **Não-interativo:** não use comandos que abrem editor; use flags e bodies inline.
- **Idempotência:** se branch/PR já existir, **reusar** em vez de recriar.
- **Merge automático:** só merge quando checks estiverem verdes (usar auto-merge).

### 1) Auto-configuração (sem perguntas / sem placeholders)
1. Garanta que está em `players-front-end`.
2. Descubra automaticamente o repositório (`OWNER/REPO`) a partir do `git remote`.
3. Selecione a próxima issue de forma determinística (evitar escolhas arbitrárias).
4. Atualize a `main` e crie/reuse branch no padrão `feature/front-[issueId]-[resumo-curto-kebab]`.
5. Execute implementação, build, testes, commit, push, PR, validação, auto-merge, pós-merge e fechamento.

**PowerShell (Windows) — fluxo automatizado (idempotente)**
```powershell
cd C:\Users\helio\source\repos\Gerenciamento-Jogos-Front-Back\players-front-end

gh auth status

$Repo = gh repo view --json nameWithOwner -q .nameWithOwner
$Repo

git checkout main
git fetch origin
git pull --ff-only origin main

# Seleção determinística:
# - Prioriza `area:frontend` se existir
# - Fallback: menor número entre issues abertas
$IssueId = gh issue list --repo $Repo --state open --label "area:frontend" --limit 200 --json number --jq "map(.number) | min"
if (-not $IssueId) {
  $IssueId = gh issue list --repo $Repo --state open --limit 200 --json number --jq "map(.number) | min"
}

gh issue view $IssueId --repo $Repo --json number,title,labels,url

$IssueTitle = gh issue view $IssueId --repo $Repo --json title --jq .title
$Slug = $IssueTitle.ToLowerInvariant()
$Slug = $Slug -replace "[^a-z0-9]+","-"
$Slug = $Slug.Trim("-")
if ($Slug.Length -gt 32) { $Slug = $Slug.Substring(0, 32).Trim("-") }

$Branch = "feature/front-$IssueId-$Slug"

git checkout -B $Branch

# IMPLEMENTE A ISSUE AQUI (sem intervenção humana):
# - faça mudanças mínimas conforme a issue
# - evite `any`, mantenha tipagem e estados
# - para telas: estados `idle | loading | ready | empty | error`

npm run build
npm test -- --watch=false --browsers=ChromeHeadless

git add -A
git commit -m "feat: resolver #$IssueId"
git push -u origin HEAD

# Reusa PR se já existir para este branch; senão cria
$PrNumber = gh pr list --repo $Repo --head $Branch --json number --jq ".[0].number"
if (-not $PrNumber) {
  gh pr create --repo $Repo `
    --base main `
    --title "feat: $IssueTitle" `
    --body @"
## O que mudou
- ...

## Por que mudou
- ...

## Contexto
Closes #$IssueId
"@
  $PrNumber = gh pr list --repo $Repo --head $Branch --json number --jq ".[0].number"
}

# Validação crítica: o PR precisa referenciar a issue para fechamento automático
gh pr view $PrNumber --repo $Repo --json number,state,closingIssuesReferences,url

# Auto-merge (aguarda checks ficarem verdes e mergeia sozinho)
gh pr merge $PrNumber --repo $Repo --merge --auto --delete-branch

git checkout main
git pull --ff-only origin main
git branch -D $Branch

# Confirmar issue fechada
gh issue view $IssueId --repo $Repo --json state,closedAt,url
```

### 2) Implementação (Angular)
- **Standalone components:** `standalone: true`, rotas com `loadComponent`.
- **Services:** lógica de API em `src/app/core/services`, usando `HttpClient` e `environment.apiUrl`.
- **Modelos tipados:** criar types/interfaces para requests/responses; normalizar DTOs se o backend retornar tipos inconsistentes (ex.: agregações que podem vir como `string`).
- **Estados de tela:** `idle | loading | ready | empty | error` com mensagens claras.
- **Validações:** implementar conforme issue e **não chamar API** quando inválido.

### 3) Regras de Execução (para ficar 100% automático)
- **Sem prompts:** não pedir para substituir `OWNER/REPO` ou escolher issue; derive tudo via `gh repo view` e `gh issue list`.
- **Fail fast:** se `npm run build` ou `npm test` falhar, parar e corrigir antes de criar/atualizar PR.
- **Idempotente:** reexecutar o fluxo deve:
  - reusar o mesmo branch (via `git checkout -B`)
  - reusar o mesmo PR (via `gh pr list --head`)
  - não criar duplicatas
- **Fechamento automático:** sempre incluir `Closes #$IssueId` no body do PR e validar `closingIssuesReferences`.
- **Merge automático:** usar `gh pr merge --auto` para aguardar checks e mergear sem intervenção humana.

### 8) Submódulo / Repositório Pai (apenas se existir)
- Verificar se existe repo Git pai/superproject e, se existir, commitar a referência do submódulo.

---
