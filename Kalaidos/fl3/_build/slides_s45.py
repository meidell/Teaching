#!/usr/bin/env python3
"""FL III — the decks of séances 4 and 5 (Saturday 21 Nov 2026), generated.

Jan Erik, 20 Nov 2026: "slides for both session 4 and 5 for the part where I
teach … make it very clear on the slides where they are in the sessions, so
that they can look at the site instead of the slides … very easy to read for me".

So, unlike the dark decks of séances 1–2: a LIGHT deck, very large type, few
lines per slide, and on EVERY content slide a band at the top that names the
section and the card of the séance page holding the same text, plus a strip of
the séance's steps with the current one highlighted.

Run:  python3 _build/slides_s45.py && python3 _build/slides_pdf.py seance4 seance5
Edit the slides HERE, never in the generated seance4-slides.html / seance5-slides.html.
"""
import io, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

from deck import CSS, JS, fit, esc, Deck

# =====================================================================
#  SÉANCE 4
# =====================================================================
d = Deck(4, [('4.1', '4.1 Scission'), ('4.2', '4.2 Transfert'), ('4.3', '4.3 Atelier'), ('4.4', '4.4 Atelier'), ('4.5', '4.5 Cas 1'), ('4.6', '4.6 Cas 2')])

d.raw('title', """<div class="eyebrow">Financial Leadership III · séance 4 · samedi 21 novembre 2026 · 09h30–13h00</div>
<h1>La scission et le transfert de patrimoine</h1>
<p>Ouvrez la page de la séance 4 dans un onglet. Chaque diapositive indique, dans la bande du haut, la section et la carte de cette page où se trouve le même texte.</p>
<div class="url">janerikmeidell.com/Kalaidos/fl3/seance4.html</div>""",
      'Accueil. Demander à chacun d’ouvrir la page de la séance 4 et de se connecter. Montrer la bande du haut sur la diapositive suivante : elle dit où lire le même texte sur le site.')

d.slide(None, None, 'Ce matin : j’explique deux opérations, puis vous résolvez deux cas', """
<table class="t">
<tr><th>Quand</th><th>Qui travaille</th><th>Où sur la page de la séance 4</th></tr>
<tr><td class="k">Partie 1<br>09h30–11h05</td><td>L’enseignant explique la scission, puis le transfert de patrimoine.</td><td><b>Sections 4.1 et 4.2</b></td></tr>
<tr><td class="k">Partie 2<br>11h20–13h00</td><td>Deux ateliers sur Alpibois, que nous faisons avec toute la classe. Puis deux cas sur l’entreprise fictive Cafés Cuendet, que vous résolvez et que vous montrez.</td><td><b>Sections 4.3 et 4.4</b> (ateliers)<br><b>Section 4.5</b> (cas 1)<br><b>Section 4.6</b> (cas 2)</td></tr>
</table>
<p class="small" style="margin-top:.8em">Les sections 4.7, 4.8, 4.9 et 4.10 se font après la séance.</p>""",
        'Lire le tableau. Dire : pendant la partie 1 vous pouvez suivre sur le site au lieu de regarder les diapositives, le texte est le même, en plus complet.')

d.slide(None, None, 'La séance 3 sur la fusion a été annulée : aucun cas d’aujourd’hui ne demande la fusion', """
<ul class="pts">
<li>La séance 3 du jeudi 19 novembre n’a pas eu lieu.</li>
<li>La date à laquelle la fusion sera rattrapée sera annoncée sur la page du cours.</li>
<li>Les cas d’aujourd’hui demandent la création (séance 1), la transformation (séance 2), la scission et le transfert de patrimoine (séance 4), puis l’assainissement (séance 5, cet après-midi).</li>
</ul>""", 'Rassurer : la fusion apparaît dans un tableau ce matin, seulement pour la situer par rapport à la scission.')

d.raw('part', '<div class="num">Partie 1 · section 4.1 de la page</div><h2>La scission dans la loi sur la fusion</h2><p>Une société transmet son patrimoine à d’autres sociétés, et ses actionnaires reçoivent des parts de ces sociétés.</p>',
      'Annoncer la section 4.1. Ceux qui suivent sur le site cliquent sur la carte 4.1 dans le menu de la séance.')

d.slide('4.1', 'Quatre restructurations, une loi', 'La loi sur la fusion (LFus) règle quatre opérations qui changent la structure d’une entreprise sans la liquider', """
<table class="t">
<tr><th>Opération</th><th>Ce qui se passe</th><th>LFus</th></tr>
<tr><td class="k">Fusion</td><td>Une société reprend tout le patrimoine d’une autre, qui disparaît.</td><td>art. 3</td></tr>
<tr><td class="k">Scission</td><td>Une société transmet tout ou partie de son patrimoine à d’autres sociétés ; <b>ses actionnaires</b> reçoivent des parts de ces sociétés.</td><td>art. 29</td></tr>
<tr><td class="k">Transformation</td><td>La même société prend une autre forme juridique (séance 2).</td><td>art. 53</td></tr>
<tr><td class="k">Transfert de patrimoine</td><td>Une société transmet des actifs et des dettes en un seul acte ; <b>la société elle-même</b> reçoit la contrepartie.</td><td>art. 69</td></tr>
</table>""", 'Le patrimoine = l’ensemble des actifs et des dettes. Insister sur les deux mots en gras : dans la scission ce sont les actionnaires qui reçoivent quelque chose, dans le transfert c’est la société. Toute la matinée repose sur cette différence.')

d.slide('4.1', 'Quatre restructurations, une loi', 'Deux mots à connaître : la société transférante et la société reprenante', """
<div class="two">
<div class="box"><div class="tag">Celle qui donne</div><h3>Société transférante</h3><p>La société qui se scinde. Elle transmet des actifs et des dettes.</p></div>
<div class="box"><div class="tag">Celle qui reçoit</div><h3>Société reprenante</h3><p>La société qui reçoit ces actifs et ces dettes. En échange, elle émet des actions pour les actionnaires de la société transférante.</p></div>
</div>""", 'La société reprenante peut exister déjà, ou être fondée pour la scission. Dans le cas 2, elle est fondée pour la scission.')

d.slide('4.1', 'Deux formes, deux répartitions', 'Première question : la société qui se scinde continue-t-elle d’exister ?', """
<div class="two">
<div class="box"><div class="tag">Art. 29 let. a LFus</div><h3>Division</h3><p>La société répartit <b>tout</b> son patrimoine entre des sociétés reprenantes.</p><p>Elle <b>disparaît</b> : elle est radiée du registre du commerce, sans liquidation.</p></div>
<div class="box"><div class="tag">Art. 29 let. b LFus</div><h3>Séparation</h3><p>La société transmet <b>une partie</b> de son patrimoine.</p><p>Elle <b>continue d’exister</b>, plus petite.</p></div>
</div>""", 'Exemple oral : une société a une usine et des boutiques. Division : deux sociétés nouvelles, l’ancienne disparaît. Séparation : les boutiques partent dans une société nouvelle, l’ancienne garde l’usine. Le cas 2 est une séparation.')

d.slide('4.1', 'Deux formes, deux répartitions', 'Deuxième question : comment les actionnaires se répartissent-ils les nouvelles actions ?', """
<div class="two">
<div class="box"><div class="tag">Art. 31 al. 2 let. a LFus</div><h3>Scission symétrique</h3><p>Chaque actionnaire reçoit des actions de <b>toutes</b> les sociétés reprenantes, dans la proportion qu’il avait avant.</p><p class="small">Un actionnaire à 75 % reste à 75 % partout.</p></div>
<div class="box"><div class="tag">Art. 31 al. 2 let. b LFus</div><h3>Scission asymétrique</h3><p>Les actionnaires <b>se répartissent les sociétés</b> : chacun prend la sienne.</p><p class="small">Elle exige l’accord d’au moins 90 % des voix (art. 43 al. 3 LFus). Elle sert souvent à séparer des associés en conflit.</p></div>
</div>""", 'Dans une scission asymétrique, les parts ne valent pas toujours la même chose : il faut alors rééquilibrer, par exemple avec de l’argent. Le cas 2 le demande.')

