import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import {
  ALL_TERMINAL_DEVICES,
  DEMO_FIDS_FLIGHTS,
  type DeviceSpec,
} from '../../data/devices';
import { cadToThreeTuple } from '../../lib/coords';
import { useAppStore } from '../../store/useAppStore';

function drawFidsCanvas(
  canvas: HTMLCanvasElement,
  language: 'es' | 'en',
  blinkOn: boolean,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.fillStyle = '#090D16';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header bar
  ctx.fillStyle = '#005AFF';
  ctx.fillRect(0, 0, canvas.width, 46);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px Inter, sans-serif';
  ctx.fillText(
    language === 'es' ? 'SALIDAS · DEMO' : 'DEPARTURES · DEMO',
    16,
    30,
  );

  // Rows
  ctx.font = '15px Inter, sans-serif';
  DEMO_FIDS_FLIGHTS.forEach((row, idx) => {
    const y = 76 + idx * 36;
    ctx.fillStyle = idx % 2 === 0 ? '#111827' : '#0D1320';
    ctx.fillRect(8, y - 22, canvas.width - 16, 30);

    ctx.fillStyle = '#E2E8F0';
    ctx.fillText(row.time, 16, y);
    ctx.fillStyle = '#38BDF8';
    ctx.fillText(row.flight, 76, y);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText(row.destination.slice(0, 14), 156, y);
    ctx.fillStyle = '#FFF212';
    ctx.fillText(row.gate, 304, y);

    if (row.lastCall) {
      ctx.fillStyle = blinkOn ? '#F59E0B' : '#92400E';
    } else {
      ctx.fillStyle = '#34D399';
    }
    const status = language === 'es' ? row.statusEs : row.statusEn;
    ctx.fillText(status, 344, y);
  });
}

export function FidsScreensLayer() {
  const language = useAppStore((s) => s.language);
  const floorView = useAppStore((s) => s.floorView);
  const explodedOffset = useAppStore((s) => s.explodedOffset);
  const focusedZoneId = useAppStore((s) => s.focusedZoneId);
  const selectedDeviceId = useAppStore((s) => s.selectedDeviceId);
  const selectDevice = useAppStore((s) => s.selectDevice);

  const [blinkOn, setBlinkOn] = useState(true);

  const fidsDevices = useMemo(
    () =>
      ALL_TERMINAL_DEVICES.filter(
        (d) => d.subsystemId === 'fids' && d.buildingId === focusedZoneId,
      ),
    [focusedZoneId],
  );

  // Single shared CanvasTexture updated every 5s (never per frame)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 256;
    canvasRef.current = canvas;
    drawFidsCanvas(canvas, language, true);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (canvasRef.current && texture) {
      drawFidsCanvas(canvasRef.current, language, blinkOn);
      texture.needsUpdate = true;
    }
  }, [language, blinkOn, texture]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setBlinkOn((b) => !b);
    }, 5000);
    return () => window.clearInterval(id);
  }, []);

  const f1Delta = floorView === 'BOTH' ? explodedOffset : 0;

  return (
    <group name="salidas-fids-screens">
      {fidsDevices.map((dev: DeviceSpec, idx) => {
        if (floorView !== 'BOTH' && dev.floor !== floorView) return null;
        const yElev = dev.elev_m + (dev.floor === 'F1' ? f1Delta : 0);
        const pos = cadToThreeTuple(dev.pos_cad[0], dev.pos_cad[1], yElev);
        const selected = selectedDeviceId === dev.id;

        return (
          <group
            key={dev.id}
            position={pos}
            onClick={(e) => {
              e.stopPropagation();
              selectDevice(dev.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'auto';
            }}
          >
            {/* Screen chassis */}
            <mesh>
              <boxGeometry args={[4.2, 2.2, 0.45]} />
              <meshStandardMaterial
                color={selected ? '#005AFF' : '#1E293B'}
                emissive={selected ? '#005AFF' : '#000000'}
                emissiveIntensity={selected ? 0.4 : 0}
              />
            </mesh>
            {/* Front display surface sharing CanvasTexture */}
            {texture && (
              <mesh position={[0, 0, 0.25]}>
                <planeGeometry args={[3.9, 1.95]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
              </mesh>
            )}
            {/* Back display surface */}
            {texture && (
              <mesh position={[0, 0, -0.25]} rotation={[0, Math.PI, 0]}>
                <planeGeometry args={[3.9, 1.95]} />
                <meshBasicMaterial map={texture} toneMapped={false} />
              </mesh>
            )}
            {/* Subtle FIDS indicator badge above key screens */}
            {(selected || idx % 6 === 0) && (
              <Text
                position={[0, 2.2, 0]}
                fontSize={1.5}
                fontWeight={600}
                color={selected ? '#005AFF' : '#6D28D9'}
                outlineWidth={0.28}
                outlineColor="#FFFFFF"
              >
                {selected ? dev.id : 'FIDS'}
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
}
