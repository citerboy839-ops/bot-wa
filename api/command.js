export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { command } = req.body || {};
    return res.status(200).json({
        success: true,
        result: `Perintah "${command}" diterima (simulasi)`
    });
}
