# Karachi Oil Trading — Fleet Management MVP Build Specification

## 1. Project Goal

Build a clean, modern **Fleet Management MVP** for **Karachi Oil Trading** using **Next.js**.

The MVP is intentionally limited to the first operational features needed for demonstration to a fleet operator:

1. Vehicle registration
2. Driver registration
3. Driver-to-vehicle assignment
4. Vehicle driver history
5. Driver vehicle history
6. Driver status management
   - Active
   - On Leave
   - Suspended
   - Resigned
   - Terminated
   - Inactive
7. Vehicle profile
8. Driver profile
9. Basic document/compliance information

For now:

- Use **seed/mock data only**
- Do **not** connect Supabase yet
- Structure the code so Supabase can be added later without redesigning the application
- Use a proper repository/service/data-access abstraction instead of hardcoding data directly in pages
- Focus on a polished demo-ready UI and realistic fleet-management workflows

---

# 2. Company

**Company Name:** Karachi Oil Trading

Display the company name in:

- Main sidebar/header
- Login/demo header if present
- Dashboard
- Vehicle pages
- Driver pages

Use a professional fleet/logistics visual style.

Suggested UI style:

- Clean white/light gray background
- Dark navy/charcoal sidebar
- Blue primary action color
- Green for active
- Amber for on leave / expiry warning
- Red for suspended / expired / critical
- Neutral gray for inactive/resigned
- Responsive desktop-first design

---

# 3. Technology Stack

Build with:

- **Next.js**
- **TypeScript**
- **App Router**
- **Tailwind CSS**
- Reusable React components
- Local mock repository / seed data
- Prefer simple lightweight libraries only when useful

Recommended optional libraries:

- `lucide-react` for icons
- `date-fns` for date formatting
- `zod` for validation
- `react-hook-form` for forms

Do not add unnecessary backend complexity.

---

# 4. Architecture Requirement

The frontend must not depend directly on seed arrays.

Use a structure similar to:

```text
src/
├── app/
├── components/
├── features/
│   ├── drivers/
│   ├── vehicles/
│   └── assignments/
├── lib/
│   ├── repositories/
│   ├── services/
│   ├── seed/
│   ├── types/
│   └── utils/
```

Example:

```text
DriverPage
   ↓
driverService
   ↓
driverRepository
   ↓
seedDataRepository
```

Later the repository can be replaced with:

```text
supabaseDriverRepository
```

without redesigning the UI.

---

# 5. Main Navigation

Create a left sidebar with:

```text
Dashboard
Vehicles
Drivers
Assignments
```

For MVP, these are enough.

Optional secondary navigation:

```text
Compliance
Settings
```

but they are not required to be functional yet.

---

# 6. Dashboard

Create a useful demo dashboard.

## Summary Cards

Show:

- Total Vehicles
- Active Vehicles
- Total Drivers
- Active Drivers
- Drivers On Leave
- Suspended Drivers
- Unassigned Vehicles
- Unassigned Drivers

## Additional Dashboard Sections

### Current Assignments

Table:

| Vehicle | Driver | Assigned Since | Status |
|---|---|---|---|

### Driver Status Overview

Show simple counts by:

- Active
- On Leave
- Suspended
- Resigned

### Expiring Documents

Use seed data to show example expiry warnings.

Table:

| Entity | Document | Expiry Date | Days Remaining | Status |
|---|---|---|---|---|

This should demonstrate future compliance functionality.

---

# 7. VEHICLE MODULE

## 7.1 Vehicle List Page

Route:

```text
/vehicles
```

Display a searchable/filterable table.

Columns:

- Vehicle Number
- Make
- Model
- Vehicle Type
- Status
- Current Driver
- Capacity
- Documents Status
- Actions

Filters:

- Vehicle Status
- Vehicle Type
- Assigned / Unassigned

Actions:

- View
- Edit
- Assign Driver

Primary button:

```text
+ Register Vehicle
```

---

# 8. Vehicle Registration

Route:

