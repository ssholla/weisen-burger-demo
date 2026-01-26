#!/bin/bash

# Script to set up GitHub environments, branches, and branch protection rules
# Make sure you have GitHub CLI installed and authenticated: gh auth login

set -e

echo "🚀 Setting up GitHub environments, branches, and branch protection rules..."

create_environment() {
    local env_name=$1
    echo "🏗️  Creating $env_name environment..."
    
    local repo_info=$(gh repo view --json owner,name)
    local owner=$(echo $repo_info | jq -r '.owner.login')
    local repo=$(echo $repo_info | jq -r '.name')
    
    gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/$owner/$repo/environments/$env_name" \
        --input - <<< '{}'
        
    echo "✅ Environment $env_name created"
}

set_secrets() {
    local env_name=$1
    echo "📝 Setting secrets for $env_name environment..."
    
    CONSUMER_KEY="."
    DEPLOYMENT_USER="."
    JWT_SERVER_KEY="."
    
    echo "$CONSUMER_KEY" | gh secret set CONSUMER_KEY --env "$env_name"
    echo "$DEPLOYMENT_USER" | gh secret set DEPLOYMENT_USER --env "$env_name"
    echo "$JWT_SERVER_KEY" | gh secret set JWT_SERVER_KEY --env "$env_name"
    
    echo "✅ Secrets set for $env_name environment"
}

set_variables() {
    local env_name=$1
    echo "📝 Setting variables for $env_name environment..."
    # EXCLUDE_USERS_FROM_RULES: comma-separated GitHub usernames to exclude from branch rules
    # Example: "dependabot[bot],renovate-bot" or empty string for none
    
    case $env_name in
        "prod")
            gh variable set DEPLOYMENT_USER_MAP --env "$env_name" --body '.'
            gh variable set INSTANCE_URL --env "$env_name" --body "."
            gh variable set JWT_LAST_UPDATED_DATE --env "$env_name" --body "."
            gh variable set KERUN_ONE_CASE_STATUS --env "$env_name" --body "Deployed - Sandbox (Prod)"
            gh variable set EXCLUDE_USERS_FROM_RULES --env "$env_name" --body ""
            ;;
        "uat")
            gh variable set DEPLOYMENT_USER_MAP --env "$env_name" --body '.'
            gh variable set INSTANCE_URL --env "$env_name" --body "."
            gh variable set JWT_LAST_UPDATED_DATE --env "$env_name" --body "."
            gh variable set KERUN_ONE_CASE_STATUS --env "$env_name" --body "Deployed - Sandbox (UAT)"
            gh variable set EXCLUDE_USERS_FROM_RULES --env "$env_name" --body ""
            ;;
        "ci")
            gh variable set DEPLOYMENT_USER_MAP --env "$env_name" --body '.'
            gh variable set INSTANCE_URL --env "$env_name" --body "."
            gh variable set JWT_LAST_UPDATED_DATE --env "$env_name" --body "."
            gh variable set KERUN_ONE_CASE_STATUS --env "$env_name" --body "Deployed - Sandbox (CI)"
            gh variable set EXCLUDE_USERS_FROM_RULES --env "$env_name" --body ""
            ;;
    esac
    
    echo "✅ Variables set for $env_name environment"
}

create_branch() {
    local branch_name=$1
    echo "🌿 Creating $branch_name branch..."
    
    # Check if branch already exists
    if gh api repos/:owner/:repo/branches/$branch_name > /dev/null 2>&1; then
        echo "ℹ️  Branch $branch_name already exists, skipping creation"
        return 0
    fi
    
    # Get the SHA of the main branch
    local main_sha=$(gh api repos/:owner/:repo/branches/main --jq '.commit.sha')
    
    # Create the new branch
    gh api \
        --method POST \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/:owner/:repo/git/refs" \
        --field ref="refs/heads/$branch_name" \
        --field sha="$main_sha"
        
    echo "✅ Branch $branch_name created"
}

setup_branch_protection() {
    local branch_name=$1
    echo "🛡️  Setting up branch protection for $branch_name..."
    
    local repo_info=$(gh repo view --json owner,name)
    local owner=$(echo $repo_info | jq -r '.owner.login')
    local repo=$(echo $repo_info | jq -r '.name')
    
    # Branch protection rules
    local protection_rules='{
        "required_status_checks": {
            "strict": true,
            "contexts": []
        },
        "enforce_admins": true,
        "required_pull_request_reviews": {
            "dismiss_stale_reviews": true,
            "require_code_owner_reviews": false,
            "require_last_push_approval": false
        },
        "restrictions": null,
        "allow_force_pushes": false,
        "allow_deletions": false,
        "block_creations": false,
        "required_conversation_resolution": true,
        "enabled": true
    }'
    
    gh api \
        --method PUT \
        -H "Accept: application/vnd.github+json" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "/repos/$owner/$repo/branches/$branch_name/protection" \
        --input - <<< "$protection_rules"
        
    echo "✅ Branch protection configured for $branch_name"
}

# Main execution

echo "🏗️  Creating environments..."
environments=("prod" "uat" "ci")

for env in "${environments[@]}"; do
    echo ""
    echo "🔧 Configuring $env environment..."
    
    create_environment "$env"
    
    unset CONSUMER_KEY DEPLOYMENT_USER JWT_SERVER_KEY
    
    set_secrets "$env"
    set_variables "$env"
    
    echo "✅ $env environment configured successfully!"
done


echo ""

echo "🌿 Creating branches..."
branches=("develop" "uat")

for branch in "${branches[@]}"; do
    create_branch "$branch"
done

echo ""
echo "🛡️  Setting up branch protection rules..."
protected_branches=("main" "develop" "uat")

for branch in "${protected_branches[@]}"; do
    setup_branch_protection "$branch"
done


echo ""
echo "🎉 All environments, branches, and branch protection rules have been configured!"
echo ""
echo "📋 Summary:"
echo "   • Branches created: develop, uat"
echo "   • Branch protection enabled for: main, develop, uat"
echo "   • Environments: prod (3 secrets + 5 variables), uat (3 secrets + 5 variables), ci (3 secrets + 5 variables)"
echo ""
echo "💡 You can view your:"
echo "   • Environments at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/settings/environments"
echo "   • Branch protection rules at: https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/settings/branches"