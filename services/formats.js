/**
 * LexAI — Legal Document Formatting Service
 * formats.js — Multi-Jurisdiction Court Document Templates
 *
 * Covers: UK (High Court KB/Ch/Fam, CoA, UKSC), Canada (Federal, Ontario),
 *         CCJ (Original & Appellate), JCPC, Barbados, Jamaica, Trinidad & Tobago,
 *         Australia (HCA, NSW, VIC, QLD, FCFCA),
 *         Asia: Singapore (SGHC, SGCA, SICC), Hong Kong (CFA, CA, CFI),
 *               India (SCI, Bombay HC, Delhi HC, Madras HC, Calcutta HC),
 *               Malaysia (Federal Court, CA, HC), Sri Lanka (SC),
 *               Pakistan (SC), Philippines (SC)
 *
 * Document types: Claim Form, Affidavit, Witness Statement, Order, Divorce/Matrimonial,
 *                 Children/Family, Insurance Claim, Notice of Appeal, Injunction Application,
 *                 Originating Application, Judicial Review
 *
 * Sources: UK CPR 1998; FPR 2010; UKSC PDs; Federal Courts Rules SOR/98-106;
 *          Ontario RCP RRO 1990 Reg 194; CCJ Rules 2015; JCPC PDs 2009;
 *          Barbados CPR 2008; Jamaica CPR 2002; T&T CPR 1998;
 *          HCA Rules 2004; UCPR 2005 (NSW); SC (GCP) Rules 2015 (Vic); UCPR 1999 (Qld);
 *          SG ROC 2021 (S914/2021); HK RHC Cap 4A; India SC Rules 2013;
 *          Malaysia ROC 2012 [PU(A) 205/2012]; Sri Lanka SC Rules 1990;
 *          Pakistan SC Rules 1980; Philippines Rules of Court (2019 Amendments)
 */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// JURISDICTION REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
