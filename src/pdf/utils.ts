import { getStreamAsBuffer } from 'get-stream';
import PdfPrinter from 'pdfmake';
import { minioClient } from '../minio/client';
import { TCreatePdfSchema } from '../types';
import { fonts, invoicesBucket } from './fonts/constants';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { getDefinitions } from './definitions';

export const getPdfUrl = async (
    destinationObject: string,
    data: TCreatePdfSchema['data'],
    pageParams: NonNullable<TCreatePdfSchema['pageSettings']>,
) => {
    const createPdf = (dd: TDocumentDefinitions) => {
        const printer = new PdfPrinter(fonts);
        const pdf = printer.createPdfKitDocument(dd);
        pdf.end();
        return pdf;
    };

    const uploadPdfAndReturnUrl = async () => {
        const dd = getDefinitions(data, pageParams);
        console.log('Creating pdf...');
        const pdf = createPdf(dd);
        console.log('Successfully created pdf');
        console.log('Uploading file to minio...');

        const isBucketExists = await minioClient.bucketExists(invoicesBucket);
        if (!isBucketExists) {
            await minioClient.makeBucket(invoicesBucket);
        }
        const pdfBuffer = await getStreamAsBuffer(pdf);
        // Set the object metadata
        const fileSize = Buffer.byteLength(pdfBuffer);
        const metaData = {
            'Content-Type': 'application/pdf',
            'Content-Length': fileSize,
        };
        await minioClient.putObject(invoicesBucket, destinationObject, pdfBuffer, fileSize, metaData);
        const url = await minioClient.presignedUrl('GET', invoicesBucket, destinationObject, 3600);

        if (!data.qrCode && url) {
            console.log('Adding QR code...');
            const pdf = createPdf(getDefinitions({ ...data, qrCode: url }, pageParams));
            const pdfBuffer = await getStreamAsBuffer(pdf);
            // Set the object metadata
            const fileSize = Buffer.byteLength(pdfBuffer);
            const metaData = {
                'Content-Type': 'application/pdf',
                'Content-Length': fileSize,
            };
            // Can be done asynchronously without waiting for the result
            minioClient.putObject(invoicesBucket, destinationObject, pdfBuffer, fileSize, metaData);
        }

        console.log('File is uploaded as object ' + destinationObject + ' to bucket ' + invoicesBucket);
        return url;
    };

    return new Promise((resolve, reject) => {
        uploadPdfAndReturnUrl()
            .then((url) => resolve(url))
            .catch((error) => reject(error));
    });
};
