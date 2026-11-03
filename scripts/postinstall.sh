#!/usr/bin/env bash
set -euo pipefail

echo "Checking Java installation..."

# Install Java 17 if it is not already available.
if ! command -v java >/dev/null 2>&1; then
    echo "Java not found. Installing Java 17..."

    export JAVA_HOME="$PWD/node_modules/.cache/temurin-17"
    mkdir -p "$JAVA_HOME"

    archive="$(mktemp)"
    trap 'rm -f "$archive"' EXIT

    curl -fLsS --retry 3 \
      "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jre/hotspot/normal/eclipse" \
      -o "$archive"

    tar -xzf "$archive" -C "$JAVA_HOME" --strip-components=1

    export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Java version:"
java -version

echo "Generating TypeScript API client..."

npm run build-home-lambdas-client

echo "Postinstall completed successfully!"