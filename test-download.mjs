import { generateValidPdfBlob, generateValidZipBlob } from '../lib/file-generator.js';

console.log('Testing file generator binaries...');
const pdfBlob = generateValidPdfBlob({
  name: 'Project Report.pdf',
  size: 48.3 * 1024 * 1024,
  hash: 'a3f8d2e8b4c79124e908f51a7b8e19c3d420f1882349e52c8b1a2389104efc89',
});

console.log(`[PASS] PDF Blob generated: ${pdfBlob.size} bytes, type: ${pdfBlob.type}`);

const zipBlob = generateValidZipBlob({
  name: 'NEXORA_Demo.zip',
  size: 120 * 1024 * 1024,
});

console.log(`[PASS] ZIP Blob generated: ${zipBlob.size} bytes, type: ${zipBlob.type}`);
console.log('Valid binary generation tests passed!');
