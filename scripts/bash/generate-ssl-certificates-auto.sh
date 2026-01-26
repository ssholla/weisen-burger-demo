#!/bin/bash

# Script to generate SSL certificates using OpenSSL (non-interactive version)
# This creates a self-signed certificate for development/testing purposes

set -e

echo "🔐 Generating SSL certificates (non-interactive)..."

# Configuration
CERT_DIR="certificates"
KEY_FILE="server.key"
CSR_FILE="server.csr"
CRT_FILE="server.crt"
TEMP_KEY_FILE="server.pass.key"
DUMMY_PASSWORD="dummyPassword"

# Certificate details (modify these as needed)
COUNTRY="DE"
STATE="Germany"
CITY="Cologne"
ORGANIZATION="Kerun.one"
ORGANIZATIONAL_UNIT="TeamOne"
COMMON_NAME="Kerun.one"
EMAIL="projekte+team1@kerun.one"

# Create certificates directory if it doesn't exist
if [ ! -d "$CERT_DIR" ]; then
    mkdir -p "$CERT_DIR"
    echo "📁 Created $CERT_DIR directory"
fi

cd "$CERT_DIR"

echo "🔑 Step 1: Generating private key with passphrase..."
openssl genrsa -des3 -passout pass:$DUMMY_PASSWORD -out $TEMP_KEY_FILE 2048

echo "🔓 Step 2: Removing passphrase from private key..."
openssl rsa -passin pass:$DUMMY_PASSWORD -in $TEMP_KEY_FILE -out $KEY_FILE

echo "🧹 Step 3: Cleaning up temporary key file..."
rm $TEMP_KEY_FILE

echo "📝 Step 4: Creating certificate signing request (non-interactive)..."
openssl req -new -key $KEY_FILE -out $CSR_FILE -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$ORGANIZATIONAL_UNIT/CN=$COMMON_NAME"

echo "📜 Step 5: Creating self-signed certificate..."
openssl x509 -req -sha256 -days 365 -in $CSR_FILE -signkey $KEY_FILE -out $CRT_FILE

echo ""
echo "✅ SSL certificates generated successfully!"
echo ""
echo "📋 Generated files in $CERT_DIR/:"
echo "   • $KEY_FILE - Private key (keep this secure!)"
echo "   • $CSR_FILE - Certificate signing request"
echo "   • $CRT_FILE - Self-signed certificate (valid for 365 days)"
echo ""
echo "📊 Certificate details:"
echo "   • Country: $COUNTRY"
echo "   • State: $STATE"
echo "   • City: $CITY"
echo "   • Organization: $ORGANIZATION"
echo "   • Common Name: $COMMON_NAME"
echo "   • Email: $EMAIL"
echo ""
echo "🔒 Security Note: These are self-signed certificates suitable for development."
echo "    For production, use certificates from a trusted Certificate Authority."
echo ""
echo "📁 Certificate files location: $(pwd)"

cd ..
