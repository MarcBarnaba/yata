# PRD – GTD App (Nuxt 3 + Vue 3)

## Contesto e ratio del metodo (dal PDF fornito)
Il metodo GTD nasce per risolvere il problema tipico del knowledge worker moderno:
- flusso continuo di input,
- assenza di confini chiari del lavoro,
- sovraccarico cognitivo latente.

Concetti chiave esplicitati nel documento:
- La mente è un sistema creativo, non un sistema di archiviazione.
- Tenere impegni e cose da fare nella testa genera rumore di fondo cognitivo.
- La metafora “mente come l’acqua” rappresenta uno stato di equilibrio e prontezza mentale.
- Il cervello conserva informazioni senza contesto ed è un archivio instabile.
- Serve un sistema esterno affidabile che raccolga, chiarisca e organizzi tutto.

Il metodo GTD è basato su 5 fasi operative:

1. Catturare (Capture)
2. Chiarire (Clarify)
3. Organizzare (Organize)
4. Riflettere (Reflect – Weekly Review)
5. Agire (Engage)

Elemento centrale del metodo:
- ogni impegno deve essere trasformato in una “prossima azione fisica e visibile”
- se un risultato richiede più di un’azione, è un progetto
- se non è azionabile ora, va classificato (Waiting for, Someday/Maybe, Reference, Calendar)

L’app non è una semplice todo list ma un sistema di supporto decisionale.

---

## Obiettivo del prodotto

Realizzare una web app estremamente semplice, veloce e guidata che permetta di applicare correttamente il metodo GTD,
riducendo al minimo la frizione nella fase di chiarimento e revisione.

Target iniziale: utente singolo.

Tecnologia:
- Nuxt 3
- Vue 3
- Pinia
- Tailwind
- TypeScript

---

## Visione

Consentire all’utente di:
- svuotare la mente in modo affidabile
- prendere decisioni una sola volta per ogni input
- lavorare sempre su una lista di azioni realmente eseguibili

---

## Scope MVP

Funzionalità incluse:

- Inbox (raccolta rapida)
- Processo guidato di chiarimento
- Next Actions
- Progetti
- Waiting For
- Someday / Maybe
- Reference / Archivio
- Calendario (solo hard landscape)
- Weekly Review guidata
- Contesti
- Export / Import JSON
- Persistenza locale

---

## Principi di design (direttamente coerenti con il metodo)

- nessuna lista mista di cose vaghe
- ogni azione deve essere fisica, visibile e singola
- il sistema deve spingere l’utente a chiarire subito
- la inbox non è una lista operativa
- ogni progetto deve avere una next action

---

## Entità principali

Item
- id
- title
- notes
- createdAt
- updatedAt
- status
  - inbox
  - next
  - waiting
  - someday
  - reference
  - calendar
  - done
  - trashed
- context[]
- tags[]
- projectId
- dueDate
- durationEstimate
- energy
- delegatedTo
- waitingForDate

Project
- id
- title
- outcome (risultato desiderato)
- status
- nextActionId

WeeklyReview
- id
- completedAt
- statsSnapshot

---

## Flusso principale

### Capture

Quick capture sempre disponibile.
Titolo obbligatorio.
Salvataggio immediato in inbox.

---

### Clarify – Process Inbox

Per ogni elemento:

Domanda 1:
È azionabile?

Se NO:
- Reference
- Someday / Maybe
- Trash

Se SI:
Domanda 2:
È una sola azione?

Se SI:
- creare Next Action

Se NO:
- creare Project
- definire subito la prima Next Action

Scelte aggiuntive:
- delegato → Waiting For
- data specifica → Calendar

Questo flusso è obbligatorio e guidato.

---

## Liste

### Next Actions
Filtro per:
- contesto
- durata
- energia

### Progetti
Ogni progetto deve visualizzare:
- outcome
- next action

Progetti senza next action devono essere evidenziati.

### Waiting For
Mostra deleghe e follow‑up.

### Someday / Maybe

### Reference

---

## Weekly Review (fondamentale per la riuscita del metodo)

Checklist guidata:

- Inbox vuota
- Tutti i progetti hanno una next action
- Waiting for aggiornati
- Calendar rivisto
- Someday / Maybe rivisto

Alla fine viene registrato un checkpoint.

Senza Weekly Review il sistema perde affidabilità.

---

## UX screens

- Dashboard
- Inbox
- Process Inbox
- Next Actions
- Projects
- Project Detail
- Waiting For
- Someday
- Reference
- Calendar
- Weekly Review
- Settings

---

## Architettura frontend

/ pages
/ components
/ stores
  - useItemsStore
  - useProjectsStore
  - useReviewStore
  - useSettingsStore
/ utils
  - persistence

---

## Persistence

Adapter pattern:

- LocalStorage / IndexedDB (MVP)
- REST backend (futuro)

---

## API (futuro backend)

POST   /items
GET    /items
PUT    /items/:id
DELETE /items/:id

POST   /projects
GET    /projects
PUT    /projects/:id

POST   /export
POST   /import

---

## Acceptance criteria

- è possibile catturare un item in meno di 2 secondi
- ogni item può essere processato con il flusso guidato
- non è possibile chiudere un progetto senza next action
- Weekly Review guidata disponibile

---

## Metriche di prodotto

- inbox zero raggiunta
- percentuale progetti con next action
- numero weekly review completate

---

## Linee guida per Claude Code

- generare progetto Nuxt 3 con TypeScript
- usare Pinia
- creare persistence adapter
- creare componenti separati per ogni vista
- includere test base per stores
- fornire mock backend opzionale

---

## Nota importante sul metodo

Il valore del sistema non è la lista delle cose da fare,
ma l’affidabilità del sistema esterno che permette alla mente di smettere di ricordare e tornare a creare.