```text
/vehicles/new
```

Do not reproduce the old software as one huge form.

Use tabs or step sections.

Recommended sections:

```text
1. Basic Information
2. Technical Information
3. Tank / Compartments
4. Documents
5. Review
```

---

# 9. Vehicle Basic Information

Fields:

```ts
vehicleNumber
status
chassisNumber
engineNumber
make
model
vehicleType
manufacturingYear
inductionYear
colorBranding
oem
primeMoverType
notes
```

Suggested values:

## Vehicle Status

```text
Active
Inactive
Under Maintenance
Retired
```

## Vehicle Type

Seed with examples:

```text
Oil Tanker
Prime Mover
Rigid Tanker
Trailer
Bowser
```

---

# 10. Vehicle Technical Information

Fields inspired by the existing software:

```ts
bowserQuantity
bowserNumber
bowserInductionYear
hosePower
chamberDetail
driveAxle
suspensionType
brakeType
bottomLoading
trailerWheel
spareTyreIncluded
materialTrailer
obcTracker
mdvr
primeMoverWeight
bowserWeight
oilSum
```

These fields may be optional.

Do not force users to fill every technical field during initial registration.

---

# 11. Vehicle Capacity / Weight

Fields:

```ts
capacityKL
grossVehicleWeight
productWeight
grossCargoWeight
```

Support optional PMG/HSD specific values if needed.

---

# 12. Vehicle Tank Compartments

Do not create fixed database fields such as:

```text
compartment1
compartment2
compartment3
compartment4
```

Use a dynamic array.

Model:

```ts
type TankCompartment = {
  id: string
  compartmentNumber: number
  productType: "PMG" | "HSD" | "Other"
  capacityLiters: number
  dip?: string
  referenceDip?: string
}
```

UI:

```text
Tank Compartments

Compartment 1
Product: PMG
Capacity: 6000 L
Dip: ...
Reference Dip: ...

[+ Add Compartment]
```

Allow:

- Add compartment
- Remove compartment
- Edit compartment
- Reorder only if easy

---

# 13. Vehicle Documents

Use a generic document structure rather than separate hardcoded tables for every document type.

Vehicle document types seeded from the old system:

```text
Excise Taxation
Fitness Certificate
Vehicle Insurance
Calibration Chart PMG
Calibration Chart HSD
Sindh Route Permit
Punjab Route Permit
KPK Route Permit
Balochistan Route Permit
Explosive License
Public Liability Insurance
Workman Compensation
Tracker Certificate
MDVR Certificate
Brake Test
Inspection
Hydro Test
Hose Pipe Test
```

Model:

```ts
type VehicleDocument = {
  id: string
  vehicleId: string
  documentType: string
  documentNumber?: string
  issueDate?: string
  expiryDate?: string
  issuingAuthority?: string
  fileName?: string
  status: "Valid" | "Expiring Soon" | "Expired" | "Not Available"
  remarks?: string
}
```

For seed data:

- Add realistic issue/expiry dates
- Include a few expired examples
- Include a few expiring-soon examples

Document file upload can be UI-only for now.

---

# 14. Vehicle Profile Page

Route:

```text
/vehicles/[id]
```

Header example:

```text
KOT-786

Active
Oil Tanker

Current Driver:
Ahmed Khan

[Assign Driver] [Edit Vehicle]
```

Tabs:

```text
Overview
Technical
Compartments
Documents
Driver History
Activity
```

---

# 15. Vehicle Driver History

Important.

Show every historical driver assignment for the vehicle.

Table:

| Driver | Assignment Type | From | To | Duration | End Reason | Status |
|---|---|---|---|---|---|---|

Example:

```text
Ahmed Khan
Primary Driver
01 Jan 2026
Current
Current
-
Active
```

Previous example:

```text
Muhammad Irfan
Primary Driver
12 Jun 2025
31 Dec 2025
203 days
Transferred
Completed
```

---

# 16. DRIVER MODULE

## Driver List

Route:

```text
/drivers
```

