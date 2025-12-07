import { Client, PrivateKey, AccountId, AccountBalanceQuery } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

async function main() {
    console.log("🔍 Verifying Credentials...");

    const accountIdStr = process.env.HEDERA_ACCOUNT_ID;
    const privateKeyStr = process.env.HEDERA_PRIVATE_KEY;

    if (!accountIdStr || !privateKeyStr) {
        console.error("❌ Missing HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY in .env");
        return;
    }

    try {
        const accountId = AccountId.fromString(accountIdStr);
        const privateKey = PrivateKey.fromString(privateKeyStr);

        console.log(`\nAccount ID: ${accountId.toString()}`);
        console.log(`Private Key (Masked): ${privateKeyStr.substring(0, 10)}...`);

        // Create client
        const client = process.env.HEDERA_NETWORK === 'mainnet'
            ? Client.forMainnet()
            : Client.forTestnet();

        client.setOperator(accountId, privateKey);

        console.log("\nAttempting to fetch balance (Tests signature)...");

        const balance = await new AccountBalanceQuery()
            .setAccountId(accountId)
            .execute(client);

        console.log(`\n✅ SUCCESS! Credentials are valid.`);
        console.log(`💰 Balance: ${balance.hbars.toString()}`);

    } catch (error: any) {
        console.error("\n❌ FAILED. The Private Key does not match the Account ID.");
        console.error("Error Details:", error.message);
        console.error("\nSUGGESTION: Go to portal.hedera.com, verify you copied the correct Private Key for Account " + accountIdStr);
    }
    process.exit(0);
}

main();
