import { describe, it, expect } from 'vitest';
import { generateMockCases, generateMockEvents } from '../utils/testUtils';

describe('測試資料產生模組', () => {
    it('應該產生指定數量的模擬案件', () => {
        const count = 5;
        const cases = generateMockCases(count);
        expect(cases).toHaveLength(count);
        expect(cases[0]).toHaveProperty('id');
        expect(cases[0]).toHaveProperty('title');
    });

    it('應該產生具有正確狀態的案件', () => {
        const cases = generateMockCases(10);
        const validStatuses = ['進行中', '已結案', '待處理', '延遲中'];
        cases.forEach(c => {
            expect(validStatuses).toContain(c.status);
        });
    });

    it('應該為指定案件產生模擬事件', () => {
        const caseId = 'test-id';
        const eventCount = 3;
        const events = generateMockEvents(caseId, eventCount);
        expect(events).toHaveLength(eventCount);
        events.forEach(e => {
            expect(e.case_id).toBe(caseId);
        });
    });
});
