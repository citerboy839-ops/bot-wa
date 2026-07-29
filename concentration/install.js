import { WebAPI } from './api.js';

let globalBotData = {};

document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
    // Auto-refresh data tiap 10 detik
    setInterval(initDashboard, 10000);
});

async function initDashboard() {
    const data = await WebAPI.getDashboardData();
    if (!data) return;

    globalBotData = data.bots;

    // Update Kolom 1
    document.getElementById('bot-aktif').innerText = data.kolom1.totalAktif;
    document.getElementById('bot-total').innerText = data.kolom1.totalTerdaftar;

    // Update Kolom 2
    document.getElementById('visitor-total').innerText = data.kolom2.totalVisitor;
    document.getElementById('visitor-online').innerText = data.kolom2.onlineVisitor;

    // Update Kolom 3 (List Bot)
    renderBotList();
}

function renderBotList() {
    const container = document.getElementById('list-bot');
    container.innerHTML = '';

    const botNumbers = Object.keys(globalBotData);
    if (botNumbers.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500">Belum ada bot yang online dari Pterodactyl.</p>';
        return;
    }

    botNumbers.forEach(number => {
        const bot = globalBotData[number];
        const btn = document.createElement('button');
        btn.className = `w-full text-left p-3 mb-2 rounded-lg border ${bot.status === 'Online' ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'} hover:bg-gray-800 transition`;
        btn.innerHTML = `
            <div class="font-bold text-gray-100">${bot.number}</div>
            <div class="text-xs ${bot.status === 'Online' ? 'text-green-400' : 'text-red-400'}">${bot.status}</div>
        `;
        btn.onclick = () => showCommands(bot.number);
        container.appendChild(btn);
    });
}

function showCommands(number) {
    const bot = globalBotData[number];
    const cmdContainer = document.getElementById('command-container');
    
    if (!bot || bot.commands.length === 0) {
        cmdContainer.innerHTML = `<p class="text-sm text-red-400">Tidak ada command tersedia untuk ${number}.</p>`;
        return;
    }

    const commandsHtml = bot.commands.map(cmd => 
        `<span class="inline-block bg-blue-600/30 border border-blue-500 text-blue-300 text-xs px-3 py-1.5 rounded m-1 cursor-pointer hover:bg-blue-600 transition" onclick="alert('Ini simulasi eksekusi command: ${cmd}')">${cmd}</span>`
    ).join('');

    cmdContainer.innerHTML = `
        <h3 class="text-sm font-bold text-gray-300 mb-2">Command Bot: ${number}</h3>
        <div class="flex flex-wrap">${commandsHtml}</div>
    `;
}
