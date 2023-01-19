#!/bin/bash
tmux new-session -d -s ZachBot
tmux send-keys -t ZachBot "cd ~/ZachBot" C-m
tmux send-keys -t ZachBot "./scripts/maintainBot.sh" C-m
