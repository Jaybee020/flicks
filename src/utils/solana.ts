import { Metaplex, PublicKey, keypairIdentity } from "@metaplex-foundation/js";
import { Cluster, Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
import {
  Record,
  getDiscordRecord,
  getTwitterRecord,
  getRedditRecord,
  reverseLookup,
  getDomainKeySync,
} from "@bonfida/spl-name-service";
import { magicEdenAPI } from "../config";
import { catchAndHandleErrors } from "./server-helpers";

export async function getCollectionMetadata(
  collectionAddr: string,
  network: Cluster = "mainnet-beta"
) {
  const connection = new Connection(clusterApiUrl(network));
  const keypair = Keypair.generate();
  const metaplex = new Metaplex(connection);
  metaplex.use(keypairIdentity(keypair));
  const mintAddress = new PublicKey(collectionAddr);

  const nft = await metaplex.nfts().findByMint({ mintAddress });

  return nft.json;
}

export async function getDomainFromAddr(
  addr: string,
  network: Cluster = "mainnet-beta"
) {
  const connection = new Connection(clusterApiUrl(network));
  const domainKey = new PublicKey(addr);
  const domainName = await reverseLookup(connection, domainKey);
  const [twitter, reddit, discord] = await Promise.all([
    catchAndHandleErrors(() => getTwitterRecord(connection, domainName)),
    catchAndHandleErrors(() => getRedditRecord(connection, domainName)),
    catchAndHandleErrors(() => getDiscordRecord(connection, domainName)),
  ]);
  //get resolverdata
  return {
    domainName,
    twitter,
    reddit,
    discord,
  };
}

//not working saying rpc call has been disabled
export async function getNFTsOfAddr(addr: string) {
  const res = await magicEdenAPI.get<{ collectionName?: string }[]>(
    `wallets/${addr}/tokens`
  );
  const collections = res.data
    .map((nft) => nft.collectionName)
    .filter((nft) => nft);

  return [...new Set(collections)];
}
