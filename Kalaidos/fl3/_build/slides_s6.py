#!/usr/bin/env python3
"""FL III — the deck of séance 6 (Tue 24 Nov 2026, 17h30–21h00, Zoom), generated.

Same light design as séances 4–5 (deck.py): very large type, few lines per
slide, and on every content slide a band naming the section and the card of
the séance page holding the same text. The taught section (6.1) is covered in
full; each atelier gets its data, the operations, the entry PATTERNS without
amounts, and an "à vous" slide. The answers are in the speaker notes (S) and
in the transcript, never on a student slide.

Run:  python3 _build/slides_s6.py && python3 _build/slides_pdf.py seance6
Edit the slides HERE, never in the generated seance6-slides.html.
"""
import io, os
from deck import Deck

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

d = Deck(6, [('6.1', '6.1 Déroulement'), ('6.2', '6.2 Alpibois Export'), ('6.3', '6.3 Corboz'), ('6.4', '6.4 Clôture'), ('6.5', '6.5 Duboux'), ('6.6', '6.6 Quiz'), ('6.7', '6.7 Fin')], gen='slides_s6.py')

# ---------------------------------------------------------------- opening
d.raw('title', """<div class="eyebrow">Financial Leadership III · séance 6 · mardi 24 novembre 2026 · 17h30–21h00 · Zoom</div>
<h1>La fin d’une société : la liquidation</h1>
<p>Ouvrez la page de la séance 6 dans un onglet. Chaque diapositive indique, dans la bande du haut, la section et la carte de cette page où se trouve le même texte.</p>
<div class="url">janerikmeidell.com/Kalaidos/fl3/seance6.html</div>""",
      'Accueil. Demander à chacun d’ouvrir la page de la séance 6 et de se connecter. Caméra et micro. Montrer la bande du haut sur la diapositive suivante.')

d.slide(None, None, 'Ce soir : j’explique le déroulement légal, puis nous liquidons trois sociétés ensemble', """
<table class="t">
<tr><th>Partie 1</th><th></th></tr>
<tr><td class="k">6.1</td><td>Le déroulement d’une liquidation : six étapes, deux délais, le compte Liquidation, l’impôt anticipé</td></tr>
<tr><td class="k">6.2</td><td>Alpibois Export Sàrl : le cas simple, avec un seul compte Liquidation</td></tr>
<tr><td class="k">6.3</td><td>Ébénisterie Corboz SA : dix-huit écritures de liquidation</td></tr>
<tr><th>Partie 2, après la pause</th><th></th></tr>
<tr><td class="k">6.4</td><td>Corboz SA : le résultat de la liquidation, le bilan de clôture, la répartition</td></tr>
<tr><td class="k">6.5</td><td>Scierie Duboux SA, si le temps le permet : une liquidation qui dépasse le nominal</td></tr>
<tr><td class="k">6.6 · 6.7</td><td>Le quiz, puis ce qui reste flou</td></tr>
</table>
<p class="small" style="margin-top:.6em">Les ateliers se font avec toute la classe : l’enseignant pose les questions, vous répondez, puis chacun entre la réponse sur sa page, qui la vérifie.</p>""",
        'Lire le tableau. Dire que 6.5 ne sera fait que si le temps le permet, et que la page reste ouverte après la séance.')

# ---------------------------------------------------------------- 6.1
d.raw('part', '<div class="num">Partie 1 · section 6.1 de la page</div><h2>Le déroulement d’une liquidation</h2><p>Liquider une société : vendre ce qu’elle possède, payer ce qu’elle doit, rendre le reste aux associés, puis la faire disparaître du registre du commerce.</p>',
      'Définir la liquidation avant tout. Elle vient après un assainissement qui a échoué (séance 5), ou simplement parce que les associés arrêtent.')

d.slide('6.1', 'Six étapes, deux délais', 'Une liquidation va de la dissolution à la radiation, en six étapes', """
<ol class="steps">
<li><b>Dissolution</b> (art. 736 CO) : l’assemblée générale décide, en la forme authentique.</li>
<li><b>Liquidateurs</b> (art. 740 CO) : le conseil d’administration, sauf si les statuts ou l’assemblée en désignent d’autres.</li>
<li><b>Bilan d’entrée en liquidation</b> et <b>appel aux créanciers</b> (art. 742 CO).</li>
<li><b>Réalisation</b> : encaisser, vendre, dissoudre les provisions, payer les dettes et les frais (art. 743 CO).</li>
<li><b>Répartition</b> aux associés (art. 745 CO), après un an, ou trois mois avec une attestation.</li>
<li><b>Radiation</b> du registre du commerce (art. 746 CO).</li>
</ol>""",
        'Lire les six étapes dans l’ordre. Les deux délais viennent à l’étape 5 ; ils ont leur propre diapositive.')

