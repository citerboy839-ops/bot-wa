export const WebAPI = {
    async getDashboardData() {
        const res = await fetch('/api?action=data');
        return await res.json();
    },

    async sendWebAction(type, data) {
        const res = await fetch('/api?action=web_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, ...data })
        });
        return await res.json();
    },

    async checkActionResult(actionId) {
        const res = await fetch(`/api?action=check_result&id=${actionId}`);
        return await res.json();
    },

    // Menunggu hasil eksekusi dari bot secara real-time
    async waitForResult(actionId, maxSeconds = 15) {
        for (let i = 0; i < maxSeconds * 2; i++) {
            await new Promise(r => setTimeout(r, 500));
            const check = await this.checkActionResult(actionId);
            if (check.ready) return check.data;
        }
        return { success: false, message: 'Waktu tunggu habis. Pastikan bot di Pterodactyl dalam keadaan Online!' };
    }
};
