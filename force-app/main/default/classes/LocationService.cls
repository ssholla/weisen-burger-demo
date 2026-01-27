public with sharing class LocationService {
    @AuraEnabled(cacheable=true)
    public static List<String> getLocations() {
        List<String> locs = new List<String>();
        // Validate CRUD/FLS access before performing SOQL
        if (!Schema.sObjectType.KS_Project__c.isAccessible() ||
            !Schema.sObjectType.KS_Project__c.fields.Name.isAccessible()) {
            return locs;
        }

        // Fallback to simple SOQL and deduplicate in Apex to avoid aggregate quirks
        Set<String> names = new Set<String>();
        for (KS_Project__c p : [SELECT Name FROM KS_Project__c WHERE Name != NULL]) {
            if (p.Name != null) {
                names.add(p.Name);
            }
        }
        List<String> sorted = new List<String>();
        sorted.addAll(names);
        sorted.sort();
        locs.addAll(sorted);
        return locs;
    }
}
