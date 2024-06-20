import express from 'express';
import multer from 'multer';
import { copyFileAndGetUrl } from '../pdf/copyFileAndGetUrl';
import { deleteFile, getPdfUrl, saveFileAndGetUrl } from '../pdf/utils';
import { fileCopySchema, fileCreateSchema, fileDeleteSchema, pdfCreateSchema } from '../schemas/pdfSchemas';

const upload = multer();

const router = express.Router();

router.post('/create/pdf', async (req, res) => {
    const result = pdfCreateSchema.safeParse(req.body);
    if (result.success) {
        const { bucket, accountId, entityId, pageSettings, data } = result.data;
        let { pageOrientation, pageMargins, pageSize } = pageSettings ?? {
            pageOrientation: 'portrait',
            pageMargins: 50,
            pageSize: 'A4',
        };
        pageOrientation = pageOrientation ?? 'portrait';
        pageMargins = pageMargins ?? 50;
        pageSize = pageSize ?? 'A4';

        try {
            console.log('Serving pdf to browser...');
            const url = await getPdfUrl(bucket, accountId, entityId, data, { pageMargins, pageSize, pageOrientation });

            return res.status(200).send({
                url,
            });
        } catch (error) {
            console.log(error);
            return res.status(400).send({
                error,
            });
        }
    } else {
        return res.status(400).send({
            error: 'The request did not contain valid parameters',
        });
    }
});

router.post('/file', upload.single('file'), async (req, res) => {
    const result = fileCreateSchema.safeParse({ ...req.body, file: req.file });

    if (!result.success) {
        return res.status(400).send({
            error: 'The request did not contain valid parameters',
            message: result.error.message,
        });
    }

    const { file, bucket, accountId, entityId } = result.data;

    try {
        const url = await saveFileAndGetUrl(file, bucket, accountId, entityId);
        return res.status(200).send({ url });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            error,
        });
    }
});

router.post('/file/copy', async (req, res) => {
    const result = fileCopySchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).send({
            error: 'The request did not contain valid parameters',
            message: result.error.message,
        });
    }

    const { sourcePath, bucket, accountId, entityId, fileName } = result.data;

    try {
        const url = await copyFileAndGetUrl(sourcePath, bucket, accountId, entityId, fileName);
        return res.status(200).send({ url });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            error,
        });
    }
});

router.delete('/file', async (req, res) => {
    const result = fileDeleteSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).send({
            error: 'The request did not contain valid parameters',
            message: result.error.message,
        });
    }
    const { fileName, bucket, accountId, entityId } = result.data;

    try {
        await deleteFile(fileName, bucket, accountId, entityId);
        return res.status(204).send();
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            error,
        });
    }
});

export default router;
