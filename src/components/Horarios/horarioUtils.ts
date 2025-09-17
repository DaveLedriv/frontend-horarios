const pad = (value: number) => value.toString().padStart(2, '0');

export const SLOT_DURATION_MINUTES = 30;
export const GRID_START_MINUTES = 7 * 60; // 07:00
export const GRID_END_MINUTES = 21 * 60; // 21:00

export const minutesToTimeKey = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}:00`;
};

export const minutesToLabel = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${pad(hours)}:${pad(minutes)}`;
};

export const timeKeyToMinutes = (timeKey: string): number => {
  const [hoursStr, minutesStr] = timeKey.split(':');
  const hours = Number.parseInt(hoursStr ?? '0', 10);
  const minutes = Number.parseInt(minutesStr ?? '0', 10);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return Number.NaN;
  }
  return hours * 60 + minutes;
};

export const createTimeSlots = () => {
  const slots: { label: string; timeKey: string }[] = [];
  for (
    let minutes = GRID_START_MINUTES;
    minutes <= GRID_END_MINUTES;
    minutes += SLOT_DURATION_MINUTES
  ) {
    slots.push({ label: minutesToLabel(minutes), timeKey: minutesToTimeKey(minutes) });
  }
  return slots;
};
