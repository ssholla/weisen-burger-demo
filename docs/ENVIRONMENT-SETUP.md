# GitHub Environment Setup & Configuration Guide

This comprehensive guide provides detailed instructions for setting up and configuring GitHub environments, secrets, and variables for a secure, multi-environment Salesforce deployment pipeline with JWT authentication, automated case management, and Jira integration.

## 🎯 Architecture Overview

This project implements a **sophisticated three-tier deployment architecture** with comprehensive security, automation, and integration capabilities:

```mermaid
graph TB
    subgraph "GitHub Environments"
        A[CI Environment] --> B[UAT Environment] --> C[Production Environment]
    end
    
    subgraph "Salesforce Orgs"
        D[Development Sandbox] --> E[UAT Sandbox] --> F[Production Org]
    end
    
    subgraph "Security Layer"
        G[JWT Certificates] --> H[Connected Apps] --> I[Environment Secrets]
    end
    
    subgraph "Integration Layer"
        J[Case Management] --> K[Jira Integration] --> L[Deployment Tracking]
    end
    
    A --> D
    B --> E  
    C --> F
    G --> A
    G --> B
    G --> C
    J --> A
    J --> B
    J --> C
```

### Environment Strategy & Benefits

| Environment | Purpose | Automation Level | Security Level | Business Impact |
|-------------|---------|------------------|----------------|------------------|
| **CI** | Continuous integration, automated testing | Fully Automated | Standard | Development |
| **UAT** | User acceptance testing, stakeholder validation | Semi-Automated | Enhanced | Pre-Production |
| **Production** | Live customer environment | Manual Approval | Maximum | Business Critical |

## 🚀 Quick Start Guide

### Prerequisites Checklist

Before beginning the setup process, ensure you have:

- [ ] **GitHub Repository Admin Access** - Required for environment management
- [ ] **Salesforce Org Admin Access** - For all three environments (CI, UAT, Production)
- [ ] **GitHub CLI Installed** - Latest version with authentication configured
- [ ] **OpenSSL Installed** - For SSL certificate generation
- [ ] **jq Command Line Tool** - For JSON processing in scripts
- [ ] **Salesforce CLI Installed** - Latest version (sf command)

### Automated Setup Process

Execute the complete setup process with these commands:

```bash
# Step 1: Clone and navigate to project
git clone <your-repo-url>
cd advanced-project-template

# Step 2: Make scripts executable
chmod +x ./scripts/bash/*.sh

# Step 3: Generate JWT certificates (creates server.key and server.crt)
./scripts/bash/generate-ssl-certificates-auto.sh

# Step 4: Create GitHub environments with placeholder secrets
./scripts/bash/setup-github-environments.sh

# Step 5: Verify setup
gh auth status
gh api repos/:owner/:repo/environments
```

**Expected Output:**
```
✅ SSL certificates generated successfully
✅ GitHub environments created: ci, uat, prod
✅ Placeholder secrets configured
✅ Environment variables set
⚠️  Manual secret update required (see configuration section)
```

## 🔐 JWT Certificate Generation & Management

### Understanding JWT Authentication

**JSON Web Token (JWT) Bearer Token Flow** provides secure, certificate-based authentication for Salesforce deployments without requiring user interaction. This method is essential for automated CI/CD pipelines.

#### Benefits of JWT Authentication:
- **🔒 Enhanced Security**: No password storage or session management
- **🤖 Automation Friendly**: Perfect for CI/CD pipelines
- **⚡ High Performance**: No interactive authentication delays
- **📊 Audit Trail**: Complete logging of authentication events
- **🔄 Scalable**: Supports multiple concurrent deployments

### Certificate Generation Process

#### Automated Generation (Recommended)

```bash
# Execute the automated certificate generation script
./scripts/bash/generate-ssl-certificates-auto.sh

# Verify certificate generation
ls -la server.*
# Expected output:
# server.key (Private key - keep secure)
# server.crt (Public certificate - upload to Salesforce)
```

#### Manual Generation (Advanced)

For custom certificate requirements or troubleshooting:

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr \
  -subj "/C=US/ST=CA/L=San Francisco/O=YourCompany/OU=IT/CN=salesforce-deployment"

# Generate self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Clean up CSR file
rm server.csr

