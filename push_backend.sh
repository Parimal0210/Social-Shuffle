#!/usr/bin/env bash
# Root convenience runner to push backend changes to Social-Shuffle-Backend
exec ./backend-spring-boot-mongodb/push_to_github.sh "$@"
