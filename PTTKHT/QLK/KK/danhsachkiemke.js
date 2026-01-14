// ============================================
// DANH SÁCH PHIẾU KIỂM KÊ (KK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let allPhieuKiemKe = [];
let filteredPhieuKiemKe = [];
let currentPagePKK = 1;
const PAGE_SIZE_PKK = 5;

// Trạng thái filter
const filterStatePKK = {
    status: 'all' // all, completed, processing, cancelled
};

// ============================================
// 1. LOAD DỮ LIỆU TỪ API
// ============================================
async function loadPhieuKiemKe() {
    try {
        const from = document.getElementById('filterFromDate')?.value || '';
        const to = document.getElementById('filterToDate')?.value || '';
        const qs = new URLSearchParams();
        if (from) qs.set('from', from);
        if (to) qs.set('to', to);

        const response = await fetch(`/api/kho/kiem-ke${qs.toString() ? `?${qs.toString()}` : ''}`);
        const result = await response.json();
        
        if (result.success) {
            if (result.data && Array.isArray(result.data)) {
                allPhieuKiemKe = result.data.map(phieu => ({
                    MaPhieu: phieu.MaPKK,
                    TenNguoiKiemKe: phieu.TenNguoiKiemKe || '',
                    TrangThai: phieu.TrangThai === 1 ? 'completed' : 
                              phieu.TrangThai === 2 ? 'cancelled' : 'processing',
                    NgayKiemKe: phieu.NgayKiemKe,
                    GhiChu: phieu.GhiChu || '',
                    TongMaLech: Number(phieu.TongMaLech) || 0
                }));
            } else {
                allPhieuKiemKe = [];
            }
            
            filteredPhieuKiemKe = [...allPhieuKiemKe];
            currentPagePKK = 1;
            renderPhieuKiemKeTable(filteredPhieuKiemKe);
            updatePhieuKiemKeTotalCount(filteredPhieuKiemKe.length);
        } else {
            allPhieuKiemKe = [];
            filteredPhieuKiemKe = [];
            renderPhieuKiemKeTable(filteredPhieuKiemKe);
            updatePhieuKiemKeTotalCount(0);
        }
    } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
        alert('Không thể tải dữ liệu phiếu kiểm kê!');
        allPhieuKiemKe = [];
        filteredPhieuKiemKe = [];
        renderPhieuKiemKeTable(filteredPhieuKiemKe);
        updatePhieuKiemKeTotalCount(0);
    }
}

// ============================================
// 2. RENDER BẢNG DỮ LIỆU
// ============================================
function renderPhieuKiemKeTable(data) {
    console.log('renderPhieuKiemKeTable called with data:', data); // Debug
    const tbody = document.getElementById('phieuKiemKeTableBody');
    console.log('phieuKiemKeTableBody element:', tbody); // Debug
    
    if (!tbody) {
        console.warn('Không tìm thấy element phieuKiemKeTableBody');
        return;
    }

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        console.log('No phiếu kiểm kê data to render'); // Debug
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Không có dữ liệu phiếu kiểm kê. Vui lòng tạo phiếu kiểm kê mới.
                </td>
            </tr>
        `;
        return;
    }

    console.log('Rendering', data.length, 'phiếu kiểm kê'); // Debug
    
    // Phân trang
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE_PKK));
    if (currentPagePKK > totalPages) currentPagePKK = totalPages;
    if (currentPagePKK < 1) currentPagePKK = 1;

    const startIndex = (currentPagePKK - 1) * PAGE_SIZE_PKK;
    const endIndex = startIndex + PAGE_SIZE_PKK;
    const pageData = data.slice(startIndex, endIndex);

    let rowsHTML = '';
    try {
        pageData.forEach(phieu => {
            console.log('Creating phiếu row:', phieu); // Debug
            // Kiểm tra xem dữ liệu có đúng định dạng phiếu kiểm kê không
            if (!phieu.MaPhieu && !phieu.MaPKK) {
                console.warn('Dữ liệu không phải phiếu kiểm kê:', phieu);
                return; // Bỏ qua nếu không phải phiếu kiểm kê
            }
            const row = createTableRow(phieu);
            if (row) {
                rowsHTML += row;
            }
        });
        
        tbody.innerHTML = rowsHTML;
        console.log('Phiếu kiểm kê table rendered successfully'); // Debug
        updatePhieuKiemKePaginationControls(totalPages);
    } catch (error) {
        console.error('Error rendering phiếu kiểm kê table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-8 text-center text-red-500">
                    Lỗi khi render bảng: ${error.message}
                </td>
            </tr>
        `;
    }
}

