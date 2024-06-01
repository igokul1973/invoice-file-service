import { z } from 'zod';

export const pdfCreateSchema = z.object({
    pageSettings: z
        .object({
            pageMargins: z.coerce
                .number()
                .or(z.tuple([z.coerce.number(), z.coerce.number()]))
                .or(z.tuple([z.coerce.number(), z.coerce.number(), z.coerce.number(), z.coerce.number()]))
                .optional(),
            pageSize: z.enum(['A3', 'A4', 'A5', 'LEGAL', 'LETTER']).optional(),
            pageOrientation: z.enum(['portrait', 'landscape']).optional(),
        })
        .optional(),

    data: z.object({
        logo: z.string().optional(),
        providerName: z.string(),
        qrCode: z.string().optional(),
        invoiceTitle: z.string(),
        customerInfo: z.string(),
        providerAddress: z.string(),
        invoiceTable: z.object({
            headerRow: z.array(z.string()),
            dataRows: z.array(z.array(z.string())),
            totalRows: z.array(z.array(z.string().or(z.object({ text: z.string(), bold: z.boolean().optional() })))),
        }),
        invoiceNumberTitle: z.string(),
        invoiceNumber: z.string(),
        customerNumberTitle: z.string(),
        invoiceDateTitle: z.string(),
        invoiceDate: z.string(),
        customerNumber: z.string(),
        additionalInfo: z.string().optional(),
        yourReferenceTitle: z.string(),
        yourReference: z.string(),
        ourReferenceTitle: z.string(),
        ourReference: z.string(),
        customerLocalIdentifierTitle: z.string(),
        customerLocalIdentifier: z.string(),
        providerLocalIdentifierTitle: z.string(),
        providerLocalIdentifier: z.string(),
        paymentTermsTitle: z.string(),
        paymentTerms: z.string(),
        payByTitle: z.string(),
        payBy: z.string(),
        deliveryTermsTitle: z.string(),
        deliveryTerms: z.string(),
        providerPhones: z.string(),
        bankingInfo: z.string(),
    }),
});
