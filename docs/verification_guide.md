# Phase 1 Verification Guide

This guide helps you manually verify that the **Definition of Done** for Phase 1 has been met.

## Prerequisites
1. Ensure your `.env` file has valid Testnet credentials (`HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`).
2. Install dependencies: `npm install`
3. Start the server in one terminal: `npm run dev`

---

## 1. Verify `/pay` Endpoint (x402 Challenge)

**DoD Item:** *"/pay endpoint that requires an x402 payment"*

Run this command to check the "Payment Required" response:
```bash
curl -v http://localhost:3000/api/pay
```
**Expected Output:**
- `HTTP/1.1 402 Payment Required`
- JSON body containing a challenge with `amount` and `recipient`.

---

## 2. Verify `/event` Endpoint (HCS Logging)

**DoD Item:** *"/event endpoint that logs a “watch event” to HCS"*

Run this command to simulate a "watch" event:
```bash
curl -X POST http://localhost:3000/api/event \
     -H "Content-Type: application/json" \
     -d '{"eventType": "watch", "contentId": "verification-test", "timestamp": 12345}'
```
**Expected Output:**
- JSON with `success: true`
- `status: "SUCCESS"`
- `topicId`: The HCS Topic ID used.

*Note: If this is the first run, it might take a few seconds to create the Topic.*

---

## 3. Verify Wallet Script

**DoD Item:** *"Wallet example script that signs & sends a micropayment"*

Run the simulation script to send 1000 tinybar (to yourself, for testing):
```bash
npx ts-node scripts/simulate_user_payment.ts
```
**Expected Output:**
- Transaction Status: `SUCCESS`
- Transaction ID displayed.

---

## 4. Verify Settlement Worker

**DoD Item:** *"Settlement worker that reads HCS messages and settles HBAR"*

1. Ensure the server is running (so a topic exists).
2. Grab the `topicId` from Step 2's output.
3. Open a **new terminal**.
4. Set the topic ID and run the worker:
   ```bash
   export TOPIC_ID=0.0.xxxxx  # Replace with actual Topic ID from Step 2
   npx ts-node server/settlement/worker.ts
   ```
5. In your first terminal (or a third one), fire another event:
   ```bash
   curl -X POST http://localhost:3000/api/event \
     -H "Content-Type: application/json" \
     -d '{"eventType": "watch", "contentId": "worker-test"}'
   ```
6. **Watch the Worker Terminal**: You should see:
   - `Received Event...`
   - `>> Processed 'watch' event...`

---

## 5. Verify End-to-End Demo

**DoD Item:** *"One simple 'pay 0.0001ℏ to access this message' demo"*

1. Open `http://localhost:3000` in your browser.
2. Click **Request Access**: Should show "Pay 1000000 tinybar".
3. Click **Pay & Unlock**: Should show "Unlocked!" (simulated).
4. Click **Start Watching**:
   - Check your Server Terminal or Worker Terminal.
   - You should see real-time HCS logs appearing every second.

---

**✅ If all above pass, Phase 1 is DONE.**
