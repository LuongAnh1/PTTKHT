// ============================================
// XUẤT KHO (XK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let allPhieuXuat = [];
let filteredPhieuXuat = [];

// Trạng thái filter
const filterState = {
    status: 'all' // all, completed, processing
};

// ============================================
// 1. LOAD DỮ LIỆU TỪ API
// ============================================
async function loadPhieuXuat() {
    try {
        const response = await fetch('/api/kho/xuat-kho');
        const result = await response.json();
        
        console.log('API Response xuat-kho:', result); // Debug
        
        if (result.success) {
            console.log('Dữ liệu phiếu xuất:', result.data); // Debug
            if (result.data && Array.isArray(result.data)) {
                allPhieuXuat = result.data.map(phieu => ({
                    MaPhieu: phieu.MaPXK,
                    NguoiNhan: phieu.NguoiNhan || phieu.LyDoXuat || '',
                    ThongTin: phieu.GhiChu || '',
                    TrangThai: phieu.TrangThai === 1 ? 'completed' : 'processing',
                    NgayXuat: phieu.NgayXuat
                }));
                console.log('allPhieuXuat sau khi map:', allPhieuXuat); // Debug
            } else {
                console.warn('Dữ liệu không phải là array:', result.data);
                allPhieuXuat = [];
            }
            
            // Kiểm tra và cập nhật trạng thái từ sessionStorage (nếu có)
            const updatedInfo = sessionStorage.getItem('phieuXuatUpdated');
            if (updatedInfo) {
                try {
                    const update = JSON.parse(updatedInfo);
                    const phieuIndex = allPhieuXuat.findIndex(p => p.MaPhieu === update.maPhieu);
                    if (phieuIndex !== -1) {
                        allPhieuXuat[phieuIndex].TrangThai = update.trangThai;
                    }
                    sessionStorage.removeItem('phieuXuatUpdated');
                } catch (e) {
                    console.error('Lỗi xử lý sessionStorage:', e);
                }
            }
            
            filteredPhieuXuat = [...allPhieuXuat];
            renderTable(filteredPhieuXuat);
            updateTotalCount(filteredPhieuXuat.length);
        } else {
            allPhieuXuat = [];
            filteredPhieuXuat = [];
            renderTable(filteredPhieuXuat);
            updateTotalCount(0);
        }
    } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
        alert('Không thể tải dữ liệu phiếu xuất!');
        allPhieuXuat = [];
        filteredPhieuXuat = [];
        renderTable(filteredPhieuXuat);
        updateTotalCount(0);
    }
}

