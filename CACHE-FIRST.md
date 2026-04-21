# Claude Cache-First Protocol

When a user includes "[CACHE-FIRST]" in their query, follow this:

1. **READ** `/exploration-cache/MANIFEST.json`
2. **SEARCH** relevant `/exploration-cache/**/*.md` for answer
3. **CITE** source if found: `📚 FROM: [file]`
4. **EXPLORE** only missing gaps
5. **UPDATE** cache with new findings
6. **NEVER** re-explore cached paths

This saves tokens and improves accuracy.
