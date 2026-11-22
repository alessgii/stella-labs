import { useAppStore } from '../../store/useAppStore';
import { AglLayer } from '../network/AglLayer';
import { DasPerimeterLayer } from '../network/DasPerimeterLayer';
import { SpecialBuildingFloorplan } from '../shared/SpecialBuildingFloorplan';
import { BhsLayer } from './BhsLayer';
import { DaliLightingLayer } from './DaliLightingLayer';
import { DeparturesInteriorPax } from './DeparturesInteriorPax';
import { FidsScreensLayer } from './FidsScreensLayer';
import { PoiLayer } from './PoiLayer';
import { RouteLayer } from './RouteLayer';
import { ZonesLayer } from './ZonesLayer';

export function PassengerScene() {
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const isTerminalFocused =
    focusedZoneId === 'departures' ||
    focusedZoneId === 'pier' ||
    focusedZoneId === 'arrivals';

  return (
    <group name="passenger-mode-scene">
      <ZonesLayer />
      <PoiLayer />
      <RouteLayer />
      {(focusedZoneId === 'airside' || focusedZoneId === 'tower') && <AglLayer />}
      {focusedZoneId === 'perimeter' && <DasPerimeterLayer />}

      {/* Lazy building interior instantiated only when entered */}
      {focusedZoneId === 'departures' && <DeparturesInteriorPax />}
      {(focusedZoneId === 'ssei' || focusedZoneId === 'cargo') && (
        <SpecialBuildingFloorplan />
      )}
      {isTerminalFocused && (
        <>
          <FidsScreensLayer />
          <DaliLightingLayer />
          <BhsLayer />
        </>
      )}
    </group>
  );
}