d.slide('4.1', 'Deux formes, deux répartitions', 'Seules les sociétés de capitaux et les coopératives peuvent se scinder', """
<ul class="pts">
<li><b>Peuvent se scinder (art. 30 LFus) :</b> la société anonyme (SA), la société en commandite par actions, la société à responsabilité limitée (Sàrl) et la coopérative.</li>
<li><b>Ne peuvent pas se scinder :</b> l’entreprise individuelle et les sociétés de personnes (société en nom collectif, société en commandite).</li>
<li>Pour sortir une activité, celles-ci utilisent le <b>transfert de patrimoine</b> (section 4.2).</li>
</ul>""", 'C’est une question d’examen fréquente : qui peut faire quoi.')

d.slide('4.1', 'La procédure · Du contrat à l’inscription', 'Une scission se fait en six étapes, du contrat à l’inscription au registre du commerce', """
<ol class="steps">
<li><b>Contrat de scission</b> (la société reprenante existe déjà) ou <b>projet de scission</b> (elle est fondée pour l’opération), par écrit (art. 36–37).</li>
<li><b>Rapport de scission</b>, vérifié par un expert-réviseur agréé (art. 39–40).</li>
<li><b>Consultation</b> des documents par les associés pendant deux mois (art. 41).</li>
<li><b>Appel aux créanciers</b>, publié avant la décision (art. 45–46).</li>
<li><b>Décision</b> des assemblées générales, à la majorité qualifiée, par acte authentique (art. 43).</li>
<li><b>Inscription au registre du commerce</b> : la scission existe à partir de ce jour (art. 51).</li>
</ol>""", 'Les petites et moyennes entreprises peuvent renoncer au rapport et à la vérification si tous les associés sont d’accord. Acte authentique = acte dressé par un notaire.')

d.slide('4.1', 'La procédure · Du contrat à l’inscription', 'Le contrat de scission doit contenir cinq éléments à retenir (art. 37 LFus)', """
<ul class="pts">
<li><b>L’inventaire :</b> la liste des actifs et des dettes attribués à chaque société.</li>
<li><b>Le rapport d’échange :</b> combien d’actions nouvelles pour une action ancienne, et la <b>soulte</b> éventuelle (un paiement en argent qui complète l’échange).</li>
<li><b>La date d’effet comptable :</b> le jour à partir duquel les opérations comptent pour la société reprenante.</li>
<li><b>La liste des contrats de travail transférés.</b></li>
<li><b>Les avantages particuliers</b> accordés aux membres des organes.</li>
</ul>""", 'La liste complète de l’art. 37 est sur le site. Le classement en bas de la section 4.1 porte exactement sur cette liste.')

d.slide('4.1', 'La procédure · Du contrat à l’inscription', 'Les créanciers sont protégés avant la décision, et les sociétés répondent des dettes les unes des autres', """
<ul class="pts">
<li><b>Avant la décision :</b> la société publie un appel aux créanciers dans la Feuille officielle suisse du commerce (FOSC). Les créanciers peuvent exiger des sûretés, c’est-à-dire des garanties de paiement (art. 45–46).</li>
<li><b>Dans une fusion, c’est l’inverse :</b> les créanciers sont avertis après.</li>
<li><b>Après la scission :</b> si une société ne paie pas une dette qui lui a été attribuée, les autres sociétés de la scission doivent la payer (responsabilité subsidiaire, art. 47).</li>
</ul>""", 'Pourquoi avant : dans une scission, le patrimoine qui garantit la dette est coupé en deux, le créancier peut se retrouver face à la société la plus faible.')

d.slide('4.1', 'La procédure · le paragraphe sous la liste', 'La société reprenante comptabilise la reprise avec un compte de passage « Scission »', """
<table class="t">
<tr><th>Débit</th><th>Crédit</th><th>Ce que l’écriture enregistre</th></tr>
<tr><td class="k">Actifs repris</td><td class="k">Scission</td><td>Les actifs entrent, à leur valeur comptable.</td></tr>
<tr><td class="k">Scission</td><td class="k">Dettes reprises</td><td>Les dettes entrent.</td></tr>
<tr><td class="k">Scission</td><td class="k">Capital-actions</td><td>La valeur nominale des actions émises.</td></tr>
<tr><td class="k">Scission</td><td class="k">Réserve légale issue du capital</td><td>L’agio de scission (art. 671 CO).</td></tr>
</table>
<p class="small" style="margin-top:.7em">Un compte de passage sert seulement pendant l’opération : après les quatre écritures, son solde est zéro.</p>""",
        'Même mécanique que la fondation avec apport en nature de la séance 1. Chez la société transférante, dans une séparation, les actifs et les dettes sortent et les fonds propres diminuent de l’actif net cédé.')

d.slide('4.1', 'La procédure · le paragraphe sous la liste', 'L’agio de scission est la part de l’actif net repris qui dépasse la valeur nominale des actions émises', """
<div class="formula"><small>Deux calculs</small>Actif net repris = actifs repris − dettes reprises<br>Agio de scission = actif net repris − valeur nominale des actions émises</div>
<table class="t">
<tr><th>Exemple inventé pour cette diapositive, en milliers de CHF</th><th></th></tr>
<tr><td>Actifs repris 900 − dettes reprises 400</td><td class="n">actif net 500</td></tr>
<tr><td>Actions émises, valeur nominale</td><td class="n">300</td></tr>
<tr class="tot"><td>Agio de scission, porté à la réserve légale issue du capital</td><td class="n">200</td></tr>
</table>""", 'Faire le calcul à voix haute. Ce n’est pas le cas 2 : les chiffres du cas 2 sont différents.')

d.slide('4.1', 'Vérifiez · Dans le contrat de scission, ou pas ?', 'À vous : classez les sept éléments en bas de la section 4.1', """
<ol class="steps">
<li>Ouvrez la page de la séance 4, <b>section 4.1</b>, et descendez jusqu’à la carte « Vérifiez ».</li>
<li>Pour chaque élément, cliquez sur <b>« Y figure »</b> ou <b>« N’y figure pas »</b> : l’élément doit-il se trouver dans le contrat de scission ?</li>
<li>La page dit tout de suite si la réponse est juste et cite l’article.</li>
</ol>
<p class="small">La section 4.1 est terminée quand les sept éléments sont classés.</p>""",
        'Laisser faire, puis demander quels éléments ont surpris. Les deux « N’y figure pas » : le plan d’affaires et l’accord écrit des créanciers.', 'todo')

d.raw('part', '<div class="num">Partie 1 · section 4.2 de la page</div><h2>Le transfert de patrimoine</h2><p>Une société transmet un ensemble d’actifs et de dettes en un seul acte, et reçoit elle-même la contrepartie.</p>',
      'Annoncer la section 4.2. Sur le site : « Suite : le transfert de patrimoine » en bas de la section 4.1.')

d.slide('4.2', 'Art. 69 à 77 LFus', 'Dans un transfert de patrimoine, la contrepartie va à la société, pas à ses associés', """
<p class="def"><b>Le transfert de patrimoine :</b> une société ou une entreprise individuelle inscrite au registre du commerce transmet, en un seul acte, un ensemble d’actifs et de dettes listés dans un inventaire (art. 69 LFus).</p>
<ul class="pts">
<li><b>Qui peut le faire :</b> toute société inscrite et toute entreprise individuelle inscrite. Les sociétés de personnes aussi.</li>
<li><b>Qui reçoit la contrepartie :</b> la société qui transfère. Ses associés ne reçoivent aucune action de la société reprenante.</li>
</ul>""", 'La contrepartie est ce que la société reprenante donne en échange : de l’argent, ou des actions. Comparer avec la scission : là, ce sont les actionnaires qui reçoivent les actions.')

