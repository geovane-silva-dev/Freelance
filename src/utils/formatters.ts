export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0min';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}min`;
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function daysBetween(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysUntil(dueDateStr?: string): { days: number; isOverdue: boolean; isToday: boolean } {
  if (!dueDateStr) return { days: 999, isOverdue: false, isToday: false };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr.split('T')[0] + 'T00:00:00');
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays,
    isOverdue: diffDays < 0,
    isToday: diffDays === 0,
  };
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const processRow = (row: (string | number)[]) => {
    return row
      .map((val) => {
        let str = String(val ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          str = `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      })
      .join(';');
  };

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportToJson(filename: string, data: unknown): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `${filename}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Retorna a data no fuso horário local do usuário no formato YYYY-MM-DD.
 * Evita o bug de toISOString() que pula para o dia seguinte em fusos negativos (ex: Brasil UTC-3 no período noturno).
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

