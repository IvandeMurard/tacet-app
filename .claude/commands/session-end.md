# /session-end — Documentation de fin de session

Génère un résumé structuré de la session Claude Code courante et l'écrit dans le vault Obsidian **Tacet 2026** via MCP.

## Instructions

1. **Collecte de contexte** — Récupère les informations de la session :
   - Lance `git log --oneline -10` pour voir les commits récents
   - Lance `git branch --show-current` pour identifier le worktree actif
   - Lance `git diff --stat HEAD~5 HEAD 2>/dev/null` pour voir l'impact des changements
   - Lis `docs/epics/` si disponible pour identifier l'epic/story en cours
   - Consulte `_bmad/bmm/config.yaml` pour le contexte projet

2. **Génère la note de session** — Crée une note Markdown structurée :

```markdown
# Session Tacet — [DATE] — [SUJET EN 3-5 MOTS]

## 🎯 Objectif de la session
[Ce que l'on cherchait à accomplir]

## ✅ Ce qui a été fait
- [Action 1 concrète]
- [Action 2 concrète]
- ...

## 🔧 Commits de la session
[Liste des commits avec hash et message]

## 💡 Décisions prises
- [Décision technique ou produit 1]
- [Décision 2]

## ⚠️ Problèmes rencontrés & solutions
- [Problème] → [Solution]

## 📋 Next steps (prochaine session)
- [ ] [Tâche prioritaire 1]
- [ ] [Tâche prioritaire 2]

## 🏷️ Tags
#tacet #session #[epic-ou-feature]
```

3. **Écris la note dans Obsidian** via MCP :
   - Chemin : `Sessions/[YYYY-MM-DD]-[sujet-kebab-case].md`
   - Utilise l'outil `mcp__obsidian__write_note`

4. **Si des décisions importantes ont été prises**, écris aussi dans `Décisions/[sujet].md`

## Note technique
Le MCP Obsidian pointe vers `C:\Users\IVAN\Documents\Tacet 2026`.
Après redémarrage de Claude Desktop, ce vault sera actif.
