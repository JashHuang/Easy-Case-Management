import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Case } from '../types/database'
import CaseCard from '../components/CaseCard'
import SearchBar from '../components/SearchBar'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { TrashIcon } from '@heroicons/react/24/outline'
import { seedDatabase, cleanTestData } from '../utils/seedDatabase'


export default function CaseList() {
    const [cases, setCases] = useState<Case[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [seeding, setSeeding] = useState(false)
    const [selectedCases, setSelectedCases] = useState<string[]>([])
    const { isAdmin } = useAuth()


    const fetchCases = useCallback(async (query: string = '') => {
        try {
            setLoading(true)
            let supabaseQuery = supabase
                .from('cases')
                .select('*')
                .order('created_at', { ascending: false })

            if (query.trim()) {
                supabaseQuery = supabaseQuery.or(
                    `name.ilike.%${query}%,title.ilike.%${query}%,summary.ilike.%${query}%,description.ilike.%${query}%`
                )
            }

            const { data, error } = await supabaseQuery

            if (error) throw error
            setCases(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const handleSeedData = async () => {
        if (!confirm('確定要產生 10 筆測試資料並寫入資料庫嗎？')) return;

        try {
            setSeeding(true);
            const { success, error } = await seedDatabase();
            if (success) {
                alert('測試資料產生成功！');
                fetchCases();
            } else {
                alert(`產生失敗: ${error?.message || '未知錯誤'}`);
            }
        } catch (err: any) {
            alert(`執行出錯: ${err.message}`);
        } finally {
            setSeeding(false);
        }
    };

    const handleCleanData = async () => {
        if (!confirm('確定要刪除所有名稱為「測試人員」開頭的案件與關聯事件嗎？此操作無法復原。')) return;

        try {
            setSeeding(true);
            const { success, error } = await cleanTestData();
            if (success) {
                alert('測試資料已清空！');
                fetchCases();
            } else {
                alert(`清空失敗: ${error?.message || '未知錯誤'}`);
            }
        } catch (err: any) {
            alert(`執行出錯: ${err.message}`);
        } finally {
            setSeeding(false);
        }
    };

    const handleDelete = async (ids: string[]) => {
        if (!confirm(`確定要刪除 ${ids.length} 筆案件嗎？此操作無法復原。`)) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('cases')
                .delete()
                .in('id', ids);

            if (error) throw error;

            alert('刪除成功！');
            setSelectedCases([]);
            fetchCases();
        } catch (err: any) {
            alert(`刪除失敗: ${err.message}`);
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedCases.length === cases.length) {
            setSelectedCases([]);
        } else {
            setSelectedCases(cases.map(c => c.id));
        }
    };

    useEffect(() => {
        fetchCases()
    }, [fetchCases])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCases(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, fetchCases])

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                錯誤: {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">案件列表</h1>
                <div className="flex flex-col md:flex-row w-full md:w-auto gap-4">
                    <SearchBar onSearch={setSearchQuery} />
                    {isAdmin && (
                        <>
                            <button
                                onClick={handleSeedData}
                                disabled={seeding}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors text-center shadow-sm text-sm"
                            >
                                {seeding ? '處理中...' : '產生測試資料'}
                            </button>
                            <button
                                onClick={handleCleanData}
                                disabled={seeding}
                                className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors text-center shadow-sm text-sm"
                            >
                                清空測試資料
                            </button>
                        </>
                    )}

                    <Link
                        to="/cases/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-center shadow-sm"
                    >
                        建立新案件
                    </Link>

                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : cases.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                    <p className="text-gray-500">
                        {searchQuery ? `找不到與 "${searchQuery}" 相符的案件` : '尚無案件資料。開始建立您的第一個案件！'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {isAdmin && cases.length > 0 && (
                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCases.length === cases.length && cases.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">全選</span>
                            </label>
                            {selectedCases.length > 0 && (
                                <button
                                    onClick={() => handleDelete(selectedCases)}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm ml-auto"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                    批次刪除 ({selectedCases.length})
                                </button>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cases.map((c) => (
                            <CaseCard
                                key={c.id}
                                caseData={c}
                                isAdmin={isAdmin}
                                isSelected={selectedCases.includes(c.id)}
                                onSelect={(id, checked) => {
                                    if (checked) {
                                        setSelectedCases(prev => [...prev, id])
                                    } else {
                                        setSelectedCases(prev => prev.filter(caseId => caseId !== id))
                                    }
                                }}
                                onDelete={(id) => handleDelete([id])}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
