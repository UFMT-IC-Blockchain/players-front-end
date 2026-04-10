import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent, SpinnerComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  mode: AuthMode = 'login';
  loginForm: FormGroup;
  alertMessage: string = '';
  alertType: 'error' | 'success' | 'info' = 'info';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      login: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  private setAlert(type: 'error' | 'success' | 'info', message: string): void {
    this.alertType = type;
    this.alertMessage = message;
  }

  private clearAlert(): void {
    this.alertMessage = '';
    this.alertType = 'info';
  }

  private extractBackendMessage(err: unknown): string | null {
    const anyErr = err as { error?: unknown };
    const payload = anyErr?.error as { message?: unknown } | undefined;
    const msg = payload?.message;

    if (Array.isArray(msg)) {
      const parts = msg.filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
      return parts.length > 0 ? parts.join(' ') : null;
    }

    if (typeof msg === 'string' && msg.trim().length > 0) {
      return msg;
    }

    return null;
  }

  toggleMode(): void {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.isLoading = false;
    this.clearAlert();
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.clearAlert();
      
      const payload = this.loginForm.getRawValue() as { login: string; senha: string };

      if (this.mode === 'login') {
        this.authService.login(payload).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.authService.setToken(response.access_token);
            this.router.navigate(['/jogos']);
          },
          error: (err: any) => {
            this.isLoading = false;
            const backendMessage = this.extractBackendMessage(err);

            if (err.status === 401) {
              this.setAlert('error', 'Credenciais inválidas. Verifique seu usuário e senha.');
            } else if (err.status === 400) {
              this.setAlert('error', backendMessage ?? 'Dados inválidos. Verifique usuário e senha.');
            } else {
              this.setAlert('error', 'Erro de comunicação com o servidor.');
            }

            console.error('Login error', err);
          }
        });
        return;
      }

      this.authService.register(payload).subscribe({
        next: () => {
          this.isLoading = false;
          this.setAlert('success', 'Usuário criado com sucesso. Você já pode fazer login.');
          this.mode = 'login';
          this.loginForm.patchValue({ senha: '' });
          this.loginForm.markAsPristine();
          this.loginForm.markAsUntouched();
        },
        error: (err: any) => {
          this.isLoading = false;
          const backendMessage = this.extractBackendMessage(err);

          if (err.status === 409) {
            this.setAlert('error', 'Este login já está em uso. Escolha outro.');
          } else if (err.status === 400) {
            this.setAlert('error', backendMessage ?? 'Dados inválidos. Verifique usuário e senha.');
          } else {
            this.setAlert('error', 'Erro de comunicação com o servidor.');
          }

          console.error('Register error', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
