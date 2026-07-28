// api/status.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    const address = await kv.get('bot:address') || null;
    const lastSeen = await kv.get('bot:last_seen') || null;

    if (!address) {
        return res.status(404).json({ error: 'Bot not registered' });
    }

    // Cek apakah bot masih online (ping)
    let isOnline = false;
    try {
        const pingRes = await fetch(`http://${address}/ping`);
        if (pingRes.ok) isOnline = true;
    } catch (e) {
        isOnline = false;
    }

    res.json({
        address,
        lastSeen,
        online: isOnline
    });
}
