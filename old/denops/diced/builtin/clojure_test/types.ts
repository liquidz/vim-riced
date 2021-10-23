export interface ParsedTestSummary {
  isSuccess: boolean;
  summary: string;
}

export interface ParsedTestError {
  filename: string;
  text: string;
  expected: string;
  actual: string;
  type: string;
  var: string;
  lnum?: number;
  diffs?: string;
}

export interface ParsedTestPass {
  var: string;
}

export interface ParsedTestActualValue {
  actual: string;
  diffs?: string;
}

export interface ParsedTestResult {
  errors: Array<ParsedTestError>;
  passes: Array<ParsedTestPass>;
  summary: ParsedTestSummary;
}
