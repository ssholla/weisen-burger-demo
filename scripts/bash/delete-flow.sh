#!/bin/bash

# Script to delete Salesforce flows, their interviews, and versions
# Updated to use the new Salesforce CLI format (sf instead of deprecated sfdx force:)
# Created: June 23, 2025

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}==================================${NC}"
echo -e "${BLUE}Salesforce Flow Deletion Utility${NC}"
echo -e "${BLUE}==================================${NC}\n"

if ! command -v sf &> /dev/null; then
    echo -e "${RED}Error: Salesforce CLI (sf) is not installed.${NC}"
    echo -e "Please install it from https://developer.salesforce.com/tools/sfdxcli"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: 'jq' command is not installed.${NC}"
    echo -e "Please install it:"
    echo -e "  - For macOS: brew install jq"
    echo -e "  - For Linux: sudo apt-get install jq (Debian/Ubuntu) or sudo yum install jq (RHEL/CentOS)"
    exit 1
fi

echo -e "${YELLOW}Checking authentication status...${NC}"
AUTH_RESULT=$(sf org display --json)

TARGET_ORG=""

if echo "$AUTH_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
    ORG_NAME=$(echo "$AUTH_RESULT" | jq -r '.result.alias // .result.username // "your org"')
    echo -e "${GREEN}Successfully authenticated to $ORG_NAME${NC}"
    
    if echo "$AUTH_RESULT" | jq -e '.result.alias' > /dev/null 2>&1; then
        TARGET_ORG="--target-org $(echo "$AUTH_RESULT" | jq -r '.result.alias')"
    elif echo "$AUTH_RESULT" | jq -e '.result.username' > /dev/null 2>&1; then
        TARGET_ORG="--target-org $(echo "$AUTH_RESULT" | jq -r '.result.username')"
    else
        echo -e "${YELLOW}Warning: Could not determine target org alias. You may need to specify it manually.${NC}"
        read -p "Enter your target org alias or username (press Enter to skip): " manual_target
        if [ -n "$manual_target" ]; then
            TARGET_ORG="--target-org $manual_target"
        fi
    fi
else
    echo -e "${RED}Error: Not authenticated to a Salesforce org.${NC}"
    echo -e "Please run: sf org login web"
    exit 1
fi

confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

list_flows() {
    echo -e "${YELLOW}Fetching flows from org...${NC}"
    
    MD_RESULT=$(sf org list metadata -m Flow $TARGET_ORG --json)
    
    if echo "$MD_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$MD_RESULT" | jq -e '.result | length > 0' > /dev/null 2>&1; then
        printf "%-40s %-30s %-10s\n" "API NAME" "LABEL" "TYPE"
        printf "%s\n" "$(printf '=%.0s' {1..80})"
        
        echo "$MD_RESULT" | jq -r '.result[] | "\(.fullName) \(.fileName) \(.type)"' | 
        while read -r fullname filename type; do
            label=$(basename "$filename" .flow)
            printf "%-40s %-30s %-10s\n" "$fullname" "$label" "$type"
        done
    else
        echo -e "${RED}Error fetching flows via metadata API: $(echo "$MD_RESULT" | jq -r '.message // "Unknown error"')${NC}"
        
        echo -e "${YELLOW}Trying Tooling API as a fallback...${NC}"
        
        QUERY_RESULT=$(sf data query --query "SELECT Id, MasterLabel, DeveloperName FROM FlowDefinition ORDER BY MasterLabel" $TARGET_ORG --use-tooling-api --json)
        
        if ! echo "$QUERY_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 || ! echo "$QUERY_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
            echo -e "${RED}Error fetching flows via Tooling API: $(echo "$QUERY_RESULT" | jq -r '.message // "Unknown error"')${NC}"
            echo -e "${YELLOW}No flows could be retrieved.${NC}"
            return 1
        fi
        
        printf "%-40s %-30s\n" "API NAME" "LABEL"
        printf "%s\n" "$(printf '=%.0s' {1..70})"
        
        echo "$QUERY_RESULT" | jq -r '.result.records[] | "\(.DeveloperName) \(.MasterLabel)"' | 
        while read -r api_name label; do
            printf "%-40s %-30s\n" "$api_name" "${label:0:28}"
        done
    fi
    
    echo
    return 0
}