Table columns:

- Driver ID
- Driver Name
- CNIC
- Mobile
- License Number
- License Expiry
- Driver Status
- Current Vehicle
- Actions

Filters:

- Active
- On Leave
- Suspended
- Resigned
- Assigned
- Unassigned

Primary button:

```text
+ Register Driver
```

---

# 17. Driver Registration

Route:

```text
/drivers/new
```

Do not create one very long form.

Use tabs or steps:

```text
1. Personal Information
2. CNIC & License
3. Compliance
4. Experience
5. References
6. Review
```

---

# 18. Driver Personal Information

Fields:

```ts
driverCode
pkCode
inductionDate
name
fatherName
dateOfBirth
placeOfBirth
address
maritalStatus
bloodGroup
mobileNumber
photo
education
```

Important:

Do not manually store `age`.

Derive it from:

```text
dateOfBirth
```

---

# 19. Driver CNIC Information

Fields:

```ts
cnicNumber
cnicIssueDate
cnicExpiryDate
cnicVerified
cnicFrontImage
cnicBackImage
```

Validation:

- CNIC should be unique
- Display formatted CNIC
- For MVP use seed validation only

---

# 20. Driving License

Fields:

```ts
licenseNumber
licenseType
licenseIssueDate
licenseExpiryDate
licenseStatus
licenseOnlineVerified
drivingSince
licenseFrontImage
licenseBackImage
licenseVerificationImage
```

License status should preferably be derived when possible:

```text
Valid
Expiring Soon
Expired
Not Verified
```

---

# 21. Driver Compliance

Create driver document/compliance objects instead of bloating the driver master record.

Seed document types:

```text
DDC (NH&MP)
Medical
Random Medical
Drug & Alcohol Test
Police Verification
TPPL Policy
```

Example DDC fields:

```ts
issueDate
expiryDate
status
result
frontImage
backImage
```

Medical:

```ts
issueDate
expiryDate
status
```

Drug & Alcohol:

```ts
testDate
result
status
```

Police:

```ts
verificationStatus
verificationDate
image
```

---

# 22. Driver Languages

Use a dynamic simple structure.

Seed languages:

```text
English
Urdu
Sindhi
Punjabi
Pashto
Balochi
Other
```

Use proficiency values:

```text
None
Basic
Good
Fluent
```

Do not use large free-text boxes for each language.

---

# 23. Driver Previous Work Experience

Use a repeatable array.

Model:

```ts
type DriverExperience = {
  id: string
  companyName: string
  dateFrom?: string
  dateTo?: string
  jobTitle?: string
  vehicleType?: string
  yearsExperience?: number
  remarks?: string
}
```

UI button:

```text
+ Add Previous Experience
```

---

# 24. Driver References

Model:

```ts
type DriverReference = {
  id: string
  driverId: string
  name: string
  address?: string
  phone?: string
  relation?: string
}
```

Allow multiple references.

---

# 25. Driver Status Model

This is a critical requirement.

Do not treat driver status as a simple value that gets overwritten without history.

Current status may be stored on the driver for convenience, but every change must create a status-history event.

Statuses:

```text
Active
On Leave
Suspended
Resigned
Terminated
Inactive
```

Model:

```ts
type DriverStatusHistory = {
  id: string
  driverId: string
  status:
    | "Active"
    | "On Leave"
    | "Suspended"
    | "Resigned"
    | "Terminated"
    | "Inactive"
  effectiveFrom: string
  effectiveTo?: string
  reason?: string
  remarks?: string
  createdAt: string
  createdBy: string
}
```

---

# 26. Driver Status Rules

## Active

Driver is eligible for vehicle assignment.

## On Leave

Require:

```text
Leave Start Date
Expected Return Date
Reason
Remarks
```

Driver should not normally remain actively assigned during extended leave.

For MVP:

- show warning if currently assigned
- provide option to end current assignment

## Suspended

Require:

```text
Suspension Date
Reason
Remarks
```

If driver has an active vehicle assignment:

