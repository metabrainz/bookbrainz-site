#!/bin/bash
# start bookbrainz website with solr integration

echo "starting bookbrainz website with solr demo"
echo "=========================================="
echo ""

if ! docker ps | grep -q "bookbrainz-solr-mvp"; then
    echo "solr is not running"
    echo "please start solr first using: bash fix-solr-icu.sh"
    exit 1
fi

echo "solr is running"
echo ""

# Check docker compose command
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

echo "step 1: ensuring the bookbrainz-net network exists..."
docker network create bookbrainz-site_bookbrainz-net 2>/dev/null || echo "network already exists"

echo ""
echo "step 2: starting database and dependencies..."
$DOCKER_COMPOSE_CMD up -d postgres redis elasticsearch

echo ""
echo "step 3: waiting 15 seconds for services to be ready..."
sleep 15

echo ""
echo "step 4: checking if database needs initialization..."
if docker exec postgres psql -U bookbrainz -d bookbrainz -c '\dt' 2>&1 | grep -q "No relations found"; then
    echo "database is empty, needs initialization"
    echo ""
    echo "note: you need to initialize the database schema."
    echo "you can do this by:"
    echo "  1. running: docker exec -it bookbrainz-site npm run build-db"
    echo "  2. or use the test database script: bash scripts/create-test-db.sh"
    echo ""
    read -p "Press Enter to continue without database init, or Ctrl+C to abort..."
else
    echo "database already initialized"
fi

echo ""
echo "step 5: starting the bookbrainz website..."
echo "environment: USE_SOLR=true"
echo ""

$DOCKER_COMPOSE_CMD up --build bookbrainz-site

echo ""
echo "website started"
echo "==============="
echo ""
echo "website: http://localhost:9099"
echo "solr core: http://localhost:8983/solr/bookbrainz"
echo ""
echo "example searches with the demo data:"
echo "  - h. p. lovecraft (author)"
echo "  - j. r. r. tolkien (author)"
echo "  - the call of cthulhu (work)"
echo "  - the lord of the rings (work)"
echo "  - foundation series (series)"
echo ""
echo "press Ctrl+C to stop the website"
