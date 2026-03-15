import { IResumeParser } from "../../interfaces/IResumeParser";
import { ResumeData } from "../../utils/types";
import { parseResumeText } from "./textUtils";

export class TextParser implements IResumeParser {
  readonly supportedExtensions = [".txt"];
  canParse(fileName: string) { return fileName.toLowerCase().endsWith(".txt"); }
  async parse(buffer: Buffer, fileName: string): Promise<ResumeData> {
    return parseResumeText(buffer.toString("utf-8"), fileName);
  }
}
