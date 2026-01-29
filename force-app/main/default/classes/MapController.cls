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
        return getFilteredProjects(null, null, null, null, null, null);
    }
    
    /**
     * @description Retrieves filtered KS_Project__c records with their related Units
     * @param priceRange Price range in format 'min-max'
     * @param rooms Number of rooms filter
     * @param bathrooms Number of bathrooms filter
     * @param location City location filter
     * @param region Region filter
     * @param propertyType Unit type filter
     * @return List of ProjectMapWrapper containing projects and their filtered units
     */
    @AuraEnabled
    public static List<ProjectMapWrapper> getFilteredProjects(
        String priceRange, 
        String rooms, 
        String bathrooms, 
        String location, 
        String region, 
        String propertyType
    ) {
        List<ProjectMapWrapper> projects = new List<ProjectMapWrapper>();
        
        // Build dynamic SOQL for units
        String unitQuery = 'SELECT Id, Name, KS_Type__c, KS_Status__c, ' +
                          'KS_NumberOfRooms__c, KS_NumberOfBaths__c, ' +
                          'KS_M2__c, KS_Price__c, KS_Description__c, ' +
                          'KS_InteriorQuality__c, KS_Project__c ' +
                          'FROM KS_Unit__c WHERE KS_Project__c != null';
        
        List<String> unitConditions = new List<String>();
        
        // Price filter
        if (String.isNotBlank(priceRange)) {
            List<String> priceParts = priceRange.split('-');
            if (priceParts.size() == 2) {
                Decimal minPrice = Decimal.valueOf(priceParts[0]);
                Decimal maxPrice = Decimal.valueOf(priceParts[1]);
                unitConditions.add('KS_Price__c >= ' + minPrice + ' AND KS_Price__c <= ' + maxPrice);
            }
        }
        
        // Rooms filter
        if (String.isNotBlank(rooms)) {
            Integer roomCount = Integer.valueOf(rooms);
            if (roomCount >= 5) {
                unitConditions.add('KS_NumberOfRooms__c >= 5');
            } else {
                unitConditions.add('KS_NumberOfRooms__c = ' + roomCount);
            }
        }
        
        // Bathrooms filter
        if (String.isNotBlank(bathrooms)) {
            Integer bathroomCount = Integer.valueOf(bathrooms);
            if (bathroomCount >= 3) {
                unitConditions.add('KS_NumberOfBaths__c >= 3');
            } else {
                unitConditions.add('KS_NumberOfBaths__c = ' + bathroomCount);
            }
        }
        
        // Property type filter
        if (String.isNotBlank(propertyType)) {
            unitConditions.add('KS_Type__c = \'' + String.escapeSingleQuotes(propertyType) + '\'');
        }
        
        if (!unitConditions.isEmpty()) {
            unitQuery += ' AND ' + String.join(unitConditions, ' AND ');
        }
        
        // Get filtered units
        List<KS_Unit__c> filteredUnits = Database.query(unitQuery);
        
        // Get unique project IDs from filtered units
        Set<Id> projectIds = new Set<Id>();
        for (KS_Unit__c unit : filteredUnits) {
            projectIds.add(unit.KS_Project__c);
        }
        
        // Build project query conditions
        String projectQuery = 'SELECT Id, Name, KS_Title__c, KS_Status__c, KS_Region__c, ' +
                             'KS_TotalUnitsPrice__c, KS_TotalM2__c, ' +
                             'KS_ProjectAddress__Street__s, KS_ProjectAddress__City__s, ' +
                             'KS_ProjectAddress__StateCode__s, KS_ProjectAddress__PostalCode__s, ' +
                             'KS_ProjectAddress__CountryCode__s, ' +
                             'KS_ProjectAddress__Latitude__s, KS_ProjectAddress__Longitude__s ' +
                             'FROM KS_Project__c WHERE Id != null';
        
        List<String> projectConditions = new List<String>();
        
        // Only include projects with matching units if filters are applied
        if (!unitConditions.isEmpty()) {
            if (!projectIds.isEmpty()) {
                projectConditions.add('Id IN :projectIds');
            } else {
                // If unit filters applied but no matching units, return empty list
                return new List<ProjectMapWrapper>();
            }
        }
        
        // Location filter (project name)
        if (String.isNotBlank(location)) {
            projectConditions.add('Name = \'' + String.escapeSingleQuotes(location) + '\'');
        }
        
        // Region filter
        if (String.isNotBlank(region)) {
            projectConditions.add('KS_Region__c = \'' + String.escapeSingleQuotes(region) + '\'');
        }
        
        if (!projectConditions.isEmpty()) {
            projectQuery += ' AND ' + String.join(projectConditions, ' AND ');
        }
        
        projectQuery += ' ORDER BY Name';
        
        // Query projects
        List<KS_Project__c> projectRecords = Database.query(projectQuery);
        
        
        // Create a map of project ID to filtered units
        Map<Id, List<KS_Unit__c>> projectToUnitsMap = new Map<Id, List<KS_Unit__c>>();
        for (KS_Unit__c unit : filteredUnits) {
            if (!projectToUnitsMap.containsKey(unit.KS_Project__c)) {
                projectToUnitsMap.put(unit.KS_Project__c, new List<KS_Unit__c>());
            }
            projectToUnitsMap.get(unit.KS_Project__c).add(unit);
        }
        
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
            
            // Address components
            wrapper.street = proj.KS_ProjectAddress__Street__s;
            wrapper.city = proj.KS_ProjectAddress__City__s;
            wrapper.state = proj.KS_ProjectAddress__StateCode__s;
            wrapper.postalCode = proj.KS_ProjectAddress__PostalCode__s;
            wrapper.country = proj.KS_ProjectAddress__CountryCode__s;
            wrapper.latitude = proj.KS_ProjectAddress__Latitude__s;
            wrapper.longitude = proj.KS_ProjectAddress__Longitude__s;
            
            // Add filtered units for this project
            List<KS_Unit__c> projectUnits = projectToUnitsMap.get(proj.Id);
            if (projectUnits != null) {
                for (KS_Unit__c unit : projectUnits) {
                    UnitWrapper unitWrapper = new UnitWrapper();
                    unitWrapper.id = unit.Id;
                    unitWrapper.code = unit.Name;
                    unitWrapper.title = unit.Name;
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
            
            wrapper.totalUnits = wrapper.units.size();
            projects.add(wrapper);
        }
        
        return projects;
    }
}