delete_flow_interviews_by_definition() {
    local flow_developer_name=$1
    local max_retries=3
    
    echo -e "${YELLOW}Fetching Flow Definition for '${flow_developer_name}'...${NC}"
    
    FLOW_DEF_RESULT=$(sf data query --query "SELECT Id, DeveloperName FROM FlowDefinition WHERE DeveloperName='${flow_developer_name}'" --use-tooling-api --json 2>/dev/null)
    
    if ! echo "$FLOW_DEF_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 || ! echo "$FLOW_DEF_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
        echo -e "${YELLOW}Flow definition '${flow_developer_name}' not found in tooling API. Falling back to pattern matching...${NC}"
        delete_flow_interviews_with_retry "$flow_developer_name"
        return $?
    fi
    
    FLOW_DEF_ID=$(echo "$FLOW_DEF_RESULT" | jq -r '.result.records[0].Id')
    echo -e "${GREEN}Found Flow Definition ID: ${FLOW_DEF_ID}${NC}"
    
    echo -e "${YELLOW}Searching for flow interviews comprehensively...${NC}"
    
    INTERVIEW_IDS=()
    
    echo -e "${YELLOW}Searching for interviews containing '${flow_developer_name}'...${NC}"
    INTERVIEW_RESULT=$(sf data query --query "SELECT Id, InterviewLabel, InterviewStatus FROM FlowInterview WHERE InterviewLabel LIKE '%${flow_developer_name}%'" --json 2>/dev/null)
    
    if echo "$INTERVIEW_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$INTERVIEW_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
        while read -r interview_id; do
            INTERVIEW_IDS+=("$interview_id")
        done < <(echo "$INTERVIEW_RESULT" | jq -r '.result.records[].Id')
    fi
    
    echo -e "${YELLOW}Searching for interviews containing 'Meeting Report'...${NC}"
    MEETING_RESULT=$(sf data query --query "SELECT Id, InterviewLabel, InterviewStatus FROM FlowInterview WHERE InterviewLabel LIKE '%Meeting Report%'" --json 2>/dev/null)
    
    if echo "$MEETING_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$MEETING_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
        while read -r interview_id; do
            if [[ ! " ${INTERVIEW_IDS[@]} " =~ " ${interview_id} " ]]; then
                INTERVIEW_IDS+=("$interview_id")
            fi
        done < <(echo "$MEETING_RESULT" | jq -r '.result.records[].Id')
    fi
    
    PATTERN_WORDS=$(echo "$flow_developer_name" | sed 's/[^a-zA-Z0-9]/ /g' | tr -s ' ')
    
    for word in $PATTERN_WORDS; do
        if [ ${#word} -gt 4 ]; then
            echo -e "${YELLOW}Searching for interviews containing '${word}'...${NC}"
            WORD_RESULT=$(sf data query --query "SELECT Id FROM FlowInterview WHERE InterviewLabel LIKE '%${word}%'" --json 2>/dev/null)
            
            if echo "$WORD_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$WORD_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
                while read -r interview_id; do
                    if [[ ! " ${INTERVIEW_IDS[@]} " =~ " ${interview_id} " ]]; then
                        INTERVIEW_IDS+=("$interview_id")
                    fi
                done < <(echo "$WORD_RESULT" | jq -r '.result.records[].Id')
            fi
        fi
    done
    
    TOTAL_INTERVIEWS=${#INTERVIEW_IDS[@]}
    
    if [ $TOTAL_INTERVIEWS -eq 0 ]; then
        echo -e "${GREEN}No flow interviews found for '${flow_developer_name}'${NC}"
        return 0
    fi
    
    echo -e "${YELLOW}Found ${TOTAL_INTERVIEWS} interview(s) for '${flow_developer_name}'${NC}"
    echo -e "${YELLOW}Interview IDs: ${INTERVIEW_IDS[*]}${NC}"
    
    if confirm "Delete these ${TOTAL_INTERVIEWS} flow interview(s) with retries?"; then
        delete_interviews_with_retry "${INTERVIEW_IDS[@]}"
        return $?
    else
        echo -e "${YELLOW}Skipping interview deletion.${NC}"
        return 0
    fi
}

delete_interviews_with_retry() {
    local interview_ids=("$@")
    local max_retries=3
    local total_interviews=${#interview_ids[@]}
    local deleted_interviews=0
    local failed_interviews=()
    local remaining_interviews=("${interview_ids[@]}")
    
    echo -e "${YELLOW}Starting interview deletion with skip-and-retry logic...${NC}"
    echo -e "${YELLOW}Total interviews to delete: ${total_interviews}${NC}"
    
    echo -e "\n${BLUE}=== PHASE 1: Initial deletion attempt ===${NC}"
    local temp_failed=()
    
    for i in "${!remaining_interviews[@]}"; do
        local interview_id="${remaining_interviews[$i]}"
        echo -e "${BLUE}Processing interview $((i+1))/${#remaining_interviews[@]}: ${interview_id}${NC}"
        
        DELETE_RESULT=$(sf data delete record --sobject FlowInterview --record-id "$interview_id" --json 2>/dev/null)
        
        if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
            deleted_interviews=$((deleted_interviews + 1))
            echo -e "${GREEN}✓ Deleted interview ${interview_id} (${deleted_interviews}/${total_interviews})${NC}"
        else
            error_msg=$(echo "$DELETE_RESULT" | jq -r '.message // "Unknown error"')
            echo -e "${RED}✗ Skipping failed interview ${interview_id}: ${error_msg}${NC}"
            temp_failed+=("$interview_id")
        fi
        
        sleep 0.2
    done
    
    remaining_interviews=("${temp_failed[@]}")
    
    for retry_round in $(seq 1 $max_retries); do
        if [ ${#remaining_interviews[@]} -eq 0 ]; then
            echo -e "${GREEN}All interviews deleted successfully!${NC}"
            break
        fi
        
        echo -e "\n${BLUE}=== PHASE $((retry_round + 1)): Retry round ${retry_round}/${max_retries} ===${NC}"
        echo -e "${YELLOW}Retrying ${#remaining_interviews[@]} failed interviews...${NC}"
        
        local retry_failed=()
        local wait_time=$((retry_round * 2))  # Progressive delay: 2s, 4s, 6s
        
        echo -e "${YELLOW}Waiting ${wait_time} seconds before retry round...${NC}"
        sleep $wait_time
        
        for i in "${!remaining_interviews[@]}"; do
            local interview_id="${remaining_interviews[$i]}"
            echo -e "${BLUE}Retry $retry_round for interview $((i+1))/${#remaining_interviews[@]}: ${interview_id}${NC}"
            
            DELETE_RESULT=$(sf data delete record --sobject FlowInterview --record-id "$interview_id" --json 2>/dev/null)
            
            if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                deleted_interviews=$((deleted_interviews + 1))
                echo -e "${GREEN}✓ Retry successful for ${interview_id} (${deleted_interviews}/${total_interviews})${NC}"
            else
                error_msg=$(echo "$DELETE_RESULT" | jq -r '.message // "Unknown error"')
                echo -e "${RED}✗ Retry ${retry_round} failed for ${interview_id}: ${error_msg}${NC}"
                retry_failed+=("$interview_id")
            fi
            
            sleep 0.5
        done
        
        remaining_interviews=("${retry_failed[@]}")
    done
    
    if [ ${#remaining_interviews[@]} -gt 0 ]; then
        echo -e "\n${BLUE}=== PHASE $((max_retries + 2)): Alternative deletion methods ===${NC}"
        echo -e "${YELLOW}Trying alternative methods for ${#remaining_interviews[@]} persistent failures...${NC}"
        
        for interview_id in "${remaining_interviews[@]}"; do
            echo -e "\n${YELLOW}Trying alternative deletion for ${interview_id}...${NC}"
            
            DELETE_RESULT=$(sf data delete record --sobject FlowInterview --record-id "$interview_id" $TARGET_ORG --json 2>/dev/null)
            
            if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                deleted_interviews=$((deleted_interviews + 1))
                echo -e "${GREEN}✓ Alternative method 1 succeeded for ${interview_id}${NC}"
                continue
            fi
            
            APEX_RESULT=$(sf apex run --body "try { FlowInterview fi = [SELECT Id FROM FlowInterview WHERE Id = '${interview_id}' LIMIT 1]; delete fi; System.debug('Deleted: ' + '${interview_id}'); } catch(Exception e) { System.debug('Error: ' + e.getMessage()); }" $TARGET_ORG --json 2>/dev/null)
            
            if echo "$APEX_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                CHECK_RESULT=$(sf data query --query "SELECT Id FROM FlowInterview WHERE Id = '${interview_id}'" --json 2>/dev/null)
                if ! echo "$CHECK_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
                    deleted_interviews=$((deleted_interviews + 1))
                    echo -e "${GREEN}✓ Alternative method 2 (Apex) succeeded for ${interview_id}${NC}"
                    continue
                fi
            fi
            
            failed_interviews+=("$interview_id")
            echo -e "${RED}✗ All methods failed for interview ${interview_id}${NC}"
        done
    fi
    
    echo -e "\n${BLUE}=== FINAL DELETION SUMMARY ===${NC}"
    echo -e "${GREEN}Successfully deleted: ${deleted_interviews}/${total_interviews} interviews${NC}"
    
    if [ ${#failed_interviews[@]} -gt 0 ]; then
        echo -e "${RED}Failed to delete: ${#failed_interviews[@]} interviews${NC}"
        echo -e "${YELLOW}Permanently failed interview IDs:${NC}"
        for failed_id in "${failed_interviews[@]}"; do
            echo -e "  - ${failed_id}"
        done
        echo -e "\n${YELLOW}These interviews may need manual deletion from the Salesforce UI.${NC}"
        echo -e "${YELLOW}Go to Setup > Process Automation > Flow Interviews to delete them manually.${NC}"
    else
        echo -e "${GREEN}🎉 All interviews deleted successfully!${NC}"
    fi
    
    echo -e "\n${GREEN}Final result: ${deleted_interviews}/${total_interviews} interviews deleted${NC}"
    
    if [ $deleted_interviews -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

delete_flow_interviews_with_retry() {
    local flow_api_name=$1
    
    echo -e "${YELLOW}Using fallback method to find flow interviews for '${flow_api_name}'...${NC}"
    
    QUERY_RESULT=$(sf data query --query "SELECT Id, InterviewLabel, InterviewStatus FROM FlowInterview WHERE InterviewLabel LIKE '%${flow_api_name}%'" --json 2>/dev/null)
    
    # Check if the command was successful
    if ! echo "$QUERY_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
        echo -e "${RED}Error querying flow interviews: $(echo "$QUERY_RESULT" | jq -r '.message // "Unknown error"')${NC}"
        return 1
    fi
    
    # Check if records exist
    if ! echo "$QUERY_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
        echo -e "${GREEN}No flow interviews found for '${flow_api_name}'${NC}"
        return 0
    fi
    
    # Extract interview IDs
    INTERVIEWS=()
    while read -r interview_id; do
        INTERVIEWS+=("$interview_id")
    done < <(echo "$QUERY_RESULT" | jq -r '.result.records[].Id')
    
    # Count interviews
    INTERVIEW_COUNT=${#INTERVIEWS[@]}
    
    echo -e "${YELLOW}Found ${INTERVIEW_COUNT} interview(s) for '${flow_api_name}'${NC}"
    
    if confirm "Delete these ${INTERVIEW_COUNT} interview(s) with retry logic?"; then
        delete_interviews_with_retry "${INTERVIEWS[@]}"
        return $?
    else
        echo -e "${YELLOW}Skipping interview deletion.${NC}"
        return 0
    fi
}

# Function to delete flow using metadata API
delete_flow() {
    local flow_api_name=$1
    
    if [ -z "$flow_api_name" ]; then
        echo -e "${RED}Error: No flow API name provided.${NC}"
        return 1
    fi
    
    echo -e "${YELLOW}Preparing to delete flow '${flow_api_name}'...${NC}"
    
    # Try to delete the flow using sf CLI
    echo -e "${YELLOW}Attempting to delete flow using sf CLI...${NC}"
    
    # Try to use the sf project delete source command
    SF_RESULT=$(sf project delete source --metadata "Flow:$flow_api_name" $TARGET_ORG --no-prompt --json 2>/dev/null)
    
    if echo "$SF_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
        echo -e "${GREEN}Successfully deleted flow '${flow_api_name}'.${NC}"
        return 0
    else
        error_message=$(echo "$SF_RESULT" | jq -r '.result.deletedSource[0].error // .message // "Unknown error"')
        echo -e "${RED}Error deleting flow using sf: $error_message${NC}"
        
        # Check for specific error types and provide guidance
        if [[ "$error_message" == *"insufficient access rights on cross-reference id"* ]]; then
            echo -e "${YELLOW}This error typically means the flow is referenced by other components.${NC}"
            echo -e "${YELLOW}Trying alternative deletion methods...${NC}"
        fi
        
        # Try using destructiveChanges.xml
        echo -e "${YELLOW}Trying metadata API with destructiveChanges.xml...${NC}"
        
        # Create a temporary directory
        TEMP_DIR=$(mktemp -d)
        
        # Create destructiveChanges.xml
        cat > "$TEMP_DIR/destructiveChanges.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>${flow_api_name}</members>
        <name>Flow</name>
    </types>
    <version>58.0</version>
</Package>
EOF
        
        # Create empty package.xml
        cat > "$TEMP_DIR/package.xml" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <version>58.0</version>
</Package>
EOF
        
        # Deploy the destructive changes
        echo -e "${YELLOW}Deploying destructive changes to delete the flow...${NC}"
        
        # Try to use sf project deploy start with post-destructive-changes
        DEPLOY_RESULT=$(sf project deploy start --manifest "$TEMP_DIR/package.xml" --post-destructive-changes "$TEMP_DIR/destructiveChanges.xml" --wait 10 $TARGET_ORG --json 2>/dev/null)
        
        if echo "$DEPLOY_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
            echo -e "${GREEN}Successfully deleted flow '${flow_api_name}' using destructive changes.${NC}"
            rm -rf "$TEMP_DIR"
            return 0
        else
            error_message=$(echo "$DEPLOY_RESULT" | jq -r '.result.details.componentFailures[0].problem // .message // "Unknown error"')
            echo -e "${RED}Error with destructive changes: $error_message${NC}"
            
            # Check for specific error types and provide guidance
            if [[ "$error_message" == *"insufficient access rights on cross-reference id"* ]]; then
                echo -e "${YELLOW}This error typically means the flow is referenced by other components.${NC}"
                echo -e "${YELLOW}Common causes:${NC}"
                echo -e "  - Flow is used in Process Builder, Workflow Rules, or other automation"
                echo -e "  - Flow has active or paused interviews"
                echo -e "  - Flow is referenced by Lightning pages, custom buttons, or Apex code"
                echo -e "  - Flow is used in assignment rules or escalation rules"
                echo -e "\n${YELLOW}To resolve this:${NC}"
                echo -e "  1. Go to Setup > Process Automation > Flows"
                echo -e "  2. Find '${flow_api_name}' and check the 'Referenced By' section"
                echo -e "  3. Remove all references to this flow first"
                echo -e "  4. Then try deleting the flow again"
                echo -e "\n${YELLOW}Alternatively, you can deactivate the flow first in the UI.${NC}"
            fi
            
            # Try with direct file deletion
            echo -e "${YELLOW}Trying to directly delete the flow file...${NC}"
            
            # Look for the flow file in the force-app directory
            FLOW_FILE=$(find ../force-app -name "${flow_api_name}.flow-meta.xml" 2>/dev/null)
            
            if [ -n "$FLOW_FILE" ]; then
                echo -e "${YELLOW}Found flow file at: $FLOW_FILE${NC}"
                
                # Check if there's a sfdx-project.json file
                if [ -f "../sfdx-project.json" ]; then
                    echo -e "${YELLOW}Trying to use sf project delete source with the metadata flag...${NC}"
                    
                    # Use metadata flag instead of source-path
                    FILE_DELETE_RESULT=$(sf project delete source --metadata "Flow:$flow_api_name" $TARGET_ORG --no-prompt --json 2>/dev/null)
                    
                    if echo "$FILE_DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                        echo -e "${GREEN}Successfully deleted flow file '${flow_api_name}'.${NC}"
                        rm -rf "$TEMP_DIR"
                        return 0
                    else
                        echo -e "${RED}Error deleting flow file: $(echo "$FILE_DELETE_RESULT" | jq -r '.message // "Unknown error"')${NC}"
                    fi
                else
                    echo -e "${YELLOW}No sfdx-project.json found, cannot use sf project delete source.${NC}"
                fi
            else
                echo -e "${YELLOW}Could not find flow file in the force-app directory.${NC}"
            fi
            
            # Cleanup temporary directory
            rm -rf "$TEMP_DIR"
            
            echo -e "${RED}All deletion attempts failed. You may need to delete the flow manually.${NC}"
            echo -e "${YELLOW}Try going to Setup > Process Automation > Flows and delete the flow there.${NC}"
            return 1
        fi
    fi
}

# Function to delete flows by pattern
delete_flows_by_pattern() {
    local pattern=$1
    
    echo -e "${YELLOW}Searching for flows matching pattern '${pattern}'...${NC}"
    
    # Try using metadata API first
    MD_RESULT=$(sf org list metadata -m Flow $TARGET_ORG --json)
    
    local flow_api_names=()
    
    # Check if the command was successful
    if echo "$MD_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$MD_RESULT" | jq -e '.result | length > 0' > /dev/null 2>&1; then
        # Extract flow names from Metadata API that match the pattern
        while read -r name; do
            if [[ "$name" == *"$pattern"* ]]; then
                flow_api_names+=("$name")
            fi
        done < <(echo "$MD_RESULT" | jq -r '.result[].fullName')
    else
        # If Metadata API fails, try Tooling API
        echo -e "${YELLOW}Metadata API failed, trying Tooling API to find flows...${NC}"
        
        QUERY_RESULT=$(sf data query --query "SELECT DeveloperName FROM FlowDefinition WHERE DeveloperName LIKE '%${pattern}%'" $TARGET_ORG --use-tooling-api --json)
        
        if echo "$QUERY_RESULT" | jq -e '.status == 0' > /dev/null 2>&1 && echo "$QUERY_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
            # Extract flow API names from Tooling API
            while read -r name; do
                flow_api_names+=("$name")
            done < <(echo "$QUERY_RESULT" | jq -r '.result.records[].DeveloperName')
        else
            echo -e "${RED}Error searching for flows: $(echo "$QUERY_RESULT" | jq -r '.message // "Unknown error"')${NC}"
            return 1
        fi
    fi
    
    # Check if any flows were found
    if [ ${#flow_api_names[@]} -eq 0 ]; then
        echo -e "${RED}No flows found matching pattern '${pattern}'${NC}"
        return 1
    fi
    
    # Count matching flows
    FLOW_COUNT=${#flow_api_names[@]}
    
    echo -e "${YELLOW}Found ${FLOW_COUNT} flow(s) matching pattern '${pattern}':${NC}"
    for name in "${flow_api_names[@]}"; do
        echo "  $name"
    done
    echo
    
    if confirm "${YELLOW}Delete all these flows?${NC}"; then
        local success_count=0
        
        for flow_api_name in "${flow_api_names[@]}"; do
            echo -e "\n${BLUE}Processing flow: ${flow_api_name}${NC}"
            
            # Delete flow interviews first using Flow Definition method
            delete_flow_interviews_by_definition "$flow_api_name"
            
            # Then delete flow versions (highest version first)
            delete_flow_versions_with_retry "$flow_api_name"
            
            # Finally delete the flow definition
            if delete_flow "$flow_api_name"; then
                ((success_count++))
            fi
        done
        
        echo -e "${GREEN}Successfully deleted ${success_count} out of ${FLOW_COUNT} flows.${NC}"
    else
        echo -e "${YELLOW}Bulk deletion cancelled.${NC}"
    fi
}

# Function to delete flow versions with skip-and-retry logic (highest version first)
delete_flow_versions_with_retry() {
    local flow_api_name=$1
    
    echo -e "${YELLOW}Fetching flow versions for '${flow_api_name}' (highest version first)...${NC}"
    
    # Query for flow versions using Tooling API, ordered by version number descending
    VERSION_RESULT=$(sf data query --query "SELECT Id, VersionNumber, Status FROM Flow WHERE Definition.DeveloperName='${flow_api_name}' ORDER BY VersionNumber DESC" --use-tooling-api --json 2>/dev/null)
    
    # Check if the command was successful
    if ! echo "$VERSION_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
        echo -e "${RED}Error querying flow versions: $(echo "$VERSION_RESULT" | jq -r '.message // "Unknown error"')${NC}"
        return 1
    fi
    
    # Check if records exist
    if ! echo "$VERSION_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
        echo -e "${GREEN}No flow versions found for '${flow_api_name}'${NC}"
        return 0
    fi
    
    # Extract version information (ID, VersionNumber, Status)
    local version_ids=()
    local version_info=()
    local total_versions=0
    
    while IFS='|' read -r version_id version_number status; do
        version_ids+=("$version_id")
        version_info+=("v${version_number} (${status})")
        total_versions=$((total_versions + 1))
    done < <(echo "$VERSION_RESULT" | jq -r '.result.records[] | "\(.Id)|\(.VersionNumber)|\(.Status)"')
    
    echo -e "${YELLOW}Found ${total_versions} version(s) for '${flow_api_name}':${NC}"
    for i in "${!version_info[@]}"; do
        echo -e "  ${version_ids[$i]} - ${version_info[$i]}"
    done
    echo
    
    # Ask for confirmation
    if confirm "Delete these ${total_versions} flow version(s) with skip-and-retry logic?"; then
        delete_flow_versions_with_enhanced_retry "${version_ids[@]}"
        return $?
    else
        echo -e "${YELLOW}Skipping flow version deletion.${NC}"
        return 0
    fi
}

# Function to delete flow versions with enhanced skip-and-retry logic
delete_flow_versions_with_enhanced_retry() {
    local version_ids=("$@")
    local max_retries=3
    local total_versions=${#version_ids[@]}
    local deleted_versions=0
    local failed_versions=()
    local remaining_versions=("${version_ids[@]}")
    
    echo -e "${YELLOW}Starting flow version deletion with skip-and-retry logic...${NC}"
    echo -e "${YELLOW}Total versions to delete: ${total_versions} (starting from highest version)${NC}"
    
    # Phase 1: First pass - try each version once, skip failures
    echo -e "\n${BLUE}=== PHASE 1: Initial version deletion attempt ===${NC}"
    local temp_failed=()
    
    for i in "${!remaining_versions[@]}"; do
        local version_id="${remaining_versions[$i]}"
        echo -e "${BLUE}Processing version $((i+1))/${#remaining_versions[@]}: ${version_id}${NC}"
        
        # Try to delete using Flow (version) object
        DELETE_RESULT=$(sf data delete record --sobject Flow --record-id "$version_id" --use-tooling-api --json 2>/dev/null)
        
        if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
            deleted_versions=$((deleted_versions + 1))
            echo -e "${GREEN}✓ Deleted flow version ${version_id} (${deleted_versions}/${total_versions})${NC}"
        else
            error_msg=$(echo "$DELETE_RESULT" | jq -r '.message // "Unknown error"')
            echo -e "${RED}✗ Skipping failed version ${version_id}: ${error_msg}${NC}"
            temp_failed+=("$version_id")
        fi
        
        # Small delay to avoid rate limiting
        sleep 0.2
    done
    
    # Phase 2: Retry failed versions with exponential backoff
    remaining_versions=("${temp_failed[@]}")
    
    for retry_round in $(seq 1 $max_retries); do
        if [ ${#remaining_versions[@]} -eq 0 ]; then
            echo -e "${GREEN}All flow versions deleted successfully!${NC}"
            break
        fi
        
        echo -e "\n${BLUE}=== PHASE $((retry_round + 1)): Retry round ${retry_round}/${max_retries} ===${NC}"
        echo -e "${YELLOW}Retrying ${#remaining_versions[@]} failed versions...${NC}"
        
        local retry_failed=()
        local wait_time=$((retry_round * 3))  # Progressive delay: 3s, 6s, 9s
        
        echo -e "${YELLOW}Waiting ${wait_time} seconds before retry round...${NC}"
        sleep $wait_time
        
        for i in "${!remaining_versions[@]}"; do
            local version_id="${remaining_versions[$i]}"
            echo -e "${BLUE}Retry $retry_round for version $((i+1))/${#remaining_versions[@]}: ${version_id}${NC}"
            
            DELETE_RESULT=$(sf data delete record --sobject Flow --record-id "$version_id" --use-tooling-api --json 2>/dev/null)
            
            if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                deleted_versions=$((deleted_versions + 1))
                echo -e "${GREEN}✓ Retry successful for version ${version_id} (${deleted_versions}/${total_versions})${NC}"
            else
                error_msg=$(echo "$DELETE_RESULT" | jq -r '.message // "Unknown error"')
                echo -e "${RED}✗ Retry ${retry_round} failed for version ${version_id}: ${error_msg}${NC}"
                retry_failed+=("$version_id")
            fi
            
            # Longer delay between retry attempts
            sleep 0.7
        done
        
        # Update remaining versions for next retry round
        remaining_versions=("${retry_failed[@]}")
    done
    
    # Final phase: Alternative methods for persistent failures
    if [ ${#remaining_versions[@]} -gt 0 ]; then
        echo -e "\n${BLUE}=== PHASE $((max_retries + 2)): Alternative deletion methods ===${NC}"
        echo -e "${YELLOW}Trying alternative methods for ${#remaining_versions[@]} persistent version failures...${NC}"
        
        for version_id in "${remaining_versions[@]}"; do
            echo -e "\n${YELLOW}Trying alternative deletion for version ${version_id}...${NC}"
            
            # Method 1: Try without tooling API flag
            DELETE_RESULT=$(sf data delete record --sobject Flow --record-id "$version_id" $TARGET_ORG --json 2>/dev/null)
            
            if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                deleted_versions=$((deleted_versions + 1))
                echo -e "${GREEN}✓ Alternative method 1 succeeded for version ${version_id}${NC}"
                continue
            fi
            
            # Method 2: Try via Apex deletion
            APEX_RESULT=$(sf apex run --body "try { Flow flowVersion = [SELECT Id FROM Flow WHERE Id = '${version_id}' LIMIT 1]; delete flowVersion; System.debug('Deleted flow version: ' + '${version_id}'); } catch(Exception e) { System.debug('Error deleting flow version: ' + e.getMessage()); }" $TARGET_ORG --json 2>/dev/null)
            
            if echo "$APEX_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                # Check if the version still exists
                CHECK_RESULT=$(sf data query --query "SELECT Id FROM Flow WHERE Id = '${version_id}'" --use-tooling-api --json 2>/dev/null)
                if ! echo "$CHECK_RESULT" | jq -e '.result.records | length > 0' > /dev/null 2>&1; then
                    deleted_versions=$((deleted_versions + 1))
                    echo -e "${GREEN}✓ Alternative method 2 (Apex) succeeded for version ${version_id}${NC}"
                    continue
                fi
            fi
            
            # Method 3: Try deactivating first, then deleting (for active versions)
            echo -e "${YELLOW}Trying to deactivate version first...${NC}"
            DEACTIVATE_RESULT=$(sf apex run --body "try { Flow flowVersion = [SELECT Id, Status FROM Flow WHERE Id = '${version_id}' LIMIT 1]; if(flowVersion.Status == 'Active') { flowVersion.Status = 'Draft'; update flowVersion; System.debug('Deactivated: ' + '${version_id}'); } } catch(Exception e) { System.debug('Error: ' + e.getMessage()); }" $TARGET_ORG --json 2>/dev/null)
            
            sleep 2  # Give time for deactivation to process
            
            DELETE_RESULT=$(sf data delete record --sobject Flow --record-id "$version_id" --use-tooling-api --json 2>/dev/null)
            
            if echo "$DELETE_RESULT" | jq -e '.status == 0' > /dev/null 2>&1; then
                deleted_versions=$((deleted_versions + 1))
                echo -e "${GREEN}✓ Alternative method 3 (deactivate+delete) succeeded for version ${version_id}${NC}"
                continue
            fi
            
            # If all methods fail, add to final failed list
            failed_versions+=("$version_id")
            echo -e "${RED}✗ All methods failed for flow version ${version_id}${NC}"
        done
    fi
    
    # Final Summary
    echo -e "\n${BLUE}=== FINAL VERSION DELETION SUMMARY ===${NC}"
    echo -e "${GREEN}Successfully deleted: ${deleted_versions}/${total_versions} flow versions${NC}"
    
    if [ ${#failed_versions[@]} -gt 0 ]; then
        echo -e "${RED}Failed to delete: ${#failed_versions[@]} versions${NC}"
        echo -e "${YELLOW}Permanently failed version IDs:${NC}"
        for failed_id in "${failed_versions[@]}"; do
            echo -e "  - ${failed_id}"
        done
        echo -e "\n${YELLOW}These versions may need manual deletion from the Salesforce UI.${NC}"
        echo -e "${YELLOW}Go to Setup > Process Automation > Flows > [Flow Name] > Versions to delete them manually.${NC}"
    else
        echo -e "${GREEN}🎉 All flow versions deleted successfully!${NC}"
    fi
    
    # Return success if we deleted at least some versions
    if [ $deleted_versions -gt 0 ]; then
        return 0
    else
        return 1
    fi
}

# Main menu
main_menu() {
    while true; do
        echo -e "\n${BLUE}Options:${NC}"
        echo -e "1. List all flows"
        echo -e "2. Delete a specific flow (interviews and versions)"
        echo -e "3. Delete multiple flows by pattern"
        echo -e "4. Exit"
        echo
        read -p "Select an option (1-4): " option
        
        case $option in
            1)
                # List all flows
                list_flows
                ;;
            2)
                # Delete a specific flow
                read -p "Enter the API name of the flow to delete: " flow_api_name
                if [ -z "$flow_api_name" ]; then
                    echo -e "${RED}Error: Flow API name cannot be empty.${NC}"
                    continue
                fi
                
                # Delete flow interviews first using Flow Definition method
                delete_flow_interviews_by_definition "$flow_api_name"
                
                # Then delete flow versions (highest version first)
                delete_flow_versions_with_retry "$flow_api_name"
                
                # Finally delete the flow definition
                delete_flow "$flow_api_name"
                ;;
            3)
                # Delete multiple flows by pattern
                read -p "Enter a pattern to match flow API names (e.g., 'KS_'): " flow_pattern
                if [ -z "$flow_pattern" ]; then
                    echo -e "${RED}Error: Pattern cannot be empty.${NC}"
                    continue
                fi
                
                delete_flows_by_pattern "$flow_pattern"
                ;;
            4)
                # Exit
                echo -e "${GREEN}Exiting. Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please try again.${NC}"
                ;;
        esac
    done
}

# Start the script
main_menu