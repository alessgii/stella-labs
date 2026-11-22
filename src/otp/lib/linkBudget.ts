import {
  LINK_BUDGET_DEFAULTS,
  type LinkBudgetInput,
} from '../data/linkBudgetDefaults';

export interface LinkBudgetOutput {
  length_km: number;
  fiberLoss_dB: number;
  spliceLoss_dB: number;
  connectorLoss_dB: number;
  otherLoss_dB: number;
  totalAttenuation_dB: number;
  rxPowerMin_dBm: number;
  rxPowerMax_dBm: number;
  margin_dB: number;
  status: 'green' | 'yellow' | 'red';
  meetsMargin: boolean;
  needsAttenuator: boolean;
  chromaticDispersion_ps: number;
  pmd_ps: number;
  remediationSuggestions: { es: string[]; en: string[] };
}

/**
 * Pure optical link budget calculator matching the step-by-step memory of calculation:
 *   A_T    = L_km * alpha + n_empalmes * a_emp + n_pares_conector * a_con + A_otros
 *   P_RX   = P_TX - A_T
 *   Margen = P_RX - Sens_RX
 */
export function calculateLinkBudget(
  partialInput: Partial<LinkBudgetInput> = {},
): LinkBudgetOutput {
  const input: LinkBudgetInput = { ...LINK_BUDGET_DEFAULTS, ...partialInput };

  const length_km = input.length_m / 1000;
  const fiberLoss_dB = Number((length_km * input.attenuationDbPerKm).toFixed(2));
  const spliceLoss_dB = Number((input.spliceCount * input.spliceLossDb).toFixed(2));
  const connectorLoss_dB = Number(
    (input.connectorPairs * input.connectorLossDb).toFixed(2),
  );
  const otherLoss_dB = Number(
    ((input.includeCwdmMux ? input.cwdmMuxLossDb : 0) + input.extraLossDb).toFixed(2),
  );

  const totalAttenuation_dB = Number(
    (fiberLoss_dB + spliceLoss_dB + connectorLoss_dB + otherLoss_dB).toFixed(2),
  );
  const rxPowerMin_dBm = Number(
    (input.txPowerMinDbm - totalAttenuation_dB).toFixed(2),
  );
  const rxPowerMax_dBm = Number(
    (input.txPowerMaxDbm - totalAttenuation_dB).toFixed(2),
  );
  const margin_dB = Number(
    (rxPowerMin_dBm - input.rxSensitivityDbm).toFixed(2),
  );

  const meetsMargin = margin_dB >= input.recommendedMarginDb;
  const needsAttenuator = rxPowerMax_dBm > input.rxOverloadDbm;

  let status: 'green' | 'yellow' | 'red' = 'green';
  if (margin_dB < 1.0) {
    status = 'red';
  } else if (margin_dB < input.recommendedMarginDb) {
    status = 'yellow';
  }

  // Chromatic dispersion (G.652.D near 1310 nm zero-dispersion ~1 ps/(nm*km), spectral width 0.5 nm)
  const chromaticDispersion_ps = Number((1.0 * length_km * 0.5).toFixed(2));
  // PMD = 0.2 ps/sqrt(km) * sqrt(L_km)
  const pmd_ps = Number((0.2 * Math.sqrt(Math.max(0, length_km))).toFixed(2));

  const remediationSuggestions = {
    es: !meetsMargin
      ? [
          'Sustituir transceptor 10GBASE-LR (−8.2 dBm) por clase 10GBASE-ER (40 km, P_TX ≥ −4.7 dBm, Sens_RX −15.8 dBm).',
          'Reducir empalmes intermedios o usar conectores de ultra baja pérdida (≤ 0.25 dB por par).',
          'Elegir un multiplexor CWDM de menor número de canales (menor pérdida de inserción).',
        ]
      : [],
    en: !meetsMargin
      ? [
          'Upgrade transceiver from 10GBASE-LR (−8.2 dBm) to 10GBASE-ER class (40 km, P_TX ≥ −4.7 dBm, Sens_RX −15.8 dBm).',
          'Reduce intermediate splices or use ultra-low-loss connectors (≤ 0.25 dB per mated pair).',
          'Select a lower-channel CWDM mux/demux with lower insertion loss.',
        ]
      : [],
  };

  return {
    length_km: Number(length_km.toFixed(3)),
    fiberLoss_dB,
    spliceLoss_dB,
    connectorLoss_dB,
    otherLoss_dB,
    totalAttenuation_dB,
    rxPowerMin_dBm,
    rxPowerMax_dBm,
    margin_dB,
    status,
    meetsMargin,
    needsAttenuator,
    chromaticDispersion_ps,
    pmd_ps,
    remediationSuggestions,
  };
}
