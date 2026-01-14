// ============================================
// PHIẾU NHẬP KHO (PNK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let phieuNhapData = {
    MaPhieu: '',
    NhaCungCap: '',
    NgayNhap: new Date().toISOString().split('T')[0],
    GhiChu: '',
    ChiếtKhấu: 0,
    DanhSachHang: []
};

let mode = 'create'; // create, edit, view
let maPhieuEdit = null;

// Dữ liệu từ API
let danhSachNhaCungCap = [];
let danhSachKho = [];
let danhSachHangHoa = [];

// Dữ liệu mock cho từng phiếu nhập (mỗi mã phiếu có dữ liệu riêng)
const mockPhieuNhapData = {
    'PN-2023-1001': {
        MaPhieu: 'PN-2023-1001',
        NhaCungCap: 'Công ty TNHH ABC',
        NgayNhap: '2023-10-20',
        GhiChu: 'Hàng giao đợt 1, kiểm tra kỹ bao bì',
        ChiếtKhấu: 0,
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 100, DonGiaNhap: 150000, ThanhTien: 15000000 },
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 50, DonGiaNhap: 320000, ThanhTien: 16000000 },
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 20, DonGiaNhap: 250000, ThanhTien: 5000000 }
        ]
    },
    'PN-2023-1002': {
        MaPhieu: 'PN-2023-1002',
        NhaCungCap: 'Điện máy Xanh',
        NgayNhap: '2023-10-21',
        GhiChu: 'Hàng điện tử, cần bảo quản kỹ',
        ChiếtKhấu: 1000000,
        TrangThai: 'processing',
        DanhSachHang: [
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 60, DonGiaNhap: 450000, ThanhTien: 27000000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 40, DonGiaNhap: 280000, ThanhTien: 11200000 }
        ]
    },
    'PN-2023-1003': {
        MaPhieu: 'PN-2023-1003',
        NhaCungCap: 'Apple Vietnam',
        NgayNhap: '2023-10-22',
        GhiChu: 'Hàng cao cấp, cần kiểm tra kỹ lưỡng',
        ChiếtKhấu: 0,
        TrangThai: 'pending',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 150, DonGiaNhap: 150000, ThanhTien: 22500000 },
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 80, DonGiaNhap: 250000, ThanhTien: 20000000 }
        ]
    },
    'PN-2023-1004': {
        MaPhieu: 'PN-2023-1004',
        NhaCungCap: 'Samsung Vina',
        NgayNhap: '2023-10-23',
        GhiChu: 'Giao hàng đúng hạn, chất lượng tốt',
        ChiếtKhấu: 2000000,
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 120, DonGiaNhap: 320000, ThanhTien: 38400000 },
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 70, DonGiaNhap: 450000, ThanhTien: 31500000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 50, DonGiaNhap: 280000, ThanhTien: 14000000 }
        ]
    },
    'PN-2023-1005': {
        MaPhieu: 'PN-2023-1005',
        NhaCungCap: 'Vinamilk',
        NgayNhap: '2023-10-23',
        GhiChu: 'Hàng thực phẩm, cần bảo quản lạnh',
        ChiếtKhấu: 5, // 5%
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 200, DonGiaNhap: 150000, ThanhTien: 30000000 },
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 100, DonGiaNhap: 320000, ThanhTien: 32000000 }
        ]
    },
    'PN-2023-1006': {
        MaPhieu: 'PN-2023-1006',
        NhaCungCap: 'Unilever',
        NgayNhap: '2023-10-24',
        GhiChu: 'Đang kiểm tra chất lượng',
        ChiếtKhấu: 1500000,
        TrangThai: 'processing',
        DanhSachHang: [
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 90, DonGiaNhap: 250000, ThanhTien: 22500000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 60, DonGiaNhap: 280000, ThanhTien: 16800000 }
        ]
    },
    'PN-2023-1007': {
        MaPhieu: 'PN-2023-1007',
        NhaCungCap: 'Masan',
        NgayNhap: '2023-10-25',
        GhiChu: 'Chờ xác nhận từ nhà cung cấp',
        ChiếtKhấu: 0,
        TrangThai: 'pending',
        DanhSachHang: [
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 45, DonGiaNhap: 450000, ThanhTien: 20250000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 35, DonGiaNhap: 280000, ThanhTien: 9800000 }
        ]
    }
};

