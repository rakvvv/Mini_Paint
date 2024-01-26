document.getElementById("openFormLink").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("formPopup").classList.add("show");
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("overlay").addEventListener("click", function(event) {
    if (event.target === this) {
        document.querySelectorAll(".popup.show").forEach(function(popup) {
            popup.classList.remove("show");
        });
        this.style.display = "none";
    }
});

document.getElementById("closeBtn").addEventListener("click", function() {
    document.getElementById("formPopup").classList.remove("show");
    document.getElementById("overlay").style.display = "none";
});
document.getElementById("bugReportLink").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("bugReportPopup").classList.add("show");
    document.getElementById("overlay").style.display = "block";
});

document.getElementById("closeBugBtn").addEventListener("click", function() {
    document.getElementById("bugReportPopup").classList.remove("show");
    document.getElementById("overlay").style.display = "none";
});