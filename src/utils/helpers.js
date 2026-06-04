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

export const customFetch = (url, options) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const targetUrl = (url && url.startsWith('/api')) ? `${baseUrl}${url}` : url;
    return fetch(targetUrl, options);
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

