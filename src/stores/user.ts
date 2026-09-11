import { create } from 'zustand'
import type { UserInfo } from '@/types'

interface UserState {
  user: UserInfo | null
  setUser: (user: UserInfo) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  reset: () => set({ user: null })
}))
