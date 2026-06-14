import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart as CartIcon, UserCheck } from 'lucide-react';
import { customFetch } from '../utils/helpers';
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
    const [showCommunity, setShowCommunity] = useState(true);

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

    // 定時檢查動態專區開關，以便後台關閉時前台能即時隱藏
    useEffect(() => {
        const checkCommunityZone = async () => {
            try {
                const res = await customFetch('/api/v1/system-configs');
                if (res.ok) {
                    const data = await res.json();
                    const zoneConfig = data.find(c => c.configKey === 'ENABLE_COMMUNITY_ZONE');
                    if (zoneConfig) {
                        setShowCommunity(zoneConfig.configValue.trim().toLowerCase() === 'true');
                    }
                }
            } catch (err) {
                console.error("導航列載入設定失敗", err);
            }
        };
        checkCommunityZone();
        const timer = setInterval(checkCommunityZone, 15000);
        return () => clearInterval(timer);
    }, []);

    const navItems = [
        { id: 'about', label: '🥘 關於小灶' },
        { id: 'menu', label: '📖 精選菜單' },
        showCommunity && { id: 'stories', label: '📸 灶下動態' },
        { id: 'faq', label: '❓ 常見問題' },
        { id: 'track', label: '🔍 訂單追蹤' }
    ].filter(Boolean);

    const handleNavClick = (sectionId) => {
        if (sectionId === 'track') {
            onSectionChange('track');
            navigate('/track');
            return;
        }

        if (sectionId === 'stories') {
            onSectionChange('stories');
            navigate('/stories');
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
