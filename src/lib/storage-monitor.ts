export interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
  itemBreakdown: Array<{ key: string; size: number; percentage: number }>;
}

export function getStorageUsage(): StorageUsage {
  let totalUsed = 0;
  const itemBreakdown: Array<{ key: string; size: number; percentage: number }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key) || '';
    const size = (value.length + key.length) * 2;
    totalUsed += size;
    itemBreakdown.push({ key, size, percentage: 0 });
  }

  const total = 5 * 1024 * 1024;
  const percentage = (totalUsed / total) * 100;

  itemBreakdown.forEach((item) => {
    item.percentage = totalUsed === 0 ? 0 : (item.size / totalUsed) * 100;
  });
  itemBreakdown.sort((a, b) => b.size - a.size);

  return { used: totalUsed, total, percentage, itemBreakdown };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function checkStorageQuota(): {
  status: 'ok' | 'warning' | 'critical';
  message: string;
  usage: StorageUsage;
} {
  const usage = getStorageUsage();
  if (usage.percentage > 90) {
    return {
      status: 'critical',
      message: `Storage critically full: ${usage.percentage.toFixed(1)}% (${formatBytes(usage.used)} / ${formatBytes(usage.total)}). Export and archive old data immediately to prevent data loss.`,
      usage,
    };
  }
  if (usage.percentage > 75) {
    return {
      status: 'warning',
      message: `Storage ${usage.percentage.toFixed(1)}% full (${formatBytes(usage.used)} / ${formatBytes(usage.total)}). Consider exporting older records.`,
      usage,
    };
  }
  return { status: 'ok', message: `Storage healthy: ${usage.percentage.toFixed(1)}% used`, usage };
}

export function safeLocalStorageSet(key: string, value: string): { success: boolean; error?: string } {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (e: unknown) {
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || (e as DOMException & { code?: number }).code === 22)) {
      const usage = getStorageUsage();
      return {
        success: false,
        error: `Storage quota exceeded (${usage.percentage.toFixed(1)}% full). Export old data or clear cache.`,
      };
    }
    const message = e instanceof Error ? e.message : 'Unknown error';
    return { success: false, error: `Failed to save: ${message}` };
  }
}
