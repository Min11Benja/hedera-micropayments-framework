import { TransferTransaction, Hbar, AccountId } from "@hashgraph/sdk";
import { getClient } from "../hcs/hederaClient";

/**
 * Transfers HBAR from the operator account to a recipient.
 * @param recipientAccountId 
 * @param amountHbar 
 */
export async function transferHbar(recipientAccountId: string, amountHbar: number): Promise<{ status: string, transactionId: string }> {
    const client = getClient();

    // Create a transfer transaction
    const transaction = new TransferTransaction()
        .addHbarTransfer(client.operatorAccountId!, Hbar.fromTinybars(-amountHbar))
        .addHbarTransfer(AccountId.fromString(recipientAccountId), Hbar.fromTinybars(amountHbar));

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    return {
        status: receipt.status.toString(),
        transactionId: txResponse.transactionId.toString()
    };
}
