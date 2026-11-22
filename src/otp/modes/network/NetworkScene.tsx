import { useAppStore } from '../../store/useAppStore';
import { BhsLayer } from '../passenger/BhsLayer';
import { DaliLightingLayer } from '../passenger/DaliLightingLayer';
import { SpecialBuildingFloorplan } from '../shared/SpecialBuildingFloorplan';
import { AglLayer } from './AglLayer';
import { DasPerimeterLayer } from './DasPerimeterLayer';
import { FailureSimLayer } from './FailureSimLayer';
import { FiberLayer } from './FiberLayer';
import { NodesLayer } from './NodesLayer';
import { PathTrace3DLayer } from './PathTrace3DLayer';
import { SalidasInteriorNet } from './SalidasInteriorNet';
import { TenantCampusTraceLayer } from './TenantCampusTraceLayer';

export function NetworkScene() {
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const tenantCampusTraceActive = useAppStore((s) => s.tenantCampusTraceActive);
  const isTerminalFocused =
    focusedZoneId === 'departures' ||
    focusedZoneId === 'pier' ||
    focusedZoneId === 'arrivals';

  if (tenantCampusTraceActive) {
    return (
      <group name="network-mode-scene">
        <TenantCampusTraceLayer />
      </group>
    );
  }

  return (
    <group name="network-mode-scene">
      <FiberLayer />
      <NodesLayer />
      <FailureSimLayer />
      <AglLayer />
      <DasPerimeterLayer />
      <PathTrace3DLayer />
      {(focusedZoneId === 'ssei' || focusedZoneId === 'cargo') && (
        <SpecialBuildingFloorplan />
      )}
      {isTerminalFocused && (
        <>
          <SalidasInteriorNet />
          <DaliLightingLayer />
          <BhsLayer />
        </>
      )}
    </group>
  );
}
