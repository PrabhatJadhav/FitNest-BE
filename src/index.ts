import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import helmet from 'helmet';

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World abcdee!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
