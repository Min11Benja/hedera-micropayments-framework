
// DOM Elements
const accountIdInput = document.getElementById('accountId') as HTMLInputElement;
const privateKeyInput = document.getElementById('privateKey') as HTMLInputElement;
const verifyStatus = document.getElementById('verifyStatus') as HTMLElement;
const step1 = document.getElementById('step1') as HTMLElement;
const step2 = document.getElementById('step2') as HTMLElement;

// Interfaces
interface VerifyResponse {
    success: boolean;
    balance?: string;
    error?: string;
}

interface PayResponse {
    success?: boolean;
    access_token?: string;
    message?: string;
    error?: string;
    challenge?: {
        amount: number;
        currency: string;
        recipient: string;
    }
}

interface EventResponse {
    success: boolean;
    status?: string;
    topicId?: string;
    error?: string;
}

// Utils
const appendLog = (id: string, msg: string) => {
    const el = document.getElementById(id);
    if (el) el.innerText += '\n' + msg;
};

const log = (id: string, msg: string) => {
    const el = document.getElementById(id);
    if (el) el.innerText = msg;
};

// Export to make this a module
export { };

declare global {
    interface Window {
        verifyCredentials: () => Promise<void>;
        checkAccess: () => Promise<void>;
        payAccess: () => Promise<void>;
        startWatching: () => Promise<void>;
        stopWatching: () => void;
    }
}

// Step 1: Verify Logic
window.verifyCredentials = async () => {
    verifyStatus.className = "status";
    verifyStatus.innerText = "Step 1: Reading inputs...";

    try {
        const accountId = accountIdInput.value.trim();
        const privateKey = privateKeyInput.value.trim();

        if (!accountId || !privateKey) {
            verifyStatus.innerText = "⚠️ Please fill in both Account ID and Private Key.";
            verifyStatus.className = "status error";
            return;
        }

        verifyStatus.innerText = "Step 2: Sending request to server...";

        const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId, privateKey })
        });

        verifyStatus.innerText = `Step 3: Server responded (Status ${res.status})`;

        const data: VerifyResponse = await res.json();

        if (data.success) {
            verifyStatus.innerText = `✅ Success! Balance: ${data.balance}`;
            verifyStatus.className = "status success";
            setTimeout(() => {
                step1.classList.add('hidden');
                step2.classList.remove('hidden');
            }, 1000);
        } else {
            verifyStatus.innerText = "❌ Verification Failed: " + (data.error || "Unknown error");
            verifyStatus.className = "status error";
        }
    } catch (err: any) {
        console.error("Verification Error:", err);
        verifyStatus.innerText = "❌ Client Error: " + err.message;
        verifyStatus.className = "status error";
    }
};

// Step 2 Logic
window.checkAccess = async () => {
    try {
        const res = await fetch('/api/pay');
        if (res.status === 402) {
            const data: PayResponse = await res.json();
            if (data.challenge) {
                log('accessStatus', `402 Payment Required\nChallenge: Pay ${data.challenge.amount} tinybar to ${data.challenge.recipient}`);
            }
        } else {
            log('accessStatus', 'Unexpected status: ' + res.status);
        }
    } catch (err: any) {
        log('accessStatus', 'Error: ' + err.message);
    }
};

let accessToken: string | null = null;

window.payAccess = async () => {
    try {
        const res = await fetch('/api/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proof: 'simulated-proof' })
        });
        const data: PayResponse = await res.json();
        if (data.success && data.access_token) {
            accessToken = data.access_token;
            log('accessStatus', `✅ Unlocked! Token: ${data.access_token}\n"${data.message}"`);
        } else {
            log('accessStatus', '❌ Failed: ' + data.error);
        }
    } catch (err: any) {
        log('accessStatus', 'Error: ' + err.message);
    }
};

let isWatching = false;
let watchInterval: NodeJS.Timeout | null = null;

window.startWatching = async () => {
    if (isWatching) return;

    if (!accessToken) {
        appendLog('eventLog', '⚠️ Access Denied: You must "Pay & Unlock" first.');
        return;
    }

    isWatching = true;
    appendLog('eventLog', '--- Stream Started ---');

    watchInterval = setInterval(async () => {
        try {
            const res = await fetch('/api/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    eventType: 'watch',
                    contentId: 'video-demo-1',
                    timestamp: Date.now()
                })
            });
            const data: EventResponse = await res.json();
            if (data.success) {
                appendLog('eventLog', `[${new Date().toLocaleTimeString()}] 📡 Logged to Topic ${data.topicId} (Status: ${data.status})`);
            } else if (data.error) {
                appendLog('eventLog', `❌ Error: ${data.error}`);
                clearInterval(watchInterval!); // Stop polling
                isWatching = false;
            }
        } catch (err: any) {
            appendLog('eventLog', `❌ Network Error: ${err.message}`);
            clearInterval(watchInterval!);
            isWatching = false;
        }
    }, 1000);
};

window.stopWatching = () => {
    if (!isWatching) return;
    if (watchInterval) clearInterval(watchInterval);
    isWatching = false;
    watchInterval = null;
    appendLog('eventLog', '--- Stream Stopped ---');
};
