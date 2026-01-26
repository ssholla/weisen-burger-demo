# Comprehensive Testing Strategy & Implementation Guide

This document provides enterprise-level testing strategies, patterns, and best practices for Salesforce development, covering unit testing, integration testing, end-to-end testing, and test automation within the metadata-driven trigger framework architecture.

## 🎯 Testing Philosophy & Strategy

### Multi-Layered Testing Approach

Our testing strategy implements a **comprehensive pyramid structure** ensuring quality at every level:

```
pyramid TB
    subgraph "Testing Pyramid"
        A[End-to-End Tests] --> B[Integration Tests] --> C[Unit Tests]
    end
    
    subgraph "Coverage Goals"
        D["E2E: 70% Critical Paths"] --> E["Integration: 80% Business Flows"] --> F["Unit: 90%+ Code Coverage"]
    end
    
    subgraph "Test Types"
        G[Playwright Browser Tests] --> H[Apex Integration Tests] --> I[Apex Unit Tests]
        J[Lightning Web Component Tests] --> K[Flow Tests] --> L[Metadata Tests]
    end
```

### Testing Standards & Requirements

| Test Type | Coverage Target | Execution Frequency | Performance Target |
|-----------|----------------|--------------------|--------------------|
| **Unit Tests** | 90%+ code coverage | Every commit | < 5 minutes total |
| **Integration Tests** | 80% business flows | Every deployment | < 10 minutes total |
| **End-to-End Tests** | 70% critical paths | Daily/on-demand | < 30 minutes total |
| **Performance Tests** | Key user journeys | Weekly | Response time benchmarks |
| **Security Tests** | All authentication flows | Every release | Zero vulnerabilities |

## 🧪 Unit Testing Framework & Patterns

### Advanced Test Data Factory

The `KS_TestDataFactory` provides sophisticated test data generation with realistic relationships and business rules:

