#!/bin/bash

echo "🧹 Resetting test data..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0;29m'

# Cleanup existing test data
echo "${YELLOW}Cleaning up existing test data...${NC}"
npm run test:cleanup

# Generate fresh test data
echo "${YELLOW}Generating fresh test data...${NC}"
npm run test:seed

echo "${GREEN}✅ Test data reset complete!${NC}"