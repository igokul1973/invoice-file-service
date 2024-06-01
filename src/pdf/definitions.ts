import { Template } from '@pdfme/common';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { TCreatePdfSchema } from '../types';

export enum SchemaKeysEnum {
    logo = 'logo',
    providerName = 'providerName',
    qrCode = 'qrCode',
    invoiceTitle = 'invoiceTitle',
    customerInfo = 'customerInfo',
    providerAddress = 'providerAddress',
    invoiceTable = 'invoiceTable',
    invoiceNumberTitle = 'invoiceNumberTitle',
    invoiceNumber = 'invoiceNumber',
    customerNumberTitle = 'customerNumberTitle',
    invoiceDateTitle = 'invoiceDateTitle',
    invoiceDate = 'invoiceDate',
    customerNumber = 'customerNumber',
    additionalInfo = 'additionalInfo',
    references = 'references',
    providerPhones = 'providerPhones',
    bankingInfo = 'bankingInfo',
    paymentAndDelivery = 'paymentAndDelivery',
}
export type TSchemaValue = Template['schemas'][number][string];
export type TInput = Record<SchemaKeysEnum, TSchemaValue>;
export interface ITemplate extends Template {
    schemas: TInput[];
}

export const getDefinitions = (
    data: TCreatePdfSchema['data'],
    { pageSize, pageOrientation, pageMargins }: NonNullable<TCreatePdfSchema['pageSettings']>,
) => {
    const {
        logo,
        providerName,
        qrCode,
        invoiceTitle,
        customerInfo,
        providerAddress,
        invoiceTable: { headerRow, dataRows, totalRows },
        invoiceNumberTitle,
        invoiceNumber,
        customerNumberTitle,
        invoiceDateTitle,
        invoiceDate,
        customerNumber,
        yourReferenceTitle,
        yourReference,
        ourReferenceTitle,
        ourReference,
        customerLocalIdentifierTitle,
        customerLocalIdentifier,
        providerLocalIdentifierTitle,
        providerLocalIdentifier,
        paymentTermsTitle,
        paymentTerms,
        payByTitle,
        payBy,
        deliveryTermsTitle,
        deliveryTerms,
        additionalInfo,
        providerPhones,
        bankingInfo,
    } = data;

    const dd: TDocumentDefinitions = {
        pageSize,
        pageOrientation,
        pageMargins,
        header: function (currentPage, pageCount, pageSize) {
            // you can apply any logic and return any valid pdfmake element
            return [
                { image: 'src/images/logo.jpeg', width: 60, height: 60, style: 'logo' },
                { text: providerName, style: 'providerName' },
                // { canvas: [{ type: 'rect', x: 100, y: 32, w: pageSize.width - 80, h: 40 }] },
            ];
        },
        footer: function (currentPage, pageCount) {
            let content: Content = {
                stack: [
                    {
                        columns: [
                            {
                                stack: [providerName, providerAddress],
                                style: 'providerAddress',
                            },
                            {
                                stack: [providerPhones],
                                style: 'providerPhones',
                            },
                            {
                                stack: [bankingInfo],
                                style: 'bankingInfo',
                            },
                        ],
                        style: 'customerInfo',
                    },
                    {
                        text: currentPage.toString() + ' of ' + pageCount,
                        style: 'pagination',
                        absolutePosition: { x: 0, y: 80 },
                    },
                ],
                style: 'footer',
            };
            if (qrCode) {
                content = {
                    ...content,
                    stack: [
                        ...content.stack,
                        {
                            qr: qrCode || 'no data provided',
                            fit: '80',
                            absolutePosition: { x: 500, y: 15 },
                        },
                    ],
                } as Content;
            }
            return content;
        },
        content: [
            {
                columns: [
                    {
                        stack: [
                            {
                                text: invoiceTitle,
                                style: 'title',
                            },
                            {
                                columns: [
                                    {
                                        stack: [invoiceNumberTitle, invoiceNumber],
                                        style: 'invoiceNumber',
                                    },
                                    {
                                        stack: [customerNumberTitle, customerNumber],
                                        style: 'customerNumber',
                                    },
                                    {
                                        stack: [invoiceDateTitle, invoiceDate],
                                        style: 'invoiceDate',
                                    },
                                ],
                                style: 'customerInfo',
                            },
                        ],
                    },
                    {
                        stack: [
                            {
                                text: 'Bill To:',
                                style: 'billTo',
                            },
                            customerInfo,
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        stack: [
                            {
                                columns: [
                                    {
                                        stack: [
                                            `${yourReferenceTitle}:`,
                                            `${customerLocalIdentifierTitle}:`,
                                            `${ourReferenceTitle}:`,
                                            `${providerLocalIdentifierTitle}:`,
                                        ],
                                        style: 'localIdentifierTitle',
                                    },
                                    {
                                        stack: [
                                            yourReference,
                                            customerLocalIdentifier,
                                            ourReference,
                                            providerLocalIdentifier,
                                        ],
                                        style: 'invoiceNumber',
                                    },
                                ],
                                style: 'customerInfo',
                            },
                        ],
                    },
                    {
                        stack: [
                            {
                                columns: [
                                    {
                                        stack: [`${paymentTermsTitle}:`, `${payByTitle}:`, `${deliveryTermsTitle}:`],
                                        style: 'invoiceNumber',
                                    },
                                    {
                                        stack: [paymentTerms, payBy, deliveryTerms],
                                        style: 'invoiceNumber',
                                    },
                                ],
                                style: 'customerInfo',
                            },
                        ],
                    },
                ],
            },
            {
                text: 'Itemized services and inventory:',
                style: 'heading',
                margin: [0, 20, 0, 10],
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
                    body: [headerRow, ...dataRows],
                },
                style: 'itemsTable',
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 0,
                    widths: ['*', 'auto'],
                    body: totalRows,
                },
                marginLeft: 315,
                marginTop: 5,
                style: 'totalTable',
            },
            {
                text: ['Additional information:\n', additionalInfo ?? ''],
                style: 'additionalInfo',
                bold: false,
            },
        ],
        styles: {
            logo: {
                alignment: 'center',
            },
            providerName: {
                fontSize: 12,
                // margin: [20, 29, 0, 0],
                color: 'blue',
                alignment: 'center',
                bold: true,
            },
            title: {
                fontSize: 20,
                bold: true,
                marginTop: 20,
            },
            customerInfo: {
                fontSize: 10,
                marginTop: 15,
            },
            billTo: {
                bold: true,
                marginTop: 20,
            },
            heading: {
                fontSize: 10,
                bold: true,
                alignment: 'left',
                marginTop: 10,
            },
            footer: {
                margin: [30, 0, 30, 0],
                fontSize: 10,
            },
            pagination: {
                alignment: 'center',
                fontSize: 8,
            },
            totalTable: {
                fontSize: 10,
            },
            itemsTable: {
                fontSize: 8,
            },
            additionalInfo: {
                fontSize: 10,
                marginTop: 15,
            },
        },
    };

    return dd;
};
