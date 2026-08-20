# Build brief — "Moutarde & Grands Crus" weekend page

A single static HTML page presenting a three-day itinerary in Dijon and the Côte de Beaune, 11–13 September 2026. Theme: **mustard**. Read this whole file before writing code. All content below is final and verified — **use it verbatim, do not invent restaurants, prices, times or facts.** If something seems missing, leave it out rather than filling the gap.

---

## 1. Deliverable and constraints

- **One file: `index.html`**, plus the supplied `images/` folder. Nothing else.
- All CSS and JS **inline** in that file. No build step, no bundler, no framework, no npm.
- No external JS libraries. Google Fonts via `<link>` is the **only** permitted external request, and the page must still look right if it fails — always declare full system fallback stacks.
- Must open correctly from `file://` by double-clicking. Test that.
- Target: modern browsers, no transpilation, no polyfills.
- Total page weight excluding images: under 100 KB.

## 2. Audience and tone

Two people who have already decided to go. This is **their** document, not a brochure — no marketing copy, no "discover the magic of Burgundy". Everything on the page should be either a fact they'll need on the day (time, address, phone, price, distance) or a short piece of reasoning about why a choice was made. Write UI labels in English; keep French proper nouns and dish names in French, unitalicised.

---

## 3. Design direction

### Palette

Mustard is the theme, so the palette is built from it — but mustard yellow is a hard colour to use at scale. **Use it as accent and structure, not as background fill.** Large flat areas of yellow read as "warning sign".

```
--ink:        #1B1917   /* body text, near-black warm */
--ink-soft:   #5C554A   /* secondary text */
--paper:      #FBF7EF   /* page background, warm off-white */
--paper-2:    #F3ECDE   /* card / alternate band background */
--mustard:    #C9971C   /* primary accent — rules, numbers, active nav */
--mustard-lo: #EFD9A0   /* tints, hover states, chip backgrounds */
--bourgogne:  #6A1E2C   /* secondary accent — wine, links, day 2 */
--vine:       #55663F   /* tertiary accent — outdoors, ride, day 3 */
--line:       #E0D6C2   /* hairlines and borders */
```

Assign one accent per day for the day headers and timeline dots: **Friday = mustard, Saturday = bourgogne, Sunday = vine.** Everything else stays neutral.

### Typography

- Display / headings: a high-contrast serif — `Fraunces`, or `Playfair Display`, falling back to `Georgia, 'Times New Roman', serif`.
- Body: `Inter`, falling back to `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
- Times, distances, prices and phone numbers in a monospace or tabular-figure treatment so the timeline column aligns: `ui-monospace, 'SF Mono', Menlo, Consolas, monospace`, or `font-variant-numeric: tabular-nums`.
- Body text 17–18px, line-height ~1.65, measure capped at ~68ch. Generous whitespace — this is a document to read, not a dashboard.

### Layout

- Max content width ~1100px, centred, with full-bleed image bands breaking out.
- **Timeline** is the core pattern for each day: a left rail with the time, a vertical hairline with a coloured dot per entry, and the content to the right. On screens under 720px the time moves above the entry title and the rail collapses.
- Images sit inside entries as wide figures with a short caption in `--ink-soft`, or as full-bleed bands between days. Rounded corners 4px max — keep it editorial, not app-like.
- Respect `prefers-reduced-motion`. Keep animation to almost nothing: a subtle fade-in on scroll is the maximum, and it must be disabled under reduced-motion.
- Dark mode: optional. If you do it, use `prefers-color-scheme` and keep the mustard accent legible (lighten to `#E0B448` on dark). Do not ship a toggle.

### Components to build

