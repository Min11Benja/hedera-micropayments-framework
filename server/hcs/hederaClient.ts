import { Client, PrivateKey, AccountId } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

let client: Client | null = null;

export function getClient(): Client {
    if (client) return client;

    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        throw new Error("HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be present in .env");
    }

    if (process.env.HEDERA_ACCOUNT_ID === '0.0.xxxxx' || process.env.HEDERA_PRIVATE_KEY.includes('302e0201')) {
        throw new Error("You are using default placeholder credentials in .env! Please open .env and replace '0.0.xxxxx' with your actual Hedera Testnet Account ID and Private Key.");
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
