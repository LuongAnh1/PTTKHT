// Biến toàn cục
let transactions = []; // Dữ liệu gốc từ Server
let currentData = [];  // Dữ liệu đang hiển thị (để dùng cho xuất Excel)

// ==============================================
// 1. HÀM LẤY DỮ LIỆU TỪ SERVER
// ==============================================
async function fetchTransactions() {
    try {
        // Gọi API từ Backend
        const response = await fetch('http://localhost:3000/api/bao-cao/ton-kho');
        
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        // Gán dữ liệu vào biến toàn cục
        transactions = data;
        currentData = data; // Ban đầu chưa lọc thì dữ liệu hiện tại = dữ liệu gốc

        // Vẽ lại giao diện
        renderTable(transactions);
        updateStats(transactions);

    } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        const tbody = document.getElementById('transaction-table-body');
        if(tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" class="text-center py-6 text-red-500 font-medium">
                        Không thể kết nối đến Server!<br>
                        <span class="text-xs text-gray-500">Hãy kiểm tra xem bạn đã chạy lệnh "node server.js" chưa?</span>
                    </td>
                </tr>
            `;
        }
    }
}

// ==============================================
// 2. HÀM VẼ BẢNG (RENDER TABLE)
// ==============================================
function renderTable(data) {
    const tbody = document.getElementById('transaction-table-body');
    if (!tbody) return; 
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center py-6 text-gray-500">Không tìm thấy giao dịch nào</td></tr>`;
        document.getElementById('display-count').textContent = '0';
        return;
    }

    data.forEach(item => {
        // Xử lý màu sắc chữ
        let typeColor = item.type === 'Nhập kho' ? 'text-blue-600' : 
                        item.type.includes('Xuất') ? 'text-orange-600' : 
                        item.type === 'Trả hàng' ? 'text-purple-600' : 'text-gray-600';
        
        // Dấu + cho nhập kho
        let qtyPrefix = item.qty > 0 ? '+' : '';
        
        // Màu số lượng (Dương xanh, Âm đỏ)
        let qtyColor = item.qty > 0 ? 'text-blue-600' : 'text-red-600';

        // Xử lý Badge trạng thái
        let badgeColor = item.status === 'An toàn' ? 'bg-green-100 text-green-800' :
                        item.status === 'Sắp hết' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';

        // Format số tiền/số lượng
        const stockFormatted = new Intl.NumberFormat('vi-VN').format(item.stock);

        const row = `
            <tr class="bg-white dark:bg-gray-800 hover:bg-gray-50 border-b dark:border-gray-700 transition-colors">
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${item.sku}</td>
                <td class="px-6 py-4 text-gray-700 dark:text-gray-300">${item.name}</td>
                <td class="px-4 py-4 text-gray-600 dark:text-gray-400">${item.color || '-'}</td>
                <td class="px-4 py-4 text-gray-600 dark:text-gray-400">${item.size || '-'}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap">${item.date}</td>
                <td class="px-6 py-4"><span class="${typeColor} font-medium">${item.type}</span></td>
                <td class="px-6 py-4 text-right font-bold ${qtyColor}">${qtyPrefix}${item.qty}</td>
                <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${item.warehouse}</td>
                <td class="px-6 py-4 italic text-gray-500 text-xs">${item.note || ''}</td>
                <td class="px-6 py-4 text-right font-bold text-gray-900 dark:text-white">${stockFormatted}</td>
                <td class="px-6 py-4 text-center">
                    <span class="${badgeColor} text-xs font-medium px-2.5 py-0.5 rounded-full border border-opacity-20">${item.status}</span>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });

    // Cập nhật số lượng hiển thị
    document.getElementById('display-count').textContent = data.length;
}

// ==============================================
// 3. HÀM CẬP NHẬT THỐNG KÊ
// ==============================================
function updateStats(data) {
    let totalImport = 0, totalExport = 0, totalReturn = 0, lowStock = 0;

    data.forEach(item => {
        if (item.type === 'Nhập kho') totalImport += item.qty;
        if (item.type.includes('Xuất')) totalExport += Math.abs(item.qty);
        if (item.type === 'Trả hàng') totalReturn += item.qty;
        if (item.status === 'Sắp hết') lowStock++;
    });

    const fmt = (num) => new Intl.NumberFormat('vi-VN').format(num);

    if(document.getElementById('stat-import')) document.getElementById('stat-import').textContent = fmt(totalImport);
    if(document.getElementById('stat-export')) document.getElementById('stat-export').textContent = fmt(totalExport);
    if(document.getElementById('stat-return')) document.getElementById('stat-return').textContent = fmt(totalReturn);
    if(document.getElementById('stat-check')) document.getElementById('stat-check').textContent = lowStock;
}

// ==============================================
// 4. HÀM XUẤT EXCEL (ĐÃ SỬA LỖI)
// ==============================================
function exportToCSV() {
    // Kiểm tra xem có dữ liệu không
    if (!currentData || currentData.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    // Tiêu đề cột (Thêm \uFEFF để Excel nhận diện tiếng Việt)
    let csvContent = "\uFEFF"; 
    csvContent += "Mã SKU,Tên Sản Phẩm,Màu,Size,Ngày GD,Loại GD,Số Lượng,Kho,Tồn Cuối,Ghi Chú,Trạng Thái\n";

    // Duyệt qua từng dòng dữ liệu đang hiển thị
    currentData.forEach(item => {
        // Xử lý các trường text có thể chứa dấu phẩy (bọc trong ngoặc kép)
        const name = `"${(item.name || '').replace(/"/g, '""')}"`;
        const note = `"${(item.note || '').replace(/"/g, '""')}"`;
        const warehouse = `"${(item.warehouse || '').replace(/"/g, '""')}"`;
        
        // Xử lý số lượng (thêm dấu +/-)
        let qtyPrefix = item.qty > 0 ? '+' : '';
        let qtyStr = `${qtyPrefix}${item.qty}`; // Excel có thể hiểu sai nếu để dấu + đầu dòng, nên để dạng text

        const rowString = `${item.sku},${name},${item.color},${item.size},${item.date},${item.type},${item.qty},${warehouse},${item.stock},${note},${item.status}`;
        
        csvContent += rowString + "\n";
    });

    // Tạo file tải về
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Bao_Cao_The_Kho.csv");
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==============================================
// 5. SỰ KIỆN KHỞI CHẠY
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    fetchTransactions();

    const filterData = () => {
        const text = document.getElementById('search-input').value.toLowerCase();
        const warehouse = document.getElementById('warehouse-filter').value;
        const type = document.getElementById('type-filter').value;

        // Lọc dữ liệu
        const filtered = transactions.filter(item => {
            const matchesText = (item.name && item.name.toLowerCase().includes(text)) || 
                                (item.sku && item.sku.toLowerCase().includes(text));
            const matchesWarehouse = warehouse === "" || item.warehouse === warehouse;
            const matchesType = type === "" || item.type.includes(type);

            return matchesText && matchesWarehouse && matchesType;
        });

        // QUAN TRỌNG: Cập nhật biến currentData để nút Xuất Excel biết xuất cái gì
        currentData = filtered;

        renderTable(filtered);
        updateStats(filtered);
    };

    const searchInput = document.getElementById('search-input');
    const warehouseFilter = document.getElementById('warehouse-filter');
    const typeFilter = document.getElementById('type-filter');

    if(searchInput) searchInput.addEventListener('input', filterData);
    if(warehouseFilter) warehouseFilter.addEventListener('change', filterData);
    if(typeFilter) typeFilter.addEventListener('change', filterData);
});