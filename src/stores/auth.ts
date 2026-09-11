import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null })
    }),
    {
      name: 'admin-core-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token }) => ({ token })
    }
  )
)
