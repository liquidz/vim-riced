import { unknownutil } from "../../../deps.ts";

export type TestSummary = {
  error: number;
  fail: number;
  ns: number;
  pass: number;
  test: number;
  var: number;
};

export function isTestSummary(x: unknown): x is TestSummary {
  return unknownutil.isObject(x) &&
    typeof (x as TestSummary).error === "number" &&
    typeof (x as TestSummary).fail === "number" &&
    typeof (x as TestSummary).ns === "number" &&
    typeof (x as TestSummary).pass === "number" &&
    typeof (x as TestSummary).test === "number" &&
    typeof (x as TestSummary).var === "number";
}

export type TestResult = {
  context: string | string[];
  index: number;
  message: string;
  ns: string;
  type: string;
  var: string;

  actual?: string;
  diffs?: Array<unknown>;
  error?: string;
  expected?: string;
  file?: string | string[];
  line?: number | number[];
};

export function isTestResult(x: unknown): x is TestResult {
  if (!unknownutil.isObject(x)) return false;

  const r = x as TestResult;
  return unknownutil.isObject(x) &&
    (typeof r.context === "string" || Array.isArray(r.context)) &&
    typeof r.index === "number" &&
    typeof r.message === "string" &&
    typeof r.ns === "string" &&
    typeof r.type === "string" &&
    typeof r.var === "string" &&
    (r.actual == null || typeof r.actual === "string") &&
    (r.diffs == null || unknownutil.isArray(r.diffs)) &&
    (r.error == null || typeof r.error === "string") &&
    (r.expected == null || typeof r.expected === "string") &&
    (r.file == null || typeof r.file === "string" || Array.isArray(r.file)) &&
    (r.line == null || typeof r.line === "number" || Array.isArray(r.line));
}