```apex
/**
 * @description Enterprise test data factory for consistent, realistic test data generation
 * @author Your Team
 * @date 2024-12-01
 * @group Test Utilities
 */
@IsTest
public class KS_TestDataFactory {
    
    // Test data configuration constants
    private static final String DEFAULT_ACCOUNT_TYPE = 'Customer - Direct';
    private static final String DEFAULT_INDUSTRY = 'Technology';
    private static final Decimal DEFAULT_ANNUAL_REVENUE = 1000000;
    
    /**
     * @description Creates realistic Account records with all required fields
     * @param count Number of accounts to create
     * @param accountType Type of accounts (Customer - Direct, Prospect, etc.)
     * @return List of configured Account records (not inserted)
     */
    public static List<Account> createAccounts(Integer count, String accountType) {
        List<Account> accounts = new List<Account>();
        
        for (Integer i = 0; i < count; i++) {
            Account acc = new Account(
                Name = 'Test Account ' + i + ' - ' + accountType,
                Type = accountType,
                Industry = getRandomIndustry(),
                Phone = generatePhoneNumber(i),
                Website = 'https://testcompany' + i + '.com',
                AnnualRevenue = DEFAULT_ANNUAL_REVENUE + (i * 100000),
                BillingStreet = '123 Test Street ' + i,
                BillingCity = 'Test City',
                BillingState = 'CA',
                BillingPostalCode = String.valueOf(90000 + i),
                BillingCountry = 'United States',
                Description = 'Test account created for automated testing - ' + DateTime.now()
            );
            
            // Add custom fields based on account type
            if (accountType == 'Customer - Direct') {
                acc.put('Customer_Since__c', Date.today().addYears(-2));
                acc.put('Support_Level__c', 'Premium');
            } else if (accountType == 'Prospect') {
                acc.put('Lead_Source__c', 'Website');
                acc.put('Interest_Level__c', 'High');
            }
            
            accounts.add(acc);
        }
        
        return accounts;
    }
    
    /**
     * @description Creates Contact records with realistic data and account relationships
     * @param accounts List of Account records to associate contacts with
     * @param contactsPerAccount Number of contacts to create per account
     * @return List of configured Contact records (not inserted)
     */
    public static List<Contact> createContacts(List<Account> accounts, Integer contactsPerAccount) {
        List<Contact> contacts = new List<Contact>();
        String[] firstNames = new String[]{'John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa', 'Robert', 'Emily'};
        String[] lastNames = new String[]{'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'};
        String[] titles = new String[]{'CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Operations Manager'};
        
        Integer contactIndex = 0;
        for (Account acc : accounts) {
            for (Integer i = 0; i < contactsPerAccount; i++) {
                String firstName = firstNames[Math.mod(contactIndex, firstNames.size())];
                String lastName = lastNames[Math.mod(contactIndex + i, lastNames.size())];
                
                Contact con = new Contact(
                    FirstName = firstName,
                    LastName = lastName,
                    AccountId = acc.Id,
                    Email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@' + 
                           acc.Name.toLowerCase().replace(' ', '') + '.com',
                    Phone = generatePhoneNumber(contactIndex + i + 1000),
                    MobilePhone = generateMobileNumber(contactIndex + i + 2000),
                    Title = titles[Math.mod(contactIndex + i, titles.size())],
                    Department = getDepartmentByTitle(titles[Math.mod(contactIndex + i, titles.size())]),
                    LeadSource = 'Website',
                    Description = 'Test contact for ' + acc.Name
                );
                
                contacts.add(con);
                contactIndex++;
            }
        }
        
        return contacts;
    }
    
    /**
     * @description Creates Opportunity records with realistic sales pipeline data
     * @param accounts List of Account records to associate opportunities with
     * @param oppsPerAccount Number of opportunities per account
     * @return List of configured Opportunity records (not inserted)
     */
    public static List<Opportunity> createOpportunities(List<Account> accounts, Integer oppsPerAccount) {
        List<Opportunity> opportunities = new List<Opportunity>();
        String[] oppTypes = new String[]{'New Customer', 'Existing Customer - Upgrade', 'Existing Customer - Addon'};
        String[] stages = new String[]{'Prospecting', 'Qualification', 'Proposal/Price Quote', 'Negotiation/Review'};
        
        Integer oppIndex = 0;
        for (Account acc : accounts) {
            for (Integer i = 0; i < oppsPerAccount; i++) {
                Decimal amount = 50000 + (Math.random() * 500000);
                Date closeDate = Date.today().addDays(30 + (Math.random() * 180).intValue());
                
                Opportunity opp = new Opportunity(
                    Name = acc.Name + ' - ' + oppTypes[Math.mod(oppIndex + i, oppTypes.size())],
                    AccountId = acc.Id,
                    StageName = stages[Math.mod(oppIndex + i, stages.size())],
                    CloseDate = closeDate,
                    Amount = amount,
                    Type = oppTypes[Math.mod(oppIndex + i, oppTypes.size())],
                    LeadSource = 'Website',
                    Probability = getProbabilityByStage(stages[Math.mod(oppIndex + i, stages.size())]),
                    Description = 'Test opportunity for automated testing scenarios'
                );
                
                opportunities.add(opp);
            }
            oppIndex++;
        }
        
        return opportunities;
    }
    
    /**
     * @description Creates test data for bulk processing scenarios
     * @param recordCount Number of records to create (supports up to 10,000)
     * @return Map containing all related test data
     */
    public static Map<String, List<SObject>> createBulkTestData(Integer recordCount) {
        Map<String, List<SObject>> testData = new Map<String, List<SObject>>();
        
        // Create accounts in batches
        List<Account> accounts = createAccounts(recordCount, DEFAULT_ACCOUNT_TYPE);
        testData.put('accounts', accounts);
        
        // Insert accounts first to get IDs for relationships
        insert accounts;
        
        // Create related contacts (2 per account)
        List<Contact> contacts = createContacts(accounts, 2);
        testData.put('contacts', contacts);
        
        // Create opportunities (1 per account)
        List<Opportunity> opportunities = createOpportunities(accounts, 1);
        testData.put('opportunities', opportunities);
        
        return testData;
    }
    
    // Helper methods for realistic data generation
    private static String getRandomIndustry() {
        String[] industries = new String[]{'Technology', 'Healthcare', 'Financial Services', 'Manufacturing', 'Retail'};
        return industries[Math.mod((Math.random() * 1000).intValue(), industries.size())];
    }
    
    private static String generatePhoneNumber(Integer seed) {
        Integer areaCode = 555;
        Integer exchange = 100 + Math.mod(seed, 899);
        Integer number = 1000 + Math.mod(seed * 7, 8999);
        return '(' + areaCode + ') ' + exchange + '-' + number;
    }
    
    private static String generateMobileNumber(Integer seed) {
        return generatePhoneNumber(seed + 5000);
    }
    
    private static String getDepartmentByTitle(String title) {
        if (title.contains('CEO') || title.contains('CTO')) return 'Executive';
        if (title.contains('Sales')) return 'Sales';
        if (title.contains('Marketing')) return 'Marketing';
        return 'Operations';
    }
    
    private static Decimal getProbabilityByStage(String stage) {
        if (stage == 'Prospecting') return 10;
        if (stage == 'Qualification') return 25;
        if (stage == 'Proposal/Price Quote') return 50;
        if (stage == 'Negotiation/Review') return 75;
        return 90;
    }
}
```

