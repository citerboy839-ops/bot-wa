export default async function handler(req, res) {
    // Cuma return sukses tanpa logic rumit
    return res.status(200).json({ success: true, message: 'OK' });
}
