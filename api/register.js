export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ip, port } = req.body;
    if (!ip) {
        return res.status(400).json({ error: 'IP required' });
    }

    // Gak pake KV, cuma return sukses biar bot gak error
    console.log(`[REGISTER] Bot registered: ${ip}:${port || 3000}`);

    res.status(200).json({ success: true, address: `${ip}:${port || 3000}` });
}
