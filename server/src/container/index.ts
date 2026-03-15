import { PrismaClient } from "@prisma/client";
import { config } from "../config";
import { EventBus } from "../events/EventBus";
import { AIProviderFactory } from "../services/ai/AIProviderFactory";
import { ParserFactory } from "../services/parsing/ParserFactory";
import { BiasDetectionService } from "../services/BiasDetectionService";
import { DiffEngineService } from "../services/DiffEngineService";
import { GamificationService } from "../services/GamificationService";
import { InMemoryCacheService } from "../services/CacheService";
import { ScoringPipeline } from "../services/scoring/ScoringPipeline";
import { SkillsAnalyzer } from "../services/scoring/SkillsAnalyzer";
import { ExperienceAnalyzer } from "../services/scoring/ExperienceAnalyzer";
import { EducationAnalyzer } from "../services/scoring/EducationAnalyzer";
import { KeywordAnalyzer } from "../services/scoring/KeywordAnalyzer";
import { SemanticAnalyzer } from "../services/scoring/SemanticAnalyzer";
import { AnalysisQueue } from "../queue/AnalysisQueue";
import { UserRepository } from "../repositories/UserRepository";
import { AnalysisRepository } from "../repositories/AnalysisRepository";
import { GameProfileRepository } from "../repositories/GameProfileRepository";
import { BadgeRepository } from "../repositories/BadgeRepository";
import { createLogger } from "../utils/logger";

const logger = createLogger("Container");

export class Container {
  readonly prisma: PrismaClient;
  readonly eventBus: EventBus;
  readonly aiFactory: AIProviderFactory;
  readonly parserFactory: ParserFactory;
  readonly biasDetector: BiasDetectionService;
  readonly diffEngine: DiffEngineService;
  readonly gamification: GamificationService;
  readonly cache: InMemoryCacheService;
  readonly scoringPipeline: ScoringPipeline;
  readonly analysisQueue: AnalysisQueue;
  readonly userRepo: UserRepository;
  readonly analysisRepo: AnalysisRepository;
  readonly gameProfileRepo: GameProfileRepository;
  readonly badgeRepo: BadgeRepository;

  constructor() {
    logger.info("Initializing dependency container");

    this.prisma = new PrismaClient();
    this.eventBus = new EventBus();
    this.cache = new InMemoryCacheService(config.cache.ttlSeconds);

    this.aiFactory = new AIProviderFactory(
      config.openaiApiKey, config.geminiApiKey,
      config.openaiModel, config.geminiModel,
      config.azureApiKey, config.azureEndpoint,
      config.azureDeployment, config.azureApiVersion
    );

    this.parserFactory = new ParserFactory();

    const aiProvider = this.aiFactory.getProvider(config.aiProvider);
    logger.info(`AI Provider: ${aiProvider.name}`);

    this.biasDetector = new BiasDetectionService(aiProvider);
    this.diffEngine = new DiffEngineService();

    this.userRepo = new UserRepository(this.prisma);
    this.analysisRepo = new AnalysisRepository(this.prisma);
    this.gameProfileRepo = new GameProfileRepository(this.prisma);
    this.badgeRepo = new BadgeRepository(this.prisma);

    this.gamification = new GamificationService(this.gameProfileRepo, this.badgeRepo, this.eventBus);

    const analyzers = [
      new SkillsAnalyzer(),
      new ExperienceAnalyzer(),
      new EducationAnalyzer(),
      new KeywordAnalyzer(),
      new SemanticAnalyzer(),
    ];

    this.scoringPipeline = new ScoringPipeline(analyzers, aiProvider, this.biasDetector);
    this.analysisQueue = new AnalysisQueue(this.eventBus);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.eventBus.on("analysis:recorded", (data: any) => {
      logger.info(`Analysis recorded for user ${data.userId}, total: ${data.count}`);
    });
    this.eventBus.on("badges:earned", (data: any) => {
      logger.info(`Badges earned by ${data.userId}: ${data.badges.join(", ")}`);
    });
  }

  async initialize() {
    await this.prisma.$connect();
    logger.info("Database connected");
  }

  async shutdown() {
    await this.prisma.$disconnect();
    logger.info("Container shut down");
  }
}

let container: Container | null = null;

export function getContainer(): Container {
  if (!container) {
    container = new Container();
  }
  return container;
}
