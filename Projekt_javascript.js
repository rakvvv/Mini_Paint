document.addEventListener("DOMContentLoaded", () => {
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

    let prevMouseX;
    let prevMouseY;
    let canvasImage;
    let isDrawing = false;
    let selectedTool = "brush";
    let brushWidth = 6;
    let selectedColor = "#000";

    function initializeCanvas() {
        // Ustawienie szerokości i wysokości canvasu
         canvas.width = canvas.offsetWidth;
         canvas.height = canvas.offsetHeight;
        
    }
    
    function updateCanvasSize() {
        // Zapis aktualnego rysuneku
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);
    
        // Aktualizuj rozmiar canvasu
        initializeCanvas();
    
        // Przywróć rysunek
        ctx.drawImage(tempCanvas, 0, 0);
    }
    
    window.addEventListener("resize", updateCanvasSize);

    const drawRectangle = (x, y, width, height) => {
        const method = fillColorCheckbox.checked ? "fillRect" : "strokeRect";
        ctx[method](x, y, width, height);
    };

    const drawCircle = (x, y, radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        fillColorCheckbox.checked ? ctx.fill() : ctx.stroke();
    };

    const drawTriangle = (x1, y1, x2, y2, x3, y3) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        fillColorCheckbox.checked ? ctx.fill() : ctx.stroke();
    };

    const drawLine = (x1, y1, x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };
    

    const beginDrawing = (e) => {
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
        isDrawing = true;
        canvasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = brushWidth;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;
    
        // Rozpoczęcie nowej ścieżki
        ctx.beginPath();
        ctx.moveTo(prevMouseX, prevMouseY);
    };

    const stopDrawing = () => {
        isDrawing = false;
    };

    const drawing = (e) => {
        if (!isDrawing) return;

        ctx.putImageData(canvasImage, 0, 0);

        const x = e.offsetX;
        const y = e.offsetY;
        const width = prevMouseX - x;
        const height = prevMouseY - y;
        const radius = Math.hypot(prevMouseX - x, prevMouseY - y);

        switch (selectedTool) {
            case "brush":
            ctx.strokeStyle = selectedColor;
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case "eraser":
            ctx.strokeStyle = "#fff";
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case "rectangle":
            drawRectangle(x, y, prevMouseX - x, prevMouseY- y);
            break;
        case "circle":
            drawCircle(prevMouseX, prevMouseY, radius);
            break;
        case "triangle":
            drawTriangle(prevMouseX, prevMouseY, x, y, 2 * prevMouseX - x, y);
            break;
        case "line":
            drawLine(prevMouseX, prevMouseY, x, y);
            break;
        }
    };

    toolButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".options .active").classList.remove("active");
            btn.classList.add("active");
            selectedTool = btn.id;
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
      
    canvas.addEventListener("mousedown", beginDrawing);
    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mouseup", stopDrawing);

    // Obsługa rysowania na urządzeniach dotykowych
    function getTouchPos(touchEvent) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    }

    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const touchPos = getTouchPos(e);
        beginDrawing({ offsetX: touchPos.x, offsetY: touchPos.y });
    });
    
    canvas.addEventListener("touchmove", (e) => {
        
        const touchPos = getTouchPos(e);
        drawing({ offsetX: touchPos.x, offsetY: touchPos.y });
    });
    
    canvas.addEventListener("touchend", (e) => {
        stopDrawing();
    });
    // Wczytywanie danych JSON
    loadJson.addEventListener("click", () => {
        fetch("figury.json")
            .then(response => response.json())
            .then(data => {
                drawShapesFromData(data.shapes);
            })
            .catch(error => {
                console.error("Błąd podczas wczytywania danych JSON:", error);
            });
    });

    function drawShapesFromData(shapesData) {
        shapesData.forEach(shape => {
            switch (shape.type) {
                case "rectangle":
                    drawRectangle(shape.x, shape.y, shape.width, shape.height);
                    break;
                case "circle":
                    drawCircle(shape.x, shape.y, shape.radius);
                    break;
                case "triangle":
                    drawTriangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.x3, shape.y3);
                    break;
            }
        });
    }

    initializeCanvas();
    updateCanvasSize();
});
