import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function envToBool(value: string | undefined, defaultValue = false): boolean {
	if (typeof value === "undefined") {
		return defaultValue;
	}

	return ['true', '1', 'yes'].includes(value.toLowerCase());
}
