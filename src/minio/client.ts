import * as Minio from 'minio';

export const minioClient = new Minio.Client({
    endPoint: 'invoice-minio',
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_ACCESS_SECRET_KEY ?? '',
});
