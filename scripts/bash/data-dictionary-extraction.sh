#!/bin/bash

# Script to extract field information from Salesforce using SFDX
# Usage: ./extract_field_info.sh <object_name> [org_alias] [include_custom]
# Example: ./extract_field_info.sh Case myorg
# Example: ./extract_field_info.sh Case myorg custom (to include custom fields)

# Check if SFDX is installed
if ! command -v sfdx &> /dev/null; then
    echo "Error: SFDX CLI is not installed. Please install it first."
    echo "Visit: https://developer.salesforce.com/tools/sfdxcli"
    exit 1
fi

# Check if the object name is provided
if [ $# -lt 1 ]; then
    echo "Usage: $0 <object_name> [org_alias] [include_custom]"
    echo "Example: $0 Case myorg"
    echo "Example: $0 Case myorg custom (to include custom fields)"
    exit 1
fi

OBJECT_NAME=$1
ORG_ALIAS=$2
INCLUDE_CUSTOM=$3
OUTPUT_FILE="${OBJECT_NAME}_Field_Info.csv"

# Check if we should include custom fields
INCLUDE_CUSTOM_FLAG=""
if [ "$INCLUDE_CUSTOM" = "custom" ]; then
    echo "Including custom fields in output"
    INCLUDE_CUSTOM_FLAG="include"
else
    echo "Excluding custom fields (only standard fields will be included)"
    INCLUDE_CUSTOM_FLAG="exclude"
fi

# If org alias is provided, use it
SFDX_ORG_FLAG=""
if [ ! -z "$ORG_ALIAS" ]; then
    SFDX_ORG_FLAG="-u $ORG_ALIAS"
fi

# Check if user is authenticated with an org if no specific org is provided
if [ -z "$ORG_ALIAS" ]; then
    if ! sfdx force:org:display &> /dev/null; then
        echo "Error: You are not authenticated with any Salesforce org."
        echo "Please run: sfdx force:auth:web:login -a YourOrgAlias"
        echo "Or provide an org alias as the second parameter."
        exit 1
    fi
fi

# Verify if jq is installed (needed for JSON processing)
if ! command -v jq &> /dev/null; then
    echo "Error: jq is not installed. Please install it to process JSON."
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

echo "Retrieving field information for ${OBJECT_NAME}..."

# Create CSV header
echo "Field Name,Label,Type,Picklist Values/Size" > "$OUTPUT_FILE"

# Use SFDX to describe the object and get field information
echo "Fetching object schema from Salesforce..."
FIELD_INFO=$(sfdx force:schema:sobject:describe -s "$OBJECT_NAME" $SFDX_ORG_FLAG --json)

# Check if the command succeeded
if [ $? -ne 0 ]; then
    echo "Error: Failed to retrieve object information. Please check the object name and your connection."
    exit 1
fi

# Process the field information with jq and format as CSV
echo "Processing field information..."

# Add filter for custom fields if needed
if [ "$INCLUDE_CUSTOM_FLAG" = "exclude" ]; then
    echo "$FIELD_INFO" | jq -r '.result.fields[] | 
        select(.name | test("__c$") | not) |
        [
            .name, 
            .label, 
            .type, 
            (
                if .type == "picklist" or .type == "multipicklist" then 
                    (.picklistValues | map(.label) | join(", "))
                elif .type == "string" then 
                    (.length | tostring) 
                elif .type == "textarea" then 
                    (.length | tostring)
                elif .type == "reference" then
                    (.referenceTo | join(", "))
                elif .type == "double" or .type == "currency" or .type == "percent" then
                    (if .precision and .scale then
                        "\(.precision),\(.scale)"
                    else
                        ""
                    end)
                else 
                    "" 
                end
            )
        ] | @csv' >> "$OUTPUT_FILE"
else
    echo "$FIELD_INFO" | jq -r '.result.fields[] | 
        [
            .name, 
            .label, 
            .type, 
            (
                if .type == "picklist" or .type == "multipicklist" then 
                    (.picklistValues | map(.label) | join(", "))
                elif .type == "string" then 
                    (.length | tostring) 
                elif .type == "textarea" then 
                    (.length | tostring)
                elif .type == "reference" then
                    (.referenceTo | join(", "))
                elif .type == "double" or .type == "currency" or .type == "percent" then
                    (if .precision and .scale then
                        "\(.precision),\(.scale)"
                    else
                        ""
                    end)
                else 
                    "" 
                end
            )
        ] | @csv' >> "$OUTPUT_FILE"
fi

FIELD_COUNT=$(grep -c . "$OUTPUT_FILE")
FIELD_COUNT=$((FIELD_COUNT - 1))  # Subtract header line

echo "Field information extracted successfully to $OUTPUT_FILE"
if [ "$INCLUDE_CUSTOM_FLAG" = "exclude" ]; then
    echo "Found $FIELD_COUNT standard fields for the $OBJECT_NAME object (custom fields excluded)"
else
    echo "Found $FIELD_COUNT fields for the $OBJECT_NAME object (including custom fields)"
fi

# Sort the CSV file (keeping the header)
if command -v sort &> /dev/null; then
    echo "Sorting fields alphabetically..."
    HEADER=$(head -n 1 "$OUTPUT_FILE")
    SORTED_DATA=$(tail -n +2 "$OUTPUT_FILE" | sort)
    echo "$HEADER" > "${OUTPUT_FILE}.tmp"
    echo "$SORTED_DATA" >> "${OUTPUT_FILE}.tmp"
    mv "${OUTPUT_FILE}.tmp" "$OUTPUT_FILE"
    echo "CSV file has been sorted alphabetically by field name."
fi

echo ""
echo "Note: This script uses the SFDX CLI to get real-time field information"
echo "directly from your Salesforce org, ensuring the most accurate and"
echo "complete data for your data dictionary."
echo ""
echo "By default, this script excludes custom fields (those ending with '__c')."
echo "To include custom fields, add 'custom' as the third parameter:"
echo "./extract_field_info.sh Case myorg custom"

