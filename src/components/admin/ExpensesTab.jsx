import React from 'react';
import { isEmptyValue } from '../../utils/helpers';

export default function ExpensesTab({
    expenses,
    isExpensesLoading,
    expenseForm,
    setExpenseForm,
    handleExpenseSubmit,
    handleDeleteExpense
}) {
    return (
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
    );
}
