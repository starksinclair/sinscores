import type { IStatTypeRepository } from "@/core/interfaces";
import type { IStatType } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { StatTypeMapper } from "./mappers";

const STAT_TYPES_TAB = "Stat_Types";

const DEFAULT_STAT_TYPES = ["goal", "assist", "yellow_card", "red_card"];

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsStatTypeRepository implements IStatTypeRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<IStatType[]> {
    const rows = await this.client.getRows(STAT_TYPES_TAB);
    return rows
      .filter((_, i) => i > 0)
      .map((row) => StatTypeMapper.fromRow(row));
  }

  async getById(statType: string): Promise<IStatType | null> {
    const all = await this.getAll();
    return all.find((s) => s.statType === statType) ?? null;
  }

  async create(data: Partial<IStatType>): Promise<IStatType> {
    const statType: IStatType & { isDefault?: boolean } = {
      statType: data.statType ?? "",
      label: data.label ?? "",
      icon: data.icon ?? "",
      isDefault: false,
    };
    const row = StatTypeMapper.toRow(statType);
    await this.client.appendRow(STAT_TYPES_TAB, row);
    return {
      statType: statType.statType,
      label: statType.label,
      icon: statType.icon,
    };
  }

  async update(statType: string, data: Partial<IStatType>): Promise<IStatType> {
    const rows = await this.client.getRows(STAT_TYPES_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === statType,
    );
    if (rowIndex < 0) {
      throw new Error(`Stat type not found: ${statType}`);
    }
    const existing = StatTypeMapper.fromRow(rows[rowIndex]);
    const merged: IStatType & { isDefault?: boolean } = {
      ...existing,
      ...data,
      statType: existing.statType,
    };
    const row = StatTypeMapper.toRow(merged);
    await this.client.updateRow(STAT_TYPES_TAB, rowIndex, row);
    return {
      statType: merged.statType,
      label: merged.label,
      icon: merged.icon,
    };
  }

  async delete(statType: string): Promise<void> {
    if (DEFAULT_STAT_TYPES.includes(statType)) {
      throw new Error(`Cannot delete default stat type: ${statType}`);
    }
    const rows = await this.client.getRows(STAT_TYPES_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === statType,
    );
    if (rowIndex < 0) {
      throw new Error(`Stat type not found: ${statType}`);
    }
    const existing = StatTypeMapper.fromRow(rows[rowIndex]);
    if (existing.isDefault) {
      throw new Error(`Cannot delete default stat type: ${statType}`);
    }
    await this.client.deleteRow(STAT_TYPES_TAB, rowIndex);
  }
}