d.slide('4.2', 'Art. 69 à 77 LFus', 'Le contrat de transfert repose sur un inventaire qui doit montrer plus d’actifs que de dettes', """
<ul class="pts">
<li><b>Le contrat</b> est écrit et conclu par les organes de direction (art. 70).</li>
<li><b>L’inventaire</b> désigne chaque actif et chaque dette transférés ; les immeubles, les papiers-valeurs et les valeurs immatérielles y figurent un par un (art. 71).</li>
<li><b>L’excédent d’actifs</b> est obligatoire : la valeur des actifs transférés doit dépasser celle des dettes transférées (art. 71 al. 2).</li>
<li>Le contrat indique aussi <b>la contrepartie</b> et <b>la liste des contrats de travail</b> transférés.</li>
</ul>""", 'Excédent d’actifs : une société ne peut pas se débarrasser de dettes seules. Dans le cas 2, vous calculez cet excédent.')

d.slide('4.2', 'Art. 69 à 77 LFus', 'Le transfert produit ses effets le jour de l’inscription au registre du commerce', """
<ul class="pts">
<li><b>Tous les actifs et toutes les dettes de l’inventaire passent en une fois</b> à la société reprenante, sans acte séparé pour chacun (art. 73).</li>
<li><b>Les contrats de travail</b> passent avec eux (art. 76).</li>
<li><b>La société qui transfère reste responsable</b> des dettes transférées pendant trois ans, avec la société reprenante (art. 75).</li>
<li><b>Les associés sont informés</b> dans l’annexe aux comptes annuels (art. 74).</li>
</ul>""", 'Sans la LFus, il faudrait céder chaque créance, transférer chaque véhicule, faire accepter chaque reprise de dette par le créancier. C’est l’intérêt de la loi.')

d.slide('4.2', 'Vérifiez · Scission ou transfert de patrimoine ?', 'La scission et le transfert de patrimoine diffèrent sur trois points', """
<table class="t">
<tr><th></th><th>Scission</th><th>Transfert de patrimoine</th></tr>
<tr><td class="k">Qui reçoit la contrepartie ?</td><td>Les actionnaires de la société qui se scinde.</td><td>La société qui transfère.</td></tr>
<tr><td class="k">Qui peut le faire ?</td><td>Les sociétés de capitaux et les coopératives.</td><td>Toute société ou entreprise individuelle inscrite.</td></tr>
<tr><td class="k">Résultat dans les comptes ?</td><td>Aucun gain : l’actif net sort à sa valeur comptable.</td><td>Un gain ou une perte : la contrepartie est comparée à l’actif net cédé.</td></tr>
</table>""", 'Ce tableau prépare le classement en bas de la section 4.2 et la question finale du cas 2.')

d.slide('4.2', 'Art. 69 à 77 LFus · le paragraphe sous la liste', 'Dans les comptes, le transfert de patrimoine est une vente en bloc', """
<div class="formula"><small>Le calcul</small>Résultat du transfert = contrepartie reçue − (actifs cédés − dettes cédées)</div>
<table class="t">
<tr><th>Exemple inventé pour cette diapositive, en milliers de CHF</th><th></th></tr>
<tr><td>Actifs cédés 700 − dettes cédées 250, à la valeur comptable</td><td class="n">actif net cédé 450</td></tr>
<tr><td>Contrepartie reçue en banque</td><td class="n">520</td></tr>
<tr class="tot"><td>Gain sur transfert de patrimoine</td><td class="n">70</td></tr>
</table>
<p class="small" style="margin-top:.6em">Les écritures passent par un compte de passage « Transfert de patrimoine », soldé par le gain ou la perte.</p>""",
        'Écritures à dire : Banque à Transfert 520 ; Transfert à Actifs 700 ; Dettes à Transfert 250 ; Transfert à Gain sur transfert 70. Pour l’acheteur, les 70 payés en plus de l’actif net sont un goodwill.')

d.slide('4.2', 'Vérifiez · Scission ou transfert de patrimoine ?', 'À vous : classez chaque affirmation en bas de la section 4.2', """
<ol class="steps">
<li>Ouvrez la <b>section 4.2</b> et descendez jusqu’à la carte « Vérifiez ».</li>
<li>Pour chaque affirmation, cliquez sur <b>« Scission »</b>, <b>« Transfert »</b> ou <b>« Les deux »</b>.</li>
<li>La page dit tout de suite si la réponse est juste et cite l’article.</li>
</ol>
<p class="small">La section 4.2 est terminée quand toutes les affirmations sont classées. La pause suit.</p>""",
        'Fin de la partie 1. Pause, puis les cas.', 'todo')

d.raw('part', '<div class="num">Partie 2 · sections 4.3 et 4.4 de la page</div><h2>Deux ateliers avec la classe : une scission, puis un transfert de patrimoine</h2><p>L’enseignant pose les questions. Vous répondez, puis vous entrez la réponse sur la page, qui la vérifie.</p>',
      'Faire ouvrir la section 4.3 dans le menu de la séance. Tout le monde entre les réponses sur sa propre page.')

d.slide('4.3', 'Les données · bilan au 31.12.2027', 'Alpibois Design SA se scinde par division en deux sociétés nouvelles', """
<div class="two">
<div>
<table class="t">
<tr><th>Actif, en milliers de CHF</th><th></th></tr>
<tr><td>Liquidités</td><td class="n">180</td></tr><tr><td>Créances</td><td class="n">240</td></tr><tr><td>Stocks</td><td class="n">300</td></tr><tr><td>Immobilisations corporelles</td><td class="n">560</td></tr><tr><td>Participation</td><td class="n">220</td></tr>
<tr class="tot"><td>Total</td><td class="n">1 500</td></tr></table>
</div><div>
<table class="t">
<tr><th>Passif, en milliers de CHF</th><th></th></tr>
<tr><td>Fournisseurs</td><td class="n">350</td></tr><tr><td>Prêt bancaire</td><td class="n">450</td></tr><tr><td>Capital-actions</td><td class="n">310</td></tr><tr><td>Réserve légale issue du capital</td><td class="n">60</td></tr><tr><td>Réserves facultatives</td><td class="n">330</td></tr>
<tr class="tot"><td>Total</td><td class="n">1 500</td></tr></table>
</div></div>
<p class="small" style="margin-top:.6em">Trois actionnaires : Nadia Berthoud 40 %, Marc Jaquier 35 %, Sofia Pereira 25 %. Deux sociétés nouvelles, Design Mobilier SA et Design Bureaux SA. Alpibois Design SA disparaît.</p>""",
        'Demander : quelle forme de scission ? Division, parce que la société disparaît. Combien valent les fonds propres ? 310 + 60 + 330 = 700.')

