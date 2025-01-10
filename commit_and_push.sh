#!/bin/sh

# Configure Git user information
git config --global user.email "dmtruong1980@gmail.com"
git config --global user.name "Quoc Hoang Vu"

# Add, commit, and push the new trained weights
git add saved_model/
git commit -m "Update trained weights"
git push