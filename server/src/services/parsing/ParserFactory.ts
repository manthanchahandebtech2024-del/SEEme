import { IResumeParser, IParserFactory } from "../../interfaces/IResumeParser";
import { PDFParser } from "./PDFParser";
import { DOCXParser } from "./DOCXParser";
import { TextParser } from "./TextParser";

export class ParserFactory implements IParserFactory {
  private parsers: IResumeParser[] = [new PDFParser(), new DOCXParser(), new TextParser()];

  getParser(fileName: string): IResumeParser {
    const parser = this.parsers.find((p) => p.canParse(fileName));
    if (!parser) throw new Error(`No parser for: ${fileName}`);
    return parser;
  }
}
