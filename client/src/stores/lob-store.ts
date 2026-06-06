import { create } from 'zustand'

interface ActiveLob {
  id: string
  name: string
  code: string
  icon?: string | null
}

interface LobState {
  activeLob: ActiveLob | null
  setActiveLob: (lob: ActiveLob | null) => void
  userLobIds: string[]
  setUserLobIds: (ids: string[]) => void
}

export const useLobStore = create<LobState>()((set) => ({
  activeLob: null,
  setActiveLob: (lob) => set({ activeLob: lob }),
  userLobIds: [],
  setUserLobIds: (ids) => set({ userLobIds: ids }),
}))