- warn user
- provide option to end assignment immediately

## Resigned

Require:

```text
Resignation Date
Last Working Date
Reason
Remarks
```

Driver cannot receive a new assignment after resignation.

End any active assignment.

## Terminated

Same concept as resignation but record termination separately.

---

# 27. Driver Profile Page

Route:

```text
/drivers/[id]
```

Header example:

```text
Ahmed Khan
DR-0017

ACTIVE

Current Vehicle:
KOT-786

[Change Status] [Assign Vehicle] [Edit]
```

Tabs:

```text
Overview
Documents
Vehicle History
Status History
Experience
References
Activity
```

---

# 28. Driver Vehicle History

Show every vehicle assigned to the driver.

Table:

| Vehicle | Type | Assignment Type | From | To | End Reason | Status |
|---|---|---|---|---|---|---|

---

# 29. VEHICLE ASSIGNMENT MODULE

Route:

```text
/assignments
```

Show:

## Active Assignments

| Vehicle | Driver | Assignment Type | Assigned Since | Actions |
|---|---|---|---|---|

Actions:

```text
View
Change Driver
End Assignment
```

Primary action:

```text
+ Assign Driver
```

---

# 30. Assignment Model

Use a separate history table/object.

```ts
type VehicleDriverAssignment = {
  id: string
  vehicleId: string
  driverId: string
  assignmentType: "Primary" | "Relief" | "Helper"
  assignedFrom: string
  assignedTo?: string
  status: "Active" | "Completed"
  startReason?: string
  endReason?: string
  remarks?: string
  createdBy: string
  createdAt: string
}
```

---

# 31. Core Assignment Rules

For MVP:

### Rule 1

One driver can have only one active **Primary** vehicle assignment at a time.

### Rule 2

One vehicle can have only one active **Primary** driver at a time.

### Rule 3

A suspended, resigned, terminated or inactive driver cannot receive a new assignment.

### Rule 4

When changing the driver of a vehicle:

```text
1. Close existing assignment
2. Set assignedTo
3. Set endReason
4. Create new assignment
```

Never overwrite the previous driver assignment.

### Rule 5

Never delete assignment history from normal UI.

---

# 32. Assign Driver Workflow

Modal or page:

```text
Assign Driver
```

Fields:

```text
Vehicle
Driver
Assignment Type
Start Date
Reason
Remarks
```

Show only eligible drivers by default:

```text
Status = Active
No conflicting primary assignment
```

Before saving show summary:

```text
Vehicle:
KOT-786

Driver:
Ahmed Khan

Type:
Primary

Starting:
14 Oct 2026
```

---

# 33. Change Driver Workflow

From vehicle profile:

```text
Change Driver
```

Step 1:

Show existing driver:

```text
Ahmed Khan
Assigned since: 01 Jan 2026
```

Require:

```text
End Date
Reason
Remarks
```

Step 2:

Select replacement driver.

Step 3:

Create new assignment.

History must remain intact.

---

# 34. End Assignment Workflow

Require:

```text
End Date
Reason
Remarks
```

Common seed reasons:

```text
Driver Transferred
Driver On Leave
Driver Suspended
Driver Resigned
Vehicle Maintenance
Operational Requirement
Other
```

---

# 35. Seed Data

Create realistic seed data.

Minimum:

```text
10 vehicles
12 drivers
8 active assignments
several previous assignments
driver status history
vehicle documents
driver documents
```

Use Pakistani-style realistic demo data.

Example vehicle numbers:

```text
KOT-101
KOT-102
KOT-103
KOT-104
KOT-105
KOT-106
KOT-107
KOT-108
KOT-109
KOT-110
```

Example drivers:

```text
Ahmed Khan
Muhammad Irfan
Ali Raza
Imran Ahmed
Nadeem Shah
Faisal Mehmood
Junaid Khan
Bilal Hussain
Shahid Ali
Rashid Iqbal
Zeeshan Ahmed
Kamran Akhtar
```