1. **Hero** — full-viewport-height-ish image band, title, dates, one-sentence standfirst, and a row of four "fact chips" (see §5).
2. **Sticky nav** — thin bar that appears after the hero, links to `#vendredi #samedi #dimanche #reservations #carnet`. Highlight the section currently in view using `IntersectionObserver`. Must not obscure content when jumping to an anchor (`scroll-margin-top`).
3. **Timeline entry** — time, title, meta line (address · phone), body prose, optional badges, optional figure.
4. **Badge / chip** — small pill for `€12`, `1 h`, `Booking required`, `Open Sunday`, `Closed Wed & Sun`. Booking-required badges in bourgogne; everything else neutral or mustard-tinted.
5. **Callout** — a bordered aside for warnings and alternatives. Two variants: `note` (mustard left border) and `warn` (bourgogne left border).
6. **Distance strip** — the segment table for the bike ride, rendered as a horizontal chain of village names with kilometres between them. On mobile it becomes a simple vertical list. Do not use a `<canvas>` or SVG chart; plain elements are fine.
7. **Booking checklist** — ordered list, each with a `tel:` link and a checkbox. Persist checked state in `localStorage` under key `dijon2026`, wrapped in `try/catch` so a blocked storage API never breaks the page.
8. **Print stylesheet** — `@media print`: hide nav and hero image, force `--paper` to white, black text, keep images but cap them at ~60mm tall, avoid breaking a timeline entry across pages (`break-inside: avoid`), and expose phone numbers as text. The whole itinerary should print onto roughly 3–4 A4 pages.

### Accessibility

Semantic landmarks (`header`, `nav`, `main`, `section`, `footer`), one `h1`, logical heading order, visible focus rings, alt text as specified in §6, contrast ≥ 4.5:1 for body text. The checklist checkboxes need real `<label>` associations.

---

## 4. Page structure

```
hero
intro           "Why mustard, and what's actually protected"
day  vendredi   11 September
day  samedi     12 September   (contains the bike block + map)
day  dimanche   13 September
reservations    booking checklist, in priority order
carnet          what to buy + two honest caveats
footer
```

---

## 5. Content — use verbatim

### Hero

- Eyebrow: `Côte-d'Or · France`
- H1: **Moutarde & Grands Crus**
- Subtitle: `Dijon and the Côte de Beaune · Friday 11 – Sunday 13 September 2026`
- Standfirst: `Two nights in one hotel, a mustard mill, twenty-six kilometres of vineyard track, and a train that means nobody has to stay sober.`
- Fact chips:
  - `Base — Maison Philippe le Bon, Dijon, both nights`
  - `Car — parked at the hotel all weekend`
  - `Saturday — Dijon ↔ Beaune by TER, 19 min`
  - `Ride — Voie des Vignes, ~26 km return`

Hero image: `images/hero-cote-de-beaune.jpg`

### Intro — "Why mustard, and what's actually protected"

Render as three or four short paragraphs, or as a small definition list. Content:

- **"Dijon mustard" is a recipe, not an origin.** It describes a method — seeds ground with verjuice or white wine — and anyone anywhere may legally use the name. Which is exactly why the shops in Dijon are more interesting than they sound: they are the places still doing it here.
- **The protected thing is IGP Moutarde de Bourgogne.** It requires seeds grown in Burgundy *and* Burgundian white wine. For decades nearly all mustard seed came from Canada; local growers have been rebuilding acreage. The IGP mark is the only part of this with an address.
- **Fallot, in Beaune, is the last independent family mustard maker in Burgundy** — founded 1840, still grinding on millstones. It is the anchor of the weekend, and it opens seven days a week.
- **Two things you won't see.** Mustard seed is cut in July, so there are no mustard fields in September. And 2026 was an exceptionally early vintage — most Côte-d'Or picking finished around 20 August — so the vendange will be over. The compensation: cellars in mid-September are relaxed and glad to see you rather than flat out.

### Friday 11 September — Dijon

Accent: mustard.

