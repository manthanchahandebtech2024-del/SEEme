import { IAIProvider } from "../../interfaces/IAIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { AzureOpenAIProvider } from "./AzureOpenAIProvider";
import { LocalProvider } from "./LocalProvider";
import { createLogger } from "../../utils/logger";

const logger = createLogger("AIProviderFactory");

export class AIProviderFactory {
  private providers: Map<string, IAIProvider> = new Map();
  private fallback: IAIProvider;

  constructor(
    openaiKey?: string,
    geminiKey?: string,
    openaiModel?: string,
    geminiModel?: string,
    azureKey?: string,
    azureEndpoint?: string,
    azureDeployment?: string,
    azureApiVersion?: string,
  ) {
    this.fallback = new LocalProvider();
    this.providers.set("local", this.fallback);

    if (azureKey && azureEndpoint) {
      const azure = new AzureOpenAIProvider(azureKey, azureEndpoint, azureDeployment || "gpt-4o-mini", azureApiVersion);
      if (azure.isAvailable) {
        this.providers.set("azure", azure);
        logger.info("Azure OpenAI provider registered");
      }
    }
    if (openaiKey) {
      const openai = new OpenAIProvider(openaiKey, openaiModel);
      if (openai.isAvailable) {
        this.providers.set("openai", openai);
        logger.info("OpenAI provider registered");
      }
    }
    if (geminiKey) {
      const gemini = new GeminiProvider(geminiKey, geminiModel);
      if (gemini.isAvailable) {
        this.providers.set("gemini", gemini);
        logger.info("Gemini provider registered");
      }
    }
  }

  getProvider(preferred?: string): IAIProvider {
    if (preferred && this.providers.has(preferred)) {
      return this.providers.get(preferred)!;
    }
    if (this.providers.has("azure")) return this.providers.get("azure")!;
    if (this.providers.has("openai")) return this.providers.get("openai")!;
    if (this.providers.has("gemini")) return this.providers.get("gemini")!;
    return this.fallback;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
