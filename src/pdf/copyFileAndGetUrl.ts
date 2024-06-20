import { minioClient } from '../minio/client';

export const copyFileAndGetUrl = async (
    sourcePath: string,
    bucket: string,
    accountId: string,
    entityId: string,
    fileName: string,
) => {
    const bucketName = `${bucket}-${accountId}`;
    const objectName = `${entityId}_${fileName}`;

    console.log(sourcePath);
    // const s = await minioClient.statObject(bucketName, objectName);
    const conds = new Minio.CopyConditions();
    const s = await minioClient.copyObject(bucketName, objectName, sourcePath, conds);
    console.log('statObject', s);
    debugger;

    console.log('Uploading file to minio...');

    // const isBucketExists = await minioClient.bucketExists(bucketName);
    // if (!isBucketExists) {
    //     await minioClient.makeBucket(bucketName);
    //     console.log('Created new bucket: ' + bucketName);
    //     console.log('Setting new bucket policy for anonymous download access for bucket name: ' + bucketName + '...');
    //     const anonymousDownloadPolicy = {
    //         Version: '2012-10-17',
    //         Statement: [
    //             {
    //                 Action: ['s3:GetObject'],
    //                 Effect: 'Allow',
    //                 Principal: '*',
    //                 Resource: [`arn:aws:s3:::${bucketName}/*`],
    //             },
    //         ],
    //     };
    //     minioClient.setBucketPolicy(bucketName, JSON.stringify(anonymousDownloadPolicy));
    //     console.log('New bucket policy for anonymous download access is set.');
    // }
    // // Set the object metadata
    // const metaData = {
    //     'Content-Type': file.mimetype,
    //     'Content-Length': file.size,
    // };
    // await minioClient.putObject(bucketName, objectName, file.buffer, file.size, metaData);
    // // TODO: later fix the protocol for substitution during MINIO deployment
    // const url = `http://${minioConfig.endPoint}:${minioConfig.port}/${bucketName}/${objectName}`;
    // console.log('File is uploaded as object ' + objectName + ' to bucket ' + bucketName);
    // return url;
    return 'bla';
};
