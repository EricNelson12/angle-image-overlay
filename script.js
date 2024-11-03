document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    let lineThickness = 1;
    let lineColor = '#333';

    // listener for line thickness input
    document.getElementById("line-thickness").addEventListener("input", (e) => {
        lineThickness = e.target.value;
        refreshCanvas();
    });

    // listener for line color input
    document.getElementById("line-color").addEventListener("input", (e) => {
        lineColor = e.target.value;
        refreshCanvas();
    }
    );

    class Dot {
        constructor(name, x, y, color) {
            this.name = name;
            this.x = x || 0;
            this.y = y || 0;
            this.color = color || '#000000';
            this.isDragging = false;
        }

        setX(x) {
            this.x = x;
        }

        setY(y) {
            this.y = y;
        }

        setColor(color) {
            this.color = color;
        }

        isMouseOver(mx, my) {
            const dx = mx - this.x;
            const dy = my - this.y;
            return Math.sqrt(dx * dx + dy * dy) < 5; // Check if mouse is within dot radius
        }
    }

    // Initialize dots
    const dots = {
        dot1: new Dot('dot1', 100, 100, '#ff0000'),
        dot2: new Dot('dot2', 200, 200, '#0000ff'),
        dot3: new Dot('dot3', 300, 100, '#ffff00')
    };

    let draggingDot = null;

    function calculateAngle(dotA, dotB, dotC) {
        const dx1 = dotA.x - dotB.x;
        const dy1 = dotA.y - dotB.y;
        const dx2 = dotC.x - dotB.x;
        const dy2 = dotC.y - dotB.y;
        const angle = Math.acos((dx1 * dx2 + dy1 * dy2) /
            (Math.sqrt(dx1 ** 2 + dy1 ** 2) * Math.sqrt(dx2 ** 2 + dy2 ** 2))
        );
        return angle * (180 / Math.PI); // Convert to degrees
    }
    let backgroundImage = null; // Variable to store the background image

    function setBackgroundImage(file) {
        const img = new Image();
        img.onload = () => {
            backgroundImage = img; // Store the image in the variable
            refreshCanvas(); // Redraw canvas with the new background
        };
        img.src = URL.createObjectURL(file);
    }
    
    function refreshCanvas() {
        // Clear the canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Draw the background image, if it exists
        if (backgroundImage) {
            ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        }
    

    
        // Calculate and draw the angles at each dot
        const angle1 = calculateAngle(dots.dot2, dots.dot1, dots.dot3);
        const angle2 = calculateAngle(dots.dot1, dots.dot2, dots.dot3);
        const angle3 = calculateAngle(dots.dot1, dots.dot3, dots.dot2);
    
        // Display the angles near each dot
        ctx.fillStyle = lineColor // Set the font color from line color
        ctx.font = '14px Arial';
        // Set the font color to line color

        // Draw lines between each pair of dots
        ctx.beginPath();
        ctx.moveTo(dots.dot1.x, dots.dot1.y);
        ctx.lineTo(dots.dot2.x, dots.dot2.y);
        ctx.lineTo(dots.dot3.x, dots.dot3.y);
        ctx.closePath(); // Optional: closes the triangle
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillText(`${angle1.toFixed(1)}°`, dots.dot1.x + 10, dots.dot1.y - 10);
        ctx.fillText(`${angle2.toFixed(1)}°`, dots.dot2.x + 10, dots.dot2.y - 10);
        ctx.fillText(`${angle3.toFixed(1)}°`, dots.dot3.x + 10, dots.dot3.y - 10);
    
        // Draw each dot on the canvas
        Object.values(dots).forEach(dot => {
            ctx.fillStyle = dot.color;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    // Listener for file input
    document.getElementById("file-input").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setBackgroundImage(file);
        }
    });
    function onMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if mouse is over any dot
        for (const dot of Object.values(dots)) {
            if (dot.isMouseOver(mouseX, mouseY)) {
                draggingDot = dot;
                draggingDot.isDragging = true;
                break;
            }
        }
    }

    function onMouseMove(e) {
        if (draggingDot && draggingDot.isDragging) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Update the position of the dragging dot
            draggingDot.setX(mouseX);
            draggingDot.setY(mouseY);

            // Update the input fields for the dot's new position
            document.querySelector(`[data-dot-name="${draggingDot.name}"].x-coord`).value = mouseX;
            document.querySelector(`[data-dot-name="${draggingDot.name}"].y-coord`).value = mouseY;

            // Redraw the canvas
            refreshCanvas();
        }
    }

    function onMouseUp() {
        if (draggingDot) {
            draggingDot.isDragging = false;
            draggingDot = null;
        }
    }

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        refreshCanvas(); // Redraw dots after resizing
    }

    // Event listeners for dragging functionality
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp); // Stop dragging if mouse leaves canvas

    // Call `refreshCanvas` on load and when inputs change
    window.onload = refreshCanvas;
    document.querySelectorAll('[data-dot-name]').forEach(input => {
        input.addEventListener('input', refreshCanvas);
    });

    // Adjust canvas size on window resize
    window.addEventListener('load', resizeCanvas);
    window.addEventListener('resize', resizeCanvas);

 
});