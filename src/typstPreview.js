(function() {
	const states = new WeakMap();

	async function render(block, output, state, revision) {
		try {
			const result = await webviewApi.postMessage(block.dataset.typstScript, {
				source: block.dataset.typstSource,
				width: block.dataset.typstWidth,
				previewWidth: state.width,
			});
			if (revision !== state.revision) return;
			if (result.error) {
				output.textContent = result.error;
				output.classList.add('typst-error');
			} else {
				output.innerHTML = result.svg;
				output.classList.remove('typst-error');
			}
		} catch (error) {
			if (revision !== state.revision) return;
			output.textContent = String(error);
			output.classList.add('typst-error');
		}
	}

	const resizeObserver = new ResizeObserver(entries => {
		for (const entry of entries) {
			const output = entry.target;
			const state = states.get(output);
			if (!state) continue;
			const width = output.clientWidth;
			if (width <= 0 || width === state.width) continue;
			state.width = width;
			const revision = ++state.revision;
			clearTimeout(state.timer);
			state.timer = setTimeout(() => render(state.block, output, state, revision), state.initial ? 120 : 0);
			state.initial = true;
		}
	});

	function observeBlocks() {
		for (const block of document.querySelectorAll('.typst-snippet')) {
			const output = block.querySelector('.typst-output');
			if (!output || states.has(output)) continue;
			const state = { block, width: 0, revision: 0, timer: null, initial: false };
			states.set(output, state);
			if (block.dataset.typstWidth === 'preview') {
				resizeObserver.observe(output);
			} else {
				render(block, output, state, ++state.revision);
			}
		}
	}

	new MutationObserver(observeBlocks).observe(document.documentElement, { childList: true, subtree: true });
	observeBlocks();
})();
