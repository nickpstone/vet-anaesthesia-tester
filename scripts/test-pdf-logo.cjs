const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true }
}).outputText, filename);

const { VET1_DEFAULT_LOGO } = require('../src/utils/defaultLogo.ts');
let dimensions = [300, 150];
let unreadable = false;
global.Image = class {
  set src(value) { this.naturalWidth = dimensions[0]; this.naturalHeight = dimensions[1]; queueMicrotask(() => unreadable ? this.onerror() : this.onload()); }
};
let canvas;
global.document = { createElement() {
  canvas = { getContext: () => ({ drawImage() {} }), toDataURL(type) { assert.equal(type, 'image/png'); return VET1_DEFAULT_LOGO; } };
  return canvas;
} };

(async () => {
  const { preparePdfLogo } = require('../src/utils/pdfLogo.ts');
  for (const format of ['png', 'jpeg', 'webp', 'svg+xml']) {
    const logo = await preparePdfLogo(`data:image/${format};base64,test`);
    assert.equal(logo.dataUrl, VET1_DEFAULT_LOGO);
    assert.equal(logo.width / logo.height, 2);
  }
  dimensions = [4000, 2000];
  await preparePdfLogo(VET1_DEFAULT_LOGO);
  assert.deepEqual([canvas.width, canvas.height], [1200, 600]);
  unreadable = true;
  await assert.rejects(preparePdfLogo(VET1_DEFAULT_LOGO), /Could not read/);
  unreadable = false;
  const { generateVaporiserPdf } = require('../src/utils/pdfGenerator.ts');
  const { createInitialMachineInfo, DEFAULT_TOLERANCE_CONFIG } = require('../src/utils/constants.ts');
  const { evaluateOverall } = require('../src/utils/calculations.ts');
  const options = { machine: createInitialMachineInfo(), runs: [], tolerance: DEFAULT_TOLERANCE_CONFIG,
    evaluation: evaluateOverall([], DEFAULT_TOLERANCE_CONFIG),
    company: { companyName: 'Example Company', phone: '', email: '', address: '', website: '', accreditationNumber: '', logoDataUrl: VET1_DEFAULT_LOGO } };
  const pdf = await generateVaporiserPdf(options);
  assert.match(pdf.output(), /\/Subtype \/Image/);
  if (process.env.PDF_LOGO_EXAMPLE) fs.writeFileSync(process.env.PDF_LOGO_EXAMPLE, Buffer.from(pdf.output('arraybuffer')));
  const plain = await generateVaporiserPdf({ ...options, company: { ...options.company, logoDataUrl: '' } });
  assert.doesNotMatch(plain.output(), /\/Subtype \/Image/);
  console.log('PASS: logo format normalisation, proportions, size limit, invalid image rejection, and real PDFs with/without the saved logo.');
})().catch(error => { console.error(error); process.exitCode = 1; });
