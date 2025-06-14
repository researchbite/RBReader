# PDF Reader Mode Testing

Use these steps to verify PDF support in the extension:

1. Run the build and load the `dist` folder into Chrome.
2. Navigate to any online PDF, for example [arXiv paper](https://arxiv.org/pdf/2106.14834.pdf) or a local `file:///` URL.
3. After the PDF loads, the extension should automatically display a reader-mode overlay with the parsed text.
4. Ensure bionic reading and AI highlighting (if enabled) still work within the overlay.
