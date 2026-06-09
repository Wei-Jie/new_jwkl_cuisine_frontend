import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import { customFetch } from '../utils/helpers';

export default function CustomerSPA({ cart, onCartOpen, onAddToCart, minOrderAmount, activeSection, onSectionChange }) {
    const [categoryFilter, setCategoryFilter] = useState('全部');
    const [menuData, setMenuData] = useState([]);
    const [faqData, setFaqData] = useState([]);
    const [systemAnnouncement, setSystemAnnouncement] = useState('🥘 歡迎來到小灶私廚！線上購物車預約訂單已啟用，歡迎下單！');
    const [aboutText1, setAboutText1] = useState('小灶私廚創立於一個溫暖的街角。我們始終相信，最好的料理不需要繁瑣的修飾，而是來自對食材本質的極致堅持，與一份真摯的人情味。');
    const [aboutText2, setAboutText2] = useState('我們的招牌「手包韭菜玉米水餃」採用當日採購的新鮮韭菜，搭配特選在地豬肉，在皮薄與餡豐之間取得絕佳平衡；特製「紅燒肉」更是遵循古法，慢火精燉數小時，帶出濃郁紅亮、肥而不膩的精緻口感。');
    const [lineLink, setLineLink] = useState('https://line.me/ti/p/~wei750211');
    const [igLink, setIgLink] = useState('https://www.instagram.com/jwkl_cuisine/');
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
        if (!isLoading && activeSection && activeSection !== 'track') {
            const element = document.getElementById(`section-${activeSection}`);
            if (element) {
                const timer = setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 150);
                return () => clearTimeout(timer);
            }
        }
    }, [activeSection, isLoading]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const config = {};
                
                // 1. 獲取商品列表
                try {
                    const resMenu = await customFetch('/api/v1/menus', config);
                    if (resMenu.ok) {
                        const dataMenu = await resMenu.json();
                        const normalized = dataMenu.map(m => ({
                            ...m,
                            product_id: m.productId || m.product_id,
                            image_filename: m.imageFilename || m.image_filename,
                            image_url: m.imageUrl || m.image_url
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
                    const resFaq = await customFetch('/api/v1/faqs', config);
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
                    const resConfigs = await customFetch('/api/v1/system-configs', config);
                    if (resConfigs.ok) {
                        const dataConfigs = await resConfigs.json();
                        const ann = dataConfigs.find(c => c.configKey === 'SHOP_ANNOUNCEMENT');
                        if (ann) setSystemAnnouncement(ann.configValue);
                        
                        const t1 = dataConfigs.find(c => c.configKey === 'ABOUT_TEXT_1');
                        if (t1) setAboutText1(t1.configValue);
                        
                        const t2 = dataConfigs.find(c => c.configKey === 'ABOUT_TEXT_2');
                        if (t2) setAboutText2(t2.configValue);
                        
                        const line = dataConfigs.find(c => c.configKey === 'LINE_LINK');
                        if (line && line.configValue) setLineLink(line.configValue);
                        
                        const ig = dataConfigs.find(c => c.configKey === 'IG_LINK');
                        if (ig && ig.configValue) setIgLink(ig.configValue);
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
            <section id="section-about" className="card" style={{ marginTop: '8px', position: 'relative', overflow: 'hidden' }}>
                {/* 背景裝飾圖，提供優雅的環境氛圍與質感 */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url(pic/hero_banner.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.03,
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <ChefHat size={32} className="text-primary" />
                        <h2>小灶私廚：傳承溫潤的舌尖記憶</h2>
                    </div>
                    <div className="about-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px', color: 'var(--color-text-secondary)' }}>
                        <p style={{ whiteSpace: 'pre-line' }}>{aboutText1}</p>
                        <p style={{ whiteSpace: 'pre-line' }}>{aboutText2}</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                            <span className="tag">🥘 每日手工限量</span>
                            <span className="tag">🌿 當日新鮮食材</span>
                            <span className="tag">❤️ 絕無人工添加</span>
                        </div>
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
                        const imgUrl = item.image_url || item.imageUrl || 
                            ((item.image_filename && (item.image_filename.startsWith('http://') || item.image_filename.startsWith('https://'))) 
                            ? item.image_filename 
                            : `pic/${item.image_filename}`);
                        const defaultImg = 'https://placehold.jp/24/1a73e8/ffffff/400x300.png?text=小灶私廚%0A精製美食';

                        return (
                            <div className="card" key={item.product_id} style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', paddingTop: '75%', backgroundColor: '#f8f9fa', overflow: 'hidden' }}>
                                    {/* 下層：模糊背景底圖，提供完美無縫漸變環境光暈 */}
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
                                                        return;
                                                    }
                                                    onAddToCart(item, selectQty);
                                                    setMenuQuantities(prev => ({ ...prev, [item.product_id]: 0 }));
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
                                <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
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
                                    <div 
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ 
                                            marginTop: '12px', 
                                            fontSize: '14px', 
                                            color: 'var(--color-text-secondary)',
                                            animation: 'fadeIn 0.25s ease',
                                            lineHeight: '1.6',
                                            borderTop: '1px dashed var(--color-border)',
                                            paddingTop: '12px'
                                        }}
                                    >
                                        <div>{faq.answer}</div>
                                        {faq.imageUrl && (
                                            <div style={{ marginTop: '12px', textAlign: 'center' }}>
                                                <img 
                                                    src={faq.imageUrl.startsWith('http') || faq.imageUrl.startsWith('/') ? faq.imageUrl : `/${faq.imageUrl}`} 
                                                    alt="常見問題說明圖" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                    style={{ 
                                                        maxWidth: '100%', 
                                                        maxHeight: '600px', 
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

            {/* SECTION 4: 聯絡我們 */}
            <section id="section-contact" className="card" style={{ marginTop: '24px', padding: '24px', textAlign: 'center' }}>
                <h3 className="section-title" style={{ borderLeft: 'none', paddingLeft: 0, margin: '0 0 16px 0', fontSize: '15px', fontWeight: '600', color: 'var(--color-text)' }}>
                    💬 有任何下單疑問？歡迎直接聯絡我們
                </h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <a 
                        href={lineLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="contact-btn contact-btn-line"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '10px 20px', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            borderRadius: '30px', 
                            textDecoration: 'none', 
                            transition: 'all 0.2s ease',
                            backgroundColor: '#06C755',
                            color: '#ffffff',
                            boxShadow: '0 2px 6px rgba(6, 199, 85, 0.15)'
                        }}
                    >
                        💬 點此聯絡 LINE 客服
                    </a>
                    <a 
                        href={igLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="contact-btn contact-btn-ig"
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            padding: '10px 20px', 
                            fontSize: '13px', 
                            fontWeight: '600', 
                            borderRadius: '30px', 
                            textDecoration: 'none', 
                            transition: 'all 0.2s ease',
                            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                            color: '#ffffff',
                            boxShadow: '0 2px 6px rgba(220, 39, 67, 0.15)'
                        }}
                    >
                        📸 追蹤 Instagram 專頁
                    </a>
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
