# Contributing to Hedera Micropayments Framework

Thank you for your interest in contributing! This project is an open-source proof-of-concept designed to demonstrate real-time micro-transactions on Hedera.

## 🤝 How to Contribute

### 1. Fork & Clone
Fork the repo to your own GitHub account and clone it locally:
```bash
git clone https://github.com/YOUR_USERNAME/hedera-micropayments-framework.git
```

### 2. Branching Strategy
We follow a strict branch naming convention:
- `feat/feature-name` (New features)
- `fix/bug-description` (Bug fixes)
- `docs/update-readme` (Documentation)
- `chore/upgrade-deps` (Maintenance)

### 3. Commit Messages
Please use the following format:
`<type>(<scope>): <short summary>`

Examples:
- `feat(payment): add x402 header validation`
- `fix( settlement): resolve rounding error in batching`
- `docs(readme): fix typo in setup instructions`

### 4. Pull Requests
- Use the provided PR template.
- Ensure all tests pass.
- Include a clear description of changes.
- Link related issues.

## 🧪 Testing
Run local tests before submitting:
```bash
npm test
```

## 📝 Code Style
- Use 2 spaces for indentation.
- Follow the existing linting rules.
- Keep functions small and focused.

## ⚖️ License
By contributing, you agree that your code will be licensed under the MIT License.
