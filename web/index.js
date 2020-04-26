import * as wasm from "wa-image-resizing";

const imageSize = 300;

const DEMO_CONTAINER_ID = 'demo-container';
class Demo {
    constructor() {
        this.container = document.getElementById(DEMO_CONTAINER_ID);
    }

    createHTMLElements() {
        const demoBlock = document.createElement('div');
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        demoBlock.appendChild(input);

        this.container.appendChild(demoBlock);
    }
}

const demo = new Demo();
demo.createHTMLElements();


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