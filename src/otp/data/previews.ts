import { CARGO_ROOMS } from './cargo';
import type { SpecialRoomSpec } from './specialRoomTypes';
import { SSEI_ROOMS } from './ssei';
import { SUBSTATION_ROOMS } from './substation';

export const SPECIAL_ROOMS: SpecialRoomSpec[] = [
  ...SSEI_ROOMS,
  ...SUBSTATION_ROOMS,
  ...CARGO_ROOMS,
];

export function getSpecialRoomById(id: string): SpecialRoomSpec | undefined {
  return SPECIAL_ROOMS.find((r) => r.id === id);
}

export function getRoomsForBuilding(buildingId: 'ssei' | 'cargo'): SpecialRoomSpec[] {
  return SPECIAL_ROOMS.filter((r) => r.buildingId === buildingId);
}

export interface PreviewEntry {
  id: string;
  label: { es: string; en: string };
  passengerUrl: string;
  networkUrl: string;
  demo: true;
}

export const PREVIEW_ENTRIES: PreviewEntry[] = [
  ...SPECIAL_ROOMS.map((r) => ({
    id: r.id,
    label: r.name,
    passengerUrl: `/otp/previews/${r.id}-pasajeros.webp`,
    networkUrl: `/otp/previews/${r.id}-red.webp`,
    demo: true as const,
  })),
  {
    id: 'ssei',
    label: { es: 'Nave Auxiliar SSEI y Subestación', en: 'SSEI & Substation Building' },
    passengerUrl: '/otp/previews/ssei-pasajeros.webp',
    networkUrl: '/otp/previews/ssei-red.webp',
    demo: true,
  },
  {
    id: 'cargo',
    label: { es: 'As World Cargo', en: 'As World Cargo' },
    passengerUrl: '/otp/previews/cargo-pasajeros.webp',
    networkUrl: '/otp/previews/cargo-red.webp',
    demo: true,
  },
];

export function getPreviewUrl(id: string, mode: 'passenger' | 'network'): string {
  const entry = PREVIEW_ENTRIES.find((p) => p.id === id);
  if (!entry) {
    return mode === 'network'
      ? `/otp/previews/${id}-red.webp`
      : `/otp/previews/${id}-pasajeros.webp`;
  }
  return mode === 'network' ? entry.networkUrl : entry.passengerUrl;
}
