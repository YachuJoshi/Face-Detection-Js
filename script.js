let finalExpression;

const video = document.getElementById('video');
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = {
        width: video.width,
        height: video.height
    }
    faceapi.matchDimensions(canvas, displaySize);
    const faceDetector = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).
            withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        if (detections.length) {
            let expressionsObj = detections[0].expressions;
            Object.keys(expressionsObj).forEach(expression => {
                if (Math.round(expressionsObj[expression]) === 1) {
                    finalExpression = expression;
                }
                clearInterval(faceDetector);
            });
        }
        let feelingElem = document.createElement('p');
        feelingElem.className = 'feeling-description';
        feelingElem.textContent = `You're Feeling ${finalExpression.charAt(0).toUpperCase() + finalExpression.slice(1)}`;
        document.body.appendChild(feelingElem);
        playMusic(finalExpression);
    }, 4000);
});

function playMusic(expression) {
    let htmlMarkup = `
    <audio class="my-audio" controls autoplay>
        <source src="musicList/${expression}/Swift.mp3" type="audio/mpeg">
    </audio>`;
    document.querySelector('body').insertAdjacentHTML('beforeend', htmlMarkup);
}