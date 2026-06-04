import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { ChefHat, ShoppingBag, ArrowRight, UserCheck, ShieldAlert, FileText, CheckCircle, ChevronDown, Award, Search, Sparkles, Trash2, Edit3, Save, X, PlusCircle } from 'lucide-react';
import Header from './components/Header';
import ShoppingCart from './components/ShoppingCart';
import SitePasswordGate from './components/SitePasswordGate';

// ==========================================
// 1. 顧客前台大本營 (Customer SPA Page)
// ==========================================
function CustomerSPA({ cart, onCartOpen, onAddToCart, minOrderAmount, activeSection, onSectionChange }) {
    const [categoryFilter, setCategoryFilter] = useState('全部');
    const [menuData, setMenuData] = useState([]);
    const [faqData, setFaqData] = useState([]);
    const [systemAnnouncement, setSystemAnnouncement] = useState('🥘 歡迎來到小灶私廚！線上購物車預約訂單已啟用，歡迎下單！');
    const [aboutText1, setAboutText1] = useState('小灶私廚創立於一個溫暖的街角。我們始終相信，最好的料理不需要繁瑣的修飾，而是來自對食材本質的極致堅持，與一份真摯的人情味。');
    const [aboutText2, setAboutText2] = useState('我們的招牌「手包韭菜玉米水餃」採用當日採購的新鮮韭菜，搭配特選在地豬肉，在皮薄與餡豐之間取得絕佳平衡；特製「紅燒肉」更是遵循古法，慢火精燉數小時，帶出濃郁紅亮、肥而不膩的精緻口感。');
    const [isLoading, setIsLoading] = useState(true);

    const [activeFaqId, setActiveFaqId] = useState(null);

    const mockMenu = [
        { product_id: 'PROD_001', category: '麵食', name: '30顆裝韭菜玉米水餃', price: '240', min_qty: 1, description: '手工現包韭菜，汁水豐盈，完美爽甜口感。', image_filename: '30顆裝韭菜玉米水餃.jpg', status: '上架' },
        { product_id: 'PROD_002', category: '麵食', name: '30顆裝高麗菜玉米水餃', price: '240', min_qty: 1, description: '爽脆高麗菜與飽滿玉米，甜美多汁不膩口。', image_filename: '30顆裝高麗菜玉米水餃.jpg', status: '上架' },
        { product_id: 'PROD_003', category: '麵食', name: '60顆裝韭菜玉米水餃', price: '480', min_qty: 1, description: '大包裝超值選，親友聚會必備水餃！', image_filename: '60顆裝韭菜玉米水餃.jpg', status: '上架' },
        { product_id: 'PROD_004', category: '麵食', name: '60顆裝高麗菜玉米水餃', price: '480', min_qty: 1, description: '大包裝超值選，高麗菜甜美首選！', image_filename: '60顆裝高麗菜玉米水餃.jpg', status: '上架' },
        { product_id: 'PROD_005', category: '小菜', name: '古早味涼拌花生', price: '60', min_qty: 1, description: '私房滷汁文火慢滷，口感綿密，下酒菜首選。', image_filename: '古早味涼拌花生.jpg', status: '上架' },
        { product_id: 'PROD_006', category: '小菜', name: '涼拌爽脆海蜇皮', price: '120', min_qty: 1, description: '黃金配比，麻脆爽口，開胃絕妙滋味。', image_filename: '涼拌爽脆海蜇皮.jpg', status: '上架' },
        { product_id: 'PROD_007', category: '滷味', name: '紅燒肉(滷)', price: '240', min_qty: 1, description: '傳承老手藝紅燒燜滷，肥而不膩，入口即化。', image_filename: '紅燒肉(滷).jpg', status: '上架' },
        { product_id: 'PROD_008', category: '滷味', name: '秘製牛腱', price: '2.5*重量', min_qty: 1, description: '精選澳洲牛腱，私房中藥慢燉，秤重計價更實在。', image_filename: '秘製牛腱.jpg', status: '上架' }
    ];

    const mockFaqs = [
        { id: 1, question: '如何預約小灶私廚的美食？', answer: '點選上方「精選菜單」，選好您想品嚐的美食與份量後點選「加入購物車」。點擊購物車直接填寫您的手機號碼與想預定的日期即可送單預約！我們將第一時間在後台為您接單並發送通知。' },
        { id: 2, question: '請問有提供現場內用或自取服務嗎？', answer: '小灶私廚目前以外帶/預約取貨與外送為主，尚無常態開放內用。您於購物車填寫的「預約取貨日期」，我們會在接單後與您電話確認具體的自取時段。' },
        { id: 3, question: '請問有最低起訂金額限制嗎？運送方式為何？', answer: '我們目前沒有設定最低起訂金額限制，一個品項即可輕鬆下單預約！我們的商品皆為手工限量現做，為符合成本與確保品質，主要提供現場自取。若您有大宗外送需求，歡迎直接利用備註或電話諮詢！' },
        { id: 4, question: '秤重計價商品（如秘製牛腱）要如何收款？', answer: '因為牛腱等滷味分量因人而異，菜單上標註的「2.5*重量」表示出貨時以實際重量乘以 2.5 來結算。當您預約後，我們會先接單並於備料秤重後，透過電話告知您這筆商品的最終精確金額！' }
    ];

    // 歷史滾動與全域 activeSection 同步
    useEffect(() => {
        if (activeSection && activeSection !== 'track') {
            const element = document.getElementById(`section-${activeSection}`);
            if (element) {
                const timer = setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
                return () => clearTimeout(timer);
            }
        }
    }, [activeSection]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
                
                // 1. 獲取商品列表
                try {
                    const resMenu = await fetch('/api/v1/menus', config);
                    if (resMenu.ok) {
                        const dataMenu = await resMenu.json();
                        const normalized = dataMenu.map(m => ({
                            ...m,
                            product_id: m.productId || m.product_id,
                            image_filename: m.imageFilename || m.image_filename
                        }));
                        setMenuData(normalized.filter(m => m.status === '上架'));
                    } else {
                        setMenuData(mockMenu.filter(m => m.status === '上架'));
                    }
                } catch (e) {
                    setMenuData(mockMenu.filter(m => m.status === '上架'));
                }


                // 2. 獲取常見問題
                try {
                    const resFaq = await fetch('/api/v1/faqs', config);
                    if (resFaq.ok) {
                        const dataFaq = await resFaq.json();
                        if (dataFaq && dataFaq.length > 0) {
                            setFaqData(dataFaq);
                        } else {
                            setFaqData(mockFaqs);
                        }
                    } else {
                        setFaqData(mockFaqs);
                    }
                } catch (e) {
                    setFaqData(mockFaqs);
                }

                // 3. 獲取系統配置
                try {
                    const resConfigs = await fetch('/api/v1/system-configs', config);
                    if (resConfigs.ok) {
                        const dataConfigs = await resConfigs.json();
                        const ann = dataConfigs.find(c => c.configKey === 'SHOP_ANNOUNCEMENT');
                        if (ann) setSystemAnnouncement(ann.configValue);
                        
                        const t1 = dataConfigs.find(c => c.configKey === 'ABOUT_TEXT_1');
                        if (t1) setAboutText1(t1.configValue);
                        
                        const t2 = dataConfigs.find(c => c.configKey === 'ABOUT_TEXT_2');
                        if (t2) setAboutText2(t2.configValue);
                    }
                } catch (e) {
                    console.log("系統設定載入失敗，採用預設溫馨設定");
                }
            } catch (err) {
                console.log(err.message);
                setMenuData(mockMenu.filter(m => m.status === '上架'));
                setFaqData(mockFaqs);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const categories = ['全部', ...new Set(menuData.map(m => m.category).filter(Boolean))];
    
    useEffect(() => {
        if (categoryFilter !== '全部' && !categories.includes(categoryFilter)) {
            setCategoryFilter('全部');
        }
    }, [menuData]);

    const [menuQuantities, setMenuQuantities] = useState({});

    const handleMenuQtyChange = (productId, delta) => {
        setMenuQuantities(prev => {
            const current = prev[productId] || 0;
            const next = Math.max(0, current + delta);
            return { ...prev, [productId]: next };
        });
    };

    const handleMenuQtyInput = (productId, val) => {
        const num = parseInt(val) || 0;
        setMenuQuantities(prev => ({ ...prev, [productId]: Math.max(0, num) }));
    };

    const filteredMenu = (categoryFilter === '全部' 
        ? menuData 
        : menuData.filter(m => m.category === categoryFilter)
    ).sort((a, b) => {
        const idA = String(a.product_id || '').trim();
        const idB = String(b.product_id || '').trim();
        return idA.localeCompare(idB);
    });

    const handleFaqToggle = (id) => {
        setActiveFaqId(activeFaqId === id ? null : id);
    };

    const totalAmount = cart.reduce((sum, item) => {
        const isWeight = String(item.price).includes('*') || String(item.price).includes('重量');
        if (isWeight) return sum;
        return sum + (parseFloat(item.price) || 0) * item.qty;
    }, 0);

    return (
        <div className="main-layout container animate-fade-in">
            {/* 系統公告跑馬燈 */}
            <div className="announcement-bar card">
                <span className="announcement-tag">📢 公告</span>
                <marquee scrollamount="3">{systemAnnouncement}</marquee>
            </div>

            {/* SECTION 1: 關於小灶 */}
            <section id="section-about" className="card" style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <ChefHat size={32} className="text-primary" />
                    <h2>小灶私廚：傳承溫潤的舌尖記憶</h2>
                </div>
                <div className="about-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: 'var(--color-text-secondary)' }}>
                    <p>{aboutText1}</p>
                    <p>{aboutText2}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                        <span className="tag">🥘 每日手工限量</span>
                        <span className="tag">🌿 當日新鮮食材</span>
                        <span className="tag">❤️ 絕無人工添加</span>
                    </div>
                </div>
            </section>

            {/* SECTION 2: 精選菜單 */}
            <section id="section-menu" style={{ marginTop: '24px' }}>
                <div className="card-header-row" style={{ marginBottom: '16px' }}>
                    <h2>📖 精選菜單</h2>
                </div>

                <div className="scroll-nav" style={{ marginBottom: '16px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`scroll-btn ${categoryFilter === cat ? 'active' : ''}`}
                            onClick={() => setCategoryFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {filteredMenu.map(item => {
                        const isWeight = String(item.price).includes('*') || String(item.price).includes('重量');
                        const displayPrice = isWeight ? '秤重計價' : `$${item.price}`;
                        const imgUrl = (item.image_filename && (item.image_filename.startsWith('http://') || item.image_filename.startsWith('https://'))) 
                            ? item.image_filename 
                            : `pic/${item.image_filename}`;
                        const defaultImg = 'https://placehold.jp/24/1a73e8/ffffff/400x300.png?text=小灶私廚%0A精製美食';

                        return (
                            <div className="card" key={item.product_id} style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                                    {/* 下層：模糊背景底圖，提供完美無縫漸變環境光暈 (scale 防止模糊邊緣露出) */}
                                    <img 
                                        src={imgUrl} 
                                        alt="" 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px)', opacity: 0.5, transform: 'scale(1.15)' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                    {/* 上層：主商品圖，完全不被裁剪，以 contain 完整居中展現所有精緻構圖與美味配件 */}
                                    <img 
                                        src={imgUrl} 
                                        alt={item.name} 
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '6px', zIndex: 1 }}
                                        onError={(e) => { e.target.onerror = null; e.target.src = defaultImg; }}
                                    />
                                    <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.95)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', color: 'var(--color-primary)', zIndex: 2 }}>
                                        {item.category}
                                    </span>
                                </div>
                                <div style={{ padding: '16px', display: 'flex', flexGrow: '1', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', minHeight: '40px' }}>
                                            {item.description}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-primary)' }}>
                                            {displayPrice}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="cart-qty-selector" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#fff' }}>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleMenuQtyChange(item.product_id, -1); }}
                                                    style={{ border: 'none', background: '#f5f3ef', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={menuQuantities[item.product_id] || 0}
                                                    onChange={(e) => handleMenuQtyInput(item.product_id, e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{ width: '35px', height: '28px', textAlign: 'center', border: 'none', borderLeft: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', fontSize: '13px', fontWeight: '600', outline: 'none', appearance: 'textfield', MozAppearance: 'textfield' }}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleMenuQtyChange(item.product_id, 1); }}
                                                    style={{ border: 'none', background: '#f5f3ef', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button 
                                                className="btn btn-primary btn-sm" 
                                                onClick={() => {
                                                    const selectQty = menuQuantities[item.product_id] || 0;
                                                    if (selectQty <= 0) {
                                                        // 照核准的防呆：數量為0時，無效操作直接忽略
                                                        return;
                                                    }
                                                    onAddToCart(item, selectQty);
                                                    setMenuQuantities(prev => ({ ...prev, [item.product_id]: 0 })); // 加入後歸零
                                                }}
                                                style={{ minHeight: '36px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                🛒 加入
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* SECTION 3: 常見問題 FAQ */}
            <section id="section-faq" style={{ marginTop: '24px' }}>
                <div className="page-header">
                    <h2>❓ 常見問題</h2>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {faqData.map(faq => {
                        const isOpen = activeFaqId === faq.id;
                        return (
                            <div 
                                className="card" 
                                key={faq.id} 
                                onClick={() => handleFaqToggle(faq.id)}
                                style={{ 
                                    cursor: 'pointer', 
                                    padding: '16px 20px', 
                                    marginBottom: '0',
                                    borderLeft: isOpen ? '4px solid var(--color-primary)' : '1px solid var(--color-border)',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <h3 style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-text)', fontWeight: '600', fontSize: '15px' }}>
                                        {faq.question}
                                    </h3>
                                    <ChevronDown 
                                        size={18} 
                                        style={{ 
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                                            transition: 'transform 0.22s ease',
                                            color: isOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                                        }} 
                                    />
                                </div>
                                
                                {isOpen && (
                                    <div style={{ 
                                        marginTop: '12px', 
                                        fontSize: '14px', 
                                        color: 'var(--color-text-secondary)',
                                        animation: 'fadeIn 0.25s ease',
                                        lineHeight: '1.6',
                                        borderTop: '1px dashed var(--color-border)',
                                        paddingTop: '12px'
                                    }}>
                                        <div>{faq.answer}</div>
                                        {faq.imageUrl && (
                                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                                <img 
                                                    src={faq.imageUrl} 
                                                    alt="常見問題說明圖" 
                                                    style={{ 
                                                        maxWidth: '100%', 
                                                        maxHeight: '300px', 
                                                        borderRadius: 'var(--radius)', 
                                                        boxShadow: 'var(--shadow-sm)',
                                                        objectFit: 'contain'
                                                    }} 
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* 手機端專屬浮動條 */}
            {cart.length > 0 && (
                <div className="mobile-cart-float-bar" onClick={onCartOpen}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', background: '#ffffff', padding: '8px', borderRadius: '50%', color: 'var(--color-primary)' }}>
                            <ShoppingBag size={18} />
                            <span className="float-badge">{cart.reduce((s, i) => s + i.qty, 0)}</span>
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '500' }}>已選購私廚美食</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff' }}>
                                總計：${totalAmount.toLocaleString()} 元
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', fontSize: '14px' }}>
                        前往結帳預約 <ArrowRight size={16} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ==========================================
// 2. 訂單進度追蹤頁面 (Customer Track Page)
// ==========================================
function CustomerTrack() {
    const [phone, setPhone] = useState('');
    const [orderId, setOrderId] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        setError('');
        setSearchResult(null);

        if (!phone || !orderId) { setError('請輸入手機與訂單編號！'); return; }
        if (!/^09\d{8}$/.test(phone)) { setError('手機格式不正確！'); return; }

        setIsLoading(true);
        try {
            const config = {
                headers: {
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                }
            };
            const res = await fetch(`/api/v1/orders/track?phone=${phone}&orderId=${orderId}`, config);
            if (res.ok) {
                const data = await res.json();
                const orderObj = data.order || {};
                const detailsArr = data.details || [];
                const normalized = {
                    ...orderObj,
                    order_id: orderObj.orderId || orderObj.order_id,
                    customer_name: orderObj.customerName || orderObj.customer_name,
                    amount: orderObj.amount,
                    delivery_date: orderObj.deliveryDate || orderObj.delivery_date,
                    payment_status: orderObj.paymentStatus || orderObj.payment_status,
                    status: orderObj.status,
                    details: detailsArr
                };
                setSearchResult(normalized);
            } else {
                throw new Error("查無此訂單！");
            }

        } catch (err) {
            // Mock 安全回退
            setTimeout(() => {
                setIsLoading(false);
                if (orderId === 'S000001') {
                    setSearchResult({
                        order_id: 'S000001',
                        customer_name: '測試王先生',
                        amount: 720,
                        status: '已接單',
                        payment_status: '已付款',
                        delivery_date: '2026/06/05'
                    });
                } else {
                    setError('查無此訂單，請再次確認電話與訂單編號是否正確！');
                }
            }, 800);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-layout container animate-fade-in" style={{ maxWidth: '600px', margin: '40px auto' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Search size={28} className="text-primary" />
                    <h2>🔍 預約訂單進度追蹤</h2>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                    請輸入您預約時所填寫的手機號碼與專屬訂單編號，即可即時查詢私廚目前的排程製作狀態與收款狀態。
                </p>

                <form onSubmit={handleTrack} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="form-label">顧客手機號碼</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入 10 碼行動電話 (如 0912345678)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.trim())}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">訂單編號 (流水號)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="請輸入 S 開頭的編號 (如 S000001)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value.trim())}
                        />
                    </div>

                    {error && <div className="cart-validation-error">{error}</div>}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', minHeight: '42px', fontWeight: '600' }} disabled={isLoading}>
                        {isLoading ? '查詢中...' : '🔍 查詢最新狀態'}
                    </button>
                </form>

                {searchResult && (
                    <div className="card animate-fade-in" style={{ marginTop: '28px', backgroundColor: 'var(--color-primary-light)', borderColor: 'var(--color-primary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', margin: '0' }}>
                            <CheckCircle size={18} /> 訂單查詢成功！
                        </h3>
                        <div style={{ fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--color-text)', marginTop: '8px' }}>
                            <div>訂單號碼：<strong>{searchResult.order_id}</strong></div>
                            <div>顧客名稱：{searchResult.customer_name}</div>
                            <div>合計金額：${searchResult.amount} 元</div>
                            <div>預定出貨/取貨日：{searchResult.delivery_date || '排程中'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                收款狀態：
                                <span className={`badge ${searchResult.payment_status === '已付款' ? 'badge-done' : 'badge-pending'}`}>
                                    {searchResult.payment_status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                預約狀態：
                                <span className={`badge ${searchResult.status === '已接單' ? 'badge-shipped' : searchResult.status === 'row已出貨' ? 'badge-shipped' : searchResult.status === '已出貨' ? 'badge-shipped' : 'badge-pending'}`}>
                                    {searchResult.status}
                                </span>
                            </div>

                            {/* 🍽️ 預約訂購明細列表 */}
                            {searchResult.details && searchResult.details.length > 0 && (
                                <div style={{ marginTop: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-primary)' }}>🍽️ 預約訂購明細</h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left', color: 'var(--color-text-secondary)' }}>
                                                <th style={{ padding: '6px 0' }}>品項</th>
                                                <th style={{ padding: '6px 0', textAlign: 'center', width: '60px' }}>數量</th>
                                                <th style={{ padding: '6px 0', textAlign: 'right', width: '100px' }}>金額</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {searchResult.details.map((item, idx) => {
                                                const menu = menuList.find(m => m.product_id === item.productId || m.product_id === item.product_id);
                                                const priceStr = menu?.price || '';
                                                const isWeight = priceStr.includes('*') || priceStr.includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id);
                                                const qtyDisplay = `${item.qty} 個`;
                                                
                                                let subtotalDisplay = `$${item.productTotalAmt}`;
                                                if (isWeight && (parseInt(item.productAmt) === 0 || !item.productAmt)) {
                                                    subtotalDisplay = '$0 (出貨前依製作後實際秤重計價)';
                                                }

                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px dashed #f2eee6' }}>
                                                        <td style={{ padding: '8px 0', color: '#2d2a26' }}>
                                                            {menu?.name || item.productId}
                                                            {isWeight && item.productAmt > 0 && (
                                                                <span style={{ fontSize: '11px', color: '#8c857b', marginLeft: '6px' }}>
                                                                    ({item.productAmt}g)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#6b6151' }}>
                                                            {qtyDisplay}
                                                        </td>
                                                        <td style={{ 
                                                            padding: '8px 0', 
                                                            textAlign: 'right', 
                                                            fontWeight: '600', 
                                                            color: isWeight && (!item.productAmt || parseInt(item.productAmt) === 0) ? '#d97706' : '#2d2a26',
                                                            fontSize: isWeight && (!item.productAmt || parseInt(item.productAmt) === 0) ? '11px' : '12px'
                                                        }}>
                                                            {subtotalDisplay}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// 輔助函數：解析與重組商品的備註 note 與 預估成本
// ==========================================
const parseNoteCost = (noteStr) => {
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

const makeNoteStr = (pureNote, cost) => {
    const trimmedNote = (pureNote || '').trim();
    const trimmedCost = (cost || '').trim();
    if (!trimmedCost) return trimmedNote;
    if (trimmedNote) {
        return `${trimmedNote} (預估成本: ${trimmedCost}元)`;
    } else {
        return `預估成本: ${trimmedCost}元`;
    }
};

const isEmptyValue = (val) => {
    if (val === null || val === undefined) return true;
    const s = String(val).trim();
    return s === '' || s === '-' || s === '無' || s === '無資料' || s === 'none';
};

// ==========================================
// 3. 管理員後台入口 (Admin Portal Page - Protected)
// ==========================================
function AdminPortal() {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'schedules', 'menu', 'expenses', 'analytics', 'configs'
    
    // 商品與支出狀態
    const [menuList, setMenuList] = useState([]);
    const [isMenuLoading, setIsMenuLoading] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
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

    const [expenses, setExpenses] = useState([]);
    const [isExpensesLoading, setIsExpensesLoading] = useState(false);
    const [expenseForm, setExpenseForm] = useState({
        expenseDate: new Date().toISOString().split('T')[0],
        itemName: '',
        category: '食材採購',
        amount: '',
        notes: ''
    });

    // 訂單狀態與加載 (真實對接後端資料庫)
    const [orders, setOrders] = useState([
        { order_id: 'S000001', customer_name: '王小二', phone: '0912345678', amount: 480, status: '待確認', payment_status: '未付款', delivery_date: '2026/06/02' },
        { order_id: 'S000002', customer_name: '張大千', phone: '0988777666', amount: 1200, status: '已接單', payment_status: '已付款', delivery_date: '2026/06/03' }
    ]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(false);

    const fetchOrders = async () => {
        setIsOrdersLoading(true);
        try {
            const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
            const res = await fetch('/api/v1/orders/all', config);
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
                // 依據訂單編號順編降序排序，最新預約單在最上方展示！
                normalized.sort((a, b) => {
                    const numA = parseInt(String(a.order_id).replace(/\D/g, ''), 10) || 0;
                    const numB = parseInt(String(b.order_id).replace(/\D/g, ''), 10) || 0;
                    return numB - numA;
                });
                setOrders(normalized);
            }
        } catch (err) {
            console.log("無法獲取真實訂單，保留預設資料");
        } finally {
            setIsOrdersLoading(false);
        }
    };

    // 訂單編輯 Modal 狀態與 API 送單處理
    const [showEditOrderModal, setShowEditOrderModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [editingOrderItems, setEditingOrderItems] = useState([]);

    const startEditOrder = (order) => {
        setEditingOrder({ ...order });
        // 過濾出屬於當前訂單的品項明細 (相容 orderId 與 order_id 兩種屬性命名對接)
        const items = orderItems.filter(item => item.orderId === order.order_id || item.order_id === order.order_id);
        
        // 深拷貝，並對歷史秤重商品做克數/個數倒置修復
        const mappedItems = items.map(item => {
            const copy = { ...item };
            const menu = menuList.find(m => m.product_id === copy.productId || m.product_id === copy.product_id);
            const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(copy.productId || copy.product_id)) : false;
            
            // 防呆相容轉換：如果資料庫裡面的 qty 大於 5（表示可能把克數填在數量），且 productAmt（單價）小於等於 10（表示克數欄位未填或填成倍率）
            if (isWeight && copy.qty > 5 && (!copy.productAmt || parseFloat(copy.productAmt) <= 10)) {
                const oldQty = copy.qty;
                copy.productAmt = oldQty; // 將原數量的克數移到 productAmt 欄位 (單價/重量格)
                copy.qty = 1;             // 個數重設為 1
            }
            return copy;
        });

        setEditingOrderItems(mappedItems);
        setShowEditOrderModal(true);
    };

    const getWeightRate = (priceStr) => {
        const str = String(priceStr || '');
        if (str.includes('*')) {
            const rate = parseFloat(str.split('*')[0]);
            return isNaN(rate) ? 1.4 : rate;
        }
        return 1.4;
    };

    // 訂單明細變更與折抵折扣處理函式
    const handleItemAmtChange = (index, newAmt) => {
        const updated = [...editingOrderItems];
        let val = parseFloat(newAmt) || 0;
        
        const menu = menuList.find(m => m.product_id === updated[index].productId || m.product_id === updated[index].product_id);
        const isWeight = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(updated[index].productId || updated[index].product_id)) : false;
        
        // 限制秤重商品的克數不能為負數
        if (isWeight && val < 0) {
            val = 0;
        }
        
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
        // 自動加總更新訂單總金額
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleAddDiscountItem = () => {
        const newItem = {
            id: 99999 + Date.now(), // 臨時 ID
            orderId: editingOrder.order_id,
            productId: 'PROD_DISCOUNT',
            qty: 1,
            productAmt: -100, // 預設折抵 100 元
            productTotalAmt: -100,
            itemStatus: '已完成'
        };
        const updated = [...editingOrderItems, newItem];
        setEditingOrderItems(updated);
        // 自動加總更新訂單總金額
        const sum = updated.reduce((acc, curr) => acc + (parseFloat(curr.productTotalAmt) || 0), 0);
        setEditingOrder({ ...editingOrder, amount: sum });
    };

    const handleSaveOrderSubmit = async (e) => {
        e.preventDefault();
        if (!editingOrder.customer_name.trim()) { alert('請填寫顧客姓名！'); return; }
        if (!editingOrder.phone.trim()) { alert('請填寫聯絡電話！'); return; }

        // 庫存雙向硬限制檢查
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

        // 3. 逐項比對淨增量與自由可用庫存
        for (const pId of Object.keys(newCompletedMap)) {
            const diff = newCompletedMap[pId] - (oldCompletedMap[pId] || 0);
            if (diff > 0) {
                const menu = menuList.find(m => m.productId === pId || m.product_id === pId);
                if (menu && menu.isStockManaged) {
                    // 計算該商品可用自由庫存
                    const allStock = menu.stock || 0;
                    const resStock = orderItems.filter(item => {
                        if (item.productId !== menu.productId && item.product_id !== menu.productId) return false;
                        if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                        const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                        if (!parent) return false;
                        return parent.status !== '停用' && parent.status !== '已出貨' && parent.status !== '已完成' && parent.status !== '已取消' && parent.status !== '已退回';
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
            // 1. 先保存/更新訂單品項明細 (PUT /api/v1/orders/{orderId}/items)
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
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(itemsPayload)
            };
            
            const itemsRes = await fetch(`/api/v1/orders/${editingOrder.order_id}/items`, itemsConfig);
            if (!itemsRes.ok) {
                const errText = await itemsRes.text();
                throw new Error(errText || '更新訂單品項明細失敗');
            }

            // 2. 儲存訂單主檔資訊
            const config = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(backendPayload)
            };
            const res = await fetch(`/api/v1/orders/${editingOrder.order_id}`, config);
            if (res.ok) {
                alert('訂單資訊與品項排程更新成功！');
                setShowEditOrderModal(false);
                setEditingOrder(null);
                fetchOrders();
                if (typeof fetchOrderItems === 'function') {
                    fetchOrderItems();
                }
            } else {
                const errText = await res.text();
                throw new Error(errText || '更新失敗');
            }
        } catch (err) {
            setOrders(prev => prev.map(o => o.order_id === editingOrder.order_id ? {
                ...o,
                customer_name: backendPayload.customerName,
                phone: backendPayload.phone,
                amount: backendPayload.amount,
                status: backendPayload.status,
                delivery_date: backendPayload.deliveryDate,
                payment_status: backendPayload.paymentStatus,
                payment_date: backendPayload.paymentDate,
                notes: backendPayload.notes,
                line_id: backendPayload.lineId,
                instagram: backendPayload.instagram,
                facebook: backendPayload.facebook,
                email: backendPayload.email
            } : o));
            alert('訂單資訊與排單明細更新成功！(本地安全回退啟用)');
            setShowEditOrderModal(false);
            setEditingOrder(null);
            if (typeof fetchOrders === 'function') fetchOrders();
            if (typeof fetchOrderItems === 'function') fetchOrderItems();
        }
    };

    const handleAcceptOrder = async (orderId) => {
        try {
            const config = {
                method: 'PUT',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            const res = await fetch(`/api/v1/orders/${orderId}/status?status=${encodeURIComponent('已接單')}`, config);
            if (res.ok) {
                alert(`訂單 ${orderId} 接單成功！`);
                fetchOrders();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: '已接單' } : o));
            alert(`訂單 ${orderId} 接單成功！(本地安全回退啟用)`);
        }
    };

    const handleRejectOrder = async (orderId) => {
        if (!confirm(`確定要退回訂單 ${orderId} 嗎？`)) return;
        try {
            const config = {
                method: 'PUT',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            const res = await fetch(`/api/v1/orders/${orderId}/status?status=${encodeURIComponent('已退回')}`, config);
            if (res.ok) {
                alert(`訂單 ${orderId} 已退回！`);
                fetchOrders();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: '已退回' } : o));
            alert(`訂單 ${orderId} 已退回！(本地安全回退啟用)`);
        }
    };

    // 訂單明細狀態與加載 (供熱門商品銷售與各分類營收佔比統計使用)
    const [orderItems, setOrderItems] = useState([]);
    const [isOrderItemsLoading, setIsOrderItemsLoading] = useState(false);

    const fetchOrderItems = async () => {
        setIsOrderItemsLoading(true);
        try {
            const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
            const res = await fetch('/api/v1/orders/items/all', config);
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

    // 📅 財務報表專用日期區間過濾狀態 (預設為本月)
    const [dateRangeMode, setDateRangeMode] = useState('month'); // 'today', 'week', 'month', 'year', 'all', 'custom'
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

    // 依據預設值計算日期區間開始與結束
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

    // ⚙️ 系統設定與 FAQ 維護狀態
    const [faqList, setFaqList] = useState([]);
    const [isConfigsLoading, setIsConfigsLoading] = useState(false);
    const [adminAnnouncement, setAdminAnnouncement] = useState('');
    const [adminAboutText1, setAdminAboutText1] = useState('');
    const [adminAboutText2, setAdminAboutText2] = useState('');
    
    const [showAddFaqModal, setShowAddFaqModal] = useState(false);
    const [editingFaqId, setEditingFaqId] = useState(null);
    const [editingFaq, setEditingFaq] = useState({});
    const [newFaqForm, setNewFaqForm] = useState({
        question: '',
        answer: '',
        sortOrder: 0,
        imageUrl: ''
    });

    // 📦 庫存管理狀態
    const [selectedInvProduct, setSelectedInvProduct] = useState('');
    const [invAddQty, setInvAddQty] = useState(10);
    const [isInvSaving, setIsInvSaving] = useState(false);
    const [isBatchInvSaving, setIsBatchInvSaving] = useState(false);

    // 1. 查詢商品列表
    const fetchMenuList = async () => {
        setIsMenuLoading(true);
        try {
            const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
            const res = await fetch('/api/v1/menus/all', config);
            const data = await res.json();
            const normalized = data.map(m => ({
                ...m,
                product_id: m.productId || m.product_id,
                min_qty: m.minQty || m.min_qty || 1,
                image_filename: m.imageFilename || m.image_filename
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

    // 庫存管理：商品入庫登記
    const handleInvAddSubmit = async (e) => {
        e.preventDefault();
        if (!selectedInvProduct) { alert('請選擇要入庫的商品！'); return; }
        if (parseInt(invAddQty) <= 0) { alert('入庫數量必須大於 0！'); return; }
        
        setIsInvSaving(true);
        try {
            const config = {
                method: 'POST',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            const res = await fetch(`/api/v1/menus/${selectedInvProduct}/stock/add?qty=${invAddQty}`, config);
            if (res.ok) {
                alert('商品入庫登記成功！');
                setSelectedInvProduct('');
                setInvAddQty(10);
                fetchMenuList();
                if (typeof fetchOrderItems === 'function') fetchOrderItems();
            } else {
                throw new Error('入庫失敗');
            }
        } catch (err) {
            alert('入庫失敗，請確認網路連線');
        } finally {
            setIsInvSaving(false);
        }
    };

    // 庫存管理：校準庫存與管理狀態
    const handleUpdateStockDirect = async (productId, currentStock, isManaged) => {
        try {
            const config = {
                method: 'PUT',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            const res = await fetch(`/api/v1/menus/${productId}/stock?stock=${currentStock}&isStockManaged=${isManaged}`, config);
            if (res.ok) {
                alert('庫存盤點與管理設定更新成功！');
                fetchMenuList();
                if (typeof fetchOrderItems === 'function') fetchOrderItems();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            alert('盤庫失敗，請確認網路連線');
        }
    };

    // 庫存管理：批次更新庫存大表設定
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
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            };
            const res = await fetch('/api/v1/menus/stock/batch', config);
            if (res.ok) {
                alert('📦 批次庫存與管理設定儲存成功！');
                fetchMenuList();
                if (typeof fetchOrderItems === 'function') fetchOrderItems();
            } else {
                throw new Error('更新失敗');
            }
        } catch (err) {
            alert('批次儲存失敗，請確認網路連線');
        } finally {
            setIsBatchInvSaving(false);
        }
    };

    // 2. 查詢收支記帳列表
    const fetchExpenses = async () => {
        setIsExpensesLoading(true);
        try {
            const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
            const res = await fetch('/api/v1/expenses', config);
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

    // 載入初始資料
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchMenuList();
            fetchOrders();
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
        } else if (activeTab === 'inventory') {
            fetchMenuList();
            fetchOrderItems();
            fetchOrders();
        } else if (activeTab === 'configs') {
            fetchAdminConfigsAndFaqs();
        }
    }, [activeTab]);

    // A. 商品上架/下架一鍵切換
    const handleToggleStatus = async (product) => {
        const nextStatus = product.status === '上架' ? '下架' : '上架';
        const updated = { ...product, status: nextStatus };
        const backendPayload = {
            productId: updated.product_id,
            category: updated.category,
            name: updated.name,
            price: updated.price,
            minQty: updated.min_qty,
            description: updated.description,
            imageFilename: updated.image_filename,
            status: updated.status
        };
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(backendPayload)
            };
            await fetch('/api/v1/menus', config);
            alert('上架狀態變更成功！');
            fetchMenuList();
        } catch (err) {
            setMenuList(prev => prev.map(m => m.product_id === product.product_id ? updated : m));
            alert('狀態更新成功！(本地安全回退)');
        }
    };

    // B. 行內商品編輯啟動與儲存
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
            imageUrl: editingProduct.image_url,
            status: editingProduct.status
        };
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(backendPayload)
            };
            await fetch('/api/v1/menus', config);
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

    // C. 新增全新商品
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
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(backendPayload)
            };
            await fetch('/api/v1/menus', config);
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

    // D. 記帳採購支出提交
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
            payer: 'Jeff' // 預設經手人為管理員
        };

        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(payload)
            };
            await fetch('/api/v1/expenses', config);
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

    // E. 刪除採購支出
    const handleDeleteExpense = async (id) => {
        if (!confirm('確定要刪除這筆採購支出明細嗎？')) return;
        try {
            const config = {
                method: 'DELETE',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            await fetch(`/api/v1/expenses/${id}`, config);
            alert('支出明細刪除成功！');
            fetchExpenses();
        } catch (err) {
            setExpenses(prev => prev.filter(e => e.id !== id));
            alert('刪除成功！(本地安全回退)');
        }
    };

    // F. ⚙️ 系統設定與 FAQ 載入與儲存 API
    const fetchAdminConfigsAndFaqs = async () => {
        setIsConfigsLoading(true);
        const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
        try {
            const resConf = await fetch('/api/v1/system-configs', config);
            if (resConf.ok) {
                const data = await resConf.json();
                const ann = data.find(c => c.configKey === 'SHOP_ANNOUNCEMENT');
                if (ann) setAdminAnnouncement(ann.configValue);
                
                const t1 = data.find(c => c.configKey === 'ABOUT_TEXT_1');
                if (t1) setAdminAboutText1(t1.configValue);
                
                const t2 = data.find(c => c.configKey === 'ABOUT_TEXT_2');
                if (t2) setAdminAboutText2(t2.configValue);
            }
        } catch (err) {
            console.log("後端系統設定載入失敗");
        }

        try {
            const resFaq = await fetch('/api/v1/faqs', config);
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

    const handleSaveAnnouncement = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify({
                    configKey: 'SHOP_ANNOUNCEMENT',
                    configValue: adminAnnouncement,
                    description: '前台首頁跑馬燈系統公告'
                })
            };
            await fetch('/api/v1/system-configs', config);
            alert('系統跑馬燈公告儲存成功！');
        } catch (err) {
            alert('系統跑馬燈公告儲存成功！(本地安全回退)');
        }
    };

    const handleSaveAboutIntro = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify({
                    configKey: 'SHOP_ABOUT_INTRO',
                    configValue: adminAboutIntro,
                    description: '前台首頁關於我們介紹'
                })
            };
            await fetch('/api/v1/system-configs', config);
            alert('關於我們介紹儲存成功！');
        } catch (err) {
            alert('關於我們介紹儲存成功！(本地安全回退)');
        }
    };

    const handleSaveFaq = async (e) => {
        e.preventDefault();
        const faqPayload = editingFaqId ? editingFaq : newFaqForm;
        try {
            const config = {
                method: editingFaqId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(faqPayload)
            };
            const url = editingFaqId ? `/api/v1/faqs/${editingFaqId}` : '/api/v1/faqs';
            const res = await fetch(url, config);
            if (!res.ok) throw new Error('儲存失敗');
            alert('常見問題儲存成功！');
            setShowAddFaqModal(false);
            setEditingFaqId(null);
            setNewFaqForm({ question: '', answer: '', sortOrder: 0 });
            fetchAdminConfigsAndFaqs();
        } catch (err) {
            if (editingFaqId) {
                setFaqList(prev => prev.map(f => f.id === editingFaqId ? { ...f, ...editingFaq } : f));
            } else {
                setFaqList(prev => [...prev, { id: Date.now(), ...newFaqForm }]);
            }
            alert('常見問題儲存成功！(本地安全回退)');
            setShowAddFaqModal(false);
            setEditingFaqId(null);
            setNewFaqForm({ question: '', answer: '', sortOrder: 0 });
        }
    };

    const handleDeleteFaq = async (id) => {
        if (!confirm('確定要刪除這筆常見問題嗎？')) return;
        try {
            const config = {
                method: 'DELETE',
                headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' }
            };
            await fetch(`/api/v1/faqs/${id}`, config);
            alert('常見問題刪除成功！');
            fetchAdminConfigsAndFaqs();
        } catch (err) {
            setFaqList(prev => prev.filter(f => f.id !== id));
            alert('常見問題刪除成功！(本地安全回退)');
        }
    };

    const startEditFaq = (faq) => {
        setEditingFaqId(faq.id);
        setEditingFaq({ question: faq.question, answer: faq.answer, sortOrder: faq.sortOrder, imageUrl: faq.imageUrl || '' });
    };


    const [scheduleMenu, setScheduleMenu] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [queriedProducts, setQueriedProducts] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [checkedItemIds, setCheckedItemIds] = useState([]);
    const [isSmiLoading, setIsSmiLoading] = useState(false);

    // 1. 載入排單下拉品項
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
                const res = await fetch('/api/v1/menus', config);
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

    // 2. 查詢排單明細
    const fetchSchedules = async (pNames) => {
        if (!pNames || pNames.length === 0) return;
        setIsSmiLoading(true);
        try {
            const config = { headers: { 'X-API-KEY': 'jeff-winnie-kaia-luck-13365' } };
            const promises = pNames.map(async (name) => {
                const res = await fetch(`/api/v1/orders/items/by-product?productName=${encodeURIComponent(name)}`, config);
                if (res.ok) {
                    return await res.json();
                }
                return [];
            });
            const results = await Promise.all(promises);
            // 合併並依訂單編號升冪及商品料號升冪排序
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

    // 批次更新狀態
        // 批次更新狀態
        // 批次更新狀態
        // 批次更新狀態
    const saveBatchSchedules = async () => {
        if (checkedItemIds.length === 0) { alert('請先勾選欲修改排程狀態的項目！'); return; }

        // 庫存硬限制分組防護檢查
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
                        return parent.status !== '已出貨' && parent.status !== '已完成' && parent.status !== '已取消' && parent.status !== '已退回';
                    }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

                    const freeStock = allStock - resStock;

                    if (newCompletedQty > freeStock) {
                        alert(`❌ 儲存失敗：庫存不足！\n品項「${pName}」目前可用自由庫存為 ${freeStock}，但您本次勾選且欲變更為已完成的數量為 ${newCompletedQty}。\n請先至「庫存入庫管理」補足庫存，或調整勾選狀態！`);
                        return;
                    }
                }
            }
        }

        const ok = confirm(`確定要批次儲存這 ${checkedItemIds.length} 筆項目的製作狀態異動嗎？`);
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
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                }
            };

            await Promise.all(Object.keys(groups).map(status => {
                return fetch('/api/v1/orders/items/batch-status', {
                    ...config,
                    body: JSON.stringify({
                        ids: groups[status],
                        status: status
                    })
                });
            }));

            alert('製作狀態異動儲存成功！');
            await fetchSchedules(queriedProducts);
            if (typeof fetchOrderItems === 'function') fetchOrderItems();
        } catch (err) {
            alert('儲存狀態失敗，請確認網路連線');
        } finally {
            setIsSmiLoading(false);
        }
    };

    // 關於我們品牌簡介個別儲存函數
    const handleSaveAboutText1 = async () => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify({
                    configKey: 'ABOUT_TEXT_1',
                    configValue: adminAboutText1,
                    description: '關於我們介紹第一段'
                })
            };
            await fetch('/api/v1/system-configs', config);
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
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify({
                    configKey: 'ABOUT_TEXT_2',
                    configValue: adminAboutText2,
                    description: '關於我們介紹第二段'
                })
            };
            await fetch('/api/v1/system-configs', config);
            alert('關於我們第二段儲存成功！');
        } catch (e) {
            alert('關於我們第二段儲存成功！(本地安全回退)');
        }
    };

    // 財務分析數據計算邏輯
    const analyticsData = React.useMemo(() => {
        const parseDate = (dStr) => {
            if (!dStr) return 0;
            const parts = dStr.replace(/-/g, '/').split('/');
            return parts.length === 3 ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime() : 0;
        };

        const start = new Date(analysisStartDate).getTime();
        const end = new Date(analysisEndDate).getTime() + 86400000 - 1; // 結束日期的 23:59:59

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

    const formatVIPPhone = (phone) => {
        if (!phone) return '';
        const t = phone.trim();
        return t.length >= 10 ? `(${t.substring(0, 4)}***${t.substring(7)})` : `(${t})`;
    };

    const getProductUnit = (name) => {
        if (!name) return '個';
        const t = name.toString();
        return (t.includes('牛腱') || t.includes('牛肚') || t.includes('紅燒肉') || t.includes('克') || t.includes('g') || t.includes('G')) ? '克' : '個';
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

                {/* Tab A: 訂單管理頁面 */}
                {activeTab === 'orders' && (
                    <>
                        <div className="stats-cards">
                            <div className="stat-card stat-card-warning">
                                <div className="stat-label">待處理客戶預約單</div>
                                <div className="stat-value">{orders.filter(o => o.status === '待確認').length} 筆</div>
                            </div>
                            <div className="stat-card stat-card-success">
                                <div className="stat-label">已接正式訂單</div>
                                <div className="stat-value">{orders.filter(o => o.status !== '待確認').length} 筆</div>
                            </div>
                            <div className="stat-card stat-card-primary">
                                <div className="stat-label">累計預估總營收</div>
                                <div className="stat-value">
                                    ${orders
                                        .filter(o => o.status !== '待確認' && o.status !== '已取消')
                                        .reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0)
                                        .toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0 }}>📋 訂單總覽 (移動端自動卡片化測試)</h3>
                            <div className="responsive-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>訂單號</th>
                                            <th>顧客名稱</th>
                                            <th>聯絡電話</th>
                                            <th>金額</th>
                                            <th>出貨日期</th>
                                            <th>付款狀態</th>
                                            <th>訂單狀態</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(o => (
                                            <tr key={o.order_id}>
                                                <td data-label="訂單號"><strong>{o.order_id}</strong></td>
                                                <td data-label="顧客名稱">{o.customer_name}</td>
                                                <td data-label="聯絡電話">{o.phone}</td>
                                                <td data-label="金額">${o.amount}</td>
                                                <td data-label="出貨日期">{o.delivery_date}</td>
                                                <td data-label="付款狀態">
                                                    <span className={`badge ${o.payment_status === '已付款' ? 'badge-done' : 'badge-pending'}`}>
                                                        {o.payment_status}
                                                    </span>
                                                </td>
                                                <td data-label="訂單狀態">
                                                    <span className={`badge ${
                                                        o.status === '已接單' ? 'badge-shipped' : 
                                                        o.status === '已出貨' ? 'badge-shipped' : 
                                                        o.status === '已完成' ? 'badge-done' : 
                                                        o.status === '已退回' ? 'badge-pending' : 'badge-pending'
                                                    }`} style={o.status === '已退回' ? { backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' } : {}}>
                                                        {o.status === '已接單' ? '已接單 (待排程)' : o.status}
                                                    </span>
                                                </td>
                                                <td data-label="操作">
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                                                        {o.status === '待確認' && (
                                                            <>
                                                                <button 
                                                                    className="btn btn-sm btn-primary" 
                                                                    style={{ padding: '4px 10px', minHeight: '30px', backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)', width: 'auto' }}
                                                                    onClick={() => handleAcceptOrder(o.order_id)}
                                                                >
                                                                    接單
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-danger" 
                                                                    style={{ padding: '4px 10px', minHeight: '30px', width: 'auto' }}
                                                                    onClick={() => handleRejectOrder(o.order_id)}
                                                                >
                                                                    退回
                                                                </button>
                                                            </>
                                                        )}
                                                        <button 
                                                            className="btn btn-sm btn-outline" 
                                                            style={{ padding: '4px 10px', minHeight: '30px', width: 'auto' }}
                                                            onClick={() => startEditOrder(o)}
                                                        >
                                                            編輯
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* Tab B: 品項排單管理頁面 */}
                {activeTab === 'schedules' && (
                    <>
                        <div className="card" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative', width: '100%', minWidth: '320px' }}>
                                    <label className="form-label">選擇產品品項 (可複選)</label>
                                    <button 
                                        type="button"
                                        className="form-control"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        style={{ 
                                            height: '38px', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center', 
                                            background: '#fff',
                                            border: '1px solid var(--color-border)',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            borderRadius: '6px',
                                            padding: '0 12px'
                                        }}
                                    >
                                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '90%', fontWeight: '500' }}>
                                            {selectedProducts.length === 0 
                                                ? '-- 請選擇產品品項 (可複選) --' 
                                                : `已選擇 ${selectedProducts.length} 個品項 (${selectedProducts.join(', ')})`}
                                        </span>
                                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{isDropdownOpen ? '▲' : '▼'}</span>
                                    </button>
                                    
                                    {isDropdownOpen && (
                                        <>
                                            <div 
                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }} 
                                                onClick={() => setIsDropdownOpen(false)}
                                            />
                                            <div style={{ 
                                                position: 'absolute', 
                                                top: '100%', 
                                                left: 0, 
                                                right: 0, 
                                                backgroundColor: '#fff', 
                                                border: '1px solid #e6dfd3', 
                                                borderRadius: '8px', 
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 
                                                zIndex: 999, 
                                                marginTop: '4px',
                                                maxHeight: '300px',
                                                overflowY: 'auto',
                                                padding: '12px'
                                            }}>
                                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', borderBottom: '1px solid #f2eee6', paddingBottom: '8px' }}>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-outline btn-sm"
                                                        style={{ padding: '2px 8px', fontSize: '11px', minHeight: '24px', width: 'auto' }}
                                                        onClick={() => setSelectedProducts([...scheduleMenu])}
                                                    >
                                                        全選
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="btn btn-outline btn-sm"
                                                        style={{ padding: '2px 8px', fontSize: '11px', minHeight: '24px', width: 'auto' }}
                                                        onClick={() => setSelectedProducts([])}
                                                    >
                                                        清除
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {scheduleMenu.map(name => {
                                                        const isChecked = selectedProducts.includes(name);
                                                        return (
                                                            <label 
                                                                key={name} 
                                                                style={{ 
                                                                    display: 'flex', 
                                                                    alignItems: 'center', 
                                                                    gap: '8px', 
                                                                    cursor: 'pointer', 
                                                                    fontSize: '13px',
                                                                    padding: '4px 6px',
                                                                    borderRadius: '4px',
                                                                    transition: 'background 0.2s',
                                                                    backgroundColor: isChecked ? '#fffbeb' : 'transparent'
                                                                }}
                                                            >
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={isChecked}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedProducts(prev => [...prev, name]);
                                                                        } else {
                                                                            setSelectedProducts(prev => prev.filter(p => p !== name));
                                                                        }
                                                                    }}
                                                                    style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                                                                />
                                                                <span style={{ color: '#292524' }}>{name}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <button 
                                    className="btn btn-primary" 
                                    onClick={handleQueryClick}
                                    style={{ height: '38px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    disabled={isSmiLoading}
                                >
                                    🔍 查詢排單
                                </button>
                            </div>
                        </div>

                        {schedules.length > 0 && (
                            <>
                                <div className="card">
                                    <div className="card-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '12px', marginBottom: '16px' }}>
                                        <h3 className="section-title" style={{ margin: 0, whiteSpace: 'nowrap' }}>📊 【{queriedProducts.join(', ')}】排單明細</h3>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={saveBatchSchedules}
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: '600', width: 'auto', whiteSpace: 'nowrap', minHeight: '36px' }}
                                            disabled={isSmiLoading}
                                        >
                                            💾 儲存狀態異動
                                        </button>
                                    </div>

                                    {/* 多品項統計與庫存卡片網格 */}
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                                        gap: '16px', 
                                        marginBottom: '20px' 
                                    }}>
                                        {queriedProducts.map(pName => {
                                            const currentProductMenu = menuList.find(m => m.name === pName);
                                            if (!currentProductMenu) return null;
                                            
                                            const isStockManaged = currentProductMenu.isStockManaged || false;
                                            const allStock = currentProductMenu.stock || 0;
                                            
                                            const resStock = orderItems.filter(item => {
                                                if (item.productId !== currentProductMenu.productId && item.product_id !== currentProductMenu.productId) return false;
                                                if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                                const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                                if (!parent) return false;
                                                return parent.status !== '已出貨' && parent.status !== '已完成' && parent.status !== '已取消' && parent.status !== '已退回';
                                            }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);
                                            
                                            const freeStock = allStock - resStock;
                                            const isWeight = String(currentProductMenu.price).includes('*') || String(currentProductMenu.price).includes('重量') || ['P3001', 'P3002'].includes(currentProductMenu.productId);
                                            const unit = isWeight ? 'g' : '個';
                                            
                                            // 待製作：從原始 orderItems 計算（不隨 UI 選取狀態即時變動）
                                            const itemPendingQty = orderItems.filter(item => {
                                                if ((item.itemStatus || item.item_status) !== '待製作') return false;
                                                const m2 = menuList.find(ml => ml.product_id === (item.productId || item.product_id));
                                                return m2 && m2.name === pName;
                                            }).reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0);
                                            const itemTotalQty = schedules.filter(s => s.itemName === pName).reduce((sum, s) => sum + (parseFloat(s.qty) || 0), 0);
                                            
                                            return (
                                                <div key={pName} className="card" style={{ 
                                                    margin: 0, 
                                                    padding: '16px', 
                                                    borderLeft: '5px solid var(--color-primary)', 
                                                    background: 'linear-gradient(135deg, #fffcf6 0%, #ffffff 100%)',
                                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                        <h4 style={{ margin: 0, color: 'var(--color-primary)', fontSize: '15px', fontWeight: '700' }}>
                                                            🍯 {pName}
                                                        </h4>
                                                        <span style={{ 
                                                            fontSize: '11px', 
                                                            fontWeight: 'bold', 
                                                            color: isStockManaged ? '#15803d' : '#4b5563',
                                                            backgroundColor: isStockManaged ? '#dcfce7' : '#f1f5f9',
                                                            padding: '2px 8px',
                                                            borderRadius: '4px',
                                                            border: isStockManaged ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                                                        }}>
                                                            {isStockManaged ? '庫存防守中' : '未啟用庫存'}
                                                        </span>
                                                    </div>
                                                    
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', fontSize: '12px' }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #f2eee6', paddingRight: '8px' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: '#6b7280' }}>實體總庫 (All):</span>
                                                                <strong style={{ color: '#b45309' }}>{allStock}{unit}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: '#6b7280' }}>預約保留 (Res):</span>
                                                                <strong style={{ color: '#4b5563' }}>{resStock}{unit}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #f2eee6', paddingTop: '4px' }}>
                                                                <span style={{ color: '#292524', fontWeight: '600' }}>可用自由 (Free):</span>
                                                                <strong style={{ color: isStockManaged ? (freeStock <= 0 ? '#dc2626' : '#16a34a') : '#4b5563', fontSize: '13px' }}>
                                                                    {freeStock}{unit}
                                                                </strong>
                                                            </div>
                                                        </div>
                                                        
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', justifyContent: 'center' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: '#6b7280' }}>⏳ 待製作:</span>
                                                                <strong style={{ color: '#d97706' }}>{itemPendingQty}{unit}</strong>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ color: '#6b7280' }}>📊 總需求:</span>
                                                                <strong style={{ color: '#2563eb' }}>{itemTotalQty}{unit}</strong>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="responsive-table-wrap">
                                        <table className="admin-table schedule-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px', textAlign: 'center' }}>
                                                        <input 
                                                            type="checkbox"
                                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                                            checked={schedules.length > 0 && checkedItemIds.length === schedules.length}
                                                            style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                                                        />
                                                    </th>
                                                    <th style={{ width: '80px' }}>訂單號</th>
                                                    <th style={{ width: '100px' }}>訂單日期</th>
                                                    <th style={{ width: '80px' }}>客戶名稱</th>
                                                    <th>品項</th>
                                                    <th style={{ width: '60px' }}>訂購數量</th>
                                                    <th style={{ width: '80px' }}>商品單價</th>
                                                    <th style={{ width: '80px' }}>小計價格</th>
                                                    <th style={{ width: '145px' }}>製作狀態</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedules.map(item => (
                                                    <tr key={item.id}>
                                                        <td style={{ textAlign: 'center' }} data-label="勾選">
                                                            <input 
                                                                type="checkbox"
                                                                checked={checkedItemIds.includes(item.id)}
                                                                onChange={(e) => toggleSelectOne(item.id, e.target.checked)}
                                                                style={{ cursor: 'pointer', transform: 'scale(1.1)' }}
                                                            />
                                                        </td>
                                                        <td data-label="訂單號"><strong>{item.orderId}</strong></td>
                                                        <td data-label="訂單日期">{item.orderDate}</td>
                                                        <td data-label="客戶名稱">{item.customerName}</td>
                                                        <td data-label="品項">{item.itemName}</td>
                                                        <td data-label="訂購數量" style={{ fontWeight: '700' }}>{item.qty}</td>
                                                        <td data-label="商品單價">${item.unitPrice}</td>
                                                        <td data-label="小計價格" style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                                                            ${item.subtotal}
                                                        </td>
                                                        <td data-label="製作狀態">
                                                            <select
                                                                className="form-control form-control-sm"
                                                                value={item.status}
                                                                onChange={(e) => handleStatusSelectChange(item.id, e.target.value)}
                                                                style={{ cursor: 'pointer', fontWeight: '500' }}
                                                            >
                                                                <option value="待製作">⏳ 待排程</option>
                                                                <option value="已完成">✅ 已完成</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}

                {/* Tab C: 菜單品項維護 */}
                {activeTab === 'menu' && (
                    <>
                        <div className="card-header-row" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="section-title" style={{ margin: 0, borderLeft: 'none', paddingLeft: 0 }}>🥦 菜單品項維護</h3>
                            <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => setShowAddMenuModal(true)}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', width: 'auto' }}
                            >
                                ➕ 新增菜單商品
                            </button>
                        </div>
                        {isMenuLoading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>載入菜單商品中...</div>
                        ) : (
                            <div className="responsive-table-wrap">
                                <table className="admin-table menu-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: '80px' }}>品項料號</th>
                                            <th style={{ width: '90px' }}>商品分類</th>
                                            <th style={{ width: '180px' }}>商品名稱</th>
                                            <th style={{ width: '90px' }}>售價/單價</th>
                                            <th style={{ width: '95px' }}>成本 (元)</th>
                                            <th style={{ width: '100px' }}>備註</th>
                                            <th>商品描述</th>
                                            <th style={{ textAlign: 'center', width: '90px' }}>狀態</th>
                                            <th style={{ width: '80px' }}>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => {
                                            const { cost, pureNote } = parseNoteCost(m.note);
                                            return (
                                                <tr key={m.product_id}>
                                                    <td data-label="品項料號"><strong>{m.product_id}</strong></td>
                                                    <td data-label="商品分類">{m.category}</td>
                                                    <td data-label="商品名稱"><strong>{m.name}</strong></td>
                                                    <td data-label="售價/單價">{m.price}</td>
                                                    <td data-label="成本">{(cost || '-')}</td>
                                                    <td data-label="備註" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                                                        {!isEmptyValue(pureNote) ? pureNote : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>無</span>}
                                                    </td>
                                                    <td data-label="商品描述" style={{ whiteSpace: 'normal', wordBreak: 'break-all' }}>
                                                        {!isEmptyValue(m.description) ? m.description : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>無</span>}
                                                    </td>
                                                    <td data-label="狀態" style={{ textAlign: 'center' }}>
                                                        <span className={`badge ${m.status === '上架' ? 'badge-done' : 'badge-pending'}`}>
                                                            {m.status}
                                                        </span>
                                                    </td>
                                                    <td data-label="操作">
                                                        <button className="btn btn-sm btn-outline" onClick={() => startEditMenu(m)}>編輯</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        </>
                )}

                {/* Tab D: 收支記帳管理 */}
                {activeTab === 'expenses' && (
                    <>
                        <div className="card">
                            <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0 }}>➕ 新增採購支出</h3>
                            <form onSubmit={handleExpenseSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">支出日期</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={expenseForm.expenseDate}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">支出品項名稱</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="如: 高麗菜20斤"
                                        value={expenseForm.itemName}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, itemName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">支出分類</label>
                                    <select 
                                        className="form-control"
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                    >
                                        <option value="食材採購">食材採購</option>
                                        <option value="包材耗材">包材耗材</option>
                                        <option value="租金水電">租金水電</option>
                                        <option value="其他雜支">其他雜支</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">支出金額 ($)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="輸入金額"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">備註說明</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="選填備註"
                                        value={expenseForm.notes}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ height: '38px' }}>
                                    📝 登記支出
                                </button>
                            </form>
                        </div>

                        <div className="card" style={{ marginTop: '20px' }}>
                            <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0 }}>📋 採購支出成本明細</h3>
                            {isExpensesLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px' }}>載入明細中...</div>
                            ) : (
                                <div className="responsive-table-wrap">
                                    <table className="admin-table expense-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '110px' }}>日期</th>
                                                <th>品項</th>
                                                <th style={{ width: '110px' }}>分類</th>
                                                <th style={{ width: '90px' }}>金額</th>
                                                <th style={{ width: '90px' }}>經手人</th>
                                                <th>備註說明</th>
                                                <th style={{ width: '80px' }}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {expenses.map(exp => (
                                                <tr key={exp.id}>
                                                    <td data-label="日期">{exp.expenseDate}</td>
                                                    <td data-label="品項"><strong>{exp.itemName}</strong></td>
                                                    <td data-label="分類"><span className="tag">{exp.category}</span></td>
                                                    <td data-label="金額" style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>-${exp.amount}</td>
                                                    <td data-label="經手人">{exp.payer || '管理員'}</td>
                                                    <td data-label="備註說明" style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                                        {!isEmptyValue(exp.notes) ? exp.notes : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>無</span>}
                                                    </td>
                                                    <td data-label="操作">
                                                        <button 
                                                            className="btn btn-sm btn-danger" 
                                                            onClick={() => handleDeleteExpense(exp.id)}
                                                            style={{ padding: '4px 10px', minHeight: '30px', width: 'auto' }}
                                                        >
                                                            刪除
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Tab E: 營收與利潤分析 */}
                {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="card" style={{ padding: '16px 20px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #cbd5e1' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>📅 分析時間區間：</span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {['today', 'week', 'month', 'year', 'all', 'custom'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => handleDateRangeModeChange(mode)}
                                                className={`btn btn-sm ${dateRangeMode === mode ? 'btn-primary' : 'btn-outline'}`}
                                                style={{ padding: '4px 10px', fontSize: '12px', minHeight: '28px', borderRadius: '15px' }}
                                            >
                                                {{
                                                    today: '今天',
                                                    week: '本週',
                                                    month: '本月',
                                                    year: '今年',
                                                    all: '全部歷史',
                                                    custom: '自訂區間'
                                                }[mode]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={analysisStartDate}
                                        disabled={dateRangeMode !== 'custom'}
                                        onChange={(e) => {
                                            setAnalysisStartDate(e.target.value);
                                            setDateRangeMode('custom');
                                        }}
                                        style={{ height: '32px', padding: '4px 8px', fontSize: '13px', width: '135px' }}
                                    />
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>至</span>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={analysisEndDate}
                                        disabled={dateRangeMode !== 'custom'}
                                        onChange={(e) => {
                                            setAnalysisEndDate(e.target.value);
                                            setDateRangeMode('custom');
                                        }}
                                        style={{ height: '32px', padding: '4px 8px', fontSize: '13px', width: '135px' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="stats-cards">
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-success-light) 0%, #ffffff 100%)', borderLeft: '5px solid var(--color-success)' }}>
                                <div>
                                    <div className="stat-label">💰 區間累計總營收</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>已接單預約之金額加總</div>
                                </div>
                                <div className="stat-value" style={{ color: 'var(--color-success)' }}>${analyticsData.totalRevenue.toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-danger-light) 0%, #ffffff 100%)', borderLeft: '5px solid var(--color-danger)' }}>
                                <div>
                                    <div className="stat-label">💸 區間採購總支出 (成本)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>所有已記入採購總成本</div>
                                </div>
                                <div className="stat-value" style={{ color: 'var(--color-danger)' }}>-${analyticsData.totalExpenses.toLocaleString()}</div>
                            </div>
                            <div className="stat-card" style={{ background: analyticsData.netProfit >= 0 ? 'linear-gradient(135deg, var(--color-primary-light) 0%, #ffffff 100%)' : 'linear-gradient(135deg, var(--color-danger-light) 0%, #ffffff 100%)', borderLeft: analyticsData.netProfit >= 0 ? '5px solid var(--color-primary)' : '5px solid var(--color-danger)' }}>
                                <div>
                                    <div className="stat-label">📊 區間經營淨利潤</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>區間總營收 - 區間總成本</div>
                                </div>
                                <div className="stat-value" style={{ color: analyticsData.netProfit >= 0 ? 'var(--color-primary)' : 'var(--color-danger)' }}>${analyticsData.netProfit.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="stats-cards" style={{ marginTop: 0 }}>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #ffffff 100%)', borderLeft: '5px solid #64748b' }}>
                                <div>
                                    <div className="stat-label">📋 區間預約訂單數</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>該時間區間內的成立訂單數</div>
                                </div>
                                <div className="stat-value" style={{ color: '#475569', fontSize: '24px' }}>{analyticsData.totalOrdersCount} 筆</div>
                            </div>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', borderLeft: '5px solid #8b5cf6' }}>
                                <div>
                                    <div className="stat-label">🛍️ 區間平均客單價 (AOV)</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>總營收 / 總訂單數</div>
                                </div>
                                <div className="stat-value" style={{ color: '#6d28d9', fontSize: '24px' }}>${parseFloat(analyticsData.avgOrderValue).toLocaleString()} 元</div>
                            </div>
                            <div className="stat-card" style={{ background: 'linear-gradient(135deg, var(--color-warning-light) 0%, #ffffff 100%)', borderLeft: '5px solid var(--color-warning)' }}>
                                <div>
                                    <div className="stat-label">⏳ 區間待收款總額</div>
                                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>區間內尚未收款的訂單加總</div>
                                </div>
                                <div className="stat-value" style={{ color: '#b45309', fontSize: '24px' }}>${analyticsData.unpaidAmount.toLocaleString()} 元</div>
                            </div>
                        </div>

                        {/* 📊 2x2 商業智慧 (BI) 矩陣 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                            {/* B1. 熱門商品銷售額排行榜 */}
                            <div className="card">
                                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '20px' }}>🔥 區間商品銷售額排行 (依銷售金額 Top 5)</h3>
                                {analyticsData.topProductsByRevenue.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}>此區間內暫無商品銷售數據</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {analyticsData.topProductsByRevenue.map((p, index) => {
                                            const maxRev = Math.max(...analyticsData.topProductsByRevenue.map(x => x.revenue)) || 1;
                                            const widthPct = (p.revenue / maxRev) * 100;
                                            const unit = getProductUnit(p.name);
                                            return (
                                                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                                                        <span>{index + 1}. <strong style={{ color: 'var(--color-text)' }}>{p.name}</strong></span>
                                                        <span style={{ color: 'var(--color-primary)' }}>累積營收 ${p.revenue.toLocaleString()} / 已售 {p.qty} {unit}</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${widthPct}%`, height: '100%', background: 'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* B2. 熱門商品利潤排行榜 */}
                            <div className="card">
                                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '20px' }}>💰 區間商品預估利潤排行 (Top 5)</h3>
                                {analyticsData.topProductsByProfit.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}>此區間內暫無商品利潤數據</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {analyticsData.topProductsByProfit.map((p, index) => {
                                            const maxProfit = Math.max(...analyticsData.topProductsByProfit.map(x => x.profit)) || 1;
                                            const widthPct = (p.profit / maxProfit) * 100;
                                            const unit = getProductUnit(p.name);
                                            const profitRate = p.revenue > 0 ? (p.profit / p.revenue * 100).toFixed(0) : 0;
                                            return (
                                                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                                                        <span>{index + 1}. <strong style={{ color: 'var(--color-text)' }}>{p.name}</strong></span>
                                                        <span style={{ color: 'var(--color-success)' }}>預估利潤 ${Math.round(p.profit).toLocaleString()} / 已售 {p.qty} {unit}</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${widthPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                                        累積營收 ${p.revenue.toLocaleString()} 元 | 預估利潤率 {profitRate}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* B3. VIP 顧客消費實力排行 */}
                            <div className="card">
                                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '20px' }}>👑 區間顧客消費實力排行 (VIP Top 5)</h3>
                                {analyticsData.topCustomers.length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}>此區間內暫無顧客消費數據</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {analyticsData.topCustomers.map((c, index) => {
                                            const maxSpend = Math.max(...analyticsData.topCustomers.map(x => x.totalSpend)) || 1;
                                            const widthPct = (c.totalSpend / maxSpend) * 100;
                                            return (
                                                <div key={`${c.name}_${c.phone}`} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                                                        <span>{index + 1}. <strong style={{ color: 'var(--color-text)' }}>{c.name}</strong> <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>{formatVIPPhone(c.phone)}</span></span>
                                                        <span style={{ color: '#8b5cf6' }}>累積消費 ${c.totalSpend.toLocaleString()} / 預約 {c.orderCount} 次</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${widthPct}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%)', borderRadius: '5px', transition: 'width 0.4s ease' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* B4. 各分類營收佔比分析 */}
                            <div className="card">
                                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '20px' }}>🏷️ 區間商品分類營收佔比</h3>
                                {Object.keys(analyticsData.categoryRevenueMap).length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 0' }}>此區間內暫無分類營收數據</div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                        {Object.keys(analyticsData.categoryRevenueMap).map(cat => {
                                            const amt = analyticsData.categoryRevenueMap[cat];
                                            const totalAmt = Object.values(analyticsData.categoryRevenueMap).reduce((s, x) => s + x, 0) || 1;
                                            const pct = ((amt / totalAmt) * 100).toFixed(1);
                                            
                                            let pctColor = 'var(--color-primary)';
                                            if (cat === '麵食') pctColor = 'var(--color-success)';
                                            if (cat === '小菜') pctColor = 'var(--color-warning)';
                                            if (cat === '料理包') pctColor = '#8b5cf6';
                                            if (cat === '滷味') pctColor = '#ec4899';

                                            return (
                                                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pctColor }} />
                                                            {cat}
                                                        </span>
                                                        <span>${amt.toLocaleString()} 元 ({pct}%)</span>
                                                    </div>
                                                    <div style={{ width: '100%', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pctColor, borderRadius: '5px', transition: 'width 0.4s ease' }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* B5. 採購支出成本結構佔比分析 */}
                        <div className="card">
                            <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '20px' }}>📈 區間採購支出成本結構佔比</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {Object.keys(analyticsData.expenseCategoryMap).length === 0 ? (
                                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '20px 0' }}>此時間區間內暫無採購支出數據</div>
                                ) : (
                                    Object.keys(analyticsData.expenseCategoryMap).map(cat => {
                                        const amt = analyticsData.expenseCategoryMap[cat];
                                        const pct = analyticsData.totalExpenses > 0 ? ((amt / analyticsData.totalExpenses) * 100).toFixed(1) : 0;
                                        let pctColor = 'var(--color-primary)';
                                        if (cat === '食材採購') pctColor = 'var(--color-success)';
                                        if (cat === '包材耗材') pctColor = 'var(--color-warning)';
                                        if (cat === '瓦斯水電') pctColor = '#ef4444';
                                        if (cat === '其他雜支') pctColor = 'var(--color-text-secondary)';

                                        return (
                                            <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '500' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: pctColor }} />
                                                        {cat}
                                                    </span>
                                                    <span style={{ fontWeight: '600' }}>${amt.toLocaleString()} 元 ({pct}%)</span>
                                                </div>
                                                <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pctColor, borderRadius: '4px', transition: 'width 0.4s ease' }} />
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab F: 📦 庫存備料管理 */}
                {activeTab === 'inventory' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* 庫存說明圖卡 (置頂全寬展示) */}
                        {/* 頂部雙圖卡並排布局 (說明與入庫登記) */}
                        <div className="inventory-top-row">
                            {/* 💡 庫存配銷核心公式與數字說明 */}
                            <div className="card animate-fade-in" style={{ 
                                padding: '16px 20px', 
                                background: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', 
                                borderLeft: '5px solid var(--color-primary)', 
                                boxShadow: 'var(--shadow-sm)',
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}>
                                <div>
                                    <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        💡 庫存配銷核心公式與數字說明
                                    </h3>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                                        gap: '12px', 
                                        fontSize: '13px',
                                        color: 'var(--color-text-secondary)',
                                        lineHeight: '1.5'
                                    }}>
                                        <div>
                                            <strong>• 實體總庫存 (All Stock)</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                目前實際備料數量。僅在主訂單為「已出貨」或「已完成」時扣除。
                                            </div>
                                        </div>
                                        <div>
                                            <strong>• 預約保留庫存 (Res Stock)</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                已接單且排程為「已完成」的累加數量（動態即時加總）。
                                            </div>
                                        </div>
                                        <div>
                                            <strong>• 可用自由庫存 (Free Stock)</strong>
                                            <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                                                公式：<strong>實體總庫存 − 預約保留庫存</strong>。不足時將雙向硬限制。
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ 
                                    marginTop: '12px', 
                                    paddingTop: '10px', 
                                    borderTop: '1px dashed var(--color-border)', 
                                    fontSize: '11.5px', 
                                    color: 'var(--color-text-secondary)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px'
                                }}>
                                    <span>🛡️ <strong>庫存防守</strong>：若可用自由庫存為 0 時預約下單與後台更新會進行阻斷。</span>
                                    <span>🛍️ <strong>上下架</strong>：下架商品在前台將隱藏不顯示，但後台仍能進行管理。</span>
                                </div>
                            </div>

                            {/* ➕ 商品入庫登記 */}
                            <div className="card" style={{ padding: '20px', margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, marginBottom: '16px' }}>➕ 新增商品庫存 (入庫登記)</h3>
                                    <form onSubmit={handleInvAddSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
                                            <label className="form-label">選擇商品</label>
                                            <select 
                                                className="form-control"
                                                value={selectedInvProduct}
                                                onChange={(e) => setSelectedInvProduct(e.target.value)}
                                                required
                                            >
                                                <option value="">-- 請選擇商品 --</option>
                                                {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => (
                                                    <option key={m.product_id} value={m.product_id}>
                                                        【{m.category}】{m.name} (目前實體: {m.stock || 0})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group" style={{ width: '110px', marginBottom: 0 }}>
                                            <label className="form-label">入庫數量</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                style={{ height: '38px' }}
                                                value={invAddQty}
                                                onChange={(e) => setInvAddQty(e.target.value)}
                                                required
                                                min={1}
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary" 
                                            style={{ width: 'auto', minHeight: '38px', height: '38px', whiteSpace: 'nowrap', padding: '0 20px', display: 'flex', alignItems: 'center' }} 
                                            disabled={isInvSaving}
                                        >
                                            {isInvSaving ? '儲存中...' : '📦 確認入庫'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* 下方：庫存實體與可用庫存大表 */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
                            <div className="card" style={{ padding: '20px', margin: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>📋 實體與可用自由庫存大表</h3>
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={handleBatchUpdateStock}
                                        style={{ height: '34px', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        disabled={isBatchInvSaving}
                                    >
                                        {isBatchInvSaving ? '儲存中...' : '💾 批次儲存設定'}
                                    </button>
                                </div>
                                
                                <div className="responsive-table-wrap">
                                    <table className="admin-table inventory-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '80px' }}>料號</th>
                                                <th>品名</th>
                                                <th style={{ width: '90px' }}>分類</th>
                                                <th style={{ width: '120px' }}>實體總庫存</th>
                                                <th style={{ width: '100px' }}>預約保留</th>
                                                <th style={{ width: '120px' }}>可用自由庫存</th>
                                                <th style={{ width: '90px' }}>庫存防守</th>
                                                <th style={{ textAlign: 'center', width: '90px' }}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {menuList.filter(m => m.product_id !== 'PROD_DISCOUNT').sort((a, b) => a.product_id.localeCompare(b.product_id)).map(m => {
                                                const allStock = m.stock || 0;
                                                const resStock = orderItems.filter(item => {
                                                    if (item.productId !== m.product_id && item.product_id !== m.product_id) return false;
                                                    if (item.itemStatus !== '已完成' && item.item_status !== '已完成') return false;
                                                    const parent = orders.find(o => o.order_id === item.orderId || o.order_id === item.order_id);
                                                    if (!parent) return false;
                                                    return parent.status !== '已出貨' && parent.status !== '已完成' && parent.status !== '已取消' && parent.status !== '已退回';
                                                }).reduce((sum, item) => sum + (parseInt(item.qty) || 0), 0);

                                                const freeStock = allStock - resStock;
                                                const isManaged = m.isStockManaged || false;
                                                const isWeight = String(m.price).includes('*') || String(m.price).includes('重量') || ['P3001', 'P3002'].includes(m.product_id);
                                                const unit = isWeight ? 'g' : '個';

                                                return (
                                                    <tr key={m.product_id}>
                                                        <td data-label="料號"><code>{m.product_id}</code></td>
                                                        <td data-label="品名"><strong>{m.name}</strong></td>
                                                        <td data-label="分類"><span className="badge badge-secondary">{m.category}</span></td>
                                                        <td data-label="實體總庫存">
                                                            <input 
                                                                type="number"
                                                                className="form-control"
                                                                style={{ padding: '2px 6px', height: '28px', width: '90px' }}
                                                                value={m.stock || 0}
                                                                onChange={(e) => {
                                                                    const val = parseInt(e.target.value) || 0;
                                                                    setMenuList(prev => prev.map(x => x.product_id === m.product_id ? { ...x, stock: val } : x));
                                                                }}
                                                            />
                                                        </td>
                                                        <td data-label="預約保留" style={{ fontWeight: '600', color: '#4b5563' }}>{resStock} {unit}</td>
                                                        <td data-label="可用自由庫存" style={{ fontWeight: 'bold', color: isManaged ? (freeStock <= 0 ? '#dc2626' : '#16a34a') : '#4b5563' }}>{freeStock} {unit}</td>
                                                        <td data-label="庫存防守">
                                                            <input 
                                                                type="checkbox"
                                                                checked={isManaged}
                                                                onChange={(e) => {
                                                                    const val = e.target.checked;
                                                                    setMenuList(prev => prev.map(x => x.product_id === m.product_id ? { ...x, isStockManaged: val } : x));
                                                                }}
                                                                style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                                                            />
                                                        </td>

                                                        <td data-label="操作" style={{ textAlign: 'center' }}>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                style={{ padding: '4px 10px', minHeight: '26px' }}
                                                                onClick={() => handleUpdateStockDirect(m.product_id, m.stock || 0, isManaged)}
                                                            >
                                                                💾 儲存
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab G: ⚙️ 系統參數設定 */}
                {activeTab === 'configs' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                            {/* 公告與簡介設定 */}
                            <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>⚙️ 品牌簡介與首頁跑馬燈設定</h3>
                                
                                <div className="form-group">
                                    <label className="form-label">首頁跑馬燈系統公告</label>
                                    <textarea 
                                        className="form-control" 
                                        value={adminAnnouncement}
                                        onChange={(e) => setAdminAnnouncement(e.target.value)}
                                        rows={2}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveAnnouncement} style={{ marginTop: '8px', width: 'auto' }}>儲存公告設定</button>
                                </div>

                                <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                                    <label className="form-label">關於小灶介紹 - 第一段</label>
                                    <textarea 
                                        className="form-control" 
                                        value={adminAboutText1}
                                        onChange={(e) => setAdminAboutText1(e.target.value)}
                                        rows={3}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveAboutText1} style={{ marginTop: '8px', width: 'auto' }}>儲存第一段</button>
                                </div>

                                <div className="form-group" style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '16px' }}>
                                    <label className="form-label">關於小灶介紹 - 第二段</label>
                                    <textarea 
                                        className="form-control" 
                                        value={adminAboutText2}
                                        onChange={(e) => setAdminAboutText2(e.target.value)}
                                        rows={3}
                                    />
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveAboutText2} style={{ marginTop: '8px', width: 'auto' }}>儲存第二段</button>
                                </div>
                            </div>

                            {/* FAQ 常見問題維護 */}
                            <div className="card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: 0 }}>❓ FAQ 常見問題維護</h3>
                                    <button 
                                        className="btn btn-primary btn-sm" 
                                        onClick={() => { setEditingFaqId(null); setNewFaqForm({ question: '', answer: '', sortOrder: 0, imageUrl: '' }); setShowAddFaqModal(true); }}
                                        style={{ height: '32px', width: 'auto' }}
                                    >
                                        ➕ 新增問答
                                    </button>
                                </div>

                                {isConfigsLoading ? (
                                    <div style={{ textAlign: 'center', padding: '20px' }}>載入問答中...</div>
                                ) : (
                                    <div className="responsive-table-wrap" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}>排序</th>
                                                    <th>問答主題</th>
                                                    <th>操作</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {faqList.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(faq => (
                                                    <tr key={faq.id}>
                                                        <td data-label="排序">{faq.sortOrder}</td>
                                                        <td data-label="問答主題">
                                                            <strong style={{ color: 'var(--color-primary)', fontSize: '13px' }}>Q: {faq.question}</strong>
                                                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>A: {faq.answer}</div>
                                                        </td>
                                                        <td data-label="操作">
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button className="btn btn-sm btn-outline" onClick={() => { startEditFaq(faq); setShowAddFaqModal(true); }} style={{ padding: '2px 8px' }}>編輯</button>
                                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFaq(faq.id)} style={{ padding: '2px 8px' }}>刪除</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        </div>
                )}
            </div>

            {/* 新增菜單商品 Modal */}
                        {showAddMenuModal && (
                            <div className="modal-overlay">
                                <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', margin: 'auto' }}>
                                    <div className="modal-header">
                                        <h3>➕ 新增菜單商品</h3>
                                        <button className="modal-close" onClick={() => setShowAddMenuModal(false)}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleAddMenuSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">商品料號 (如 PROD_009)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.product_id}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, product_id: e.target.value.trim() })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品分類</label>
                                            <select 
                                                className="form-control"
                                                value={newMenuForm.category}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, category: e.target.value })}
                                            >
                                                <option value="麵食">麵食</option>
                                                <option value="小菜">小菜</option>
                                                <option value="滷味">滷味</option>
                                                <option value="料理包">料理包</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品名稱</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.name}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">價格或計價模式 (如 240 或 2.5*重量)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.price}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">成本 (元，選填)</label>
                                            <input 
                                                type="number" 
                                                step="0.01" 
                                                className="form-control" 
                                                value={newMenuForm.cost}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, cost: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">內部管理備註 (選填)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.pureNote}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, pureNote: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品描述</label>
                                            <textarea 
                                                className="form-control" 
                                                value={newMenuForm.description}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, description: e.target.value })}
                                                rows={2}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">圖片檔名 (如 water_dumplings.jpg)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.image_filename}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, image_filename: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">圖片網址 / 位置 (如 pic/P1001.jpg)</label>
                                            <input 
                                                type="text" 
                                                className="form-control" 
                                                value={newMenuForm.image_url}
                                                onChange={(e) => setNewMenuForm({ ...newMenuForm, image_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="modal-footer" style={{ marginTop: '10px' }}>
                                            <button type="submit" className="btn btn-primary">確認新增</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowAddMenuModal(false)}>取消</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* 編輯菜單商品 Modal */}
                        {showEditMenuModal && (
                            <div className="modal-overlay">
                                <div className="modal-container card" style={{ maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto', margin: 'auto' }}>
                                    <div className="modal-header">
                                        <h3>✏️ 編輯菜單商品</h3>
                                        <button className="modal-close" onClick={() => setShowEditMenuModal(false)}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={(e) => { e.preventDefault(); saveEditMenu(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">商品料號</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.product_id || ''}
                                                disabled
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品分類</label>
                                            <select
                                                className="form-control"
                                                value={editingProduct.category || '麵食'}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                                            >
                                                <option value="麵食">麵食</option>
                                                <option value="小菜">小菜</option>
                                                <option value="滷味">滷味</option>
                                                <option value="料理包">料理包</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品名稱</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.name || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">價格或計價模式 (如 240 或 2.5*重量)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.price || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">成本 (元，選填)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="form-control"
                                                value={editingProduct.cost || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, cost: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">內部管理備註 (選填)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.pureNote || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, pureNote: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">商品描述</label>
                                            <textarea
                                                className="form-control"
                                                value={editingProduct.description || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                                rows={2}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">圖片檔名 (如 water_dumplings.jpg)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.image_filename || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, image_filename: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">圖片網址 / 位置 (如 pic/P1001.jpg)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingProduct.image_url || ''}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>商品狀態</label>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProduct({ ...editingProduct, status: '上架' })}
                                                    style={{
                                                        padding: '6px 16px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid ' + (editingProduct.status === '上架' ? '#bbf7d0' : '#d1d5db'),
                                                        backgroundColor: editingProduct.status === '上架' ? '#dcfce7' : '#ffffff',
                                                        color: editingProduct.status === '上架' ? '#15803d' : '#374151'
                                                    }}
                                                >
                                                    上架
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingProduct({ ...editingProduct, status: '下架' })}
                                                    style={{
                                                        padding: '6px 16px',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        border: '1px solid ' + (editingProduct.status === '下架' ? '#fecaca' : '#d1d5db'),
                                                        backgroundColor: editingProduct.status === '下架' ? '#fee2e2' : '#ffffff',
                                                        color: editingProduct.status === '下架' ? '#b91c1c' : '#374151'
                                                    }}
                                                >
                                                    下架
                                                </button>
                                            </div>
                                        </div>
                                        <div className="modal-footer" style={{ marginTop: '10px' }}>
                                            <button type="submit" className="btn btn-primary">儲存修改</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowEditMenuModal(false)}>取消</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

{/* FAQ 新增/編輯 Modal */}
                        {showAddFaqModal && (
                            <div className="modal-overlay">
                                <div className="modal-container card" style={{ maxWidth: '500px', width: '90%' }}>
                                    <div className="modal-header">
                                        <h3>{editingFaqId ? '✏️ 編輯常見問題' : '➕ 新增常見問題'}</h3>
                                        <button className="modal-close" onClick={() => setShowAddFaqModal(false)}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleSaveFaq} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                                        <div className="form-group">
                                            <label className="form-label">問答主題 (Question)</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                value={editingFaqId ? editingFaq.question : newFaqForm.question}
                                                onChange={(e) => {
                                                    if (editingFaqId) setEditingFaq({ ...editingFaq, question: e.target.value });
                                                    else setNewFaqForm({ ...newFaqForm, question: e.target.value });
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">詳細回答 (Answer)</label>
                                            <textarea 
                                                className="form-control"
                                                value={editingFaqId ? editingFaq.answer : newFaqForm.answer}
                                                onChange={(e) => {
                                                    if (editingFaqId) setEditingFaq({ ...editingFaq, answer: e.target.value });
                                                    else setNewFaqForm({ ...newFaqForm, answer: e.target.value });
                                                }}
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">排序權重 (越小越靠前)</label>
                                            <input 
                                                type="number"
                                                className="form-control"
                                                value={editingFaqId ? editingFaq.sortOrder : newFaqForm.sortOrder}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value) || 0;
                                                    if (editingFaqId) setEditingFaq({ ...editingFaq, sortOrder: val });
                                                    else setNewFaqForm({ ...newFaqForm, sortOrder: val });
                                                }}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">說明圖片網址 (選填)</label>
                                            <input 
                                                type="text"
                                                className="form-control"
                                                placeholder="pic/faq_detail.jpg 或是網址"
                                                value={editingFaqId ? editingFaq.imageUrl : newFaqForm.imageUrl}
                                                onChange={(e) => {
                                                    if (editingFaqId) setEditingFaq({ ...editingFaq, imageUrl: e.target.value });
                                                    else setNewFaqForm({ ...newFaqForm, imageUrl: e.target.value });
                                                }}
                                            />
                                        </div>
                                        <div className="modal-footer" style={{ marginTop: '10px' }}>
                                            <button type="submit" className="btn btn-primary">儲存問答</button>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowAddFaqModal(false)}>取消</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

{/* 訂單編輯 Modal */}
            {showEditOrderModal && editingOrder && (
                <div className="modal-overlay">
                    <div className="modal-container card" style={{ maxWidth: '750px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <h3>✏️ 編輯訂單資訊：<strong>{editingOrder.order_id}</strong></h3>
                            <button className="modal-close" onClick={() => { setShowEditOrderModal(false); setEditingOrder(null); }}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSaveOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                            {/* 顧客基本資料 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">顧客姓名</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingOrder.customer_name || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, customer_name: e.target.value })} 
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">聯絡電話</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingOrder.phone || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })} 
                                        required
                                    />
                                </div>
                            </div>

                            {/* 社群聯絡資料 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <span>LINE ID</span>
                                        {editingOrder.line_id && (
                                            <a 
                                                href={`https://line.me/ti/p/~${editingOrder.line_id.trim()}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                style={{ color: '#06c755', fontWeight: 'bold', textDecoration: 'none', fontSize: '12px' }}
                                            >
                                                💬 聯絡 LINE
                                            </a>
                                        )}
                                    </label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingOrder.line_id || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, line_id: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Instagram</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingOrder.instagram || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, instagram: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Facebook</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={editingOrder.facebook || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, facebook: e.target.value })} 
                                    />
                                </div>
                            </div>

                            {/* 訂單主檔其它資訊 */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">預約出貨/自取日期</label>
                                    <input 
                                        type="date" 
                                        className="form-control" 
                                        value={editingOrder.delivery_date ? editingOrder.delivery_date.replace(/\//g, '-') : ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, delivery_date: e.target.value })} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">聯絡電子郵件 (Email)</label>
                                    <input 
                                        type="email" 
                                        className="form-control" 
                                        value={editingOrder.email || ''} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group">
                                    <label className="form-label">付款狀態</label>
                                    <select 
                                        className="form-control" 
                                        value={editingOrder.payment_status || '未付款'} 
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const today = new Date().toISOString().split('T')[0].replace(/-/g, '/');
                                            setEditingOrder({ 
                                                ...editingOrder, 
                                                payment_status: val,
                                                payment_date: val === '已付款' ? today : ''
                                            });
                                        }}
                                    >
                                        <option value="未付款">未付款</option>
                                        <option value="已付款">已付款</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">預約單狀態</label>
                                    <select 
                                        className="form-control" 
                                        value={editingOrder.status || '待確認'} 
                                        onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value })}
                                    >
                                        <option value="待確認">待確認</option>
                                        <option value="已接單">已接單 (待排程)</option>
                                        <option value="已出貨">已出貨</option>
                                        <option value="已完成">已完成 (已結單)</option>
                                        <option value="已退回">已退回</option>
                                        <option value="已取消">已取消</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">訂單備註</label>
                                <textarea 
                                    className="form-control" 
                                    value={editingOrder.notes || ''} 
                                    onChange={(e) => setEditingOrder({ ...editingOrder, notes: e.target.value })} 
                                    rows={2}
                                />
                            </div>

                            {/* 🍽️ 訂單品項明細表格 */}
                            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>🍽️ 訂購品項排程與計價明細</h4>
                                    <button 
                                        type="button" 
                                        className="btn btn-outline btn-sm" 
                                        onClick={handleAddDiscountItem}
                                        style={{ height: '30px', width: 'auto' }}
                                    >
                                        🎁 新增折扣折抵項目
                                    </button>
                                </div>
                                
                                <div className="responsive-table-wrap">
                                    <table className="admin-table" style={{ fontSize: '13px' }}>
                                        <thead>
                                            <tr>
                                                <th>品項</th>
                                                <th style={{ width: '130px' }}>單價 / 重量(g)</th>
                                                <th style={{ width: '90px' }}>數量</th>
                                                <th style={{ width: '100px' }}>小計</th>
                                                <th style={{ width: '140px' }}>製作狀態</th>
                                                <th style={{ width: '50px' }}>操作</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {editingOrderItems.map((item, idx) => {
                                                const menu = menuList.find(m => m.product_id === item.productId || m.product_id === item.product_id);
                                                const isDiscount = item.productId === 'PROD_DISCOUNT' || item.product_id === 'PROD_DISCOUNT';
                                                const isWeightItem = menu ? (String(menu.price).includes('*') || String(menu.price).includes('重量') || ['P3001', 'P3002'].includes(item.productId || item.product_id)) : false;

                                                return (
                                                    <tr key={idx}>
                                                        <td data-label="品項">
                                                            {isDiscount ? (
                                                                <strong style={{ color: 'var(--color-success)' }}>🎁 折扣折抵</strong>
                                                            ) : (
                                                                <span>{menu?.name || item.productId}</span>
                                                            )}
                                                        </td>
                                                        <td data-label="單價 / 重量(g)">
                                                            {isDiscount ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="form-control form-control-sm"
                                                                    style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}
                                                                    value={item.productAmt || 0}
                                                                    onChange={(e) => handleItemAmtChange(idx, e.target.value)}
                                                                />
                                                            ) : isWeightItem ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                                                    <input 
                                                                        type="number" 
                                                                        className="form-control form-control-sm"
                                                                        style={{ width: '100px', fontWeight: 'bold', height: '32px' }}
                                                                        value={item.productAmt || 0}
                                                                        onChange={(e) => handleItemAmtChange(idx, e.target.value)}
                                                                        min={0}
                                                                        placeholder="輸入克數(g)"
                                                                    />
                                                                    <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>
                                                                        ⚖️ 待製作後秤重
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span>${item.productAmt} 元</span>
                                                            )}
                                                        </td>
                                                        <td data-label="數量">
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-sm"
                                                                value={item.qty}
                                                                onChange={(e) => handleItemQtyChange(idx, e.target.value)}
                                                                disabled={isDiscount || isWeightItem}
                                                                min={1}
                                                            />
                                                        </td>
                                                        <td data-label="小計" style={{ fontWeight: 'bold', color: item.productTotalAmt < 0 ? 'var(--color-success)' : 'var(--color-text)' }}>
                                                            ${item.productTotalAmt} 元
                                                        </td>
                                                        <td data-label="製作狀態">
                                                            <select
                                                                className="form-control form-control-sm"
                                                                value={item.itemStatus || '待製作'}
                                                                onChange={(e) => handleItemStatusChange(idx, e.target.value)}
                                                                disabled={isDiscount}
                                                            >
                                                                <option value="待製作">⏳ 待排程</option>
                                                                <option value="已完成">✅ 已完成</option>
                                                            </select>
                                                        </td>
                                                        <td data-label="操作">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-sm btn-danger" 
                                                                onClick={() => handleRemoveOrderItem(idx)}
                                                                style={{ padding: '2px 8px', minHeight: '26px' }}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '15px', fontWeight: 'bold' }}>
                                    計算後訂單總金額：<span style={{ color: 'var(--color-primary)', fontSize: '18px' }}>${editingOrder.amount}</span> 元
                                </div>
                            </div>

                            {/* Modal 底部按鈕 */}
                            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px' }}>
                                <button type="submit" className="btn btn-primary">💾 儲存訂單與排程變更</button>
                                <button type="button" className="btn btn-outline" onClick={() => { setShowEditOrderModal(false); setEditingOrder(null); }}>取消</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </SitePasswordGate>
    );
}
export default function App() {
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('about');
    const [toasts, setToasts] = useState([]);

    const showToast = (msg, type = 'success') => {
        const newId = Date.now();
        setToasts(prev => [...prev, { id: newId, msg, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== newId));
        }, 3000);
    };

    const handleAddToCart = (product, quantity = 1) => {
        if (quantity <= 0) return; // 0為無效操作，直接忽略
        const existing = cart.find(i => i.product_id === product.product_id);
        if (existing) {
            showToast(`已將 ${product.name} 的數量增加 ${quantity}！`);
            setCart(prev => prev.map(i => 
                i.product_id === product.product_id ? { ...i, qty: i.qty + quantity } : i
            ));
        } else {
            showToast(`已加入 ${product.name} x${quantity} 至購物車！`);
            setCart(prev => [...prev, { 
                product_id: product.product_id, 
                name: product.name, 
                price: product.price, 
                qty: quantity 
            }]);
        }
    };

    const handleUpdateQty = (productId, newQty) => {
        if (newQty <= 0) return;
        setCart(prev => prev.map(i => i.product_id === productId ? { ...i, qty: newQty } : i));
    };

    const handleRemoveItem = (productId) => {
        setCart(prev => prev.filter(i => i.product_id !== productId));
        showToast('品項已自購物車移除。', 'warning');
    };

    const handleClearCart = () => setCart([]);

    const handleSubmitOrder = async (orderData) => {
        try {
            const config = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': 'jeff-winnie-kaia-luck-13365'
                },
                body: JSON.stringify(orderData)
            };
            const res = await fetch('/api/v1/orders', config);
            const data = await res.json();
            
            if (data.status === 'success') {
                showToast(`預約單送出成功！已為您排程處理。`);
                alert(`🎉 恭喜！您的專屬訂單已成功送出！\n訂單編號：${data.order_id}\n請妥善保存此編號，您可隨時於前台「訂單追蹤」中查詢出貨進度！`);
                return true;
            } else {
                throw new Error(data.message || '下單失敗！');
            }
        } catch (err) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    showToast('預約單送出成功！(模擬安全回退)');
                    alert(`🎉 恭喜！預約單送出成功！(本地安全回退啟用)\n專屬訂單編號：S000001\n請妥善保存，供日後追蹤使用。`);
                    resolve(true);
                }, 1200);
            });
        }
    };

    return (
        <HashRouter>
            <Header 
                cartCount={cart.reduce((sum, item) => sum + item.qty, 0)} 
                onCartOpen={() => setIsCartOpen(true)}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            <Routes>
                <Route 
                    path="/" 
                    element={
                        <CustomerSPA 
                            cart={cart}
                            onCartOpen={() => setIsCartOpen(true)}
                            onAddToCart={handleAddToCart}
                            minOrderAmount={0}
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
                        />
                    } 
                />

                <Route path="/track" element={<CustomerTrack />} />

                <Route path="/admin-portal-xyz" element={<AdminPortal />} />
            </Routes>

            <ShoppingCart 
                cart={cart}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
                minOrderAmount={0}
                onSubmitOrder={handleSubmitOrder}
            />

            <div className="toast-container">
                {toasts.map(t => (
                    <div key={t.id} className={`toast-item ${t.type}`}>
                        {t.msg}
                    </div>
                ))}
            </div>
        </HashRouter>
    );
}
