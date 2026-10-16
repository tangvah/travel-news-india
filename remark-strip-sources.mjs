// When frontmatter has `sources`, drop the body's own "## Sources" section (shown in the Source box instead).
const text = (n) => (n.value ?? '') + (n.children ?? []).map(text).join('');
export default function remarkStripSources() {
  return (tree, file) => {
    const fm = file.data?.astro?.frontmatter;
    if (!Array.isArray(fm?.sources) || fm.sources.length === 0) return;
    const out = []; let skip = 0;
    for (const n of tree.children) {
      if (n.type === 'heading') {
        if (skip && n.depth <= skip) skip = 0;
        if (!skip && /^\s*sources\s*:?\s*$/i.test(text(n))) { skip = n.depth; continue; }
      }
      if (!skip) out.push(n);
    }
    tree.children = out;
  };
}
