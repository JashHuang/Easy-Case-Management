import type { Case, CaseEvent } from '../types/database';

/**
 * 產生模擬案件資料
 * @param count 產生的數量
 * @returns 案件陣列
 */
export const generateMockCases = (count: number): Case[] => {
    const statuses = ['進行中', '已結案', '待處理', '延遲中'];

    return Array.from({ length: count }).map((_, i) => ({
        id: `case-${i + 1}`,
        name: `測試人員 ${i + 1}`,
        title: `模擬案件標題 ${i + 1}`,
        summary: `這是第 ${i + 1} 個案件的簡短摘要。`,
        description: `這是第 ${i + 1} 個案件的詳細描述內容。用於測試系統的顯示與處理邏輯。`,
        status: statuses[i % statuses.length],
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
    }));
};

/**
 * 產生模擬案件事件資料
 * @param caseId 關聯的案件 ID
 * @param count 產生的數量
 * @returns 事件陣列
 */
export const generateMockEvents = (caseId: string, count: number): CaseEvent[] => {
    const eventTemplates = [
        { title: '初步面談', desc: '與當事人進行首次面談，了解案件基本背景。' },
        { title: '蒐集證據', desc: '收集相關物證、文件資料以及調閱相關記錄。' },
        { title: '召開會議', desc: '團隊內部討論案件進度，研擬後續處理對策。' },
        { title: '提交申請', desc: '向相關單位提交正式申請書或法律文件。' },
        { title: '外部協調', desc: '與第三方機構或相關人員進行溝通協調。' },
        { title: '案件審查', desc: '對目前案件狀態進行階段性審查與評估。' },
        { title: '結案報告', desc: '撰寫最終結案報告，整理所有卷宗存擋。' }
    ];

    return Array.from({ length: count }).map((_, i) => {
        const template = eventTemplates[i % eventTemplates.length];
        return {
            id: `event-${caseId}-${i + 1}`,
            case_id: caseId,
            title: template.title,
            description: `${template.desc} (測試序號 ${i + 1})`,
            // 讓事件日期稍微分散
            event_date: new Date(Date.now() - (count - i) * 7200000).toISOString(),
            created_at: new Date().toISOString(),
        };
    });
};

// 預設產生 10 筆測試案件資料
export const mockCases: Case[] = generateMockCases(10);
