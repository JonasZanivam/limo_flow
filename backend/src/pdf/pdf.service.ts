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
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text(title, { align: 'center' });
      doc.moveDown(1.5);

      for (const line of lines) {
        doc.fontSize(12).text(line.text, line.options);
        doc.moveDown(0.5);
      }

      doc.end();
    });
  }
}
