require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { JURISDICTIONS, getJurisdictionInfo } = require('./jurisdictions');
const MODEL = 'claude-sonnet-4-6';
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const TEMPLATES = {
  nda: 'Non-Disclosure Agreement', msa: 'Master Services Agreement', employment: 'Employment Agreement',
  contractor: 'Independent Contractor Agreement', terms: 'Terms of Service', privacy: 'Privacy Policy',
  license: 'Software License Agreement', partnership: 'Partnership Agreement', llc: 'LLC Operating Agreement',
  shareholders: 'Shareholders Agreement', loan: 'Loan Agreement', purchase: 'Asset Purchase Agreement',
  consulting: 'Consulting Agreement', letter: 'Demand Letter', cease: 'Cease and Desist Letter',
  memo: 'Legal Memorandum', brief: 'Legal Brief', lease: 'Lease Agreement', will: 'Will and Testament',
  poa: 'Power of Attorney', loi: 'Letter of Intent', mou: 'Memorandum of Understanding',
  ip_assignment: 'IP Assignment Agreement', white_label: 'White Label Agreement', affiliate: 'Affiliate Agreement',
  cookie: 'Cookie Policy', dmca: 'DMCA Notice', trust: 'Trust Deed', custom: 'Custom Legal Document'
};
function getProvider(){return (process.env.AI_PROVIDER||'anthropic').toLowerCase().trim();}
function getConfig(){
  const provider=getProvider();
  if(provider==='ollama'){
    return {provider:'ollama',baseUrl:OLLAMA_URL,model:process.env.OLLAMA_MODEL||'llama3.1',visionModel:process.env.OLLAMA_VISION_MODEL||'llava'};
  }
  if(!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY required when AI_PROVIDER=anthropic');
  return {provider:'anthropic',apiKey:process.env.ANTHROPIC_API_KEY,model:process.env.ANTHROPIC_MODEL||MODEL};
}
function getAnthropicClient(){
  const cfg=getConfig();
  if(cfg.provider!=='anthropic') throw new Error('Anthropic client requested but provider is ollama');
  const Anthropic=require('@anthropic-ai/sdk');
  return new Anthropic({apiKey:cfg.apiKey});
}
async function callAI({system,prompt,maxTokens=4096,temperature=0.3,model}){
  const cfg=getConfig();
  if(cfg.provider==='ollama'){
    const fullPrompt=system?`${system}\n\n${prompt}`:prompt;
    const res=await fetch(`${cfg.baseUrl}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:model||cfg.model,prompt:fullPrompt,stream:false,options:{temperature,num_predict:maxTokens}})});
    if(!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    const data=await res.json();
    return data.response;
  } else {
    const client=getAnthropicClient();
    const res=await client.messages.create({model:model||cfg.model,max_tokens:maxTokens,temperature,system,messages:[{role:'user',content:prompt}]});
    return res.content[0]?.text||'';
  }
}
async function callClaude(args){return callAI(args);}
function selectModel(type,options={}){if(options&&options.model) return options.model; return getConfig().model;}
function resolveJurisdiction(jurisdiction){const name=jurisdiction||'Bermuda';const info=getJurisdictionInfo?getJurisdictionInfo(name):JURISDICTIONS[name];return {name,region:info?.region||'general',depth:info?.depth||'standard',courts:info?.courts||[],source:info?.source||''};}
async function draftDocument({type,parties,jurisdiction,details,tone,language}){
  const docName=TEMPLATES[type]||type||'Legal Document';const jx=resolveJurisdiction(jurisdiction);
  const lang=language&&language.toLowerCase()!=='english'?`Draft the ENTIRE document natively in ${language}.`:`Draft the document in English.`;
  const prompt=`Draft a ${docName} for ${jx.name} jurisdiction (region: ${jx.region}). Parties: ${parties||'TBD'} Details: ${details||'Standard terms'} Tone: ${tone||'professional'} ${lang} Provide complete document with numbered sections.`;
  const system=`You are LexAI, expert legal AI covering 290+ jurisdictions. Draft precise complete legal documents.`;
  return callClaude({system,prompt,maxTokens:4096,temperature:0.3});
}
async function analyzeDocument({content,analysis_type,jurisdiction,focus_areas}){const jx=resolveJurisdiction(jurisdiction);const focus=Array.isArray(focus_areas)&&focus_areas.length?`Focus: ${focus_areas.join(', ')}`:'';const prompt=`Analyze for ${jx.name}. Type: ${analysis_type||'general'}. ${focus}\n\n${content}`;const system=`You are LexAI contract analysis for ${jx.name}.`;return callClaude({system,prompt,maxTokens:4096,temperature:0.2});}
async function researchCaseLaw({query,jurisdictions,area_of_law,include_echr,include_privy_council}){const jxList=Array.isArray(jurisdictions)&&jurisdictions.length?jurisdictions.join(', '):'all relevant';const prompt=`Research: "${query}" Jurisdictions: ${jxList} Area: ${area_of_law||'general'} ${include_echr?'Include ECHR':''} ${include_privy_council?'Include Privy Council':''}`;const system=`You are LexAI legal research engine.`;return callClaude({system,prompt,maxTokens:4096,temperature:0.2});}
async function predictLitigation({facts,jurisdiction,claim_type,opposing_arguments}){const jx=resolveJurisdiction(jurisdiction);const prompt=`Litigation assessment for ${jx.name} claim ${claim_type||'civil'} Facts: ${facts} Opposing: ${opposing_arguments||'none'}`;const system=`You are LexAI litigation prediction for ${jx.name}.`;return callClaude({system,prompt,maxTokens:3000,temperature:0.3});}
async function comparativeLaw({topic,jurisdictions,focus}){const jxList=Array.isArray(jurisdictions)&&jurisdictions.length?jurisdictions:['Bermuda','United Kingdom','United States'];const prompt=`Compare ${topic} for ${jxList.join(', ')} Focus: ${focus||'general'}`;const system=`You are LexAI comparative law engine.`;return callClaude({system,prompt,maxTokens:4096,temperature:0.2});}
async function horizonScan({jurisdictions,practice_areas,organisation_type}){const jxList=Array.isArray(jurisdictions)&&jurisdictions.length?jurisdictions.join(', '):'Bermuda, UK, US';const areas=Array.isArray(practice_areas)&&practice_areas.length?practice_areas.join(', '):'general';const prompt=`Horizon scan Jurisdictions: ${jxList} Areas: ${areas} Org: ${organisation_type||'business'}`;const system=`You are LexAI horizon scanning.`;return callClaude({system,prompt,maxTokens:3000,temperature:0.3});}
async function safeguardingSupport({case_type,facts,jurisdiction,organisation_type,concern_type}){const jx=resolveJurisdiction(jurisdiction);const prompt=`Safeguarding ${case_type||'concern'} ${concern_type||''} in ${jx.name} Facts: ${facts} Org: ${organisation_type||'org'}`;const system=`You are LexAI safeguarding for ${jx.name}.`;return callClaude({system,prompt,maxTokens:2500,temperature:0.2});}
async function buildCaseSummary({case_facts,jurisdiction,area_of_law,purpose}){const jx=resolveJurisdiction(jurisdiction);const prompt=`Case summary for ${jx.name} Area: ${area_of_law||'general'} Purpose: ${purpose||'review'} Facts: ${case_facts}`;const system=`You are LexAI case summary for ${jx.name}.`;return callClaude({system,prompt,maxTokens:2500,temperature:0.2});}
async function buildChronology({events,context,jurisdiction,purpose}){const jx=resolveJurisdiction(jurisdiction);const prompt=`Chronology for ${jx.name} Context: ${context||''} Purpose: ${purpose||'prep'} Events: ${events}`;const system=`You are LexAI chronology builder.`;return callClaude({system,prompt,maxTokens:2500,temperature:0.1});}
async function learnFromDocument(userId,content,type){try{console.log(`[ai] learnFromDocument user=${userId} type=${type} len=${(content||'').length}`);return {recorded:true};}catch(e){return {recorded:false};}}
async function generateDocument(prompt,type='contract',options={}){
  const cfg=getConfig();
  const model=selectModel(type,{...options,model:cfg.model});
  const text=typeof prompt==='string'?prompt:prompt.prompt||JSON.stringify(prompt);
  const result=await callAI({prompt:text,maxTokens:options.maxTokens||4096,temperature:options.temperature||0.3,model});
  if(typeof prompt==='string') return {draft:result,model,usage:{}};
  return result;
}
async function transcribeImage({buffer,mediaType}){
  const cfg=getConfig();
  try{
    if(cfg.provider==='ollama'){
      const base64=buffer.toString('base64');
      const res=await fetch(`${cfg.baseUrl}/api/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:cfg.visionModel,prompt:'Transcribe every word of text visible in this document image.',images:,stream:false})});
      if(!res.ok) throw new Error(`Ollama vision ${res.status}: ${await res.text()}`);
      const data=await res.json();
      return data.response;
    } else {
      const client=getAnthropicClient();
      const base64=buffer.toString('base64');
      const res=await client.messages.create({model:cfg.model,max_tokens:4096,temperature:0,system:'You transcribe documents from photos with perfect accuracy. Output ONLY transcribed text.',messages:[{role:'user',content:[{type:'image',source:{type:'base64',media_type:mediaType||'image/png',data:base64}},{type:'text',text:'Transcribe every word visible.'}]}]});
      return res.content[0]?.text||'';
    }
  }catch(err){console.error('[ai] transcribeImage error:',err.message);throw new Error(`Image transcription failed: ${err.message}`);}
}
module.exports={getProvider,getConfig,callAI,generateDocument,selectModel,TEMPLATES,JURISDICTIONS,draftDocument,analyzeDocument,researchCaseLaw,predictLitigation,comparativeLaw,horizonScan,safeguardingSupport,buildCaseSummary,buildChronology,learnFromDocument,transcribeImage};
