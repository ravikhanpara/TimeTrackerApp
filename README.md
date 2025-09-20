# ⏱️ Salesforce Time Tracker App (LWC)

**Time Tracker** is a Lightning Web Component (LWC) app built on Salesforce to help users **track time spent on projects and tasks** in real-time. Ideal for **portfolio demonstrations**, it showcases **Apex, LWC, Lightning DataTable, and SLDS** in a fully interactive application.  

---

## **Features**

- Start/Stop timer with a **live elapsed clock**  
- **Project & Task lookup dropdowns**  
- Only **one timer runs at a time** (prevents duplicates)  
- Automatic **datatable refresh** after every action  
- Formatted **Start/End times** (`DD-MM-YYYY HH:MM`)  
- **Total time tracked** displayed on top-right  
- Clean, responsive **Salesforce Lightning UI**  

---

## **Data Model**

- **Time Entry (Custom Object):** Project, Task, Start/End Time, Is Running, Duration, Notes  
- **Project (Custom Object):** Name, Related Time Entries  

---

## **Usage**

1. Select a Project and Task from the dropdown.  
2. Click **Start** to begin tracking time.  
3. **Elapsed time updates live** while the timer runs.  
4. Click **Stop** to end the timer.  
5. Datatable refreshes automatically, showing Start/End time and Duration.  

---

## **Technology Stack**

- Salesforce Lightning Web Component (LWC)  
- Apex Controllers (`@AuraEnabled`)  
- Lightning DataTable  
- Salesforce Custom Objects & Relationships  
- Salesforce Lightning Design System (SLDS)  

---

## **Why This App?**

- Demonstrates **end-to-end Salesforce development**  
- Showcases **interactive UI & professional design**  
