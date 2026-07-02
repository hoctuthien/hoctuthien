import { CategoryEntity } from '../category/entities/category.entity';
import { GroupCategoryEntity } from '../group-category/entities/group-category.entity';
import { MediaEntity } from '../media/entities/media.entity';
import { TagEntity } from '../tag/entities/tag.entity';
import { UserEntity } from '../user/entities/user.entity';
import { UserSessionEntity } from '../user-session/entities/user-session.entity';

type AdminJsPropertyConfig = {
  isDisabled?: boolean;
  isVisible?: boolean;
};

const INTERNAL_ADMIN_ROOT_PATH = '/internal/admin';

const buildReadOnlyProperties = (propertyNames: string[]) =>
  propertyNames.reduce<Record<string, AdminJsPropertyConfig>>((acc, propertyName) => {
    acc[propertyName] = {
      isDisabled: true,
    };
    return acc;
  }, {});

const buildHiddenProperties = (propertyNames: string[]) =>
  propertyNames.reduce<Record<string, AdminJsPropertyConfig>>((acc, propertyName) => {
    acc[propertyName] = {
      isVisible: false,
    };
    return acc;
  }, {});

export const adminJsOptions = {
  rootPath: INTERNAL_ADMIN_ROOT_PATH,
  branding: {
    companyName: 'HocTuThien Internal Admin',
    withMadeWithLove: false,
  },
  resources: [
    {
      resource: UserEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'User' },
        listProperties: ['name', 'email', 'role', 'status', 'isVerified', 'createdAt'],
        filterProperties: ['name', 'email', 'role', 'status', 'isVerified'],
        editProperties: ['name', 'email', 'phone', 'avatarUrl', 'role', 'status', 'isVerified', 'points', 'timezone'],
        showProperties: ['id', 'name', 'email', 'phone', 'avatarUrl', 'role', 'status', 'isVerified', 'points', 'timezone', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'createdAt', 'updatedAt', 'deletedAt']),
          ...buildHiddenProperties(['passwordHash', 'googleId', 'preferences', 'metadata', 'dayOfBirth', 'gender']),
        },
      },
    },
    {
      resource: CategoryEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'Catalog' },
        listProperties: ['name', 'slug', 'status', 'groupCategoryId', 'createdAt'],
        filterProperties: ['name', 'slug', 'status', 'groupCategoryId'],
        editProperties: ['name', 'slug', 'iconUrl', 'status', 'groupCategoryId'],
        showProperties: ['id', 'name', 'slug', 'iconUrl', 'status', 'groupCategoryId', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'createdAt', 'updatedAt', 'deletedAt']),
          ...buildHiddenProperties(['metadata']),
        },
      },
    },
    {
      resource: GroupCategoryEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'Catalog' },
        listProperties: ['name', 'slug', 'status', 'createdAt'],
        filterProperties: ['name', 'slug', 'status'],
        editProperties: ['name', 'slug', 'status'],
        showProperties: ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'createdAt', 'updatedAt', 'deletedAt']),
        },
      },
    },
    {
      resource: TagEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'Tag' },
        listProperties: ['name', 'slug', 'status', 'createdAt'],
        filterProperties: ['name', 'slug', 'status'],
        editProperties: ['name', 'slug', 'status'],
        showProperties: ['id', 'name', 'slug', 'status', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'createdAt', 'updatedAt', 'deletedAt']),
        },
      },
    },
    {
      resource: MediaEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'Image' },
        listProperties: ['filename', 'mimeType', 'size', 'uploaderId', 'createdAt'],
        filterProperties: ['filename', 'mimeType', 'uploaderId'],
        editProperties: ['url', 'filename', 'mimeType', 'size', 'uploaderId'],
        showProperties: ['id', 'url', 'filename', 'mimeType', 'size', 'uploaderId', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'createdAt', 'updatedAt', 'deletedAt']),
          ...buildHiddenProperties(['metadata']),
        },
      },
    },
    {
      resource: UserSessionEntity,
      options: {
        navigation: { name: 'Internal Tools', icon: 'Security' },
        actions: {
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
        },
        listProperties: ['userId', 'deviceName', 'deviceType', 'status', 'lastUsedAt', 'refreshTokenExpiresAt'],
        filterProperties: ['userId', 'deviceName', 'deviceType', 'status'],
        showProperties: ['id', 'userId', 'deviceName', 'deviceType', 'status', 'lastUsedAt', 'refreshTokenExpiresAt', 'revokedAt', 'createdAt', 'updatedAt'],
        properties: {
          ...buildReadOnlyProperties(['id', 'userId', 'deviceName', 'deviceType', 'status', 'lastUsedAt', 'refreshTokenExpiresAt', 'revokedAt', 'createdAt', 'updatedAt', 'deletedAt']),
          ...buildHiddenProperties(['refreshToken', 'metadata', 'ipAddress', 'userAgent']),
        },
      },
    },
  ],
};

export async function createAdminRouter() {
  const dynamicImport = new Function('specifier', 'return import(specifier);') as <T>(specifier: string) => Promise<T>;

  const [{ default: AdminJS }, AdminJSExpress, typeormAdapter] = await Promise.all([
    dynamicImport<any>('adminjs'),
    dynamicImport<any>('@adminjs/express'),
    dynamicImport<any>('@adminjs/typeorm'),
  ]);

  AdminJS.registerAdapter({
    Database: typeormAdapter.Database,
    Resource: typeormAdapter.Resource,
  });

  const admin = new AdminJS(adminJsOptions);
  const router = AdminJSExpress.buildRouter(admin);

  return {
    admin,
    router,
  };
}
