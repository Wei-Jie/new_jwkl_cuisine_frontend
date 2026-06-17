/**
 * 小灶私廚 (NEW_JWKL_CUISINE) - 前端共用公用工具函數
 */

export const isEmptyValue = (val) => {
    if (val === null || val === undefined) return true;
    const s = String(val).trim();
    return s === '' || s === '-' || s === '無' || s === '無資料' || s === 'none';
};

export const parseNoteCost = (noteStr) => {
    if (!noteStr) return { cost: '', pureNote: '' };
    const costReg = /(?:\(?預估成本\s*:\s*([\d.]+)\s*元?\.?\)?)/;
    const match = noteStr.match(costReg);
    if (match) {
        const cost = match[1];
        let pureNote = noteStr.replace(costReg, '').trim();
        pureNote = pureNote.replace(/^\s*-\s*$/, '').trim();
        return { cost, pureNote };
    }
    return { cost: '', pureNote: noteStr };
};

export const makeNoteStr = (pureNote, cost) => {
    const trimmedNote = (pureNote || '').trim();
    const trimmedCost = (cost || '').trim();
    if (!trimmedCost) return trimmedNote;
    if (trimmedNote) {
        return `${trimmedNote} (預估成本: ${trimmedCost}元)`;
    } else {
        return `預估成本: ${trimmedCost}元`;
    }
};

export const customFetch = (url, options = {}) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    let targetUrl = (url && url.startsWith('/api')) ? `${baseUrl}${url}` : url;
    
    // 如果是 GET 請求，自動加上防快取時間戳記 (Cache Busting)
    const method = (options.method || 'GET').toUpperCase();
    if (method === 'GET' && targetUrl) {
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl = `${targetUrl}${separator}_t=${Date.now()}`;
    }
    
    // 如果本地有暫存的管理金鑰，自動帶入 Headers
    const adminKey = sessionStorage.getItem('admin_api_key');
    if (adminKey) {
        options.headers = {
            ...options.headers,
            'X-API-KEY': adminKey
        };
    }
    
    return fetch(targetUrl, options).then(res => {
        if (res.status === 401 && sessionStorage.getItem('admin_api_key')) {
            sessionStorage.removeItem('admin_api_key');
            alert('您的管理金鑰已失效，請重新登入！');
            window.location.reload();
        }
        return res;
    });
};

export const formatVIPPhone = (phone) => {
    if (!phone) return '';
    const t = phone.trim();
    return t.length >= 10 ? `(${t.substring(0, 4)}***${t.substring(7)})` : `(${t})`;
};

export const getProductUnit = (name) => {
    if (!name) return '個';
    const t = name.toString();
    return (t.includes('牛腱') || t.includes('牛肚') || t.includes('紅燒肉') || t.includes('克') || t.includes('g') || t.includes('G')) ? '克' : '個';
};

/**
 * 取得商品的中文品名 (防禦性匹配，支援選單查表與靜態 fallbackProductMap)
 */
export const getProductName = (productId, menuList = []) => {
    if (!productId) return '';
    if (productId === 'PROD_DISCOUNT') return '🎁 折扣折抵';
    
    const cleanId = String(productId).trim().toLowerCase();
    
    // 1. 優先在 menuList 尋找
    if (menuList && menuList.length > 0) {
        const menu = menuList.find(m => String(m.productId || m.product_id || '').trim().toLowerCase() === cleanId);
        if (menu && menu.name) return menu.name;
    }
    
    // 2. 靜態 fallbackProductMap (包含預設料號、P系列與真實的 UUID)
    const fallbackProductMap = {
        // 預設 PROD 系列
        'prod_001': '30顆裝韭菜玉米水餃',
        'prod_002': '30顆裝高麗菜玉米水餃',
        'prod_003': '60顆裝韭菜玉米水餃',
        'prod_004': '60顆裝高麗菜玉米水餃',
        'prod_005': '古早味涼拌花生',
        'prod_006': '涼拌爽脆海蜇皮',
        'prod_007': '紅燒肉(滷)',
        'prod_008': '秘製牛腱',

        // 預設 P 系列
        'p1001': '30顆裝韭菜玉米水餃',
        'p1002': '30顆裝高麗菜玉米水餃',
        'p1003': '60顆裝韭菜玉米水餃',
        'p1004': '60顆裝高麗菜玉米水餃',
        'p1005': '古早味涼拌花生',
        'p1006': '涼拌爽脆海蜇皮',
        'p1007': '紅燒肉(滷)',
        'p1008': '秘製牛腱',
        'p2001': '油潑辣子',
        'p2002': '餛飩',
        'p3001': '秘製牛腱',
        'p3002': '醇香牛肚',
        'p4001': '豆干肉燥',
        'p4002': '紅燒牛腩',
        'p4003': '馬鈴薯燉肉',
        'p4004': '麻婆豆腐',
        'p4005': '紅燒肉(滷)',
        'p4006': '薑燒豬肉',
        'p5001': '古早味涼拌花生',
        'p5002': '秘製涼拌雞胗',
        'p5003': '涼拌爽脆海蜇皮',
        'p5004': '清爽涼拌乾絲',
        'p5005': '醬香涼拌素雞',

        // 真實 UUID 系列 (來自 菜單.csv)
        '8377dfaa-9505-46db-94ba-667e5ec0e23f': '30顆裝韭菜玉米水餃',
        '8377dfaa-9505-46db-94ba-557e5ec0e23f': '30顆裝高麗菜玉米水餃',
        '46506e3d-9138-402a-839b-a8bf63c74467': '60顆裝韭菜玉米水餃',
        'c0db14de-0295-4288-8a19-7f705474885f': '60顆裝高麗菜玉米水餃',
        '8377dfaa-9505-46db-94ba-123e5ec0e23f': '油潑辣子',
        '8377dfaa-9505-46db-94ba-456e5ec0e23f': '餛飩',
        '8377dfaa-9505-46db-94ba-332e5ec0e23f': '秘製牛腱',
        '8377dfaa-9505-46db-94ba-147e5ec0e23f': '醇香牛肚',
        '8377dfaa-9505-46db-94ba-543e5ec0e23f': '豆干肉燥',
        '8377dfaa-9505-46db-94ba-333e5ec0e23f': '紅燒牛腩',
        '8377dfaa-9505-46db-94ba-654e5ec0e23f': '馬鈴薯燉肉',
        '8377dfaa-9505-46db-94ba-432e5ec0e23f': '麻婆豆腐',
        '8377dfaa-9505-46db-94ba-447e5ec0e23f': '紅燒肉(滷)',
        '8377dfaa-9505-46db-94ba-321e5ec0e23f': '薑燒豬肉',
        '8377dfaa-9505-46db-94ba-765e5ec0e23f': '秘製涼拌雞胗',
        '8377dfaa-9505-46db-94ba-567e5ec0e23f': '涼拌爽脆海蜇皮',
        '8377dfaa-9505-46db-94ba-345e5ec0e23f': '清爽涼拌乾絲',
        '8377dfaa-9505-46db-94ba-234e5ec0e23f': '醬香涼拌素雞'
    };
    
    return fallbackProductMap[cleanId] || productId;
};


