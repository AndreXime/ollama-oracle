import { parse } from "csv-parse/sync";

/**
 * Converte CSV (primeira linha = cabeçalho) em blocos de texto, um por linha de dados.
 */
export function csvRawToTextParts(raw: string): string[] {
	const records = parse(raw, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		bom: true,
		relax_column_count: true,
		cast: false,
	}) as Record<string, string>[];

	const parts: string[] = [];
	let rowIndex = 0;
	for (const row of records) {
		rowIndex += 1;
		const body = Object.entries(row)
			.filter(([, v]) => v != null && String(v).trim() !== "")
			.map(([k, v]) => `${k}: ${String(v).trim()}`)
			.join("\n");
		if (!body) continue;
		parts.push(`# Registro ${rowIndex}\n${body}`);
	}
	return parts;
}
