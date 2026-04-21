# Claude Task: SIGEM Exploration

## 🎯 CURRENT OBJECTIVE

[Update this section with your current goal]

Example: "Map the complete ticket lifecycle across all services"

---

## 📋 CACHE-FIRST PROTOCOL (ALWAYS FOLLOW)

When processing this task, you MUST:

### 1. Read Cache First

```bash
# Always start by reading these:
/exploration-cache/MANIFEST.json
/exploration-cache/QUICK-REFERENCE.md
2. Answer from Cache When Possible
If answer exists in cache → cite source and STOP

Format: 📚 FROM CACHE: [file path] - [finding]

3. Only Explore Gaps
State what's missing: ⚠️ CACHE GAP: [specific missing info]

Explore ONLY the missing paths

Never re-explore cached paths

4. Update Cache After Each Discovery
Update MANIFEST.json with new paths

Update relevant exploration.md files

Update QUICK-REFERENCE.md for patterns

Add timestamp to all updates

5. Token Saving Rules
❌ Don't repeat cached content in responses

✅ Use file references instead

❌ Don't re-read files from current session

✅ Keep responses brief, point to cache

📁 Cache Structure Reference
text
/exploration-cache/
├── MANIFEST.json          # Master status of all paths
├── QUICK-REFERENCE.md     # Cross-cutting patterns
├── services/
│   ├── api-gateway/exploration.md
│   ├── inventory-service/exploration.md
│   ├── log-service/exploration.md
│   ├── notification-service/exploration.md
│   ├── provider-service/exploration.md
│   ├── reference-service/exploration.md
│   └── vehicle-service/exploration.md
├── apps/
│   ├── configs/exploration.md
│   ├── docs/exploration.md
│   ├── infra/exploration.md
│   ├── packages/exploration.md
│   └── scripts/exploration.md
└── patterns/
    ├── communication.md
    ├── data-flow.md
    ├── error-handling.md
    └── authentication.md
🔄 Session Start Procedure
At the beginning of each session:

Read this TASK.md file

Read /exploration-cache/MANIFEST.json

State current cache status:

markdown
## 📊 CACHE STATUS
- Services explored: [list from MANIFEST]
- Last update: [timestamp]
- Pending gaps: [from QUICK-REFERENCE]
Proceed with current objective

📝 Current Task Details
[PASTE YOUR SPECIFIC QUERY HERE]

Example:
"Find all services involved in ticket creation. Document the complete flow from API request to database persistence."

✅ Task Completion Checklist
Before marking task complete:

All relevant services documented in cache

MANIFEST.json updated with new explorations

QUICK-REFERENCE.md has pattern summaries

No gaps remain for this objective

Cache files are self-contained (can answer future queries)

🚀 Quick Commands
During conversation, I may use these shortcuts:

Command	Meaning
[STATUS]	Show current cache coverage
[GAPS]	List what's missing for current objective
[UPDATE]	Force cache update with recent findings
[CLEAR]	Reset cache for specific path
[VERIFY]	Check if answer exists in cache before exploring
⚠️ Critical Rules
NEVER explore a path marked "completed" in MANIFEST.json

ALWAYS cite cache source when answering

ALWAYS update cache after discovering something new

KEEP responses concise - point to cache files

ASK before large explorations (>10 files)

📍 Current State (Auto-updates)
Last Task: [Leave blank - Claude updates]
Cache Last Updated: [Leave blank - Claude updates]
Next Priority: [Leave blank - Claude updates]
```
