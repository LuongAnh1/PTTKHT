// Biến toàn cục
let allData = [];
let currentData = [];

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    fetchStockData();
    setupEventListeners();
});

// 1. LẤY DỮ LIỆU
async function fetchStockData() {
    try {
        // [MỚI] Lấy token từ localStorage
        const token = localStorage.getItem('token');
        if (!token) return; // Đã xử lý ở HTML

        const response = await fetch('/api/bao-cao/ton-kho', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // [MỚI] Gửi token lên server
            }
        });

        // Nếu server trả về 403 Forbidden (Không có quyền)
        if (response.status === 403) {
            alert("Bạn không có quyền xem dữ liệu này!");
            return;
        }

        const data = await response.json();
        
        // Sắp xếp: Mới nhất lên đầu
        allData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Tạo bộ lọc động
        initDynamicFilters(allData);
        
        // Chạy lần đầu
        applyFilters();
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        document.getElementById('transaction-table-body').innerHTML = 
            `<tr><td colspan="10" class="text-center py-6 text-red-500">Không thể kết nối đến dữ liệu!</td></tr>`;
    }
}

// 2. TẠO DROPDOWN KHO & LOẠI
function initDynamicFilters(data) {
    // 1. Xử lý Kho hàng
    const warehouseSelect = document.getElementById('warehouse-filter');
    if (warehouseSelect) {
        // Lấy danh sách các kho ĐANG CÓ trong HTML (để tránh thêm trùng)
        const existingOptions = Array.from(warehouseSelect.options).map(opt => opt.value);
        
        // Lấy danh sách kho từ Database
        const dbWarehouses = [...new Set(data.map(i => i.warehouse))].filter(Boolean);

        // Chỉ thêm những kho chưa có trong HTML
        dbWarehouses.forEach(w => {
            if (!existingOptions.includes(w)) {
                const opt = document.createElement('option');
                opt.value = w;
                opt.textContent = w;
                warehouseSelect.appendChild(opt);
            }
        });
    }

    // 2. Xử lý Loại giao dịch (Tương tự)
    const typeSelect = document.getElementById('type-filter');
    if (typeSelect) {
        const existingTypes = Array.from(typeSelect.options).map(opt => opt.value);
        const dbTypes = [...new Set(data.map(i => i.type))].filter(Boolean);

        dbTypes.forEach(t => {
            if (!existingTypes.includes(t)) {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                typeSelect.appendChild(opt);
            }
        });
    }
}

// 3. SỰ KIỆN LỌC
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', applyFilters);
    document.getElementById('warehouse-filter').addEventListener('change', applyFilters);
    document.getElementById('type-filter').addEventListener('change', applyFilters);
    document.getElementById('time-filter').addEventListener('change', applyFilters);
}

// 4. LOGIC LỌC
function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const warehouse = document.getElementById('warehouse-filter').value;
    const type = document.getElementById('type-filter').value;
    const time = document.getElementById('time-filter').value;

    const today = new Date();
    let minDate = null;
    
    // Logic thời gian
    if (time === '7days') {
        minDate = new Date();
        minDate.setDate(today.getDate() - 7);
    } else if (time === '30days') {
        minDate = new Date();
        minDate.setDate(today.getDate() - 30);
    }

    currentData = allData.filter(item => {
        const matchSearch = (item.name && item.name.toLowerCase().includes(search)) || 
                            (item.sku && item.sku.toLowerCase().includes(search));
        const matchWarehouse = warehouse === "" || item.warehouse === warehouse;
        const matchType = type === "" || item.type === type;
        
        let matchTime = true;
        if (minDate && item.date) {
            matchTime = new Date(item.date) >= minDate;
        }

        return matchSearch && matchWarehouse && matchType && matchTime;
    });

    renderTable(currentData);
}

