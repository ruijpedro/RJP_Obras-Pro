/**
 * RJP Obras Pro IA V5 Google
 * Apps Script para Google Sheets + Google Drive + Pastas por Obra
 *
 * Como usar:
 * 1) Criar uma Google Sheet chamada RJP_Obras_Pro_IA.
 * 2) Extensões > Apps Script.
 * 3) Colar este Code.gs.
 * 4) Implementar > Nova implementação > App Web.
 * 5) Executar como: Eu.
 * 6) Acesso: Qualquer pessoa com o link.
 * 7) Copiar o URL /exec para a app.
 */
const APP_NAME = 'RJP Obras Pro IA';
const ROOT_FOLDER_NAME = 'RJP_Obras_Pro_IA';
const OBRA_SUBFOLDERS = [
  '01_Orçamentos',
  '02_Medições_Autos',
  '03_PDFs',
  '04_Fotos',
  '05_Diário_de_Obra',
  '06_Relatórios'
];

function doGet(e){
  return json({ok:true, app:APP_NAME, version:'V5 Google', message:'RJP Obras Pro IA online'});
}

function doPost(e){
  try{
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const mode = body.mode || 'sync';
    const payload = body.payload || body;

    if(mode === 'gpt_pdf_text') return json(analisarTextoLocal(body));
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
    ['Versão', 'V5 Google'],
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

function analisarTextoLocal(body){
  const texto = String(body.texto || '').toLowerCase();
  const quantidades = [...texto.matchAll(/(\d+[\.,]?\d*)\s*(m2|m²|m3|m³|m|ml|un|kg)/g)].map(m=>m[1]+' '+m[2]);
  return {
    ok:true,
    resultado:'Análise local Apps Script:\nQuantidades detetadas: '+(quantidades.join(', ')||'nenhuma')+'\nSugestão: validar unidades, associar ao artigo do orçamento e criar auto mensal.'
  };
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
