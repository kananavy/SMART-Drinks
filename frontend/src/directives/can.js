/**
 * v-can directive — Spatie-like permission directive for Vue 3
 *
 * Usage:
 *   v-can="'edit-users'"           — show if has permission
 *   v-can:role="'superadmin'"      — show if has role
 *   v-can:any-role="'vendeur,superadmin'" — show if has any role
 *   v-can:not="'delete-users'"     — show if does NOT have permission (v-cannot)
 *   v-can:all="'perm1,perm2'"      — show if has ALL permissions
 *
 * When the user doesn't have access, the element is hidden (display: none)
 * For removal from DOM, use v-if with can() composable instead.
 */
import { usePermissionsStore } from '@/stores/permissions';

function applyPermission(el, binding) {
  const store = usePermissionsStore();

  let hasAccess = false;

  const modifier = binding.arg; // e.g. 'role', 'any-role', 'not', 'all'
  const value = binding.value;

  if (!modifier) {
    // v-can="'permission-name'"
    hasAccess = store.can(value);
  } else if (modifier === 'role') {
    // v-can:role="'superadmin'"
    hasAccess = store.hasRole(value);
  } else if (modifier === 'any-role') {
    // v-can:any-role="['vendeur', 'superadmin']" or v-can:any-role="'vendeur,superadmin'"
    const roles = Array.isArray(value) ? value : value.split(',').map(r => r.trim());
    hasAccess = store.hasAnyRole(roles);
  } else if (modifier === 'not') {
    // v-can:not="'delete-users'" — inverse (v-cannot)
    hasAccess = store.cannot(value);
  } else if (modifier === 'all') {
    // v-can:all="['perm1', 'perm2']"
    const perms = Array.isArray(value) ? value : value.split(',').map(p => p.trim());
    hasAccess = store.hasAllPermissions(perms);
  }

  el.style.display = hasAccess ? '' : 'none';
}

export const vCan = {
  mounted(el, binding) {
    applyPermission(el, binding);
  },
  updated(el, binding) {
    applyPermission(el, binding);
  },
};

function applyNotPermission(el, binding) {
  const store = usePermissionsStore();
  const hasAccess = store.cannot(binding.value);
  el.style.display = hasAccess ? '' : 'none';
}

// Also export as vCannot for convenience
export const vCannot = {
  mounted(el, binding) {
    applyNotPermission(el, binding);
  },
  updated(el, binding) {
    applyNotPermission(el, binding);
  },
};
