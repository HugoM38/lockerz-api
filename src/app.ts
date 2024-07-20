import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import dotenv from "dotenv";
import cors from "cors";
import localisationRoutes from "./routes/localisationRoutes";
import lockerRoutes from "./routes/lockerRoutes";
import reservationRoutes from "./routes/reservationRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/locker", lockerRoutes);
app.use("/api/localisation", localisationRoutes);
app.use("/api/reservation", reservationRoutes);

mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
