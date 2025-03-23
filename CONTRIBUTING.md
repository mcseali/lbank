# Contributing to LBank Trading Bot

Thank you for your interest in contributing to the LBank Trading Bot project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct.

## How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes
4. Write or update tests
5. Submit a pull request

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/your-username/lbank-trading-bot.git
   cd lbank-trading-bot
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install development dependencies:
   ```bash
   pip install -r requirements-dev.txt
   ```

4. Set up pre-commit hooks:
   ```bash
   pre-commit install
   ```

## Code Style

- Follow PEP 8 guidelines
- Use type hints
- Write docstrings for all functions and classes
- Keep functions focused and small
- Write meaningful commit messages

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Run tests with:
  ```bash
  pytest
  ```

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. The PR will be merged once you have the sign-off of at least one other developer

## Documentation

- Update relevant documentation for any changes
- Add comments for complex logic
- Keep documentation up to date

## Questions?

Feel free to open an issue for any questions or concerns.

## License

By contributing, you agree that your contributions will be licensed under the MIT License. 