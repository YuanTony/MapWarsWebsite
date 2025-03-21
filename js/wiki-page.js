// Initialize the page when loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load content from localStorage if available
    loadContentFromStorage();
});

// Toggle between view and edit modes
function toggleEditMode() {
    const viewMode = document.getElementById('view-mode');
    const editMode = document.getElementById('edit-mode');
    
    if (viewMode.style.display === 'none') {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    } else {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        
        // Fill edit fields with current content
        document.getElementById('edit-title').value = document.getElementById('title').textContent;
        document.getElementById('edit-subtitle1').value = document.getElementById('subtitle1').textContent;
        document.getElementById('edit-subtitle2').value = document.getElementById('subtitle2').textContent;
        document.getElementById('edit-image').value = document.getElementById('image').src;
        
        // Get table HTML
        const tableHTML = document.getElementById('table-container').innerHTML;
        document.getElementById('edit-table').value = tableHTML;
        
        // Get body content
        const bodyContent = document.getElementById('body').innerHTML;
        // Try to convert HTML back to Markdown (simplified approach)
        // This is a basic approach - a real implementation would use a HTML-to-Markdown converter
        document.getElementById('edit-body').value = bodyContent.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').trim();
    }
}

// Save changes to localStorage and update the view
function saveChanges() {
    // Get values from edit fields
    const title = document.getElementById('edit-title').value;
    const subtitle1 = document.getElementById('edit-subtitle1').value;
    const subtitle2 = document.getElementById('edit-subtitle2').value;
    const imageUrl = document.getElementById('edit-image').value;
    const tableHTML = document.getElementById('edit-table').value;
    const bodyMarkdown = document.getElementById('edit-body').value;
    
    // Update the view
    document.getElementById('title').textContent = title;
    document.getElementById('subtitle1').textContent = subtitle1;
    document.getElementById('subtitle2').textContent = subtitle2;
    document.getElementById('image').src = imageUrl;
    
    // Update table (with sanitization)
    document.getElementById('table-container').innerHTML = DOMPurify.sanitize(tableHTML);
    
    // Convert Markdown to HTML for the body
    const bodyHTML = DOMPurify.sanitize(marked.parse(bodyMarkdown));
    document.getElementById('body').innerHTML = bodyHTML;
    
    // Save to localStorage
    const pageUrl = window.location.pathname;
    const pageData = {
        title: title,
        subtitle1: subtitle1,
        subtitle2: subtitle2,
        imageUrl: imageUrl,
        tableHTML: tableHTML,
        bodyMarkdown: bodyMarkdown
    };
    
    localStorage.setItem('wiki_page_' + pageUrl, JSON.stringify(pageData));
    
    // Update document title
    document.title = title + ' - Wiki Project';
    
    // Switch back to view mode
    toggleEditMode();
}

// Cancel edit and revert to view mode without saving
function cancelEdit() {
    toggleEditMode();
}

// Load content from localStorage if available
function loadContentFromStorage() {
    const pageUrl = window.location.pathname;
    const savedData = localStorage.getItem('wiki_page_' + pageUrl);
    
    if (savedData) {
        const pageData = JSON.parse(savedData);
        
        // Update the view with saved data
        document.getElementById('title').textContent = pageData.title;
        document.getElementById('subtitle1').textContent = pageData.subtitle1;
        document.getElementById('subtitle2').textContent = pageData.subtitle2;
        document.getElementById('image').src = pageData.imageUrl;
        document.getElementById('table-container').innerHTML = DOMPurify.sanitize(pageData.tableHTML);
        
        // Convert Markdown to HTML for the body
        const bodyHTML = DOMPurify.sanitize(marked.parse(pageData.bodyMarkdown));
        document.getElementById('body').innerHTML = bodyHTML;
        
        // Update document title
        document.title = pageData.title + ' - Wiki Project';
    }
}
