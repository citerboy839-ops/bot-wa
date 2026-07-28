import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ip, port } = req.body;
    if (!ip) {
        return res.status(400).json({ error: 'IP required' });
    }

    const botAddress = `${ip}:${port || 3000}`;
    await kv.set('bot:address', botAddress);
    await kv.set('bot:last_seen', Date.now());

    res.status(200).json({ success: true, address: botAddress });
}
