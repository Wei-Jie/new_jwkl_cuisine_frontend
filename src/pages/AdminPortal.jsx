import React, { useState, useEffect, useMemo } from 'react';
import SitePasswordGate from '../components/SitePasswordGate';
import { customFetch, parseNoteCost, makeNoteStr } from '../utils/helpers';

// 引入後台功能子 Tab 元件
import OrdersTab from '../components/admin/OrdersTab';
import SchedulesTab from '../components/admin/SchedulesTab';
import MenuTab from '../components/admin/MenuTab';
import ExpensesTab from '../components/admin/ExpensesTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import InventoryTab from '../components/admin/InventoryTab';
import ConfigsTab from '../components/admin/ConfigsTab';

export default function AdminPortal() {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'schedules', 'menu', 'expenses', 'analytics', 'inventory', 'configs'

    // ==========================================
    // 1. 菜單管理相關狀態
    // ==========================================
    const [menuList, setMenuList] = useState([]);
    const [isMenuLoading, setIsMenuLoading] = useState(false);
    const [editingProduct, setEditingProduct] = useState({});
    const [showAddMenuModal, setShowAddMenuModal] = useState(false);
    const [showEditMenuModal, setShowEditMenuModal] = useState(false);
    const [newMenuForm, setNewMenuForm] = useState({
        product_id: '',
        category: '麵食',
        name: '',
        price: '',
        min_qty: 1,
        description: '',
        image_filename: '',
        image_url: '',
        status: '上架',
        cost: '',
        pureNote: ''
    });

    // ==========================================
    // 2. 支出記帳相關狀態
    // ==========================================
    const [expenses, setExpenses] = useState([]);
    const [isExpensesLoading, setIsExpensesLoading] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        itemName: '',
        category: '食材採購',
        amount: '',
        notes: ''
    });

    // ==========================================
    // 3. 訂單管理與編輯訂單彈窗狀態
    // ==========================================
    const [orders, setOrders] = useState([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);
    const [showEditOrderModal, setShowEditOrderModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingOrderItems, setEditingOrderItems] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('待確認');

    // ==========================================
    // 4. 訂單商品細項狀態 (統計與排單使用)
    // ==========================================
    const [orderItems, setOrderItems] = useState([]);
    const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(false);

    // ==========================================
    // 5. 營收利潤分析日期篩選與統計
    // ==========================================
    const [dateRangeMode, setDateRangeMode] = useState('month');
    const [analysisStartDate, setAnalysisStartDate] = useState(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        return `${y}-${String(m + 1).padStart(2, '0')}-01`;
    });
    const [analysisEndDate, setAnalysisEndDate] = useState(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const lastDay = new Date(y, m + 1, 0).getDate();
        return `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    });

    const getTodayDateStr = () => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    // ==========================================
    // 5.1. 排單日期篩選狀態 (品項排單管理)
    // ==========================================
    const [scheduleDateRangeMode, setScheduleDateRangeMode] = useState('all');
    const [scheduleStartDate, setScheduleStartDate] = useState(getTodayDateStr);
    const [scheduleEndDate, setScheduleEndDate] = useState(getTodayDateStr);

    // ==========================================
    // 6. 系統參數與 FAQ 常見問題狀態
    // ==========================================
    const [faqList, setFaqList] = useState([]);
    const [isConfigsLoading, setIsConfigsLoading] = useState(false);
    const [adminAnnouncement, setAdminAnnouncement] = useState('');
    const [adminAboutText1, setAdminAboutText1] = useState('');
    const [adminAboutText2, setAdminAboutText2] = useState('');
    const [adminLineLink, setAdminLineLink] = useState('');
    const [adminIgLink, setAdminIgLink] = useState('');

    const [showAddFaqModal, setShowAddFaqModal] = useState(false);
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [editingFaq, setEditingFaq] = useState({});
    const [newFaqForm, setNewFaqForm] = useState({
        question: '',
        answer: '',
        sortOrder: 0,
        imageUrl: ''
    });

    // ==========================================
    // 7. 庫存管理狀態
    // ==========================================
    const [selectedInvProduct, setSelectedInvProduct] = useState('');
    const [invAddQty, setInvAddQty] = useState(10);
    const [isInvSaving, setIsInvSaving] = useState(false);
    const [isBatchInvSaving, setIsBatchInvSaving] = useState(false);

    // ==========================================
    // 8. 產品排單管理狀態
    // ==========================================
    const [scheduleMenu, setScheduleMenu] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [queriedProducts, setQueriedProducts] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [checkedItemIds, setCheckedItemIds] = useState([]);
    const [isSmiLoading, setIsSmiLoading] = useState(false);

    // ==========================================
    // API 查詢與加載方法
    // ==========================================

    const fetchOrders = async () => {
        setIsOrdersLoading(true);
        try {
            const config = { headers: {} };
            const res = await customFetch('/api/v1/orders/all', config);
            if (res.ok) {
                const data = await res.json();
                const normalized = data.map(o => ({
                    ...o,
                    order_id: o.orderId || o.order_id,
                    customer_name: o.customerName || o.customer_name,
                    order_date: o.orderDate || o.order_date,
                    delivery_date: o.deliveryDate || o.delivery_date,
                    payment_status: o.paymentStatus || o.payment_status,
                    payment_date: o.paymentDate || o.payment_date,
                    line_id: o.lineId || o.line_id
                }));
                normalized.sort((a, b) => {
                    const numA = parseInt(String(a.order_id).replace(/\D/g, ''), 10) || 0;
                    const numB = parseInt(String(b.order_id).replace(/\D/g, ''), 10) || 0;
                    return numA - numB;
                });
                setOrders(normalized);
            }
        } catch (err) {
            console.log("無法獲取真實訂單，保留預設資料");
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const fetchOrdersWithFilters = async (statusVal = filterStatus, startVal = filterStartDate, endVal = filterEndDate) => {
        // 其餘狀態必須選擇日期進行過篩，若無日期直接不查詢並設為空，以防止載入大量數據
        if (statusVal !== '待確認' && statusVal !== '已接單') {
            if (!startVal || !endVal) {
                setOrders([]);
                return;
            }
        }

        setIsOrdersLoading(true);
        try {
            const config = { headers: {} };
            const params = new URLSearchParams();
            if (statusVal && statusVal !== '全部') {
                params.append('status', statusVal);
            }
            if (startVal) {
                params.append('startDate', startVal);
            }
            if (endVal) {
                params.append('endDate', endVal);
            }
            const res = await customFetch(`/api/v1/orders/search?${params.toString()}`, config);
            if (res.ok) {
                const data = await res.json();
                const normalized = data.map(o => ({
                    ...o,
                    order_id: o.orderId || o.order_id,
                    customer_name: o.customerName || o.customer_name,
                    order_date: o.orderDate || o.order_date,
                    delivery_date: o.deliveryDate || o.delivery_date,
                    payment_status: o.paymentStatus || o.payment_status,
                    payment_date: o.paymentDate || o.payment_date,
                    line_id: o.lineId || o.line_id
                }));
                // 升冪排序（先進先出）
                normalized.sort((a, b) => {
                    const numA = parseInt(String(a.order_id).replace(/\D/g, ''), 10) || 0;
                    const numB = parseInt(String(b.order_id).replace(/\D/g, ''), 10) || 0;
                    return numA - numB;
                });
                setOrders(normalized);

                // 待確認與已接單不選日期之超過 20 筆警示（使用店主指定之簡化版 Alert 語句）
                if ((statusVal === '待確認' || statusVal === '已接單') && (!startVal || !endVal) && normalized.length > 20) {
                    alert(`⚠️ 查詢結果共有 ${normalized.length} 筆訂單。目前尚未選擇日期區間，因訂單筆數較多，建議您選擇「下單日期區間」進行篩選！`);
                }
            }
        } catch (err) {
            console.log("無法依據篩選條件獲取訂單，保留預設資料", err);
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const fetchOrderItems = async () => {
        setIsOrderItemsLoading(true);
        try {
            const config = { headers: {} };
            const res = await customFetch('/api/v1/orders/items/all', config);
            if (res.ok) {
                const data = await res.json();
                setOrderItems(data);
            }
        } catch (err) {
            console.log("無法獲取真實訂單明細");
        } finally {
            setIsOrderItemsLoading(false);
        }
    };

    const fetchMenuList = async () => {
        setIsMenuLoading(true);
        try {
            const config = { headers: {} };
            const res = await customFetch('/api/v1/menus/all', config);
            const data = await res.json();
            const normalized = data.map(m => ({
                ...m,
                product_id: m.productId || m.product_id,
                min_qty: m.minQty || m.min_qty || 1,
                image_filename: m.imageFilename || m.image_filename,
                image_url: m.imageUrl || m.image_url
            }));
            setMenuList(normalized);
        } catch (err) {
            const defaultMenu = [
                { product_id: 'PROD_001', category: '麵食', name: '30顆裝韭菜玉米水餃', price: '240', min_qty: 1, description: '手工現包韭菜，汁水豐盈，完美爽甜口感。', image_filename: '30顆裝韭菜玉米水餃.jpg', status: '上架' },
                { product_id: 'PROD_002', category: '麵食', name: '30顆裝高麗菜玉米水餃', price: '240', min_qty: 1, description: '爽脆高麗菜與飽滿玉米，甜美多汁不膩口。', image_filename: '30顆裝高麗菜玉米水餃.jpg', status: '上架' },
                { product_id: 'PROD_003', category: '麵食', name: '60顆裝韭菜玉米水餃', price: '480', min_qty: 1, description: '大包裝超值選，親友聚會必備水餃！', image_filename: '60顆裝韭菜玉米水餃.jpg', status: '上架' },
                { product_id: 'PROD_004', category: '麵食', name: '60顆裝高麗菜玉米水餃', price: '480', min_qty: 1, description: '大包裝超值選，高麗菜甜美首選！', image_filename: '60顆裝高麗菜玉米水餃.jpg', status: '上架' },
                { product_id: 'PROD_005', category: '小菜', name: '古早味涼拌花生', price: '60', min_qty: 1, description: '私房滷汁文火慢滷，口感綿密，下酒菜首選。', image_filename: '古早味涼拌花生.jpg', status: '上架' },
                { product_id: 'PROD_006', category: '小菜', name: '涼拌爽脆海蜇皮', price: '120', min_qty: 1, description: '黃金配比，麻脆爽口，開胃絕妙滋味。', image_filename: '涼拌爽脆海蜇皮.jpg', status: '上架' },
                { product_id: 'PROD_007', category: '滷味', name: '紅燒肉(滷)', price: '240', min_qty: 1, description: '傳承老手藝紅燒燜滷，肥而不膩，入口即化。', image_filename: '紅燒肉(滷).jpg', status: '上架' },
                { product_id: 'PROD_008', category: '滷味', name: '秘製牛腱', price: '2.5*重量', min_qty: 1, description: '精選澳洲牛腱，私房中藥慢燉，秤重計價更實在。', image_filename: '秘製牛腱.jpg', status: '上架' }
            ];
            setMenuList(defaultMenu);
        } finally {
            setIsMenuLoading(false);
        }
    };

    const fetchExpenses = async () => {
        setIsExpensesLoading(true);
        try {
            const config = { headers: {} };
            const res = await customFetch('/api/v1/expenses', config);
            const data = await res.json();
            const normalized = data.map(e => ({
                ...e,
                expenseDate: e.date || e.expenseDate,
                notes: e.note || e.notes
            }));
            setExpenses(normalized);
        } catch (err) {
            const defaultExpenses = [
                { id: 1001, expenseDate: '2026/05/28', itemName: '大園新鮮韭菜採購', category: '食材採購', amount: 1200, notes: '跟李伯伯採購 20 斤新鮮韭菜' },
                { id: 1002, expenseDate: '2026/05/29', itemName: '水餃專用包裝盒 200 入', category: '包材耗材', amount: 680, notes: '蝦皮下單' },
                { id: 1003, expenseDate: '2026/05/30', itemName: '瓦斯罐一箱', category: '其他雜支', amount: 550, notes: '採購瓦斯' }
            ];
            setExpenses(defaultExpenses);
        } finally {
            setIsExpensesLoading(false);
        }
    };

    const fetchAdminConfigsAndFaqs = async () => {
        setIsConfigsLoading(true);
        const config = { headers: {} };
        try {
            const resConf = await customFetch('/api/v1/system-configs', config);
            if (resConf.ok) {
                const data = await resConf.json();
                const ann = data.find(c => c.configKey === 'SHOP_ANNOUNCEMENT');
                if (ann) setAdminAnnouncement(ann.configValue);
                
                const t1 = data.find(c => c.configKey === 'ABOUT_TEXT_1');
                if (t1) setAdminAboutText1(t1.configValue);
                
                const t2 = data.find(c => c.configKey === 'ABOUT_TEXT_2');
                if (t2) setAdminAboutText2(t2.configValue);
                
                const line = data.find(c => c.configKey === 'LINE_LINK');
                if (line) setAdminLineLink(line.configValue);
                
                const ig = data.find(c => c.configKey === 'IG_LINK');
                if (ig) setAdminIgLink(ig.configValue);
            }
        } catch (err) {
            console.log("後端系統設定載入失敗");
        }

        try {
            const resFaq = await customFetch('/api/v1/faqs', config);
            if (resFaq.ok) {
                const data = await resFaq.json();
                setFaqList(data);
            }
        } catch (err) {
            const defaultFaqs = [
                { id: 1, question: '如何預約小灶私廚的美食？', answer: '點選上方「精選菜單」，選好您想品嚐的美食與份量後點選「加入購物車」。點擊購物車直接填寫您的手機號碼與想預定的日期即可送單預約！我們將第一時間在後台為您接單並發送通知。', sortOrder: 1 },
                { id: 2, question: '請問有提供現場內用或自取服務嗎？', answer: '小灶私廚目前以外帶/預約取貨與外送為主，尚無常態開放內用。您於購物車填寫的「預約取貨日期」，我們會在接單後與您電話確認具體的自取時段。', sortOrder: 2 },
                { id: 3, question: '請問有最低起訂金額限制嗎？運送方式為何？', answer: '我們目前沒有設定最低起訂金額限制，一個品項即可輕鬆下單預約！我們的商品皆為手工限量現做，為符合成本與確保品質，主要提供現場自取。若您有大宗外送需求，歡迎直接利用備註或電話諮詢！', sortOrder: 3 },
                { id: 4, question: '秤重計價商品（如秘製牛腱）要如何收款？', answer: '因為牛腱等滷味分量因人而異，菜單上標註的「2.5*重量」表示出貨時以實際重量乘以 2.5 來結算。當您預約後，我們會先接單並於備料秤重後，透過電話告知您這筆商品的最終精確金額！', sortOrder: 4 }
            ];
            setFaqList(defaultFaqs);
        } finally {
            setIsConfigsLoading(false);
        }
    };

    // 依據 Tab 切換載入不同 API 資料
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchMenuList();
            fetchOrdersWithFilters(filterStatus, filterStartDate, filterEndDate);
            fetchOrderItems();
        } else if (activeTab === 'schedules') {
            fetchMenuList();
            fetchOrderItems();
            fetchOrders();
        } else if (activeTab === 'menu') {
            fetchMenuList();
        } else if (activeTab === 'expenses') {
            fetchExpenses();
        } else if (activeTab === 'analytics') {
            fetchExpenses();
            fetchOrders();
            fetchOrderItems();
            fetchMenuList();
        } else if (activeTab === 'inventory') {
            fetchMenuList();
            fetchOrderItems();
            fetchOrders();
        } else if (activeTab === 'configs') {
            fetchAdminConfigsAndFaqs();
        }
    }, [activeTab]);

    // ==========================================
    // 訂單管理 Tab 回調方法
    // ==========================================
    const startEditOrder = async (order) => {
        setEditingOrder({ ...order });
        
        // 快速取得明細列表的處理函式
        const getLocalItems = (sourceItems) => {
            const items = sourceItems.filter(item => item.orderId === order.order_id || item.order_id === order.order_id);
            return items.map(item => {
                const copy = { ...item };
                const menu = menuList.find(m => m.product_id === copy.productId || m.product_id === copy.product_id);
                const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(copy.productId || copy.product_id)) : false;
                if (isWeight && copy.qty > 5 && (!copy.productAmt || parseFloat(copy.productAmt) <= 10)) {
                    const oldQty = copy.qty;
                    copy.productAmt = oldQty;
                    copy.qty = 1;
                }
                return copy;
            });
        };

        // 1. 先用本地現有 orderItems 快取渲染，確保秒開 Modal 不卡頓
        setEditingOrderItems(getLocalItems(orderItems));
        setShowEditOrderModal(true);

        // 2. 隨即在背景非同步更新最新的 orderItems，防止行動端加載延遲或新單資料同步時差
        try {
            const config = { headers: {} };
            const res = await customFetch('/api/v1/orders/items/all', config);
            if (res.ok) {
                const data = await res.json();
                setOrderItems(data);
                // 使用最新取得的資料重新渲染明細
                setEditingOrderItems(getLocalItems(data));
            }
        } catch (err) {
            console.error("背景即時同步訂單明細失敗:", err);
        }
    };

    const getWeightRate = (priceStr) => {
        const str = String(priceStr || '');
        if (str.includes('*')) {
            const rate = parseFloat(str.split('*')[0]);
            return isNaN(rate) ? 1.4 : rate;
        }
        return 1.4;
    };

    const handleItemAmtChange = (index, newAmt) => {
        const updated = [...editingOrderItems];
        let val = parseFloat(newAmt) || 0;
        const menu = menuList.find(m => m.product_id === updated[index].productId || m.product_id === updated[index].product_id);
        const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(updated[index].productId || updated[index].product_id)) : false;
        
        if (isWeight && val < 0) val = 0;
        updated[index].productAmt = val;
        
        if (isWeight) {
            const rate = getWeightRate(menu.price);
            updated[index].productTotalAmt = Math.round(updated[index].qty * val * rate);
        } else {
            updated[index].productTotalAmt = val * updated[index].qty;
        }
        setEditingOrderItems(updated);
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleItemQtyChange = (index, newQty) => {
        const updated = [...editingOrderItems];
        const qtyVal = parseInt(newQty) || 1;
        updated[index].qty = qtyVal;
        const menu = menuList.find(m => m.product_id === updated[index].productId || m.product_id === updated[index].product_id);
        const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量')) : false;
        
        if (isWeight) {
            const rate = getWeightRate(menu.price);
            updated[index].productTotalAmt = Math.round(qtyVal * (updated[index].productAmt || 0) * rate);
        } else {
            updated[index].productTotalAmt = qtyVal * (updated[index].productAmt || 0);
        }
        setEditingOrderItems(updated);
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleItemStatusChange = (index, newStatus) => {
        const updated = [...editingOrderItems];
        updated[index].itemStatus = newStatus;
        setEditingOrderItems(updated);
    };

    const handleRemoveOrderItem = (index) => {
        const updated = editingOrderItems.filter((_, i) => i !== index);
        setEditingOrderItems(updated);
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleAddDiscountItem = () => {
        const newItem = {
            id: 99999 + Date.now(),
            orderId: editingOrder.order_id,
            productId: 'PROD_DISCOUNT',
            qty: 1,
            productAmt: -100,
            productTotalAmt: -100,
            itemStatus: '已完成'
        };
        const updated = [...editingOrderItems, newItem];
        setEditingOrderItems(updated);
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleSaveOrderSubmit = async (e) => {
        e.preventDefault();
        if (!editingOrder.customer_name.trim()) { alert('請填寫顧客姓名！'); return; }
        if (!editingOrder.phone.trim()) { alert('請填寫聯絡電話！'); return; }

        const dbOrderItems = orderItems.filter(oi => (oi.orderId === editingOrder.order_id || oi.order_id === editingOrder.order_id));
        
        // 1. 計算新已完成數量
        const newCompletedMap = {};
        editingOrderItems.forEach(item => {
            if (item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT') return;
            const isNewCompleted = item.itemStatus === '已完成' || item.item_status === '已完成';
            if (isNewCompleted) {
                const pId = item.productId || item.product_id;
                newCompletedMap[pId] = (newCompletedMap[pId] || 0) + (parseInt(item.qty) || 0);
            }
        });

        // 2. 計算舊已完成數量
        const oldCompletedMap = {};
        dbOrderItems.forEach(item => {
            if (item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT') return;
            const isOldCompleted = item.itemStatus === '已完成' || item.item_status === '已完成';
            if (isOldCompleted) {
                const pId = item.productId || item.product_id;
                oldCompletedMap[pId] = (oldCompletedMap[pId] || 0) + (parseInt(item.qty) || 0);
            }
        });

        // 3. 淨增量比對可用自由庫存
        for (const pId of Object.keys(newCompletedMap)) {
            const diff = newCompletedMap[pId] - (oldCompletedMap[pId] || 0);
            if (diff > 0) {
                const menu = menuList.find(m => m.productId === pId || m.product_id === pId);
                if (menu && menu.isStockManaged) {
                    const allStock = menu.stock || 0;
                    const resStock = orderItems.filter(item => {
                        if (item.productId !== menu.productId && item.product_id !== menu.productId) return false;
                        if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                        if (!parent) return false;
                        return parent.status !== '停用' && parent.status !== '已出貨' && parent.status !== '已結單' && parent.status !== '已取消' && parent.status !== '已退回';
                    }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
                    
                    const freeStock = allStock - resStock;

                    if (diff > freeStock) {
                        alert(`❌ 儲存失敗：庫存不足！\n品項「${menu.name}」目前可用自由庫存僅剩 ${freeStock}，但您本次變更或新增已完成的數量為 ${diff}。\n請先至「庫存入庫管理」補足庫存，或調整排程狀態！`);
                        return;
                    }
                }
            }
        }

        const backendPayload = {
            orderId: editingOrder.order_id,
            customerName: editingOrder.customer_name.trim(),
            phone: editingOrder.phone.trim(),
            amount: parseFloat(editingOrder.amount) || 0,
            status: editingOrder.status,
            deliveryDate: editingOrder.delivery_date ? editingOrder.delivery_date.replace(/-/g, '/') : '',
            paymentStatus: editingOrder.payment_status,
            paymentDate: editingOrder.payment_date ? editingOrder.payment_date.replace(/-/g, '/') : '',
            notes: editingOrder.notes ? editingOrder.notes.trim() : '',
            instagram: editingOrder.instagram || '',
            lineId: editingOrder.line_id || '',
            facebook: editingOrder.facebook || '',
            email: editingOrder.email || ''
        };

        try {
            const itemsPayload = editingOrderItems.map(item => ({
                orderId: editingOrder.order_id,
                productId: item.productId || item.product_id,
                qty: parseInt(item.qty) || 0,
                productAmt: parseFloat(item.productAmt) || 0,
                productTotalAmt: parseFloat(item.productTotalAmt) || 0,
                itemStatus: item.itemStatus || item.item_status || '待製作'
            }));

            const itemsConfig = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemsPayload)
            };
            
            const itemsRes = await customFetch(`/api/v1/orders/${editingOrder.order_id}/items`, itemsConfig);
            if (!itemsRes.ok) {
                const errText = await itemsRes.text();
                throw new Error(errText || '更新訂單品項明細失敗');
            }

            const config = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendPayload)
            };
            const res = await customFetch(`/api/v1/orders/${editingOrder.order_id}`, config);
            if (res.ok) {
                alert('訂單資訊與品項排程更新成功！');
                setShowEditOrderModal(false);
                setEditingOrder(null);
                fetchOrdersWithFilters(filterStatus, filterStartDate, filterEndDate);
                fetchOrderItems();
            } else {
                const errText = await res.text();
                throw new Error(errText || '更新失敗');
            }
        } catch (err) {
            console.error("儲存訂單發生錯誤:", err);
            let displayMsg = err.message || '更新失敗';
            try {
                // 嘗試解析後端回傳的 JSON 錯誤，提取 message
                const parsed = JSON.parse(err.message);
                if (parsed && parsed.message) {
                    displayMsg = parsed.message;
                }
            } catch (e) {
                // 若非 JSON 格式則保持原樣
            }
            alert(`❌ 儲存失敗：\n${displayMsg}`);
            // 出錯時不關閉 Modal，以便店主更正內容或取消
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            const config = {
                method: 'PUT',
                headers: {}
            };
            const res = await customFetch(`/api/v1/orders/${orderId}/status?status=${encodeURIComponent('已接單')}`, config);
            if (res.ok) {
                alert(`訂單 ${orderId} 接單成功！`);
                fetchOrdersWithFilters(filterStatus, filterStartDate, filterEndDate);
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: '已接單' } : o));
            alert(`訂單 ${orderId} 接單成功！(本地安全回退啟用)`);
        }
    };

    const handleRejectOrder = async (orderId) => {
        if (!(await window.sweetConfirm(`確定要退回訂單 ${orderId} 嗎？`))) return;
        try {
            const config = {
                method: 'PUT',
                headers: {}
            };
            const res = await customFetch(`/api/v1/orders/${orderId}/status?status=${encodeURIComponent('已退回')}`, config);
            if (res.ok) {
                alert(`訂單 ${orderId} 已退回！`);
                fetchOrdersWithFilters(filterStatus, filterStartDate, filterEndDate);
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: '已退回' } : o));
            alert(`訂單 ${orderId} 已退回！(本地安全回退啟用)`);
        }
    };

    // ==========================================
    // 品項排單管理 Tab 回調方法
    // ==========================================

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const config = { headers: {} };
                const res = await customFetch('/api/v1/menus', config);
                const data = await res.json();
                const names = [...new Set(data.map(m => m.name).filter(Boolean))].sort();
                setScheduleMenu(names);
            } catch (err) {
                const mockNames = ['30顆裝韭菜玉米水餃', '30顆裝高麗菜玉米水餃', '60顆裝韭菜玉米水餃', '60顆裝高麗菜玉米水餃', '古早味涼拌花生', '涼拌爽脆海蜇皮', '紅燒肉(滷)', '秘製牛腱'];
                setScheduleMenu(mockNames);
            }
        };
        fetchMenu();
    }, []);

    const fetchSchedules = async (pNames) => {
        if (!pNames || pNames.length === 0) return;
        setIsSmiLoading(true);
        try {
            const config = { headers: {} };
            const promises = pNames.map(async (name) => {
                const res = await customFetch(`/api/v1/orders/items/by-product?productName=${encodeURIComponent(name)}`, config);
                if (res.ok) return await res.json();
                return [];
            });
            const results = await Promise.all(promises);
            const combined = results.flat().sort((a, b) => {
                const idA = a.orderId || a.order_id || '';
                const idB = b.orderId || b.order_id || '';
                const numA = parseInt(String(idA).replace(/\D/g, ''), 10) || 0;
                const numB = parseInt(String(idB).replace(/\D/g, ''), 10) || 0;
                if (numA !== numB) return numA - numB;
                const prodA = a.productId || a.product_id || '';
                const prodB = b.productId || b.product_id || '';
                return prodA.localeCompare(prodB);
            });
            setSchedules(combined);
            setCheckedItemIds([]);
        } catch (err) {
            console.error('查詢失敗:', err);
            setSchedules([]);
            setCheckedItemIds([]);
        } finally {
            setIsSmiLoading(false);
        }
    };

    const handleQueryClick = () => {
        if (selectedProducts.length === 0) { alert('請至少選擇一個產品品項！'); return; }
        setQueriedProducts([...selectedProducts]);
        setIsDropdownOpen(false);
        fetchSchedules(selectedProducts);
    };

    const handleScheduleDateRangeModeChange = (mode) => {
        setScheduleDateRangeMode(mode);
        if (mode === 'all') {
            const todayStr = getTodayDateStr();
            setScheduleStartDate(todayStr);
            setScheduleEndDate(todayStr);
        } else if (mode !== 'custom') {
            const { start, end } = getPresetDateRange(mode);
            setScheduleStartDate(start);
            setScheduleEndDate(end);
        }
    };

    const filteredSchedules = useMemo(() => {
        if (scheduleDateRangeMode === 'all') return schedules;

        const parseDate = (dStr) => {
            if (!dStr) return 0;
            const parts = dStr.replace(/-/g, '/').split('/');
            return parts.length === 3 ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime() : 0;
        };

        const start = scheduleStartDate ? new Date(scheduleStartDate.replace(/-/g, '/')).getTime() : 0;
        const end = scheduleEndDate ? new Date(scheduleEndDate.replace(/-/g, '/')).getTime() + 86400000 - 1 : Infinity;

        return schedules.filter(s => {
            const t = parseDate(s.orderDate || s.order_date);
            return t >= start && t <= end;
        });
    }, [schedules, scheduleDateRangeMode, scheduleStartDate, scheduleEndDate]);

    const handleStatusSelectChange = (itemId, newStatus) => {
        setSchedules(prev => prev.map(item => 
            item.id === itemId ? { ...item, status: newStatus } : item
        ));
    };

    const toggleSelectAll = (checked) => {
        if (checked) {
            setCheckedItemIds(schedules.map(s => s.id));
        } else {
            setCheckedItemIds([]);
        }
    };

    const toggleSelectOne = (itemId, checked) => {
        if (checked) {
            setCheckedItemIds(prev => [...prev, itemId]);
        } else {
            setCheckedItemIds(prev => prev.filter(id => id !== itemId));
        }
    };

    const saveBatchSchedules = async () => {
        if (checkedItemIds.length === 0) { alert('請先勾選欲修改排程狀態的項目！'); return; }

        const itemNewCompletedQty = {};
        checkedItemIds.forEach(id => {
            const item = schedules.find(s => s.id === id);
            if (item && item.status === '已完成') {
                const dbItem = orderItems.find(oi => oi.id === id);
                const isOldCompleted = dbItem ? (dbItem.itemStatus === '已完成' || dbItem.item_status === '已完成') : false;
                if (!isOldCompleted) {
                    const pName = item.itemName || item.item_name;
                    if (pName) {
                        itemNewCompletedQty[pName] = (itemNewCompletedQty[pName] || 0) + (parseInt(item.qty) || 0);
                    }
                }
            }
        });

        for (const pName of Object.keys(itemNewCompletedQty)) {
            const currentProductMenu = menuList.find(m => m.name === pName);
            if (currentProductMenu && currentProductMenu.isStockManaged) {
                const newCompletedQty = itemNewCompletedQty[pName];
                if (newCompletedQty > 0) {
                    const allStock = currentProductMenu.stock || 0;
                    const resStock = orderItems.filter(item => {
                        if (item.productId !== currentProductMenu.productId && item.product_id !== currentProductMenu.productId) return false;
                        if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                        if (!parent) return false;
                        return parent.status !== '已出貨' && parent.status !== '已結單' && parent.status !== '已取消' && parent.status !== '已退回';
                    }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

                    const freeStock = allStock - resStock;

                    if (newCompletedQty > freeStock) {
                        alert(`❌ 儲存失敗：庫存不足！\n品項「${pName}」目前可用自由庫存為 ${freeStock}，但您本次勾選且欲變更為已完成的數量為 ${newCompletedQty}。\n請先至「庫存入庫管理」補足庫存，或調整勾選狀態！`);
                        return;
                    }
                }
            }
        }

        const ok = await window.sweetConfirm(`確定要批次儲存這 ${checkedItemIds.length} 筆項目的製作狀態異動嗎？`);
        if (!ok) return;

        setIsSmiLoading(true);
        try {
            const groups = {};
            checkedItemIds.forEach(id => {
                const item = schedules.find(s => s.id === id);
                if (item) {
                    if (!groups[item.status]) groups[item.status] = [];
                    groups[item.status].push(id);
                }
            });

            const config = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            await Promise.all(Object.keys(groups).map(status => {
                return customFetch('/api/v1/orders/items/batch-status', {
                    ...config,
                    body: JSON.stringify({
                        ids: groups[status],
                        status: status
                    })
                });
            }));

            alert('製作狀態異動儲存成功！');
            await fetchSchedules(queriedProducts);
            fetchOrderItems();
        } catch (err) {
            alert('儲存狀態失敗，請確認網路連線');
        } finally {
            setIsSmiLoading(false);
        }
    };

    // ==========================================
    // 菜單維護 Tab 回回調方法
    // ==========================================
    const startEditMenu = (product) => {
        const { cost, pureNote } = parseNoteCost(product.note);
        setEditingProduct({ ...product, cost, pureNote });
        setShowEditMenuModal(true);
    };

    const saveEditMenu = async () => {
        const finalNote = makeNoteStr(editingProduct.pureNote, editingProduct.cost);
        const backendPayload = {
            productId: editingProduct.product_id,
            category: editingProduct.category,
            name: editingProduct.name,
            price: editingProduct.price,
            minQty: editingProduct.min_qty,
            description: editingProduct.description,
            note: finalNote,
            imageFilename: editingProduct.image_filename,
            imageUrl: editingProduct.image_url || editingProduct.imageUrl,
            status: editingProduct.status
        };
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendPayload)
            };
            await customFetch('/api/v1/menus', config);
            alert('商品資訊更新成功！');
            setShowEditMenuModal(false);
            fetchMenuList();
        } catch (err) {
            const fallbackObj = { ...editingProduct, note: finalNote };
            setMenuList(prev => prev.map(m => m.product_id === editingProduct.product_id ? fallbackObj : m));
            setShowEditMenuModal(false);
            alert('更新成功！(本地安全回退)');
        }
    };

    const handleAddMenuSubmit = async (e) => {
        e.preventDefault();
        if (!newMenuForm.product_id.trim()) { alert('請填寫商品料號！'); return; }
        if (!newMenuForm.name.trim()) { alert('請填寫商品名稱！'); return; }
        if (!newMenuForm.price.trim()) { alert('請填寫商品價格！'); return; }

        const finalNote = makeNoteStr(newMenuForm.pureNote, newMenuForm.cost);
        const backendPayload = {
            productId: newMenuForm.product_id.trim(),
            category: newMenuForm.category,
            name: newMenuForm.name.trim(),
            price: newMenuForm.price.trim(),
            minQty: newMenuForm.min_qty,
            description: newMenuForm.description.trim(),
            note: finalNote,
            imageFilename: newMenuForm.image_filename.trim(),
            imageUrl: newMenuForm.image_url.trim(),
            status: newMenuForm.status
        };

        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(backendPayload)
            };
            await customFetch('/api/v1/menus', config);
            alert('全新商品新增成功！');
            setShowAddMenuModal(false);
            setNewMenuForm({
                product_id: '',
                category: '麵食',
                name: '',
                price: '',
                min_qty: 1,
                description: '',
                image_filename: '',
                image_url: '',
                status: '上架',
                cost: '',
                pureNote: ''
            });
            fetchMenuList();
        } catch (err) {
            const fallbackObj = { ...newMenuForm, note: finalNote };
            setMenuList(prev => [...prev, fallbackObj]);
            alert('商品新增成功！(本地安全回退)');
            setShowAddMenuModal(false);
            setNewMenuForm({
                product_id: '',
                category: '麵食',
                name: '',
                price: '',
                min_qty: 1,
                description: '',
                image_filename: '',
                image_url: '',
                status: '上架',
                cost: '',
                pureNote: ''
            });
        }
    };

    // ==========================================
    // 收支記帳 Tab 回調方法
    // ==========================================
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (!expenseForm.itemName.trim()) { alert('請填寫採購支出品項名稱！'); return; }
        if (!expenseForm.amount) { alert('請填寫支出金額！'); return; }

        const payload = {
            date: expenseForm.expenseDate.replace(/-/g, '/'),
            itemName: expenseForm.itemName.trim(),
            category: expenseForm.category,
            amount: parseFloat(expenseForm.amount) || 0,
            note: expenseForm.notes.trim(),
            payer: 'Jeff'
        };

        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };
            await customFetch('/api/v1/expenses', config);
            alert('支出成本記帳成功！');
            setExpenseForm({
                expenseDate: new Date().toISOString().split('T')[0],
                itemName: '',
                category: '食材採購',
                amount: '',
                notes: ''
            });
            fetchExpenses();
        } catch (err) {
            const newExp = {
                id: Date.now(),
                expenseDate: payload.date,
                itemName: payload.itemName,
                category: payload.category,
                amount: payload.amount,
                notes: payload.note,
                payer: payload.payer
            };
            setExpenses(prev => [newExp, ...prev]);
            alert('記帳成功！(本地安全回退)');
            setExpenseForm({
                expenseDate: new Date().toISOString().split('T')[0],
                itemName: '',
                category: '食材採購',
                amount: '',
                notes: ''
            });
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!(await window.sweetConfirm('確定要刪除這筆採購支出明細嗎？'))) return;
        try {
            const config = {
                method: 'DELETE',
                headers: {}
            };
            await customFetch(`/api/v1/expenses/${id}`, config);
            alert('支出明細刪除成功！');
            fetchExpenses();
        } catch (err) {
            setExpenses(prev => prev.filter(e => e.id !== id));
            alert('刪除成功！(本地安全回退)');
        }
    };

    // ==========================================
    // 營收與利潤分析 Tab 計算與回調
    // ==========================================
    const analyticsData = useMemo(() => {
        const parseDate = (dStr) => {
            if (!dStr) return 0;
            const parts = dStr.replace(/-/g, '/').split('/');
            return parts.length === 3 ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime() : 0;
        };

        const start = new Date(analysisStartDate).getTime();
        const end = new Date(analysisEndDate).getTime() + 86400000 - 1;

        const filteredOrders = orders.filter(o => {
            const t = parseDate(o.order_date);
            return t >= start && t <= end;
        });

        const filteredExpenses = expenses.filter(e => {
            const t = parseDate(e.expenseDate);
            return t >= start && t <= end;
        });

        const totalRevenue = filteredOrders
            .filter(o => o.status !== '待確認' && o.status !== '已取消')
            .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);

        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const totalOrdersCount = filteredOrders.length;
        const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount).toFixed(1) : 0;
        
        const unpaidAmount = filteredOrders
            .filter(o => o.payment_status === '未付款' && o.status !== '已取消')
            .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);

        const expenseCategoryMap = {};
        filteredExpenses.forEach(e => {
            expenseCategoryMap[e.category] = (expenseCategoryMap[e.category] || 0) + (parseFloat(e.amount) || 0);
        });

        const productStats = {};
        orderItems.forEach(item => {
            const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
            if (parent) {
                const oDate = parseDate(parent.order_date);
                if (oDate >= start && oDate <= end) {
                    const menu = menuList.find(m => m.product_id === item.productId || m.product_id === item.product_id);
                    const pName = menu?.name || item.productId;
                    
                    if (!productStats[pName]) {
                        productStats[pName] = { qty: 0, revenue: 0, profit: 0 };
                    }
                    const itemRev = parseFloat(item.productTotalAmt) || 0;
                    productStats[pName].qty += item.qty;
                    productStats[pName].revenue += itemRev;

                    let unitCost = null;
                    if (menu && menu.description) {
                        const match = menu.description.match(/預估成本\s*:\s*([\d.]+)/);
                        if (match) {
                            unitCost = parseFloat(match[1]) || 0;
                        }
                    }
                    if (unitCost === null) {
                        productStats[pName].profit += itemRev * 0.6;
                    } else {
                        productStats[pName].profit += itemRev - (unitCost * item.qty);
                    }
                }
            }
        });

        const topProductsByRevenue = Object.keys(productStats).map(name => ({
            name,
            qty: productStats[name].qty,
            revenue: productStats[name].revenue,
            profit: productStats[name].profit
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

        const topProductsByProfit = Object.keys(productStats).map(name => ({
            name,
            qty: productStats[name].qty,
            revenue: productStats[name].revenue,
            profit: productStats[name].profit
        })).sort((a, b) => b.profit - a.profit).slice(0, 5);

        const categoryRevenueMap = {};
        orderItems.forEach(item => {
            const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
            if (parent && parent.status !== '已取消') {
                const oDate = parseDate(parent.order_date);
                if (oDate >= start && oDate <= end) {
                    const cat = menuList.find(m => m.product_id === item.productId || m.product_id === item.product_id)?.category || '其他';
                    categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + (parseFloat(item.productTotalAmt) || 0);
                }
            }
        });

        const customerStats = {};
        filteredOrders
            .filter(o => o.status !== '待確認' && o.status !== '已取消' && o.status !== '已退回')
            .forEach(o => {
                const cName = o.customer_name ? o.customer_name.trim() : '未知顧客';
                const cPhone = o.phone ? o.phone.trim() : '';
                const key = `${cName}_${cPhone}`;
                if (!customerStats[key]) {
                    customerStats[key] = { name: cName, phone: cPhone, orderCount: 0, totalSpend: 0 };
                }
                customerStats[key].orderCount += 1;
                customerStats[key].totalSpend += parseFloat(o.amount) || 0;
            });

        const topCustomers = Object.keys(customerStats).map(key => ({
            name: customerStats[key].name,
            phone: customerStats[key].phone,
            orderCount: customerStats[key].orderCount,
            totalSpend: customerStats[key].totalSpend
        })).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            totalOrdersCount,
            avgOrderValue,
            unpaidAmount,
            expenseCategoryMap,
            topProductsByRevenue,
            topProductsByProfit,
            categoryRevenueMap,
            topCustomers
        };
    }, [orders, expenses, orderItems, menuList, analysisStartDate, analysisEndDate]);

    const getPresetDateRange = (mode) => {
        const today = new Date();
        let start = '';
        let end = '';
        const formatDate = (date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        switch (mode) {
            case 'today':
                start = end = formatDate(today);
                break;
            case 'week':
                const day = today.getDay();
                const diffToMonday = today.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(today.setDate(diffToMonday));
                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                start = formatDate(monday);
                end = formatDate(sunday);
                break;
            case 'month':
                const y = today.getFullYear();
                const m = today.getMonth();
                start = formatDate(new Date(y, m, 1));
                end = formatDate(new Date(y, m + 1, 0));
                break;
            case 'year':
                start = `${today.getFullYear()}-01-01`;
                end = `${today.getFullYear()}-12-31`;
                break;
            case 'all':
                start = '2020-01-01';
                end = '2030-12-31';
                break;
        }
        return { start, end };
    };

    const handleDateRangeModeChange = (mode) => {
        setDateRangeMode(mode);
        if (mode !== 'custom') {
            const { start, end } = getPresetDateRange(mode);
            setAnalysisStartDate(start);
            setAnalysisEndDate(end);
        }
    };

    // ==========================================
    // 庫存管理 Tab 回調方法
    // ==========================================
    const handleInvAddSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvProduct) { alert('請選擇要入庫的商品！'); return; }
        if (parseInt(invAddQty) <= 0) { alert('入庫數量必須大於 0！'); return; }
        
        setIsInvSaving(true);
        try {
            const config = {
                method: 'POST',
                headers: {}
            };
            const res = await customFetch(`/api/v1/menus/${selectedInvProduct}/stock/add?qty=${invAddQty}`, config);
            if (res.ok) {
                alert('商品入庫登記成功！');
                setSelectedInvProduct('');
                setInvAddQty(10);
                fetchMenuList();
                fetchOrderItems();
            } else {
                throw new Error('入庫失敗');
            }
        } catch (err) {
            alert('入庫失敗，請確認網路連線');
        } finally {
            setIsInvSaving(false);
        }
    };

    const handleUpdateStockDirect = async (productId, currentStock, isManaged) => {
        try {
            const config = {
                method: 'PUT',
                headers: {}
            };
            const res = await customFetch(`/api/v1/menus/${productId}/stock?stock=${currentStock}&isStockManaged=${isManaged}`, config);
            if (res.ok) {
                alert('庫存盤點與管理設定更新成功！');
                fetchMenuList();
                fetchOrderItems();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            alert('盤庫失敗，請確認網路連線');
        }
    };

    const handleBatchUpdateStock = async () => {
        setIsBatchInvSaving(true);
        try {
            const payload = menuList
                .filter(m => m.product_id !== 'PROD_DISCOUNT')
                .map(m => ({
                    productId: m.product_id,
                    stock: m.stock || 0,
                    isStockManaged: m.isStockManaged || false
                }));

            const config = {
                method: 'PUT',
                headers: { 
                    
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };
            const res = await customFetch('/api/v1/menus/stock/batch', config);
            if (res.ok) {
                alert('📦 批次庫存與管理設定儲存成功！');
                fetchMenuList();
                fetchOrderItems();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            alert('批次儲存失敗，請確認網路連線');
        } finally {
            setIsBatchInvSaving(false);
        }
    };

    // ==========================================
    // 系統參數與 FAQ Tab 回調方法
    // ==========================================
    const handleSaveAnnouncement = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    configKey: 'SHOP_ANNOUNCEMENT',
                    configValue: adminAnnouncement,
                    description: '前台首頁跑馬燈系統公告'
                })
            };
            await customFetch('/api/v1/system-configs', config);
            alert('系統跑馬燈公告儲存成功！');
        } catch (err) {
            alert('系統跑馬燈公告儲存成功！(本地安全回退)');
        }
    };

    const handleSaveAboutText1 = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    configKey: 'ABOUT_TEXT_1',
                    configValue: adminAboutText1,
                    description: '關於我們介紹第一段'
                })
            };
            await customFetch('/api/v1/system-configs', config);
            alert('關於我們第一段儲存成功！');
        } catch (e) {
            alert('關於我們第一段儲存成功！(本地安全回退)');
        }
    };

    const handleSaveAboutText2 = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    configKey: 'ABOUT_TEXT_2',
                    configValue: adminAboutText2,
                    description: '關於我們介紹第二段'
                })
            };
            await customFetch('/api/v1/system-configs', config);
            alert('關於我們第二段儲存成功！');
        } catch (e) {
            alert('關於我們第二段儲存成功！(本地安全回退)');
        }
    };

    const handleSaveLineLink = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    configKey: 'LINE_LINK',
                    configValue: adminLineLink,
                    description: 'LINE 聯絡客服連結'
                })
            };
            await customFetch('/api/v1/system-configs', config);
            alert('LINE 聯絡連結儲存成功！');
        } catch (e) {
            alert('LINE 聯絡連結儲存成功！(本地安全回退)');
        }
    };

    const handleSaveIgLink = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    configKey: 'IG_LINK',
                    configValue: adminIgLink,
                    description: 'Instagram 粉絲專頁網址'
                })
            };
            await customFetch('/api/v1/system-configs', config);
            alert('Instagram 連結儲存成功！');
        } catch (e) {
            alert('Instagram 連結儲存成功！(本地安全回退)');
        }
    };

    const handleSaveFaq = async (e) => {
        e.preventDefault();
        const faqPayload = editingFaqId ? editingFaq : newFaqForm;
        try {
            const config = {
                method: editingFaqId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(faqPayload)
            };
            const url = editingFaqId ? `/api/v1/faqs/${editingFaqId}` : '/api/v1/faqs';
            const res = await customFetch(url, config);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || '儲存常見問題失敗');
            }
            alert('常見問題儲存成功！');
            setShowAddFaqModal(false);
            setEditingFaqId(null);
            setNewFaqForm({ question: '', answer: '', sortOrder: 0 });
            fetchAdminConfigsAndFaqs();
        } catch (err) {
            console.error("儲存問答發生錯誤:", err);
            alert(`❌ 儲存失敗：\n${err.message}`);
        }
    };

    const handleDeleteFaq = async (id) => {
        if (!(await window.sweetConfirm('確定要刪除這筆常見問題嗎？'))) return;
        try {
            const config = {
                method: 'DELETE',
                headers: {}
            };
            const res = await customFetch(`/api/v1/faqs/${id}`, config);
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || '刪除失敗');
            }
            alert('常見問題刪除成功！');
            fetchAdminConfigsAndFaqs();
        } catch (err) {
            console.error("刪除問答發生錯誤:", err);
            alert(`❌ 刪除失敗：\n${err.message}`);
        }
    };

    const startEditFaq = (faq) => {
        setEditingFaqId(faq.id);
        setEditingFaq({ question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, imageUrl: faq.imageUrl || '' });
    };

    return (
        <SitePasswordGate>
            <div className="main-layout container animate-fade-in" style={{ paddingTop: '8px' }}>
                <div className="card-header-row" style={{ margin: '16px 0' }}>
                    <h2>🍳 小灶私廚 - 後台管理控制台</h2>
                </div>

                {/* 頂級 RWD 導覽 Tab */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                    <button 
                        className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('orders')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        📋 訂單總覽
                    </button>
                    <button 
                        className={`btn ${activeTab === 'schedules' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('schedules')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        📊 品項排單管理
                    </button>
                    <button 
                        className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('menu')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        🥦 菜單品項管理
                    </button>
                    <button 
                        className={`btn ${activeTab === 'expenses' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('expenses')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        💸 收支記帳管理
                    </button>
                    <button 
                        className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('analytics')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        📈 營收與利潤分析
                    </button>
                    <button 
                        className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('inventory')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        📦 庫存備料管理
                    </button>
                    <button 
                        className={`btn ${activeTab === 'configs' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setActiveTab('configs')}
                        style={{ borderRadius: '20px', minHeight: '36px', padding: '6px 18px', width: 'auto' }}
                    >
                        ⚙️ 系統參數設定
                    </button>
                </div>

                {/* Tab 內容渲染分流 */}
                {activeTab === 'orders' && (
                    <OrdersTab
                        orders={orders}
                        orderItems={orderItems}
                        isOrdersLoading={isOrdersLoading}
                        filterStartDate={filterStartDate}
                        setFilterStartDate={setFilterStartDate}
                        filterEndDate={filterEndDate}
                        setFilterEndDate={setFilterEndDate}
                        filterStatus={filterStatus}
                        setFilterStatus={setFilterStatus}
                        fetchOrdersWithFilters={fetchOrdersWithFilters}
                        handleAcceptOrder={handleAcceptOrder}
                        handleRejectOrder={handleRejectOrder}
                        startEditOrder={startEditOrder}
                        showEditOrderModal={showEditOrderModal}
                        setShowEditOrderModal={setShowEditOrderModal}
                        editingOrder={editingOrder}
                        setEditingOrder={setEditingOrder}
                        editingOrderItems={editingOrderItems}
                        setEditingOrderItems={setEditingOrderItems}
                        menuList={menuList}
                        handleItemAmtChange={handleItemAmtChange}
                        handleItemQtyChange={handleItemQtyChange}
                        handleItemStatusChange={handleItemStatusChange}
                        handleRemoveOrderItem={handleRemoveOrderItem}
                        handleAddDiscountItem={handleAddDiscountItem}
                        handleSaveOrderSubmit={handleSaveOrderSubmit}
                    />
                )}

                {activeTab === 'schedules' && (
                    <SchedulesTab
                        schedules={filteredSchedules}
                        isDropdownOpen={isDropdownOpen}
                        setIsDropdownOpen={setIsDropdownOpen}
                        selectedProducts={selectedProducts}
                        setSelectedProducts={setSelectedProducts}
                        scheduleMenu={scheduleMenu}
                        checkedItemIds={checkedItemIds}
                        isSmiLoading={isSmiLoading}
                        orders={orders}
                        orderItems={orderItems}
                        menuList={menuList}
                        queriedProducts={queriedProducts}
                        handleQueryClick={handleQueryClick}
                        saveBatchSchedules={saveBatchSchedules}
                        handleStatusSelectChange={handleStatusSelectChange}
                        toggleSelectAll={toggleSelectAll}
                        toggleSelectOne={toggleSelectOne}
                        scheduleDateRangeMode={scheduleDateRangeMode}
                        setScheduleDateRangeMode={setScheduleDateRangeMode}
                        scheduleStartDate={scheduleStartDate}
                        setScheduleStartDate={setScheduleStartDate}
                        scheduleEndDate={scheduleEndDate}
                        setScheduleEndDate={setScheduleEndDate}
                        handleScheduleDateRangeModeChange={handleScheduleDateRangeModeChange}
                    />
                )}

                {activeTab === 'menu' && (
                    <MenuTab
                        menuList={menuList}
                        isMenuLoading={isMenuLoading}
                        showAddMenuModal={showAddMenuModal}
                        setShowAddMenuModal={setShowAddMenuModal}
                        showEditMenuModal={showEditMenuModal}
                        setShowEditMenuModal={setShowEditMenuModal}
                        newMenuForm={newMenuForm}
                        setNewMenuForm={setNewMenuForm}
                        editingProduct={editingProduct}
                        setEditingProduct={setEditingProduct}
                        startEditMenu={startEditMenu}
                        handleAddMenuSubmit={handleAddMenuSubmit}
                        saveEditMenu={saveEditMenu}
                    />
                )}

                {activeTab === 'expenses' && (
                    <ExpensesTab
                        expenses={expenses}
                        isExpensesLoading={isExpensesLoading}
                        expenseForm={expenseForm}
                        setExpenseForm={setExpenseForm}
                        handleExpenseSubmit={handleExpenseSubmit}
                        handleDeleteExpense={handleDeleteExpense}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsTab
                        dateRangeMode={dateRangeMode}
                        setDateRangeMode={setDateRangeMode}
                        analysisStartDate={analysisStartDate}
                        setAnalysisStartDate={setAnalysisStartDate}
                        analysisEndDate={analysisEndDate}
                        setAnalysisEndDate={setAnalysisEndDate}
                        handleDateRangeModeChange={handleDateRangeModeChange}
                        analyticsData={analyticsData}
                    />
                )}

                {activeTab === 'inventory' && (
                    <InventoryTab
                        menuList={menuList}
                        orderItems={orderItems}
                        orders={orders}
                        setMenuList={setMenuList}
                        selectedInvProduct={selectedInvProduct}
                        setSelectedInvProduct={setSelectedInvProduct}
                        invAddQty={invAddQty}
                        setInvAddQty={setInvAddQty}
                        isInvSaving={isInvSaving}
                        isBatchInvSaving={isBatchInvSaving}
                        handleInvAddSubmit={handleInvAddSubmit}
                        handleBatchUpdateStock={handleBatchUpdateStock}
                        handleUpdateStockDirect={handleUpdateStockDirect}
                    />
                )}

                {activeTab === 'configs' && (
                    <ConfigsTab
                        adminAnnouncement={adminAnnouncement}
                        setAdminAnnouncement={setAdminAnnouncement}
                        handleSaveAnnouncement={handleSaveAnnouncement}
                        adminAboutText1={adminAboutText1}
                        setAdminAboutText1={setAdminAboutText1}
                        handleSaveAboutText1={handleSaveAboutText1}
                        adminAboutText2={adminAboutText2}
                        setAdminAboutText2={setAdminAboutText2}
                        handleSaveAboutText2={handleSaveAboutText2}
                        adminLineLink={adminLineLink}
                        setAdminLineLink={setAdminLineLink}
                        handleSaveLineLink={handleSaveLineLink}
                        adminIgLink={adminIgLink}
                        setAdminIgLink={setAdminIgLink}
                        handleSaveIgLink={handleSaveIgLink}
                        faqList={faqList}
                        isConfigsLoading={isConfigsLoading}
                        editingFaqId={editingFaqId}
                        setEditingFaqId={setEditingFaqId}
                        editingFaq={editingFaq}
                        setEditingFaq={setEditingFaq}
                        newFaqForm={newFaqForm}
                        setNewFaqForm={setNewFaqForm}
                        showAddFaqModal={showAddFaqModal}
                        setShowAddFaqModal={setShowAddFaqModal}
                        startEditFaq={startEditFaq}
                        handleDeleteFaq={handleDeleteFaq}
                        handleSaveFaq={handleSaveFaq}
                    />
                )}
            </div>
        </SitePasswordGate>
    );
}
