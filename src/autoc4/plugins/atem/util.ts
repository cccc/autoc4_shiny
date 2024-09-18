export type AtemSourceDescription = {
	index: number;
	port_type: number;
	short_name: string;
	name: string;
};

export type AtemChangeSourceMessage =
	| {
			index: number;
			source: number;
	  }
	| {
			[index: number]: {
				source: number;
			};
	  };
export function getSourceFromMessage(
	message: AtemChangeSourceMessage,
	expectedIndex: number,
): number {
	if ("index" in message) {
		if (message.index !== expectedIndex) {
			throw new Error(
				`Expected index ${expectedIndex} but got ${message.index}`,
			);
		}
		return message.source;
	}
	if (!(expectedIndex in message)) {
		throw new Error(
			`Expected index ${expectedIndex} but got ${Object.keys(message).join(", ")}`,
		);
	}
	return message[expectedIndex]!.source;
}
