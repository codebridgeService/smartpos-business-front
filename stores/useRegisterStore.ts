import { create } from "zustand";
import type { Register } from "@/types";
import { registersApi, CreateRegisterRequest, UpdateRegisterRequest } from "@/lib/api/registers";

export interface RegisterState {
  // Data
  registers: Register[];
  activeOutletUuid: string | null;
  isLoading: boolean;
  isInitialLoaded: boolean;
  error: string | null;

  // Actions
  setActiveOutlet: (outletUuid: string | null) => void;
  fetchRegisters: (outletUuid: string) => Promise<void>;
  createRegister: (outletUuid: string, data: CreateRegisterRequest) => Promise<Register>;
  updateRegister: (registerUuid: string, data: UpdateRegisterRequest) => Promise<Register>;
  deleteRegister: (registerUuid: string) => Promise<void>;
  clearError: () => void;
}

export const useRegisterStore = create<RegisterState>((set, get) => ({
  registers: [],
  activeOutletUuid: null,
  isLoading: false,
  isInitialLoaded: false,
  error: null,

  setActiveOutlet: (outletUuid) => {
    set({ activeOutletUuid: outletUuid });
    if (outletUuid) {
      get().fetchRegisters(outletUuid);
    } else {
      set({ registers: [], isInitialLoaded: false });
    }
  },

  fetchRegisters: async (outletUuid) => {
    try {
      set({ isLoading: true, error: null });
      const registers = await registersApi.getRegisters(outletUuid);
      set({ registers, isLoading: false, isInitialLoaded: true });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to fetch registers", 
        isLoading: false 
      });
    }
  },

  createRegister: async (outletUuid, data) => {
    try {
      set({ isLoading: true, error: null });
      const newRegister = await registersApi.createRegister(outletUuid, data);
      set((state) => ({
        registers: [...state.registers, newRegister],
        isLoading: false,
      }));
      return newRegister;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to create register", 
        isLoading: false 
      });
      throw error;
    }
  },

  updateRegister: async (registerUuid, data) => {
    try {
      set({ isLoading: true, error: null });
      const updatedRegister = await registersApi.updateRegister(registerUuid, data);
      set((state) => ({
        registers: state.registers.map((r) => 
          r.uuid === registerUuid ? updatedRegister : r
        ),
        isLoading: false,
      }));
      return updatedRegister;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to update register", 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteRegister: async (registerUuid) => {
    try {
      set({ isLoading: true, error: null });
      await registersApi.deleteRegister(registerUuid);
      set((state) => ({
        registers: state.registers.filter((r) => r.uuid !== registerUuid),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || "Failed to delete register", 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
