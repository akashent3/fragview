#!/bin/bash

echo "🧪 Starting complete test suite..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Run the tests
echo "${YELLOW}Running Playwright tests...${NC}"
npm run test:e2e

# Capture exit code
EXIT_CODE=$? 

# Check if tests passed
if [ $EXIT_CODE -eq 0 ]; then
  echo "${GREEN}✅ All tests passed!${NC}"
else
  echo "${RED}❌ Some tests failed! ${NC}"
fi

# Show test report
echo "${YELLOW}Opening test report...${NC}"
npm run test:report

exit $EXIT_CODE