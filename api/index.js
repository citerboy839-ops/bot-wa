let bots = global.bots || {};
let visitors = global.visitors || 100;
let products = global.products || {};
let pendingActions = global.pendingActions || [];
let actionResults = global.actionResults || {};

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const action = req.query.action;

    // A. SINKRONISASI BOT WA (Bot ngirim data & ngambil antrean tugas dari Web)
    if (req.method === 'POST' && action === 'sync') {
        try {
            let body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const { number, commands, productList, results } = body || {};

            if (!number) return res.status(400).json({ error: 'Nomor bot wajib' });

            bots[number] = {
                number,
                commands: ['.jadibot', '.deljadibot'], // Hanya menampilkan command ini sesuai request
                lastSync: Date.now(),
                status: 'Online'
            };

            if (productList) products = productList;

            // Simpan hasil eksekusi dari bot jika ada
            if (results && Array.isArray(results)) {
                results.forEach(resItem => {
                    actionResults[resItem.id] = resItem;
                });
            }

            // Ambil tugas pending untuk bot ini
            const myTasks = pendingActions.filter(a => a.botNumber === number);
            pendingActions = pendingActions.filter(a => a.botNumber !== number);

            return res.status(200).json({
                success: true,
                tasks: myTasks
            });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // B. WEB ACTION (Pengunjung web minta Aksi: Deposit, Beli, atau Eksekusi Perintah)
    if (req.method === 'POST' && action === 'web_action') {
        try {
            let body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            const actionId = 'ACT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            
            pendingActions.push({
                id: actionId,
                ...body
            });

            return res.status(200).json({ success: true, actionId });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    // C. CEK HASIL AKSI (Polling oleh Web)
    if (req.method === 'GET' && action === 'check_result') {
        const { id } = req.query;
        if (actionResults[id]) {
            const resData = actionResults[id];
            delete actionResults[id]; // Bersihkan memori
            return res.status(200).json({ ready: true, data: resData });
        }
        return res.status(200).json({ ready: false });
    }

    // D. DATA DASHBOARD
    if (req.method === 'GET' && action === 'data') {
        visitors += 1;
        const now = Date.now();
        Object.keys(bots).forEach(num => {
            if (now - bots[num].lastSync > 40000) bots[num].status = 'Offline';
        });

        const activeBots = Object.values(bots).filter(b => b.status === 'Online').length;

        return res.status(200).json({
            kolom1: { totalAktif: activeBots, totalTerdaftar: Object.keys(bots).length },
            kolom2: { totalVisitor: visitors, onlineVisitor: Math.floor(visitors / 8) + 1 },
            bots,
            products
        });
    }

    return res.status(404).json({ error: 'Endpoint tidak ditemukan' });
};
