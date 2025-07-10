# Contributing to BinRev

Thank you for your interest in contributing! This document outlines how to get started and the standards we follow.

---

## Table of Contents

* [Getting Started](#getting-started)
* [Development Workflow](#development-workflow)
* [Code Style](#code-style)
* [Testing](#testing)
* [What can I help with?](#what-can-i-help-with)
* [Git & Commit Conventions](#git--commit-conventions)
* [Creating a Pull Request](#creating-a-pull-request)
* [Reporting Issues](#reporting-issues)
* [License](#license)

---

## Getting Started

1. **Fork the repository**

2. **Clone your fork**

   ```bash
   git clone https://github.com/your-username/binrev.git
   cd binrev
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Start the dev server**

   ```bash
   npm run dev
   ```

---

## Development Workflow

* Make your changes in a **feature branch**:

  ```bash
  git checkout -b feat/your-feature-name
  ```

* Keep commits focused and logical.

* Sync frequently with the main branch:

  ```bash
  git pull origin main --rebase
  ```

* Before committing:

  ```bash
  npm run lint
  npm run test
  ```

---

## Code Style

We follow strict formatting and linting rules.

* **TypeScript**: All code must be typed.
* **Lint**: [ESLint](https://eslint.org/)
* **Formatter**: [Prettier](https://prettier.io/)

To check and fix style:

```bash
npm run lint
npm run fix
```

---

## Testing

We use [Vitest](https://vitest.dev/).

Run all tests:

```bash
npm test
```

Write tests for new features and bug fixes.

To check the coverage, run:

```bash
npm run coverage
```
---

## What can I help with?

If you want to contribute but aren't sure where to start, here are some ideas:
- **Bug Fixes**: Look for issues labeled "bug" or "help wanted".
- **Code quality**: Improve existing code by refactoring or optimizing.
- **Tests**: Add or improve unit tests for existing features.
- **Reviews**: Review open pull requests and provide feedback.
- **Documentation**: Improve or add documentation.

---

## Git & Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clarity and semantic versioning.

Examples:

```bash
feat(ui): add new button component
fix(auth): prevent null token error
chore: update dependencies
```

---

## Creating a Pull Request

1. Push your feature branch to your fork.
2. Open a Pull Request to `main`.
3. Fill out the PR template and link any relevant issues.
4. Wait for CI to pass and review feedback.

---

## Reporting Issues

Please use the [GitHub Issues](https://github.com/dmonizer/binrev/issues) page. Include:

* Steps to reproduce
* Expected vs. actual behavior
* Environment info (browser, OS, Node version)

---

## License

By contributing, you agree that your code will be licensed under the same license as the project: [GPLv3](./LICENSE).

---

Thanks again for helping improve this project!
