#!/bin/bash
echo "Starting bot..."
until node index.js; do
	if [ $? -eq 10 ]; then
		echo "Restarting..."
	else
		echo "Bot crashed with exit code $?. Respawning .. " >&2
	fi
	sleep 1
done
