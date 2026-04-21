// LexAI Document Format Service
// Bermuda Supreme Court & Commonwealth legal document templates

const FORMATS = {
  'bermuda-supreme': {
    name: 'Bermuda Supreme Court Pleading',
    buildHeader: (meta) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION

CASE NUMBER: ${meta.caseNo || '______ / 20__'}

IN THE MATTER OF ${meta.subject || '____________________________________'}

BETWEEN:

    ${meta.applicant || '____________________________________'}
                                                        Applicant/Plaintiff
    -and-

    ${meta.respondent || '____________________________________'}
                                                        Respondent/Defendant

${'─'.repeat(60)}

${(meta.docType || 'PLEADING').toUpperCase()}

${'─'.repeat(60)}
`,
    buildFooter: (meta) => `

Dated this ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}


_________________________________
${meta.party || 'Party'}
${meta.role || 'Applicant in Person'}
${meta.address || ''}
${meta.phone || ''}
${meta.email || ''}
`
  },

  'bermuda-cover': {
    name: 'Bermuda Court Cover Letter',
    buildHeader: (meta) => `${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

The Registrar
Supreme Court of Bermuda
Supreme Court Building
21 Parliament Street
Hamilton HM 12
Bermuda

RE: ${meta.caseNo || 'Case No. ______ / 20__'}
    ${meta.subject || '____________________________________'}

Dear Registrar,

`,
    buildFooter: (meta) => `
Yours faithfully,


_________________________________
${meta.party || 'Party'}
${meta.role || 'Applicant in Person'}

Address: ${meta.address || '____________________________________'}
Telephone: ${meta.phone || '____________________________________'}
Email: ${meta.email || '____________________________________'}
`
  },

  'bermuda-affidavit': {
    name: 'Bermuda Affidavit in Support',
    buildHeader: (meta) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION
CASE NUMBER: ${meta.caseNo || '______ / 20__'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Applicant
    -and-
    ${meta.respondent || '____________________________________'}  Respondent

${'─'.repeat(60)}
AFFIDAVIT IN SUPPORT OF APPLICATION
${'─'.repeat(60)}

I, ${meta.deponent || '____________________________________'}, of ${meta.address || '____________________________________'}, MAKE OATH AND SAY AS FOLLOWS:

1. I am the ${meta.role || 'Applicant'} in this matter and I make this affidavit in support of my application.

2. The facts stated herein are within my own knowledge and are true to the best of my knowledge, information, and belief.

`,
    buildFooter: (meta) => `

SWORN at Hamilton, Bermuda
this ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

Before me:

_________________________________          _________________________________
Commissioner for Oaths / Notary Public     ${meta.deponent || 'Deponent'}
`
  },

  'bermuda-skeleton': {
    name: 'Bermuda Skeleton Argument',
    buildHeader: (meta) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION
CASE NUMBER: ${meta.caseNo || '______ / 20__'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Applicant
    -and-
    ${meta.respondent || '____________________________________'}  Respondent

${'─'.repeat(60)}
SKELETON ARGUMENT IN SUPPORT OF APPLICATION
${'─'.repeat(60)}

I.  INTRODUCTION

`,
    sections: ['I. INTRODUCTION', 'II. FACTS', 'III. LEGAL FRAMEWORK', 'IV. SUBMISSIONS', 'V. RELIEF SOUGHT', 'VI. CONCLUSION'],
    buildFooter: (meta) => `

Respectfully submitted,


_________________________________
${meta.party || 'Party'}
${meta.role || 'Applicant in Person'}
Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'bermuda-submissions': {
    name: 'Supplemental Written Submissions',
    buildHeader: (meta) => `IN THE SUPREME COURT OF BERMUDA
CIVIL JURISDICTION
CASE NUMBER: ${meta.caseNo || '______ / 20__'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Applicant
    -and-
    ${meta.respondent || '____________________________________'}  Respondent

${'─'.repeat(60)}
SUPPLEMENTAL WRITTEN SUBMISSIONS
${'─'.repeat(60)}

I.  PURPOSE

`,
    buildFooter: (meta) => `

Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}


_________________________________
${meta.party || 'Party'}
${meta.role || 'Applicant in Person'}
`
  },

  'ccj-filing': {
    name: 'CCJ Court Filing',
    buildHeader: (meta) => `IN THE CARIBBEAN COURT OF JUSTICE
${meta.jurisdiction || 'APPELLATE JURISDICTION'}

CASE NUMBER: ${meta.caseNo || 'CCJ/AJ/__/__'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Appellant
    -and-
    ${meta.respondent || '____________________________________'}  Respondent

${'─'.repeat(60)}
${(meta.docType || 'SUBMISSION').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (meta) => `

Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${meta.party || 'Party'}
Counsel for the ${meta.role || 'Appellant'}
`
  },

  'privy-council': {
    name: 'Privy Council Appeal Format',
    buildHeader: (meta) => `IN THE JUDICIAL COMMITTEE OF THE PRIVY COUNCIL

ON APPEAL FROM THE COURT OF APPEAL OF ${(meta.jurisdiction || 'BERMUDA').toUpperCase()}

CASE NUMBER: ${meta.caseNo || 'JCPC _____ / 20__'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Appellant
    -and-
    ${meta.respondent || '____________________________________'}  Respondent

${'─'.repeat(60)}
${(meta.docType || 'CASE FOR THE APPELLANT').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (meta) => `

Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${meta.party || 'Party'}
Counsel for the ${meta.role || 'Appellant'}
`
  },

  'uk-pleading': {
    name: 'UK Court Pleading',
    buildHeader: (meta) => `IN THE ${(meta.court || 'HIGH COURT OF JUSTICE').toUpperCase()}
${meta.division || 'KING\'S BENCH DIVISION'}

CASE NUMBER: ${meta.caseNo || 'KB-20__-______'}

BETWEEN:
    ${meta.applicant || '____________________________________'}  Claimant
    -and-
    ${meta.respondent || '____________________________________'}  Defendant

${'─'.repeat(60)}
${(meta.docType || 'PARTICULARS OF CLAIM').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (meta) => `

Statement of Truth

I believe that the facts stated in this document are true.

_________________________________
Full name: ${meta.party || '____________________________________'}
Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}
`
  },

  'canlii-format': {
    name: 'Canadian Court Format',
    buildHeader: (meta) => `${meta.court || 'ONTARIO SUPERIOR COURT OF JUSTICE'}

COURT FILE NO.: ${meta.caseNo || '20__-____'}

BETWEEN:
    ${meta.applicant || '____________________________________'}\n\t\t\t\t\t\t\tApplicant/Plaintiff
    -and-
    ${meta.respondent || '____________________________________'}\n\t\t\t\t\t\t\tRespondent/Defendant

${'─'.repeat(60)}
${(meta.docType || 'FACTUM').toUpperCase()}
${'─'.repeat(60)}

`,
    buildFooter: (meta) => `

Date: ${meta.date || new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'})}

_________________________________
${meta.party || 'Party'}
${meta.role || 'Applicant in Person'}
`
  }
};

/**
 * Format a case law research result into a court document
 * @param {string} formatId - Format identifier
 * @param {object} meta - Document metadata (caseNo, parties, date, etc.)
 * @param {string} body - Main body content from case law search
 * @returns {string} Formatted document text
 */
function formatDocument(formatId, meta, body) {
  const fmt = FORMATS[formatId] || FORMATS['bermuda-supreme'];
  const header = fmt.buildHeader(meta);
  const footer = fmt.buildFooter(meta);
  return header + (body || '') + footer;
}

/**
 * List all available formats
 */
function listFormats() {
  return Object.entries(FORMATS).map(([id, f]) => ({ id, name: f.name }));
}

module.exports = { formatDocument, listFormats, FORMATS };
