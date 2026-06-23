/**
 * RJP Obras Pro IA V5.1 — Google + GPT seguro
 *
 * Funções:
 * - Sincronização Google Sheets
 * - Criação de pastas por obra no Google Drive
 * - Backups JSON no Drive
 * - Assistente IA via OpenAI API, sem colocar a API Key na APK/WebApp
 *
 * CONFIGURAÇÃO GPT:
 * 1) Apps Script > Definições do projeto > Propriedades do script.
 * 2) Adicionar propriedade:
 *      OPENAI_API_KEY = sk-...
 * 3) Publicar como App Web.
 * 4) Na app, colar o URL /exec em:
 *      URL Apps Script Sync
 *      URL Apps Script GPT / IA
 */
const APP_NAME = 'RJP Obras Pro IA';
const APP_VERSION = 'V5.1 Google + GPT';
const ROOT_FOLDER_NAME = 'RJP_Obras_Pro_IA';
const OPENAI_MODEL = 'gpt-4.1-mini';
const OBRA_SUBFOLDERS = [
  '01_Orçamentos',
  '02_Medições_Autos',
  '03_PDFs',
  '04_Fotos',
  '05_Diário_de_Obra',
  '06_Relatórios',
  '07_IA_PDF_GPT'
];

function doGet(e){
  return json({ok:true, app:APP_NAME, version:APP_VERSION, message:'RJP Obras Pro IA online'});
}

function doPost(e){
  try{
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const mode = body.mode || 'sync';
    const payload = body.payload || body;

    if(mode === 'gpt_pdf_text') return json(analisarTextoGPT(body));
    if(mode === 'create_folders') return json(createProjectFolders(payload.obras || []));
    if(mode === 'backup_drive') return json(saveBackup(payload));
    if(mode === 'sync_full'){
      const sheets = syncSheets(payload);
      const folders = createProjectFolders(payload.obras || []);
      const backup = saveBackup(payload);
      return json({ok:true, sheets:sheets, folders:folders, backup:backup});
    }

    return json(syncSheets(payload));
  }catch(err){
    return json({ok:false, error:String(err), stack:err && err.stack});
  }
}

function syncSheets(payload){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const keys = ['obras','orcamentos','composicoes','medicoes','diarios','custos','licencas','ncs','fotos','rend','iaDocs'];
  keys.forEach(key=>{
    if(Array.isArray(payload[key])) writeSheet(ss, key, payload[key]);
  });
  writeIndexSheet(ss, payload);
  return {ok:true, spreadsheetUrl:ss.getUrl(), message:'Dados gravados no Google Sheets'};
}

function writeSheet(ss, name, rows){
  let sh = ss.getSheetByName(name);
  if(!sh) sh = ss.insertSheet(name);
  sh.clear();
  if(!rows || !rows.length){
    sh.getRange(1,1).setValue('sem dados');
    return;
  }
  const heads = Array.from(new Set(rows.flatMap(r=>Object.keys(r))));
  sh.getRange(1,1,1,heads.length).setValues([heads]);
  sh.getRange(2,1,rows.length,heads.length).setValues(rows.map(r=>heads.map(h=>r[h] ?? '')));
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, heads.length);
}

function writeIndexSheet(ss, payload){
  let sh = ss.getSheetByName('Resumo');
  if(!sh) sh = ss.insertSheet('Resumo', 0);
  sh.clear();
  const orc = sum(payload.orcamentos, r => num(r.qtd) * num(r.pu));
  const med = sum(payload.medicoes, r => num(r.qtdAtual) * num(r.pu));
  const real = sum(payload.custos, r => num(r.real));
  const rows = [
    ['App', APP_NAME],
    ['Versão', APP_VERSION],
    ['Atualizado em', new Date()],
    ['N.º Obras', (payload.obras || []).length],
    ['Total Orçamentado', orc],
    ['Total Medido/Autos', med],
    ['Custo Real', real],
    ['Desvio Medido - Custo Real', med - real]
  ];
  sh.getRange(1,1,rows.length,2).setValues(rows);
  sh.autoResizeColumns(1,2);
}

function createProjectFolders(obras){
  const root = getOrCreateFolder(ROOT_FOLDER_NAME);
  const obrasRoot = getOrCreateSubFolder(root, '01_Obras');
  const backupRoot = getOrCreateSubFolder(root, '99_Backups_JSON');
  const created = [];
  (obras || []).forEach(o=>{
    const safe = safeName(o.nome || o.id || 'Obra_sem_nome');
    const f = getOrCreateSubFolder(obrasRoot, safe);
    OBRA_SUBFOLDERS.forEach(sf => getOrCreateSubFolder(f, sf));
    created.push({obra:o.nome || o.id, url:f.getUrl()});
  });
  return {ok:true, rootUrl:root.getUrl(), backupUrl:backupRoot.getUrl(), obras:created};
}

