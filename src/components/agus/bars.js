class BarData {
    constructor(name, width, color, introduration){
        this.name = name;
        this.width = width;
        this.color = color;
        this.introduration = introduration
    }
}

class Bar {
	constructor(data) {
        this.subbars = [];
	    this.div = document.createElement('div');
		this.div.classList.add('bar');
		this.div.style.setProperty('--iniwidth', data.width);
		this.div.style.setProperty('--introduration', data.introduration);
		this.div.style.setProperty('background-color', data.color);
        this.div.setAttribute('data-bar-name', data.name);
		this.label = document.createElement('div');
		this.label.classList.add('label');
		this.div.appendChild(this.label);
        Bar.instances.push(this);
	}

	destroy(){
		let i = 0;
	    while (Bar.instances[i] !== this) { i++; }
	    Bar.instances.splice(i, 1);
	}

	enters =()=> {
		this.div.classList.add('intro')
		var bar = this;
		setTimeout(function(){
        	let finalPos = parseInt(bar.div.offsetTop)-parseInt(30);
        	bar.div.style.setProperty("--yposition", "-"+finalPos+"px");
        	bar.label.addEventListener("click", bar.focus);
    	},  1000);
	}

	focus =()=> {
		var focusbar = this;
		Bar.instances.map(function(bar){
			if(bar==focusbar){
				bar.label.removeEventListener("click", bar.focus);
				bar.label.addEventListener("click", bar.unfocus);
				setTimeout(function(){
					bar._focus();
				}, 600);
			}
			else{
				bar._hide();
				bar.label.removeEventListener("click", bar.focus);
			}
		});
	    
	}
	unfocus =()=> {
		var focusbar = this;
		Bar.instances.map(function(bar){
			if(bar==focusbar){
				bar.label.removeEventListener("click", bar.unfocus);
				bar._unfocus();
				setTimeout(function(){bar.label.addEventListener("click", bar.focus);}, 1000);
			}
			else{
				setTimeout(function(){
					bar._reshow();
					bar.label.addEventListener("click", bar.focus);
				}, 1000);
			}
		});
	}

	_focus =()=> {
		this.div.classList.remove("intro");
	    this.div.classList.remove("unfocus");
	    this.div.classList.remove("inagain");
	    this.div.classList.add("focus");
	    var subbars = this.subbars;
	    subbars.map(function(sb){
			sb._show();
		    setTimeout(function(){
				sb.div.addEventListener("click", sb.extend);
	    	}, 1000);
	    });
	}

	_unfocus =()=> {
        this.div.classList.remove("focus");
	    this.div.classList.add("unfocus");
	    this.subbars.map(function(sb){
			sb._hide();
			sb.div.removeEventListener("click", sb.extend);
		});
	}

	_hide =()=> {
	    this.div.classList.remove("intro");
	    this.div.classList.remove("unfocus");
	    this.div.classList.remove("inagain");
	    this.div.classList.add("out");
	}

	_reshow =()=> {
        this.div.classList.remove("out");
        this.div.classList.add("inagain");
	}

};

Bar.instances = [];
