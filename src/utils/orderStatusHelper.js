/**
 * 小灶私廚 - 訂單狀態自動升級共用模組
 *
 * 當一張訂單的所有明細都已完成時，
 * 自動呼叫 API 將主訂單狀態升級為「已完成」。
 */

/**
 * 檢查多張訂單，若所有明細（排除折扣品項）全數已完成，
 * 且主訂單狀態仍為「待確認」或「已接單」，則自動升級為「已完成」。
 *
 * @param {Object}   params
 * @param {string[]} params.orderIds        - 要檢查的訂單 ID 清單
 * @param {Function} params.getLatestItems  - (orderId: string) => items[]
 *                                           取得「最新」明細陣列（呼叫方自行合併修改後再傳入）
 * @param {Function} params.getOrder        - (orderId: string) => order | undefined
 *                                           取得主訂單物件（包含 status, customer_name 等欄位）
 * @param {Function} params.apiFetch        - customFetch 的引用（自動帶 API KEY Header）
 * @returns {Promise<string[]>}             - 成功升級的訂單描述陣列，例如 ["S000013（白敬亭）"]
 */
export async function checkAndUpgradeOrderStatus({ orderIds, getLatestItems, getOrder, apiFetch }) {
    // 可升級的主訂單狀態（只有這兩種才需要自動升級）
    const UPGRADABLE_STATUSES = ['待確認', '已接單'];

    const upgraded = [];

    for (const orderId of orderIds) {
        // 1. 取得該訂單的最新明細（排除折扣品項）
        const items = getLatestItems(orderId).filter(item => {
            const pid = item.productId || item.product_id;
            return pid !== 'PROD_DISCOUNT';
        });

        // 若無任何有效明細，跳過此訂單
        if (items.length === 0) continue;

        // 2. 判斷是否所有明細都已完成
        const allCompleted = items.every(item => {
            const status = item.itemStatus || item.item_status;
            return status === '已完成';
        });

        if (!allCompleted) continue;

        // 3. 取得主訂單，確認目前狀態可升級
        const order = getOrder(orderId);
        if (!order) continue;

        if (!UPGRADABLE_STATUSES.includes(order.status)) continue;

        // 4. 呼叫 API 升級主訂單狀態為「已完成」
        try {
            const res = await apiFetch(
                `/api/v1/orders/${orderId}/status?status=${encodeURIComponent('已完成')}`,
                { method: 'PUT', headers: { 'Content-Type': 'application/json' } }
            );
            if (res.ok) {
                const name = order.customer_name || order.customerName || '';
                upgraded.push(`${orderId}${name ? `（${name}）` : ''}`);
            }
        } catch (err) {
            // 升級失敗靜默處理，不中斷主流程
            console.error(`[orderStatusHelper] 升級訂單 ${orderId} 狀態失敗`, err);
        }
    }

    return upgraded;
}

/**
 * 將升級結果陣列格式化為給店主看的提示字串。
 *
 * @param {string[]} upgraded - checkAndUpgradeOrderStatus 回傳的升級清單
 * @returns {string}          - 格式化後的提示訊息，若無升級則回傳空字串
 */
export function formatUpgradeMessage(upgraded) {
    if (!upgraded || upgraded.length === 0) return '';
    return (
        `\n\n✅ 以下訂單明細均已全部完成，主訂單狀態已自動調整為【已完成】：\n` +
        upgraded.map(u => `• ${u}`).join('\n')
    );
}
