import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { AuthModalComponent } from './components/auth/auth-modal.component';
import { ParticipantNavComponent, ParticipantTab } from './components/participant/participant-nav.component';
import { ParticipantHomeComponent } from './components/participant/participant-home.component';
import { ParticipantEventsComponent } from './components/participant/participant-events.component';
import { ParticipantGamesComponent } from './components/participant/participant-games.component';
import { ParticipantProfileComponent } from './components/participant/participant-profile.component';
import { AdminSidebarComponent, AdminSection } from './components/admin/admin-sidebar.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminAttendanceComponent } from './components/admin/admin-attendance.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AuthModalComponent,
    ParticipantNavComponent,
    ParticipantHomeComponent,
    ParticipantEventsComponent,
    ParticipantGamesComponent,
    ParticipantProfileComponent,
    AdminSidebarComponent,
    AdminDashboardComponent,
    AdminAttendanceComponent
  ],
  template: `
    <div class="min-h-screen bg-[#0A1128] text-slate-100 flex flex-col selection:bg-[#FF6036] selection:text-white">
      <!-- Universal Header -->
      <app-header></app-header>

      <!-- STRICT RBAC VIEW ROUTING -->
      @if (auth.isAdminUser() && auth.role() === 'admin') {
        <!-- Organizer Admin Console -->
        <div class="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto">
          <app-admin-sidebar
            [activeSection]="currentAdminSection()"
            (sectionChange)="currentAdminSection.set($event)"
          ></app-admin-sidebar>

          <main class="flex-1 p-4 sm:p-6 lg:p-8">
            @switch (currentAdminSection()) {
              @case ('dashboard') {
                <app-admin-dashboard></app-admin-dashboard>
              }
              @case ('attendance') {
                <app-admin-attendance></app-admin-attendance>
              }
            }
          </main>
        </div>
      } @else {
        <!-- Participant App View (Web & Mobile Native Experience) -->
        <div class="flex-1 flex flex-col">
          <app-participant-nav
            [activeTab]="currentParticipantTab()"
            (tabChange)="currentParticipantTab.set($event)"
          ></app-participant-nav>

          <main class="flex-1 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
            @switch (currentParticipantTab()) {
              @case ('home') {
                <app-participant-home
                  (navigate)="currentParticipantTab.set($event)"
                ></app-participant-home>
              }
              @case ('events') {
                <app-participant-events></app-participant-events>
              }
              @case ('games') {
                <app-participant-games></app-participant-games>
              }
              @case ('profile') {
                <app-participant-profile></app-participant-profile>
              }
            }
          </main>
        </div>
      }

      <!-- Global Auth & Registration Modal -->
      <app-auth-modal></app-auth-modal>
    </div>
  `
})
export class AppComponent {
  auth = inject(AuthService);

  currentParticipantTab = signal<ParticipantTab>('home');
  currentAdminSection = signal<AdminSection>('dashboard');
}
