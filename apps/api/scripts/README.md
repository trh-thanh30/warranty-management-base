# 🐚 Automation Scripts

A collection of utility scripts designed to automate environment setup, maintenance, and testing, ensuring a consistent developer experience across the team.

## 🚀 Key Automation Features

### 💻 Environment Initialization

- **Automated `.env` Setup**: Automatically clones `.env.example` if no local environment file is detected.
- **One-Command Setup**: `setup_dev_env.sh` handles Docker containers, Prisma generation, and DB seeding in one go.

### 🧹 Maintenance & Cleanup

- **Deep Clean**: `clear_dev_env.sh` safely removes database volumes, dist folders, and temporary logs.
- **Worker Management**: `start-email-worker.js` provides a dedicated entry point for background processing nodes.

---

## 📖 Script Usage Examples

### Full Development Setup

```bash
# Set up everything needed for local development
./scripts/setup_dev_env.sh
```

### Cleaning Up the Environment

```bash
# Warning: This will reset your local database!
./scripts/clear_dev_env.sh
```

### Running Module-Specific Tests

```bash
# Run a specific suite for the users module
./scripts/test_users_module.sh
```
