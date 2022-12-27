import plugin from '../plugin.json';
import style from './style.scss';
import tag from 'html-tag-js';

const loader = acode.require('loader');


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
            className: 'plugPage1 hide',
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
        this.$searchBar.append(...[this.$searchInput,this.$searchBtn]);
        this.$searchBtn.onclick = this.searchLib.bind(this);
        this.pkgLists = tag('ul');
        this.$mainlistCont.append(this.pkgLists);
        const headerDiv = tag('div',{
            className: "headerDiv",
        });
        const mainDiv = tag('div',{
            className: "mainDiv",
        });
        this.libName = tag('h2');
        this.versionSelector = tag('select');
        headerDiv.append(this.libName);
        headerDiv.append(this.versionSelector);
        const field1 = tag('div',{
            className: "group",
        });
        const field2 = tag('div',{
            className: "group",
        });
        const field3 = tag('div',{
            className: "group",
        });
        const field4 = tag('div',{
            className: "group",
        });
        mainDiv.append(...[field1,field2,field3,field4]);
        const lb1 = tag('label',{
            textContent: "Description",
        });
        const lb2 = tag('label',{
            textContent: "Lisence",
        });
        const lb3 = tag('label',{
            textContent: "Author",
        });
        const lb4 = tag('label',{
            textContent: "Files",
        });
        
        this.descrTxt = tag('p',{});
        this.lisenceTxt = tag('p',{});
        this.authrTxt = tag('p',{});
        this.filesList = tag('ul',{});
        field1.append(...[lb1,this.descrTxt]);
        field2.append(...[lb2,this.lisenceTxt]);
        field3.append(...[lb3,this.authrTxt]);
        field4.append(...[lb4,this.filesList]);
        this.$plugPage2.append(headerDiv);
        this.$plugPage2.append(mainDiv);
        this.$backBtn = tag('button',{
            textContent: "Back",
        });
        this.$plugPage2.append(this.$backBtn);
        this.$backBtn.onclick = this.backToPage1.bind(this);
        document.head.append(this.$style);
        const onhide = this.$page.onhide;
        this.$page.onhide = () => {
            this.$plugPage2.classList.toggle('hide');
            this.$plugPage1.classList.toggle('hide');
        }
        onhide();
    }
    
    async run() {
        this.loadLibraries('https://api.cdnjs.com/libraries?fields=filename,description,github&limit=10');
        this.$plugPage1.classList.toggle('hide');
        this.$page.show();
    }
    
    async loadLibraries(url){
        try {
            this.pkgLists.innerHTML = '';
            loader.create('Loading','Fetching data from api');
            const response = await fetch(url);
            let data = await response.json();
            loader.destroy();
            let res = data.results;
            res.forEach(obj => {
                const li = tag('li');
                this.pkgLists.append(li);
                const pkgHeader = tag('div',{
                    className: "pkgHeader",
                });
                const pkgMain = tag('div',{
                    className: "pkgMain",
                });
                li.append(...[pkgHeader,pkgMain]);
                const heading1 = tag('h3',{
                    textContent: obj.name,
                });
                const heading2 = tag('h4',{
                    textContent: obj.github.stargazers_count,
                });
                const heading3 = tag('h4',{
                    textContent: obj.github.forks,
                });
                pkgHeader.append(...[heading1,heading2,heading3]);
                const descP = tag('p',{
                    textContent: obj.description,
                });
                const plusIcon = tag('span',{
                    textContent: '+',
                });
                pkgMain.append(...[descP,plusIcon]);
                li.onclick = this.pkgDetails.bind(this,obj.name);
            });
        } catch (e) {
            window.toast(e,5000);
        }
    }
    
    searchLib(){
        let query = this.$searchInput.value.toLowerCase()
        this.loadLibraries('https://api.cdnjs.com/libraries?search='+query+'&fields=filename,description,github&limit=10');
    }
    
    async pkgDetails(libNme){
        
        let url = `https://api.cdnjs.com/libraries/${libNme}?fields=name,author,description,filename,version,versions,repository,license,assets`;
        try {
            loader.create('Loading','Fetching data from api');
            const response = await fetch(url);
            let data = await response.json();
            loader.destroy();
            this.$plugPage1.classList.toggle('hide');
            this.$plugPage2.classList.toggle('hide');
            this.libName.textContent = data.name;
            this.descrTxt.textContent = data.description;
            this.lisenceTxt.textContent = data.license;
            this.authrTxt.textContent = data.author;
            
            for(let i = 0;i<data.versions.length;i++){
                if (data.versions[i] == data.version) {
                    this.versionSelector.innerHTML += `<option value="${data.versions[i]}" selected>${data.versions[i]}</option>`;
                } else {
                    this.versionSelector.innerHTML += `<option value="${data.versions[i]}">${data.versions[i]}</option>`;
                }
            }
            let files = data.assets[0].files;
            for(let i = 0;i<files.length;i++){
                this.filesList.innerHTML += `<li>${files[i]}</li>`;
            }
        } catch (e) {
            window.toast(e,5000);
        }
    }
    
    backToPage1(){
        this.$plugPage2.classList.toggle('hide');
        this.$plugPage1.classList.toggle('hide');
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