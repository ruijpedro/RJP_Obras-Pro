# RJP Obras Pro IA V4

Base Android + WebApp para gestão de obras, inspirada na evolução da RJP_Obras V3.1.

## Inclui
- Dashboard financeiro
- Obras
- Orçamentos / mapa de quantidades
- Composição de preços
- Medições / Autos
- Custos reais
- Diário de obra com IA local
- Assistente IA para PDFs/texto/GPT via Apps Script/backend
- PDF, Excel, backup local
- Google Sheets/Drive por Apps Script
- Workflows GitHub para WebApp e APK

## Como usar
1. Extrair o ZIP.
2. Enviar os ficheiros soltos para um repositório GitHub limpo.
3. Actions > Build WebApp ou Build Android APK.
4. No Google Apps Script, colar `google-apps-script/Code.gs`.
5. Publicar como App Web e colar o URL no separador Google da app.

## Nota IA/GPT
Não colocar API Key OpenAI dentro da APK. Usar Apps Script, Firebase, Supabase ou backend Node como ponte segura.
