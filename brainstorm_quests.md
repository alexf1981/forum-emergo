# Brainstorm: Quests & Heroes Implementation

## 1. Economie & Start (Refined)
De nieuwe speler begint met **200 Goud**.

*   **Beoogde Uitgaven:**
    *   **Woonhuis:** 100 Goud (Direct een plek voor de eerste burger/held).
    *   **Taverne Unlock:** 100 Goud (Maakt quests en helden mogelijk).
*   **Netto resultaat:** Speler heeft 0 Goud over, maar wel de basis-infrastructuur.
*   **Eerste Held:** Gratis (Zziet de nieuwe Taverne en komt langs).

## 2. Quest Mechanieken & De Tutorial
Om de speler te helpen met het definiëren van gewoontes, introduceren we **"Quest 0: Introspectie"**.

### Quest 0: Introspectie (The First Step)
*   **Type:** Instantaan / Tutorial.
*   **Beschikbaarheid:** Direct na bouwen Taverne (of zelfs daarvoor in Onboarding 2.0).
*   **Doel:** "Definieer wie je wilt zijn."
    *   Maak 1 'Virtue' (Goede Gewoonte) aan.
    *   Maak 1 'Vice' (Slechte Gewoonte) aan.
*   **Hulpfunctie: De Inspiratie Rol**
    *   De speler krijgt toegang tot een **"Inspiratie Lijst"** met categorieën en voorbeelden.
    *   *Functionaliteit:* Klik op een voorbeeld -> Opent "Nieuwe Gewoonte" modal met vooraf ingevulde tekst.

#### Inspiratie Voorbeelden (Te gebruiken in UI)
*   **Gezondheid:**
    *   ✅ "Drink 2L water"
    *   ✅ "30 min wandelen"
    *   ⛔ "Snoepen na 20:00"
*   **Productiviteit:**
    *   ✅ "Geen telefoon in het eerste uur (Deep Work)"
    *   ✅ "Inbox Zero"
    *   ⛔ "Social Media tijdens werkuren"
*   **Mindset:**
    *   ✅ "Schrijf 3 dingen op waar je dankbaar voor bent"
    *   ✅ "Mediteer 10 min"
    *   ⛔ "Klagen zonder oplossing"

---

## 3. Quest Mechanieken (Algemeen)
Missies hebben een **moeilijkheidsgraad** en een **duratie**.

### Moeilijkheid vs. Heldenkracht
*   **Formule:** `Totale Helden Kracht >= Quest Moeilijkheid`
    *   *Totale Helden Kracht* = Som van (Level + Strength + Bonussen) van alle toegewezen helden.
*   **Balans Voorbeelden:**
    *   *Quest Lvl 1:* Vereist 1 zwakke held (Lvl 1).
    *   *Quest Lvl 5:* Vereist 1 sterke held (Lvl 5) OF meerdere zwakke helden (bijv. 2x Lvl 3, of 5x Lvl 1).
    *   *Quest Lvl 10:* Vereist elite team.

### Interactie & Duratie Types
Missies zijn gekoppeld aan **productiviteit in de echte wereld**.

#### A. Instantaan (Instant Action)
Wordt direct uitgevoerd ná het accepteren.
*   *Flow:* Accepteer Missie -> Voer actie uit -> Klik "Voltooien".
*   *Voorwaarde:* De actie kan direct gedaan worden (er is geen wachttijd).
*   *Validatie:* Systeem checkt data of gebruiker vinkt handmatig af (eerlijkheidssysteem).

#### B. Dagmissie (1 Day Challenge)
Moet aan het einde van de dag voltooid zijn.
*   *Doel:* "Voltooi vandaag gewoonte X" of "Doe vandaag GEEN slechte gewoonte Y".
*   *Check:* Bij dagafsluiting (of volgende login) wordt gekeken of het gelukt is.
*   *Faalconditie:* Niet gedaan = missie mislukt, held komt terug zonder buit (of gewond).

#### C. Korte Expeditie (3 Days)
Vereist volharding.
*   *Doel:* "3 dagen op rij gewoonte X uitvoeren".
*   *Mechaniek:* Held is 3 dagen "weg" (niet beschikbaar voor andere quests).
*   *Check:* Na 3 dagen keert held terug.
    *   3/3 dagen gelukt: Grote beloning.
    *   2/3 dagen: Kleine beloning.
    *   <2 dagen: Mislukt.

