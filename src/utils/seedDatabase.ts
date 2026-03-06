import { supabase } from '../services/supabaseClient';
import { generateMockCases, generateMockEvents } from './testUtils';

/**
 * 將模擬資料寫入 Supabase 資料庫
 */
export const seedDatabase = async () => {
    // 1. 產生並準備案件資料 (移除預設 ID 讓資料庫自動生成)
    const mockCases = generateMockCases(10).map(({ id, ...rest }) => ({
        ...rest,
    }));

    console.log('開始寫入模擬案件...');

    const { data: insertedCases, error: caseError } = await supabase
        .from('cases')
        .insert(mockCases)
        .select();

    if (caseError) {
        console.error('案件寫入失敗:', caseError.message);
        return { success: false, error: caseError };
    }

    if (!insertedCases || insertedCases.length === 0) {
        return { success: false, error: new Error('沒有資料被插入') };
    }

    console.log(`成功寫入 ${insertedCases.length} 個案件。開始產生時間軸事件...`);

    // 2. 為每個案件產生 3~5 個隨機事件
    const allEvents: any[] = [];
    insertedCases.forEach((c) => {
        const eventCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 events
        const events = generateMockEvents(c.id, eventCount).map(({ id, ...rest }) => ({
            ...rest,
        }));
        allEvents.push(...events);
    });

    console.log(`準備寫入 ${allEvents.length} 個事件...`);

    const { error: eventError } = await supabase
        .from('events')
        .insert(allEvents);

    if (eventError) {
        console.error('事件寫入失敗:', eventError.message);
        // 注意：案件已經寫入成功，所以這裡只通知事件失敗
        return { success: true, data: insertedCases, warning: '案件已建立，但事件建立失敗' };
    }

    console.log('成功寫入所有測試資料（案件與事件）。');
    return { success: true, data: insertedCases };
};

/**
 * 清理所有模擬測試資料
 * 會刪除 name 欄位包含「測試人員」的所有案件
 */
export const cleanTestData = async () => {
    console.log('開始清理測試資料...');

    // 由於資料庫通常設定有 CASCADE DELETE，刪除 case 也會自動刪除相關的 events
    // 如果沒有，則需要先手動刪除相關 tables
    const { error } = await supabase
        .from('cases')
        .delete()
        .ilike('name', '測試人員%');

    if (error) {
        console.error('清理失敗:', error.message);
        return { success: false, error };
    }

    console.log('測試資料清理完成。');
    return { success: true };
};
