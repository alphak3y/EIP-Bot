import { File, FILE_RE } from "src/domain";
import { IAssertValidFilename as IAssertValidEipSections } from "#/assertions/Domain/types";
import { multiLineString } from "#/utils";

export class AssertValidEipSections implements IAssertValidEipSections {
  requireFileEipSections: (path: string) => Promise<number>;

  constructor({
    requireEipSections: requireEipSections
  }: {
    requireEipSections: (path: string) => Promise<number>;
  }) {
    this.requireFileEipSections = requireEipSections;
  }

  /**
   * Accepts a file and returns whether or not its name is valid
   *
   * @param errors a list to add any errors that occur to
   * @returns {boolean} is the provided file's filename valid?
   */
  assertValidSections = async (file: NonNullable<File>) => {
    const filename = file.filename;
    const filecontent = this.getParsedContent(file.path, PR.base.sha)

    // File name is formatted correctly and is in the EIPS folder
    const match = filename.search(FILE_RE);
    if (match === -1) {
      return multiLineString(" ")(
        `Filename ${filename} is missing the following required sections:;`,
        `[]`,
        `Please add these sections to your EIP submission before continuing`,
        `the EIP editorial process.`,
      );
    }

    return;
  };
}