d.slide('4.3', 'Les données · l’inventaire du contrat de scission', 'L’inventaire du contrat attribue chaque actif et chaque dette à l’une des deux sociétés', """
<table class="t">
<tr><th>En milliers de CHF</th><th style="text-align:right">Design Mobilier SA</th><th style="text-align:right">Design Bureaux SA</th></tr>
<tr><td>Liquidités</td><td class="n">100</td><td class="n">80</td></tr>
<tr><td>Créances</td><td class="n">150</td><td class="n">90</td></tr>
<tr><td>Stocks</td><td class="n">220</td><td class="n">80</td></tr>
<tr><td>Immobilisations corporelles</td><td class="n">400</td><td class="n">160</td></tr>
<tr><td>Participation</td><td class="n">—</td><td class="n">220</td></tr>
<tr><td>Fournisseurs</td><td class="n">250</td><td class="n">100</td></tr>
<tr><td>Prêt bancaire</td><td class="n">300</td><td class="n">150</td></tr>
</table>
<p class="small" style="margin-top:.6em">Chaque société nouvelle émet 1 550 actions de CHF 100 : un capital-actions de 155, en échange de l’actif net qui lui est attribué.</p>""",
        'Laisser cette diapositive affichée pendant les calculs.')

d.slide('4.3', 'Rôles · Les écritures chez Design Mobilier SA', 'À vous : quatre calculs, puis les écritures de reprise dans chaque société', """
<ol class="steps">
<li><b>L’actif net attribué</b> à Design Mobilier SA, puis à Design Bureaux SA : les actifs attribués moins les dettes attribuées.</li>
<li><b>L’agio de scission</b> de chaque société : l’actif net attribué moins le capital-actions de 155.</li>
<li><b>Le contrôle :</b> les deux actifs nets additionnés doivent donner les fonds propres d’Alpibois Design SA.</li>
<li><b>Les écritures de reprise</b> chez Design Mobilier SA, puis chez Design Bureaux SA, par le compte de passage « Scission ».</li>
</ol>
<p class="small">Entrez chaque montant et chaque écriture dans la section 4.3. La page dessine le bilan d’ouverture quand les écritures sont justes.</p>""",
        'Interroger un étudiant par calcul. Les réponses sont sur la page, pas sur la diapositive.', 'todo')

d.slide('4.3', 'Et si la scission était asymétrique ?', 'Variante : la scission devient asymétrique, et les deux parts n’ont pas la même valeur', """
<ul class="pts">
<li>Nadia Berthoud (40 %) prend toute Design Mobilier SA. Marc Jaquier et Sofia Pereira (60 %) prennent Design Bureaux SA.</li>
<li>Sa part de l’actif net total est de 40 % × 700 = <b>280</b>. La société qu’elle reçoit vaut <b>320</b>.</li>
<li><b>Question 1 :</b> comment rééquilibrer ? Par une soulte (un paiement en argent, limité par l’art. 7 al. 2 LFus), ou en attribuant d’autres actifs à l’autre société ?</li>
<li><b>Question 2 :</b> quelle majorité l’assemblée générale doit-elle réunir (art. 43 al. 3 LFus) ?</li>
</ul>
<p class="small">Écrivez votre réponse dans le champ de la section 4.3, puis faites le calcul « Réattribuer des liquidités » plus bas dans la même section.</p>""",
        'La soulte nécessaire dépasse la limite légale : la page le montre dans la dernière carte de la section.', 'todo')

d.slide('4.4', 'Les données · en milliers de CHF', 'Alpibois SA transfère son parc de véhicules à Léman Fleet SA en un seul acte', """
<table class="t">
<tr><th>L’inventaire du transfert, en milliers de CHF</th><th></th></tr>
<tr><td>Véhicules, à la valeur comptable</td><td class="n">420</td></tr>
<tr><td>Stock de pièces</td><td class="n">30</td></tr>
<tr><td>Dettes de leasing qui financent les véhicules</td><td class="n">180</td></tr>
<tr class="tot"><td>Contrepartie convenue, versée en banque par Léman Fleet SA</td><td class="n">310</td></tr>
</table>
<ol class="steps" style="margin-top:.7em">
<li>Calculez <b>l’excédent d’actifs</b> de l’inventaire : la condition de l’art. 71 al. 2 LFus est-elle remplie ?</li>
<li>Calculez <b>le résultat du transfert</b> pour Alpibois SA : est-ce un gain ou une perte ?</li>
<li>Passez <b>les écritures</b> par le compte de passage « Transfert de patrimoine », dans la section 4.4.</li>
</ol>""", 'Les deux chauffeurs passent chez Léman Fleet avec leur contrat de travail (art. 76 LFus). Question du champ : et si les dettes de leasing étaient de 500 ?', 'todo')

d.slide('4.4', 'Le même transfert dans les livres de Léman Fleet SA', 'L’acheteur inscrit ce qu’il reçoit à la valeur réelle, et la différence avec le prix est un goodwill', """
<ul class="pts">
<li><b>Alpibois SA</b> sort les véhicules à leur valeur comptable : 420.</li>
<li><b>Léman Fleet SA</b> les achète : elle les inscrit à leur valeur réelle. Un expert les estime à <b>440</b>. Le stock de pièces vaut 30 et les dettes de leasing 180.</li>
<li>Léman Fleet SA paie 310. Si ce prix dépasse l’actif net à la valeur réelle, la différence est un <b>goodwill</b> : ce que l’acheteur paie en plus pour la clientèle, l’organisation ou les chauffeurs formés.</li>
</ul>
<p class="small">Calculez l’actif net à la valeur réelle et le goodwill, puis passez les écritures de Léman Fleet SA, plus bas dans la section 4.4.</p>""",
        'Même acte, deux comptabilités : valeur comptable chez le vendeur, valeur réelle chez l’acheteur.', 'todo')

d.slide('4.5', 'Les données · Retour en classe', 'Cas 1 : vous transformez une entreprise individuelle en SA et vous faites entrer un investisseur', """
<div class="go">Ouvrez la section 4.5 · vous travaillez seul·e</div>
<ol class="steps">
<li>Lisez les données en entier : le bilan de l’entreprise, puis les décisions.</li>
<li>Entrez chaque montant et chaque écriture sur la page. Elle dit tout de suite si la réponse est juste.</li>
<li>Écrivez votre réponse aux deux questions de la carte « Retour en classe ».</li>
<li>Si vous êtes bloqué·e plus de cinq minutes, écrivez à l’enseignant dans « Messages », en bas à droite de la page.</li>
</ol>
<p class="small">Ce cas demande seulement les séances 1 et 2.</p>""",
        'Dire l’heure du retour en classe. Rester disponible dans la salle principale.', 'todo')

d.slide('4.6', 'Les données · Retour en classe', 'Cas 2 : vous séparez les boutiques de Cafés Cuendet SA, par une scission puis par un transfert de patrimoine', """
<div class="go">Ouvrez la section 4.6 · vous travaillez à deux ou trois</div>
<ol class="steps">
<li>Sur Zoom, l’enseignant ouvre une salle par groupe. À Lausanne, vous vous asseyez à la même table.</li>
<li>Une personne partage son écran et entre les réponses. Les autres calculent et contrôlent.</li>
<li>Vous comptabilisez la scission dans les deux sociétés, puis vous comparez avec la scission asymétrique et avec le transfert de patrimoine.</li>
<li>Vous écrivez votre recommandation aux deux actionnaires dans la carte « Retour en classe ».</li>
</ol>""", 'Former les groupes. Dire l’heure du retour.', 'todo')

d.slide('4.6', 'Retour en classe · ce que vous montrez', 'Retour en classe : chaque groupe montre son résultat', """
<ol class="steps">
<li><b>Cas 1 :</b> vous partagez votre écran sur le bilan d’ouverture de Cafés Cuendet SA, que la page a dessiné sous vos écritures. Vous dites d’où vient chaque montant du capital propre, puis vous lisez votre réponse aux deux questions.</li>
<li><b>Cas 2 :</b> vous montrez le bilan de Cafés Cuendet SA après la scission et vous dites quels postes ont changé.</li>
<li><b>Cas 2, suite :</b> vous lisez votre recommandation. Chaque groupe défend une seule des trois voies : la scission symétrique, la scission asymétrique ou le transfert de patrimoine.</li>
</ol>
<p class="small">La carte « Retour en classe · ce que vous montrez » se trouve à la fin de chaque cas, sections 4.5 et 4.6.</p>
<p class="small">Cet après-midi à 14h00 : la séance 5, l’assainissement, avec les cas 3 et 4.</p>""",
        'Un groupe par cas si le temps manque. Le bouton « Sur l’écran » affiche les réponses de la classe sans les noms.', 'todo')

