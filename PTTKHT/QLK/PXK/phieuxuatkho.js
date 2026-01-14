// ============================================
// PHIẾU XUẤT KHO (PXK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let phieuXuatData = {
    MaPhieu: '',
    NguoiNhan: '',
    NgayXuat: new Date().toISOString().split('T')[0],
    GhiChu: '',
    ChiếtKhấu: 0,
    DanhSachHang: []
};

let mode = 'create'; // create, edit, view
let maPhieuEdit = null;

// Dữ liệu từ API
let danhSachNguoiNhan = [];
let danhSachKho = [];
let danhSachHangHoa = [];

// Dữ liệu mock cho từng phiếu xuất (mỗi mã phiếu có dữ liệu riêng) - KHÔNG còn dùng KhoXuat
const mockPhieuXuatData = {
    'PX-2023-5001': {
        MaPhieu: 'PX-2023-5001',
        NguoiNhan: 'Đại lý Minh Long',
        NgayXuat: '2023-10-25',
        GhiChu: 'Giao hàng trong giờ hành chính, khách cần hóa đơn',
        ChiếtKhấu: 0,
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 100, DonGiaBan: 180000, ThanhTien: 18000000 },
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 50, DonGiaBan: 390000, ThanhTien: 19500000 }
        ]
    },
    'PX-2023-5002': {
        MaPhieu: 'PX-2023-5002',
        NguoiNhan: 'Siêu thị Điện máy Xanh',
        NgayXuat: '2023-10-26',
        GhiChu: 'Giao hàng nhanh, ưu tiên',
        ChiếtKhấu: 500000,
        TrangThai: 'pending',
        DanhSachHang: [
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 30, DonGiaBan: 320000, ThanhTien: 9600000 },
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 25, DonGiaBan: 550000, ThanhTien: 13750000 }
        ]
    },
    'PX-2023-5003': {
        MaPhieu: 'PX-2023-5003',
        NguoiNhan: 'Khách lẻ - Anh Tuấn',
        NgayXuat: '2023-10-27',
        GhiChu: 'Khách hàng thanh toán tiền mặt',
        ChiếtKhấu: 0,
        TrangThai: 'pending',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 5, DonGiaBan: 180000, ThanhTien: 900000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 2, DonGiaBan: 350000, ThanhTien: 700000 }
        ]
    },
    'PX-2023-5004': {
        MaPhieu: 'PX-2023-5004',
        NguoiNhan: 'Công ty Xây dựng Hòa Bình',
        NgayXuat: '2023-10-28',
        GhiChu: 'Giao hàng công trường, cần xe lớn',
        ChiếtKhấu: 2000000,
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 80, DonGiaBan: 390000, ThanhTien: 31200000 },
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 40, DonGiaBan: 320000, ThanhTien: 12800000 },
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 35, DonGiaBan: 550000, ThanhTien: 19250000 }
        ]
    },
    'PX-2023-5005': {
        MaPhieu: 'PX-2023-5005',
        NguoiNhan: 'Đại lý Cấp 1 Bình Dương',
        NgayXuat: '2023-10-28',
        GhiChu: 'Đại lý VIP, chiết khấu 10%',
        ChiếtKhấu: 10, // 10%
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 200, DonGiaBan: 180000, ThanhTien: 36000000 },
            { MaHang: 'SP00205', TenHang: 'Quần Jeans Slimfit', DVT: 'Cái', SoLuong: 150, DonGiaBan: 390000, ThanhTien: 58500000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 60, DonGiaBan: 350000, ThanhTien: 21000000 }
        ]
    },
    'PX-2023-5006': {
        MaPhieu: 'PX-2023-5006',
        NguoiNhan: 'Đại lý Cấp 2 Đồng Nai',
        NgayXuat: '2023-10-29',
        GhiChu: 'Giao hàng theo lịch hẹn',
        ChiếtKhấu: 1500000,
        TrangThai: 'completed',
        DanhSachHang: [
            { MaHang: 'SP00311', TenHang: 'Áo Khoác Gió 2 Lớp', DVT: 'Cái', SoLuong: 45, DonGiaBan: 320000, ThanhTien: 14400000 },
            { MaHang: 'SP00420', TenHang: 'Giày thể thao nam', DVT: 'Đôi', SoLuong: 30, DonGiaBan: 550000, ThanhTien: 16500000 }
        ]
    },
    'PX-2023-5007': {
        MaPhieu: 'PX-2023-5007',
        NguoiNhan: 'Siêu thị Co.opmart',
        KhoXuat: 'Kho Chi Nhánh HCM',
        NgayXuat: '2023-10-30',
        GhiChu: 'Giao hàng vào sáng sớm',
        ChiếtKhấu: 5, // 5%
        TrangThai: 'pending',
        DanhSachHang: [
            { MaHang: 'SP00192', TenHang: 'Áo thun nam Polo Basic', DVT: 'Cái', SoLuong: 120, DonGiaBan: 180000, ThanhTien: 21600000 },
            { MaHang: 'SP00515', TenHang: 'Túi xách da', DVT: 'Cái', SoLuong: 40, DonGiaBan: 350000, ThanhTien: 14000000 }
        ]
    }
};

