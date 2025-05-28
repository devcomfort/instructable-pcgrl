/**
 * Maps free icons from Iconify's IcoMoon collection to semantic identifiers
 * IcoMoon follows GPL license
 * Full icon list: https://icon-sets.iconify.design/icomoon-free/page-2.html?keyword=icomoon
 *
 * Framework7 Icons by Vladimir Kharlampidi (MIT License)
 * Full icon list: https://icon-sets.iconify.design/f7/?keyword=f7
 */
export const IconSet = {
	// Pencil icon for editing tools
	pencil: "icomoon-free:pencil",

	// Eyedropper icon for color selection
	eyedropper: "icomoon-free:eyedropper",

	// Droplet icon for color/liquid representation
	droplet: "icomoon-free:droplet",

	// Paint format icon for brush style tools
	paintFormat: "icomoon-free:paint-format",

	// Trash bin icon for deletion operations
	bin: "icomoon-free:bin",

	// Erase icon for erasing operations
	erase: "icomoon-free:cancel-circle",

	// Play icon for media playback controls
	play: "icomoon-free:play2",

	// Share icon for sharing operations
	share: "icomoon-free:share2",

	// Bullhorn icon for feedback/notification features
	feedback: "icomoon-free:bullhorn",

	// Undo icon for history operations
	undo: "icomoon-free:undo",

	// Redo icon for history operations
	redo: "icomoon-free:redo",

	// Microphone icon for voice input features
	microphone: "icomoon-free:mic",

	// Send/Submit icon for sending messages/data (Framework7)
	send: "f7:paperplane-fill",

	// Random icon for random map generation (MingCute)
	random: "mingcute:random-fill",
};

/**
 * Union type of all available icon names
 * Provides type safety and autocompletion for icon references
 * Example: 'pencil' | 'eyedropper' | ...
 */
export type IconName = keyof typeof IconSet;
