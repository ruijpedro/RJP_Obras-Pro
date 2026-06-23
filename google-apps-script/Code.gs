/**
 * RJP Obras Pro IA V6 - Apps Script
 * 1) Criar Google Sheet
 * 2) Extensões > Apps Script > colar este código
 * 3) Implementar > Nova implementação > App Web
 * 4) Executar como: Tu; Acesso: Qualquer pessoa com o link
 */
const APP_NAME = 'RJP Obras Pro IA V6';
const ROOT_FOLDER_NAME = 'RJP_Obras_Pro_IA';

function doGet(e){ return json({ok:true,app:APP_NAME,message:'RJP Obras Pro IA V6 online'}); }

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || '{}');
    const mode = body.mode || 'sync';
    if(mode === 'gpt_pdf_text') return json(analisarTextoLocal(body));
    if(mode === 'create_obra_folders') return json(createObraFolders(body.obraNome || 'Obra_sem_nome'));

    const payload = body.payload || body;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Object.keys(payload).forEach(key=>{
      if(Array.isArray(payload[key])) writeSheet(ss,key,payload[key]);
    });

    const root = getOrCreateFolder(ROOT_FOLDER_NAME);
    createDefaultFolders(root);
    const file = root.createFile('backup_'+new Date().toISOString()+'.json', JSON.stringify(payload,null,2), MimeType.PLAIN_TEXT);
    return json({ok:true,fileUrl:file.getUrl(),rootUrl:root.getUrl()});
  }catch(err){ return json({ok:false,error:String(err)}); }
}

function writeSheet(ss,name,rows){
  let sh = ss.getSheetByName(name); if(!sh) sh = ss.insertSheet(name); sh.clear();
  if(!rows.length){ sh.getRange(1,1).setValue('sem dados'); return; }
  const heads = [...new Set(rows.flatMap(r=>Object.keys(r)))];
  sh.getRange(1,1,1,heads.length).setValues([heads]);
  sh.getRange(2,1,rows.length,heads.length).setValues(rows.map(r=>heads.map(h=>r[h] ?? '')));
  sh.autoResizeColumns(1,heads.length);
}

function createObraFolders(obraNome){
  const root = getOrCreateFolder(ROOT_FOLDER_NAME);
  const obra = getOrCreateSubFolder(root, cleanName(obraNome));
  ['Projetos','Caderno_Encargos','Medições','Orçamentos','Autos','Relatórios','Fotografias','IA','Correspondência'].forEach(n=>getOrCreateSubFolder(obra,n));
  return {ok:true,obraUrl:obra.getUrl()};
}

function createDefaultFolders(root){
  ['Obras','Backups','Modelos','Relatórios_Gerais'].forEach(n=>getOrCreateSubFolder(root,n));
}

function getOrCreateFolder(name){
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext()?it.next():DriveApp.createFolder(name);
}
function getOrCreateSubFolder(parent,name){
  const it = parent.getFoldersByName(name);
  return it.hasNext()?it.next():parent.createFolder(name);
}
function cleanName(s){ return String(s||'Obra').replace(/[\\/:*?"<>|#%{}]/g,'_').slice(0,80); }

function analisarTextoLocal(body){
  const texto = String(body.texto || '').toLowerCase();
  const quantidades = [...texto.matchAll(/(\d+[\.,]?\d*)\s*(m2|m²|m3|m³|m|ml|un|kg)/g)].map(m=>m[1]+' '+m[2]);
  const prazos = [...texto.matchAll(/(\d+)\s*(dias|meses|semanas)/g)].map(m=>m[1]+' '+m[2]);
  return {ok:true,resultado:'Análise local Apps Script V6:\nQuantidades detetadas: '+(quantidades.join(', ')||'nenhuma')+'\nPrazos detetados: '+(prazos.join(', ')||'nenhum')+'\nSugestão: validar unidades, associar ao artigo do orçamento, criar medição/auto e arquivar no Drive da obra.'};
}

function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
