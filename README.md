# CanvasGradeImport-CRA-Mirror

## Introduction

This repo is a mirror of the original one in Github, created by Gerrit Oomens from FNWI: https://github.com/UvA-FNWI/CanvasGradeImport

## How it works.

The sync works via a CI pipeline. This means that the full logic can be found in .gitlab-ci.yml

In there, there's a github username an token (currently set up to use Doris's user and token, which live in the CI/CD variables in Gitlab).

Ideally, no one makes changes in GitHub, but if someone does, it's still not the end of the world.
To be on the safe side in case someone did make changes in GitHub, before you make changes in GitLab, always run the pipeline manually. See Case 2 below why.

Here are two cases that illustrate how the communication happens:

### Case 1: Someone pushes to GitLab

1. Push to main
2. Pipeline starts
3. CI:
  * fetches GitHub
  * merges
  * pushes back to GitHub
4. GitHub is updated

### Case 2: Someone pushes to GitHub

1. GitLab doesn’t know yet
2. Next GitLab push or
3. You click “Run pipeline” manually
4. CI:
  * fetches GitHub changes
  * merges them into GitLab
5. Both sides are aligned again

💡 This is why the manual sync button matters.
No one *should* edit things in GitHub, but you never know.

## Things to note

* GitLab is the controller
* GitHub is a read/write mirror
* All synchronization is done by GitLab CI
* Only the main branch is mirrored
* Sync jobs are serialized to prevent races
* Merge conflicts stop the sync and require manual resolution
* [SYNC] commits are used to prevent mirror loops
* No force-pushes are allowed on either platform -- 26-Jan-2026 (DH) this still need to be enforced in GitHub.

This is what the serialized remark means:

1. Alice pushes to GitLab → sync job starts
2. Bob pushes to GitHub
3. GitLab sees Bob’s changes later
4. GitLab waits until Alice’s sync finishes
5. Next sync:
  * fetches latest from both
  * merges once
  * pushes once
No race. No overwrite.