## Test Data Generation

### Required Fields Strategy

When generating test data, always include required fields to prevent test failures:

1. **Identify Required Fields**: Use the Schema describe methods to identify required fields
2. **Set Default Values**: Provide meaningful default values for required fields
3. **Allow Customization**: Make your utility methods flexible to accept custom values

### Example: Creating SObject with Required Fields

```apex
@IsTest
public class SObjectTestDataFactory {
    
    /**
     * Creates a test record with all required fields populated
     * @param sObjectType The type of SObject to create
     * @param customFields Map of field names to values for customization
     * @return SObject record with required fields populated
     */
    public static SObject createTestRecord(Schema.SObjectType sObjectType, Map<String, Object> customFields) {
        SObject testRecord = sObjectType.newSObject();
        
        // Get required fields
        Map<String, Schema.SObjectField> fieldMap = sObjectType.getDescribe().fields.getMap();
        
        for (String fieldName : fieldMap.keySet()) {
            Schema.DescribeFieldResult fieldDescribe = fieldMap.get(fieldName).getDescribe();
            
            // Skip if field is not createable or is auto-populated
            if (!fieldDescribe.isCreateable() || fieldDescribe.isAutoNumber()) {
                continue;
            }
            
            // Set required fields
            if (!fieldDescribe.isNillable() && fieldDescribe.isCreateable()) {
                Object defaultValue = getDefaultValue(fieldDescribe);
                if (defaultValue != null) {
                    testRecord.put(fieldName, defaultValue);
                }
            }
        }
        
        // Apply custom field values
        if (customFields != null) {
            for (String fieldName : customFields.keySet()) {
                testRecord.put(fieldName, customFields.get(fieldName));
            }
        }
        
        return testRecord;
    }
    
    /**
     * Helper method to generate default values based on field type
     */
    private static Object getDefaultValue(Schema.DescribeFieldResult fieldDescribe) {
        Schema.DisplayType fieldType = fieldDescribe.getType();
        
        switch on fieldType {
            when STRING, TEXTAREA {
                return 'Test ' + fieldDescribe.getName();
            }
            when INTEGER {
                return 1;
            }
            when DOUBLE, CURRENCY, PERCENT {
                return 100.0;
            }
            when BOOLEAN {
                return true;
            }
            when DATE {
                return Date.today();
            }
            when DATETIME {
                return DateTime.now();
            }
            when EMAIL {
                return 'test@example.com';
            }
            when PHONE {
                return '+1234567890';
            }
            when URL {
                return 'https://www.example.com';
            }
            when else {
                return null;
            }
        }
    }
}
```

## Best Practices

### 1. Use Descriptive Test Data

```apex
// Good
Account enterpriseAccount = TestDataFactory.createTestAccount('Enterprise Corp');
Contact primaryContact = TestDataFactory.createTestContact('Johnson', enterpriseAccount.Id);

// Avoid
Account a = new Account(Name = 'Test');
Contact c = new Contact(LastName = 'Test');
```

### 2. Group Related Test Data Creation

