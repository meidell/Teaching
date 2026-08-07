/* =====================================================================
   SHARED · course configuration.
   The runtime mirror of /courses.json — deliberately inline so the
   critical path (identity pill, announcement bar) never waits on a
   fetch. /courses.json stays authoritative for content (titles,
   descriptions, module lists); this file holds only what the runtime
   needs to draw itself: namespace, storage prefix, language, theme.

   Keep the two in sync when you add a course. CourseConfig.load()
   fetches the full registry for pages that need the rest of it
   (the root catalogue, the admin dashboard).

   Every other /shared/ module depends on this one. Load it first:
     <script src="/shared/config.js" defer></script>
   ===================================================================== */
window.CourseConfig = (function () {
  "use strict";

  var DB = "https://teaching-70f1c-default-rtdb.europe-west1.firebasedatabase.app";

  /* deep = headings · bar = announcement bar · main = buttons & borders
     glow = highlight on the bar · pale = soft panel · surface = page bg */
  var THEMES = {
    sumas: { deep:"#2C5530", bar:"#2C5530", main:"#4A8B3A", glow:"#8FCB5E",
             pale:"#E8F2E2", surface:"#F4EDE0", ink:"#1A2B1C", grey:"#6B7A6C" },
    ideas: { deep:"#7C0A00", bar:"#AB0E00", main:"#AB0E00", glow:"#FF4133",
             pale:"#FBEAE8", surface:"#F8FAFC", ink:"#0F172A", grey:"#64748B" },
    umef:  { deep:"#0F4C60", bar:"#176B87", main:"#176B87", glow:"#2A93B0",
             pale:"#E3EEF2", surface:"#F4F6F8", ink:"#232A31", grey:"#6B7280" },
    navy:  { deep:"#0a1a3a", bar:"#152a5e", main:"#1e5aa8", glow:"#f0b33d",
             pale:"#E8EEF8", surface:"#F4F6FA", ink:"#0a1a3a", grey:"#5A6B87" }
  };

  /* key = the data-course value on the page.
     ns    — Firebase namespace
     key   — localStorage prefix. Defaults to the id; `statistics` is the one
             historical exception (students already have stats_* keys) and
             changing it would orphan their saved progress.
     login — the course is on the shared roster (name + personal code, so a
             student resumes on any device). false = the older name-box
             identity, where progress lives on one device only. */
  var COURSES = {
    "omba401":   { ns:"omba401",   theme:"sumas", lang:"en", login:false,
                   label:"OMBA401 · Quantitative Methods" },
    "ombafr455": { ns:"ombafr455", theme:"sumas", lang:"fr", login:false,
                   label:"OMBAFR455 · Marchés financiers durables" },
    "e1410":     { ns:"e1410",     theme:"ideas", lang:"en", login:true,
                   label:"E1410 · Advanced Project Management in AI" },
    "umef407":   { ns:"umef407",   theme:"umef",  lang:"en", login:false,
                   label:"UMEF407 · Digital Innovation" },
    "statistics":{ ns:"statistics",theme:"navy",  lang:"en", login:false, key:"stats",
                   label:"Statistics & Data" }
  };

  /* ---- language strings, so a French course speaks French everywhere ---- */
  var STR = {
    en: {
      pillUnset:  "① Enter your name to save progress",
      pillSynced: " · synced",
      title:      "Save your progress",
      blurb:      "Enter your name so your professor can see your progress (who, when, time spent, what you completed). It saves on this device and syncs automatically.",
      backTitle:  "Left it blank earlier?",
      backBody:   "No work is lost — everything you have already done in this browser is recorded locally and will be sent the moment you enter your name here.",
      namePh:     "First and last name",
      save:       "Save & continue",
      skip:       "continue without saving",
      saving:     "Saving…",
      saved:      "Saved ✓"
    },
    fr: {
      pillUnset:  "① Entrez votre nom pour enregistrer votre progression",
      pillSynced: " · synchronisé",
      title:      "Enregistrer votre progression",
      blurb:      "Entrez votre nom pour que votre professeur puisse suivre votre progression (qui, quand, temps passé, ce que vous avez terminé). Tout est enregistré sur cet appareil et synchronisé automatiquement.",
      backTitle:  "Vous l'aviez laissé vide ?",
      backBody:   "Rien n'est perdu — tout ce que vous avez déjà fait dans ce navigateur est enregistré localement et sera envoyé dès que vous entrerez votre nom ici.",
      namePh:     "Prénom et nom",
      save:       "Enregistrer et continuer",
      skip:       "continuer sans enregistrer",
      saving:     "Enregistrement…",
      saved:      "Enregistré ✓"
    }
  };

  function currentId() {
    if (window.COURSE_ID) return window.COURSE_ID;
    var b = document.body, h = document.documentElement;
    return (b && b.getAttribute("data-course")) ||
           (h && h.getAttribute("data-course")) || "";
  }

  function get(id) {
    var c = COURSES[id];
    if (!c) return null;
    return {
      id:     id,
      ns:     c.ns,
      key:    c.key || id,
      lang:   c.lang || "en",
      label:  c.label || id,
      login:  !!c.login,
      theme:  THEMES[c.theme] || THEMES.navy,
      themeName: c.theme,
      str:    STR[c.lang] || STR.en
    };
  }

  return {
    DB: DB,
    themes: THEMES,
    strings: function (lang) { return STR[lang] || STR.en; },
    ids: function () { return Object.keys(COURSES); },
    currentId: currentId,
    current: function () { return get(currentId()); },
    get: get,
    /* the full /courses.json, for pages that need titles, modules, status */
    load: function () {
      if (!this._p) this._p = fetch("/courses.json").then(function (r) { return r.json(); });
      return this._p;
    }
  };
})();