// ============================================
// 1. KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load dữ liệu từ API
    await loadDanhSachNguoiNhan();
    await loadDanhSachHangHoa();
    
    // Kiểm tra URL params để xác định mode
    const urlParams = new URLSearchParams(window.location.search);
    maPhieuEdit = urlParams.get('maPhieu');
    mode = urlParams.get('mode') || 'create';

    if (maPhieuEdit && mode === 'edit') {
        // Kiểm tra trạng thái phiếu trước khi cho phép edit
        await loadPhieuXuat(maPhieuEdit);
        // Nếu phiếu đã completed, tự động chuyển sang mode view
        if (phieuXuatData.TrangThai === 1) {
            mode = 'view';
            updateUIForViewMode();
            alert('Phiếu xuất đã hoàn thành, chỉ có thể xem chi tiết!');
        } else {
            updateUIForEditMode();
        }
    } else if (maPhieuEdit && mode === 'view') {
        await loadPhieuXuat(maPhieuEdit);
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

// Load danh sách người nhận từ các phiếu xuất đã có
async function loadDanhSachNguoiNhan() {
    try {
        const response = await fetch('/api/kho/xuat-kho');
        const result = await response.json();
        if (result.success && result.data) {
            // Lấy danh sách người nhận duy nhất từ các phiếu xuất
            const nguoiNhanSet = new Set();
            result.data.forEach(phieu => {
                const nguoiNhan = phieu.NguoiNhan || phieu.LyDoXuat;
                if (nguoiNhan && nguoiNhan.trim() !== '') {
                    nguoiNhanSet.add(nguoiNhan.trim());
                }
            });
            danhSachNguoiNhan = Array.from(nguoiNhanSet).sort();
            
            // Thêm các giá trị mặc định nếu chưa có
            const defaultReceivers = [
                'Khách lẻ (Walk-in)',
                'Đại lý Minh Châu',
                'Chi nhánh Cầu Giấy',
                'Siêu thị VinMart'
            ];
            defaultReceivers.forEach(receiver => {
                if (!danhSachNguoiNhan.includes(receiver)) {
                    danhSachNguoiNhan.push(receiver);
                }
            });
            danhSachNguoiNhan.sort();
        } else {
            // Nếu không load được từ API, dùng danh sách mặc định
            danhSachNguoiNhan = [
                'Khách lẻ (Walk-in)',
                'Đại lý Minh Châu',
                'Chi nhánh Cầu Giấy',
                'Siêu thị VinMart'
            ];
        }
    } catch (error) {
        console.error('Lỗi load danh sách người nhận:', error);
        // Dùng danh sách mặc định khi lỗi
        danhSachNguoiNhan = [
            'Khách lẻ (Walk-in)',
            'Đại lý Minh Châu',
            'Chi nhánh Cầu Giấy',
            'Siêu thị VinMart'
        ];
    }
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
                DonGiaBan: hh.DonGiaBan || 0
            }));
        }
    } catch (error) {
        console.error('Lỗi load hàng hóa:', error);
    }
}