Do not use real CNICs.

Use obviously fake demo numbers.

---

# 36. Recommended TypeScript Domain Models

Create types such as:

```ts
Vehicle
TankCompartment
VehicleDocument

Driver
DriverDocument
DriverExperience
DriverReference
DriverLanguage

DriverStatusHistory
VehicleDriverAssignment
```

---

# 37. Suggested Vehicle Type

```ts
export interface Vehicle {
  id: string
  vehicleNumber: string
  status: "Active" | "Inactive" | "Under Maintenance" | "Retired"

  chassisNumber?: string
  engineNumber?: string

  make?: string
  model?: string
  vehicleType?: string

  manufacturingYear?: number
  inductionYear?: number

  colorBranding?: string
  oem?: string
  primeMoverType?: string

  bowserQuantity?: number
  bowserNumber?: string
  bowserInductionYear?: number

  hosePower?: string
  chamberDetail?: string
  driveAxle?: string
  suspensionType?: string
  brakeType?: string

  bottomLoading?: boolean
  trailerWheel?: string
  spareTyreIncluded?: boolean
  materialTrailer?: string

  obcTracker?: boolean
  mdvr?: boolean

  capacityKL?: number
  grossVehicleWeight?: number
  productWeight?: number
  grossCargoWeight?: number

  notes?: string

  createdAt: string
  updatedAt: string
}
```

---

# 38. Suggested Driver Type

```ts
export interface Driver {
  id: string

  driverCode: string
  pkCode?: string

  inductionDate: string

  name: string
  fatherName?: string

  dateOfBirth?: string
  placeOfBirth?: string

  address?: string
  maritalStatus?: string
  bloodGroup?: string

  mobileNumber?: string
  education?: string

  photoUrl?: string

  cnicNumber?: string
  cnicIssueDate?: string
  cnicExpiryDate?: string
  cnicVerified?: boolean

  licenseNumber?: string
  licenseType?: string
  licenseIssueDate?: string
  licenseExpiryDate?: string
  licenseOnlineVerified?: boolean
  drivingSince?: string

  currentStatus:
    | "Active"
    | "On Leave"
    | "Suspended"
    | "Resigned"
    | "Terminated"
    | "Inactive"

  createdAt: string
  updatedAt: string
}
```

---

# 39. Seed Repository Interface

Create repository interfaces so Supabase can be added later.

Example:

```ts
export interface DriverRepository {
  getAll(): Promise<Driver[]>
  getById(id: string): Promise<Driver | null>
  create(input: CreateDriverInput): Promise<Driver>
  update(id: string, input: UpdateDriverInput): Promise<Driver>
}
```

Vehicle:

```ts
export interface VehicleRepository {
  getAll(): Promise<Vehicle[]>
  getById(id: string): Promise<Vehicle | null>
  create(input: CreateVehicleInput): Promise<Vehicle>
  update(id: string, input: UpdateVehicleInput): Promise<Vehicle>
}
```

Assignments:

```ts
export interface AssignmentRepository {
  getAll(): Promise<VehicleDriverAssignment[]>
  getActive(): Promise<VehicleDriverAssignment[]>
  create(
    input: CreateAssignmentInput
  ): Promise<VehicleDriverAssignment>
  endAssignment(
    id: string,
    input: EndAssignmentInput
  ): Promise<VehicleDriverAssignment>
}
```

---

# 40. Mock Persistence

For MVP, seed data may reset on refresh.

Preferred options:

### Simple version

Use in-memory seed data.

### Better demo version

Use:

```text
localStorage
```

so changes survive page refresh.

If using localStorage:

- initialize from seed data on first load
- persist CRUD changes
- add a developer/demo button:

```text
Reset Demo Data
```

This will make the prototype feel more realistic.

---

# 41. Search and Filtering

Implement useful search.

Vehicle search by:

```text
vehicle number
chassis
engine
make
model
```

Driver search by:

```text
driver code
name
CNIC
mobile
license
```

---

# 42. Validation

Vehicle:

