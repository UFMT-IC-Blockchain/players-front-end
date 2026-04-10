import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isModalOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get username(): string {
    const decoded = this.authService.getDecodedToken();
    if (!decoded) return 'Usuário';
    const login = decoded['login'];
    return (typeof login === 'string' ? login : null) || 'Usuário';
  }

  openLogoutModal(): void {
    this.isModalOpen = true;
  }

  closeLogoutModal(): void {
    this.isModalOpen = false;
  }

  onLogout(): void {
    this.authService.logout();
    this.closeLogoutModal();
    this.router.navigate(['/login']);
  }
}
