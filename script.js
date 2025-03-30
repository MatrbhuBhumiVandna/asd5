// Constants
const FILE_TYPES = {
    HTML: 'html',
    CSS: 'css',
    JS: 'js',
    JPG: 'jpg',
    PNG: 'png',
    MP4: 'mp4'
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_VIDEO_TYPES = ['video/mp4'];

// State management
class AppState {
    constructor() {
        this.currentProject = null;
        this.currentFolder = null;
        this.currentFile = null;
        this.editTarget = null;
        this.targetFolderForNewFile = null;
        this.projects = this.loadFromStorage() || this.createDefaultProject();
        this.saveToStorage();
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem('codecraft-projects');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Failed to load from storage:", e);
            return null;
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('codecraft-projects', JSON.stringify(this.projects));
        } catch (e) {
            console.error("Failed to save to storage:", e);
        }
    }

    createDefaultProject() {
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        
        this.projects = {
            [projectId]: {
                name: 'My Project',
                folders: {
                    [folderId]: {
                        name: 'Main',
                        files: {
                            'file-html': {
                                name: 'index.html',
                                type: FILE_TYPES.HTML,
                                content: `<!DOCTYPE html>\n<html>\n<head>\n    <title>My Project</title>\n    <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n    <h1>Welcome to CodeCraft Pro!</h1>\n    <p>This is a powerful real-time code editor.</p>\n    <button id="demo-btn">Click Me</button>\n    <script src="script.js"></script>\n</body>\n</html>`
                            },
                            'file-css': {
                                name: 'styles.css',
                                type: FILE_TYPES.CSS,
                                content: `body {\n    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background-color: #f8f9fa;\n    color: #2d3436;\n}\n\nh1 {\n    color: #6c5ce7;\n}\n\n#demo-btn {\n    background-color: #6c5ce7;\n    color: white;\n    padding: 10px 20px;\n    border: none;\n    border-radius: 4px;\n    cursor: pointer;\n}`
                            },
                            'file-js': {
                                name: 'script.js',
                                type: FILE_TYPES.JS,
                                content: `document.getElementById('demo-btn').addEventListener('click', function() {\n    alert('Welcome to CodeCraft Pro!');\n});`
                            }
                        }
                    }
                }
            }
        };

        this.currentProject = projectId;
        this.currentFolder = folderId;
        this.currentFile = 'file-html';
        return this.projects;
    }

    getCurrentProject() {
        return this.currentProject ? this.projects[this.currentProject] : null;
    }

    getCurrentFolder() {
        const project = this.getCurrentProject();
        return project && this.currentFolder ? project.folders[this.currentFolder] : null;
    }

    getCurrentFile() {
        const folder = this.getCurrentFolder();
        return folder && this.currentFile ? folder.files[this.currentFile] : null;
    }

    switchProject(projectId) {
        if (!this.projects[projectId]) return false;
        
        this.currentProject = projectId;
        const project = this.getCurrentProject();
        
        // Switch to first folder if exists
        const folderIds = Object.keys(project.folders);
        if (folderIds.length > 0) {
            this.switchFolder(folderIds[0]);
        } else {
            this.currentFolder = null;
            this.currentFile = null;
        }
        
        this.saveToStorage();
        return true;
    }

    switchFolder(folderId) {
        const project = this.getCurrentProject();
        if (!project || !project.folders[folderId]) return false;
        
        this.currentFolder = folderId;
        const folder = this.getCurrentFolder();
        
        // Switch to first file if exists
        const fileIds = Object.keys(folder.files);
        if (fileIds.length > 0) {
            this.switchFile(fileIds[0]);
        } else {
            this.currentFile = null;
        }
        
        this.saveToStorage();
        return true;
    }

    switchFile(fileId) {
        const folder = this.getCurrentFolder();
        if (!folder || !folder.files[fileId]) return false;
        
        this.currentFile = fileId;
        this.saveToStorage();
        return true;
    }

    createProject(name) {
        if (!name.trim()) return null;
        
        const projectId = 'project-' + Date.now();
        const folderId = 'folder-' + Date.now();
        
        this.projects[projectId] = {
            name: name.trim(),
            folders: {
                [folderId]: {
                    name: 'Main',
                    files: {
                        'file-html': {
                            name: 'index.html',
                            type: FILE_TYPES.HTML,
                            content: `<!DOCTYPE html>\n<html>\n<head>\n    <title>${name.trim()}</title>\n</head>\n<body>\n    <h1>${name.trim()}</h1>\n</body>\n</html>`
                        }
                    }
                }
            }
        };
        
        this.saveToStorage();
        return projectId;
    }

    createFolder(name) {
        if (!this.currentProject || !name.trim()) return null;
        
        const folderId = 'folder-' + Date.now();
        
        this.projects[this.currentProject].folders[folderId] = {
            name: name.trim(),
            files: {}
        };
        
        this.saveToStorage();
        return folderId;
    }

    createFile(name, type) {
        if (!name.trim() || !type) return null;
        
        const targetFolder = this.targetFolderForNewFile || this.currentFolder;
        if (!this.currentProject || !targetFolder) return null;
        
        const extension = type === FILE_TYPES.HTML ? '.html' : 
                         type === FILE_TYPES.CSS ? '.css' : 
                         type === FILE_TYPES.JS ? '.js' :
                         type === FILE_TYPES.JPG ? '.jpg' :
                         type === FILE_TYPES.PNG ? '.png' : '.mp4';
        
        const fullName = name.trim().endsWith(extension) ? name.trim() : name.trim() + extension;
        const fileId = 'file-' + Date.now();
        
        let content = '';
        if (type === FILE_TYPES.HTML) {
            content = `<!DOCTYPE html>\n<html>\n<head>\n    <title>${fullName}</title>\n</head>\n<body>\n    \n</body>\n</html>`;
        } else if (type === FILE_TYPES.CSS) {
            content = `/* ${fullName} */`;
        } else if (type === FILE_TYPES.JS) {
            content = `// ${fullName}`;
        }
        
        this.projects[this.currentProject].folders[targetFolder].files[fileId] = {
            name: fullName,
            type: type,
            content: content
        };
        
        this.saveToStorage();
        return fileId;
    }

    renameItem(id, type, newName) {
        if (!newName.trim()) return false;
        
        try {
            if (type === 'project') {
                this.projects[id].name = newName.trim();
            } 
            else if (type === 'folder') {
                this.projects[this.currentProject].folders[id].name = newName.trim();
            } 
            else if (type === 'file') {
                const file = this.projects[this.currentProject].folders[this.currentFolder].files[id];
                const ext = file.name.split('.').pop();
                file.name = newName.trim().endsWith(`.${ext}`) ? newName.trim() : `${newName.trim()}.${ext}`;
            }
            
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error("Error renaming item:", e);
            return false;
        }
    }

    deleteProject(projectId) {
        if (Object.keys(this.projects).length <= 1) return false;
        
        delete this.projects[projectId];
        
        // Switch to another project if deleting current
        if (this.currentProject === projectId) {
            const remainingProjectId = Object.keys(this.projects)[0];
            this.switchProject(remainingProjectId);
        }
        
        this.saveToStorage();
        return true;
    }

    deleteFolder(folderId) {
        const project = this.getCurrentProject();
        if (!project || Object.keys(project.folders).length <= 1) return false;
        
        delete project.folders[folderId];
        
        // Switch to another folder if deleting current
        if (this.currentFolder === folderId) {
            const remainingFolderId = Object.keys(project.folders)[0];
            this.switchFolder(remainingFolderId);
        }
        
        this.saveToStorage();
        return true;
    }

    deleteFile(fileId) {
        const folder = this.getCurrentFolder();
        if (!folder || Object.keys(folder.files).length <= 1) return false;
        
        delete folder.files[fileId];
        
        // Switch to another file if deleting current
        if (this.currentFile === fileId) {
            const remainingFileId = Object.keys(folder.files)[0];
            this.switchFile(remainingFileId);
        }
        
        this.saveToStorage();
        return true;
    }

    uploadFile(file) {
        if (!this.currentProject || !this.currentFolder) return null;
        
        const fileName = file.name;
        const fileType = this.determineFileType(file);
        const fileId = 'file-' + Date.now();
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.projects[this.currentProject].folders[this.currentFolder].files[fileId] = {
                    name: fileName,
                    type: fileType,
                    content: e.target.result,
                    isUploaded: true
                };
                this.saveToStorage();
                resolve(fileId);
            };
            
            if ([FILE_TYPES.JPG, FILE_TYPES.PNG, FILE_TYPES.MP4].includes(fileType)) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    determineFileType(file) {
        const ext = file.name.split('.').pop().toLowerCase();
        const type = file.type;
        
        if (ext === 'html' || type === 'text/html') return FILE_TYPES.HTML;
        if (ext === 'css' || type === 'text/css') return FILE_TYPES.CSS;
        if (ext === 'js' || type === 'text/javascript') return FILE_TYPES.JS;
        if (ext === 'jpg' || ext === 'jpeg' || ALLOWED_IMAGE_TYPES.includes(type)) return FILE_TYPES.JPG;
        if (ext === 'png' || ALLOWED_IMAGE_TYPES.includes(type)) return FILE_TYPES.PNG;
        if (ext === 'mp4' || ALLOWED_VIDEO_TYPES.includes(type)) return FILE_TYPES.MP4;
        
        return 'other';
    }

    validateFile(file) {
        // Check size
        if (file.size > MAX_FILE_SIZE) {
            return { valid: false, error: 'File size exceeds 5MB limit' };
        }
        
        // Check type
        const ext = file.name.split('.').pop().toLowerCase();
        const type = file.type;
        
        const allowedTypes = [
            'text/html', 'text/css', 'text/javascript',
            ...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES
        ];
        
        if (!allowedTypes.includes(type) && !['html', 'css', 'js', 'jpg', 'jpeg', 'png', 'mp4'].includes(ext)) {
            return { valid: false, error: 'File type not supported' };
        }
        
        return { valid: true };
    }

    exportProject() {
        const project = this.getCurrentProject();
        if (!project) return null;
        
        return {
            name: project.name,
            date: new Date().toISOString(),
            content: project
        };
    }
}

