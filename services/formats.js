// LexAI Document Format Service
// Jurisdiction-accurate legal document templates — researched & verified
// Covers: Bermuda, UK (all divisions), Canada (Federal + Ontario),
//         Caribbean (CCJ + Barbados + Jamaica + T&T),
//         JCPC/Privy Council, Australia (HCA + NSW + VIC + QLD + FCFCA)

const FORMATS = {

  // ─────────────────────────────────────────────────────────────
  // BERMUDA
  // ─────────────────────────────────────────────────────────────

  'bermuda-supreme': {
    name: 'Bermuda — Supreme Court Pleading',
    region: 'Bermuda',
    caseNoFormat: 'E.g. 2024: No. 123',
    buildHeader: (m) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION

CASE NUMBER: ${m.caseNo || '20__: No. ___'}

IN THE MATTER OF ${m.subject || '_______________________________'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant/Plaintiff
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent/Defendant

${'─'.repeat(60)}
${(m.docType || 'PLEADING').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Dated this ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}


_________________________________
${m.party || 'Party'}
${m.role || 'Applicant in Person'}
${m.address ? m.address + '\n' : ''}${m.phone ? 'Tel: ' + m.phone + '\n' : ''}${m.email ? 'Email: ' + m.email : ''}
`
  },

  'bermuda-cover': {
    name: 'Bermuda — Court Cover Letter',
    region: 'Bermuda',
    buildHeader: (m) => `${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

The Registrar
Supreme Court of Bermuda
Supreme Court Building
21 Parliament Street
Hamilton HM 12
Bermuda

Dear Registrar,

RE:  ${m.caseNo || 'Case No. 20__: No. ___'}
     ${m.subject || '_______________________________'}

`,
    buildFooter: (m) => `
Yours faithfully,


_________________________________
${m.party || 'Party'}
${m.role || 'Applicant in Person'}

Address:    ${m.address || '_______________________________'}
Telephone:  ${m.phone || '_______________________________'}
Email:      ${m.email || '_______________________________'}
`
  },

  'bermuda-affidavit': {
    name: 'Bermuda — Affidavit in Support',
    region: 'Bermuda',
    buildHeader: (m) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION

CASE NUMBER: ${m.caseNo || '20__: No. ___'}

BETWEEN:
        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-
        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
AFFIDAVIT IN SUPPORT OF APPLICATION
${'─'.repeat(60)}

I, ${m.deponent || '_______________________________'}, of ${m.address || '_______________________________'}, MAKE OATH AND SAY AS FOLLOWS:

1.  I am the ${m.role || 'Applicant'} in this matter and I make this affidavit in support of my application.

2.  The facts stated herein are within my own knowledge and are true to the best of my knowledge, information, and belief.

`,
    buildFooter: (m) => `

SWORN at Hamilton, Bermuda
this ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

Before me:

_________________________________     _________________________________
Commissioner for Oaths /              ${m.deponent || 'Deponent'}
Notary Public
`
  },

  'bermuda-skeleton': {
    name: 'Bermuda — Skeleton Argument',
    region: 'Bermuda',
    buildHeader: (m) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION

CASE NUMBER: ${m.caseNo || '20__: No. ___'}

BETWEEN:
        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-
        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
SKELETON ARGUMENT IN SUPPORT OF APPLICATION
${'─'.repeat(60)}

I.   INTRODUCTION

`,
    buildFooter: (m) => `

Respectfully submitted,


_________________________________
${m.party || 'Party'}
${m.role || 'Applicant in Person'}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'bermuda-submissions': {
    name: 'Bermuda — Supplemental Written Submissions',
    region: 'Bermuda',
    buildHeader: (m) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION

CASE NUMBER: ${m.caseNo || '20__: No. ___'}

BETWEEN:
        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-
        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
SUPPLEMENTAL WRITTEN SUBMISSIONS
${'─'.repeat(60)}

I.   PURPOSE

`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}


_________________________________
${m.party || 'Party'}
${m.role || 'Applicant in Person'}
`
  },

  // ─────────────────────────────────────────────────────────────
  // UK — HIGH COURT (KING'S BENCH DIVISION)
  // ─────────────────────────────────────────────────────────────

  'uk-kb': {
    name: "UK — High Court King's Bench Division",
    region: 'United Kingdom',
    caseNoFormat: 'KB-[YEAR]-[6 digits] e.g. KB-2024-001234',
    buildHeader: (m) => `IN THE HIGH COURT OF JUSTICE
KING'S BENCH DIVISION

Claim No: ${m.caseNo || 'KB-20__-______'}

BETWEEN:

                    ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Claimant
                    -and-

                    ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'PARTICULARS OF CLAIM').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Statement of Truth

I believe that the facts stated in this document are true.
I understand that proceedings for contempt of court may be brought
against anyone who makes, or causes to be made, a false statement
in a document verified by a statement of truth.

Signed: _________________________________
Full name: ${m.party || '_______________________________'}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'uk-chancery': {
    name: 'UK — High Court Chancery Division',
    region: 'United Kingdom',
    caseNoFormat: 'CH-[YEAR]-[6 digits] e.g. CH-2024-000456',
    buildHeader: (m) => `IN THE HIGH COURT OF JUSTICE
CHANCERY DIVISION

Claim No: ${m.caseNo || 'CH-20__-______'}

IN THE MATTER OF ${m.subject || '_______________________________'}
${m.actRef ? 'AND IN THE MATTER OF ' + m.actRef + '\n' : ''}
BETWEEN:

                    ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Claimant
                    -and-

                    ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'CLAIM FORM').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Statement of Truth

I believe that the facts stated in this document are true.

Signed: _________________________________
Full name: ${m.party || '_______________________________'}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'uk-judicial-review': {
    name: 'UK — High Court Judicial Review (Administrative Court)',
    region: 'United Kingdom',
    caseNoFormat: 'AC-[YEAR]-[6 digits] e.g. AC-2024-000123',
    buildHeader: (m) => `IN THE HIGH COURT OF JUSTICE
KING'S BENCH DIVISION
ADMINISTRATIVE COURT

Case No: ${m.caseNo || 'AC-20__-______'}

IN THE MATTER OF AN APPLICATION FOR JUDICIAL REVIEW

BETWEEN:

        THE KING (on the application of ${(m.applicant || '_______________________________').toUpperCase()})
                                                        Claimant
                    -and-

        ${(m.respondent || 'SECRETARY OF STATE FOR _______________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'GROUNDS FOR JUDICIAL REVIEW').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Statement of Truth

I believe that the facts stated in this document are true.

Signed: _________________________________
Full name: ${m.party || '_______________________________'}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'uk-court-of-appeal': {
    name: 'UK — Court of Appeal',
    region: 'United Kingdom',
    caseNoFormat: 'CA-[YEAR]-[6 digits] e.g. CA-2024-001234',
    buildHeader: (m) => `IN THE COURT OF APPEAL
${(m.division || 'CIVIL DIVISION').toUpperCase()}

Case No: ${m.caseNo || 'CA-20__-______'}

ON APPEAL FROM THE ${(m.fromCourt || 'HIGH COURT OF JUSTICE').toUpperCase()}
${m.fromJudge ? '(The Honourable ' + m.fromJudge + ')\n' : ''}${m.fromRef ? '[Claim No: ' + m.fromRef + ']\n' : ''}
BETWEEN:

                    ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Appellant
                    -and-

                    ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || "APPELLANT'S NOTICE").toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Signed: _________________________________
${m.party || 'Party'}, ${m.role || 'Appellant in Person'}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'uk-supreme-court': {
    name: 'UK — Supreme Court',
    region: 'United Kingdom',
    caseNoFormat: 'UKSC [YEAR]/[4 digits] e.g. UKSC 2024/0123',
    buildHeader: (m) => `IN THE SUPREME COURT OF THE UNITED KINGDOM

Case ID: ${m.caseNo || 'UKSC 20__/____'}

ON APPEAL FROM THE ${(m.fromCourt || 'COURT OF APPEAL (CIVIL DIVISION)').toUpperCase()}
${m.fromRef ? '[Court of Appeal Ref: ' + m.fromRef + ']\n' : ''}
BETWEEN:

                    ${(m.applicant || '_______________________________').toUpperCase()}
                                                        (Appellant)
                    -and-

                    ${(m.respondent || '_______________________________').toUpperCase()}
                                                        (Respondent)

${'─'.repeat(60)}
${(m.docType || 'PRINTED CASE FOR THE APPELLANT').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Signed: _________________________________
${m.counsel || m.party || 'Counsel / Party'}
${m.chambers ? m.chambers + '\n' : ''}${m.address ? m.address + '\n' : ''}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  // ─────────────────────────────────────────────────────────────
  // CANADA
  // ─────────────────────────────────────────────────────────────

  'canada-federal': {
    name: 'Canada — Federal Court',
    region: 'Canada',
    caseNoFormat: 'T-[number]-[YY] e.g. T-1234-24',
    buildHeader: (m) => `                    Federal Court
                 Cour fédérale

Date: ${m.date ? new Date(m.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}               Docket: ${m.caseNo || 'T-____-__'}

Ottawa, Ontario

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-

        ${(m.respondent || 'ATTORNEY GENERAL OF CANADA').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || 'NOTICE OF APPLICATION FOR JUDICIAL REVIEW').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

SWORN BEFORE ME at the City
of ${m.city || '_______'}, Province of ${m.province || '_______'},
this ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}.

_________________________________     _________________________________
A Commissioner for Oaths /            Deponent
Notary Public in and for
${m.province || '_______________'}
`
  },

  'canada-ontario': {
    name: 'Canada — Ontario Superior Court of Justice',
    region: 'Canada',
    caseNoFormat: 'CV-[YY]-[7 digits] e.g. CV-24-0012345',
    buildHeader: (m) => `                ONTARIO
       SUPERIOR COURT OF JUSTICE

Court File No.: ${m.caseNo || 'CV-__-_______'}

B E T W E E N:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Plaintiff
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'STATEMENT OF CLAIM').toUpperCase()}
${'─'.repeat(60)}

TO THE DEFENDANT:

A LEGAL PROCEEDING HAS BEEN COMMENCED AGAINST YOU by the
Plaintiff. The claim made against you is set out in the following
pages.

IF YOU WISH TO DEFEND THIS PROCEEDING, you or an Ontario
lawyer acting for you must prepare a Statement of Defence in
Form 18A prescribed by the Rules of Civil Procedure, serve it on
the Plaintiff's lawyer or, where the Plaintiff does not have a
lawyer, serve it on the Plaintiff, and file it, with proof of
service, in this court office, WITHIN TWENTY DAYS after this
Statement of Claim is served on you, if you are served in Ontario.

`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

Issued by: _________________________________
           Local Registrar
           Address of
           court office: ${m.courtAddress || '_______________________________'}

_________________________________
${m.party || 'Party'}
${m.role || 'Plaintiff in Person'}
${m.address || ''}
`
  },

  'canada-ontario-factum': {
    name: 'Canada — Ontario Court of Appeal Factum',
    region: 'Canada',
    caseNoFormat: 'C[6 digits] e.g. C123456',
    buildHeader: (m) => `                ONTARIO
       COURT OF APPEAL FOR ONTARIO

Court of Appeal File No.: ${m.caseNo || 'C______'}

${m.appealFrom ? 'IN THE MATTER OF AN APPEAL from the Order of the Honourable\n' + m.appealFrom + '\n\n' : ''}B E T W E E N:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Appellant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || "APPELLANT'S FACTUM").toUpperCase()}
${'─'.repeat(60)}

${m.firm ? m.firm + '\n' : ''}${m.firmAddress ? m.firmAddress + '\n' : ''}${m.counsel ? 'Counsel for the ' + (m.role || 'Appellant') : ''}

        PART I   — OVERVIEW
        PART II  — FACTS
        PART III — ISSUES
        PART IV  — ARGUMENT
        PART V   — ORDER REQUESTED
        SCHEDULE A — TABLE OF AUTHORITIES

`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${m.counsel || m.party || 'Counsel / Party'}
${m.role || 'Appellant in Person'}
`
  },

  // ─────────────────────────────────────────────────────────────
  // CARIBBEAN COURT OF JUSTICE (CCJ)
  // ─────────────────────────────────────────────────────────────

  'ccj-original': {
    name: 'CCJ — Original Jurisdiction (CSME Treaty Rights)',
    region: 'Caribbean',
    caseNoFormat: 'OA/[YEAR]/[3 digits] e.g. OA/2024/001',
    buildHeader: (m) => `IN THE CARIBBEAN COURT OF JUSTICE
(ORIGINAL JURISDICTION)

CCJ Application No: ${m.caseNo || 'OA/20__/___'}

IN THE MATTER OF THE REVISED TREATY OF CHAGUARAMAS

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-

        ${(m.respondent || 'THE STATE OF _______________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || 'ORIGINATING APPLICATION').toUpperCase()}
${'─'.repeat(60)}

The Applicant ${m.applicant || '_______________________________'} applies to this Honourable Court for:

`,
    buildFooter: (m) => `

Filed by:
${m.firm || '_______________________________'}
${m.address || '_______________________________'}
Attorneys-at-Law for the Applicant

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'ccj-appeal': {
    name: 'CCJ — Appellate Jurisdiction',
    region: 'Caribbean',
    caseNoFormat: 'BBCV[YEAR]/[3digits] (Barbados), TTCV[YEAR]/[3digits] (T&T), GYCV[YEAR]/[3digits] (Guyana)',
    buildHeader: (m) => `IN THE CARIBBEAN COURT OF JUSTICE
(APPELLATE JURISDICTION)

CCJ Application No: ${m.caseNo || 'BBCV20__/___'}

ON APPEAL FROM THE COURT OF APPEAL OF ${(m.fromJurisdiction || 'BARBADOS').toUpperCase()}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Appellant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || 'NOTICE OF APPEAL').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${m.party || 'Party'}
Counsel for the ${m.role || 'Appellant'}
`
  },

  // ─────────────────────────────────────────────────────────────
  // PRIVY COUNCIL (JCPC)
  // ─────────────────────────────────────────────────────────────

  'privy-council': {
    name: 'Privy Council — JCPC Appeal',
    region: 'Privy Council',
    caseNoFormat: 'JCPC [YEAR]/[4 digits] e.g. JCPC 2024/0045',
    note: 'Filing requirements: Form JCPC 1 | 56-day window | £25,000 security for costs | Special leave required',
    buildHeader: (m) => `IN THE JUDICIAL COMMITTEE
OF THE PRIVY COUNCIL

ON APPEAL FROM THE COURT OF APPEAL OF ${(m.fromJurisdiction || 'BERMUDA').toUpperCase()}

Privy Council Appeal No: ${m.caseNo || 'JCPC 20__/____'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Appellant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || 'CASE FOR THE APPELLANT').toUpperCase()}
${'─'.repeat(60)}

[Note: Filed on Form JCPC 1. Security for costs £25,000 required.
Time limit: 56 days from judgment below.]

`,
    buildFooter: (m) => `

${m.counsel || m.party || 'Counsel'}
${m.chambers ? m.chambers + '\n' : ''}${m.address ? m.address + '\n' : ''}${m.phone ? 'Tel: ' + m.phone + '\n' : ''}${m.email ? 'Email: ' + m.email + '\n' : ''}
${m.solicitor ? m.solicitor + '\nAgents for the Appellant' : 'Agents for the Appellant'}
`
  },

  // ─────────────────────────────────────────────────────────────
  // BARBADOS — SUPREME COURT
  // ─────────────────────────────────────────────────────────────

  'barbados-supreme': {
    name: 'Barbados — Supreme Court',
    region: 'Caribbean',
    caseNoFormat: 'CV[YEAR]-[4 digits] e.g. CV2024-0456',
    buildHeader: (m) => `IN THE SUPREME COURT OF BARBADOS

Claim No: ${m.caseNo || 'CV20__-____'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Claimant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'CLAIM FORM').toUpperCase()}
${'─'.repeat(60)}

_________________________
Registrar, Supreme Court of Barbados

Issued: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
Address for filing: Supreme Court Registry,
Whitepark Road, Bridgetown, Barbados

`,
    buildFooter: (m) => `

SWORN to at ${m.city || 'Bridgetown'}              )
this ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}   )
                                    )
                                    )  _________________________________
Before me:                                   Deponent / ${m.party || 'Party'}

_________________________________
Justice of the Peace / Notary Public
`
  },

  // ─────────────────────────────────────────────────────────────
  // JAMAICA — SUPREME COURT OF JUDICATURE
  // ─────────────────────────────────────────────────────────────

  'jamaica-supreme': {
    name: 'Jamaica — Supreme Court of Judicature',
    region: 'Caribbean',
    caseNoFormat: '[YEAR] HCV [5 digits] e.g. 2024 HCV 01234 (year-first)',
    buildHeader: (m) => `IN THE SUPREME COURT OF JUDICATURE OF JAMAICA

Claim No: ${m.caseNo || '20__ HCV _____'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Claimant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'CLAIM FORM').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (m) => `

[Court Registry Stamp — Date Issued]

_________________________________
${m.party || 'Attorney-at-Law'}
${m.role || 'Attorney-at-Law for the Claimant'}
${m.address || ''}
Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

Note: All filed documents must bear the Court Registry stamp.
`
  },

  // ─────────────────────────────────────────────────────────────
  // TRINIDAD & TOBAGO — HIGH COURT
  // ─────────────────────────────────────────────────────────────

  'trinidad-high-court': {
    name: 'Trinidad & Tobago — High Court of Justice',
    region: 'Caribbean',
    caseNoFormat: 'CV[YEAR]-[5 digits] e.g. CV2024-01234',
    buildHeader: (m) => `THE REPUBLIC OF TRINIDAD AND TOBAGO
IN THE HIGH COURT OF JUSTICE

Claim No: ${m.caseNo || 'CV20__-_____'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Claimant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'CLAIM FORM').toUpperCase()}
${'─'.repeat(60)}

Filed at the Registry of the Supreme Court of Judicature
Port of Spain, Trinidad

By: ${m.firm || m.party || '_______________________________'}
    Attorneys-at-Law for the Claimant

`,
    buildFooter: (m) => `

SWORN to at Port of Spain              )
in the Republic of Trinidad and Tobago )
this ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}      )
                                       ) _________________________________
