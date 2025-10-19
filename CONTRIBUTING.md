# Contributing to zkLend

Thank you for your interest in contributing to zkLend! We welcome contributions from the community and appreciate your help in making this project better.

## 🤝 How to Contribute

### Reporting Issues

If you find a bug or have a feature request, please:

1. **Check existing issues** first to avoid duplicates
2. **Use the issue templates** when creating new issues
3. **Provide detailed information** including:
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Screenshots or error logs when relevant

### Suggesting Enhancements

We love new ideas! For feature requests:

1. **Open a discussion** to gather community feedback
2. **Describe the use case** and potential impact
3. **Consider implementation complexity** and maintenance burden
4. **Be specific** about the problem you're trying to solve

## 🚀 Development Setup

### Prerequisites

- **Node.js** 18+ and **Yarn**
- **Rust** 1.70+ and **Cargo**
- **Solana CLI** 1.16+
- **Anchor Framework** 0.32+
- **Git** for version control

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/zk-lend.git
   cd zk-lend
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/Shubbu03/zk-lend.git
   ```

4. **Install dependencies**:
   ```bash
   # Install root dependencies
   yarn install
   
   # Install client dependencies
   cd client
   yarn install
   cd ..
   ```

5. **Build the project**:
   ```bash
   anchor build
   ```

6. **Run tests**:
   ```bash
   anchor test
   ```

## 📝 Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/zk-proof-optimization`
- `fix/loan-calculation-bug`
- `refactor/state-management`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests

**Examples:**
```
feat(loans): add multi-lender support
fix(attestation): resolve ZK proof validation bug
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** with clear, focused commits
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Run the test suite** and ensure all tests pass
6. **Create a pull request** with:
   - Clear title and description
   - Link to related issues
   - Screenshots for UI changes
   - Testing instructions

### Code Review Process

- **Automated checks** must pass (tests, linting, build)
- **At least one review** required for approval
- **Address feedback** promptly and professionally
- **Keep PRs focused** and reasonably sized
- **Update documentation** as needed

## 🧪 Testing Guidelines

### Writing Tests

- **Unit tests** for individual functions and components
- **Integration tests** for complete workflows
- **Edge cases** and error conditions
- **Performance tests** for critical paths

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('when condition A', () => {
    it('should do X', () => {
      // Test implementation
    });
  });
  
  describe('when condition B', () => {
    it('should do Y', () => {
      // Test implementation
    });
  });
});
```

### Running Tests

```bash
# Run all tests
anchor test

# Run specific test file
anchor test tests/loans_marketplace/integration_full_lifecycle.ts

# Run with coverage
anchor test --coverage
```

## 📚 Code Style Guidelines

### Solana Programs (Rust)

- **Follow Rust conventions** and use `cargo fmt`
- **Use descriptive names** for variables and functions
- **Add comprehensive comments** for complex logic
- **Handle errors gracefully** with proper error types
- **Use Anchor best practices** for account validation

### Frontend (TypeScript/React)

- **Use TypeScript** for all new code
- **Follow React best practices** and hooks patterns
- **Use Tailwind CSS** for styling
- **Component composition** over inheritance
- **Proper error boundaries** and loading states

### General

- **Keep functions small** and focused
- **Use meaningful variable names**
- **Add JSDoc comments** for public APIs
- **Remove unused imports** and variables
- **Consistent formatting** with Prettier

## 🔒 Security Considerations

### Smart Contract Security

- **Input validation** for all user inputs
- **Access control** and permission checks
- **Reentrancy protection** where applicable
- **Integer overflow/underflow** prevention
- **Proper error handling** without exposing sensitive data

### Frontend Security

- **Input sanitization** for user data
- **Secure wallet integration** patterns
- **No sensitive data** in client-side code
- **Proper error handling** without information leakage

## 📖 Documentation

### Code Documentation

- **JSDoc comments** for functions and classes
- **README updates** for new features

### Pull Request Documentation

- **Clear description** of changes
- **Screenshots** for UI changes
- **Testing instructions** for reviewers
- **Breaking changes** clearly marked

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details**:
   - OS and version
   - Node.js version
   - Browser (for frontend issues)
   - Solana CLI version
5. **Error messages** or logs
6. **Screenshots** if applicable

## 💡 Feature Requests

For new features:

1. **Check existing issues** first
2. **Describe the problem** you're trying to solve
3. **Explain the proposed solution**
4. **Consider alternatives** you've thought about
5. **Describe the impact** on existing users

## 🤔 Questions?

- **GitHub Discussions** for general questions
- **Discord** for real-time chat
- **Issues** for bug reports and feature requests
- **Email** for security-related concerns

## 📄 License

By contributing to zkLend, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to zkLend! 🚀
