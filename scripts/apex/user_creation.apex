String userNamePrefix = '.deployment.bdo.ci';

List<Map<String, String>> userInfoList = new List<Map<String, String>>{
    new Map<String, String>{
        'FirstName' => 'Silvan',
        'LastName'  => 'Sholla',
        'Email'     => 'silvansholla@kerun.one',
        'Alias'     => 'ssholla',
        'GithubUname' => 'ssholla',
        'TimeZone'    => 'Europe/Athens'
    },
    new Map<String, String>{
        'FirstName' => 'Dimitrios',
        'LastName'  => 'Bithyzis',
        'Email'     => 'dimitrios.bithyzis@kerun.one',
        'Alias'     => 'dbkerun',
        'GithubUname' => 'dbkerun',
        'TimeZone'    => 'Europe/Athens'
    },
    new Map<String, String>{
        'FirstName' => 'Thanasis',
        'LastName'  => 'Arvanitidis',
        'Email'     => 'thanasis.arvanitidis@kerun.one',
        'Alias'     => 'kerThanasis',
        'GithubUname' => 'Kerun-Thanasis',
        'TimeZone'    => 'Europe/Athens'
    },
    new Map<String, String>{
        'FirstName' => 'Dimitrios',
        'LastName'  => 'Rakantas',
        'Email'     => 'dimitrios.rakantas@kerun.one',
        'Alias'     => 'kerdimrak',
        'GithubUname' => 'drakantaskerun',
        'TimeZone'    => 'Europe/Athens'
    },
    new Map<String, String>{
        'FirstName' => 'Stefanos',
        'LastName'  => 'Bitzenis',
        'Email'     => 'stefanos.bitzenis@kerun.one',
        'Alias'     => 'kerstef',
        'GithubUname' => 'SBitzenis',
        'TimeZone'    => 'Europe/Berlin'
    }
};

Id profileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator' LIMIT 1].Id;

Map<String, Map<String, String>> emailToUserInfoMap = new Map<String, Map<String, String>>();
Set<String> usernames = new Set<String>();

for (Map<String, String> uInfo : userInfoList) {
    String baseEmail = uInfo.get('Email');
    String generatedUsername = baseEmail + userNamePrefix;

    uInfo.put('Username', generatedUsername);
    usernames.add(generatedUsername);
    emailToUserInfoMap.put(generatedUsername, uInfo);
}

Map<String, User> existingUsersMap = new Map<String, User>();
for (User u : [SELECT Id, Username FROM User WHERE Username IN :usernames]) {
    existingUsersMap.put(u.Username, u);
}

List<User> usersToInsert = new List<User>();
List<User> usersToUpdate = new List<User>();

for (String uname : usernames) {
    Map<String, String> uInfo = emailToUserInfoMap.get(uname);
    User u;

    if (existingUsersMap.containsKey(uname)) {
        u = existingUsersMap.get(uname);
    } else {
        u = new User(Username = uname, ProfileId = profileId);
        usersToInsert.add(u);
    }

    u.FirstName = uInfo.get('FirstName');
    u.LastName  = uInfo.get('LastName');
    u.Email     = uInfo.get('Email');
    u.Alias     = uInfo.get('Alias').length() > 8 ? uInfo.get('Alias').substring(0, 8) : uInfo.get('Alias');
    u.TimeZoneSidKey     = uInfo.get('TimeZone');
    u.LocaleSidKey       = 'en_US';
    u.EmailEncodingKey   = 'UTF-8';
    u.LanguageLocaleKey  = 'en_US';

    if (existingUsersMap.containsKey(uname)) {
        usersToUpdate.add(u);
    }
}

try {
    if (!usersToInsert.isEmpty()) {
        insert usersToInsert;
        System.debug('✅ Inserted users: ' + usersToInsert);
    }
    if (!usersToUpdate.isEmpty()) {
        update usersToUpdate;
        System.debug('🔄 Updated users: ' + usersToUpdate);
    }
} catch (DmlException e) {
    System.debug('❌ Error: ' + e.getMessage());
}

Map<String, String> githubToDeploymentUsernameMap = new Map<String, String>();

for (Map<String, String> uInfo : userInfoList) {
    githubToDeploymentUsernameMap.put(
        uInfo.get('GithubUname'),
        uInfo.get('Username')
    );
}

String outputJson = JSON.serializePretty(githubToDeploymentUsernameMap);
System.debug('🗂️ Github → Deployment Username Mapping:\n' + outputJson);