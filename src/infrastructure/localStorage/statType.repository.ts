import type { IStatType } from "@/core/interfaces";
import type { IStatTypeRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_stat_types";

export class LocalStorageStatTypeRepository implements IStatTypeRepository {
  async getAll(): Promise<IStatType[]> {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async getById(statType: string): Promise<IStatType | null> {
    const list = await this.getAll();
    return list.find((s) => s.statType === statType) ?? null;
  }

  async create(data: Partial<IStatType>): Promise<IStatType> {
    const list = await this.getAll();
    const item: IStatType = {
      statType: data.statType ?? localStorageClient.generateId(),
      label: data.label ?? "",
      icon: data.icon ?? "•",
    };
    list.push(item);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
    return item;
  }

  async update(statType: string, data: Partial<IStatType>): Promise<IStatType> {
    const list = await this.getAll();
    const idx = list.findIndex((s) => s.statType === statType);
    if (idx === -1) throw new Error("Stat type not found");
    list[idx] = { ...list[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list[idx];
  }

  async delete(statType: string): Promise<void> {
    const list = (await this.getAll()).filter((s) => s.statType !== statType);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
  }
}