```apex
@IsTest
public class OpportunityTestDataFactory {
    
    public class OpportunityTestData {
        public Account account;
        public Contact contact;
        public Opportunity opportunity;
        public List<OpportunityLineItem> lineItems;
    }
    
    public static OpportunityTestData createFullOpportunityScenario() {
        OpportunityTestData testData = new OpportunityTestData();
        
        testData.account = createTestAccount('Test Account');
        insert testData.account;
        
        testData.contact = createTestContact('Test Contact', testData.account.Id);
        insert testData.contact;
        
        testData.opportunity = createTestOpportunity('Test Opportunity', testData.account.Id);
        insert testData.opportunity;
        
        testData.lineItems = createTestOpportunityLineItems(testData.opportunity.Id, 3);
        insert testData.lineItems;
        
        return testData;
    }
}
```

### 3. Use Test Setup Methods

```apex
@IsTest
public class MyBusinessLogicTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test data that will be used across multiple test methods
        List<Account> accounts = TestDataFactory.createTestAccounts(5);
        insert accounts;
        
        List<Contact> contacts = new List<Contact>();
        for (Account acc : accounts) {
            contacts.addAll(TestDataFactory.createTestContacts(2, acc.Id));
        }
        insert contacts;
    }
    
    @IsTest
    private static void testBusinessLogic1() {
        // Test data is automatically available
        List<Account> testAccounts = [SELECT Id, Name FROM Account];
        // Your test logic here
    }
}
```

### 4. Handle DML Operations Properly

```apex
@IsTest
public class DMLTestPattern {
    
    @IsTest
    private static void testSuccessfulInsert() {
        Account testAccount = TestDataFactory.createTestAccount('Success Test');
        
        Test.startTest();
        try {
            insert testAccount;
            // Assert success
            System.assertNotEquals(null, testAccount.Id, 'Account should have been inserted');
        } catch (Exception e) {
            System.assert(false, 'Insert should not have failed: ' + e.getMessage());
        }
        Test.stopTest();
    }
    
    @IsTest
    private static void testFailedInsert() {
        Account testAccount = new Account(); // Missing required Name field
        
        Test.startTest();
        try {
            insert testAccount;
            System.assert(false, 'Insert should have failed due to missing required fields');
        } catch (DmlException e) {
            // Assert expected failure
            System.assert(e.getMessage().contains('REQUIRED_FIELD_MISSING'), 
                         'Should fail due to missing required field');
        }
        Test.stopTest();
    }
}
```

## Examples

### Example 1: Testing Trigger Logic

```apex
@IsTest
public class AccountTriggerTest {
    
    @IsTest
    private static void testAccountCreation() {
        List<Account> testAccounts = TestDataFactory.createTestAccounts(3);
        
        Test.startTest();
        insert testAccounts;
        Test.stopTest();
        
        // Verify trigger logic executed correctly
        List<Account> insertedAccounts = [SELECT Id, Name, CreatedDate FROM Account];
        System.assertEquals(3, insertedAccounts.size(), 'All accounts should be inserted');
    }
    
    @IsTest
    private static void testAccountUpdate() {
        Account testAccount = TestDataFactory.createTestAccount('Original Name');
        insert testAccount;
        
        testAccount.Name = 'Updated Name';
        
        Test.startTest();
        update testAccount;
        Test.stopTest();
        
        Account updatedAccount = [SELECT Id, Name FROM Account WHERE Id = :testAccount.Id];
        System.assertEquals('Updated Name', updatedAccount.Name, 'Account name should be updated');
    }
}
```

### Example 2: Testing with Fake IDs

```apex
@IsTest
public class TriggerLogicTest {
    
    @IsTest
    private static void testTriggerLogicWithFakeIds() {
        // Create test data with fake IDs for unit testing
        List<Account> testAccounts = new List<Account>();
        for (Integer i = 0; i < 3; i++) {
            testAccounts.add(new Account(
                Id = TriggerTestUtility.getFakeId(Schema.Account.SObjectType),
                Name = 'Test Account ' + i,
                Type = 'Customer'
            ));
        }
        
        // Test your trigger logic without database operations
        MyTriggerHandler handler = new MyTriggerHandler();
        handler.processAccounts(testAccounts);
        
        // Assert your logic worked correctly
        // (specific assertions depend on your trigger logic)
    }
}
```

