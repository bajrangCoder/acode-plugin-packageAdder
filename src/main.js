import plugin from '../plugin.json';
import style from './style.scss';
import tag from 'html-tag-js';

class AddPackage {
    
    async init($page) {
        let command = {
            name: "Add Package",
            description: "Add Package",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.addCommand(command);
        $page.id = 'acode-plugin-packageAdder';
        $page.settitle("Add Package");
        this.$page = $page;
        this.$style = tag('style', {
            textContent: style,
        });
        this.$plugPage1 = tag('div',{
            className: 'plugPage1',
        });
        this.$plugPage2 = tag('div',{
            className: 'plugPage2 hide',
        });
        this.$page.append(this.$plugPage1);
        this.$page.append(this.$plugPage2);
        this.$searchBar = tag('div', {
            className: "searchBar",
        });
        this.$mainlistCont = tag('div',{
            className: "mainlistCont",
        });
        this.$plugPage1.append(this.$searchBar);
        this.$plugPage1.append(this.$mainlistCont);
        this.$searchInput = tag('input', {
            type: 'search',
            className: 'searchInput',
            placeholder: 'Enter Library Name',
        });
        this.$searchBtn = tag('button', {
            textContent: 'Search',
        });
        this.$searchBar.append(this.$searchInput);
        this.$searchBar.append(this.$searchBtn);
        this.$searchBtn.onclick = this.searchLib.bind(this);
        this.pkgLists = tag('ul');
        this.$mainlistCont.append(this.pkgLists);
        document.head.append(this.$style);
        
    }
    
    async run() {
        this.loadLibraries('https://api.cdnjs.com/libraries?fields=filename,description,github&limit=10');
        this.$page.show();
    }
    
    async loadLibraries(url){
        try {
            this.pkgLists.innerHTML = '';
            const response = await fetch(url);
            let data = await response.json();
            let res = data.results;
            res.map(obj => {
                this.pkgLists.innerHTML += `<li onclick="pkgDetails('${obj.name}')">
                                            <div class="pkgHeader">
                                                <h3>${obj.name}</h3>
                                                <h4>🌟 ${obj.github.stargazers_count}</h4>
                                                <h4>${obj.github.forks}</h4>
                                            </div>
                                            <div class="pkgMain">
                                                <p>${obj.description}</p>
                                                <span>+</span>
                                            </div>
                                       </li>`;
            });
        } catch (e) {
            window.toast(e,5000);
        }
    }
    
    searchLib(){
        let query = this.$searchInput.value.toLowerCase()
        this.loadLibraries('https://api.cdnjs.com/libraries?search='+query+'&fields=filename,description,github&limit=10');
    }
    
    async destroy() {
        let command = {
            name: "Add Package",
            description: "Add Package",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.removeCommand(command);
    }
}

if (window.acode) {
    const acodePlugin = new AddPackage();
    acode.setPluginInit(plugin.id, (baseUrl, $page, {
        cacheFileUrl, cacheFile
    }) => {
        if (!baseUrl.endsWith('/')) {
            baseUrl += '/';
        }
        acodePlugin.baseUrl = baseUrl;
        acodePlugin.init($page, cacheFile, cacheFileUrl);
    });
    acode.setPluginUnmount(plugin.id, () => {
        acodePlugin.destroy();
    });
}