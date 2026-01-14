// ============================================
// KIỂM KÊ KHO HÀNG (KK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let allMatHang = [];
let filteredMatHang = [];
let selectedMaHangs = new Set();
let currentPage = 1;
const PAGE_SIZE = 5;

// Trạng thái filter
const filterState = {
    category: 'all',
    status: 'all' // all | matched | diff | uncounted
};

// ============================================
// 0. PHÂN LOẠI DANH MỤC (THỜI TRANG)
// ============================================
function normalizeText(s) {
    return (s || '')
        .toString()
        .toLowerCase()
        // loại bỏ dấu tiếng Việt để match dễ hơn
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function classifyFashionCategory(item) {
    // Ưu tiên field DanhMuc nếu backend có trả
    if (item?.DanhMuc) return item.DanhMuc;

    const name = normalizeText(`${item?.TenHang || ''} ${item?.MoTa || ''}`);
    if (!name) return 'Phụ kiện';

    // Mũ
    if (/(mu|non|bucket|snapback|beanie|fedora)/.test(name)) return 'Mũ';
    // Áo
    if (/(ao|tshirt|t-shirt|thun|polo|so mi|somi|hoodie|sweater|khoac|jacket|blazer|cardigan|len)/.test(name)) return 'Áo';
    // Quần
    if (/(quan|jean|jogger|kaki|short|shorts|leggin|vay|dam)/.test(name)) return 'Quần';
    // Giày
    if (/(giay|dep|sandal|sneaker|boot|boots|loafer)/.test(name)) return 'Giày';
    // Túi
    if (/(tui|balo|backpack|vi|wallet|clutch)/.test(name)) return 'Túi';

    return 'Phụ kiện';
}

// ============================================
// 1. LOAD DỮ LIỆU TỪ API
// ============================================

async function loadMatHang() {
    try {
        await loadMatHangFromKho();
    } catch (error) {
        console.error('Lỗi load dữ liệu:', error);
        alert('Không thể tải dữ liệu kiểm kê!');
    }
}

async function loadMatHangFromKho() {
    try {
        const response = await fetch('/api/kho/kiem-ke/ton-kho');
        const result = await response.json();
        
        console.log('API Response kiem-ke/ton-kho:', result); // Debug
        
        if (result.success) {
            console.log('Dữ liệu tồn kho:', result.data); // Debug
            console.log('Số lượng phần tử trong result.data:', result.data ? result.data.length : 0); // Debug
            
            if (result.data && Array.isArray(result.data)) {
                allMatHang = result.data.map((item, idx) => {
                    // Validate dữ liệu
                    if (!item.MaHang) {
                        console.warn(`Item ${idx} thiếu MaHang:`, item);
                    }
                    
                    return {
                        MaHang: item.MaHang || `UNKNOWN_${idx}`,
                        TenHang: item.TenHang || 'Không có tên',
                        ThongTin: `${item.Size || ''} ${item.MauSac || ''}`.trim() || '',
                        DonViTinh: item.DonViTinh || '',
                        SoLuongPhanMem: Number(item.SoLuongPhanMem) || 0,
                        // SL thực tế mặc định = 0 để bắt buộc người dùng nhập
                        SoLuongThucTe: 0,
                        DanhMuc: classifyFashionCategory(item)
                    };
                });
                console.log('allMatHang sau khi map:', allMatHang); // Debug
                console.log('Số lượng mặt hàng sau khi map:', allMatHang.length); // Debug
                console.log('Mẫu dữ liệu đầu tiên:', allMatHang[0]); // Debug
            } else {
                console.warn('Dữ liệu không phải là array:', result.data);
                allMatHang = [];
            }
            
            filteredMatHang = [...allMatHang];
            console.log('filteredMatHang trước khi render:', filteredMatHang); // Debug
            console.log('Số lượng filteredMatHang:', filteredMatHang.length); // Debug
            
            // Render bảng (hàm renderTable sẽ tự đợi element sẵn sàng)
            renderTonKhoTable(filteredMatHang);
            updateStatistics();
            updateTonKhoTotalCount(filteredMatHang.length);
        } else {
            console.warn('API không thành công:', result.message); // Debug
            allMatHang = [];
            filteredMatHang = [];
            renderTonKhoTable(filteredMatHang);
            updateStatistics();
            updateTonKhoTotalCount(0);
        }
    } catch (error) {
        console.error('Lỗi load tồn kho:', error);
        alert('Không thể tải dữ liệu kiểm kê!');
        allMatHang = [];
        filteredMatHang = [];
        renderTonKhoTable(filteredMatHang);
        updateStatistics();
        updateTonKhoTotalCount(0);
    }
}

// ============================================
// 2. RENDER BẢNG DỮ LIỆU
// ============================================
function renderTonKhoTable(data) {
    console.log('renderTable called with data:', data); // Debug
    
    // Đợi một chút để đảm bảo DOM đã sẵn sàng
    const tryRender = () => {
        const tbody = document.getElementById('kiemKeTableBody');
        console.log('tbody element:', tbody); // Debug
        
        if (!tbody) {
            console.warn('Không tìm thấy element kiemKeTableBody, thử lại sau 100ms...');
            setTimeout(tryRender, 100);
            return;
        }
        
        doRenderTonKhoTable(tbody, data);
    };
    
    tryRender();
}

function doRenderTonKhoTable(tbody, data) {
    console.log('doRenderTonKhoTable called with tbody:', tbody, 'data:', data); // Debug
    console.log('tbody.id:', tbody?.id); // Debug - đảm bảo đúng element

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        console.log('No data to render'); // Debug
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Không có dữ liệu kiểm kê. Vui lòng kiểm tra lại tồn kho.
                </td>
            </tr>
        `;
        return;
    }

    console.log('Rendering', data.length, 'mặt hàng kiểm kê'); // Debug
    
    // Kiểm tra dữ liệu có đúng định dạng tồn kho không
    const firstItem = data[0];
    if (firstItem && !firstItem.MaHang && (firstItem.MaPhieu || firstItem.MaPKK)) {
        console.error('Dữ liệu không phải tồn kho mà là phiếu kiểm kê!', firstItem);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-red-500">
                    Lỗi: Dữ liệu không đúng định dạng tồn kho!
                </td>
            </tr>
        `;
        return;
    }
    
    // Tính toán phân trang
    const totalItems = data.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const pageData = data.slice(startIndex, endIndex);

    // Tạo HTML string trước, sau đó gán một lần để tối ưu hiệu suất
    let rowsHTML = '';
    try {
        pageData.forEach((matHang, indexOnPage) => {
            const globalIndex = startIndex + indexOnPage;
            console.log(`Creating row ${globalIndex}:`, matHang); // Debug
            // Kiểm tra dữ liệu có đủ thông tin không
            if (!matHang.MaHang) {
                console.warn(`Row ${globalIndex} thiếu MaHang:`, matHang);
            }
            const row = createTonKhoTableRow(matHang, globalIndex);
            if (row) {
                rowsHTML += row;
            } else {
                console.error(`Failed to create row for index ${globalIndex}:`, matHang);
            }
        });
        
        tbody.innerHTML = rowsHTML;
        console.log('Ton kho table rendered successfully, rowsHTML length:', rowsHTML.length); // Debug
        console.log('Number of rows in tbody:', tbody.querySelectorAll('tr').length); // Debug
    } catch (error) {
        console.error('Error rendering ton kho table:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-red-500">
                    Lỗi khi render bảng: ${error.message}
                </td>
            </tr>
        `;
    }

    // Cập nhật điều khiển phân trang
    updatePaginationControls(totalPages);

    // Attach event listeners sau khi render
    attachTableRowListeners();
}

// Tạo một dòng trong bảng tồn kho
function createTonKhoTableRow(matHang, index) {
    // Đảm bảo các giá trị không undefined
    const maHang = matHang?.MaHang || '';
    const tenHang = matHang?.TenHang || '';
    const thongTin = matHang?.ThongTin || '';
    const donViTinh = matHang?.DonViTinh || '';
    const soLuongPhanMem = matHang?.SoLuongPhanMem || 0;
    const soLuongThucTe = Number(matHang?.SoLuongThucTe) || 0;
    
    let chenhLech = soLuongThucTe - soLuongPhanMem;
    const chenhLechText = chenhLech > 0 ? `+${chenhLech}` : chenhLech.toString();
    
    // Xác định class và màu sắc dựa trên chênh lệch
    let rowClass = '';
    let inputClass = 'w-24 md:w-28 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium';
    let badgeClass = 'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    let actionButton = `
        <button onclick="ghiChu('${maHang}')" class="text-gray-400 hover:text-primary transition-colors" title="Ghi chú">
            <span class="material-symbols-outlined text-[20px]">note_add</span>
        </button>
    `;

    // Nếu chưa kiểm (SL thực tế = 0) thì giữ nền trắng, nút ghi chú
    if (soLuongThucTe === 0) {
        rowClass = '';
        inputClass = 'w-24 md:w-28 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium';
        actionButton = `
            <button onclick="ghiChu('${maHang}')" class="text-gray-400 hover:text-primary transition-colors" title="Ghi chú">
                <span class="material-symbols-outlined text-[20px]">note_add</span>
            </button>
        `;
        chenhLech = 0;
    } else if (chenhLech < 0) {
        // Thiếu hàng (màu đỏ)
        rowClass = 'bg-red-50/50 dark:bg-red-900/10';
        inputClass = 'w-24 md:w-28 bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 rounded px-2 py-1 text-center text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold';
        badgeClass = 'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        actionButton = `
            <button onclick="ghiNhanLyDo('${maHang}')" class="text-red-500 hover:text-red-700 transition-colors" title="Ghi nhận lý do chênh lệch">
                <span class="material-symbols-outlined text-[20px]">report_problem</span>
            </button>
        `;
    } else if (chenhLech > 0) {
        // Thừa hàng (màu xanh)
        rowClass = 'bg-green-50/50 dark:bg-green-900/10';
        inputClass = 'w-24 md:w-28 bg-white dark:bg-gray-900 border border-green-300 dark:border-green-800 rounded px-2 py-1 text-center text-green-600 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold';
        badgeClass = 'inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        actionButton = `
            <button onclick="ghiNhanLyDo('${maHang}')" class="text-green-600 hover:text-green-700 transition-colors" title="Ghi nhận lý do">
                <span class="material-symbols-outlined text-[20px]">edit_note</span>
            </button>
        `;
    } else {
        actionButton = `
            <button onclick="ghiChu('${maHang}')" class="text-gray-400 hover:text-primary transition-colors" title="Ghi chú">
                <span class="material-symbols-outlined text-[20px]">note_add</span>
            </button>
        `;
    }

    const infoText = [thongTin, donViTinh ? `ĐVT: ${donViTinh}` : ''].filter(Boolean).join(' • ');
    
    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${rowClass}" data-index="${index}">
            <td class="px-6 py-4">
                <input 
                    type="checkbox" 
                    class="kiem-ke-select w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    data-ma-hang="${maHang}"
                />
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">${maHang}</td>
            <td class="px-6 py-4">
                <div class="text-gray-900 dark:text-white font-medium">${tenHang}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${infoText || '-'}</div>
            </td>
            <td class="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                <input 
                    type="number"
                    min="0"
                    value="${soLuongThucTe}"
                    class="sl-thuc-te ${inputClass}"
                    oninput="updateSoLuongThucTe(${index}, this.value)"
                />
            </td>
            <td class="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                ${soLuongPhanMem}
            </td>
            <td class="px-6 py-4 text-right">
                ${actionButton}
            </td>
        </tr>
    `;
}

// Attach event listeners cho chọn dòng kiểm kê
function attachTableRowListeners() {
    const checkboxes = document.querySelectorAll('.kiem-ke-select');
    const selectAll = document.getElementById('selectAllKiemKe');
    const btnTao = document.getElementById('btnTaoPhieuKiemKe');

    if (!btnTao) return;

    const updateButtonState = () => {
        if (selectedMaHangs.size > 0) {
            btnTao.classList.remove('hidden');
            btnTao.disabled = false;
        } else {
            btnTao.classList.add('hidden');
            btnTao.disabled = true;
        }
    };

    // Áp dụng lại trạng thái checked theo selectedMaHangs
    checkboxes.forEach(cb => {
        const maHang = cb.getAttribute('data-ma-hang');
        if (maHang && selectedMaHangs.has(maHang)) {
            cb.checked = true;
        }
    });

    // Cập nhật trạng thái chọn tất cả dựa trên dữ liệu hiện có
    if (selectAll) {
        const total = checkboxes.length;
        const checkedCount = document.querySelectorAll('.kiem-ke-select:checked').length;
        selectAll.checked = total > 0 && checkedCount === total;
    }

    // Cập nhật nút tạo dựa trên selections hiện tại
    updateButtonState();

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const maHang = cb.getAttribute('data-ma-hang');
            if (!maHang) return;
            if (cb.checked) {
                selectedMaHangs.add(maHang);
            } else {
                selectedMaHangs.delete(maHang);
            }

            // Cập nhật trạng thái chọn tất cả
            if (selectAll) {
                const total = document.querySelectorAll('.kiem-ke-select').length;
                const checkedCount = document.querySelectorAll('.kiem-ke-select:checked').length;
                selectAll.checked = total > 0 && checkedCount === total;
            }

            updateButtonState();
        });
    });

    if (selectAll) {
        selectAll.addEventListener('change', () => {
            const checked = selectAll.checked;
            checkboxes.forEach(cb => {
                cb.checked = checked;
                const maHang = cb.getAttribute('data-ma-hang');
                if (!maHang) return;
                if (checked) {
                    selectedMaHangs.add(maHang);
                } else {
                    selectedMaHangs.delete(maHang);
                }
            });
            updateButtonState();
        });
    }
}

