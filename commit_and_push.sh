#!/bin/sh

# Configure Git user information
git config --global user.email "dmtruong1980@gmail.com"
git config --global user.name "Quoc Hoang Vu"

# Add, commit, and push the new trained weights
echo "Adding changes..."
git add saved_model/
if [ $? -ne 0 ]; then
  echo "Failed to add changes"
  exit 1
fi

echo "Committing changes..."
git commit -m "Update trained weights"
if [ $? -ne 0 ]; then
  echo "Failed to commit changes"
  exit 1
fi

echo "Pushing changes..."
git push
if [ $? -ne 0 ]; then
  echo "Failed to push changes"
  exit 1
fi

echo "Changes pushed successfully"