Before me:                                      Deponent / ${m.party || 'Party'}

_________________________________
Commissioner for Oaths / Notary Public
`
  },

  // ─────────────────────────────────────────────────────────────
  // AUSTRALIA
  // ─────────────────────────────────────────────────────────────

  'australia-hca': {
    name: 'Australia — High Court (HCA)',
    region: 'Australia',
    caseNoFormat: 'S[n]/[YEAR] (Sydney), M[n]/[YEAR] (Melbourne), B[n]/[YEAR] (Brisbane)',
    buildHeader: (m) => `IN THE HIGH COURT OF AUSTRALIA
${m.bench ? m.bench.toUpperCase() : 'FULL COURT'}

File No: ${m.caseNo || 'S___/20__'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant / Plaintiff
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent / Defendant

${'─'.repeat(60)}
${(m.docType || 'ORIGINATING APPLICATION').toUpperCase()}
${'─'.repeat(60)}

${m.jurisdiction ? '[Under ' + m.jurisdiction + ']\n' : '[Under s.75 of the Constitution / s.39B Judiciary Act 1903]\n'}
`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

Solicitor for the Applicant:
${m.solicitor || '_______________________________'}
${m.firm ? m.firm + '\n' : ''}${m.address ? m.address + '\n' : ''}${m.phone ? 'Tel: ' + m.phone + '\n' : ''}${m.email ? 'Email: ' + m.email : ''}
`
  },

  'australia-nsw': {
    name: 'Australia — NSW Supreme Court',
    region: 'Australia',
    caseNoFormat: '[YEAR]/[6 digits] e.g. 2024/123456',
    buildHeader: (m) => `IN THE SUPREME COURT OF NEW SOUTH WALES
${(m.division || 'COMMON LAW DIVISION').toUpperCase()}

Proceedings No: ${m.caseNo || '20__/______'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Plaintiff
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Defendant

${'─'.repeat(60)}
${(m.docType || 'STATEMENT OF CLAIM').toUpperCase()}
${'─'.repeat(60)}

[Under the Civil Procedure Act 2005 (NSW)]

`,
    buildFooter: (m) => `

Sworn at ${m.city || '_______'}
on ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
Deponent / ${m.party || 'Party'}

Before me:
_________________________________
${m.witnessName || '_______________________________'}
[Capacity — solicitor of the Supreme Court of NSW /
Justice of the Peace (JP No: ${m.jpNo || '______'})]
`
  },

  'australia-fcfca': {
    name: 'Australia — Federal Circuit & Family Court (Divorce)',
    region: 'Australia',
    caseNoFormat: 'MEL20240123FC (Melbourne), SYD20240456FC (Sydney)',
    buildHeader: (m) => `IN THE FEDERAL CIRCUIT AND FAMILY COURT OF AUSTRALIA
(DIVISION 2)

File No: ${m.caseNo || 'MEL20______FC'}

BETWEEN:

        ${(m.applicant || '_______________________________').toUpperCase()}
                                                        Applicant
        -and-

        ${(m.respondent || '_______________________________').toUpperCase()}
                                                        Respondent

${'─'.repeat(60)}
${(m.docType || 'APPLICATION FOR DIVORCE ORDER').toUpperCase()}
${'─'.repeat(60)}

[Under s.48 Family Law Act 1975 (Cth)]

Grounds: The parties have been separated for a continuous period
of not less than twelve months.

`,
    buildFooter: (m) => `

Date: ${m.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${m.party || 'Applicant'}
${m.role || 'Applicant in Person'}
${m.address || ''}
`
  }

}

/**
 * Format a document using jurisdiction-accurate template
 * @param {string} formatId
 * @param {object} meta - caseNo, applicant, respondent, date, party, role, etc.
 * @param {string} body - Main body content
 * @returns {string}
 */
function formatDocument(formatId, meta, body) {
  const fmt = FORMATS[formatId] || FORMATS['bermuda-supreme']
  return fmt.buildHeader(meta) + (body || '') + fmt.buildFooter(meta)
}

/**
 * List all available formats grouped by region
 */
function listFormats() {
  const grouped = {}
  for (const [id, f] of Object.entries(FORMATS)) {
    const region = f.region || 'Other'
    if (!grouped[region]) grouped[region] = []
    grouped[region].push({ id, name: f.name, caseNoFormat: f.caseNoFormat || '', note: f.note || '' })
  }
  return grouped
}

module.exports = { formatDocument, listFormats, FORMATS }