io.open(os.path.join(ROOT, 'seance4-slides.html'), 'w', encoding='utf-8').write(d.html(
    'Séance 4 · Diapositives · FL III',
    'Financial Leadership III, séance 4 — les diapositives de l’exposé : la scission et le transfert de patrimoine selon la LFus. Chaque diapositive indique la section de la page de la séance où se trouve le même texte.'))
n4 = len(d.out)

# =====================================================================
#  SÉANCE 5
# =====================================================================
d = Deck(5, [('5.1', '5.1 Diagnostic'), ('5.2', '5.2 Mesures'), ('5.3', '5.3 Atelier'), ('5.4', '5.4 Atelier'), ('5.5', '5.5 Cas 3'), ('5.6', '5.6 Cas 4'), ('5.7', '5.7 Fin')])

d.raw('title', """<div class="eyebrow">Financial Leadership III · séance 5 · samedi 21 novembre 2026 · 14h00–17h30</div>
<h1>L’assainissement d’une société en perte</h1>
<p>Ouvrez la page de la séance 5 dans un onglet. Chaque diapositive indique, dans la bande du haut, la section et la carte de cette page où se trouve le même texte.</p>
<div class="url">janerikmeidell.com/Kalaidos/fl3/seance5.html</div>""",
      'Reprise après la pause de midi. Faire ouvrir la page de la séance 5.')

d.slide(None, None, 'Cet après-midi : j’explique le diagnostic et les mesures, nous faisons deux ateliers ensemble, puis vous résolvez deux cas', """
<table class="t">
<tr><th>Quand</th><th>Qui travaille</th><th>Où sur la page de la séance 5</th></tr>
<tr><td class="k">Partie 1<br>14h00–15h30</td><td>L’enseignant explique comment reconnaître une société en difficulté, puis les mesures qui la redressent.</td><td><b>Sections 5.1 et 5.2</b></td></tr>
<tr><td class="k">Partie 2<br>15h45–17h30</td><td>Deux ateliers sur Alpibois Design et Menuiserie Vallotton, que nous faisons avec toute la classe. Puis deux cas sur Cafés Cuendet, que vous résolvez et que vous montrez à la classe.</td><td><b>Sections 5.3 et 5.4</b> (ateliers)<br><b>Section 5.5</b> (cas 3)<br><b>Section 5.6</b> (cas 4)<br><b>Section 5.7</b> (fin du samedi)</td></tr>
</table>
<p class="small" style="margin-top:.8em">Le quiz (section 5.8) se fait après la séance.</p>""",
        'Lire le tableau.')

d.raw('part', '<div class="num">Partie 1 · section 5.1 de la page</div><h2>Quand le bilan est malade</h2><p>L’assainissement : l’ensemble des mesures qui rétablissent le bilan d’une société en perte, pour qu’elle puisse continuer son activité.</p>',
      'Définir l’assainissement avant tout. Les articles sont ceux du Code des obligations révisé, en vigueur depuis le 1er janvier 2023 : d’anciens manuels citent encore l’ancien art. 725.')

d.slide('5.1', 'Trois signaux d’alarme, trois devoirs du conseil d’administration', 'Le Code des obligations distingue trois situations, de la moins grave à la plus grave', """
<div class="three">
<div class="box"><div class="tag">Art. 725 CO</div><h3>Insolvabilité menaçante</h3><p>La société risque de ne plus pouvoir payer ses dettes à l’échéance.</p></div>
<div class="box"><div class="tag">Art. 725a CO</div><h3>Perte de capital</h3><p>Les pertes ont consommé plus de la moitié du capital et des réserves légales.</p></div>
<div class="box"><div class="tag">Art. 725b CO</div><h3>Surendettement</h3><p>Les dettes dépassent les actifs : les fonds propres sont négatifs.</p></div>
</div>
<p class="small" style="margin-top:.8em">Chaque situation impose un devoir précis au conseil d’administration. Les trois diapositives suivantes les prennent une par une.</p>""",
        'Insolvabilité = problème de trésorerie. Perte de capital et surendettement = problèmes de bilan. Une société peut avoir l’un sans l’autre.')

d.slide('5.1', 'Trois signaux d’alarme · ligne « Insolvabilité menaçante »', 'Art. 725 CO : la société risque de manquer d’argent pour payer ses dettes', """
<ul class="pts">
<li><b>Le test :</b> le plan de trésorerie montre que la société ne pourra pas payer ses dettes quand elles arriveront à échéance.</li>
<li><b>Le devoir du conseil d’administration :</b> surveiller la trésorerie, prendre des mesures pour garantir les paiements et, au besoin, convoquer l’assemblée générale.</li>
</ul>
<p class="small">Le plan de trésorerie est le tableau des encaissements et des paiements prévus pour les prochains mois.</p>""",
        'Ce test ne regarde pas le bilan : une société rentable peut manquer de liquidités.')

d.slide('5.1', 'Trois signaux d’alarme · ligne « Perte de capital » et la formule', 'Art. 725a CO : il y a perte de capital quand les fonds propres tombent sous un seuil', """
<div class="formula"><small>Le test</small>Fonds propres &lt; ½ × (capital-actions + réserve légale issue du capital + réserve légale issue du bénéfice)</div>
<ul class="pts">
<li><b>Les fonds propres</b> sont les actifs moins les dettes.</li>
<li><b>Le devoir du conseil d’administration :</b> prendre des mesures d’assainissement et, si nécessaire, les proposer à l’assemblée générale.</li>
<li>Si la société n’a pas d’organe de révision, ses derniers comptes doivent être contrôlés par un réviseur (révision restreinte).</li>
</ul>""", 'Faire répéter la formule : c’est celle du cas 3 et de l’examen. La moitié de la somme des trois postes.')

d.slide('5.1', 'Trois signaux d’alarme · la formule', 'Exemple : des fonds propres de 180 sont inférieurs au seuil de 250, donc il y a perte de capital', """
<table class="t">
<tr><th>Exemple inventé pour cette diapositive, en milliers de CHF</th><th></th></tr>
<tr><td>Capital-actions</td><td class="n">400</td></tr>
<tr><td>Réserve légale issue du capital</td><td class="n">60</td></tr>
<tr><td>Réserve légale issue du bénéfice</td><td class="n">40</td></tr>
<tr class="tot"><td>Seuil = ½ × (400 + 60 + 40)</td><td class="n">250</td></tr>
<tr><td>Fonds propres au bilan = actifs 1 000 − dettes 820</td><td class="n">180</td></tr>
<tr class="tot"><td>180 est inférieur à 250</td><td class="n">perte de capital</td></tr>
</table>""", 'Calculer à voix haute. Les fonds propres sont encore positifs : il n’y a pas de surendettement. Ce ne sont pas les chiffres du cas 3.')

d.slide('5.1', 'Trois signaux d’alarme · ligne « Surendettement »', 'Art. 725b CO : il y a surendettement quand les actifs ne couvrent plus les dettes', """
<ul class="pts">
<li><b>Le test :</b> le conseil d’administration établit deux bilans intermédiaires, l’un aux valeurs d’exploitation, l’autre aux valeurs de liquidation, et les fait vérifier. Il y a surendettement si les dettes dépassent les actifs dans les deux.</li>
<li><b>Le devoir :</b> aviser le tribunal.</li>
<li><b>Deux exceptions :</b> des créanciers acceptent de passer après tous les autres pour un montant égal au découvert (postposition), ou il existe une chance concrète d’assainir la société dans les 90 jours.</li>
</ul>""", 'Valeurs d’exploitation : la société continue. Valeurs de liquidation : tout est vendu rapidement. Le découvert est le montant dont les dettes dépassent les actifs.')

