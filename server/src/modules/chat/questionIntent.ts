function normalizeForMatch(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/\s+/g, " ");
}

export function isConversationalQuestion(question: string): boolean {
	const q = normalizeForMatch(question);
	if (!q) return true;
	const patterns = [
		/^(oi|ola|hey|bom dia|boa tarde|boa noite|e ai|eae|tudo bem|td bem)\b/,
		/^(obrigado|obrigada|valeu|brigado|brigada|thanks)\b/,
		/^(quem e voce|o que voce faz|como voce pode ajudar|como funciona voce)\b/,
	];
	return patterns.some((p) => p.test(q));
}

export function isLikelyIncompleteFollowUp(question: string): boolean {
	const q = normalizeForMatch(question);
	if (q.length > 80) return false;
	return /^(e |mas |e para |e o |e a |e na |e no |tambem |isso |essa |esse |e quanto |e qual )/.test(q);
}

export function buildNoChunksUserMessage(question: string): string {
	if (isLikelyIncompleteFollowUp(question)) {
		return (
			"Não mantemos histórico desta conversa. Para buscar na base corporativa, envie a pergunta completa em uma única mensagem " +
			'(por exemplo: "Como funciona home office para PJ?").'
		);
	}
	return (
		"Não encontrei trechos na base de conhecimento sobre este assunto. " +
		"Reformule com termos mais específicos (ex.: reembolso de viagem, acesso VPN, home office) " +
		"ou consulte o canal interno responsável pelo tema."
	);
}