- Vehicle Number required
- Vehicle Number unique
- Chassis unique if entered
- Engine unique if entered

Driver:

- Driver Name required
- Driver Code required
- Driver Code unique
- CNIC unique if entered
- License Number unique if entered
- Expiry cannot normally be before issue date

Assignment:

- Vehicle required
- Driver required
- Start date required
- Enforce active-assignment rules

---

# 43. Expiry Status Helper

Create a reusable helper.

Example:

```ts
getExpiryStatus(expiryDate)
```

Return:

```text
Valid
Expiring Soon
Expired
```

Suggested rule:

```text
Expired:
expiry < today

Expiring Soon:
0-30 days

Valid:
>30 days
```

Use badges throughout the app.

---

# 44. Audit / Activity Feed

For MVP, create simple seed/generated activity events.

Examples:

```text
Ahmed Khan assigned to KOT-103
Driver status changed to On Leave
Vehicle KOT-105 registered
License updated for Muhammad Irfan
Vehicle KOT-109 driver changed
```

Show on profile Activity tabs.

No complex audit backend needed yet.

---

# 45. UI Components

Create reusable components:

```text
AppSidebar
PageHeader
StatCard
StatusBadge
DataTable
SearchInput
FilterDropdown
EmptyState
ConfirmDialog
FormSection
DetailRow
ExpiryBadge
ProfileHeader
Tabs
ActivityTimeline
```

---

# 46. Pages Required

Create these pages:

```text
/
  redirect to /dashboard

/dashboard

/vehicles
/vehicles/new
/vehicles/[id]
/vehicles/[id]/edit

/drivers
/drivers/new
/drivers/[id]
/drivers/[id]/edit

/assignments
```

Modals may be used for:

```text
Assign Driver
Change Driver
End Assignment
Change Driver Status
```

---

# 47. Demo Workflow That Must Work

The following demo must work end-to-end:

### Scenario A — Register Vehicle

```text
Vehicles
→ Register Vehicle
→ Enter basic data
→ Add technical info
→ Add compartments
→ Add documents
→ Save
→ Vehicle appears in list
```

### Scenario B — Register Driver

```text
Drivers
→ Register Driver
→ Fill personal info
→ Add license/CNIC
→ Add compliance info
→ Add experience
→ Save
→ Driver appears in list
```

### Scenario C — Assign Driver

```text
Open Vehicle
→ Assign Driver
→ Select eligible driver
→ Save
→ Current Driver updates
→ Assignment appears in vehicle history
→ Vehicle appears in driver's vehicle history
```

### Scenario D — Change Driver

```text
Vehicle Profile
→ Change Driver
→ End old assignment
→ Select new driver
→ Save
→ New driver becomes current
→ Old assignment remains in history
```

### Scenario E — Driver On Leave

```text
Driver Profile
→ Change Status
→ On Leave
→ Enter dates/reason
→ Save
→ Status history updated
→ Driver badge becomes On Leave
```

### Scenario F — Suspend Driver

```text
Driver Profile
→ Change Status
→ Suspended
→ Enter reason
→ Save
→ Warn if assigned
→ End assignment if confirmed
→ Driver no longer eligible for assignment
```

### Scenario G — Resignation

```text
Driver Profile
→ Change Status
→ Resigned
→ Enter resignation / last working date
→ Save
→ End active assignment
→ Driver retained in history
→ Driver cannot be newly assigned
```

---

# 48. Important Design Rule

Do not permanently delete:

```text
driver history
vehicle history
assignments
status history
```

The fleet system must preserve historical operational records.

For MVP, regular delete buttons for drivers and vehicles are not required.

Use inactive/retired/resigned statuses instead.

---

# 49. Supabase-Ready Future Database

Do not connect this yet.

But organize the seed domain models so they map easily to future tables:

```text
vehicles
vehicle_compartments
vehicle_documents

drivers
driver_documents
driver_languages
driver_experience
driver_references

driver_status_history
vehicle_driver_assignments
```

