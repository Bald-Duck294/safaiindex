// src/lib/utils/menuFilter.js

/**
 * Filter menu items based on user permissions
 * @param {Array} menuTemplate - Full menu template
 * @param {Array} userPermissions - User's permission array
 * @returns {Array} - Filtered menu items
 */
export const filterMenuByPermissions = (menuTemplate, userPermissions) => {
  const filtered = [];

  for (const item of menuTemplate) {
    // ✅ STEP 1: Check if user has parent permission (always .view)
    if (!userPermissions.includes(item.requiredPermission)) {
      continue; // Skip this menu entirely
    }

    // ✅ STEP 2: If has children, filter them
    if (item.children && item.children.length > 0) {
      const accessibleChildren = item.children.filter((child) =>
        userPermissions.includes(child.requiredPermission)
      );

      // No accessible children → skip menu
      if (accessibleChildren.length === 0) {
        continue;
      }

      // ✅ STEP 3: Only 1 child → Convert to direct link
      if (accessibleChildren.length === 1) {
        filtered.push({
          icon: item.icon,
          label: item.simpleLabel || item.label, // Use simple label
          href: accessibleChildren[0].href,
          hasDropdown: false,
        });
      }
      // ✅ STEP 4: Multiple children → Keep as dropdown
      else {
        filtered.push({
          icon: item.icon,
          label: item.label, // Use full label
          hasDropdown: true,
          key: item.key,
          children: accessibleChildren,
        });
      }
    }
    // ✅ STEP 5: No children → Direct link
    else {
      filtered.push({
        icon: item.icon,
        label: item.simpleLabel || item.label,
        href: item.href,
        hasDropdown: false,
      });
    }
  }

  return filtered;
};
