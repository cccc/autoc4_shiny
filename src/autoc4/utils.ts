/**
 * @copyright Chaos Computer Club Cologne 2014-2020
 * @license MIT
 */

export function mqtt_match_topic(subscription: string, topic: string): boolean {
	const subscription_levels = subscription.split("/");
	const topic_levels = topic.split("/");
	for (let i = 0; i < subscription_levels.length; i++) {
		const sub_level = subscription_levels[i];
		if (sub_level === "#") return true;
		if (sub_level !== topic_levels[i] && sub_level !== "+") {
			return false;
		}
	}
	return subscription_levels.length === topic_levels.length;
}

export function two_digits(i: number): string {
	return `0${i}`.slice(-2);
}

export function generateUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function simpleDateFormat(template: string, date: Date): string {
	return template
		.replace(/yyyy/, date.getFullYear().toString())
		.replace(/yy/, (date.getFullYear() % 100).toString())
		.replace(/MM/, two_digits(date.getMonth() + 1))
		.replace(/M/, (date.getMonth() + 1).toString())
		.replace(/dd/, two_digits(date.getDate()))
		.replace(/d/, date.getDate().toString())
		.replace(/HH/, two_digits(date.getHours()))
		.replace(/H/, date.getHours().toString())
		.replace(/mm/, two_digits(date.getMinutes()))
		.replace(/m/, date.getMinutes().toString())
		.replace(/ss/, two_digits(date.getSeconds()))
		.replace(/s/, date.getSeconds().toString());
}

type NodeChild = Node | string | number;
type NodeChildren = (NodeChild | NodeChildren | null)[];

function applyChildren(node: HTMLElement, children: NodeChildren) {
	for (const child of children.filter((c) => c || c === 0)) {
		if (Array.isArray(child)) applyChildren(node, child);
		else node.append(child as string | Node);
	}
}

/**
 * Creates a new HTML element in a similar way to React.createElement.
 * @param tag The tag name of the element to create
 * @param attrs The attributes to set on the element
 * @param children The children to append to the element
 * @returns A new HTML element with the given tag name and attributes
 */
export function createHTMLElement(
	tag: string,
	attrs?: null | { [key: string]: any },
	...children: NodeChildren
): HTMLElement {
	const element = document.createElement(tag);
	if (customElements.get(tag)) {
		customElements.upgrade(element);
	}
	if (attrs) {
		const props = Object.entries(attrs).filter(([k]) => k in element);
		Object.assign(element, Object.fromEntries(props));

		const onlyAttributes = Object.entries(attrs).filter(
			([k]) => !(k in element),
		);
		for (const dataAttr of onlyAttributes) {
			element.setAttribute(dataAttr[0], dataAttr[1]);
		}
	}
	applyChildren(element, children);
	return element;
}
