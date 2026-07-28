import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command required' });
    }

    const address = await kv.get('bot:address');
    if (!address) {
        return res.status(503).json({ error: 'Bot not registered' });
    }

    try {
        const botRes = await fetch(`http://${address}/command`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        const data = await botRes.json();
        res.status(200).json(data);
    } catch (err) {
        res.status(503).json({ error: 'Bot offline or unreachable' });
    }
}
