
// register.js
import os from 'os';
import { info, error } from './lib/console.js';

const CENTRAL_API = 'https://bot-dashboard.vercel.app/api/register'; // Ganti dengan URL Vercel lo

async function getPublicIP() {
    try {
        // Coba ambil IP publik via API
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (err) {
        error('Gagal mendapatkan IP publik, gunakan local IP');
        // Fallback: cari IP lokal
        const interfaces = os.networkInterfaces();
        for (const iface of Object.values(interfaces)) {
            for (const addr of iface) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    return addr.address;
                }
            }
        }
        return '127.0.0.1';
    }
}

export async function registerBotToCentral() {
    try {
        const ip = await getPublicIP();
        const port = 3000;
        const response = await fetch(CENTRAL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ip, port })
        });
        if (response.ok) {
            info(`[REGISTER] Bot registered to central server: ${ip}:${port}`);
        } else {
            error(`[REGISTER] Gagal register: ${response.status}`);
        }
    } catch (err) {
        error(`[REGISTER] Error: ${err.message}`);
    }
}
