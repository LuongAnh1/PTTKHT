/**
 * FILE: permissions.js
 * Nhiệm vụ: Chứa logic phân quyền cho Frontend
 */

// 1. Định nghĩa các Quyền hạn (Actions)
const ACTIONS = {
    VIEW: 'view',   // Chỉ xem
    EDIT: 'edit',   // Thêm/Sửa/Xóa (Toàn quyền)
    NONE: 'none'    // Không truy cập
};

// 2. Định nghĩa các Chức năng (Resources) - Khớp với menu của bạn
const RESOURCES = {
    // Nhóm Quản trị hệ thống
    SYS_LOGIN: 'sys_login',
    SYS_USER: 'sys_user',      // Quản lý người dùng
    SYS_ROLE: 'sys_role',      // Phân quyền chi tiết
    
    // Nhóm Quản lý danh mục
    CAT_GROUP: 'cat_group',    // Quản lý nhóm/BST
    CAT_PRODUCT: 'cat_product',// Sản phẩm & Biến thể
    CAT_PRICE: 'cat_price',    // Giá & Khuyến mãi
    CAT_SUPPLIER: 'cat_supplier', // Nhà cung cấp
    
    // Nhóm Quản lý nhập xuất
    IMP_IMPORT: 'imp_import',  // Nhập hàng
    IMP_EXPORT: 'imp_export',  // Xuất hàng
    IMP_CHECK: 'imp_check',    // Kiểm kê
    
    // Nhóm Báo cáo
    REP_INVENTORY: 'rep_inventory',
    REP_ACTIVITY: 'rep_activity',
    REP_PERFORMANCE: 'rep_performance'
};

// 3. MA TRẬN PHÂN QUYỀN (Mapping ID từ DB sang Quyền)
// 1: Admin, 2: Sales, 3: Warehouse
const PERMISSION_MATRIX = {
    1: { roleName: 'Admin', all: ACTIONS.EDIT }, // Admin chấp hết
    
    2: { // NV Kinh doanh
        roleName: 'Kinh doanh',
        permissions: {
            [RESOURCES.SYS_USER]: ACTIONS.NONE,
            [RESOURCES.SYS_ROLE]: ACTIONS.NONE,
            
            [RESOURCES.CAT_GROUP]: ACTIONS.EDIT,
            [RESOURCES.CAT_PRODUCT]: ACTIONS.EDIT,
            [RESOURCES.CAT_PRICE]: ACTIONS.EDIT,
            [RESOURCES.CAT_SUPPLIER]: ACTIONS.EDIT,
            
            [RESOURCES.IMP_IMPORT]: ACTIONS.NONE,
            [RESOURCES.IMP_EXPORT]: ACTIONS.NONE,
            [RESOURCES.IMP_CHECK]: ACTIONS.NONE,
            
            [RESOURCES.REP_INVENTORY]: ACTIONS.EDIT,
            [RESOURCES.REP_ACTIVITY]: ACTIONS.NONE,
            [RESOURCES.REP_PERFORMANCE]: ACTIONS.EDIT
        }
    },
    
    3: { // NV Kho
        roleName: 'Kho',
        permissions: {
            [RESOURCES.SYS_USER]: ACTIONS.NONE,
            [RESOURCES.SYS_ROLE]: ACTIONS.NONE,
            
            [RESOURCES.CAT_GROUP]: ACTIONS.VIEW,    // Chỉ xem
            [RESOURCES.CAT_PRODUCT]: ACTIONS.VIEW,  // Chỉ xem
            [RESOURCES.CAT_PRICE]: ACTIONS.NONE,
            [RESOURCES.CAT_SUPPLIER]: ACTIONS.NONE,
            
            [RESOURCES.IMP_IMPORT]: ACTIONS.EDIT,
            [RESOURCES.IMP_EXPORT]: ACTIONS.EDIT,
            [RESOURCES.IMP_CHECK]: ACTIONS.EDIT,
            
            [RESOURCES.REP_INVENTORY]: ACTIONS.EDIT,
            [RESOURCES.REP_ACTIVITY]: ACTIONS.NONE,
            [RESOURCES.REP_PERFORMANCE]: ACTIONS.NONE
        }
    }
};

/**
 * Hàm kiểm tra quyền
 * @param {string} resource - Tên chức năng (Lấy từ RESOURCES)
 * @param {string} action - Hành động cần kiểm tra (view/edit)
 * @returns {boolean} - True nếu được phép
 */
function hasPermission(resource, action = ACTIONS.VIEW) {
    // Lấy user từ localStorage (đã lưu lúc đăng nhập)
    const userJson = localStorage.getItem('user');
    if (!userJson) return false;

    const user = JSON.parse(userJson);
    const roleId = user.QuyenHan; // 1, 2, hoặc 3

    // Nếu là Admin (1) -> Luôn đúng
    if (roleId === 1) return true;

    const roleConfig = PERMISSION_MATRIX[roleId];
    if (!roleConfig || !roleConfig.permissions) return false;

    const allowedAction = roleConfig.permissions[resource];

    // Không có quyền hoặc bị set là NONE
    if (!allowedAction || allowedAction === ACTIONS.NONE) return false;

    // Nếu user có quyền EDIT -> auto có quyền VIEW
    if (allowedAction === ACTIONS.EDIT) return true;

    // Nếu user có quyền VIEW -> chỉ khớp khi action yêu cầu là VIEW
    if (allowedAction === ACTIONS.VIEW && action === ACTIONS.VIEW) return true;

    return false;
}

/**
 * Hàm tự động ẩn các phần tử HTML dựa trên quyền
 * Cách dùng: Thêm class="auth-check" data-resource="cat_product" data-action="edit" vào thẻ HTML
 */
function applyPermissionsUI() {
    const protectedElements = document.querySelectorAll('.auth-check');
    
    protectedElements.forEach(el => {
        const resource = el.getAttribute('data-resource');
        const action = el.getAttribute('data-action') || ACTIONS.VIEW;

        if (!hasPermission(resource, action)) {
            el.style.display = 'none'; // Hoặc el.remove() để xóa hẳn
        }
    });
}

// Tự động chạy khi trang load xong
document.addEventListener('DOMContentLoaded', applyPermissionsUI);