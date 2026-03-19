const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

class InvoiceService {
    static async generateOrderInvoice(order, settings) {
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Header & Branding ---
            if (settings.logo) {
                try {
                    const logoPath = path.join(__dirname, '..', settings.logo);
                    if (fs.existsSync(logoPath)) {
                        doc.image(logoPath, 50, 45, { width: 60 });
                    }
                } catch (e) {
                    console.error("Logo error in PDF", e);
                }
            }

            doc.fillColor('#444444')
                .fontSize(20)
                .text(settings.bar_name || 'BAR MANAGEMENT', 120, 50, { align: 'left' })
                .fontSize(10)
                .text(settings.bar_slogan || '', 120, 75)
                .moveDown();

            doc.fontSize(10)
                .text(settings.bar_address || '', 200, 50, { align: 'right' })
                .text(settings.bar_phone || '', 200, 65, { align: 'right' })
                .text(settings.bar_email || '', 200, 80, { align: 'right' })
                .moveDown();

            // --- Horizontal Line ---
            doc.moveTo(50, 110).lineTo(550, 110).stroke();

            // --- Invoice Info ---
            doc.fontSize(16).text('FACTURE / REÇU', 50, 130);
            doc.fontSize(10)
                .text(`Facture N°: INV-${order.id}-${new Date(order.createdAt || order.created_at).getTime()}`, 50, 155)
                .text(`Date: ${new Date(order.createdAt || order.created_at).toLocaleDateString('fr-FR')}`, 50, 170)
                .text(`Statut: ${order.status.toUpperCase()}`, 50, 185);

            // --- Table Header ---
            const tableTop = 230;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Désignation', 50, tableTop);
            doc.text('PU', 280, tableTop, { width: 90, align: 'right' });
            doc.text('Qté', 370, tableTop, { width: 40, align: 'right' });
            doc.text('Total', 410, tableTop, { width: 90, align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // --- Table Rows ---
            let i = 0;
            let currentY = tableTop + 25;
            doc.font('Helvetica');

            order.items.forEach(item => {
                const unitPrice = parseFloat(item.unit_price) || 0;
                const total = unitPrice * item.quantity;
                doc.text(item.Product.name, 50, currentY);
                doc.text(`${unitPrice.toLocaleString()} ${settings.currency_symbol || 'Ar'}`, 280, currentY, { width: 90, align: 'right' });
                doc.text(item.quantity.toString(), 370, currentY, { width: 40, align: 'right' });
                doc.text(`${total.toLocaleString()} ${settings.currency_symbol || 'Ar'}`, 410, currentY, { width: 90, align: 'right' });

                currentY += 20;
                i++;
            });

            // --- Totals Section ---
            const footerTop = currentY + 30;
            doc.fontSize(12).font('Helvetica-Bold');
            const orderTotal = parseFloat(order.total) || 0;
            doc.text(`TOTAL À PAYER : ${orderTotal.toLocaleString()} ${settings.currency_symbol || 'Ar'}`, 350, footerTop, { width: 200, align: 'right' });

            // --- Legal Footer ---
            const pageHeight = doc.page.height;
            doc.fontSize(8).font('Helvetica')
                .fillColor('#777777')
                .text(`NIF: ${settings.nif || 'N/A'} | STAT: ${settings.stat || 'N/A'} | RCS: ${settings.rcs || 'N/A'}`, 50, pageHeight - 100, { align: 'center', width: 500 })
                .text(settings.invoice_header || 'Merci de votre confiance !', 50, pageHeight - 85, { align: 'center', width: 500 });

            doc.end();
        });
    }
}

module.exports = InvoiceService;
