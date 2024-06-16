import express from 'express';
import multer from 'multer';
import { deleteFile, getPdfUrl, saveFileAndGetUrl } from '../pdf/utils';
import { pdfCreateSchema } from '../schemas/pdfSchemas';

const upload = multer();

const router = express.Router();

router.post('/create/pdf', async (req, res) => {
    const result = pdfCreateSchema.safeParse(req.body);
    if (result.success) {
        const { pageSettings, data } = result.data;
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
            const destinationObject = `invoice.pdf`;
            const url = await getPdfUrl(destinationObject, data, { pageMargins, pageSize, pageOrientation });

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
    if (
        !req.file ||
        Object.keys(req.file).length === 0 ||
        !req.body.bucket ||
        !req.body.accountId ||
        !req.body.entityId
    ) {
        return res.status(400).send('You sent wrong data. No files were uploaded.');
    }

    const { bucket, accountId, entityId } = req.body;

    try {
        const url = await saveFileAndGetUrl(req.file, bucket, accountId, entityId);
        return res.status(200).send({ url });
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            error,
        });
    }
});

router.delete('/file', async (req, res) => {
    if (!req.body.fileName || !req.body.bucket || !req.body.accountId || !req.body.entityId) {
        return res.status(400).send('You sent wrong data. No files were uploaded.');
    }

    const { fileName, bucket, accountId, entityId } = req.body;

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
