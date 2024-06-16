import { getStreamAsBuffer } from 'get-stream';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { minioClient } from '../minio/client';
import { TCreatePdfSchema } from '../types';
import { getDefinitions } from './definitions';
import { fonts, invoicesBucket } from './fonts/constants';

export const getPdfUrl = async (
    objectName: string,
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
        let dd = await getDefinitions(data, pageParams);
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
        await minioClient.putObject(invoicesBucket, objectName, pdfBuffer, fileSize, metaData);
        const url = await minioClient.presignedUrl('GET', invoicesBucket, objectName, 3600);

        if (!data.qrCode && url) {
            console.log('Adding QR code...');
            dd = await getDefinitions({ ...data, qrCode: url }, pageParams);
            const pdf = createPdf(dd);
            const pdfBuffer = await getStreamAsBuffer(pdf);
            // Set the object metadata
            const fileSize = Buffer.byteLength(pdfBuffer);
            const metaData = {
                'Content-Type': 'application/pdf',
                'Content-Length': fileSize,
            };
            // Can be done asynchronously without waiting for the result
            minioClient.putObject(invoicesBucket, objectName, pdfBuffer, fileSize, metaData);
        }

        console.log('File is uploaded as object ' + objectName + ' to bucket ' + invoicesBucket);
        return url;
    };

    return new Promise((resolve, reject) => {
        uploadPdfAndReturnUrl()
            .then((url) => resolve(url))
            .catch((error) => reject(error));
    });
};

export const saveFileAndGetUrl = async (
    file: Express.Multer.File,
    bucket: string,
    accountId: string,
    entityId: string,
) => {
    const bucketName = `${bucket}-${accountId}`;
    const objectName = `${entityId}_${file.originalname}`;

    console.log('Uploading file to minio...');

    const isBucketExists = await minioClient.bucketExists(bucketName);
    if (!isBucketExists) {
        await minioClient.makeBucket(bucketName);
        console.log('Created new bucket: ' + bucketName);
    }

    // Set the object metadata
    const metaData = {
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
    };

    await minioClient.putObject(bucketName, objectName, file.buffer, file.size, metaData);
    const url = await minioClient.presignedUrl('GET', bucketName, objectName, 3600);

    console.log('File is uploaded as object ' + objectName + ' to bucket ' + bucketName);

    return url;
};

export const deleteFile = async (fileName: string, bucket: string, accountId: string, entityId: string) => {
    const bucketName = `${bucket}-${accountId}`;
    const objectName = `${entityId}_${fileName}`;

    console.log('Removing file from minio...');

    await minioClient.removeObject(bucketName, objectName);
    const url = await minioClient.presignedUrl('GET', bucketName, objectName, 3600);

    console.log('File is uploaded as object ' + objectName + ' to bucket ' + bucketName);

    return url;
};
