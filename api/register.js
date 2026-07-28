export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { ip, port } = req.body || {};
    console.log(`[REGISTER] IP: ${ip}, Port: ${port}`);
    return res.status(200).json({ success: true, message: 'Registered' });
}