#### D. Lange Campagne (7 Days / Weekly)
Voor de lange adem.
*   *Doel:* "7 dagen streak op gewoonte Z" of "Behaal deze week 500 goud via taken".
*   *Mechaniek:* Held is een week "gestationeerd".

---

## 3. Suite van Missies (Ideeën)

Hieronder een lijst met mogelijke missies, gekoppeld aan RPG-thema's en productiviteitsdoelen.

### Tier 1: De Start (Lvl 1 - Makkelijk)
Geschikt voor 1 beginnende held.

| Quest Naam | RPG Flavor | Productiviteitsdoel (Actie) | Type |
| :--- | :--- | :--- | :--- |
| **Introspectie** (TUTORIAL) | "Ken uzelf." | Maak 3 nieuwe gewoontes aan (gebruik de inspiratielijst). | Instantaan |
| **Stadspatrouille** | "Houd de straten veilig van kruimeldieven." | Vink vandaag minimaal 1 'Virtue' (goede gewoonte) af. | 1 Dag |
| **Voorraadinventaris** | "Tel de graanzakken in het magazijn." | Review je takenlijst en verwijder/archiveer 1 oude taak die niet meer relevant is. | Instantaan |
| **Boodschappendienst** | "Breng een bericht naar de smid." | Maak 3 nieuwe taken aan voor deze week. | Instantaan |
| **Ochtendtraining** | "Ren een rondje om de kazerne." | Voltooi een specifieke ochtendgewoonte (indien ingesteld). | 1 Dag |

### Tier 2: De Wildernis (Lvl 3-5 - Gemiddeld)
Vereist een ervaren held of een klein team.

| Quest Naam | RPG Flavor | Productiviteitsdoel (Actie) | Type |
| :--- | :--- | :--- | :--- |
| **Bandietenkamp** | "Versla de bandieten die reizigers lastigvallen." | Voltooi een 'Mandatum' (Todo) taak die al langer dan 3 dagen open staat ("Eat the frog"). | Instantaan |
| **De Wachttoren** | "Houd 3 dagen de wacht bij de grens." | 3 dagen op rij inloggen en dagelijkse taken bekijken. | 3 Dagen |
| **Karavaan Beschermen** | "Bescherm de handelsroute tegen wolven." | Behaal vandaag minimaal 50 goud door taken/gewoontes. | 1 Dag |
| **Discipline Training** | "Weersta de verleidingen van de sirenes." | Vink vandaag GEEN 'Vice' (slechte gewoonte) af. | 1 Dag |

### Tier 3: Heroïsche Daden (Lvl 5-10 - Moeilijk)
Vereist sterke helden en planning.

| Quest Naam | RPG Flavor | Productiviteitsdoel (Actie) | Type |
| :--- | :--- | :--- | :--- |
| **Het Grote Banket** | "Organiseer een feestmaal voor de keizer." | Voltooi 5 'Virtue' gewoontes op één dag. | 1 Dag |
| **De Verloren Tempel** | "Verken de ruïnes diep in de jungle." | 7 dagen streak op een gewoonte met een lage succesrate (<50%). | 7 Dagen |
| **De Draak Verslaan** | "Een machtig beest bedreigt het rijk." | Voltooi een taak die je als 'Moeilijk' of 'Groot' beschouwt (misschien een speciale 'Boss Task' aanmaken?). | Instantaan/1 Dag |
| **Wederopbouw** | "Herbouw de brug na de storm." | Investeer goud in een upgrade voor de stad (Stadhuis/Markt/etc). | Instantaan |

## 4. Implementatie Vragen / Open Punten
*   **Helden Beschikbaarheid:** Als een held op een 3-dagen missie is, is hij dan 'locked' in de UI? (Waarschijnlijk wel: "On Adventure").
*   **Falen:** Wat gebeurt er als een gebruiker een 'Instantaan' missie aanklikt maar liegt? (We gaan uit van eerlijkheid, of we bouwen checks in waar mogelijk, bijv. data-based checks).
*   **Beloningen:** Naast Goud en XP, kunnen we ook **Items** vinden (zoals nu al in de logica zit).
