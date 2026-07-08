# @notaas/danfse-viewer 🚀

[![NPM Version](https://img.shields.io/npm/v/@notaas/danfse-viewer?color=indigo)](https://www.npmjs.com/package/@notaas/danfse-viewer)
[![License](https://img.shields.io/npm/l/@notaas/danfse-viewer?color=blue)](https://github.com/wedigibrasil/notaas-danfse/blob/main/LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/wedigibrasil/notaas-danfse)

O parser de XML e visualizador de referência, **100% open-source**, para o **DANFSe v2.0 (Nota Técnica NT-008)** da NFS-e Nacional.

Gere representações visuais em HTML e PDF a partir de XMLs autorizados do Portal Nacional da NFS-e sem depender de APIs de terceiros. Totalmente compatível com navegadores, Node.js e Edge Functions (Cloudflare Workers/Pages).

---

## 📢 ATENÇÃO: Desligamento da API Oficial SNNFSE (ADN) em 15/07/2026

O Portal Nacional da NFS-e desativará a API pública do Visualizador (ADN) em **15 de julho de 2026**. Com isso, sistemas que dependem do redirecionamento oficial ou de renderizadores remotos do governo deixarão de exibir a representação gráfica do DANFSe. 

Esta biblioteca foi desenvolvida pela **[Notaas](https://www.notaas.com.br)** para servir como a implementação open-source de referência para a comunidade brasileira contornar este desligamento de forma local, rápida e gratuita.

> 💡 **Precisa de uma infraestrutura gerenciada, escalável e resiliente?**
> A plataforma **[notaas](https://www.notaas.com.br)** oferece APIs de alta performance para emissão, consulta, cancelamento de NFS-e Nacional e geração distribuída de PDFs com suporte 24/7.

---

## 🖥️ Demonstração Online

Você pode testar a renderização do seu XML agora mesmo de forma visual no nosso demonstrador gratuito hospedado em Cloudflare Pages:
🔗 **[Visualizador DANFSe Online](https://danfse.notaas.com.br)**

---

## ✨ Características

- **Zero Node.js Dependency**: Utiliza constantes base64 para ativos (como o logotipo oficial do SNNFSE), livre de chamadas de sistema ou operações `fs`. Funciona nativamente no browser, Cloudflare Workers ou Vercel Edge.
- **Conformidade Estrita com a NT-008**: Suporta a supressão automática de blocos e campos não preenchidos, redistribuindo o espaço do layout A4 inteligentemente (Flow-based Layout).
- **Extensível via OOP**: Desenhado em TypeScript utilizando Programação Orientada a Objetos (OOP), herança e polimorfismo, permitindo que você estenda o parser ou o renderizador de HTML para customizar fontes, estilos e regras de exibição da sua empresa.

---

## 📦 Instalação

```bash
npm install @notaas/danfse-viewer
```

---

## 🚀 Exemplo de Uso Rápido (TypeScript)

```typescript
import { DanfseXmlParser, DanfseHtmlBuilder } from '@notaas/danfse-viewer';

const xmlString = `<?xml version="1.0" encoding="utf-8"?><NFSe ...>...</NFSe>`;

// 1. Instanciar o Parser e processar os dados
const parser = new DanfseXmlParser();
const data = await parser.parse(xmlString);

// 2. Gerar o código HTML completo do DANFSe
const builder = new DanfseHtmlBuilder();
const html = builder.build(data);

// 3. Exibir no browser ou enviar para o Puppeteer gerar PDF
document.getElementById('danfse-container').innerHTML = html;
```

---

## 🛠️ Customização e Extensibilidade (OOP & Polimorfismo)

A biblioteca expõe classes base que você pode herdar para adicionar comportamentos customizados.

### Exemplo: Customizando o Builder HTML para mudar o tema/cores

```typescript
import { DanfseHtmlBuilder, DanfseData } from '@notaas/danfse-viewer';

// Herdando da classe base e aplicando Polimorfismo no método build
class CustomDanfseBuilder extends DanfseHtmlBuilder {
    
    // Sobrescrevendo o método build para injetar CSS customizado
    public override build(data: DanfseData): string {
        const baseHtml = super.build(data);
        
        // Injeta estilos personalizados para adequar à marca da sua empresa
        const customStyles = `
            <style>
                .danfse-container { font-family: 'Inter', sans-serif; }
                .bg-cinza { background-color: #f3f4f6 !important; }
                .lbl { color: #4b5563; font-weight: 600; }
            </style>
        `;
        
        return baseHtml.replace('</head>', `${customStyles}</head>`);
    }
}

const customBuilder = new CustomDanfseBuilder();
const customHtml = customBuilder.build(data);
```

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para obter mais informações.

Desenvolvido com ❤️ por **[Notaas](https://www.notaas.com.br)**.
