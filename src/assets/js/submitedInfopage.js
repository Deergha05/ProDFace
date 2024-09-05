function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return params.get('data');
}

// Decode and parse the JSON data
const encodedData = getQueryParams();
const data = JSON.parse(decodeURIComponent(encodedData));

// Function to dynamically create key-value pairs in the UI
function populateDetails(data) {
    const container = document.getElementById('detailContainer');

    // Clear any existing content
    container.innerHTML = '';

    // Iterate over the data object and create key-value pairs
    for (const [key, value] of Object.entries(data)) {
        // Create a new row for each key-value pair
        const rowDiv = document.createElement('div');
        rowDiv.className = 'info-div mb-2'; // Class for row styling

        // Create and append the key element
        const keyDiv = document.createElement('div');
        keyDiv.className = 'col key detail-txt-left'; // Column width and key styling
        keyDiv.textContent = `${key}:`;
        rowDiv.appendChild(keyDiv);

        // Create and append the value element
        const valueDiv = document.createElement('div');
        valueDiv.className = 'col value detail-txt-right'; // Column width and value styling
        valueDiv.textContent = `${value}`;
        rowDiv.appendChild(valueDiv);

        // Append the row to the container
        container.appendChild(rowDiv);
    }
}

// Call the function to populate the details
populateDetails(data);
