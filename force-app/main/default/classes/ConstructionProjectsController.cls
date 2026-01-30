public with sharing class ConstructionProjectsController {
    
    public class ProjectWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String code;
        @AuraEnabled public String title;
        @AuraEnabled public String location;
        @AuraEnabled public String region;
        @AuraEnabled public Integer rooms;
        @AuraEnabled public Integer bathrooms;
        @AuraEnabled public Decimal area;
        @AuraEnabled public String floor;
        @AuraEnabled public Decimal parkingCost;
        @AuraEnabled public String propertyType;
        @AuraEnabled public Decimal price;
        @AuraEnabled public List<String> features;
        @AuraEnabled public List<String> images;
        @AuraEnabled public Integer currentImageIndex;

        public ProjectWrapper() {}
    }

    @AuraEnabled(cacheable=true)
    public static List<ProjectWrapper> getProjects() {
        List<ProjectWrapper> projects = new List<ProjectWrapper>();
        
        for (KS_Unit__c unit : [
            SELECT Id, KS_Code__c, KS_Title__c, KS_Project__r.Name, KS_Project__r.KS_Region__c,
                   KS_NumberOfRooms__c, KS_NumberOfBaths__c, KS_M2__c, KS_Floor__c, 
                   KS_ParkingCost__c, KS_Type__c, KS_Price__c, KS_Features__c, KS_Images__c
            FROM KS_Unit__c
        ]) {
            ProjectWrapper p = new ProjectWrapper();
            p.id = unit.Id;
            p.code = (String.isNotBlank(unit.KS_Code__c) ? unit.KS_Code__c : getLastCharsFromId(unit.Id, 4)).toUpperCase();
            p.title = unit.KS_Title__c;
            p.location = unit.KS_Project__r.Name;
            p.region = unit.KS_Project__r.KS_Region__c;
            p.rooms = (Integer)unit.KS_NumberOfRooms__c;
            p.bathrooms = (Integer)unit.KS_NumberOfBaths__c;
            p.area = unit.KS_M2__c;
            p.floor = unit.KS_Floor__c;
            p.parkingCost = unit.KS_ParkingCost__c;
            p.propertyType = unit.KS_Type__c;
            p.price = unit.KS_Price__c;
            
            if (String.isNotBlank(unit.KS_Features__c)) {
                p.features = unit.KS_Features__c.split(';');
                // Trim whitespace
                for(Integer i=0; i<p.features.size(); i++) {
                    p.features[i] = p.features[i].trim();
                }
            } else {
                p.features = new List<String>();
            }

            if (String.isNotBlank(unit.KS_Images__c)) {
                try {
                    p.images = (List<String>)JSON.deserialize(unit.KS_Images__c, List<String>.class);
                } catch (Exception e) {
                    p.images = new List<String>();
                    System.debug('Error parsing images JSON: ' + e.getMessage());
                }
            } else {
                p.images = new List<String>();
                p.images.add('https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200');
            }
            
            p.currentImageIndex = 0;
            projects.add(p);
        }

        return projects;
    }

    private static String getLastCharsFromId(Id recordId, Integer length) {
        if (recordId == null) return '';
        String s = String.valueOf(recordId);
        if (length == null || length <= 0) length = 4;
        if (s.length() <= length) return s;
        return s.substring(s.length() - length);
    }

    @AuraEnabled
    public static Id createLead(String firstName, String lastName, String email, String phone, String mobile, Id unitId) {
        if (String.isBlank(lastName)) {
            throw new AuraHandledException('Last name is required');
        }

        String company = 'Website Registration';
        if (unitId != null) {
            try {
                KS_Unit__c u = [SELECT Id, KS_Code__c, KS_Project__r.Name FROM KS_Unit__c WHERE Id = :unitId LIMIT 1];
                if (u != null && u.KS_Project__r != null && String.isNotBlank(u.KS_Project__r.Name)) {
                    company = u.KS_Project__r.Name;
                } else if (u != null && String.isNotBlank(u.KS_Code__c)) {
                    company = 'Registration - ' + u.KS_Code__c;
                }
            } catch (Exception e) {
                // fallback to default company
            }
        }

        Lead l = new Lead();
        l.FirstName = firstName;
        l.LastName = lastName;
        l.Email = email;
        l.Phone = phone;
        l.MobilePhone = mobile;
        l.Company = company;
        l.Description = 'Registered via project detail modal' + (unitId != null ? ' (Unit Id: ' + String.valueOf(unitId) + ')' : '');

        Database.DMLOptions dml = new Database.DMLOptions(); 
        dml.DuplicateRuleHeader.allowSave = true;

        

        database.insert(l,dml);

        KS_InterestedParties__c ip = new KS_InterestedParties__c();
        ip.KS_Unit__c = unitId;
        ip.KS_Lead__c = l.Id;
        User u = [SELECT Id,contactId FROM User WHERE Id = :UserInfo.getUserId() LIMIT 1];
        ip.KS_Contact__c = u.ContactId;
        insert ip;

        return l.Id;
    }

    @AuraEnabled(cacheable=true)
    public static Boolean isExperienceCloud() {
        // Site.getSiteId() returns a value only in Experience Cloud
        return System.Site.getSiteId() != null;
    }
}
