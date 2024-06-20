import { pdfCreateSchema } from './schemas/pdfSchemas';
import { z } from 'zod';

export type TCreatePdfSchema = z.infer<typeof pdfCreateSchema>;
