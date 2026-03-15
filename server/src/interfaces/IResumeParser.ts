import { ResumeData } from "../utils/types";

export interface IResumeParser {
  readonly supportedExtensions: string[];
  canParse(fileName: string): boolean;
  parse(buffer: Buffer, fileName: string): Promise<ResumeData>;
}

export interface IParserFactory {
  getParser(fileName: string): IResumeParser;
}