// DOM Manager
class DOMManager {
    constructor(state) {
        this.state = state;
        this.initElements();
        this.setupEventListeners();
        this.renderAll();
    }

    initElements() {
        // Editor elements
        this.editor = document.getElementById('editor');
        this.previewFrame = document.getElementById('preview-frame');
        this.runBtn = document.getElementById('run-btn');
        this.saveBtn = document.getElementById('save-btn');
        this.currentFileDisplay = document.getElementById('current-file');
        this.exportBtn = document.getElementById('export-btn');
        
        // Tab bars
        this.projectTabBar = document.getElementById('project-tab-bar');
        this.folderTabBar = document.getElementById('folder-tab-bar');
        this.fileTabBar = document.getElementById('file-tab-bar');
        
        // Add buttons
        this.addProjectBtn = document.getElementById('add-project');
        this.addFolderBtn = document.getElementById('add-folder');
        this.addFileBtn = document.getElementById('add-file');
        
        // Explorer
        this.directoryTree = document.getElementById('directory-tree');
        this.uploadBtn = document.getElementById('upload-btn');
        
        // Modals
        this.newProjectModal = document.getElementById('new-project-modal');
        this.newFolderModal = document.getElementById('new-folder-modal');
        this.newFileModal = document.getElementById('new-file-modal');
        this.uploadModal = document.getElementById('upload-modal');
        this.editModal = document.getElementById('edit-modal');
        
        // Modal inputs
        this.projectNameInput = document.getElementById('project-name');
        this.folderNameInput = document.getElementById('folder-name');
        this.fileNameInput = document.getElementById('file-name');
        this.fileTypeInput = document.getElementById('file-type');
        this.fileUploadInput = document.getElementById('file-upload');
        this.editNameInput = document.getElementById('edit-name');
        
        // Modal buttons
        this.createProjectBtn = document.getElementById('create-project');
        this.cancelProjectBtn = document.getElementById('cancel-project');
        this.createFolderBtn = document.getElementById('create-folder');
        this.cancelFolderBtn = document.getElementById('cancel-folder');
        this.createFileBtn = document.getElementById('create-file');
        this.cancelFileBtn = document.getElementById('cancel-file');
        this.confirmUploadBtn = document.getElementById('confirm-upload');
        this.cancelUploadBtn = document.getElementById('cancel-upload');
        this.confirmEditBtn = document.getElementById('confirm-edit');
        this.cancelEditBtn = document.getElementById('cancel-edit');
        
        // Upload preview
        this.uploadPreview = document.getElementById('upload-preview');
    }

