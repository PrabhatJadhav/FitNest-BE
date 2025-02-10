import express from 'express';
import { dbConnect } from './db/dbConnect';
import bodyParser from 'body-parser';
import cors from 'cors';
import { swaggerDocs } from './swagger';
import swaggerUi from 'swagger-ui-express';
import { v1Router } from './versions/v1-routes';
import '../src/cron/otpCleanupCron';

const app = express();
const PORT = process.env.PORT || 8080;

// Execute database connection
dbConnect();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use(cors());
app.use(express.json());

/************** Swagger Doc Routes **************/

app.use('/api/v1/docs', swaggerUi?.serve, swaggerUi?.setup(swaggerDocs));

/************** Test, User Auth Routes **************/

// app.get("/", (req: any, res: any) => {
//   res.send("Hello, World abcdee!");
// });

// app.get("/test", (req: any, res: any) => {
//   res
//     .status(200)
//     .send({ data: "Hello, this is test api welcome to port 8080" });
// });

app.use('/api/v1', v1Router);

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
