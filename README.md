# Gradient Extraction App

This web application allows you to upload sunset or sunrise photos and automatically extracts the dominant color palette. Using those colors, the app generates multiple gradient "artworks" that visually represent the nuanced transitions found in the image's sky.

## Features

- **Simple Interface**: Easily upload images through drag-and-drop or file selection
- **Smart Color Extraction**: Extract dominant colors from sunset/sunrise photos
- **Multiple Gradient Styles**: View your palette as linear, radial, and conic gradients
- **Export Options**: Copy CSS code or download the gradient as an image
- **Share Functionality**: Share your generated gradients (on supported browsers)

## Technologies Used

- **React**: Frontend library for building the UI
- **TypeScript**: For type safety and better development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **color-thief-ts**: For extracting colors from images
- **react-dropzone**: For handling file uploads

## Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/gradient-extraction.git
cd gradient-extraction
```

2. **Install dependencies**

```bash
npm install
```

3. **Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

4. **Build for production**

```bash
npm run build
```

## How the Color Extraction Works

This application uses the [color-thief-ts](https://github.com/joneff/color-thief-ts) library to analyze the uploaded image and extract a palette of dominant colors. The process works as follows:

1. The user uploads an image through the drag-and-drop interface
2. The app creates a temporary URL for the image and displays a preview
3. color-thief-ts analyzes the image pixels to identify dominant colors
4. The extracted colors are sorted based on brightness to create smooth transitions
5. The sorted palette is used to generate various CSS gradients (linear, radial, conic)
6. The user can select different gradient styles and copy the CSS or download the gradient as an image

The algorithm focuses particularly on the color variations found in sunset/sunrise photos, which typically have gradual transitions between warm colors (orange, pink, purple) and cooler tones (blue, teal).

## Usage

1. **Upload an image**: Drag and drop a sunset/sunrise image onto the upload area or click to select a file
2. **View the palette**: Once processed, you'll see the extracted color palette below your image
3. **Explore gradients**: Browse through the various gradient styles generated from your colors
4. **Use the gradient**: Copy the CSS code to use in your own projects or download the gradient as an image

## License

MIT License 