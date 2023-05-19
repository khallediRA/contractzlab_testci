import { config } from "../config"

export function optimizeStr(content: string) {
	let output = content
	const lineReplacers: [RegExp, string][] = [
		[/[\x01\x1F]/g, '*'],
		[/\r/g, ' '],
		[/\s+/g, ' '],
	]
	const replacers: [RegExp, string][] = [
		[/\f/g, '\n'],
		[/\s*\n+\s*/g, '\n'], // Updated regex pattern to match consecutive \r\n
		[/\n+/g, '\n'], // Updated regex pattern to match consecutive \r\n
	]
	for (const replacer of lineReplacers) {
		output = output.split("\n").map(str => str.replace(replacer[0], replacer[1])).join("\n")
	}
	for (const replacer of replacers) {
		output = output.replace(replacer[0], replacer[1])
	}
	return output
}

export function UrlToUploadPath(path: string) {
	if (path?.startsWith(config.server.publicUrl))
		return path.replace(config.server.publicUrl, config.uploadPath)
	return path
}
export function pathHead(path: string): [string, string, string[]] {
	const parts = path.split(".")
	const head = parts[0]
	const restPath = parts.slice(1).join(".")
	return [head, restPath, parts]
}
export function pathTail(path: string): [string, string, string[]] {
	const parts = path.split(".")
	const tail = parts.pop() as string
	const restPath = parts.join(".")
	return [restPath, tail, parts]
}
export function pathConcat(left: string, right: string) {
	if (left && right)
		return `${left}.${right}`
	return left ? left : right
}
export function capitalizeFirstLetter(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}
export function lowerCaseFirstLetter(string: string) {
	return string.charAt(0).toLowerCase() + string.slice(1);
}

export function fixFrenchDiacritics(text: string) {
	// Replace `e with é
	text = text.replace(/´e/gi, 'é');
	text = text.replace(/`e/gi, 'è');
	text = text.replace(/\^e/gi, 'ê');
	text = text.replace(/"e/gi, 'ë');
	text = text.replace(/\^a/gi, 'â');
	text = text.replace(/`a/gi, 'à');
	text = text.replace(/a`/gi, 'à');
	text = text.replace(/\^i/gi, 'î');
	text = text.replace(/"i/gi, 'ï');
	text = text.replace(/\^o/gi, 'ô');
	text = text.replace(/\^u/gi, 'û');
	text = text.replace(/,c/gi, 'ç');
	// Return the corrected text
	return text;
}
