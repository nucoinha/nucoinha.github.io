document.addEventListener('DOMContentLoaded', function() {
    const gistId = '56c6565767600102bc80df7ae0c9bda7';
    const apiUrl = `https://api.github.com/gists/${gistId}`;
    const fileListElement = document.getElementById('file-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const files = data.files;
            Object.keys(files).forEach(fileName => {
                const file = files[fileName];
                const listItem = document.createElement('li');
                const fileLink = document.createElement('a');
                
                fileLink.href = file.raw_url;
                fileLink.textContent = file.filename;
                fileLink.download = file.filename; // Sugere que o navegador baixe o arquivo
                
                listItem.appendChild(fileLink);
                fileListElement.appendChild(listItem);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar o Gist:', error);
            fileListElement.innerHTML = '<li>Erro ao carregar arquivos.</li>';
        });
});