d.slide('6.1', 'Six étapes, deux délais · étapes 1 et 2', 'La dissolution ne fait pas disparaître la société : elle entre « en liquidation »', """
<p class="def"><b>La dissolution :</b> la décision qui met fin à l’activité normale de la société. Elle peut venir de l’assemblée générale (en la forme authentique), d’une clause des statuts, d’une faillite ou d’un jugement (art. 736 CO).</p>
<ul class="pts">
<li>La société <b>garde sa personnalité juridique</b> pendant la liquidation ; sa raison sociale prend l’adjonction « en liquidation » (art. 739 CO).</li>
<li>Les <b>liquidateurs</b> remplacent le conseil d’administration pour la gestion : ils terminent les affaires courantes, réalisent l’actif, paient les dettes et représentent la société (art. 743 CO). Ils sont inscrits au registre du commerce.</li>
<li>L’assemblée générale garde ses compétences : elle approuve les comptes de liquidation et donne décharge aux liquidateurs (art. 739 al. 2 CO).</li>
</ul>""",
        'Insister : « en liquidation » n’est pas « disparue ». La société signe encore des contrats, par ses liquidateurs, pour terminer ce qui est en cours.')

d.slide('6.1', 'Six étapes, deux délais · étapes 3 et 5', 'L’appel aux créanciers est publié une fois dans la FOSC, et il ouvre les deux délais de l’art. 745 CO', """
<div class="formula"><small>Répartition aux associés, au plus tôt</small>un an après la publication de l’appel aux créanciers (art. 745 al. 2 CO)<br>ou trois mois, si un expert-réviseur agréé atteste que les dettes sont éteintes (art. 745 al. 3 CO)</div>
<ul class="pts">
<li>L’appel est publié <b>une seule fois</b> dans la Feuille officielle suisse du commerce (FOSC) depuis la révision du CO de 2023 ; avant, trois fois. Les créanciers connus sont avisés par écrit (art. 742 al. 2 CO).</li>
<li>Un montant dû à un créancier inconnu, ou contesté, n’est pas réparti : il est <b>consigné</b>, déposé auprès de la caisse des consignations (art. 744 CO).</li>
</ul>""",
        'Faire répéter les deux délais : un an, ou trois mois avec attestation. C’est une question de quiz et d’examen. La consignation revient dans le cas Duboux.')

d.slide('6.1', 'Six étapes, deux délais · étape 4', 'La réalisation : chaque opération laisse une perte, un bénéfice, ou rien du tout', """
<table class="t">
<tr><th>Opération de liquidation</th><th>Effet dans les comptes</th></tr>
<tr><td class="k">Les débiteurs paient moins que le bilan</td><td>Une <b>perte</b> de liquidation.</td></tr>
<tr><td class="k">Un actif se vend plus cher que sa valeur comptable</td><td>Un <b>bénéfice</b> de liquidation.</td></tr>
<tr><td class="k">Une provision n’a plus d’objet</td><td>Dissoute : un <b>bénéfice</b> de liquidation.</td></tr>
<tr><td class="k">Les frais de liquidation sont payés</td><td>Une <b>charge</b> (liquidateur, notaire, publications).</td></tr>
<tr><td class="k">Une dette est payée à sa valeur</td><td><b>Rien</b> : l’actif et le passif baissent ensemble.</td></tr>
<tr><td class="k">Un créancier reprend un actif en paiement</td><td>La dette s’éteint contre l’actif ; la différence est une perte ou un bénéfice.</td></tr>
</table>""",
        'Ce tableau est la règle des trois ateliers. La dernière ligne est la reprise par un créancier : elle revient chez Corboz (véhicule, machines) et chez Duboux (hypothèque).')

d.slide('6.1', 'Dans les livres', 'Chaque actif réalisé sort à sa valeur comptable ; la différence avec le prix obtenu est une perte ou un bénéfice de liquidation', """
<div class="two">
<div class="box"><div class="tag">Le cas simple</div><h3>Un seul compte « Liquidation »</h3><p>Les pertes vont au débit, les bénéfices et les frais s’y rencontrent. À la fin, le solde est viré aux réserves ou au capital. C’est la méthode d’Alpibois Export Sàrl (section 6.2).</p></div>
<div class="box"><div class="tag">La SA, comme à l’examen</div><h3>Deux comptes de résultat, plus les frais</h3><p>« Perte de liquidation », « Bénéfice de liquidation » et « Frais de liquidation » sont soldés dans un <b>compte de résultat de la période de liquidation</b>. C’est la méthode de Corboz SA (6.3 et 6.4) et de Duboux SA (6.5).</p></div>
</div>
<p class="small" style="margin-top:.7em">Le <b>bilan de clôture</b> ne contient plus que les liquidités, face au capital, aux réserves, aux pertes reportées et au résultat de la liquidation : c’est le montant à répartir.</p>""",
        'Les deux méthodes donnent le même montant à répartir. Le manuel utilise les deux ; l’examen demande plutôt la seconde.')

