#!/usr/bin/env bash

add_tsx_tag_after_last() {
  local file="$1"
  local tag_selector_regex="$2"   # Regex to match target tag lines, e.g. '^\s*<Route\s+.*\/>'
  local new_tag_line="$3"         # Full new tag line, e.g. '<Route path="/about" element={<About />} />'

  if [[ -z "$file" || -z "$tag_selector_regex" || -z "$new_tag_line" ]]; then
    echo "Usage: add_tsx_tag_after_last file.tsx \"tag-selector-regex\" \"<Tag ... />\""
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "❌ File not found: $file"
    return 1
  fi

  # Prevent duplicates
  if grep -Fq "$new_tag_line" "$file"; then
    echo "✅ Tag already exists in $file"
    return 0
  fi

  local last_match
  last_match=$(grep -nE "$tag_selector_regex" "$file" | tail -n 1)

  if [[ -z "$last_match" ]]; then
    echo "❌ No matching tag found. Cannot determine where to insert."
    return 1
  fi

  local last_line_num
  local indent
  last_line_num=$(echo "$last_match" | cut -d: -f1)
  indent=$(echo "$last_match" | sed -E 's/^([[:digit:]]+):([[:space:]]*).*/\2/')

  local insert_line=$((last_line_num + 1))
  local indented_new_line="${indent}${new_tag_line}"

  # Platform-compatible sed inline flag
  local sed_inline
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed_inline=(-i '')
  else
    sed_inline=(-i)
  fi

  sed "${sed_inline[@]}" "${insert_line}i\\
$indented_new_line
" "$file"

  echo "✅ Tag inserted into $file"
}

add_tsx_import() {
  local file="$1"
  local import_line="$2"

  if [[ -z "$file" || -z "$import_line" ]]; then
    echo "Usage: add_tsx_import path/to/file.tsx \"import ...;\""
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "File not found: $file"
    return 1
  fi

  if grep -Fxq "$import_line" "$file"; then
    echo "✅ Import already exists in $file"
    return 0
  fi

  local last_import_line
  last_import_line=$(grep -nE '^import .+ from .+;$' "$file" | tail -n 1 | cut -d: -f1)

  # Determine sed inline flag based on OS
  local sed_inline
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed_inline=(-i '')
  else
    sed_inline=(-i)
  fi

  if [[ -z "$last_import_line" ]]; then
    # No imports found — insert at top
    sed "${sed_inline[@]}" "1i\\
$import_line
" "$file"
  else
    # Insert after last import
    local insert_line=$((last_import_line + 1))
    sed "${sed_inline[@]}" "${insert_line}i\\
$import_line
" "$file"
  fi

  echo "✅ Import added to $file"
}

add_tsx_entity_route() {
  local file="$1"
  local entity_name="$2"
  local new_tag_line="$3"

  if [[ -z "$file" || -z "$entity_name" || -z "$new_tag_line" ]]; then
    echo "Usage: add_tsx_entity_route file.tsx entityName \"<JSX route block>\""
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "❌ File not found: $file"
    return 1
  fi

  # Find the line number where the entity block starts
  local start_line
  start_line=$(grep -nE "const[[:space:]]+${entity_name}[[:space:]]*=[[:space:]]*\(" "$file" | head -n1 | cut -d: -f1)

  if [[ -z "$start_line" ]]; then
    echo "❌ Cannot find block for entity: $entity_name"
    return 1
  fi

  # Find the line where the block ends — the first ');' after the start
  local end_line
  end_line=$(tail -n +"$start_line" "$file" | grep -nE "^\s*\);" | head -n1 | cut -d: -f1)

  if [[ -z "$end_line" ]]; then
    echo "❌ Cannot find closing ');' for entity: $entity_name"
    return 1
  fi

  end_line=$((start_line + end_line - 1))

  # Check if tag already exists inside just this block
  if sed -n "${start_line},${end_line}p" "$file" | grep -Fq "$new_tag_line"; then
    echo "✅ Tag already exists in $entity_name block of $file"
    return 0
  fi

  # Within this block, find the last </EntityLayout.Route>
  local last_match
  last_match=$(sed -n "${start_line},${end_line}p" "$file" | grep -nE '^\s*</EntityLayout\.Route>' | tail -n1)

  if [[ -z "$last_match" ]]; then
    echo "❌ No </EntityLayout.Route> found inside block $entity_name"
    return 1
  fi

  local relative_line_num
  relative_line_num=$(echo "$last_match" | cut -d: -f1)
  local absolute_line_num=$((start_line + relative_line_num - 1))

  local indent
  indent=$(echo "$last_match" | sed -E 's/^([[:digit:]]+):([[:space:]]*).*/\2/')

  local insert_line=$((absolute_line_num + 1))
  local indented_new_line="${indent}${new_tag_line}"

  # Platform-compatible sed inline flag
  local sed_inline
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed_inline=(-i '')
  else
    sed_inline=(-i)
  fi

  sed "${sed_inline[@]}" "${insert_line}i\\
$indented_new_line
" "$file"

  echo "✅ Inserted into $entity_name block in $file"
}

add_backend_add_after_last() {
  local file="$1"
  local new_add_line="$2"

  if [[ -z "$file" || -z "$new_add_line" ]]; then
    echo "Usage: add_backend_add_after_last path/to/file.ts \"backend.add(...)\""
    return 1
  fi

  if [[ ! -f "$file" ]]; then
    echo "❌ File not found: $file"
    return 1
  fi

  # Avoid duplicate
  if grep -Fq "$new_add_line" "$file"; then
    echo "✅ backend.add line already exists in $file"
    return 0
  fi

  # Find the last line that starts with optional spaces and contains backend.add(...)
  local last_match
  last_match=$(grep -nE '^\s*backend\.add\(.+\)' "$file" | tail -n 1)

  if [[ -z "$last_match" ]]; then
    echo "❌ No backend.add(...) line found. Cannot determine where to insert."
    return 1
  fi

  local last_line_num
  local indent
  last_line_num=$(echo "$last_match" | cut -d: -f1)
  indent=$(echo "$last_match" | sed -E 's/^([[:digit:]]+):([[:space:]]*).*/\2/')

  local insert_line=$((last_line_num + 1))
  local indented_new_line="${indent}${new_add_line}"

  # Platform-compatible sed inline flag
  local sed_inline
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed_inline=(-i '')
  else
    sed_inline=(-i)
  fi

  sed "${sed_inline[@]}" "${insert_line}i\\
$indented_new_line
" "$file"

  echo "✅ backend.add inserted into $file"
}

add_tsx_route() {
  add_tsx_tag_after_last "$1" '^\s*<Route\s+.*\/>' "$2"
}

add_tsx_sidebar_item() {
  add_tsx_tag_after_last "$1" '^\s*<SidebarItem\s+.*\/>' "$2"
}