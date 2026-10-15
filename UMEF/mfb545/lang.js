/* =====================================================================
   SWISS UMEF · MFB 545 Fintech — language shim.
   The course is French only (syllabus: « Langue d'enseignement : Français »).
   The runtime files (presence.js, exercises.js, courseprogress.js) are ports
   of UMEF/gen110's, whose copy goes through T(fr,en); this file keeps that
   call working and always picks French. It also sets COURSE_LANG so that
   /shared/config.js hands login.js, progress.js and chat.js French copy.
   ===================================================================== */
window.COURSE_LANG='fr';
window.T=function(fr){return fr;};