// Cập nhật số lượng thực tế
function updateSoLuongThucTe(index, soLuong) {
    // Chuẩn hóa về số
    soLuong = Number(soLuong);
    if (Number.isNaN(soLuong) || soLuong < 0) soLuong = 0;
    
    filteredMatHang[index].SoLuongThucTe = soLuong;
    
    // Tính lại chênh lệch
    const chenhLech = soLuong - filteredMatHang[index].SoLuongPhanMem;
    
    // Cập nhật lại giao diện theo chênh lệch
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
        const input = row.querySelector('.sl-thuc-te');
        const actionCell = row.querySelector('td:last-child');

        if (chenhLech < 0) {
            // Thiếu hàng
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-red-50/50 dark:bg-red-900/10';
            if (input) {
                input.className = 'sl-thuc-te w-full bg-white dark:bg-gray-900 border border-red-300 dark:border-red-800 rounded px-2 py-1.5 text-center text-red-600 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 font-bold';
            }
            if (actionCell) {
                actionCell.innerHTML = `
                    <button onclick="ghiNhanLyDo('${filteredMatHang[index].MaHang}')" class="text-red-500 hover:text-red-700 transition-colors" title="Ghi nhận lý do chênh lệch">
                        <span class="material-symbols-outlined text-[20px]">report_problem</span>
                    </button>
                `;
            }
        } else if (chenhLech > 0) {
            // Thừa hàng
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-green-50/50 dark:bg-green-900/10';
            if (input) {
                input.className = 'sl-thuc-te w-full bg-white dark:bg-gray-900 border border-green-300 dark:border-green-800 rounded px-2 py-1.5 text-center text-green-600 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold';
            }
            if (actionCell) {
                actionCell.innerHTML = `
                    <button onclick="ghiNhanLyDo('${filteredMatHang[index].MaHang}')" class="text-green-600 hover:text-green-700 transition-colors" title="Ghi nhận lý do">
                        <span class="material-symbols-outlined text-[20px]">edit_note</span>
                    </button>
                `;
            }
        } else {
            // Khớp
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';
            if (input) {
                input.className = 'sl-thuc-te w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-medium';
            }
            if (actionCell) {
                actionCell.innerHTML = `
                    <button onclick="ghiChu('${filteredMatHang[index].MaHang}')" class="text-gray-400 hover:text-primary transition-colors" title="Ghi chú">
                        <span class="material-symbols-outlined text-[20px]">note_add</span>
                    </button>
                `;
            }
        }
    }
    
    // Cập nhật lại thống kê
    updateStatistics();
    
    // Cập nhật lại trong allMatHang nếu cần
    const maHang = filteredMatHang[index].MaHang;
    const originalIndex = allMatHang.findIndex(m => m.MaHang === maHang);
    if (originalIndex !== -1) {
        allMatHang[originalIndex].SoLuongThucTe = soLuong;
    }
}