# Verify certificate details
openssl x509 -in server.crt -text -noout
```

#### Certificate Security Best Practices

```bash
# Set appropriate file permissions
chmod 600 server.key  # Private key - read-only for owner
chmod 644 server.crt  # Public certificate - readable

# Backup certificates securely
tar -czf certificates-backup-$(date +%Y%m%d).tar.gz server.*
gpg --encrypt --recipient your-email@company.com certificates-backup-*.tar.gz

# Store backup in secure location (not in version control)
mv certificates-backup-*.tar.gz.gpg ~/secure-backups/
```

### Certificate Rotation Schedule

| Certificate Age | Action Required | Frequency |
|-----------------|-----------------|-----------|
| **0-90 days** | ✅ Active use | Monitor expiration |
| **90-180 days** | ⚠️ Plan rotation | Quarterly review |
| **180-270 days** | 🔄 Begin rotation | Generate new certificates |
| **270+ days** | 🚨 Critical rotation | Immediate action required |

## � GitHub Environments & Secrets Configuration

### Environment Structure Overview

After running the setup script, your GitHub repository will have three environments configured:

```yaml
environments:
  ci:
    protection_rules: []
    deployment_branch_policy: 
      protected_branches: false
      custom_branch_policies: true
      
  uat:
    protection_rules:
      - type: required_reviewers
        reviewers: 1
    deployment_branch_policy:
      protected_branches: true
      
  prod:
    protection_rules:
      - type: required_reviewers
        reviewers: 2
      - type: wait_timer
        wait_timer: 5
    deployment_branch_policy:
      protected_branches: true
```

### Comprehensive Secrets Configuration

#### Primary Deployment Secrets

##### JWT_SERVER_KEY
**Purpose**: Private key for JWT authentication  
**Format**: Complete PEM-formatted private key with headers  
**Security Level**: 🔴 Critical - Never expose or log

```bash
# How to obtain and configure:
cat server.key | gh secret set JWT_SERVER_KEY --env ci
cat server.key | gh secret set JWT_SERVER_KEY --env uat  
cat server.key | gh secret set JWT_SERVER_KEY --env prod

# Verify secret is set (will show *** for security)
gh secret list --env ci
```

**Example Format:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKB
[... multiple lines of base64 encoded key data ...]
-----END PRIVATE KEY-----
```

##### CONSUMER_KEY
**Purpose**: Salesforce Connected App Consumer Key  
**Format**: 85-character alphanumeric string starting with "3MVG"  
**Security Level**: 🟡 Sensitive - OAuth identifier

```bash
# Obtain from Salesforce Setup → App Manager → [Your Connected App] → View
# Format: 3MVG9...

# Set for each environment
gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env ci
gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env uat
gh secret set CONSUMER_KEY --body "3MVG9XXXXXXXXXXXXXXXXXXXXXXX" --env prod
```

##### DEPLOYMENT_USER
**Purpose**: Salesforce username for JWT authentication  
**Format**: Email address format (username@domain.sandbox for sandboxes)  
**Security Level**: 🟢 Low - Public identifier

```bash
# Environment-specific deployment users
gh secret set DEPLOYMENT_USER --body "deploy@company.com.ci" --env ci
gh secret set DEPLOYMENT_USER --body "deploy@company.com.uat" --env uat  
gh secret set DEPLOYMENT_USER --body "deploy@company.com" --env prod
```

#### Integration Secrets (Optional)

##### KERUN_ORG_* Secrets
**Purpose**: Secondary Salesforce org for case management integration

```bash
# Complete KERUN org configuration
gh secret set KERUN_ORG_JWT_SERVER_KEY --body "$(cat kerun-server.key)" --env ci
gh secret set KERUN_ORG_CONSUMER_KEY --body "3MVG9KERUN_CONSUMER_KEY" --env ci
gh secret set KERUN_ORG_DEPLOYMENT_USER --body "integration@kerun.com" --env ci

# Repeat for uat and prod environments
```

##### JIRA Integration Secrets
**Purpose**: Automated ticket status updates during deployments

```bash
# JIRA API configuration
gh secret set KERUN_JIRA_URL --body "https://yourcompany.atlassian.net" --env ci
gh secret set KERUN_JIRA_USERNAME --body "jira-integration@company.com" --env ci
gh secret set KERUN_JIRA_ACCESS_API --body "ATATT3xFfGF0..." --env ci
```

### Environment Variables Configuration

#### Core Environment Variables

