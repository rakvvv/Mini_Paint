/**
 * Obsługuje kliknięcie na link otwierający formularz i wyświetla go.
 * @param {Event} event - Obiekt zdarzenia kliknięcia.
 */
 document.getElementById("openFormLink").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("formPopup").classList.add("show");
    document.getElementById("overlay").style.display = "block";
});

/**
 * Obsługuje kliknięcie na overlay i zamyka aktywne popupy.
 * @param {Event} event - Obiekt zdarzenia kliknięcia.
 */
document.getElementById("overlay").addEventListener("click", function(event) {
    if (event.target === this) {
        document.querySelectorAll(".popup.show").forEach(function(popup) {
            popup.classList.remove("show");
        });
        this.style.display = "none";
    }
});

/**
 * Obsługuje kliknięcie na przycisk zamknięcia formularza.
 */
document.getElementById("closeBtn").addEventListener("click", function() {
    document.getElementById("formPopup").classList.remove("show");
    document.getElementById("overlay").style.display = "none";
});

/**
 * Obsługuje kliknięcie na link zgłaszający błąd i wyświetla formularz zgłaszania błędu.
 * @param {Event} event - Obiekt zdarzenia kliknięcia.
 */
document.getElementById("bugReportLink").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("bugReportPopup").classList.add("show");
    document.getElementById("overlay").style.display = "block";
});

/**
 * Obsługuje kliknięcie na przycisk zamknięcia formularza zgłaszania błędu.
 */
document.getElementById("closeBugBtn").addEventListener("click", function() {
    document.getElementById("bugReportPopup").classList.remove("show");
    document.getElementById("overlay").style.display = "none";
});

/**
 * Obsługuje submit formularza, sprawdza dane i wyświetla odpowiednie alerty.
 * @param {Event} event - Obiekt zdarzenia submit formularza.
 */
document.getElementById('myForm').addEventListener('submit', function(event) {
    event.preventDefault();

    var firstname = document.getElementById('firstname').value;
    var email = document.getElementById('email').value;
    var emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

    if (!firstname) {
        alert('Proszę wpisać imię.');
        return false;
    }

    if (!email.match(emailRegex)) {
        alert('Proszę wpisać prawidłowy adres email.');
        return false;
    }
    alert('Formularz wysłany!'); 
});

/**
 * Dodanie nasłuchiwacza zdarzeń, który czeka na załadowanie całej zawartości strony
 */
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext("2d");

    const toolButtons = document.querySelectorAll(".tool");
    const fillColor = document.querySelector("#fill-color");
    const clearCanvasButton = document.querySelector(".clear-canvas");
    const loadJson = document.querySelector(".load-json");
    const sizeSlider = document.querySelector("#size-slider");
    const colorButtons = document.querySelectorAll(".colors .option");
    const colorSelector = document.querySelector("#color-selector");
    const saveImage = document.querySelector(".save-img");

    // Zmienne do przechowywania informacji o stanie rysowania
    let prevX;
    let prevY;
    let canvasImage;
    let isDrawing = false;

    let selectedColor = "#000";
    let selectedTool = "brush";
    let brushWidth = 6;

    /**
     * Funkcja inicjalizująca canvas, ustawiająca jego rozmiar
     */
    function initializeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    /**
     * Funkcja aktualizująca rozmiar canvasu, gdy zmieni się rozmiar okna
     */
    function updateCanvasSize() {
        // Zapis aktualnego rysunku
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

    // Funkcje do rysowania różnych kształtów

    /**
     * Funkcja rysująca prostokąt na canvasie.
     * @param {number} x - Położenie X prostokąta.
     * @param {number} y - Położenie Y prostokąta.
     * @param {number} width - Szerokość prostokąta.
     * @param {number} height - Wysokość prostokąta.
     */
    const drawRectangle = (x, y, width, height) => {
        const method = fillColor.checked ? "fillRect" : "strokeRect";
        ctx[method](x, y, width, height);
    };

    /**
     * Funkcja rysująca okrąg na canvasie.
     * @param {number} x - Położenie X środka okręgu.
     * @param {number} y - Położenie Y środka okręgu.
     * @param {number} radius - Promień okręgu.
     */
    const drawCircle = (x, y, radius) => {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        fillColor.checked ? ctx.fill() : ctx.stroke();
    };

    /**
     * Funkcja rysująca trójkąt na canvasie.
     * @param {number} x1 - Położenie X pierwszego wierzchołka.
     * @param {number} y1 - Położenie Y pierwszego wierzchołka.
     * @param {number} x2 - Położenie X drugiego wierzchołka.
     * @param {number} y2 - Położenie Y drugiego wierzchołka.
     * @param {number} x3 - Położenie X trzeciego wierzchołka.
     * @param {number} y3 - Położenie Y trzeciego wierzchołka.
     */
    const drawTriangle = (x1, y1, x2, y2, x3, y3) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        fillColor.checked ? ctx.fill() : ctx.stroke();
    };

    /**
     * Funkcja rysująca linię na canvasie.
     * @param {number} x1 - Położenie X początku linii.
     * @param {number} y1 - Położenie Y początku linii.
     * @param {number} x2 - Położenie X końca linii.
     * @param {number} y2 - Położenie Y końca linii.
     */
    const drawLine = (x1, y1, x2, y2) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    // Funkcje obsługujące rysowanie

    /**
     * Funkcja rozpoczynająca rysowanie na canvasie.
     * @param {Event} e - Obiekt zdarzenia myszy.
     */
    const beginDrawing = (e) => {
        prevX = e.offsetX;
        prevY = e.offsetY;
        isDrawing = true;
        canvasImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = brushWidth;
        ctx.strokeStyle = selectedColor;
        ctx.fillStyle = selectedColor;

        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
    };

    /**
     * Funkcja rysująca podczas przesuwania myszy po canvasie.
     * @param {Event} e - Obiekt zdarzenia myszy.
     */
    const drawing = (e) => {
        if (!isDrawing) return;
        ctx.putImageData(canvasImage, 0, 0);
        const x = e.offsetX;
        const y = e.offsetY;
        const radius = Math.hypot(prevX - x, prevY - y);

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
                drawRectangle(x, y, prevX - x, prevY- y);
                break;
            case "circle":
                drawCircle(prevX, prevY, radius);
                break;
            case "triangle":
                drawTriangle(prevX, prevY, x, y, 2 * prevX - x, y);
                break;
            case "line":
                drawLine(prevX, prevY, x, y);
                break;
        }
    };

    /**
     * Funkcja kończąca rysowanie.
     */
    const stopDrawing = () => {
        isDrawing = false;
    };

    // Dodanie klasy active do opcji
    toolButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.querySelector(".options .active").classList.remove("active");
            btn.classList.add("active");
            selectedTool = btn.id;
        });
    });

    // Zmiana szerokości pędzla
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

    // Obsługa rysowania na desktopach
    canvas.addEventListener("mousedown", beginDrawing);
    canvas.addEventListener("mousemove", drawing);
    canvas.addEventListener("mouseup", stopDrawing);

    // Obsługa rysowania na urządzeniach mobilnych
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

    /**
     * Funkcja rysująca kształty na canvasie na podstawie danych JSON.
     * @param {Array} shapesData - Tablica z danymi kształtów do narysowania.
     */
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
