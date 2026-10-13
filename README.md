# Safar — Guided + Rush conductor ticketing

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import `princek09122002-ui/assignment-1`.
2. Keep the **Root Directory** at the repository root (`./`). If asked for a framework, choose **Other**.
3. Click **Deploy**. No environment variables are required.

The included `vercel.json` skips dependency installation, runs `npm run build`
(the automated tests), and serves the committed `dist/` folder. This is a static
HTML/CSS/JavaScript app, so there is no compilation step. Both the main app and
`print.html` are served directly. Future pushes to the connected production branch
can deploy through Vercel's Git integration.

To preview locally, run `python3 -m http.server 8000 --directory dist` and open
`http://localhost:8000`. Use an HTTP server rather than opening the HTML file directly.

## Ticket flow

Current requested sequence:
1. Choose Single destination or Multiple destinations, then select all requested stops.
2. Set passenger counts one destination at a time (1–99 adults each).
3. Collect a separate Cash or UPI payment for every destination. No combined bill.
4. Print independent paper group tickets. Paid journeys may print while another waits.

Paper is the only delivery method. There is no phone-ticket delivery. The UPI QR is
explicitly non-payable demonstration data; no merchant, provider or real money transfer
is configured. Prototype controls simulate success, failure and unknown outcomes.
Actual UPI confirmation must be verified by a production payment service.

## Try

Test lab → Destinations first begins at step 1 with MG Road, Indiranagar and Whitefield.
Enter counts 3, 2 and 4. The independent amounts are ₹60, ₹60 and ₹180 (sample fares).
Cash + UPI + Cash starts at payment review for testing outcomes.
Partial print failure records each ticket once, then retries only unprinted slips.

## Mobile layout

The mobile work surface uses the available dynamic viewport without the duplicate
presentation header. Four large stop tiles are paged with Previous / Next, and
selection remains across pages. Guided passenger counts use six large choices on
one screen. Payments are paged one original journey at a time; Rush retains the
same queue and payment references. Secondary notes, history and settings are under
the app menu. Very short viewports (under 520 CSS px), zoom and keyboard dialogs
retain a scrolling access fallback. Real-device rendering still needs verification.

## Rush and correction

The existing Guided single/multiple destination sequence remains available. Rush adds
fixed destination buttons, visible default quantity 1, direct count choices, a fresh
unpaid repeat journey, Cash received & print, and independent pending UPI requests.
Add to queue supports multiple destinations and distinct payers at the same stop.
Switching modes preserves the shared queue. A selected Guided batch must be completed
or explicitly deselected before Rush; in-progress count edits require Save or Back.

Every request gets a browser-local A-number which appears on the printed slip.
Unpaid tickets support destination and count corrections, Save, and Back/discard.
Cash shortcuts calculate change without confirming payment. Paid/pending edits lock.
The Rush test scenario opens 3 / 2 / 4 passengers with the middle UPI pending.

## Source

- dist/index.html: interactive prototype and design rationale
- dist/styles.css: responsive layout and mobile fixed actions
- dist/wizard-core.js: step progression, counts, payment state and idempotent ticket creation
- dist/app.js: UI controller, payment simulation, print simulation and browser persistence
- dist/core.js: illustrative route/fare rules
- dist/print.html, passenger.js, passenger.css: printable slips and browser Save PDF
- dist/delivery.js: print payload encoding and demo payment QR rendering
- dist/vendor/qr: locally vendored QR encoder and original license notices

No runtime dependencies or remote assets. Serve dist/ with a static server.

## Validation

Run node --test tests/*.test.js. Thirty model/controller checks cover sequential counts,
separate payment amounts and references, pending UPI reuse, failure recovery, offline
restrictions, paid-data locks, print duplicate protection, partial printing and restoring
pending requests. Added checks cover same-stop separate payers, edit rollback,
change calculation, Rush repeats, shared pending queues, mode guards, printed request
numbers and double-tap protection. Controller tests use DOM stubs; they do not verify browser layout.
Module syntax, HTML nesting and local asset/import paths were checked.

Actual browser rendering, phone-camera scanning and physical printer behavior have not
been validated in this environment. The guided flow adds steps: neither a three-tap
claim nor under-four-second performance is claimed. Measure it with conductors and
real hardware, including cash handling and ticket handover.

## Data and assumptions

This is a prototype with illustrative fares. All destinations in a run share one
boarding stop. One adult-fare group at each destination has one payer and one paper
slip; unrelated payers for the same stop use independent Rush queue entries.
Data is stored locally under safar-guided-v3; prior prototype namespaces are untouched.
Cash can be simulated offline. UPI waits for connectivity. Production needs durable
records, provider-backed status, operator-approved offline behavior, secure ticket IDs
and cancellation/refund workflows.