| Time | Entry |
|---|---|
| — | **Arrive by 14:00.** Whatever the drive takes, work backwards from this. The workshop is the one thing that can't move. Badge: `Reserve the hotel parking in advance` — central Dijon is almost entirely pedestrianised and Maison Philippe le Bon's courtyard has limited spaces. Ask for a superior room; the standards are compact. Address: 18 rue Sainte-Anne. Images: `philippe-le-bon-chambre.jpg` and `philippe-le-bon-jardin.jpg` as a two-up figure. |
| 14:45 | **Make your own mustard** ⭐ · 86 rue Monge, opposite the Dé Masqué café · Badges: `€12 each`, `1 hour`, `Booking compulsory`. Run with Fallot. You grind, crush, season and mix; you leave with your own jar and a voucher for a gift at the Fallot shop. Slots at 10:00, 11:30, 14:45 and 16:30, April to 1 November. Book on **+33 3 80 44 11 44** or info@otdijon.com. This is the smallest-capacity thing on the weekend — and it is the "make" in walk, bike, taste, eat, make, see. |
| 16:15 | **The Owl Trail, mustard edition** — 22 bronze owls set into the pavement, threading the old town. Booklet from the tourist office at 11 rue des Forges, five minutes from the hotel. Ninety unhurried minutes, and it runs past both mustard shops. Sub-items: **Fallot Boutique-Atelier**, 16 rue de la Chouette — literally on the trail; tasting bar, millstone grinding visible on some days, mustards made with Meursault. **Maille**, 32 rue de la Liberté — moutarde à la pompe, pumped fresh into a stoneware jar. Fresh mustard is a different substance from jarred: sharper, more volatile, and it fades within weeks. Buy small, eat soon. Callout `warn`: **Maille is closed Sunday and you're in Beaune all Saturday — this is your only window.** End line: left hand on the owl at Notre-Dame, make a wish. |
| 19:45 | **Chez Léon** · 20 rue des Godrans · **+33 3 80 50 01 07** · Badges: `Menu bourguignon €31–38`, `Closed Sun & Mon`. Unreconstructed Burgundian, and on-theme: **carré de cochon, moutarde à l'ancienne** on the carte, alongside œufs en meurette, escargots and bœuf bourguignon. Small room — book early. Callout `note`: **When you book, ask whether they'll run lapin à la moutarde or rognons de veau à la moutarde that night.** Both survive here as daily specials rather than fixed-carte items. Kitchens like being asked. Images: `chez-leon-salle.jpg` and `chez-leon-vol-au-vent.jpg` as a two-up figure. |
| 22:00 | **Chez Bruno** · 80 rue Jean-Jacques Rousseau · Badge: `Tue–Sat to 23:00`. Where Dijon's wine trade drinks. |

### Saturday 12 September — Beaune, by rail and bicycle

Accent: bourgogne. Open the day with a callout `note`:

> Leave the car at the hotel. Dijon–Beaune is **19 minutes** direct on the TER, several an hour, and the **last train back leaves Beaune at 21:58** — which is what makes a Beaune dinner possible. Bikes travel free on TER trains, standard and electric alike.

