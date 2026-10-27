# UMEF · Séminaire « Programmer avec une IA » (`seminaire-ia`)

One-off, 3 h, Swiss UMEF conference day, **Tue 27 Oct 2026, 09h15–12h00, salle
Moscou-Dubaï**. Requested by Dimitrios Koukourdinos ("a topic of new
technologies … interactive the way you do the courses"). French. Built 26 Oct 2026.

Teams of 2–3 describe an app to a FREE chat assistant (Claude, ChatGPT, Gemini,
Le Chat), paste the code into the atelier, run it, wire it to a shared Firebase
branch through REST, publish, vote. Jan Erik demos an agent (Claude Code) live
building a results screen for the opening poll (`umefsem/data/_salle/q1|q2`).

| Page | Does |
|---|---|
| `index.html` | the session, taught from the page; opening poll; plan; theory; risks |
| `atelier.html` | team name → prompts 1–4 built from the team's idea and data path → paste/run in a sandboxed iframe (errors, console.log, every fetch reported to a side panel; prompt 3 fills itself with the errors) → raw view of the team's data → publish |
| `app.html?t=<team>` | one published app, full screen, ❤ vote |
| `galerie.html` | projector wall of `idx/`, re-read every 10 s, votes |
| `sem.js` | DB helpers, `clean()` (strips ``` fences), the iframe prelude, `IDEAS` |

## Traps
- ⚠ **Student HTML runs only in `sandbox="allow-scripts allow-forms allow-modals
  allow-popups"` — never add `allow-same-origin`.** It is unreviewed code on
  janerikmeidell.com and could read `jem_fb_session` from localStorage. The
  prelude shims localStorage/sessionStorage (they throw in an opaque origin).
  Firebase REST answers CORS for `Origin: null` (checked 26 Oct 2026).
- ⚠ **Rules block `umefsem` must be published** or everything is 401 (pages say
  so). `apps/$team` and `idx/$team` are overwritable but not deletable —
  any team can overwrite another's app; accepted for a 3-hour room. `votes`
  create-once. `data/$team/$coll/$item` fully open at item level (apps need
  PATCH/DELETE), refused at collection/team level so one request cannot wipe a
  team. The instructor token can write (wipe) the whole `umefsem`.
- No login, progress, chat or presence: `ns` is null in courses.json on purpose.
- Screenshots in headless Chrome do not show the iframe (out-of-process);
  test by logging from inside it.
- After the session: `status:"archived"`, and consider wiping `umefsem`.