## ⚡ Trigger Framework Testing Utilities

### KS_TriggerTestUtility

Advanced testing utilities specifically designed for the metadata-driven trigger framework:

```apex
/**
 * @description Advanced testing utilities for trigger framework validation and testing
 * @author Your Team
 * @date 2024-12-01
 * @group Test Utilities
 */
@IsTest
public class KS_TriggerTestUtility {
    
    /**
     * @description Generates fake Salesforce IDs for testing without DML operations
     * @param sObjectType The SObject type to generate ID for
     * @return Fake ID that follows Salesforce ID format
     */
    public static Id getFakeId(Schema.SObjectType sObjectType) {
        String keyPrefix = sObjectType.getDescribe().getKeyPrefix();
        String fakeIdString = keyPrefix + '0'.repeat(15 - keyPrefix.length());
        return (Id) fakeIdString;
    }
    
    /**
     * @description Creates multiple fake IDs for bulk testing scenarios
     * @param sObjectType The SObject type to generate IDs for
     * @param count Number of fake IDs to generate
     * @return List of unique fake IDs
     */
    public static List<Id> getFakeIds(Schema.SObjectType sObjectType, Integer count) {
        List<Id> fakeIds = new List<Id>();
        String keyPrefix = sObjectType.getDescribe().getKeyPrefix();
        
        for (Integer i = 0; i < count; i++) {
            String fakeIdString = keyPrefix + String.valueOf(i).leftPad(15 - keyPrefix.length(), '0');
            fakeIds.add((Id) fakeIdString);
        }
        
        return fakeIds;
    }
    
    /**
     * @description Simulates trigger context for testing trigger actions
     * @param triggerOperation The trigger operation to simulate
     * @param newRecords Records for trigger.new
     * @param oldRecords Records for trigger.old (optional)
     */
    public static void simulateTriggerContext(TriggerOperation triggerOperation, 
                                            List<SObject> newRecords, 
                                            List<SObject> oldRecords) {
        
        // Set up trigger context variables
        Test.setReadOnlyApplicationMode(false);
        
        switch on triggerOperation {
            when BEFORE_INSERT {
                for (SObject record : newRecords) {
                    // Simulate before insert context
                    record.Id = null;
                }
            }
            when AFTER_INSERT {
                Integer index = 0;
                for (SObject record : newRecords) {
                    // Assign fake IDs to simulate after insert
                    record.Id = getFakeIds(record.getSObjectType(), newRecords.size())[index++];
                }
            }
            when BEFORE_UPDATE, AFTER_UPDATE {
                if (oldRecords == null || newRecords.size() != oldRecords.size()) {
                    throw new TestException('Old records must be provided for update operations');
                }
                
                // Ensure both lists have matching IDs
                for (Integer i = 0; i < newRecords.size(); i++) {
                    Id recordId = oldRecords[i].Id != null ? 
                        oldRecords[i].Id : 
                        getFakeIds(newRecords[i].getSObjectType(), 1)[0];
                    newRecords[i].Id = recordId;
                    oldRecords[i].Id = recordId;
                }
            }
        }
    }
    
    /**
     * @description Validates that trigger actions are properly configured in metadata
     * @param objectApiName The object to validate trigger actions for
     * @param expectedActions List of expected trigger action class names
     * @return Boolean indicating if all expected actions are configured
     */
    public static Boolean validateTriggerActionConfiguration(String objectApiName, 
                                                           List<String> expectedActions) {
        List<TriggerAction__mdt> configuredActions = [
            SELECT Apex_Class_Name__c, Active__c, Order__c, Trigger_Context__c
            FROM TriggerAction__mdt
            WHERE Object_API_Name__c = :objectApiName
            AND Active__c = true
        ];
        
        Set<String> configuredClassNames = new Set<String>();
        for (TriggerAction__mdt action : configuredActions) {
            configuredClassNames.add(action.Apex_Class_Name__c);
        }
        
        for (String expectedAction : expectedActions) {
            if (!configuredClassNames.contains(expectedAction)) {
                System.debug('Missing trigger action configuration: ' + expectedAction);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * @description Creates test trigger action metadata records for testing
     * @param objectApiName The object API name
     * @param apexClassName The trigger action class name
     * @param triggerContext The trigger context (e.g., 'before insert')
     * @param orderNumber The execution order
     */
    public static void createTestTriggerAction(String objectApiName, 
                                             String apexClassName, 
                                             String triggerContext, 
                                             Integer orderNumber) {
        // Note: This would be used in test setup where metadata records can be created
        // Implementation would depend on specific test requirements
    }
    
    /**
     * @description Bypasses trigger actions for testing scenarios
     * @param actionNames List of trigger action class names to bypass
     */
    public static void bypassTriggerActions(List<String> actionNames) {
        for (String actionName : actionNames) {
            TriggerActionFlowBypass.bypass(actionName);
        }
    }
    
    /**
     * @description Clears all trigger action bypasses
     */
    public static void clearAllTriggerBypasses() {
        TriggerActionFlowBypass.clearAllBypasses();
    }
    
    /**
     * @description Validates trigger action execution order
     * @param objectApiName The object to validate
     * @param triggerContext The trigger context to check
     * @return List of trigger actions in execution order
     */
    public static List<TriggerAction__mdt> validateTriggerExecutionOrder(String objectApiName, 
                                                                        String triggerContext) {
        return [
            SELECT Apex_Class_Name__c, Order__c, Trigger_Context__c
            FROM TriggerAction__mdt
            WHERE Object_API_Name__c = :objectApiName
            AND Active__c = true
            AND Trigger_Context__c INCLUDES (:triggerContext)
            ORDER BY Order__c ASC
        ];
    }
    
    // Custom exception for test utilities
    public class TestException extends Exception {}
}
```

