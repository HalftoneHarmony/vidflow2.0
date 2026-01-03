import { create } from "zustand";

/**
 * 🏪 UI Store
 * 사이드바 토글, 모달 상태 등 순수 UI 상태만 관리
 * (Server State는 반드시 React Query / Server Components 사용)
 */

interface UIState {
    isSidebarOpen: boolean;
    activeModal: string | null;

    toggleSidebar: () => void;
    openModal: (modalId: string) => void;
    closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    isSidebarOpen: true,
    activeModal: null,

    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    openModal: (modalId) => set({ activeModal: modalId }),
    closeModal: () => set({ activeModal: null }),
}));
