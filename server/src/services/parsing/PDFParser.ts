import { IResumeParser } from "../../interfaces/IResumeParser";
import { ResumeData } from "../../utils/types";
import pdfParse from "pdf-parse";
import { parseResumeText } from "./textUtils";

export class PDFParser implements IResumeParser {
  readonly supportedExtensions = [".pdf"];
  canParse(fileName: string) { return fileName.toLowerCase().endsWith(".pdf"); }
  async parse(buffer: Buffer, fileName: string): Promise<ResumeData> {
    const result = await pdfParse(buffer);
    return parseResumeText(result.text, fileName);
  }
}