// ============================================
// 2. LOAD DỮ LIỆU PHIẾU XUẤT
// ============================================
async function loadPhieuXuat(maPhieu) {
    try {
        const response = await fetch(`/api/kho/xuat-kho/${maPhieu}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            phieuXuatData = {
                MaPhieu: data.MaPXK,
                NguoiNhan: data.NguoiNhan || data.LyDoXuat || '',
                NgayXuat: data.NgayXuat ? data.NgayXuat.split('T')[0] : new Date().toISOString().split('T')[0],
                GhiChu: data.GhiChu || '',
                ChiếtKhấu: data.ChietKhau || 0,
                TrangThai: data.TrangThai,
                DanhSachHang: (data.DanhSachHang || []).map(h => ({
                    MaHang: h.MaHang,
                    TenHang: h.TenHang,
                    DVT: h.DonViTinh,
                    SoLuong: Number(h.SoLuong) || 0,
                    DonGiaBan: Number(h.DonGiaXuat) || 0,
                    ThanhTien: Number(h.ThanhTien) || 0
                }))
            };
        } else {
            // Dữ liệu mặc định cho phiếu mới hoặc không tìm thấy
            phieuXuatData = {
                MaPhieu: maPhieu,
                NguoiNhan: '',
                NgayXuat: new Date().toISOString().split('T')[0],
                GhiChu: '',
                ChiếtKhấu: 0,
                TrangThai: 0,
                DanhSachHang: []
            };
        }

        renderForm();
        renderDanhSachHang();
        updateTongTien();
        return phieuXuatData;
    } catch (error) {
        console.error('Lỗi load phiếu xuất:', error);
        alert('Không thể tải dữ liệu phiếu xuất!');
        // Dữ liệu mặc định khi lỗi
        phieuXuatData = {
            MaPhieu: maPhieu,
            NguoiNhan: '',
            NgayXuat: new Date().toISOString().split('T')[0],
            GhiChu: '',
            ChiếtKhấu: 0,
            TrangThai: 0,
            DanhSachHang: []
        };
        renderForm();
        renderDanhSachHang();
        updateTongTien();
        return null;
    }
}

// ============================================
// 3. SETUP EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Người nhận
    const nguoiNhanInput = document.getElementById('nguoiNhan');
    if (nguoiNhanInput) {
        nguoiNhanInput.addEventListener('change', (e) => {
            phieuXuatData.NguoiNhan = e.target.value;
        });
    }

    // Ngày xuất
    const ngayXuatInput = document.getElementById('ngayXuat');
    if (ngayXuatInput) {
        ngayXuatInput.addEventListener('change', (e) => {
            phieuXuatData.NgayXuat = e.target.value;
        });
    }

    // Ghi chú
    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.addEventListener('input', (e) => {
            phieuXuatData.GhiChu = e.target.value;
        });
    }

    // Chiết khấu
    const chietKhauInput = document.getElementById('chietKhau');
    if (chietKhauInput) {
        chietKhauInput.addEventListener('input', (e) => {
            phieuXuatData.ChiếtKhấu = parseFloat(e.target.value) || 0;
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

    // Nút thêm người nhận
    const addNguoiNhanBtn = document.getElementById('addNguoiNhanBtn');
    if (addNguoiNhanBtn) {
        addNguoiNhanBtn.addEventListener('click', () => {
            alert('Tính năng thêm người nhận đang được phát triển');
        });
    }

    // Lưu tạm
    const luuTamBtn = document.getElementById('luuTamBtn');
    if (luuTamBtn) {
        luuTamBtn.addEventListener('click', () => {
            savePhieuXuat('draft');
        });
    }

    // Hoàn thành
    const hoanThanhBtn = document.getElementById('hoanThanhBtn');
    if (hoanThanhBtn) {
        hoanThanhBtn.addEventListener('click', () => {
            savePhieuXuat('completed');
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
        maPhieuInput.value = phieuXuatData.MaPhieu;
    }

    const nguoiNhanInput = document.getElementById('nguoiNhan');
    if (nguoiNhanInput) {
        nguoiNhanInput.value = phieuXuatData.NguoiNhan;
    }

    const ngayXuatInput = document.getElementById('ngayXuat');
    if (ngayXuatInput) {
        ngayXuatInput.value = phieuXuatData.NgayXuat;
    }

    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.value = phieuXuatData.GhiChu;
    }

    const chietKhauInput = document.getElementById('chietKhau');
    if (chietKhauInput) {
        chietKhauInput.value = phieuXuatData.ChiếtKhấu;
    }
}

// ============================================
// 5. RENDER DANH SÁCH HÀNG
// ============================================
function renderDanhSachHang() {
    const tbody = document.getElementById('danhSachHangBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (phieuXuatData.DanhSachHang.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Chưa có hàng hóa nào. Nhập tên hoặc mã hàng để thêm.
                </td>
            </tr>
        `;
        return;
    }

    phieuXuatData.DanhSachHang.forEach((hang, index) => {
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

    return `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50" data-index="${index}">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${index + 1}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${hang.MaHang}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-white">${hang.TenHang}</div>
                ${hang.ThongTin ? `<div class="text-xs text-gray-500 dark:text-gray-400">${hang.ThongTin}</div>` : ''}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-center">${hang.DVT}</td>
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
                    value="${formatCurrency(hang.DonGiaBan)}" 
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
}

// ============================================
// 6. QUẢN LÝ HÀNG HÓA
// ============================================

// Tìm kiếm và thêm hàng hóa
function handleSearchHangHoa(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return;

    const searchLower = searchTerm.toLowerCase().trim();
    
    // Tìm hàng hóa theo mã hoặc tên
    const hangHoa = danhSachHangHoa.find(h => 
        h.MaHang.toLowerCase().includes(searchLower) || 
        h.TenHang.toLowerCase().includes(searchLower)
    );

    if (hangHoa) {
        // Kiểm tra xem hàng đã tồn tại chưa
        const existingIndex = phieuXuatData.DanhSachHang.findIndex(h => h.MaHang === hangHoa.MaHang);
        
        if (existingIndex !== -1) {
            // Tăng số lượng nếu đã tồn tại
            const hang = phieuXuatData.DanhSachHang[existingIndex];
            hang.SoLuong = Number(hang.SoLuong) + 1;
            const donGia = Number(hang.DonGiaBan) || 0;
            hang.ThanhTien = hang.SoLuong * donGia;
        } else {
            // Thêm mới
            const donGiaBan = Number(hangHoa.DonGiaBan) || 0;
            phieuXuatData.DanhSachHang.push({
                MaHang: hangHoa.MaHang,
                TenHang: hangHoa.TenHang,
                DVT: hangHoa.DVT,
                SoLuong: 1,
                DonGiaBan: donGiaBan,
                ThanhTien: donGiaBan
            });
        }

        renderDanhSachHang();
        updateTongTien();
    } else {
        alert(`Không tìm thấy hàng hóa "${searchTerm}"`);
    }
}

// Xóa hàng
function xoaHang(index) {
    if (confirm('Bạn có chắc chắn muốn xóa hàng hóa này?')) {
        phieuXuatData.DanhSachHang.splice(index, 1);
        renderDanhSachHang();
        updateTongTien();
    }
}

// Cập nhật số lượng
function updateHangSoLuong(index, soLuong) {
    soLuong = Number(soLuong) || 1;
    if (soLuong < 1) soLuong = 1;
    
    phieuXuatData.DanhSachHang[index].SoLuong = soLuong;
    const donGia = Number(phieuXuatData.DanhSachHang[index].DonGiaBan) || 0;
    phieuXuatData.DanhSachHang[index].ThanhTien = soLuong * donGia;
    
    updateTongTien();
    
    // Cập nhật lại thành tiền trong bảng
    const row = document.querySelector(`tr[data-index="${index}"]`);
    if (row) {
        const thanhTienCell = row.querySelector('td:nth-child(7)');
        if (thanhTienCell) {
            thanhTienCell.textContent = formatCurrency(phieuXuatData.DanhSachHang[index].ThanhTien);
        }
    }
}

// Cập nhật đơn giá
function updateHangDonGia(index, donGia) {
    donGia = Number(donGia) || 0;
    if (donGia < 0) donGia = 0;
    
    phieuXuatData.DanhSachHang[index].DonGiaBan = donGia;
    const soLuong = Number(phieuXuatData.DanhSachHang[index].SoLuong) || 0;
    phieuXuatData.DanhSachHang[index].ThanhTien = soLuong * donGia;
    
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
            thanhTienCell.textContent = formatCurrency(phieuXuatData.DanhSachHang[index].ThanhTien);
        }
    }
}

// ============================================
// 7. TÍNH TOÁN
// ============================================
function updateTongTien() {
    // Tổng số lượng
    const tongSoLuong = phieuXuatData.DanhSachHang.reduce((sum, h) => sum + (Number(h.SoLuong) || 0), 0);
    const tongSoLuongEl = document.getElementById('tongSoLuong');
    if (tongSoLuongEl) {
        tongSoLuongEl.textContent = tongSoLuong.toLocaleString('vi-VN');
    }

    // Tổng tiền hàng - Đảm bảo chuyển đổi sang số để tránh nối chuỗi
    const tongTienHang = phieuXuatData.DanhSachHang.reduce((sum, h) => {
        const thanhTien = typeof h.ThanhTien === 'string' ? parseCurrency(h.ThanhTien) : (Number(h.ThanhTien) || 0);
        return sum + thanhTien;
    }, 0);
    const tongTienHangEl = document.getElementById('tongTienHang');
    if (tongTienHangEl) {
        tongTienHangEl.textContent = formatCurrency(tongTienHang);
    }

    // Chiết khấu
    let chietKhauAmount = 0;
    if (phieuXuatData.ChiếtKhấu) {
        if (phieuXuatData.ChiếtKhấu.toString().includes('%')) {
            const percent = parseFloat(phieuXuatData.ChiếtKhấu.toString().replace('%', ''));
            chietKhauAmount = (tongTienHang * percent) / 100;
        } else {
            chietKhauAmount = phieuXuatData.ChiếtKhấu;
        }
    }

    // Tiền cần thanh toán
    const tienCanThanhToan = Math.max(0, tongTienHang - chietKhauAmount);
    const tienCanThanhToanEl = document.getElementById('tienCanThanhToan');
    if (tienCanThanhToanEl) {
        tienCanThanhToanEl.textContent = formatCurrency(tienCanThanhToan) + ' ₫';
    }
}

// ============================================
// 8. VALIDATE VÀ LƯU
// ============================================
function validateForm() {
    if (!phieuXuatData.NguoiNhan || phieuXuatData.NguoiNhan.trim() === '') {
        alert('Vui lòng chọn người nhận!');
        document.getElementById('nguoiNhan')?.focus();
        return false;
    }

    // Không còn cần kiểm tra kho xuất

    if (!phieuXuatData.NgayXuat) {
        alert('Vui lòng chọn ngày xuất!');
        document.getElementById('ngayXuat')?.focus();
        return false;
    }

    if (phieuXuatData.DanhSachHang.length === 0) {
        alert('Vui lòng thêm ít nhất một hàng hóa!');
        document.getElementById('searchHangHoa')?.focus();
        return false;
    }

    return true;
}

async function savePhieuXuat(trangThai) {
    if (!validateForm()) return;

    const isCompleted = trangThai === 'completed';
    if (isCompleted && !confirm('Xác nhận hoàn thành phiếu xuất? Phiếu sẽ không thể chỉnh sửa sau khi hoàn thành.')) {
        return;
    }

    try {
        // Lấy MaNV từ session hoặc localStorage
        const userInfo = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
        const MaNV = userInfo.MaNV || 1;
        
        // Tính chiết khấu (chuyển đổi từ string sang number nếu cần)
        const ChietKhau = typeof phieuXuatData.ChiếtKhấu === 'string' 
            ? parseCurrency(phieuXuatData.ChiếtKhấu.toString()) 
            : (Number(phieuXuatData.ChiếtKhấu) || 0);
        
        const dataToSave = {
            MaPXK: phieuXuatData.MaPhieu,
            NgayXuat: phieuXuatData.NgayXuat,
            MaNV: MaNV,
            NguoiNhan: phieuXuatData.NguoiNhan || null,
            LyDoXuat: phieuXuatData.NguoiNhan || null, // Tương thích với code cũ
            ChietKhau: ChietKhau,
            GhiChu: phieuXuatData.GhiChu || null,
            TrangThai: isCompleted ? 1 : 0,
            DanhSachHang: phieuXuatData.DanhSachHang.map(h => ({
                MaHang: h.MaHang,
                SoLuong: h.SoLuong,
                DonGiaXuat: h.DonGiaBan,
                ThanhTien: h.ThanhTien
            }))
        };

        const url = mode === 'edit' 
            ? `/api/kho/xuat-kho/${phieuXuatData.MaPhieu}` 
            : '/api/kho/xuat-kho';
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
                window.location.href = '/PTTKHT/QLK/XK/code.html';
            }
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi lưu phiếu xuất:', error);
        alert('Không thể lưu phiếu xuất: ' + error.message);
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
        const response = await fetch('/api/kho/xuat-kho/next-code');
        const result = await response.json();
        if (result.success && result.data) {
            phieuXuatData.MaPhieu = result.data.MaPXK;
        } else {
            // Fallback: tạo mã ngẫu nhiên
            const now = new Date();
            const year = now.getFullYear();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            phieuXuatData.MaPhieu = `PXK${year}${random}`;
        }
    } catch (error) {
        console.error('Lỗi lấy mã phiếu:', error);
        // Fallback: tạo mã ngẫu nhiên
        const now = new Date();
        const year = now.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        phieuXuatData.MaPhieu = `PXK${year}${random}`;
    }
}

// Populate datalists
function populateDatalists() {
    const receiversDatalist = document.getElementById('receivers');
    if (receiversDatalist) {
        receiversDatalist.innerHTML = '';
        danhSachNguoiNhan.forEach(nguoiNhan => {
            const option = document.createElement('option');
            option.value = nguoiNhan;
            receiversDatalist.appendChild(option);
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
