import * as express from "express";
import * as cors from "cors";
import { v2_pathfinder, v2_storage } from "./api";
import { notFound, errorHandler } from "./src/errors";
import * as path from 'path'

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public', "storage", "chain137")))

app.use("/api/pathfinder/v2", v2_pathfinder);
app.use("/api/storage/v2", v2_storage)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));
