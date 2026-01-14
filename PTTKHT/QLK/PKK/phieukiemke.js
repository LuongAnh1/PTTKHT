// ============================================
// PHIẾU KIỂM KÊ (PKK) - JavaScript Logic
// ============================================

// Lưu trữ dữ liệu
let phieuKiemKeData = {
    MaPhieu: '',
    NgayKiemKe: new Date().toISOString().split('T')[0],
    MaNV: null,
    GhiChu: '',
    TrangThai: 0, // 0: Đang kiểm, 1: Đã hoàn thành, 2: Đã hủy
    DanhSachHang: []
};

let mode = 'create'; // create, edit, view
let maPhieuEdit = null;

// Dữ liệu từ API
let danhSachNhanVien = [];
let danhSachHangHoa = [];

// Filter trạng thái dòng trong phiếu
let hangFilterMode = 'all'; // all | checked | unchecked | diff

// ============================================
// 1. KHỞI TẠO
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    // Load dữ liệu từ API
    await loadDanhSachNhanVien();
    await loadDanhSachHangHoa();
    populateInspectorsDatalist();
    
    // Kiểm tra URL params để xác định mode
    const urlParams = new URLSearchParams(window.location.search);
    maPhieuEdit = urlParams.get('maPKK');
    mode = urlParams.get('mode') || 'create';

    // Nếu tạo mới và có danh sách mã hàng từ màn hình tồn kho
    const maHangParam = urlParams.get('maHang');
    if (!maPhieuEdit && mode === 'create' && maHangParam) {
        const selectedCodes = maHangParam
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        // Lấy map lý do từ màn hình Kiểm kê kho (lưu trong localStorage)
        let lyDoMap = {};
        try {
            lyDoMap = JSON.parse(localStorage.getItem('KK_LYDO_CHENHLECH') || '{}') || {};
        } catch (e) {
            console.warn('Không thể đọc lý do chênh lệch từ localStorage:', e);
        }

        if (selectedCodes.length && Array.isArray(danhSachHangHoa) && danhSachHangHoa.length) {
            selectedCodes.forEach(code => {
                const hangHoa = danhSachHangHoa.find(h => h.MaHang === code);
                if (!hangHoa) return;

                const existed = phieuKiemKeData.DanhSachHang.some(h => h.MaHang === hangHoa.MaHang);
                if (existed) return;

                phieuKiemKeData.DanhSachHang.push({
                    MaHang: hangHoa.MaHang,
                    TenHang: hangHoa.TenHang || '',
                    Size: hangHoa.Size || '',
                    MauSac: hangHoa.MauSac || '',
                    DonViTinh: hangHoa.DonViTinh || 'Cái',
                    SoLuongTonKho: Number(hangHoa.SoLuongPhanMem) || 0,
                    SoLuongThucTe: Number(hangHoa.SoLuongPhanMem) || 0,
                    ChenhLech: 0,
                    LyDoChenhLech: lyDoMap[hangHoa.MaHang] || '',
                    _touched: false
                });
            });
        }
    }

    if (maPhieuEdit && mode === 'edit') {
        await loadPhieuKiemKe(maPhieuEdit);
        if (phieuKiemKeData.TrangThai === 1) {
            mode = 'view';
            updateUIForViewMode();
            alert('Phiếu kiểm kê đã hoàn thành, chỉ có thể xem chi tiết!');
        } else {
            updateUIForEditMode();
        }
    } else if (maPhieuEdit && mode === 'view') {
        await loadPhieuKiemKe(maPhieuEdit);
        updateUIForViewMode();
    } else {
        await generateMaPhieu();
        renderForm();
        updateUIForCreateMode();
    }

    setupEventListeners();
    renderDanhSachHang();
    updateTongSoLuong();
    setupHangFilters();
});

// ============================================
// 2. LOAD DỮ LIỆU TỪ API
// ============================================
async function loadDanhSachNhanVien() {
    try {
        const response = await fetch('/api/trang-chu/nhan-vien');
        const result = await response.json();
        if (result.success) {
            danhSachNhanVien = result.data || [];
        }
    } catch (error) {
        console.error('Lỗi load danh sách nhân viên:', error);
    }
}

