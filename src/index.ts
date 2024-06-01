import './env';
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import router from './router';

const app: Application = express();
const PORT = process.env.INTERNAL_PORT ?? 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', router);

try {
    app.listen(PORT, (): void => {
        console.log(`Connected successfully on port ${PORT}`);
    });
} catch (error: unknown) {
    if (error instanceof Error) {
        console.error(`Error occured: ${error.message}`);
    }
}
