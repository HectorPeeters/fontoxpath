export const errXPST0081 = (prefix: string) =>
	new Error(`XPST0081: The prefix ${prefix} could not be resolved.`);
export const errXPTY0004 = (message: string) => new Error(`XPTY0004: ${message}`);

export const XPDY0002 = (message: string) => new Error(`XPDY0002: ${message}`);
