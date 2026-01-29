public with sharing class MapController {
    
    /**
     * @description Wrapper class for Project data to display on map
     */
    public class ProjectMapWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String name;
        @AuraEnabled public String title;
        @AuraEnabled public String status;
        @AuraEnabled public String region;
        @AuraEnabled public Decimal totalPrice;
        @AuraEnabled public Decimal totalM2;
        @AuraEnabled public Integer totalUnits;
        @AuraEnabled public String street;
        @AuraEnabled public String city;
        @AuraEnabled public String state;
        @AuraEnabled public String postalCode;
        @AuraEnabled public String country;
        @AuraEnabled public Double latitude;
        @AuraEnabled public Double longitude;
        @AuraEnabled public List<UnitWrapper> units;
        
        public ProjectMapWrapper() {
            this.units = new List<UnitWrapper>();
        }
    }
    
    /**
     * @description Wrapper class for Unit data
     */
    public class UnitWrapper {
        @AuraEnabled public String id;
        @AuraEnabled public String code;
        @AuraEnabled public String title;
        @AuraEnabled public String type;
        @AuraEnabled public String status;
        @AuraEnabled public Integer numberOfRooms;
        @AuraEnabled public Integer numberOfBaths;
        @AuraEnabled public Decimal m2;
        @AuraEnabled public Decimal price;
        @AuraEnabled public String description;
        @AuraEnabled public String interiorQuality;
        
        public UnitWrapper() {}
    }
    
    /**
     * @description Retrieves all KS_Project__c records with their related Units
     * @return List of ProjectMapWrapper containing projects and their units
     */
    @AuraEnabled(cacheable=true)
    public static List<ProjectMapWrapper> getProjectsWithUnits() {
        List<ProjectMapWrapper> projects = new List<ProjectMapWrapper>();
        
        // Query all projects with their address information and related units
        List<KS_Project__c> projectRecords = [
            SELECT Id, Name, KS_Title__c, KS_Status__c, KS_Region__c,
                   KS_TotalUnitsPrice__c, KS_TotalM2__c,
                   KS_ProjectAddress__Street__s, KS_ProjectAddress__City__s,
                   KS_ProjectAddress__StateCode__s, KS_ProjectAddress__PostalCode__s,
                   KS_ProjectAddress__CountryCode__s,
                   KS_ProjectAddress__Latitude__s, KS_ProjectAddress__Longitude__s,
                   (SELECT Id, Name, KS_Type__c, KS_Status__c, 
                           KS_NumberOfRooms__c, KS_NumberOfBaths__c,
                           KS_M2__c, KS_Price__c, KS_Description__c,
                           KS_InteriorQuality__c
                    FROM Units__r
                    ORDER BY Name)
            FROM KS_Project__c
            ORDER BY Name
        ];
        
        // Transform to wrapper objects
        for (KS_Project__c proj : projectRecords) {
            ProjectMapWrapper wrapper = new ProjectMapWrapper();
            
            // Project basic info
            wrapper.id = proj.Id;
            wrapper.name = proj.Name;
            wrapper.title = proj.KS_Title__c;
            wrapper.status = proj.KS_Status__c;
            wrapper.region = proj.KS_Region__c;
            wrapper.totalPrice = proj.KS_TotalUnitsPrice__c;
            wrapper.totalM2 = proj.KS_TotalM2__c;
            wrapper.totalUnits = proj.Units__r != null ? proj.Units__r.size() : 0;
            
            // Address components
            wrapper.street = proj.KS_ProjectAddress__Street__s;
            wrapper.city = proj.KS_ProjectAddress__City__s;
            wrapper.state = proj.KS_ProjectAddress__StateCode__s;
            wrapper.postalCode = proj.KS_ProjectAddress__PostalCode__s;
            wrapper.country = proj.KS_ProjectAddress__CountryCode__s;
            wrapper.latitude = proj.KS_ProjectAddress__Latitude__s;
            wrapper.longitude = proj.KS_ProjectAddress__Longitude__s;
            
            // Related units
            if (proj.Units__r != null) {
                for (KS_Unit__c unit : proj.Units__r) {
                    UnitWrapper unitWrapper = new UnitWrapper();
                    unitWrapper.id = unit.Id;
                    unitWrapper.code = unit.Name;
                    unitWrapper.title = unit.Name; // You can add a Title field if needed
                    unitWrapper.type = unit.KS_Type__c;
                    unitWrapper.status = unit.KS_Status__c;
                    unitWrapper.numberOfRooms = (Integer)unit.KS_NumberOfRooms__c;
                    unitWrapper.numberOfBaths = (Integer)unit.KS_NumberOfBaths__c;
                    unitWrapper.m2 = unit.KS_M2__c;
                    unitWrapper.price = unit.KS_Price__c;
                    unitWrapper.description = unit.KS_Description__c;
                    unitWrapper.interiorQuality = unit.KS_InteriorQuality__c;
                    
                    wrapper.units.add(unitWrapper);
                }
            }
            
            projects.add(wrapper);
        }
        
        return projects;
    }
}