d.slide('6.1', 'Le paragraphe « La Sàrl » et « Fiscalité »', 'L’excédent de liquidation est imposé comme un dividende', """
<div class="formula"><small>Deux calculs</small>Excédent = montant réparti − capital nominal − réserves issues d’apports de capital<br>Impôt anticipé = 35 % de l’excédent</div>
<ul class="pts">
<li>La société <b>retient</b> l’impôt anticipé et le paie à l’AFC ; l’associé domicilié en Suisse le récupère en déclarant l’excédent.</li>
<li>Les <b>réserves issues d’apports de capital</b> (un agio) sont la mise des associés : les récupérer n’est pas un revenu.</li>
<li>Répartition <b>en dessous</b> du nominal : pas d’excédent, pas d’impôt anticipé, une perte pour les associés.</li>
</ul>""",
        'Le point que les étudiants ratent : l’impôt anticipé ne frappe pas tout le montant réparti, seulement ce qui dépasse le nominal et les apports de capital. Corboz : rien ; Duboux : 192 000.')

d.slide('6.1', 'Le paragraphe « La Sàrl »', 'La Sàrl se liquide comme la SA : l’art. 826 al. 2 CO renvoie aux mêmes règles', """
<ul class="pts">
<li>Mêmes étapes, mêmes délais, même appel aux créanciers, même répartition au prorata des apports.</li>
<li>Le vocabulaire change : <b>capital social</b> et <b>parts sociales</b> à la place de capital-actions et actions ; les <b>associés</b> à la place des actionnaires.</li>
<li>L’associé d’une Sàrl ne risque que son apport, comme l’actionnaire : il ne répond pas des dettes de la société liquidée, sauf obligation statutaire de versements supplémentaires.</li>
<li>Le compte « Liquidation » unique est fréquent dans les petites Sàrl ; la méthode à deux comptes marche aussi.</li>
</ul>""",
        'Question au quiz : « les associés d’une Sàrl répondent personnellement pendant cinq ans » — faux.')

d.slide('6.1', 'Vérifiez · Qui fait quoi ?', 'À vous : classez les sept actions en bas de la section 6.1', """
<ol class="steps">
<li>Ouvrez la page de la séance 6, <b>section 6.1</b>, et descendez jusqu’à la carte « Vérifiez ».</li>
<li>Pour chaque action, cliquez sur qui la fait : <b>assemblée générale</b>, <b>liquidateurs</b> ou <b>autorités</b> (registre du commerce, fisc, expert-réviseur agréé).</li>
<li>La page dit tout de suite si la réponse est juste.</li>
</ol>
<p class="small">La section 6.1 est terminée quand les sept actions sont classées.</p>""",
        'Réponses : dissolution AG ; bilan d’entrée L ; appel aux créanciers L ; vendre et payer L ; attestation après trois mois A (expert-réviseur agréé) ; approuver le bilan de clôture AG ; accord avant la radiation A (fisc).', 'todo')

# ---------------------------------------------------------------- 6.2
d.raw('part', '<div class="num">Partie 1 · section 6.2 de la page</div><h2>Alpibois Export Sàrl : le cas simple, avec un seul compte Liquidation</h2><p>Neuf écritures, quatre montants, cinq affirmations vraies ou fausses, puis une variante sur l’impôt anticipé.</p>',
      'Faire ouvrir la section 6.2. L’enseignant pose chaque écriture, la classe répond, chacun l’entre sur sa page.')

d.slide('6.2', 'Les données · KCHF', 'Alpibois Export Sàrl entre en liquidation avec un bilan de 230, en milliers de francs', """
<div class="two">
<div><table class="t">
<tr><th>Actif, en KCHF</th><th></th></tr>
<tr><td>Liquidités</td><td class="n">30</td></tr><tr><td>Débiteurs</td><td class="n">70</td></tr><tr><td>Stock</td><td class="n">90</td></tr><tr><td>Véhicules</td><td class="n">40</td></tr>
<tr class="tot"><td>Total</td><td class="n">230</td></tr></table></div>
<div><table class="t">
<tr><th>Passif, en KCHF</th><th></th></tr>
<tr><td>Créanciers</td><td class="n">110</td></tr><tr><td>Capital social</td><td class="n">50</td></tr><tr><td>Réserves (bénéfices)</td><td class="n">70</td></tr>
<tr class="tot"><td>Total</td><td class="n">230</td></tr></table></div>
</div>
<p class="small" style="margin-top:.6em">Réalisation : les débiteurs rapportent <b>64</b> ; le stock est vendu <b>105</b> ; les véhicules, <b>31</b>. Les frais de liquidation s’élèvent à <b>12</b>. Les créanciers sont payés intégralement.</p>""",
        'Carte « Les données » en haut de la section 6.2. Faire repérer, pour chaque actif, si le prix obtenu est au-dessus ou en dessous du bilan.')