// ============================================
// 2. RENDER BẢNG DỮ LIỆU
// ============================================
function renderTable(data) {
    const tbody = document.getElementById('phieuXuatTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Không có dữ liệu phiếu xuất. Vui lòng tạo phiếu xuất mới.
                </td>
            </tr>
        `;
        return;
    }
    
    console.log('Rendering', data.length, 'phiếu xuất'); // Debug
    
    data.forEach(phieu => {
        const row = createTableRow(phieu);
        tbody.innerHTML += row;
    });
}

// Tạo một dòng trong bảng
function createTableRow(phieu) {
    const statusInfo = getStatusInfo(phieu.TrangThai);
    const statusClass = getStatusClass(phieu.TrangThai);
    const formattedDate = formatDate(phieu.NgayXuat);
    
    // Xác định các nút hành động dựa trên trạng thái
    let actionButtons = '';
    if (phieu.TrangThai === 'completed') {
        // Phiếu đã hoàn thành - CHỈ ĐƯỢC XEM, KHÔNG ĐƯỢC SỬA
        actionButtons = `
            <button onclick="viewPhieuXuat('${phieu.MaPhieu}')" class="text-gray-400 hover:text-primary p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Xem chi tiết">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
        `;
    } else { // processing - Đang xử lý
        actionButtons = `
            <button onclick="viewPhieuXuat('${phieu.MaPhieu}')" class="text-gray-400 hover:text-primary p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Xem chi tiết">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            <button onclick="editPhieuXuat('${phieu.MaPhieu}')" class="text-gray-400 hover:text-primary p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Chỉnh sửa">
                <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
        `;
    }

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${statusClass.bg} flex items-center justify-center ${statusClass.text} font-bold">
                        <span class="material-symbols-outlined text-lg">receipt_long</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">${phieu.MaPhieu}</div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="text-gray-900 dark:text-white font-medium">${phieu.NguoiNhan || '-'}</div>
                ${phieu.ThongTin ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-1">${phieu.ThongTin}</div>` : ''}
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full ${statusInfo.color}"></div>
                    <span class="text-gray-700 dark:text-gray-300">${statusInfo.text}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${formattedDate}</td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    ${actionButtons}
                </div>
            </td>
        </tr>
    `;
}

// ============================================
// 3. HELPER FUNCTIONS
// ============================================

// Lấy thông tin trạng thái
function getStatusInfo(status) {
    const statusMap = {
        'completed': { text: 'Hoàn thành', color: 'bg-green-500' },
        'processing': { text: 'Đang xử lý', color: 'bg-amber-500' }
    };
    return statusMap[status] || { text: 'Đang xử lý', color: 'bg-amber-500' };
}

// Lấy class màu cho icon
function getStatusClass(status) {
    const classMap = {
        'completed': { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-600 dark:text-indigo-300' },
        'processing': { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-600 dark:text-amber-300' }
    };
    return classMap[status] || { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-600 dark:text-amber-300' };
}

// Format ngày tháng
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Cập nhật tổng số
function updateTotalCount(count) {
    const totalElement = document.getElementById('totalPhieuXuat');
    if (totalElement) {
        totalElement.textContent = count;
    }
}

// ============================================
// 4. TÌM KIẾM
// ============================================
function setupSearch() {
    const searchInput = document.getElementById('searchPhieuXuat');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        applyFilters(searchTerm);
    });
}

// Áp dụng filters và search
function applyFilters(searchTerm = '') {
    filteredPhieuXuat = allPhieuXuat.filter(phieu => {
        // Tìm kiếm
        const matchSearch = !searchTerm || 
            phieu.MaPhieu.toLowerCase().includes(searchTerm) ||
            (phieu.NguoiNhan && phieu.NguoiNhan.toLowerCase().includes(searchTerm)) ||
            (phieu.ThongTin && phieu.ThongTin.toLowerCase().includes(searchTerm));

        // Filter trạng thái
        const matchStatus = filterState.status === 'all' || phieu.TrangThai === filterState.status;

        return matchSearch && matchStatus;
    });

    renderTable(filteredPhieuXuat);
    updateTotalCount(filteredPhieuXuat.length);
}

// ============================================
// 5. BỘ LỌC
// ============================================
function setupFilter() {
    const filterButton = document.getElementById('filterButton');
    const filterDropdown = document.getElementById('filterDropdown');
    const closeFilter = document.getElementById('closeFilter');
    const applyFilter = document.getElementById('applyFilter');
    const resetFilter = document.getElementById('resetFilter');
    const filterStatus = document.getElementById('filterStatus');

    if (!filterButton || !filterDropdown) return;

    // Toggle dropdown
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation();
        filterDropdown.classList.toggle('hidden');
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener('click', (e) => {
        if (!filterDropdown.contains(e.target) && !filterButton.contains(e.target)) {
            filterDropdown.classList.add('hidden');
        }
    });

    // Đóng dropdown
    if (closeFilter) {
        closeFilter.addEventListener('click', () => {
            filterDropdown.classList.add('hidden');
        });
    }

    // Áp dụng filter
    if (applyFilter) {
        applyFilter.addEventListener('click', () => {
            if (filterStatus) {
                filterState.status = filterStatus.value;
            }
            
            // Áp dụng filter
            const searchTerm = document.getElementById('searchPhieuXuat')?.value || '';
            applyFilters(searchTerm);
            
            // Cập nhật badge
            updateFilterBadge();
            
            // Đóng dropdown
            filterDropdown.classList.add('hidden');
        });
    }

    // Reset filter
    if (resetFilter) {
        resetFilter.addEventListener('click', () => {
            if (filterStatus) {
                filterStatus.value = 'all';
                filterState.status = 'all';
            }
            
            // Áp dụng filter (reset)
            const searchTerm = document.getElementById('searchPhieuXuat')?.value || '';
            applyFilters(searchTerm);
            
            // Cập nhật badge
            updateFilterBadge();
            
            // Đóng dropdown
            filterDropdown.classList.add('hidden');
        });
    }

    // Load giá trị filter hiện tại vào dropdown
    if (filterStatus) {
        filterStatus.value = filterState.status;
    }

    // Cập nhật badge ban đầu
    updateFilterBadge();
}

// Cập nhật badge filter (hiển thị khi có filter active)
function updateFilterBadge() {
    const filterBadge = document.getElementById('filterBadge');
    if (!filterBadge) return;

    const hasActiveFilter = filterState.status !== 'all';
    
    if (hasActiveFilter) {
        filterBadge.classList.remove('hidden');
    } else {
        filterBadge.classList.add('hidden');
    }
}

// ============================================
// 6. XEM CHI TIẾT
// ============================================
async function viewPhieuXuat(maPhieu) {
    try {
        // TODO: Fetch chi tiết từ API
        // const response = await fetch(`/api/xuat-kho/${maPhieu}`);
        // const result = await response.json();
        // if (result.success) {
        //     // Hiển thị modal hoặc chuyển đến trang chi tiết
        // }

        // Tạm thời: Chuyển đến trang PXK với mã phiếu
        window.location.href = `/PTTKHT/QLK/PXK/code.html?maPhieu=${maPhieu}&mode=view`;
    } catch (error) {
        console.error('Lỗi xem chi tiết:', error);
        alert('Không thể xem chi tiết phiếu xuất!');
    }
}

// ============================================
// 7. CHỈNH SỬA
// ============================================
function editPhieuXuat(maPhieu) {
    // Tìm phiếu trong danh sách để kiểm tra trạng thái
    const phieu = allPhieuXuat.find(p => p.MaPhieu === maPhieu);
    
    // Nếu phiếu đã xuất thì không cho sửa, chỉ cho xem
    if (phieu && phieu.TrangThai === 'completed') {
        alert('Phiếu xuất đã hoàn thành, không thể chỉnh sửa! Vui lòng xem chi tiết.');
        viewPhieuXuat(maPhieu);
        return;
    }
    
    // Chuyển đến trang PXK với chế độ chỉnh sửa
    window.location.href = `/PTTKHT/QLK/PXK/code.html?maPhieu=${maPhieu}&mode=edit`;
}

// ============================================
// 8. HỦY PHIẾU
// ============================================
async function cancelPhieuXuat(maPhieu, nguoiNhan) {
    if (!confirm(`Bạn có chắc chắn muốn hủy phiếu xuất "${maPhieu}" của "${nguoiNhan}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/kho/xuat-kho/${maPhieu}/cancel`, {
            method: 'PUT'
        });
        const result = await response.json();
        if (result.success) {
            alert('Đã hủy phiếu xuất thành công!');
            await loadPhieuXuat(); // Reload danh sách
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi hủy phiếu:', error);
        alert('Không thể hủy phiếu xuất: ' + error.message);
    }
}

// ============================================
// 9. INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadPhieuXuat();
    setupSearch();
    setupFilter();
});

// Export functions để có thể gọi từ HTML (nếu cần)
window.viewPhieuXuat = viewPhieuXuat;
window.editPhieuXuat = editPhieuXuat;
window.cancelPhieuXuat = cancelPhieuXuat;
window.updateFilterBadge = updateFilterBadge;
