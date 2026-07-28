export default async function handler(req, res) {
    return res.status(200).json({
        address: 'publicserver1.pteroweb.biz.id:3000',
        online: true,
        lastSeen: Date.now()
    });
}
