/**
 * RJP Obras Pro IA - Apps Script base
 * 1) Criar Google Sheet
 * 2) Extensões > Apps Script > colar este código
 * 3) Implementar > Nova implementação > App Web
 * 4) Executar como: Tu; Acesso: Qualquer pessoa com o link
 */
const APP_NAME = 'RJP Obras Pro IA';
const ROOT_FOLDER_NAME = 'RJP_Obras_Pro_IA';

function doGet(e){ return json({ok:true,app:APP_NAME,message:'RJP Obras Pro IA online'}); }

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents || '{}');
    const mode = body.mode || 'sync';
    if(mode === 'gpt_pdf_text') return json(analisarTextoLocal(body));
    const payload = body.payload || body;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    Object.keys(payload).forEach(key=>{
      if(Array.isArray(payload[key])) writeSheet(ss,key,payload[key]);
    });
    const folder = getOrCreateFolder(ROOT_FOLDER_NAME);
    const file = folder.createFile('backup_'+new Date().toISOString()+'.json', JSON.stringify(payload,null,2), MimeType.PLAIN_TEXT);
    return json({ok:true,fileUrl:file.getUrl()});
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

function getOrCreateFolder(name){
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext()?it.next():DriveApp.createFolder(name);
}

function analisarTextoLocal(body){
  const texto = String(body.texto || '').toLowerCase();
  const quantidades = [...texto.matchAll(/(\d+[\.,]?\d*)\s*(m2|m²|m3|m³|m|ml|un|kg)/g)].map(m=>m[1]+' '+m[2]);
  return {ok:true,resultado:'Análise local Apps Script:\nQuantidades detetadas: '+(quantidades.join(', ')||'nenhuma')+'\nSugestão: validar unidades, associar ao artigo do orçamento e criar auto mensal.'};
}

function json(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
