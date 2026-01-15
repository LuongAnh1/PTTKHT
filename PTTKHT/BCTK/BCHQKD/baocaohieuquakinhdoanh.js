// File: bchqkd.js

// Hàm format tiền (VNĐ)
const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Hàm format số lượng
const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
};

// ===========================================
// HÀM CHÍNH: GỌI API & VẼ GIAO DIỆN
// ===========================================
async function loadDashboardData() {
    try {
        const res = await fetch('http://localhost:3000/api/bao-cao/hieu-qua-kinh-doanh');
        const result = await res.json();

        if (result.success) {
            // 1. Vẽ Biểu đồ Top (Cột trái)
            renderChart(result.topProducts);
            
            // 2. Vẽ Bảng Top (Cột phải)
            renderTable(result.topProducts);
            
            // 3. Vẽ Phần Lợi Nhuận Gộp (Góc dưới trái)
            renderProfit(result.profitByCategory);
            
            // 4. Vẽ Phần Đổi Trả (Góc dưới phải - Dữ liệu giả lập từ server)
            renderReturns(result.returnStats);
        }
    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
    }
}

// --- 1. RENDER BIỂU ĐỒ THANH NGANG ---
function renderChart(data) {
    const container = document.getElementById('list-top-chart');
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 py-4">Chưa có dữ liệu bán hàng</p>';
        return;
    }

    const maxQty = Math.max(...data.map(i => i.SoLuongBan));
    let html = '';

    data.forEach(item => {
        const percent = (item.SoLuongBan / maxQty) * 100;
        html += `
            <div class="relative group mb-4">
                <div class="flex justify-between text-xs mb-1">
                    <span class="font-medium text-gray-700 dark:text-gray-300">${item.TenHang}</span>
                    <span class="text-gray-500 font-semibold">${formatNumber(item.SoLuongBan)} cái</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// --- 2. RENDER BẢNG CHI TIẾT ---
function renderTable(data) {
    const container = document.getElementById('table-top-products');
    if (!data || data.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="text-center py-4">Chưa có dữ liệu</td></tr>';
        return;
    }

    let html = '';
    data.forEach((item, index) => {
        const avatarChar = item.TenHang.charAt(0).toUpperCase();
        
        // Badge tăng trưởng (Random vì chưa có dữ liệu quá khứ)
        const isPositive = item.TangTruong > 0;
        const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
        const icon = isPositive ? 'trending_up' : 'trending_down';

        html += `
            <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                <td class="px-6 py-4 font-bold text-gray-500">#${index + 1}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                            ${avatarChar}
                        </div>
                        <span class="font-medium text-gray-900 dark:text-white line-clamp-1">${item.TenHang}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-right text-gray-700 dark:text-gray-300">${formatNumber(item.SoLuongBan)}</td>
                <td class="px-6 py-4 text-right font-bold text-green-600">
                    ${formatMoney(item.DoanhThu)}
                </td>
                <td class="px-6 py-4 text-right ${colorClass} font-bold text-xs flex justify-end items-center gap-1">
                    <span class="material-symbols-outlined text-sm">${icon}</span> ${Math.abs(item.TangTruong)}%
                </td>
            </tr>
        `;
    });
    container.innerHTML = html;
}

// --- 3. RENDER LỢI NHUẬN GỘP ---
function renderProfit(data) {
    // Cần thêm id="profit-analysis" vào thẻ div chứa danh sách lợi nhuận trong HTML
    const container = document.getElementById('profit-analysis');
    // Nếu trong HTML chưa có id này, hãy tìm <div class="space-y-4"> ở section lợi nhuận và thêm id="profit-analysis" vào
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">Chưa có dữ liệu lợi nhuận</p>';
        return;
    }

    let html = '';
    data.forEach(item => {
        const profit = item.DoanhThu - item.GiaVon;
        const margin = item.DoanhThu > 0 ? Math.round((profit / item.DoanhThu) * 100) : 0;
        
        // Màu sắc ngẫu nhiên cho đẹp (Xanh lá hoặc Xanh dương)
        const isGreen = margin >= 40;
        const bgClass = isGreen ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100';
        const textClass = isGreen ? 'text-green-700' : 'text-blue-700';
        const barClass = isGreen ? 'bg-green-500' : 'bg-blue-500';

        html += `
            <div class="p-3 ${bgClass} dark:bg-gray-700 rounded-lg border dark:border-gray-600 mb-3">
                <div class="flex justify-between items-center mb-2">
                    <span class="font-semibold text-gray-700 dark:text-gray-200">${item.NhomHang}</span>
                    <span class="text-sm font-bold ${textClass}">Biên LN: ${margin}%</span>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>DT: ${formatNumber(item.DoanhThu/1000000)}tr</span>
                    <span class="font-bold text-gray-800 dark:text-gray-200">Lãi: ${formatNumber(profit/1000000)}tr</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2 dark:bg-gray-600">
                    <div class="${barClass} h-1.5 rounded-full" style="width: ${margin}%"></div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// --- 4. RENDER ĐỔI TRẢ (Dữ liệu tĩnh từ Server) ---
// --- 4. RENDER ĐỔI TRẢ (CHÍNH XÁC TUYỆT ĐỐI) ---
function renderReturns(stats) {
    const rate = stats ? stats.totalRate : 0;

    // 1. Cập nhật số % (Tìm theo ID mới)
    const textElement = document.getElementById('return-rate-text'); 
    if (textElement) {
        textElement.textContent = rate + '%';
    }

    // 2. Cập nhật vòng tròn đỏ (Tìm theo ID mới)
    const ringElement = document.getElementById('return-ring');
    if (ringElement) {
        // stroke-dasharray="giá_trị, 100" -> Vẽ độ dài vòng tròn theo %
        ringElement.setAttribute('stroke-dasharray', `${rate}, 100`);
    }

    // 3. Cập nhật danh sách lý do bên cạnh
    const reasonContainer = document.getElementById('return-reasons'); // Đảm bảo bạn đã thêm ID này ở bước trước
    if (reasonContainer) {
        if (!stats || !stats.reason || stats.reason.length === 0) {
            reasonContainer.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">Chưa có dữ liệu đổi trả</p>';
            return;
        }

        let html = '';
        stats.reason.forEach(item => {
            let barColor = 'bg-blue-500';
            if (item.label.includes('Lỗi')) barColor = 'bg-red-500';
            if (item.label.includes('size')) barColor = 'bg-orange-400';

            html += `
                <div>
                    <div class="flex justify-between text-xs mb-1">
                        <span class="text-gray-600 dark:text-gray-400">${item.label}</span>
                        <span class="font-medium text-gray-900 dark:text-white">${item.count} SP</span>
                    </div>
                    <div class="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                        <div class="${barColor} h-1.5 rounded-full" style="width: ${item.value}%"></div>
                    </div>
                </div>
            `;
        });
        reasonContainer.innerHTML = html;
    }
}

// HÀM XUẤT EXCEL (Giả lập)
function exportToCSV() {
    alert("Chức năng xuất báo cáo này đang phát triển!");
}

// KHỞI CHẠY
document.addEventListener('DOMContentLoaded', loadDashboardData);