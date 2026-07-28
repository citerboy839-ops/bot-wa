export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Command required' });
    }

    // ===== PAKAI DOMAIN PTERODACTYL =====
    const BOT_ADDRESS = 'publicserver1.pteroweb.biz.id:3000';

    try {
        const botRes = await fetch(`http://${BOT_ADDRESS}/command`, {
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
