import { create } from "zustand";
import { WasteRecordDraftInput } from "../types/wasteRecord";

type WasteEntryStore = {
  tableData: WasteRecordDraftInput[];
  addRecord: (record: WasteRecordDraftInput) => void;
  updateRecord: (key: string, updated: Partial<WasteRecordDraftInput>) => void;
  deleteRecord: (key: string) => void;
  setRecords: (records: WasteRecordDraftInput[]) => void;
  clearRecords: () => void;
};

export const useWasteEntryStore = create<WasteEntryStore>((set) => ({
  tableData: [],
  addRecord: (record) =>
    set((state) => ({ tableData: [...state.tableData, record] })),
  updateRecord: (key, updated) =>
    set((state) => ({
      tableData: state.tableData.map((r) =>
        r.key === key ? { ...r, ...updated } : r
      ),
    })),
  deleteRecord: (key) =>
    set((state) => ({
      tableData: state.tableData.filter((r) => r.key !== key),
    })),
  setRecords: (records) => set({ tableData: records }),
  clearRecords: () => set({ tableData: [] }),
}));
