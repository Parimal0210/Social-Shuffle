# Social Shuffle Pune — Angular 17 with Angular CLI Frontend

Complete production-grade frontend built with **Angular 17** using the **Angular CLI** architecture, standalone components, Angular 17 signals, reactive state management, and modern `@if`/`@for`/`@switch` control flow syntax.

---

## 🚀 Tech Stack

- **Framework**: Angular 17 (`@angular/core@^17.3.0`, `@angular/common`, `@angular/router`, `@angular/forms`)
- **CLI Tooling**: Angular CLI 17 (`@angular/cli@^17.3.0`, `@angular-devkit/build-angular`)
- **Language**: TypeScript 5.4 (`ES2022` target)
- **Styling**: Tailwind CSS with custom Pune brand theme colors
- **State Management**: Angular 17 Signals (`signal()`, `computed()`)
- **HTTP Client**: `provideHttpClient()` connecting to Spring Boot 4 REST API
- **Confetti & FX**: `canvas-confetti`

---

## 📂 Project Structure

```
frontend-angular-17/
├── angular.json                 # Angular CLI Workspace Configuration
├── package.json                 # Angular 17 dependencies & scripts
├── tsconfig.json                # Base TypeScript configuration
├── tsconfig.app.json            # Application build configuration
├── tailwind.config.js           # Tailwind theme configuration
├── src/
│   ├── index.html               # Main HTML entry with Google Fonts
│   ├── main.ts                  # Angular 17 Standalone Bootstrap
│   ├── styles.css               # Global Tailwind & brand styling
│   └── app/
│       ├── app.config.ts        # Application providers (Router, HttpClient, Animations)
│       ├── app.component.ts     # Root component with RBAC routing
│       ├── models/
│       │   └── types.ts         # User, Event, Game, Registration TypeScript models
│       ├── services/
│       │   ├── api.service.ts   # Spring Boot REST API integration (http://localhost:8080/api)
│       │   ├── auth.service.ts  # Participant & Admin authentication with Angular Signals
│       │   └── event.service.ts # Pune Meetups, games library, and RSVPs state
│       └── components/
│           ├── header/
│           │   └── header.component.ts         # Top navigation header & user controls
│           ├── auth/
│           │   └── auth-modal.component.ts     # Participant registration & 1-tap sign-in
│           ├── participant/
│           │   ├── participant-nav.component.ts   # Desktop top pill bar & mobile bottom bar
│           │   ├── participant-home.component.ts  # Hero banner & next meetup card
│           │   ├── participant-events.component.ts# Pune meetup catalog & RSVP modal
│           │   ├── participant-games.component.ts # 120+ Board game library
│           │   └── participant-profile.component.ts# Participant CRM stats & badges
│           └── admin/
│               ├── admin-sidebar.component.ts     # Organizer sidebar navigation
│               ├── admin-dashboard.component.ts   # Capacity, metrics & ticket counts
│               └── admin-attendance.component.ts  # iPad 1-tap door check-in
```

---

## 💻 How to Run with Angular CLI

### 1. Prerequisites
- Node.js 18+ or 20+
- Angular CLI installed globally:
  ```bash
  npm install -g @angular/cli@17
  ```

### 2. Install Dependencies
```bash
cd frontend-angular-17
npm install
```

### 3. Start Development Server
```bash
ng serve --port 4200
```
Open [http://localhost:4200](http://localhost:4200) in your browser.

### 4. Build for Production
```bash
ng build --configuration production
```
The optimized production bundle will be generated in `dist/social-shuffle-angular/browser`.

---

## 🔗 Connecting to the Spring Boot 4 & MongoDB Backend

The Angular frontend includes `ApiService` pointing by default to:
```
http://localhost:8080/api
```

To run the backend simultaneously:
```bash
cd backend-spring-boot-mongodb
./mvnw spring-boot:run
```
All endpoints (`/api/auth/login`, `/api/auth/register`, `/api/events`, `/api/games`, `/api/registrations`) are mapped and support automatic fallback to local demo data if the backend is not yet started.

---

## 🛡️ Strict Role-Based Access Control (RBAC)

1. **Registered Participants**:
   - Strictly confined to participant experiences (Meetup RSVPs, Game Library, Progress, Badges, Profile).
   - Admin navigation and role toggles are hidden and inaccessible.
2. **Organizers / Admins (`admin@socialshuffle.com`)**:
   - Access to the Organizer Dashboard and iPad 1-Tap Attendance Check-in.
   - Ability to preview the participant experience.
