import plugin from '../plugin.json';
import style from './style.scss';
import tag from 'html-tag-js';

const loader = acode.require('loader');
const select = acode.require('select');
const cAlert = acode.require('alert');

class AddPackage {
    
    async init($page) {
        // Adding a `Add Package` command in command platte
        let command = {
            name: "Add Package",
            description: "Add Package",
            exec: this.run.bind(this),
        }
        editorManager.editor.commands.addCommand(command);
        // Initialising $page for plugin
        $page.id = 'acode-plugin-packageAdder';
        $page.settitle("Add Package");
        this.$page = $page;
        // Adding custom styles to $page 
        this.$style = tag('style', {
            textContent: style,
        });
        // creating two div in $page
        this.$plugPage1 = tag('div',{
            className: 'plugPage1 hide',
        });
        this.$plugPage2 = tag('div',{
            className: 'plugPage2 hide',
        });
        this.$page.append(this.$plugPage1);
        this.$page.append(this.$plugPage2);
        // searchbar div for search input and search button in $page first div
        this.$searchBar = tag('div', {
            className: "searchBar",
        });
        // div for displaying packages lists
        this.$mainlistCont = tag('div',{
            className: "mainlistCont",
        });
        this.$plugPage1.append(this.$searchBar);
        this.$plugPage1.append(this.$mainlistCont);
        // input box for searching 
        this.$searchInput = tag('input', {
            type: 'search',
            className: 'searchInput',
            placeholder: 'search packages(eg: vue)',
        });
        // button for searching
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
        this.footer = tag('div',{
            className: "footer",
        });
        this.$backBtn = tag('button',{
            textContent: "Back",
            className: "backBtn",
        });
        this.$addLibBtn = tag('button',{
            textContent: "Add this Package",
            className: "addLibBtn",
        });
        this.footer.append(...[this.$backBtn,this.$addLibBtn]);
        this.$plugPage2.append(this.footer);
        this.$backBtn.onclick = this.backToPage1.bind(this);
        this.$addLibBtn.onclick = this.addLibrary.bind(this);
        this.versionSelector.onchange = this.changeVersion.bind(this);
        document.head.append(this.$style);
        const onhide = this.$page.onhide;
        this.$page.onhide = () => {
            this.$plugPage2.classList.add('hide');
            this.$plugPage1.classList.add('hide');
        }
        onhide();
        this.$sriObj = {};
    }
    
    async run() {
        this.$page.show();
        this.loadLibraries('https://api.cdnjs.com/libraries?fields=filename,description,github&limit=10');
        this.$plugPage1.classList.remove('hide');
    }
    
    async loadLibraries(url){
        try {
            this.pkgLists.innerHTML = '';
            loader.create('Loading','Fetching data...');
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
            this.closePlugin();
        }
    }
    
    searchLib(){
        let query = this.$searchInput.value.toLowerCase()
        this.loadLibraries('https://api.cdnjs.com/libraries?search='+query+'&fields=filename,description,github&limit=10');
    }
    
    async pkgDetails(libNme){
        
        let url = `https://api.cdnjs.com/libraries/${libNme}?fields=name,author,description,filename,version,versions,repository,license,assets`;
        try {
            loader.create('Loading','Fetching data...');
            const response = await fetch(url);
            let data = await response.json();
            loader.destroy();
            this.$plugPage1.classList.add('hide');
            this.$plugPage2.classList.remove('hide');
            this.libName.textContent = data.name;
            this.descrTxt.textContent = data.description;
            this.lisenceTxt.textContent = data.license;
            this.authrTxt.textContent = data.author;
            this.$sriObj = {};
            this.$sriObj = data.assets[0].sri;
            let filteredVersions = this.filterVersions(data.versions);
            let last50 = filteredVersions.slice(-50);
            
            for(let i = 0;i<last50.length;i++){
                if (last50[i] == data.version) {
                    this.versionSelector.innerHTML += `<option value="${last50[i]}" selected>${last50[i]}</option>`;
                } else {
                    this.versionSelector.innerHTML += `<option value="${last50[i]}">${last50[i]}</option>`;
                }
            }
            this.filesList.innerHTML ="";
            let filteredFiles = this.filterFiles(data.assets[0].files);
            for(let i = 0;i<filteredFiles.length;i++){
                if(data.filename == filteredFiles[i]){
                    const list = tag('li');
                    const filesCheckBox = tag('input',{
                        type: "checkbox",
                        className: "filesCheckBox",
                        value: filteredFiles[i],
                        checked: true,
                    });
                    const filesLabel = tag('p',{
                        textContent: filteredFiles[i],
                        className: "filesLabel"
                    });
                    list.append(...[filesCheckBox,filesLabel]);
                    this.filesList.append(list);
                }else{
                    const list = tag('li');
                    const filesCheckBox = tag('input',{
                        type: "checkbox",
                        className: "filesCheckBox",
                        value: filteredFiles[i],
                    });
                    const filesLabel = tag('p',{
                        textContent: filteredFiles[i],
                        className: "filesLabel"
                    });
                    list.append(...[filesCheckBox,filesLabel]);
                    this.filesList.append(list);
                    }
            }
        } catch (e) {
            this.closePlugin();
        }
    }
    
