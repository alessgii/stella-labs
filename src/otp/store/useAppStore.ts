import { create } from 'zustand';
import type { AglPresetMode } from '../data/agl';
import type { TerminalIdfId } from '../data/devices';
import type { FailureId } from '../data/failures';
import type { FiberCableId } from '../data/fiber';
import type { FloorViewMode } from '../data/floors';
import { NAVIGABLE_ZONES, resolveNavigableZoneId, type NavigableZoneId } from '../data/lodZones';
import { POIS } from '../data/poi';
import type { SubsystemId } from '../data/subsystems';
import { getInspectableSpace } from '../lib/inspectableSpace';
import type { SpecialUseCase } from '../data/specialRoomTypes';
import { TOUR_STEPS, type TourTrackId } from '../data/tour';
import type { ZoneCategory } from '../data/zones';
import type { IntrusionEventType } from '../lib/dasFiber';
import type { UplinkSpeedGbps } from '../lib/idfSizing';

export type AppMode = 'passenger' | 'network';
export type Language = 'es' | 'en';
export type CameraProjection = 'ortho' | 'perspective';
export type RenderQuality = 'high' | 'medium' | 'low';
export type LodLevel = 'campus' | 'building' | 'floor' | 'tenant' | 'device';
export type DaliSceneMode = 'day' | 'night' | 'cleaning' | 'emergency';
export type NetworkPresetId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';

export interface NetworkLayersVisibility {
  buildings: boolean;
  coreNodes: boolean;
  racks: boolean;
  cotas: boolean;
  labels: boolean;
  cables: Record<FiberCableId, boolean>;
}

export interface InspectedNetworkElement {
  kind: 'node' | 'rack' | 'cable';
  id: string;
}

export interface AppState {
  mode: AppMode;
  language: Language;
  cameraProjection: CameraProjection;
  quality: RenderQuality;

  // Floor state (shared across both lenses)
  floorView: FloorViewMode;
  explodedOffset: number;
  ghostOtherFloor: boolean;

  // Network & debug visual settings
  xrayOpacity: number;
  debugMode: boolean;
  itOtLens: boolean;

  // LOD focus state (independent of lens: Passenger vs Network)
  hoveredZoneId: NavigableZoneId | null;
  selectedZoneId: NavigableZoneId | null;
  focusedZoneId: NavigableZoneId | null;
  focusedTenantId: string | null;
  selectedSpecialRoomId: string | null;
  activeBuildingSystemFilter: string | null;
  activeUseCaseModal: SpecialUseCase | null;
  localCeilingVisible: boolean;
  localCameraView: 'iso' | 'entrance' | 'top' | 'ceiling' | 'walk';
  localCameraTick: number;
  selectedLocalObjectId: string | null;
  activeLocalSubsystem: 'all' | 'pos' | 'wifi' | 'cctv' | 'signage' | 'uplink';
  ghostLocalFurniture: boolean;
  hoveredLogicalHop: 'endpoint' | 'switch' | 'idf' | 'ring' | 'core' | 'isp' | null;
  tenantCampusTraceActive: boolean;
  tenantIsolationTestTick: number;
  selectedDeviceId: string | null;
  selectedSubsystemId: SubsystemId | null;
  cameraResetTick: number;

  // Passenger Lens state
  activeZoneFilter: ZoneCategory | null;
  selectedPoiId: string | null;
  routeOriginId: string;
  routeTargetId: string | null;
  accessibleRoute: boolean;
  cameraFocusCad: readonly [number, number] | null;
  cameraFocusTick: number;

  // Network Interior (Salidas, Pier, Arrivals) state
  activeBuildingSubsystems: SubsystemId[];
  show90mCircles: boolean;
  selectedIdfId: TerminalIdfId | null;
  idfUplinkSpeeds: Record<TerminalIdfId, UplinkSpeedGbps>;

