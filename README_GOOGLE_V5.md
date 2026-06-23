# RJP Obras Pro IA V5 Google

## O que foi adicionado

- Separador Google reforçado.
- Sincronização para Google Sheets.
- Backup JSON automático no Google Drive.
- Criação de pastas por obra no Drive.
- Exportação completa: Sheets + Drive + estrutura por obra.

## Estrutura criada no Drive

```txt
RJP_Obras_Pro_IA
 ├─ 01_Obras
 │   └─ Nome_da_Obra
 │      ├─ 01_Orçamentos
 │      ├─ 02_Medições_Autos
 │      ├─ 03_PDFs
 │      ├─ 04_Fotos
 │      ├─ 05_Diário_de_Obra
 │      └─ 06_Relatórios
 └─ 99_Backups_JSON
```

## Passos Apps Script

1. Cria uma Google Sheet chamada `RJP_Obras_Pro_IA`.
2. Vai a `Extensões > Apps Script`.
3. Cola o conteúdo de `google-apps-script/Code.gs`.
4. Clica em `Implementar > Nova implementação`.
5. Tipo: `App Web`.
6. Executar como: `Eu`.
7. Quem tem acesso: `Qualquer pessoa com o link`.
8. Copia o URL terminado em `/exec`.
9. Cola esse URL no separador `Google` da app.

## Teste rápido

- Abre a app.
- Vai ao separador Google.
- Cola o URL Apps Script.
- Clica em `Sincronizar Sheets`.
- Clica em `Criar pastas por obra`.
- Confirma no Google Drive a pasta `RJP_Obras_Pro_IA`.
