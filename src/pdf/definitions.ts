import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import svg2img from 'svg2img';
import { TCreatePdfSchema } from '../types';

export enum SchemaKeysEnum {
    logo = 'logo',
    providerName = 'providerName',
    qrCode = 'qrCode',
    invoiceTitle = 'invoiceTitle',
    customerInfo = 'customerInfo',
    providerAddress = 'providerAddress',
    invoiceTable = 'invoiceTable',
    invoiceNumberSymbol = 'invoiceNumberSymbol',
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

export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
    const data = await fetch(url);
    const arrayBuffer = await data.arrayBuffer();
    const contentType = data.headers.get('content-type');
    let prefix = 'data:' + contentType + ';base64,';
    let bufferString = Buffer.from(arrayBuffer).toString('base64');
    if (contentType === 'image/svg+xml') {
        // SVG has to be converted to JPEG (like here) or PNG
        // as PDFMake only accepts these 2 formats.
        bufferString = await new Promise((resolve, reject) => {
            svg2img(prefix + bufferString, function (error: Error, buffer: Buffer) {
                if (error) {
                    reject(error);
                } else {
                    resolve(buffer.toString('base64'));
                }
            });
        });
        prefix = 'data:image/jpeg;base64,';
    }

    return prefix + bufferString;
};

