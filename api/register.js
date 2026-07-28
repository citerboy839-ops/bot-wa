export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { ip, port } = req.body;
    console.log(`[REGISTER] Bot registered: ${ip}:${port || 3000}`);

    return res.status(200).json({ 
        success: true, 
        address: `${ip}:${port || 3000}` 
    });
}