function populateInspectorsDatalist() {
    const datalist = document.getElementById('inspectors');
    if (!datalist) return;

    datalist.innerHTML = '';

    if (!Array.isArray(danhSachNhanVien) || danhSachNhanVien.length === 0) {
        return;
    }

    danhSachNhanVien.forEach((nv) => {
        const hoTen = nv.HoTen || '';
        const tenDangNhap = nv.TenDangNhap || '';

        // Nhãn hiển thị: "Họ tên (username)" để dễ tìm
        const display = hoTen && tenDangNhap ? `${hoTen} (${tenDangNhap})` : hoTen || tenDangNhap;

        const option = document.createElement('option');
        option.value = display;
        datalist.appendChild(option);
    });
}

async function loadDanhSachHangHoa() {
    try {
        // Load từ API tồn kho để có SoLuongTon
        const response = await fetch('/api/kho/kiem-ke/ton-kho');
        const result = await response.json();
        if (result.success) {
            danhSachHangHoa = result.data || [];
        }
    } catch (error) {
        console.error('Lỗi load danh sách hàng hóa:', error);
    }
}

async function loadPhieuKiemKe(maPKK) {
    try {
        const response = await fetch(`/api/kho/kiem-ke/${maPKK}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            const data = result.data;
            phieuKiemKeData = {
                MaPhieu: data.MaPKK,
                NgayKiemKe: data.NgayKiemKe ? data.NgayKiemKe.split('T')[0] : new Date().toISOString().split('T')[0],
                MaNV: data.MaNV,
                GhiChu: data.GhiChu || '',
                TrangThai: data.TrangThai || 0,
                DanhSachHang: (data.DanhSachHang || []).map(h => ({
                    MaHang: h.MaHang,
                    TenHang: h.TenHang || '',
                    Size: h.Size || '',
                    MauSac: h.MauSac || '',
                    DonViTinh: h.DonViTinh || 'Cái',
                    SoLuongTonKho: Number(h.SoLuongTonKho) || 0,
                    SoLuongThucTe: Number(h.SoLuongThucTe) || 0,
                    ChenhLech: Number(h.ChenhLech) || 0,
                    LyDoChenhLech: h.LyDoChenhLech || ''
                }))
            };
            renderForm();
            renderDanhSachHang();
            updateTongSoLuong();
        }
    } catch (error) {
        console.error('Lỗi load phiếu kiểm kê:', error);
        alert('Không thể tải phiếu kiểm kê!');
    }
}

// ============================================
// 3. GENERATE MÃ PHIẾU
// ============================================
async function generateMaPhieu() {
    try {
        const response = await fetch('/api/kho/kiem-ke/next-code');
        const result = await response.json();
        if (result.success && result.data) {
            phieuKiemKeData.MaPhieu = result.data.MaPKK;
        } else {
            // Fallback: tạo mã ngẫu nhiên
            const now = new Date();
            const year = now.getFullYear();
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            phieuKiemKeData.MaPhieu = `PKK${year}${random}`;
        }
    } catch (error) {
        console.error('Lỗi lấy mã phiếu:', error);
        // Fallback: tạo mã ngẫu nhiên
        const now = new Date();
        const year = now.getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        phieuKiemKeData.MaPhieu = `PKK${year}${random}`;
    }
}

// ============================================
// 4. RENDER FORM
// ============================================
function renderForm() {
    const maPhieuInput = document.getElementById('maPhieu');
    if (maPhieuInput) {
        maPhieuInput.value = phieuKiemKeData.MaPhieu;
    }
    
    const ngayKiemKeInput = document.getElementById('ngayKiemKe');
    if (ngayKiemKeInput) {
        ngayKiemKeInput.value = phieuKiemKeData.NgayKiemKe;
    }
    
    const nguoiKiemKeInput = document.getElementById('nguoiKiemKe');
    if (nguoiKiemKeInput) {
        // Tìm nhân viên theo MaNV
        const nhanVien = danhSachNhanVien.find(nv => nv.MaNV === phieuKiemKeData.MaNV);
        if (nhanVien) {
            nguoiKiemKeInput.value = `${nhanVien.HoTen} (${nhanVien.TenDangNhap})`;
        }
    }
    
    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.value = phieuKiemKeData.GhiChu;
    }
    
    // Cập nhật trạng thái badge
    updateTrangThaiBadge();
}

function updateTrangThaiBadge() {
    const badge = document.querySelector('.bg-blue-100');
    if (badge) {
        const statusText = phieuKiemKeData.TrangThai === 1 ? 'Hoàn thành' : 
                          phieuKiemKeData.TrangThai === 2 ? 'Đã hủy' : 'Đang xử lý';
        const statusClass = phieuKiemKeData.TrangThai === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                           phieuKiemKeData.TrangThai === 2 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                           'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
        badge.textContent = statusText;
        badge.className = `px-2 py-0.5 rounded-full text-xs font-normal border ${statusClass}`;
    }
}

// ============================================
// 5. TÌM KIẾM VÀ THÊM HÀNG HÓA
// ============================================
function setupEventListeners() {
    const searchInput = document.querySelector('input[placeholder*="Quét mã vạch"]');
    if (searchInput) {
        searchInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter' || e.key === 'F3') {
                e.preventDefault();
                await handleSearchHangHoa(e.target.value);
                e.target.value = '';
            }
        });
    }
    
    const nguoiKiemKeInput = document.getElementById('nguoiKiemKe');
    if (nguoiKiemKeInput) {
        nguoiKiemKeInput.addEventListener('change', (e) => {
            const value = e.target.value;
            // Tìm MaNV từ tên nhân viên
            const nhanVien = danhSachNhanVien.find(nv => 
                value.includes(nv.HoTen) || value.includes(nv.TenDangNhap)
            );
            if (nhanVien) {
                phieuKiemKeData.MaNV = nhanVien.MaNV;
            }
        });
    }
    
    const ngayKiemKeInput = document.getElementById('ngayKiemKe');
    if (ngayKiemKeInput) {
        ngayKiemKeInput.addEventListener('change', (e) => {
            phieuKiemKeData.NgayKiemKe = e.target.value;
        });
    }
    
    const ghiChuTextarea = document.getElementById('ghiChu');
    if (ghiChuTextarea) {
        ghiChuTextarea.addEventListener('input', (e) => {
            phieuKiemKeData.GhiChu = e.target.value;
        });
    }
}

function setupHangFilters() {
    const btnAll = document.getElementById('filterAll');
    const btnChecked = document.getElementById('filterChecked');
    const btnUnchecked = document.getElementById('filterUnchecked');
    const btnDiff = document.getElementById('filterDiff');
    const buttons = [btnAll, btnChecked, btnUnchecked, btnDiff].filter(Boolean);

    const setActive = (activeBtn) => {
        buttons.forEach((b) => {
            if (b === activeBtn) {
                b.className = 'px-4 py-2 text-sm font-medium bg-primary text-white';
            } else {
                b.className =
                    'px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50';
            }
        });
    };

    if (btnAll) {
        btnAll.addEventListener('click', () => {
            hangFilterMode = 'all';
            setActive(btnAll);
            renderDanhSachHang();
        });
    }
    if (btnChecked) {
        btnChecked.addEventListener('click', () => {
            hangFilterMode = 'checked';
            setActive(btnChecked);
            renderDanhSachHang();
        });
    }
    if (btnUnchecked) {
        btnUnchecked.addEventListener('click', () => {
            hangFilterMode = 'unchecked';
            setActive(btnUnchecked);
            renderDanhSachHang();
        });
    }
    if (btnDiff) {
        btnDiff.addEventListener('click', () => {
            hangFilterMode = 'diff';
            setActive(btnDiff);
            renderDanhSachHang();
        });
    }
}

async function handleSearchHangHoa(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') return;
    
    const term = searchTerm.toLowerCase().trim();
    const hangHoa = danhSachHangHoa.find(h => 
        h.MaHang.toLowerCase().includes(term) || 
        h.TenHang.toLowerCase().includes(term)
    );
    
    if (!hangHoa) {
        alert('Không tìm thấy hàng hóa!');
        return;
    }
    
    // Kiểm tra xem hàng đã có trong danh sách chưa
    const existingIndex = phieuKiemKeData.DanhSachHang.findIndex(h => h.MaHang === hangHoa.MaHang);
    
    if (existingIndex !== -1) {
        alert('Hàng hóa đã có trong danh sách kiểm kê!');
        return;
    }
    
    // Thêm hàng mới vào danh sách
    phieuKiemKeData.DanhSachHang.push({
        MaHang: hangHoa.MaHang,
        TenHang: hangHoa.TenHang,
        Size: hangHoa.Size || '',
        MauSac: hangHoa.MauSac || '',
        DonViTinh: hangHoa.DonViTinh || 'Cái',
        SoLuongTonKho: Number(hangHoa.SoLuongPhanMem) || 0,
        SoLuongThucTe: Number(hangHoa.SoLuongPhanMem) || 0, // Mặc định bằng số lượng tồn kho
        ChenhLech: 0,
        LyDoChenhLech: '',
        _touched: false
    });
    
    renderDanhSachHang();
    updateTongSoLuong();

    // Auto-focus vào ô nhập SL của dòng vừa thêm
    const newIndex = phieuKiemKeData.DanhSachHang.length - 1;
    setTimeout(() => {
        const input = document.querySelector(`.sl-thuc-te[data-index="${newIndex}"]`);
        if (input && typeof input.focus === 'function') {
            input.focus();
            if (typeof input.select === 'function') input.select();
        }
    }, 0);
}

// ============================================
// 6. RENDER DANH SÁCH HÀNG
// ============================================
function renderDanhSachHang() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const list = phieuKiemKeData.DanhSachHang.filter((hang) => {
        if (hangFilterMode === 'diff') return Number(hang.ChenhLech) !== 0;
        if (hangFilterMode === 'checked') return !!hang._touched;
        if (hangFilterMode === 'unchecked') return !hang._touched;
        return true;
    });

    if (list.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    ${phieuKiemKeData.DanhSachHang.length === 0
                        ? 'Chưa có hàng hóa nào. Hãy tìm kiếm và thêm hàng hóa vào danh sách kiểm kê.'
                        : 'Không có hàng phù hợp bộ lọc hiện tại.'}
                </td>
            </tr>
        `;
        return;
    }
    
    list.forEach((hang) => {
        const index = phieuKiemKeData.DanhSachHang.findIndex(h => h.MaHang === hang.MaHang);
        const chenhLech = hang.SoLuongThucTe - hang.SoLuongTonKho;
        const chenhLechText = chenhLech > 0 ? `+${chenhLech}` : chenhLech.toString();
        const chenhLechClass = chenhLech < 0 ? 'text-red-600 dark:text-red-400' :
                               chenhLech > 0 ? 'text-green-600 dark:text-green-400' :
                               'text-gray-400';

        // Cảnh báo lệch lớn > 50%
        const ton = Number(hang.SoLuongTonKho) || 0;
        const ratio = ton > 0 ? Math.abs(chenhLech) / ton : (chenhLech !== 0 ? 1 : 0);
        const largeDiff = ratio > 0.5;
        const rowWarnClass = largeDiff ? 'bg-red-50/70 dark:bg-red-900/10' : '';
        
        const row = `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 ${rowWarnClass}" ${largeDiff ? `title="Cảnh báo: Chênh lệch lớn (${Math.round(ratio * 100)}%)"` : ''}>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">${hang.MaHang}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">${hang.TenHang}</div>
                    ${hang.Size || hang.MauSac ? `<div class="text-xs text-gray-500 dark:text-gray-400">Size: ${hang.Size || 'N/A'} | Màu: ${hang.MauSac || 'N/A'}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        ${hang.SoLuongTonKho}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input 
                        type="number" 
                        class="w-24 text-center rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm font-semibold sl-thuc-te"
                        value="${hang.SoLuongThucTe}" 
                        min="0"
                        data-index="${index}"
                        ${mode === 'view' ? 'readonly' : ''}
                    />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    <span class="text-sm font-bold ${chenhLechClass} chenh-lech-${index}">${chenhLechText}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${
                        mode === 'view'
                            ? `<div class="text-sm text-gray-600 dark:text-gray-300">${hang.LyDoChenhLech || '-'}</div>`
                            : `
                            <input
                                type="text"
                                class="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white py-1 px-2 focus:ring-primary focus:border-primary text-sm shadow-sm ly-do"
                                placeholder="${Number(hang.ChenhLech) !== 0 ? 'VD: mất, hỏng, nhập sai...' : 'Ghi chú / lý do (tuỳ chọn)'}"
                                value="${hang.LyDoChenhLech || ''}"
                                data-index="${index}"
                            />
                        `
                    }
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                    ${mode === 'view' ? '' : `
                        <button onclick="xoaHang(${index})" class="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                            <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                    `}
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    // Attach event listeners cho các input số lượng thực tế
    document.querySelectorAll('.sl-thuc-te').forEach(input => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            updateSoLuongThucTe(index, parseInt(e.target.value) || 0);
        });
    });

    // Listener cho lý do chênh lệch
    document.querySelectorAll('.ly-do').forEach((input) => {
        input.addEventListener('input', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (!Number.isNaN(index) && phieuKiemKeData.DanhSachHang[index]) {
                phieuKiemKeData.DanhSachHang[index].LyDoChenhLech = e.target.value;
            }
        });
    });
}

