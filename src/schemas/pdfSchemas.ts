import { Readable } from 'stream';
import { z } from 'zod';

export function isValidBuffer(errorMessage: string): z.ZodType<Buffer> {
    return z.custom<Buffer>(
        (val) => {
            return Buffer.isBuffer(val);
        },
        { message: errorMessage },
    );
}

export const pdfCreateSchema = z.object({
    accountId: z.string(),
    bucket: z.string(),
    entityId: z.string(),
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
        billToTitle: z.string(),
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

export const fileCreateSchema = z.object({
    file: z.object({
        fieldname: z.string(),
        /** Name of the file on the uploader's computer. */
        originalname: z.string().min(1, { message: 'File name is required' }),
        /**
         * Value of the `Content-Transfer-Encoding` header for this file.
         * @deprecated since July 2015
         * @see RFC 7578, Section 4.7
         */
        encoding: z.string(),
        /** Value of the `Content-Type` header for this file. */
        mimetype: z.string().min(1, { message: 'File mimetype is required' }),
        /** Size of the file in bytes. */
        size: z.number().gt(0, { message: 'File size must be greater than 0' }),
        /**
         * A readable stream of this file. Only available to the `_handleFile`
         * callback for custom `StorageEngine`s.
         */
        // stream: z.custom<Promise<Readable>>(),
        stream: z.instanceof(Readable).optional(),
        /** `DiskStorage` only: Directory to which this file has been uploaded. */
        destination: z.string().optional(),
        /** `DiskStorage` only: Name of this file within `destination`. */
        filename: z.string().optional(),
        /** `DiskStorage` only: Full path to the uploaded file. */
        path: z.string().optional(),
        /** `MemoryStorage` only: A Buffer containing the entire file. */
        buffer: isValidBuffer('File buffer is required'),
    }),
    bucket: z.string().min(1, { message: 'Bucket name is required' }),
    accountId: z.string().min(1, { message: 'Account id is required' }),
    entityId: z.string().min(1, { message: 'Entity id is required' }),
});

export const fileCopySchema = z.object({
    sourcePath: z.string().min(1, { message: 'Source file path is required' }),
    bucket: z.string().min(1, { message: 'Bucket name is required' }),
    accountId: z.string().min(1, { message: 'Account id is required' }),
    entityId: z.string().min(1, { message: 'Entity id is required' }),
    fileName: z.string().min(1, { message: 'Entity id is required' }),
});

export const fileDeleteSchema = z.object({
    fileName: z.string().min(1, { message: 'File name is required' }),
    bucket: z.string().min(1, { message: 'Bucket name is required' }),
    accountId: z.string().min(1, { message: 'Account id is required' }),
    entityId: z.string().min(1, { message: 'Entity id is required' }),
});
