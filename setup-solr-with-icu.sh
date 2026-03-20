#!/bin/bash
# simple solr + icu setup for bookbrainz

set -e

echo "bookbrainz solr + icu setup"
echo "==========================="
echo ""

echo "step 1: cleaning up old containers..."
docker-compose -f docker-compose.solr.yml down 2>/dev/null || true
docker volume rm bookbrainz-site_solr-data 2>/dev/null || true
echo "done"
echo ""

echo "step 2: starting solr container..."
docker-compose -f docker-compose.solr.yml up -d

echo ""
echo "step 3: waiting for solr to initialize..."
echo "   (icu module and core setup)"
echo -n "   waiting: "

MAX_WAIT=60
WAITED=0
SOLR_READY=0

while [ $WAITED -lt $MAX_WAIT ]; do
    if docker logs bookbrainz-solr-mvp 2>&1 | grep -q "Registered new searcher"; then
        SOLR_READY=1
        echo " ok"
        break
    fi
    echo -n "."
    sleep 3
    WAITED=$((WAITED + 3))
done

if [ $SOLR_READY -eq 0 ]; then
    echo " failed"
    echo ""
    echo "error: solr did not complete initialization within ${MAX_WAIT} seconds"
    echo "last 30 lines of container logs:"
    docker logs bookbrainz-solr-mvp --tail 30
    exit 1
fi

echo ""

echo "step 4: verifying setup..."

if docker ps | grep -q bookbrainz-solr-mvp; then
    echo "   container running"
else
    echo "   container not running"
    echo ""
    echo "container logs:"
    docker logs bookbrainz-solr-mvp
    exit 1
fi

if docker logs bookbrainz-solr-mvp 2>&1 | grep -q "Creating SolrCore 'bookbrainz'"; then
    echo "   core 'bookbrainz' exists"
else
    echo "   core not found"
    echo ""
    echo "solr logs:"
    docker logs bookbrainz-solr-mvp --tail 20
    exit 1
fi

echo ""
echo "step 5: checking ICU support..."
if docker exec bookbrainz-solr-mvp ls /opt/solr/server/solr-webapp/webapp/WEB-INF/lib/*icu*.jar > /dev/null 2>&1; then
    ICU_COUNT=$(docker exec bookbrainz-solr-mvp ls /opt/solr/server/solr-webapp/webapp/WEB-INF/lib/*icu*.jar 2>/dev/null | wc -l)
    echo "   ICU jars found: $ICU_COUNT file(s)"
    docker exec bookbrainz-solr-mvp ls -lh /opt/solr/server/solr-webapp/webapp/WEB-INF/lib/*icu*.jar | awk '{print "      - " $9 " (" $5 ")"}'
else
    echo "   ICU not found (will use basic analyzers)"
fi

echo ""
echo "step 6: indexing test data..."
if node scripts/index-solr-test-data.js; then
    echo "   data indexed successfully"
else
    echo "   indexing failed"
    exit 1
fi

echo ""
echo "step 7: final verification..."

sleep 2

DOC_COUNT=$(docker exec bookbrainz-solr-mvp curl -s "http://localhost:8983/solr/bookbrainz/select?q=*:*&rows=0&wt=json" 2>/dev/null | grep -o '"numFound":[0-9]*' | grep -o '[0-9]*' || echo "0")
if [ "$DOC_COUNT" -gt 0 ]; then
    echo "   $DOC_COUNT documents indexed and searchable"
else
    echo "   no documents found - may need to wait for auto-commit"
    echo "   solr is ready, you can index manually with: node scripts/index-solr-test-data.js"
fi

echo ""
echo "setup complete"
echo "=============="
echo ""
echo "solr admin ui: http://localhost:8983/solr/#/bookbrainz"
echo ""
echo "example test searches:"
echo "   multi-language: curl 'http://localhost:8983/solr/bookbrainz/select?q=murakami&defType=edismax&wt=json&fl=name,type'"
echo "   multi-entity:   curl 'http://localhost:8983/solr/bookbrainz/select?q=lovecraft&defType=edismax&wt=json&fl=name,type'"
echo ""
echo "next: start bookbrainz with solr:"
echo "   USE_SOLR=true ./develop.sh"
echo ""