```bash
# CI Environment Variables
gh variable set INSTANCE_URL --body "https://company--ci.sandbox.my.salesforce.com" --env ci
gh variable set DEPLOYMENT_USER_MAP --body '{"github-user1": "sf-user1@company.com.ci", "github-user2": "sf-user2@company.com.ci"}' --env ci

# UAT Environment Variables  
gh variable set INSTANCE_URL --body "https://company--uat.sandbox.my.salesforce.com" --env uat
gh variable set DEPLOYMENT_USER_MAP --body '{"github-user1": "sf-user1@company.com.uat", "github-user2": "sf-user2@company.com.uat"}' --env uat

# Production Environment Variables
gh variable set INSTANCE_URL --body "https://company.my.salesforce.com" --env prod
gh variable set DEPLOYMENT_USER_MAP --body '{"github-user1": "sf-user1@company.com", "github-user2": "sf-user2@company.com"}' --env prod
```

#### Integration Environment Variables

```bash
# KERUN org integration
gh variable set KERUN_INSTANCE_URL --body "https://kerun.my.salesforce.com" --env ci
gh variable set KERUN_ONE_CASE_STATUS --body "Deployed to CI" --env ci

gh variable set KERUN_INSTANCE_URL --body "https://kerun.my.salesforce.com" --env uat  
gh variable set KERUN_ONE_CASE_STATUS --body "Deployed to UAT" --env uat

gh variable set KERUN_INSTANCE_URL --body "https://kerun.my.salesforce.com" --env prod
gh variable set KERUN_ONE_CASE_STATUS --body "Deployed to Production" --env prod
```

### User Mapping Configuration

The `DEPLOYMENT_USER_MAP` variable enables dynamic user assignment based on who triggers the deployment:

```json
{
  "john.doe": "john.doe@company.com",
  "jane.smith": "jane.smith@company.com", 
  "devops-bot": "devops@company.com",
  "emergency-deploy": "admin@company.com"
}
```

**Benefits:**
- **Audit Trail**: Know exactly who deployed what
- **Permission Management**: Different users can have different deployment permissions
- **Fallback Mechanism**: Uses default `DEPLOYMENT_USER` if mapping not found
- **Compliance**: Meets regulatory requirements for deployment attribution
```

**What Gets Generated:**
- `certificates/server.key` - Private key (use this for JWT_SERVER_KEY)
- `certificates/server.csr` - Certificate signing request
- `certificates/server.crt` - Self-signed certificate

**Using the Generated Key:**
1. Run the certificate generation script
2. Copy the contents of `certificates/server.key`
3. Paste the entire key (including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`) into the `JWT_SERVER_KEY` secret

**Important Notes:**
- Keep the `server.key` file secure and never commit it to version control
- The certificates are valid for 365 days
- For production, consider using certificates from a trusted Certificate Authority
- The generated key uses 2048-bit RSA encryption

### Step 3: Verify Environment Variables

Check that these variables are correctly set for each environment:

#### All Environments
- `DEPLOYMENT_USER_MAP` - Maps GitHub users to Salesforce users
- `JWT_LAST_UPDATED_DATE` - Date when JWT key was last rotated
- `KERUN_ONE_CASE_STATUS` - Deployment status tracking

## ✅ Environment Validation & Testing

### Automated Validation Scripts

After completing the setup, validate your configuration with these comprehensive tests:

```bash
# Validate GitHub environments and secrets
./scripts/validation/validate-github-setup.sh

# Test JWT authentication for each environment
./scripts/validation/test-jwt-auth.sh ci
./scripts/validation/test-jwt-auth.sh uat
./scripts/validation/test-jwt-auth.sh prod

# Verify Connected App configurations
./scripts/validation/verify-connected-apps.sh
```

### Manual Validation Checklist

#### GitHub Environment Validation
- [ ] **CI Environment Exists**: Accessible at `https://github.com/[owner]/[repo]/settings/environments`
- [ ] **UAT Environment Configured**: Has required reviewer protection
- [ ] **Production Environment Secured**: Has multiple reviewers and wait timer
- [ ] **All Secrets Present**: No missing or placeholder secrets
- [ ] **Environment Variables Set**: All required variables configured
- [ ] **User Mapping Valid**: JSON format correct in `DEPLOYMENT_USER_MAP`

