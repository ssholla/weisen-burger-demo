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

        ProjectWrapper p1 = new ProjectWrapper();
        p1.id = '1';
        p1.code = 'A3.25';
        p1.title = '2-Room Terrace Apartment with Garden in Winnenden';
        p1.location = 'Winnenden';
        p1.region = 'Greater Stuttgart';
        p1.rooms = 2;
        p1.bathrooms = 1;
        p1.area = 64.7;
        p1.floor = '0 of 3';
        p1.parkingCost = 26500;
        p1.propertyType = 'Apartment';
        p1.price = 342000;
        p1.features = new List<String>{'Terrace', 'Garden', 'Balcony'};
        p1.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg25EG_4a1c71bd-2a4f-4f2a-ad2d-3459c33a3af1.png?v=1765981314&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p1.currentImageIndex = 0;
        projects.add(p1);

        ProjectWrapper p2 = new ProjectWrapper();
        p2.id = '2';
        p2.code = 'A3.27';
        p2.title = '2-Room Terrace Apartment with Garden in Winnenden';
        p2.location = 'Winnenden';
        p2.region = 'Greater Stuttgart';
        p2.rooms = 2;
        p2.bathrooms = 1;
        p2.area = 68;
        p2.floor = '0 of 3';
        p2.parkingCost = 26500;
        p2.propertyType = 'Apartment';
        p2.price = 343000;
        p2.features = new List<String>{'Terrace', 'Garden', 'Elevator'};
        p2.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg27EG.png?v=1765981248&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p2.currentImageIndex = 0;
        projects.add(p2);

        ProjectWrapper p3 = new ProjectWrapper();
        p3.id = '3';
        p3.code = 'A2.15';
        p3.title = '3-Room Ground Floor Apartment in Winnenden with Private Garden';
        p3.location = 'Winnenden';
        p3.region = 'Greater Stuttgart';
        p3.rooms = 3;
        p3.bathrooms = 2;
        p3.area = 85;
        p3.floor = '0 of 3';
        p3.parkingCost = 28000;
        p3.propertyType = 'Apartment';
        p3.price = 451000;
        p3.features = new List<String>{'Garden', 'Ground Floor', 'Terrace'};
        p3.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA2Whg15EG_2ead048c-1ee1-4f58-8550-89bac0d298c3.png?v=1765981365&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p3.currentImageIndex = 0;
        projects.add(p3);

        ProjectWrapper p4 = new ProjectWrapper();
        p4.id = '4';
        p4.code = 'A2.20';
        p4.title = '3-Room Apartment in Winnenden with 90 m² incl. Balcony';
        p4.location = 'Winnenden';
        p4.region = 'Greater Stuttgart';
        p4.rooms = 3;
        p4.bathrooms = 2;
        p4.area = 90;
        p4.floor = '2 of 3';
        p4.parkingCost = 26500;
        p4.propertyType = 'Apartment';
        p4.price = 479000;
        p4.features = new List<String>{'Balcony', 'Elevator', 'Premium Finishes'};
        p4.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA2Whg201.OG.png?v=1765981345&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p4.currentImageIndex = 0;
        projects.add(p4);

        ProjectWrapper p5 = new ProjectWrapper();
        p5.id = '5';
        p5.code = 'A1.12';
        p5.title = '4-Room Apartment in Winnenden with 102 m² incl. Balcony';
        p5.location = 'Winnenden';
        p5.region = 'Greater Stuttgart';
        p5.rooms = 4;
        p5.bathrooms = 2;
        p5.area = 102;
        p5.floor = '1 of 3';
        p5.parkingCost = 28000;
        p5.propertyType = 'Apartment';
        p5.price = 559500;
        p5.features = new List<String>{'Balcony', 'Elevator', 'Parking'};
        p5.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA1Whg12-2.OG_02a13b2a-812e-4ded-826c-90af827cdfdd.png?v=1765981432&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p5.currentImageIndex = 0;
        projects.add(p5);

        ProjectWrapper p6 = new ProjectWrapper();
        p6.id = '6';
        p6.code = 'A5.48';
        p6.title = 'Penthouse with Two Roof Terraces and Breathtaking Views in Winnenden';
        p6.location = 'Winnenden';
        p6.region = 'Greater Stuttgart';
        p6.rooms = 5;
        p6.bathrooms = 3;
        p6.area = 144;
        p6.floor = '3 of 3';
        p6.parkingCost = 30000;
        p6.propertyType = 'Penthouse';
        p6.price = 829000;
        p6.features = new List<String>{'Roof Terrace', 'Panoramic View', 'Premium Finishes', 'Elevator'};
        p6.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA5Whg48Penthouse_5586d2ef-0582-4cf1-a4e9-453d9eef3d40.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/Bild_3.jpg?v=1766072826&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/Bild_1.jpg?v=1766072826&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/Bild_4.jpg?v=1766072826&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/Bild_2.jpg?v=1766072826&width=1200'
        };
        p6.currentImageIndex = 0;
        projects.add(p6);

        ProjectWrapper p7 = new ProjectWrapper();
        p7.id = '7';
        p7.code = 'A3.34';
        p7.title = 'Exclusive Penthouse in Winnenden with 122 m² and Premium Finishes';
        p7.location = 'Winnenden';
        p7.region = 'Greater Stuttgart';
        p7.rooms = 4;
        p7.bathrooms = 2;
        p7.area = 122;
        p7.floor = '3 of 3';
        p7.parkingCost = 28000;
        p7.propertyType = 'Penthouse';
        p7.price = 708000;
        p7.features = new List<String>{'Terrace', 'Premium Finishes', 'Elevator'};
        p7.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg34Penthouse_99d019ad-ddeb-4e4a-8b5a-a613aa05437f.png?v=1766071614&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p7.currentImageIndex = 0;
        projects.add(p7);

        ProjectWrapper p8 = new ProjectWrapper();
        p8.id = '8';
        p8.code = 'A1.08';
        p8.title = 'Spacious 4-Room Apartment with Balcony in Winnenden-Höfen';
        p8.location = 'Winnenden';
        p8.region = 'Greater Stuttgart';
        p8.rooms = 4;
        p8.bathrooms = 2;
        p8.area = 98;
        p8.floor = '0 of 3';
        p8.parkingCost = 26500;
        p8.propertyType = 'Apartment';
        p8.price = 549000;
        p8.features = new List<String>{'Balcony', 'Elevator', 'Storage'};
        p8.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA1Whg8-1.OG.png?v=1765981388&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p8.currentImageIndex = 0;
        projects.add(p8);

        ProjectWrapper p9 = new ProjectWrapper();
        p9.id = '9';
        p9.code = 'A3.26';
        p9.title = 'Bright 1-Room Ground Floor Apartment in Winnenden with Private Garden';
        p9.location = 'Winnenden';
        p9.region = 'Greater Stuttgart';
        p9.rooms = 1;
        p9.bathrooms = 1;
        p9.area = 45;
        p9.floor = '0 of 3';
        p9.parkingCost = 25000;
        p9.propertyType = 'Studio';
        p9.price = 239000;
        p9.features = new List<String>{'Garden', 'Ground Floor'};
        p9.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg26EG_b25cfb25-bbbf-4ca9-b460-462b2f0c7a5d.png?v=1765981270&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p9.currentImageIndex = 0;
        projects.add(p9);

        ProjectWrapper p10 = new ProjectWrapper();
        p10.id = '10';
        p10.code = 'A3.29';
        p10.title = 'Bright 1-Room Apartment in Winnenden with Balcony';
        p10.location = 'Winnenden';
        p10.region = 'Greater Stuttgart';
        p10.rooms = 1;
        p10.bathrooms = 1;
        p10.area = 47;
        p10.floor = '2 of 3';
        p10.parkingCost = 25000;
        p10.propertyType = 'Studio';
        p10.price = 239000;
        p10.features = new List<String>{'Balcony', 'Elevator'};
        p10.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA3Whg291.OG.png?v=1765981217&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p10.currentImageIndex = 0;
        projects.add(p10);

        ProjectWrapper p11 = new ProjectWrapper();
        p11.id = '11';
        p11.code = 'A1.04';
        p11.title = 'Moderne 3-Zimmer-Terrassenwohnung mit 88 m² in Winnenden-Höfen';
        p11.location = 'Winnenden';
        p11.region = 'Greater Stuttgart';
        p11.rooms = 3;
        p11.bathrooms = 2;
        p11.area = 88;
        p11.floor = '0 of 3';
        p11.parkingCost = 26500;
        p11.propertyType = 'Apartment';
        p11.price = 471000;
        p11.features = new List<String>{'Terrace', 'Ground Floor', 'Elevator'};
        p11.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA1Whg4EG_ba840005-e22e-4fd2-bf58-9dbe1d9de368.png?v=1765982405&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17_d022a82a-1033-4916-8a63-90f11aa93ad2.png?v=1766071663&width=1200'
        };
        p11.currentImageIndex = 0;
        projects.add(p11);

        ProjectWrapper p12 = new ProjectWrapper();
        p12.id = '12';
        p12.code = 'A4.39';
        p12.title = 'Moderne 2-Zimmer-Wohnung in Winnenden mit Balkon';
        p12.location = 'Winnenden';
        p12.region = 'Greater Stuttgart';
        p12.rooms = 2;
        p12.bathrooms = 1;
        p12.area = 70;
        p12.floor = '1 of 3';
        p12.parkingCost = 26500;
        p12.propertyType = 'Apartment';
        p12.price = 348000;
        p12.features = new List<String>{'Balcony', 'Elevator'};
        p12.images = new List<String>{
            'https://immobilien.weisenburger.de/cdn/shop/files/HausA4Whg391.OG.png?v=1765981141&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/15.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/18.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/16.png?v=1766071663&width=1200',
            'https://immobilien.weisenburger.de/cdn/shop/files/17.png?v=1765981141&width=1200'
        };
        p12.currentImageIndex = 0;
        projects.add(p12);

        return projects;
    }
}