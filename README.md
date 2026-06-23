# RJP Obras Pro IA V6

Plataforma Android/Web para gestão de obras, orçamentos, medições, autos, PDF inteligente, Google e GPT.

## Novidades V6

- Separador **Medição PDF** para abrir plantas PDF no navegador.
- Calibração de escala com 2 pontos e distância real.
- Medição de comprimentos, perímetros e áreas.
- Conversão de medições PDF para artigos do orçamento.
- PDF inteligente com extração de texto por página.
- Criação de artigos a partir de análise IA/PDF.
- Orçamentos com capítulos/subcapítulos, quantidades, unidades e preços.
- Composição de preços com materiais, mão de obra, equipamentos, subempreitadas, desperdício e margem.
- Autos de medição com PDF individual.
- Exportação Excel e relatório PDF.
- Google Apps Script para sincronização com Sheets/Drive e ponte GPT segura.

## GitHub

Faz upload dos ficheiros/pastas soltos para o repositório, sem `node_modules` e sem `dist`.

```bash
npm install --no-audit --no-fund --legacy-peer-deps
npm run build
```

## Aviso

Software de apoio técnico. As medições, preços, relatórios e análises IA devem ser sempre validados pelo utilizador antes de aplicação profissional.


---

## V6.3 — Fotografias Inteligentes + GPS + IA

Esta fase prepara a aplicação para registo fotográfico técnico por obra.

### Inclui
- Fotografias por obra
- GPS
- Categorias técnicas
- Ligação a medições, autos, diário e não conformidades
- Relatórios fotográficos
- Preparação para IA visual

### Fluxo
Obra → Fotografia → GPS → Categoria → Observação → Diário/NC/Relatório → Drive