d.slide('6.2', 'Avec la classe · les neuf écritures', 'La méthode : pour chaque actif, d’abord la différence, puis l’encaissement', """
<table class="t">
<tr><th>Opération</th><th>Débit</th><th>Crédit</th></tr>
<tr><td class="k">Débiteurs encaissés en dessous du bilan</td><td>Liquidation (la perte)</td><td>Débiteurs</td></tr>
<tr><td class="k">… puis l’encaissement</td><td>Liquidités</td><td>Débiteurs</td></tr>
<tr><td class="k">Stock vendu au-dessus du bilan</td><td>Stock (le gain)</td><td>Liquidation</td></tr>
<tr><td class="k">… puis l’encaissement, au prix de vente</td><td>Liquidités</td><td>Stock</td></tr>
<tr><td class="k">Frais de liquidation payés</td><td>Liquidation</td><td>Liquidités</td></tr>
<tr><td class="k">Créanciers payés</td><td>Créanciers</td><td>Liquidités</td></tr>
<tr><td class="k">Solde du compte Liquidation (une perte)</td><td>Réserves</td><td>Liquidation</td></tr>
</table>
<p class="small" style="margin-top:.5em">Les véhicules suivent la même règle que les débiteurs. La page dessine les comptes en T sous le journal.</p>""",
        'Montants : perte débiteurs 6, encaissement 64 ; gain stock 15, encaissement 105 ; perte véhicules 9, encaissement 31 ; frais 12 ; créanciers 110 ; solde de Liquidation 12 au débit, imputé aux réserves.')

d.slide('6.2', 'Avec la classe · les montants', 'À vous : neuf écritures, puis quatre montants, puis vrai ou faux', """
<ol class="steps">
<li>Passez les <b>neuf écritures</b> dans la carte « Avec la classe », dans l’ordre des lettres a à i.</li>
<li>Entrez les <b>quatre montants</b> : le résultat de liquidation, les liquidités à répartir, l’excédent de liquidation, l’impôt anticipé à 35 %.</li>
<li>Répondez aux <b>cinq affirmations</b> vraies ou fausses sur le déroulement.</li>
</ol>
<p class="small">Contrôle : à la fin, les actifs vendus, les créanciers et le compte Liquidation sont à zéro ; il ne reste que les liquidités, face au capital social et aux réserves.</p>""",
        'Réponses : résultat −12 ; liquidités 108 (= 50 + 70 − 12) ; excédent 58 (108 − 50) ; impôt anticipé 20,3. Vrai ou faux : F (une publication), V (3 février 2028), F (accord du fisc), V, F.', 'todo')

d.slide('6.2', 'Avec la classe · une variante sur l’impôt anticipé', 'Et si 20 des 70 de réserves venaient d’un apport des associés ?', """
<p class="def"><b>Réserves issues d’apports de capital :</b> l’argent que les associés ont apporté au-delà du nominal (un agio), confirmé comme tel par l’AFC. Ce qu’ils en récupèrent n’est pas un revenu : il sort de l’excédent de liquidation.</p>
<ul class="pts">
<li>Le capital social de 50 est divisé en <b>50 parts de CHF 1 000</b>.</li>
<li>Question 1 : quel est maintenant l’excédent de liquidation soumis à l’impôt anticipé ?</li>
<li>Question 2 : quel est l’impôt anticipé à 35 % ?</li>
<li>Question 3 : quel montant brut chaque part reçoit-elle, et combien reste-t-il net à l’associé ?</li>
</ul>""",
        'Réponses : excédent 38 (108 − 50 − 20) ; impôt anticipé 13,3 au lieu de 20,3 ; brut 2 160 par part, net 1 894 (2 160 − 13 300 ÷ 50).', 'todo')

# ---------------------------------------------------------------- 6.3
d.raw('part', '<div class="num">Partie 1 · section 6.3 de la page</div><h2>Ébénisterie Corboz SA : les écritures de liquidation d’une SA</h2><p>Deux comptes de résultat, « Perte de liquidation » et « Bénéfice de liquidation », les frais à part, et le trafic des paiements par la banque.</p>',
      'Faire ouvrir la section 6.3. C’est le cœur de la soirée : dix-huit écritures, une opération après l’autre, avec les comptes en T qui se remplissent.')

