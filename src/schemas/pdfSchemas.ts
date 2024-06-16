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
        invoiceNumber: z.string(),
        paymentAmountTitle: z.string(),
        paymentAmount: z.string(),
        customerCodeTitle: z.string(),
        invoiceDateTitle: z.string(),
        invoiceDate: z.string(),
        customerCode: z.string().nullable(),
        additionalInfoTitle: z.string(),
        additionalInfo: z.string().nullish(),
        customerReferenceTitle: z.string(),
        customerReference: z.string().nullish(),
        providerReferenceTitle: z.string(),
        providerReference: z.string().nullish(),
        customerLocalIdentifierTitle: z.string().nullish(),
        customerLocalIdentifierValue: z.string().nullish(),
        providerLocalIdentifierTitle: z.string().nullish(),
        providerLocalIdentifierValue: z.string().nullish(),
        paymentTermsTitle: z.string(),
        paymentTerms: z.string().nullish(),
        termsTitle: z.string(),
        terms: z.string().nullish(),
        payByTitle: z.string(),
        payBy: z.string(),
        deliveryTermsTitle: z.string(),
        deliveryTerms: z.string().nullish(),
        providerPhones: z.string(),
        bankingInfo: z.string(),
    }),
});