// ============================================
// 3. THỐNG KÊ
// ============================================
function updateStatistics() {
    const totalMatHang = filteredMatHang.length;
    const daKiemKhop = filteredMatHang.filter(m => Number(m.SoLuongThucTe) === Number(m.SoLuongPhanMem)).length;
    const chenhLech = filteredMatHang.filter(m => Number(m.SoLuongThucTe) !== Number(m.SoLuongPhanMem)).length;
    const chuaKiem = filteredMatHang.filter(m => Number(m.SoLuongThucTe) === 0).length;
    
    const totalEl = document.getElementById('totalMatHang');
    if (totalEl) {
        totalEl.textContent = totalMatHang;
    }
    
    const daKiemEl = document.getElementById('daKiemKhop');
    if (daKiemEl) {
        daKiemEl.textContent = daKiemKhop;
    }
    
    const chenhLechEl = document.getElementById('chenhLechCount');
    if (chenhLechEl) {
        chenhLechEl.textContent = chenhLech;
    }

    const chuaKiemEl = document.getElementById('chuaKiemCount');
    if (chuaKiemEl) {
        chuaKiemEl.textContent = chuaKiem;
    }
}

// ============================================
// 4b. PHÂN TRANG
// ============================================
function updatePaginationControls(totalPages) {
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (totalPagesEl) {
        totalPagesEl.textContent = totalPages;
    }
    if (currentPageEl) {
        currentPageEl.textContent = totalPages === 0 ? 0 : currentPage;
    }
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

// ============================================
// 4. TÌM KIẾM
// ============================================
function setupTonKhoSearch() {
    const searchInput = document.getElementById('searchMatHang');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        applyFilters(searchTerm);
    });
}

