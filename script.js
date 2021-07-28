// set up audio context
const audioContext = window.AudioContext || window.webkitAudioContext;

let audioAPI;

// create audio class
if (audioContext) {
  // Web Audio API is available.
  audioAPI = new audioContext();
} else {
  // Web Audio API is not available. Ask the user to use a supported browser.
  alert(
    "Oh nose! It appears your browser does not support the Web Audio API, please upgrade or use a different browser"
  );
}

// variables
let analyserNode;

function draw() {
  const canvas = document.getElementById("canvas");

  if (canvas.getContext) {
    const ctx = canvas.getContext("2d");

    // clear the canvas before redrawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let levels = [];
    const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(frequencyData);

    for (let i = 0; i < 7; i++) {
      levels[i] = frequencyData[i + 1] / 2;
    }

    const colours = [
      "#FF0000",
      "#FF7F00",
      "#FFFF00",
      "#00FF00",
      "#0000FF",
      "#4b0082",
      "#8B00FF",
    ];

    const lineWidth = 10;
    const gap = lineWidth + 2;
    let radius = Math.max(canvas.height, canvas.width / 2);

    radius -= lineWidth / 2 + 2;

    ctx.lineWidth = lineWidth;

    colours.forEach((colour, index) => {
      ctx.beginPath();
      ctx.strokeStyle = colour;
      ctx.arc(
        canvas.width / 2,
        canvas.height,
        radius,
        Math.PI,
        Math.PI + (Math.PI / 100) * levels[index],
        false
      );
      ctx.stroke();

      radius -= gap;
    });
  }

  requestAnimationFrame(draw);
}

// create an audio API analyser node and connect to source
function createAnalyserNode(audioSource) {
  analyserNode = audioAPI.createAnalyser();
  analyserNode.smoothingTimeConstant = 0.9;
  analyserNode.fftSize = 512;
  audioSource.connect(analyserNode);
}

// getUserMedia success callback -> pipe audio stream into audio API
function gotStream(stream) {
  // Create an audio input from the stream.
  const audioSource = audioAPI.createMediaStreamSource(stream);

  createAnalyserNode(audioSource);

  draw();
}

// pipe in analysing to getUserMedia
navigator.mediaDevices
  .getUserMedia({ audio: true, video: false })
  .then(gotStream);
