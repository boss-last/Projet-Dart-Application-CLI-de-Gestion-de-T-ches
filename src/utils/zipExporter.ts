import JSZip from 'jszip';
import { DART_FILES } from '../data/dartCodeFiles';

export async function downloadProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Add each file into the zip
  for (const file of DART_FILES) {
    zip.file(file.path, file.content);
  }

  // Generate the zip file blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Create temporary link and click it
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dart_task_cli.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
