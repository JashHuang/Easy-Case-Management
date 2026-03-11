/* @vitest-environment jsdom */
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import type { Profile } from '../types/database'

type MockSession = { user: { id: string, email: string } } | null
type ProfileResult = { data: Profile | null, error: { message: string } | null }
type ProfileResponder = () => Promise<ProfileResult>
type AuthCallback = (event: string, session: MockSession) => void

const state = vi.hoisted(() => ({
  getSessionResult: { data: { session: null as MockSession }, error: null as { message: string } | null },
  profileResponders: [] as ProfileResponder[],
  authCallbacks: [] as AuthCallback[],
}))

const mockSupabase = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(async () => state.getSessionResult),
    onAuthStateChange: vi.fn((callback: AuthCallback) => {
      state.authCallbacks.push(callback)
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(() => {
              const idx = state.authCallbacks.indexOf(callback)
              if (idx >= 0) state.authCallbacks.splice(idx, 1)
            }),
          },
        },
      }
    }),
    signOut: vi.fn(async () => ({ error: null })),
    signInWithPassword: vi.fn(async () => ({ error: null })),
  },
  from: vi.fn((table: string) => {
    if (table !== 'profiles') {
      throw new Error(`Unexpected table in auth test: ${table}`)
    }

    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => {
            const responder = state.profileResponders.shift()
            if (responder) {
              return responder()
            }
            return { data: null, error: null }
          }),
        })),
      })),
    }
  }),
}))

vi.mock('../services/supabaseClient', () => ({
  supabase: mockSupabase,
}))

import { AuthProvider } from '../context/AuthContext'
import { ProtectedRoute } from '../App'
import Login from '../pages/Login'

function buildProfile(userId: string, overrides?: Partial<Profile>): Profile {
  return {
    id: userId,
    email: `${userId}@example.com`,
    role: 'user',
    status: 'active',
    created_at: '2026-03-07T00:00:00.000Z',
    ...overrides,
  }
}

function setBootstrapSession(userId: string | null) {
  if (!userId) {
    state.getSessionResult = { data: { session: null }, error: null }
    return
  }

  state.getSessionResult = {
    data: {
      session: {
        user: {
          id: userId,
          email: `${userId}@example.com`,
        },
      },
    },
    error: null,
  }
}

function enqueueProfileSuccess(profile: Profile) {
  state.profileResponders.push(async () => ({ data: profile, error: null }))
}

function enqueueProfileError(message: string) {
  state.profileResponders.push(async () => ({ data: null, error: { message } }))
}

function enqueueProfileNeverResolve() {
  state.profileResponders.push(() => new Promise<ProfileResult>(() => undefined))
}

function enqueueDeferredProfile() {
  let resolveFn: ((value: ProfileResult) => void) | null = null
  const pendingPromise = new Promise<ProfileResult>((resolve) => {
    resolveFn = resolve
  })
  state.profileResponders.push(() => pendingPromise)

  return {
    resolve(value: ProfileResult) {
      if (!resolveFn) {
        throw new Error('Deferred resolver not initialized')
      }
      resolveFn(value)
    },
  }
}

function emitAuthEvent(event: string, session: MockSession) {
  const callbacks = [...state.authCallbacks]
  callbacks.forEach((cb) => cb(event, session))
}

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}{location.search}</div>
}

function renderAuthRoutes(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/pending" element={<div>PendingPage</div>} />
            <Route
              path="/cases"
              element={(
                <ProtectedRoute>
                  <div>CasesPage</div>
                </ProtectedRoute>
              )}
            />
            <Route
              path="/users"
              element={(
                <ProtectedRoute adminOnly>
                  <div>UsersPage</div>
                </ProtectedRoute>
              )}
            />
          </Routes>
          <LocationProbe />
        </>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('auth reload flow', () => {
  beforeEach(() => {
    cleanup()
    vi.useRealTimers()
    state.getSessionResult = { data: { session: null }, error: null }
    state.profileResponders = []
    state.authCallbacks = []
    mockSupabase.auth.getSession.mockClear()
    mockSupabase.auth.onAuthStateChange.mockClear()
    mockSupabase.from.mockClear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('allows protected route when bootstrap session and profile both succeed', async () => {
    setBootstrapSession('active-user')
    enqueueProfileSuccess(buildProfile('active-user'))

    renderAuthRoutes('/cases')

    await waitFor(() => {
      expect(screen.queryByText('CasesPage')).not.toBeNull()
    })
    expect(screen.getByTestId('location').textContent).toBe('/cases')
  })

  it('ignores stale profile response when a newer SIGNED_OUT event wins', async () => {
    setBootstrapSession('slow-user')
    const deferred = enqueueDeferredProfile()

    renderAuthRoutes('/cases')

    await waitFor(() => {
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      emitAuthEvent('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(screen.queryByText('登入案件管理系統')).not.toBeNull()
    })

    await act(async () => {
      deferred.resolve({ data: buildProfile('slow-user'), error: null })
      await Promise.resolve()
    })

    expect(screen.getByTestId('location').textContent).toBe('/login')
    expect(screen.queryByText('CasesPage')).toBeNull()
  })

  it('redirects to login with profile_timeout when profile query exceeds 5s', async () => {
    vi.useFakeTimers()
    setBootstrapSession('timeout-user')
    enqueueProfileNeverResolve()

    renderAuthRoutes('/cases')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
      await Promise.resolve()
    })

    expect(screen.getByTestId('location').textContent).toBe('/login?reason=profile_timeout')
    expect(screen.queryByText('系統驗證逾時，請重新登入。（代碼：profile_timeout）')).not.toBeNull()
  })

  it('redirects to login with profile_unavailable when profile query fails', async () => {
    setBootstrapSession('error-user')
    enqueueProfileError('profile table unavailable')

    renderAuthRoutes('/cases')

    await waitFor(() => {
      expect(screen.getByTestId('location').textContent).toBe('/login?reason=profile_unavailable')
    })
    expect(screen.queryByText('系統無法讀取權限資料，請重新登入。（代碼：profile_unavailable）')).not.toBeNull()
  })

  it('keeps pending user redirected to /pending', async () => {
    setBootstrapSession('pending-user')
    enqueueProfileSuccess(buildProfile('pending-user', { status: 'pending' }))

    renderAuthRoutes('/cases')

    await waitFor(() => {
      expect(screen.queryByText('PendingPage')).not.toBeNull()
    })
    expect(screen.getByTestId('location').textContent).toBe('/pending')
  })

  it('keeps non-admin user blocked from admin-only route', async () => {
    setBootstrapSession('normal-user')
    enqueueProfileSuccess(buildProfile('normal-user', { role: 'user', status: 'active' }))

    renderAuthRoutes('/users')

    await waitFor(() => {
      expect(screen.queryByText('CasesPage')).not.toBeNull()
    })
    expect(screen.getByTestId('location').textContent).toBe('/cases')
  })
})
