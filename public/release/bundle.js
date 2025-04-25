(function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/** @returns {number} */
	function to_number(value) {
		return value === '' ? null : +value;
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}

	/**
	 * @returns {void} */
	function select_option(select, value, mounting) {
		for (let i = 0; i < select.options.length; i += 1) {
			const option = select.options[i];
			if (option.__value === value) {
				option.selected = true;
				return;
			}
		}
		if (!mounting || value !== undefined) {
			select.selectedIndex = -1; // no option should be selected
		}
	}

	function select_value(select) {
		const selected_option = select.querySelector(':checked');
		return selected_option && selected_option.__value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * Schedules a callback to run immediately after the component has been updated.
	 *
	 * The first time the callback runs will be after the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#afterupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function afterUpdate(fn) {
		get_current_component().$$.after_update.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	/** @returns {void} */
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function outro_and_destroy_block(block, lookup) {
		transition_out(block, 1, 1, () => {
			lookup.delete(block.key);
		});
	}

	/** @returns {any[]} */
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length;
		let n = list.length;
		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();
		const updates = [];
		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);
			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else if (dynamic) {
				// defer updates until all the DOM shuffling is done
				updates.push(() => block.p(child_ctx, dirty));
			}
			new_lookup.set(key, (new_blocks[i] = block));
			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set();
		const did_move = new Set();
		/** @returns {void} */
		function insert(block) {
			transition_in(block, 1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}
		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;
			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			} else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			} else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			} else if (did_move.has(old_key)) {
				o--;
			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);
			} else {
				will_move.add(old_key);
				o--;
			}
		}
		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}
		while (n) insert(new_blocks[n - 1]);
		run_all(updates);
		return new_blocks;
	}

	/** @returns {void} */
	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify
	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	const character = () => ({
	    name: '',
	    glitches: {
	        die: 'd2',
	        current: 0
	    },
	    hp: {
	        current: 0,
	        max: 0
	    },
	    abilities: {
	        strength: 0,
	        agility: 0,
	        presence: 0,
	        toughness: 0,
	        knowledge: 0
	    },
	    creds: 0,
	    debt: 0,
	    className: '',
	    apps: [],
	    nano: [],
	    infestations: [],
	    armor: 'None',
	    armorValue: '-',
	    weapons: [],
	    equipment: [],
	    cybertech: [],
	    info: '',
	    notes: []
	});

	const params = new URLSearchParams(window.location.search);
	const theme = params.get('theme') ?? 
	    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

	function setTheme(name) {
	    window.location.search = `theme=${name}`;
	}

	const app$1 = () => ({
	    name: 'App',
	    description: ''
	});

	/* src\components\TextArea.svelte generated by Svelte v4.2.19 */

	function get_each_context$b(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[15] = list[i];
		child_ctx[17] = i;
		return child_ctx;
	}

	// (33:0) {:else}
	function create_else_block$b(ctx) {
		let span;
		let t;
		let button;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[10].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

		function select_block_type_1(ctx, dirty) {
			if (/*matches*/ ctx[1].length == 0) return create_if_block_1$3;
			return create_else_block_1$2;
		}

		let current_block_type = select_block_type_1(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				span = element("span");
				if (default_slot) default_slot.c();
				t = space();
				button = element("button");
				if_block.c();
				attr(span, "class", "py-2 font-weight-bold");
				attr(button, "class", "btn btn-light border text-left align-top wrap w-100");
				set_style(button, "min-height", "2.5em");
			},
			m(target, anchor) {
				insert(target, span, anchor);

				if (default_slot) {
					default_slot.m(span, null);
				}

				insert(target, t, anchor);
				insert(target, button, anchor);
				if_block.m(button, null);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler*/ ctx[14]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[9],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
							null
						);
					}
				}

				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(button, null);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(span);
					detach(t);
					detach(button);
				}

				if (default_slot) default_slot.d(detaching);
				if_block.d();
				mounted = false;
				dispose();
			}
		};
	}

	// (24:0) {#if active}
	function create_if_block$d(ctx) {
		let span;
		let t;
		let textarea;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[10].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

		return {
			c() {
				span = element("span");
				if (default_slot) default_slot.c();
				t = space();
				textarea = element("textarea");
				attr(span, "class", "py-2 font-weight-bold");
				attr(textarea, "class", "flex-grow-1 form-control");
			},
			m(target, anchor) {
				insert(target, span, anchor);

				if (default_slot) {
					default_slot.m(span, null);
				}

				insert(target, t, anchor);
				insert(target, textarea, anchor);
				/*textarea_binding*/ ctx[11](textarea);
				set_input_value(textarea, /*content*/ ctx[0]);
				current = true;

				if (!mounted) {
					dispose = [
						listen(textarea, "input", /*textarea_input_handler*/ ctx[12]),
						listen(textarea, "blur", /*blur_handler*/ ctx[13]),
						listen(textarea, "focus", /*resizeInput*/ ctx[6]),
						listen(textarea, "keyup", /*resizeInput*/ ctx[6])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[9],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
							null
						);
					}
				}

				if (dirty & /*content*/ 1) {
					set_input_value(textarea, /*content*/ ctx[0]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(span);
					detach(t);
					detach(textarea);
				}

				if (default_slot) default_slot.d(detaching);
				/*textarea_binding*/ ctx[11](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (38:4) {:else}
	function create_else_block_1$2(ctx) {
		let each_1_anchor;
		let each_value = ensure_array_like(/*matches*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$b(get_each_context$b(ctx, each_value, i));
		}

		return {
			c() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*content, matches, lastFragment, firstFragment*/ 51) {
					each_value = ensure_array_like(/*matches*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$b(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$b(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};
	}

	// (36:4) {#if matches.length == 0}
	function create_if_block_1$3(ctx) {
		let t;

		return {
			c() {
				t = text(/*content*/ ctx[0]);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*content*/ 1) set_data(t, /*content*/ ctx[0]);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (40:12) {#if i == 0}
	function create_if_block_3$1(ctx) {
		let t;

		return {
			c() {
				t = text(/*firstFragment*/ ctx[5]);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*firstFragment*/ 32) set_data(t, /*firstFragment*/ ctx[5]);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (40:183) {:else}
	function create_else_block_2(ctx) {
		let t;

		return {
			c() {
				t = text(/*lastFragment*/ ctx[4]);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*lastFragment*/ 16) set_data(t, /*lastFragment*/ ctx[4]);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (40:83) {#if i < matches.length - 1}
	function create_if_block_2$1(ctx) {
		let t_value = /*content*/ ctx[0].substring(/*match*/ ctx[15].index + /*match*/ ctx[15][0].length, /*matches*/ ctx[1][/*i*/ ctx[17] + 1].index) + "";
		let t;

		return {
			c() {
				t = text(t_value);
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*content, matches*/ 3 && t_value !== (t_value = /*content*/ ctx[0].substring(/*match*/ ctx[15].index + /*match*/ ctx[15][0].length, /*matches*/ ctx[1][/*i*/ ctx[17] + 1].index) + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (39:8) {#each matches as match, i}
	function create_each_block$b(ctx) {
		let span;
		let t_value = /*match*/ ctx[15][0] + "";
		let t;
		let if_block1_anchor;
		let if_block0 = /*i*/ ctx[17] == 0 && create_if_block_3$1(ctx);

		function select_block_type_2(ctx, dirty) {
			if (/*i*/ ctx[17] < /*matches*/ ctx[1].length - 1) return create_if_block_2$1;
			return create_else_block_2;
		}

		let current_block_type = select_block_type_2(ctx);
		let if_block1 = current_block_type(ctx);

		return {
			c() {
				if (if_block0) if_block0.c();
				span = element("span");
				t = text(t_value);
				if_block1.c();
				if_block1_anchor = empty();
				attr(span, "class", "bg-info");
			},
			m(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, span, anchor);
				append(span, t);
				if_block1.m(target, anchor);
				insert(target, if_block1_anchor, anchor);
			},
			p(ctx, dirty) {
				if (/*i*/ ctx[17] == 0) if_block0.p(ctx, dirty);
				if (dirty & /*matches*/ 2 && t_value !== (t_value = /*match*/ ctx[15][0] + "")) set_data(t, t_value);

				if (current_block_type === (current_block_type = select_block_type_2(ctx)) && if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type(ctx);

					if (if_block1) {
						if_block1.c();
						if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
					}
				}
			},
			d(detaching) {
				if (detaching) {
					detach(span);
					detach(if_block1_anchor);
				}

				if (if_block0) if_block0.d(detaching);
				if_block1.d(detaching);
			}
		};
	}

	function create_fragment$r(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$d, create_else_block$b];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*active*/ ctx[2]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};
	}

	function instance$r($$self, $$props, $$invalidate) {
		let regexp;
		let matches;
		let firstFragment;
		let lastFragment;
		let { $$slots: slots = {}, $$scope } = $$props;
		let { content = '' } = $$props;
		let { highlight = '' } = $$props;
		let active = false;
		let control;

		function resizeInput() {
			if (control) $$invalidate(3, control.style.height = `${control.scrollHeight + 2}px`, control);
		}

		afterUpdate(() => {
			if (active) control.focus();
		});

		function textarea_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				control = $$value;
				$$invalidate(3, control);
			});
		}

		function textarea_input_handler() {
			content = this.value;
			$$invalidate(0, content);
		}

		const blur_handler = () => $$invalidate(2, active = false);
		const click_handler = () => $$invalidate(2, active = true);

		$$self.$$set = $$props => {
			if ('content' in $$props) $$invalidate(0, content = $$props.content);
			if ('highlight' in $$props) $$invalidate(7, highlight = $$props.highlight);
			if ('$$scope' in $$props) $$invalidate(9, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*highlight*/ 128) {
				$$invalidate(8, regexp = new RegExp(highlight, 'gi'));
			}

			if ($$self.$$.dirty & /*content, regexp*/ 257) {
				$$invalidate(1, matches = [...content.matchAll(regexp)]);
			}

			if ($$self.$$.dirty & /*matches, content*/ 3) {
				$$invalidate(5, firstFragment = matches.length == 0
				? ''
				: content.substring(0, matches[0].index));
			}

			if ($$self.$$.dirty & /*matches, content*/ 3) {
				$$invalidate(4, lastFragment = matches.length == 0
				? ''
				: content.substring(matches[matches.length - 1].index + matches[matches.length - 1][0].length));
			}
		};

		return [
			content,
			matches,
			active,
			control,
			lastFragment,
			firstFragment,
			resizeInput,
			highlight,
			regexp,
			$$scope,
			slots,
			textarea_binding,
			textarea_input_handler,
			blur_handler,
			click_handler
		];
	}

	class TextArea extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$r, create_fragment$r, safe_not_equal, { content: 0, highlight: 7 });
		}
	}

	/* src\components\AppPower.svelte generated by Svelte v4.2.19 */

	function create_else_block$a(ctx) {
		let button;
		let t_value = /*app*/ ctx[0].name + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "btn btn-light border text-left flex-grow-1");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_1*/ ctx[5]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*app*/ 1 && t_value !== (t_value = /*app*/ ctx[0].name + "")) set_data(t, t_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (10:4) {#if isEditing}
	function create_if_block$c(ctx) {
		let div0;
		let input;
		let t0;
		let button;
		let t2;
		let div1;
		let textarea;
		let updating_content;
		let current;
		let mounted;
		let dispose;

		function textarea_content_binding(value) {
			/*textarea_content_binding*/ ctx[4](value);
		}

		let textarea_props = {};

		if (/*app*/ ctx[0].description !== void 0) {
			textarea_props.content = /*app*/ ctx[0].description;
		}

		textarea = new TextArea({ props: textarea_props });
		binding_callbacks.push(() => bind(textarea, 'content', textarea_content_binding));

		return {
			c() {
				div0 = element("div");
				input = element("input");
				t0 = space();
				button = element("button");
				button.textContent = "Close";
				t2 = space();
				div1 = element("div");
				create_component(textarea.$$.fragment);
				attr(input, "class", "flex-grow-1 form-control");
				attr(button, "class", "btn btn-light border");
				attr(div0, "class", "d-flex flex-grow-1");
				attr(div1, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div0, anchor);
				append(div0, input);
				set_input_value(input, /*app*/ ctx[0].name);
				append(div0, t0);
				append(div0, button);
				insert(target, t2, anchor);
				insert(target, div1, anchor);
				mount_component(textarea, div1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[2]),
						listen(button, "click", /*click_handler*/ ctx[3])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*app*/ 1 && input.value !== /*app*/ ctx[0].name) {
					set_input_value(input, /*app*/ ctx[0].name);
				}

				const textarea_changes = {};

				if (!updating_content && dirty & /*app*/ 1) {
					updating_content = true;
					textarea_changes.content = /*app*/ ctx[0].description;
					add_flush_callback(() => updating_content = false);
				}

				textarea.$set(textarea_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textarea.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textarea.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div0);
					detach(t2);
					detach(div1);
				}

				destroy_component(textarea);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$q(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$c, create_else_block$a];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "class", "d-flex flex-column flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	function instance$q($$self, $$props, $$invalidate) {
		let { app } = $$props;
		let isEditing;

		function input_input_handler() {
			app.name = this.value;
			$$invalidate(0, app);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);

		function textarea_content_binding(value) {
			if ($$self.$$.not_equal(app.description, value)) {
				app.description = value;
				$$invalidate(0, app);
			}
		}

		const click_handler_1 = () => $$invalidate(1, isEditing = true);

		$$self.$$set = $$props => {
			if ('app' in $$props) $$invalidate(0, app = $$props.app);
		};

		return [
			app,
			isEditing,
			input_input_handler,
			click_handler,
			textarea_content_binding,
			click_handler_1
		];
	}

	class AppPower extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$q, create_fragment$q, safe_not_equal, { app: 0 });
		}
	}

	/* src\components\ListItem.svelte generated by Svelte v4.2.19 */

	function create_fragment$p(ctx) {
		let div3;
		let div0;
		let t0;
		let div2;
		let div1;
		let button0;
		let t2;
		let button1;
		let t4;
		let button2;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[4].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

		return {
			c() {
				div3 = element("div");
				div0 = element("div");
				if (default_slot) default_slot.c();
				t0 = space();
				div2 = element("div");
				div1 = element("div");
				button0 = element("button");
				button0.textContent = "↑";
				t2 = space();
				button1 = element("button");
				button1.textContent = "↓";
				t4 = space();
				button2 = element("button");
				button2.textContent = "Delete";
				attr(div0, "class", "flex-grow-1 d-flex mr-1");
				attr(button0, "class", "btn btn-light border-dark");
				attr(button1, "class", "btn btn-light border-dark");
				attr(div1, "class", "btn-group");
				attr(button2, "class", "btn btn-danger");
				attr(div2, "class", "align-self-start ml-auto");
				attr(div3, "class", "d-flex m-1 align-self-start");
			},
			m(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);

				if (default_slot) {
					default_slot.m(div0, null);
				}

				append(div3, t0);
				append(div3, div2);
				append(div2, div1);
				append(div1, button0);
				append(div1, t2);
				append(div1, button1);
				append(div2, t4);
				append(div2, button2);
				current = true;

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[5]),
						listen(button1, "click", /*click_handler_1*/ ctx[6]),
						listen(button2, "click", /*click_handler_2*/ ctx[7])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[3],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
							null
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div3);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$p($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		let { move } = $$props;
		let { remove } = $$props;
		let { item } = $$props;
		const click_handler = () => move(-1, item);
		const click_handler_1 = () => move(1, item);
		const click_handler_2 = () => remove(item);

		$$self.$$set = $$props => {
			if ('move' in $$props) $$invalidate(0, move = $$props.move);
			if ('remove' in $$props) $$invalidate(1, remove = $$props.remove);
			if ('item' in $$props) $$invalidate(2, item = $$props.item);
			if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
		};

		return [
			move,
			remove,
			item,
			$$scope,
			slots,
			click_handler,
			click_handler_1,
			click_handler_2
		];
	}

	class ListItem extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$p, create_fragment$p, safe_not_equal, { move: 0, remove: 1, item: 2 });
		}
	}

	/* src\components\Apps.svelte generated by Svelte v4.2.19 */

	function get_each_context$a(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	// (35:4) <ListItem item={app} {move} {remove}>
	function create_default_slot$8(ctx) {
		let apppower;
		let t;
		let current;
		apppower = new AppPower({ props: { app: /*app*/ ctx[4] } });

		return {
			c() {
				create_component(apppower.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(apppower, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const apppower_changes = {};
				if (dirty & /*model*/ 1) apppower_changes.app = /*app*/ ctx[4];
				apppower.$set(apppower_changes);
			},
			i(local) {
				if (current) return;
				transition_in(apppower.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(apppower.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(apppower, detaching);
			}
		};
	}

	// (34:0) {#each model.apps as app}
	function create_each_block$a(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*app*/ ctx[4],
					move: /*move*/ ctx[2],
					remove: /*remove*/ ctx[3],
					$$slots: { default: [create_default_slot$8] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*app*/ ctx[4];

				if (dirty & /*$$scope, model*/ 129) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$o(ctx) {
		let button;
		let t1;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].apps);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$a(get_each_context$a(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				button = element("button");
				button.textContent = "Add";
				t1 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "btn btn-dark");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				insert(target, t1, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*add*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, move, remove*/ 13) {
					each_value = ensure_array_like(/*model*/ ctx[0].apps);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$a(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$a(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(button);
					detach(t1);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$o($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function add() {
			model.apps.push(app$1());
			$$invalidate(0, model);
		}

		function move(n, item) {
			let index = model.apps.indexOf(item);
			model.apps.splice(index, 1);
			index += n;
			if (index < 0) index = model.apps.length; else if (index > model.apps.length) index = 0;
			model.apps.splice(index, 0, item);
			$$invalidate(0, model);
		}

		function remove(item) {
			let index = model.apps.indexOf(item);
			model.apps.splice(index, 1);
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [model, add, move, remove];
	}

	class Apps extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$o, create_fragment$o, safe_not_equal, { model: 0 });
		}
	}

	/* src\components\TextInput.svelte generated by Svelte v4.2.19 */

	function create_else_block$9(ctx) {
		let div;
		let span;
		let t0;
		let button;
		let t1;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[4].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

		return {
			c() {
				div = element("div");
				span = element("span");
				if (default_slot) default_slot.c();
				t0 = space();
				button = element("button");
				t1 = text(/*content*/ ctx[0]);
				attr(span, "class", "align-self-center text-right border-right pr-1 py-2 font-weight-bold");
				set_style(span, "width", "5.5em");
				attr(button, "class", "flex-grow-1 btn btn-light text-left");
				attr(div, "class", "d-flex mb-1 border-bottom");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);

				if (default_slot) {
					default_slot.m(span, null);
				}

				append(div, t0);
				append(div, button);
				append(button, t1);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler*/ ctx[8]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[3],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
							null
						);
					}
				}

				if (!current || dirty & /*content*/ 1) set_data(t1, /*content*/ ctx[0]);
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	// (14:0) {#if active}
	function create_if_block$b(ctx) {
		let div;
		let span;
		let t;
		let input;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[4].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

		return {
			c() {
				div = element("div");
				span = element("span");
				if (default_slot) default_slot.c();
				t = space();
				input = element("input");
				attr(span, "class", "align-self-center text-right mr-1 py-2 font-weight-bold");
				set_style(span, "width", "5.5em");
				set_style(span, "height", "2.5em");
				attr(input, "class", "flex-grow-1 form-control");
				attr(div, "class", "d-flex mb-1 border-bottom");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);

				if (default_slot) {
					default_slot.m(span, null);
				}

				append(div, t);
				append(div, input);
				/*input_binding*/ ctx[5](input);
				set_input_value(input, /*content*/ ctx[0]);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[6]),
						listen(input, "blur", /*blur_handler*/ ctx[7])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[3],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
							null
						);
					}
				}

				if (dirty & /*content*/ 1 && input.value !== /*content*/ ctx[0]) {
					set_input_value(input, /*content*/ ctx[0]);
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (default_slot) default_slot.d(detaching);
				/*input_binding*/ ctx[5](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$n(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$b, create_else_block$9];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*active*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};
	}

	function instance$n($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		let { content = '' } = $$props;
		let active = false;
		let control;

		afterUpdate(() => {
			if (active) control.focus();
		});

		function input_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				control = $$value;
				$$invalidate(2, control);
			});
		}

		function input_input_handler() {
			content = this.value;
			$$invalidate(0, content);
		}

		const blur_handler = () => $$invalidate(1, active = false);
		const click_handler = () => $$invalidate(1, active = true);

		$$self.$$set = $$props => {
			if ('content' in $$props) $$invalidate(0, content = $$props.content);
			if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
		};

		return [
			content,
			active,
			control,
			$$scope,
			slots,
			input_binding,
			input_input_handler,
			blur_handler,
			click_handler
		];
	}

	class TextInput extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$n, create_fragment$n, safe_not_equal, { content: 0 });
		}
	}

	/* src\components\Bio.svelte generated by Svelte v4.2.19 */

	function create_default_slot_4$2(ctx) {
		let t;

		return {
			c() {
				t = text("Name");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (10:0) <TextInput bind:content={model.className}>
	function create_default_slot_3$2(ctx) {
		let t;

		return {
			c() {
				t = text("Class");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (11:0) <TextInput bind:content={model.creds}>
	function create_default_slot_2$2(ctx) {
		let t;

		return {
			c() {
				t = text("Credits");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (12:0) <TextInput bind:content={model.debt}>
	function create_default_slot_1$2(ctx) {
		let t;

		return {
			c() {
				t = text("Debt");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (14:0) <TextArea bind:content={model.info}>
	function create_default_slot$7(ctx) {
		let t;

		return {
			c() {
				t = text("Info");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	function create_fragment$m(ctx) {
		let textinput0;
		let updating_content;
		let t0;
		let textinput1;
		let updating_content_1;
		let t1;
		let textinput2;
		let updating_content_2;
		let t2;
		let textinput3;
		let updating_content_3;
		let t3;
		let hr;
		let t4;
		let textarea;
		let updating_content_4;
		let current;

		function textinput0_content_binding(value) {
			/*textinput0_content_binding*/ ctx[1](value);
		}

		let textinput0_props = {
			$$slots: { default: [create_default_slot_4$2] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].name !== void 0) {
			textinput0_props.content = /*model*/ ctx[0].name;
		}

		textinput0 = new TextInput({ props: textinput0_props });
		binding_callbacks.push(() => bind(textinput0, 'content', textinput0_content_binding));

		function textinput1_content_binding(value) {
			/*textinput1_content_binding*/ ctx[2](value);
		}

		let textinput1_props = {
			$$slots: { default: [create_default_slot_3$2] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].className !== void 0) {
			textinput1_props.content = /*model*/ ctx[0].className;
		}

		textinput1 = new TextInput({ props: textinput1_props });
		binding_callbacks.push(() => bind(textinput1, 'content', textinput1_content_binding));

		function textinput2_content_binding(value) {
			/*textinput2_content_binding*/ ctx[3](value);
		}

		let textinput2_props = {
			$$slots: { default: [create_default_slot_2$2] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].creds !== void 0) {
			textinput2_props.content = /*model*/ ctx[0].creds;
		}

		textinput2 = new TextInput({ props: textinput2_props });
		binding_callbacks.push(() => bind(textinput2, 'content', textinput2_content_binding));

		function textinput3_content_binding(value) {
			/*textinput3_content_binding*/ ctx[4](value);
		}

		let textinput3_props = {
			$$slots: { default: [create_default_slot_1$2] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].debt !== void 0) {
			textinput3_props.content = /*model*/ ctx[0].debt;
		}

		textinput3 = new TextInput({ props: textinput3_props });
		binding_callbacks.push(() => bind(textinput3, 'content', textinput3_content_binding));

		function textarea_content_binding(value) {
			/*textarea_content_binding*/ ctx[5](value);
		}

		let textarea_props = {
			$$slots: { default: [create_default_slot$7] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].info !== void 0) {
			textarea_props.content = /*model*/ ctx[0].info;
		}

		textarea = new TextArea({ props: textarea_props });
		binding_callbacks.push(() => bind(textarea, 'content', textarea_content_binding));

		return {
			c() {
				create_component(textinput0.$$.fragment);
				t0 = space();
				create_component(textinput1.$$.fragment);
				t1 = space();
				create_component(textinput2.$$.fragment);
				t2 = space();
				create_component(textinput3.$$.fragment);
				t3 = space();
				hr = element("hr");
				t4 = space();
				create_component(textarea.$$.fragment);
			},
			m(target, anchor) {
				mount_component(textinput0, target, anchor);
				insert(target, t0, anchor);
				mount_component(textinput1, target, anchor);
				insert(target, t1, anchor);
				mount_component(textinput2, target, anchor);
				insert(target, t2, anchor);
				mount_component(textinput3, target, anchor);
				insert(target, t3, anchor);
				insert(target, hr, anchor);
				insert(target, t4, anchor);
				mount_component(textarea, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const textinput0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					textinput0_changes.$$scope = { dirty, ctx };
				}

				if (!updating_content && dirty & /*model*/ 1) {
					updating_content = true;
					textinput0_changes.content = /*model*/ ctx[0].name;
					add_flush_callback(() => updating_content = false);
				}

				textinput0.$set(textinput0_changes);
				const textinput1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					textinput1_changes.$$scope = { dirty, ctx };
				}

				if (!updating_content_1 && dirty & /*model*/ 1) {
					updating_content_1 = true;
					textinput1_changes.content = /*model*/ ctx[0].className;
					add_flush_callback(() => updating_content_1 = false);
				}

				textinput1.$set(textinput1_changes);
				const textinput2_changes = {};

				if (dirty & /*$$scope*/ 64) {
					textinput2_changes.$$scope = { dirty, ctx };
				}

				if (!updating_content_2 && dirty & /*model*/ 1) {
					updating_content_2 = true;
					textinput2_changes.content = /*model*/ ctx[0].creds;
					add_flush_callback(() => updating_content_2 = false);
				}

				textinput2.$set(textinput2_changes);
				const textinput3_changes = {};

				if (dirty & /*$$scope*/ 64) {
					textinput3_changes.$$scope = { dirty, ctx };
				}

				if (!updating_content_3 && dirty & /*model*/ 1) {
					updating_content_3 = true;
					textinput3_changes.content = /*model*/ ctx[0].debt;
					add_flush_callback(() => updating_content_3 = false);
				}

				textinput3.$set(textinput3_changes);
				const textarea_changes = {};

				if (dirty & /*$$scope*/ 64) {
					textarea_changes.$$scope = { dirty, ctx };
				}

				if (!updating_content_4 && dirty & /*model*/ 1) {
					updating_content_4 = true;
					textarea_changes.content = /*model*/ ctx[0].info;
					add_flush_callback(() => updating_content_4 = false);
				}

				textarea.$set(textarea_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textinput0.$$.fragment, local);
				transition_in(textinput1.$$.fragment, local);
				transition_in(textinput2.$$.fragment, local);
				transition_in(textinput3.$$.fragment, local);
				transition_in(textarea.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textinput0.$$.fragment, local);
				transition_out(textinput1.$$.fragment, local);
				transition_out(textinput2.$$.fragment, local);
				transition_out(textinput3.$$.fragment, local);
				transition_out(textarea.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(t2);
					detach(t3);
					detach(hr);
					detach(t4);
				}

				destroy_component(textinput0, detaching);
				destroy_component(textinput1, detaching);
				destroy_component(textinput2, detaching);
				destroy_component(textinput3, detaching);
				destroy_component(textarea, detaching);
			}
		};
	}

	function instance$m($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function textinput0_content_binding(value) {
			if ($$self.$$.not_equal(model.name, value)) {
				model.name = value;
				$$invalidate(0, model);
			}
		}

		function textinput1_content_binding(value) {
			if ($$self.$$.not_equal(model.className, value)) {
				model.className = value;
				$$invalidate(0, model);
			}
		}

		function textinput2_content_binding(value) {
			if ($$self.$$.not_equal(model.creds, value)) {
				model.creds = value;
				$$invalidate(0, model);
			}
		}

		function textinput3_content_binding(value) {
			if ($$self.$$.not_equal(model.debt, value)) {
				model.debt = value;
				$$invalidate(0, model);
			}
		}

		function textarea_content_binding(value) {
			if ($$self.$$.not_equal(model.info, value)) {
				model.info = value;
				$$invalidate(0, model);
			}
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [
			model,
			textinput0_content_binding,
			textinput1_content_binding,
			textinput2_content_binding,
			textinput3_content_binding,
			textarea_content_binding
		];
	}

	class Bio extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$m, create_fragment$m, safe_not_equal, { model: 0 });
		}
	}

	/* src\components\Details.svelte generated by Svelte v4.2.19 */

	function create_if_block$a(ctx) {
		let div2;
		let div1;
		let div0;
		let current;
		const default_slot_template = /*#slots*/ ctx[3].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

		return {
			c() {
				div2 = element("div");
				div1 = element("div");
				div0 = element("div");
				if (default_slot) default_slot.c();
				attr(div0, "class", "card-body");
				attr(div1, "class", "card");
				attr(div2, "class", "container-fluid m-0 p-0");
			},
			m(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div1);
				append(div1, div0);

				if (default_slot) {
					default_slot.m(div0, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[2],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
							null
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div2);
				}

				if (default_slot) default_slot.d(detaching);
			}
		};
	}

	function create_fragment$l(ctx) {
		let div;
		let button;
		let t0;
		let t1;
		let current;
		let mounted;
		let dispose;
		let if_block = /*open*/ ctx[0] && create_if_block$a(ctx);

		return {
			c() {
				div = element("div");
				button = element("button");
				t0 = text(/*title*/ ctx[1]);
				t1 = space();
				if (if_block) if_block.c();
				attr(button, "class", "btn btn-light border w-100 text-left align-top");
				attr(div, "class", "col-lg-6 col-12 p-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, button);
				append(button, t0);
				append(div, t1);
				if (if_block) if_block.m(div, null);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler*/ ctx[4]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*title*/ 2) set_data(t0, /*title*/ ctx[1]);

				if (/*open*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*open*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$a(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (if_block) if_block.d();
				mounted = false;
				dispose();
			}
		};
	}

	function instance$l($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		let { title } = $$props;
		let { open = false } = $$props;
		const click_handler = () => $$invalidate(0, open = !open);

		$$self.$$set = $$props => {
			if ('title' in $$props) $$invalidate(1, title = $$props.title);
			if ('open' in $$props) $$invalidate(0, open = $$props.open);
			if ('$$scope' in $$props) $$invalidate(2, $$scope = $$props.$$scope);
		};

		return [open, title, $$scope, slots, click_handler];
	}

	class Details extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$l, create_fragment$l, safe_not_equal, { title: 1, open: 0 });
		}
	}

	/* src\components\Armor.svelte generated by Svelte v4.2.19 */

	function get_each_context$9(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[8] = list[i];
		return child_ctx;
	}

	// (21:4) {:else}
	function create_else_block$8(ctx) {
		let button0;
		let t0_value = /*model*/ ctx[0].armor + "";
		let t0;
		let t1;
		let button1;
		let t2_value = /*model*/ ctx[0].armorValue + "";
		let t2;
		let mounted;
		let dispose;

		return {
			c() {
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				button1 = element("button");
				t2 = text(t2_value);
				attr(button0, "class", "btn btn-light border text-left flex-grow-1");
				attr(button1, "class", "btn btn-light border text-left ml-1");
			},
			m(target, anchor) {
				insert(target, button0, anchor);
				append(button0, t0);
				insert(target, t1, anchor);
				insert(target, button1, anchor);
				append(button1, t2);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler_1*/ ctx[6]),
						listen(button1, "click", /*click_handler_2*/ ctx[7])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*model*/ 1 && t0_value !== (t0_value = /*model*/ ctx[0].armor + "")) set_data(t0, t0_value);
				if (dirty & /*model*/ 1 && t2_value !== (t2_value = /*model*/ ctx[0].armorValue + "")) set_data(t2, t2_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button0);
					detach(t1);
					detach(button1);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (11:4) {#if isEditingArmor}
	function create_if_block$9(ctx) {
		let input;
		let t0;
		let div;
		let select;
		let t1;
		let button;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*armorValues*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$9(get_each_context$9(ctx, each_value, i));
		}

		return {
			c() {
				input = element("input");
				t0 = space();
				div = element("div");
				select = element("select");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				button = element("button");
				button.textContent = "Done";
				attr(input, "class", "form-control flex-grow-1");
				attr(select, "class", "form-control");
				if (/*model*/ ctx[0].armorValue === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
				attr(div, "class", "pl-1 pr-1");
				attr(button, "class", "btn btn-light ml-1 border-dark");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*model*/ ctx[0].armor);
				insert(target, t0, anchor);
				insert(target, div, anchor);
				append(div, select);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select, null);
					}
				}

				select_option(select, /*model*/ ctx[0].armorValue, true);
				insert(target, t1, anchor);
				insert(target, button, anchor);

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[3]),
						listen(select, "change", /*select_change_handler*/ ctx[4]),
						listen(button, "click", /*click_handler*/ ctx[5])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*model, armorValues*/ 5 && input.value !== /*model*/ ctx[0].armor) {
					set_input_value(input, /*model*/ ctx[0].armor);
				}

				if (dirty & /*armorValues*/ 4) {
					each_value = ensure_array_like(/*armorValues*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$9(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$9(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*model, armorValues*/ 5) {
					select_option(select, /*model*/ ctx[0].armorValue);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
					detach(t0);
					detach(div);
					detach(t1);
					detach(button);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (15:16) {#each armorValues as a}
	function create_each_block$9(ctx) {
		let option;
		let t_value = /*a*/ ctx[8] + "";
		let t;

		return {
			c() {
				option = element("option");
				t = text(t_value);
				option.__value = /*a*/ ctx[8];
				set_input_value(option, option.__value);
			},
			m(target, anchor) {
				insert(target, option, anchor);
				append(option, t);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(option);
				}
			}
		};
	}

	function create_fragment$k(ctx) {
		let span;
		let t1;
		let div;

		function select_block_type(ctx, dirty) {
			if (/*isEditingArmor*/ ctx[1]) return create_if_block$9;
			return create_else_block$8;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				span = element("span");
				span.textContent = "Armor";
				t1 = space();
				div = element("div");
				if_block.c();
				attr(div, "class", "d-flex mb-1");
			},
			m(target, anchor) {
				insert(target, span, anchor);
				insert(target, t1, anchor);
				insert(target, div, anchor);
				if_block.m(div, null);
			},
			p(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div, null);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(span);
					detach(t1);
					detach(div);
				}

				if_block.d();
			}
		};
	}

	function instance$k($$self, $$props, $$invalidate) {
		let { model } = $$props;
		const armorValues = ['-', '-d2', '-d4', '-d6', '-d8'];
		let isEditingArmor;

		function input_input_handler() {
			model.armor = this.value;
			$$invalidate(0, model);
			$$invalidate(2, armorValues);
		}

		function select_change_handler() {
			model.armorValue = select_value(this);
			$$invalidate(0, model);
			$$invalidate(2, armorValues);
		}

		const click_handler = () => $$invalidate(1, isEditingArmor = false);
		const click_handler_1 = () => $$invalidate(1, isEditingArmor = true);
		const click_handler_2 = () => $$invalidate(1, isEditingArmor = true);

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [
			model,
			isEditingArmor,
			armorValues,
			input_input_handler,
			select_change_handler,
			click_handler,
			click_handler_1,
			click_handler_2
		];
	}

	class Armor extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$k, create_fragment$k, safe_not_equal, { model: 0 });
		}
	}

	/* src\components\Item.svelte generated by Svelte v4.2.19 */

	function create_else_block$7(ctx) {
		let button0;
		let t0_value = /*item*/ ctx[0].name + "";
		let t0;
		let t1;
		let button1;
		let t2_value = /*item*/ ctx[0].size + "";
		let t2;
		let mounted;
		let dispose;

		return {
			c() {
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				button1 = element("button");
				t2 = text(t2_value);
				attr(button0, "class", "btn btn-light border text-left flex-grow-1");
				attr(button1, "class", "btn btn-dark border ml-1");
			},
			m(target, anchor) {
				insert(target, button0, anchor);
				append(button0, t0);
				insert(target, t1, anchor);
				insert(target, button1, anchor);
				append(button1, t2);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler_1*/ ctx[6]),
						listen(button1, "click", /*click_handler_2*/ ctx[7])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*item*/ 1 && t0_value !== (t0_value = /*item*/ ctx[0].name + "")) set_data(t0, t0_value);
				if (dirty & /*item*/ 1 && t2_value !== (t2_value = /*item*/ ctx[0].size + "")) set_data(t2, t2_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button0);
					detach(t1);
					detach(button1);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (7:0) {#if isEditing}
	function create_if_block$8(ctx) {
		let input0;
		let t0;
		let div;
		let input1;
		let t1;
		let button;
		let mounted;
		let dispose;

		return {
			c() {
				input0 = element("input");
				t0 = space();
				div = element("div");
				input1 = element("input");
				t1 = space();
				button = element("button");
				button.textContent = "Close";
				attr(input0, "class", "form-control flex-grow-1");
				attr(input1, "class", "form-control ml-1");
				attr(input1, "type", "number");
				attr(input1, "min", "0");
				attr(button, "class", "btn btn-light border-dark ml-1");
			},
			m(target, anchor) {
				insert(target, input0, anchor);
				set_input_value(input0, /*item*/ ctx[0].name);
				insert(target, t0, anchor);
				insert(target, div, anchor);
				append(div, input1);
				set_input_value(input1, /*item*/ ctx[0].size);
				insert(target, t1, anchor);
				insert(target, button, anchor);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[3]),
						listen(input1, "input", /*input1_input_handler*/ ctx[4]),
						listen(button, "click", /*click_handler*/ ctx[5])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*item*/ 1 && input0.value !== /*item*/ ctx[0].name) {
					set_input_value(input0, /*item*/ ctx[0].name);
				}

				if (dirty & /*item*/ 1 && to_number(input1.value) !== /*item*/ ctx[0].size) {
					set_input_value(input1, /*item*/ ctx[0].size);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input0);
					detach(t0);
					detach(div);
					detach(t1);
					detach(button);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$j(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return create_if_block$8;
			return create_else_block$7;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
			},
			p(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if_block.d(detaching);
			}
		};
	}

	function instance$j($$self, $$props, $$invalidate) {
		let { item } = $$props;
		let { isEditing } = $$props;
		let { update } = $$props;

		function input0_input_handler() {
			item.name = this.value;
			$$invalidate(0, item);
		}

		function input1_input_handler() {
			item.size = to_number(this.value);
			$$invalidate(0, item);
		}

		const click_handler = () => {
			$$invalidate(1, isEditing = false);
			update();
		};

		const click_handler_1 = () => $$invalidate(1, isEditing = true);
		const click_handler_2 = () => $$invalidate(1, isEditing = true);

		$$self.$$set = $$props => {
			if ('item' in $$props) $$invalidate(0, item = $$props.item);
			if ('isEditing' in $$props) $$invalidate(1, isEditing = $$props.isEditing);
			if ('update' in $$props) $$invalidate(2, update = $$props.update);
		};

		return [
			item,
			isEditing,
			update,
			input0_input_handler,
			input1_input_handler,
			click_handler,
			click_handler_1,
			click_handler_2
		];
	}

	class Item extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$j, create_fragment$j, safe_not_equal, { item: 0, isEditing: 1, update: 2 });
		}
	}

	var listActions = {
	    move: (collection, n, item) => {
	        let index = collection.indexOf(item);
	        collection.splice(index, 1);

	        index += n;
	        if (index < 0) index = collection.length;
	        else if (index > collection.length) index = 0;

	        collection.splice(index, 0, item);
	        collection = collection;
	    },
	    remove: (collection, item) => {
	        let index = collection.indexOf(item);
	        collection.splice(index, 1);
	        collection = collection;
	    }
	};

	/* src\components\Equipment.svelte generated by Svelte v4.2.19 */

	function get_each_context$8(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[6] = list[i];
		child_ctx[7] = list;
		child_ctx[8] = i;
		return child_ctx;
	}

	// (32:4) <ListItem item={item} move={moveEquipment} remove={removeEquipment}>
	function create_default_slot$6(ctx) {
		let item_1;
		let updating_item;
		let t;
		let current;

		function item_1_item_binding(value) {
			/*item_1_item_binding*/ ctx[5](value, /*item*/ ctx[6], /*each_value*/ ctx[7], /*item_index*/ ctx[8]);
		}

		let item_1_props = { update: /*update*/ ctx[1] };

		if (/*item*/ ctx[6] !== void 0) {
			item_1_props.item = /*item*/ ctx[6];
		}

		item_1 = new Item({ props: item_1_props });
		binding_callbacks.push(() => bind(item_1, 'item', item_1_item_binding));

		return {
			c() {
				create_component(item_1.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(item_1, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const item_1_changes = {};
				if (dirty & /*update*/ 2) item_1_changes.update = /*update*/ ctx[1];

				if (!updating_item && dirty & /*model*/ 1) {
					updating_item = true;
					item_1_changes.item = /*item*/ ctx[6];
					add_flush_callback(() => updating_item = false);
				}

				item_1.$set(item_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(item_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(item_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(item_1, detaching);
			}
		};
	}

	// (31:0) {#each model.equipment as item}
	function create_each_block$8(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*item*/ ctx[6],
					move: /*moveEquipment*/ ctx[3],
					remove: /*removeEquipment*/ ctx[4],
					$$slots: { default: [create_default_slot$6] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*item*/ ctx[6];

				if (dirty & /*$$scope, update, model*/ 515) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$i(ctx) {
		let div;
		let span;
		let t1;
		let button;
		let t3;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].equipment);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				div = element("div");
				span = element("span");
				span.textContent = "Equipment";
				t1 = space();
				button = element("button");
				button.textContent = "Add";
				t3 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "ml-auto btn btn-dark");
				attr(div, "class", "d-flex align-items-end");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(div, t1);
				append(div, button);
				insert(target, t3, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*addEquipment*/ ctx[2]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, moveEquipment, removeEquipment, update*/ 27) {
					each_value = ensure_array_like(/*model*/ ctx[0].equipment);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$8(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$8(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t3);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$i($$self, $$props, $$invalidate) {
		let { model } = $$props;
		let { update } = $$props;

		function addEquipment() {
			model.equipment.push({ name: '', size: 1 });
			$$invalidate(0, model);
			update();
		}

		function moveEquipment(n, item) {
			listActions.move(model.equipment, n, item);
			$$invalidate(0, model);
		}

		function removeEquipment(item) {
			listActions.remove(model.equipment, item);
			$$invalidate(0, model);
			update();
		}

		function item_1_item_binding(value, item, each_value, item_index) {
			each_value[item_index] = value;
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
			if ('update' in $$props) $$invalidate(1, update = $$props.update);
		};

		return [
			model,
			update,
			addEquipment,
			moveEquipment,
			removeEquipment,
			item_1_item_binding
		];
	}

	class Equipment extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$i, create_fragment$i, safe_not_equal, { model: 0, update: 1 });
		}
	}

	/* src\components\Weapon.svelte generated by Svelte v4.2.19 */

	function get_each_context$7(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[11] = list[i];
		return child_ctx;
	}

	// (23:8) {:else}
	function create_else_block_1$1(ctx) {
		let button;
		let t_value = /*weapon*/ ctx[0].name + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "flex-grow-1 btn btn-light text-left border");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_1*/ ctx[6]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*weapon*/ 1 && t_value !== (t_value = /*weapon*/ ctx[0].name + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (20:8) {#if isEditing}
	function create_if_block_4(ctx) {
		let input;
		let t0;
		let button;
		let mounted;
		let dispose;

		return {
			c() {
				input = element("input");
				t0 = space();
				button = element("button");
				button.textContent = "Close";
				attr(input, "class", "form-control flex-grow-1");
				attr(button, "class", "btn btn-light border-dark ml-auto");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*weapon*/ ctx[0].name);
				insert(target, t0, anchor);
				insert(target, button, anchor);

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[4]),
						listen(button, "click", /*click_handler*/ ctx[5])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*weapon, damage*/ 5 && input.value !== /*weapon*/ ctx[0].name) {
					set_input_value(input, /*weapon*/ ctx[0].name);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input);
					detach(t0);
					detach(button);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (51:8) {:else}
	function create_else_block$6(ctx) {
		let t0;
		let span;
		let t1_value = /*weapon*/ ctx[0].damage + "";
		let t1;
		let t2;
		let t3;
		let t4;
		let if_block2_anchor;
		let if_block0 = !/*weapon*/ ctx[0].melee && create_if_block_3(ctx);
		let if_block1 = /*weapon*/ ctx[0].automatic && !/*weapon*/ ctx[0].melee && create_if_block_2();
		let if_block2 = /*weapon*/ ctx[0].melee && create_if_block_1$2();

		return {
			c() {
				if (if_block0) if_block0.c();
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				t2 = text(" damage");
				t3 = space();
				if (if_block1) if_block1.c();
				t4 = space();
				if (if_block2) if_block2.c();
				if_block2_anchor = empty();
				attr(span, "class", "btn btn-dark badge ml-1");
			},
			m(target, anchor) {
				if (if_block0) if_block0.m(target, anchor);
				insert(target, t0, anchor);
				insert(target, span, anchor);
				append(span, t1);
				append(span, t2);
				insert(target, t3, anchor);
				if (if_block1) if_block1.m(target, anchor);
				insert(target, t4, anchor);
				if (if_block2) if_block2.m(target, anchor);
				insert(target, if_block2_anchor, anchor);
			},
			p(ctx, dirty) {
				if (!/*weapon*/ ctx[0].melee) {
					if (if_block0) {
						if_block0.p(ctx, dirty);
					} else {
						if_block0 = create_if_block_3(ctx);
						if_block0.c();
						if_block0.m(t0.parentNode, t0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (dirty & /*weapon*/ 1 && t1_value !== (t1_value = /*weapon*/ ctx[0].damage + "")) set_data(t1, t1_value);

				if (/*weapon*/ ctx[0].automatic && !/*weapon*/ ctx[0].melee) {
					if (if_block1) ; else {
						if_block1 = create_if_block_2();
						if_block1.c();
						if_block1.m(t4.parentNode, t4);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (/*weapon*/ ctx[0].melee) {
					if (if_block2) ; else {
						if_block2 = create_if_block_1$2();
						if_block2.c();
						if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
					}
				} else if (if_block2) {
					if_block2.d(1);
					if_block2 = null;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(span);
					detach(t3);
					detach(t4);
					detach(if_block2_anchor);
				}

				if (if_block0) if_block0.d(detaching);
				if (if_block1) if_block1.d(detaching);
				if (if_block2) if_block2.d(detaching);
			}
		};
	}

	// (28:8) {#if isEditing}
	function create_if_block$7(ctx) {
		let div0;
		let input0;
		let t0;
		let div1;
		let select;
		let t1;
		let div2;
		let label0;
		let input1;
		let t2;
		let span0;
		let t4;
		let div3;
		let label1;
		let input2;
		let t5;
		let span1;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*damage*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
		}

		return {
			c() {
				div0 = element("div");
				input0 = element("input");
				t0 = space();
				div1 = element("div");
				select = element("select");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				div2 = element("div");
				label0 = element("label");
				input1 = element("input");
				t2 = space();
				span0 = element("span");
				span0.textContent = "Auto";
				t4 = space();
				div3 = element("div");
				label1 = element("label");
				input2 = element("input");
				t5 = space();
				span1 = element("span");
				span1.textContent = "Melee";
				attr(input0, "type", "number");
				attr(input0, "min", 0);
				attr(input0, "class", "form-control");
				attr(div0, "class", "border-right d-flex");
				attr(select, "class", "form-control");
				if (/*weapon*/ ctx[0].damage === void 0) add_render_callback(() => /*select_change_handler*/ ctx[8].call(select));
				attr(div1, "class", "border-right d-flex ml-1");
				attr(input1, "type", "checkbox");
				attr(span0, "class", "ml-1 mr-1");
				attr(label0, "class", "align-self-center d-flex align-items-center m-0");
				attr(div2, "class", "border-right d-flex ml-1");
				attr(input2, "type", "checkbox");
				attr(span1, "class", "ml-1 mr-1");
				attr(label1, "class", "align-self-center d-flex align-items-center m-0");
				attr(div3, "class", "d-flex ml-1");
			},
			m(target, anchor) {
				insert(target, div0, anchor);
				append(div0, input0);
				set_input_value(input0, /*weapon*/ ctx[0].mags);
				insert(target, t0, anchor);
				insert(target, div1, anchor);
				append(div1, select);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select, null);
					}
				}

				select_option(select, /*weapon*/ ctx[0].damage, true);
				insert(target, t1, anchor);
				insert(target, div2, anchor);
				append(div2, label0);
				append(label0, input1);
				input1.checked = /*weapon*/ ctx[0].automatic;
				append(label0, t2);
				append(label0, span0);
				insert(target, t4, anchor);
				insert(target, div3, anchor);
				append(div3, label1);
				append(label1, input2);
				input2.checked = /*weapon*/ ctx[0].melee;
				append(label1, t5);
				append(label1, span1);

				if (!mounted) {
					dispose = [
						listen(input0, "input", /*input0_input_handler*/ ctx[7]),
						listen(select, "change", /*select_change_handler*/ ctx[8]),
						listen(input1, "change", /*input1_change_handler*/ ctx[9]),
						listen(input2, "change", /*input2_change_handler*/ ctx[10])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*weapon, damage*/ 5 && to_number(input0.value) !== /*weapon*/ ctx[0].mags) {
					set_input_value(input0, /*weapon*/ ctx[0].mags);
				}

				if (dirty & /*damage*/ 4) {
					each_value = ensure_array_like(/*damage*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$7(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$7(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*weapon, damage*/ 5) {
					select_option(select, /*weapon*/ ctx[0].damage);
				}

				if (dirty & /*weapon, damage*/ 5) {
					input1.checked = /*weapon*/ ctx[0].automatic;
				}

				if (dirty & /*weapon, damage*/ 5) {
					input2.checked = /*weapon*/ ctx[0].melee;
				}
			},
			d(detaching) {
				if (detaching) {
					detach(div0);
					detach(t0);
					detach(div1);
					detach(t1);
					detach(div2);
					detach(t4);
					detach(div3);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (52:12) {#if !weapon.melee}
	function create_if_block_3(ctx) {
		let button;
		let t0_value = /*weapon*/ ctx[0].mags + "";
		let t0;
		let t1;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t0 = text(t0_value);
				t1 = text(" mags");
				attr(button, "class", "btn btn-dark badge");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t0);
				append(button, t1);

				if (!mounted) {
					dispose = listen(button, "click", /*magsClick*/ ctx[3]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*weapon*/ 1 && t0_value !== (t0_value = /*weapon*/ ctx[0].mags + "")) set_data(t0, t0_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (54:12) {#if weapon.automatic && !weapon.melee}
	function create_if_block_2(ctx) {
		let span;

		return {
			c() {
				span = element("span");
				span.textContent = "auto";
				attr(span, "class", "btn btn-dark badge ml-1");
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(span);
				}
			}
		};
	}

	// (55:12) {#if weapon.melee}
	function create_if_block_1$2(ctx) {
		let span;

		return {
			c() {
				span = element("span");
				span.textContent = "melee";
				attr(span, "class", "btn btn-dark badge ml-1");
			},
			m(target, anchor) {
				insert(target, span, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(span);
				}
			}
		};
	}

	// (34:20) {#each damage as d}
	function create_each_block$7(ctx) {
		let option;
		let t_value = /*d*/ ctx[11] + "";
		let t;

		return {
			c() {
				option = element("option");
				t = text(t_value);
				option.__value = /*d*/ ctx[11];
				set_input_value(option, option.__value);
			},
			m(target, anchor) {
				insert(target, option, anchor);
				append(option, t);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(option);
				}
			}
		};
	}

	function create_fragment$h(ctx) {
		let div2;
		let div0;
		let t;
		let div1;

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return create_if_block_4;
			return create_else_block_1$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);

		function select_block_type_1(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return create_if_block$7;
			return create_else_block$6;
		}

		let current_block_type_1 = select_block_type_1(ctx);
		let if_block1 = current_block_type_1(ctx);

		return {
			c() {
				div2 = element("div");
				div0 = element("div");
				if_block0.c();
				t = space();
				div1 = element("div");
				if_block1.c();
				attr(div0, "class", "d-flex");
				attr(div1, "class", "d-flex mt-1");
				attr(div2, "class", "d-flex flex-column flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div2, anchor);
				append(div2, div0);
				if_block0.m(div0, null);
				append(div2, t);
				append(div2, div1);
				if_block1.m(div1, null);
			},
			p(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(ctx);

					if (if_block0) {
						if_block0.c();
						if_block0.m(div0, null);
					}
				}

				if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1.d(1);
					if_block1 = current_block_type_1(ctx);

					if (if_block1) {
						if_block1.c();
						if_block1.m(div1, null);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div2);
				}

				if_block0.d();
				if_block1.d();
			}
		};
	}

	function instance$h($$self, $$props, $$invalidate) {
		let { weapon } = $$props;
		const damage = ['1', 'd2', 'd3', 'd4', 'd6', 'd8', 'd10', 'd12'];

		function magsClick(e) {
			let value = e.shiftKey ? 1 : -1;
			$$invalidate(0, weapon.mags += value, weapon);
			if (weapon.mags < 0) $$invalidate(0, weapon.mags = 0, weapon);
		}

		let isEditing = false;
		if (!weapon.name) weapon.name = "New Weapon";
		if (weapon.mags == null) weapon.mags = 0;

		function input_input_handler() {
			weapon.name = this.value;
			$$invalidate(0, weapon);
			$$invalidate(2, damage);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);
		const click_handler_1 = () => $$invalidate(1, isEditing = true);

		function input0_input_handler() {
			weapon.mags = to_number(this.value);
			$$invalidate(0, weapon);
			$$invalidate(2, damage);
		}

		function select_change_handler() {
			weapon.damage = select_value(this);
			$$invalidate(0, weapon);
			$$invalidate(2, damage);
		}

		function input1_change_handler() {
			weapon.automatic = this.checked;
			$$invalidate(0, weapon);
			$$invalidate(2, damage);
		}

		function input2_change_handler() {
			weapon.melee = this.checked;
			$$invalidate(0, weapon);
			$$invalidate(2, damage);
		}

		$$self.$$set = $$props => {
			if ('weapon' in $$props) $$invalidate(0, weapon = $$props.weapon);
		};

		return [
			weapon,
			isEditing,
			damage,
			magsClick,
			input_input_handler,
			click_handler,
			click_handler_1,
			input0_input_handler,
			select_change_handler,
			input1_change_handler,
			input2_change_handler
		];
	}

	class Weapon extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$h, create_fragment$h, safe_not_equal, { weapon: 0 });
		}
	}

	const weapon = () => ({
	    name: '',
	    mags: 0,
	    damage: 'd4',
	    automatic: false,
	    melee: false,
	    notes: ''
	});

	/* src\components\Weapons.svelte generated by Svelte v4.2.19 */

	function get_each_context$6(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i];
		return child_ctx;
	}

	// (33:4) <ListItem item={weapon} move={moveWeapon} remove={removeWeapon}>
	function create_default_slot$5(ctx) {
		let weapon_1;
		let t;
		let current;
		weapon_1 = new Weapon({ props: { weapon: /*weapon*/ ctx[5] } });

		return {
			c() {
				create_component(weapon_1.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(weapon_1, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const weapon_1_changes = {};
				if (dirty & /*model*/ 1) weapon_1_changes.weapon = /*weapon*/ ctx[5];
				weapon_1.$set(weapon_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(weapon_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(weapon_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(weapon_1, detaching);
			}
		};
	}

	// (32:0) {#each model.weapons as weapon}
	function create_each_block$6(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*weapon*/ ctx[5],
					move: /*moveWeapon*/ ctx[2],
					remove: /*removeWeapon*/ ctx[3],
					$$slots: { default: [create_default_slot$5] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*weapon*/ ctx[5];

				if (dirty & /*$$scope, model*/ 257) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$g(ctx) {
		let div;
		let span;
		let t1;
		let button;
		let t3;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].weapons);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				div = element("div");
				span = element("span");
				span.textContent = "Weapons";
				t1 = space();
				button = element("button");
				button.textContent = "Add";
				t3 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "ml-auto btn btn-dark");
				attr(div, "class", "d-flex align-items-end");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(div, t1);
				append(div, button);
				insert(target, t3, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*addWeapon*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, moveWeapon, removeWeapon*/ 13) {
					each_value = ensure_array_like(/*model*/ ctx[0].weapons);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$6(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$6(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t3);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$g($$self, $$props, $$invalidate) {
		let { model } = $$props;
		let { update } = $$props;

		function addWeapon() {
			model.weapons.push(weapon());
			$$invalidate(0, model);
			update();
		}

		function moveWeapon(n, weapon) {
			listActions.move(model.weapons, n, weapon);
			$$invalidate(0, model);
		}

		function removeWeapon(weapon) {
			listActions.remove(model.weapons, weapon);
			$$invalidate(0, model);
			update();
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
			if ('update' in $$props) $$invalidate(4, update = $$props.update);
		};

		return [model, addWeapon, moveWeapon, removeWeapon, update];
	}

	class Weapons extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$g, create_fragment$g, safe_not_equal, { model: 0, update: 4 });
		}
	}

	/* src\components\Inventory.svelte generated by Svelte v4.2.19 */

	function create_fragment$f(ctx) {
		let div;
		let span;
		let t0;
		let t1;
		let t2_value = /*model*/ ctx[0].abilities.strength + 8 + "";
		let t2;
		let span_class_value;
		let t3;
		let armor;
		let t4;
		let hr0;
		let t5;
		let weapons;
		let t6;
		let hr1;
		let t7;
		let equipment;
		let current;
		armor = new Armor({ props: { model: /*model*/ ctx[0] } });

		weapons = new Weapons({
				props: {
					model: /*model*/ ctx[0],
					update: /*update*/ ctx[3]
				}
			});

		equipment = new Equipment({
				props: {
					model: /*model*/ ctx[0],
					update: /*update*/ ctx[3]
				}
			});

		return {
			c() {
				div = element("div");
				span = element("span");
				t0 = text(/*itemCount*/ ctx[1]);
				t1 = text(" / ");
				t2 = text(t2_value);
				t3 = space();
				create_component(armor.$$.fragment);
				t4 = space();
				hr0 = element("hr");
				t5 = space();
				create_component(weapons.$$.fragment);
				t6 = space();
				hr1 = element("hr");
				t7 = space();
				create_component(equipment.$$.fragment);
				attr(span, "class", span_class_value = "badge " + /*itemCountStyle*/ ctx[2]);
				attr(div, "class", "position-topright");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, span);
				append(span, t0);
				append(span, t1);
				append(span, t2);
				insert(target, t3, anchor);
				mount_component(armor, target, anchor);
				insert(target, t4, anchor);
				insert(target, hr0, anchor);
				insert(target, t5, anchor);
				mount_component(weapons, target, anchor);
				insert(target, t6, anchor);
				insert(target, hr1, anchor);
				insert(target, t7, anchor);
				mount_component(equipment, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*itemCount*/ 2) set_data(t0, /*itemCount*/ ctx[1]);
				if ((!current || dirty & /*model*/ 1) && t2_value !== (t2_value = /*model*/ ctx[0].abilities.strength + 8 + "")) set_data(t2, t2_value);

				if (!current || dirty & /*itemCountStyle*/ 4 && span_class_value !== (span_class_value = "badge " + /*itemCountStyle*/ ctx[2])) {
					attr(span, "class", span_class_value);
				}

				const armor_changes = {};
				if (dirty & /*model*/ 1) armor_changes.model = /*model*/ ctx[0];
				armor.$set(armor_changes);
				const weapons_changes = {};
				if (dirty & /*model*/ 1) weapons_changes.model = /*model*/ ctx[0];
				weapons.$set(weapons_changes);
				const equipment_changes = {};
				if (dirty & /*model*/ 1) equipment_changes.model = /*model*/ ctx[0];
				equipment.$set(equipment_changes);
			},
			i(local) {
				if (current) return;
				transition_in(armor.$$.fragment, local);
				transition_in(weapons.$$.fragment, local);
				transition_in(equipment.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(armor.$$.fragment, local);
				transition_out(weapons.$$.fragment, local);
				transition_out(equipment.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t3);
					detach(t4);
					detach(hr0);
					detach(t5);
					detach(t6);
					detach(hr1);
					detach(t7);
				}

				destroy_component(armor, detaching);
				destroy_component(weapons, detaching);
				destroy_component(equipment, detaching);
			}
		};
	}

	function instance$f($$self, $$props, $$invalidate) {
		let itemCount;
		let itemCountStyle;
		let { model } = $$props;

		model.equipment = model.equipment.map(i => {
			if (typeof i != 'string') return i;
			return { name: i, size: 1 };
		});

		function update() {
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*model*/ 1) {
				$$invalidate(1, itemCount = model.weapons.length + model.equipment.reduce((a, b) => a + b.size, 0));
			}

			if ($$self.$$.dirty & /*itemCount, model*/ 3) {
				$$invalidate(2, itemCountStyle = itemCount > (model.abilities.strength + 8) * 2
				? 'badge-danger'
				: itemCount > model.abilities.strength + 8
					? 'badge-warning'
					: 'badge-dark');
			}
		};

		return [model, itemCount, itemCountStyle, update];
	}

	class Inventory extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$f, create_fragment$f, safe_not_equal, { model: 0 });
		}
	}

	const infestation = () => ({
	    name: 'Infestation',
	    persistent: '',
	    trigger: ''
	});

	const nano = () => ({
	    name: 'Nano power',
	    description: '',
	    used: 0,
	    infestation: infestation()
	});

	/* src\components\Infestation.svelte generated by Svelte v4.2.19 */

	function create_else_block$5(ctx) {
		let button;
		let t_value = /*infestation*/ ctx[0].name + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "btn btn-light border text-left flex-grow-1");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_1*/ ctx[6]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*infestation*/ 1 && t_value !== (t_value = /*infestation*/ ctx[0].name + "")) set_data(t, t_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (10:4) {#if isEditing}
	function create_if_block$6(ctx) {
		let div0;
		let input;
		let t0;
		let button;
		let t2;
		let span0;
		let t4;
		let div1;
		let textarea0;
		let updating_content;
		let t5;
		let span1;
		let t7;
		let div2;
		let textarea1;
		let updating_content_1;
		let current;
		let mounted;
		let dispose;

		function textarea0_content_binding(value) {
			/*textarea0_content_binding*/ ctx[4](value);
		}

		let textarea0_props = {};

		if (/*infestation*/ ctx[0].persistent !== void 0) {
			textarea0_props.content = /*infestation*/ ctx[0].persistent;
		}

		textarea0 = new TextArea({ props: textarea0_props });
		binding_callbacks.push(() => bind(textarea0, 'content', textarea0_content_binding));

		function textarea1_content_binding(value) {
			/*textarea1_content_binding*/ ctx[5](value);
		}

		let textarea1_props = {};

		if (/*infestation*/ ctx[0].trigger !== void 0) {
			textarea1_props.content = /*infestation*/ ctx[0].trigger;
		}

		textarea1 = new TextArea({ props: textarea1_props });
		binding_callbacks.push(() => bind(textarea1, 'content', textarea1_content_binding));

		return {
			c() {
				div0 = element("div");
				input = element("input");
				t0 = space();
				button = element("button");
				button.textContent = "Close";
				t2 = space();
				span0 = element("span");
				span0.textContent = "Persistent";
				t4 = space();
				div1 = element("div");
				create_component(textarea0.$$.fragment);
				t5 = space();
				span1 = element("span");
				span1.textContent = "Trigger";
				t7 = space();
				div2 = element("div");
				create_component(textarea1.$$.fragment);
				attr(input, "class", "flex-grow-1 form-control");
				attr(button, "class", "btn btn-light border");
				attr(div0, "class", "d-flex flex-grow-1");
				attr(div1, "class", "d-flex");
				attr(div2, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div0, anchor);
				append(div0, input);
				set_input_value(input, /*infestation*/ ctx[0].name);
				append(div0, t0);
				append(div0, button);
				insert(target, t2, anchor);
				insert(target, span0, anchor);
				insert(target, t4, anchor);
				insert(target, div1, anchor);
				mount_component(textarea0, div1, null);
				insert(target, t5, anchor);
				insert(target, span1, anchor);
				insert(target, t7, anchor);
				insert(target, div2, anchor);
				mount_component(textarea1, div2, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[2]),
						listen(button, "click", /*click_handler*/ ctx[3])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*infestation*/ 1 && input.value !== /*infestation*/ ctx[0].name) {
					set_input_value(input, /*infestation*/ ctx[0].name);
				}

				const textarea0_changes = {};

				if (!updating_content && dirty & /*infestation*/ 1) {
					updating_content = true;
					textarea0_changes.content = /*infestation*/ ctx[0].persistent;
					add_flush_callback(() => updating_content = false);
				}

				textarea0.$set(textarea0_changes);
				const textarea1_changes = {};

				if (!updating_content_1 && dirty & /*infestation*/ 1) {
					updating_content_1 = true;
					textarea1_changes.content = /*infestation*/ ctx[0].trigger;
					add_flush_callback(() => updating_content_1 = false);
				}

				textarea1.$set(textarea1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textarea0.$$.fragment, local);
				transition_in(textarea1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textarea0.$$.fragment, local);
				transition_out(textarea1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div0);
					detach(t2);
					detach(span0);
					detach(t4);
					detach(div1);
					detach(t5);
					detach(span1);
					detach(t7);
					detach(div2);
				}

				destroy_component(textarea0);
				destroy_component(textarea1);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$e(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$6, create_else_block$5];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "class", "d-flex flex-column flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	function instance$e($$self, $$props, $$invalidate) {
		let { infestation } = $$props;
		let isEditing = false;

		function input_input_handler() {
			infestation.name = this.value;
			$$invalidate(0, infestation);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);

		function textarea0_content_binding(value) {
			if ($$self.$$.not_equal(infestation.persistent, value)) {
				infestation.persistent = value;
				$$invalidate(0, infestation);
			}
		}

		function textarea1_content_binding(value) {
			if ($$self.$$.not_equal(infestation.trigger, value)) {
				infestation.trigger = value;
				$$invalidate(0, infestation);
			}
		}

		const click_handler_1 = () => $$invalidate(1, isEditing = true);

		$$self.$$set = $$props => {
			if ('infestation' in $$props) $$invalidate(0, infestation = $$props.infestation);
		};

		return [
			infestation,
			isEditing,
			input_input_handler,
			click_handler,
			textarea0_content_binding,
			textarea1_content_binding,
			click_handler_1
		];
	}

	class Infestation extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$e, create_fragment$e, safe_not_equal, { infestation: 0 });
		}
	}

	/* src\components\NanoPower.svelte generated by Svelte v4.2.19 */

	function create_else_block$4(ctx) {
		let button0;
		let t0_value = /*nano*/ ctx[0].name + "";
		let t0;
		let t1;
		let button1;
		let t2_value = /*nano*/ ctx[0].used + "";
		let t2;
		let t3;
		let button2;
		let mounted;
		let dispose;

		return {
			c() {
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				button1 = element("button");
				t2 = text(t2_value);
				t3 = space();
				button2 = element("button");
				button2.textContent = "Reset";
				attr(button0, "class", "btn btn-light border text-left flex-grow-1");
				attr(button1, "class", "btn btn-dark ml-1");
				attr(button2, "class", "btn btn-light border ml-1");
			},
			m(target, anchor) {
				insert(target, button0, anchor);
				append(button0, t0);
				insert(target, t1, anchor);
				insert(target, button1, anchor);
				append(button1, t2);
				insert(target, t3, anchor);
				insert(target, button2, anchor);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler_2*/ ctx[7]),
						listen(button1, "click", /*handleUsed*/ ctx[2]),
						listen(button2, "click", /*click_handler_3*/ ctx[8])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*nano*/ 1 && t0_value !== (t0_value = /*nano*/ ctx[0].name + "")) set_data(t0, t0_value);
				if (dirty & /*nano*/ 1 && t2_value !== (t2_value = /*nano*/ ctx[0].used + "")) set_data(t2, t2_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(button0);
					detach(t1);
					detach(button1);
					detach(t3);
					detach(button2);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (18:4) {#if isEditing}
	function create_if_block$5(ctx) {
		let div3;
		let div0;
		let input;
		let t0;
		let button0;
		let t2;
		let button1;
		let t3_value = /*nano*/ ctx[0].used + "";
		let t3;
		let t4;
		let button2;
		let t6;
		let div1;
		let textarea;
		let updating_content;
		let t7;
		let span;
		let t9;
		let div2;
		let infestation_1;
		let current;
		let mounted;
		let dispose;

		function textarea_content_binding(value) {
			/*textarea_content_binding*/ ctx[6](value);
		}

		let textarea_props = {};

		if (/*nano*/ ctx[0].description !== void 0) {
			textarea_props.content = /*nano*/ ctx[0].description;
		}

		textarea = new TextArea({ props: textarea_props });
		binding_callbacks.push(() => bind(textarea, 'content', textarea_content_binding));

		infestation_1 = new Infestation({
				props: { infestation: /*nano*/ ctx[0].infestation }
			});

		return {
			c() {
				div3 = element("div");
				div0 = element("div");
				input = element("input");
				t0 = space();
				button0 = element("button");
				button0.textContent = "Close";
				t2 = space();
				button1 = element("button");
				t3 = text(t3_value);
				t4 = space();
				button2 = element("button");
				button2.textContent = "Reset";
				t6 = space();
				div1 = element("div");
				create_component(textarea.$$.fragment);
				t7 = space();
				span = element("span");
				span.textContent = "Linked Infestation";
				t9 = space();
				div2 = element("div");
				create_component(infestation_1.$$.fragment);
				attr(input, "class", "flex-grow-1 form-control");
				attr(button0, "class", "btn btn-light border");
				attr(button1, "class", "btn btn-dark ml-1");
				attr(button2, "class", "btn btn-light border ml-1");
				attr(div0, "class", "d-flex flex-grow-1");
				attr(div1, "class", "d-flex");
				attr(div2, "class", "pl-3");
				attr(div3, "class", "d-flex flex-column flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div3, anchor);
				append(div3, div0);
				append(div0, input);
				set_input_value(input, /*nano*/ ctx[0].name);
				append(div0, t0);
				append(div0, button0);
				append(div0, t2);
				append(div0, button1);
				append(button1, t3);
				append(div0, t4);
				append(div0, button2);
				append(div3, t6);
				append(div3, div1);
				mount_component(textarea, div1, null);
				append(div3, t7);
				append(div3, span);
				append(div3, t9);
				append(div3, div2);
				mount_component(infestation_1, div2, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[3]),
						listen(button0, "click", /*click_handler*/ ctx[4]),
						listen(button1, "click", /*handleUsed*/ ctx[2]),
						listen(button2, "click", /*click_handler_1*/ ctx[5])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*nano*/ 1 && input.value !== /*nano*/ ctx[0].name) {
					set_input_value(input, /*nano*/ ctx[0].name);
				}

				if ((!current || dirty & /*nano*/ 1) && t3_value !== (t3_value = /*nano*/ ctx[0].used + "")) set_data(t3, t3_value);
				const textarea_changes = {};

				if (!updating_content && dirty & /*nano*/ 1) {
					updating_content = true;
					textarea_changes.content = /*nano*/ ctx[0].description;
					add_flush_callback(() => updating_content = false);
				}

				textarea.$set(textarea_changes);
				const infestation_1_changes = {};
				if (dirty & /*nano*/ 1) infestation_1_changes.infestation = /*nano*/ ctx[0].infestation;
				infestation_1.$set(infestation_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textarea.$$.fragment, local);
				transition_in(infestation_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textarea.$$.fragment, local);
				transition_out(infestation_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div3);
				}

				destroy_component(textarea);
				destroy_component(infestation_1);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$d(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$5, create_else_block$4];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "class", "d-flex flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	function instance$d($$self, $$props, $$invalidate) {
		let { nano } = $$props;

		function handleUsed(e) {
			let value = e.shiftKey ? -1 : 1;
			$$invalidate(0, nano.used += value, nano);
			if (nano.used < 0) $$invalidate(0, nano.used = 0, nano);
		}

		let isEditing;

		function input_input_handler() {
			nano.name = this.value;
			$$invalidate(0, nano);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);
		const click_handler_1 = () => $$invalidate(0, nano.used = 0, nano);

		function textarea_content_binding(value) {
			if ($$self.$$.not_equal(nano.description, value)) {
				nano.description = value;
				$$invalidate(0, nano);
			}
		}

		const click_handler_2 = () => $$invalidate(1, isEditing = true);
		const click_handler_3 = () => $$invalidate(0, nano.used = 0, nano);

		$$self.$$set = $$props => {
			if ('nano' in $$props) $$invalidate(0, nano = $$props.nano);
		};

		return [
			nano,
			isEditing,
			handleUsed,
			input_input_handler,
			click_handler,
			click_handler_1,
			textarea_content_binding,
			click_handler_2,
			click_handler_3
		];
	}

	class NanoPower extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$d, create_fragment$d, safe_not_equal, { nano: 0 });
		}
	}

	/* src\components\Nano.svelte generated by Svelte v4.2.19 */

	function get_each_context$5(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	// (35:4) <ListItem item={n} {move} {remove}>
	function create_default_slot$4(ctx) {
		let nanopower;
		let t;
		let current;
		nanopower = new NanoPower({ props: { nano: /*n*/ ctx[4] } });

		return {
			c() {
				create_component(nanopower.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(nanopower, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const nanopower_changes = {};
				if (dirty & /*model*/ 1) nanopower_changes.nano = /*n*/ ctx[4];
				nanopower.$set(nanopower_changes);
			},
			i(local) {
				if (current) return;
				transition_in(nanopower.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(nanopower.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(nanopower, detaching);
			}
		};
	}

	// (34:0) {#each model.nano as n}
	function create_each_block$5(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*n*/ ctx[4],
					move: /*move*/ ctx[2],
					remove: /*remove*/ ctx[3],
					$$slots: { default: [create_default_slot$4] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*n*/ ctx[4];

				if (dirty & /*$$scope, model*/ 129) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$c(ctx) {
		let button;
		let t1;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].nano);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				button = element("button");
				button.textContent = "Add";
				t1 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "btn btn-dark");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				insert(target, t1, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*add*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, move, remove*/ 13) {
					each_value = ensure_array_like(/*model*/ ctx[0].nano);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$5(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$5(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(button);
					detach(t1);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$c($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function add() {
			model.nano.push(nano());
			$$invalidate(0, model);
		}

		function move(n, item) {
			let index = model.nano.indexOf(item);
			model.nano.splice(index, 1);
			index += n;
			if (index < 0) index = model.nano.length; else if (index > model.nano.length) index = 0;
			model.nano.splice(index, 0, item);
			$$invalidate(0, model);
		}

		function remove(item) {
			let index = model.nano.indexOf(item);
			model.nano.splice(index, 1);
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [model, add, move, remove];
	}

	class Nano extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$c, create_fragment$c, safe_not_equal, { model: 0 });
		}
	}

	const patch = (a, b) => {
	    for(let key in b) {
	        if(!a[key]) a[key] = b[key];
	        if(typeof(a[key]) == 'object') {
	            patch(a[key], b[key]);
	        }
	    }
	};

	var actions = {
	    delete: (model) => {
	        if(!confirm(`Delete ${model.name}?`)) return;

	        localStorage.removeItem(model.name);
	        return { success: `${model.name} deleted from character storage` };
	    },
	    deleteAll: () => {
	        if(!confirm('Delete all saved characters?')) return;

	        localStorage.clear();
	        return { success: 'All characters deleted from character storage' };
	    },
	    export: (model) => {
	        let href = URL.createObjectURL(new Blob([JSON.stringify(model)]));
	        let a = document.createElement('a');
	        a.href = href;
	        a.download = `${model.name}.cybrg`;
	        a.click();
	    },
	    import: (done) => {
	        let file = document.createElement('input');
	        file.type = 'file';
	        file.accept = '.cybrg';
	        file.onchange = (e) => {
	            e.target.files[0].text().then((t) => {
	                let key = JSON.parse(t).name;
	                localStorage.setItem(key, t);
	                done(`${key} added to character storage`);
	            });
	        };
	        file.click();
	    },
	    load: (model, key) => {
	        let name = key;
	        if(name == `${model.name}.cybrg`) return { model };

	        let alert = '';
	        if(model.name && confirm(`Save ${model.name} before changing characters?`)) {
	            localStorage.setItem(model.name, JSON.stringify(model));
	            alert += `${model.name} saved, `;
	        }

	        model = JSON.parse(localStorage.getItem(name));
	        
	        patch(model, character());
	        return { model, alert: { success: `${alert}${model.name} opened` }};
	    },
	    loadList: () => {
	        let characters = [...new Array(window.localStorage.length)].map((x,i) => window.localStorage.key(i));
	        characters = characters.filter(c => c.endsWith('.cybrg'));
	        characters.sort((a,b) => a.localeCompare(b));
	        return characters;
	    },
	    save: (model) => {
	        if(!model.name)
	            return { error: 'Cannot save an unnamed character' };

	        localStorage.setItem(`${model.name}.cybrg`, JSON.stringify(model));
	        return { success: `${model.name} saved` };
	    }
	};

	/* src\components\Navbar.svelte generated by Svelte v4.2.19 */

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[27] = list[i];
		return child_ctx;
	}

	// (101:20) {#each characters as character}
	function create_each_block$4(ctx) {
		let button;
		let t_value = /*character*/ ctx[27] + "";
		let t;
		let mounted;
		let dispose;

		function click_handler_1() {
			return /*click_handler_1*/ ctx[16](/*character*/ ctx[27]);
		}

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "dropdown-item");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = [
						listen(button, "blur", /*clearMenu*/ ctx[6]),
						listen(button, "click", click_handler_1)
					];

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*characters*/ 4 && t_value !== (t_value = /*character*/ ctx[27] + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (126:23) 
	function create_if_block_1$1(ctx) {
		let button;
		let strong;
		let t_value = /*alert*/ ctx[3].error + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				strong = element("strong");
				t = text(t_value);
				attr(button, "class", "alert alert-static alert-danger btn text-center w-100");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, strong);
				append(strong, t);
				/*button_binding_1*/ ctx[22](button);

				if (!mounted) {
					dispose = [
						listen(button, "blur", /*blur_handler_1*/ ctx[23]),
						listen(button, "click", /*click_handler_5*/ ctx[24])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*alert*/ 8 && t_value !== (t_value = /*alert*/ ctx[3].error + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				/*button_binding_1*/ ctx[22](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (122:0) {#if alert?.success}
	function create_if_block$4(ctx) {
		let button;
		let strong;
		let t_value = /*alert*/ ctx[3].success + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				strong = element("strong");
				t = text(t_value);
				attr(button, "class", "alert alert-static alert-success btn text-center w-100");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, strong);
				append(strong, t);
				/*button_binding*/ ctx[19](button);

				if (!mounted) {
					dispose = [
						listen(button, "blur", /*blur_handler*/ ctx[20]),
						listen(button, "click", /*click_handler_4*/ ctx[21])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*alert*/ 8 && t_value !== (t_value = /*alert*/ ctx[3].success + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				/*button_binding*/ ctx[19](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$b(ctx) {
		let nav;
		let button0;
		let t0;
		let div4;
		let ul;
		let li;
		let a;
		let t2;
		let div0;
		let div0_style_value;
		let t3;
		let div3;
		let div2;
		let button1;
		let t5;
		let div1;
		let button2;
		let t7;
		let button3;
		let t9;
		let button4;
		let t11;
		let button5;
		let t13;
		let button6;
		let t15;
		let button7;
		let div1_style_value;
		let t18;
		let if_block_anchor;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*characters*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
		}

		function select_block_type(ctx, dirty) {
			if (/*alert*/ ctx[3]?.success) return create_if_block$4;
			if (/*alert*/ ctx[3]?.error) return create_if_block_1$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		return {
			c() {
				nav = element("nav");
				button0 = element("button");
				button0.innerHTML = `<span class="navbar-toggler-icon"></span>`;
				t0 = space();
				div4 = element("div");
				ul = element("ul");
				li = element("li");
				a = element("a");
				a.textContent = "Characters";
				t2 = space();
				div0 = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t3 = space();
				div3 = element("div");
				div2 = element("div");
				button1 = element("button");
				button1.textContent = "Options";
				t5 = space();
				div1 = element("div");
				button2 = element("button");
				button2.textContent = "Save";
				t7 = space();
				button3 = element("button");
				button3.textContent = "Export";
				t9 = space();
				button4 = element("button");
				button4.textContent = "Import";
				t11 = space();
				button5 = element("button");
				button5.textContent = "Delete";
				t13 = space();
				button6 = element("button");
				button6.textContent = "Delete all";
				t15 = space();
				button7 = element("button");
				button7.textContent = `${theme == 'dark' ? 'Light' : 'Dark'} mode`;
				t18 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr(button0, "class", "navbar-toggler");
				attr(button0, "type", "button");
				attr(a, "href", "#");
				attr(a, "class", "nav-link dropdown-toggle");
				toggle_class(a, "disabled", !/*characters*/ ctx[2].length);
				attr(div0, "class", "dropdown-menu");
				attr(div0, "style", div0_style_value = `display: ${/*menu*/ ctx[1] == 'characters' ? 'block' : 'none'}`);
				attr(li, "class", "nav-item dropdown");
				attr(ul, "class", "navbar-nav mr-auto");
				attr(button1, "href", "#");
				attr(button1, "class", "dropdown-toggle btn btn-light border border-dark");
				attr(button2, "class", "dropdown-item");
				attr(button3, "class", "dropdown-item");
				attr(button4, "class", "dropdown-item");
				attr(button5, "class", "dropdown-item");
				attr(button6, "class", "dropdown-item");
				attr(button7, "class", "dropdown-item");
				attr(div1, "class", "dropdown-menu");
				attr(div1, "style", div1_style_value = `display: ${/*menu*/ ctx[1] == 'options' ? 'block' : 'none'}`);
				attr(div2, "class", "nav-item dropdown");
				attr(div3, "class", "navbar-nav");
				attr(div4, "class", "collapse navbar-collapse");
				set_style(div4, "display", /*navDisplay*/ ctx[0]);
				attr(nav, "class", "navbar navbar-expand-md navbar-light bg-light");
			},
			m(target, anchor) {
				insert(target, nav, anchor);
				append(nav, button0);
				append(nav, t0);
				append(nav, div4);
				append(div4, ul);
				append(ul, li);
				append(li, a);
				append(li, t2);
				append(li, div0);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div0, null);
					}
				}

				append(div4, t3);
				append(div4, div3);
				append(div3, div2);
				append(div2, button1);
				append(div2, t5);
				append(div2, div1);
				append(div1, button2);
				append(div1, t7);
				append(div1, button3);
				append(div1, t9);
				append(div1, button4);
				append(div1, t11);
				append(div1, button5);
				append(div1, t13);
				append(div1, button6);
				append(div1, t15);
				append(div1, button7);
				insert(target, t18, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*toggleNav*/ ctx[12]),
						listen(a, "blur", /*clearMenu*/ ctx[6]),
						listen(a, "click", /*click_handler*/ ctx[15]),
						listen(button1, "blur", /*clearMenu*/ ctx[6]),
						listen(button1, "click", /*click_handler_2*/ ctx[17]),
						listen(button2, "click", /*saveClick*/ ctx[10]),
						listen(button2, "blur", /*clearMenu*/ ctx[6]),
						listen(button3, "click", /*exportClick*/ ctx[9]),
						listen(button3, "blur", /*clearMenu*/ ctx[6]),
						listen(button4, "click", /*importClick*/ ctx[13]),
						listen(button4, "blur", /*clearMenu*/ ctx[6]),
						listen(button5, "click", /*deleteClick*/ ctx[7]),
						listen(button5, "blur", /*clearMenu*/ ctx[6]),
						listen(button6, "click", /*deleteAllClick*/ ctx[8]),
						listen(button6, "blur", /*clearMenu*/ ctx[6]),
						listen(button7, "click", /*click_handler_3*/ ctx[18])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*characters*/ 4) {
					toggle_class(a, "disabled", !/*characters*/ ctx[2].length);
				}

				if (dirty & /*clearMenu, changeCharacter, characters*/ 100) {
					each_value = ensure_array_like(/*characters*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$4(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(div0, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*menu*/ 2 && div0_style_value !== (div0_style_value = `display: ${/*menu*/ ctx[1] == 'characters' ? 'block' : 'none'}`)) {
					attr(div0, "style", div0_style_value);
				}

				if (dirty & /*menu*/ 2 && div1_style_value !== (div1_style_value = `display: ${/*menu*/ ctx[1] == 'options' ? 'block' : 'none'}`)) {
					attr(div1, "style", div1_style_value);
				}

				if (dirty & /*navDisplay*/ 1) {
					set_style(div4, "display", /*navDisplay*/ ctx[0]);
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(nav);
					detach(t18);
					detach(if_block_anchor);
				}

				destroy_each(each_blocks, detaching);

				if (if_block) {
					if_block.d(detaching);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	const autosaveInterval = 10000; // 10s

	function instance$b($$self, $$props, $$invalidate) {
		let { model = character() } = $$props;
		let navDisplay = 'none';
		let menu = '';
		let characters = [];
		let alert;
		let dismiss;

		function changeCharacter(character) {
			let result = actions.load(model, character);
			$$invalidate(14, model = result.model);
			$$invalidate(3, alert = result.alert);
			toggleNav();
		}

		function clearMenu(e) {
			if (e.relatedTarget?.className.includes('dropdown-item')) return;
			$$invalidate(1, menu = '');
		}

		function deleteClick() {
			$$invalidate(3, alert = actions.delete(model));
			loadCharacterList();
			toggleNav();
		}

		function deleteAllClick() {
			$$invalidate(3, alert = actions.deleteAll());
			loadCharacterList();
			toggleNav();
		}

		function exportClick() {
			actions.export(model);
			toggleNav();
		}

		function loadCharacterList() {
			$$invalidate(2, characters = actions.loadList());
		}

		function saveClick() {
			$$invalidate(3, alert = actions.save(model));
			$$invalidate(2, characters = actions.loadList());
			toggleNav();
		}

		function setMenu(item) {
			$$invalidate(1, menu = item);
		}

		function toggleNav() {
			$$invalidate(0, navDisplay = navDisplay == 'none' ? 'block' : 'none');
		}

		function importClick() {
			actions.import(msg => {
				$$invalidate(3, alert = { success: msg });
				$$invalidate(2, characters = actions.loadList());
			});

			toggleNav();
		}

		loadCharacterList();

		let autoSave = window.setInterval(
			() => {
				console.log(`Autosave (${model.name})`);
				let saved = characters.find(x => x == model.name) != null;
				if (saved) actions.save(model);
			},
			autosaveInterval
		);

		afterUpdate(() => {
			if (dismiss) dismiss.focus();
		});

		onDestroy(() => {
			clearInterval(autoSave);
		});

		const click_handler = () => setMenu('characters');
		const click_handler_1 = character => changeCharacter(character);
		const click_handler_2 = () => setMenu('options');
		const click_handler_3 = () => setTheme(theme == 'dark' ? 'light' : 'dark');

		function button_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				dismiss = $$value;
				$$invalidate(4, dismiss);
			});
		}

		const blur_handler = () => $$invalidate(3, alert = null);
		const click_handler_4 = () => $$invalidate(3, alert = null);

		function button_binding_1($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				dismiss = $$value;
				$$invalidate(4, dismiss);
			});
		}

		const blur_handler_1 = () => $$invalidate(3, alert = null);
		const click_handler_5 = () => $$invalidate(3, alert = null);

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(14, model = $$props.model);
		};

		return [
			navDisplay,
			menu,
			characters,
			alert,
			dismiss,
			changeCharacter,
			clearMenu,
			deleteClick,
			deleteAllClick,
			exportClick,
			saveClick,
			setMenu,
			toggleNav,
			importClick,
			model,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			button_binding,
			blur_handler,
			click_handler_4,
			button_binding_1,
			blur_handler_1,
			click_handler_5
		];
	}

	class Navbar extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$b, create_fragment$b, safe_not_equal, { model: 14 });
		}
	}

	/* src\components\Ability.svelte generated by Svelte v4.2.19 */

	function create_fragment$a(ctx) {
		let div;
		let h4;
		let button;
		let t0;
		let t1;
		let span;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[4].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

		return {
			c() {
				div = element("div");
				h4 = element("h4");
				button = element("button");
				t0 = text(/*scoreText*/ ctx[0]);
				t1 = space();
				span = element("span");
				if (default_slot) default_slot.c();
				attr(button, "class", "btn btn-dark badge");
				set_style(button, "width", "2.0em");
				attr(span, "class", "align-self-center ml-1");
				attr(div, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, h4);
				append(h4, button);
				append(button, t0);
				append(div, t1);
				append(div, span);

				if (default_slot) {
					default_slot.m(span, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*handleClick*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*scoreText*/ 1) set_data(t0, /*scoreText*/ ctx[0]);

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[3],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
							null
						);
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$a($$self, $$props, $$invalidate) {
		let scoreText;
		let { $$slots: slots = {}, $$scope } = $$props;
		let { score } = $$props;

		function handleClick(e) {
			$$invalidate(2, score += e.shiftKey ? -1 : 1);
			if (score < -3) $$invalidate(2, score = 3);
			if (score > 3) $$invalidate(2, score = -3);
		}

		$$self.$$set = $$props => {
			if ('score' in $$props) $$invalidate(2, score = $$props.score);
			if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*score*/ 4) {
				$$invalidate(0, scoreText = score > 0 ? `+${score}` : `${score}`);
			}
		};

		return [scoreText, handleClick, score, $$scope, slots];
	}

	class Ability extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$a, create_fragment$a, safe_not_equal, { score: 2 });
		}
	}

	/* src\components\Abilities.svelte generated by Svelte v4.2.19 */

	function create_default_slot_4$1(ctx) {
		let t;

		return {
			c() {
				t = text("Strength");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (8:0) <Ability bind:score={model.abilities.agility}>
	function create_default_slot_3$1(ctx) {
		let t;

		return {
			c() {
				t = text("Agility");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (9:0) <Ability bind:score={model.abilities.presence}>
	function create_default_slot_2$1(ctx) {
		let t;

		return {
			c() {
				t = text("Presence");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (10:0) <Ability bind:score={model.abilities.toughness}>
	function create_default_slot_1$1(ctx) {
		let t;

		return {
			c() {
				t = text("Toughness");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (11:0) <Ability bind:score={model.abilities.knowledge}>
	function create_default_slot$3(ctx) {
		let t;

		return {
			c() {
				t = text("Knowledge");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	function create_fragment$9(ctx) {
		let ability0;
		let updating_score;
		let t0;
		let ability1;
		let updating_score_1;
		let t1;
		let ability2;
		let updating_score_2;
		let t2;
		let ability3;
		let updating_score_3;
		let t3;
		let ability4;
		let updating_score_4;
		let current;

		function ability0_score_binding(value) {
			/*ability0_score_binding*/ ctx[1](value);
		}

		let ability0_props = {
			$$slots: { default: [create_default_slot_4$1] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].abilities.strength !== void 0) {
			ability0_props.score = /*model*/ ctx[0].abilities.strength;
		}

		ability0 = new Ability({ props: ability0_props });
		binding_callbacks.push(() => bind(ability0, 'score', ability0_score_binding));

		function ability1_score_binding(value) {
			/*ability1_score_binding*/ ctx[2](value);
		}

		let ability1_props = {
			$$slots: { default: [create_default_slot_3$1] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].abilities.agility !== void 0) {
			ability1_props.score = /*model*/ ctx[0].abilities.agility;
		}

		ability1 = new Ability({ props: ability1_props });
		binding_callbacks.push(() => bind(ability1, 'score', ability1_score_binding));

		function ability2_score_binding(value) {
			/*ability2_score_binding*/ ctx[3](value);
		}

		let ability2_props = {
			$$slots: { default: [create_default_slot_2$1] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].abilities.presence !== void 0) {
			ability2_props.score = /*model*/ ctx[0].abilities.presence;
		}

		ability2 = new Ability({ props: ability2_props });
		binding_callbacks.push(() => bind(ability2, 'score', ability2_score_binding));

		function ability3_score_binding(value) {
			/*ability3_score_binding*/ ctx[4](value);
		}

		let ability3_props = {
			$$slots: { default: [create_default_slot_1$1] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].abilities.toughness !== void 0) {
			ability3_props.score = /*model*/ ctx[0].abilities.toughness;
		}

		ability3 = new Ability({ props: ability3_props });
		binding_callbacks.push(() => bind(ability3, 'score', ability3_score_binding));

		function ability4_score_binding(value) {
			/*ability4_score_binding*/ ctx[5](value);
		}

		let ability4_props = {
			$$slots: { default: [create_default_slot$3] },
			$$scope: { ctx }
		};

		if (/*model*/ ctx[0].abilities.knowledge !== void 0) {
			ability4_props.score = /*model*/ ctx[0].abilities.knowledge;
		}

		ability4 = new Ability({ props: ability4_props });
		binding_callbacks.push(() => bind(ability4, 'score', ability4_score_binding));

		return {
			c() {
				create_component(ability0.$$.fragment);
				t0 = space();
				create_component(ability1.$$.fragment);
				t1 = space();
				create_component(ability2.$$.fragment);
				t2 = space();
				create_component(ability3.$$.fragment);
				t3 = space();
				create_component(ability4.$$.fragment);
			},
			m(target, anchor) {
				mount_component(ability0, target, anchor);
				insert(target, t0, anchor);
				mount_component(ability1, target, anchor);
				insert(target, t1, anchor);
				mount_component(ability2, target, anchor);
				insert(target, t2, anchor);
				mount_component(ability3, target, anchor);
				insert(target, t3, anchor);
				mount_component(ability4, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const ability0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					ability0_changes.$$scope = { dirty, ctx };
				}

				if (!updating_score && dirty & /*model*/ 1) {
					updating_score = true;
					ability0_changes.score = /*model*/ ctx[0].abilities.strength;
					add_flush_callback(() => updating_score = false);
				}

				ability0.$set(ability0_changes);
				const ability1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					ability1_changes.$$scope = { dirty, ctx };
				}

				if (!updating_score_1 && dirty & /*model*/ 1) {
					updating_score_1 = true;
					ability1_changes.score = /*model*/ ctx[0].abilities.agility;
					add_flush_callback(() => updating_score_1 = false);
				}

				ability1.$set(ability1_changes);
				const ability2_changes = {};

				if (dirty & /*$$scope*/ 64) {
					ability2_changes.$$scope = { dirty, ctx };
				}

				if (!updating_score_2 && dirty & /*model*/ 1) {
					updating_score_2 = true;
					ability2_changes.score = /*model*/ ctx[0].abilities.presence;
					add_flush_callback(() => updating_score_2 = false);
				}

				ability2.$set(ability2_changes);
				const ability3_changes = {};

				if (dirty & /*$$scope*/ 64) {
					ability3_changes.$$scope = { dirty, ctx };
				}

				if (!updating_score_3 && dirty & /*model*/ 1) {
					updating_score_3 = true;
					ability3_changes.score = /*model*/ ctx[0].abilities.toughness;
					add_flush_callback(() => updating_score_3 = false);
				}

				ability3.$set(ability3_changes);
				const ability4_changes = {};

				if (dirty & /*$$scope*/ 64) {
					ability4_changes.$$scope = { dirty, ctx };
				}

				if (!updating_score_4 && dirty & /*model*/ 1) {
					updating_score_4 = true;
					ability4_changes.score = /*model*/ ctx[0].abilities.knowledge;
					add_flush_callback(() => updating_score_4 = false);
				}

				ability4.$set(ability4_changes);
			},
			i(local) {
				if (current) return;
				transition_in(ability0.$$.fragment, local);
				transition_in(ability1.$$.fragment, local);
				transition_in(ability2.$$.fragment, local);
				transition_in(ability3.$$.fragment, local);
				transition_in(ability4.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(ability0.$$.fragment, local);
				transition_out(ability1.$$.fragment, local);
				transition_out(ability2.$$.fragment, local);
				transition_out(ability3.$$.fragment, local);
				transition_out(ability4.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(t2);
					detach(t3);
				}

				destroy_component(ability0, detaching);
				destroy_component(ability1, detaching);
				destroy_component(ability2, detaching);
				destroy_component(ability3, detaching);
				destroy_component(ability4, detaching);
			}
		};
	}

	function instance$9($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function ability0_score_binding(value) {
			if ($$self.$$.not_equal(model.abilities.strength, value)) {
				model.abilities.strength = value;
				$$invalidate(0, model);
			}
		}

		function ability1_score_binding(value) {
			if ($$self.$$.not_equal(model.abilities.agility, value)) {
				model.abilities.agility = value;
				$$invalidate(0, model);
			}
		}

		function ability2_score_binding(value) {
			if ($$self.$$.not_equal(model.abilities.presence, value)) {
				model.abilities.presence = value;
				$$invalidate(0, model);
			}
		}

		function ability3_score_binding(value) {
			if ($$self.$$.not_equal(model.abilities.toughness, value)) {
				model.abilities.toughness = value;
				$$invalidate(0, model);
			}
		}

		function ability4_score_binding(value) {
			if ($$self.$$.not_equal(model.abilities.knowledge, value)) {
				model.abilities.knowledge = value;
				$$invalidate(0, model);
			}
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [
			model,
			ability0_score_binding,
			ability1_score_binding,
			ability2_score_binding,
			ability3_score_binding,
			ability4_score_binding
		];
	}

	class Abilities extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { model: 0 });
		}
	}

	/* src\components\Glitches.svelte generated by Svelte v4.2.19 */

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[9] = list[i];
		return child_ctx;
	}

	// (28:4) {:else}
	function create_else_block$3(ctx) {
		let button;
		let t_value = /*glitches*/ ctx[0].die + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "btn btn-light border ml-1");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_1*/ ctx[6]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*glitches*/ 1 && t_value !== (t_value = /*glitches*/ ctx[0].die + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (19:4) {#if isEditing}
	function create_if_block$3(ctx) {
		let div;
		let select;
		let t0;
		let button;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*dice*/ ctx[2]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
		}

		return {
			c() {
				div = element("div");
				select = element("select");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t0 = space();
				button = element("button");
				button.textContent = "Close";
				attr(select, "class", "form-control");
				if (/*glitches*/ ctx[0].die === void 0) add_render_callback(() => /*select_change_handler*/ ctx[4].call(select));
				attr(div, "class", "ml-1");
				attr(button, "class", "btn btn-light border ml-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, select);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select, null);
					}
				}

				select_option(select, /*glitches*/ ctx[0].die, true);
				insert(target, t0, anchor);
				insert(target, button, anchor);

				if (!mounted) {
					dispose = [
						listen(select, "change", /*select_change_handler*/ ctx[4]),
						listen(button, "click", /*click_handler*/ ctx[5])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*dice*/ 4) {
					each_value = ensure_array_like(/*dice*/ ctx[2]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$3(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*glitches, dice*/ 5) {
					select_option(select, /*glitches*/ ctx[0].die);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t0);
					detach(button);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (22:16) {#each dice as d}
	function create_each_block$3(ctx) {
		let option;
		let t_value = /*d*/ ctx[9] + "";
		let t;

		return {
			c() {
				option = element("option");
				t = text(t_value);
				option.__value = /*d*/ ctx[9];
				set_input_value(option, option.__value);
			},
			m(target, anchor) {
				insert(target, option, anchor);
				append(option, t);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(option);
				}
			}
		};
	}

	function create_fragment$8(ctx) {
		let div1;
		let button0;
		let t0_value = /*glitches*/ ctx[0].current + "";
		let t0;
		let t1;
		let span0;
		let t3;
		let span1;
		let t5;
		let t6;
		let div0;
		let button1;
		let t8;
		let button2;
		let mounted;
		let dispose;

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return create_if_block$3;
			return create_else_block$3;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type(ctx);

		return {
			c() {
				div1 = element("div");
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				span0 = element("span");
				span0.textContent = "Glitches";
				t3 = space();
				span1 = element("span");
				span1.textContent = "Die";
				t5 = space();
				if_block.c();
				t6 = space();
				div0 = element("div");
				button1 = element("button");
				button1.textContent = "+";
				t8 = space();
				button2 = element("button");
				button2.textContent = "-";
				attr(button0, "class", "btn btn-dark");
				attr(span0, "class", "align-self-center ml-1");
				attr(span1, "class", "align-self-center ml-auto");
				attr(button1, "class", "btn btn-dark");
				attr(button2, "class", "btn btn-dark");
				attr(div0, "class", "btn-group ml-1");
				attr(div1, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				append(div1, button0);
				append(button0, t0);
				append(div1, t1);
				append(div1, span0);
				append(div1, t3);
				append(div1, span1);
				append(div1, t5);
				if_block.m(div1, null);
				append(div1, t6);
				append(div1, div0);
				append(div0, button1);
				append(div0, t8);
				append(div0, button2);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*handleClick*/ ctx[3]),
						listen(button1, "click", /*click_handler_2*/ ctx[7]),
						listen(button2, "click", /*click_handler_3*/ ctx[8])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*glitches*/ 1 && t0_value !== (t0_value = /*glitches*/ ctx[0].current + "")) set_data(t0, t0_value);

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div1, t6);
					}
				}
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				if_block.d();
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$8($$self, $$props, $$invalidate) {
		let { glitches } = $$props;
		const dice = ['d2', 'd3', 'd4'];

		function handleClick(e) {
			let value = e.shiftKey ? 1 : -1;
			$$invalidate(0, glitches.current += value, glitches);
			if (glitches.current < 0) $$invalidate(0, glitches.current = 0, glitches);
		}

		let isEditing = false;

		function select_change_handler() {
			glitches.die = select_value(this);
			$$invalidate(0, glitches);
			$$invalidate(2, dice);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);
		const click_handler_1 = () => $$invalidate(1, isEditing = true);
		const click_handler_2 = () => handleClick({ shiftKey: true });
		const click_handler_3 = () => handleClick({ shiftKey: false });

		$$self.$$set = $$props => {
			if ('glitches' in $$props) $$invalidate(0, glitches = $$props.glitches);
		};

		return [
			glitches,
			isEditing,
			dice,
			handleClick,
			select_change_handler,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3
		];
	}

	class Glitches extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$8, create_fragment$8, safe_not_equal, { glitches: 0 });
		}
	}

	/* src\components\HitPoints.svelte generated by Svelte v4.2.19 */

	function create_fragment$7(ctx) {
		let div2;
		let h30;
		let button0;
		let t0_value = /*hp*/ ctx[0].current + "";
		let t0;
		let t1;
		let span0;
		let t3;
		let h31;
		let button1;
		let t4_value = /*hp*/ ctx[0].max + "";
		let t4;
		let t5;
		let span1;
		let t7;
		let div0;
		let button2;
		let t9;
		let button3;
		let t11;
		let div1;
		let button4;
		let t13;
		let button5;
		let mounted;
		let dispose;

		return {
			c() {
				div2 = element("div");
				h30 = element("h3");
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				span0 = element("span");
				span0.textContent = "/";
				t3 = space();
				h31 = element("h3");
				button1 = element("button");
				t4 = text(t4_value);
				t5 = space();
				span1 = element("span");
				span1.textContent = "Hit Points";
				t7 = space();
				div0 = element("div");
				button2 = element("button");
				button2.textContent = "+";
				t9 = space();
				button3 = element("button");
				button3.textContent = "-";
				t11 = space();
				div1 = element("div");
				button4 = element("button");
				button4.textContent = "+max";
				t13 = space();
				button5 = element("button");
				button5.textContent = "-max";
				attr(button0, "class", "btn-dark badge");
				attr(span0, "class", "ml-2 mr-2 align-self-center");
				attr(button1, "class", "btn-dark badge");
				attr(span1, "class", "ml-2 align-self-center");
				attr(button2, "class", "btn btn-dark align-self-center");
				attr(button3, "class", "btn btn-dark align-self-center");
				attr(div0, "class", "btn-group ml-auto");
				attr(button4, "class", "btn btn-dark align-self-center");
				attr(button5, "class", "btn btn-dark align-self-center");
				attr(div1, "class", "btn-group ml-1");
				attr(div2, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div2, anchor);
				append(div2, h30);
				append(h30, button0);
				append(button0, t0);
				append(div2, t1);
				append(div2, span0);
				append(div2, t3);
				append(div2, h31);
				append(h31, button1);
				append(button1, t4);
				append(div2, t5);
				append(div2, span1);
				append(div2, t7);
				append(div2, div0);
				append(div0, button2);
				append(div0, t9);
				append(div0, button3);
				append(div2, t11);
				append(div2, div1);
				append(div1, button4);
				append(div1, t13);
				append(div1, button5);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*handleCurrent*/ ctx[1]),
						listen(button1, "click", /*handleMax*/ ctx[2]),
						listen(button2, "click", /*click_handler*/ ctx[3]),
						listen(button3, "click", /*click_handler_1*/ ctx[4]),
						listen(button4, "click", /*click_handler_2*/ ctx[5]),
						listen(button5, "click", /*click_handler_3*/ ctx[6])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*hp*/ 1 && t0_value !== (t0_value = /*hp*/ ctx[0].current + "")) set_data(t0, t0_value);
				if (dirty & /*hp*/ 1 && t4_value !== (t4_value = /*hp*/ ctx[0].max + "")) set_data(t4, t4_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div2);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$7($$self, $$props, $$invalidate) {
		let { hp } = $$props;

		function handleCurrent(e) {
			$$invalidate(0, hp.current += e.shiftKey ? 1 : -1, hp);
		}

		function handleMax(e) {
			$$invalidate(0, hp.max += e.shiftKey ? -1 : 1, hp);
		}

		const click_handler = () => handleCurrent({ shiftKey: true });
		const click_handler_1 = () => handleCurrent({ shiftKey: false });
		const click_handler_2 = () => handleMax({ shiftKey: false });
		const click_handler_3 = () => handleMax({ shiftKey: true });

		$$self.$$set = $$props => {
			if ('hp' in $$props) $$invalidate(0, hp = $$props.hp);
		};

		return [
			hp,
			handleCurrent,
			handleMax,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3
		];
	}

	class HitPoints extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$7, create_fragment$7, safe_not_equal, { hp: 0 });
		}
	}

	/* src\components\Status.svelte generated by Svelte v4.2.19 */

	function create_fragment$6(ctx) {
		let hitpoints;
		let t0;
		let glitches;
		let t1;
		let hr;
		let t2;
		let abilities;
		let current;
		hitpoints = new HitPoints({ props: { hp: /*model*/ ctx[0].hp } });

		glitches = new Glitches({
				props: { glitches: /*model*/ ctx[0].glitches }
			});

		abilities = new Abilities({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(hitpoints.$$.fragment);
				t0 = space();
				create_component(glitches.$$.fragment);
				t1 = space();
				hr = element("hr");
				t2 = space();
				create_component(abilities.$$.fragment);
			},
			m(target, anchor) {
				mount_component(hitpoints, target, anchor);
				insert(target, t0, anchor);
				mount_component(glitches, target, anchor);
				insert(target, t1, anchor);
				insert(target, hr, anchor);
				insert(target, t2, anchor);
				mount_component(abilities, target, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				const hitpoints_changes = {};
				if (dirty & /*model*/ 1) hitpoints_changes.hp = /*model*/ ctx[0].hp;
				hitpoints.$set(hitpoints_changes);
				const glitches_changes = {};
				if (dirty & /*model*/ 1) glitches_changes.glitches = /*model*/ ctx[0].glitches;
				glitches.$set(glitches_changes);
				const abilities_changes = {};
				if (dirty & /*model*/ 1) abilities_changes.model = /*model*/ ctx[0];
				abilities.$set(abilities_changes);
			},
			i(local) {
				if (current) return;
				transition_in(hitpoints.$$.fragment, local);
				transition_in(glitches.$$.fragment, local);
				transition_in(abilities.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(hitpoints.$$.fragment, local);
				transition_out(glitches.$$.fragment, local);
				transition_out(abilities.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(t1);
					detach(hr);
					detach(t2);
				}

				destroy_component(hitpoints, detaching);
				destroy_component(glitches, detaching);
				destroy_component(abilities, detaching);
			}
		};
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { model } = $$props;

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [model];
	}

	class Status extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$6, create_fragment$6, safe_not_equal, { model: 0 });
		}
	}

	/* src\components\Infestations.svelte generated by Svelte v4.2.19 */

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	// (34:4) <ListItem item={infestation} {move} {remove}>
	function create_default_slot$2(ctx) {
		let infestation_1;
		let t;
		let current;

		infestation_1 = new Infestation({
				props: { infestation: /*infestation*/ ctx[4] }
			});

		return {
			c() {
				create_component(infestation_1.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(infestation_1, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const infestation_1_changes = {};
				if (dirty & /*model*/ 1) infestation_1_changes.infestation = /*infestation*/ ctx[4];
				infestation_1.$set(infestation_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(infestation_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(infestation_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(infestation_1, detaching);
			}
		};
	}

	// (33:0) {#each model.infestations as infestation}
	function create_each_block$2(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*infestation*/ ctx[4],
					move: /*move*/ ctx[2],
					remove: /*remove*/ ctx[3],
					$$slots: { default: [create_default_slot$2] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*infestation*/ ctx[4];

				if (dirty & /*$$scope, model*/ 129) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$5(ctx) {
		let button;
		let t1;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].infestations);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				button = element("button");
				button.textContent = "Add";
				t1 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "btn btn-dark");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				insert(target, t1, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*add*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, move, remove*/ 13) {
					each_value = ensure_array_like(/*model*/ ctx[0].infestations);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(button);
					detach(t1);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function add() {
			model.infestations.push(infestation());
			$$invalidate(0, model);
		}

		function move(n, item) {
			let index = model.infestations.indexOf(item);
			model.infestations.splice(index, 1);
			index += n;
			if (index < 0) index = model.infestations.length; else if (index > model.infestations.length) index = 0;
			model.infestations.splice(index, 0, item);
			$$invalidate(0, model);
		}

		function remove(item) {
			let index = model.infestations.indexOf(item);
			model.infestations.splice(index, 1);
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [model, add, move, remove];
	}

	class Infestations extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$5, create_fragment$5, safe_not_equal, { model: 0 });
		}
	}

	const cyberware = () => ({
	    name: 'Cyberware',
	    description: ''
	});

	/* src\components\Cyberware.svelte generated by Svelte v4.2.19 */

	function create_else_block$2(ctx) {
		let button;
		let t_value = /*cyberware*/ ctx[0].name + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "btn btn-light border text-left flex-grow-1");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_1*/ ctx[5]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*cyberware*/ 1 && t_value !== (t_value = /*cyberware*/ ctx[0].name + "")) set_data(t, t_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (10:4) {#if isEditing}
	function create_if_block$2(ctx) {
		let div0;
		let input;
		let t0;
		let button;
		let t2;
		let div1;
		let textarea;
		let updating_content;
		let current;
		let mounted;
		let dispose;

		function textarea_content_binding(value) {
			/*textarea_content_binding*/ ctx[4](value);
		}

		let textarea_props = {};

		if (/*cyberware*/ ctx[0].description !== void 0) {
			textarea_props.content = /*cyberware*/ ctx[0].description;
		}

		textarea = new TextArea({ props: textarea_props });
		binding_callbacks.push(() => bind(textarea, 'content', textarea_content_binding));

		return {
			c() {
				div0 = element("div");
				input = element("input");
				t0 = space();
				button = element("button");
				button.textContent = "Close";
				t2 = space();
				div1 = element("div");
				create_component(textarea.$$.fragment);
				attr(input, "class", "flex-grow-1 form-control");
				attr(button, "class", "btn btn-light border");
				attr(div0, "class", "d-flex flex-grow-1");
				attr(div1, "class", "d-flex");
			},
			m(target, anchor) {
				insert(target, div0, anchor);
				append(div0, input);
				set_input_value(input, /*cyberware*/ ctx[0].name);
				append(div0, t0);
				append(div0, button);
				insert(target, t2, anchor);
				insert(target, div1, anchor);
				mount_component(textarea, div1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(input, "input", /*input_input_handler*/ ctx[2]),
						listen(button, "click", /*click_handler*/ ctx[3])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*cyberware*/ 1 && input.value !== /*cyberware*/ ctx[0].name) {
					set_input_value(input, /*cyberware*/ ctx[0].name);
				}

				const textarea_changes = {};

				if (!updating_content && dirty & /*cyberware*/ 1) {
					updating_content = true;
					textarea_changes.content = /*cyberware*/ ctx[0].description;
					add_flush_callback(() => updating_content = false);
				}

				textarea.$set(textarea_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textarea.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textarea.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div0);
					detach(t2);
					detach(div1);
				}

				destroy_component(textarea);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$4(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$2, create_else_block$2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*isEditing*/ ctx[1]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				div = element("div");
				if_block.c();
				attr(div, "class", "d-flex flex-column flex-grow-1");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if_blocks[current_block_type_index].m(div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if_blocks[current_block_type_index].d();
			}
		};
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { cyberware } = $$props;
		let isEditing;

		function input_input_handler() {
			cyberware.name = this.value;
			$$invalidate(0, cyberware);
		}

		const click_handler = () => $$invalidate(1, isEditing = false);

		function textarea_content_binding(value) {
			if ($$self.$$.not_equal(cyberware.description, value)) {
				cyberware.description = value;
				$$invalidate(0, cyberware);
			}
		}

		const click_handler_1 = () => $$invalidate(1, isEditing = true);

		$$self.$$set = $$props => {
			if ('cyberware' in $$props) $$invalidate(0, cyberware = $$props.cyberware);
		};

		return [
			cyberware,
			isEditing,
			input_input_handler,
			click_handler,
			textarea_content_binding,
			click_handler_1
		];
	}

	class Cyberware extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { cyberware: 0 });
		}
	}

	/* src\components\Cybertech.svelte generated by Svelte v4.2.19 */

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	// (34:4) <ListItem item={cyberware} {move} {remove}>
	function create_default_slot$1(ctx) {
		let cyberware_1;
		let t;
		let current;

		cyberware_1 = new Cyberware({
				props: { cyberware: /*cyberware*/ ctx[4] }
			});

		return {
			c() {
				create_component(cyberware_1.$$.fragment);
				t = space();
			},
			m(target, anchor) {
				mount_component(cyberware_1, target, anchor);
				insert(target, t, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const cyberware_1_changes = {};
				if (dirty & /*model*/ 1) cyberware_1_changes.cyberware = /*cyberware*/ ctx[4];
				cyberware_1.$set(cyberware_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(cyberware_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(cyberware_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}

				destroy_component(cyberware_1, detaching);
			}
		};
	}

	// (33:0) {#each model.cybertech as cyberware}
	function create_each_block$1(ctx) {
		let listitem;
		let current;

		listitem = new ListItem({
				props: {
					item: /*cyberware*/ ctx[4],
					move: /*move*/ ctx[2],
					remove: /*remove*/ ctx[3],
					$$slots: { default: [create_default_slot$1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(listitem.$$.fragment);
			},
			m(target, anchor) {
				mount_component(listitem, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const listitem_changes = {};
				if (dirty & /*model*/ 1) listitem_changes.item = /*cyberware*/ ctx[4];

				if (dirty & /*$$scope, model*/ 129) {
					listitem_changes.$$scope = { dirty, ctx };
				}

				listitem.$set(listitem_changes);
			},
			i(local) {
				if (current) return;
				transition_in(listitem.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(listitem.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(listitem, detaching);
			}
		};
	}

	function create_fragment$3(ctx) {
		let button;
		let t1;
		let each_1_anchor;
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*model*/ ctx[0].cybertech);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				button = element("button");
				button.textContent = "Add";
				t1 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
				attr(button, "class", "btn btn-dark");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				insert(target, t1, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each_1_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen(button, "click", /*add*/ ctx[1]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*model, move, remove*/ 13) {
					each_value = ensure_array_like(/*model*/ ctx[0].cybertech);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(button);
					detach(t1);
					detach(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
				mounted = false;
				dispose();
			}
		};
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { model } = $$props;

		function add() {
			model.cybertech.push(cyberware());
			$$invalidate(0, model);
		}

		function move(n, item) {
			let index = model.cybertech.indexOf(item);
			model.cybertech.splice(index, 1);
			index += n;
			if (index < 0) index = model.cybertech.length; else if (index > model.cybertech.length) index = 0;
			model.cybertech.splice(index, 0, item);
			$$invalidate(0, model);
		}

		function remove(item) {
			let index = model.cybertech.indexOf(item);
			model.cybertech.splice(index, 1);
			$$invalidate(0, model);
		}

		$$self.$$set = $$props => {
			if ('model' in $$props) $$invalidate(0, model = $$props.model);
		};

		return [model, add, move, remove];
	}

	class Cybertech extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { model: 0 });
		}
	}

	var dateUtil = {
	    shortDate: (dte = new Date()) => {
	        let dd = dte.getDate().toString();
	        if(dd.length == 1) dd = `0${dd}`;

	        let mm = (dte.getMonth() + 1).toString();
	        if(mm.length == 1) mm = `0${mm}`;

	        let yyyy = dte.getFullYear();
	        while(yyyy.length < 4) yyyy = `0${yyyy}`;

	        return `${yyyy}-${mm}-${dd}`
	    }
	};

	/* src\components\Note.svelte generated by Svelte v4.2.19 */

	function create_else_block$1(ctx) {
		let div4;
		let div3;
		let div2;
		let div0;
		let t0;
		let button0;
		let t2;
		let button1;
		let t4;
		let div1;
		let textarea;
		let updating_content;
		let current;
		let mounted;
		let dispose;

		function select_block_type_1(ctx, dirty) {
			if (/*editTitle*/ ctx[3]) return create_if_block_1;
			return create_else_block_1;
		}

		let current_block_type = select_block_type_1(ctx);
		let if_block = current_block_type(ctx);

		function textarea_content_binding(value) {
			/*textarea_content_binding*/ ctx[15](value);
		}

		let textarea_props = { highlight: /*highlight*/ ctx[2] };

		if (/*note*/ ctx[0].content !== void 0) {
			textarea_props.content = /*note*/ ctx[0].content;
		}

		textarea = new TextArea({ props: textarea_props });
		binding_callbacks.push(() => bind(textarea, 'content', textarea_content_binding));

		return {
			c() {
				div4 = element("div");
				div3 = element("div");
				div2 = element("div");
				div0 = element("div");
				if_block.c();
				t0 = space();
				button0 = element("button");
				button0.textContent = "hide";
				t2 = space();
				button1 = element("button");
				button1.textContent = "delete";
				t4 = space();
				div1 = element("div");
				create_component(textarea.$$.fragment);
				attr(button0, "class", "badge btn btn-light border ml-1 p-2");
				attr(button1, "class", "badge btn btn-light border ml-1 p-2");
				attr(div0, "class", "d-flex");
				attr(div1, "class", "d-flex");
				attr(div2, "class", "card-body");
				attr(div3, "class", "card");
				attr(div4, "class", "col-12");
			},
			m(target, anchor) {
				insert(target, div4, anchor);
				append(div4, div3);
				append(div3, div2);
				append(div2, div0);
				if_block.m(div0, null);
				append(div0, t0);
				append(div0, button0);
				append(div0, t2);
				append(div0, button1);
				append(div2, t4);
				append(div2, div1);
				mount_component(textarea, div1, null);
				current = true;

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler_3*/ ctx[13]),
						listen(button1, "click", /*click_handler_4*/ ctx[14])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block.d(1);
					if_block = current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(div0, t0);
					}
				}

				const textarea_changes = {};
				if (dirty & /*highlight*/ 4) textarea_changes.highlight = /*highlight*/ ctx[2];

				if (!updating_content && dirty & /*note*/ 1) {
					updating_content = true;
					textarea_changes.content = /*note*/ ctx[0].content;
					add_flush_callback(() => updating_content = false);
				}

				textarea.$set(textarea_changes);
			},
			i(local) {
				if (current) return;
				transition_in(textarea.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(textarea.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div4);
				}

				if_block.d();
				destroy_component(textarea);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (20:0) {#if collapse}
	function create_if_block$1(ctx) {
		let div;
		let h4;
		let button0;
		let t0_value = /*note*/ ctx[0].title + "";
		let t0;
		let t1;
		let button1;
		let t2_value = dateUtil.shortDate(/*dateValue*/ ctx[5]) + "";
		let t2;
		let mounted;
		let dispose;

		return {
			c() {
				div = element("div");
				h4 = element("h4");
				button0 = element("button");
				t0 = text(t0_value);
				t1 = space();
				button1 = element("button");
				t2 = text(t2_value);
				attr(button0, "class", "badge btn btn-light w-100 text-left");
				set_style(button0, "min-height", "2.2em");
				attr(h4, "class", "flex-grow-1 m-0");
				attr(button1, "class", "badge btn btn-light border ml-1 p-2");
				attr(div, "class", "col-12 d-flex");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, h4);
				append(h4, button0);
				append(button0, t0);
				append(div, t1);
				append(div, button1);
				append(button1, t2);

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*click_handler*/ ctx[7]),
						listen(button1, "click", /*click_handler_1*/ ctx[8])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*note*/ 1 && t0_value !== (t0_value = /*note*/ ctx[0].title + "")) set_data(t0, t0_value);
				if (dirty & /*dateValue*/ 32 && t2_value !== (t2_value = dateUtil.shortDate(/*dateValue*/ ctx[5]) + "")) set_data(t2, t2_value);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	// (32:16) {:else}
	function create_else_block_1(ctx) {
		let button;
		let t_value = /*note*/ ctx[0].title + "";
		let t;
		let mounted;
		let dispose;

		return {
			c() {
				button = element("button");
				t = text(t_value);
				attr(button, "class", "btn btn-light w-100 text-left font-weight-bold");
				set_style(button, "min-height", "2.2em");
			},
			m(target, anchor) {
				insert(target, button, anchor);
				append(button, t);

				if (!mounted) {
					dispose = listen(button, "click", /*click_handler_2*/ ctx[12]);
					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*note*/ 1 && t_value !== (t_value = /*note*/ ctx[0].title + "")) set_data(t, t_value);
			},
			d(detaching) {
				if (detaching) {
					detach(button);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (30:16) {#if editTitle}
	function create_if_block_1(ctx) {
		let input_1;
		let mounted;
		let dispose;

		return {
			c() {
				input_1 = element("input");
				attr(input_1, "class", "form-control");
			},
			m(target, anchor) {
				insert(target, input_1, anchor);
				/*input_1_binding*/ ctx[10](input_1);
				set_input_value(input_1, /*note*/ ctx[0].title);

				if (!mounted) {
					dispose = [
						listen(input_1, "blur", /*blur_handler*/ ctx[9]),
						listen(input_1, "input", /*input_1_input_handler*/ ctx[11])
					];

					mounted = true;
				}
			},
			p(ctx, dirty) {
				if (dirty & /*note*/ 1 && input_1.value !== /*note*/ ctx[0].title) {
					set_input_value(input_1, /*note*/ ctx[0].title);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(input_1);
				}

				/*input_1_binding*/ ctx[10](null);
				mounted = false;
				run_all(dispose);
			}
		};
	}

	function create_fragment$2(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$1, create_else_block$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*collapse*/ ctx[6]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		return {
			c() {
				if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let collapse;
		let dateValue;
		let { actions } = $$props;
		let { note } = $$props;
		let { highlight } = $$props;
		let editTitle = false;
		let input;

		afterUpdate(() => {
			if (input) input.focus();
		});

		const click_handler = () => $$invalidate(6, collapse = false);
		const click_handler_1 = () => $$invalidate(6, collapse = false);
		const blur_handler = () => $$invalidate(3, editTitle = false);

		function input_1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				input = $$value;
				$$invalidate(4, input);
			});
		}

		function input_1_input_handler() {
			note.title = this.value;
			$$invalidate(0, note);
		}

		const click_handler_2 = () => $$invalidate(3, editTitle = true);
		const click_handler_3 = () => $$invalidate(6, collapse = true);
		const click_handler_4 = () => actions.delete(note);

		function textarea_content_binding(value) {
			if ($$self.$$.not_equal(note.content, value)) {
				note.content = value;
				$$invalidate(0, note);
			}
		}

		$$self.$$set = $$props => {
			if ('actions' in $$props) $$invalidate(1, actions = $$props.actions);
			if ('note' in $$props) $$invalidate(0, note = $$props.note);
			if ('highlight' in $$props) $$invalidate(2, highlight = $$props.highlight);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*highlight*/ 4) {
				$$invalidate(6, collapse = highlight == '');
			}

			if ($$self.$$.dirty & /*note*/ 1) {
				$$invalidate(5, dateValue = new Date(note.date));
			}
		};

		return [
			note,
			actions,
			highlight,
			editTitle,
			input,
			dateValue,
			collapse,
			click_handler,
			click_handler_1,
			blur_handler,
			input_1_binding,
			input_1_input_handler,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			textarea_content_binding
		];
	}

	class Note extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$2, create_fragment$2, safe_not_equal, { actions: 1, note: 0, highlight: 2 });
		}
	}

	/* src\components\Notes.svelte generated by Svelte v4.2.19 */

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[14] = list[i];
		return child_ctx;
	}

	// (71:4) {#each filtered as note (note.id)}
	function create_each_block(key_1, ctx) {
		let first;
		let note_1;
		let current;

		note_1 = new Note({
				props: {
					note: /*note*/ ctx[14],
					actions: /*actions*/ ctx[3],
					highlight: /*filter*/ ctx[0]
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty();
				create_component(note_1.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(note_1, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const note_1_changes = {};
				if (dirty & /*filtered*/ 4) note_1_changes.note = /*note*/ ctx[14];
				if (dirty & /*filter*/ 1) note_1_changes.highlight = /*filter*/ ctx[0];
				note_1.$set(note_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(note_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(note_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(first);
				}

				destroy_component(note_1, detaching);
			}
		};
	}

	function create_fragment$1(ctx) {
		let div2;
		let button0;
		let t1;
		let div1;
		let button1;
		let t3;
		let div0;
		let button2;
		let t5;
		let button3;
		let t7;
		let button4;
		let t9;
		let button5;
		let div0_style_value;
		let t11;
		let div3;
		let input;
		let t12;
		let div4;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*filtered*/ ctx[2]);
		const get_key = ctx => /*note*/ ctx[14].id;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
		}

		return {
			c() {
				div2 = element("div");
				button0 = element("button");
				button0.textContent = "Add note";
				t1 = space();
				div1 = element("div");
				button1 = element("button");
				button1.textContent = "Sort";
				t3 = space();
				div0 = element("div");
				button2 = element("button");
				button2.textContent = "Newest";
				t5 = space();
				button3 = element("button");
				button3.textContent = "Oldest";
				t7 = space();
				button4 = element("button");
				button4.textContent = "A → Z";
				t9 = space();
				button5 = element("button");
				button5.textContent = "Z → A";
				t11 = space();
				div3 = element("div");
				input = element("input");
				t12 = space();
				div4 = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(button0, "class", "btn btn-light border mb-1 mr-1");
				attr(button1, "class", "dropdown-toggle btn btn-light border mb-1");
				attr(button2, "class", "dropdown-item");
				attr(button3, "class", "dropdown-item");
				attr(button4, "class", "dropdown-item");
				attr(button5, "class", "dropdown-item");
				attr(div0, "class", "dropdown-menu");
				attr(div0, "style", div0_style_value = `display: ${/*menu*/ ctx[1] == 'sort' ? 'block' : 'none'}`);
				attr(div1, "class", "dropdown");
				attr(div2, "class", "d-flex");
				attr(input, "class", "form-control");
				attr(input, "placeholder", "filter");
				attr(div3, "class", "d-flex");
				attr(div4, "class", "row mt-2");
			},
			m(target, anchor) {
				insert(target, div2, anchor);
				append(div2, button0);
				append(div2, t1);
				append(div2, div1);
				append(div1, button1);
				append(div1, t3);
				append(div1, div0);
				append(div0, button2);
				append(div0, t5);
				append(div0, button3);
				append(div0, t7);
				append(div0, button4);
				append(div0, t9);
				append(div0, button5);
				insert(target, t11, anchor);
				insert(target, div3, anchor);
				append(div3, input);
				set_input_value(input, /*filter*/ ctx[0]);
				insert(target, t12, anchor);
				insert(target, div4, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div4, null);
					}
				}

				current = true;

				if (!mounted) {
					dispose = [
						listen(button0, "click", /*add*/ ctx[4]),
						listen(button1, "blur", /*clearMenu*/ ctx[5]),
						listen(button1, "click", /*click_handler*/ ctx[8]),
						listen(button2, "blur", /*clearMenu*/ ctx[5]),
						listen(button2, "click", /*click_handler_1*/ ctx[9]),
						listen(button3, "blur", /*clearMenu*/ ctx[5]),
						listen(button3, "click", /*click_handler_2*/ ctx[10]),
						listen(button4, "blur", /*clearMenu*/ ctx[5]),
						listen(button4, "click", /*click_handler_3*/ ctx[11]),
						listen(button5, "blur", /*clearMenu*/ ctx[5]),
						listen(button5, "click", /*click_handler_4*/ ctx[12]),
						listen(input, "input", /*input_input_handler*/ ctx[13])
					];

					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (!current || dirty & /*menu*/ 2 && div0_style_value !== (div0_style_value = `display: ${/*menu*/ ctx[1] == 'sort' ? 'block' : 'none'}`)) {
					attr(div0, "style", div0_style_value);
				}

				if (dirty & /*filter*/ 1 && input.value !== /*filter*/ ctx[0]) {
					set_input_value(input, /*filter*/ ctx[0]);
				}

				if (dirty & /*filtered, actions, filter*/ 13) {
					each_value = ensure_array_like(/*filtered*/ ctx[2]);
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div4, outro_and_destroy_block, create_each_block, null, get_each_context);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div2);
					detach(t11);
					detach(div3);
					detach(t12);
					detach(div4);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}

				mounted = false;
				run_all(dispose);
			}
		};
	}

	function instance$1($$self, $$props, $$invalidate) {
		let filtered;
		let { notes } = $$props;

		const actions = {
			delete: note => {
				if (!confirm(`Delete ${note.title}?`)) return;
				let i = notes.indexOf(note);
				notes.splice(i, 1);
				$$invalidate(7, notes);
			}
		};

		let filter = '';
		let menu = '';

		function add() {
			notes.splice(0, 0, {
				id: crypto.randomUUID(),
				title: 'New note',
				date: new Date().toISOString(),
				content: 'Enter your notes here'
			});

			$$invalidate(7, notes);
		}

		function clearMenu(e) {
			if (e.relatedTarget?.className.includes('dropdown-item')) return;
			$$invalidate(1, menu = '');
		}

		function sort(method) {
			if (method == 'alpha') notes.sort((a, b) => a.title.localeCompare(b.title)); else if (method == 'ralpha') notes.sort((a, b) => b.title.localeCompare(a.title)); else if (method == 'oldest') notes.sort((a, b) => a.date > b.date); else if (method == 'newest') notes.sort((a, b) => a.date < b.date);
			$$invalidate(7, notes);
		}

		const click_handler = () => $$invalidate(1, menu = 'sort');
		const click_handler_1 = () => sort("newest");
		const click_handler_2 = () => sort("oldest");
		const click_handler_3 = () => sort("alpha");
		const click_handler_4 = () => sort("ralpha");

		function input_input_handler() {
			filter = this.value;
			$$invalidate(0, filter);
		}

		$$self.$$set = $$props => {
			if ('notes' in $$props) $$invalidate(7, notes = $$props.notes);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*notes, filter*/ 129) {
				$$invalidate(2, filtered = notes.filter(x => !filter || x.title.toLowerCase().includes(filter.toLowerCase()) || x.content.toLowerCase().includes(filter.toLowerCase())));
			}

			if ($$self.$$.dirty & /*notes*/ 128) {
				{
					notes.forEach(note => {
						if (!note.id) note.id = crypto.randomUUID();
					});
				}
			}
		};

		return [
			filter,
			menu,
			filtered,
			actions,
			add,
			clearMenu,
			sort,
			notes,
			click_handler,
			click_handler_1,
			click_handler_2,
			click_handler_3,
			click_handler_4,
			input_input_handler
		];
	}

	class Notes extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$1, safe_not_equal, { notes: 7 });
		}
	}

	/* src\App.svelte generated by Svelte v4.2.19 */

	function create_else_block(ctx) {
		let link;

		return {
			c() {
				link = element("link");
				attr(link, "rel", "stylesheet");
				attr(link, "href", "https://cdn.jsdelivr.net/npm/bootstrap@4.6.1/dist/css/bootstrap.min.css");
				attr(link, "integrity", "sha384-zCbKRCUGaJDkqS1kPbPd7TveP5iyJE0EjAuZQTgFLD2ylzuqKfdKlfG/eSrtxUkn");
				attr(link, "crossorigin", "anonymous");
			},
			m(target, anchor) {
				insert(target, link, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(link);
				}
			}
		};
	}

	// (21:1) {#if theme == 'dark'}
	function create_if_block(ctx) {
		let link;

		return {
			c() {
				link = element("link");
				attr(link, "rel", "stylesheet");
				attr(link, "href", "https://cdn.jsdelivr.net/gh/vinorodrigues/bootstrap-dark@0.6.1/dist/bootstrap-dark.min.css");
			},
			m(target, anchor) {
				insert(target, link, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(link);
				}
			}
		};
	}

	// (31:2) <Details title="Bio" open="open">
	function create_default_slot_7(ctx) {
		let bio;
		let current;
		bio = new Bio({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(bio.$$.fragment);
			},
			m(target, anchor) {
				mount_component(bio, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const bio_changes = {};
				if (dirty & /*model*/ 1) bio_changes.model = /*model*/ ctx[0];
				bio.$set(bio_changes);
			},
			i(local) {
				if (current) return;
				transition_in(bio.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(bio.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(bio, detaching);
			}
		};
	}

	// (32:2) <Details title="Status" open="open">
	function create_default_slot_6(ctx) {
		let status;
		let current;
		status = new Status({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(status.$$.fragment);
			},
			m(target, anchor) {
				mount_component(status, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const status_changes = {};
				if (dirty & /*model*/ 1) status_changes.model = /*model*/ ctx[0];
				status.$set(status_changes);
			},
			i(local) {
				if (current) return;
				transition_in(status.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(status.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(status, detaching);
			}
		};
	}

	// (33:2) <Details title="Inventory">
	function create_default_slot_5(ctx) {
		let inventory;
		let current;
		inventory = new Inventory({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(inventory.$$.fragment);
			},
			m(target, anchor) {
				mount_component(inventory, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const inventory_changes = {};
				if (dirty & /*model*/ 1) inventory_changes.model = /*model*/ ctx[0];
				inventory.$set(inventory_changes);
			},
			i(local) {
				if (current) return;
				transition_in(inventory.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(inventory.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(inventory, detaching);
			}
		};
	}

	// (34:2) <Details title="Apps">
	function create_default_slot_4(ctx) {
		let apps;
		let current;
		apps = new Apps({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(apps.$$.fragment);
			},
			m(target, anchor) {
				mount_component(apps, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const apps_changes = {};
				if (dirty & /*model*/ 1) apps_changes.model = /*model*/ ctx[0];
				apps.$set(apps_changes);
			},
			i(local) {
				if (current) return;
				transition_in(apps.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(apps.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(apps, detaching);
			}
		};
	}

	// (35:2) <Details title="Nano">
	function create_default_slot_3(ctx) {
		let nano;
		let current;
		nano = new Nano({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(nano.$$.fragment);
			},
			m(target, anchor) {
				mount_component(nano, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const nano_changes = {};
				if (dirty & /*model*/ 1) nano_changes.model = /*model*/ ctx[0];
				nano.$set(nano_changes);
			},
			i(local) {
				if (current) return;
				transition_in(nano.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(nano.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(nano, detaching);
			}
		};
	}

	// (36:2) <Details title="Infestations">
	function create_default_slot_2(ctx) {
		let infestations;
		let current;
		infestations = new Infestations({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(infestations.$$.fragment);
			},
			m(target, anchor) {
				mount_component(infestations, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const infestations_changes = {};
				if (dirty & /*model*/ 1) infestations_changes.model = /*model*/ ctx[0];
				infestations.$set(infestations_changes);
			},
			i(local) {
				if (current) return;
				transition_in(infestations.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(infestations.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(infestations, detaching);
			}
		};
	}

	// (37:2) <Details title="Cybertech">
	function create_default_slot_1(ctx) {
		let cybertech;
		let current;
		cybertech = new Cybertech({ props: { model: /*model*/ ctx[0] } });

		return {
			c() {
				create_component(cybertech.$$.fragment);
			},
			m(target, anchor) {
				mount_component(cybertech, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const cybertech_changes = {};
				if (dirty & /*model*/ 1) cybertech_changes.model = /*model*/ ctx[0];
				cybertech.$set(cybertech_changes);
			},
			i(local) {
				if (current) return;
				transition_in(cybertech.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(cybertech.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(cybertech, detaching);
			}
		};
	}

	// (38:2) <Details title="Notes">
	function create_default_slot(ctx) {
		let notes;
		let current;
		notes = new Notes({ props: { notes: /*model*/ ctx[0].notes } });

		return {
			c() {
				create_component(notes.$$.fragment);
			},
			m(target, anchor) {
				mount_component(notes, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const notes_changes = {};
				if (dirty & /*model*/ 1) notes_changes.notes = /*model*/ ctx[0].notes;
				notes.$set(notes_changes);
			},
			i(local) {
				if (current) return;
				transition_in(notes.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(notes.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(notes, detaching);
			}
		};
	}

	function create_fragment(ctx) {
		let if_block_anchor;
		let t0;
		let main;
		let navbar;
		let updating_model;
		let t1;
		let div;
		let details0;
		let t2;
		let details1;
		let t3;
		let details2;
		let t4;
		let details3;
		let t5;
		let details4;
		let t6;
		let details5;
		let t7;
		let details6;
		let t8;
		let details7;
		let current;

		function select_block_type(ctx, dirty) {
			if (theme == 'dark') return create_if_block;
			return create_else_block;
		}

		let current_block_type = select_block_type();
		let if_block = current_block_type(ctx);

		function navbar_model_binding(value) {
			/*navbar_model_binding*/ ctx[1](value);
		}

		let navbar_props = {};

		if (/*model*/ ctx[0] !== void 0) {
			navbar_props.model = /*model*/ ctx[0];
		}

		navbar = new Navbar({ props: navbar_props });
		binding_callbacks.push(() => bind(navbar, 'model', navbar_model_binding));

		details0 = new Details({
				props: {
					title: "Bio",
					open: "open",
					$$slots: { default: [create_default_slot_7] },
					$$scope: { ctx }
				}
			});

		details1 = new Details({
				props: {
					title: "Status",
					open: "open",
					$$slots: { default: [create_default_slot_6] },
					$$scope: { ctx }
				}
			});

		details2 = new Details({
				props: {
					title: "Inventory",
					$$slots: { default: [create_default_slot_5] },
					$$scope: { ctx }
				}
			});

		details3 = new Details({
				props: {
					title: "Apps",
					$$slots: { default: [create_default_slot_4] },
					$$scope: { ctx }
				}
			});

		details4 = new Details({
				props: {
					title: "Nano",
					$$slots: { default: [create_default_slot_3] },
					$$scope: { ctx }
				}
			});

		details5 = new Details({
				props: {
					title: "Infestations",
					$$slots: { default: [create_default_slot_2] },
					$$scope: { ctx }
				}
			});

		details6 = new Details({
				props: {
					title: "Cybertech",
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				}
			});

		details7 = new Details({
				props: {
					title: "Notes",
					$$slots: { default: [create_default_slot] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				if_block.c();
				if_block_anchor = empty();
				t0 = space();
				main = element("main");
				create_component(navbar.$$.fragment);
				t1 = space();
				div = element("div");
				create_component(details0.$$.fragment);
				t2 = space();
				create_component(details1.$$.fragment);
				t3 = space();
				create_component(details2.$$.fragment);
				t4 = space();
				create_component(details3.$$.fragment);
				t5 = space();
				create_component(details4.$$.fragment);
				t6 = space();
				create_component(details5.$$.fragment);
				t7 = space();
				create_component(details6.$$.fragment);
				t8 = space();
				create_component(details7.$$.fragment);
				attr(div, "class", "row m-2");
				attr(main, "id", "app");
			},
			m(target, anchor) {
				if_block.m(document.head, null);
				append(document.head, if_block_anchor);
				insert(target, t0, anchor);
				insert(target, main, anchor);
				mount_component(navbar, main, null);
				append(main, t1);
				append(main, div);
				mount_component(details0, div, null);
				append(div, t2);
				mount_component(details1, div, null);
				append(div, t3);
				mount_component(details2, div, null);
				append(div, t4);
				mount_component(details3, div, null);
				append(div, t5);
				mount_component(details4, div, null);
				append(div, t6);
				mount_component(details5, div, null);
				append(div, t7);
				mount_component(details6, div, null);
				append(div, t8);
				mount_component(details7, div, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const navbar_changes = {};

				if (!updating_model && dirty & /*model*/ 1) {
					updating_model = true;
					navbar_changes.model = /*model*/ ctx[0];
					add_flush_callback(() => updating_model = false);
				}

				navbar.$set(navbar_changes);
				const details0_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details0_changes.$$scope = { dirty, ctx };
				}

				details0.$set(details0_changes);
				const details1_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details1_changes.$$scope = { dirty, ctx };
				}

				details1.$set(details1_changes);
				const details2_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details2_changes.$$scope = { dirty, ctx };
				}

				details2.$set(details2_changes);
				const details3_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details3_changes.$$scope = { dirty, ctx };
				}

				details3.$set(details3_changes);
				const details4_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details4_changes.$$scope = { dirty, ctx };
				}

				details4.$set(details4_changes);
				const details5_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details5_changes.$$scope = { dirty, ctx };
				}

				details5.$set(details5_changes);
				const details6_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details6_changes.$$scope = { dirty, ctx };
				}

				details6.$set(details6_changes);
				const details7_changes = {};

				if (dirty & /*$$scope, model*/ 5) {
					details7_changes.$$scope = { dirty, ctx };
				}

				details7.$set(details7_changes);
			},
			i(local) {
				if (current) return;
				transition_in(navbar.$$.fragment, local);
				transition_in(details0.$$.fragment, local);
				transition_in(details1.$$.fragment, local);
				transition_in(details2.$$.fragment, local);
				transition_in(details3.$$.fragment, local);
				transition_in(details4.$$.fragment, local);
				transition_in(details5.$$.fragment, local);
				transition_in(details6.$$.fragment, local);
				transition_in(details7.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(navbar.$$.fragment, local);
				transition_out(details0.$$.fragment, local);
				transition_out(details1.$$.fragment, local);
				transition_out(details2.$$.fragment, local);
				transition_out(details3.$$.fragment, local);
				transition_out(details4.$$.fragment, local);
				transition_out(details5.$$.fragment, local);
				transition_out(details6.$$.fragment, local);
				transition_out(details7.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(t0);
					detach(main);
				}

				if_block.d(detaching);
				detach(if_block_anchor);
				destroy_component(navbar);
				destroy_component(details0);
				destroy_component(details1);
				destroy_component(details2);
				destroy_component(details3);
				destroy_component(details4);
				destroy_component(details5);
				destroy_component(details6);
				destroy_component(details7);
			}
		};
	}

	function instance($$self, $$props, $$invalidate) {
		let model = character();

		function navbar_model_binding(value) {
			model = value;
			$$invalidate(0, model);
		}

		return [model, navbar_model_binding];
	}

	class App extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, {});
		}
	}

	const app = new App({
		target: document.body,
		props: { }
	});

	return app;

})();
