import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../types/database'

export type AuthErrorCode = 'profile_timeout' | 'profile_unavailable'

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    authErrorCode: AuthErrorCode | null;
    isAdmin: boolean;
    isPending: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const PROFILE_LOAD_TIMEOUT_MS = 5000
const PROFILE_TIMEOUT_TOKEN = 'profile_timeout'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [authErrorCode, setAuthErrorCode] = useState<AuthErrorCode | null>(null)
    const authRequestIdRef = useRef(0)
    const isMountedRef = useRef(true)

    const fetchProfileWithTimeout = useCallback(async (userId: string): Promise<{ profile: Profile | null, errorCode: AuthErrorCode | null }> => {
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined
        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutHandle = setTimeout(() => {
                    reject(new Error(PROFILE_TIMEOUT_TOKEN))
                }, PROFILE_LOAD_TIMEOUT_MS)
            })
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle()

            const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as { data: Profile | null, error: { message: string } | null }

            if (error) {
                console.warn('獲取 Profile 出錯:', error.message)
                return { profile: null, errorCode: 'profile_unavailable' }
            }
            if (!data) {
                console.warn('Profile 不存在或尚未建立:', userId)
                return { profile: null, errorCode: 'profile_unavailable' }
            }

            return { profile: data as Profile, errorCode: null }
        } catch (err) {
            if (err instanceof Error && err.message === PROFILE_TIMEOUT_TOKEN) {
                console.warn('Profile 讀取逾時:', userId)
                return { profile: null, errorCode: 'profile_timeout' }
            }

            console.error('fetchProfile 異常:', err)
            return { profile: null, errorCode: 'profile_unavailable' }
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle)
        }
    }, [])

    const applySession = useCallback(async (session: Session | null, source: string, options?: { startLoading?: boolean }) => {
        const requestId = ++authRequestIdRef.current

        if (options?.startLoading) {
            setLoading(true)
        }
        setAuthErrorCode(null)

        const currentUser = session?.user ?? null

        if (!currentUser) {
            if (!isMountedRef.current || requestId !== authRequestIdRef.current) return
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
        }

        const { profile: nextProfile, errorCode } = await fetchProfileWithTimeout(currentUser.id)
        if (!isMountedRef.current || requestId !== authRequestIdRef.current) return

        if (errorCode || !nextProfile) {
            console.warn(`Auth 初始化失敗 (${source}):`, errorCode ?? 'profile_unavailable')
            setUser(null)
            setProfile(null)
            setAuthErrorCode(errorCode ?? 'profile_unavailable')
            setLoading(false)
            return
        }

        setUser(currentUser)
        setProfile(nextProfile)
        setAuthErrorCode(null)
        setLoading(false)
    }, [fetchProfileWithTimeout])

    const refreshProfile = useCallback(async () => {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
            console.error('refreshProfile 取得 session 失敗:', error.message)
            setUser(null)
            setProfile(null)
            setAuthErrorCode(null)
            setLoading(false)
            return
        }

        await applySession(data.session ?? null, 'REFRESH_PROFILE')
    }, [applySession])

    useEffect(() => {
        isMountedRef.current = true

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            void applySession(session, event)
        })

        void (async () => {
            const { data, error } = await supabase.auth.getSession()
            if (!isMountedRef.current) return

            if (error) {
                console.error('Auth bootstrap getSession 失敗:', error.message)
                setUser(null)
                setProfile(null)
                setAuthErrorCode(null)
                setLoading(false)
                return
            }

            await applySession(data.session ?? null, 'BOOTSTRAP', { startLoading: true })
        })()

        return () => {
            isMountedRef.current = false
            subscription.unsubscribe()
        }
    }, [applySession])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
            setProfile(null)
            setUser(null)
            setAuthErrorCode(null)
            setLoading(false)
        } catch (err) {
            console.error('登出失敗:', err)
        }
    }

    const value = {
        user,
        profile,
        loading,
        authErrorCode,
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
