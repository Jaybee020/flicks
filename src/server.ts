import cors from "cors";
import express from "express";
import {
  getDomainProperties,
  getOrCreateCollectionData,
  ownsItemInCollection,
} from "./utils/server-helpers";
import { Cluster } from "@solana/web3.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/domain/:addr", async (req, res) => {
  try {
    const { addr } = req.params;
    const { network } = req.query;
    const domainData = await getDomainProperties(addr, network as Cluster);
    res.status(200).json(domainData);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/collectionData/:addr", async (req, res) => {
  try {
    const { addr } = req.params;
    const { network } = req.query;
    const collectionData = await getOrCreateCollectionData(
      addr,
      network as Cluster
    );
    res.status(200).json(collectionData);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/owner/:addr", async (req, res) => {
  const { addr } = req.params;
  const { collectionName, network } = req.query;
  const data = await ownsItemInCollection(addr, collectionName as string);
  if (data) {
    res.status(200).json({ message: "User owns an item in collection" });
  } else {
    res
      .status(404)
      .json({ message: "User does not own an item in collection" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
