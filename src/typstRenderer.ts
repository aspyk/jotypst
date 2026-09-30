const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, character => ({
	'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

export default function(context: { contentScriptId: string }) {
		return {
			plugin: function(markdownIt: any) {
				const originalFence = markdownIt.renderer.rules.fence || ((tokens: any[], index: number, options: any, env: any, self: any) => self.renderToken(tokens, index, options));
				markdownIt.renderer.rules.fence = (tokens: any[], index: number, options: any, env: any, self: any) => {
					const token = tokens[index];
					const match = /^typst(?:\s+width=(auto|preview|(?:\d+(?:\.\d+)?|\.\d+)pt))?$/.exec(token.info.trim());
					if (!match) return originalFence(tokens, index, options, env, self);
					const width = match[1] || 'auto';
					const fence = token.markup || '```';
					return `<div class="joplin-editable typst-snippet" data-typst-source="${escapeHtml(token.content)}" data-typst-width="${escapeHtml(width)}" data-typst-script="${escapeHtml(context.contentScriptId)}"><pre class="joplin-source" data-joplin-language="typst" data-joplin-source-open="${escapeHtml(fence + token.info + '\n')}" data-joplin-source-close="${escapeHtml(fence)}">${escapeHtml(token.content)}</pre><div class="typst-output">Rendering Typst…</div></div>`;
				};
			},
			assets: function() {
				return [
					{ name: 'typstPreview.js' },
					{ name: 'typstPreview.css' },
				];
			},
		};
	};
