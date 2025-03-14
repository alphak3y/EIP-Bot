import { IGithubPullRequest } from "#/pull_request/domain/types";
import { GithubInfra } from "src/infra";
import { ChangeTypes } from "src/domain";
import _ from "lodash";
import { PullRequestGithubApiLogs } from "#/pull_request/infra/github_api/log";

export class GithubPullRequest implements IGithubPullRequest {
  constructor(public github: GithubInfra, public logs: PullRequestGithubApiLogs) {}

  async postComment(message: string) {
    const me = await this.github.getSelf();
    const comments = await this.github.getContextIssueComments();

    // If comment already exists, update it
    for (const comment of comments) {
      if (comment.user?.login == me.login) {
        if (comment.body != message) {
          await this.github.updateComment(comment.id, message);
        }
        return;
      }
    }

    await this.github.createCommentOnContext(message);
  }

  async updateLabels(labels: ChangeTypes[]) {
    const current = await this.github.getContextLabels();
    const diff = _.xor(labels, current);

    if (_.isEmpty(diff)) {
      return this.logs.labelsMatch(current, labels)
    }

    const toRemove = _.intersection(current, diff);
    const toAdd = _.intersection(labels, diff);
    this.logs.labelsToBeChanged(current, labels, toAdd, toRemove);

    // this just removes previous labels and sets new ones so the bifurcation
    // above is not actually useful; I did this because it's simpler and
    // (at present) achieves the same goal
    await this.github.setLabels(labels)
  }
}
