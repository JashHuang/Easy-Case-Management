import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '../types/database'

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    isPending: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            // 使用 maybeSingle 避免找不到資料時拋出錯誤，並設定 timeout
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            if (error) {
                console.warn('獲取 Profile 出錯 (可能 table 尚未建立):', error.message)
                return null
            }
            return data as Profile
        } catch (err) {
            console.error('fetchProfile 異常:', err)
            return null
        }
    }, [])

    const refreshProfile = useCallback(async () => {
        if (user) {
            const p = await fetchProfile(user.id)
            setProfile(p)
        }
    }, [user, fetchProfile])

    useEffect(() => {
        let mounted = true;

        // Supabase 的 onAuthStateChange 訂閱後會立即觸發 INITIAL_SESSION，
        // 包含目前的 session 狀態，因此不需要另外呼叫 getSession。
        // 統一由此處管理 user、profile、loading，確保狀態不會競態衝突。
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth 事件觸發:', event)
            const currentUser = session?.user ?? null

            // 先同步更新 user
            setUser(currentUser)

            if (currentUser) {
                // 取得 profile 後才將 loading 設為 false
                const p = await fetchProfile(currentUser.id)
                if (!mounted) return;
                setProfile(p)
            } else {
                setProfile(null)
            }

            // profile 已就緒，關閉 loading
            if (mounted) setLoading(false)
        })

        // 安全機制：若 10 秒內 onAuthStateChange 都沒觸發（極端情況），強制解除 loading
        const safetyTimer = setTimeout(() => {
            if (mounted) {
                console.warn('驗證初始化超過 10 秒，強行解除載入狀態。')
                setLoading(false)
            }
        }, 10000);

        return () => {
            mounted = false;
            subscription.unsubscribe()
            clearTimeout(safetyTimer)
        }
    }, [fetchProfile])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setProfile(null)
            setUser(null)
        } catch (err) {
            console.error('登出失敗:', err)
        }
    }

    const value = {
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        isPending: profile?.status === 'pending',
        signOut,
        refreshProfile
    }

    // 雖然 loading 時顯示動畫，但這是被 AuthProvider 正確控制的
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="text-gray-500 font-medium">系統驗證中...</div>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
