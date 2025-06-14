import { getDocument, OPS } from 'pdfjs-dist';
import { Readability } from '@mozilla/readability';

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type !== 'PARSE_PDF') return;

  const pdf = await getDocument({ data: msg.pdfBuf }).promise;
  let html = '<article>';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const tc = await page.getTextContent();
    html += '<p>' + tc.items.map((t: any) => t.str).join(' ') + '</p>';

    const ops = await page.getOperatorList();
    for (let j = 0; j < ops.fnArray.length; j++) {
      if (ops.fnArray[j] === OPS.paintImageXObject) {
        const img = await page.objs.get(ops.argsArray[j][0]);
        const url = await imageDataToURL(img);
        html += `<img src="${url}" />`;
      }
    }

    page.cleanup();
  }
  html += '</article>';

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const article = new Readability(doc).parse();
  const content = article?.content ?? '<p>(No readable content found)</p>';

  chrome.tabs.sendMessage(msg.tabId, {
    type: 'SHOW_READER',
    html: content,
    title: article?.title || 'Reader View'
  });
});

function imageDataToURL(img: any): Promise<string> {
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d') as any;
  ctx.putImageData(img, 0, 0);
  return (canvas as any).convertToBlob({ type: 'image/png' }).then(
    (blob: Blob) =>
      new Promise<string>((res) => {
        const fr = new FileReader();
        fr.onload = () => res(fr.result as string);
        fr.readAsDataURL(blob);
      })
  );
}
