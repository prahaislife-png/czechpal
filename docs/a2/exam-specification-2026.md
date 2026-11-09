# Czech A2 exam for permanent residence: verified specification (2026)

Version 2 · 2026-11-09. Part 1 (the exam's format) was verified on 2026-11-06 and is kept in full in
[`docs/a2-academy/exam-spec-2026.md`](../a2-academy/exam-spec-2026.md); part 2 (the practical
side) was verified on 2026-11-09. Organiser: Národní pedagogický institut ČR (NPI ČR).

Machine-readable versions used by the app:
- `src/lib/learn/exam.ts`: parts, times, points, tasks, pass marks, word rules, retakes.
- `src/lib/learn/exam-guide.ts`: who needs it, exemptions, registration, deadlines, dates, fee,
  the exam day, after the exam.

Anything not found in the sources is listed under **Not verified** and isn't shown as a rule.

## Sources

| # | Source | URL | Checked |
|---|---|---|---|
| S1 | Official overview (English) | https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/ | 2026-11-06, 2026-11-09 |
| S2 | Exam preparation | https://cestina-pro-cizince.cz/trvaly-pobyt/a2/priprava-na-zkousku/ | 2026-11-06 |
| S3 | Handbook for candidates 2026 (Czech, 208 pp.) | https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/03/Prirucka_pro_uchazece_2026.pdf | 2026-11-06 |
| S4 | What to watch out for (Czech, 3 pp.) | https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/03/Na-co-si-dat-pozor_2026.pdf | 2026-11-06 |
| S5 | Model test, new format | https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2025/12/Modelovy-test-novy-format-A2-druhy.pdf | 2026-11-06 |
| G1 | Exam information (English) | https://cestina-pro-cizince.cz/trvaly-pobyt/a2/en/informace-ke-zkousce/ | 2026-11-09 |
| G2 | Information for applicants (English, 2026, 2 pp.) | https://cestina-pro-cizince.cz/trvaly-pobyt/wp-content/uploads/2026/04/Information_for_Applicants_EN_2026.pdf | 2026-11-09 |

The PDF links in the brief (`/2026/02/Prirucka…`, `/2026/03/na-co-si…`) return 404; S3 and S4 are
the current locations.

## Part 1: format (summary; full detail in the 2026-11-06 document)

| Part | Time | Points |
|---|---|---|
| Reading | 40 min | 25 (5 tasks, 25 items) |
| Writing | 25 min | 20 (form 8: 3 answers of 10+ words; e-mail 12: 35+ words, under 35 scores 0) |
| Listening | about 40 min | 25 (5 tasks, 25 items, each recording twice) |
| Speaking | at most 15 min | 40 (tasks 8 + 12 + 10 + 7, pronunciation 3) |

Pass: reading + writing + listening at least **42/70**, and speaking at least **24/40**. Failing
either means repeating the whole exam. (S1, S3, S5)

## Part 2: practical (verified 2026-11-09)

**Who must take it** (S1): non-EU/EEA nationals applying for permanent residence after 5 years of
residence, or holding an EU Blue Card, without an exemption; British citizens whose long-term
residence began after 31 December 2020.

**Exempt** (S1): EU/EEA citizens and British citizens resident before 31 December 2020; under 15 or
over 60; one school year (primary or secondary) or one academic year (university) in Czech within
the last 20 years; holders of listed Czech exams and certificates (school-leaving, state language
exam, state final/doctoral, CCE A2+, citizenship language exam, specialist exam for doctors,
dentists, pharmacists); a physical or mental disability affecting communication.

**Fee** (S1, G1): **CZK 3,200**. Each retake is paid (G2).

**Registration** (S1, G2):
1. Online registration, with a valid passport, **at least 14 days before** the exam.
2. Choosing no school is recommended; dates are allocated in order of registration where a place
   is free.
3. The date is e-mailed.
4. At the school, in person, **no later than 8 days before**: check and sign the application
   (nothing can be changed on the day) and pay.
- Withdrawal: in person or in writing **up to 15 days before**; later only for health or serious
  personal reasons, reported at once with written confirmation.

**Dates** (S1): three a month, Wednesday or Saturday, from 9:00. 34 dates listed from 11 Nov 2026
to 15 Dec 2027 (in `exam-guide.ts`; the app hides dates closer than the 14-day deadline).

**Exam day** (G2): arrive 30 minutes early (late: no exam that day, a new paid date); passport only;
a registration-number card; passport and card stay on the desk; phone off, bags and electronics put
away; written part about 110 minutes with instructions from a teacher and a video, a break after the
first hour, no leaving the room; the oral part the same day, at a set time, for those who pass the
written part.

**After** (G2, S3): results on the website or from the school **within 9 days**; certificate
collected or posted **within 30 days**; retake no sooner than **3 months**, at most **3 times a
year**, paid each time; papers and answer sheets can't be inspected.

## Not verified (not shown as rules)

- A per-answer time limit in speaking (the brief's 7 seconds) and a time limit for the picture
  story: not in S1–S5, G1–G2.
- The detailed marking scales for writing and speaking: S3 gives requirements, not scales. AI
  marks are labelled estimates.
- Payment methods; appeals; accommodations during the exam (only the exemption is stated); the
  certificate's validity in G1/G2 (S3 p.10–11 says it is valid without limit).
- Whether the oral part is held only after passing the written part in all schools: G2 says those
  who pass the written part are told their oral time; the app repeats this wording only.

## Copyright

All sources are references only. The app contains no copied model tests, texts, pictures or
recordings. Exercises are original and format-aligned; each records author, licence and review
status.