| Time | Entry |
|---|---|
| 08:15 | **Les Halles de Dijon** — Eiffel-framed iron market hall, open Tuesday, Thursday, Friday and Saturday **mornings only**, and Saturday is the big one. Forty minutes is enough: Époisses, jambon persillé, gougères, and a jar of IGP Moutarde de Bourgogne to taste against yesterday's Fallot and Maille. |
| 09:00 | **Walk to Dijon-Ville** (10 min) and take the train to Beaune. |
| 09:30 | **Hôtel-Dieu, Hospices de Beaune** · Badges: `€12.50`, `Daily 09:00–19:30`, `Allow 1 h 15`. The polychrome tiled roof, the Great Hall of the Poors, the van der Weyden *Last Judgement*. Go now — by eleven it is a queue. |
| 10:50 | **Beaune Saturday market** — Place Fleury and Place Carnot, until 13:00. A fast loop. Buy something for a stone wall between villages. |
| 11:30 | **Collect the bikes — Bourgogne Randonnées** · 7 avenue du 8 Septembre · **+33 3 80 22 06 03** · conveniently on the station road. Take the e-bikes. |
| 11:45 | **The Voie des Vignes** ⭐ — see the ride block below. |
| 13:00 | **Lunch — Le Cellier Volnaysien** · 2 place de l'Église, Volnay · **+33 3 80 21 61 04** · Badges: `5 km in`, `Closed Tue & Wed`. Vaulted cellar rooms and tables outside. **Jambon persillé** and **œufs en meurette** are the signatures, and the attached cave sells Burgundy at prices that haven't noticed the tourists. Book. Image: `cellier-volnaysien-cave.jpg`. |
| 14:30 | **On to Meursault and Puligny, then turn.** About 26 km round trip, which is the honest distance for the time available. Santenay and back is 46 km and will not fit today. |
| 16:10 | **Bikes back.** |
| 16:30 | **La Moutarderie Fallot** ⭐ · 31 rue du Faubourg Bretonnière · **+33 3 80 22 10 10** · Badges: `€12`, `Open daily`. See the two-tour comparison below. Image: `fallot-moutarderie.jpg`. |
| 19:15 | **Dinner — Caves Madeleine** · 8 rue du Faubourg Madeleine, Beaune · **+33 3 80 22 93 30** · Badges: `Open Sat`, `Closed Wed & Sun`, `Booking is a request`. Shared tables, blackboard cooking, and a wine list run by people who care. Callout `warn`: **Their booking is a request, not a confirmation** — it isn't settled until they call or email you back, so ask early. Images: `caves-madeleine-salle.jpg` and `caves-madeleine-plat.jpg` as a two-up figure. |
| 21:30 | **Last train home** — 21:58 from Beaune, in Dijon by 22:17. Comfortable, but it is the last one. |

#### The ride block (inside Saturday, after the 11:45 entry)

Heading: **The Voie des Vignes**. Body: flat, on small roads and vineyard tracks, running from Beaune through Pommard, Volnay, Meursault, Puligny-Montrachet, Chassagne-Montrachet to Santenay — **23 km one way** on the official Pays Beaunois map. It is, unimprovably, a bike path through the most expensive farmland on earth. Cyclists share these tracks with the growers who work them: **20 km/h limit, give way, take your rubbish home.**

Distance strip — segment kilometres from the official map:

```
Beaune  →3.6→  Pommard  →1.5→  Volnay  →3.5→  Meursault  →4.6→  Puligny-Montrachet  →3.5→  Chassagne-Montrachet  →…→  Santenay
```

Cumulative markers to show under the strip: `Volnay 5.1 km · Meursault 8.6 km · Puligny 13.2 km · Santenay 23 km`. Highlight **Puligny-Montrachet as the turnaround** — style the segments beyond it as muted/dashed to show they're out of scope today.

Images: `voie-des-vignes-cyclists.jpg` and `voie-des-vignes-map.jpg`. The map is the useful one — give it room, and make it click-to-open-full-size in a new tab (a plain `<a href>` around the `<img>`, not a JS lightbox). Caption it: `Official Pays Beaunois cycling map — the green line is the Voie des Vignes.`

#### The Fallot tour comparison (inside Saturday, after the 16:30 entry)

Render as a two-column comparison card, with **Sensations Fortes marked as the pick**. Same price, genuinely different visits.

| | Parcours Découvertes | **Sensations Fortes** ✅ |
|---|---|---|
| What | France's first mustard museum — history, period tools, sound and light | The **working factory**: silo to packaging, stone grinding still in use |
| Length | ~1 h 15 | ~1 h |
| Daily times | 10:00 · 11:30 (Fr + En) · 15:00 · 16:30 | 10:00 · 11:00 · 13:30 (En, Jun–Sep) · 14:00 · 14:30 · 15:00 · 16:00 · 16:30 |
| Price | €12 | €12 |

Below it, a callout `note`: Both end in a tasting; the boutique is open to 18:00. **Book by phone and say which language** — the English *Sensations Fortes* slot is 13:30, so at 16:30 you will likely be in a French group. If that matters, either take the 13:30 English tour and cut the ride short, or take *Découvertes* at 11:30, which runs in French and English, and rearrange the morning. And: **buy here, not in Dijon** — same prices, and it is the source. The Meursault-based mustard, the pain d'épices, the blackcurrant.

