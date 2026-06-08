import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, ChefHat } from 'lucide-react';
import './SitePasswordGate.css';

export default function SitePasswordGate({ children }) {
    const [password, setPassword] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(
        !!sessionStorage.getItem('admin_api_key')
    );
    const [isCheckingKey, setIsCheckingKey] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleUnlock = async (e) => {
        e.preventDefault();
        const trimmedPassword = password.trim();
        if (!trimmedPassword) {
            setError('請輸入管理金鑰！');
            return;
        }

        setIsCheckingKey(true);
        setError('');
        
        try {
            // 用使用者輸入的密碼作為金鑰，向後端發送測試請求
            const testUrl = '/api/v1/menus/all';
            const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
            const targetUrl = testUrl.startsWith('/api') ? `${baseUrl}${testUrl}` : testUrl;
            
            const res = await fetch(targetUrl, {
                headers: {
                    'X-API-KEY': trimmedPassword
                }
            });

            if (res.ok) {
                // 驗證成功！
                setIsUnlocked(true);
                sessionStorage.setItem('admin_api_key', trimmedPassword);
                setError('');
            } else if (res.status === 401) {
                setError('金鑰驗證失敗，管理金鑰無效！');
                setIsShaking(true);
                setPassword('');
                setTimeout(() => setIsShaking(false), 500);
            } else {
                setError(`驗證出錯 (HTTP ${res.status})，請確認後端狀態！`);
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }
        } catch (err) {
            console.error("驗證金鑰時發生連線錯誤:", err);
            setError('網路連線失敗，無法連線至後端進行驗證！');
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        } finally {
            setIsCheckingKey(false);
        }
    };

    const handleLock = () => {
        setIsUnlocked(false);
        sessionStorage.removeItem('admin_api_key');
        window.location.reload(); // 重新整理頁面以乾淨清空狀態與變數
    };

    if (isUnlocked) {
        // 解鎖成功後，傳入子元件 (管理後台內容)，並提供手動登出/鎖定鎖的 callback
        return (
            <div className="admin-wrapper">
                <div className="admin-status-bar container">
                    <span className="admin-badge">
                        <Unlock size={14} /> 系統管理模式已開啟
                    </span>
                    <button className="lock-btn" onClick={handleLock} disabled={isCheckingKey}>
                        🔒 退出管理後台
                    </button>
                </div>
                {children}
            </div>
        );
    }

    return (
        <div className="gate-overlay">
            <div className={`gate-card ${isShaking ? 'shake' : ''}`}>
                <div className="gate-header">
                    <div className="gate-logo">
                        <ChefHat size={32} className="logo-icon" />
                    </div>
                    <h2>小灶私廚管理系統</h2>
                    <p>此區塊受隱私密碼保護，請輸入解鎖金鑰</p>
                </div>

                <form onSubmit={handleUnlock} className="gate-form">
                    <div className="password-input-wrap">
                        <Lock size={18} className="input-lock-icon" />
                        <input
                            type="password"
                            placeholder="請輸入後台管理密碼"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="gate-input"
                            autoFocus
                            disabled={isCheckingKey}
                        />
                    </div>

                    {error && (
                        <div className="gate-error">
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary gate-submit-btn" disabled={isCheckingKey}>
                        <Unlock size={16} /> {isCheckingKey ? '驗證金鑰中...' : '驗證並解鎖後台'}
                    </button>
                </form>

                <div className="gate-footer">
                    <a href="/" className="back-home-link">
                        ← 返回顧客前台首頁
                    </a>
                </div>
            </div>
        </div>
    );
}