d.slide('6.3', 'Les données · CHF', 'Ébénisterie Corboz SA entre en liquidation le 1er janvier 2027 avec une perte reportée de 91 000', """
<div class="two">
<div><table class="t">
<tr><th>Actif, en CHF</th><th></th></tr>
<tr><td>Banque</td><td class="n">42 000</td></tr><tr><td>Débiteurs 58 000 · ducroire −5 000</td><td class="n">53 000</td></tr><tr><td>Stock</td><td class="n">70 000</td></tr><tr><td>Machines 480 000 · fonds d’amortissement −260 000</td><td class="n">220 000</td></tr><tr><td>Mobilier</td><td class="n">12 000</td></tr><tr><td>Véhicule</td><td class="n">24 000</td></tr>
<tr class="tot"><td>Total</td><td class="n">421 000</td></tr></table></div>
<div><table class="t">
<tr><th>Passif, en CHF</th><th></th></tr>
<tr><td>Fournisseurs</td><td class="n">64 000</td></tr><tr><td>Prêt (Bois Rochat SA)</td><td class="n">180 000</td></tr><tr><td>Provisions</td><td class="n">18 000</td></tr><tr><td>Capital-actions (250 actions de 1 000)</td><td class="n">250 000</td></tr><tr><td>Perte reportée</td><td class="n">−91 000</td></tr>
<tr class="tot"><td>Total</td><td class="n">421 000</td></tr></table></div>
</div>""",
        'Carte « Les données » de la section 6.3. Faire remarquer la perte reportée : les actionnaires ont déjà perdu 91 000 avant la liquidation.')

d.slide('6.3', 'Les données · la liste des opérations', 'Sept opérations à comptabiliser, une après l’autre', """
<ol class="steps">
<li>Le véhicule est repris par un fournisseur pour <b>16 000</b> : il compense sa créance de 11 000 et verse le solde.</li>
<li>Les débiteurs versent <b>49 000</b> ; le ducroire est utilisé, le solde est perdu.</li>
<li>Le mobilier est vendu <b>7 000</b>, encaissés.</li>
<li>Le prêteur, Bois Rochat SA, reprend toutes les machines pour <b>300 000</b>, portés sur un compte courant « CC Rochat ».</li>
<li>Le prêt est compensé avec le compte courant ; Bois Rochat SA verse le solde.</li>
<li>Les provisions sont dissoutes ; les fournisseurs restants sont payés ; les frais de liquidation, <b>38 000</b>, sont payés.</li>
<li>Le stock est vendu <b>60 000</b>, encaissés.</li>
</ol>""",
        'Lire les sept opérations. Demander avant de commencer : lesquelles donnent une perte, lesquelles un bénéfice ? (1, 2, 3, 7 : pertes ; 4, 6 : bénéfices.)')

d.slide('6.3', 'Avec la classe · une opération après l’autre', 'Trois situations à savoir comptabiliser dans une liquidation de SA', """
<div class="three">
<div class="box"><div class="tag">Reprise par un créancier</div><h3>La dette s’éteint contre l’actif</h3><p>Fournisseurs à Véhicule, pour la créance compensée. Banque à Véhicule, pour le solde versé. Perte (ou Bénéfice) de liquidation, pour la différence avec la valeur comptable.</p></div>
<div class="box"><div class="tag">Correction de valeur</div><h3>Le ducroire et le fonds d’amortissement sont soldés contre l’actif</h3><p>Ducroire à Débiteurs ; Fonds d’amortissement à Machines. Ensuite seulement, la perte ou le bénéfice sur la valeur nette.</p></div>
<div class="box"><div class="tag">Provision sans objet</div><h3>Elle devient un bénéfice</h3><p>Provisions à Bénéfice de liquidation. Rien n’est encaissé : la société doit simplement moins qu’elle ne le pensait.</p></div>
</div>""",
        'Le piège des machines : 300 000 au compte courant, 260 000 de fonds d’amortissement soldé, et le compte Machines montre −80 000 : c’est le bénéfice, 300 000 − 220 000 de valeur nette.')

d.slide('6.3', 'Avec la classe · une opération après l’autre', 'À vous : dix-huit écritures dans la carte « Avec la classe »', """
<ol class="steps">
<li>Pour chaque opération, l’enseignant demande l’écriture : <b>débit, crédit, montant</b>. Dites-la, puis entrez-la sur votre page.</li>
<li>Regardez les <b>comptes en T</b> sous le journal : chaque écriture juste s’y inscrit avec son numéro.</li>
<li>À la fin, chaque actif vendu est à zéro et la banque montre ce qui reste pour les actionnaires.</li>
</ol>
<p class="small">La section 6.3 est terminée quand les dix-huit écritures sont passées. La pause suit ; la clôture se fait après.</p>""",
        'Montants : 1a 11 000, 1b 5 000, 1c perte 8 000 ; 2a 49 000, 2b 5 000, 2c perte 4 000 ; 3a 7 000, 3b perte 5 000 ; 4a 300 000, 4b 260 000, 4c bénéfice 80 000 ; 5a 180 000, 5b 120 000 ; 6a bénéfice 18 000, 6b 53 000, 6c frais 38 000 ; 7a 60 000, 7b perte 10 000. Banque à la fin : 192 000.', 'todo')

