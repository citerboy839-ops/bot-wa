let bots = global.bots || {};
let visitors = global.visitors || 100;

module.exports = async (req, res) => {
    // Handling Header CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const action = req.query.action;

    // POST: Sync data dari Bot WA
    if (req.method === 'POST' && action === 'sync') {
        try {
            let body = req.body;
            if (typeof body === 'string') {
                body = JSON.parse(body);
            }
            const { number, commands } = body || {};
            if (!number) return res.status(400).json({ error: 'Nomor wajib ada' });

            bots[number] = {
                number: number,
                commands: commands || [],
                lastSync: Date.now(),
                status: 'Online'
            };

            global.bots = bots;
            return res.status(200).json({ success: true, message: 'Bot tersinkronisasi!' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // GET: Ambil data untuk Dashboard Web
    if (req.method === 'GET' && action === 'data') {
        visitors += 1;
        global.visitors = visitors;

        const now = Date.now();
        Object.keys(bots).forEach(num => {
            if (now - bots[num].lastSync > 60000) {
                bots[num].status = 'Offline';
            }
        });

        const activeBotsCount = Object.values(bots).filter(b => b.status === 'Online').length;

        return res.status(200).json({
            kolom1: { totalAktif: activeBotsCount, totalTerdaftar: Object.keys(bots).length },
            kolom2: { totalVisitor: visitors, onlineVisitor: Math.floor(visitors / 10) + 1 },
            bots: bots
        });
    }

    return res.status(404).json({ error: 'Aksi tidak ditemukan' });
};
