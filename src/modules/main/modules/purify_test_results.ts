import { Result, TestResults } from "src/domain";
import {
  editorApprovalPurifier,
  EIP1Purifier,
  statusChangeAllowedPurifier,
  withdrawnExceptionPurifier
} from "#/purifiers";
import { getAllTruthyObjectPaths, innerJoinAncestors } from "#/utils";
import { get } from "lodash";
import { getType } from "./get_type";

export const purifyTestResults = async (dirtyTestResults: TestResults): Promise<Result> => {
  // Apply independent purifiers
  const primedPurifiers = [
    statusChangeAllowedPurifier(dirtyTestResults),
    editorApprovalPurifier(dirtyTestResults),
    EIP1Purifier(dirtyTestResults),
    withdrawnExceptionPurifier(dirtyTestResults)
  ];

  // Purify the dirty results
  const testResults = innerJoinAncestors(dirtyTestResults, primedPurifiers);
  const errors: string[] = getAllTruthyObjectPaths(testResults.errors).map(
    (path) => get(testResults.errors, path)
  );

  const type = getType(testResults);
  if (errors.length === 0) {
    console.log(`${testResults.fileDiff.base.name} passed!`);
    return {
      filename: testResults.fileDiff.base.name,
      type
    };
  }

  return {
    filename: testResults.fileDiff.base.name,
    errors,
    type
  };
};