#### Salesforce Connected App Validation
```bash
# Test JWT authentication for each environment
sf org login jwt \
  --username "your-deploy-user@company.com.ci" \
  --jwt-key-file server.key \
  --client-id "3MVG9..." \
  --instance-url "https://company--ci.sandbox.my.salesforce.com"

# Verify successful authentication
sf org display --target-org ci-deploy-user@company.com.ci

# Test deployment permissions
sf project deploy validate --source-dir force-app --target-org ci-deploy-user@company.com.ci
```

#### Integration Validation
```bash
# Test case management integration (if configured)
curl -X POST \
  -H "Authorization: Bearer $(sf org display --target-org kerun-org --json | jq -r .result.accessToken)" \
  -H "Content-Type: application/json" \
  -d '{"Subject": "Test Case", "Status": "New"}' \
  "https://kerun.my.salesforce.com/services/data/v62.0/sobjects/Case/"

# Test Jira integration (if configured)
curl -u "$JIRA_USERNAME:$JIRA_API_TOKEN" \
  -X GET \
  -H "Content-Type: application/json" \
  "$JIRA_URL/rest/api/3/myself"
```

## 🔐 Security Best Practices & Compliance

### Secrets Management Security

#### Access Control Matrix
| Secret Type | Who Can Access | Rotation Frequency | Backup Location |
|-------------|---------------|-------------------|-----------------|
| **JWT_SERVER_KEY** | DevOps Team Lead | Quarterly | Encrypted vault |
| **CONSUMER_KEY** | Salesforce Admins | Annually | Salesforce backup |
| **DEPLOYMENT_USER** | Release Managers | As needed | User management system |
| **JIRA_API_TOKEN** | Integration Team | Semi-annually | Password manager |

#### Security Monitoring

```bash
# Monitor secret usage in workflow runs
gh run list --workflow=ci-deploy.yml --limit=10 --json status,conclusion,createdAt

# Audit environment access
gh api repos/:owner/:repo/environments/prod/deployment-protection-rules

# Check for exposed secrets in logs (should return empty)
gh run view [run-id] --log | grep -i "private\|secret\|key" || echo "✅ No secrets found in logs"
```

### Compliance & Audit Requirements

#### SOX Compliance Configuration
```yaml
production_environment:
  protection_rules:
    - type: required_reviewers
      reviewers: 2  # Minimum for SOX compliance
      dismiss_stale_reviews: true
    - type: wait_timer
      wait_timer: 10  # 10-minute cooling-off period
    - type: branch_policy
      enforce_admins: true
  
  audit_requirements:
    - deployment_approval_trail: required
    - change_documentation: mandatory
    - rollback_procedures: documented
    - access_logging: comprehensive
```

#### GDPR/Privacy Compliance
```bash
# Ensure no personal data in environment variables
echo "Checking for potential PII in environment variables..."
gh variable list --env prod | grep -iE '(email|phone|address|name)' && \
  echo "⚠️ Potential PII found - please review" || \
  echo "✅ No obvious PII in environment variables"
```

## 🐛 Troubleshooting Common Issues

### Authentication Problems

#### Issue: JWT Authentication Failure
```
Error: INVALID_LOGIN: Invalid username, password, security token; or user locked out
```

**Solution Steps:**
1. **Verify Certificate Upload**:
   ```bash
   # Check certificate format
   openssl x509 -in server.crt -text -noout | head -10
   
   # Verify certificate matches private key
   openssl x509 -noout -modulus -in server.crt | openssl md5
   openssl rsa -noout -modulus -in server.key | openssl md5
   # These should match
   ```

2. **Check Connected App Configuration**:
   - Verify OAuth scopes include "Full access (full)"
   - Ensure "Use digital signatures" is enabled
   - Confirm certificate is uploaded correctly

3. **Validate User Permissions**:
   ```apex
   // Check user has deployment permissions
   SELECT Id, Username, IsActive, Profile.Name 
   FROM User 
   WHERE Username = 'your-deploy-user@company.com.ci'
   ```

#### Issue: Consumer Key Invalid
```
Error: invalid_client_id: client identifier invalid
```

**Solution Steps:**
1. **Verify Consumer Key Format**:
   ```bash
   # Consumer key should be exactly 85 characters and start with "3MVG"
   echo "$CONSUMER_KEY" | wc -c  # Should output 86 (85 + newline)
   echo "$CONSUMER_KEY" | grep "^3MVG" || echo "❌ Invalid format"
   ```

