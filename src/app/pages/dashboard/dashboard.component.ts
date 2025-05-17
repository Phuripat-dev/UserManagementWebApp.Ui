import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormArray,
  FormGroup,
  FormsModule,
  FormControl,
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserDto } from '../../models/UserDto.model';
import { CreateUserDto } from '../../models/CreateUserDto.model';
import { PermissionDto } from '../../models/PermissionDto.model';
import { RoleDto } from '../../models/RoleDto.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  users: UserDto[] = [];
  selectedUser: UserDto | null = null;
  isEditMode: boolean = false;

  roles = [
    { roleId: 'AB6BCC2B-02A5-474D-8901-131485ED7DF8', roleName: 'Super Admin' },
    { roleId: 'A70AE654-FB49-4370-9646-AB88FED4B501', roleName: 'Admin' },
    { roleId: '5D7A6B8B-B3CB-4F32-A039-39332FCF245F', roleName: 'Employee' },
  ];
  permissionModules = [
    { permissionName: 'Super Admin' },
    { permissionName: 'Admin' },
    { permissionName: 'Employee' },
  ];

  form = this.fb.group(
    {
      userId: [{ value: '', disabled: true }],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      phone: ['', Validators.required],
      userName: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      role: [null as RoleDto | null, Validators.required],
      permissions: this.fb.array<FormGroup>([]),
    },
    {
      validators: this.passwordMatchValidator, // 👈 custom validator
    }
  );
  showAlert = false;

  showDangerAlert() {
    this.showAlert = true;

    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  closeAlert() {
    this.showAlert = false;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordsMismatch: true }; // return group-level error
    }

    return null; // form is valid
  }

  get roleControl(): FormControl {
    return this.form.get('role') as FormControl;
  }

  get permissionsFormArray(): FormArray<FormGroup> {
    return this.form.get('permissions') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.loadUsers();
    this.initPermissions();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe((res) => (this.users = res));
  }

  initPermissions(permissions?: PermissionDto[]) {
    this.permissionsFormArray.clear();

    this.permissionModules.forEach((module) => {
      const matched = permissions?.find(
        (p) => p.permissionName === module.permissionName
      );

      this.permissionsFormArray.push(
        this.fb.group({
          permissionName: [module.permissionName],
          isReadable: [matched?.isReadable || false],
          isWritable: [matched?.isWritable || false],
          isDeletable: [matched?.isDeletable || false],
        })
      );
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.selectedUser = null;
    this.form.reset();
    this.initPermissions();

    // restore password validator
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.reset();
  }

  openEditModal(user: UserDto) {
    this.isEditMode = true;
    this.selectedUser = user;

    // Find matching role object by roleId
    const matchedRole =
      this.roles.find(
        (r) => r.roleId.toLowerCase() === user.role?.roleId.toLowerCase()
      ) ?? null;

    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('confirmPassword')?.reset();

    this.form.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      userName: user.userName,
      password: '',
      role: matchedRole,
    });

    this.initPermissions(user.permissions);
  }

  deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: () => (this.users = this.users.filter((u) => u.userId !== id)),
    });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showDangerAlert();
      console.log(this.form.errors);
      return;
    }

    const formData = this.form.value;

    // Compose user payload WITHOUT userId
    const userPayload: CreateUserDto = {
      firstName: formData.firstName!,
      lastName: formData.lastName!,
      email: formData.email!,
      phone: formData.phone!,
      userName: formData.userName!,
      password: formData.password!,
      role: formData.role as RoleDto,
      permissions: formData.permissions as PermissionDto[],
    };

    if (this.isEditMode && this.selectedUser) {
      // Update user by passing userId separately
      this.userService
        .updateUser(this.selectedUser.userId, userPayload)
        .subscribe({
          next: () => this.loadUsers(),
          error: (err) => console.error('Error updating user:', err),
        });
    } else {
      // Create user without userId
      this.userService.createUser(userPayload).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Error creating user:', err),
      });
    }
  }
}
