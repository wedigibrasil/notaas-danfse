import { describe, it, expect } from 'vitest';
import { DanfseXmlParser } from './parser.js';

// toLocaleString('pt-BR', { style: 'currency', ... }) usa NBSP (U+00A0) entre "R$" e o
// número, não um espaço comum — normaliza pra evitar comparações frágeis quebrando por
// causa de um caractere invisível.
function normSpace(s: string): string {
  return s.replace(/ /g, ' ');
}

// XML sintético (dados fictícios), mas com a mesma estrutura de uma NFS-e real autorizada
// pela SEFIN pós-Reforma Tributária: dois blocos <IBSCBS> (um calculado por ela em
// infNFSe, outro ecoando o que o emissor submeteu em DPS.infDPS) e alíquotas/valores
// municipais do IBS legitimamente zerados.
const SAMPLE_XML = `<?xml version="1.0" encoding="utf-8"?>
<NFSe>
  <infNFSe Id="NFS00000000000000000000000000000000000000000000001">
    <ambGer>2</ambGer>
    <cStat>100</cStat>
    <nNFSe>1</nNFSe>
    <dhProc>2026-01-01T10:00:00-03:00</dhProc>
    <emit>
      <CNPJ>11222333000181</CNPJ>
      <xNome>EMPRESA TESTE LTDA</xNome>
      <enderNac><xLgr>Rua Teste</xLgr><nro>1</nro><cMun>4106902</cMun><UF>PR</UF><CEP>80000000</CEP></enderNac>
      <fone>41999990000</fone>
      <email>teste@example.com</email>
    </emit>
    <valores><vLiq>100.00</vLiq></valores>
    <IBSCBS>
      <cLocalidadeIncid>4106902</cLocalidadeIncid>
      <xLocalidadeIncid>Curitiba</xLocalidadeIncid>
      <valores>
        <vBC>96.00</vBC>
        <uf><pIBSUF>0.10</pIBSUF><pAliqEfetUF>0.10</pAliqEfetUF></uf>
        <mun><pIBSMun>0.00</pIBSMun><pAliqEfetMun>0.00</pAliqEfetMun></mun>
        <fed><pCBS>0.90</pCBS><pAliqEfetCBS>0.90</pAliqEfetCBS></fed>
      </valores>
      <totCIBS>
        <vTotNF>100.00</vTotNF>
        <gIBS><vIBSTot>0.10</vIBSTot><gIBSUFTot><vIBSUF>0.10</vIBSUF></gIBSUFTot><gIBSMunTot><vIBSMun>0.00</vIBSMun></gIBSMunTot></gIBS>
        <gCBS><vCBS>0.90</vCBS></gCBS>
      </totCIBS>
    </IBSCBS>
    <DPS>
      <infDPS Id="DPS00000000000000000000000000000000000000000001">
        <tpAmb>2</tpAmb>
        <dhEmi>2026-01-01T10:00:00-03:00</dhEmi>
        <dCompet>2026-01-01</dCompet>
        <nDPS>1</nDPS>
        <serie>1</serie>
        <prest><CNPJ>11222333000181</CNPJ></prest>
        <toma><CPF>11122233344</CPF><xNome>CLIENTE TESTE</xNome></toma>
        <serv><cServ><cTribNac>040101</cTribNac><xDescServ>Serviço de teste</xDescServ></cServ></serv>
        <valores>
          <vServPrest><vServ>100.00</vServ></vServPrest>
          <trib>
            <totTrib><pTotTrib><pTotTribFed>10.00</pTotTribFed><pTotTribEst>0.00</pTotTribEst><pTotTribMun>0.00</pTotTribMun></pTotTrib></totTrib>
          </trib>
        </valores>
        <IBSCBS>
          <finNFSe>0</finNFSe>
          <indFinal>0</indFinal>
          <cIndOp>030101</cIndOp>
          <indDest>0</indDest>
          <valores><trib><gIBSCBS><CST>000</CST><cClassTrib>000001</cClassTrib></gIBSCBS></trib></valores>
        </IBSCBS>
      </infDPS>
    </DPS>
  </infNFSe>
</NFSe>`;

describe('DanfseXmlParser — merge dos blocos IBSCBS', () => {
  it('combina o IBSCBS calculado pela SEFIN (infNFSe) com o submetido pelo emissor (DPS.infDPS)', async () => {
    const data = await new DanfseXmlParser().parse(SAMPLE_XML);

    // Só existiam no bloco calculado pela SEFIN (infNFSe.IBSCBS).
    expect(normSpace(data.vBCIbs)).toBe('R$ 96,00');
    expect(data.aliqIbs).toBe('0,10% / 0,00%');
    expect(normSpace(data.vIBSTot)).toBe('R$ 0,10');
    expect(normSpace(data.vCBS)).toBe('R$ 0,90');

    // Só existiam no bloco submetido (DPS.infDPS.IBSCBS).
    expect(data.cstClass).toBe('000 / 000001');
    expect(data.indOpLocal).toBe('030101 / 4106902 / Curitiba');
  });
});

describe('DanfseXmlParser — zero legítimo vs. campo ausente', () => {
  it('mostra "0,00%"/"R$ 0,00" quando o XML traz o valor zero explicitamente, não "-"', async () => {
    const data = await new DanfseXmlParser().parse(SAMPLE_XML);

    // pIBSMun/pAliqEfetMun/vIBSMun vêm como "0.00" no XML (alíquota municipal
    // legitimamente zerada) — antes do fix isso virava "-", como se o campo nem
    // existisse.
    expect(data.pAliqEfetMun).toBe('0,00%');
    expect(normSpace(data.vIBSMun)).toBe('R$ 0,00');
  });

  it('ainda mostra "-" quando o campo realmente não vem no XML', async () => {
    const data = await new DanfseXmlParser().parse(SAMPLE_XML);

    // vRetIRRF nunca aparece neste XML de exemplo — deve continuar "-".
    expect(data.vRetIRRF).toBe('-');
  });
});

describe('DanfseXmlParser — "Totais Aproximados dos Tributos" (Lei da Transparência)', () => {
  it('formata em pt-BR (vírgula decimal), igual ao resto do documento', async () => {
    const data = await new DanfseXmlParser().parse(SAMPLE_XML);

    expect(data.infoCompl).toContain('Federais: 10,00%');
    expect(data.infoCompl).toContain('Estaduais: 0,00%');
    expect(data.infoCompl).toContain('Municipais: 0,00%');
    expect(data.infoCompl).not.toMatch(/\d\.\d\d%/); // nunca ponto decimal
  });
});
