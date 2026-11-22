import { getSpecialRoomById } from '../data/previews';
import type { SpecialRoomSpec, SpecialUseCase } from '../data/specialRoomTypes';
import { getTenantTemplateSpec, type TenantTemplateSpec } from '../data/templates';
import { getTenantById, TENANT_TIER_SPECS, type Tenant } from '../data/tenants';

export interface InspectableSpace {
  id: string;
  kind: 'tenant' | 'room';
  name: { es: string; en: string };
  buildingId: string;
  floor: 'GF' | 'F1';
  idf: string;
  trayDistance_m: number;
  vrf: string;
  vlanId: number;
  usesFiber: boolean;
  access: 'public' | 'restricted';
  useCase?: SpecialUseCase;
  coreNodeId?: 'N4' | 'N6';
  summary?: { es: string; en: string };
  systems?: string[];
  spec: TenantTemplateSpec;
  tenant?: Tenant;
  room?: SpecialRoomSpec;
}

export function getInspectableSpace(id: string | null): InspectableSpace | undefined {
  if (!id) return undefined;

  const tenant = getTenantById(id);
  if (tenant) {
    const tierSpec = TENANT_TIER_SPECS[tenant.tier];
    return {
      id: tenant.id,
      kind: 'tenant',
      name: tenant.name,
      buildingId: tenant.building,
      floor: tenant.floor,
      idf: tenant.idf,
      trayDistance_m: tenant.trayDistance_m,
      vrf: tenant.vrf,
      vlanId: tenant.vlanId,
      usesFiber: tierSpec.dedicatedFiber || tenant.trayDistance_m > 90,
      access: 'public',
      spec: getTenantTemplateSpec(tenant.template, tenant.tier),
      tenant,
    };
  }

  const room = getSpecialRoomById(id);
  if (room) {
    return {
      id: room.id,
      kind: 'room',
      name: room.name,
      buildingId: room.buildingId,
      floor: 'GF',
      idf: room.idf,
      trayDistance_m: room.trayDistance_m,
      vrf: room.vrf,
      vlanId: room.vlanId,
      usesFiber: room.trayDistance_m > 90 || room.vrf === 'VRF-PWR' || room.id === 'cargo-inspeccion' || room.coreNodeId !== undefined,
      access: room.access,
      useCase: room.useCase,
      coreNodeId: room.coreNodeId,
      summary: room.summary,
      systems: room.systems,
      spec: room.templateSpec,
      room,
    };
  }

  return undefined;
}
