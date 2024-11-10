// Debounce utility function
function debounce(func, delay = 1000) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to handle input with debounce
const handleInput = debounce(function () {
    console.log('hello', this.value);
    const pdbUrl = `https://files.rcsb.org/download/${this?.value}.pdb`;
    //const mmCIFUrl = 'https://files.rcsb.org/download/4hhb.cif';
    downloadAndProcessFile(pdbUrl);
}, 700);

// Attach event listener with debounced function
document.getElementById('option1').addEventListener('input', handleInput);



document.getElementById('option2').addEventListener('change', function() {
    parseFile(this);
});


function validateFile(input) {
    const filePath = input.value;
    const allowedExtension = /\.(pdb|cif)$/i;
    if (!allowedExtension.exec(filePath)) {
        alert('Please upload a .pdb or .cif file.');
        input.value = ''; // Clear the input
        return false;
    }
    return true;
}

function validateFileFASTA(input) {
    const filePath = input.value;
    const allowedExtension = /\.(fasta)$/i;
    if (!allowedExtension.exec(filePath)) {
        alert('Please upload a .fasta file.');
        input.value = ''; // Clear the input
        return false;
    }
    return true;
}

function parseFile(input) {
    if (validateFile(input)) {
        const pdbExtension = /\.(pdb)$/i;
        // const cifExtension = /\.(cif)$/i;
        const file = input.files[0];
        //console.log('===', file)
        const jsonData = JSON.stringify(file);
        const reader = new FileReader();
        reader.onload = function(event) {
            const content = event.target.result;
            const chains = extractChains(content, pdbExtension.exec(input.value)? 'pdb': 'cif');
            fillChainIDs(chains);
        };
        reader.readAsText(file);
    }
}


// Function to download the file and process it using extractChains
/* const fs = require('fs');
const path = require('path');

async function downloadAndProcessFile(url) {
    try {
        // Get the file type from the URL
        const fileType = getFileTypeFromUrl(url);
        
        // Fetch the file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the file. Status: ${response.status}`);
        }
        
        // Read the file content as text
        const content = await response.text();
        
        // Process the content (replace with actual logic)
        const chains = extractChains(content, fileType);
        fillChainIDs(chains);
        console.log('Extracted chains:', chains);

        // Ensure the 'src' folder exists
        const srcFolderPath = path.join(__dirname, 'src');
        if (!fs.existsSync(srcFolderPath)) {
            fs.mkdirSync(srcFolderPath);
        }

        // Define the file path and name based on the extension
        const fileName = `${path.basename(url).split('.')[0]}_${fileType}.${fileType}`;
        const filePath = path.join(srcFolderPath, fileName);

        // Write the file to the project folder
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`File saved at: ${filePath}`);

    } catch (error) {
        console.error('Error downloading or processing the file:', error);
    }
}

// Function to determine file type from the URL extension
function getFileTypeFromUrl(url) {
    const extension = url.split('.').pop().toLowerCase(); // Get the file extension
    if (extension === 'pdb') {
        return 'pdb';
    } else if (extension === 'cif') {
        return 'cif';
    } else {
        throw new Error('Unknown file type');
    }
} */