# ---------------------------------------------------------------- 6.4
d.raw('part', '<div class="num">Partie 2 · section 6.4 de la page</div><h2>Corboz SA : le résultat de la liquidation, le bilan de clôture et la répartition</h2><p>Trois totaux, quatre montants, un champ, puis sept écritures de clôture qui ramènent tous les comptes à zéro.</p>',
      'Reprise après la pause. Faire ouvrir la section 6.4. Les comptes en T partent des soldes après les dix-huit écritures.')

d.slide('6.4', 'Le compte de résultat de la période de liquidation', 'Le compte de résultat de la période de liquidation rassemble les pertes, les bénéfices et les frais', """
<div class="formula"><small>Le résultat de la période de liquidation</small>Résultat = bénéfices de liquidation − pertes de liquidation − frais de liquidation</div>
<ol class="steps">
<li>Additionnez les <b>pertes</b> de la section 6.3 : véhicule, débiteurs, mobilier, stock.</li>
<li>Additionnez les <b>bénéfices</b> : machines, provisions dissoutes.</li>
<li>Retirez les <b>frais</b>. Le résultat est positif si les bénéfices dépassent les pertes et les frais.</li>
</ol>
<p class="small">Entrez les trois montants dans la première carte de la section 6.4.</p>""",
        'Réponses : pertes 27 000 (8 + 4 + 5 + 10) ; bénéfices 98 000 (80 + 18) ; résultat 33 000 (98 − 27 − 38).', 'todo')

d.slide('6.4', 'Le bilan de clôture et la répartition', 'Le bilan de clôture : la banque d’un côté, les fonds propres de l’autre', """
<div class="formula"><small>Le contrôle</small>Banque à la clôture = capital-actions − perte reportée + résultat de la liquidation</div>
<ol class="steps">
<li>La <b>banque</b> au bilan de clôture : partez de 42 000 et suivez chaque encaissement et chaque paiement de la section 6.3.</li>
<li>Le montant réparti <b>par action</b> : la banque divisée par 250 actions.</li>
<li>L’<b>excédent de liquidation</b> soumis à l’impôt anticipé : ce qui dépasse le nominal de 250 000. Y en a-t-il un ?</li>
<li><b>Variante :</b> si le résultat de liquidation avait été de +120 000, quel impôt anticipé la société aurait-elle dû retenir ?</li>
</ol>
<p class="small">Puis le champ : pourquoi pas d’impôt anticipé chez Corboz, alors qu’Alpibois Export en devait ?</p>""",
        'Réponses : banque 192 000 ; 768 par action ; excédent 0 (192 000 < 250 000 : les actionnaires perdent 232 par action, une perte en capital privée non déductible pour une personne physique) ; variante : répartition 279 000, excédent 29 000, impôt 10 150.', 'todo')

d.slide('6.4', 'Avec la classe · les écritures de clôture et la répartition', 'Sept écritures de clôture, dans la dernière carte de 6.4, et tous les comptes sont à zéro', """
<table class="t">
<tr><th>Étape</th><th>Débit</th><th>Crédit</th></tr>
<tr><td class="k">a · Bénéfices virés</td><td>Bénéfice de liquidation</td><td>Résultat de liquidation</td></tr>
<tr><td class="k">b · Pertes virées</td><td>Résultat de liquidation</td><td>Perte de liquidation</td></tr>
<tr><td class="k">c · Frais virés</td><td>Résultat de liquidation</td><td>Frais de liquidation</td></tr>
<tr><td class="k">d · Le résultat couvre la perte reportée</td><td>Résultat de liquidation</td><td>Perte reportée</td></tr>
<tr><td class="k">e · Le capital couvre le reste</td><td>Capital-actions</td><td>Perte reportée</td></tr>
<tr><td class="k">f · Le reste du capital est dû aux actionnaires</td><td>Capital-actions</td><td>Actionnaires (répartition)</td></tr>
<tr><td class="k">g · Versement</td><td>Actionnaires (répartition)</td><td>Banque</td></tr>
</table>""",
        'Montants : a 98 000 ; b 27 000 ; c 38 000 ; d 33 000 ; e 58 000 ; f 192 000 ; g 192 000. Pas d’impôt anticipé : rien ne dépasse le nominal.', 'todo')

