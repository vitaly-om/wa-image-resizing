import * as wasm from "wa-image-resizing";

import Jimp from "jimp";


const imageSize = 300;

const DEMO_CONTAINER_ID = 'demo-container';

class Demo {
    constructor(name) {
        this.container = document.getElementById(DEMO_CONTAINER_ID);
        this.name = name;
        this.historyElement = null;
        this.originalImageElement = null;
        this.resultImageElement = null;
    }

    _createImageBlock(title) {
        const imageBlock = document.createElement('div');

        const imageLabel = document.createElement('div');
        imageLabel.innerText = `${title} image: `;
        imageBlock.appendChild(imageLabel);

        const image = document.createElement('img');
        image.src = './img/image-stub.png';
        imageBlock.appendChild(image);

        return {
            block: imageBlock,
            image: image,
        }
    }

    createHTMLElements() {
        const demoBlock = this.createDemoBlock();
        const demoHTMLContainer = demoBlock.htmlContainer;

        const heading = document.createElement('h1');
        heading.innerText = `Demo "${this.name}"`;
        demoHTMLContainer.appendChild(heading);

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        demoHTMLContainer.appendChild(input);

        const originalImageBlock = this._createImageBlock('Original');
        demoHTMLContainer.appendChild(originalImageBlock.block);

        const resultImageBlock = this._createImageBlock('Result');
        demoHTMLContainer.appendChild(resultImageBlock.block);

        this.container.appendChild(demoBlock.block);

        this.historyElement = demoBlock.performanceHistoryContainer;
        this.originalImageElement = originalImageBlock.image;
        this.resultImageElement = resultImageBlock.image;

        this.addInputCallback(input);
    }

    createDemoBlock() {
        const demoBlock = document.createElement('div');
        demoBlock.className = 'demoBlock';

        const demoHTMLContainer = document.createElement('div');
        demoHTMLContainer.className = 'htmlContainer';
        const demoPerformanceHistoryContainer = document.createElement('div');
        demoPerformanceHistoryContainer.className = 'history';
        const performanceHeading = document.createElement('h2');
        performanceHeading.innerText = 'Performance history';
        demoPerformanceHistoryContainer.appendChild(performanceHeading);

        demoBlock.append(demoHTMLContainer, demoPerformanceHistoryContainer);

        return {
            block: demoBlock,
            htmlContainer: demoHTMLContainer,
            performanceHistoryContainer: demoPerformanceHistoryContainer,
        }
    }

    inputCallBack(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            this.setOriginalImage(dataUrl);
            this.processImage(dataUrl);
        };

        reader.readAsDataURL(file);
    }

    addInputCallback(inputElement) {
        inputElement.onchange = (event) => {
            const file = event.target.files[0];
            this.inputCallBack(file);
        }
    }

    addPerformanceHistoryRecord(size, timeMS) {
        if (this.historyElement === null) {
            return;
        }
        const historyRecord = document.createElement('div');
        historyRecord.innerText = `${new Date().toLocaleString()} | Size: ${size}; Time: ${timeMS}ms`;
        this.historyElement.appendChild(historyRecord);
    }

    setOriginalImage(dataUrl) {
        this.originalImageElement.src = dataUrl;
    }

    setResultImageDataURL(dataUrl) {
        this.resultImageElement.src = dataUrl;
    }

    processImage(dataUrl) {
        // OVERRIDE IT
        this.setResultImageDataURL(dataUrl);
    }
}


class DemoNativeJS extends Demo {
    processImage(dataUrl) {
        const startTime = Date.now();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imageSize;
        canvas.height = imageSize;

        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, imageSize, imageSize);
            this.setResultImageDataURL(canvas.toDataURL());
            this.addPerformanceHistoryRecord(dataUrl.length, Date.now() - startTime);
        };

        img.src = dataUrl;
    }
}



class DemoJimpJS extends Demo {
    inputCallBack(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const bytes = event.target.result;
            this.setOriginalImage(bytesToDataURL(bytes));
            this.processImage(bytes);
        };

        reader.readAsArrayBuffer(file);
    }

    processImage(array) {
        const startTime = Date.now();
        Jimp.read(array).then(image => {
            const resizedImage = image.resize(imageSize, imageSize);
            resizedImage.getBufferAsync(Jimp.MIME_JPEG)
                .then(buffer => {
                    this.setResultImageDataURL(bytesToDataURL(buffer));
                    this.addPerformanceHistoryRecord(array.length, Date.now() - startTime);

                });
        })
    }
}



class DemoRustWASM extends Demo {
    inputCallBack(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const bytes = event.target.result;
            this.setOriginalImage(bytesToDataURL(bytes));
            this.processImage(bytes);
        };

        reader.readAsArrayBuffer(file);
    }

    processImage(array) {
        const startTime = Date.now();
        const binaryData = new Uint8Array(array);
        const img = wasm.resizeImage(imageSize, binaryData);
        this.addPerformanceHistoryRecord(binaryData.length, Date.now() - startTime);
        this.setResultImageDataURL(bytesToDataURL(img));
    }
}


const demoWASM = new DemoRustWASM("Rust WASM");
demoWASM.createHTMLElements();

const demoJS = new DemoNativeJS("Native JS");
demoJS.createHTMLElements();

const jimpJS = new DemoJimpJS("Jimp JS");
jimpJS.createHTMLElements();


function bytesToDataURL(bytes) {
    const blob = new Blob([bytes], {type: 'image/*'});
    return URL.createObjectURL(blob);
}