d.slide('5.1', 'Trois signaux d’alarme · le paragraphe « Réévaluation (art. 725c CO) »', 'Art. 725c CO : la société peut réévaluer ses immeubles et ses participations pour supprimer une perte de capital', """
<ul class="pts">
<li><b>Ce qui peut être réévalué :</b> les immeubles et les participations, au-dessus de leur coût d’acquisition et au maximum jusqu’à leur valeur réelle.</li>
<li><b>Où va le montant :</b> dans la <b>réserve de réévaluation</b>, inscrite séparément dans la réserve légale issue du bénéfice. Il ne passe pas par le compte Assainissement.</li>
<li><b>Condition :</b> un réviseur agréé confirme par écrit que les conditions sont remplies.</li>
<li>La réserve de réévaluation fait partie de la réserve légale issue du bénéfice : elle <b>augmente aussi le seuil</b> de l’art. 725a.</li>
</ul>""", 'Piège du cas 3 : la réévaluation augmente les fonds propres, mais aussi le seuil. Aucun argent n’entre.')

d.slide('5.1', 'La boîte à outils de l’assainissement · Qui fait l’effort ?', 'Trois groupes peuvent faire un effort pour assainir la société', """
<div class="three">
<div class="box"><div class="tag">Les actionnaires</div><p><b>Réduction du capital-actions</b> : la valeur nominale baisse.</p><p><b>Augmentation de capital</b> avec de l’argent frais.</p><p><b>Versement à fonds perdu</b> : un don à la société.</p></div>
<div class="box"><div class="tag">Les créanciers</div><p><b>Abandon de créance</b> : ils renoncent à une partie de ce qui leur est dû.</p><p><b>Conversion</b> de la dette en actions.</p><p><b>Postposition</b> : ils acceptent d’être payés après les autres.</p></div>
<div class="box"><div class="tag">La société</div><p><b>Compensation</b> des pertes avec les réserves.</p><p><b>Réévaluation</b> selon l’art. 725c.</p><p><b>Mesures d’exploitation</b> : vendre ce qui ne sert pas, réduire les coûts.</p></div>
</div>""", 'Réduction puis augmentation en même temps : l’opération s’appelle « coup d’accordéon » (art. 653q CO). La réduction en cas de bilan déficitaire : art. 653p CO.')

d.slide('5.1', 'La boîte à outils · le paragraphe sous la liste', 'Le compte « Assainissement » rassemble les efforts d’un côté et les pertes à éliminer de l’autre', """
<div class="two">
<div class="box"><div class="tag">Au débit du compte Assainissement</div><p>Les <b>corrections de valeur</b> des actifs surévalués.</p><p>L’élimination de la <b>perte reportée</b>.</p></div>
<div class="box"><div class="tag">Au crédit du compte Assainissement</div><p>La <b>réduction du capital-actions</b>.</p><p>L’<b>abandon de créance</b>.</p><p>Le <b>gain</b> sur la vente d’un actif.</p></div>
</div>
<p style="margin-top:.7em"><b>La règle :</b> tout ce qui diminue le passif sans sortie d’argent va au crédit. De l’argent frais apporté par les actionnaires n’y passe pas : il va au capital-actions et aux réserves.</p>""",
        'Si le crédit dépasse le débit, le reste sert à des amortissements supplémentaires. Le compte est soldé à la fin.')

d.slide('5.1', 'Vérifiez · Quel article ?', 'À vous : classez chaque situation en bas de la section 5.1', """
<ol class="steps">
<li>Ouvrez la page de la séance 5, <b>section 5.1</b>, et descendez jusqu’à la carte « Vérifiez ».</li>
<li>Pour chaque situation, cliquez sur l’article qui s’applique : <b>725</b>, <b>725a</b>, <b>725b</b> ou <b>725c</b>.</li>
<li>La page dit tout de suite si la réponse est juste.</li>
</ol>
<p class="small">La section 5.1 est terminée quand toutes les situations sont classées.</p>""", 'Laisser faire, puis reprendre les situations qui ont posé problème.', 'todo')

d.raw('part', '<div class="num">Partie 1 · section 5.2 de la page</div><h2>Trois mesures de plus : l’agio, la conversion de dettes, la postposition</h2><p>Pour chacune : ce qu’elle est, l’écriture, et ce qu’elle change au bilan.</p>',
      'Annoncer la section 5.2. Sur le site : « Suite : agio, conversion de dettes, postposition » en bas de la section 5.1.')

d.slide('5.2', 'L’augmentation de capital avec agio', 'L’agio est ce que les actionnaires paient en plus de la valeur nominale des actions nouvelles', """
<div class="formula"><small>Deux calculs</small>Produit de l’émission = valeur nominale × prix d’émission en %<br>Agio = produit de l’émission − valeur nominale</div>
<table class="t">
<tr><th>Exemple : actions nouvelles de CHF 500 000 de valeur nominale, émises à 120 %</th><th></th></tr>
<tr><td>La société reçoit 500 000 × 120 %</td><td class="n">CHF 600 000</td></tr>
<tr><td>Capital-actions</td><td class="n">+ CHF 500 000</td></tr>
<tr class="tot"><td>Agio, porté à la réserve légale issue du capital (art. 671 CO)</td><td class="n">+ CHF 100 000</td></tr>
</table>
<p class="small" style="margin-top:.5em">L’agio ne passe pas par le compte Assainissement.</p>""",
        'Même règle qu’à la séance 1. Écritures : Liquidités à Capital-actions 500 000 ; Liquidités à Réserve légale issue du capital 100 000.')

d.slide('5.2', 'La conversion de dettes en capital', 'Dans une conversion de dettes en capital, un créancier devient actionnaire sans verser d’argent', """
<p class="def"><b>La conversion :</b> le créancier souscrit des actions nouvelles et les paie avec sa créance. Le Code des obligations appelle ce paiement la libération par compensation (art. 634a CO).</p>
<table class="t">
<tr><th>Débit</th><th>Crédit</th><th>Montant</th></tr>
<tr><td class="k">Dette bancaire</td><td class="k">Capital-actions</td><td>La valeur nominale des actions émises.</td></tr>
<tr><td class="k">Dette bancaire</td><td class="k">Réserve légale issue du capital</td><td>L’agio, si les actions sont émises au-dessus de la valeur nominale.</td></tr>
</table>
<p class="small" style="margin-top:.6em">La dette disparaît, le capital augmente, aucun argent ne circule.</p>""",
        'Différence avec l’abandon de créance : le créancier ne perd pas tout, il reçoit des actions et devient copropriétaire.')

d.slide('5.2', 'La postposition', 'La postposition évite d’aviser le tribunal, mais elle n’assainit pas la société', """
<p class="def"><b>La postposition :</b> un créancier déclare que sa créance sera payée après toutes les autres en cas de faillite (art. 725b al. 4 ch. 1 CO).</p>
<ul class="pts">
<li><b>Ce qu’elle change :</b> si les créances postposées couvrent le découvert, le conseil d’administration n’a pas à aviser le tribunal.</li>
<li><b>Ce qu’elle ne change pas :</b> la dette reste au bilan et la perte aussi. Aucune écriture n’est passée.</li>
<li>Elle donne du temps pour préparer les vraies mesures.</li>
</ul>""", 'Question à poser : après une postposition, y a-t-il encore surendettement ? Oui. Y a-t-il encore perte de capital ? Oui.')