// ============================================
// 1. KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load dữ liệu từ API
    await loadDanhSachNhaCungCap();
    await loadDanhSachKho();
    await loadDanhSachHangHoa();
    
    // Kiểm tra URL params để xác định mode
    const urlParams = new URLSearchParams(window.location.search);
    maPhieuEdit = urlParams.get('maPhieu');
    mode = urlParams.get('mode') || 'create';

    if (maPhieuEdit && mode === 'edit') {
        // Kiểm tra trạng thái phiếu trước khi cho phép edit
        await loadPhieuNhap(maPhieuEdit);
        // Nếu phiếu đã completed, tự động chuyển sang mode view
        if (phieuNhapData.TrangThai === 1) {
            mode = 'view';
            updateUIForViewMode();
            alert('Phiếu nhập đã hoàn thành, chỉ có thể xem chi tiết!');
        } else {
            updateUIForEditMode();
        }
    } else if (maPhieuEdit && mode === 'view') {
        await loadPhieuNhap(maPhieuEdit);
        updateUIForViewMode();
    } else {
        await generateMaPhieu();
        renderForm(); // Cập nhật mã phiếu vào input
        updateUIForCreateMode();
    }

    setupEventListeners();
    populateDatalists();
    updateTongTien();
});

// Load danh sách nhà cung cấp
async function loadDanhSachNhaCungCap() {
    try {
        const response = await fetch('/api/kho/nha-cung-cap');
        const result = await response.json();
        if (result.success) {
            // Lưu full object để có thể hiển thị nhiều thông tin hơn
            danhSachNhaCungCap = result.data || [];
        }
    } catch (error) {
        console.error('Lỗi load nhà cung cấp:', error);
    }
}

// Load danh sách kho - Không còn cần thiết
async function loadDanhSachKho() {
    // Không còn kho để load
}

// Load danh sách hàng hóa
async function loadDanhSachHangHoa() {
    try {
        const response = await fetch('/api/kho/hang-hoa');
        const result = await response.json();
        if (result.success) {
            danhSachHangHoa = result.data.map(hh => ({
                MaHang: hh.MaHang,
                TenHang: hh.TenHang,
                DVT: hh.DonViTinh,
                DonGiaNhap: hh.DonGiaNhap || 0
            }));
        }
    } catch (error) {
        console.error('Lỗi load hàng hóa:', error);
    }
}

