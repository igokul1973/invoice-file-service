import express from 'express';
import { getPdfUrl } from '../pdf/utils';
import { pdfCreateSchema } from '../schemas/pdfSchemas';

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

export default router;