function createTableRow(phieu) {
    const statusInfo = getStatusInfo(phieu.TrangThai);
    const statusClass = getStatusClass(phieu.TrangThai);
    const date = new Date(phieu.NgayKiemKe);
    const formattedDate = date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    let actionButtons = '';
    if (phieu.TrangThai === 'processing') {
        actionButtons = `
            <a href="/PTTKHT/QLK/PKK/code.html?maPKK=${phieu.MaPhieu}&mode=edit" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" title="Sửa">
                <span class="material-symbols-outlined text-[20px]">edit</span>
            </a>
            <a href="/PTTKHT/QLK/PKK/code.html?maPKK=${phieu.MaPhieu}&mode=view" class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" title="Xem">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
            </a>
        `;
    } else {
        actionButtons = `
            <a href="/PTTKHT/QLK/PKK/code.html?maPKK=${phieu.MaPhieu}&mode=view" class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-colors" title="Xem">
                <span class="material-symbols-outlined text-[20px]">visibility</span>
            </a>
        `;
    }

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full ${statusClass.bg} flex items-center justify-center ${statusClass.text} font-bold">
                        <span class="material-symbols-outlined text-lg">inventory_2</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">${phieu.MaPhieu}</div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">${phieu.TenNguoiKiemKe || 'N/A'} • Lệch: <span class="font-medium">${phieu.TongMaLech}</span></div>
                    </div>
                </div>
            </td>
            <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                    <div class="w-2.5 h-2.5 rounded-full ${statusInfo.color}"></div>
                    <span class="text-gray-700 dark:text-gray-300">${statusInfo.text}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">${formattedDate}</td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title="${phieu.GhiChu || ''}">
                    ${phieu.GhiChu || '-'}
                </div>
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    ${actionButtons}
                    <button onclick="printPhieuKiemKe('${phieu.MaPhieu}')" class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="In phiếu">
                        <span class="material-symbols-outlined text-[20px]">print</span>
                    </button>
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
        'processing': { text: 'Đang kiểm', color: 'bg-blue-500' },
        'cancelled': { text: 'Đã hủy', color: 'bg-red-500' }
    };
    return statusMap[status] || { text: 'Đang kiểm', color: 'bg-blue-500' };
}

function getStatusClass(status) {
    const classMap = {
        'completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400' },
        'processing': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' },
        'cancelled': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' }
    };
    return classMap[status] || { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' };
}

function updatePhieuKiemKeTotalCount(count) {
    const totalElement = document.getElementById('totalPhieuKiemKe');
    if (totalElement) {
        totalElement.textContent = count;
    }
}

function updatePhieuKiemKePaginationControls(totalPages) {
    const currentPageEl = document.getElementById('currentPagePKK');
    const totalPagesEl = document.getElementById('totalPagesPKK');
    const prevBtn = document.getElementById('prevPagePKK');
    const nextBtn = document.getElementById('nextPagePKK');

    if (totalPagesEl) {
        totalPagesEl.textContent = totalPages;
    }
    if (currentPageEl) {
        currentPageEl.textContent = totalPages === 0 ? 0 : currentPagePKK;
    }
    if (prevBtn) {
        prevBtn.disabled = currentPagePKK <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPagePKK >= totalPages;
    }
}

// ============================================
// 4. TÌM KIẾM VÀ FILTER
// ============================================
function setupPhieuKiemKeSearch() {
    const searchInput = document.getElementById('searchPhieuKiemKe');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        applyPhieuKiemKeFilters(searchTerm);
    });
}

function applyPhieuKiemKeFilters(searchTerm = '') {
    filteredPhieuKiemKe = allPhieuKiemKe.filter(phieu => {
        // Tìm kiếm
        const matchSearch = !searchTerm || 
            phieu.MaPhieu.toLowerCase().includes(searchTerm) ||
            (phieu.TenNguoiKiemKe && phieu.TenNguoiKiemKe.toLowerCase().includes(searchTerm)) ||
            (phieu.GhiChu && phieu.GhiChu.toLowerCase().includes(searchTerm));

        // Filter trạng thái
        const matchStatus = filterStatePKK.status === 'all' || phieu.TrangThai === filterStatePKK.status;

        return matchSearch && matchStatus;
    });

    currentPagePKK = 1;
    renderPhieuKiemKeTable(filteredPhieuKiemKe);
    updatePhieuKiemKeTotalCount(filteredPhieuKiemKe.length);
}

function setupPhieuKiemKeFilters() {
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
        filterStatus.addEventListener('change', (e) => {
            filterStatePKK.status = e.target.value;
            const searchTerm = document.getElementById('searchPhieuKiemKe')?.value || '';
            applyPhieuKiemKeFilters(searchTerm);
        });
    }
}

