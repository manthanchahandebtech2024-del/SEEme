import { IBiasDetector } from "../interfaces/IBiasDetector";
import { IAIProvider } from "../interfaces/IAIProvider";
import { BiasFlag } from "../utils/types";

const NAME_PATTERNS = /^[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/gm;
const EMAIL_PATTERN = /[\w.-]+@[\w.-]+\.\w+/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const ADDRESS_PATTERN = /\d+\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)[\s,]*[\w\s]*\d{5}/gi;
const AGE_PATTERN = /\b(?:age|born|dob|date of birth)[\s:]*\d+/gi;
const GENDER_WORDS = /\b(he|she|him|her|his|hers|mr\.|mrs\.|ms\.|sir|madam)\b/gi;

const PRESTIGE = ["harvard","yale","princeton","stanford","mit","columbia","caltech","oxford","cambridge","upenn","dartmouth","brown","cornell","duke","northwestern","uchicago","berkeley","johns hopkins","carnegie mellon","iit","iim"];

export class BiasDetectionService implements IBiasDetector {
  constructor(private aiProvider?: IAIProvider) {}

  stripIdentifiers(text: string): { anonymized: string; flags: BiasFlag[] } {
    const flags: BiasFlag[] = [];
    let anonymized = text;

    if (NAME_PATTERNS.test(text)) {
      anonymized = anonymized.replace(NAME_PATTERNS, "[CANDIDATE]");
      flags.push({ type: "name_removed", description: "Candidate name(s) stripped to prevent name-origin bias", severity: "info" });
    }
    if (EMAIL_PATTERN.test(text)) {
      anonymized = anonymized.replace(EMAIL_PATTERN, "[EMAIL]");
      flags.push({ type: "email_removed", description: "Email address removed", severity: "info" });
    }
    anonymized = anonymized.replace(PHONE_PATTERN, "[PHONE]");
    if (ADDRESS_PATTERN.test(text)) {
      anonymized = anonymized.replace(ADDRESS_PATTERN, "[ADDRESS]");
      flags.push({ type: "address_removed", description: "Physical address stripped", severity: "info" });
    }
    if (AGE_PATTERN.test(text)) {
      anonymized = anonymized.replace(AGE_PATTERN, "[AGE_REDACTED]");
      flags.push({ type: "age_indicator", description: "Age-related information removed", severity: "warning" });
    }
    const genderMatches = text.match(GENDER_WORDS);
    if (genderMatches) {
      anonymized = anonymized.replace(GENDER_WORDS, "[PRONOUN]");
      flags.push({ type: "gender_indicator", description: `${genderMatches.length} gendered term(s) neutralized`, severity: "warning" });
    }
    const lowerText = text.toLowerCase();
    const found = PRESTIGE.filter((u) => lowerText.includes(u));
    if (found.length > 0) {
      flags.push({ type: "prestige_bias_risk", description: `Prestige institution detected (${found.join(", ")}). Scored on skills, not brand.`, severity: "warning" });
    }
    return { anonymized, flags };
  }

  async detectSubtleBias(text: string): Promise<BiasFlag[]> {
    if (!this.aiProvider || this.aiProvider.name === "local") return [];
    try {
      const result = await this.aiProvider.detectSubtleBias(text);
      const flags: BiasFlag[] = [];
      for (const ind of result.subtleBiasIndicators) flags.push({ type: "subtle_bias", description: ind, severity: "warning" });
      for (const issue of result.toneIssues) flags.push({ type: "tone_issue", description: issue, severity: "info" });
      return flags;
    } catch {
      return [];
    }
  }
}
