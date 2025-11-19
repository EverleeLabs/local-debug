#!/bin/bash

# Package script for WP Debug Toggler Local add-on
# This creates a .tgz file that can be installed via "Install Add-on from Disk" in Local

set -e

ADDON_NAME="wp-debug-toggler"
VERSION=$(node -p "require('./package.json').version")
PACKAGE_NAME="${ADDON_NAME}-v${VERSION}.tgz"
TEMP_DIR=".package-temp"

echo "📦 Packaging WP Debug Toggler add-on..."
echo ""

# Step 1: Build the add-on
echo "🔨 Building add-on..."
yarn build

# Step 2: Create temporary directory
echo "📁 Creating package structure..."
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR/$ADDON_NAME"

# Step 3: Copy necessary files
echo "📋 Copying files..."
cp package.json "$TEMP_DIR/$ADDON_NAME/"
cp icon.svg "$TEMP_DIR/$ADDON_NAME/" 2>/dev/null || echo "⚠️  icon.svg not found, skipping..."
cp README.md "$TEMP_DIR/$ADDON_NAME/" 2>/dev/null || echo "⚠️  README.md not found, skipping..."
cp LICENSE "$TEMP_DIR/$ADDON_NAME/" 2>/dev/null || echo "⚠️  LICENSE not found, skipping..."

# Step 4: Copy compiled lib directory
cp -r lib "$TEMP_DIR/$ADDON_NAME/"

# Step 5: Create tarball
echo "🗜️  Creating tarball..."
cd "$TEMP_DIR"
tar -czf "../$PACKAGE_NAME" "$ADDON_NAME"
cd ..

# Step 6: Cleanup
echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Package created successfully!"
echo "📦 File: $PACKAGE_NAME"
echo ""
echo "To install:"
echo "1. Open Local by Flywheel"
echo "2. Go to Settings → Add-ons"
echo "3. Click 'Install Add-on from Disk'"
echo "4. Select: $PACKAGE_NAME"
echo ""

