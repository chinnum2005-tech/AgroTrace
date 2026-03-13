# Contributing to AgriTrace AI

Thank you for your interest in contributing to AgriTrace AI! This document provides guidelines and instructions for contributing.

## 🌟 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Architecture Decisions](#architecture-decisions)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### 1. Fork the Repository

```bash
# Click "Fork" on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/FarmConnect.git
cd FarmConnect
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start Docker services
docker-compose up -d

# Run migrations
npm run db:migrate
npm run db:generate
```

### 3. Create a Branch

```bash
# Always branch from main
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

---

## Development Workflow

### Branch Naming Convention

```
feature/add-new-feature      # New features
fix/bug-fix                  # Bug fixes
docs/update-docs             # Documentation changes
refactor/code-refactor       # Code refactoring
test/add-tests               # Adding tests
chore/maintenance            # Maintenance tasks
```

### Making Changes

1. **Make small, focused commits**
2. **Write tests** for new features
3. **Update documentation** if needed
4. **Run linters** before committing
5. **Test locally** with Docker

### Running Tests

```bash
# All tests
npm run test

# Backend tests only
cd apps/backend && npm test

# Blockchain tests only
cd services/blockchain && npm test

# Web frontend tests
cd apps/web && npm test
```

---

## Coding Standards

### TypeScript/JavaScript

```typescript
// Use meaningful variable names
const MAX_RETRY_ATTEMPTS = 3;
const userRepository = new UserRepository();

// Use TypeScript types
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Use async/await over promises
async function getUser(id: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id } });
  return user;
}

// Error handling
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed:', error);
  throw new AppError('Failed to perform operation', 500);
}
```

### Python

```python
# Type hints
def predict_yield(crop_type: str, area: float) -> dict:
    """Predict crop yield based on input parameters."""
    pass

# Docstrings
class YieldPredictor:
    """Crop yield prediction model using Random Forest."""
    
    def predict(self, features: np.ndarray) -> float:
        """
        Make yield prediction.
        
        Args:
            features: Array of input features
            
        Returns:
            Predicted yield in kg/hectare
        """
        pass
```

### Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Record supply chain event
 * @param productId Unique product identifier
 * @param eventType Type of event
 */
function recordEvent(
    string memory productId,
    EventType eventType
) external returns (bool) {
    require(bytes(productId).length > 0, "Invalid product ID");
    // Implementation
}
```

### File Naming

- **TypeScript/JavaScript**: `camelCase.ts` or `PascalCase.tsx`
- **Python**: `snake_case.py`
- **Solidity**: `PascalCase.sol`
- **Tests**: `*.test.ts` or `*_test.py`
- **Components**: `PascalCase.tsx`

---

## Commit Guidelines

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes

### Examples

```bash
# Good commits
git commit -m "feat(auth): add JWT token refresh endpoint"
git commit -m "fix(api): resolve null pointer in crop controller"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(blockchain): add supply chain contract tests"

# Bad commits
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "asdfasdf"
```

### Writing Good Commit Messages

✅ **DO**:
- Use present tense ("add feature" not "added feature")
- Be concise but descriptive
- Reference issues/PRs when applicable

❌ **DON'T**:
- Use vague messages like "fix bug"
- Write essays in the subject line
- Include unrelated changes in one commit

---

## Pull Request Process

### Before Submitting

1. **Rebase on main**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all tests**
   ```bash
   npm run test
   ```

3. **Check code formatting**
   ```bash
   npm run lint
   ```

4. **Update documentation** if needed

5. **Add changelog entry** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] Manual testing performed
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where necessary
- [ ] Documentation updated
```

### Review Process

1. **Submit PR** with clear description
2. **Wait for review** (usually within 24-48 hours)
3. **Address feedback** promptly
4. **Request re-review** after making changes
5. **Merge** after approval

---

## Architecture Decisions

### Decision Records

We use Architecture Decision Records (ADRs) to document significant architectural choices.

Location: `docs/adr/`

Format:
```markdown
# ADR-XXX: Title

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue that we're seeing?

## Decision
What is the change that we're proposing?

## Consequences
What becomes easier or more difficult to do because of this change?
```

### Example ADR

See `docs/adr/ADR-001-use-polygon-blockchain.md` for an example.

---

## Component-Specific Guidelines

### Backend (Node.js/Express)

- Use dependency injection
- Keep controllers thin, services fat
- Validate all inputs with Zod
- Log errors with correlation IDs
- Use Prisma transactions for multi-step operations

### Frontend (React)

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript strictly
- Implement error boundaries
- Lazy load routes for performance

### AI Service (Python)

- Write vectorized NumPy operations
- Cache model predictions when possible
- Use Pydantic for data validation
- Document model assumptions
- Include confidence intervals

### Blockchain (Solidity)

- Follow OpenZeppelin standards
- Write comprehensive tests
- Consider gas optimization
- Add events for off-chain tracking
- Use modifiers for access control

---

## Questions?

If you have questions, please:

1. Check existing [documentation](./docs/)
2. Search [closed issues](https://github.com/your-org/FarmConnect/issues)
3. Ask in our [Discord channel](https://discord.gg/your-channel)
4. Tag a maintainer in an issue

---

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Annual contributor spotlight (if applicable)

Thank you for contributing to AgriTrace AI! 🌾
