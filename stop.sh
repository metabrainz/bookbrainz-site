echo "Checking docker compose version"
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi


$DOCKER_COMPOSE_CMD down
$DOCKER_COMPOSE_CMD -f docker-compose.api.yml down