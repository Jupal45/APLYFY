/**
 * Generates a high-resolution vertical (portrait A4) JPG Data URL for a document.
 * Preserves all rich text formatting (bold, italic, underline, text colors, font sizes, alignments, headings, and lists).
 */

function prepareXhtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br(\s*>|\s+[^>]*>)/gi, '<br/>')
    .replace(/<hr(\s*>|\s+[^>]*>)/gi, '<hr/>')
    .replace(/<img(\s+[^>]*)(?<!\/)>/gi, '<img$1/>');
}

function escapeXmlText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function generateDocumentJpg(
  title: string,
  htmlContent: string,
  plainText: string
): Promise<string> {
  // Portrait Vertical Dimensions (A4 Ratio ~ 1 : 1.41)
  const width = 1200;
  const minHeight = 1695; // 1200 * 1.4125
  const padding = 70;

  // Create temporary container to measure height with true layout
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = `${width}px`;
  container.style.padding = `${padding}px`;
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '20px';
  container.style.lineHeight = '1.6';
  container.style.boxSizing = 'border-box';

  const docTitle = title.trim() || 'Documento';
  const bodyHtml = htmlContent && htmlContent.trim() ? htmlContent : `<p>${escapeXmlText(plainText || '')}</p>`;

  container.innerHTML = `
    <div style="background-color: #ffffff; color: #000000; font-family: Arial, sans-serif; min-height: ${minHeight - padding * 2}px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h1 style="font-size: 40px; font-weight: bold; margin-bottom: 28px; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 14px; font-family: sans-serif; word-break: break-word;">
          ${escapeXmlText(docTitle)}
        </h1>
        <div style="font-size: 22px; line-height: 1.6; color: #000000; font-family: Arial, sans-serif;">
          ${bodyHtml}
        </div>
      </div>
      <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #cbd5e1; text-align: right; font-size: 14px; font-weight: bold; color: #64748b; font-family: sans-serif;">
        APLYFY
      </div>
    </div>
  `;

  document.body.appendChild(container);
  await new Promise((r) => setTimeout(r, 40));

  const contentHeight = Math.max(minHeight, container.scrollHeight + padding);
  const containerInnerHtml = prepareXhtml(container.innerHTML);
  document.body.removeChild(container);

  // SVG foreignObject string
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${contentHeight}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="background-color: #ffffff; width: ${width}px; min-height: ${contentHeight}px; padding: ${padding}px; box-sizing: border-box; font-family: Arial, sans-serif; color: #000000;">
          ${containerInnerHtml}
        </div>
      </foreignObject>
    </svg>
  `;

  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = contentHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        resolve(renderCanvasFallback(title, htmlContent, plainText));
        return;
      }

      // Fill pure white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, contentHeight);

      // Draw SVG image onto canvas
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(renderCanvasFallback(title, htmlContent, plainText));
    };

    img.src = url;
  });
}

/**
 * Fallback Canvas 2D Renderer
 */
function renderCanvasFallback(title: string, htmlContent: string, plainText: string): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const width = 1200;
  const minHeight = 1695;
  const padding = 70;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent || `<p>${plainText}</p>`, 'text/html');

  interface InlineSpan {
    text: string;
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    color: string;
    fontSize: number;
  }

  interface FormattedBlock {
    spans: InlineSpan[];
    isHeading?: boolean;
    headingLevel?: number;
  }

  const blocks: FormattedBlock[] = [];

  const parseSpans = (
    node: Node,
    parentBold = false,
    parentItalic = false,
    parentUnderline = false,
    parentColor = '#000000',
    parentSize = 22
  ): InlineSpan[] => {
    let result: InlineSpan[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent;
      if (txt) {
        result.push({
          text: txt,
          isBold: parentBold,
          isItalic: parentItalic,
          isUnderline: parentUnderline,
          color: parentColor,
          fontSize: parentSize,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      const isBold = parentBold || ['b', 'strong', 'h1', 'h2', 'h3'].includes(tag) || el.style.fontWeight === 'bold' || parseInt(el.style.fontWeight || '400') >= 600;
      const isItalic = parentItalic || ['i', 'em', 'cite'].includes(tag) || el.style.fontStyle === 'italic';
      const isUnderline = parentUnderline || ['u', 'ins'].includes(tag) || el.style.textDecoration?.includes('underline');

      let color = parentColor;
      if (el.style.color) {
        color = el.style.color;
      }

      let fontSize = parentSize;
      if (tag === 'h1') fontSize = 36;
      else if (tag === 'h2') fontSize = 30;
      else if (tag === 'h3') fontSize = 26;
      else if (el.style.fontSize) {
        const parsed = parseInt(el.style.fontSize);
        if (!isNaN(parsed)) fontSize = parsed;
      }

      Array.from(el.childNodes).forEach((child) => {
        result = result.concat(parseSpans(child, isBold, isItalic, isUnderline, color, fontSize));
      });
    }

    return result;
  };

  const processNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (['h1', 'h2', 'h3', 'p', 'div', 'blockquote', 'li'].includes(tag)) {
        const spans = parseSpans(el);
        if (spans.length > 0 && spans.some((s) => s.text.trim().length > 0)) {
          blocks.push({
            spans,
            isHeading: ['h1', 'h2', 'h3'].includes(tag),
            headingLevel: tag === 'h1' ? 1 : tag === 'h2' ? 2 : tag === 'h3' ? 3 : undefined,
          });
        }
      } else if (['ul', 'ol', 'body', 'section', 'article', 'main'].includes(tag)) {
        Array.from(el.childNodes).forEach(processNode);
      }
    }
  };

  processNode(doc.body);

  if (blocks.length === 0) {
    blocks.push({
      spans: [{ text: plainText || 'Documento', isBold: false, isItalic: false, isUnderline: false, color: '#000000', fontSize: 22 }],
    });
  }

  let totalHeight = padding * 2 + 150;
  blocks.forEach((b) => {
    totalHeight += (b.isHeading ? 50 : 38);
  });

  const finalHeight = Math.max(minHeight, totalHeight);
  canvas.width = width;
  canvas.height = finalHeight;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, finalHeight);

  // Title
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 38px Arial, sans-serif';
  ctx.fillText(title.trim() || 'Documento sin título', padding, padding + 35);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding + 55);
  ctx.lineTo(width - padding, padding + 55);
  ctx.stroke();

  let curY = padding + 100;

  blocks.forEach((block) => {
    let curX = padding;

    block.spans.forEach((span) => {
      let fontStyle = '';
      if (span.isItalic) fontStyle += 'italic ';
      if (span.isBold) fontStyle += 'bold ';
      const font = `${fontStyle}${span.fontSize}px Arial, sans-serif`;

      ctx.font = font;
      ctx.fillStyle = span.color || '#000000';

      ctx.fillText(span.text, curX, curY);
      const textWidth = ctx.measureText(span.text).width;

      if (span.isUnderline) {
        ctx.strokeStyle = span.color || '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curX, curY + 4);
        ctx.lineTo(curX + textWidth, curY + 4);
        ctx.stroke();
      }

      curX += textWidth;
    });

    curY += (block.isHeading ? 50 : 38);
  });

  return canvas.toDataURL('image/jpeg', 0.95);
}