Later:

```text
repository implementation
SeedRepository
        ↓ replace
SupabaseRepository
```

The UI should not need major changes.

---

# 50. Future Expansion — Do Not Build Yet

Do not build these features now.

Only keep the architecture extensible for later:

```text
Trip Management
Dispatch
Route Management
Fuel Management
Maintenance
Tyre Management
Accident / Incident Management
Workshop
Expenses
Fuel Station Integration
GPS / Tracker Integration
MDVR Integration
Driver Training
HSE
Journey Management
Customer Contracts
Total PARCO Operations
Invoices
Payroll
Inventory
Analytics
Reports
Notifications
Role-Based Access Control
```

The MVP is only the foundation.

---

# 51. UX Improvements Over Existing Software

The old system uses extremely long registration forms.

The new app should improve this by:

```text
tabs
sections
cards
progress steps
repeatable dynamic fields
clear status badges
profile views
history timelines
searchable tables
```

Do not visually copy the old software.

Build a modern product.

---

# 52. Suggested Dashboard Demo Numbers

With seed data display approximately:

```text
Vehicles: 10
Active Vehicles: 8
Drivers: 12
Active Drivers: 8
On Leave: 2
Suspended: 1
Resigned: 1
Active Assignments: 8
Unassigned Vehicles: 2
```

This makes the dashboard immediately useful for demonstration.

---

# 53. Responsive Design

Desktop is the primary use case.

Also ensure acceptable tablet/mobile behavior.

Tables may:

- scroll horizontally on small screens
- collapse less important columns
- preserve primary actions

---

# 54. Data Formatting

Dates:

```text
14 Oct 2026
```

Use Pakistan-friendly display formatting.

CNIC display:

```text
42101-0000000-0
```

but use fake demo data only.

Capacity:

```text
24 KL
```

Weight:

```text
32,000 kg
```

---

# 55. Final Deliverable Expected From Antigravity

Build a complete working Next.js MVP that includes:

- clean reusable architecture
- polished fleet-management UI
- seed/demo data
- CRUD-style vehicle registration/editing
- CRUD-style driver registration/editing
- dynamic vehicle compartments
- generic document records
- driver status changes with history
- driver/vehicle assignment
- assignment history
- vehicle → driver history
- driver → vehicle history
- dashboard
- filtering/search
- validation
- local demo persistence if practical

Do not connect Supabase yet.

Do not implement unnecessary enterprise features.

The application should be good enough to open in front of a real fleet operator and demonstrate the intended workflow.

---

# 56. Definition of Done

The MVP is complete when the following can be demonstrated without fake static screens:

1. Register a new vehicle
2. Open its profile
3. Register a new driver
4. Open the driver profile
5. Assign that driver to the vehicle
6. See driver on vehicle profile
7. See vehicle on driver profile
8. Replace the driver and preserve old history
9. Put a driver on leave
10. Suspend a driver
11. Resign a driver
12. Prevent invalid new assignments
13. See both status and assignment histories
14. Refresh the app and retain demo data if local persistence was implemented
15. Reset demo data when required

---

# 57. Build Priority

Build in this order:

```text
1. Layout / Sidebar
2. Domain Types
3. Seed Data
4. Mock Repositories
5. Dashboard
6. Vehicle List
7. Vehicle Registration
8. Vehicle Profile
9. Driver List
10. Driver Registration
11. Driver Profile
12. Assignment Workflow
13. Driver Status Workflow
14. Histories
15. Documents / expiry badges
16. Validation
17. UI polish
```

---

# 58. Important Final Instruction

This MVP is intended to become the foundation of a much larger commercial fleet-management system.

Therefore:

- keep domain logic clean
- keep history immutable
- avoid duplicate business logic
- do not tightly couple pages to mock data
- use repository abstractions
- use reusable components
- preserve relational thinking even though the current version uses seed data
- make future Supabase migration straightforward

The first priority is a **stable, understandable, demo-ready operational MVP** for Karachi Oil Trading.