export const getDefinitions = async (
    data: TCreatePdfSchema['data'],
    { pageSize, pageOrientation, pageMargins }: NonNullable<TCreatePdfSchema['pageSettings']>,
) => {
    const {
        logo,
        providerName,
        qrCode,
        invoiceTitle,
        billToTitle,
        customerInfo,
        providerAddress,
        invoiceTable: { headerRow, dataRows, totalRows },
        paymentAmountTitle,
        paymentAmount,
        invoiceNumber,
        customerCodeTitle,
        invoiceDateTitle,
        invoiceDate,
        customerCode,
        customerReferenceTitle,
        customerReference,
        providerReferenceTitle,
        providerReference,
        customerLocalIdentifierTitle,
        customerLocalIdentifierValue,
        providerLocalIdentifierTitle,
        providerLocalIdentifierValue,
        paymentTermsTitle,
        paymentTerms,
        payByTitle,
        payBy,
        deliveryTermsTitle,
        deliveryTerms,
        additionalInfoTitle,
        additionalInfo,
        termsTitle,
        terms,
        providerPhones,
        bankingInfo,
    } = data;

    const refStack: Content[] = [];
    const refValuesStack: Content[] = [];

    if (customerReference) {
        refStack.push(customerReferenceTitle);
        refValuesStack.push(customerReference);
    }
    if (providerReference) {
        refStack.push(providerReferenceTitle);
        refValuesStack.push(providerReference);
    }
    if (customerLocalIdentifierValue && customerLocalIdentifierTitle) {
        refStack.push(customerLocalIdentifierTitle);
        refValuesStack.push(customerLocalIdentifierValue);
    }
    if (providerLocalIdentifierValue && providerLocalIdentifierTitle) {
        refStack.push(providerLocalIdentifierTitle);
        refValuesStack.push(providerLocalIdentifierValue);
    }

    const termsStack = [{ text: paymentAmountTitle, style: 'paymentAmountTitle' }, payByTitle];
    const termsValuesStack = [{ text: paymentAmount, style: 'paymentAmountTitle' }, payBy];

    if (paymentTerms) {
        termsStack.push(paymentTermsTitle);
        termsValuesStack.push(paymentTerms);
    }
    if (deliveryTerms) {
        termsStack.push(deliveryTermsTitle);
        termsValuesStack.push(deliveryTerms);
    }

    const invoiceInfoColumns = [
        {
            text: `${invoiceDateTitle}: ${invoiceDate}`,
            style: 'invoiceDate',
        },
    ];
    if (customerCode) {
        invoiceInfoColumns.push({
            text: `${customerCodeTitle} ${customerCode}`,
            style: 'customerCode',
        });
    }

    let logoContent: string | null = null;

    if (logo) {
        const logoImage = await imageUrlToBase64(logo);
        logoContent = logoImage;
    }

    const dd: TDocumentDefinitions = {
        pageSize,
        pageOrientation,
        pageMargins,
        header: function (currentPage, pageCount, pageSize) {
            // you can apply any logic and return any valid pdfmake element
            const content = [{ text: providerName, style: 'providerName' }];
            return logoContent ? [{ image: logoContent, fit: [50, 300], style: 'logo' }, ...content] : content;
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
                        style: 'providerInfo',
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
                            fit: '100',
                            absolutePosition: { x: 515, y: 25 },
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
                                text: `${invoiceTitle} ${invoiceNumber}`,
                                style: 'title',
                            },
                            {
                                columns: invoiceInfoColumns,
                                style: 'invoiceInfo',
                            },
                        ],
                    },
                    {
                        stack: [
                            {
                                text: billToTitle,
                                style: 'billTo',
                            },
                            {
                                text: customerInfo,
                                style: 'customerInfo',
                            },
                        ],
                    },
                ],
            },
            {
                columns: [
                    {
                        columns: [
                            {
                                stack: refStack,
                                style: 'localIdentifierTitle',
                                width: 'auto',
                            },
                            {
                                stack: refValuesStack,
                                style: 'localIdentifier',
                                width: 'auto',
                            },
                        ],
                        style: 'referenceSection',
                        columnGap: 20,
                    },
                    {
                        columns: [
                            {
                                stack: termsStack,
                                style: 'paymentTermsTitle',
                                width: 'auto',
                            },
                            {
                                stack: termsValuesStack,
                                style: 'paymentTerms',
                                width: 'auto',
                            },
                        ],
                        style: 'paymentSection',
                        columnGap: 50,
                    },
                ],
            },
            {
                text: 'Itemized services and inventory:',
                style: 'itemsTableTitle',
            },
            {
                layout: 'lightHorizontalLines',
                table: {
                    // headers are automatically repeated if the table spans over multiple pages
                    // you can declare how many rows should be treated as headers
                    headerRows: 1,
                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
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
        ],
        styles: {
            logo: {
                alignment: 'center',
                marginTop: 20,
            },
            providerName: {
                fontSize: 12,
                marginTop: logo ? 5 : 20,
                color: 'blue',
                alignment: 'center',
                bold: true,
            },
            title: {
                fontSize: 20,
                bold: true,
                marginTop: 20,
            },
            invoiceInfo: {
                fontSize: 10,
            },
            billTo: {
                bold: true,
                fontSize: 10,
                marginTop: 25,
            },
            customerInfo: {
                fontSize: 10,
            },
            referenceSection: {
                fontSize: 10,
            },
            paymentAmountTitle: {
                bold: true,
            },
            paymentSection: {
                fontSize: 10,
            },
            itemsTableTitle: {
                fontSize: 10,
                bold: true,
                alignment: 'left',
                marginTop: 10,
            },
            itemsTable: {
                fontSize: 8,
            },
            totalTable: {
                fontSize: 10,
            },
            additionalInfo: {
                fontSize: 10,
                marginTop: 15,
            },
            footer: {
                margin: [30, 0, 30, 0],
                fontSize: 10,
            },
            providerInfo: {
                marginRight: 60,
            },
            pagination: {
                alignment: 'center',
                fontSize: 8,
            },
        },
    };

    if (additionalInfo) {
        dd.content = [
            ...(dd.content as Content[]),
            {
                text: [{ text: additionalInfoTitle + '\n', bold: true }, additionalInfo],
                style: 'additionalInfo',
                bold: false,
            },
        ];
    }

    if (terms) {
        dd.content = [
            ...(dd.content as Content[]),
            {
                text: [{ text: termsTitle + '\n', bold: true }, terms],
                style: 'additionalInfo',
                bold: false,
            },
        ];
    }

    return dd;
};
