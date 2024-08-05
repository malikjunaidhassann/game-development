import cron from "node-cron";
import { Tournament } from "../models/table.model.js";

export const startCronJob = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const currentDate = new Date();
      const result = await Tournament.updateMany(
        { endDate: { $lt: currentDate }, isExpired: false },
        { $set: { isExpired: true } }
      );
      console.log(`Expired tournaments updated: ${result.nModified} documents modified`);
    } catch (error) {
      console.error("Error updating expired tournaments:", error);
    }
  });
  console.log("Cron job started");
};
