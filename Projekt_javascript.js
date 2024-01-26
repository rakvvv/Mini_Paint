const canvas = document.querySelector("canvas");
const toolButtons = document.querySelectorAll(".tool");
const fillColorCheckbox = document.querySelector("#fill-color");
const sizeSlider = document.querySelector("#size-slider");
const colorButtons = document.querySelectorAll(".colors .option");
const clearCanvasButton = document.querySelector(".clear-canvas");
const loadJson = document.querySelector(".load-json");
const colorSelector = document.querySelector("#color-selector");
const saveImage = document.querySelector(".save-img");
const ctx = canvas.getContext("2d");

let prevMouseX,
  prevMouseY,
  snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 6,
  selectedColor = "#000";

window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
});

const updateCanvasSize = () => {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");
  tempCtx.drawImage(canvas, 0, 0);

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.drawImage(tempCanvas, 0, 0);
};

window.addEventListener("load", updateCanvasSize);
window.addEventListener("resize", updateCanvasSize);

const drawRectangle = (e) => {
  if (fillColorCheckbox.checked) {
    return ctx.fillRect(
      e.offsetX,
      e.offsetY,
      prevMouseX - e.offsetX,
      prevMouseY - e.offsetY
    );
  }
  return ctx.strokeRect(
    e.offsetX,
    e.offsetY,
    prevMouseX - e.offsetX,
    prevMouseY - e.offsetY
  );
};

const drawCircle = (e) => {
  ctx.beginPath();
  let radius = Math.sqrt( Math.pow(prevMouseX - e.offsetX, 2) + Math.pow(prevMouseY - e.offsetY, 2) );
  ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
  ctx.stroke();
  if (fillColorCheckbox.checked) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

const drawTriangle = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
  ctx.closePath();
  if (fillColorCheckbox.checked) {
    ctx.fill();
  } else {
    ctx.stroke();
  }
};

const drawLine = (e) => {
  ctx.beginPath();
  ctx.moveTo(prevMouseX, prevMouseY);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
};

const startDrawing = (e) => {
  prevMouseX = e.offsetX;
  prevMouseY = e.offsetY;
  isDrawing = true;
  ctx.beginPath();
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
};

const stopDrawing = () => {
  isDrawing = false;
};

const drawing = (e) => {
  if (!isDrawing) return;

  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush") {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "eraser") {
    ctx.strokeStyle = "#fff";
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRectangle(e);
  } else if (selectedTool === "circle") {
    drawCircle(e);
  } else if (selectedTool === "triangle") {
    drawTriangle(e);
  } else if (selectedTool === "line") {
    drawLine(e);
  }

  e.preventDefault();
};

toolButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
    console.log(selectedTool);
  });
});

sizeSlider.addEventListener("change", () => (brushWidth = sizeSlider.value));

colorButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

colorSelector.addEventListener("change", () => {
  colorSelector.parentElement.style.background = colorSelector.value;
  colorSelector.parentElement.click();
});

clearCanvasButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

saveImage.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "obraz.jpg";
  link.href = canvas.toDataURL();
  link.click();
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", stopDrawing);

//Rysowanie dla telefonu
function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

const drawForPhone = (e) => {
  if (!isDrawing || !e.touches || e.touches.length === 0) return;

  const touch = e.touches[0];
  const touchPos = getTouchPos(touch);
  ctx.putImageData(snapshot, 0, 0);

  switch (selectedTool) {
    case "brush":
      ctx.lineTo(touchPos.x, touchPos.y);
      ctx.stroke();
      break;
    case "eraser":
      ctx.strokeStyle = "#fff";
      ctx.lineTo(touchPos.x, touchPos.y);
      ctx.stroke();
      break;
    case "rectangle":
      drawRectangle(touchPos);
      break;
    case "circle":
      drawCircle(touchPos);
      break;
    case "triangle":
      drawTriangle(touchPos);
      break;
  }
};

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  startDrawing(getTouchPos(touch));
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  drawForPhone(e);
});

canvas.addEventListener("touchend", stopDrawing);
//Odczyt plikow json

loadJson.addEventListener("click", () => {
    fetch("figury.json")
    .then(response => response.json())
    .then(data => {
      // Wczytane dane JSON
      console.log("Dane JSON:", data);
  
      // Rysowanie kształtów na canvasie
      drawShapesFromData(data.shapes);
    })
    .catch(error => {
      console.error("Błąd podczas wczytywania danych JSON:", error);
    });
});


function drawShapesFromData(shapesData) {
    // Iteruj po danych kształtów
    shapesData.forEach(shape => {
      switch (shape.type) {
        case "rectangle":
          drawRectangleFromData(shape);
          break;
        case "circle":
          drawCircleFromData(shape);
          break;
        case "triangle":
          drawTriangleFromData(shape);
          break;
      }
    });
  }
  
  function drawRectangleFromData(rectangleData) {
    ctx.beginPath();
    if (rectangleData.fill) {
      ctx.fillStyle = rectangleData.fillColor || selectedColor;
      ctx.fillRect(rectangleData.x, rectangleData.y, rectangleData.width, rectangleData.height);
    } else {
      ctx.strokeStyle = rectangleData.strokeColor || selectedColor;
      ctx.strokeRect(rectangleData.x, rectangleData.y, rectangleData.width, rectangleData.height);
    }
  }
  
  function drawCircleFromData(circleData) {
    ctx.beginPath();
    ctx.arc(circleData.x, circleData.y, circleData.radius, 0, 2 * Math.PI);
    if (circleData.fill) {
      ctx.fillStyle = circleData.fillColor || selectedColor;
      ctx.fill();
    } else {
      ctx.strokeStyle = circleData.strokeColor || selectedColor;
      ctx.stroke();
    }
  }
  
  function drawTriangleFromData(triangleData) {
    ctx.beginPath();
    ctx.moveTo(triangleData.x1, triangleData.y1);
    ctx.lineTo(triangleData.x2, triangleData.y2);
    ctx.lineTo(triangleData.x3, triangleData.y3);
    ctx.closePath();
    if (triangleData.fill) {
      ctx.fillStyle = triangleData.fillColor || selectedColor;
      ctx.fill();
    } else {
      ctx.strokeStyle = triangleData.strokeColor || selectedColor;
      ctx.stroke();
    }
  }