// ============================================
// 2. LOAD DỮ LIỆU PHIẾU NHẬP
// ============================================
async function loadPhieuNhap(maPhieu) {
    try {
        const response = await fetch(`/api/kho/nhap-kho/${maPhieu}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            phieuNhapData = {
                MaPhieu: data.MaPNK,
                MaNCC: data.MaNCC,
                NhaCungCap: data.TenNCC || '',
                NgayNhap: data.NgayNhap ? data.NgayNhap.split('T')[0] : new Date().toISOString().split('T')[0],
                GhiChu: data.GhiChu || '',
                ChiếtKhấu: data.ChietKhau || 0,
                TrangThai: data.TrangThai,
                DanhSachHang: (data.DanhSachHang || []).map(h => ({
                    MaHang: h.MaHang,
                    TenHang: h.TenHang,
                    DVT: h.DonViTinh,
                    SoLuong: Number(h.SoLuong) || 0,
                    DonGiaNhap: Number(h.DonGiaNhap) || 0,
                    ThanhTien: Number(h.ThanhTien) || 0
                }))
            };
        } else {
            // Dữ liệu mặc định cho phiếu mới hoặc không tìm thấy
            phieuNhapData = {
                MaPhieu: maPhieu,
                NhaCungCap: '',
                NgayNhap: new Date().toISOString().split('T')[0],
                GhiChu: '',
                ChiếtKhấu: 0,
                TrangThai: 0,
                DanhSachHang: []
            };
        }

        renderForm();
        renderDanhSachHang();
        updateTongTien();
        return phieuNhapData;
    } catch (error) {
        console.error('Lỗi load phiếu nhập:', error);
        alert('Không thể tải dữ liệu phiếu nhập!');
        // Dữ liệu mặc định khi lỗi
        phieuNhapData = {
            MaPhieu: maPhieu,
            NhaCungCap: '',
            NgayNhap: new Date().toISOString().split('T')[0],
            GhiChu: '',
            ChiếtKhấu: 0,
            TrangThai: 0,
            DanhSachHang: []
        };
        renderForm();
        renderDanhSachHang();
        updateTongTien();
    }
}

// ============================================
// 3. SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Nhà cung cấp
    const nhaCungCapInput = document.getElementById('nhaCungCap');
    if (nhaCungCapInput) {
        nhaCungCapInput.addEventListener('change', (e) => {
            phieuNhapData.NhaCungCap = e.target.value;
        });
    }


    // Ngày nhập
    const ngayNhapInput = document.getElementById('ngayNhap');
    if (ngayNhapInput) {
        ngayNhapInput.addEventListener('change', (e) => {
            phieuNhapData.NgayNhap = e.target.value;
        });
    }

    // Ghi chú
    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.addEventListener('input', (e) => {
            phieuNhapData.GhiChu = e.target.value;
        });
    }

    // Chiết khấu
    const chietKhauInput = document.getElementById('chietKhau');
    if (chietKhauInput) {
        chietKhauInput.addEventListener('input', (e) => {
            phieuNhapData.ChiếtKhấu = parseFloat(e.target.value) || 0;
            updateTongTien();
        });
    }

    // Tìm kiếm hàng hóa
    const searchHangHoaInput = document.getElementById('searchHangHoa');
    if (searchHangHoaInput) {
        searchHangHoaInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchHangHoa(e.target.value);
                e.target.value = '';
            }
        });
    }

    // Nhập Excel
    const nhapExcelBtn = document.getElementById('nhapExcelBtn');
    if (nhapExcelBtn) {
        nhapExcelBtn.addEventListener('click', () => {
            alert('Tính năng nhập Excel đang được phát triển');
        });
    }

    // Nút thêm NCC
    const addNCCBtn = document.getElementById('addNCCBtn');
    if (addNCCBtn) {
        addNCCBtn.addEventListener('click', () => {
            const dropdown = document.getElementById('nccDropdown');
            const input = document.getElementById('nhaCungCap');
            if (!dropdown || !input) return;

            // Nếu đang mở thì đóng lại
            if (!dropdown.classList.contains('hidden')) {
                dropdown.classList.add('hidden');
                return;
            }

            // Render danh sách NCC từ dữ liệu đã load
            if (!Array.isArray(danhSachNhaCungCap) || danhSachNhaCungCap.length === 0) {
                dropdown.innerHTML = '<div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400">Không có nhà cung cấp nào.</div>';
            } else {
                const itemsHtml = danhSachNhaCungCap.map((ncc) => {
                    const ten = ncc.TenNCC || '';
                    const ma = ncc.MaNCC || '';
                    const thongTinPhu = [ma && `Mã: ${ma}`, ncc.DiaChi && `Đc: ${ncc.DiaChi}`].filter(Boolean).join(' • ');
                    return `
                        <button
                            type="button"
                            class="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 last:border-b-0 supplier-item"
                            data-ten="${ten.replace(/"/g, '&quot;')}"
                        >
                            <div class="font-medium">${ten}</div>
                            ${thongTinPhu ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">${thongTinPhu}</div>` : ''}
                        </button>
                    `;
                }).join('');
                dropdown.innerHTML = `
                    <div class="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                        Chọn nhanh nhà cung cấp
                    </div>
                    ${itemsHtml}
                `;
            }

            dropdown.classList.remove('hidden');

            // Gắn sự kiện chọn NCC
            dropdown.querySelectorAll('.supplier-item').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const ten = btn.getAttribute('data-ten') || '';
                    input.value = ten;
                    phieuNhapData.NhaCungCap = ten;
                    dropdown.classList.add('hidden');
                });
            });
        });
    }

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('nccDropdown');
        const addNCCBtnEl = document.getElementById('addNCCBtn');
        if (!dropdown || !addNCCBtnEl) return;
        if (!dropdown.contains(e.target) && !addNCCBtnEl.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    // Lưu tạm
    const luuTamBtn = document.getElementById('luuTamBtn');
    if (luuTamBtn) {
        luuTamBtn.addEventListener('click', () => {
            savePhieuNhap('draft');
        });
    }

    // Hoàn thành
    const hoanThanhBtn = document.getElementById('hoanThanhBtn');
    if (hoanThanhBtn) {
        hoanThanhBtn.addEventListener('click', () => {
            savePhieuNhap('completed');
        });
    }

    // Phím tắt F3
    document.addEventListener('keydown', (e) => {
        if (e.key === 'F3') {
            e.preventDefault();
            const searchInput = document.getElementById('searchHangHoa');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });
}

// ============================================
// 4. RENDER FORM
// ============================================
function renderForm() {
    const maPhieuInput = document.getElementById('maPhieu');
    if (maPhieuInput) {
        maPhieuInput.value = phieuNhapData.MaPhieu;
    }

    const nhaCungCapInput = document.getElementById('nhaCungCap');
    if (nhaCungCapInput) {
        nhaCungCapInput.value = phieuNhapData.NhaCungCap;
    }


    const ngayNhapInput = document.getElementById('ngayNhap');
    if (ngayNhapInput) {
        ngayNhapInput.value = phieuNhapData.NgayNhap;
    }

    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.value = phieuNhapData.GhiChu;
    }

    const chietKhauInput = document.getElementById('chietKhau');
    if (chietKhauInput) {
        chietKhauInput.value = phieuNhapData.ChiếtKhấu;
    }
}

// ============================================
// 5. RENDER DANH SÁCH HÀNG
// ============================================
function renderDanhSachHang() {
    const tbody = document.getElementById('danhSachHangBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (phieuNhapData.DanhSachHang.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Chưa có hàng hóa nào. Nhập tên hoặc mã hàng để thêm.
                </td>
            </tr>
        `;
        return;
    }

    phieuNhapData.DanhSachHang.forEach((hang, index) => {
        const row = createHangRow(hang, index);
        tbody.innerHTML += row;
    });

    // Attach event listeners sau khi render
    attachHangRowListeners();
}

