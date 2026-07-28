export default async function handler(req, res) {
    // ===== GANTI DENGAN DOMAIN PTERODACTYL LO =====
    const BOT_ADDRESS = 'publicserver1.pteroweb.biz.id:3000';

    let isOnline = false;
    try {
        const pingRes = await fetch(`http://${BOT_ADDRESS}/ping`);
        if (pingRes.ok) isOnline = true;
    } catch (e) {
        console.log('[STATUS] Bot offline:', e.message);
    }

    return res.json({
        address: BOT_ADDRESS,
        lastSeen: Date.now(),
        online: isOnline
    });
}
