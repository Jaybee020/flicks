import axios from "axios";
import { createClient } from "redis";
import { config } from "dotenv";
config();
export const NODE_ENV = process.env.NODE_ENV;
const REDIS_URL = process.env.REDIS_URL;
export let client = createClient({
  url: REDIS_URL,
});
client
  .on("error", function (error) {
    console.error(error);
  })
  .connect();
export const magicEdenAPI = axios.create({
  baseURL: "https://api-mainnet.magiceden.dev/v2/",
  // headers: {
  //   "X-API-KEY": process.env.SOLSCAN_API_KEY,
  // },
});
