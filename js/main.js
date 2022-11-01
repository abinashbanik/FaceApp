const video = document.getElementById("video");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
// const happy = document.getElementById("");
let predictedAges = [];

function promise () {
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models"),
]).then(startVideo);
}

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    (stream) => (video.srcObject = stream),
    (err) => console.error(err)
  );
}
function screenResize(isScreenSmall) {
  if (isScreenSmall.matches) {
    // If media query matches
    video.style.width = "320px";
  } else {
    video.style.width = "500px";
  }
}
function show(checkBlock) {
    checkBlock.style.display = "block";
}
function Hide(checkBlock) {
    checkBlock.style.display = "none";
}
function reloadPage(){
  location.reload();
}


screenResize(isScreenSmall); // Call listener function at run time
isScreenSmall.addListener(screenResize);

video.addEventListener("playing", () => {
  console.log("playing called");
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      // .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    console.log(resizedDetections);

    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    if (resizedDetections && Object.keys(resizedDetections).length > 0) {
      const age = resizedDetections.age;
      const interpolatedAge = interpolateAgePredictions(age);
      const gender = resizedDetections.gender;
      const expressions = resizedDetections.expressions;
      const maxValue = Math.max(...Object.values(expressions));
      const emotion = Object.keys(expressions).filter(
        (item) => expressions[item] === maxValue
      );
      // document.getElementById("age").innerText = `Age - ${interpolatedAge}`;
      document.getElementById("gender").innerText = `Gender - ${gender}`;
      if (emotion[0] == "sad") {
        sad.play();
        happy.pause();
        angry.pause();
        neutral.pause();
      }
      if (emotion[0] == "happy"){
        sad.pause();
        happy.play();
        angry.pause();
        neutral.pause();
      } 
      if (emotion[0] == "neutral"){
        sad.pause();
        happy.pause();
        angry.pause();
        neutral.play();
      } 
      if (emotion[0] == "angry"){
        sad.pause();
        happy.pause();
        angry.play();
        neutral.pause();
      } 

      
      //if (gender == "female") Hide(container);
      document.getElementById("emotion").innerText = `Emotion - ${emotion[0]}`;
      
    }
  }, 10);
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30);
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length;
  return avgPredictedAge;
}