    async changeVersion(){
        let pkg_nme = this.libName.textContent;
        let selectedVersion = this.versionSelector.value;
        
        let url = `https://api.cdnjs.com/libraries/${pkg_nme}/${selectedVersion}`;
        try {
            loader.create('Loading','Fetching files...');
            const response = await fetch(url);
            let data = await response.json();
            loader.destroy();
            this.filesList.innerHTML = '';
            this.$sriObj = {};
            this.$sriObj = data.sri;
            let filteredFiles = this.filterFiles(data.files);
            for(let i =0;i<filteredFiles.length;i++){
                const list = tag('li');
                const filesCheckBox = tag('input',{
                    type: "checkbox",
                    className: "filesCheckBox",
                    value: filteredFiles[i],
                });
                const filesLabel = tag('p',{
                    textContent: filteredFiles[i],
                    className: "filesLabel"
                });
                list.append(...[filesCheckBox,filesLabel]);
                this.filesList.append(list);
            }
        } catch (e) {
            this.closePlugin();
        }
    }
    
    filterFiles(filesArr){
        return filesArr.filter(item => {
            return item.endsWith(".js") || item.endsWith(".css");
        });
    }
    
    filterVersions(versionsArr){
        return versionsArr.filter(version => {
            return !version.includes('alpha') && !version.includes('beta') && !version.includes('rc') && !version.includes('csp') && !version.includes('migration');
        });
    }
    
    backToPage1(){
        this.$plugPage2.classList.toggle('hide');
        this.$plugPage1.classList.toggle('hide');
    }
    
    closePlugin(){
        this.$page.hide();
        cAlert('Error','Connection error, check your internet and Try Again!');
        loader.destroy();
    }
    
    addThroughApi(filesArray){
        let api = '';
        for (let i=0;i<filesArray.length;i++) {
            let url = `https://cdnjs.cloudflare.com/ajax/libs/${this.libName.textContent}/${this.versionSelector.value}/${filesArray[i]}`;
            let filename = filesArray[i].split('.');
            let fileType = filename.slice(-1)[0];
            switch (fileType) {
                case 'js':
                    api += `<script src="${url}" integrity="${this.$sriObj[filesArray[i]]}" crossorigin="anonymous" referrerpolicy="no-referrer"></script>\n`;
                    break;
                case 'css':
                    api += `<link rel="stylesheet" href="${url}" integrity="${this.$sriObj[filesArray[i]]}" crossorigin="anonymous" referrerpolicy="no-referrer" />\n`;
                    break;
            }
        }
        this.$page.hide();
        editorManager.editor.insert(api);
    }
    
    async addLibrary(){
        const addLibTypeSelector = await select('Select Type', ["Api","Download Files"], {default: "Api",});
        let filesCheckbox = document.querySelectorAll(".filesCheckBox");
        let filesArray = [];
        for (var i = 0; i < filesCheckbox.length; i++) {
            if (filesCheckbox[i].checked) {
                filesArray.push(filesCheckbox[i].value);
            }
        }
        switch (addLibTypeSelector) {
            case 'Api':
                this.addThroughApi(filesArray);
                break;
            case 'Download Files':
                window.toast('It will come in future updates',4000);
                break;
        }
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