// Áp dụng filters và search
function applyFilters(searchTerm = '') {
    filteredMatHang = allMatHang.filter(matHang => {
        // Tìm kiếm
        const matchSearch = !searchTerm || 
            matHang.MaHang.toLowerCase().includes(searchTerm) ||
            matHang.TenHang.toLowerCase().includes(searchTerm) ||
            (matHang.ThongTin && matHang.ThongTin.toLowerCase().includes(searchTerm));

        // Filter danh mục
        const matchCategory = filterState.category === 'all' || matHang.DanhMuc === filterState.category;

        // Filter trạng thái (khớp / chênh lệch / chưa kiểm)
        let matchStatus = true;
        if (filterState.status === 'matched') {
            matchStatus = matHang.SoLuongThucTe === matHang.SoLuongPhanMem;
        } else if (filterState.status === 'diff') {
            matchStatus = matHang.SoLuongThucTe !== matHang.SoLuongPhanMem;
        } else if (filterState.status === 'uncounted') {
            matchStatus = Number(matHang.SoLuongThucTe) === 0;
        }

        return matchSearch && matchCategory && matchStatus;
    });

    // Mỗi lần filter/search reset về trang 1
    currentPage = 1;
    renderTonKhoTable(filteredMatHang);
    updateStatistics();
    updateTonKhoTotalCount(filteredMatHang.length);
}

