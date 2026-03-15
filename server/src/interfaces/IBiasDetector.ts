import { BiasFlag } from "../utils/types";

export interface IBiasDetector {
  stripIdentifiers(text: string): { anonymized: string; flags: BiasFlag[] };
  detectSubtleBias(text: string): Promise<BiasFlag[]>;
}
