import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, ChefHat } from 'lucide-react';
import './SitePasswordGate.css';

export default function SitePasswordGate({ children }) {
    const [password, setPassword] = useState('');
    const [isUnlocked, setIsUnlocked] = useState(
        localStorage.getItem('site_unlocked') === 'true'
    );
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);

    const handleUnlock = (e) => {
        e.preventDefault();
        
        // 從環境變數中取得解鎖密碼，預設為 'jwkl888'
        const correctPassword = import.meta.env.VITE_SITE_PASSWORD || 'jwkl888';

        if (password === correctPassword) {
            setIsUnlocked(true);
            localStorage.setItem('site_unlocked', 'true');
            setError('');
        } else {
            setError('解鎖金鑰不正確，請重新輸入！');
            setIsShaking(true);
            setPassword('');
            setTimeout(() => setIsShaking(false), 500); // 抖動完畢重置狀態
        }
    };

    const handleLock = () => {
        setIsUnlocked(false);
        localStorage.removeItem('site_unlocked');
    };

    if (isUnlocked) {
        // 解鎖成功後，傳入子元件 (管理後台內容)，並提供手動登出/鎖定鎖的 callback
        return (
            <div className="admin-wrapper">
                <div className="admin-status-bar container">
                    <span className="admin-badge">
                        <Unlock size={14} /> 系統管理模式已開啟
                    </span>
                    <button className="lock-btn" onClick={handleLock}>
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
                        />
                    </div>

                    {error && (
                        <div className="gate-error">
                            <AlertCircle size={15} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary gate-submit-btn">
                        <Unlock size={16} /> 驗證並解鎖後台
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
