// Flattens the category list returned by GET /product-categories into a depth-annotated,
// parent-before-children order suitable for indented <select> options or list rendering.
export function flattenCategories(categories) {
  const byId = {};
  categories.forEach((c) => (byId[c.id] = c));

  function depth(c) {
    let d = 0;
    let current = c;
    const seen = new Set();
    while (current.parentCategoryId && byId[current.parentCategoryId] && !seen.has(current.id)) {
      seen.add(current.id);
      d += 1;
      current = byId[current.parentCategoryId];
    }
    return d;
  }

  const childrenByParent = {};
  categories.forEach((c) => {
    const key = c.parentCategoryId || '__root__';
    (childrenByParent[key] = childrenByParent[key] || []).push(c);
  });

  const ordered = [];
  function visit(parentKey) {
    (childrenByParent[parentKey] || [])
      .slice()
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .forEach((c) => {
        ordered.push({ ...c, depth: depth(c) });
        visit(c.id);
      });
  }
  visit('__root__');

  // Any category whose parent is missing from the list (orphaned) still needs to show up.
  const seenIds = new Set(ordered.map((c) => c.id));
  categories.forEach((c) => {
    if (!seenIds.has(c.id)) ordered.push({ ...c, depth: 0 });
  });

  return ordered;
}
