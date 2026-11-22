export interface LinkBudgetInput {
  length_m: number;
  attenuationDbPerKm: number;
  spliceCount: number;
  spliceLossDb: number;
  connectorPairs: number;
  connectorLossDb: number;
  includeCwdmMux: boolean;
  cwdmMuxLossDb: number;
  extraLossDb: number;
  txPowerMinDbm: number;
  txPowerMaxDbm: number;
  rxSensitivityDbm: number;
  rxOverloadDbm: number;
  recommendedMarginDb: number;
}

// Reference values from section 8.2 of Proyecto_Final_Aeropuerto_Plan_Ampliado.md
// Explicitly labeled in UI as reference values to be replaced by manufacturer datasheet
export const LINK_BUDGET_DEFAULTS: LinkBudgetInput = {
  length_m: 1780.95, // Default to Core Ring 1 Route A
  attenuationDbPerKm: 0.35, // OS2 @ 1310 nm
  spliceCount: 4,
  spliceLossDb: 0.1,
  connectorPairs: 2,
  connectorLossDb: 0.5, // Conservative LC/UPC mated pair
  includeCwdmMux: false,
  cwdmMuxLossDb: 2.5, // CWDM mux + demux pair insertion loss
  extraLossDb: 0,
  txPowerMinDbm: -8.2, // SFP+ 10GBASE-LR min TX
  txPowerMaxDbm: 0.5, // SFP+ 10GBASE-LR max TX
  rxSensitivityDbm: -14.4, // SFP+ 10GBASE-LR RX sensitivity
  rxOverloadDbm: 0.5,
  recommendedMarginDb: 3.0,
};

// The 3.2 km worked example from Section 8.3 & 8.4 of the student's document
export const DOCUMENT_EXAMPLE_3_2KM: Partial<LinkBudgetInput> = {
  length_m: 3200,
  spliceCount: 6,
  connectorPairs: 2,
};