const JURISDICTIONS = {

  // ── UNITED KINGDOM ──────────────────────────────────────────────────────
  'uk-kb': {
    id: 'uk-kb',
    label: 'UK High Court — King\'s Bench Division',
    country: 'UK',
    courtLine1: 'IN THE HIGH COURT OF JUSTICE',
    courtLine2: "KING'S BENCH DIVISION",
    caseRefLabel: 'Claim No',
    caseNumberFormat: 'KB-[YEAR]-[6 digits]  e.g. KB-2024-001234',
    caseNumberExample: 'KB-2024-001234',
    neutralCitation: '[YEAR] EWHC [number] (KB)',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    alternativeParties: { appeal: ['Appellant', 'Respondent'], judicialReview: ['Claimant', 'Defendant'] },
    separator: '-and-',
    legalRepTitle: 'Solicitor / Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    witnessStatementVerification: 'I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth.',
    courtAddress: 'Royal Courts of Justice, Strand, London WC2A 2LL',
    currency: 'GBP',
    rules: 'Civil Procedure Rules 1998 (CPR); Practice Direction 7A'
  },

  'uk-ch': {
    id: 'uk-ch',
    label: 'UK High Court — Chancery Division',
    country: 'UK',
    courtLine1: 'IN THE HIGH COURT OF JUSTICE',
    courtLine2: 'CHANCERY DIVISION',
    caseRefLabel: 'Claim No',
    caseNumberExample: 'CH-2024-000456',
    neutralCitation: '[YEAR] EWHC [number] (Ch)',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Solicitor / Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    courtAddress: 'Rolls Building, Fetter Lane, London EC4A 1NL',
    currency: 'GBP',
    rules: 'Civil Procedure Rules 1998 (CPR); Practice Direction 57AA'
  },

  'uk-fam': {
    id: 'uk-fam',
    label: 'UK — Family Court / High Court Family Division',
    country: 'UK',
    courtLine1: 'IN THE FAMILY COURT',
    courtLine2: null,
    courtSuffix: 'sitting at [Court name]',
    caseRefLabel: 'Case No',
    caseNumberExample: '[YEAR]D[5 digits]  e.g. 2024D01234',
    defaultParty1: 'Applicant',
    defaultParty2: 'Respondent',
    divorceParty1: 'Applicant',
    divorceParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Solicitor / Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    note: 'Post-April 2022: Divorce, Dissolution and Separation Act 2020. No-fault divorce. Applicant/Respondent (not Petitioner).',
    currency: 'GBP',
    rules: 'Family Procedure Rules 2010 (FPR); Divorce, Dissolution and Separation Act 2020'
  },

  'uk-coa': {
    id: 'uk-coa',
    label: 'UK Court of Appeal (Civil Division)',
    country: 'UK',
    courtLine1: 'IN THE COURT OF APPEAL',
    courtLine2: 'CIVIL DIVISION',
    caseRefLabel: 'Case No',
    caseNumberExample: 'CA-2024-001234',
    neutralCitation: '[YEAR] EWCA Civ [number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    currency: 'GBP',
    rules: 'CPR Part 52; Practice Direction 52A–52E'
  },

  'uk-sc': {
    id: 'uk-sc',
    label: 'UK Supreme Court',
    country: 'UK',
    courtLine1: 'IN THE SUPREME COURT OF THE UNITED KINGDOM',
    courtLine2: null,
    caseRefLabel: 'Case ID',
    caseNumberExample: 'UKSC 2024/0123',
    neutralCitation: '[YEAR] UKSC [number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel',
    courtAddress: 'Parliament Square, London SW1P 3BD',
    currency: 'GBP',
    rules: 'Supreme Court Rules 2009 (SI 2009/1603); UKSC Practice Directions 1–13'
  },

  // ── CANADA ───────────────────────────────────────────────────────────────
  'ca-fed': {
    id: 'ca-fed',
    label: 'Canada — Federal Court',
    country: 'Canada',
    courtLine1: 'Federal Court',
    courtLine2: 'Cour fédérale',
    caseRefLabel: 'Docket',
    caseNumberExample: 'T-1234-24  |  IMM-5678-24',
    defaultParty1: 'Applicant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel / Avocat',
    affidavitVerification: 'MAKE OATH AND SAY',
    bilingual: true,
    courtAddress: '90 Sparks Street, Ottawa, Ontario  K1A 0H9',
    currency: 'CAD',
    rules: 'Federal Courts Rules SOR/98-106'
  },

  'ca-on': {
    id: 'ca-on',
    label: 'Canada — Ontario Superior Court of Justice',
    country: 'Canada',
    courtLine1: 'ONTARIO',
    courtLine2: 'SUPERIOR COURT OF JUSTICE',
    caseRefLabel: 'Court File No',
    caseNumberExample: 'CV-24-0012345',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    currency: 'CAD',
    rules: 'Rules of Civil Procedure RRO 1990 Reg 194 (Ontario)'
  },

  'ca-on-fam': {
    id: 'ca-on-fam',
    label: 'Canada — Ontario Superior Court of Justice (Family)',
    country: 'Canada',
    courtLine1: 'ONTARIO',
    courtLine2: 'SUPERIOR COURT OF JUSTICE',
    courtLine3: '(FAMILY COURT BRANCH)',
    caseRefLabel: 'Court File No',
    caseNumberExample: 'FC-24-0056789',
    defaultParty1: 'Applicant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel',
    affidavitVerification: 'MAKE OATH AND SAY',
    currency: 'CAD',
    rules: 'Ontario Family Law Rules O Reg 114/99; Divorce Act RSC 1985 c 3'
  },

  'ca-on-coa': {
    id: 'ca-on-coa',
    label: 'Canada — Court of Appeal for Ontario',
    country: 'Canada',
    courtLine1: 'ONTARIO',
    courtLine2: 'COURT OF APPEAL FOR ONTARIO',
    caseRefLabel: 'Court of Appeal File No',
    caseNumberExample: 'C123456',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel',
    currency: 'CAD',
    rules: 'Rules of Civil Procedure Rule 61; Court of Appeal Rules'
  },

  // ── CARIBBEAN COURT OF JUSTICE ───────────────────────────────────────────
  'ccj-orig': {
    id: 'ccj-orig',
    label: 'Caribbean Court of Justice — Original Jurisdiction',
    country: 'CCJ',
    courtLine1: 'IN THE CARIBBEAN COURT OF JUSTICE',
    courtLine2: '(ORIGINAL JURISDICTION)',
    caseRefLabel: 'CCJ Application No',
    caseNumberExample: 'OA/2024/001',
    caseNumberFormat: 'OA/[YEAR]/[3 digits]',
    defaultParty1: 'Applicant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'make oath and say',
    courtAddress: '134 Henry Street, Port of Spain, Trinidad and Tobago',
    currency: 'USD',
    rules: 'Caribbean Court of Justice (Original Jurisdiction) Rules 2015; Revised Treaty of Chaguaramas'
  },

  'ccj-app': {
    id: 'ccj-app',
    label: 'Caribbean Court of Justice — Appellate Jurisdiction',
    country: 'CCJ',
    courtLine1: 'IN THE CARIBBEAN COURT OF JUSTICE',
    courtLine2: '(APPELLATE JURISDICTION)',
    caseRefLabel: 'CCJ Appeal No',
    caseNumberExample: 'BBCV2024/001  |  TTCV2024/001',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'make oath and say',
    courtAddress: '134 Henry Street, Port of Spain, Trinidad and Tobago',
    currency: 'USD',
    rules: 'Caribbean Court of Justice (Appellate Jurisdiction) Rules 2015'
  },

  // ── JUDICIAL COMMITTEE OF THE PRIVY COUNCIL ─────────────────────────────
  'jcpc': {
    id: 'jcpc',
    label: 'Judicial Committee of the Privy Council (JCPC)',
    country: 'JCPC',
    courtLine1: 'IN THE JUDICIAL COMMITTEE',
    courtLine2: 'OF THE PRIVY COUNCIL',
    caseRefLabel: 'Privy Council Appeal No',
    caseNumberExample: 'JCPC 2024/0045',
    neutralCitation: '[YEAR] UKPC [number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Counsel (via London Agents)',
    affidavitVerification: 'MAKE OATH AND SAY',
    securityForCosts: '£25,000',
    timeLimit: '56 days from judgment below',
    courtAddress: 'Parliament Square, London SW1P 3BD',
    currency: 'GBP',
    rules: 'Judicial Committee (General Appellate Jurisdiction) Rules Order 2009 (SI 2009/224); JCPC Practice Directions 1–10'
  },

  // ── BARBADOS ──────────────────────────────────────────────────────────────
  'bb-sc': {
    id: 'bb-sc',
    label: 'Barbados — Supreme Court',
    country: 'Barbados',
    courtLine1: 'IN THE SUPREME COURT OF BARBADOS',
    courtLine2: null,
    caseRefLabel: 'Claim No',
    caseNumberExample: 'CV2024-0456',
    caseNumberFormat: 'CV[YEAR]-[4 digits]',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'MAKE OATH AND SAY as follows',
    courtAddress: 'Whitepark Road, Bridgetown, Barbados',
    currency: 'BBD',
    rules: 'Civil Procedure Rules 2008 (Barbados CPR)'
  },

  'bb-fam': {
    id: 'bb-fam',
    label: 'Barbados — Supreme Court (Family Division / Divorce)',
    country: 'Barbados',
    courtLine1: 'IN THE SUPREME COURT OF BARBADOS',
    courtLine2: '(FAMILY DIVISION)',
    caseRefLabel: 'Divorce No',
    caseNumberExample: 'DM2024-0089',
    caseNumberFormat: 'DM[YEAR]-[4 digits]',
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'MAKE OATH AND SAY as follows',
    courtAddress: 'Whitepark Road, Bridgetown, Barbados',
    currency: 'BBD',
    rules: 'Divorce Act Cap. 214, Laws of Barbados; Domestic Violence (Protection Orders) Act Cap. 130A'
  },

  // ── JAMAICA ───────────────────────────────────────────────────────────────
  'jm-sc': {
    id: 'jm-sc',
    label: 'Jamaica — Supreme Court of Judicature',
    country: 'Jamaica',
    courtLine1: 'IN THE SUPREME COURT OF JUDICATURE OF JAMAICA',
    courtLine2: null,
    caseRefLabel: 'Claim No',
    caseNumberExample: '2024 HCV 01234',
    caseNumberFormat: '[YEAR] HCV [5 digits]',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'make oath and say as follows',
    courtAddress: 'Public Buildings East, King Street, Kingston, Jamaica',
    currency: 'JMD',
    rules: 'Civil Procedure Rules 2002 (Jamaica CPR)'
  },

  'jm-mat': {
    id: 'jm-mat',
    label: 'Jamaica — Supreme Court (Matrimonial Division)',
    country: 'Jamaica',
    courtLine1: 'IN THE SUPREME COURT OF JUDICATURE OF JAMAICA',
    courtLine2: '(MATRIMONIAL DIVISION)',
    caseRefLabel: 'Matrimonial Cause No',
    caseNumberExample: '2024 MC 0078',
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'make oath and say as follows',
    courtAddress: 'Public Buildings East, King Street, Kingston, Jamaica',
    currency: 'JMD',
    rules: 'Matrimonial Causes Act (Jamaica); Civil Procedure Rules 2002'
  },

  // ── TRINIDAD & TOBAGO ─────────────────────────────────────────────────────
  'tt-hc': {
    id: 'tt-hc',
    label: 'Trinidad & Tobago — High Court of Justice',
    country: 'Trinidad and Tobago',
    courtLine1: 'THE REPUBLIC OF TRINIDAD AND TOBAGO',
    courtLine2: 'IN THE HIGH COURT OF JUSTICE',
    caseRefLabel: 'Claim No',
    caseNumberExample: 'CV2024-01234',
    caseNumberFormat: 'CV[YEAR]-[5 digits]',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'MAKE OATH AND SAY',
    courtAddress: 'Knox Street, Port of Spain, Trinidad and Tobago',
    currency: 'TTD',
    rules: 'Civil Proceedings Rules 1998 (T&T CPR); Supreme Court of Judicature Act Chap. 4:01'
  },

  'tt-fam': {
    id: 'tt-fam',
    label: 'Trinidad & Tobago — High Court (Family Division / Divorce)',
    country: 'Trinidad and Tobago',
    courtLine1: 'THE REPUBLIC OF TRINIDAD AND TOBAGO',
    courtLine2: 'IN THE HIGH COURT OF JUSTICE',
    courtLine3: '(FAMILY DIVISION)',
    caseRefLabel: 'Matrimonial Cause No',
    caseNumberExample: 'MA2024-0056',
    caseNumberFormat: 'MA[YEAR]-[4 digits]',
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'MAKE OATH AND SAY',
    courtAddress: 'Knox Street, Port of Spain, Trinidad and Tobago',
    currency: 'TTD',
    rules: 'Matrimonial Proceedings and Property Act Chap. 45:51; Children Act 2012'
  },

  // ── AUSTRALIA ─────────────────────────────────────────────────────────────
  'au-hca': {
    id: 'au-hca',
    label: 'Australia — High Court of Australia',
    country: 'Australia',
    courtLine1: 'IN THE HIGH COURT OF AUSTRALIA',
    courtLine2: null,
    caseRefLabel: 'File No',
    caseNumberExample: 'S125/2024  |  M67/2024  |  B45/2024',
    neutralCitation: '[YEAR] HCA [number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Solicitor',
    affidavitVerification: 'state on oath',
    courtAddress: 'Parkes Place, Canberra ACT 2600',
    currency: 'AUD',
    rules: 'High Court Rules 2004 (Cth)'
  },

  'au-nsw': {
    id: 'au-nsw',
    label: 'Australia — Supreme Court of New South Wales',
    country: 'Australia',
    courtLine1: 'IN THE SUPREME COURT OF NEW SOUTH WALES',
    courtLine2: null,
    caseRefLabel: 'Proceedings No',
    caseNumberExample: '2024/123456',
    neutralCitation: '[YEAR] NSWSC [number]',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Solicitor',
    affidavitVerification: 'state on oath',
    courtAddress: 'Queens Square, Sydney NSW 2000',
    currency: 'AUD',
    rules: 'Uniform Civil Procedure Rules 2005 (NSW); Civil Procedure Act 2005 (NSW)'
  },

  'au-vic': {
    id: 'au-vic',
    label: 'Australia — Supreme Court of Victoria',
    country: 'Australia',
    courtLine1: 'IN THE SUPREME COURT OF VICTORIA',
    courtLine2: null,
    caseRefLabel: 'Proceedings No',
    caseNumberExample: 'S CI 2024-012345',
    neutralCitation: '[YEAR] VSC [number]',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Solicitor',
    affidavitVerification: 'state on oath',
    courtAddress: '210 William Street, Melbourne VIC 3000',
    currency: 'AUD',
    rules: 'Supreme Court (General Civil Procedure) Rules 2015 (Vic)'
  },

  'au-qld': {
    id: 'au-qld',
    label: 'Australia — Supreme Court of Queensland',
    country: 'Australia',
    courtLine1: 'IN THE SUPREME COURT OF QUEENSLAND',
    courtLine2: null,
    caseRefLabel: 'Proceedings No',
    caseNumberExample: 'BS2024/12345',
    neutralCitation: '[YEAR] QSC [number]',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    separator: '-and-',
    legalRepTitle: 'Solicitor',
    affidavitVerification: 'state on oath',
    courtAddress: 'George Street, Brisbane QLD 4000',
    currency: 'AUD',
    rules: 'Uniform Civil Procedure Rules 1999 (Qld)'
  },

  'au-fcfca': {
    id: 'au-fcfca',
    label: 'Australia — Federal Circuit and Family Court (Divorce/Family)',
    country: 'Australia',
    courtLine1: 'IN THE FEDERAL CIRCUIT AND FAMILY COURT OF AUSTRALIA',
    courtLine2: '(DIVISION 2)',
    caseRefLabel: 'File No',
    caseNumberExample: 'MEL20240123FC',
    defaultParty1: 'Applicant',
    defaultParty2: 'Respondent',
    separator: '-and-',
    legalRepTitle: 'Solicitor',
    affidavitVerification: 'state on oath',
    currency: 'AUD',
    rules: 'Family Law Act 1975 (Cth) s.48; Federal Circuit and Family Court of Australia (Family Law) Rules 2021'
  },

  // ── SINGAPORE ────────────────────────────────────────────────────────────

  'sg-hc': {
    id: 'sg-hc',
    label: 'Singapore — General Division of the High Court',
    country: 'Singapore',
    courtLine1: 'IN THE GENERAL DIVISION OF THE HIGH COURT OF THE REPUBLIC OF SINGAPORE',
    courtLine2: null,
    historicalHeader: 'IN THE HIGH COURT OF THE REPUBLIC OF SINGAPORE',
    caseRefLabel: 'Case No',
    caseNumberFormat: 'HC/OC [year]/[seq]  e.g. HC/OC 123/2024',
    caseNumberExample: 'HC/OC 123/2024',
    neutralCitation: '[Year] SGHC [Number]',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    alternativeParties: {
      originatingSummons: ['Applicant', 'Respondent'],
      judicialReview: ['Applicant', 'Respondent'],
      appeal: ['Appellant', 'Respondent'],
      family: ['Applicant', 'Respondent']
    },
    separator: 'And',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Singapore, this ___ day of __________ 20__ BEFORE ME: ___________________________ COMMISSIONER FOR OATHS / NOTARY PUBLIC',
    witnessStatementVerification: 'I believe that the facts stated in this witness statement are true. I understand that proceedings for contempt of court may be brought against anyone who makes, or causes to be made, a false statement in a document verified by a statement of truth.',
    courtAddress: 'Supreme Court Building, 1 Supreme Court Lane, Singapore 178879',
    currency: 'SGD',
    eFiling: 'Mandatory via elitigation.sg (eLitigation/ICMS)',
    paperSize: 'A4',
    rules: 'Rules of Court 2021 (ROC 2021) S914/2021; Supreme Court of Judicature Act Cap 322',
    caseLawDatabases: [
      { name: 'SG Courts eLitigation', url: 'https://www.elitigation.sg', free: true },
      { name: 'CommonLII Singapore', url: 'http://www.commonlii.org/sg/', free: true },
      { name: 'LawNet', url: 'https://www.lawnet.com.sg', free: false }
    ]
  },

  'sg-ca': {
    id: 'sg-ca',
    label: 'Singapore — Court of Appeal',
    country: 'Singapore',
    courtLine1: 'IN THE COURT OF APPEAL OF THE REPUBLIC OF SINGAPORE',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'CA [year]/[seq]  e.g. CA 2024/29',
    caseNumberExample: 'CA 2024/29',
    neutralCitation: '[Year] SGCA [Number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: 'And',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Singapore, this ___ day of __________ 20__ BEFORE ME: ___________________________ COMMISSIONER FOR OATHS / NOTARY PUBLIC',
    courtAddress: 'Supreme Court Building, 1 Supreme Court Lane, Singapore 178879',
    currency: 'SGD',
    eFiling: 'Mandatory via elitigation.sg',
    paperSize: 'A4',
    rules: 'Rules of Court 2021 (ROC 2021) S914/2021; SCJA Cap 322 Part 3',
    caseLawDatabases: [
      { name: 'SG Courts eLitigation', url: 'https://www.elitigation.sg', free: true },
      { name: 'CommonLII Singapore', url: 'http://www.commonlii.org/sg/', free: true }
    ]
  },

  'sg-sicc': {
    id: 'sg-sicc',
    label: 'Singapore International Commercial Court (SICC)',
    country: 'Singapore',
    courtLine1: 'IN THE SINGAPORE INTERNATIONAL COMMERCIAL COURT',
    courtLine2: 'OF THE REPUBLIC OF SINGAPORE',
    caseRefLabel: 'SICC Case No',
    caseNumberFormat: 'SICC [year]/[seq]  e.g. SICC 2024/5',
    caseNumberExample: 'SICC 2024/5',
    neutralCitation: '[Year] SGHC(I) [Number]',
    defaultParty1: 'Claimant',
    defaultParty2: 'Defendant',
    alternativeParties: { arbitration: ['Applicant', 'Respondent'] },
    separator: 'And',
    legalRepTitle: 'Registered Foreign Lawyer / Counsel',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Singapore, this ___ day of __________ 20__ BEFORE ME: ___________________________ COMMISSIONER FOR OATHS / NOTARY PUBLIC',
    courtAddress: 'Supreme Court Building, 1 Supreme Court Lane, Singapore 178879',
    currency: 'SGD',
    eFiling: 'Mandatory via elitigation.sg',
    paperSize: 'A4',
    note: 'No formal pleadings unless ordered by Court; written submissions model. Foreign lawyers may appear (Registration required).',
    rules: 'SICC Rules 2021; SICC Practice Directions; Singapore International Commercial Court Act 2018',
    caseLawDatabases: [
      { name: 'SICC Judgments', url: 'https://www.sicc.gov.sg/hearing-list/judgments', free: true },
      { name: 'SG Courts eLitigation', url: 'https://www.elitigation.sg', free: true }
    ]
  },

  // ── HONG KONG ─────────────────────────────────────────────────────────────

  'hk-cfa': {
    id: 'hk-cfa',
    label: 'Hong Kong — Court of Final Appeal (HKCFA)',
    country: 'Hong Kong',
    courtLine1: 'IN THE COURT OF FINAL APPEAL OF THE',
    courtLine2: 'HONG KONG SPECIAL ADMINISTRATIVE REGION',
    caseRefLabel: 'Case No',
    caseNumberFormat: 'FACV [year]/[seq] (civil) or FACC [seq]/[year] (criminal)',
    caseNumberExample: 'FACV 2024/1',
    neutralCitation: '[Year] HKCFA [Number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: 'And',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Hong Kong, this ___ day of __________ 20__ BEFORE ME: ____________________________ Commissioner for Oaths/Notary Public',
    courtAddress: '1 Battery Path, Central, Hong Kong',
    currency: 'HKD',
    eFiling: 'Via HK eLitigation system; see judiciary.hk',
    paperSize: 'A4',
    rules: 'Rules of the Court of Final Appeal Cap 484; Hong Kong Court of Final Appeal Practice Directions',
    caseLawDatabases: [
      { name: 'Legal Reference System (LRS)', url: 'https://legalref.judiciary.hk', free: true },
      { name: 'HKLII', url: 'http://www.hklii.org', free: true },
      { name: 'Court of Final Appeal', url: 'https://www.hkcfa.hk', free: true }
    ]
  },

  'hk-ca': {
    id: 'hk-ca',
    label: 'Hong Kong — Court of Appeal (HKCA)',
    country: 'Hong Kong',
    courtLine1: 'IN THE HIGH COURT OF THE HONG KONG SPECIAL ADMINISTRATIVE REGION',
    courtLine2: 'COURT OF APPEAL',
    caseRefLabel: 'Case No',
    caseNumberFormat: 'CACV [year]/[seq] (civil) or CACC [year]/[seq] (criminal)',
    caseNumberExample: 'CACV 2024/150',
    neutralCitation: '[Year] HKCA [Number]',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    alternativeParties: {
      judicialReview: ['Applicant', 'Respondent'],
      criminal: ['Appellant', 'Secretary for Justice']
    },
    separator: 'And',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Hong Kong, this ___ day of __________ 20__ BEFORE ME: ____________________________ Commissioner for Oaths/Notary Public',
    courtAddress: 'High Court Building, 38 Queensway, Hong Kong',
    currency: 'HKD',
    eFiling: 'Via HK eLitigation system',
    paperSize: 'A4',
    rules: 'Rules of the High Court (RHC) Cap 4A; Hong Kong Court of Appeal Practice Directions',
    caseLawDatabases: [
      { name: 'Legal Reference System (LRS)', url: 'https://legalref.judiciary.hk', free: true },
      { name: 'HKLII', url: 'http://www.hklii.org', free: true }
    ]
  },

  'hk-cfi': {
    id: 'hk-cfi',
    label: 'Hong Kong — Court of First Instance (CFI)',
    country: 'Hong Kong',
    courtLine1: 'IN THE HIGH COURT OF THE HONG KONG SPECIAL ADMINISTRATIVE REGION',
    courtLine2: 'COURT OF FIRST INSTANCE',
    caseRefLabel: 'Case No',
    caseNumberFormat: 'HCA [year]/[seq] (general action); HCAL [year]/[seq] (constitutional/admin)',
    caseNumberExample: 'HCA 2024/500',
    neutralCitation: '[Year] HKCFI [Number]',
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    alternativeParties: {
      judicialReview: ['Applicant', 'Respondent'],
      bankruptcy: ['Applicant', 'Respondent (Debtor)'],
      winding_up: ['Petitioner', 'Company'],
      matrimonial: ['Petitioner', 'Respondent']
    },
    divisionCodes: {
      general: 'HCA', construction: 'HCCT', probate: 'HCAP', admiralty: 'HCAJ',
      bankruptcy: 'HCB', winding_up: 'HCCW', constitutional: 'HCAL', ip: 'HCIP'
    },
    separator: 'And',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent named above at Hong Kong, this ___ day of __________ 20__ BEFORE ME: ____________________________ Commissioner for Oaths/Notary Public',
    courtAddress: 'High Court Building, 38 Queensway, Hong Kong',
    currency: 'HKD',
    eFiling: 'Via HK eLitigation system (registration required)',
    paperSize: 'A4',
    rules: 'Rules of the High Court (RHC) Cap 4A; Practice Directions (HK)',
    caseLawDatabases: [
      { name: 'Legal Reference System (LRS)', url: 'https://legalref.judiciary.hk', free: true },
      { name: 'HKLII', url: 'http://www.hklii.org', free: true },
      { name: 'HK e-Legislation', url: 'https://www.elegislation.gov.hk', free: true }
    ]
  },

  // ── INDIA ─────────────────────────────────────────────────────────────────

  'in-sci': {
    id: 'in-sci',
    label: 'India — Supreme Court of India (SCI)',
    country: 'India',
    courtLine1: 'IN THE SUPREME COURT OF INDIA',
    courtLine2: null,
    jurisdictionLine: 'CIVIL APPELLATE / ORIGINAL / CRIMINAL APPELLATE JURISDICTION',
    caseRefLabel: 'Petition/Appeal No',
    caseNumberFormat: 'SLP (C) No. [seq] of [year] OR WP (C) No. [seq]/[year]',
    caseNumberExample: 'SLP (C) No. 5678 of 2024',
    caseTypes: {
      civilAppeal: 'Civil Appeal No. [seq] of [year]',
      slpCivil: 'SLP (C) No. [seq] of [year]',
      slpCriminal: 'SLP (Crl) No. [seq] of [year]',
      wpCivil: 'WP (C) No. [seq]/[year]',
      wpCriminal: 'WP (Crl) No. [seq]/[year]',
      reviewCivil: 'Review Petition (C) No. [seq]/[year]',
      transferCivil: 'TP (C) No. [seq]/[year]',
      contemptCivil: 'Cont.P. (C) [seq]/[year]'
    },
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    alternativeParties: {
      appeal: ['Appellant', 'Respondent'],
      writ: ['Petitioner', 'Union of India & Ors.'],
      original: ['Plaintiff', 'Defendant']
    },
    separator: 'Versus',
    legalRepTitle: 'Advocate-on-Record (AOR)',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner above, do hereby state on solemn affirmation that the contents of paragraphs ___ to ___ are true to my own knowledge, and paragraphs ___ to ___ are stated on information received and believed to be true. At [City], this ___ day of [Month], [Year]. DEPONENT',
    courtAddress: 'Supreme Court of India, Tilak Marg, New Delhi 110001',
    currency: 'INR',
    eFiling: 'Via SCI e-filing portal: efiling.sci.gov.in',
    paperSize: 'A4',
    fontRequirements: 'Times New Roman 13-14pt; 1.5 line spacing; left margin 4cm',
    pageLimit: 'SLP: 30 pages; WP: 50 pages (excluding annexures)',
    rules: 'Supreme Court Rules 2013; Code of Civil Procedure 1908; Constitution of India Art. 32 (WP), Art. 136 (SLP)',
    caseLawDatabases: [
      { name: 'Indian Kanoon', url: 'https://indiankanoon.org', free: true },
      { name: 'Supreme Court of India', url: 'https://main.sci.gov.in', free: true },
      { name: 'CommonLII India', url: 'http://www.commonlii.org/in/', free: true },
      { name: 'eCourts Services', url: 'https://ecourts.gov.in', free: true }
    ]
  },

  'in-bombay': {
    id: 'in-bombay',
    label: 'India — High Court of Judicature at Bombay',
    country: 'India',
    courtLine1: 'IN THE HIGH COURT OF JUDICATURE AT BOMBAY',
    courtLine2: null,
    caseRefLabel: 'Petition/Appeal No',
    caseNumberFormat: 'WP [seq]/[year] or First Appeal No. [seq] of [year]',
    caseNumberExample: 'WP 1234/2024',
    defaultParty1: 'Petitioner/Appellant',
    defaultParty2: 'Respondent',
    alternativeParties: {
      originalSide: ['Plaintiff', 'Defendant'],
      appeal: ['Appellant', 'Respondent'],
      chamber: ['Applicant', 'Opponent']
    },
    separator: 'v.',
    legalRepTitle: 'Advocate',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner/deponent, do hereby state that the contents of paragraphs ___ to ___ are true to my personal knowledge, belief and information. At [City], this ___ day of [Month], [Year]. DEPONENT',
    courtAddress: 'High Court of Judicature at Bombay, Fort, Mumbai 400032',
    currency: 'INR',
    eFiling: 'Via Bombay HC e-filing: hcefiling.bombayhighcourt.nic.in',
    paperSize: 'A4',
    rules: 'Bombay High Court Appellate Side Rules 1960; Bombay High Court Original Side Rules 1980; Code of Civil Procedure 1908',
    caseLawDatabases: [
      { name: 'Indian Kanoon', url: 'https://indiankanoon.org', free: true },
      { name: 'Bombay HC Website', url: 'https://bombayhighcourt.nic.in', free: true }
    ]
  },

  'in-delhi': {
    id: 'in-delhi',
    label: 'India — High Court of Delhi',
    country: 'India',
    courtLine1: 'IN THE HIGH COURT OF DELHI',
    courtLine2: 'AT NEW DELHI',
    caseRefLabel: 'Case No',
    caseNumberFormat: 'WP(C) [seq]/[year] or CS(OS) [seq]/[year] or CS(COMM) [seq]/[year]',
    caseNumberExample: 'WP(C) 1000/2024',
    caseTypes: {
      suitOriginal: 'CS(OS) [seq]/[year]',
      suitCommercial: 'CS(COMM) [seq]/[year]',
      arbitrationPetition: 'ARB.P. [seq]/[year]',
      wpCivil: 'WP(C) [seq]/[year]',
      regularFirstAppeal: 'RFA [seq]/[year]',
      lettersPatentAppeal: 'LPA [seq]/[year]'
    },
    defaultParty1: 'Petitioner/Plaintiff',
    defaultParty2: 'Respondent/Defendant',
    separator: 'v.',
    legalRepTitle: 'Advocate',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner/deponent above named, do hereby verify that the contents of the above affidavit are true and correct to the best of my knowledge, information and belief, and that nothing material has been concealed therefrom. At New Delhi, this ___ day of [Month], [Year]. DEPONENT',
    courtAddress: 'High Court of Delhi, Sher Shah Road, New Delhi 110503',
    currency: 'INR',
    eFiling: 'Via Delhi HC e-filing portal: dhcefiling.gov.in',
    paperSize: 'A4',
    rules: 'Delhi High Court (Original Side) Rules 2018; Delhi High Court Act 1966; Code of Civil Procedure 1908',
    caseLawDatabases: [
      { name: 'Indian Kanoon', url: 'https://indiankanoon.org', free: true },
      { name: 'Delhi HC Website', url: 'https://delhihighcourt.nic.in', free: true }
    ]
  },

  'in-madras': {
    id: 'in-madras',
    label: 'India — High Court of Judicature at Madras',
    country: 'India',
    courtLine1: 'IN THE HIGH COURT OF JUDICATURE AT MADRAS',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'WP [seq]/[year] or SA [seq]/[year]',
    caseNumberExample: 'WP 500/2024',
    defaultParty1: 'Petitioner/Appellant',
    defaultParty2: 'Respondent',
    separator: 'v.',
    legalRepTitle: 'Advocate',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner/appellant herein, do hereby solemnly affirm and state that the contents of the above affidavit/petition are true and correct to the best of my knowledge, belief and information. At Chennai, this ___ day of [Month], [Year]. DEPONENT',
    courtAddress: 'High Court of Judicature at Madras, High Court Road, Chennai 600104',
    currency: 'INR',
    eFiling: 'Via Madras HC e-filing portal',
    paperSize: 'A4',
    rules: 'Madras High Court Original Side Rules 1956; Code of Civil Procedure 1908',
    caseLawDatabases: [
      { name: 'Indian Kanoon', url: 'https://indiankanoon.org', free: true },
      { name: 'Madras HC Website', url: 'https://hcmadras.tn.nic.in', free: true }
    ]
  },

  'in-calcutta': {
    id: 'in-calcutta',
    label: 'India — High Court at Calcutta',
    country: 'India',
    courtLine1: 'IN THE HIGH COURT AT CALCUTTA',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'WP [seq]/[year] or FAO [seq]/[year]',
    caseNumberExample: 'WP 400/2024',
    defaultParty1: 'Petitioner/Appellant',
    defaultParty2: 'Respondent',
    separator: 'v.',
    legalRepTitle: 'Advocate',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner herein, do hereby verify that the contents of paragraphs ___ to ___ are true to my own knowledge, and paragraphs ___ to ___ are based on information received and believed to be true. At Kolkata, this ___ day of [Month], [Year]. DEPONENT',
    courtAddress: 'High Court at Calcutta, 1 Esplanade Row W, Kolkata 700001',
    currency: 'INR',
    eFiling: 'Via Calcutta HC e-filing portal',
    paperSize: 'A4',
    rules: 'Calcutta High Court (Original Side) Rules 1914; Code of Civil Procedure 1908',
    caseLawDatabases: [
      { name: 'Indian Kanoon', url: 'https://indiankanoon.org', free: true },
      { name: 'Calcutta HC Website', url: 'https://calcuttahighcourt.gov.in', free: true }
    ]
  },

  // ── MALAYSIA ──────────────────────────────────────────────────────────────

  'my-fc': {
    id: 'my-fc',
    label: 'Malaysia — Federal Court',
    country: 'Malaysia',
    courtLine1: 'IN THE FEDERAL COURT OF MALAYSIA',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'Civil Appeal No. [W]-[seq]-[year]  e.g. W-01-198-2024',
    caseNumberExample: 'Civil Appeal No. W-01-198-2024',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    alternativeParties: { leaveApplication: ['Applicant', 'Respondent'] },
    separator: 'v.',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'Dibuat dan Diperakui (Made and Affirmed) oleh Deponent tersebut di atas di ___________________, Malaysia pada ______ haribulan __________ 20____. Di hadapan saya (Before me), _________________________ KOMISIONER SUMPAH / COMMISSIONER FOR OATHS',
    courtAddress: 'Federal Court of Malaysia, Jalan Duta, 50450 Kuala Lumpur',
    currency: 'MYR',
    eFiling: 'Via MyECourt: efiling.court.gov.my (where available)',
    paperSize: 'A4',
    rules: 'Rules of Court 2012 [PU(A) 205/2012]; Courts of Judicature Act 1964',
    caseLawDatabases: [
      { name: 'CommonLII Malaysia', url: 'http://www.commonlii.org/my/', free: true },
      { name: 'Kehakiman Courts Portal', url: 'https://www.kehakiman.gov.my', free: true },
      { name: 'CLJ Law (partial)', url: 'https://www.cljlaw.com', free: false }
    ]
  },

  'my-ca': {
    id: 'my-ca',
    label: 'Malaysia — Court of Appeal',
    country: 'Malaysia',
    courtLine1: 'IN THE COURT OF APPEAL, MALAYSIA',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'Civil Appeal No. [W]-[seq]-[year]',
    caseNumberExample: 'Civil Appeal No. W-01-100-2024',
    defaultParty1: 'Appellant',
    defaultParty2: 'Respondent',
    separator: 'v.',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'Dibuat dan Diperakui oleh Deponent tersebut di atas di ___________________, Malaysia pada ______ haribulan __________ 20____. Di hadapan saya, _________________________ KOMISIONER SUMPAH / COMMISSIONER FOR OATHS',
    courtAddress: 'Court of Appeal Malaysia, Jalan Duta, Kuala Lumpur',
    currency: 'MYR',
    eFiling: 'Via MyECourt system',
    paperSize: 'A4',
    rules: 'Rules of Court 2012 [PU(A) 205/2012]; Courts of Judicature Act 1964',
    caseLawDatabases: [
      { name: 'CommonLII Malaysia', url: 'http://www.commonlii.org/my/', free: true },
      { name: 'Kehakiman Courts Portal', url: 'https://www.kehakiman.gov.my', free: true }
    ]
  },

  'my-hc': {
    id: 'my-hc',
    label: 'Malaysia — High Court (Malaya)',
    country: 'Malaysia',
    courtLine1: 'IN THE HIGH COURT OF MALAYA',
    courtLine2: 'AT KUALA LUMPUR',
    courtLine2Alt: 'IN THE HIGH COURT OF SABAH AND SARAWAK AT KUCHING',
    caseRefLabel: 'Case No',
    caseNumberFormat: '[Location Code]-[type code]-[seq]-[year]  e.g. WA-24NCVK-155-2024',
    caseNumberExample: 'WA-24NCVK-155-2024',
    locationCodes: { KL: 'Kuala Lumpur', S: 'Shah Alam', JB: 'Johor Bahru', IP: 'Ipoh', P: 'Penang', KU: 'Kuching', KK: 'Kota Kinabalu' },
    defaultParty1: 'Plaintiff',
    defaultParty2: 'Defendant',
    alternativeParties: {
      judicialReview: ['Applicant', 'Respondent'],
      originating: ['Applicant', 'Respondent']
    },
    separator: 'v.',
    legalRepTitle: 'Counsel / Solicitor',
    affidavitVerification: 'Dibuat dan Diperakui oleh Pendakwa [Deponent] yang tersebut di atas di ___________________, dalam Negeri __________________ pada ______ haribulan __________ 20____. Di hadapan saya, _________________________ KOMISIONER SUMPAH / COMMISSIONER FOR OATHS',
    courtAddress: 'High Court of Malaya, Jalan Duta, 50450 Kuala Lumpur',
    currency: 'MYR',
    eFiling: 'Via MyECourt system for Kuala Lumpur Commercial Division',
    paperSize: 'A4',
    rules: 'Rules of Court 2012 [PU(A) 205/2012]; Courts of Judicature Act 1964; Specific Practice Directions',
    caseLawDatabases: [
      { name: 'CommonLII Malaysia', url: 'http://www.commonlii.org/my/', free: true },
      { name: 'Kehakiman Courts Portal', url: 'https://www.kehakiman.gov.my', free: true }
    ]
  },

  // ── SRI LANKA ─────────────────────────────────────────────────────────────

  'lk-sc': {
    id: 'lk-sc',
    label: 'Sri Lanka — Supreme Court',
    country: 'Sri Lanka',
    courtLine1: 'IN THE SUPREME COURT OF THE DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA',
    courtLine2: null,
    caseRefLabel: 'Case No',
    caseNumberFormat: 'SC (FR) [seq]/[year] or SC Appeal [seq]/[year]',
    caseNumberExample: 'SC (FR) 65/2024',
    caseTypes: {
      fundamentalRights: 'SC (FR) Application No. [seq]/[year]',
      appeal: 'SC Appeal No. [seq]/[year]',
      leaveToAppeal: 'SC (LA) No. [seq]/[year]',
      writ: 'SC Writ Application [seq]/[year]',
      revision: 'SC Revision [seq]/[year]',
      reference: 'SC Reference [seq]/[year]'
    },
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    alternativeParties: { appeal: ['Appellant', 'Respondent'] },
    separator: 'v.',
    legalRepTitle: 'Attorney-at-Law',
    affidavitVerification: 'SWORN/AFFIRMED by the Deponent whose signature appears above at Colombo, this ___ day of __________ 20__ Before Me, ____________________ COMMISSIONER OF OATHS',
    courtAddress: 'Supreme Court of Sri Lanka, Hulftsdorp Street, Colombo 12',
    currency: 'LKR',
    eFiling: 'Physical filing at Supreme Court Registry; partial e-filing available',
    paperSize: 'A4',
    rules: 'Supreme Court Rules 1990; Judicature Act No. 2 of 1978; Courts Ordinance Cap. 101; Constitution Art. 126 (FR)',
    caseLawDatabases: [
      { name: 'Sri Lanka Supreme Court', url: 'https://www.supremecourt.lk', free: true },
      { name: 'CommonLII Sri Lanka', url: 'http://www.commonlii.org/lk/', free: true },
      { name: 'Court of Appeal', url: 'https://www.courtofappeal.lk', free: true }
    ]
  },

  // ── PAKISTAN ──────────────────────────────────────────────────────────────

  'pk-sc': {
    id: 'pk-sc',
    label: 'Pakistan — Supreme Court of Pakistan (SCP)',
    country: 'Pakistan',
    courtLine1: 'IN THE SUPREME COURT OF PAKISTAN',
    courtLine2: null,
    jurisdictionLine: '(APPELLATE / ORIGINAL / ADVISORY JURISDICTION)',
    caseRefLabel: 'Petition/Appeal No',
    caseNumberFormat: 'C.P. No. [seq]-L/[year] or Const.P. No. [seq]/[year]',
    caseNumberExample: 'C.P. No. 500-L/2024',
    caseTypes: {
      cpla: 'C.P. No. [seq]-[registry]/[year]',
      criminalPetition: 'Crl.P. No. [seq]-[registry]/[year]',
      constitutionalPetition: 'Const.P. No. [seq]/[year]',
      humanRightsCase: 'HRC No. [seq]-[registry]/[year]',
      civilAppeal: 'Civil Appeal No. [seq]-[registry] of [year]',
      criminalAppeal: 'Criminal Appeal No. [seq]-[registry] of [year]',
      reviewCivil: 'Review Petition No. [seq]/[year]'
    },
    registryCodes: { L: 'Lahore', K: 'Karachi', P: 'Islamabad (Principal)', A: 'Peshawar', Q: 'Quetta' },
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    alternativeParties: {
      appeal: ['Appellant', 'Respondent'],
      constitutional: ['Petitioner', 'Federation of Pakistan / Province of ___']
    },
    separator: 'v.',
    legalRepTitle: 'Advocate Supreme Court',
    affidavitVerification: 'VERIFICATION: I, [Name], the petitioner/deponent above named, do hereby solemnly affirm that the contents of paragraphs ___ to ___ are true to my own knowledge, and paragraphs ___ to ___ are stated on legal advice believed to be true. Verified at [City] on this ___ day of ________, 20____. ____________________  Signature of Deponent. BEFORE ME, ____________________ OATH COMMISSIONER / NOTARY PUBLIC',
    courtAddress: 'Supreme Court of Pakistan, Constitution Avenue, Islamabad 44000',
    currency: 'PKR',
    eFiling: 'Physical filing; some digital submission at Principal Seat Islamabad',
    paperSize: 'Legal (8.5" x 13") or A4; white paper; double-spaced, one side only',
    rules: 'Supreme Court Rules 1980 (as amended); Constitution of Pakistan 1973 Art. 184(3); Code of Civil Procedure 1908',
    caseLawDatabases: [
      { name: 'Supreme Court of Pakistan', url: 'https://www.supremecourt.gov.pk', free: true },
      { name: 'Pakistan Code', url: 'http://pakistancode.gov.pk', free: true },
      { name: 'PLD (partial)', url: 'https://www.pld.com.pk', free: false }
    ]
  },

  // ── PHILIPPINES ───────────────────────────────────────────────────────────

  'ph-sc': {
    id: 'ph-sc',
    label: 'Philippines — Supreme Court',
    country: 'Philippines',
    courtLine1: 'REPUBLIC OF THE PHILIPPINES',
    courtLine2: 'SUPREME COURT',
    courtLine3: 'Manila',
    caseRefLabel: 'G.R. No.',
    caseNumberFormat: 'G.R. No. [seq]  e.g. G.R. No. 231238',
    caseNumberExample: 'G.R. No. 231238',
    caseTypes: {
      general: 'G.R. No. [seq]',
      administrativeMatter: 'A.M. No. [type]-[seq]-[year]',
      barMatter: 'Bar Matter No. [seq]',
      acPetitions: 'A.C. No. [seq]'
    },
    defaultParty1: 'Petitioner',
    defaultParty2: 'Respondent',
    alternativeParties: {
      criminal: ['People of the Philippines', 'Accused-Appellant'],
      administrative: ['Complainant', 'Respondent Judge']
    },
    separator: 'v.',
    legalRepTitle: 'Counsel / Attorney',
    affidavitVerification: 'SUBSCRIBED AND SWORN to before me in [City], Philippines on [Date], affiant exhibiting their [ID Type and Number]. ________________________ NOTARY PUBLIC',
    pleadingVerification: 'VERIFICATION: I, [Name], of legal age, Filipino, after having been sworn in accordance with law, depose and state: That I am the [Petitioner/Plaintiff]; that I have caused the preparation of this [Petition/Complaint]; that I have read its contents; and the facts stated therein are true and correct of my own knowledge and authentic records. [City], Philippines, [Date]. ____________________  AFFIANT',
    certificateNonForumShopping: 'CERTIFICATION OF NON-FORUM SHOPPING: I hereby certify that I have not filed any petition/complaint involving the same issues in any court, tribunal, or quasi-judicial agency, and that no such proceeding is pending therein. ____________________  AFFIANT',
    courtAddress: 'Supreme Court of the Philippines, Padre Faura, Ermita, Manila 1000',
    currency: 'PHP',
    eFiling: 'Via e-Courts system; see https://sc.judiciary.gov.ph',
    paperSize: '8.5" x 13" (legal) or A4; double-spaced; one side only',
    fontRequirements: 'Times New Roman 14pt or Arial 12pt for pleadings',
    marginRequirements: 'Left: 1.5" (3.81cm); all others: 1" (2.54cm)',
    mandatoryVerification: true,
    mandatoryNonForumShopping: true,
    rules: 'Rules of Court (as amended); 2019 Amendments to Rules on Civil Procedure (A.M. No. 19-10-20-SC); Revised Rules of Criminal Procedure; Rules of Court Rule 65 (Certiorari/Prohibition/Mandamus)',
    caseLawDatabases: [
      { name: 'SC E-Library', url: 'https://elibrary.judiciary.gov.ph', free: true },
      { name: 'SC Decisions Portal', url: 'https://sc.judiciary.gov.ph/decisions/', free: true },
      { name: 'Chan Robles', url: 'https://chanrobles.com', free: true },
      { name: 'LawPhil', url: 'http://www.lawphil.net', free: true },
      { name: 'Official Gazette', url: 'https://www.officialgazette.gov.ph', free: true }
    ]
  },

  'ph-rtc': {
    id: 'ph-rtc',
    label: 'Philippines — Regional Trial Court (RTC)',
    country: 'Philippines',
    courtLine1: 'REPUBLIC OF THE PHILIPPINES',
    courtLine2: 'REGIONAL TRIAL COURT',
    courtLine3: 'Branch ___, [City/Province]',
    caseRefLabel: 'Civil/Criminal Case No.',
    caseNumberFormat: 'Civil Case No. [seq] or Criminal Case No. [seq]',
    caseNumberExample: 'Civil Case No. R-MNL-24-001234-CV',
    defaultParty1: 'Plaintiff/Petitioner',
    defaultParty2: 'Defendant/Respondent',
    alternativeParties: { criminal: ['People of the Philippines', 'Accused'] },
    separator: 'v.',
    legalRepTitle: 'Counsel / Attorney',
    affidavitVerification: 'SUBSCRIBED AND SWORN to before me in [City], Philippines on [Date], affiant exhibiting their [ID Type and Number]. ________________________ NOTARY PUBLIC',
    pleadingVerification: 'VERIFICATION AND CERTIFICATION AGAINST FORUM SHOPPING: I, [Name], under oath, declare that I am the [plaintiff/petitioner]; I have read this [complaint/petition]; the allegations are true and correct to the best of my knowledge and based on authentic records; I have not commenced any action involving the same issues in any other court. [City], Philippines, [Date]. ____________________ AFFIANT',
    courtAddress: '[Branch], Regional Trial Court, [City/Province], Philippines',
    currency: 'PHP',
    eFiling: 'Via e-Courts Philippines (eCourt)',
    paperSize: '8.5" x 13" (legal) or A4; double-spaced',
    fontRequirements: 'Times New Roman 14pt or Arial 12pt',
    marginRequirements: 'Left: 1.5" (3.81cm); all others: 1" (2.54cm)',
    rules: 'Rules of Court (as amended 2019); 2019 Amendments (A.M. No. 19-10-20-SC)',
    caseLawDatabases: [
      { name: 'SC E-Library', url: 'https://elibrary.judiciary.gov.ph', free: true },
      { name: 'LawPhil', url: 'http://www.lawphil.net', free: true }
    ]
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT TYPE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
const DOCUMENT_TYPES = {
  'claim-form':              { label: 'Claim Form / Statement of Claim',   requiresCaseRef: true },
  'affidavit':               { label: 'Affidavit',                          requiresCaseRef: true },
  'witness-statement':       { label: 'Witness Statement',                  requiresCaseRef: true },
  'order':                   { label: 'Court Order',                        requiresCaseRef: true },
  'notice-of-appeal':        { label: 'Notice of Appeal',                   requiresCaseRef: true },
  'divorce-petition':        { label: 'Divorce / Matrimonial Petition',     requiresCaseRef: true },
  'children-application':    { label: 'Children Act / Family Application',  requiresCaseRef: true },
  'injunction-application':  { label: 'Application for Injunction',        requiresCaseRef: true },
  'judicial-review':         { label: 'Judicial Review / Application',     requiresCaseRef: true },
  'originating-application': { label: 'Originating Application',           requiresCaseRef: true },
  'insurance-claim':         { label: 'Insurance Claim (Particulars)',      requiresCaseRef: true },
  'defence':                 { label: 'Defence / Statement of Defence',     requiresCaseRef: true },
  'counterclaim':            { label: 'Counterclaim',                        requiresCaseRef: true },
  'factum':                  { label: 'Factum / Written Submissions',        requiresCaseRef: true },
  'consent-order':           { label: 'Consent Order',                       requiresCaseRef: true },
  'probate-application':     { label: 'Probate / Administration Application', requiresCaseRef: false },
  'statutory-demand':        { label: 'Statutory Demand / Winding Up',       requiresCaseRef: false }
};

// ─────────────────────────────────────────────────────────────────────────────
// HEADER BUILDER
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Build the full court header block.
 * @param {string} formatId - jurisdiction key from JURISDICTIONS
 * @param {object} data - { caseRef, party1Name, party1Role, party2Name, party2Role, documentTitle, subMatter }
 * @returns {string} plain-text formatted header
 */
function buildHeader(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  if (!J) throw new Error(`Unknown formatId: ${formatId}`);

  const {
    caseRef        = `[${J.caseRefLabel}]`,
    party1Name     = '[PARTY ONE NAME]',
    party1Role     = data.party1Role || J.defaultParty1,
    party2Name     = '[PARTY TWO NAME]',
    party2Role     = data.party2Role || J.defaultParty2,
    documentTitle  = '',
    subMatter      = '',
    beforeJudge    = ''
  } = data;

  const lines = [];

  // Court name lines
  lines.push(J.courtLine1);
  if (J.courtLine2) lines.push(J.courtLine2);
  if (J.courtLine3) lines.push(J.courtLine3);
  if (J.courtSuffix) lines.push(J.courtSuffix);
  lines.push('');

  // Case reference
  lines.push(`${J.caseRefLabel}: ${caseRef}`);
  lines.push('');

  // Before judge (for orders)
  if (beforeJudge) {
    lines.push(`BEFORE ${beforeJudge}`);
    lines.push('');
  }

  // Sub-matter (e.g. "IN THE MATTER OF...")
  if (subMatter) {
    lines.push(subMatter);
    lines.push('');
  }

  // Party block
  lines.push('BETWEEN:');
  lines.push('');
  lines.push(_padParty(party1Name, party1Role));
  lines.push(`                        ${J.separator}`);
  lines.push('');
  lines.push(_padParty(party2Name, party2Role));
  lines.push('');

  // Document title
  if (documentTitle) {
    lines.push(_center(documentTitle));
    lines.push('');
  }

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT BODY TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a complete affidavit document (header + body structure)
 */
function buildAffidavit(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  const {
    deponentName       = '[DEPONENT FULL NAME]',
    deponentOccupation = '[Occupation]',
    deponentAddress    = '[Address]',
    paragraphs         = ['[Depose to facts here in numbered paragraphs]'],
    swornAt            = J.courtAddress || '[location]',
    swornDate          = '[date]',
    commissioner       = '[Commissioner for Oaths / Notary Public / Justice of the Peace]'
  } = data;

  const header = buildHeader(formatId, {
    ...data,
    documentTitle: `AFFIDAVIT OF ${deponentName.toUpperCase()}`
  });

  const body = [];
  body.push(`I, ${deponentName.toUpperCase()}, ${deponentOccupation}, of ${deponentAddress}, ${J.affidavitVerification}:`);
  body.push('');
  paragraphs.forEach((p, i) => body.push(`${i + 1}.  ${p}`));
  body.push('');
  body.push(_buildSwornBlock(J, swornAt, swornDate, deponentName, commissioner));

  return header + body.join('\n');
}

/**
 * Build a UK-style Witness Statement (CPR Part 32)
 */
function buildWitnessStatement(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  const {
    witnessName      = '[WITNESS FULL NAME]',
    witnessAddress   = '[Address]',
    exhibitRef       = '[WS-1]',
    paragraphs       = ['[State facts here in numbered paragraphs, present tense, first person]'],
    signedDate       = '[date]'
  } = data;

  const header = buildHeader(formatId, {
    ...data,
    documentTitle: `WITNESS STATEMENT OF ${witnessName.toUpperCase()}`
  });

  const body = [];
  body.push(`I, ${witnessName}, of ${witnessAddress}, WILL SAY as follows:`);
  body.push('');
  paragraphs.forEach((p, i) => body.push(`${i + 1}.  ${p}`));
  body.push('');
  body.push(J.witnessStatementVerification || 'I believe that the facts stated in this witness statement are true.');
  body.push('');
  body.push(`Signed: _______________________`);
  body.push(`Full name: ${witnessName}`);
  body.push(`Date: ${signedDate}`);

  return header + body.join('\n');
}

/**
 * Build a Court Order
 */
function buildOrder(formatId, data = {}) {
  const {
    judgeName     = '[JUDGE NAME AND TITLE]',
    hearingDate   = '[date]',
    upon          = ['the application of the [party]', 'reading the affidavit of [name] dated [date]'],
    hearing       = 'Counsel for both parties',
    orders        = ['[First operative order]', '[Second operative order]'],
    costsOrder    = '[Costs in the cause / Costs to the Claimant / No order as to costs]',
    penal         = false,
    penalParty    = '[Name]'
  } = data;

  const header = buildHeader(formatId, {
    ...data,
    beforeJudge: judgeName,
    documentTitle: 'ORDER'
  });

  const body = [];
  upon.forEach(u => body.push(`UPON ${u}`));
  body.push(`AND UPON hearing ${hearing}`);
  body.push('');
  body.push('IT IS ORDERED THAT:');
  body.push('');
  orders.forEach((o, i) => body.push(`${i + 1}.  ${o}`));
  body.push('');
  body.push(`COSTS: ${costsOrder}`);
  body.push('');
  body.push(`Dated this [date] day of [month] [year]`);

  if (penal) {
    body.push('');
    body.push('─'.repeat(60));
    body.push(`PENAL NOTICE: IF YOU ${penalParty.toUpperCase()} DISOBEY THIS ORDER YOU MAY BE HELD IN CONTEMPT OF COURT AND MAY BE IMPRISONED, FINED, OR HAVE YOUR ASSETS SEIZED.`);
    body.push('─'.repeat(60));
  }

  return header + body.join('\n');
}

/**
 * Build Divorce / Matrimonial Petition
 */
function buildDivorcePetition(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  const {
    petitionerName  = '[PETITIONER FULL NAME]',
    respondentName  = '[RESPONDENT FULL NAME]',
    marriageDate    = '[date of marriage]',
    marriagePlace   = '[place of marriage]',
    children        = [],
    grounds         = '[grounds for divorce — separation / breakdown]',
    prayer          = ['A Decree of Divorce / Divorce Order', 'Custody of the child(ren)', 'Maintenance', 'Costs'],
    statute         = J.rules,
    caseRef         = `[${J.caseRefLabel}]`
  } = data;

  const isUK = formatId === 'uk-fam';
  const isAU = formatId === 'au-fcfca';

  const header = buildHeader(formatId, {
    caseRef,
    party1Name:  petitionerName,
    party1Role:  J.defaultParty1,
    party2Name:  respondentName,
    party2Role:  J.defaultParty2,
    subMatter:   'IN THE MATTER OF THE MARRIAGE OF',
    documentTitle: isUK ? 'APPLICATION FOR A DIVORCE ORDER'
                 : isAU ? 'APPLICATION FOR DIVORCE ORDER'
                 : 'DIVORCE PETITION'
  });

  const body = [];
  if (statute) body.push(`[Under ${statute}]`);
  body.push('');
  body.push(`1.  On the [date] day of [month], [year], the ${J.defaultParty1} was lawfully married to the ${J.defaultParty2} at ${marriagePlace}.`);
  body.push('');

  if (children.length > 0) {
    body.push(`2.  There are ${children.length} child(ren) of the family, namely:`);
    children.forEach((c, i) => body.push(`    (${'abcdefghijklmnopqrstuvwxyz'[i]}) ${c.name}, born ${c.dob}, aged ${c.age}.`));
  } else {
    body.push(`2.  There are no children of the family / There is/are [number] child(ren) of the family.`);
  }
  body.push('');

  if (isUK) {
    body.push(`3.  The ${J.defaultParty1} and ${J.defaultParty2} have separated.`);
    body.push(`4.  The marriage has broken down irretrievably.`);
  } else if (isAU) {
    body.push(`3.  The parties have been separated for a continuous period of not less than twelve (12) months and there is no reasonable likelihood of resumption of cohabitation.`);
  } else {
    body.push(`3.  The marriage has broken down irretrievably as evidenced by: ${grounds}`);
  }
  body.push('');

  body.push('PRAYER:');
  body.push(`The ${J.defaultParty1} therefore prays for:`);
  prayer.forEach((p, i) => body.push(`    (${'i ii iii iv v vi vii viii ix x'.split(' ')[i]})  ${p};`));
  body.push('');
  body.push(_buildLegalRepBlock(J, `${J.defaultParty1}`, data.firmName, data.firmAddress, data.firmTel, data.firmEmail));

  return header + body.join('\n');
}

/**
 * Build Insurance Claim (Particulars of Claim)
 */
function buildInsuranceClaim(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  const {
    policyNumber    = '[Policy Number]',
    insurer         = '[Insurance Company Name] LIMITED',
    insured         = '[Claimant Full Name]',
    incidentDate    = '[date of incident]',
    incidentType    = 'motor vehicle accident',
    incidentLocation= '[location]',
    losses          = [
      { description: 'Repair costs / replacement value', amount: '[amount]' },
      { description: 'Loss of use / consequential loss',  amount: '[amount]' },
      { description: 'Medical expenses',                  amount: '[amount]' }
    ],
    totalClaim      = '[total amount]'
  } = data;

  const header = buildHeader(formatId, {
    ...data,
    party1Name: insured,
    party2Name: insurer,
    documentTitle: 'PARTICULARS OF CLAIM'
  });

  const body = [];
  body.push(`1.  At all material times the Claimant was the holder of Insurance Policy No. ${policyNumber} issued by the Defendant (the "Policy").`);
  body.push('');
  body.push(`2.  On the [date] day of [month], [year], a ${incidentType} occurred at ${incidentLocation} as a result of which the Claimant suffered loss and damage.`);
  body.push('');
  body.push(`3.  The said incident was caused by [the negligence of the Defendant's insured / a peril covered under the Policy].`);
  body.push('');
  body.push(`4.  Under the terms and conditions of the Policy, the Defendant is liable to indemnify the Claimant in respect of the said loss and damage.`);
  body.push('');
  body.push(`5.  Despite due demand, the Defendant has failed and/or refused to pay the Claimant the amount due under the Policy.`);
  body.push('');
  body.push('PARTICULARS OF LOSS AND DAMAGE:');
  losses.forEach((l, i) => body.push(`    (${'abcdefghijklmnopqrstuvwxyz'[i]}) ${l.description}: ${J.currency} ${l.amount};`));
  body.push(`    TOTAL: ${J.currency} ${totalClaim}`);
  body.push('');
  body.push(`The Claimant therefore claims:`);
  body.push(`    (i)   The sum of ${J.currency} ${totalClaim};`);
  body.push(`    (ii)  Interest pursuant to [applicable statute];`);
  body.push(`    (iii) Costs of this action; and`);
  body.push(`    (iv)  Such further and other relief as this Honourable Court deems just.`);
  body.push('');
  body.push(_buildLegalRepBlock(J, 'Claimant', data.firmName, data.firmAddress, data.firmTel, data.firmEmail));

  return header + body.join('\n');
}

/**
 * Build Notice of Appeal
 */
function buildNoticeOfAppeal(formatId, data = {}) {
  const J = JURISDICTIONS[formatId];
  const {
    lowerCourt      = '[Court below and Judge name]',
    lowerCourtRef   = '[lower court case reference]',
    judgmentDate    = '[date of judgment appealed]',
    groundsOfAppeal = ['[Ground 1 of Appeal]', '[Ground 2 of Appeal]'],
    reliefSought    = ['[Relief sought from the appellate court]']
  } = data;

  const header = buildHeader(formatId, {
    ...data,
    documentTitle: 'NOTICE OF APPEAL'
  });

  const body = [];
  body.push(`ON APPEAL FROM: ${lowerCourt}`);
  body.push(`Lower Court Reference: ${lowerCourtRef}`);
  body.push(`Date of Decision/Judgment: ${judgmentDate}`);
  body.push('');
  body.push('GROUNDS OF APPEAL:');
  body.push('');
  groundsOfAppeal.forEach((g, i) => body.push(`${i + 1}.  ${g}`));
  body.push('');
  body.push('RELIEF SOUGHT:');
  body.push('');
  reliefSought.forEach((r, i) => body.push(`${i + 1}.  ${r}`));
  body.push('');
  body.push(_buildLegalRepBlock(J, 'Appellant', data.firmName, data.firmAddress, data.firmTel, data.firmEmail));

  return header + body.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function _padParty(name, role) {
  const pad = ' '.repeat(Math.max(1, 40 - name.length));
  return `                        ${name.toUpperCase()}${pad}${role}`;
}

function _center(text, width = 60) {
  const spaces = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(spaces) + text;
}

function _buildSwornBlock(J, swornAt, swornDate, deponentName, commissioner) {
  const lines = [];
  const isCaribbean = ['bb-sc','bb-fam','jm-sc','jm-mat','tt-hc','tt-fam','ccj-orig','ccj-app'].includes(J.id);
  const isUK        = J.id.startsWith('uk-') || J.id === 'jcpc';
  const isAU        = J.id.startsWith('au-');
  const isCA        = J.id.startsWith('ca-');

  if (isAU) {
    lines.push(`Sworn at ${swornAt}`);
    lines.push(`on ${swornDate}`);
    lines.push('');
    lines.push(`_______________________`);
    lines.push(`Deponent`);
    lines.push('');
    lines.push(`Before me:`);
    lines.push(`_______________________`);
    lines.push(`${commissioner}`);
    lines.push(`[Capacity — Solicitor of the Supreme Court of [State] / Justice of the Peace (JP No: [number])]`);
  } else if (isCA) {
    lines.push(`SWORN BEFORE ME at the City`);
    lines.push(`of [city], Province of [province],`);
    lines.push(`this [day] day of [month], [year].`);
    lines.push('');
    lines.push(`_______________________          _______________________`);
    lines.push(`A Commissioner for Oaths /         Deponent`);
    lines.push(`Notary Public in and for [Province]`);
  } else if (isCaribbean) {
    lines.push(`SWORN to at ${swornAt}              )`);
    lines.push(`this ${swornDate}   )`);
    lines.push(`                                    )  _________________________`);
    lines.push(`Before me:                                    Deponent`);
    lines.push('');
    lines.push(`_________________________`);
    lines.push(`${commissioner}`);
  } else {
    // UK / JCPC style
    lines.push(`SWORN at [place]`);
    lines.push(`This ${swornDate}`);
    lines.push(`Before me:`);
    lines.push('');
    lines.push(`_______________________          _______________________`);
    lines.push(`Commissioner for Oaths /           Deponent`);
    lines.push(`Solicitor`);
  }

  return lines.join('\n');
}

function _buildLegalRepBlock(J, party, firmName, firmAddress, firmTel, firmEmail) {
  const lines = [];
  lines.push('');
  lines.push(firmName   || '[Law Firm Name]');
  lines.push(firmAddress|| '[Address]');
  lines.push(firmTel    ? `Tel: ${firmTel}` : 'Tel: [telephone]');
  lines.push(firmEmail  ? `Email: ${firmEmail}` : 'Email: [email]');
  lines.push('');
  lines.push(`${J.legalRepTitle} for the ${party}`);
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DOCUMENT FORMATTER  (dispatcher)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Generate a formatted legal document.
 *
 * @param {string} formatId    - Jurisdiction ID from JURISDICTIONS registry
 * @param {string} documentType - Type from DOCUMENT_TYPES registry
 * @param {object} data         - Document-specific data object
 * @returns {object} { text: string, metadata: object }
 */
function formatDocument(formatId, documentType, data = {}) {
  const J  = JURISDICTIONS[formatId];
  const DT = DOCUMENT_TYPES[documentType];

  if (!J)  throw new Error(`Unknown jurisdiction formatId: "${formatId}"`);
  if (!DT) throw new Error(`Unknown documentType: "${documentType}"`);

  let text;

  switch (documentType) {
    case 'affidavit':              text = buildAffidavit(formatId, data);           break;
    case 'witness-statement':      text = buildWitnessStatement(formatId, data);    break;
    case 'order':                  text = buildOrder(formatId, data);               break;
    case 'consent-order':          text = buildOrder(formatId, { ...data, documentTitle: 'CONSENT ORDER' }); break;
    case 'divorce-petition':       text = buildDivorcePetition(formatId, data);    break;
    case 'insurance-claim':        text = buildInsuranceClaim(formatId, data);     break;
    case 'notice-of-appeal':       text = buildNoticeOfAppeal(formatId, data);     break;
    case 'claim-form':
    case 'defence':
    case 'counterclaim':
    case 'judicial-review':
    case 'originating-application':
    case 'injunction-application':
    case 'children-application':
    case 'probate-application':
    case 'statutory-demand':
    case 'factum':
      text = buildHeader(formatId, {
        ...data,
        documentTitle: data.documentTitle || DT.label.toUpperCase()
      });
      text += `\n[Document body — ${DT.label}]\n\n`;
      text += data.body || '';
      text += _buildLegalRepBlock(J, data.party1Role || J.defaultParty1, data.firmName, data.firmAddress, data.firmTel, data.firmEmail);
      break;
    default:
      text = buildHeader(formatId, data);
  }

  return {
    text,
    metadata: {
      formatId,
      documentType,
      jurisdiction: J.label,
      country: J.country,
      caseRefLabel: J.caseRefLabel,
      caseRef: data.caseRef || null,
      party1: { name: data.party1Name, role: data.party1Role || J.defaultParty1 },
      party2: { name: data.party2Name, role: data.party2Role || J.defaultParty2 },
      generatedAt: new Date().toISOString(),
      rules: J.rules
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  JURISDICTIONS,
  DOCUMENT_TYPES,
  formatDocument,
  buildHeader,
  buildAffidavit,
  buildWitnessStatement,
  buildOrder,
  buildDivorcePetition,
  buildInsuranceClaim,
  buildNoticeOfAppeal,

  // Convenience: list available jurisdictions for a given country
  getJurisdictionsByCountry(country) {
    return Object.values(JURISDICTIONS).filter(j => j.country === country);
  },

  // Convenience: get jurisdiction config
  getJurisdiction(formatId) {
    return JURISDICTIONS[formatId] || null;
  },

  // Convenience: list all formatIds
  listFormatIds() {
    return Object.keys(JURISDICTIONS);
  },

  // Convenience: list all document types
  listDocumentTypes() {
    return Object.entries(DOCUMENT_TYPES).map(([id, dt]) => ({ id, ...dt }));
  }
};
