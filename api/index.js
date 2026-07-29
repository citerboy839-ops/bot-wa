// Memori sementara di Vercel (karena Vercel serverless)
global.bots = global.bots || {};
global.visitors = global.visitors || Math.floor(Math.random() * 500) + 100;

export default async function handler(req, res) {
    // Setting CORS agar bisa diakses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { action } = req.query;

    // A. POST /api?action=sync -> Bot WA mengirim data ke Web
    if (req.method === 'POST' && action === 'sync') {
        const { number, commands } = req.body;
        if (!number) return res.status(400).json({ error: 'Nomor wajib ada' });

        global.bots[number] = {
            number: number,
            commands: commands || [],
            lastSync: Date.now(),
            status: 'Online'
        };
        return res.status(200).json({ success: true, message: 'Bot tersinkronisasi dengan web!' });
    }

    // B. GET /api?action=data -> Web mengambil data untuk Dashboard
    if (req.method === 'GET' && action === 'data') {
        global.visitors += 1; // Simulasi nambah visitor tiap kali web dibuka
        
        // Cek bot yang mati (tidak sync lebih dari 60 detik)
        const now = Date.now();
        Object.keys(global.bots).forEach(num => {
            if (now - global.bots[num].lastSync > 60000) {
                global.bots[num].status = 'Offline';
            }
        });

        const activeBotsCount = Object.values(global.bots).filter(b => b.status === 'Online').length;

        return res.status(200).json({
            kolom1: { totalAktif: activeBotsCount, totalTerdaftar: Object.keys(global.bots).length },
            kolom2: { totalVisitor: global.visitors, onlineVisitor: Math.floor(global.visitors / 10) + 1 },
            bots: global.bots // Data untuk Kolom 3
        });
    }

    return res.status(404).json({ error: 'Aksi tidak ditemukan' });
}