# ---------------------------------------------------------------- 6.5
d.raw('part', '<div class="num">Partie 2 · section 6.5 de la page · si le temps le permet</div><h2>Scierie Duboux SA : une liquidation qui dépasse le nominal</h2><p>Trois choses nouvelles : un immeuble vendu avec reprise de l’hypothèque, une créance consignée, et l’impôt anticipé retenu avant de verser.</p>',
      'Ne commencer que s’il reste au moins trente minutes avant le quiz. Sinon : dire que la section reste ouverte, et que c’est le format le plus complet que l’examen puisse demander.')

d.slide('6.5', 'Les données · CHF', 'Scierie Duboux SA entre en liquidation le 1er avril 2027 avec des réserves et sans perte reportée', """
<div class="two">
<div><table class="t">
<tr><th>Actif, en CHF</th><th></th></tr>
<tr><td>Banque</td><td class="n">35 000</td></tr><tr><td>Débiteurs 90 000 · ducroire −6 000</td><td class="n">84 000</td></tr><tr><td>Stock</td><td class="n">120 000</td></tr><tr><td>Immeuble 650 000 · fonds d’amortissement −150 000</td><td class="n">500 000</td></tr><tr><td>Participation (actions de Bois Rochat SA)</td><td class="n">40 000</td></tr>
<tr class="tot"><td>Total</td><td class="n">779 000</td></tr></table></div>
<div><table class="t">
<tr><th>Passif, en CHF</th><th></th></tr>
<tr><td>Fournisseurs</td><td class="n">72 000</td></tr><tr><td>Hypothèque</td><td class="n">300 000</td></tr><tr><td>Provision pour procès</td><td class="n">25 000</td></tr><tr><td>Capital-actions (300 actions de 1 000)</td><td class="n">300 000</td></tr><tr><td>Réserve légale issue du capital (agio confirmé par l’AFC)</td><td class="n">45 000</td></tr><tr><td>Réserve légale issue du bénéfice</td><td class="n">37 000</td></tr>
<tr class="tot"><td>Total</td><td class="n">779 000</td></tr></table></div>
</div>""",
        'Carte « Les données » de la section 6.5. Faire remarquer la réserve légale issue du capital confirmée par l’AFC : elle sortira de l’excédent.')

d.slide('6.5', 'Les données · la liste des opérations', 'Sept opérations, dont trois nouvelles : l’hypothèque reprise, la transaction, la consignation', """
<ol class="steps">
<li>Les débiteurs versent <b>81 000</b> ; le ducroire est utilisé ; le solde est perdu.</li>
<li>Le stock est vendu <b>95 000</b>, encaissés.</li>
<li>L’immeuble est vendu <b>720 000</b> : l’acheteur <b>reprend l’hypothèque</b> de 300 000 et verse le solde. Le fonds d’amortissement est soldé.</li>
<li>La participation est vendue <b>52 000</b>, encaissés.</li>
<li>Le procès se termine par une transaction : la société paie <b>19 000</b> ; le solde de la provision est dissous.</li>
<li>Un ancien employé réclame <b>14 000</b> ; les liquidateurs contestent et <b>consignent</b> le montant (art. 744 CO), comptabilisé comme une perte de liquidation.</li>
<li>Les fournisseurs sont payés ; les frais de liquidation, <b>41 000</b>, sont payés.</li>
</ol>""",
        'Les opérations 1 à 4 se passent en écritures dans le journal ; 5 à 7 sont demandées en montants dans le bloc suivant, puis passées dans les comptes de tête.')

d.slide('6.5', 'Avec la classe · les écritures de réalisation', 'Trois mécanismes nouveaux, et leurs écritures', """
<div class="three">
<div class="box"><div class="tag">Immeuble avec reprise de l’hypothèque</div><h3>Une partie du prix est payée en reprenant la dette</h3><p>Hypothèque à Immeuble, pour la dette reprise. Banque à Immeuble, pour le solde. Fonds d’amortissement à Immeuble. Immeuble à Bénéfice de liquidation, pour la différence avec la valeur nette.</p></div>
<div class="box"><div class="tag">Provision et transaction</div><h3>Le procès coûte moins que prévu</h3><p>Provision pour procès à Banque, pour ce qui est payé. Provision pour procès à Bénéfice de liquidation, pour le solde dissous.</p></div>
<div class="box"><div class="tag">Consignation, art. 744 CO</div><h3>L’argent sort de la masse et attend</h3><p>Perte de liquidation à Banque. Si la créance est écartée par le juge, le montant revient plus tard ; la société, elle, est radiée.</p></div>
</div>""",
        'Montants : 1a 81 000, 1b 6 000, 1c perte 3 000 ; 2a 95 000, 2b perte 25 000 ; 3a 300 000, 3b 420 000, 3c 150 000, 3d bénéfice 220 000 ; 4a 52 000, 4b bénéfice 12 000 ; 5 : 19 000 payés, 6 000 dissous ; 6 : 14 000 ; 7 : 72 000 et 41 000.', 'todo')

