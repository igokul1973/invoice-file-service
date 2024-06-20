import * as Minio from 'minio';

export const minioConfig = {
    endPoint: process.env.MINIO_HOST ?? 'invoice-minio',
    port: Number(process.env.MINIO_PORT) ?? 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true' ? true : process.env.MINIO_USE_SSL === 'false' ? false : false,
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_ACCESS_SECRET_KEY ?? '',
};

export const minioClient = new Minio.Client(minioConfig);
