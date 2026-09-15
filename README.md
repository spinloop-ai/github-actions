# spinloop GitHub Actions

GitHub actions that work with [spinloop](https://github.com/spinloop-ai/spinloop).

## Actions

- [`work-items`](work-items/) — keep an orchestrator's work list in step with GitHub issues, over its work list API: an issue opened adds an item, a closed issue removes it

## Testing

`.github/workflows/lint.yml` lints the workflows and the action metadata on
every push. `.github/workflows/e2e.yml` is manual (`workflow_dispatch`): it
builds spinloop from the ref it is given, stands up a real orchestrator with a
stub gateway, and works real issues through the action against it.
