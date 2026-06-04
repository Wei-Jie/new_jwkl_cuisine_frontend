import React from 'react';
import { getProductUnit, formatVIPPhone } from '../../utils/helpers';

const AnalyticsTab = ({
    dateRangeMode,
    setDateRangeMode,
    analysisStartDate,
    setAnalysisStartDate,
    analysisEndDate,
    setAnalysisEndDate,
    handleDateRangeModeChange,
    analyticsData
}) => {
    return (
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
    );
};

export default AnalyticsTab;
