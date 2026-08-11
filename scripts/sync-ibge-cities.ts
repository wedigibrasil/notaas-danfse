import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IbgeApiItem {
    id: number;
    nome: string;
    microrregiao?: {
        mesorregiao?: {
            UF?: {
                sigla?: string;
            };
        };
    };
    'regiao-imediata'?: {
        'regiao-intermediaria'?: {
            UF?: {
                sigla?: string;
            };
        };
    };
}

async function syncIbgeCities(): Promise<void> {
    console.log('🔄 Sincronizando municípios com a API oficial do IBGE...');
    const res = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
    if (!res.ok) {
        throw new Error(`Falha ao consultar API do IBGE: HTTP ${res.status}`);
    }

    const items = (await res.json()) as IbgeApiItem[];
    console.log(`📦 ${items.length} municípios recebidos do IBGE. Compilando mapa...`);

    const dict: Record<string, [string, string]> = {};

    for (const item of items) {
        const id = String(item.id).padStart(7, '0');
        const nome = item.nome.trim().toUpperCase();
        const uf =
            item.microrregiao?.mesorregiao?.UF?.sigla ??
            item['regiao-imediata']?.['regiao-intermediaria']?.UF?.sigla ??
            '';
        dict[id] = [nome, uf];
    }

    const targetFile = path.join(__dirname, '../src/ibge-cities.ts');
    const content = `/**
 * Tabela oficial estática de municípios do IBGE (5.571 municípios).
 * Gerada automaticamente via \`npm run sync-ibge\`.
 */
export const IBGE_CITIES: Record<string, [string, string]> = ${JSON.stringify(dict, null, 2)};

export function getIbgeCity(code: string): { xMun: string; uf: string } | undefined {
    const entry = IBGE_CITIES[String(code).trim()];
    if (!entry) return undefined;
    return { xMun: entry[0], uf: entry[1] };
}
`;

    fs.writeFileSync(targetFile, content, 'utf-8');
    console.log(`✅ Arquivo src/ibge-cities.ts gerado com sucesso! (${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);
}

syncIbgeCities().catch((err) => {
    console.error('❌ Erro na sincronização IBGE:', err);
    process.exit(1);
});