d.slide('5.2', 'Vérifiez · Où va chaque montant ?', 'Chaque mesure a sa destination dans les comptes', """
<table class="t">
<tr><th>Mesure</th><th>Où va le montant</th></tr>
<tr><td class="k">Réduction du capital-actions</td><td>Au crédit du compte Assainissement.</td></tr>
<tr><td class="k">Abandon de créance</td><td>Au crédit du compte Assainissement.</td></tr>
<tr><td class="k">Valeur nominale des actions nouvelles</td><td>Au capital-actions.</td></tr>
<tr><td class="k">Agio des actions nouvelles</td><td>À la réserve légale issue du capital.</td></tr>
<tr><td class="k">Réévaluation selon l’art. 725c</td><td>À la réserve de réévaluation.</td></tr>
<tr><td class="k">Postposition</td><td>Nulle part : aucune écriture.</td></tr>
</table>""", 'Ce tableau est la règle. Le classement de la section 5.2 l’applique à des montants concrets.')

d.slide('5.2', 'Vérifiez · Où va chaque montant ?', 'À vous : classez chaque montant en bas de la section 5.2', """
<ol class="steps">
<li>Ouvrez la <b>section 5.2</b> et descendez jusqu’à la carte « Vérifiez ».</li>
<li>Pour chaque montant, cliquez sur sa destination : <b>compte Assainissement</b>, <b>réserve légale issue du capital</b>, <b>capital-actions</b> ou <b>nulle part</b>.</li>
<li>La page dit tout de suite si la réponse est juste.</li>
</ol>
<p class="small">La section 5.2 est terminée quand tous les montants sont classés. La pause suit.</p>""", 'Fin de la partie 1. Pause, puis les deux ateliers.', 'todo')

d.raw('part', '<div class="num">Partie 2 · sections 5.3 et 5.4 de la page</div><h2>Deux ateliers avec la classe : assainir Alpibois Design SA, puis Menuiserie Vallotton SA</h2><p>L’enseignant pose les questions. Vous répondez, puis vous entrez la réponse sur la page, qui la vérifie.</p>',
      'Faire ouvrir la section 5.3 dans le menu de la séance. Tout le monde entre les réponses sur sa propre page.')

d.slide('5.3', 'Les données · bilan au 31.12.2026', 'Alpibois Design SA a perdu 300 en trois exercices : faut-il assainir ?', """
<div class="two">
<div>
<table class="t">
<tr><th>Actif, en milliers de CHF</th><th></th></tr>
<tr><td>Liquidités</td><td class="n">60</td></tr><tr><td>Créances</td><td class="n">240</td></tr><tr><td>Stocks</td><td class="n">380</td></tr><tr><td>Immobilisations corporelles</td><td class="n">520</td></tr><tr><td>Participation</td><td class="n">120</td></tr>
<tr class="tot"><td>Total</td><td class="n">1 320</td></tr></table>
<p class="small" style="margin-top:.6em">Un inventaire montre que les stocks valent 90 de moins et que 40 de créances ne seront jamais payées. La participation vaut en réalité 220.</p>
</div><div>
<table class="t">
<tr><th>Passif, en milliers de CHF</th><th></th></tr>
<tr><td>Fournisseurs</td><td class="n">400</td></tr><tr><td>Prêt bancaire</td><td class="n">600</td></tr><tr><td>Prêt d’actionnaire</td><td class="n">150</td></tr><tr><td>Capital-actions (400 actions de 1 000)</td><td class="n">400</td></tr><tr><td>Réserve légale issue du capital</td><td class="n">40</td></tr><tr><td>Réserve légale issue du bénéfice</td><td class="n">30</td></tr><tr><td>Pertes reportées</td><td class="n">−300</td></tr>
<tr class="tot"><td>Total</td><td class="n">1 320</td></tr></table>
</div></div>""",
        'Carte « Les données » en haut de la section 5.3.')

d.slide('5.3', 'Étape 1 · le diagnostic', 'À vous : trois calculs disent s’il y a perte de capital ou surendettement', """
<ol class="steps">
<li><b>Les fonds propres</b> au bilan : capital-actions + réserves légales − pertes reportées.</li>
<li><b>Le seuil de l’art. 725a CO</b> : la moitié du capital-actions et des réserves légales. Les fonds propres sont-ils en dessous ? Alors il y a perte de capital.</li>
<li><b>Les fonds propres après les corrections de valeur</b> (stocks −90, créances −40). Sont-ils encore positifs ? Sinon, il y a surendettement.</li>
</ol>
<p class="small">Entrez les trois montants dans la carte « Étape 1 » de la section 5.3.</p>""",
        'Réponses : 170 ; seuil 235, donc perte de capital ; 40, donc pas de surendettement.', 'todo')

d.slide('5.3', 'Étape 2 · la négociation', 'Le conseil d’administration et la banque doivent se mettre d’accord sur qui fait quel effort', """
<div class="two">
<div><h3>Le conseil d’administration</h3>
<p>Il représente les actionnaires. Il veut réduire le capital le moins possible, parce que la réduction détruit leur mise. Il veut que la banque renonce à une partie de son prêt. Les actionnaires peuvent apporter au plus 200 d’argent frais.</p></div>
<div><h3>La banque</h3>
<p>Elle a prêté 600. Elle renonce au plus à 25 % de son prêt. Elle exige que les actionnaires réduisent le capital d’au moins 50 % et apportent de l’argent frais. Elle veut que toute la perte reportée disparaisse.</p></div>
</div>
<p class="small" style="margin-top:.6em">Une moitié de la salle joue le conseil, l’autre la banque. Réglez les curseurs du simulateur de la carte « Étape 2 » jusqu’à un accord, puis écrivez-le dans le champ de la même carte.</p>""",
        'Partager le simulateur à l’écran. Demander à chaque camp quel argument a fait céder l’autre.', 'todo')

d.slide('5.3', 'Étape 3 · le paquet adopté par l’assemblée générale', 'À vous : comptabilisez les mesures votées par le compte Assainissement', """
<ul class="pts">
<li>Le capital-actions est réduit de 60 % : la valeur nominale passe de 1 000 à 400 par action.</li>
<li>En même temps, 375 actions nouvelles de 400 sont émises au pair et payées en espèces.</li>
<li>Les deux réserves légales sont compensées avec la perte reportée.</li>
<li>La banque renonce à 20 % de son prêt.</li>
<li>Les corrections de valeur sont comptabilisées : stocks −90, créances −40.</li>
<li>La participation est réévaluée à sa valeur réelle (art. 725c CO).</li>
<li>Le solde du compte Assainissement élimine la perte reportée qui reste.</li>
</ul>
<p class="small">Passez les écritures dans la carte « Étape 3 ». La page dessine les comptes en T et le bilan après l’assainissement.</p>""",
        'Contrôle : total du bilan après 1 440, fonds propres 410, plus de perte de capital.', 'todo')

d.slide('5.3', 'Étape 4 · deux variantes', 'Si une partie refuse sa part de l’effort, les autres mesures doivent changer', """
<ul class="pts">
<li><b>Variante A :</b> la banque refuse tout abandon de créance. De combien faut-il alors réduire le capital-actions pour que la perte reportée disparaisse entièrement ?</li>
<li><b>Variante B :</b> l’actionnaire qui a prêté 150 ne verse pas d’argent frais. Il paie les 375 actions nouvelles en renonçant à son prêt (libération par compensation, art. 634a CO). Que deviennent le total du bilan et les fonds propres ?</li>
</ul>
<p class="small">Entrez les montants dans la carte « Étape 4 » de la section 5.3.</p>""",
        'Réponses : A, réduction de 90 %, valeur nominale 100. B, total 1 140, fonds propres toujours 410, mais 150 de liquidités en moins.', 'todo')