// ============================================
// 5. FILTERS
// ============================================
function setupTonKhoFilters() {
    const filterCategory = document.getElementById('filterCategory');

    if (filterCategory) {
        filterCategory.addEventListener('change', (e) => {
            filterState.category = e.target.value;
            const searchTerm = document.getElementById('searchMatHang')?.value || '';
            applyFilters(searchTerm);
        });
    }
}

// Thiết lập filter khi bấm vào các thẻ thống kê
function setupStatisticsFilters() {
    const btnAll = document.getElementById('btnFilterAll');
    const btnMatched = document.getElementById('btnFilterMatched');
    const btnDiff = document.getElementById('btnFilterDiff');
    const btnUncounted = document.getElementById('btnFilterUncounted');

    if (!btnAll && !btnMatched && !btnDiff && !btnUncounted) return;

    const buttons = [btnAll, btnUncounted, btnMatched, btnDiff].filter(Boolean);

    const setActive = (activeBtn) => {
        buttons.forEach((btn) => {
            if (!btn) return;
            const baseClasses =
                'bg-white dark:bg-gray-800 px-3 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors text-left';
            if (btn === activeBtn) {
                btn.className = baseClasses + ' ring-2 ring-primary/60 bg-blue-50/60 dark:bg-blue-900/20';
            } else {
                btn.className = baseClasses;
            }
        });
    };

    const triggerFilter = () => {
        const searchTerm = document.getElementById('searchMatHang')?.value || '';
        applyFilters(searchTerm);
    };

    if (btnAll) {
        btnAll.addEventListener('click', () => {
            filterState.status = 'all';
            setActive(btnAll);
            triggerFilter();
        });
    }
    if (btnMatched) {
        btnMatched.addEventListener('click', () => {
            filterState.status = 'matched';
            setActive(btnMatched);
            triggerFilter();
        });
    }
    if (btnDiff) {
        btnDiff.addEventListener('click', () => {
            filterState.status = 'diff';
            setActive(btnDiff);
            triggerFilter();
        });
    }

    if (btnUncounted) {
        btnUncounted.addEventListener('click', () => {
            filterState.status = 'uncounted';
            setActive(btnUncounted);
            triggerFilter();
        });
    }

    // Mặc định active = tất cả
    setActive(btnAll || null);
}

