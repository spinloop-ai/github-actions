# work-items

A composite GitHub action that keeps an orchestrator's work list in step with
GitHub issues, over the
[orchestrator's work list API](https://github.com/spinloop-ai/spinloop/blob/main/docs/commands/orchestrator.md#the-work-list-api).
An issue **opened** adds an item to the work list; an issue **closed** removes
it. The orchestrator runs wherever the `url` points — a server, a lab
machine, a box in a rack — and the action is only its client, so a backlog of
issues becomes the backlog the orchestrator works, with no operator in
between and no file to commit.

The action carries its own `spinloop`: it downloads the release it works with
for the runner's platform, so a runner installs nothing. A spinloop release
that carries the `work` command family is required (v1.40.0 and later).

## Use it

Add a workflow to the repo whose issues are the work:

```yaml
name: work items

on:
  issues:
    types: [opened, closed]

jobs:
  work-items:
    runs-on: ubuntu-latest
    steps:
      - uses: spinloop-ai/github-actions/work-items@main
        with:
          url: http://your-orchestrator:4010
          token: ${{ secrets.ORCHESTRATOR_API_TOKEN }}
          dir: /srv/work
          # Only issues carrying one of these labels become work. Where none
          # are named, every issue does.
          # labels: orchestration
```

No checkout, no `contents` permission: the action writes nothing to the repo.
`dir` is where the item's agent works, on the machine the orchestrator runs —
the runner's path means nothing there. Pin
`spinloop-ai/github-actions/work-items` to a tag once the action has
releases, rather than `main`.

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `url` | — (required) | the work list API's base address — the one the orchestrator prints at its start |
| `token` | none | the API's bearer token; where the run serves loopback with no token, leave it empty, and `SPINLOOP_API_TOKEN` in the environment is the fallback where no flag is given |
| `event` | the event's action | `opened` adds an item, `closed` removes one; nothing else is worked |
| `id` | the issue's number | the item's id, overridable |
| `template` | the issue's title, then its body | the item's instructions, rendered against the issue with `{{.Title}}`, `{{.Body}}`, `{{.Number}}`, `{{.URL}}`, `{{.Labels}}` |
| `dir` | `.` | the directory the item's agent works in, on the machine the orchestrator runs |
| `tags` | none | the item's tags, comma-separated `key=value` pairs binding it to a kind of node |
| `priority` | `0` | the item's priority, higher first |
| `labels` | none | the labels an issue must carry, one of them, to become work; none named, every issue does |
| `version` | `latest` | the spinloop release the client downloads, or a tag such as `v1.40.0` |
| `binary` | none | a spinloop binary to work with instead of downloading a release |
| `issue-title`, `issue-body`, `issue-number`, `issue-url`, `issue-labels` | the event's issue | the issue's fields; defaulted from the event, named for a workflow that works an issue the event does not carry |

## What it does to the work list

The action calls the `work` command family against the API: `spinloop work
add` where the event is `opened`, `spinloop work remove` where it is
`closed`. A re-run of the same event is a no-op: an id the work list already
carries is reported as already added, an id it no longer carries is reported
as already removed, and the run is untouched either way. A close whose item is
running is refused the way the API refuses it — naming the item and the abort
that goes first — and the refusal stands as the action's failure; the action
does not stop a live item on its own.