d.slide('5.4', 'Les données · bilan au 31.12.2026', 'Menuiserie Vallotton SA : le bilan avant, les mesures votées, puis le bilan après', """
<div class="two">
<div>
<table class="t">
<tr><th>Actif, en milliers de CHF</th><th></th></tr>
<tr><td>Capitaux circulants</td><td class="n">870</td></tr><tr><td>Immobilisations corporelles</td><td class="n">1 300</td></tr><tr><td>Participation</td><td class="n">400</td></tr><tr><td>Perte au bilan</td><td class="n">480</td></tr>
<tr class="tot"><td>Total</td><td class="n">3 050</td></tr></table>
</div><div>
<table class="t">
<tr><th>Passif, en milliers de CHF</th><th></th></tr>
<tr><td>Dettes bancaires</td><td class="n">1 200</td></tr><tr><td>Dettes fournisseurs</td><td class="n">600</td></tr><tr><td>Emprunt</td><td class="n">300</td></tr><tr><td>Provisions</td><td class="n">200</td></tr><tr><td>Capital-actions</td><td class="n">600</td></tr><tr><td>Réserve de réévaluation (sur la participation)</td><td class="n">150</td></tr>
<tr class="tot"><td>Total</td><td class="n">3 050</td></tr></table>
</div></div>
<p class="small" style="margin-top:.6em">La perte au bilan est présentée à l’actif, comme dans le manuel. Étape 1 : calculez les fonds propres et le seuil de l’art. 725a CO.</p>""",
        'Réponses de l’étape 1 : fonds propres 270, seuil 300 (sans la réserve de réévaluation), donc perte de capital, pas de surendettement.', 'todo')

d.slide('5.4', 'Étape 2 · les écritures des mesures', 'À vous : sept écritures pour les quatre mesures votées par l’assemblée générale', """
<ol class="steps">
<li>Un tiers des dettes fournisseurs devient un emprunt à cinq ans.</li>
<li>Le capital-actions est réduit de 80 % pour éliminer la perte au bilan.</li>
<li>Le capital-actions augmente de 500 de nominal, au prix d’émission de 120 % : la banque souscrit 300 et paie en renonçant à sa créance ; les actionnaires souscrivent 200 et paient en espèces.</li>
<li>La réserve de réévaluation est dissoute par un amortissement supplémentaire sur la participation.</li>
</ol>
<p class="small">Tenez en même temps la colonne « Mesures » sur papier : le total du débit et celui du crédit doivent être égaux, 1 430. Passez les écritures dans la carte « Étape 2 » de la section 5.4.</p>""",
        'Demander chaque écriture à la classe. Le piège : l’agio va à la réserve légale issue du capital, jamais au compte Assainissement.', 'todo')

d.slide('5.4', 'Étape 3 · le bilan après assainissement', 'À vous : le bilan après, ligne par ligne, comme à l’examen', """
<ul class="pts">
<li>À l’examen, chaque ligne juste du bilan après vaut un point. La colonne des mesures sert seulement à trouver les montants.</li>
<li>Entrez les onze montants de la carte « Étape 3 » : chaque poste du bilan après, le total, puis le seuil de l’art. 725a CO.</li>
<li>Question : la perte de capital est-elle supprimée ?</li>
</ul>""",
        'Contrôle : total 2 660, capital-actions 620, réserve légale issue du capital 100, seuil 360, fonds propres 720 : plus de perte de capital.', 'todo')

d.slide('5.4', 'Étape 4 · le test du surendettement', 'Avant les mesures, Vallotton était-elle surendettée au sens de l’art. 725b CO ?', """
<ul class="pts">
<li>Le conseil d’administration fait établir deux bilans intermédiaires : aux <b>valeurs d’exploitation</b> (la société continue son activité) et aux <b>valeurs de liquidation</b> (ce qu’elle obtiendrait en vendant tout rapidement).</li>
<li>Aux valeurs de liquidation, un expert estime : capitaux circulants 700, immobilisations corporelles 900, participation 250. Les dettes et les provisions restent les mêmes.</li>
<li>Il y a surendettement seulement si les dettes ne sont couvertes <b>ni</b> aux valeurs d’exploitation <b>ni</b> aux valeurs de liquidation.</li>
<li>Après les mesures, quelle part du capital-actions la banque détient-elle ?</li>
</ul>""",
        'Réponses : actifs de liquidation 1 850, découvert 450 ; aux valeurs d’exploitation excédent 270, donc pas de surendettement. La banque détient 48,39 % du capital.', 'todo')

d.slide('5.5', 'Les données · Retour en classe', 'Cas 3 : vous diagnostiquez et vous assainissez Boutiques Cuendet SA, qui est surendettée', """
<div class="go">Ouvrez la section 5.5 · vous travaillez à deux ou trois</div>
<ol class="steps">
<li>Lisez le bilan, puis la liste des mesures décidées.</li>
<li>Faites le diagnostic : perte de capital, surendettement, effet d’une réévaluation.</li>
<li>Passez les douze écritures. La page dessine le bilan après l’assainissement.</li>
<li>Écrivez votre conclusion dans la carte « Retour en classe ».</li>
</ol>
<p class="small">Si vous êtes bloqué·e plus de cinq minutes, écrivez à l’enseignant dans « Messages », en bas à droite de la page.</p>""",
        'Former les groupes, dire l’heure du retour.', 'todo')

d.slide('5.6', 'Les données · Retour en classe', 'Cas 4 : vous contrôlez douze points d’un dossier et vous corrigez ceux qui sont faux', """
<div class="go">Ouvrez la section 5.6 · vous travaillez seul·e ou à deux</div>
<ol class="steps">
<li>Pour chacun des douze points, cliquez sur <b>« Juste »</b> ou <b>« Faux »</b>.</li>
<li>Calculez les sept montants corrigés et entrez-les sur la page.</li>
<li>Écrivez quelles sont, selon vous, les deux erreurs les plus graves du dossier, et pourquoi.</li>
</ol>
<p class="small">Ce cas reprend la création, la transformation, la scission, le transfert de patrimoine et l’assainissement.</p>""",
        'Ce cas ressemble à une relecture avant l’examen.', 'todo')

d.slide('5.7', 'Fin du samedi', 'Retour en classe, puis la fin du samedi dans la section 5.7', """
<ol class="steps">
<li><b>Cas 3 :</b> vous partagez votre écran sur le compte Assainissement et vous expliquez chaque ligne. Vous montrez ensuite le bilan après l’assainissement et vous dites qui a fait quel effort.</li>
<li><b>Cas 4 :</b> l’enseignant appelle les douze points un par un. La personne désignée dit « juste » ou « faux », cite la règle et donne le montant corrigé.</li>
<li><b>Section 5.7 :</b> vous écrivez ce qui reste flou. L’enseignant lit ce champ avant mardi.</li>
</ol>
<p class="small">Travail de groupe pour l’exercice d’étude autonome (EEA) : les sections 3 et 4 sont faisables dès ce soir.</p>
<p class="small">Prochaine séance : mardi 24 novembre 2026, 17h30, sur Zoom, la liquidation.</p>""",
        'Remercier. Rappeler que la date de rattrapage de la fusion sera annoncée sur la page du cours.', 'todo')

io.open(os.path.join(ROOT, 'seance5-slides.html'), 'w', encoding='utf-8').write(d.html(
    'Séance 5 · Diapositives · FL III',
    'Financial Leadership III, séance 5 — les diapositives de l’exposé : perte de capital, surendettement et mesures d’assainissement. Chaque diapositive indique la section de la page de la séance où se trouve le même texte.'))
print('seance4-slides.html', n4, 'slides · seance5-slides.html', len(d.out), 'slides')
