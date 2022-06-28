import * as express from "express";
import * as cors from "cors";
import { v2_router } from "./api";
import { notFound, errorHandler } from "./errors";
import dotenv from 'dotenv'

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v2", v2_router);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
