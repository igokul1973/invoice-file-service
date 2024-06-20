import { getStreamAsBuffer } from 'get-stream';
import * as Minio from 'minio';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { Readable } from 'stream';
import { minioClient, minioConfig } from '../minio/client';
import { TCreatePdfSchema } from '../types';
import { fonts, pdfLinkExpirationSeconds } from './constants';
import { getDefinitions } from './definitions';

export const getPdfUrl = async (
    bucket: string,
    accountId: string,
    entityId: string,
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

        const bucketName = `${bucket}-${accountId}`;
        const objectName = `${entityId}_invoice.pdf`;

        const isBucketExists = await minioClient.bucketExists(bucketName);
        if (!isBucketExists) {
            await minioClient.makeBucket(bucketName);
        }
        const pdfBuffer = await getStreamAsBuffer(pdf);
        // Set the object metadata
        const fileSize = Buffer.byteLength(pdfBuffer);
        const metaData = {
            'Content-Type': 'application/pdf',
            'Content-Length': fileSize,
        };
        await minioClient.putObject(bucketName, objectName, pdfBuffer, fileSize, metaData);
        const url = await minioClient.presignedUrl('GET', bucketName, objectName, pdfLinkExpirationSeconds);

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
            minioClient.putObject(bucketName, objectName, pdfBuffer, fileSize, metaData);
        }

        console.log('File is uploaded as object ' + objectName + ' to bucket ' + bucketName);
        return url;
    };

    return new Promise((resolve, reject) => {
        uploadPdfAndReturnUrl()
            .then((url) => resolve(url))
            .catch((error) => reject(error));
    });
};

export const saveFileAndGetUrl = async (
    file: Omit<Express.Multer.File, 'stream' | 'filename' | 'destination' | 'path'> & {
        stream?: Readable;
        filename?: string;
        destination?: string;
        path?: string;
    },
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
        console.log('Setting new bucket policy for anonymous download access for bucket name: ' + bucketName + '...');
        const anonymousDownloadPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: ['s3:GetObject'],
                    Effect: 'Allow',
                    Principal: '*',
                    Resource: [`arn:aws:s3:::${bucketName}/*`],
                },
            ],
        };
        minioClient.setBucketPolicy(bucketName, JSON.stringify(anonymousDownloadPolicy));
        console.log('New bucket policy for anonymous download access is set.');
    }

    // Set the object metadata
    const metaData = {
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
    };

    await minioClient.putObject(bucketName, objectName, file.buffer, file.size, metaData);
    // TODO: later fix the protocol for substitution during MINIO deployment
    const url = `http://${minioConfig.endPoint}:${minioConfig.port}/${bucketName}/${objectName}`;

    console.log('File is uploaded as object ' + objectName + ' to bucket ' + bucketName);

    return url;
};

export const copyFileAndGetUrl = async (
    sourcePath: string,
    bucket: string,
    accountId: string,
    entityId: string,
    fileName: string,
) => {
    const bucketName = `${bucket}-${accountId}`;
    const objectName = `${entityId}_${fileName}`;

    console.log('Copying file...');

    const conds = new Minio.CopyConditions();
    await minioClient.copyObject(bucketName, objectName, sourcePath, conds);

    console.log('File is copied as object ' + objectName + ' to bucket ' + bucketName);

    // TODO: later fix the protocol for substitution during MINIO deployment
    const url = `http://${minioConfig.endPoint}:${minioConfig.port}/${bucketName}/${objectName}`;

    return url;
};

export const deleteFile = async (fileName: string, bucket: string, accountId: string, entityId: string) => {
    const bucketName = `${bucket}-${accountId}`;
    const objectName = `${entityId}_${fileName}`;

    console.log('Removing file from minio...');

    await minioClient.removeObject(bucketName, objectName);
    console.log('File ' + objectName + ' is successfully removed from the bucket ' + bucketName);
};