2. **Check Connected App Status**:
   - Navigate to Setup → App Manager → [Your Connected App]
   - Verify status is "Active"
   - Check if policies are correctly configured

### Deployment Issues

#### Issue: Environment Not Found
```
Error: Environment 'ci' not found
```

**Solution:**
```bash
# List all environments
gh api repos/:owner/:repo/environments | jq -r '.[].name'

# Recreate missing environment
gh api repos/:owner/:repo/environments \
  --method POST \
  --field name="ci" \
  --field wait_timer=0
```

#### Issue: Secret Update Failed
```
Error: Resource not accessible by personal access token
```

**Solution:**
```bash
# Check GitHub CLI authentication and permissions
gh auth status
gh auth refresh

# Verify repository permissions
gh api user/repos | jq '.[] | select(.name=="[repo-name]") | .permissions'

# Re-authenticate if necessary
gh auth login --scopes admin:org
```

### Performance Optimization

#### Environment Startup Time
```bash
# Optimize environment variable size
gh variable list --env prod | wc -l  # Should be < 100 variables

# Minimize secret size
for secret in $(gh secret list --env prod | cut -f1); do
  echo "Secret: $secret - Size optimization opportunity"
done
```

#### Connection Pool Optimization
```yaml
# Optimize JWT authentication performance
jwt_config:
  connection_pool_size: 10
  connection_timeout: 30s
  read_timeout: 60s
  max_retries: 3
  backoff_strategy: exponential
```

## 📋 Maintenance & Monitoring

### Regular Maintenance Tasks

#### Weekly Tasks
- [ ] **Monitor Deployment Success Rate**: Should be > 95%
- [ ] **Check Certificate Expiration**: Alert if < 90 days remaining
- [ ] **Review Failed Deployments**: Analyze and address root causes
- [ ] **Validate User Mappings**: Ensure all active developers are mapped

#### Monthly Tasks
- [ ] **Audit Environment Access**: Review who has access to each environment
- [ ] **Update User Mappings**: Add new team members, remove inactive ones
- [ ] **Performance Review**: Analyze deployment times and optimization opportunities
- [ ] **Security Scan**: Check for exposed secrets or vulnerabilities

#### Quarterly Tasks
- [ ] **Certificate Rotation**: Generate new JWT certificates
- [ ] **Connected App Review**: Audit permissions and security policies
- [ ] **Disaster Recovery Test**: Validate backup and recovery procedures
- [ ] **Compliance Audit**: Ensure SOX/GDPR compliance requirements are met

### Monitoring & Alerting

#### Key Metrics to Monitor
```yaml
deployment_metrics:
  success_rate: "> 95%"
  average_duration: "< 10 minutes"
  failure_recovery_time: "< 30 minutes"
  
security_metrics:
  certificate_expiry: "> 90 days"
  failed_auth_attempts: "< 5 per day"
  unauthorized_access: "0 incidents"

integration_metrics:
  case_creation_success: "> 98%"
  jira_sync_success: "> 95%"
  notification_delivery: "> 99%"
```

#### Automated Alerts Configuration
```bash
# Set up GitHub webhook for deployment failures
gh api repos/:owner/:repo/hooks \
  --method POST \
  --field name="web" \
  --field config='{"url":"https://your-monitoring.com/webhook","content_type":"json"}' \
  --field events='["deployment_status"]'
```

---

**Environment Setup Version:** 2.1.0  
**Last Updated:** June 2025  
**Salesforce API Version:** 62.0  
**GitHub Actions Version:** v4+  
**Security Compliance:** SOX, GDPR, HIPAA Ready
  - DEPLOYMENT_USER_MAP: Production user mapping
```

**Triggered by:** Pushes to `main` branch

## 🔑 Connected App Setup

### Creating a Connected App

1. **Navigate to Salesforce Setup**
   - Go to Setup → App Manager
   - Click "New Connected App"

2. **Basic Information**
   ```
   Connected App Name: GitHub CI/CD
   API Name: GitHub_CICD
   Contact Email: your-email@company.com
   ```

3. **API (Enable OAuth Settings)**
   ```
   ✅ Enable OAuth Settings
   Callback URL: http://localhost:1717/OauthRedirect
   Selected OAuth Scopes:
   - Access and manage your data (api)
   - Perform requests on your behalf at any time (refresh_token, offline_access)
   - Access your basic information (id, profile, email, address, phone)
   ```

4. **Digital Certificates**
   ```
   ✅ Use digital signatures
   Upload Certificate: [Upload your certificate.crt file]
   ```

### Generating JWT Key Pair

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Upload server.crt to Connected App
# Use server.key content for JWT_SERVER_KEY secret
```

