import { create } from "zustand";
import { WasteRecordInput } from "../types/wasteRecord";

type WasteEntryStore = {
  tableData: WasteRecordInput[];
  addRecord: (record: WasteRecordInput) => void;
  updateRecord: (key: string, updated: Partial<WasteRecordInput>) => void;
  deleteRecord: (key: string) => void;
  setRecords: (records: WasteRecordInput[]) => void;
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
