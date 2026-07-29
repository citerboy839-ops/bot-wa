export const WebAPI = {
    // Ambil semua data (Kolom 1, 2, dan list Bot)
    async getDashboardData() {
        try {
            const response = await fetch('/api?action=data');
            return await response.json();
        } catch (error) {
            console.error("Gagal mengambil data dashboard", error);
            return null;
        }
    }
};
