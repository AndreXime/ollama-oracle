#!/bin/sh
set -e

ollama serve &
pid=$!

until ollama list >/dev/null 2>&1; do
	sleep 1
done

pull_model() {
	model="$1"
	[ -z "$model" ] && return 0
	echo "Pulling ${model}..."
	ollama pull "$model"
}

pull_model "$OLLAMA_CHAT_MODEL"
if [ "$OLLAMA_EMBED_MODEL" != "$OLLAMA_CHAT_MODEL" ]; then
	pull_model "$OLLAMA_EMBED_MODEL"
fi

wait "$pid"