### Performance Testing Utilities

```apex
/**
 * @description Performance testing utilities for monitoring trigger execution times
 * @author Your Team
 * @date 2024-12-01
 * @group Test Utilities
 */
@IsTest
public class KS_PerformanceTestUtility {
    
    private static Map<String, Long> executionTimes = new Map<String, Long>();
    private static Map<String, Integer> cpuTimeUsage = new Map<String, Integer>();
    
    /**
     * @description Starts performance monitoring for a test scenario
     * @param testName Name of the test scenario
     */
    public static void startPerformanceMonitoring(String testName) {
        executionTimes.put(testName + '_start', System.currentTimeMillis());
        cpuTimeUsage.put(testName + '_cpu_start', Limits.getCpuTime());
    }
    
    /**
     * @description Ends performance monitoring and logs results
     * @param testName Name of the test scenario
     * @return Map containing performance metrics
     */
    public static Map<String, Object> endPerformanceMonitoring(String testName) {
        Long endTime = System.currentTimeMillis();
        Integer endCpuTime = Limits.getCpuTime();
        
        Long startTime = executionTimes.get(testName + '_start');
        Integer startCpuTime = cpuTimeUsage.get(testName + '_cpu_start');
        
        Long executionTime = endTime - startTime;
        Integer cpuTimeUsed = endCpuTime - startCpuTime;
        
        Map<String, Object> metrics = new Map<String, Object>{
            'executionTimeMs' => executionTime,
            'cpuTimeMs' => cpuTimeUsed,
            'heapSizeUsed' => Limits.getHeapSize(),
            'soqlQueries' => Limits.getQueries(),
            'dmlStatements' => Limits.getDMLStatements()
        };
        
        System.debug('Performance Metrics for ' + testName + ': ' + metrics);
        
        // Assert performance thresholds
        System.assert(executionTime < 10000, 'Execution time exceeded 10 seconds: ' + executionTime + 'ms');
        System.assert(cpuTimeUsed < 10000, 'CPU time exceeded 10 seconds: ' + cpuTimeUsed + 'ms');
        
        return metrics;
    }
    
    /**
     * @description Tests bulk processing performance with specified record count
     * @param sObjectType Type of records to test
     * @param recordCount Number of records to process
     * @param testOperation The operation to perform (insert, update, delete)
     * @return Performance metrics for the bulk operation
     */
    public static Map<String, Object> testBulkPerformance(Schema.SObjectType sObjectType, 
                                                         Integer recordCount, 
                                                         String testOperation) {
        startPerformanceMonitoring('bulk_' + testOperation + '_' + recordCount);
        
        // Create test data based on sObject type
        List<SObject> testRecords = createBulkTestRecords(sObjectType, recordCount);
        
        Test.startTest();
        
        try {
            if (testOperation == 'insert') {
                insert testRecords;
            } else if (testOperation == 'update') {
                insert testRecords; // Insert first
                update testRecords; // Then update
            } else if (testOperation == 'delete') {
                insert testRecords; // Insert first
                delete testRecords; // Then delete
            }
        } catch (Exception e) {
            System.debug('Bulk operation failed: ' + e.getMessage());
        }
        
        Test.stopTest();
        
        return endPerformanceMonitoring('bulk_' + testOperation + '_' + recordCount);
    }
    
    private static List<SObject> createBulkTestRecords(Schema.SObjectType sObjectType, Integer count) {
        if (sObjectType == Account.SObjectType) {
            return KS_TestDataFactory.createAccounts(count, 'Customer - Direct');
        } else if (sObjectType == Contact.SObjectType) {
            // For contacts, we need accounts first
            List<Account> accounts = KS_TestDataFactory.createAccounts(1, 'Customer - Direct');
            insert accounts;
            return KS_TestDataFactory.createContacts(accounts, count);
        }
        // Add more object types as needed
        return new List<SObject>();
    }
}
```

