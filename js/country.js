// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the country parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get('country');
    
    if (country) {
        // Load the specified country content
        loadCountryContent(country);
    } else {
        // No country specified, show an error message
        displayError('No country specified. Please use a URL like "country.html?country=france"');
    }
});

// Load content from a country markdown file
function loadCountryContent(country) {
    // Convert to lowercase for consistency and security
    const countryName = country.toLowerCase();
    
    // Sanitize to prevent path traversal attacks
    if (!isValidCountryName(countryName)) {
        displayError('Invalid country name specified');
        return;
    }
    
    // Construct the path to the markdown file (in content/countries folder)
    const markdownPath = `../content/countries/${countryName}.txt`;
    
    // Update page title to show which country is being loaded
    document.title = `${countryName.charAt(0).toUpperCase() + countryName.slice(1)} - Wiki Project`;
    
    // Fetch the markdown file
    fetch(markdownPath)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load content for ${countryName}`);
            }
            console.log(response);
            return response.text();
        })
        .then(markdownContent => {
            // Parse the markdown content
            console.log(markdownContent);
            parseAndRenderMarkdown(markdownContent, countryName);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            displayError(`Could not load information for "${countryName}". The content may not exist.`);
        });
}

// Validate country name to prevent path traversal attacks
function isValidCountryName(name) {
    // Only allow alphanumeric characters and hyphens
    return /^[a-z0-9-]+$/.test(name);
}

// Display an error message on the page
function displayError(message) {
    document.getElementById('title').textContent = 'Error';
    document.getElementById('subtitle1').textContent = '';
    document.getElementById('subtitle2').textContent = '';
    document.getElementById('image-container').style.display = 'none';
    document.getElementById('table-container').style.display = 'none';
    document.getElementById('body').innerHTML = `<p class="error-message">${message}</p>`;
}

// Parse markdown content and populate the page
function parseAndRenderMarkdown(markdownContent, countryName) {
    // Split the content to extract metadata and body
    const contentParts = markdownContent.split('---');
    
    if (contentParts.length >= 3) {
        // The content has front matter (metadata section between --- markers)
        const metadata = parseYAMLFrontMatter(contentParts[1]);
        const bodyMarkdown = contentParts.slice(2).join('---').trim();
        
        // Update page with metadata
        if (metadata.title) {
            document.getElementById('title').textContent = metadata.title;
            document.title = metadata.title + ' - Wiki Project';
        } else {
            // Capitalize the country name if no title provided
            document.getElementById('title').textContent = countryName.charAt(0).toUpperCase() + countryName.slice(1);
        }
        
        if (metadata.subtitle1) {
            document.getElementById('subtitle1').textContent = metadata.subtitle1;
        }
        
        if (metadata.subtitle2) {
            document.getElementById('subtitle2').textContent = metadata.subtitle2;
        }
        
        if (metadata.image) {
            document.getElementById('image').src = metadata.image;
            document.getElementById('image').alt = metadata.imageAlt || metadata.title || countryName;
            document.getElementById('image-container').style.display = 'block';
        } else {
            document.getElementById('image-container').style.display = 'none';
        }
        
        if (metadata.table) {
            document.getElementById('table-container').innerHTML = DOMPurify.sanitize(metadata.table);
            document.getElementById('table-container').style.display = 'block';
        } else {
            document.getElementById('table-container').style.display = 'none';
        }
        
        // Convert Markdown to HTML for the body
        const bodyHTML = DOMPurify.sanitize(marked.parse(bodyMarkdown));
        document.getElementById('body').innerHTML = bodyHTML;
    } else {
        // No front matter, treat the entire content as body
        document.getElementById('title').textContent = countryName.charAt(0).toUpperCase() + countryName.slice(1);
        document.getElementById('subtitle1').textContent = '';
        document.getElementById('subtitle2').textContent = '';
        document.getElementById('image-container').style.display = 'none';
        document.getElementById('table-container').style.display = 'none';
        
        const bodyHTML = DOMPurify.sanitize(marked.parse(markdownContent));
        document.getElementById('body').innerHTML = bodyHTML;
    }
}

// Simple YAML front matter parser
function parseYAMLFrontMatter(yamlString) {
    const metadata = {};
    const lines = yamlString.trim().split('\n');
    
    lines.forEach(line => {
        if (line.includes(':')) {
            const [key, value] = line.split(':');
            if (key && value) {
                metadata[key.trim()] = value.trim();
            }
        }
    });
    
    return metadata;
}