  // Depth A: AGL / ALCMS state
  aglBrightnessStep: 1 | 2 | 3 | 4 | 5;
  aglPresetMode: AglPresetMode;
  activeAglCircuits: string[];
  showSchematicRunway: boolean;
  aglNightMode: boolean;
  aglFailedLampSimulated: boolean;
  aglCommandTick: number;
  lastAglCommandCircuitId: string;

  // Depth B: Terminal Lighting (BMS / DALI) state
  daliScene: DaliSceneMode;

  // Depth D: Perimeter Fiber DAS state
  dasIntrusionCad: readonly [number, number] | null;
  dasEventType: IntrusionEventType;

  // Phase D: Network Presets, Layers, Pulses, Failures, Inspector, Tour
  networkPreset: NetworkPresetId;
  networkLayers: NetworkLayersVisibility;
  trenchView: boolean;
  threeLayerView: boolean;
  pulsesRunning: boolean;
  pulseSpeed: number;
  showPulses: boolean;
  activeFailureId: FailureId | null;
  inspectedElement: InspectedNetworkElement | null;
  distributionFiberCount: number;
  ring1LoadGbps: number;
  ring2LoadGbps: number;
  tourActive: boolean;
  tourTrack: TourTrackId;
  tourStepIndex: number;
  presentationMode: boolean;

  // Actions
  setMode: (mode: AppMode) => void;
  setLanguage: (language: Language) => void;
  setCameraProjection: (projection: CameraProjection) => void;
  setQuality: (quality: RenderQuality) => void;
  setFloorView: (floorView: FloorViewMode) => void;
  setExplodedOffset: (offset: number) => void;
  setGhostOtherFloor: (ghost: boolean) => void;
  setXrayOpacity: (opacity: number) => void;
  setDebugMode: (debug: boolean) => void;
  setItOtLens: (enabled: boolean) => void;

  setHoveredZoneId: (zoneId: NavigableZoneId | null) => void;
  selectZone: (zoneId: NavigableZoneId | null, force?: boolean) => void;
  enterZone: (zoneId: NavigableZoneId) => void;
  enterTenant: (tenantId: string) => void;
  exitTenant: () => void;
  exitToCampus: () => void;
  selectDevice: (deviceId: string | null, force?: boolean) => void;
  jumpToFiberForDevice: (deviceId: string) => void;
  goUpLod: () => void;
  setSelectedSubsystemId: (id: SubsystemId | null) => void;

  // Passenger Actions
  setActiveZoneFilter: (cat: ZoneCategory | null) => void;
  selectPoi: (poiId: string | null, flyTo?: boolean, force?: boolean) => void;
  setRouteOriginId: (poiId: string) => void;
  startRouteToPoi: (targetPoiId: string) => void;
  clearRoute: () => void;
  setAccessibleRoute: (accessible: boolean) => void;

  // Network Interior Actions
  toggleBuildingSubsystem: (id: SubsystemId) => void;
  clearBuildingSubsystems: () => void;
  setShow90mCircles: (show: boolean) => void;
  selectIdf: (idfId: TerminalIdfId | null, force?: boolean) => void;
  setIdfUplinkSpeed: (idfId: TerminalIdfId, speed: UplinkSpeedGbps) => void;

  // Depth A Actions
  setAglBrightnessStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setAglPresetMode: (preset: AglPresetMode) => void;
  toggleAglCircuit: (circuitId: string) => void;
  setShowSchematicRunway: (show: boolean) => void;
  setAglNightMode: (night: boolean) => void;
  setAglFailedLampSimulated: (failed: boolean) => void;
  sendAglCommand: (circuitId?: string) => void;

  // Depth B Actions
  setDaliScene: (scene: DaliSceneMode) => void;

  // Depth D Actions
  triggerDasIntrusion: (cad: readonly [number, number] | null, eventType?: IntrusionEventType) => void;
  setDasEventType: (eventType: IntrusionEventType) => void;

