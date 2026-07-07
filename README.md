# @notaas/danfse-viewer 🚀

O parser de XML e visualizador oficial e open-source para o **DANFSe v2.0 (Nota Técnica NT-008)** da NFS-e Nacional.

Gere representações visuais em HTML e PDF a partir de XMLs autorizados do Portal Nacional da NFS-e sem depender de APIs de terceiros. Totalmente compatível com navegadores, Node.js e Edge Functions (Cloudflare Workers/Pages).

## Características
- **Zero Node.js dependency**: Logo NFS-e embutida como constante base64, livre de operações `fs`.
- **100% Standalone**: Funciona com qualquer XML em conformidade com o padrão do SNNFSE Nacional, sem precisar de cadastro ou integração com a Notaas Platform.
- **Layout Inteligente (Flow-based)**: Supressão automática de blocos ausentes conforme regra da NT-008 (redistribuição do espaço livre).
- **Design Moderno e Responsivo**: Layout A4 perfeito e responsivo para telas ou impressão.

## Instalação
```bash
npm install @notaas/danfse-viewer
```

## Exemplo de Uso (TypeScript)
```typescript
import { DanfseXmlParser, DanfseHtmlBuilder } from '@notaas/danfse-viewer';

// Conteúdo de qualquer XML NFS-e Nacional compatível
const xmlString = `...conteúdo do XML da NFS-e...`;

// 1. Instanciar o Parser e extrair os dados tipados
const parser = new DanfseXmlParser();
const danfseData = await parser.parse(xmlString);

// 2. Instanciar o Builder e gerar o HTML completo
const builder = new DanfseHtmlBuilder();
const htmlContent = builder.build(danfseData);

// 3. (Opcional) Renderizar no navegador ou imprimir via Puppeteer
console.log(htmlContent);
```
