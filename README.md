# RJP Obras Pro IA V5 Google V4.2

Base Android/WebApp para gestão de obras, orçamentos, composição de preços, medições/autos, custos reais, diário IA e análise de PDFs.

## Novidades V4.2

- Importação de PDF de texto diretamente no browser com `pdfjs-dist`.
- Separador **IA PDF / GPT** com botão para carregar PDF.
- Extração de texto por página para análise local ou envio para backend/Apps Script GPT.
- Botão **Criar artigos no orçamento** a partir de quantidades detetadas no texto/resultado IA.
- Botão **PDF Auto** em cada medição/auto.
- Mantém APK + WebApp + Apps Script, como na filosofia RJP Study.

## Atenção

PDFs digitalizados como imagem precisam de OCR ou análise visual através de backend seguro. Não colocar API Key da OpenAI dentro da APK.

## Comandos

```bash
npm install --legacy-peer-deps
npm run build
```

## Android

O workflow `.github/workflows/build-android.yml` gera APK via GitHub Actions.

## WebApp

O workflow `.github/workflows/build-web.yml` gera o pacote WebApp em `dist`.


## V5 Google

Inclui sincronização Google Sheets, backup Drive e criação de pastas por obra. Ver `README_GOOGLE_V5.md`.


## V5.1 — GPT seguro via Apps Script

Ver `README_GPT_V5_1.md`.
