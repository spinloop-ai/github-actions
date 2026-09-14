# work-items

A composite GitHub action that turns issue events into orchestrator work items.
An issue **opened** adds an item to the work items file; an issue **closed**
removes it. The items file is the backlog the
[orchestrator](https://github.com/spinloop-ai/spinloop) works, so a backlog of
issues becomes the backlog the orchestrator picks up, with no operator in
between. The action works the file in the caller's repo and, where `push` is
on, commits and pushes the result with the workflow's token.

The action carries its own `spinloop`: it downloads the release it works with
for the runner's platform, so a runner installs nothing. A spinloop release
that carries the `work` command family is required.

## Use it

Add a workflow to the repo that holds your work items file:

```yaml
name: work items

on:
  issues:
    types: [opened, closed]

permissions:
  contents: write

jobs:
  work-items:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: spinloop-ai/github-actions/work-items@main
        with:
          items: work.yaml
          dir: .
          # Only issues carrying one of these labels become work. Where none
          # are named, every issue does.
          # labels: orchestration
```

`contents: write` is what the push needs; drop it and set `push: "false"`
where you commit the file yourself. The action pushes to the branch the
workflow runs on.

Pin `spinloop-ai/github-actions/work-items` to a tag once the action has
releases, rather than `main`.

The orchestrator keeps its state, lock, logs, and abort markers beside the
items file. Those are machine-local and must not be committed; where your
items file is `work.yaml`, gitignore:

```gitignore
work.yaml.state.json
work.yaml.lock
work.yaml.logs/
work.yaml.aborts/
```

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `event` | the event's action | `opened` adds an item, `closed` removes one; nothing else is worked |
| `items` | `work.yaml` | the work items file, relative to the repo root |
| `id` | the issue's number | the item's id, overridable |
| `template` | the issue's title, then its body | the item's instructions, rendered against the issue with `{{.Title}}`, `{{.Body}}`, `{{.Number}}`, `{{.URL}}`, `{{.Labels}}` |
| `dir` | `.` | the directory the item's agent works in |
| `tags` | none | the item's tags, comma-separated `key=value` pairs binding it to a kind of node |
| `priority` | `0` | the item's priority, higher first |
| `labels` | none | the labels an issue must carry, one of them, to become work; none named, every issue does |
| `version` | `latest` | the spinloop release to work with, or a tag such as `v1.40.0` |
| `binary` | none | a spinloop binary to work with instead of downloading a release |
| `push` | `true` | commit and push the worked file with the workflow's token |
| `issue-title`, `issue-body`, `issue-number`, `issue-url`, `issue-labels` | the event's issue | the issue's fields; defaulted from the event, named for a workflow that works an issue the event does not carry |

## What it does to the file

The action calls the `work` command family: `spinloop work add` where the
event is `opened`, `spinloop work remove` where it is `closed`. A re-run of
the same event is a no-op: an id the file already carries is reported as
already added, an id the file has let go is reported as already removed, and
the file is untouched either way. A close whose item is running is refused the
way `work remove` refuses it — naming the item and the abort that goes first —
and the refusal stands as the action's failure; the action does not stop a
live item on its own.
