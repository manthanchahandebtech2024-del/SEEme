import { IResumeParser } from "../../interfaces/IResumeParser";
import { ResumeData } from "../../utils/types";
import mammoth from "mammoth";
import { parseResumeText } from "./textUtils";

export class DOCXParser implements IResumeParser {
  readonly supportedExtensions = [".docx"];
  canParse(fileName: string) { return fileName.toLowerCase().endsWith(".docx"); }
  async parse(buffer: Buffer, fileName: string): Promise<ResumeData> {
    const result = await mammoth.extractRawText({ buffer });
    return parseResumeText(result.value, fileName);
  }
}
