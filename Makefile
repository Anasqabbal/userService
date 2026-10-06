# ──────────────────────────────────────────────────────────────────────────────
#  UserService – Makefile
#  Usage: make <target>
#  Requires: Docker Desktop (with Compose v2)
# ──────────────────────────────────────────────────────────────────────────────

APP_NAME   := userservice
COMPOSE    := docker compose
IMAGE_TAG  := $(APP_NAME):latest

.PHONY: help build up down restart logs shell db-shell ps clean fclean

# ─── Default target ──────────────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "  UserService – available make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Build ───────────────────────────────────────────────────────────────────
build: ## Build (or rebuild) the userservice Docker image
	$(COMPOSE) build --no-cache

# ─── Lifecycle ───────────────────────────────────────────────────────────────
up: ## Start all services in detached mode
	$(COMPOSE) up -d --build

down: ## Stop and remove containers (keeps volumes)
	$(COMPOSE) down

restart: ## Restart all services
	$(COMPOSE) restart

# ─── Observability ───────────────────────────────────────────────────────────
logs: ## Tail logs for all services (Ctrl+C to stop)
	$(COMPOSE) logs -f

logs-app: ## Tail logs for the userservice only
	$(COMPOSE) logs -f $(APP_NAME)

logs-db: ## Tail logs for MySQL only
	$(COMPOSE) logs -f mysql

ps: ## Show running containers and their status
	$(COMPOSE) ps

# ─── Shell access ────────────────────────────────────────────────────────────
shell: ## Open a shell inside the userservice container
	$(COMPOSE) exec $(APP_NAME) sh

db-shell: ## Open a MySQL shell inside the MySQL container
	$(COMPOSE) exec mysql \
		mysql -u $${MYSQL_USER:-appuser} \
		-p$${MYSQL_PASSWORD:-apppassword} \
		$${MYSQL_DATABASE:-userservicedb}

# ─── Cleanup ─────────────────────────────────────────────────────────────────
clean: ## Stop containers and remove containers + networks (keeps volumes)
	$(COMPOSE) down --remove-orphans

fclean: ## Stop containers and remove EVERYTHING including volumes ⚠️
	$(COMPOSE) down --volumes --remove-orphans
	docker image rm $(IMAGE_TAG) 2>/dev/null || true
