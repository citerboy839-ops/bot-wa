import { WebAPI } from './api.js';

let selectedBotNumber = '';

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(loadData, 5000); // Auto update toko & status bot tiap 5 detik

    // Event Listener Tombol Command Input
    document.getElementById('btn-run-cmd').addEventListener('click', runCustomCommand);
    document.getElementById('btn-deposit').addEventListener('click', processDeposit);
    document.getElementById('btn-cek-saldo').addEventListener('click', checkUserBalance);
});

async function loadData() {
    const data = await WebAPI.getDashboardData();
    if (!data) return;

    // Kolom 1 & 2
    document.getElementById('bot-aktif').innerText = data.kolom1.totalAktif;
    document.getElementById('bot-total').innerText = data.kolom1.totalTerdaftar;
    document.getElementById('visitor-total').innerText = data.kolom2.totalVisitor;
    document.getElementById('visitor-online').innerText = data.kolom2.onlineVisitor;

    // Kolom 3: List Bot
    renderBotList(data.bots);

    // Rendering Katalog Toko Produk
    renderProducts(data.products);
}

function renderBotList(bots) {
    const container = document.getElementById('list-bot');
    const numbers = Object.keys(bots);

    if (numbers.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-500">Belum ada bot aktif.</p>';
        return;
    }

    if (!selectedBotNumber && numbers.length > 0) {
        selectedBotNumber = numbers[0]; // Auto select bot pertama
    }

    container.innerHTML = numbers.map(num => `
        <button onclick="selectBot('${num}')" class="w-full text-left p-2.5 mb-2 rounded border ${num === selectedBotNumber ? 'border-blue-500 bg-blue-950/40' : 'border-gray-800 bg-gray-900'}">
            <div class="font-bold text-sm text-gray-200">📱 ${num}</div>
            <div class="text-[10px] ${bots[num].status === 'Online' ? 'text-green-400' : 'text-red-400'}">● ${bots[num].status}</div>
        </button>
    `).join('');

    renderCommandButtons();
}

window.selectBot = (num) => {
    selectedBotNumber = num;
    loadData();
};

function renderCommandButtons() {
    const cmdContainer = document.getElementById('command-buttons');
    if (!selectedBotNumber) return;

    // Hanya menampilkan .jadibot dan .deljadibot sesuai instruksi
    const cmds = ['.jadibot', '.deljadibot'];

    cmdContainer.innerHTML = cmds.map(cmd => `
        <button onclick="fillCmd('${cmd}')" class="bg-blue-600/30 border border-blue-500 text-blue-300 text-xs px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition">
            ${cmd}
        </button>
    `).join('');
}

window.fillCmd = (cmd) => {
    document.getElementById('input-cmd').value = cmd;
};

// --- EKSKUSI COMMAND KETIK DARI WEBSITE ---
async function runCustomCommand() {
    const cmdInput = document.getElementById('input-cmd').value.trim();
    const targetUser = document.getElementById('user-wa-number').value.trim();
    const outputBox = document.getElementById('terminal-output');

    if (!selectedBotNumber) return alert('Pilih bot dulu di Kolom 3!');
    if (!cmdInput) return alert('Masukkan perintah yang ingin dijalankan!');

    outputBox.innerText = `⏳ Memproses perintah '${cmdInput}' ke bot ${selectedBotNumber}...`;

    const res = await WebAPI.sendWebAction('exec_command', {
        botNumber: selectedBotNumber,
        command: cmdInput,
        senderNumber: targetUser || '628123456789'
    });

    const result = await WebAPI.waitForResult(res.actionId);
    outputBox.innerText = result.message || 'Eksekusi selesai.';
}

// --- RENDERING KATALOG PRODUK AUTO-STORE ---
function renderProducts(products) {
    const container = document.getElementById('product-catalog');
    const items = Object.entries(products || {});

    if (items.length === 0) {
        container.innerHTML = '<p class="text-sm text-gray-500 col-span-2 text-center py-6">Belum ada produk yang ditambahkan Owner via WhatsApp (.addproduk).</p>';
        return;
    }

    container.innerHTML = items.map(([name, item]) => `
        <div class="bg-gray-900 border border-gray-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
                <div class="font-black text-lg text-yellow-400 uppercase">${name}</div>
                <div class="text-xs text-gray-400 mt-1">Stok Tersedia: <b class="text-white">${item.count} item</b></div>
                <div class="text-xl font-bold text-green-400 mt-2">Rp${item.price.toLocaleString()}</div>
            </div>
            <button onclick="buyProduct('${name}')" class="mt-4 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-xs transition">
                🛒 BELI PRODUK
            </button>
        </div>
    `).join('');
}