d.slide('6.5', 'Le résultat, la banque, l’excédent et l’impôt anticipé', 'À vous : six montants, puis dix écritures de clôture avec l’impôt anticipé', """
<ol class="steps">
<li>Le bénéfice que dégage la transaction ; le total des pertes, consignation comprise ; le <b>résultat de la période de liquidation</b>.</li>
<li>La <b>banque</b> avant la répartition. Contrôle : capital + les deux réserves + le résultat.</li>
<li>L’<b>excédent de liquidation</b> : la banque, moins le nominal, moins la réserve issue d’apports de capital. La réserve issue du bénéfice, elle, est soumise.</li>
<li>Le <b>net par action</b> après la retenue de 35 %.</li>
<li>Puis les dix écritures : les trois comptes de résultat virés ; le résultat, les deux réserves et le capital dus aux actionnaires ; <b>Actionnaires à Impôt anticipé dû</b> ; le net versé ; l’impôt versé à l’AFC.</li>
</ol>""",
        'Réponses : 6 000 ; 42 000 ; 155 000 ; banque 537 000 ; excédent 192 000 (537 − 300 − 45) ; impôt 67 200 ; net 469 800, soit 1 566 par action (brut 1 790, retenue 224). Clôture : a 238 000, b 42 000, c 41 000, d 155 000, e 37 000, f 45 000, g 300 000, h 67 200, i 469 800, j 67 200.', 'todo')

# ---------------------------------------------------------------- 6.6 · 6.7
d.slide('6.6', 'Quiz de la séance 6', 'Le quiz de la séance 6 : onze questions, lancé ensemble', """
<ol class="steps">
<li>Ouvrez la <b>section 6.6</b>. La page est verrouillée jusqu’à ce que l’enseignant lance le quiz ; elle se déverrouille toute seule.</li>
<li>Onze questions à choix unique, au format Inspera : le déroulement, les délais, une écriture, un résultat, l’impôt anticipé.</li>
<li>Une seule tentative par question ; chaque réponse est expliquée tout de suite.</li>
</ol>
<p class="small">Seul·e, sans assistant, calculatrice autorisée.</p>""",
        'Lancer le quiz depuis la vue enseignant. Réponses : 1 (une fois), 1 (un an / trois mois), 1 (Perte de liquidation à Véhicule 8 000), 1 (+33 000), 2 (aucun excédent), 2 (le conseil d’administration), 1 (garde sa personnalité), 1 (consignés), 1 (21 000), 1 (bénéfice 15 000), 1 (350).', 'todo')

d.slide('6.7', 'Fin de la séance', 'Fin de la séance : ce qui reste flou, et ce qu’il faut faire avant mardi 1er décembre', """
<ol class="steps">
<li><b>Section 6.7 :</b> écrivez ce qui reste flou, une notion, un calcul, une écriture. L’enseignant lit ce champ avant mardi.</li>
<li><b>Avant la séance 7 :</b> lire <i>Fondements de l’évaluation d’entreprise</i> (BRW112), chapitres 1 à 4. Mardi 1er décembre : valeur substantielle, valeur de rendement, méthode des praticiens, DCF.</li>
<li><b>L’exercice d’étude autonome :</b> le problème 5 (liquidation) est faisable dès ce soir. L’énoncé se télécharge sur la page du cours ; la remise se fait sur OpenOLAT avant le lundi 14 décembre 2026, 23h59.</li>
</ol>
<p class="small">Exercices suggérés : le chapitre 7 du manuel ; refaire Corboz (6.3 et 6.4) et Alpibois Export (6.2) sans regarder vos réponses.</p>""",
        'Remercier. Rappeler que la séance 7 est indépendante : l’évaluation d’entreprise, avant la consolidation des séances 8 et 9.', 'todo')

io.open(os.path.join(ROOT, 'seance6-slides.html'), 'w', encoding='utf-8').write(d.html(
    'Séance 6 · Diapositives · FL III',
    'Financial Leadership III, séance 6 — les diapositives de l’exposé : le déroulement d’une liquidation, le compte Liquidation, l’excédent de liquidation et l’impôt anticipé, puis les trois ateliers. Chaque diapositive indique la section de la page de la séance où se trouve le même texte.'))
print('seance6-slides.html', len(d.out), 'slides')