async function downloadAndProcessFile(url) {
    try {
        // Get the file type from the URL
        const fileType = getFileTypeFromUrl(url);
        
        // Fetch the file
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch the file. Status: ${response.status}`);
        }
        
        // Read the file content as text
        const content = await response.text();
        
        // Process the content using the extractChains function
        const chains = extractChains(content, fileType);
        fillChainIDs(chains);
        
        // Log or process the extracted data
        console.log('Extracted chains:', chains);

        // Download the file to the system
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = url.split('/').pop(); // Sets the file name to the original file name from URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error('Error downloading or processing the file:', error);
    }
}

// Function to determine file type from the URL extension
function getFileTypeFromUrl(url) {
    const extension = url.split('.').pop().toLowerCase(); // Get the file extension
    if (extension === 'pdb') {
        return 'pdb';
    } else if (extension === 'cif') {
        return 'cif';
    } else {
        throw new Error('Unknown file type');
    }
}


/* async function downloadAndProcessFile(url) {
    try {
    // Get the file type from the URL
    const fileType = getFileTypeFromUrl(url);
   
    // Fetch the file
    const response = await fetch(url);
    //console.log('file ', response, url)
    if (!response.ok) {
    throw new Error(`Failed to fetch the file. Status: ${response.status}`);
    }
   
    // Read the file content as text
    const content = await response.text();
   
    // Process the content using the extractChains function
    const chains = extractChains(content, fileType);
    fillChainIDs(chains);
   
    // Do something with the extracted data (you can log it or process it further)
    console.log('abcd', chains);
    } catch (error) {
    console.error('Error downloading or processing the file:', error);
    }
   }
   
   // Function to determine file type from the URL extension
   function getFileTypeFromUrl(url) {
    const extension = url.split('.').pop().toLowerCase(); // Get the file extension
    if (extension === 'pdb') {
    return 'pdb';
    } else if (extension === 'cif') {
    return 'cif';
    } else {
    throw new Error('Unknown file type');
    }
   } */



function extractChains(content, fileType) {
    const lines = content.split('\n');

    const parsedData = (lines || []).map(atomLine => {
        const recordName = atomLine.substring(0, 6).trim();

        if (recordName === 'ATOM') {
            const chainID = atomLine.substring(21, 22).trim();
            const pdbFileData = {
                recordName: recordName,
                atomSerialNumber: parseInt(atomLine.substring(6, 11).trim(), 10),
                atomName: atomLine.substring(12, 16).trim(),
                altLoc: atomLine.substring(16, 17).trim(),
                residueName: atomLine.substring(17, 20).trim(),
                chainID: chainID,
                residueSequenceNumber: parseInt(atomLine.substring(22, 26).trim(), 10),
                insertionCode: atomLine.substring(26, 27).trim(),
                x: parseFloat(atomLine.substring(30, 38).trim()),
                y: parseFloat(atomLine.substring(38, 46).trim()),
                z: parseFloat(atomLine.substring(46, 54).trim()),
                occupancy: parseFloat(atomLine.substring(54, 60).trim()),
                tempFactor: parseFloat(atomLine.substring(60, 66).trim()),
                segmentIdentifier: atomLine.substring(67, 68).trim(),
                elementSymbol: atomLine.substring(76, 78).trim(),
                charge: atomLine.substring(78, 80).trim()
            };

            if (fileType==='pdb') {
                return pdbFileData;
            } else {
                const parts = atomLine.match(/(\S+)/g);
                const cifFileData = {
                    recordName: parts[0],
                    atomSerialNumber: parseInt(parts[1], 10),
                    atomName: parts[2],
                    altLoc: parts[3],
                    residueName: parts[5],
                    chainID: parts[18],
                    residueSequenceNumber: parseInt(parts[6], 10),
                    insertionCode: parts[7],
                    x: parseFloat(parts[8]),
                    y: parseFloat(parts[9]),
                    z: parseFloat(parts[10]),
                    occupancy: parseFloat(parts[11]),
                    tempFactor: parseFloat(parts[12]),
                    segmentIdentifier: parts[13],
                    elementSymbol: parts[14],
                    charge: parts[15]
                };
                return cifFileData;
            }
        }
        return null;
    }).filter(Boolean);
    return parsedData;
}

function fillChainIDs(chains) {
    const nucleotide_residues = ['A', 'T', 'C', 'G', 'U', 'DA', 'DT', 'DC', 'DG', 'DU', '0A', '0T', '0C', '0G', '0U', '0DA', '0DT', '0DC', '0DG', '0DU', 'K39', 'N7X']; // Nucleotides (also include 'U' for RNA)
    const nucleotide = new Set();
    const protein = new Set();

    // Clear previous input fields
    const proteinContainer = document.getElementById('proteinChains');
    const nucleotideContainer = document.getElementById('dnaChains');
    proteinContainer.innerHTML = '';  // Clear existing inputs
    nucleotideContainer.innerHTML = '';  // Clear existing inputs

    // Separate chains into nucleotide and protein sets
    chains.forEach(item => {
        if (item?.recordName === 'ATOM' && nucleotide_residues.includes(item?.residueName)) {
            nucleotide.add(item?.chainID);
        } else {
            protein.add(item?.chainID);
        }
    });

    // Add input fields for nucleotide chains
    Array.from(nucleotide).forEach((chain, index) => {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'form-control me-1';
        newInput.placeholder = `Chain ${index + 1} (Nucleotide)`;
        newInput.value = chain;
        newInput.name = `Nucleotide Chain ${index + 1}`; // Set name attribute dynamically
        nucleotideContainer.appendChild(newInput);
    });

    // Add input fields for protein chains
    Array.from(protein).forEach((chain, index) => {
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'form-control me-1';
        newInput.placeholder = `Chain ${index + 1} (Protein)`;
        newInput.value = chain;
        newInput.name = `Protein Chain ${index + 1}`; // Set name attribute dynamically
        proteinContainer.appendChild(newInput);
    });
}

document.getElementById('myForm').addEventListener('submit', function() {
    event.preventDefault(); // Prevent the default form submission
    const formData = new FormData(this); // Create a FormData object from the form
    let payload= {}
    for (let [key, value] of formData.entries()) {
        payload[key]=value;
    }
    const encodedData = encodeURIComponent(JSON.stringify(payload));
    // window.location.href = 'submitedInfopage.html';
    window.location.href = `submitedInfopage.html?data=${encodedData}`;
    console.log(payload, 'pyaload', encodedData)
    // fetch('/submit', { // The URL to which the form data should be sent
    //     method: 'POST', // The HTTP method
    //     body: formData // The form data
    // })
    // .then(response => response.json()) // Parse the response as JSON
    // .then(data => {
    //     console.log('Success:', data); // Handle the successful response
    // })
    // .catch(error => {
    //     console.error('Error:', error); // Handle any errors
    // });
});
