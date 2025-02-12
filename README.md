# Custom Tab Appearance

A Firefox extension that allows you to customize website titles and favicons based on custom rules.

## Features

- **Custom Title Rules**: Change website titles based on domain, title content, or regex patterns
- **Custom Favicons**: Choose from a variety of emoji icons or upload your own custom images
- **Rule Management**:
  - Enable/disable rules
  - Edit existing rules
  - Import/export rules as JSON
- **Flexible Matching**:
  - Domain matching (e.g., "github.com")
  - Title matching (e.g., "Pull Request")
  - RegEx matching for advanced patterns

## Usage

### Adding Rules

1. Click the extension icon to open the settings
2. Select a match type (Domain, Title, or RegEx)
3. Enter the pattern to match
4. Enter the new title you want to display
5. (Optional) Choose a favicon:
   - Select from the emoji grid
   - Import your own image using the "+" button
6. Click "Add Rule" to save

### Managing Rules

- **Enable/Disable**: Toggle rules on/off using the enable/disable button
- **Edit**: Modify existing rules using the edit button
- **Delete**: Remove rules using the delete button
- **Bulk Actions**:
  - Export all rules to a JSON file
  - Import rules from a JSON file
  - Remove all rules at once

## Installation

1. Download the extension from Firefox Add-ons
2. Click "Add to Firefox"
3. Accept the permissions

## Development

The extension is built using:
- JavaScript
- WebExtensions API
- HTML/CSS

### Project Structure 