// --- FITUR BELI PRODUK REAL-TIME ---
window.buyProduct = async (productName) => {
    const userWA = prompt("Masukkan Nomor WhatsApp Anda (Format: 628xxx) untuk penerimaan & verifikasi saldo:");
    if (!userWA) return;

    if (!selectedBotNumber) return alert('Sistem bot offline!');

    const outputBox = document.getElementById('terminal-output');
    outputBox.innerText = `⏳ Memverifikasi saldo & stok untuk pembelian ${productName.toUpperCase()}...`;

    const res = await WebAPI.sendWebAction('buy', {
        botNumber: selectedBotNumber,
        productName,
        senderNumber: userWA
    });

    const result = await WebAPI.waitForResult(res.actionId);

    if (result.success) {
        alert(`🎉 PEMBELIAN BERHASIL!\n\nProduk: ${productName.toUpperCase()}\nIsi Produk:\n${result.content}\n\nSisa Saldo: Rp${result.saldoSisa.toLocaleString()}`);
        outputBox.innerText = `✅ [BERHASIL BUY] ${productName.toUpperCase()}\n\nIsi Barang:\n${result.content}`;
    } else {
        alert(result.message);
        outputBox.innerText = `❌ [GAGAL BUY] ${result.message}`;
    }
    loadData();
};

// --- FITUR DEPOSIT QRIS ---
async function processDeposit() {
    const amount = document.getElementById('deposit-amount').value;
    const userWA = document.getElementById('user-wa-number').value.trim();

    if (!amount || amount < 1000) return alert('Minimal deposit Rp1.000!');
    if (!userWA) return alert('Masukkan Nomor WA Anda terlebih dahulu!');
    if (!selectedBotNumber) return alert('Bot tidak tersedia!');

    const qrModal = document.getElementById('qr-modal');
    const qrImg = document.getElementById('qris-image');
    const qrInfo = document.getElementById('qris-info');

    qrModal.classList.remove('hidden');
    qrInfo.innerText = "⏳ Menghubungkan ke Gateway QRIS Akses Payment...";

    const res = await WebAPI.sendWebAction('deposit', {
        botNumber: selectedBotNumber,
        amount: parseInt(amount),
        senderNumber: userWA
    });

    const result = await WebAPI.waitForResult(res.actionId);

    if (result.success && result.data) {
        const { depositId, totalAmount, qrString } = result.data;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrString)}`;
        qrInfo.innerHTML = `
            <div class="text-sm font-bold text-green-400">Scan QRIS Di Atas</div>
            <div class="text-xs text-gray-300 mt-1">Nominal: <b>Rp${totalAmount.toLocaleString()}</b></div>
            <div class="text-[10px] text-gray-400">ID Deposit: <code>${depositId}</code></div>
            <button onclick="checkDepositStatus('${depositId}', '${userWA}')" class="mt-3 w-full bg-blue-600 text-white font-bold text-xs py-2 rounded">
                🔄 CEK STATUS PEMBAYARAN
            </button>
        `;
    } else {
        alert("Gagal membuat QRIS: " + (result.message || 'Error Sistem'));
        qrModal.classList.add('hidden');
    }
}

window.checkDepositStatus = async (depositId, userWA) => {
    const qrInfo = document.getElementById('qris-info');
    qrInfo.innerText = "🔍 Memverifikasi pembayaran di mutasi bank/QRIS...";

    const res = await WebAPI.sendWebAction('check_deposit', {
        botNumber: selectedBotNumber,
        depositId,
        senderNumber: userWA
    });

    const result = await WebAPI.waitForResult(res.actionId);
    if (result.success) {
        alert(`🎉 DEPOSIT BERHASIL!\n\nSaldo Masuk: Rp${result.paidAmount.toLocaleString()}\nTotal Saldo Sekarang: Rp${result.newBalance.toLocaleString()}`);
        document.getElementById('qr-modal').classList.add('hidden');
    } else {
        alert(result.message || "Pembayaran belum terdeteksi. Silakan selesaikan scan terlebih dahulu.");
    }
};

async function checkUserBalance() {
    const userWA = document.getElementById('user-wa-number').value.trim();
    if (!userWA) return alert('Masukkan Nomor WA Anda!');

    const res = await WebAPI.sendWebAction('get_balance', {
        botNumber: selectedBotNumber,
        senderNumber: userWA
    });

    const result = await WebAPI.waitForResult(res.actionId);
    alert(`💰 Saldo User (${userWA}): Rp${Number(result.balance || 0).toLocaleString()}`);
}