function setupDateRangeFilter() {
    const fromEl = document.getElementById('filterFromDate');
    const toEl = document.getElementById('filterToDate');
    if (fromEl) fromEl.addEventListener('change', () => loadPhieuKiemKe());
    if (toEl) toEl.addEventListener('change', () => loadPhieuKiemKe());
}

async function fetchPhieuDetail(maPKK) {
    const res = await fetch(`/api/kho/kiem-ke/${encodeURIComponent(maPKK)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.message || 'Không thể tải chi tiết phiếu');
    return json.data;
}

window.printPhieuKiemKe = async function printPhieuKiemKe(maPKK) {
    try {
        const data = await fetchPhieuDetail(maPKK);
        const w = window.open('', '_blank');
        if (!w) return alert('Trình duyệt chặn popup in.');
        const items = (data.DanhSachHang || []).map(h => `
          <tr>
            <td style="padding:6px;border:1px solid #ddd;">${h.MaHang}</td>
            <td style="padding:6px;border:1px solid #ddd;">${h.TenHang || ''}</td>
            <td style="padding:6px;border:1px solid #ddd;text-align:right;">${Number(h.SoLuongTonKho ?? h.SoLuongTon ?? 0)}</td>
            <td style="padding:6px;border:1px solid #ddd;text-align:right;">${Number(h.SoLuongThucTe ?? 0)}</td>
            <td style="padding:6px;border:1px solid #ddd;text-align:right;">${Number(h.ChenhLech ?? 0)}</td>
            <td style="padding:6px;border:1px solid #ddd;">${h.LyDoChenhLech || ''}</td>
          </tr>
        `).join('');
        w.document.write(`
          <html><head><title>In phiếu ${maPKK}</title></head>
          <body>
            <h2>Phiếu kiểm kê: ${maPKK}</h2>
            <div>Ngày kiểm kê: ${data.NgayKiemKe ? String(data.NgayKiemKe).split('T')[0] : ''}</div>
            <div>Người kiểm kê: ${data.TenNguoiKiemKe || ''}</div>
            <table style="border-collapse:collapse;margin-top:12px;width:100%;font-size:12px;">
              <thead>
                <tr>
                  <th style="padding:6px;border:1px solid #ddd;">Mã hàng</th>
                  <th style="padding:6px;border:1px solid #ddd;">Tên hàng</th>
                  <th style="padding:6px;border:1px solid #ddd;">SL PM</th>
                  <th style="padding:6px;border:1px solid #ddd;">SL TT</th>
                  <th style="padding:6px;border:1px solid #ddd;">CL</th>
                  <th style="padding:6px;border:1px solid #ddd;">Lý do</th>
                </tr>
              </thead>
              <tbody>${items}</tbody>
            </table>
            <script>window.onload=()=>{window.print();}</script>
          </body></html>
        `);
        w.document.close();
    } catch (e) {
        alert('Không thể in phiếu: ' + e.message);
    }
};

// ============================================
// 5. INITIALIZE
// ============================================
// Chỉ load khi tab "Danh sách phiếu kiểm kê" được active
function initDanhSachKiemKe() {
    loadPhieuKiemKe();
    setupPhieuKiemKeSearch();
    setupPhieuKiemKeFilters();
    setupDateRangeFilter();

     const prevBtn = document.getElementById('prevPagePKK');
     const nextBtn = document.getElementById('nextPagePKK');

     if (prevBtn) {
         prevBtn.addEventListener('click', () => {
             if (currentPagePKK > 1) {
                 currentPagePKK -= 1;
                 renderPhieuKiemKeTable(filteredPhieuKiemKe);
             }
         });
     }

     if (nextBtn) {
         nextBtn.addEventListener('click', () => {
             const totalPages = Math.max(1, Math.ceil((filteredPhieuKiemKe || []).length / PAGE_SIZE_PKK));
             if (currentPagePKK < totalPages) {
                 currentPagePKK += 1;
                 renderPhieuKiemKeTable(filteredPhieuKiemKe);
             }
         });
     }
}

// Export để có thể gọi từ HTML khi tab được click
window.initDanhSachKiemKe = initDanhSachKiemKe;

// Chỉ auto-load nếu tab đang active (kiểm tra trong HTML)
document.addEventListener('DOMContentLoaded', () => {
    const tabDanhSach = document.getElementById('tabDanhSach');
    const contentDanhSach = document.getElementById('tabContentDanhSach');
    
    // Chỉ load nếu tab này đang active (không có class 'hidden')
    if (tabDanhSach && contentDanhSach && !contentDanhSach.classList.contains('hidden')) {
        initDanhSachKiemKe();
    }
});
