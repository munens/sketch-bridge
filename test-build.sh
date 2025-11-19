#!/bin/bash

# Test Build Script
# This script simulates the Railway build process locally to catch errors before deployment

set -e  # Exit on any error

echo "🧪 Testing Sketch Bridge Production Build"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf common/dist
rm -rf socket/dist
rm -rf app/dist
print_success "Cleaned build directories"
echo ""

# Test 1: Build Common
echo "📦 Step 1/3: Building Common Module..."
cd common
if npm install && npm run build; then
    print_success "Common module built successfully"
    print_info "Output: common/dist/"
    ls -la dist/ | head -n 10
else
    print_error "Common module build failed"
    exit 1
fi
cd ..
echo ""

# Test 2: Build Backend
echo "🔧 Step 2/3: Building Backend (Socket)..."
cd socket
if npm install && npm run build; then
    print_success "Backend built successfully"
    print_info "Output: socket/dist/"
    ls -la dist/ | head -n 10
else
    print_error "Backend build failed"
    exit 1
fi
cd ..
echo ""

# Test 3: Build Frontend
echo "⚛️  Step 3/3: Building Frontend (App)..."
cd app
if npm install && npm run build; then
    print_success "Frontend built successfully"
    print_info "Output: app/dist/"
    ls -la dist/ | head -n 10
else
    print_error "Frontend build failed"
    exit 1
fi
cd ..
echo ""

# Final Summary
echo "========================================"
echo "🎉 Build Test Complete!"
echo ""
print_success "All modules built successfully!"
echo ""
echo "Build sizes:"
echo "  Common:   $(du -sh common/dist 2>/dev/null | cut -f1)"
echo "  Backend:  $(du -sh socket/dist 2>/dev/null | cut -f1)"
echo "  Frontend: $(du -sh app/dist 2>/dev/null | cut -f1)"
echo ""
print_info "Your application is ready for Railway deployment!"
echo ""
echo "Next steps:"
echo "  1. Push to GitHub: git push origin main"
echo "  2. Follow QUICK_START.md for Railway deployment"
echo "  3. Or see DEPLOYMENT.md for detailed instructions"
echo ""

