class Renderer {
    
    init() {
        this.versions();
    }

    versions() {
        const electronInfo = document.getElementById('versions');
        electronInfo.innerText = `Chrome (v${window.versions.chrome()}); Node.js (v${window.versions.node()}); Electron (v${window.versions.electron});`;
    }

    async pong() {
        const response = await window.pong.ping();
        console.log(response);
    }
    
}

(new Renderer()).init();
