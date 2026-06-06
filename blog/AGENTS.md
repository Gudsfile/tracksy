# Blog — AGENTS.md

Gohugo-based site.

[Root AGENTS.md](../AGENTS.md)

## Commands

```bash
moon run blog:dev                                          # Dev server (drafts + future + expired)
moon run blog:build                                        # Production build → public/
moon run blog:clean                                        # Remove public/
moon run blog:new-post -- content/posts/my-post.md        # New post from archetype
```

## Structure

| Path | Purpose |
|------|---------|
| `content/` | Markdown posts |
| `assets/` | Images, CSS |
| `static/` | Static files served as-is |
| `themes/` | Hugo themes (git submodule) |
| `config/` | Hugo configuration |
