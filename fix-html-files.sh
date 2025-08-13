#!/bin/bash

# List of HTML files to update
files=(
  "account.html"
  "admin.html"
  "cart.html"
  "checkout.html"
  "contact.html"
  "custom-order.html"
  "email-confirmation.html"
  "faq.html"
  "forgot-password.html"
  "login.html"
  "privacy.html"
  "register.html"
  "terms.html"
)

# Remove manifest.json references from all HTML files
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    sed -i '/manifest\.json/d' "$file"
    echo "Updated $file"
  fi
done

echo "All HTML files updated to remove manifest.json references"