// Tạo một dòng hàng hóa
function createHangRow(hang, index) {
    const isReadonly = mode === 'view' ? 'readonly' : '';
    const readonlyClass = mode === 'view' ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed' : '';
    const isCustom = !!hang.IsCustom;

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-index="${index}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${hang.MaHang}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${
                    isCustom && mode !== 'view'
                        ? `
                        <input 
                            type="text"
                            class="hang-tenHang w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm"
                            placeholder="Nhập tên hàng..."
                            value="${hang.TenHang || ''}"
                            data-index="${index}"
                        />
                    `
                        : `
                        <div class="text-sm font-medium text-gray-900 dark:text-white">${hang.TenHang || ''}</div>
                        ${hang.ThongTin ? `<div class="text-xs text-gray-500 dark:text-gray-400">${hang.ThongTin}</div>` : ''}
                    `
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">
                ${
                    isCustom && mode !== 'view'
                        ? `
                        <input
                            type="text"
                            class="hang-dvt w-20 text-center rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm"
                            placeholder="ĐVT"
                            value="${hang.DVT || ''}"
                            data-index="${index}"
                        />
                    `
                        : (hang.DVT || '')
                }
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <input 
                    type="number" 
                    class="hang-soLuong w-24 text-right rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm ${readonlyClass}" 
                    value="${hang.SoLuong}" 
                    min="1"
                    ${isReadonly}
                    data-index="${index}"
                />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
                <input 
                    type="text" 
                    class="hang-donGia w-32 text-right rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm ${readonlyClass}" 
                    value="${formatCurrency(hang.DonGiaNhap)}" 
                    ${isReadonly}
                    data-index="${index}"
                />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white text-right">${formatCurrency(hang.ThanhTien)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
                ${mode !== 'view' ? `
                    <button 
                        onclick="xoaHang(${index})" 
                        class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Xóa hàng"
                    >
                        <span class="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                ` : ''}
            </td>
        </tr>
    `;
}

// Attach event listeners cho các input trong bảng hàng
function attachHangRowListeners() {
    // Số lượng
    document.querySelectorAll('.hang-soLuong').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            updateHangSoLuong(index, parseInt(e.target.value) || 1);
        });
    });

    // Đơn giá
    document.querySelectorAll('.hang-donGia').forEach(input => {
        input.addEventListener('blur', (e) => {
            const index = parseInt(e.target.dataset.index);
            const gia = parseCurrency(e.target.value);
            updateHangDonGia(index, gia);
        });
    });

    // Tên hàng cho các dòng custom
    document.querySelectorAll('.hang-tenHang').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (Number.isNaN(index) || !phieuNhapData.DanhSachHang[index]) return;
            phieuNhapData.DanhSachHang[index].TenHang = e.target.value;
        });
    });

    // ĐVT cho các dòng custom
    document.querySelectorAll('.hang-dvt').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (Number.isNaN(index) || !phieuNhapData.DanhSachHang[index]) return;
            phieuNhapData.DanhSachHang[index].DVT = e.target.value;
        });
    });
}

// ============================================
// 6. QUẢN LÝ HÀNG HÓA
// ============================================

// Tìm kiếm và thêm hàng hóa
function handleSearchHangHoa(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return;

    const rawTerm = searchTerm.trim();
    const searchLower = rawTerm.toLowerCase();
    
    // Chỉ match CHÍNH XÁC theo MÃ HÀNG (không match theo tên, không match chứa)
    const hangHoa = danhSachHangHoa.find(
        h => (h.MaHang || '').toLowerCase() === searchLower
    );

    if (hangHoa) {
        // Kiểm tra xem hàng đã tồn tại chưa
        const existingIndex = phieuNhapData.DanhSachHang.findIndex(h => h.MaHang === hangHoa.MaHang);
        
        if (existingIndex !== -1) {
            // Tăng số lượng nếu đã tồn tại
            const hang = phieuNhapData.DanhSachHang[existingIndex];
            hang.SoLuong = Number(hang.SoLuong) + 1;
            const donGia = Number(hang.DonGiaNhap) || 0;
            hang.ThanhTien = hang.SoLuong * donGia;
        } else {
            // Thêm mới
            const donGiaNhap = Number(hangHoa.DonGiaNhap) || 0;
            phieuNhapData.DanhSachHang.push({
                MaHang: hangHoa.MaHang,
                TenHang: hangHoa.TenHang,
                DVT: hangHoa.DVT,
                SoLuong: 1,
                DonGiaNhap: donGiaNhap,
                ThanhTien: donGiaNhap
            });
        }

        renderDanhSachHang();
        updateTongTien();
    } else {
        // Không tìm thấy trong danh mục cũ: thêm mới với mã nhập vào, tên trống
        const maHangMoi = rawTerm;

        const existingIndex = phieuNhapData.DanhSachHang.findIndex(h => h.MaHang === maHangMoi);
        if (existingIndex !== -1) {
            // Nếu đã có thì tăng số lượng
            const hang = phieuNhapData.DanhSachHang[existingIndex];
            hang.SoLuong = Number(hang.SoLuong) + 1;
            const donGia = Number(hang.DonGiaNhap) || 0;
            hang.ThanhTien = hang.SoLuong * donGia;
        } else {
            phieuNhapData.DanhSachHang.push({
                MaHang: maHangMoi,
                TenHang: '',
                DVT: '',
                SoLuong: 1,
                DonGiaNhap: 0,
                ThanhTien: 0,
                ThongTin: '',
                IsCustom: true
            });
        }

        renderDanhSachHang();
        updateTongTien();
    }
}

// Xóa hàng
function xoaHang(index) {
    if (confirm('Bạn có chắc chắn muốn xóa hàng hóa này?')) {
        phieuNhapData.DanhSachHang.splice(index, 1);
        renderDanhSachHang();
        updateTongTien();
    }
}

// Cập nhật số lượng
function updateHangSoLuong(index, soLuong) {
    soLuong = Number(soLuong) || 1;
    if (soLuong < 1) soLuong = 1;
    
    phieuNhapData.DanhSachHang[index].SoLuong = soLuong;
    const donGia = Number(phieuNhapData.DanhSachHang[index].DonGiaNhap) || 0;
    phieuNhapData.DanhSachHang[index].ThanhTien = soLuong * donGia;
    
    updateTongTien();
    
    // Cập nhật lại thành tiền trong bảng
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
        const thanhTienCell = row.querySelector('td:nth-child(7)');
        if (thanhTienCell) {
            thanhTienCell.textContent = formatCurrency(phieuNhapData.DanhSachHang[index].ThanhTien);
        }
    }
}

// Cập nhật đơn giá
function updateHangDonGia(index, donGia) {
    donGia = Number(donGia) || 0;
    if (donGia < 0) donGia = 0;
    
    phieuNhapData.DanhSachHang[index].DonGiaNhap = donGia;
    const soLuong = Number(phieuNhapData.DanhSachHang[index].SoLuong) || 0;
    phieuNhapData.DanhSachHang[index].ThanhTien = soLuong * donGia;
    
    updateTongTien();
    
    // Cập nhật lại đơn giá và thành tiền trong bảng
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
        const donGiaInput = row.querySelector('.hang-donGia');
        const thanhTienCell = row.querySelector('td:nth-child(7)');
        
        if (donGiaInput) {
            donGiaInput.value = formatCurrency(donGia);
        }
        if (thanhTienCell) {
            thanhTienCell.textContent = formatCurrency(phieuNhapData.DanhSachHang[index].ThanhTien);
        }
    }
}

// ============================================
// 7. TÍNH TOÁN
// ============================================
function updateTongTien() {
    // Tổng số lượng
    const tongSoLuong = phieuNhapData.DanhSachHang.reduce((sum, h) => sum + (Number(h.SoLuong) || 0), 0);
    const tongSoLuongEl = document.getElementById('tongSoLuong');
    if (tongSoLuongEl) {
        tongSoLuongEl.textContent = tongSoLuong.toLocaleString('vi-VN');
    }

    // Tổng tiền hàng - Đảm bảo chuyển đổi sang số để tránh nối chuỗi
    const tongTienHang = phieuNhapData.DanhSachHang.reduce((sum, h) => {
        const thanhTien = typeof h.ThanhTien === 'string' ? parseCurrency(h.ThanhTien) : (Number(h.ThanhTien) || 0);
        return sum + thanhTien;
    }, 0);
    const tongTienHangEl = document.getElementById('tongTienHang');
    if (tongTienHangEl) {
        tongTienHangEl.textContent = formatCurrency(tongTienHang);
    }

    // Chiết khấu
    let chietKhauAmount = 0;
    if (phieuNhapData.ChiếtKhấu) {
        if (phieuNhapData.ChiếtKhấu.toString().includes('%')) {
            const percent = parseFloat(phieuNhapData.ChiếtKhấu.toString().replace('%', ''));
            chietKhauAmount = (tongTienHang * percent) / 100;
        } else {
            chietKhauAmount = phieuNhapData.ChiếtKhấu;
        }
    }

    // Tiền cần trả
    const tienCanTra = Math.max(0, tongTienHang - chietKhauAmount);
    const tienCanTraEl = document.getElementById('tienCanTra');
    if (tienCanTraEl) {
        tienCanTraEl.textContent = formatCurrency(tienCanTra) + ' ₫';
    }
}

// ============================================
// 8. VALIDATE VÀ LƯU
// ============================================
function validateForm() {
    if (!phieuNhapData.NhaCungCap || phieuNhapData.NhaCungCap.trim() === '') {
        alert('Vui lòng chọn nhà cung cấp!');
        document.getElementById('nhaCungCap')?.focus();
        return false;
    }

    if (!phieuNhapData.NgayNhap) {
        alert('Vui lòng chọn ngày nhập!');
        document.getElementById('ngayNhap')?.focus();
        return false;
    }

    if (phieuNhapData.DanhSachHang.length === 0) {
        alert('Vui lòng thêm ít nhất một hàng hóa!');
        document.getElementById('searchHangHoa')?.focus();
        return false;
    }

    return true;
}

async function savePhieuNhap(trangThai) {
    if (!validateForm()) return;

    const isCompleted = trangThai === 'completed';
    if (isCompleted && !confirm('Xác nhận hoàn thành phiếu nhập? Phiếu sẽ không thể chỉnh sửa sau khi hoàn thành.')) {
        return;
    }

    try {
        // Lấy MaNV từ session hoặc localStorage (giả sử đã lưu khi đăng nhập)
        const userInfo = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
        const MaNV = userInfo.MaNV || 1; // Mặc định là 1 nếu chưa có
        
        // Tìm MaNCC từ tên nhà cung cấp
        const nccResponse = await fetch('/api/kho/nha-cung-cap');
        const nccResult = await nccResponse.json();
        const ncc = nccResult.success ? nccResult.data.find(n => n.TenNCC === phieuNhapData.NhaCungCap) : null;
        
        // Tính tổng tiền - Đảm bảo chuyển đổi sang số
        const TongTien = phieuNhapData.DanhSachHang.reduce((sum, h) => {
            const thanhTien = typeof h.ThanhTien === 'string' ? parseCurrency(h.ThanhTien) : (Number(h.ThanhTien) || 0);
            return sum + thanhTien;
        }, 0);
        
        // Tính chiết khấu (chuyển đổi từ string sang number nếu cần)
        const ChietKhau = typeof phieuNhapData.ChiếtKhấu === 'string' 
            ? parseCurrency(phieuNhapData.ChiếtKhấu.toString()) 
            : (Number(phieuNhapData.ChiếtKhấu) || 0);
        
        const dataToSave = {
            MaPNK: phieuNhapData.MaPhieu,
            NgayNhap: phieuNhapData.NgayNhap,
            MaNCC: ncc ? ncc.MaNCC : null,
            MaNV: MaNV,
            TongTien: TongTien,
            ChietKhau: ChietKhau,
            GhiChu: phieuNhapData.GhiChu || null,
            TrangThai: isCompleted ? 1 : 0,
            DanhSachHang: phieuNhapData.DanhSachHang.map(h => ({
                MaHang: h.MaHang,
                TenHang: h.TenHang || '',
                DVT: h.DVT || '',
                SoLuong: h.SoLuong,
                DonGiaNhap: h.DonGiaNhap,
                ThanhTien: h.ThanhTien
            }))
        };

        const url = mode === 'edit' 
            ? `/api/kho/nhap-kho/${phieuNhapData.MaPhieu}` 
            : '/api/kho/nhap-kho';
        const method = mode === 'edit' ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        if (result.success) {
            alert(result.message);
            if (isCompleted) {
                window.location.href = '/PTTKHT/QLK/NK/code.html';
            }
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi lưu phiếu nhập:', error);
        alert('Không thể lưu phiếu nhập: ' + error.message);
    }
}

// ============================================
// 9. HELPER FUNCTIONS
// ============================================

// Format tiền tệ
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '0';
    return parseInt(amount).toLocaleString('vi-VN');
}

// Parse tiền tệ từ chuỗi
function parseCurrency(str) {
    if (!str) return 0;
    return parseInt(str.toString().replace(/[^\d]/g, '')) || 0;
}

// Generate mã phiếu tự động từ API
async function generateMaPhieu() {
    try {
        const response = await fetch('/api/kho/nhap-kho/next-code');
        const result = await response.json();
        if (result.success && result.data) {
            phieuNhapData.MaPhieu = result.data.MaPNK;
        } else {
            // Fallback: tạo mã ngẫu nhiên
            const now = new Date();
            const year = now.getFullYear();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            phieuNhapData.MaPhieu = `PNK${year}${random}`;
        }
    } catch (error) {
        console.error('Lỗi lấy mã phiếu:', error);
        // Fallback: tạo mã ngẫu nhiên
        const now = new Date();
        const year = now.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        phieuNhapData.MaPhieu = `PNK${year}${random}`;
    }
}

// Populate datalists
function populateDatalists() {
    const suppliersDatalist = document.getElementById('suppliers');
    if (suppliersDatalist) {
        suppliersDatalist.innerHTML = '';
        danhSachNhaCungCap.forEach(ncc => {
            const option = document.createElement('option');
            option.value = ncc.TenNCC || ncc;
            suppliersDatalist.appendChild(option);
        });
    }
    
    // Không còn cần populate kho dropdown
}

// Cập nhật UI theo mode
function updateUIForCreateMode() {
    const titleBadge = document.querySelector('h2 span');
    if (titleBadge) {
        titleBadge.textContent = 'Mới';
        titleBadge.className = 'px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs font-normal border border-blue-200 dark:border-blue-800';
    }
}

function updateUIForEditMode() {
    const titleBadge = document.querySelector('h2 span');
    if (titleBadge) {
        titleBadge.textContent = 'Chỉnh sửa';
        titleBadge.className = 'px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-xs font-normal border border-amber-200 dark:border-amber-800';
    }
}

function updateUIForViewMode() {
    const titleBadge = document.querySelector('h2 span');
    if (titleBadge) {
        titleBadge.textContent = 'Xem chi tiết';
        titleBadge.className = 'px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 text-xs font-normal border border-green-200 dark:border-green-800';
    }

    // Disable tất cả inputs
    document.querySelectorAll('input, select, textarea').forEach(el => {
        el.disabled = true;
        el.classList.add('bg-gray-100', 'dark:bg-gray-900', 'cursor-not-allowed');
    });

    // Ẩn các nút lưu
    const luuTamBtn = document.getElementById('luuTamBtn');
    const hoanThanhBtn = document.getElementById('hoanThanhBtn');
    if (luuTamBtn) luuTamBtn.style.display = 'none';
    if (hoanThanhBtn) hoanThanhBtn.style.display = 'none';
}

// Export functions để có thể gọi từ HTML
window.xoaHang = xoaHang;
