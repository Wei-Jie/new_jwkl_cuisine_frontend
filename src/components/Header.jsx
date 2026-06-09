import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart as CartIcon, UserCheck } from 'lucide-react';
import './Header.css';

export default function Header({
    cartCount,
    onCartOpen,
    activeSection,
    onSectionChange
}) {
    const navigate = useNavigate();
    const location = useLocation();

    // 讀取 sessionStorage 中的管理金鑰，判斷是否已登入後台
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(
        () => !!sessionStorage.getItem('admin_api_key')
    );

    // 監聽 storage 事件，讓登入/登出後導航列即時更新
    useEffect(() => {
        const handleStorageChange = () => {
            setIsAdminLoggedIn(!!sessionStorage.getItem('admin_api_key'));
        };
        window.addEventListener('storage', handleStorageChange);
        // 同時定期輪詢，因為 sessionStorage 的 storage 事件在同一分頁不觸發
        const timer = setInterval(handleStorageChange, 1000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(timer);
        };
    }, []);

    const navItems = [
        { id: 'about', label: '🥘 關於小灶' },
        { id: 'menu', label: '📖 精選菜單' },
        { id: 'faq', label: '❓ 常見問題' },
        { id: 'track', label: '🔍 訂單追蹤' }
    ];

    const handleNavClick = (sectionId) => {
        if (sectionId === 'track') {
            onSectionChange('track');
            navigate('/track');
            return;
        }

        onSectionChange(sectionId);
        
        // 若當前不在前台根路由，先引導跳回前台根路由首頁
        if (location.pathname !== '/') {
            navigate('/');
        } else {
            // 若原本就在根路由，直接平滑滾動到目標錨點
            const element = document.getElementById(`section-${sectionId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <header className="site-header">
            <div className="header-container container">
                {/* 1. 品牌標誌 */}
                <div className="brand-wrap" onClick={() => handleNavClick('about')}>
                    <span className="brand-name">小灶私廚</span>
                </div>

                {/* 2. 橫向滾動導航連結 - 手機大拇指友善 (Scrollable Nav) */}
                <nav className="header-nav">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-link-btn ${activeSection === item.id ? 'active' : ''}`}
                            onClick={() => handleNavClick(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                    
                    {/* 管理員快速切換通道 (已登入後台時才顯示) */}
                    {isAdminLoggedIn && (
                        <Link to="/admin-portal-xyz" className="nav-link-btn admin-quick-link">
                            <UserCheck size={14} /> 後台管理
                        </Link>
                    )}
                </nav>

                {/* 3. 購物車按鈕 (帶紅色計數徽章) */}
                <div className="header-actions">
                    <button className="header-cart-trigger" onClick={onCartOpen}>
                        <CartIcon size={20} />
                        {cartCount > 0 && (
                            <span className="cart-badge-count animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
}
