# INTEGRTR × GLA Hackathon 2026

**Team 02** · Repository: `gla_hackathon_2026_team_02`

## Team Members

| # | Roll No | Name | Email |
| --- | --- | --- | --- |
| 1 | 2415990014 | Chatanya Pratap | chatanya.pratap_cs24@gla.ac.in |
| 2 | 2315001521 | Nitin Tyagi | nitin.tyagi_cs23@gla.ac.in |
| 3 | 2315510018 | Akshansh Patel | akshanash.patel_cs.aiml23@gla.ac.in |
| 4 | 2315002063 | Shivam Choudhary | shivam.choudhary_cs23@gla.ac.in |
| 5 | 2315001473 | Nikhil Tiwari | nikhil.tiwari_cs23@gla.ac.in |
| 6 | 2315002075 | Shivam Sharma | shivam.sharma_cs23@gla.ac.in |
| 7 | 2315002259 | Suryansh Chauhan | suryansh.chauhan_cs23@gla.ac.in |
| 8 | 2315002543 | Yash Raj Srivastava | yash.srivastava_cs23@gla.ac.in |
| 9 | 2315510015 | Aditya Varshney | aditya.varshney_cs.aiml23@gla.ac.in |
| 10 | 2315800095 | Yashraj Mishra | yashraj.mishra_cs.h23@gla.ac.in |

---

## 🎯 Hackathon Track

### Track 2: Self-Service Reporting and Visualization on SuccessFactors Data

**Problem.** HR teams sit on rich SuccessFactors data (employee/user records and position structure) but getting a simple chart out of it (headcount by department, users by location, positions by status) usually means exporting to a spreadsheet or filing a request with an analyst. SuccessFactors exposes this data through OData APIs, so the raw material is accessible. What is missing is a lightweight tool that lets a non-technical HR user pull the data, shape it, and produce a chart they can hand to leadership, without touching a spreadsheet or an analyst.

**The challenge.** Build a lightweight reporting tool with three parts:

1. **Data connection and table view.** Let the user pull data from the two supported SuccessFactors OData objects (**User** and **Position**) with basic filtering, and display the result in a **data table**.
2. **Analyze and visualize (the core of this track).** Let the user build a chart from the pulled data:
   - Choose a chart type (**bar** or **pie** at minimum).
   - Choose the field to **group by** (the category / X axis).
   - Choose an **aggregation** (this is required, not optional): **count** of records per group is the baseline; **sum** or **average** must be available for any field that is genuinely numeric.
   - Render the chart from the aggregated result.
3. **Export.** Export the chart (and ideally the underlying table) as a **PDF**.

**Bonus: natural-language visualization.** This applies **only after data is already in the table**. The user types a request in plain language (for example, "headcount by department as a bar chart") and the app produces the corresponding chart spec (chart type, group-by field, aggregation) and renders it through the same chart engine. The NLP layer does not fetch or query data. It only drives the visualization step on data already pulled.

**What we actually care about (where the points are).** Connecting to the API and showing a table is the baseline. Every team will do it, so it does not separate anyone. The differentiator is the **analyze step**, and specifically **aggregation**. User and Position data is almost entirely categorical (department, location, job code, status, manager). A meaningful chart of this data is therefore an *aggregate*: count of users grouped by department, count of positions grouped by status, and so on. A tool that tries to plot raw individual rows on an X/Y plane produces nothing useful. We want to see correct group-by plus aggregation, with the user free to choose both.

**In scope:** connecting to the User and Position objects; basic filtering; data table view; a chart builder with bar and pie, user-selected group-by field, and a required aggregation step; PDF export. NLP visualization as bonus.

**Out of scope:** any commercial-BI-tool feature set (drag-and-drop calculated fields, linked dashboards, and so on); supporting SF objects other than User and Position; saved reports or scheduling; auth/SSO; production deployment; chart types beyond bar and pie unless time allows; using NLP to fetch or query data (the bonus is visualization only).

**Constraints.**

- Team size: [?]. Duration: 6 hours. Submission cutoff: [time + timezone].
- SuccessFactors access via OData on the shared preview tenant, **read-only** for this track. Teams get **real seeded User and Position data** with enough rows and variety to produce non-trivial charts.
- Any framework or chart library (Recharts, Chart.js, D3, Plotly, and so on). AI app builders and AI-assisted IDEs are permitted and encouraged.
- PDF export by any method (client-side or server-side).

**Deliverables.**

- **Live demo** (3-minute recorded video as fallback): pull data from both User and Position, build at least one bar chart and one pie chart using group-by plus aggregation, and export a chart to PDF. Demo the NLP path if attempted.
- **Public repo** with README and setup steps.
- **One short note**: which fields you support for grouping and aggregation on each object, and how your aggregation works.

**Judging criteria (weights):**

- **Analyze and visualize engine**, correct group-by plus aggregation (count baseline, sum/average where numeric), working bar and pie, sensible field selection: **35%**
- **Data connection, table, and filtering** against real SF OData (User and Position): **25%**
- **PDF export** quality and reliability: **15%**
- **Usability** for a non-technical HR user: **15%**
- **Demo and explanation:** **10%**
- **Bonus: natural-language visualization**, up to **+10%** (caps total at 100, treated as a topping/tiebreaker).

**Resources to provide (organizers):**

- SF OData docs and the specific endpoints for the **User** and **Position** objects.
- Sample credentials and real seeded data with enough volume and variety to chart (a handful of records makes for a meaningless pie chart, seed dozens across several departments, locations, and statuses).
- A per-object field guide marking which fields are **categorical** (valid for group-by) and which are genuinely **numeric** (valid for sum/average). This single doc saves teams from discovering the aggregation problem the hard way.
- The list of permitted AI tools.
- One example natural-language-to-chart-spec prompt for the bonus.

**Timeline (6h):**

- **H0**: Kickoff, distribute access, teams verify SF OData auth and a first data pull.
- **H1 checkpoint**: Every team can pull and display rows from at least one object (User or Position) in a table. (Catch OData auth and pagination failures early. This is the common silent killer.)
- **H3 checkpoint**: Chart engine renders one aggregated chart (group-by plus count).
- **H4:30 checkpoint**: Second chart type plus PDF export working.
- **H5:30**: Submission cutoff (repo plus video).
- **H6**: Live demos.

---

## 🔑 System Access — SAP SuccessFactors

> Shared sandbox test users for this track. These are **API-only** users (tell the organizers if you need to log in to the platform UI). **No RBP** is set — `VIEW` access can be granted on request. Coordinate within your track so two teams don't clash on the same user.

- **Company ID:** `SFCPART001143`
- **API base URL:** `https://apisalesdemo2.successfactors.eu`
- **Platform URL:** `https://salesdemo.successfactors.eu`

| User ID | Password |
| --- | --- |
| GLA_USER_1 | `Fjvezb333@` |
| GLA_USER_2 | `Slazbq716@` |
| GLA_USER_3 | `Ogvzmu646%` |
| GLA_USER_4 | `Kfigie159%` |
| GLA_USER_5 | `Krccqe829!` |
| GLA_USER_6 | `Cqjtyv502#` |
| GLA_USER_7 | `Azrfoq575@` |
| GLA_USER_8 | `Llteix995@` |
| GLA_USER_9 | `Wrcylw473%` |
| GLA_USER_10 | `Qggllf426!` |

---

_One of four hackathon tracks for the INTEGRTR × GLA Hackathon 2026. Your team has been assigned the track above — build against this problem statement._
