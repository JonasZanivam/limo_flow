import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

type PdfLine = {
  text: string;
  options?: PDFKit.Mixins.TextOptions;
};

@Injectable()
export class PdfService {
  generateDocument(title: string, lines: PdfLine[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = this.createDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.writeTitle(doc, title);

      for (const line of lines) {
        doc.fontSize(12).text(line.text, line.options);
        doc.moveDown(0.5);
      }

      doc.end();
    });
  }

  generateContractPdf(title: string, body: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = this.createDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.writeTitle(doc, title);
      doc.fontSize(12).text(body, { align: 'left', lineGap: 4 });
      this.writeSignatureBlock(doc);
      doc.end();
    });
  }

  private createDocument() {
    return new PDFDocument({ margin: 50 });
  }

  private writeTitle(doc: PDFKit.PDFDocument, title: string) {
    doc.fontSize(18).text(title, { align: 'center' });
    doc.moveDown(1.5);
  }

  private writeSignatureBlock(doc: PDFKit.PDFDocument) {
    const pageWidth =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const leftMargin = doc.page.margins.left;
    const gap = 40;
    const columnWidth = (pageWidth - gap) / 2;
    const leftX = leftMargin;
    const rightX = leftMargin + columnWidth + gap;

    doc.moveDown(2);
    doc
      .fontSize(12)
      .text('Por estarem de acordo, firmam o presente contrato.', {
        align: 'center',
      });

    const signatureY = doc.y + 36;

    doc
      .moveTo(leftX, signatureY)
      .lineTo(leftX + columnWidth, signatureY)
      .stroke();
    doc.fontSize(11).text('CONTRATANTE', leftX, signatureY + 10, {
      width: columnWidth,
      align: 'center',
    });

    doc
      .moveTo(rightX, signatureY)
      .lineTo(rightX + columnWidth, signatureY)
      .stroke();
    doc.fontSize(11).text('CONTRATADA', rightX, signatureY + 10, {
      width: columnWidth,
      align: 'center',
    });
  }
}
