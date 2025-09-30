# Canvas Plugins

This directory contains various plugins that extend the functionality of the KonvaCanvas component.

## Available Plugins

### 1. ContextMenuPlugin
Adds right-click context menu functionality to the canvas.

#### Usage
The plugin is automatically loaded when the canvas component is initialized. To enable it, make sure `contextMenu` is included in the plugins array:

```vue
<Canvas :plugins="['ruler', 'contextMenu']" />
```

#### Features
- Right-click on canvas or elements to show context menu
- Default menu items:
  - Copy (Ctrl+C)
  - Paste (Ctrl+V)
  - Delete (Del)
  - Center View
  - Reset View
- Custom menu items can be added via options
- Menu automatically positions itself to avoid going outside the canvas
- Clicking outside the menu or pressing Escape hides it
- **Dark mode support** - Automatically adapts to the application theme

#### Dark Mode Support
The context menu automatically adapts its appearance based on the application's theme (light or dark mode). The plugin listens to theme changes and updates its appearance accordingly.

#### Custom Menu Items
You can add custom menu items when initializing the plugin:

```javascript
konvaCanvas.pluginManager.registerPlugin('contextMenu', new ContextMenuPlugin(konvaCanvas, {
  menuItems: [
    {
      text: 'Custom Action',
      action: 'customAction',
      shortcut: 'Ctrl+X',
      condition: (element) => element !== null
    }
  ]
}));
```

Each menu item can have the following properties:
- `text`: Display text for the menu item
- `action`: Action identifier to be triggered
- `shortcut`: Optional keyboard shortcut to display
- `condition`: Function that determines if the item should be shown

#### Events
The plugin emits the following events via the canvas event system:
- `copy`: When copy action is triggered
- `paste`: When paste action is triggered
- `delete`: When delete action is triggered
- `contextMenuAction`: When a custom action is triggered

### 2. RulerPlugin
Adds rulers to the top and left edges of the canvas.

### 3. GridPlugin
Adds a grid overlay to the canvas.