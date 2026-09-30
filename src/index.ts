import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import * as path from 'path';

const contentScriptId = 'typst-renderer';

async function renderTypst(source: string, width: string, previewWidth?: number): Promise<{ svg?: string; error?: string }> {
	if (typeof source !== 'string' || source.length > 100000) return { error: 'Typst snippet is too large.' };
	let pageWidth: string;
	if (width === 'auto') {
		pageWidth = 'auto';
	} else if (width === 'preview') {
		if (typeof previewWidth !== 'number' || !Number.isFinite(previewWidth) || previewWidth <= 0) return { error: 'Invalid preview width.' };
		pageWidth = `${Math.round(previewWidth * 0.75 * 100) / 100}pt`;
	} else if (typeof width === 'string' && /^(?:\d+(?:\.\d+)?|\.\d+)pt$/.test(width) && Number.parseFloat(width) > 0) {
		pageWidth = width;
	} else {
		return { error: 'Invalid Typst page width.' };
	}
	const directory = await fs.mkdtemp(path.join(tmpdir(), 'joplin-typst-'));
	const input = path.join(directory, 'snippet.typ');
	const output = path.join(directory, 'snippet.svg');
	try {
		await fs.writeFile(input, `#set page(width: ${pageWidth}, height: auto, margin: 2pt, fill: none)\n` + source, 'utf8');
		await new Promise<void>((resolve, reject) => {
			execFile('typst', ['compile', '--format', 'svg', '--root', directory, input, output],
				{ timeout: 15000, maxBuffer: 1024 * 1024 }, (error) => error ? reject(error) : resolve());
		});
		return { svg: await fs.readFile(output, 'utf8') };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return { error: message.includes('ENOENT') ? "Typst CLI was not found in Joplin's PATH." : message };
	} finally {
		await fs.rm(directory, { recursive: true, force: true });
	}
}

joplin.plugins.register({
	onStart: async function() {
		await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, contentScriptId, './typstRenderer.js');
		await joplin.contentScripts.onMessage(contentScriptId, async (message: { source: string; width: string; previewWidth?: number }) => renderTypst(message.source, message.width, message.previewWidth));
	},
});
