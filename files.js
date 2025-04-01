document.addEventListener('DOMContentLoaded', () => {
    loadFiles();

    // Form submission
    document.getElementById('file-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const link = document.getElementById('link-input').value.trim();
        if (link) {
            shareLink(link);
        }
    });

    // File input change
    document.getElementById('file-input').addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Drag and drop functionality
    const dropArea = document.querySelector('.border-dashed');
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('border-blue-400', 'bg-blue-50');
    }

    function unhighlight() {
        dropArea.classList.remove('border-blue-400', 'bg-blue-50');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
});

function shareLink(url) {
    if (!url.startsWith('http')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }

    const newFile = {
        id: Date.now(),
        name: url.substring(0, 30) + (url.length > 30 ? '...' : ''),
        type: 'link',
        url,
        timestamp: new Date().toLocaleString(),
        icon: 'fas fa-link'
    };

    saveFile(newFile);
    loadFiles();
    document.getElementById('link-input').value = '';
}

function handleFiles(files) {
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileData = e.target.result;
            const newFile = {
                id: Date.now(),
                name: file.name,
                type: file.type,
                size: formatFileSize(file.size),
                data: fileData,
                timestamp: new Date().toLocaleString(),
                icon: getFileIcon(file.type)
            };
            saveFile(newFile);
            loadFiles();
        };
        reader.readAsDataURL(file);
    });
}

function saveFile(file) {
    let files = JSON.parse(localStorage.getItem('ee-files')) || [];
    files.push(file);
    localStorage.setItem('ee-files', JSON.stringify(files));
}

function loadFiles() {
    const filesList = document.getElementById('files-list');
    const files = JSON.parse(localStorage.getItem('ee-files')) || [];
    
    filesList.innerHTML = files.map(file => `
        <div class="file-card rounded-xl p-6">
            <div class="flex items-center mb-4">
                <div class="file-icon w-16 h-16 rounded-full flex items-center justify-center text-2xl bg-blue-100 text-blue-600 mr-4">
                    <i class="${file.icon}"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-semibold truncate">${file.name}</h3>
                    <p class="text-gray-600 text-sm">${file.type.startsWith('image/') ? 'Image' : 
                      file.type.startsWith('video/') ? 'Video' : 
                      file.type === 'link' ? 'Web Link' : 
                      file.type.split('/')[1] || 'File'} ${file.size ? `• ${file.size}` : ''}</p>
                    <p class="text-gray-500 text-xs">${file.timestamp}</p>
                </div>
            </div>
            <div class="flex justify-end space-x-2">
                ${file.type === 'link' ? 
                    `<a href="${file.url}" target="_blank" class="text-blue-500 hover:text-blue-700 px-3 py-1 rounded">
                        <i class="fas fa-external-link-alt mr-1"></i> Open
                    </a>` : 
                    `<a href="${file.data}" download="${file.name}" class="text-blue-500 hover:text-blue-700 px-3 py-1 rounded">
                        <i class="fas fa-download mr-1"></i> Download
                    </a>`
                }
                <button onclick="deleteFile(${file.id})" class="text-red-500 hover:text-red-700 px-3 py-1 rounded">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function deleteFile(id) {
    let files = JSON.parse(localStorage.getItem('ee-files')) || [];
    files = files.filter(file => file.id !== id);
    localStorage.setItem('ee-files', JSON.stringify(files));
    loadFiles();
}

function getFileIcon(type) {
    if (type.startsWith('image/')) return 'fas fa-image';
    if (type.startsWith('video/')) return 'fas fa-video';
    if (type.endsWith('pdf')) return 'fas fa-file-pdf';
    if (type.endsWith('docx') || type.endsWith('doc')) return 'fas fa-file-word';
    if (type.endsWith('xlsx') || type.endsWith('csv')) return 'fas fa-file-excel';
    if (type === 'link') return 'fas fa-link';
    return 'fas fa-file';
}

function formatFileSize(bytes) {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}