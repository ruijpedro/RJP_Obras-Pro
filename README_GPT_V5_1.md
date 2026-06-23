# RJP Obras Pro IA V5.1 — Fase GPT

Esta versão mantém a ligação Google da V5 e acrescenta um backend seguro em Apps Script para chamar o GPT sem colocar a API Key dentro da APK/WebApp.

## O que foi acrescentado

- `Code.gs` atualizado com modo `gpt_pdf_text`.
- Suporte a `OPENAI_API_KEY` nas Propriedades do Script.
- Análise IA de texto extraído de PDFs.
- Gravação automática dos resultados IA no Google Drive em `RJP_Obras_Pro_IA/98_IA_Resultados`.
- Nova subpasta por obra: `07_IA_PDF_GPT`.
- Fallback local caso a API Key não esteja configurada.

## Configuração rápida

1. Abre a Google Sheet da app.
2. Vai a **Extensões > Apps Script**.
3. Cola o conteúdo de `google-apps-script/Code.gs`.
4. Em **Definições do projeto > Propriedades do script**, adiciona:

```txt
OPENAI_API_KEY = a_tua_chave_openai
```

5. Vai a **Implementar > Nova implementação > Aplicação Web**.
6. Executar como: **Eu**.
7. Acesso: **Qualquer pessoa com o link**.
8. Copia o URL terminado em `/exec`.
9. Cola esse URL na app em:
   - URL Apps Script Sync
   - URL Apps Script GPT / IA

## Segurança

A chave OpenAI fica apenas no Apps Script. Não fica no código da app, nem no GitHub, nem dentro da APK.