function updateSoLuongThucTe(index, soLuong) {
    if (soLuong < 0) soLuong = 0;
    
    phieuKiemKeData.DanhSachHang[index].SoLuongThucTe = soLuong;
    const hang = phieuKiemKeData.DanhSachHang[index];
    hang.ChenhLech = soLuong - hang.SoLuongTonKho;
    hang._touched = true;
    
    // Cập nhật hiển thị chênh lệch
    const chenhLechEl = document.querySelector(`.chenh-lech-${index}`);
    if (chenhLechEl) {
        const chenhLech = hang.ChenhLech;
        const chenhLechText = chenhLech > 0 ? `+${chenhLech}` : chenhLech.toString();
        chenhLechEl.textContent = chenhLechText;
        chenhLechEl.className = `text-sm font-bold chenh-lech-${index} ${
            chenhLech < 0 ? 'text-red-600 dark:text-red-400' :
            chenhLech > 0 ? 'text-green-600 dark:text-green-400' :
            'text-gray-400'
        }`;
    }
    
    updateTongSoLuong();
}

function xoaHang(index) {
    if (confirm('Xác nhận xóa hàng hóa này khỏi danh sách kiểm kê?')) {
        phieuKiemKeData.DanhSachHang.splice(index, 1);
        renderDanhSachHang();
        updateTongSoLuong();
    }
}

