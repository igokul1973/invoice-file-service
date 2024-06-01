// import { Template } from '@pdfme/common';
import { pdfCreateSchema } from './schemas/pdfSchemas';
import { z } from 'zod';

// export enum SchemaKeysEnum {
//     logo = 'logo',
//     providerName = 'providerName',
//     qrCode = 'qrCode',
//     invoiceTitle = 'invoiceTitle',
//     customerInfo = 'customerInfo',
//     providerAddress = 'providerAddress',
//     customerAddress = 'customerAddress',
//     invoiceTable = 'invoiceTable',
//     invoiceNumberTitle = 'invoiceNumberTitle',
//     invoiceNumber = 'invoiceNumber',
//     customerNumberTitle = 'customerNumberTitle',
// }
// export type TSchemaValue = Template['schemas'][number][string];
// export type TInput = Record<SchemaKeysEnum, TSchemaValue>;
// export interface ITemplate extends Template {
//     schemas: TInput[];
// }

export type TCreatePdfSchema = z.infer<typeof pdfCreateSchema>;
