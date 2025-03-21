// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load content from the server
    loadContentFromServer();
});

// Load content from a markdown file on the server
function loadContentFromServer() {
    const pageUrl = window.location.pathname;
    // Extract the page name from the URL (e.g., "country1" from "/pages/countries/country1.html")
    const pageName = pageUrl.split('/').pop().replace('.html', '');
    
    // Construct the path to the markdown file (assuming it's in a "content" folder)
    const markdownPath = `../../content/${pageName}.md`;
    
    // Fetch the markdown file
    fetch(markdownPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load content');
            }
            return response.text();
        })
        .then(markdownContent => {
            // Parse the markdown content
            parseAndRenderMarkdown(markdownContent);
        })
        .catch(error => {
            console.error('Error loading content:', error);
            document.getElementById('body').innerHTML = '<p>Error loading content. Please try again later.</p>';
        });
}

// Parse markdown content and populate the page
function parseAndRenderMarkdown(markdownContent) {
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
        }
        
        if (metadata.subtitle1) {
            document.getElementById('subtitle1').textContent = metadata.subtitle1;
        }
        
        if (metadata.subtitle2) {
            document.getElementById('subtitle2').textContent = metadata.subtitle2;
        }
        
        if (metadata.image) {
            document.getElementById('image').src = metadata.image;
            document.getElementById('image').alt = metadata.imageAlt || metadata.title;
        }
        
        if (metadata.table) {
            document.getElementById('table-container').innerHTML = DOMPurify.sanitize(metadata.table);
        }
        
        // Convert Markdown to HTML for the body
        const bodyHTML = DOMPurify.sanitize(marked.parse(bodyMarkdown));
        document.getElementById('body').innerHTML = bodyHTML;
    } else {
        // No front matter, treat the entire content as body
        const bodyHTML = DOMPurify.sanitize(marked.parse(markdownContent));
        document.getElementById('body').innerHTML = bodyHTML;
    }
    
    // Remove the edit button since it's no longer needed
    const editButton = document.querySelector('.edit-button');
    if (editButton) {
        editButton.remove();
    }
    
    // Hide the edit mode section
    const editMode = document.getElementById('edit-mode');
    if (editMode) {
        editMode.style.display = 'none';
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
