import { SetMetadata } from '@nestjs/common';

export const ADMIN_PUBLIC_KEY = 'adminPublic';
export const AdminPublic = () => SetMetadata(ADMIN_PUBLIC_KEY, true);
