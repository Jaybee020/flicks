import { PrismaClient } from "@prisma/client";
import prisma from "../prisma";
import {
  getCollectionMetadata,
  getDomainFromAddr,
  getNFTsOfAddr,
} from "./solana";
import { client } from "../config";
import { Cluster } from "@solana/web3.js";

export async function catchAndHandleErrors<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e) {
    return null;
  }
}

async function cache<T>(
  key: string,
  callbackInputs: any[],
  expireIn: number,
  callbackFn: (...args: any[]) => T,
  client: any
): Promise<T> {
  async function run() {
    const cachedResponse = await client.get(key);
    if (cachedResponse) {
      return JSON.parse(cachedResponse);
    }
    const result = await callbackFn(...callbackInputs);
    await client.set(key, JSON.stringify(result), { EX: expireIn * 60 });
    return result;
  }
  return run();
}

export async function getOrCreateCollectionData(
  collectionAddr: string,
  network: Cluster = "mainnet-beta"
) {
  const collectionInfo = await prisma.collection.findUnique({
    where: { address: collectionAddr, network },
  });
  if (!collectionInfo) {
    //@ts-ignore
    const { name, image, description } = await getCollectionMetadata(
      collectionAddr,
      network
    );
    return await prisma.collection.create({
      data: {
        address: collectionAddr,
        name,
        image,
        description,
        network,
      },
    });
  }
  return collectionInfo;
}

export async function getDomainProperties(
  addr: string,
  network: Cluster = "mainnet-beta"
) {
  const key = `${network}:domain:${addr}`;
  return cache(key, [addr, network], 60, getDomainFromAddr, client);
}

export async function ownsItemInCollection(
  addr: string,
  collectionAddr: string
) {
  const key = `nfts:${addr}`;
  const nftData = await cache(key, [addr], 60, getNFTsOfAddr, client);
  if (nftData.includes(collectionAddr)) return true;
  return false;
}