// 5. VẼ BẢNG (Giống hệt HTML mẫu)
function renderTable(data) {
    const tbody = document.getElementById('transaction-table-body');
    const displayCount = document.getElementById('display-count');
    
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (displayCount) displayCount.textContent = data.length.toLocaleString();

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="px-4 py-8 text-center text-gray-500 italic">Không tìm thấy giao dịch nào</td></tr>`;
        return;
    }

    // Render tối đa 500 dòng để không bị lag, nhưng vẫn hiện đủ nhiều
    data.slice(0, 500).forEach(item => {
        // Format ngày giờ
        const dateObj = new Date(item.date);
        const dateStr = dateObj.toLocaleString('vi-VN', { 
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit' 
        });

        // Xử lý Badge (Nhập/Xuất/Điều chuyển)
        let typeBadge = '';
        let qtyClass = '';
        let prefix = '';

        if (item.type.includes('Nhập')) {
            const icon = item.type.includes('trả') ? 'keyboard_return' : 'arrow_downward';
            typeBadge = `
                <span class="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200 dark:border-green-800 flex items-center w-fit gap-1 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px]">${icon}</span> ${item.type}
                </span>`;
            qtyClass = 'text-green-600 dark:text-green-400';
            prefix = '+';
        } else if (item.type.includes('Xuất')) {
            typeBadge = `
                <span class="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-200 dark:border-red-800 flex items-center w-fit gap-1 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px]">arrow_upward</span> ${item.type}
                </span>`;
            qtyClass = 'text-red-600 dark:text-red-400';
            prefix = '-';
        } else {
            typeBadge = `
                <span class="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 flex items-center w-fit gap-1 whitespace-nowrap">
                    <span class="material-symbols-outlined text-[14px]">swap_horiz</span> ${item.type}
                </span>`;
            qtyClass = 'text-blue-600 dark:text-blue-400';
            prefix = '';
        }

        // Xử lý Màu sắc (Badge màu)
        let colorDot = 'bg-gray-400';
        let colorBg = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        const c = (item.color || '').toLowerCase();

        if(c.includes('trắng')) { colorDot = 'bg-white border border-gray-300'; }
        else if(c.includes('đen')) { colorDot = 'bg-black border border-gray-500'; colorBg = 'bg-gray-800 text-white'; }
        else if(c.includes('xanh')) { colorDot = 'bg-blue-600'; colorBg = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'; }
        else if(c.includes('hồng') || c.includes('đỏ')) { colorDot = 'bg-pink-400'; colorBg = 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300'; }

        const colorBadge = `
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorBg}">
                <span class="w-2 h-2 rounded-full ${colorDot} mr-1"></span> ${item.color || '-'}
            </span>`;

        // Render HTML
        const tr = `
            <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td class="px-4 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">${item.sku}</td>
                <td class="px-4 py-4 text-gray-700 dark:text-gray-300"><div>${item.name}</div></td>
                <td class="px-4 py-4 text-gray-700 dark:text-gray-300">${colorBadge}</td>
                <td class="px-4 py-4 text-gray-700 dark:text-gray-300 text-center font-medium">${item.size || '-'}</td>
                <td class="px-4 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">${dateStr}</td>
                <td class="px-4 py-4">${typeBadge}</td>
                <td class="px-4 py-4 text-right font-medium ${qtyClass}">${prefix}${Math.abs(item.qty)}</td>
                <td class="px-4 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">${item.warehouse}</td>
                <td class="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">${item.stock}</td>
                <td class="px-4 py-4 text-gray-500 dark:text-gray-400 italic">${item.note || ''}</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
}

// 6. XUẤT EXCEL
function exportToCSV() {
    if (currentData.length === 0) return alert("Không có dữ liệu!");
    
    // Header
    let csv = "\uFEFF"; // BOM fix lỗi font tiếng Việt
    csv += "SKU,Tên SP,Màu,Size,Ngày,Loại,Số lượng,Kho,Tồn cuối,Ghi chú\n";
    
    currentData.forEach(row => {
        const date = new Date(row.date).toLocaleDateString('vi-VN');
        const qtyPrefix = row.type.includes('Xuất') ? '-' : '';
        const name = `"${row.name.replace(/"/g, '""')}"`;
        const note = `"${(row.note || '').replace(/"/g, '""')}"`;
        
        csv += `${row.sku},${name},${row.color},${row.size},${date},${row.type},${qtyPrefix}${row.qty},${row.warehouse},${row.stock},${note}\n`;
    });

    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    link.download = "The_Kho_Export.csv";
    link.click();
}   