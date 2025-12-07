import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

let client: Client | null = null;

export function getClient(): Client {
    if (client) return client;

    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error("HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present in .env");
    }

    const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID);
    const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY);

    if (process.env.HEDERA_NETWORK === 'mainnet') {
        client = Client.forMainnet();
    } else {
        client = Client.forTestnet();
    }

    client.setOperator(accountId, privateKey);
    return client;
}
