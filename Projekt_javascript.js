document.addEventListener("DOMContentLoaded", function () {
    var listItems = document.querySelectorAll("li");

    listItems.forEach(function (item) {
        item.addEventListener("click", function () {
            listItems.forEach(function (li) {
                li.classList.remove("active");
            });
            this.classList.add("active");
        });
    });
});
const canvas = document.querySelector("canvas"),
toolBtns = document.querySelectorAll(".tool"),
fillColor = document.querySelector("#fill-color"),
sizeSlider = document.querySelector("#size-slider"),
colorBtns = document.querySelectorAll(".colors .option"),
clearCanvas = document.querySelector(".clear-canvas"),
colorSelector = document.querySelector("#color-selector"),
saveImg = document.querySelector(".save-img"),
ctx = canvas.getContext("2d");

let prevMouseX,prevMouseY,snapshot,
isDrawing = false,
selectedTool = "brush",
brushWidth = 6,
selectedColor = "#000";

window.addEventListener("load", () => {
    //zmienianie wielkosci ,offsetwidth i offsetheight zwracaja widoczną wyskosc i szerokosc elementu
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
});


const drawRectangle = (e) => {
    if(fillColor.checked){
       return ctx.fillRect(e.offsetX,e.offsetY,prevMouseX - e.offsetX,prevMouseY - e.offsetY);
    }
    return ctx.strokeRect(e.offsetX,e.offsetY,prevMouseX - e.offsetX,prevMouseY - e.offsetY);
    
}
const drawCircle = (e) => {
        ctx.beginPath();
     let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX),2) + Math.pow((prevMouseY - e.offsetY),2));
      ctx.arc(prevMouseX,prevMouseY,radius,0,2*Math.PI);
      ctx.stroke();
      if(fillColor.checked){
        ctx.fill();
      }else{
        ctx.stroke();
      }
}

const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX,prevMouseY); //przekierowuje trojkat do kursora
    ctx.lineTo(e.offsetX,e.offsetY); // tworzy pierwsza linie wzgledem kursora
    ctx.lineTo(prevMouseX * 2 - e.offsetX,e.offsetY);// tworzy dolna linie trojkata
    ctx.closePath();
    if(fillColor.checked){
        ctx.fill();
    }else{
        ctx.stroke();
    }
}

const drawLine = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX,prevMouseY);
    ctx.lineTo(e.offsetX,e.offsetY);
    ctx.stroke();
}


const startDraw = (e) => {
    e.preventDefault();
    prevMouseX = e.type === 'touchstart' ? e.touches[0].pageX - canvas.getBoundingClientRect().left : e.offsetX;
    prevMouseY = e.type === 'touchstart' ? e.touches[0].pageY - canvas.getBoundingClientRect().top : e.offsetY;
    isDrawing = true;
    ctx.beginPath(); // tworzy nowa sciezke do rysowania
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0,0,canvas.width,canvas.height)//kopiowanie danych z canvas do snapshot co pozwala ze nie bedzie mozna ruszac obrazem
}
const stopDraw = () =>{
    isDrawing = false;
}

const drawing = (e) => {
    if(!isDrawing) return;
    e.preventDefault();
    const x = e.type === 'touchmove' ? e.touches[0].pageX - canvas.getBoundingClientRect().left : e.offsetX;
    const y = e.type === 'touchmove' ? e.touches[0].pageY - canvas.getBoundingClientRect().top : e.offsetY;
    ctx.putImageData(snapshot,0,0); // dodaje skopiowane dane z snapshot na canvas
    if(selectedTool === "brush"){
        ctx.lineTo(e.offsetX,e.offsetY); // robieni lini za posrednictwem kursora
        ctx.stroke(); // rysowanie/ wypelnainia lini kolorami
    }else if(selectedTool === "eraser"){
        ctx.strokeStyle ="#fff";
        ctx.lineTo(e.offsetX,e.offsetY);
        ctx.stroke(); 
    }else if(selectedTool === "rectangle"){
        drawRectangle(e);
    }else if(selectedTool === "circle"){
        drawCircle(e);
    }else if(selectedTool === "triangle"){
        drawTriangle(e);
    }
}

toolBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .active").classList.remove("active");//zabieranie klasy active z wczesniejszej opcji i dodawanie jej na nowa opcje
        btn.classList.add("active")
        selectedTool = btn.id;
        console.log(selectedTool);
    });
});

sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

colorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelector(".options .selected").classList.remove("selected");
        btn.classList.add("selected")
        selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
});

colorSelector.addEventListener("change", () => {
    //przekazywanie wybranego koloru z selektora do ostatnie przycisku jako tlo
    colorSelector.parentElement.style.background = colorSelector.value;
    colorSelector.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0,0,canvas.width,canvas.height);
});
saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = 'obraz.jpg';
    link.href = canvas.toDataURL();
    link.click();
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


canvas.addEventListener("mousedown", startDraw)
canvas.addEventListener("mousemove", drawing)
canvas.addEventListener("mouseup", stopDraw) 

canvas.addEventListener("touchstart", startDraw);
canvas.addEventListener("touchmove", drawing);
canvas.addEventListener("touchend", stopDraw);