  // Phase D Actions
  applyNetworkPreset: (preset: NetworkPresetId) => void;
  toggleNetworkLayer: (key: keyof Omit<NetworkLayersVisibility, 'cables'>) => void;
  toggleCableVisibility: (cableId: FiberCableId) => void;
  setTrenchView: (trench: boolean) => void;
  setThreeLayerView: (threeLayer: boolean) => void;
  setPulsesRunning: (running: boolean) => void;
  setPulseSpeed: (speed: number) => void;
  setShowPulses: (show: boolean) => void;
  setActiveFailureId: (failureId: FailureId | null) => void;
  setInspectedElement: (el: InspectedNetworkElement | null, force?: boolean) => void;
  setDistributionFiberCount: (count: number) => void;
  setRing1LoadGbps: (load: number) => void;
  setRing2LoadGbps: (load: number) => void;
  startTour: (track?: TourTrackId) => void;
  stopTour: () => void;
  setTourStep: (index: number) => void;
  setPresentationMode: (enabled: boolean) => void;
  toggleLocalCeiling: () => void;
  setLocalCameraView: (view: 'iso' | 'entrance' | 'top' | 'ceiling' | 'walk') => void;
  selectLocalObject: (objectId: string | null) => void;
  setActiveLocalSubsystem: (sub: 'all' | 'pos' | 'wifi' | 'cctv' | 'signage' | 'uplink') => void;
  toggleGhostLocalFurniture: () => void;
  setHoveredLogicalHop: (hop: 'endpoint' | 'switch' | 'idf' | 'ring' | 'core' | 'isp' | null) => void;
  setTenantCampusTraceActive: (active: boolean) => void;
  selectSpecialRoom: (roomId: string | null) => void;
  setActiveBuildingSystemFilter: (sys: string | null) => void;
  setActiveUseCaseModal: (uc: SpecialUseCase | null) => void;
  triggerTenantIsolationTest: () => void;
}

