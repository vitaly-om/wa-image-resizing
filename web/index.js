import * as wasm from "wa-image-resizing";

const imageSize = 300;

const DEMO_CONTAINER_ID = 'demo-container';
class Demo {
    constructor(name) {
        this.container = document.getElementById(DEMO_CONTAINER_ID);
        this.name = name;
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
    }
}

const demoWASM = new Demo("Rust WASM");
demoWASM.createHTMLElements();

const demoJS = new Demo("Native JS");
demoJS.createHTMLElements();


const imageUploader = document.getElementById('image-uploader');
const imageDemo = document.getElementById('image-demo');
const timeSpentBlock = document.getElementById('time-spent');

function setDemoImage(bytes) {
    const blob = new Blob([bytes], {type: 'image/png'});
    imageDemo.src = URL.createObjectURL(blob);
}

function setTimeSpent(millis) {
    timeSpentBlock.innerText = millis;
}

imageUploader.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
        const timeStart = Date.now();
        const resizedImage = resizeImageJS(event.target.result);
        // setDemoImage(resizedImage);
        setTimeSpent(Date.now() - timeStart)
    };
    reader.readAsDataURL(file);
};

function resizeImageWa(image) {
    const binaryData = new Int8Array(image);
    return wasm.resizeImage(imageSize, binaryData);
}

function resizeImageJS(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = imageSize;
    canvas.height = imageSize;

    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, imageSize, imageSize);
        imageDemo.src = canvas.toDataURL();
    };

    img.src = image;
}