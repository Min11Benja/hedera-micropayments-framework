import { Client, PrivateKey, AccountId, TransferTransaction, Hbar } from "@hashgraph/sdk";
import dotenv from "dotenv";
dotenv.config();

// Usage: npx ts-node scripts/simulate_user_payment.ts [AMOUNT_TINYBAR]
async function main() {
    console.log("-----------------------------------------");
    console.log("💰 Wallet Simulation: User Paying Server");
    console.log("-----------------------------------------");

    // 1. Setup Payer (Simulating the User)
    // For this demo, we'll just use the same credentials as in .env 
    // In a real scenario, this would be a separate user wallet
    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error("❌ .env HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY required");
    }

    const client = process.env.HEDERA_NETWORK === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    // 2. Define Recipient (The "Server" or "Creator")
    // sending to self is valid on Hedera (just pays gas), but let's mimic distinct flow
    const recipientId = AccountId.fromString(myAccountId);

    const amount = 1000; // tinybars

    console.log(`Attempting to send ${amount} tinybar from ${myAccountId} to ${recipientId}...`);

    try {
        // 3. Create Transfer
        const transaction = new TransferTransaction()
            .addHbarTransfer(myAccountId, Hbar.fromTinybars(-amount))
            .addHbarTransfer(recipientId, Hbar.fromTinybars(amount));

        // 4. Sign & Submit
        const txResponse = await transaction.execute(client);

        // 5. Get Receipt
        const receipt = await txResponse.getReceipt(client);
        const status = receipt.status.toString();

        console.log(`✅ Transaction Status: ${status}`);
        console.log(`🆔 Transaction ID: ${txResponse.transactionId.toString()}`);
        console.log("-----------------------------------------");
        console.log("Proof of Payment (Transaction ID) could now be sent to POST /api/pay");

    } catch (err) {
        console.error("❌ Transaction Failed:", err);
    }
}

main();