function getInitialDebugFlag(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

function getInitialUrlDeepLink(): {
  mode: AppMode;
  focusedZoneId: NavigableZoneId | null;
  focusedTenantId: string | null;
  floorView: FloorViewMode;
} {
  if (typeof window === 'undefined') {
    return { mode: 'passenger', focusedZoneId: null, focusedTenantId: null, floorView: 'BOTH' };
  }
  const params = new URLSearchParams(window.location.search);
  const lensParam = params.get('lens');
  const tenantParam = params.get('tenant');
  const mode: AppMode = lensParam === 'red' || lensParam === 'network' ? 'network' : 'passenger';
  if (tenantParam) {
    const space = getInspectableSpace(tenantParam);
    if (space) {
      return {
        mode,
        focusedZoneId: resolveNavigableZoneId(space.buildingId) ?? 'departures',
        focusedTenantId: space.id,
        floorView: space.floor,
      };
    }
  }
  return { mode, focusedZoneId: null, focusedTenantId: null, floorView: 'BOTH' };
}

const INITIAL_DEEP_LINK = getInitialUrlDeepLink();

export function deriveLodLevel(
  state: Pick<AppState, 'focusedZoneId' | 'focusedTenantId' | 'selectedDeviceId' | 'floorView'>,
): LodLevel {
  if (state.selectedDeviceId) return 'device';
  if (state.focusedTenantId) return 'tenant';
  if (state.focusedZoneId) {
    return state.floorView === 'BOTH' ? 'building' : 'floor';
  }
  return 'campus';
}

export function hasActiveModal(
  state: Pick<
    AppState,
    | 'selectedZoneId'
    | 'selectedPoiId'
    | 'selectedDeviceId'
    | 'selectedIdfId'
    | 'inspectedElement'
  >,
): boolean {
  return (
    state.selectedZoneId !== null ||
    state.selectedPoiId !== null ||
    state.selectedDeviceId !== null ||
    state.selectedIdfId !== null ||
    state.inspectedElement !== null
  );
}

function layersForPreset(preset: NetworkPresetId): NetworkLayersVisibility {
  const allCables: Record<FiberCableId, boolean> = {
    NUCLEO_ANILLO1_RUTA_A: preset === '01' || preset === '04',
    NUCLEO_ANILLO2_RUTA_B: preset === '01' || preset === '04',
    DISTRIB_TERMINAL: preset === '01' || preset === '05',
    DISTRIB_AIRSIDE: preset === '01' || preset === '06',
    DISTRIB_CARGA: preset === '01' || preset === '07',
    DISTRIB_PERIMETRO: preset === '01' || preset === '08',
  };
  return {
    buildings: true,
    coreNodes: preset !== '02',
    racks: preset === '01' || ['05', '06', '07', '08'].includes(preset),
    cotas: preset === '02',
    labels: true,
    cables: allCables,
  };
}

export const useAppStore = create<AppState>((set) => ({
  mode: INITIAL_DEEP_LINK.mode,
  language: 'es',
  cameraProjection: 'ortho',
  quality: 'high',

  floorView: INITIAL_DEEP_LINK.floorView,
  explodedOffset: 0,
  ghostOtherFloor: true,

  xrayOpacity: 0.25,
  debugMode: getInitialDebugFlag(),
  itOtLens: false,

  hoveredZoneId: null,
  selectedZoneId: null,
  focusedZoneId: INITIAL_DEEP_LINK.focusedZoneId,
  focusedTenantId: INITIAL_DEEP_LINK.focusedTenantId,
  selectedSpecialRoomId: null,
  activeBuildingSystemFilter: null,
  activeUseCaseModal: null,
  selectedDeviceId: null,
  selectedSubsystemId: null,
  cameraResetTick: 0,
  localCeilingVisible: true,
  localCameraView: 'iso',
  localCameraTick: 0,
  selectedLocalObjectId: null,
  activeLocalSubsystem: 'pos',
  ghostLocalFurniture: true,
  hoveredLogicalHop: null,
  tenantCampusTraceActive: false,
  tenantIsolationTestTick: 0,

  activeZoneFilter: null,
  selectedPoiId: null,
  routeOriginId: 'poi-my-location',
  routeTargetId: null,
  accessibleRoute: false,
  cameraFocusCad: null,
  cameraFocusTick: 0,

  activeBuildingSubsystems: ['fids', 'cupps', 'cctv', 'bhs', 'pbb_400hz_pca', 'lighting_dali'],
  show90mCircles: true,
  selectedIdfId: null,
  idfUplinkSpeeds: {
    R1_T: 1,
    R2_T: 1,
    R3_T: 1,
    R4_T: 1,
    R5_T: 1,
    R6_T: 1,
  },

  aglBrightnessStep: 3,
  aglPresetMode: 'night',
  activeAglCircuits: [
    'AGL-TWY-L-CL',
    'AGL-TWY-L-EDGE',
    'AGL-TWY-K-CL',
    'AGL-TWY-K-EDGE',
    'AGL-APRON-FLOOD',
  ],
  showSchematicRunway: false,
  aglNightMode: false,
  aglFailedLampSimulated: false,
  aglCommandTick: 0,
  lastAglCommandCircuitId: 'AGL-TWY-L-CL',

  daliScene: 'day',

  dasIntrusionCad: null,
  dasEventType: 'climb',

  networkPreset: '01',
  networkLayers: layersForPreset('01'),
  trenchView: false,
  threeLayerView: false,
  pulsesRunning: true,
  pulseSpeed: 1,
  showPulses: true,
  activeFailureId: null,
  inspectedElement: null,
  distributionFiberCount: 24,
  ring1LoadGbps: 30,
  ring2LoadGbps: 40,
  tourActive: false,
  tourTrack: 'systems',
  tourStepIndex: 0,
  presentationMode: false,

  setMode: (mode) => set({ mode }),
  setLanguage: (language) => set({ language }),
  setCameraProjection: (cameraProjection) => set({ cameraProjection }),
  setQuality: (quality) => set({ quality }),
  setFloorView: (floorView) => set({ floorView }),
  setExplodedOffset: (explodedOffset) => set({ explodedOffset }),
  setGhostOtherFloor: (ghostOtherFloor) => set({ ghostOtherFloor }),
  setXrayOpacity: (xrayOpacity) => set({ xrayOpacity }),
  setDebugMode: (debugMode) => set({ debugMode }),
  setItOtLens: (itOtLens) => set({ itOtLens }),

  setHoveredZoneId: (hoveredZoneId) => set({ hoveredZoneId }),
  selectZone: (selectedZoneId) =>
    set(() => {
      if (selectedZoneId === null) {
        return { selectedZoneId: null };
      }
      return {
        selectedZoneId,
        selectedPoiId: null,
        selectedDeviceId: null,
        selectedIdfId: null,
        inspectedElement: null,
      };
    }),

  enterZone: (zoneId) =>
    set((state) => {
      const zone = NAVIGABLE_ZONES[zoneId];
      const nextFloor: FloorViewMode = zone.hasFloors
        ? state.floorView === 'BOTH'
          ? zone.defaultFloor
          : state.floorView
        : 'GF';
      return {
        focusedZoneId: zoneId,
        focusedTenantId: null,
        selectedZoneId: null,
        selectedPoiId: null,
        selectedDeviceId: null,
        selectedIdfId: null,
        inspectedElement: null,
        floorView: nextFloor,
        cameraResetTick: state.cameraResetTick + 1,
      };
    }),

  enterTenant: (tenantId) =>
    set((state) => {
      const space = getInspectableSpace(tenantId);
      if (!space) return {};
      const parentZone = resolveNavigableZoneId(space.buildingId) ?? 'departures';
      return {
        focusedZoneId: parentZone,
        focusedTenantId: space.id,
        selectedSpecialRoomId: null,
        floorView: space.floor,
        selectedZoneId: null,
        selectedPoiId: null,
        selectedDeviceId: null,
        selectedIdfId: null,
        inspectedElement: null,
        cameraResetTick: state.cameraResetTick + 1,
      };
    }),

  exitTenant: () =>
    set((state) => ({
      focusedTenantId: null,
      selectedDeviceId: null,
      cameraResetTick: state.cameraResetTick + 1,
    })),

  exitToCampus: () =>
    set((state) => ({
      focusedZoneId: null,
      focusedTenantId: null,
      selectedSpecialRoomId: null,
      activeBuildingSystemFilter: null,
      activeUseCaseModal: null,
      selectedZoneId: null,
      selectedPoiId: null,
      selectedDeviceId: null,
      selectedIdfId: null,
      inspectedElement: null,
      floorView: 'BOTH',
      cameraResetTick: state.cameraResetTick + 1,
    })),

  selectDevice: (selectedDeviceId) =>
    set(() => {
      if (selectedDeviceId === null) {
        return { selectedDeviceId: null };
      }
      return {
        selectedDeviceId,
        selectedIdfId: null,
        selectedZoneId: null,
        selectedPoiId: null,
        inspectedElement: null,
      };
    }),

  jumpToFiberForDevice: (deviceId) =>
    set((state) => ({
      mode: 'network',
      focusedZoneId: state.focusedZoneId ?? 'departures',
      selectedDeviceId: deviceId,
      selectedIdfId: null,
      selectedZoneId: null,
      selectedPoiId: null,
      inspectedElement: null,
    })),

  goUpLod: () =>
    set((state) => {
      if (state.tourActive) {
        return { tourActive: false };
      }
      if (state.selectedDeviceId) {
        return { selectedDeviceId: null };
      }
      if (state.selectedIdfId) {
        return { selectedIdfId: null };
      }
      if (state.inspectedElement) {
        return { inspectedElement: null };
      }
      if (state.selectedSpecialRoomId) {
        return { selectedSpecialRoomId: null };
      }
      if (state.focusedTenantId) {
        if (state.tenantCampusTraceActive) {
          return {
            tenantCampusTraceActive: false,
            cameraResetTick: state.cameraResetTick + 1,
          };
        }
        if (state.localCameraView === 'walk') {
          return {
            localCameraView: 'iso',
            localCameraTick: state.localCameraTick + 1,
          };
        }
        if (state.selectedLocalObjectId) {
          return { selectedLocalObjectId: null };
        }
        return {
          focusedTenantId: null,
          selectedLocalObjectId: null,
          localCameraView: 'iso',
          cameraResetTick: state.cameraResetTick + 1,
        };
      }
      if (state.focusedZoneId) {
        return {
          focusedZoneId: null,
          focusedTenantId: null,
          selectedZoneId: null,
          floorView: 'BOTH',
          cameraResetTick: state.cameraResetTick + 1,
        };
      }
      if (state.selectedZoneId) {
        return { selectedZoneId: null };
      }
      return {};
    }),

  setSelectedSubsystemId: (selectedSubsystemId) => set({ selectedSubsystemId }),
  setActiveZoneFilter: (activeZoneFilter) => set({ activeZoneFilter }),

  selectPoi: (poiId, flyTo = true) =>
    set((state) => {
      if (!poiId) return { selectedPoiId: null };
      const poi = POIS.find((p) => p.id === poiId);
      if (!poi) return { selectedPoiId: null };
      return {
        selectedPoiId: poiId,
        selectedZoneId: null,
        selectedDeviceId: null,
        selectedIdfId: null,
        inspectedElement: null,
        floorView: poi.floor,
        cameraFocusCad: flyTo ? poi.pos_cad : state.cameraFocusCad,
        cameraFocusTick: flyTo ? state.cameraFocusTick + 1 : state.cameraFocusTick,
      };
    }),

  setRouteOriginId: (routeOriginId) => set({ routeOriginId }),
  startRouteToPoi: (targetPoiId) =>
    set({
      routeTargetId: targetPoiId,
      selectedPoiId: targetPoiId,
    }),
  clearRoute: () => set({ routeTargetId: null }),
  setAccessibleRoute: (accessibleRoute) => set({ accessibleRoute }),

  toggleBuildingSubsystem: (id) =>
    set((state) => ({
      activeBuildingSubsystems: state.activeBuildingSubsystems.includes(id)
        ? state.activeBuildingSubsystems.filter((x) => x !== id)
        : [...state.activeBuildingSubsystems, id],
    })),

  clearBuildingSubsystems: () => set({ activeBuildingSubsystems: [] }),
  setShow90mCircles: (show90mCircles) => set({ show90mCircles }),
  selectIdf: (selectedIdfId) =>
    set(() => {
      if (selectedIdfId === null) {
        return { selectedIdfId: null };
      }
      return {
        selectedIdfId,
        selectedDeviceId: null,
        selectedZoneId: null,
        selectedPoiId: null,
        inspectedElement: null,
      };
    }),
  setIdfUplinkSpeed: (idfId, speed) =>
    set((state) => ({
      idfUplinkSpeeds: { ...state.idfUplinkSpeeds, [idfId]: speed },
    })),

  setAglBrightnessStep: (step) =>
    set((state) => ({
      aglBrightnessStep: step,
      aglCommandTick: state.aglCommandTick + 1,
    })),

  setAglPresetMode: (preset) =>
    set((state) => {
      if (preset === 'day') {
        return {
          aglPresetMode: 'day',
          aglBrightnessStep: 1,
          aglNightMode: false,
          activeAglCircuits: ['AGL-TWY-L-CL', 'AGL-TWY-K-CL'],
          aglCommandTick: state.aglCommandTick + 1,
        };
      }
      if (preset === 'low-vis') {
        return {
          aglPresetMode: 'low-vis',
          aglBrightnessStep: 5,
          aglNightMode: true,
          activeAglCircuits: [
            'AGL-TWY-L-CL',
            'AGL-TWY-L-EDGE',
            'AGL-TWY-K-CL',
            'AGL-TWY-K-EDGE',
            'AGL-STOP-BARS',
            'AGL-APRON-FLOOD',
          ],
          aglCommandTick: state.aglCommandTick + 1,
        };
      }
      return {
        aglPresetMode: 'night',
        aglBrightnessStep: 3,
        aglNightMode: true,
        activeAglCircuits: [
          'AGL-TWY-L-CL',
          'AGL-TWY-L-EDGE',
          'AGL-TWY-K-CL',
          'AGL-TWY-K-EDGE',
          'AGL-APRON-FLOOD',
        ],
        aglCommandTick: state.aglCommandTick + 1,
      };
    }),

  toggleAglCircuit: (circuitId) =>
    set((state) => ({
      activeAglCircuits: state.activeAglCircuits.includes(circuitId)
        ? state.activeAglCircuits.filter((c) => c !== circuitId)
        : [...state.activeAglCircuits, circuitId],
      lastAglCommandCircuitId: circuitId,
      aglCommandTick: state.aglCommandTick + 1,
    })),

  setShowSchematicRunway: (show) =>
    set((state) => ({
      showSchematicRunway: show,
      activeAglCircuits: show
        ? state.activeAglCircuits.includes('AGL-SCHEMATIC-RWY')
          ? state.activeAglCircuits
          : [...state.activeAglCircuits, 'AGL-SCHEMATIC-RWY']
        : state.activeAglCircuits.filter((c) => c !== 'AGL-SCHEMATIC-RWY'),
      lastAglCommandCircuitId: 'AGL-SCHEMATIC-RWY',
      aglCommandTick: state.aglCommandTick + 1,
    })),

  setAglNightMode: (aglNightMode) => set({ aglNightMode }),
  setAglFailedLampSimulated: (aglFailedLampSimulated) =>
    set((state) => ({
      aglFailedLampSimulated,
      aglCommandTick: state.aglCommandTick + 1,
    })),
  sendAglCommand: (circuitId) =>
    set((state) => ({
      lastAglCommandCircuitId: circuitId ?? state.lastAglCommandCircuitId,
      aglCommandTick: state.aglCommandTick + 1,
    })),

  setDaliScene: (daliScene) => set({ daliScene }),

  triggerDasIntrusion: (dasIntrusionCad, eventType) =>
    set((state) => ({
      dasIntrusionCad,
      dasEventType: eventType ?? state.dasEventType,
    })),
  setDasEventType: (dasEventType) => set({ dasEventType }),

  applyNetworkPreset: (preset) =>
    set({
      networkPreset: preset,
      networkLayers: layersForPreset(preset),
    }),

  toggleNetworkLayer: (key) =>
    set((state) => ({
      networkLayers: {
        ...state.networkLayers,
        [key]: !state.networkLayers[key],
      },
    })),

  toggleCableVisibility: (cableId) =>
    set((state) => ({
      networkLayers: {
        ...state.networkLayers,
        cables: {
          ...state.networkLayers.cables,
          [cableId]: !state.networkLayers.cables[cableId],
        },
      },
    })),

  setTrenchView: (trenchView) => set({ trenchView }),
  setThreeLayerView: (threeLayerView) => set({ threeLayerView }),
  setPulsesRunning: (pulsesRunning) => set({ pulsesRunning }),
  setPulseSpeed: (pulseSpeed) => set({ pulseSpeed }),
  setShowPulses: (showPulses) => set({ showPulses }),

  setActiveFailureId: (activeFailureId) =>
    set((state) => ({
      activeFailureId,
      dasIntrusionCad:
        activeFailureId === 'F12'
          ? [-60.0, -260.0]
          : state.activeFailureId === 'F12'
            ? null
            : state.dasIntrusionCad,
    })),

  setInspectedElement: (inspectedElement) =>
    set(() => {
      if (inspectedElement === null) {
        return { inspectedElement: null };
      }
      return {
        inspectedElement,
        selectedZoneId: null,
        selectedPoiId: null,
        selectedDeviceId: null,
        selectedIdfId: null,
      };
    }),
  setDistributionFiberCount: (distributionFiberCount) =>
    set({ distributionFiberCount }),
  setRing1LoadGbps: (ring1LoadGbps) => set({ ring1LoadGbps }),
  setRing2LoadGbps: (ring2LoadGbps) => set({ ring2LoadGbps }),

  startTour: (track) =>
    set((state) => {
      const nextTrack = track ?? state.tourTrack;
      const steps = TOUR_STEPS.filter((s) => s.track === nextTrack);
      const first = steps[0];
      return {
        tourActive: true,
        tourTrack: nextTrack,
        tourStepIndex: 0,
        mode: first.mode,
        focusedZoneId: first.focusedZoneId,
        focusedTenantId: first.tenantId ?? null,
        tenantCampusTraceActive: false,
        selectedLocalObjectId: null,
        selectedDeviceId: first.selectDeviceId ?? null,
        selectedIdfId: first.selectIdfId ?? null,
        itOtLens: Boolean(first.itOtLens),
        activeFailureId: first.failureId ?? null,
        dasIntrusionCad: first.triggerDasCad ?? null,
        activeUseCaseModal: first.useCase ?? null,
        ...(first.networkPreset
          ? {
              networkPreset: first.networkPreset as NetworkPresetId,
              networkLayers: layersForPreset(first.networkPreset as NetworkPresetId),
            }
          : {}),
        cameraResetTick: state.cameraResetTick + 1,
      };
    }),

  stopTour: () =>
    set({
      tourActive: false,
      presentationMode: false,
    }),

  setTourStep: (index) =>
    set((state) => {
      const steps = TOUR_STEPS.filter((s) => s.track === state.tourTrack);
      const clamped = Math.max(0, Math.min(steps.length - 1, index));
      const step = steps[clamped];
      return {
        tourStepIndex: clamped,
        mode: step.mode,
        focusedZoneId: step.focusedZoneId,
        focusedTenantId: step.tenantId ?? null,
        tenantCampusTraceActive: false,
        selectedLocalObjectId: null,
        selectedDeviceId: step.selectDeviceId ?? null,
        selectedIdfId: step.selectIdfId ?? null,
        itOtLens: Boolean(step.itOtLens),
        activeFailureId: step.failureId ?? null,
        dasIntrusionCad: step.triggerDasCad ?? null,
        activeUseCaseModal: step.useCase ?? null,
        ...(step.networkPreset
          ? {
              networkPreset: step.networkPreset as NetworkPresetId,
              networkLayers: layersForPreset(step.networkPreset as NetworkPresetId),
            }
          : {}),
        cameraResetTick: state.cameraResetTick + 1,
      };
    }),

  setPresentationMode: (presentationMode) => set({ presentationMode }),
  toggleLocalCeiling: () =>
    set((state) => ({ localCeilingVisible: !state.localCeilingVisible })),
  setLocalCameraView: (localCameraView) =>
    set((state) => ({
      localCameraView,
      localCameraTick: state.localCameraTick + 1,
    })),
  selectLocalObject: (selectedLocalObjectId) =>
    set((state) => ({
      selectedLocalObjectId,
      localCameraTick: selectedLocalObjectId
        ? state.localCameraTick + 1
        : state.localCameraTick,
    })),
  setActiveLocalSubsystem: (activeLocalSubsystem) => set({ activeLocalSubsystem }),
  toggleGhostLocalFurniture: () =>
    set((state) => ({ ghostLocalFurniture: !state.ghostLocalFurniture })),
  setHoveredLogicalHop: (hoveredLogicalHop) => set({ hoveredLogicalHop }),
  setTenantCampusTraceActive: (tenantCampusTraceActive) =>
    set((state) => ({
      tenantCampusTraceActive,
      cameraResetTick: state.cameraResetTick + 1,
    })),
  selectSpecialRoom: (selectedSpecialRoomId) => set({ selectedSpecialRoomId }),
  setActiveBuildingSystemFilter: (activeBuildingSystemFilter) =>
    set({ activeBuildingSystemFilter }),
  setActiveUseCaseModal: (activeUseCaseModal) => set({ activeUseCaseModal }),
  triggerTenantIsolationTest: () =>
    set((state) => ({ tenantIsolationTestTick: state.tenantIsolationTestTick + 1 })),
}));
