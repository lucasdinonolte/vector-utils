# vector-utils

Utility package designed for handling vector paths. The package includes functions for parsing and outputting SVG paths as well as manipulating them. 

## Installation
Install the package using npm:

```bash
npm install @lucasdinonolte/vector-utils
```

## Usage
```
import { createPath } from '@lucasdinonolte/vector-utils';

// Parse SVG path
const pathData = 'M 100 100 L 300 100 L 300 300 L 100 300 Z';
const path = createPath(pathData);

// Manipulate path
const transformedPath = path.rotate(45);

// Output SVG path
const outputPath = transformedPath.toSVG();
```

## Note 🚨🚨🚨
Vector-Utils is a work in progress and should not be used for production purposes. Feel free to explore and contribute to its development.