## 🔒 Security Best Practices

### Secret Management

1. **Rotate secrets regularly** (every 90 days)
2. **Use environment-specific secrets** (never share between environments)
3. **Monitor secret access** in GitHub audit logs
4. **Document secret rotation** in `JWT_LAST_UPDATED_DATE`

### User Permissions

#### CI Environment User
```
Profile: Deployment User (Custom)
Permissions:
- Deploy metadata
- Run Apex tests
- Read all objects
- Modify all data (for test data setup)
```

#### UAT Environment User  
```
Profile: Deployment User (Custom)
Permissions:
- Deploy metadata
- Run Apex tests
- Read all objects
- Limited data modification
```

#### Production User
```
Profile: Deployment User (Custom) 
Permissions:
- Deploy metadata (with restrictions)
- Run Apex tests
- Read access only
- NO data modification permissions
```

## 🔄 Environment Synchronization

### Refreshing Sandbox Environments

```bash
# CI Sandbox (weekly refresh)
sf org create sandbox --definition-file config/ci-sandbox-def.json

# UAT Sandbox (monthly refresh)  
sf org create sandbox --definition-file config/uat-sandbox-def.json
```

### Data Seeding

```bash
# Seed test data in CI
sf apex run --file scripts/apex/data-setup-ci.apex

# Seed UAT test data
sf apex run --file scripts/apex/data-setup-uat.apex
```

## 📊 Monitoring & Validation

### Health Checks

```bash
# Validate environment connectivity
sf org display --target-org ci-org
sf org display --target-org uat-org  
sf org display --target-org prod-org

# Test JWT authentication
sf org login jwt --client-id $CONSUMER_KEY --jwt-key-file server.key --username $DEPLOYMENT_USER
```

### Environment Status Dashboard

Create a simple dashboard to monitor environment health:

```bash
# Check last deployment status
gh api repos/:owner/:repo/deployments

# Check environment secrets
gh api repos/:owner/:repo/environments

# Validate org connectivity  
sf org list --all
```

## 🐛 Troubleshooting

### Common Issues

#### JWT Authentication Failures
```bash
# Check JWT key format
cat server.key | head -1
# Should start with: -----BEGIN PRIVATE KEY-----

# Verify Connected App settings
# - Digital signatures enabled
# - Certificate uploaded correctly
# - OAuth settings configured
```

#### Environment Creation Failures
```bash
# Check GitHub CLI authentication
gh auth status

# Verify repository permissions
gh api user

# Check if environments already exist
gh api repos/:owner/:repo/environments
```

#### Deployment User Issues
```bash
# Verify user exists and is active
sf org display user --target-org <org-alias>

# Check user permissions
sf org assign permset --name Deployment_User --target-org <org-alias>
```

### Debug Commands

```bash
# Test environment setup
./scripts/bash/test-environment-setup.sh

# Check deployment readiness
./scripts/deployment-readiness-check.sh
```

## 📋 Checklist

### Pre-Deployment Checklist

- [ ] All environments created in GitHub
- [ ] Secrets updated with actual values (no "." placeholders)
- [ ] Connected Apps configured in each Salesforce org
- [ ] JWT authentication tested for each environment
- [ ] Deployment users have correct permissions
- [ ] Environment variables are correctly set
- [ ] Protection rules configured for UAT and Production
- [ ] Monitoring and notifications set up

### Post-Setup Validation

- [ ] Run test deployment to CI environment
- [ ] Verify UAT deployment with approval process
- [ ] Test Production deployment (dry-run)
- [ ] Validate rollback procedures
- [ ] Check monitoring dashboards
- [ ] Document any custom configurations

## 📚 Additional Resources

- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
- [Salesforce Connected App Setup](https://help.salesforce.com/articleView?id=connected_app_create.htm)
- [JWT Bearer Token Flow](https://help.salesforce.com/articleView?id=remoteaccess_oauth_jwt_flow.htm)

---

**Last Updated:** June 2025
