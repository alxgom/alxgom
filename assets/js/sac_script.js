document.getElementById('rent').addEventListener('input', updatePricePerUnitArea);
document.getElementById('total_area').addEventListener('input', updatePricePerUnitArea);
document.getElementById('alpha').addEventListener('input', function() {
    document.getElementById('alpha-value').textContent = this.value;
});

function updatePricePerUnitArea() {
    const rent = parseFloat(document.getElementById('rent').value);
    const totalArea = parseFloat(document.getElementById('total_area').value);
    const pricePerUnitAreaDiv = document.getElementById('price-per-unit-area');

    if (!isNaN(rent) && !isNaN(totalArea) && totalArea > 0) {
        const pricePerUnitArea = (rent / totalArea).toFixed(2);
        pricePerUnitAreaDiv.innerHTML = `Price per unit area: ${pricePerUnitArea}`;
    } else {
        pricePerUnitAreaDiv.innerHTML = '';
    }
}

document.getElementById('num_rooms').addEventListener('input', function() {
    const numRooms = parseInt(this.value);
    const roomDimensionsContainer = document.getElementById('room-dimensions-container');
    roomDimensionsContainer.innerHTML = '';

    for (let i = 1; i <= numRooms; i++) {
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room-dimension');
        roomDiv.innerHTML = `
            <label>Dimensions of room ${i}:</label>
            <div class="room-dimensions">
                <input type="number" name="room_width" placeholder="Width" required>
                <input type="number" name="room_length" placeholder="Length" required>
            </div>
        `;
        roomDimensionsContainer.appendChild(roomDiv);
    }
});

document.getElementById('rent-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const rent = parseFloat(formData.get('rent'));
    const totalArea = parseFloat(formData.get('total_area'));
    const numRooms = parseInt(formData.get('num_rooms'));
    const alpha = parseFloat(formData.get('alpha'));
    const roomWidths = formData.getAll('room_width').map(Number);
    const roomLengths = formData.getAll('room_length').map(Number);
    const roomDimensions = roomWidths.map((width, index) => [width, roomLengths[index]]);
    const bills = formData.get('bills') ? parseFloat(formData.get('bills')) : null;

    const roomAreas = roomDimensions.map(dimension => dimension[0] * dimension[1]);
    const totalRoomArea = roomAreas.reduce((a, b) => a + b, 0);
    const sharedArea = totalArea - totalRoomArea;

    const warningDiv = document.getElementById('warning');
    if (sharedArea < 0) {
        warningDiv.innerHTML = `Warning: Total area of the rooms (${totalRoomArea}) is greater than the total area of the apartment (${totalArea}).`;
        return;
    } else {
        warningDiv.innerHTML = '';
    }

    const effectiveArea = totalRoomArea + alpha * sharedArea;
    const effectiveRentPerArea = rent / effectiveArea;

    const rentPerRoom = roomAreas.map(area => {
        const effectiveRoomArea = area + alpha * (sharedArea / numRooms);
        return parseFloat((effectiveRoomArea * effectiveRentPerArea).toFixed(2));
    });

    const sharedSpaceCostPerRoom = parseFloat(((alpha * sharedArea * effectiveRentPerArea) / numRooms).toFixed(2));

    const totalRentPerRoom = bills !== null ? 
        rentPerRoom.map(rentRoom => parseFloat((rentRoom + bills / numRooms).toFixed(2))) :
        rentPerRoom;

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';
    totalRentPerRoom.forEach((rent, index) => {
        resultDiv.innerHTML += `<p>Room ${index + 1} should pay ${rent} in rent (${sharedSpaceCostPerRoom} for shared space)${bills ? ' and bills' : ''}.</p>`;
    });

    displayRoomVisualization(roomDimensions, sharedArea, totalArea);
});

function displayRoomVisualization(roomDimensions, sharedArea, totalArea) {
    const roomVisualizationDiv = document.getElementById('room-visualization');
    roomVisualizationDiv.innerHTML = '';

    const scale = Math.sqrt(totalArea) / 300; // Scale down to fit within a 300px width

    roomDimensions.forEach((dimensions, index) => {
        const width = dimensions[0] / scale;
        const length = dimensions[1] / scale;
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room');
        roomDiv.style.width = `${width}px`;
        roomDiv.style.height = `${length}px`;
        roomDiv.textContent = `Room ${index + 1}`;
        roomVisualizationDiv.appendChild(roomDiv);
    });

    const sharedWidth = Math.sqrt(sharedArea) / scale;
    const sharedDiv = document.createElement('div');
    sharedDiv.classList.add('shared-space');
    sharedDiv.style.width = `${sharedWidth}px`;
    sharedDiv.style.height = `${sharedWidth}px`;
    sharedDiv.textContent = 'Shared Space';
    roomVisualizationDiv.appendChild(sharedDiv);
}
