export interface PermissionDto {
  permissionId?: string;
  permissionName: string;
  isReadable: boolean;
  isWritable: boolean;
  isDeletable: boolean;
}
