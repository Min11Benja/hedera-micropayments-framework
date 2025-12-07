import { TopicCreateTransaction, TopicMessageSubmitTransaction } from "@hashgraph/sdk";
import { getClient } from "./hederaClient";

/**
 * Creates a new HCS topic and returns the Topic ID.
 */
export async function createTopic(): Promise<string> {
    const client = getClient();
    const transaction = new TopicCreateTransaction();
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    return receipt.topicId!.toString();
}

/**
 * Submits a message to an HCS topic.
 * @param topicId 
 * @param message 
 */
export async function submitMessage(topicId: string, message: string): Promise<string> {
    const client = getClient();
    const transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    return receipt.status.toString();
}
