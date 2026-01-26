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
            p.code = unit.KS_Code__c;
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
}