# MaskIt

**MaskIt** is a lightweight Chrome extension that lets you create draggable, resizable blur or solid masks anywhere on a webpage.  
Use it to hide annoying elements such as video instructor faces, ads, watermarks, popups, or any distractions that interfere with your focus. Masks automatically persist across page reloads and navigation.

---

## Features

- **Add Multiple Masks**: Create unlimited masks on any webpage
- **Drag & Resize**: Click and drag to reposition, use corner handle to resize
- **Blur or Solid Mode**: Toggle between blur effect (adjustable 0-80px) or solid black (adjustable 0-100% opacity)
- **Position Control**: Choose between fixed position (stays in view) or absolute (scrolls with content)
- **Auto-Save**: Masks automatically save and restore on page reload and navigation
- **Right-Click Menu**: Easy access to mask controls, mode switching, and removal
- **Keyboard Shortcut**: Press `Ctrl+Shift+0` to quickly add a new mask

---

## Installation

### Option 1: Load Unpacked Extension (for developers or testers)

1. Clone or download this repository to your computer.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked**.
5. Select the folder where you saved the repository files.
6. The MaskIt extension should now appear in your toolbar.

### Option 2: (Planned) Publish to Chrome Web Store

- This extension is currently not published on the Chrome Web Store.  
- You can use the unpacked version or wait for a future release.

---

## Usage

### Creating a Mask
1. Navigate to any webpage where you want to hide content
2. Click the **MaskIt extension icon** in the toolbar (or press `Ctrl+Shift+0`)
3. A blur mask will appear on the page

### Adjusting the Mask
- **Move**: Click and drag the mask to position it
- **Resize**: Drag the corner handle to change size
- **Configure**: Right-click on the mask to open the options menu

### Options Menu (Right-Click)
- **Close (×)**: Close the options menu
- **Remove This Mask**: Delete the current mask
- **Remove All Masks**: Delete all masks on the page
- **Position Toggle**: Switch between fixed (stays in view) or absolute (scrolls with page)
- **Mode Toggle**: Switch between blur and solid black
- **Blur Slider**: Adjust blur intensity (0-80px) when in blur mode
- **Opacity Slider**: Adjust transparency (0-100%) when in solid mode

### Persistence
- Masks automatically save to your browser's local storage
- Reload the page and masks will restore automatically
- Navigate away and back, masks will be waiting for you

---

## Future Improvements

- Custom shapes (currently rectangular)
- Custom colors beyond black
- Export/import mask configurations
- Sync masks across devices
- Visual indicator for keyboard shortcut
- Undo/redo functionality

---

## Contributing

Contributions and suggestions are welcome! Feel free to open issues or pull requests.

---

## License

This project is licensed under the MIT License.

---

## Contact

Created by Niloy Hasan Nahid — feel free to reach out for questions or feature requests.

---

