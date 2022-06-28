import * as express from "express";
const v2_router = express.Router();

v2_router.route("/").get(async (req, res) => {
  try {
    res.json({
      status: 200,
      message: "This is a successful response",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export { v2_router };