### Sunday 13 September — the Cité, and home

Accent: vine. Intro line: **12 Parvis de l'UNESCO** — a kilometre from the old centre, on the site of the former hospital. Twenty minutes on foot from the hotel, or drive and park there, since you're leaving from it anyway.

| Time | Entry |
|---|---|
| 09:30 | **A last walk in the vines** · Badge: `Optional`. Saturday gave you wheels instead of boots. The **Route des Grands Crus starts on Dijon's own doorstep** — 15 minutes by car to Chenôve or Marsannay-la-Côte, where marked paths run up through the vineyards with the whole Côte opening out below. An hour, easy, and it costs nothing in distance because the car is already loaded. |
| 11:00 | **The Cité Internationale de la Gastronomie et du Vin.** Three things to know, because the site is bigger and more mixed than it looks. As a small list: (1) **The permanent exhibitions are free** — 1,750 m² across *À la Table des Français* and **Le 1204**, an interpretation centre for the site's 800 years as a hospital. (2) **The Chapelle des Climats** — a chapel of 1504, now an immersive projection about the Burgundy climats — is free to walk into, but the **guided visit with a tasting is €9** and is the better version. That's your Sunday wine, and a properly good primer on why one dry-stone wall changes the price of a field. (3) **The Village Gastronomique is free and open Sunday 10:00–19:00** — nine artisan boutiques including cheese, charcuterie, chocolate and **mustard**, where you buy what you want, have it cooked on the plancha and eat at communal tables. Alongside it the **Cave de la Cité** pours from 3,000 references, 250 of them by the glass. |
| 12:30 | **Sunday brunch at La Cuisine Expérientielle** · Badge: `Reservation required`. The Village's brunch buffet runs every Sunday and has become a Dijon institution. Alternatives: **La Table des Climats** and **Le Comptoir de la Cité** are both on site. Or leave the Cité for **Le Pré aux Clercs** on Place de la Libération — open 7/7, menus €16–28, and its carte currently runs to **cromesquis d'andouillette, sabayon à la moutarde**, the single most on-theme plate in Dijon. |
| ~15:00 | **Drive home.** |

Then a callout `warn` closing the day:

> **One thing to confirm by phone.** The Village Gastronomique's Sunday hours are confirmed (10:00–19:00) but the **exhibition halls' Sunday hours are not** — the Cité's own site blocks automated access. Ring **+33 3 73 27 54 20** to check the exhibitions and the Chapelle des Climats tasting times before fixing Sunday morning. Their online ticketing also lists around 16 ateliers and 7 École des Vins de Bourgogne tastings — worth a look for a Sunday slot, though most are French-only.

### Reservations — the booking order

Ordered list, each with a `tel:` link on the number and a persistent checkbox.

1. **Mustard workshop, Dijon** — +33 3 80 44 11 44. Four slots a day, small groups. *First.*
2. **Maison Philippe le Bon** — and reserve the courtyard parking in the same call.
3. **Chez Léon** — +33 3 80 50 01 07 · Friday 19:45. Ask about the lapin and the rognons.
4. **Caves Madeleine** — +33 3 80 22 93 30 · Saturday 19:15. Remember: the booking isn't confirmed until they reply.
5. **Fallot, *Sensations Fortes*** — +33 3 80 22 10 10 · Saturday 16:30. State your language.
6. **Le Cellier Volnaysien** — +33 3 80 21 61 04 · Saturday 13:00.
7. **Bikes, Bourgogne Randonnées** — +33 3 80 22 06 03 · two e-bikes from 11:30.
8. **Cité Sunday brunch** — and check exhibition hours on +33 3 73 27 54 20.

### Carnet — what comes home in the boot

- **Fallot**, bought in Beaune — the Meursault-based mustard, the pain d'épices, the cassis.
- **Maille moutarde à la pompe** in the stoneware jar — Friday only, and eat it within the month.
- Anything marked **IGP Moutarde de Bourgogne** — seeds actually grown here, Burgundian white wine in the mix.
- From the markets and the Village: **jambon persillé**, **Époisses** (seal it in something unforgiving), **crème de cassis**.