## 🧩 Comprehensive Test Patterns

### Test Pattern 1: Trigger Action Unit Testing

```apex
/**
 * @description Comprehensive test class for Account validation trigger action
 * @author Your Team
 * @date 2024-12-01
 * @group Test Classes
 */
@IsTest
private class KS_AccountValidationActionTest {
    
    @TestSetup
    static void setupTestData() {
        // Create test accounts that will be used across multiple test methods
        List<Account> testAccounts = KS_TestDataFactory.createAccounts(5, 'Customer - Direct');
        insert testAccounts;
    }
    
    /**
     * @description Test positive validation scenarios
     */
    @IsTest
    static void testPositiveValidation() {
        KS_PerformanceTestUtility.startPerformanceMonitoring('positive_validation');
        
        // Arrange
        List<Account> validAccounts = KS_TestDataFactory.createAccounts(10, 'Customer - Direct');
        
        // Act
        Test.startTest();
        List<Database.SaveResult> results = Database.insert(validAccounts, false);
        Test.stopTest();
        
        // Assert
        for (Database.SaveResult result : results) {
            System.assert(result.isSuccess(), 'Valid account should be inserted successfully: ' + result.getErrors());
        }
        
        // Verify data integrity
        List<Account> insertedAccounts = [SELECT Id, Name, Type, Industry FROM Account WHERE Id IN :validAccounts];
        System.assertEquals(10, insertedAccounts.size(), 'All valid accounts should be inserted');
        
        KS_PerformanceTestUtility.endPerformanceMonitoring('positive_validation');
    }
    
    /**
     * @description Test comprehensive validation failure scenarios
     */
    @IsTest
    static void testValidationFailures() {
        // Test multiple validation scenarios
        Map<String, Account> testScenarios = new Map<String, Account>{
            'missing_name' => new Account(Type = 'Customer - Direct', Phone = '(555) 123-4567'),
            'missing_phone_for_direct_customer' => new Account(
                Name = 'Direct Customer Without Phone', 
                Type = 'Customer - Direct',
                AnnualRevenue = 100000
            ),
            'missing_industry_for_prospect' => new Account(
                Name = 'Prospect Without Industry',
                Type = 'Prospect'
            ),
            'negative_revenue' => new Account(
                Name = 'Account With Negative Revenue',
                Type = 'Customer - Direct',
                Phone = '(555) 987-6543',
                AnnualRevenue = -50000
            ),
            'invalid_email' => new Account(
                Name = 'Account With Invalid Email',
                Type = 'Prospect',
                Industry = 'Technology',
                Email__c = 'invalid-email-format'
            )
        };
        
        Test.startTest();
        
        for (String scenario : testScenarios.keySet()) {
            Account testAccount = testScenarios.get(scenario);
            
            try {
                insert testAccount;
                System.assert(false, 'Expected validation error for scenario: ' + scenario);
            } catch (DmlException e) {
                System.assert(e.getMessage().toLowerCase().contains('required') || 
                             e.getMessage().toLowerCase().contains('invalid') ||
                             e.getMessage().toLowerCase().contains('negative'),
                             'Validation error should be meaningful for scenario: ' + scenario + 
                             '. Error: ' + e.getMessage());
            }
        }
        
        Test.stopTest();
    }
    
    /**
     * @description Test bulk processing scenarios with mixed valid/invalid data
     */
    @IsTest
    static void testBulkProcessingWithMixedData() {
        KS_PerformanceTestUtility.startPerformanceMonitoring('bulk_mixed_validation');
        
        // Create a mix of valid and invalid accounts
        List<Account> mixedAccounts = new List<Account>();
        
        // Add valid accounts
        mixedAccounts.addAll(KS_TestDataFactory.createAccounts(100, 'Customer - Direct'));
        
        // Add some invalid accounts
        mixedAccounts.add(new Account(Type = 'Customer - Direct')); // Missing name
        mixedAccounts.add(new Account(Name = 'Invalid Direct Customer', Type = 'Customer - Direct')); // Missing phone
        mixedAccounts.add(new Account(Name = 'Invalid Prospect', Type = 'Prospect')); // Missing industry
        
        Test.startTest();
        List<Database.SaveResult> results = Database.insert(mixedAccounts, false);
        Test.stopTest();
        
        // Analyze results
        Integer successCount = 0;
        Integer errorCount = 0;
        
        for (Database.SaveResult result : results) {
            if (result.isSuccess()) {
                successCount++;
            } else {
                errorCount++;
                // Validate error messages are present
                System.assert(!result.getErrors().isEmpty(), 'Failed record should have error messages');
            }
        }
        
        System.assertEquals(100, successCount, 'Should have 100 successful insertions');
        System.assertEquals(3, errorCount, 'Should have 3 validation errors');
        
        KS_PerformanceTestUtility.endPerformanceMonitoring('bulk_mixed_validation');
    }
    
    /**
     * @description Test trigger bypass functionality
     */
    @IsTest
    static void testTriggerBypass() {
        // Create an account that would normally fail validation
        Account invalidAccount = new Account(
            Name = 'Invalid Account for Bypass Test',
            Type = 'Customer - Direct'
            // Missing required phone - should fail without bypass
        );
        
        Test.startTest();
        
        // First, verify it fails without bypass
        try {
            insert invalidAccount;
            System.assert(false, 'Account should fail validation without bypass');
        } catch (DmlException e) {
            System.assert(e.getMessage().contains('required'), 'Should get validation error');
        }
        
        // Now test with bypass (this would require bypass permission setup)
        KS_TriggerTestUtility.bypassTriggerActions(new List<String>{'KS_AccountValidationAction'});
        
        try {
            Account bypassAccount = new Account(
                Name = 'Bypass Test Account',
                Type = 'Customer - Direct'
                // Missing phone but should succeed with bypass
            );
            insert bypassAccount;
            
            // If we get here, bypass worked
            System.assert(bypassAccount.Id != null, 'Account should be inserted with bypass');
            
        } finally {
            KS_TriggerTestUtility.clearAllTriggerBypasses();
        }
        
        Test.stopTest();
    }
    
    /**
     * @description Test performance with large data volumes
     */
    @IsTest
    static void testLargeVolumePerformance() {
        // Test with maximum test data limit
        Map<String, Object> metrics = KS_PerformanceTestUtility.testBulkPerformance(
            Account.SObjectType, 
            200, 
            'insert'
        );
        
        // Validate performance metrics
        Long executionTime = (Long) metrics.get('executionTimeMs');
        Integer cpuTime = (Integer) metrics.get('cpuTimeMs');
        
        System.assert(executionTime < 5000, 'Bulk insert should complete in under 5 seconds');
        System.assert(cpuTime < 5000, 'CPU time should be under 5 seconds');
        
        // Validate that all records were processed
        Integer accountCount = [SELECT COUNT() FROM Account WHERE Name LIKE 'Test Account%'];
        System.assertEquals(200, accountCount, 'All test accounts should be inserted');
    }
}
```