function saveBackup(payload){
  const root = getOrCreateFolder(ROOT_FOLDER_NAME);
  const backupRoot = getOrCreateSubFolder(root, '99_Backups_JSON');
  const name = 'backup_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '.json';
  const file = backupRoot.createFile(name, JSON.stringify(payload, null, 2), MimeType.PLAIN_TEXT);
  return {ok:true, fileName:name, fileUrl:file.getUrl(), rootUrl:root.getUrl()};
}

function analisarTextoGPT(body){
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  const texto = String(body.texto || '');
  const titulo = String(body.titulo || 'Documento de obra');
  const dados = body.dados || {};

  if(!apiKey){
    const local = analisarTextoLocal(body);
    local.aviso = 'OPENAI_API_KEY não configurada nas Propriedades do Script. Foi usada análise local.';
    return local;
  }

  const contexto = {
    totalArtigosOrcamento: (dados.orcamentos || []).length,
    totalMedicoes: (dados.medicoes || []).length,
    basePrecosDisponivel: (dados.rend || []).slice(0,20)
  };

  const prompt = [
    'És o Assistente IA da RJP Obras Pro IA.',
    'Responde em português de Portugal, com linguagem técnica de obra.',
    'Analisa o texto/PDF fornecido e devolve:',
    '1) Resumo técnico;',
    '2) Quantidades encontradas, com unidade;',
    '3) Artigos prováveis de orçamento/mapa de quantidades;',
    '4) Alertas de incoerências, omissões ou dúvidas;',
    '5) Sugestão de próximos passos para medições/autos.',
    'Não inventes medições. Quando a informação for insuficiente, assinala como “a confirmar”.',
    '',
    'Título: '+titulo,
    'Contexto da app: '+JSON.stringify(contexto),
    '',
    'Texto extraído:',
    texto.slice(0,45000)
  ].join('\n');

  const res = UrlFetchApp.fetch('https://api.openai.com/v1/responses', {
    method:'post',
    contentType:'application/json',
    headers:{Authorization:'Bearer '+apiKey},
    muteHttpExceptions:true,
    payload:JSON.stringify({
      model:OPENAI_MODEL,
      input:prompt,
      temperature:0.2,
      max_output_tokens:1800
    })
  });

  const status = res.getResponseCode();
  const text = res.getContentText();
  if(status < 200 || status >= 300){
    return {ok:false, status:status, error:text, fallback:analisarTextoLocal(body)};
  }

  const j = JSON.parse(text);
  const output = extractOpenAIText(j);
  saveIAResult(titulo, texto, output);
  return {ok:true, provider:'openai', model:OPENAI_MODEL, resultado:output, rawId:j.id || ''};
}

function saveIAResult(titulo, input, output){
  try{
    const root = getOrCreateFolder(ROOT_FOLDER_NAME);
    const iaRoot = getOrCreateSubFolder(root, '98_IA_Resultados');
    const name = 'ia_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '_' + safeName(titulo).slice(0,40) + '.txt';
    iaRoot.createFile(name, 'TÍTULO:\n'+titulo+'\n\nRESULTADO IA:\n'+output+'\n\n--- TEXTO ANALISADO ---\n'+input.slice(0,50000), MimeType.PLAIN_TEXT);
  }catch(err){}
}

function extractOpenAIText(j){
  if(j.output_text) return j.output_text;
  const parts = [];
  (j.output || []).forEach(item=>{
    (item.content || []).forEach(c=>{
      if(c.text) parts.push(c.text);
      if(c.type === 'output_text' && c.text) parts.push(c.text);
    });
  });
  return parts.join('\n').trim() || JSON.stringify(j,null,2).slice(0,8000);
}

function analisarTextoLocal(body){
  const texto = String(body.texto || '').toLowerCase();
  const quantidades = [...texto.matchAll(/(\d+[\.,]?\d*)\s*(m2|m²|m3|m³|m|ml|un|kg)/g)].map(m=>m[1]+' '+m[2]);
  const alertas = [];
  if(texto.includes('penaliza')) alertas.push('Possível cláusula de penalizações/prazos.');
  if(texto.includes('prazo')) alertas.push('Existem referências a prazo.');
  if(texto.includes('segurança')) alertas.push('Existem requisitos de segurança a verificar.');
  return {
    ok:true,
    provider:'local',
    resultado:'Análise local Apps Script:\nQuantidades detetadas: '+(quantidades.join(', ')||'nenhuma')+'\nAlertas: '+(alertas.join(' ')||'sem alertas automáticos')+'\nSugestão: validar unidades, associar ao artigo do orçamento e criar auto mensal.'
  };
}

function getOrCreateFolder(name){
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function getOrCreateSubFolder(parent, name){
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function safeName(s){
  return String(s).replace(/[\\/:*?"<>|#%{}~&]/g,'_').replace(/\s+/g,' ').trim().slice(0,120) || 'Obra';
}

function sum(rows, fn){
  return (rows || []).reduce((s,r)=>s+(fn(r)||0),0);
}

function num(v){
  return Number(String(v || 0).replace(',','.')) || 0;
}

function json(o){
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