// ============================================
// 6. CẬP NHẬT TỒN KHO
// ============================================
async function capNhatTonKho() {
    alert('Màn hình này chỉ để xem. Vui lòng vào "Tạo phiếu kiểm kê" để chỉnh sửa và cập nhật tồn kho.');
}

// ============================================
// 7. GHÍ NHẬN/CHÚ THÍCH
// ============================================
function ghiChu(maHang) {
    const lyDo = prompt(`Nhập ghi chú cho mã hàng ${maHang}:`);
    if (lyDo !== null) {
        const trimmed = lyDo.trim();
        // Lưu tạm ghi chú vào localStorage để đồng bộ sang màn hình Phiếu kiểm kê
        try {
            const key = 'KK_LYDO_CHENHLECH';
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            existing[maHang] = trimmed;
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (e) {
            console.warn('Không thể lưu ghi chú vào localStorage:', e);
        }
        console.log(`Ghi chú cho ${maHang}:`, lyDo);
    }
}

function ghiNhanLyDo(maHang) {
    const lyDo = prompt(`Nhập lý do chênh lệch cho mã hàng ${maHang}:`);
    if (lyDo !== null && lyDo.trim() !== '') {
        const trimmed = lyDo.trim();
        // Lưu tạm lý do vào localStorage để đồng bộ sang màn hình Phiếu kiểm kê
        try {
            const key = 'KK_LYDO_CHENHLECH';
            const existing = JSON.parse(localStorage.getItem(key) || '{}');
            existing[maHang] = trimmed;
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (e) {
            console.warn('Không thể lưu lý do vào localStorage:', e);
        }
        console.log(`Lý do chênh lệch cho ${maHang}:`, lyDo);
        alert('Đã ghi nhận lý do chênh lệch!');
    }
}

// ============================================
// 8. HELPER FUNCTIONS
// ============================================
function updateTotalCount(count) {
    const totalElement = document.getElementById('totalCount');
    if (totalElement) {
        totalElement.textContent = count;
    }
}

// Alias name rõ ràng để tránh trùng với module khác
const updateTonKhoTotalCount = updateTotalCount;

// ============================================
// 9. INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadMatHang(); // Sẽ tự động load kho đầu tiên
    setupTonKhoSearch();
    setupTonKhoFilters();
    setupStatisticsFilters();
    
    // Thiết lập sự kiện cho nút tạo phiếu kiểm kê
    const btnTao = document.getElementById('btnTaoPhieuKiemKe');
    if (btnTao) {
        btnTao.addEventListener('click', () => {
            const list = Array.from(selectedMaHangs || []);
            if (!list.length) {
                alert('Vui lòng chọn ít nhất một mã hàng để tạo phiếu kiểm kê.');
                return;
            }

            // Điều hướng sang màn hình tạo phiếu, kèm mã hàng đã chọn
            const url = `/PTTKHT/QLK/PKK/code.html?maHang=${encodeURIComponent(list.join(','))}`;
            window.location.href = url;
        });
    }

    // Xử lý chuyển sub-tab
    const tabTonKho = document.getElementById('tabTonKho');
    const tabDanhSach = document.getElementById('tabDanhSach');
    const contentTonKho = document.getElementById('tabContentTonKho');
    const contentDanhSach = document.getElementById('tabContentDanhSach');
    let danhSachInitialized = false;

    const setActiveTab = (isTonKho) => {
        if (!tabTonKho || !tabDanhSach || !contentTonKho || !contentDanhSach) return;

        if (isTonKho) {
            tabTonKho.className = 'px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white shadow-sm focus:outline-none';
            tabDanhSach.className = 'px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none';
            contentTonKho.classList.remove('hidden');
            contentDanhSach.classList.add('hidden');
        } else {
            tabDanhSach.className = 'px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white shadow-sm focus:outline-none';
            tabTonKho.className = 'px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 focus:outline-none';
            contentDanhSach.classList.remove('hidden');
            contentTonKho.classList.add('hidden');
        }
    };

    if (tabTonKho) {
        tabTonKho.addEventListener('click', () => setActiveTab(true));
    }

    if (tabDanhSach) {
        tabDanhSach.addEventListener('click', () => {
            setActiveTab(false);
            if (!danhSachInitialized && typeof window.initDanhSachKiemKe === 'function') {
                window.initDanhSachKiemKe();
                danhSachInitialized = true;
            }
        });
    }

    // Tabs chính: Nhập hàng / Xuất hàng / Kiểm kê kho hàng
    const mainTabNhap = document.getElementById('mainTabNhapHang');
    const mainTabXuat = document.getElementById('mainTabXuatHang');
    const mainTabKiemKe = document.getElementById('mainTabKiemKe');

    if (mainTabNhap) {
        mainTabNhap.addEventListener('click', () => {
            window.location.href = '/PTTKHT/QLK/NK/code.html';
        });
    }

    if (mainTabXuat) {
        mainTabXuat.addEventListener('click', () => {
            window.location.href = '/PTTKHT/QLK/XK/code.html';
        });
    }

    if (mainTabKiemKe) {
        mainTabKiemKe.addEventListener('click', () => {
            // Đang ở trang kiểm kê, không cần điều hướng; có thể scroll lên đầu
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Sự kiện chuyển trang
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage -= 1;
                renderTonKhoTable(filteredMatHang);
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.max(1, Math.ceil((filteredMatHang || []).length / PAGE_SIZE));
            if (currentPage < totalPages) {
                currentPage += 1;
                renderTonKhoTable(filteredMatHang);
            }
        });
    }
});

// Export functions để có thể gọi từ HTML
window.capNhatTonKho = capNhatTonKho;
window.ghiChu = ghiChu;
window.ghiNhanLyDo = ghiNhanLyDo;
