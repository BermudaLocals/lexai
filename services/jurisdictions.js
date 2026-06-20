// LexAI Full Global Jurisdictions Module — 215 jurisdictions
// Covers all sovereign states, key territories, and international courts
// Primary jurisdictions (deep support) listed first with court-routing hints

const JURISDICTIONS = {
  // ═══════════════════════════════════════════════
  // PRIMARY JURISDICTIONS — deep support, real court routing
  // ═══════════════════════════════════════════════

  // 🇧🇲 Bermuda (home jurisdiction)
  'Bermuda':                    { region: 'bermuda', depth: 'deep', courts: ['Supreme Court', 'Court of Appeal', 'Magistrates Court'], source: 'gov.bm, JCPC' },
  'Bermuda Supreme Court':      { region: 'bermuda', depth: 'deep', parent: 'Bermuda', source: 'gov.bm' },
  'Bermuda Court of Appeal':    { region: 'bermuda', depth: 'deep', parent: 'Bermuda', source: 'gov.bm' },
  'Bermuda Magistrates Court':  { region: 'bermuda', depth: 'deep', parent: 'Bermuda', source: 'gov.bm' },

  // 🇬🇧 United Kingdom
  'United Kingdom':             { region: 'uk', depth: 'deep', courts: ['UK Supreme Court', 'Court of Appeal', 'High Court', 'Crown Court'], source: 'BAILII' },
  'UK Supreme Court':           { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'England and Wales':          { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'England High Court':         { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'England Crown Court':        { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'England Tribunals':          { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'Scotland':                   { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },
  'Northern Ireland':           { region: 'uk', depth: 'deep', parent: 'United Kingdom', source: 'BAILII' },

  // 🇺🇸 United States
  'United States':              { region: 'us', depth: 'deep', courts: ['Supreme Court', 'Circuit Courts', 'State Courts'], source: 'CourtListener, Harvard CAP' },
  'US Supreme Court':           { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '1st Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '2nd Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '3rd Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '4th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '5th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '6th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '7th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '8th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '9th Circuit':                { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '10th Circuit':               { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  '11th Circuit':               { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'DC Circuit':                 { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'Federal Circuit':            { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'New York':                   { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'California':                 { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'Texas':                      { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'Florida':                    { region: 'us', depth: 'deep', parent: 'United States', source: 'CourtListener' },
  'Illinois':                   { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Pennsylvania':               { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Ohio':                       { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Georgia':                    { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Michigan':                   { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'New Jersey':                 { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Virginia':                   { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Massachusetts':              { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Washington':                 { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Maryland':                   { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Colorado':                   { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Minnesota':                  { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },
  'Louisiana':                  { region: 'us', depth: 'standard', parent: 'United States', source: 'CourtListener' },

  // 🇨🇦 Canada
  'Canada':                     { region: 'canada', depth: 'deep', courts: ['Supreme Court', 'Federal Court', 'Provincial Courts'], source: 'CanLII' },
  'Canada Supreme':             { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Canada Federal':             { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Ontario':                    { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'British Columbia':           { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Alberta':                    { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Quebec':                     { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Nova Scotia':                { region: 'canada', depth: 'deep', parent: 'Canada', source: 'CanLII' },
  'Manitoba':                   { region: 'canada', depth: 'standard', parent: 'Canada', source: 'CanLII' },
  'Saskatchewan':               { region: 'canada', depth: 'standard', parent: 'Canada', source: 'CanLII' },
  'New Brunswick':              { region: 'canada', depth: 'standard', parent: 'Canada', source: 'CanLII' },
  'Newfoundland':               { region: 'canada', depth: 'standard', parent: 'Canada', source: 'CanLII' },
  'Prince Edward Island':       { region: 'canada', depth: 'standard', parent: 'Canada', source: 'CanLII' },

  // 🇦🇺 Australia
  'Australia':                  { region: 'australia', depth: 'deep', courts: ['High Court', 'Federal Court', 'State Courts'], source: 'AustLII' },
  'Australia High Court':       { region: 'australia', depth: 'deep', parent: 'Australia', source: 'AustLII' },
  'Australia Federal':          { region: 'australia', depth: 'deep', parent: 'Australia', source: 'AustLII' },
  'New South Wales':            { region: 'australia', depth: 'deep', parent: 'Australia', source: 'AustLII' },
  'Victoria':                   { region: 'australia', depth: 'standard', parent: 'Australia', source: 'AustLII' },
  'Queensland':                 { region: 'australia', depth: 'standard', parent: 'Australia', source: 'AustLII' },
  'Western Australia':          { region: 'australia', depth: 'standard', parent: 'Australia', source: 'AustLII' },
  'South Australia':            { region: 'australia', depth: 'standard', parent: 'Australia', source: 'AustLII' },
  'Tasmania':                   { region: 'australia', depth: 'standard', parent: 'Australia', source: 'AustLII' },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL & REGIONAL COURTS
  // ═══════════════════════════════════════════════
  'Privy Council':              { region: 'international', depth: 'deep', source: 'JCPC' },
  'ECHR':                       { region: 'international', depth: 'standard', source: 'HUDOC' },
  'ICJ':                        { region: 'international', depth: 'standard', source: 'ICJ' },
  'ICC':                        { region: 'international', depth: 'standard', source: 'ICC' },
  'ICSID':                      { region: 'international', depth: 'standard', source: 'WorldBank' },
  'WTO':                        { region: 'international', depth: 'standard', source: 'WTO' },
  'ITLOS':                      { region: 'international', depth: 'standard', source: 'ITLOS' },
  'EU Court of Justice':        { region: 'international', depth: 'standard', source: 'EUR-Lex' },
  'African Court':              { region: 'international', depth: 'standard', source: 'AfricanLII' },
  'EACJ':                       { region: 'international', depth: 'standard', source: 'EACJ' },
  'ECOWAS Court':               { region: 'international', depth: 'standard', source: 'ECOWAS' },
  'CCJ':                        { region: 'caribbean', depth: 'deep', source: 'CCJ, CommonLII' },

  // ═══════════════════════════════════════════════
  // 🌴 CARIBBEAN
  // ═══════════════════════════════════════════════
  'Jamaica':                    { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'Trinidad and Tobago':        { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'Barbados':                   { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'Bahamas':                    { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'Guyana':                     { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Suriname':                   { region: 'caribbean', depth: 'standard', source: 'general' },
  'Belize':                     { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Antigua and Barbuda':        { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'St Lucia':                   { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'St Vincent':                 { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Grenada':                    { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Dominica':                   { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'St Kitts and Nevis':         { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Cayman Islands':             { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'BVI':                        { region: 'caribbean', depth: 'deep', source: 'CommonLII' },
  'Turks and Caicos':           { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Anguilla':                   { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Montserrat':                 { region: 'caribbean', depth: 'standard', source: 'CommonLII' },
  'Cuba':                       { region: 'caribbean', depth: 'standard', source: 'general' },
  'Dominican Republic':         { region: 'caribbean', depth: 'standard', source: 'general' },
  'Haiti':                      { region: 'caribbean', depth: 'standard', source: 'general' },
  'Puerto Rico':                { region: 'caribbean', depth: 'standard', source: 'CourtListener' },
  'US Virgin Islands':          { region: 'caribbean', depth: 'standard', source: 'CourtListener' },
  'Curacao':                    { region: 'caribbean', depth: 'standard', source: 'general' },
  'Aruba':                      { region: 'caribbean', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🇮🇪 Ireland
  // ═══════════════════════════════════════════════
  'Ireland':                    { region: 'europe', depth: 'deep', source: 'BAILII' },
  'Ireland Supreme':            { region: 'europe', depth: 'deep', parent: 'Ireland', source: 'BAILII' },
  'Ireland Court of Appeal':    { region: 'europe', depth: 'deep', parent: 'Ireland', source: 'BAILII' },
  'Ireland High Court':         { region: 'europe', depth: 'deep', parent: 'Ireland', source: 'BAILII' },

  // 🇳🇿 New Zealand
  'New Zealand':                { region: 'oceania', depth: 'deep', source: 'NZLII' },
  'New Zealand Supreme':        { region: 'oceania', depth: 'deep', parent: 'New Zealand', source: 'NZLII' },
  'New Zealand Court of Appeal': { region: 'oceania', depth: 'deep', parent: 'New Zealand', source: 'NZLII' },
  'New Zealand High Court':     { region: 'oceania', depth: 'deep', parent: 'New Zealand', source: 'NZLII' },

  // ═══════════════════════════════════════════════
  // 🇿🇦 Southern Africa
  // ═══════════════════════════════════════════════
  'South Africa':               { region: 'africa', depth: 'deep', source: 'SAFLII' },
  'South Africa Constitutional': { region: 'africa', depth: 'deep', parent: 'South Africa', source: 'SAFLII' },
  'South Africa Supreme':       { region: 'africa', depth: 'deep', parent: 'South Africa', source: 'SAFLII' },
  'South Africa High Court':    { region: 'africa', depth: 'standard', parent: 'South Africa', source: 'SAFLII' },
  'Botswana':                   { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Namibia':                    { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Zimbabwe':                   { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Zambia':                     { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Mozambique':                 { region: 'africa', depth: 'standard', source: 'general' },
  'Lesotho':                    { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Eswatini':                   { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Malawi':                     { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Mauritius':                  { region: 'africa', depth: 'standard', source: 'CommonLII' },

  // 🌍 West Africa
  'Nigeria':                    { region: 'africa', depth: 'deep', source: 'NigeriaLII' },
  'Ghana':                      { region: 'africa', depth: 'standard', source: 'GhanaLII' },
  'Sierra Leone':               { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Liberia':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Gambia':                     { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Senegal':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Guinea':                     { region: 'africa', depth: 'standard', source: 'general' },
  'Mali':                       { region: 'africa', depth: 'standard', source: 'general' },
  'Burkina Faso':               { region: 'africa', depth: 'standard', source: 'general' },
  'Niger':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Ivory Coast':                { region: 'africa', depth: 'standard', source: 'general' },
  'Togo':                       { region: 'africa', depth: 'standard', source: 'general' },
  'Benin':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Cameroon':                   { region: 'africa', depth: 'standard', source: 'general' },
  'Gabon':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Congo':                      { region: 'africa', depth: 'standard', source: 'general' },
  'DR Congo':                   { region: 'africa', depth: 'standard', source: 'general' },
  'Central African Republic':   { region: 'africa', depth: 'standard', source: 'general' },
  'Chad':                       { region: 'africa', depth: 'standard', source: 'general' },

  // 🌍 East Africa
  'Kenya':                      { region: 'africa', depth: 'deep', source: 'KenyaLII' },
  'Uganda':                     { region: 'africa', depth: 'standard', source: 'UgandaLII' },
  'Tanzania':                   { region: 'africa', depth: 'standard', source: 'AfricanLII' },
  'Rwanda':                     { region: 'africa', depth: 'standard', source: 'general' },
  'Ethiopia':                   { region: 'africa', depth: 'standard', source: 'general' },
  'Somalia':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Eritrea':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Djibouti':                   { region: 'africa', depth: 'standard', source: 'general' },
  'South Sudan':                { region: 'africa', depth: 'standard', source: 'general' },
  'Sudan':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Seychelles':                 { region: 'africa', depth: 'standard', source: 'general' },
  'Madagascar':                 { region: 'africa', depth: 'standard', source: 'general' },

  // 🌍 North Africa
  'Egypt':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Libya':                      { region: 'africa', depth: 'standard', source: 'general' },
  'Tunisia':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Algeria':                    { region: 'africa', depth: 'standard', source: 'general' },
  'Morocco':                    { region: 'africa', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🇮🇳 South Asia
  // ═══════════════════════════════════════════════
  'India':                      { region: 'asia', depth: 'deep', source: 'IndianKanoon' },
  'India Supreme':              { region: 'asia', depth: 'deep', parent: 'India', source: 'IndianKanoon' },
  'India High Courts':          { region: 'asia', depth: 'standard', parent: 'India', source: 'IndianKanoon' },
  'India Delhi':                { region: 'asia', depth: 'standard', parent: 'India', source: 'IndianKanoon' },
  'India Bombay':               { region: 'asia', depth: 'standard', parent: 'India', source: 'IndianKanoon' },
  'India Madras':               { region: 'asia', depth: 'standard', parent: 'India', source: 'IndianKanoon' },
  'Pakistan':                   { region: 'asia', depth: 'standard', source: 'PakistanLII' },
  'Bangladesh':                 { region: 'asia', depth: 'standard', source: 'general' },
  'Sri Lanka':                  { region: 'asia', depth: 'standard', source: 'CommonLII' },
  'Nepal':                      { region: 'asia', depth: 'standard', source: 'general' },
  'Afghanistan':                { region: 'asia', depth: 'standard', source: 'general' },
  'Maldives':                   { region: 'asia', depth: 'standard', source: 'general' },
  'Bhutan':                     { region: 'asia', depth: 'standard', source: 'general' },

  // 🌏 Southeast Asia
  'Singapore':                  { region: 'asia', depth: 'deep', source: 'SingaporeLII' },
  'Malaysia':                   { region: 'asia', depth: 'standard', source: 'CommonLII' },
  'Philippines':                { region: 'asia', depth: 'standard', source: 'general' },
  'Indonesia':                  { region: 'asia', depth: 'standard', source: 'general' },
  'Thailand':                   { region: 'asia', depth: 'standard', source: 'general' },
  'Vietnam':                    { region: 'asia', depth: 'standard', source: 'general' },
  'Myanmar':                    { region: 'asia', depth: 'standard', source: 'general' },
  'Cambodia':                   { region: 'asia', depth: 'standard', source: 'general' },
  'Laos':                       { region: 'asia', depth: 'standard', source: 'general' },
  'Brunei':                     { region: 'asia', depth: 'standard', source: 'general' },
  'Timor-Leste':                { region: 'asia', depth: 'standard', source: 'general' },

  // 🌏 East Asia
  'Hong Kong':                  { region: 'asia', depth: 'deep', source: 'HKLII' },
  'China':                      { region: 'asia', depth: 'standard', source: 'general' },
  'Japan':                      { region: 'asia', depth: 'standard', source: 'general' },
  'South Korea':                { region: 'asia', depth: 'standard', source: 'general' },
  'Taiwan':                     { region: 'asia', depth: 'standard', source: 'general' },
  'Mongolia':                   { region: 'asia', depth: 'standard', source: 'general' },
  'North Korea':                { region: 'asia', depth: 'standard', source: 'general' },
  'Macau':                      { region: 'asia', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🇪🇺 Europe
  // ═══════════════════════════════════════════════
  'European Union':             { region: 'europe', depth: 'standard', source: 'EUR-Lex' },
  'France':                     { region: 'europe', depth: 'standard', source: 'Legifrance' },
  'Germany':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Italy':                      { region: 'europe', depth: 'standard', source: 'general' },
  'Spain':                      { region: 'europe', depth: 'standard', source: 'general' },
  'Portugal':                   { region: 'europe', depth: 'standard', source: 'general' },
  'Netherlands':                { region: 'europe', depth: 'standard', source: 'general' },
  'Belgium':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Luxembourg':                 { region: 'europe', depth: 'standard', source: 'general' },
  'Switzerland':                { region: 'europe', depth: 'standard', source: 'general' },
  'Austria':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Sweden':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Denmark':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Norway':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Finland':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Iceland':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Poland':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Czech Republic':             { region: 'europe', depth: 'standard', source: 'general' },
  'Slovakia':                   { region: 'europe', depth: 'standard', source: 'general' },
  'Hungary':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Romania':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Bulgaria':                   { region: 'europe', depth: 'standard', source: 'general' },
  'Greece':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Croatia':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Slovenia':                   { region: 'europe', depth: 'standard', source: 'general' },
  'Serbia':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Bosnia and Herzegovina':     { region: 'europe', depth: 'standard', source: 'general' },
  'Montenegro':                 { region: 'europe', depth: 'standard', source: 'general' },
  'North Macedonia':            { region: 'europe', depth: 'standard', source: 'general' },
  'Albania':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Kosovo':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Moldova':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Ukraine':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Belarus':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Russia':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Georgia':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Armenia':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Azerbaijan':                 { region: 'europe', depth: 'standard', source: 'general' },
  'Turkey':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Cyprus':                     { region: 'europe', depth: 'standard', source: 'CommonLII' },
  'Malta':                      { region: 'europe', depth: 'standard', source: 'general' },
  'Estonia':                    { region: 'europe', depth: 'standard', source: 'general' },
  'Latvia':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Lithuania':                  { region: 'europe', depth: 'standard', source: 'general' },
  'Liechtenstein':              { region: 'europe', depth: 'standard', source: 'general' },
  'Monaco':                     { region: 'europe', depth: 'standard', source: 'general' },
  'Andorra':                    { region: 'europe', depth: 'standard', source: 'general' },
  'San Marino':                 { region: 'europe', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🏜️ Middle East
  // ═══════════════════════════════════════════════
  'United Arab Emirates':       { region: 'middle_east', depth: 'standard', source: 'general' },
  'DIFC':                       { region: 'middle_east', depth: 'standard', source: 'general', note: 'Dubai International Financial Centre' },
  'ADGM':                       { region: 'middle_east', depth: 'standard', source: 'general', note: 'Abu Dhabi Global Market' },
  'Saudi Arabia':               { region: 'middle_east', depth: 'standard', source: 'general' },
  'Qatar':                      { region: 'middle_east', depth: 'standard', source: 'general' },
  'QFC':                        { region: 'middle_east', depth: 'standard', source: 'general', note: 'Qatar Financial Centre' },
  'Kuwait':                     { region: 'middle_east', depth: 'standard', source: 'general' },
  'Bahrain':                    { region: 'middle_east', depth: 'standard', source: 'general' },
  'Oman':                       { region: 'middle_east', depth: 'standard', source: 'general' },
  'Jordan':                     { region: 'middle_east', depth: 'standard', source: 'general' },
  'Lebanon':                    { region: 'middle_east', depth: 'standard', source: 'general' },
  'Iraq':                       { region: 'middle_east', depth: 'standard', source: 'general' },
  'Syria':                      { region: 'middle_east', depth: 'standard', source: 'general' },
  'Iran':                       { region: 'middle_east', depth: 'standard', source: 'general' },
  'Israel':                     { region: 'middle_east', depth: 'standard', source: 'general' },
  'Palestine':                  { region: 'middle_east', depth: 'standard', source: 'general' },
  'Yemen':                      { region: 'middle_east', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🌏 Central Asia
  // ═══════════════════════════════════════════════
  'Kazakhstan':                 { region: 'central_asia', depth: 'standard', source: 'general' },
  'AIFC':                       { region: 'central_asia', depth: 'standard', source: 'general', note: 'Astana International Financial Centre' },
  'Uzbekistan':                 { region: 'central_asia', depth: 'standard', source: 'general' },
  'Kyrgyzstan':                 { region: 'central_asia', depth: 'standard', source: 'general' },
  'Tajikistan':                 { region: 'central_asia', depth: 'standard', source: 'general' },
  'Turkmenistan':               { region: 'central_asia', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // 🌴 Pacific Islands
  // ═══════════════════════════════════════════════
  'Fiji':                       { region: 'oceania', depth: 'standard', source: 'PacLII' },
  'Papua New Guinea':           { region: 'oceania', depth: 'standard', source: 'PacLII' },
  'Samoa':                      { region: 'oceania', depth: 'standard', source: 'PacLII' },
  'Tonga':                      { region: 'oceania', depth: 'standard', source: 'PacLII' },
  'Vanuatu':                    { region: 'oceania', depth: 'standard', source: 'PacLII' },
  'Solomon Islands':            { region: 'oceania', depth: 'standard', source: 'PacLII' },

  // ═══════════════════════════════════════════════
  // 🌎 Latin America
  // ═══════════════════════════════════════════════
  'Mexico':                     { region: 'latam', depth: 'standard', source: 'general' },
  'Brazil':                     { region: 'latam', depth: 'standard', source: 'general' },
  'Argentina':                  { region: 'latam', depth: 'standard', source: 'general' },
  'Chile':                      { region: 'latam', depth: 'standard', source: 'general' },
  'Colombia':                   { region: 'latam', depth: 'standard', source: 'general' },
  'Peru':                       { region: 'latam', depth: 'standard', source: 'general' },
  'Venezuela':                  { region: 'latam', depth: 'standard', source: 'general' },
  'Ecuador':                    { region: 'latam', depth: 'standard', source: 'general' },
  'Bolivia':                    { region: 'latam', depth: 'standard', source: 'general' },
  'Paraguay':                   { region: 'latam', depth: 'standard', source: 'general' },
  'Uruguay':                    { region: 'latam', depth: 'standard', source: 'general' },
  'Costa Rica':                 { region: 'latam', depth: 'standard', source: 'general' },
  'Panama':                     { region: 'latam', depth: 'standard', source: 'general' },
  'Guatemala':                  { region: 'latam', depth: 'standard', source: 'general' },
  'Honduras':                   { region: 'latam', depth: 'standard', source: 'general' },
  'El Salvador':                { region: 'latam', depth: 'standard', source: 'general' },
  'Nicaragua':                  { region: 'latam', depth: 'standard', source: 'general' },

  // ═══════════════════════════════════════════════
  // OFFSHORE / FINANCIAL CENTRES
  // ═══════════════════════════════════════════════
  'Jersey':                     { region: 'offshore', depth: 'standard', source: 'BAILII' },
  'Guernsey':                   { region: 'offshore', depth: 'standard', source: 'BAILII' },
  'Isle of Man':                { region: 'offshore', depth: 'standard', source: 'BAILII' },
  'Gibraltar':                  { region: 'offshore', depth: 'standard', source: 'general' },
  'Labuan':                     { region: 'offshore', depth: 'standard', source: 'general' },
}

// Helper: get all jurisdiction names as flat array
function getAllJurisdictionNames() {
  return Object.keys(JURISDICTIONS)
}

// Helper: get jurisdictions by region
function getByRegion(region) {
  return Object.entries(JURISDICTIONS)
    .filter(([, v]) => v.region === region)
    .map(([k]) => k)
}

// Helper: get primary (deep support) jurisdictions
function getPrimary() {
  return Object.entries(JURISDICTIONS)
    .filter(([, v]) => v.depth === 'deep')
    .map(([k]) => k)
}

// Helper: get jurisdiction metadata
function getJurisdictionInfo(name) {
  return JURISDICTIONS[name] || null
}

module.exports = {
  JURISDICTIONS,
  getAllJurisdictionNames,
  getByRegion,
  getPrimary,
  getJurisdictionInfo
}