// ============================================
// 7. CẬP NHẬT TỔNG SỐ LƯỢNG
// ============================================
function updateTongSoLuong() {
    const tongThucTe = phieuKiemKeData.DanhSachHang.reduce((sum, h) => sum + (Number(h.SoLuongThucTe) || 0), 0);
    const tongChenhLech = phieuKiemKeData.DanhSachHang.reduce((sum, h) => sum + (Number(h.ChenhLech) || 0), 0);
    
    const tongThucTeEl = document.getElementById('tongSoLuongThucTe');
    if (tongThucTeEl) {
        tongThucTeEl.textContent = tongThucTe;
    }
    
    const tongChenhLechEl = document.getElementById('tongChenhLech');
    if (tongChenhLechEl) {
        tongChenhLechEl.textContent = tongChenhLech;
        tongChenhLechEl.className = `text-lg font-bold ${
            tongChenhLech < 0 ? 'text-red-600 dark:text-red-400' :
            tongChenhLech > 0 ? 'text-green-600 dark:text-green-400' :
            'text-gray-800 dark:text-gray-200'
        }`;
    }
}

function openConfirmUpdateKhoModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirmUpdateKhoModal');
        const btnOk = document.getElementById('confirmUpdateKhoOk');
        const btnCancel = document.getElementById('confirmUpdateKhoCancel');
        if (!modal || !btnOk || !btnCancel) return resolve(true); // fallback

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const cleanup = () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
        };
        const onOk = () => {
            cleanup();
            resolve(true);
        };
        const onCancel = () => {
            cleanup();
            resolve(false);
        };
        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
    });
}