### Footer

Two short lines:

- `Journées du Patrimoine fall on 19–20 September, the weekend after. You dodge the crowds.`
- `Prices and opening times checked August 2026. Phone ahead for anything that matters.`

---

## 6. Image manifest

All in `images/`. Every one needs meaningful alt text — the strings below are the alt text, use them.

| File | Placement | Alt text |
|---|---|---|
| `hero-cote-de-beaune.jpg` | Hero, full-bleed | A stone manor house and church tower below terraced vineyards in the Côte de Beaune |
| `philippe-le-bon-chambre.jpg` | Friday, arrival entry (two-up, left) | A hotel bedroom with exposed dark beams and a pale floral mural behind the bed |
| `philippe-le-bon-jardin.jpg` | Friday, arrival entry (two-up, right) | The garden terrace of Maison Philippe le Bon, with parasols and tables under mature trees |
| `chez-leon-salle.jpg` | Friday dinner (two-up, left) | The dining room at Chez Léon, with white beams and handwritten chalkboard menus |
| `chez-leon-vol-au-vent.jpg` | Friday dinner (two-up, right) | A vol-au-vent with morels in a cream sauce |
| `voie-des-vignes-cyclists.jpg` | Ride block | Two cyclists on a vineyard track beside a dry-stone wall |
| `voie-des-vignes-map.jpg` | Ride block, wide, click to enlarge | Official cycling map showing the Voie des Vignes running south from Beaune through Pommard, Volnay, Meursault and Puligny-Montrachet |
| `cellier-volnaysien-cave.jpg` | Saturday lunch | The vaulted stone cellar dining room of Le Cellier Volnaysien, lit by lanterns, with wine barrels set into the walls |
| `fallot-moutarderie.jpg` | Saturday, Fallot entry | The Moutarderie Fallot in Beaune, its name painted in yellow across a cream façade, with a vintage yellow delivery van outside |
| `caves-madeleine-salle.jpg` | Saturday dinner (two-up, left) | The dining room at Caves Madeleine, with bottle racks lining the wall and a long communal table |
| `caves-madeleine-plat.jpg` | Saturday dinner (two-up, right) | Sliced beef under a green herb sauce, with bread, butter and a glass of red wine |

Notes:

- `voie-des-vignes-cyclists.jpg` is only **640 × 640** — the smallest of the set. Do not stretch it wide; use it square or in a constrained column beside the map.
- `caves-madeleine-plat.jpg` is nearly square and portrait-ish; the rest are landscape. The two-up figure pattern must cope with mismatched aspect ratios — use `object-fit: cover` with a fixed aspect box rather than letting heights disagree.
- Add `loading="lazy"` and `decoding="async"` to everything except the hero, and give every `<img>` explicit `width`/`height` attributes to prevent layout shift. Read the real pixel dimensions off the files rather than guessing.

---

## 7. Acceptance criteria

Work through these before declaring done:

1. Opens from `file://` with no console errors and no failed requests other than, possibly, Google Fonts.
2. Every phone number is a working `tel:` link, with the `+33` international form in the `href`.
3. Sticky nav highlights the right section while scrolling, and anchor jumps land with the heading visible below the bar.
4. Checklist state survives a reload. Then: block `localStorage` in devtools and confirm the page still works.
5. At 375 px wide there is no horizontal scroll, the timeline has collapsed to its stacked layout, and the distance strip is readable.
6. `Cmd/Ctrl+P` produces a clean 3–4 page document with no nav, no clipped text, and no timeline entry split across a page break.
7. Reduced-motion is honoured.
8. Tab through the whole page: focus is always visible and the order is logical.
9. Spot-check five facts against this brief — a time, a price, a phone number, a distance and a closing day. They must match exactly.

## 8. Explicitly out of scope

No booking integration, no maps API, no analytics, no cookie banner, no contact form, no service worker, no dark-mode toggle, no hamburger menu (the nav is five short links — let them wrap).
