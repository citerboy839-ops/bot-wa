export default function handler(req, res) {
    // Cuma return dummy, gak fetch kemana-mana
    return res.status(200).json({
        address: 'publicserver1.pteroweb.biz.id:3000',
        online: true,
        lastSeen: Date.now()
    });
}
