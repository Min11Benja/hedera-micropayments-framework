import { Client, TopicMessageQuery } from "@hashgraph/sdk";
import { getClient } from "../hcs/hederaClient";
import { transferHbar } from "./paymentService";
import dotenv from "dotenv";
dotenv.config();

// Configuration
const TOPIC_ID = process.env.TOPIC_ID;

async function startWorker() {
    console.log("Starting Settlement Worker...");

    if (!TOPIC_ID) {
        console.error("ERROR: TOPIC_ID is not set in .env. Run the server first, trigger an event to create a topic, then add TOPIC_ID to .env and restart worker.");
        return;
    }

    const client = getClient();
    console.log(`Listening to topic: ${TOPIC_ID}`);

    // Subscribe to the topic
    new TopicMessageQuery()
        .setTopicId(TOPIC_ID)
        .subscribe(
            client,
            (message) => {
                try {
                    if (!message) return;
                    const messageString = Buffer.from(message.contents).toString("utf8");
                    const event = JSON.parse(messageString);

                    console.log(`\nReceived Event from ${message.consensusTimestamp.toString()}:`);
                    console.log(JSON.stringify(event, null, 2));

                    // MOCK SETTLEMENT LOGIC
                    if (event.type === 'watch') {
                        console.log(">> Processed 'watch' event. Accruing 0.0001 HBAR debt to creator.");
                        // transferHbar(creatorAccount, 0.0001); 
                    }

                } catch (err) {
                    console.error("Error parsing message:", err);
                }
            },
            (error) => {
                console.log(`Error: ${error.toString()}`);
            }
        );
}

startWorker();