    setupEventListeners() {
        // Run button
        this.runBtn.addEventListener('click', () => this.updatePreview());
        
        // Save button
        this.saveBtn.addEventListener('click', () => this.saveCurrentFile());
        
        // Editor content change
        this.editor.addEventListener('input', () => {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => this.saveCurrentFile(), 1000);
        });
        
        // Add buttons
        this.addProjectBtn.addEventListener('click', () => this.showModal(this.newProjectModal));
        this.addFolderBtn.addEventListener('click', () => {
            if (this.state.currentProject) this.showModal(this.newFolderModal);
        });
        this.addFileBtn.addEventListener('click', () => {
            if (this.state.currentProject && this.state.currentFolder) this.showModal(this.newFileModal);
        });
        
        // Upload button
        this.uploadBtn.addEventListener('click', () => {
            if (this.state.currentProject && this.state.currentFolder) {
                this.fileUploadInput.value = '';
                this.uploadPreview.innerHTML = '';
                this.confirmUploadBtn.disabled = true;
                this.showModal(this.uploadModal);
            }
        });
        
        // File upload handling
        this.fileUploadInput.addEventListener('change', () => this.handleFileUpload());
        this.confirmUploadBtn.addEventListener('click', () => this.uploadFiles());
        this.cancelUploadBtn.addEventListener('click', () => this.hideModal(this.uploadModal));
        
