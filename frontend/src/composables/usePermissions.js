import { computed } from 'vue';
import { usePermissionsStore } from '@/stores/permissions';

/**
 * Spatie-like permission composable for Vue 3
 *
 * Usage:
 *   const { can, cannot, hasRole, hasAnyRole } = usePermissions()
 *   if (can('edit-users')) { ... }
 *   if (hasRole('superadmin')) { ... }
 */
export function usePermissions() {
  const store = usePermissionsStore();

  const can = (permission) => store.can(permission);
  const cannot = (permission) => store.cannot(permission);
  const hasRole = (role) => store.hasRole(role);
  const hasAnyRole = (roles) => store.hasAnyRole(roles);
  const hasAllPermissions = (perms) => store.hasAllPermissions(perms);

  // Computed versions for reactive use in templates
  const canComputed = (permission) => computed(() => store.can(permission));
  const hasRoleComputed = (role) => computed(() => store.hasRole(role));

  return {
    can,
    cannot,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    canComputed,
    hasRoleComputed,
    // Expose store for direct reactive access
    permissions: computed(() => store.permissions),
    role: computed(() => store.role),
    isLoaded: computed(() => store.loaded),
  };
}