// ============================================
// 8. LƯU PHIẾU KIỂM KÊ
// ============================================
async function savePhieuKiemKe(trangThai = 0) {
    // Validation
    if (!phieuKiemKeData.MaNV) {
        alert('Vui lòng chọn người kiểm kê!');
        return;
    }
    
    if (phieuKiemKeData.DanhSachHang.length === 0) {
        alert('Vui lòng thêm ít nhất một hàng hóa vào danh sách kiểm kê!');
        return;
    }

    // Nếu hoàn thành: yêu cầu nhập lý do cho các dòng có chênh lệch
    if (trangThai === 1) {
        const missingReason = phieuKiemKeData.DanhSachHang.find(
            (h) => Number(h.ChenhLech) !== 0 && (!h.LyDoChenhLech || h.LyDoChenhLech.trim() === '')
        );
        if (missingReason) {
            alert(`Vui lòng nhập lý do chênh lệch cho mã hàng ${missingReason.MaHang}!`);
            return;
        }
    }
    
    try {
        const dataToSave = {
            MaPKK: phieuKiemKeData.MaPhieu,
            NgayKiemKe: phieuKiemKeData.NgayKiemKe,
            MaNV: phieuKiemKeData.MaNV,
            TrangThai: trangThai,
            GhiChu: phieuKiemKeData.GhiChu || '',
            DanhSachHang: phieuKiemKeData.DanhSachHang.map(h => ({
                MaHang: h.MaHang,
                SoLuongTonKho: Number(h.SoLuongTonKho) || 0,
                SoLuongThucTe: Number(h.SoLuongThucTe) || 0,
                ChenhLech: Number(h.ChenhLech) || 0,
                LyDoChenhLech: h.LyDoChenhLech || ''
            }))
        };
        
        const url = maPhieuEdit 
            ? `/api/kho/kiem-ke/${phieuKiemKeData.MaPhieu}`
            : '/api/kho/kiem-ke';
        
        const method = maPhieuEdit ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(trangThai === 1 ? 'Đã hoàn thành phiếu kiểm kê!' : 'Đã lưu phiếu kiểm kê!');
            if (trangThai === 1) {
                // Nếu hoàn thành, cập nhật tồn kho
                const ok = await openConfirmUpdateKhoModal();
                if (!ok) return;
                await capNhatTonKho();
            }
            window.location.href = '/PTTKHT/QLK/KK/code.html';
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Lỗi lưu phiếu kiểm kê:', error);
        alert('Không thể lưu phiếu kiểm kê: ' + error.message);
    }
}

async function capNhatTonKho() {
    try {
        const response = await fetch('/api/kho/kiem-ke/cap-nhat-ton-kho', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                DanhSachHang: phieuKiemKeData.DanhSachHang.map(h => ({
                    MaHang: h.MaHang,
                    SoLuongThucTe: Number(h.SoLuongThucTe) || 0
                }))
            })
        });
        
        const result = await response.json();
        if (!result.success) {
            console.error('Lỗi cập nhật tồn kho:', result.message);
        }
    } catch (error) {
        console.error('Lỗi cập nhật tồn kho:', error);
    }
}

// ============================================
// 9. UI MODE
// ============================================
function updateUIForCreateMode() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.id !== 'maPhieu') {
            input.disabled = false;
        }
    });
}

function updateUIForEditMode() {
    updateUIForCreateMode();
}

function updateUIForViewMode() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.disabled = true;
    });
    
    // Ẩn các nút lưu
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => {
        if (btn.textContent.includes('Lưu') || btn.textContent.includes('Hoàn thành')) {
            btn.style.display = 'none';
        }
    });
}

// ============================================
// 10. EXPORT FUNCTIONS
// ============================================
window.xoaHang = xoaHang;
window.savePhieuKiemKe = savePhieuKiemKe;
