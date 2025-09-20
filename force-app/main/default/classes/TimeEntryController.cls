public with sharing class TimeEntryController {

    // Start Timer: create a Time Entry with Start_Time__c = now
    @AuraEnabled
    public static Time_Entry__c startTimer(Id projectId, String task) {
        Time_Entry__c entry = new Time_Entry__c(
            Project__c = projectId,
            Task__c = task,
            Start_Time__c = System.now(),
            Is_Running__c = true
        );
        insert entry;
        return entry;
    }

    // Stop Timer: set End_Time__c = now, Is_Running__c = false
    @AuraEnabled
    public static Time_Entry__c stopTimer(Id entryId) {
        Time_Entry__c entry = [SELECT Id, Start_Time__c, End_Time__c, Is_Running__c 
                               FROM Time_Entry__c WHERE Id = :entryId LIMIT 1];
        entry.End_Time__c = System.now();
        entry.Is_Running__c = false;
        update entry;
        return entry;
    }

    // Get Today’s entries for current user
    @AuraEnabled(cacheable=true)
    public static List<Time_Entry__c> getTodayEntries() {
        Date today = Date.today();
        List<Time_Entry__c> entries = [
            SELECT Id, Project__c, Project__r.Name, Task__c, Start_Time__c, End_Time__c, 
                   Duration_Hours__c, Duration_Display__c, Notes__c, Is_Running__c
            FROM Time_Entry__c
            WHERE OwnerId = :UserInfo.getUserId() 
              AND Start_Time__c = TODAY
            ORDER BY Start_Time__c DESC
        ];
        return entries;
    }

    // Optional: weekly summary for chart
    @AuraEnabled(cacheable=true)
    public static List<AggregateResult> getWeeklySummary() {
        Date startOfWeek = Date.today().toStartOfWeek();

        List<AggregateResult> results = [
            SELECT Start_Date__c, SUM(Duration_Hours__c) totalHours
            FROM Time_Entry__c
            WHERE OwnerId = :UserInfo.getUserId() 
            AND Start_Date__c >= :startOfWeek
            GROUP BY Start_Date__c
            ORDER BY Start_Date__c
        ];

        return results;
    }
}