        // Project modal
        this.createProjectBtn.addEventListener('click', () => this.createNewProject());
        this.cancelProjectBtn.addEventListener('click', () => this.hideModal(this.newProjectModal));
        
        // Folder modal
        this.createFolderBtn.addEventListener('click', () => this.createNewFolder());
        this.cancelFolderBtn.addEventListener('click', () => this.hideModal(this.newFolderModal));
        
        // File modal
        this.createFileBtn.addEventListener('click', () => this.createNewFile());
        this.cancelFileBtn.addEventListener('click', () => this.hideModal(this.newFileModal));
        
        // Edit modal
        this.confirmEditBtn.addEventListener('click', () => this.confirmEdit());
        this.cancelEditBtn.addEventListener('click', () => this.hideModal(this.editModal));
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.newProjectModal) this.hideModal(this.newProjectModal);
            if (e.target === this.newFolderModal) this.hideModal(this.newFolderModal);
            if (e.target === this.newFileModal) this.hideModal(this.newFileModal);
            if (e.target === this.uploadModal) this.hideModal(this.uploadModal);
            if (e.target === this.editModal) this.hideModal(this.editModal);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentFile();
            }
        });
    }

    renderAll() {
        this.renderProjectTabs();
        this.renderFolderTabs();
        this.renderFileTabs();
        this.renderDirectoryTree();
        this.loadFile(this.state.currentFile); // Ensure file content is loaded
    }

    renderProjectTabs() {
        // Clear existing tabs except the add button
        while (this.projectTabBar.firstChild !== this.addProjectBtn) {
            this.projectTabBar.removeChild(this.projectTabBar.firstChild);
        }
        
        // Add tabs for each project
        for (const projectId in this.state.projects) {
            const project = this.state.projects[projectId];
            const tab = this.createTab(projectId, project.name, 'fa-folder-open', projectId === this.state.currentProject);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    this.state.switchProject(projectId);
                    this.renderAll();
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete project "${project.name}"?`)) {
                    this.state.deleteProject(projectId);
                    this.renderAll();
                }
            });
            
            this.projectTabBar.insertBefore(tab, this.addProjectBtn);
        }
    }

    renderFolderTabs() {
        // Clear existing tabs except the add button
        while (this.folderTabBar.firstChild !== this.addFolderBtn) {
            this.folderTabBar.removeChild(this.folderTabBar.firstChild);
        }
        
        const project = this.state.getCurrentProject();
        if (!project) return;
        
        // Add tabs for each folder in current project
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            const tab = this.createTab(folderId, folder.name, 'fa-folder', folderId === this.state.currentFolder);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    this.state.switchFolder(folderId);
                    this.renderAll();
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete folder "${folder.name}"?`)) {
                    this.state.deleteFolder(folderId);
                    this.renderAll();
                }
            });
            
            this.folderTabBar.insertBefore(tab, this.addFolderBtn);
        }
    }

    renderFileTabs() {
        // Clear existing tabs except the add button
        while (this.fileTabBar.firstChild !== this.addFileBtn) {
            this.fileTabBar.removeChild(this.fileTabBar.firstChild);
        }
        
        const folder = this.state.getCurrentFolder();
        if (!folder) return;
        
        // Add tabs for each file in current folder
        for (const fileId in folder.files) {
            const file = folder.files[fileId];
            const tab = this.createTab(fileId, file.name, this.getFileIconClass(file.type), fileId === this.state.currentFile);
            
            tab.addEventListener('click', (e) => {
                if (!e.target.classList.contains('close-btn')) {
                    this.state.switchFile(fileId);
                    this.loadFile(fileId);
                    this.renderFileTabs(); // Update active state
                }
            });
            
            const closeBtn = tab.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Delete file "${file.name}"?`)) {
                    this.state.deleteFile(fileId);
                    this.renderAll();
                }
            });
            
            this.fileTabBar.insertBefore(tab, this.addFileBtn);
        }
    }

    renderDirectoryTree() {
        this.directoryTree.innerHTML = '';
        
        const ul = document.createElement('ul');
        
        for (const projectId in this.state.projects) {
            const project = this.state.projects[projectId];
            const projectItem = this.createTreeItem(
                projectId, 
                project.name, 
                'project-item', 
                'fa-folder-open', 
                projectId === this.state.currentProject,
                'project'
            );
            
            const folderUl = document.createElement('ul');
            
            for (const folderId in project.folders) {
                const folder = project.folders[folderId];
                const folderItem = this.createTreeItem(
                    folderId,
                    folder.name,
                    'folder-item',
                    'fa-folder',
                    folderId === this.state.currentFolder && projectId === this.state.currentProject,
                    'folder'
                );
                
                const fileUl = document.createElement('ul');
                
                for (const fileId in folder.files) {
                    const file = folder.files[fileId];
                    const fileItem = this.createTreeItem(
                        fileId,
                        file.name,
                        'file-item',
                        this.getFileIconClass(file.type),
                        fileId === this.state.currentFile && folderId === this.state.currentFolder && projectId === this.state.currentProject,
                        'file'
                    );
                    
                    fileItem.addEventListener('click', () => {
                        if (projectId !== this.state.currentProject) {
                            this.state.switchProject(projectId);
                        }
                        if (folderId !== this.state.currentFolder) {
                            this.state.switchFolder(folderId);
                        }
                        this.state.switchFile(fileId);
                        this.loadFile(fileId);
                        this.renderAll(); // Refresh UI to show active states
                    });
                    
                    fileUl.appendChild(fileItem);
                }
                
                folderItem.addEventListener('click', (e) => {
                    const isAction = e.target.classList.contains('tree-node-action') || 
                                    e.target.closest('.tree-node-action');
                    
                    if (!isAction) {
                        const isToggle = e.target.classList.contains('toggle') || 
                                        e.target.classList.contains('fa-chevron-down');
                        
                        if (isToggle) {
                            folderItem.classList.toggle('expanded');
                        } else {
                            if (projectId !== this.state.currentProject) {
                                this.state.switchProject(projectId);
                            }
                            if (folderId !== this.state.currentFolder) {
                                this.state.switchFolder(folderId);
                            }
                            this.renderAll();
                        }
                    }
                });
                
                folderItem.appendChild(fileUl);
                folderUl.appendChild(folderItem);
            }
            
            projectItem.addEventListener('click', (e) => {
                const isAction = e.target.classList.contains('tree-node-action') || 
                                e.target.closest('.tree-node-action');
                
                if (!isAction) {
                    const isToggle = e.target.classList.contains('toggle') || 
                                    e.target.classList.contains('fa-chevron-down');
                    
                    if (isToggle) {
                        projectItem.classList.toggle('expanded');
                    } else {
                        if (projectId !== this.state.currentProject) {
                            this.state.switchProject(projectId);
                            this.renderAll();
                        }
                    }
                }
            });
            
            projectItem.appendChild(folderUl);
            ul.appendChild(projectItem);
        }
        
        this.directoryTree.appendChild(ul);
    }

    createTab(id, name, icon, isActive) {
        const tab = document.createElement('div');
        tab.className = `tab ${isActive ? 'active' : ''}`;
        tab.dataset.id = id;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.innerHTML = `
            <span class="tab-icon"><i class="fas ${icon}"></i></span>
            <span class="tab-label">${this.sanitizeHTML(name)}</span>
            <button class="close-btn" aria-label="Close tab"><i class="fas fa-times"></i></button>
        `;
        return tab;
    }

    createTreeItem(id, name, type, icon, isActive, itemType) {
        const li = document.createElement('li');
        li.className = `${type} ${isActive ? 'expanded' : ''}`;
        li.dataset.id = id;
        li.dataset.type = itemType;
        
        const node = document.createElement('div');
        node.className = 'tree-node';
        node.setAttribute('role', 'treeitem');
        node.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        
        if (itemType === 'project' || itemType === 'folder') {
            node.innerHTML = `
                <span class="toggle"><i class="fas fa-chevron-down"></i></span>
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${this.sanitizeHTML(name)}</span>
                <div class="tree-node-actions">
                    ${itemType === 'folder' ? '<button class="tree-node-action add-file-btn" title="Add file"><i class="fas fa-plus"></i></button>' : ''}
                    <button class="tree-node-action edit-btn" title="Rename" aria-label="Rename">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <button class="tree-node-action delete-btn" title="Delete" aria-label="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            node.innerHTML = `
                <span class="icon"><i class="fas ${icon}"></i></span>
                <span class="label">${this.sanitizeHTML(name)}</span>
                <div class="tree-node-actions">
                    <button class="tree-node-action edit-btn" title="Rename" aria-label="Rename">
                        <i class="fas fa-ellipsis-h"></i>
                    </button>
                    <button class="tree-node-action delete-btn" title="Delete" aria-label="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            if (isActive) li.classList.add('active');
        }
        
        // Add event listeners for actions
        const editBtn = node.querySelector('.edit-btn');
        const deleteBtn = node.querySelector('.delete-btn');
        const addFileBtn = node.querySelector('.add-file-btn');
        
        if (addFileBtn) {
            addFileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.targetFolderForNewFile = id;
                this.showModal(this.newFileModal);
            });
        }
        
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showEditModal(id, itemType, name);
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const confirmMsg = itemType === 'project' ? `Delete project "${name}"?` :
                             itemType === 'folder' ? `Delete folder "${name}"?` :
                             `Delete file "${name}"?`;
            
            if (confirm(confirmMsg)) {
                if (itemType === 'project') this.state.deleteProject(id);
                else if (itemType === 'folder') this.state.deleteFolder(id);
                else if (itemType === 'file') this.state.deleteFile(id);
                
                this.renderAll();
            }
        });
        
        li.appendChild(node);
        return li;
    }

    getFileIconClass(fileType) {
        switch(fileType) {
            case FILE_TYPES.HTML: return 'fa-file-code file-icon-html';
            case FILE_TYPES.CSS: return 'fa-file-code file-icon-css';
            case FILE_TYPES.JS: return 'fa-file-code file-icon-js';
            case FILE_TYPES.JPG: return 'fa-file-image file-icon-jpg';
            case FILE_TYPES.PNG: return 'fa-file-image file-icon-png';
            case FILE_TYPES.MP4: return 'fa-file-video file-icon-mp4';
            default: return 'fa-file';
        }
    }

    showModal(modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    hideModal(modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }

    showEditModal(id, type, currentName) {
        this.state.editTarget = { id, type };
        this.editNameInput.value = currentName;
        this.showModal(this.editModal);
    }

    handleFileUpload() {
        this.uploadPreview.innerHTML = '';
        this.confirmUploadBtn.disabled = true;
        
        if (this.fileUploadInput.files.length > 0) {
            let allValid = true;
            
            for (let i = 0; i < this.fileUploadInput.files.length; i++) {
                const file = this.fileUploadInput.files[i];
                const validation = this.state.validateFile(file);
                
                if (!validation.valid) {
                    alert(`File ${file.name} is invalid: ${validation.error}`);
                    allValid = false;
                    break;
                }
                
                const fileExt = file.name.split('.').pop().toLowerCase();
                const item = document.createElement('div');
                item.className = 'upload-item';
                
                let iconClass = 'fa-file';
                if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) iconClass = 'fa-image';
                else if (['mp4', 'webm', 'mov'].includes(fileExt)) iconClass = 'fa-video';
                
                item.innerHTML = `
                    <div class="upload-item-icon"><i class="fas ${iconClass}"></i></div>
                    <div class="upload-item-name">${this.sanitizeHTML(file.name)}</div>
                    <div class="upload-item-size">${this.formatFileSize(file.size)}</div>
                `;
                
                this.uploadPreview.appendChild(item);
            }
            
            this.confirmUploadBtn.disabled = !allValid;
        }
    }

    async uploadFiles() {
        if (this.fileUploadInput.files.length === 0) return;
        
        try {
            let lastFileId = null;
            
            for (let i = 0; i < this.fileUploadInput.files.length; i++) {
                const file = this.fileUploadInput.files[i];
                lastFileId = await this.state.uploadFile(file);
            }
            
            this.hideModal(this.uploadModal);
            this.renderAll();
            
            if (lastFileId) {
                this.state.switchFile(lastFileId);
                this.loadFile(lastFileId);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Some files failed to upload. Please try again.");
        }
    }

    confirmEdit() {
        const newName = this.editNameInput.value.trim();
        if (!newName || !this.state.editTarget) return;
        
        const { id, type } = this.state.editTarget;
        
        if (this.state.renameItem(id, type, newName)) {
            this.hideModal(this.editModal);
            this.renderAll();
        } else {
            alert("Failed to rename. Please try again.");
        }
    }

    createNewProject() {
        const name = this.projectNameInput.value.trim();
        if (!name) {
            alert("Please enter a project name");
            return;
        }
        
        const projectId = this.state.createProject(name);
        if (projectId) {
            this.state.switchProject(projectId);
            this.hideModal(this.newProjectModal);
            this.projectNameInput.value = '';
            this.renderAll();
        }
    }

    createNewFolder() {
        const name = this.folderNameInput.value.trim();
        if (!name) {
            alert("Please enter a folder name");
            return;
        }
        
        const folderId = this.state.createFolder(name);
        if (folderId) {
            this.state.switchFolder(folderId);
            this.hideModal(this.newFolderModal);
            this.folderNameInput.value = '';
            this.renderAll();
        }
    }

    createNewFile() {
        const name = this.fileNameInput.value.trim();
        const type = this.fileTypeInput.value;
        if (!name) {
            alert("Please enter a file name");
            return;
        }
        
        const fileId = this.state.createFile(name, type);
        if (fileId) {
            this.state.targetFolderForNewFile = null;
            this.state.switchFile(fileId);
            this.hideModal(this.newFileModal);
            this.fileNameInput.value = '';
            this.renderAll();
            this.loadFile(fileId);
        }
    }

    loadFile(fileId) {
        const file = this.state.getCurrentFile();
        
        if (!file) {
            this.editor.style.display = 'none';
            this.currentFileDisplay.textContent = 'No file selected';
            this.previewFrame.srcdoc = '';
            return;
        }
        
        // Only show editor for text files
        if ([FILE_TYPES.HTML, FILE_TYPES.CSS, FILE_TYPES.JS].includes(file.type)) {
            this.editor.style.display = 'block';
            this.editor.value = file.content;
        } else {
            this.editor.style.display = 'none';
        }
        
        this.currentFileDisplay.textContent = file.name;
        
        // Update preview for media files
        if ([FILE_TYPES.JPG, FILE_TYPES.PNG, FILE_TYPES.MP4].includes(file.type)) {
            this.updateMediaPreview(file);
        } else {
            this.updatePreview();
        }
    }

    updateMediaPreview(file) {
        let previewContent = '';
        
        if (file.type === FILE_TYPES.JPG || file.type === FILE_TYPES.PNG) {
            previewContent = `<!DOCTYPE html>\n<html>\n<head>\n    <title>${this.sanitizeHTML(file.name)}</title>\n    <style>\n        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }\n        img { max-width: 100%; max-height: 100%; }\n    </style>\n</head>\n<body>\n    <img src="${file.content}" alt="${this.sanitizeHTML(file.name)}">\n</body>\n</html>`;
        } 
        else if (file.type === FILE_TYPES.MP4) {
            previewContent = `<!DOCTYPE html>\n<html>\n<head>\n    <title>${this.sanitizeHTML(file.name)}</title>\n    <style>\n        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }\n        video { max-width: 100%; max-height: 100%; }\n    </style>\n</head>\n<body>\n    <video controls autoplay>\n        <source src="${file.content}" type="video/mp4">\n        Your browser does not support the video tag.\n    </video>\n</body>\n</html>`;
        }
        
        this.previewFrame.srcdoc = previewContent;
    }

    saveCurrentFile() {
        const file = this.state.getCurrentFile();
        if (!file || !['html', 'css', 'js'].includes(file.type)) return;
        
        file.content = this.editor.value;
        this.state.saveToStorage();
        this.updatePreview();
    }

    updatePreview() {
        this.saveCurrentFile();
        
        const file = this.state.getCurrentFile();
        if (!file || ['jpg', 'png', 'mp4'].includes(file.type)) return;
        
        const project = this.state.getCurrentProject();
        if (!project) return;
        
        let html = '';
        let css = '';
        let js = '';
        
        // Collect all files from all folders in the project
        for (const folderId in project.folders) {
            const folder = project.folders[folderId];
            for (const fileId in folder.files) {
                const f = folder.files[fileId];
                if (f.type === FILE_TYPES.HTML) html = f.content;
                else if (f.type === FILE_TYPES.CSS) css = f.content;
                else if (f.type === FILE_TYPES.JS) js = f.content;
            }
        }
        
        // If no HTML file found, create a basic one
        if (!html && (css || js)) {
            html = `<!DOCTYPE html>\n<html>\n<head>\n    <title>Preview</title>\n    ${css ? '<style>' + css + '</style>' : ''}\n</head>\n<body>\n    ${js ? '<script>' + js + '</script>' : ''}\n</body>\n</html>`;
        }
        
        // Combine into a complete HTML document
        if (html) {
            // Inject CSS if not already in the HTML
            if (css && !html.includes('<style>') && !html.includes('</head>')) {
                html = html.replace('</head>', `<style>${css}</style></head>`);
            }
            if (css && !html.includes('<style>') && !html.includes('</head>')) {
                html = html.replace('<body>', `<style>${css}</style><body>`);
            }
            
            // Inject JS if not already in the HTML
            if (js && !html.includes('<script>') && !html.includes('</body>')) {
                html = html.replace('</body>', `<script>${js}</script></body>`);
            }
            if (js && !html.includes('<script>') && !html.includes('</body>')) {
                html += `<script>${js}</script>`;
            }
            
            this.previewFrame.srcdoc = html;
        } else {
            this.previewFrame.srcdoc = '<!DOCTYPE html><html><body><p>No HTML content to preview</p></body></html>';
        }
    }

    sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const state = new AppState();
    const domManager = new DOMManager(state);
    
    // Setup export button
    const exportBtn = document.getElementById('export-btn');
    exportBtn.addEventListener('click', async () => {
        const project = state.exportProject();
        if (!project) return;
        
        try {
            exportBtn.disabled = true;
            exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            
            const zipData = await Exporter.exportProject(project.content);
            Exporter.downloadZip(zipData, project.name);
        } catch (error) {
            console.error("Export failed:", error);
            alert("Export failed. Please try again.");
        } finally {
            exportBtn.disabled = false;
            exportBtn.innerHTML = '<i class="fas fa-file-archive"></i> Export';
        }
    });
});
